import React, { useState, useEffect } from 'react';
import { fetchWithAuth, getCurrentUser, logout } from '../../utils/AuthUtils';
import './UserDetails.css';

const ProfileDetails = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const user = getCurrentUser();
    
    if (user) {
      setUserData(user);
      setLoading(false);
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
          <h2>Welcome, {userData.firstname} {userData.lastname}</h2>
          <div className="user-details">
            <p><strong>Username:</strong> {userData.username}</p>
            <p><strong>Email:</strong> {userData.email}</p>
          </div>
        </div>
        
        <div className="dashboard-section">
          <p>Liked songs count:</p>
          <p>My playlists count:</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
