import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Button,
  Grid,
  Container,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
  IconButton,
  Menu,
  MenuItem,
  Fab,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Restaurant as RestaurantIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';

const MyRecipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please log in to view your recipes');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/recipes/user/my-recipes', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const responseText = await response.text();
      
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        setError(`Server returned HTML page instead of JSON. Status: ${response.status}`);
        return;
      }
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        setError(`Invalid response format. Expected JSON.`);
        return;
      }
      
      if (!response.ok) {
        if (response.status === 401) {
          setError(data.message || 'Please log in to view your recipes');
          localStorage.removeItem('token');
          return;
        }
        setError(data.message || `HTTP error! status: ${response.status}`);
        return;
      }
      
      if (data.success) {
        setRecipes(data.recipes || []);
      } else {
        setError(data.message || 'Failed to fetch recipes');
      }
    } catch (error) {
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/recipes/${recipeToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setRecipes(recipes.filter(recipe => recipe.id !== recipeToDelete.id));
        setDeleteDialogOpen(false);
        setRecipeToDelete(null);
      } else {
        setError(data.message || 'Failed to delete recipe');
      }
    } catch (error) {
      setError(`Error deleting recipe: ${error.message}`);
    }
  };

  const handleEditClick = (recipe) => {
    // Navigate to edit page (you would implement this with your router)
    console.log('Edit recipe:', recipe.id);
    handleMenuClose();
  };

  const handleMenuClick = (event, recipe) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecipe(recipe);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecipe(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchRecipes}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            My Recipes
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
          </Typography>
        </Box>
      </Box>

      {recipes.length === 0 && !error ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 8,
            textAlign: 'center'
          }}
        >
          <RestaurantIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'medium' }}>
            No recipes yet
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Start sharing your culinary creations!
          </Typography>
          <Button 
            variant="contained" 
            size="large" 
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
          >
            Create Your First Recipe
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {recipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} key={recipe.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  },
                  borderRadius: 2
                }}
              >
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    bgcolor: recipe.image ? 'transparent' : 'grey.200',
                    backgroundImage: `url(${(recipe.image && recipe.image.trim() !== '') ? recipe.image : FALLBACK_IMAGE})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {!recipe.image && (
                    <RestaurantIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                  )}
                  <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, recipe)}
                      sx={{ 
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' }
                      }}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <Tooltip title={recipe.isPublished ? 'Published' : 'Draft'}>
                      {recipe.isPublished ? (
                        <VisibilityIcon sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1, p: 0.5 }} />
                      ) : (
                        <VisibilityOffIcon sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.5)', borderRadius: 1, p: 0.5 }} />
                      )}
                    </Tooltip>
                  </Box>
                </CardMedia>

                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Typography 
                    variant="h6" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {recipe.title || 'Untitled'}
                  </Typography>

                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical'
                    }}
                  >
                    {recipe.description || 'No description available'}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                    {recipe.category && (
                      <Chip label={recipe.category} size="small" color="primary" variant="outlined" />
                    )}
                    {recipe.difficulty && (
                      <Chip 
                        label={recipe.difficulty} 
                        size="small" 
                        color={getDifficultyColor(recipe.difficulty)}
                        variant="outlined"
                      />
                    )}
                    {recipe.cuisine && (
                      <Chip label={recipe.cuisine} size="small" color="secondary" variant="outlined" />
                    )}
                  </Stack>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    {recipe.prepTime && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Prep: {recipe.prepTime} min
                        </Typography>
                      </Box>
                    )}
                    {recipe.cookTime && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Cook: {recipe.cookTime} min
                        </Typography>
                      </Box>
                    )}
                    {recipe.servings && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <GroupIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Serves: {recipe.servings}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {recipe.author && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      By: {recipe.author.name || recipe.author.username}
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(recipe.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => handleEditClick(recipe)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(recipe)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menu for recipe actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleEditClick(selectedRecipe)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Recipe
        </MenuItem>
        <MenuItem onClick={() => handleDeleteClick(selectedRecipe)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Recipe
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Recipe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{recipeToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating action button to add new recipe */}
      <Fab
        color="primary"
        aria-label="add recipe"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default MyRecipes;