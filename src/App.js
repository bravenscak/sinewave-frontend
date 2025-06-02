import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { isAuthenticated, isAdmin } from './utils/AuthUtils';

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
import AdminPanel from './components/pages/AdminPanel';
import NotFoundPage from './components/pages/NotFoundPage';
import PrivateAdminRoute from './components/PrivateAdminRoute';

import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <NotFoundPage />
  },
  {
    path: '/login',
    element: isAuthenticated() ? (isAdmin() ? <AdminPanel /> : <Dashboard />) : <LoginForm />
  },
  {
    path: '/register',
    element: isAuthenticated() ? (isAdmin() ? <AdminPanel /> : <Dashboard />) : <RegistrationForm />
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
    path: '/',
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
  },
  {
    path: '/admin',
    element: (
      <PrivateAdminRoute>
        <AdminPanel />
      </PrivateAdminRoute>
    )
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;