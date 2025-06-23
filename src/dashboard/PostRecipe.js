import React, { useState } from 'react';
import {
  Typography,
  Box,
  TextField,
  Container,
  Paper,
  Button,
  Divider,
  Fade
} from '@mui/material';
import { Add } from '@mui/icons-material';

const PostRecipe = ({ currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    cookTime: '',
    prepTime: '',
    servings: '',
    tags: '',
    difficulty: 'Easy',
    category: '',
    cuisine: '',
    nutritionInfo: '',
    image: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const {
        title, description, category, cuisine, difficulty, cookTime,
        prepTime, servings, tags, ingredients, instructions,
        nutritionInfo, image
      } = formData;

      const recipeData = {
        title,
        description,
        category,
        cuisine,
        difficulty,
        cookTime,
        prepTime,
        servings,
        tags,
        nutritionInfo: nutritionInfo ? { info: nutritionInfo } : null,
        ingredients: ingredients.split('\n').map((line, idx) => ({
          name: line.trim(),
          quantity: null,
          unit: null,
          notes: null
        })),
        instructions: instructions.split('\n').map((text, idx) => ({
          text: text.trim(),
          duration: null,
          tips: null
        })),
        image
      };

      const form = new FormData();
      form.append('data', JSON.stringify(recipeData));

      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/recipes', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });

      const result = await response.json();

      if (response.ok) {
        alert('Recipe posted successfully!');
        setFormData({
          title: '',
          description: '',
          ingredients: '',
          instructions: '',
          cookTime: '',
          prepTime: '',
          servings: '',
          tags: '',
          difficulty: 'Easy',
          category: '',
          cuisine: '',
          nutritionInfo: '',
          image: ''
        });
      } else {
        alert(result.message || 'Failed to post recipe');
      }
    } catch (error) {
      console.error('Error posting recipe:', error);
      alert('Server error while posting recipe');
    }
  };

  return (
    <Container maxWidth="lg">
      <Fade in timeout={700}>
        <Paper elevation={6} sx={{
          maxWidth: 1200,
          mx: 'auto',
          mt: 6,
          p: { xs: 3, md: 5 },
          borderRadius: '24px',
          background: `linear-gradient(135deg, #f8fafc 0%, ${theme => theme.palette.primary.light} 100%)`,
          boxShadow: '0 8px 32px 0 rgba(33,147,176,0.10)',
          position: 'relative',
          overflow: 'hidden',
          marginLeft: '2vw'
        }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 1 }}>
              Share a New Recipe
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, color: 'text.secondary' }}>
              Share your culinary creation with the community
            </Typography>
          </Box>
          <Divider sx={{ mb: 4 }} />
          <Box component="form" onSubmit={handleSubmit} sx={{ '& > div': { mb: 4 } }}>
            {/* Title and Category */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Recipe Title</Typography>
                <TextField
                  fullWidth
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter recipe title"
                  required
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Category</Typography>
                <TextField
                  select
                  fullWidth
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  size="small"
                  SelectProps={{ native: true }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                >
                  <option value="">Select category</option>
                  <option value="Appetizer">Appetizer</option>
                  <option value="Main Course">Main Course</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Asian">Asian</option>
                  <option value="Italian">Italian</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Indian">Indian</option>
                </TextField>
              </Box>
            </Box>

            {/* Cuisine and Tags */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Cuisine</Typography>
                <TextField
                  fullWidth
                  value={formData.cuisine}
                  onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                  placeholder="e.g., Indian, Chinese"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Tags</Typography>
                <TextField
                  fullWidth
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., spicy, vegan"
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Box>
            </Box>

            {/* Description */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Description</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your recipe"
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>

            {/* Ingredients */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Ingredients</Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                placeholder="List ingredients (one per line)"
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>

            {/* Instructions */}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Instructions</Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Step-by-step cooking instructions (one per line)"
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>

            {/* Cook Time, Prep Time, Servings */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Cook Time (mins)"
                type="number"
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                size="small"
              />
              <TextField
                label="Prep Time (mins)"
                type="number"
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                size="small"
              />
              <TextField
                label="Servings"
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                size="small"
              />
            </Box>

            {/* Difficulty */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Difficulty</Typography>
              <TextField
                select
                fullWidth
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                size="small"
                SelectProps={{ native: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </TextField>
            </Box>

            {/* Nutrition Info */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Nutrition Info (optional)</Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                value={formData.nutritionInfo}
                onChange={(e) => setFormData({ ...formData, nutritionInfo: e.target.value })}
                placeholder="e.g., Calories: 300, Protein: 10g"
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>

            {/* Image URL */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Image URL (optional)</Typography>
              <TextField
                fullWidth
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>

            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                startIcon={<Add />}
                sx={{
                  px: 5,
                  py: 1.5,
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  boxShadow: '0 4px 16px 0 rgba(33,147,176,0.10)',
                  textTransform: 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'scale(1.04)',
                    boxShadow: '0 8px 32px 0 rgba(33,147,176,0.18)',
                  },
                }}
              >
                Post Recipe
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Container>
  );
};

export default PostRecipe;
