import React, { useState, useEffect } from 'react';
import { fetchWithAuth, getCurrentUser, logout } from '../../utils/AuthUtils';
import CreatePlaylist from '../CreatePlaylist/CreatePlaylist';
import './UserDetails.css';

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  
  useEffect(() => {
    const user = getCurrentUser();
    
    if (user) {
      setUserData(user);
      fetchUserPlaylists();
    } else {
      fetchUserData();
    }
  }, []);
  
  const fetchUserData = async () => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/users/me`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
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
      console.log('Dohvaćam playliste...');
      const token = localStorage.getItem('token');
      console.log('Token postoji:', !!token);
      
      const response = await fetchWithAuth(`http://localhost:8080/api/playlists/user`);
      console.log('Odgovor od API-ja:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Dohvaćene playliste:', data);
        setPlaylists(data);
      } else {
        console.warn('Nije moguće dohvatiti playliste, status:', response.status);
        setPlaylists([]);
      }
    } catch (error) {
      console.error('Greška pri dohvaćanju playlista:', error);
      setPlaylists([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePlaylistCreated = (newPlaylist) => {
    setPlaylists([...playlists, newPlaylist]);
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
        <h1>SINEWAVE</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>
      
      <div className="dashboard-content">
        <div className="user-profile">
          <h2>Welcome, {userData.firstname} {userData.lastname}!</h2>
          <div className="user-details">
            <p><strong>Username:</strong> {userData.username}</p>
            <p><strong>Email:</strong> {userData.email}</p>
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
            <p className="no-playlists-message">You don't have any playlists yet. Create one!</p>
          ) : (
            <div className="playlists-grid">
              {playlists.map(playlist => (
                <div key={playlist.id} className="playlist-item">
                  <h4>{playlist.name}</h4>
                  <p>{playlist.songCount || 0} songs</p>
                  <p className="playlist-visibility">
                    {playlist.isPublic ? 'Public' : 'Private'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showCreatePlaylist && (
        <CreatePlaylist 
          onPlaylistCreated={handlePlaylistCreated}
          onClose={() => setShowCreatePlaylist(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;