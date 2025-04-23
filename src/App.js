import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/Login/Login';
import RegistrationForm from './components/Register/Register';
import PrivateRoute from './components/PrivateRoute';
import { isAuthenticated } from './utils/AuthUtils';
import './App.css';
import LandingPage from './components/LandingPage/LangingPage';
import MyPlaylists from './components/MyPlaylists/MyPlaylists';
import MySongs from './components/MySongs/MySongs';
import UploadSong from './components/UploadSong/UploadSong';
import ProfileDetails from './components/ProfileDetails/ProfileDetails';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/myplaylists" element={<MyPlaylists />} />
        <Route path="/mysongs" element={<MySongs />} />
        <Route path="/uploadsong" element={<UploadSong />} />
        <Route path="/profiledetails" element={<ProfileDetails />} />
      </Routes>
    </Router>
  );
}

export default App;