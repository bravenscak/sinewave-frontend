import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { fetchWithAuth, getCurrentUser, logout } from "../../Utils/AuthUtils";
import CreatePlaylist from "./CreatePlaylist";
import AddToPlaylist from "./AddToPlaylist";
import "bootstrap/dist/css/bootstrap.min.css";
import avatar from "../img/default-avatar.webp";

const Dashboard = () => {
    const [playlists, setPlaylists] = useState([]);
    const [songs, setSongs] = useState([]);
    const [allSongs, setAllSongs] = useState([]); 
    const [selectedPlaylist, setSelectedPlaylist] = useState(null); 
    const [users, setUsers] = useState([]);
    const [userData, setUserData] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [userSearchQuery, setUserSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
    const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const [followStatus, setFollowStatus] = useState({});

    const fetchSongs = async () => {
        try {
            const songsResponse = await fetchWithAuth(
                "http://localhost:8080/api/songs"
            );
            if (songsResponse.ok) {
                const songsData = await songsResponse.json();
                setAllSongs(songsData);
                setSongs(songsData);
            } else {
                console.warn("Could not fetch songs, using placeholder data");
                const mockSongs = [
                    {
                        id: 1,
                        title: "Blinding Lights",
                        artistName: "The Weeknd",
                        genreName: "Pop",
                        duration: 200,
                    },
                    {
                        id: 2,
                        title: "Levitating",
                        artistName: "Dua Lipa",
                        genreName: "Pop",
                        duration: 180,
                    },
                    {
                        id: 3,
                        title: "Bohemian Rhapsody",
                        artistName: "Queen",
                        genreName: "Rock",
                        duration: 354,
                    },
                ];
                setAllSongs(mockSongs);
                setSongs(mockSongs);
            }
        } catch (error) {
            console.error("Error fetching songs:", error);
            setAllSongs([]);
            setSongs([]);
        }
    };

    const fetchPlaylistSongs = async (playlistId) => {
        try {
            const response = await fetchWithAuth(
                `http://localhost:8080/api/playlists/${playlistId}/songs`
            );
            if (response.ok) {
                const playlistSongs = await response.json();
                setSongs(playlistSongs);
            } else {
                console.warn("Could not fetch playlist songs");
                setSongs([]);
            }
        } catch (error) {
            console.error("Error fetching playlist songs:", error);
            setSongs([]);
        }
    };

    const handlePlaylistClick = async (playlist) => {
        if (selectedPlaylist && selectedPlaylist.id === playlist.id) {
            setSelectedPlaylist(null);
            setSongs(allSongs);
            setSearchQuery("");
        } else {
            setSelectedPlaylist(playlist);
            setSearchQuery("");
            await fetchPlaylistSongs(playlist.id);
        }
    };

    const sortUsers = (users, followStatus) => {
        return [...users].sort((a, b) => {
            if (followStatus[a.id] && !followStatus[b.id]) return -1;
            if (!followStatus[a.id] && followStatus[b.id]) return 1;
            return a.username.localeCompare(b.username);
        });
    };

    const fetchUsers = async () => {
        try {
            const [usersResponse, currentUserFollowing] = await Promise.all([
                fetchWithAuth("http://localhost:8080/api/users"),
                fetchWithAuth(
                    "http://localhost:8080/api/users/friends/following"
                ),
            ]);

            if (usersResponse.ok && currentUserFollowing.ok) {
                const [usersData, followingData] = await Promise.all([
                    usersResponse.json(),
                    currentUserFollowing.json(),
                ]);

                const followStatuses = {};
                followingData.forEach((user) => {
                    followStatuses[user.id] = true;
                });

                const currentUser = getCurrentUser();
                const filteredUsers = usersData.filter(
                    (user) => !currentUser || user.id !== currentUser.id
                );

                const sortedUsers = sortUsers(filteredUsers, followStatuses);

                setUsers(sortedUsers);
                setFollowStatus(followStatuses);
            } else {
                console.warn("Could not fetch users:", usersResponse.status);
                setUsers([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        }
    };

    const toggleFollow = async (userId) => {
        try {
            const isFollowing = followStatus[userId];
            const endpoint = isFollowing
                ? `http://localhost:8080/api/users/friends/unfollow/${userId}`
                : `http://localhost:8080/api/users/friends/follow/${userId}`;

            const method = isFollowing ? "DELETE" : "POST";

            const response = await fetchWithAuth(endpoint, {
                method,
            });

            if (response.ok) {
                const newFollowStatus = {
                    ...followStatus,
                    [userId]: !isFollowing,
                };
                setFollowStatus(newFollowStatus);

                const sortedUsers = sortUsers(users, newFollowStatus);
                setUsers(sortedUsers);
            } else {
                const errorData = await response.json();
                console.error("Failed to update follow status:", errorData);
            }
        } catch (error) {
            console.error("Error toggling follow status:", error);
        }
    };

    const handleUserSearch = async () => {
        if (!userSearchQuery.trim()) {
            fetchUsers();
            return;
        }

        try {
            const response = await fetchWithAuth(
                `http://localhost:8080/api/users/search?username=${encodeURIComponent(
                    userSearchQuery
                )}`
            );
            if (response.ok) {
                const searchResults = await response.json();
                const currentUser = getCurrentUser();
                const filteredResults = searchResults.filter(
                    (user) => !currentUser || user.id !== currentUser.id
                );

                const sortedResults = sortUsers(filteredResults, followStatus);
                setUsers(sortedResults);
            } else {
                console.warn("User search failed:", response.status);
                setUsers([]);
            }
        } catch (error) {
            console.error("Error during user search:", error);
            setUsers([]);
        }
    };

    const handleAddToPlaylist = (song) => {
        setSelectedSong(song);
        setShowAddToPlaylist(true);
    };

    const handleAddToPlaylistSuccess = () => {
        console.log("Song successfully added to playlist!");
        if (selectedPlaylist) {
            fetchPlaylistSongs(selectedPlaylist.id);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            if (selectedPlaylist) {
                await fetchPlaylistSongs(selectedPlaylist.id);
            } else {
                setSongs(allSongs);
            }
            return;
        }

        try {
            let searchResults;
            if (selectedPlaylist) {
                const playlistSongs = await fetchWithAuth(
                    `http://localhost:8080/api/playlists/${selectedPlaylist.id}/songs`
                );
                if (playlistSongs.ok) {
                    const allPlaylistSongs = await playlistSongs.json();
                    searchResults = allPlaylistSongs.filter(song =>
                        song.title.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                } else {
                    searchResults = [];
                }
            } else {
                const response = await fetchWithAuth(
                    `http://localhost:8080/api/songs/search?title=${encodeURIComponent(
                        searchQuery
                    )}`
                );
                if (response.ok) {
                    searchResults = await response.json();
                } else {
                    searchResults = [];
                }
            }
            setSongs(searchResults);
        } catch (error) {
            console.error("Error during search:", error);
            setSongs([]);
        }
    };

    useEffect(() => {
        const user = getCurrentUser();
        if (user) {
            setUserData(user);
        }

        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const playlistResponse = await fetchWithAuth(
                "http://localhost:8080/api/playlists/user"
            );
            if (playlistResponse.ok) {
                const playlistData = await playlistResponse.json();
                setPlaylists(playlistData);
            } else {
                console.warn(
                    "Could not fetch playlists:",
                    playlistResponse.status
                );
                setPlaylists([]);
            }

            await fetchUsers();

            await fetchSongs();
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
            setError("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePlaylist = () => {
        setShowCreatePlaylist(true);
    };

    const handlePlaylistCreated = (newPlaylist) => {
        setPlaylists([...playlists, newPlaylist]);
        setShowCreatePlaylist(false);
    };

    const handleUserClick = (user) => {
        window.location.href = `/user/${user.id}`;
    };

    const handleLogout = () => {
        logout();
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div
                className="d-flex justify-content-center align-items-center"
                style={{ height: "100vh" }}
            >
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-md-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5>My Playlists ({playlists.length})</h5>
                        <button
                            onClick={handleLogout}
                            className="btn btn-outline-danger btn-sm"
                        >
                            Logout
                        </button>
                    </div>

                    <button
                        onClick={handleCreatePlaylist}
                        className="btn btn-primary btn-sm mb-2 w-100"
                    >
                        Create New Playlist
                    </button>
                    <div className="list-group">
                        {playlists.map((playlist) => (
                            <div
                                key={playlist.id}
                                className={`list-group-item d-flex justify-content-between align-items-center ${
                                    selectedPlaylist?.id === playlist.id ? 'active' : ''
                                }`}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handlePlaylistClick(playlist)}
                            >
                                <div>
                                    <strong>{playlist.name}</strong>
                                    <small className="d-block text-muted">
                                        {playlist.songCount || 0} songs
                                    </small>
                                    <small className="d-block text-muted">
                                        {playlist.createdAt &&
                                            formatDate(playlist.createdAt)}
                                    </small>
                                </div>
                                <span className="badge bg-secondary rounded-pill">
                                    {playlist.isPublic ? "Public" : "Private"}
                                </span>
                            </div>
                        ))}
                        {playlists.length === 0 && (
                            <div className="alert alert-info">
                                No playlists yet. Create your first playlist!
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-md-6">
                    <h5>
                        {selectedPlaylist 
                            ? `Songs in "${selectedPlaylist.name}"` 
                            : "All Songs"
                        }
                    </h5>
                    <div className="mb-3">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control"
                                placeholder={
                                    selectedPlaylist 
                                        ? `Search in "${selectedPlaylist.name}"...`
                                        : "Search songs by title..."
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handleSearch();
                                    }
                                }}
                            />
                            <button
                                className="btn btn-success"
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                            {searchQuery && (
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => {
                                        setSearchQuery("");
                                        if (selectedPlaylist) {
                                            fetchPlaylistSongs(selectedPlaylist.id);
                                        } else {
                                            setSongs(allSongs);
                                        }
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Song</th>
                                    <th>Artist</th>
                                    <th>Genre</th>
                                    <th>Duration</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {songs.map((song) => (
                                    <tr key={song.id}>
                                        <td>{song.title}</td>
                                        <td>
                                            {song.artistName ||
                                                "Unknown Artist"}
                                        </td>
                                        <td>
                                            {song.genreName || "Unknown Genre"}
                                        </td>
                                        <td>
                                            {song.duration
                                                ? `${Math.floor(
                                                      song.duration / 60
                                                  )}:${(song.duration % 60)
                                                      .toString()
                                                      .padStart(2, "0")}`
                                                : "N/A"}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-primary btn-sm me-1"
                                                title="Add to playlist"
                                                onClick={() =>
                                                    handleAddToPlaylist(song)
                                                }
                                            >
                                                ➕
                                            </button>
                                            <button
                                                className="btn btn-outline-danger btn-sm"
                                                title="Like"
                                            >
                                                ♥
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {songs.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            <div className="alert alert-info mb-0">
                                                {selectedPlaylist 
                                                    ? `No songs found in "${selectedPlaylist.name}".`
                                                    : "No songs found."
                                                }
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="col-md-3">
                    <div className="text-center mb-3">
                        <img
                            src={userData?.profilepicture || avatar}
                            alt="User Avatar"
                            className="img-thumbnail rounded-circle mb-2"
                            style={{
                                width: "100px",
                                height: "100px",
                                objectFit: "cover",
                            }}
                        />
                        <h5>
                            {userData
                                ? `${userData.firstname} ${userData.lastname}`
                                : "Loading..."}
                        </h5>
                        <p className="text-muted">@{userData?.username}</p>
                        <Link
                            to="/profiledetails"
                            className="btn btn-outline-primary btn-sm mb-3"
                        >
                            My Details
                        </Link>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>Other Users ({users.length})</h6>
                    </div>

                    <div className="mb-3">
                        <div className="input-group">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search users by username..."
                                value={userSearchQuery}
                                onChange={(e) =>
                                    setUserSearchQuery(e.target.value)
                                }
                                onKeyPress={(e) => {
                                    if (e.key === "Enter") {
                                        handleUserSearch();
                                    }
                                }}
                            />
                            <button
                                className="btn btn-outline-success btn-sm"
                                onClick={handleUserSearch}
                            >
                                Search
                            </button>
                            {userSearchQuery && (
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => {
                                        setUserSearchQuery("");
                                        fetchUsers();
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="list-group">
                        {users.map((user) => (
                            <div key={user.id} className="list-group-item">
                                <div className="d-flex align-items-center justify-content-between">
                                    <div
                                        className="d-flex align-items-center flex-grow-1"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleUserClick(user)}
                                    >
                                        <img
                                            src={user.profilepicture || avatar}
                                            alt={user.username}
                                            className="rounded-circle me-2"
                                            style={{
                                                width: "30px",
                                                height: "30px",
                                                objectFit: "cover",
                                            }}
                                        />
                                        <div>
                                            <strong>
                                                {user.firstname} {user.lastname}
                                            </strong>
                                            <small className="d-block text-muted">
                                                @{user.username}
                                            </small>
                                        </div>
                                    </div>

                                    <button
                                        className={`btn btn-sm ${
                                            followStatus[user.id]
                                                ? "btn-outline-secondary"
                                                : "btn-primary"
                                        }`}
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            toggleFollow(user.id);
                                        }}
                                        style={{ minWidth: "80px" }}
                                    >
                                        {followStatus[user.id]
                                            ? "Unfollow"
                                            : "Follow"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showCreatePlaylist && (
                <CreatePlaylist
                    onPlaylistCreated={handlePlaylistCreated}
                    onClose={() => setShowCreatePlaylist(false)}
                />
            )}

            {showAddToPlaylist && selectedSong && (
                <AddToPlaylist
                    songId={selectedSong.id}
                    songName={selectedSong.title}
                    onClose={() => {
                        setShowAddToPlaylist(false);
                        setSelectedSong(null);
                        if (selectedPlaylist) {
                            fetchPlaylistSongs(selectedPlaylist.id);
                        } else {
                            fetchSongs();
                        }
                    }}
                    onSuccess={handleAddToPlaylistSuccess}
                />
            )}

            <footer className="fixed-bottom bg-light border-top py-2 px-4 d-flex justify-content-between align-items-center">
                <div>
                    <strong>Now Playing:</strong> <i>none - none</i>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <button className="btn btn-outline-secondary btn-sm">
                        ⏮️
                    </button>
                    <button className="btn btn-primary btn-sm">▶️</button>
                    <button className="btn btn-outline-secondary btn-sm">
                        ⏭️
                    </button>
                </div>

                <div className="d-flex align-items-center">
                    <label className="me-2 mb-0">🔊</label>
                    <input type="range" min="0" max="100" defaultValue="50" />
                </div>
            </footer>
        </div>
    );
};

export default Dashboard;