import React, { useState, useEffect } from 'react';
import { fetchWithAuth, getCurrentUser, logout } from '../../utils/AuthUtils';
import '../css/MyPlaylists.css';

const MyPlaylists = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const user = getCurrentUser();
    
    if (user) {
      setUserData(user);
      setLoading(false);
    } else {
      //fetchUserData();
    }
  }, []);
  
  const fetchUserData = async () => {
    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/user/playlists`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
          <h2>Your playlists</h2>
          <div className="user-details">
          <table>
    <thead>
      <tr>
        <th>Playlist Name</th>
        <th>Date Created</th>
        <th>Length</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Chill</td>
        <td>2023-09-15</td>
        <td>1 hr 20 min</td>
      </tr>
      <tr>
        <td>Workout</td>
        <td>2025-01-05</td>
        <td>55 min</td>
      </tr>
      <tr>
        <td>Throwback SOngs</td>
        <td>2023-07-22</td>
        <td>2 hr 10 min</td>
      </tr>
      <tr>
        <td>Focus</td>
        <td>2025-02-14</td>
        <td>1 hr 5 min</td>
      </tr>
      <tr>
        <td>Night Drive</td>
        <td>2024-11-30</td>
        <td>45 min</td>
      </tr>
    </tbody>
  </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPlaylists;
