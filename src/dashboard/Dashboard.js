import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  Badge,
  Menu,
  MenuItem,
  Chip,
  Fade,
  Slide,
  Zoom,
  Paper,
  Container,
  Divider,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import PostRecipe from './PostRecipe'; // Assuming PostRecipe is a component for posting new recipes
import RecipeFeed from './RecipeFeed';
import MyRecipes from './MyRecipes';
import SavedRecipes from './SavedRecipes';
import Profile from './Profile';
import {
  Home,
  MenuBook,
  Add,
  FavoriteOutlined,
  Person,
  Settings,
  Logout,
  Restaurant,
  Search,
  Notifications,
  ExpandMore
} from '@mui/icons-material';
import { styled, keyframes } from '@mui/material/styles';

// Enhanced styled components with animations
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
}));

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideInLeft = keyframes`
  from { transform: translateX(-100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const fadeInUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
    backdropFilter: 'blur(10px)',
    border: 'none',
    boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
    animation: `${slideInLeft} 0.3s ease-out`,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
  margin: '4px 12px',
  borderRadius: '12px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: active 
      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`
      : 'transparent',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
  },
  '&:hover': {
    transform: 'translateX(8px)',
    '&:before': {
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
    },
  },
  ...(active && {
    '&:before': {
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
    },
  }),
}));

const AnimatedAvatar = styled(Avatar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  animation: `${pulseAnimation} 3s ease-in-out infinite`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
}));

const SearchTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '25px',
    background: alpha(theme.palette.background.paper, 0.8),
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
    },
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const NotificationBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.warning.main} 100%)`,
    animation: `${pulseAnimation} 2s ease-in-out infinite`,
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.5)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
  minHeight: '100vh',
  animation: `${fadeInUp} 0.6s ease-out`,
}));

// Mock recipe data (same as original)
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
    author: "John Doe",
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
  const [currentUser, setCurrentUser] = useState({
    name: "John Smith",
    firstName: "John",
    lastName: "Smith",
    role: "chef",
    email: "john@example.com"
  });
  const [activeTab, setActiveTab] = useState('home');
  const [recipes, setRecipes] = useState(mockRecipes);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logout clicked');
  };

  const toggleSaveRecipe = (recipeId) => {
    setSavedRecipes(prev => 
      prev.includes(recipeId) 
        ? prev.filter(id => id !== recipeId)
        : [...prev, recipeId]
    );
  };

  const sidebarItems = [
    { id: 'home', label: 'Recipe Feed', icon: Home, color: 'primary' },
    { id: 'my-recipes', label: 'My Recipes', icon: MenuBook, color: 'secondary' },
    { id: 'post-recipe', label: 'Post Recipe', icon: Add, color: 'success' },
    { id: 'saved', label: 'Saved Recipes', icon: FavoriteOutlined, color: 'error' },
    { id: 'profile', label: 'Profile', icon: Person, color: 'info' },
    ...(currentUser?.role === 'admin' ? [{ id: 'settings', label: 'Settings', icon: Settings, color: 'warning' }] : [])
  ];

  const RecipeFeedContent = () => (
    <Container maxWidth="lg">
      <Fade in timeout={800}>
        <Typography variant="h4" gutterBottom sx={{ 
          fontWeight: 700,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          backgroundClip: 'text',
          color: 'transparent',
          mb: 4
        }}>
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
                      {recipe.author[0]}
                    </Avatar>
                    <Typography variant="caption">
                      {recipe.author}
                    </Typography>
                    {recipe.authorRole === 'chef' && (
                      <Restaurant sx={{ fontSize: 16, color: 'primary.main' }} />
                    )}
                  </Box>
                  
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveRecipe(recipe.id);
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
                  <Chip label={recipe.cookTime} size="small" variant="outlined" />
                  <Chip label={recipe.difficulty} size="small" variant="outlined" />
                  <Chip label={`${recipe.likes} likes`} size="small" variant="outlined" />
                </Box>
              </Box>
            </Paper>
          </Zoom>
        ))}
      </Box>
    </Container>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <RecipeFeedContent />;
      case 'my-recipes':
        return (
         <MyRecipes 
                            recipes={recipes.filter(r => r.author === currentUser.name)} 
                            currentUser={currentUser}
                        />
                    
        );
      case 'post-recipe':
        return (
          
             <PostRecipe 
                            currentUser={currentUser}
                            onRecipePosted={(recipe) => setRecipes(prev => [recipe, ...prev])}
                        />
          
        );
      case 'saved':
        return (
         <SavedRecipes 
                            recipes={recipes.filter(r => savedRecipes.includes(r.id))}
                            savedRecipes={savedRecipes}
                            onToggleSave={toggleSaveRecipe}
                        />

        );
      case 'profile':
        return (
          <Profile currentUser={currentUser} />

        );
      default:
        return <RecipeFeedContent />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <StyledAppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Restaurant sx={{ fontSize: 32, color: 'white' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'white' }}>
              RecipeShare
            </Typography>
          </Box>
          
          <Box sx={{ flexGrow: 1, maxWidth: 600, mx: 4 }}>
            <SearchTextField
              fullWidth
              placeholder="Search recipes, ingredients, chefs..."
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Notifications" arrow>
              <IconButton color="inherit">
                <NotificationBadge badgeContent={3} color="error">
                  <Notifications />
                </NotificationBadge>
              </IconButton>
            </Tooltip>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AnimatedAvatar
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ cursor: 'pointer' }}
              >
                {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
              </AnimatedAvatar>
              
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'white' }}>
                  {currentUser.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {currentUser.role === 'chef' && <Restaurant sx={{ fontSize: 14 }} />}
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
                    {currentUser.role}
                  </Typography>
                </Box>
              </Box>
              
              <IconButton 
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <ExpandMore />
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => setActiveTab('profile')}>
          <ListItemIcon><Person /></ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={() => setActiveTab('settings')}>
          <ListItemIcon><Settings /></ListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon><Logout /></ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <StyledDrawer
        variant="permanent"
        open={drawerOpen}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', pt: 2 }}>
          <List>
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Slide in timeout={400 + index * 100} direction="right" key={item.id}>
                  <Box>
                    <Tooltip title={item.label} placement="right" arrow>
                      <StyledListItemButton
                        active={activeTab === item.id ? 1 : 0}
                        onClick={() => setActiveTab(item.id)}
                      >
                        <ListItemIcon>
                          <Icon sx={{ 
                            color: activeTab === item.id ? `${item.color}.main` : 'text.secondary',
                            transition: 'all 0.3s ease',
                          }} />
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.label}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: activeTab === item.id ? 600 : 400,
                              color: activeTab === item.id ? `${item.color}.main` : 'text.primary',
                            }
                          }}
                        />
                      </StyledListItemButton>
                    </Tooltip>
                  </Box>
                </Slide>
              );
            })}
          </List>
        </Box>
      </StyledDrawer>

      <MainContent component="main">
        <Toolbar />
        {renderContent()}
      </MainContent>
    </Box>
  );
};

export default Dashboard;