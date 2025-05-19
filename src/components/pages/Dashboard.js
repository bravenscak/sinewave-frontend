import React, { useState } from "react";
import { Link } from 'react-router-dom';
import "bootstrap/dist/css/bootstrap.min.css";
import avatar from '../img/default-avatar.webp';

const Dashboard = () => {
  const [playlists, setPlaylists] = useState([
    "Test",
    "Test2"
  ]);
  const [songs, setSongs] = useState([
    { name: "Blinding Lights", artist: "The Weeknd", genre: "Pop" },
    { name: "Levitating", artist: "Dua Lipa", genre: "Pop" },
    { name: "Bohemian Rhapsody", artist: "Queen", genre: "Rock" },
  ]);
  const [users, setUsers] = useState(["ihorvat2", "Admin", "Admintemp"]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCreatePlaylist = () => {
    const newPlaylist = prompt("Enter new playlist name:");
    if (newPlaylist) {
      setPlaylists([...playlists, newPlaylist]);
    }
  };

  const handleSearch = () => {
    alert(`Searching for: ${searchQuery}`);
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-md-3">
          <h5>My Playlists</h5>
          <Link to="/createplaylist" className="btn btn-primary btn-sm mb-2">
  Create New
</Link>
          <ul className="list-group">
            {playlists.map((playlist, index) => (
              <li key={index} className="list-group-item">
                {playlist}
              </li>
            ))}
          </ul>
        </div>

        <div className="col-md-6">
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Find song"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="btn btn-success mt-2" onClick={handleSearch}>
              Search
            </button>
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Song</th>
                <th>Artist</th>
                <th>Genre</th>
                <th>Add to playlist</th>
                <th>Like</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song, index) => (
                <tr key={index}>
                  <td>{song.name}</td>
                  <td>{song.artist}</td>
                  <td>{song.genre}</td>
                  <td><button className="btn btn-primary btn-sm">➕</button></td>
                  <td><button className="btn btn-primary btn-sm">♥</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="col-md-3">
          
          <img
            src={avatar}
            alt="User Avatar"
            className="img-thumbnail rounded-circle mb-2"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
          <h5>ihorvat2</h5>
          <Link
            to="/profiledetails"
            className="btn btn-outline-primary btn-sm mb-3"
          >
            My Details
          </Link>
          <ul className="list-group">
            {users.map((user, index) => (
              <li key={index} className="list-group-item">
                {user}
              </li>
            ))}
          </ul>
        
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

export default Dashboard;
