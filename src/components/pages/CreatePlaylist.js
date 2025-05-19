import React, { useState } from 'react';
import '../css/CreatePlaylist.css';

const CreatePlaylist = ({ onPlaylistCreated, onClose }) => {
  const [playlistData, setPlaylistData] = useState({
    name: '',
    isPublic: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlaylistData({
      ...playlistData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    if (createError) {
      setCreateError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!playlistData.name.trim()) {
      newErrors.name = 'Playlist name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setCreateError('');
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('You must be logged in to create a playlist');
        }
        
        const response = await fetch('http://localhost:8080/api/playlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(playlistData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create playlist');
        }
        
        setCreateSuccess(true);
        
        if (onPlaylistCreated) {
          onPlaylistCreated(data);
        }
        
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 1500);
        
      } catch (error) {
        setCreateError(error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="create-playlist-container">
      <div className="create-playlist-form-container">
        <h2>Create playlist</h2>
        
        {createError && <div className="create-playlist-error-message">{createError}</div>}
        {createSuccess && <div className="create-playlist-success-message">Playlist created successfully!</div>}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={playlistData.name}
              onChange={handleChange}
              required
              className={errors.name ? 'input-error' : ''}
              disabled={isLoading || createSuccess}
            />
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group checkbox-group">
            <label htmlFor="isPublic">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={playlistData.isPublic}
                onChange={handleChange}
                disabled={isLoading || createSuccess}
              />
              Make this playlist public
            </label>
          </div>
          
          <div className="form-buttons">
            <button 
              type="button" 
              className="cancel-button"
              onClick={onClose}
              disabled={isLoading || createSuccess}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="create-button"
              disabled={isLoading || createSuccess}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylist;