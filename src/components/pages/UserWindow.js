import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchWithAuth, logout } from '../../Utils/AuthUtils';
import '../css/UserWindow.css';
import "bootstrap/dist/css/bootstrap.min.css";
import avatar from '../img/default-avatar.webp';

const UserWindow = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userSongs, setUserSongs] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      loadAllData();
    }
  }, [userId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserData(),
        fetchUserSongs(),
        checkFollowStatus()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/users/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        throw new Error('Failed to load user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData({ username: 'alex', id: userId }); 
    }
  };

  const fetchUserSongs = async () => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/songs/user/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserSongs(data);
      } else {
        console.warn('Could not fetch user songs, using mock data');
        const mockSongs = [
          { id: 1, title: "Blinding Lights", artistName: "The Weeknd", genreName: "Pop", duration: 200 },
          { id: 2, title: "Levitating", artistName: "Dua Lipa", genreName: "Pop", duration: 180 },
          { id: 3, title: "Bohemian Rhapsody", artistName: "Queen", genreName: "Rock", duration: 354 },
          { id: 4, title: "Shape of You", artistName: "Ed Sheeran", genreName: "Pop", duration: 233 },
          { id: 5, title: "Rolling in the Deep", artistName: "Adele", genreName: "Soul", duration: 228 },
        ];
        setUserSongs(mockSongs);
      }
    } catch (error) {
      console.error('Error fetching user songs:', error);
      const mockSongs = [
        { id: 1, title: "Blinding Lights", artistName: "The Weeknd", genreName: "Pop", duration: 200 },
        { id: 2, title: "Levitating", artistName: "Dua Lipa", genreName: "Pop", duration: 180 },
        { id: 3, title: "Bohemian Rhapsody", artistName: "Queen", genreName: "Rock", duration: 354 },
        { id: 4, title: "Shape of You", artistName: "Ed Sheeran", genreName: "Pop", duration: 233 },
        { id: 5, title: "Rolling in the Deep", artistName: "Adele", genreName: "Soul", duration: 228 },
      ];
      setUserSongs(mockSongs);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/users/friends/is-following/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const toggleFollow = async () => {
    try {
      const endpoint = isFollowing ? 
        `http://localhost:8080/api/users/friends/unfollow/${userId}` : 
        `http://localhost:8080/api/users/friends/follow/${userId}`;
      
      const method = isFollowing ? 'DELETE' : 'POST';
      
      const response = await fetchWithAuth(endpoint, { method });
      
      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        const errorData = await response.json();
        console.error('Failed to update follow status:', errorData);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    }
  };

  const handleAddToPlaylist = (song) => {
    console.log('Add to playlist:', song);
  };

  const handleLikeSong = (song) => {
    console.log('Like song:', song);
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="user-window-container">
      <div className="user-window-header">
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
            Logout
          </button>
        </div>
      </div>

      <div className="user-profile-section">
        <div className="text-center">
          <img
            src={userData?.profilepicture || avatar}
            alt="User Avatar"
            className="user-avatar rounded-circle"
          />
          <h2 className="user-name">{userData?.username || 'Username'}</h2>
          <button
            className={`follow-button btn ${isFollowing ? 'btn-outline-secondary' : 'btn-dark'}`}
            onClick={toggleFollow}
          >
            {isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        </div>
      </div>

      <div className="container mt-4">
        <h3 className="text-center mb-4">User's Songs</h3>
        
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
              {userSongs.length > 0 ? (
                userSongs.map((song) => (
                  <tr key={song.id}>
                    <td>{song.title}</td>
                    <td>{song.artistName || 'Unknown Artist'}</td>
                    <td>{song.genreName || 'Unknown Genre'}</td>
                    <td>{song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : 'N/A'}</td>
                    <td>
                      <button 
                        className="btn btn-primary btn-sm me-1" 
                        title="Add to playlist"
                        onClick={() => handleAddToPlaylist(song)}
                      >
                        ➕
                      </button>
                      <button 
                        className="btn btn-outline-danger btn-sm" 
                        title="Like"
                        onClick={() => handleLikeSong(song)}
                      >
                        ♥
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">
                    <div className="alert alert-info mb-0">
                      This user hasn't uploaded any songs yet.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="fixed-bottom bg-light border-top py-2 px-4 d-flex justify-content-between align-items-center">
        <div>
          <strong>Now Playing:</strong> <i>none - none</i>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button className="btn btn-outline-secondary btn-sm">⏮️</button>
          <button className="btn btn-primary btn-sm">▶️</button>
          <button className="btn btn-outline-secondary btn-sm">⏭️</button>
        </div>

        <div className="d-flex align-items-center">
          <label className="me-2 mb-0">🔊</label>
          <input type="range" min="0" max="100" defaultValue="50" />
        </div>
      </footer>
    </div>
  );
};

export default UserWindow;