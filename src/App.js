import React, { useState } from 'react';
import RegistrationForm from './components/Register/Register';
import LoginForm from './components/Login/Login';

function App() {
  const [currentForm, setCurrentForm] = useState('login'); 

  const toggleForm = () => {
    setCurrentForm(currentForm === 'login' ? 'register' : 'login');
  };

  return (
    <div className="App">
      {currentForm === 'login' ? <LoginForm /> : <RegistrationForm />}
      
      <div className="form-toggle-container">
        <button onClick={toggleForm} className="toggle-button">
          {currentForm === 'login' ? 'Need an account? Register' : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}

export default App;