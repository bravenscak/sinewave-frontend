import React, { useState, useEffect } from "react";
import { fetchWithAuth, getCurrentUser, logout } from "../../utils/AuthUtils";

import CreatePlaylist from "./CreatePlaylist";
import "../css/ProfileDetails.css";
import { Link } from "react-router-dom";

const ProfileDetails = () => {
    const [userData, setUserData] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const user = getCurrentUser();

        if (user) {
            setUserData(user);
            fetchUserPlaylists();
            setLoading(false);
        } else {
            fetchUserData();
        }
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetchWithAuth(
                `http://localhost:8080/api/users/me`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch user data");
            }

            const data = await response.json();
            setUserData(data);
            fetchUserPlaylists();
        } catch (error) {
            setError(error.message);
            setLoading(false);
        }
    };

    const fetchUserPlaylists = async () => {
        try {
            console.log("Dohvaćam playliste...");
            const token = localStorage.getItem("token");
            console.log("Token postoji:", !!token);

            const response = await fetchWithAuth(
                `http://localhost:8080/api/playlists/user`
            );
            console.log(
                "Odgovor od API-ja:",
                response.status,
                response.statusText
            );

            if (response.ok) {
                const data = await response.json();
                console.log("Dohvaćene playliste:", data);
                setPlaylists(data);
            } else {
                console.warn(
                    "Nije moguće dohvatiti playliste, status:",
                    response.status
                );
                setPlaylists([]);
            }
        } catch (error) {
            console.error("Greška pri dohvaćanju playlista:", error);
            setPlaylists([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaylistCreated = (newPlaylist) => {
        setPlaylists([...playlists, newPlaylist]);
    };

    const handleAnonymizeAccount = async () => {
        try {
            const response = await fetchWithAuth(
                "http://localhost:8080/api/users/anonymize-me",
                {
                    method: "POST",
                }
            );

            if (response.ok) {
                alert(
                    "Your account has been anonymized successfully. You will be logged out."
                );
                logout();
            } else {
                const errorData = await response.json();
                alert("Failed to anonymize account: " + errorData.message);
            }
        } catch (error) {
            alert("Failed to anonymize account: " + error.message);
        }
        setShowDeleteModal(false);
    };

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return <div className="dashboard-loading">Loading...</div>;
    }

    if (error) {
        return <div className="dashboard-error">Error: {error}</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>My profile details</h1>
                <Link to="/dashboard" className="btn btn-primary">
                    &lt; Return
                </Link>
            </header>

            <div className="dashboard-content">
                <div className="user-profile">
                    <h2>
                        Welcome, {userData.firstname} {userData.lastname}
                    </h2>
                    <div className="user-details">
                        <p>
                            <strong>Username:</strong> {userData.username}
                        </p>
                        <p>
                            <strong>Email:</strong> {userData.email}
                        </p>
                    </div>
                </div>
                <div className="dashboard-section">
                    <div className="section-header">
                        <h3>Your Playlists</h3>
                        <button
                            className="create-playlist-button"
                            onClick={() => setShowCreatePlaylist(true)}
                        >
                            + Create Playlist
                        </button>
                    </div>

                    {playlists.length === 0 ? (
                        <p className="no-playlists-message">
                            You don't have any playlists yet. Create one!
                        </p>
                    ) : (
                        <div className="playlists-grid">
                            {playlists.map((playlist) => (
                                <div
                                    key={playlist.id}
                                    className="playlist-item"
                                >
                                    <h4>{playlist.name}</h4>
                                    <p>{playlist.songCount || 0} songs</p>
                                    <p className="playlist-visibility">
                                        {playlist.isPublic
                                            ? "Public"
                                            : "Private"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showCreatePlaylist && (
                    <CreatePlaylist
                        onPlaylistCreated={handlePlaylistCreated}
                        onClose={() => setShowCreatePlaylist(false)}
                    />
                )}
            </div>
            <footer className="dashboard-footer">
                <p className="footer-text">
                    If you wish to delete your profile, click here:
                </p>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="btn btn-danger"
                >
                    Delete Profile
                </button>
            </footer>

            {showDeleteModal && (
                <div
                    className="modal-overlay"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        className="modal-content"
                        style={{
                            backgroundColor: "white",
                            padding: "20px",
                            borderRadius: "8px",
                            maxWidth: "400px",
                            width: "90%",
                            textAlign: "center",
                        }}
                    >
                        <h3 style={{ color: "#dc3545", marginBottom: "20px" }}>
                            Warning!
                        </h3>
                        <p style={{ marginBottom: "20px", fontSize: "16px" }}>
                            This action is irreversible. Are you sure you want
                            to delete your profile?
                        </p>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "10px",
                            }}
                        >
                            <button
                                className="btn btn-danger"
                                onClick={handleAnonymizeAccount}
                                style={{ width: "120px" }}
                            >
                                Yes, I'm sure
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteModal(false)}
                                style={{ width: "120px" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDetails;
