import React from 'react';
import {
  Typography,
  Box,
  Paper,
  Container,
  useTheme,
  alpha
} from '@mui/material';
import { Restaurant } from '@mui/icons-material';

const MyRecipes = ({ recipes = [], currentUser = {} }) => {
  const theme = useTheme();

  const handleEdit = async (recipeId) => {
    try {
      const response = await fetch(`/api/recipes/${recipeId}`);
      const data = await response.json();

      if (data.success) {
        console.log('Fetched Recipe:', data.recipe);
        // TODO: Navigate to edit page or open a modal to edit recipe
      } else {
        alert(data.message || 'Failed to fetch recipe');
      }
    } catch (error) {
      console.error('Error fetching recipe:', error);
      alert('Something went wrong');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
            My Recipes
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {recipes.length} recipes
          </Typography>
        </Box>
      </Box>

      {recipes.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 12, color: 'text.secondary' }}>
          <Restaurant sx={{ fontSize: 48 }} />
          <Typography variant="h5" sx={{ mt: 4, fontWeight: 600 }}>
            No recipes yet
          </Typography>
          <Typography variant="body1" sx={{ mt: 2 }}>
            Start sharing your culinary creations!
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
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
              }}
            >
              <Box
                sx={{
                  height: 200,
                  backgroundImage: `url(${recipe.image || ''})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <Box sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {recipe.title || 'Untitled'}
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  <Box
                    component="button"
                    onClick={() => handleEdit(recipe.id)}
                    sx={{
                      px: 4,
                      py: 2,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    Edit
                  </Box>
                  <Box
                    component="button"
                    sx={{
                      px: 4,
                      py: 2,
                      backgroundColor: 'error.main',
                      color: 'white',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'error.dark',
                      },
                    }}
                  >
                    Delete
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default MyRecipes;
