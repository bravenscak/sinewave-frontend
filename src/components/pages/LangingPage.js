import React from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../img/5af4b12d-098e-4050-9de0-44cc5855d855.png';
import 'bootstrap/dist/css/bootstrap.min.css';

const LandingPage = () => {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center text-white text-center"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        width: '100vw',
      }}
    >
      <h1 className="display-1 fw-bold mb-4" style={{ textShadow: '2px 2px 5px rgba(0,0,0,0.7)' }}>
        SineWave
      </h1>
      <div className="d-flex gap-3">
        <Link to="/login" className="btn btn-light btn-lg">
          Login
        </Link>
        <Link to="/register" className="btn btn-light btn-lg">
          Register
        </Link>
      </div>
      <div className="d-flex flex-column align-items-center" style={{ 
      position: 'fixed', 
      bottom: '20px', 
      width: '100%',
      textAlign: 'center'
    }}>
      <p style={{ 
        color: 'white', 
        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        marginBottom: '10px'
      }}>
        You can download our mobile app here:
      </p>
      <button 
        className="btn btn-light" 
        style={{
          padding: '8px 20px',
          borderRadius: '20px',
          boxShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        Click here
      </button>
    </div>
    </div>
    
  );
};

export default LandingPage;
