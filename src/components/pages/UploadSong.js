import React, { useState, useEffect } from 'react';
import { fetchWithAuth, getCurrentUser } from '../../utils/AuthUtils';
import '../css/UploadSong.css';
import bgImage from '../img/5af4b12d-098e-4050-9de0-44cc5855d855.png';
import { Link } from 'react-router-dom'; // Import Link

const UploadSong = () => {
  const [title, setTitle] = useState('');
  const [albumId, setAlbumId] = useState(''); // Will hold the selected album ID
  const [genreId, setGenreId] = useState(''); // Will hold the selected genre ID
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const [albums, setAlbums] = useState([]); // State for albums dropdown
  const [genres, setGenres] = useState([]); // State for genres dropdown
  const [isFetchingDropdowns, setIsFetchingDropdowns] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.id) {
      setUserId(currentUser.id);
    } else {
      setErrorMessage("User not found. Please log in again.");
    }

    // Fetch albums and genres
    const fetchDropdownData = async () => {
      setIsFetchingDropdowns(true);
      try {
        const [albumsResponse, genresResponse] = await Promise.all([
          fetchWithAuth('/api/albums'), // Assuming this endpoint exists
          fetchWithAuth('/api/genres')  // Assuming this endpoint exists
        ]);

        if (albumsResponse.ok) {
          const albumsData = await albumsResponse.json();
          setAlbums(albumsData);
        } else {
          console.error('Failed to fetch albums');
          setAlbums([]); // Set to empty if fetch fails
        }

        if (genresResponse.ok) {
          const genresData = await genresResponse.json();
          setGenres(genresData);
        } else {
          console.error('Failed to fetch genres');
          setGenres([]); // Set to empty if fetch fails
        }
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
        setErrorMessage('Could not load album/genre data. Please try again.');
        setAlbums([]);
        setGenres([]);
      } finally {
        setIsFetchingDropdowns(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile || !title.trim() || !userId) {
      setErrorMessage("Please fill all required fields (Title, MP3 File) and ensure you are logged in.");
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
      albumId: albumId ? parseInt(albumId) : null, // Send null if no album selected
      genreId: genreId ? parseInt(genreId) : null  // Send null if no genre selected
    };
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

    try {
      const response = await fetchWithAuth('/api/songs', {
        method: 'POST',
        body: formData,
        // Content-Type is set automatically by browser for FormData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred during upload.' }));
        throw new Error(`Failed to create song: ${errorData.message || response.statusText}`);
      }

      const newSong = await response.json();
      setMessage(`Song "${newSong.title}" created successfully!`);
      // Clear form fields after successful upload
      setTitle('');
      setAlbumId('');
      setGenreId('');
      setSelectedFile(null);
      if (document.getElementById('song-file-input')) {
        document.getElementById('song-file-input').value = null;
      }

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
        minHeight: '100vh', 
        width: '100vw',
        padding: '20px 0' 
      }}
    >
      <div className="upload-song-container" style={{ minHeight: 'auto' }}>
        <div className="upload-song-form-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Upload New Song</h1>
            <Link to="/dashboard" className="btn btn-outline-secondary">Back to Dashboard</Link>
          </div>

          {message && <div className="success-message">{message}</div>}
          {errorMessage && <div className="error-message">{errorMessage}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Song Title <span className="required">*</span></label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={isLoading} />
            </div>

            <div className="form-group">
              <label htmlFor="albumId">Album</label>
              <select
                id="albumId"
                value={albumId}
                onChange={(e) => setAlbumId(e.target.value)}
                disabled={isLoading || isFetchingDropdowns}
                className="form-control" 
              >
                <option value="">Select Album</option>
                {albums.length === 0 && !isFetchingDropdowns && <option disabled>No albums available</option>}
                {albums.map(album => (
                  <option key={album.id} value={album.id}>{album.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="genreId">Genre</label>
              <select
                id="genreId"
                value={genreId}
                onChange={(e) => setGenreId(e.target.value)}
                disabled={isLoading || isFetchingDropdowns}
                className="form-control"
              >
                <option value="">Select Genre</option>
                {genres.length === 0 && !isFetchingDropdowns && <option disabled>No genres available</option>}
                {genres.map(genre => (
                  <option key={genre.id} value={genre.id}>{genre.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="song-file-input">MP3 File <span className="required">*</span></label>
              <input type="file" id="song-file-input" accept=".mp3" onChange={handleFileChange} required disabled={isLoading} className="form-control"/>
            </div>

            <button type="submit" className="upload-button" disabled={isLoading || isFetchingDropdowns}>
              {isLoading ? 'Uploading...' : (isFetchingDropdowns ? 'Loading options...' : 'Upload Song')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadSong;