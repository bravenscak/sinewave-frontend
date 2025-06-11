import React, { useState, useEffect } from 'react';
import { fetchWithAuth, logout } from '../../utils/AuthUtils';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminPanel = () => {
  const [activeView, setActiveView] = useState('songs');
  const [songs, setSongs] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeView === 'songs') {
      fetchSongs();
    } else {
      fetchUsers();
    }
  }, [activeView]);

  const fetchSongs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth('/api/admin/songs');
      if (response.ok) {
        const data = await response.json();
        setSongs(data);
      } else {
        throw new Error('Failed to fetch songs');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSong = async (songId) => {
    if (!window.confirm('Are you sure you want to delete this song?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`/api/admin/songs/${songId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setSongs(songs.filter(song => song.id !== songId));
      } else {
        throw new Error('Failed to delete song');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetchWithAuth(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (song.artistName && song.artistName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center py-4">
            <h1 className="display-4 text-dark mb-0">SINEWAVE - ADMIN</h1>
            <button onClick={handleLogout} className="btn btn-outline-danger">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12 text-center">
          <div className="btn-group" role="group">
            <button
              type="button"
              className={`btn btn-lg px-5 ${activeView === 'songs' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setActiveView('songs')}
            >
              Songs
            </button>
            <button
              type="button"
              className={`btn btn-lg px-5 ${activeView === 'users' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setActiveView('users')}
            >
              Users
            </button>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="input-group" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder={`Search ${activeView}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="btn btn-outline-secondary" onClick={clearSearch}>
                ✕
              </button>
            )}
            <button className="btn btn-primary">
              🔍
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="alert alert-danger text-center" role="alert">
              {error}
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm" style={{ backgroundColor: '#e9ecef' }}>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <tbody>
                      {activeView === 'songs' ? (
                        filteredSongs.length > 0 ? (
                          filteredSongs.map((song) => (
                            <tr key={song.id}>
                              <td className="py-3">
                                <div>
                                  <strong>{song.title}</strong>
                                  <br />
                                  <small className="text-muted">
                                    {song.artistName || 'Unknown Artist'} • {song.genreName || 'Unknown Genre'}
                                    {song.duration && (
                                      <> • {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</>
                                    )}
                                  </small>
                                </div>
                              </td>
                              <td className="text-end py-3">
                                <button
                                  className="btn btn-outline-secondary btn-sm me-2"
                                  onClick={() => console.log('Edit song', song.id)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => deleteSong(song.id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-center py-5">
                              <div className="text-muted">No songs found</div>
                            </td>
                          </tr>
                        )
                      ) : (
                        filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <tr key={user.id}>
                              <td className="py-3">
                                <div>
                                  <strong>{user.firstname} {user.lastname}</strong>
                                  <br />
                                  <small className="text-muted">
                                    @{user.username} • {user.email}
                                    {user.role && (
                                      <span className={`badge ms-2 ${user.role === 'ADMIN' ? 'bg-danger' : 'bg-secondary'}`}>
                                        {user.role}
                                      </span>
                                    )}
                                  </small>
                                </div>
                              </td>
                              <td className="text-end py-3">
                                <button
                                  className="btn btn-outline-secondary btn-sm me-2"
                                  onClick={() => console.log('Edit user', user.id)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => deleteUser(user.id)}
                                  disabled={user.role === 'ADMIN'}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-center py-5">
                              <div className="text-muted">No users found</div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;