import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
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
  Divider,
  Tooltip,
  Slide,
  useTheme,
  alpha,
  ListItemIcon as MuiListItemIcon
} from '@mui/material';
import {
  Restaurant,
  Search,
  Notifications,
  ExpandMore,
  Person,
  Settings,
  Logout,
  Home,
  MenuBook,
  Fastfood,
  Add,
  FavoriteOutlined
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

const Header = ({ currentUser, onSearch, children }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(true);

  // Default user if not provided
 const storedUser = localStorage.getItem('user');
const user = storedUser ? JSON.parse(storedUser) : {
  name: "User",
  firstName: "U",
  lastName: "ser",
  role: "user"
};

    const handleLogout = () => {
  localStorage.removeItem('user'); // Clear user from localStorage
  setAnchorEl(null);               // Close menu
  navigate('/login');             // Redirect
  window.location.reload();       // Optional: Force reload to clear all user-specific state
};

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    navigate('/profile');
    setAnchorEl(null);
  };

  const handleSettingsClick = () => {
    navigate('/settings');
    setAnchorEl(null);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'dashboard', icon: Home, color: 'primary', path: '/dashboard' },
    { id: 'recipe-feed', label: 'Recipe Feed', icon: Fastfood, color: 'primary', path: '/recipe-feed' },
    { id: 'my-recipes', label: 'My Recipes', icon: MenuBook, color: 'secondary', path: '/my-recipes' },
    { id: 'post-recipe', label: 'Post Recipe', icon: Add, color: 'success', path: '/post-recipe' },
    //{ id: 'saved', label: 'Saved Recipes', icon: FavoriteOutlined, color: 'error', path: '/saved' },
    { id: 'profile', label: 'Profile', icon: Person, color: 'info', path: '/profile' },
    ...(user?.role === 'admin' ? [{ id: 'settings', label: 'Settings', icon: Settings, color: 'warning', path: '/settings' }] : [])
  ];

  const activeTab = location.pathname.split('/')[1] || 'recipe-feed';

  return (
    <Box sx={{ display: 'flex' }}>
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
              onChange={(e) => onSearch && onSearch(e.target.value)}
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
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AnimatedAvatar>
              
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'white' }}>
                  {user.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {user.role === 'chef' && <Restaurant sx={{ fontSize: 14 }} />}
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.8) }}>
                    {user.role}
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
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfileClick}>
          <MuiListItemIcon><Person /></MuiListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleSettingsClick}>
          <MuiListItemIcon><Settings /></MuiListItemIcon>
          Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <MuiListItemIcon><Logout /></MuiListItemIcon>
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
                        onClick={() => navigate(item.path)}
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

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.5)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Header;