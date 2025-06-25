import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user',
    firstName: '',
    lastName: '',
    bio: '',
    experience: '',
    speciality: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username || formData.username.length < 3)
      newErrors.username = 'Username must be at least 3 characters';

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'A valid email is required';

    if (!formData.password || formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (formData.userType === 'chef') {
      if (!formData.bio) newErrors.bio = 'Bio is required for chefs';
      if (!formData.experience) newErrors.experience = 'Experience is required';
      if (!formData.speciality) newErrors.speciality = 'Specialty is required';
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
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || 'Registration failed' });
        setIsLoading(false);
        return;
      }

      // Save token and user in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ general: 'Something went wrong. Please try again later.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-image" />
        <div className="auth-form">
          <div className="auth-header">
            <h2>Create Account</h2>
            <p>Join RecipeShare and start cooking!</p>
          </div>
          {errors.general && <div className="error-alert">{errors.general}</div>}
          <form onSubmit={handleSubmit} className="auth-form-fields">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                  placeholder="First name"
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                  placeholder="Last name"
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                placeholder="Choose a username"
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>

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
              <label htmlFor="userType">Account Type</label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="form-select"
              >
                <option value="user">Home Cook</option>
                <option value="chef">Professional Chef</option>
              </select>
            </div>

            {formData.userType === 'chef' && (
              <>
                <div className="form-group">
                  <label htmlFor="bio">Professional Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className={errors.bio ? 'error' : ''}
                    placeholder="Tell us about your culinary background..."
                    rows="3"
                  />
                  {errors.bio && <span className="error-text">{errors.bio}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="experience">Years of Experience</label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className={errors.experience ? 'error form-select' : 'form-select'}
                    >
                      <option value="">Select experience</option>
                      <option value="1-2">1-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-10">6-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                    {errors.experience && <span className="error-text">{errors.experience}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="speciality">Specialty</label>
                    <select
                      id="speciality"
                      name="speciality"
                      value={formData.speciality}
                      onChange={handleChange}
                      className={errors.speciality ? 'error form-select' : 'form-select'}
                    >
                      <option value="">Select specialty</option>
                      <option value="italian">Italian Cuisine</option>
                      <option value="french">French Cuisine</option>
                      <option value="asian">Asian Cuisine</option>
                      <option value="indian">Indian Cuisine</option>
                      <option value="mediterranean">Mediterranean</option>
                      <option value="mexican">Mexican Cuisine</option>
                      <option value="american">American Cuisine</option>
                      <option value="pastry">Pastry & Desserts</option>
                      <option value="vegetarian">Vegetarian/Vegan</option>
                      <option value="seafood">Seafood</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.speciality && <span className="error-text">{errors.speciality}</span>}
                  </div>
                </div>
              </>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  placeholder="Create a password"
                />
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>
            </div>

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <button type="button" className="link-btn" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </p>
          </div>
        </div>
        <div className="auth-info">
          <div className="auth-info-content">
            <img src="/logo192.png" alt="RecipeShare Logo" className="auth-logo" />
            <h2>Discover & Share Recipes</h2>
            <p>Get started using a modern recipe-sharing platform that helps you cook, connect, and inspire others. Join now and explore amazing dishes!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
