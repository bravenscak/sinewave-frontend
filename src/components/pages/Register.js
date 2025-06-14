import React, { useState } from 'react';
import '../css/Register.css';
import bgImage from '../img/5af4b12d-098e-4050-9de0-44cc5855d855.png';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

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

    if (registrationError) {
      setRegistrationError('');
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      setRegistrationError('');
      
      try {
        const backendFormData = {
          firstname: formData.firstName,
          lastname: formData.lastName,
          username: formData.username,
          email: formData.email,
          password: formData.password
        };
        
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(backendFormData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }
        
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          setTimeout(() => {
            if (data.user && data.user.role === 'ADMIN') {
              window.location.href = '/admin';
            } else {
              window.location.href = '/dashboard';
            }
          }, 2000);
        } else {
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
        
        setRegistrationSuccess(true);
        setFormData({
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          password: ''
        });
        
      } catch (error) {
        setRegistrationError(error.message);
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

    <div className="register-container">
      <div className="register-form-container">
        
        {registrationError && <div className="registration-error-message">{registrationError}</div>}
        {registrationSuccess && <div className="registration-success-message">Registration successful! Redirecting...</div>}
        
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="firstName">First name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className={errors.firstName ? 'input-error' : ''}
              disabled={isLoading || registrationSuccess}
            />
            {errors.firstName && <div className="error-message">{errors.firstName}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="lastName">Last name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className={errors.lastName ? 'input-error' : ''}
              disabled={isLoading || registrationSuccess}
            />
            {errors.lastName && <div className="error-message">{errors.lastName}</div>}
          </div>
          
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
              disabled={isLoading || registrationSuccess}
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">E-Mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={errors.email ? 'input-error' : ''}
              disabled={isLoading || registrationSuccess}
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
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
              disabled={isLoading || registrationSuccess}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <button 
              type="submit" 
              className="register-button"
              disabled={isLoading || registrationSuccess}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
            <div className="form-group">
            <p className="register-link">
              Already have an account? <a href="/login">Login here</a>
            </p>
          </div>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default RegistrationForm;