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
const AnimatedAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(270deg, #6dd5ed, #2193b0, #6dd5ed)',
  backgroundSize: '600% 600%',
  animation: 'gradientMove 12s ease-in-out infinite',
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  transition: 'box-shadow 0.4s',
  '&:hover': {
    boxShadow: '0 12px 40px 0 rgba(33,147,176,0.18)',
  },
  '@keyframes gradientMove': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  },
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
    minHeight: '100vh',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    background: `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.98)} 100%)`,
    borderRight: `2px solid ${alpha(theme.palette.primary.main, 0.08)}`,
    boxShadow: '4px 0 32px 0 rgba(33,147,176,0.10)',
    borderRadius: '0 24px 24px 0',
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    animation: `${slideInLeft} 0.3s ease-out`,
  },
}));

const SidebarLogo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2, 0, 2, 0),
  marginBottom: theme.spacing(2),
  borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
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

const SidebarIcon = styled(ListItemIcon)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'scale(1.18)',
    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.18)}`,
  },
}));

const MainContentFade = styled(Box)(({ theme }) => ({
  animation: 'fadeInMain 1.2s cubic-bezier(0.4,0,0.2,1)',
  '@keyframes fadeInMain': {
    '0%': { opacity: 0, transform: 'translateY(40px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
}));

const ShakingBell = styled(Notifications)(({ theme }) => ({
  transition: 'all 0.2s',
  '&:hover': {
    animation: 'shakeBell 0.7s cubic-bezier(0.4,0,0.2,1)',
  },
  '@keyframes shakeBell': {
    '0%': { transform: 'rotate(0deg)' },
    '20%': { transform: 'rotate(-15deg)' },
    '40%': { transform: 'rotate(10deg)' },
    '60%': { transform: 'rotate(-10deg)' },
    '80%': { transform: 'rotate(8deg)' },
    '100%': { transform: 'rotate(0deg)' },
  },
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
      <AnimatedAppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
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
              sx={{
                boxShadow: '0 2px 12px 0 rgba(33,147,176,0.08)',
                '& .MuiOutlinedInput-root': {
                  transition: 'all 0.3s',
                  '&.Mui-focused': {
                    boxShadow: '0 4px 24px 0 rgba(33,147,176,0.18)',
                    transform: 'scale(1.04)',
                  },
                },
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Notifications" arrow>
              <IconButton color="inherit">
                <NotificationBadge badgeContent={3} color="error">
                  <ShakingBell />
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
      </AnimatedAppBar>

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
        <SidebarLogo>
          <Restaurant sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: 1 }}>
            RecipeShare
          </Typography>
        </SidebarLogo>
        <Box sx={{ flex: 1, overflow: 'auto', pt: 1 }}>
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
                        sx={{
                          mb: 1.5,
                          py: 1.5,
                          px: 2.5,
                          boxShadow: activeTab === item.id ? `0 4px 16px ${alpha(theme.palette.primary.main, 0.10)}` : 'none',
                          border: activeTab === item.id ? `1.5px solid ${alpha(theme.palette.primary.main, 0.18)}` : '1.5px solid transparent',
                        }}
                      >
                        <SidebarIcon>
                          <Icon sx={{ 
                            color: activeTab === item.id ? `${item.color}.main` : 'text.secondary',
                            transition: 'all 0.3s ease',
                          }} />
                        </SidebarIcon>
                        <ListItemText 
                          primary={item.label}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: activeTab === item.id ? 700 : 400,
                              color: activeTab === item.id ? `${item.color}.main` : 'text.primary',
                              letterSpacing: 0.5,
                              fontSize: '1.08rem',
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
      <MainContentFade
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
      </MainContentFade>
    </Box>
  );
};

export default Header;