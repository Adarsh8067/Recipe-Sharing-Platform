import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import { FavoriteOutlined } from '@mui/icons-material';
import axios from 'axios';

const SavedRecipes = () => {
  const theme = useTheme();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedRecipes = async () => {
    try {
      const response = await axios.get('/api/recipes/liked', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.data.success) {
        setRecipes(response.data.recipes);
      }
    } catch (error) {
      console.error('Error fetching liked recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedRecipes();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Saved Recipes
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {recipes.length} saved recipes
          </Typography>
        </Box>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : recipes.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, color: 'text.secondary' }}>
          <FavoriteOutlined sx={{ fontSize: 48 }} />
          <Typography variant="h5" sx={{ mt: 4, fontWeight: 600 }}>
            No saved recipes yet
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Like recipes you enjoy to find them easily later!
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
          {recipes.map(recipe => (
            <Paper
              key={recipe.id}
              elevation={0}
              sx={{
                borderRadius: '20px',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`
                }
              }}
            >
              <Box
                sx={{
                  height: 200,
                  backgroundImage: `url(${recipe.image || ''})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              <Box sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {recipe.title || 'Untitled'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary', mb: 2 }}>
                  {recipe.description || 'No description'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {recipe.author || 'Anonymous'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Liked on: {new Date(recipe.likedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default SavedRecipes;
