import React, { useState } from 'react';
import '../css/Login.css';
import bgImage from '../img/5af4b12d-098e-4050-9de0-44cc5855d855.png';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
    
    if (loginError) {
      setLoginError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
        setIsLoading(true);
        setLoginError('');
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                credentials: 'include', 
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            setLoginSuccess(true);
            
            setTimeout(() => {
                if (data.user && data.user.role === 'ADMIN') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/dashboard';
                }
            }, 2000);
            
        } catch (error) {
            setLoginError(error.message);
        } finally {
            setIsLoading(false);
        }
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
    <div className="login-container">
      <div className="login-form-container">
        
        {loginError && <div className="login-error-message">{loginError}</div>}
        {loginSuccess && <div className="login-success-message">Login successful!</div>}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className={errors.username ? 'input-error' : ''}
              disabled={isLoading || loginSuccess}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={errors.password ? 'input-error' : ''}
              disabled={isLoading || loginSuccess}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <button 
              type="submit" 
              className="login-button"
              disabled={isLoading || loginSuccess}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          <div className="form-group">
            <p className="register-link">
              Don't have an account? <a href="/register">Register here</a>
            </p>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default LoginForm;