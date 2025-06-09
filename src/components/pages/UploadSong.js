import React, { useState, useEffect } from 'react';
import { fetchWithAuth, getCurrentUser } from '../../utils/AuthUtils'; 
import '../css/UploadSong.css'; 
import bgImage from '../img/5af4b12d-098e-4050-9de0-44cc5855d855.png';

const UploadSong = () => {
  const [title, setTitle] = useState('');
  const [albumId, setAlbumId] = useState('');
  const [genreId, setGenreId] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id) {
      setUserId(currentUser.id);
    } else {
      setErrorMessage("User not found. Please log in again.");
    }
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile || !title.trim() || !userId) {
        setErrorMessage("Please fill all required fields and select a file.");
        return;
    }

    setIsLoading(true);
    setMessage('');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    const metadata = {
      title,
      userId: parseInt(userId),
      albumId: albumId ? parseInt(albumId) : null,
      genreId: genreId ? parseInt(genreId) : null
    };
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));


    try {
      const response = await fetchWithAuth('http://localhost:8080/api/songs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create song: ${errorData.message || response.statusText}`);
      }

      const newSong = await response.json();
      setMessage(`Song "${newSong.title}" created successfully!`);

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100vw',
        
      }}
    >
    <div className="upload-song-container">
      <div className="upload-song-form-container">
        <h1>Upload New Song</h1>
        {message && <div className="success-message">{message}</div>}
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit}>
           <div className="form-group">
            <label htmlFor="title">Song Title <span className="required">*</span></label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isLoading}/>
          </div>
          <div className="form-group">
            <label htmlFor="albumId">Album ID (Optional)</label>
            <input type="number" id="albumId" value={albumId} onChange={(e) => setAlbumId(e.target.value)} min="1" disabled={isLoading}/>
          </div>
          <div className="form-group">
            <label htmlFor="genreId">Genre ID (Optional)</label>
            <input type="number" id="genreId" value={genreId} onChange={(e) => setGenreId(e.target.value)} min="1" disabled={isLoading}/>
          </div>
          <div className="form-group">
            <label htmlFor="song-file-input">MP3 File <span className="required">*</span></label>
            <input type="file" id="song-file-input" accept=".mp3" onChange={handleFileChange} required disabled={isLoading}/>
          </div>
          <button type="submit" className="upload-button" disabled={isLoading}>
            {isLoading ? 'Uploading...' : 'Upload Song'}
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default UploadSong;
