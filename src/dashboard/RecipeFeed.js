import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  Container,
  Chip,
  Avatar,
  IconButton,
  Fade,
  Zoom,
  useTheme,
  alpha
} from '@mui/material';
import { Restaurant, FavoriteOutlined } from '@mui/icons-material';

const RecipeFeed = ({ currentUser = {}, savedRecipes = [], onToggleSave = () => {} }) => {
  const theme = useTheme();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/recipes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        const data = await res.json();
        if (data.success) {
          setRecipes(data.recipes);
        } else {
          console.error('Failed to fetch recipes');
        }
      } catch (err) {
        console.error('Error fetching recipes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ mt: 4 }}>
          Loading recipes...
        </Typography>
      </Container>
    );
  }

  if (!recipes.length) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
          No Recipes Available
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Fade in timeout={800}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            backgroundClip: 'text',
            color: 'transparent',
            mb: 4
          }}
        >
          Discover Amazing Recipes
        </Typography>
      </Fade>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 3 }}>
        {recipes.map((recipe, index) => (
          <Zoom in timeout={600 + index * 200} key={recipe.id}>
            <Paper
              elevation={0}
              sx={{
                borderRadius: '20px',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                },
              }}
            >
              <Box
                sx={{
                  height: 200,
                  backgroundImage: `url(${recipe.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                {recipe.category && (
                  <Chip
                    label={recipe.category}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      background: alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: 'blur(10px)',
                    }}
                  />
                )}
              </Box>

              <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {recipe.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {recipe.description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {recipe.author?.[0] || '?'}
                    </Avatar>
                    <Typography variant="caption">
                      {recipe.author?.name || recipe.author?.username || 'Unknown'}

                    </Typography>
                    {recipe.authorRole === 'chef' && (
                      <Restaurant sx={{ fontSize: 16, color: 'primary.main' }} />
                    )}
                  </Box>

                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleSave(recipe.id);
                    }}
                    sx={{
                      color: savedRecipes.includes(recipe.id) ? 'error.main' : 'text.secondary',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.2)',
                      },
                    }}
                  >
                    <FavoriteOutlined />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {recipe.cookTime && <Chip label={recipe.cookTime} size="small" variant="outlined" />}
                  {recipe.difficulty && <Chip label={recipe.difficulty} size="small" variant="outlined" />}
                  <Chip label={`${recipe.likes || 0} likes`} size="small" variant="outlined" />
                </Box>
              </Box>
            </Paper>
          </Zoom>
        ))}
      </Box>
    </Container>
  );
};

export default RecipeFeed;
