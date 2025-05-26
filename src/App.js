import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { isAuthenticated } from './Utils/AuthUtils';

import LoginForm from './components/pages/Login';
import RegistrationForm from './components/pages/Register';
import LandingPage from './components/pages/LangingPage';
import MyPlaylists from './components/pages/MyPlaylists';
import MySongs from './components/pages/MySongs';
import UploadSong from './components/pages/UploadSong';
import ProfileDetails from './components/pages/ProfileDetails';
import Dashboard from './components/pages/Dashboard';
import CreatePlaylist from './components/pages/CreatePlaylist';
import UserWindow from './components/pages/UserWindow';
import NotFoundPage from './components/pages/NotFoundPage';

import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <NotFoundPage />
  },
  {
    path: '/login',
    element: isAuthenticated() ? <Dashboard /> : <LoginForm />
  },
  {
    path: '/register',
    element: isAuthenticated() ? <Dashboard /> : <RegistrationForm />
  },
  {
    path: '/profiledetails',
    element: <ProfileDetails />
  },
  {
    path: '/mysongs',
    element: <MySongs />
  },
  {
    path: '/myplaylists',
    element: <MyPlaylists />
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  },
  {
    path: '/uploadsong',
    element: <UploadSong />
  },
  {
    path: '/createplaylist',
    element: <CreatePlaylist />
  },
  {
    path: '/user/:userId',
    element: <UserWindow />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;