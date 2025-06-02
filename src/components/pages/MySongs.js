import React, { useState, useEffect } from 'react';
import { fetchWithAuth, getCurrentUser, logout } from '../../utils/AuthUtils';
import '../css/MySongs.css';

const MySongs = () => {
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
      const response = await fetchWithAuth(`http://localhost:8080/api/user/songs`);
      
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
          <h2>Songs you uploaded</h2>
          <div className="user-details">
          <table>
    <thead>
      <tr>
        <th>Song Name</th>
        <th>Author Name</th>
        <th>Date Uploaded</th>
        <th>Length</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>To France</td>
        <td>Mike Oldfield</td>
        <td>2022-08-15</td>
        <td>2 min 30 sec</td>
      </tr>
      <tr>
      <td>Shadow On The Wall</td>
        <td>Mike Oldfield</td>
        <td>2021-08-15</td>
        <td>2 min</td>
      </tr>
      <tr>
      <td>Obična Ljuibavna Pjesma</td>
        <td>Aerodrom</td>
        <td>2023-02-02</td>
        <td>1 min 30 sec</td>
      </tr>
      <tr>
      <td>Forever Young</td>
        <td>Alphaville</td>
        <td>2022-08-15</td>
        <td>2 min 30 sec</td>
      </tr>
      <tr>
      <td>Sounds Like A Melody</td>
        <td>Alphaville</td>
        <td>2022-08-15</td>
        <td>3 min 30 sec</td>
      </tr>
    </tbody>
  </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySongs;
