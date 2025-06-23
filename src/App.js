import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Login from './auth/Login';
import Register from './auth/Register';
import Dashboard from './dashboard/Dashboard';
import RecipeFeed from './dashboard/RecipeFeed';
import MyRecipes from './dashboard/MyRecipes';
import PostRecipe from './dashboard/PostRecipe';
import SavedRecipes from './dashboard/SavedRecipes';
import Profile from './dashboard/Profile';
import Header from './dashboard/Header'; // Import the new Header component

// Wrapper component for pages that need header and sidebar
const PageWithHeader = ({ children, currentUser, onSearch }) => {
  return (
    <Header currentUser={currentUser} onSearch={onSearch}>
      {children}
    </Header>
  );
};

function App() {
  const handleSearch = (searchTerm) => {
    console.log('Search term:', searchTerm);
    // Implement search functionality here
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Dashboard route - keeps its own header */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Routes with header and sidebar */}
          <Route 
            path="/recipe-feed" 
            element={
              <PageWithHeader onSearch={handleSearch}>
                <RecipeFeed />
              </PageWithHeader>
            } 
          />
          
          <Route 
            path="/my-recipes" 
            element={
              <PageWithHeader onSearch={handleSearch}>
                <MyRecipes />
              </PageWithHeader>
            } 
          />
          
          <Route 
            path="/post-recipe" 
            element={
              <PageWithHeader onSearch={handleSearch}>
                <PostRecipe />
              </PageWithHeader>
            } 
          />
          
          <Route 
            path="/saved" 
            element={
              <PageWithHeader onSearch={handleSearch}>
                <SavedRecipes />
              </PageWithHeader>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <PageWithHeader onSearch={handleSearch}>
                <Profile />
              </PageWithHeader>
            } 
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;