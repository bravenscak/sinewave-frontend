import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../../utils/AuthUtils';
import '../css/AddToPlaylist.css';
import CreatePlaylist from './CreatePlaylist';

const AddToPlaylist = ({ songId, songName, onClose, onSuccess }) => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addingSuccess, setAddingSuccess] = useState(false);

  useEffect(() => {
    fetchUserPlaylists();
  }, []);

  const fetchUserPlaylists = async () => {
    try {
      setLoading(true);
      const response = await fetchWithAuth('http://localhost:8080/api/playlists/user');
      
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
        if (data.length > 0) {
          setSelectedPlaylistId(data[0].id);
        }
      } else {
        throw new Error('Failed to fetch playlists');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistCreated = (newPlaylist) => {
    setPlaylists([...playlists, newPlaylist]);
    setSelectedPlaylistId(newPlaylist.id);
    setShowCreatePlaylist(false);
  };

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylistId) {
      setError('Please select a playlist');
      return;
    }

    try {
      setIsAdding(true);
      setError(null);
      
      const response = await fetchWithAuth('http://localhost:8080/api/playlists/songs', {
        method: 'POST',
        body: JSON.stringify({
          playlistId: selectedPlaylistId,
          songId: songId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add song to playlist');
      }

      setAddingSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="add-to-playlist-container">
        <div className="add-to-playlist-form">
          <h2>Add to playlist</h2>
          <p>Loading playlists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-to-playlist-container">
      <div className="add-to-playlist-form">
        <h2>Add to playlist</h2>
        
        {error && <div className="add-to-playlist-error">{error}</div>}
        {addingSuccess && <div className="add-to-playlist-success">Song added to playlist successfully!</div>}
        
        <div className="add-to-playlist-content">
          <div className="form-group">
            <label htmlFor="songName">Song name</label>
            <input
              type="text"
              id="songName"
              value={songName}
              readOnly
              disabled
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="playlist">Playlist</label>
            <div className="playlist-selection-container">
              <select
                id="playlist"
                value={selectedPlaylistId}
                onChange={(e) => setSelectedPlaylistId(e.target.value)}
                disabled={isAdding || addingSuccess || playlists.length === 0}
              >
                {playlists.length === 0 ? (
                  <option value="">No playlists available</option>
                ) : (
                  playlists.map(playlist => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </option>
                  ))
                )}
              </select>
              
              <button 
                className="create-new-button"
                onClick={() => setShowCreatePlaylist(true)}
                disabled={isAdding || addingSuccess}
              >
                Create new
              </button>
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              className="add-button"
              onClick={handleAddToPlaylist}
              disabled={isAdding || addingSuccess || !selectedPlaylistId}
            >
              {isAdding ? 'Adding...' : 'Add'}
            </button>
          </div>
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

export default AddToPlaylist;