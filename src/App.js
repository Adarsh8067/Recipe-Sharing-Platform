import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Register from './auth/Register';
import Dashboard from './dashboard/Dashboard';
import RecipeFeed from './dashboard/RecipeFeed';
import MyRecipes from './dashboard/MyRecipes';
import PostRecipe from './dashboard/PostRecipe';
import SavedRecipes from './dashboard/SavedRecipes';
import Profile from './dashboard/Profile';

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
           <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/recipe-feed" element={<RecipeFeed />} />
                    <Route path="/my-recipes" element={<MyRecipes />} />
                    <Route path="/post-recipe" element={<PostRecipe />} />
                    <Route path="/saved" element={<SavedRecipes />} />
                    <Route path="/profile" element={<Profile />} />

        </Routes>
      </Router>
    </div>
  );
}

export default App;
