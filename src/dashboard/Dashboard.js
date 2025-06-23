import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Paper,
  useTheme,
  alpha,
  Fade,
  Grow,
  Slide
} from '@mui/material';
import {
  Restaurant,
  Favorite,
  Person,
  TrendingUp,
  EmojiEvents,
  Visibility
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';
import PostRecipe from './PostRecipe';
import RecipeFeed from './RecipeFeed';
import MyRecipes from './MyRecipes';
import SavedRecipes from './SavedRecipes';
import Profile from './Profile';
import Header from '../dashboard/Header';

// Animations
const countUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.3); }
  50% { box-shadow: 0 0 30px rgba(25, 118, 210, 0.6), 0 0 40px rgba(25, 118, 210, 0.4); }
`;

const slideInUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

// Styled Components
const StatsCard = styled(Card)(({ theme, color = 'primary' }) => ({
  background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${pulseGlow} 3s ease-in-out infinite`,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    '&::before': {
      opacity: 1,
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
  }
}));

const AnimatedNumber = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  fontSize: '2.5rem',
  animation: `${countUp} 1s ease-out`,
  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
}));

const StatsListContainer = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  padding: theme.spacing(3),
  animation: `${slideInUp} 0.8s ease-out`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const TrendingItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 12,
  marginBottom: theme.spacing(1),
  background: alpha(theme.palette.background.paper, 0.7),
  backdropFilter: 'blur(5px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateX(8px)',
    background: alpha(theme.palette.primary.main, 0.05),
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

// Counter Hook
const useCounter = (end, duration = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

// Mock data for statistics
const mockStats = {
  totalRecipes: 1247,
  totalLikes: 8934,
  totalUsers: 456,
  totalViews: 23456
};

const mockTrendingData = {
  mostLikedRecipes: [
    { id: 1, title: "Perfect Chocolate Chip Cookies", author: "Baker Jane", likes: 456, image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=100" },
    { id: 2, title: "Authentic Ramen Bowl", author: "Chef Tanaka", likes: 398, image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100" },
    { id: 3, title: "Mediterranean Quinoa Salad", author: "Health Guru", likes: 367, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=100" },
  ],
  mostFollowedChefs: [
    { id: 1, name: "Gordon Ramsay Jr.", followers: 1234, recipes: 89, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    { id: 2, name: "Julia Martinez", followers: 987, recipes: 67, avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100" },
    { id: 3, name: "Marco Chen", followers: 876, recipes: 54, avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" },
  ]
};

const mockRecipes = [
  {
    id: 1,
    title: "Spicy Thai Basil Chicken",
    description: "Authentic Thai dish with fresh basil and chilies",
    image: "https://images.unsplash.com/photo-1559314809-0f31657def5e?w=400",
    author: "Chef Maria",
    authorRole: "chef",
    cookTime: "25 mins",
    difficulty: "Medium",
    likes: 124,
    category: "Asian",
    createdAt: "2024-06-15"
  },
  {
    id: 2,
    title: "Classic Margherita Pizza",
    description: "Traditional Italian pizza with fresh mozzarella and basil",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
    author: "John Smith",
    authorRole: "user",
    cookTime: "45 mins",
    difficulty: "Hard",
    likes: 89,
    category: "Italian",
    createdAt: "2024-06-14"
  },
  {
    id: 3,
    title: "Chocolate Lava Cake",
    description: "Decadent dessert with molten chocolate center",
    image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400",
    author: "Pastry Chef Anna",
    authorRole: "chef",
    cookTime: "30 mins",
    difficulty: "Medium",
    likes: 203,
    category: "Dessert",
    createdAt: "2024-06-13"
  }
];

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState({
    name: "John Smith",
    firstName: "John",
    lastName: "Smith",
    role: "chef",
    email: "john@example.com",
    createdAt: "2024-01-01"
  });
  const [recipes, setRecipes] = useState(mockRecipes);
  const [savedRecipes, setSavedRecipes] = useState([]);

  // Animated counters
  const totalRecipesCount = useCounter(mockStats.totalRecipes);
  const totalLikesCount = useCounter(mockStats.totalLikes);
  const totalUsersCount = useCounter(mockStats.totalUsers);
  const totalViewsCount = useCounter(mockStats.totalViews);

  const toggleSaveRecipe = (recipeId) => {
    setSavedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const handleProfileUpdate = (updatedData) => {
    setCurrentUser(prev => ({ ...prev, ...updatedData }));
  };

  const handleSearch = (searchTerm) => {
    console.log('Search term:', searchTerm);
  };

  const renderDashboardHome = () => (
    <div style={{ padding: '30px', Width: '200px', marginLeft: '30vw' , marginTop: '10vh' }}>
    <Box>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={400}>
            <StatsCard color="primary">
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Restaurant sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <AnimatedNumber variant="h4">
                      {totalRecipesCount.toLocaleString()}
                    </AnimatedNumber>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Recipes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={600}>
            <StatsCard color="error">
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Favorite sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <AnimatedNumber variant="h4">
                      {totalLikesCount.toLocaleString()}
                    </AnimatedNumber>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Likes
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={800}>
            <StatsCard color="success">
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Person sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <AnimatedNumber variant="h4">
                      {totalUsersCount.toLocaleString()}
                    </AnimatedNumber>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in timeout={1000}>
            <StatsCard color="warning">
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Visibility sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <AnimatedNumber variant="h4">
                      {totalViewsCount.toLocaleString()}
                    </AnimatedNumber>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Total Views
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </StatsCard>
          </Grow>
        </Grid>
      </Grid>

      {/* Trending Lists */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Fade in timeout={1200}>
            <StatsListContainer>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                <TrendingUp sx={{ mr: 2, color: 'primary.main' }} />
                Most Liked Recipes
              </Typography>
              <List>
                {mockTrendingData.mostLikedRecipes.map((recipe, index) => (
                  <Slide in timeout={1400 + index * 200} direction="up" key={recipe.id}>
                    <TrendingItem>
                      <Avatar 
                        src={recipe.image} 
                        sx={{ mr: 2, width: 50, height: 50 }}
                      />
                      <ListItemText
                        primary={recipe.title}
                        secondary={`by ${recipe.author}`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <Chip
                        icon={<Favorite />}
                        label={recipe.likes}
                        color="error"
                        size="small"
                      />
                    </TrendingItem>
                  </Slide>
                ))}
              </List>
            </StatsListContainer>
          </Fade>
        </Grid>

        <Grid item xs={12} md={6}>
          <Fade in timeout={1400}>
            <StatsListContainer>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', fontWeight: 700 }}>
                <EmojiEvents sx={{ mr: 2, color: 'warning.main' }} />
                Most Followed Chefs
              </Typography>
              <List>
                {mockTrendingData.mostFollowedChefs.map((chef, index) => (
                  <Slide in timeout={1600 + index * 200} direction="up" key={chef.id}>
                    <TrendingItem>
                      <Avatar 
                        src={chef.avatar} 
                        sx={{ mr: 2, width: 50, height: 50 }}
                      />
                      <ListItemText
                        primary={chef.name}
                        secondary={`${chef.recipes} recipes`}
                        primaryTypographyProps={{ fontWeight: 600 }}
                      />
                      <Chip
                        icon={<Person />}
                        label={`${chef.followers} followers`}
                        color="primary"
                        size="small"
                      />
                    </TrendingItem>
                  </Slide>
                ))}
              </List>
            </StatsListContainer>
          </Fade>
        </Grid>
      </Grid>
    </Box>
    </div>
  );

  const currentPath = location.pathname;
  const isDashboardHome = currentPath === '/' || currentPath === '/dashboard' || currentPath === '';

  return (
    <Header currentUser={currentUser} onSearch={handleSearch}>
      <Routes>
        <Route path="/" element={renderDashboardHome()} />
        <Route path="/dashboard" element={renderDashboardHome()} />
        <Route path="/recipe-feed" element={
          <RecipeFeed 
            recipes={recipes}
            currentUser={currentUser}
            savedRecipes={savedRecipes}
            onToggleSave={toggleSaveRecipe}
          />
        } />
        <Route path="/my-recipes" element={
          <MyRecipes 
            recipes={recipes.filter(r => r.author === currentUser.name)}
            currentUser={currentUser}
          />
        } />
        <Route path="/post-recipe" element={
          <PostRecipe 
            currentUser={currentUser}
            onRecipePosted={(recipe) => setRecipes(prev => [recipe, ...prev])}
          />
        } />
        <Route path="/saved" element={
          <SavedRecipes 
            recipes={recipes.filter(r => savedRecipes.includes(r.id))}
            savedRecipes={savedRecipes}
            onToggleSave={toggleSaveRecipe}
          />
        } />
        <Route path="/profile" element={
          <Profile 
            currentUser={currentUser}
            onProfileUpdate={handleProfileUpdate}
          />
        } />
        <Route path="/settings" element={<div>Settings Page (Admin Only)</div>} />
        <Route path="*" element={renderDashboardHome()} />
      </Routes>
    </Header>
  );
};

export default Dashboard;