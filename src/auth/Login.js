// src/components/Auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Dummy user data for testing
  const dummyUsers = [
    {
      id: 1,
      email: 'user@example.com',
      password: 'password123',
      name: 'John Doe',
      role: 'user'
    },
    {
      id: 2,
      email: 'admin@example.com',
      password: 'admin123',
      name: 'Admin User',
      role: 'admin'
    },
    {
      id: 3,
      email: 'chef@example.com',
      password: 'chef123',
      name: 'Chef Maria',
      role: 'chef'
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user exists in dummy data
      const user = dummyUsers.find(
        u => u.email === formData.email && u.password === formData.password
      );

      if (user) {
        // Simulate successful login response
        const mockToken = 'dummy-jwt-token-' + Date.now();
        const userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };

        // Store dummy data in localStorage (same as original)
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        // Simulate login failure
        setErrors({ general: 'Invalid email or password' });
      }
    } catch (error) {
      // Simulate network error
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }

    /* 
    // Original backend API call - commented out
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setErrors({ general: data.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
    */
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your RecipeShare account</p>
        </div>
        
        {/* Demo credentials info */}
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '12px', 
          marginBottom: '20px', 
          borderRadius: '4px',
          fontSize: '14px',
          color: '#1565c0'
        }}>
          <strong>Demo Credentials:</strong><br/>
          Email: user@example.com | Password: password123<br/>
          Email: admin@example.com | Password: admin123<br/>
          Email: chef@example.com | Password: chef123
        </div>
        
        {errors.general && (
          <div className="error-alert">{errors.general}</div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="auth-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? 
            <button 
              type="button" 
              className="link-btn"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
