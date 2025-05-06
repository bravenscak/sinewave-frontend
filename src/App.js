import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { isAuthenticated } from './Utils/AuthUtils';
import PrivateRoute from './components/PrivateRoute';

import LoginForm from './components/pages/Login';
import RegistrationForm from './components/pages/Register';
import LandingPage from './components/pages/LangingPage';
import MyPlaylists from './components/pages/MyPlaylists';
import MySongs from './components/pages/MySongs';
import UploadSong from './components/pages/UploadSong';
import ProfileDetails from './components/pages/ProfileDetails';

import './App.css';
import NotFoundPage from './components/pages/NotFoundPage';

function App(){
  const router = createBrowserRouter([
    {
    path: '/',
    element: <LandingPage/>,
    errorElement: <NotFoundPage/>
  },
  {
    path: '/login',
    element: <LoginForm/>
  },
  {
    path: '/register',
    element: <RegistrationForm/>
  },
  {
    path: '/profiledetails',
    element: <ProfileDetails/>
  },
  {
    path: '/mysongs',
    element: <MySongs/>
  },
  {
    path: '/myplaylists',
    element: <MyPlaylists/>
  }
  ]);

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router}/>
    </React.StrictMode>
  )
}

export default App;