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
        <Route path="/login" element={
          isAuthenticated() ? <Navigate to="/profiledetails" /> : <LoginForm />
        } />
        <Route path="/register" element={
          isAuthenticated() ? <Navigate to="/profiledetails" /> : <RegistrationForm />
        } />
        
        <Route path="/dashboard" element={
          <Navigate to="/profiledetails" />
        } />
        <Route path="/profiledetails" element={
          <PrivateRoute>
            <ProfileDetails />
          </PrivateRoute>
        } />
        <Route path="/myplaylists" element={
          <PrivateRoute>
            <MyPlaylists />
          </PrivateRoute>
        } />
        <Route path="/mysongs" element={
          <PrivateRoute>
            <MySongs />
          </PrivateRoute>
        } />
        <Route path="/uploadsong" element={
          <PrivateRoute>
            <UploadSong />
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;