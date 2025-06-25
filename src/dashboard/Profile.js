import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  TextField,
  Paper,
  Container,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Slide,
  Zoom,
  CircularProgress,
  Snackbar,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Skeleton
} from '@mui/material';
import {
  Restaurant,
  Star,
  Edit,
  Save,
  Cancel,
  Person,
  Email,
  CalendarToday,
  Verified,
  TrendingUp,
  Group,
  MenuBook,
  Close
} from '@mui/icons-material';

const Profile = ({ userId = null }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    speciality: '',
    experience: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [followersCount, setFollowersCount] = useState(0);
  
  const theme = useTheme();

  // API call to fetch profile
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const endpoint = userId 
        ? `/api/users/profile/${userId}` 
        : '/api/users/profile';
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log('Profile API Response:', data); // Debug log
      
      if (data.success) {
        setCurrentUser(data.user);
        setProfileData({
          firstName: data.user.firstName || '',
          lastName: data.user.lastName || '',
          bio: data.user.bio || '',
          speciality: data.user.speciality || '',
          experience: data.user.experience || ''
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Failed to fetch profile',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch followers count from new endpoint
  const fetchFollowersCount = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}/followers/count`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setFollowersCount(data.followersCount);
      }
    } catch (error) {
      console.error('Error fetching followers count:', error);
    }
  };

  // API call to update profile
  const updateProfile = async () => {
    try {
      setSaving(true);
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentUser(data.user);
        setIsEditing(false);
        setSnackbar({
          open: true,
          message: 'Profile updated successfully!',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: data.message || 'Failed to update profile',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Network error. Please try again.',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (currentUser.id) {
      fetchFollowersCount(currentUser.id);
    }
  }, [currentUser.id]);

  const handleSave = () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      setSnackbar({
        open: true,
        message: 'First name and last name are required',
        severity: 'error'
      });
      return;
    }
    updateProfile();
  };

  const handleCancel = () => {
    setProfileData({
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      bio: currentUser.bio || '',
      speciality: currentUser.speciality || '',
      experience: currentUser.experience || ''
    });
    setIsEditing(false);
  };

  const specialityLabels = {
    italian: 'Italian Cuisine',
    french: 'French Cuisine',
    asian: 'Asian Cuisine',
    indian: 'Indian Cuisine',
    mediterranean: 'Mediterranean',
    mexican: 'Mexican Cuisine',
    american: 'American Cuisine',
    pastry: 'Pastry & Desserts',
    vegetarian: 'Vegetarian/Vegan',
    seafood: 'Seafood',
    other: 'Other'
  };

  const experienceLabels = {
    '1-2': '1-2 years',
    '3-5': '3-5 years',
    '6-10': '6-10 years',
    '10+': '10+ years'
  };

  // Helper function to get display name
  const getDisplayName = () => {
    if (currentUser.name && currentUser.name.trim() && currentUser.name !== 'null null') {
      return currentUser.name;
    }
    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`.trim();
    }
    if (currentUser.firstName) {
      return currentUser.firstName;
    }
    if (currentUser.username) {
      return currentUser.username;
    }
    return 'Anonymous';
  };

  // Helper function to get avatar initials
  const getAvatarInitials = () => {
    const name = getDisplayName();
    if (name === 'Anonymous' || name === currentUser.username) {
      return currentUser.username ? currentUser.username.charAt(0).toUpperCase() : '?';
    }
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4 }}>
            <Skeleton variant="circular" width={80} height={80} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={40} />
              <Skeleton variant="text" width="30%" height={24} />
              <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                <Skeleton variant="text" width={60} height={20} />
                <Skeleton variant="text" width={60} height={20} />
              </Box>
            </Box>
          </Box>
        </Box>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: '20px' }} />
      </Container>
    );
  }

  const isOwnProfile = !userId || currentUser.isOwnProfile;

  return (
    <Container maxWidth="lg" sx={{ position: 'relative', minHeight: '100vh', py: 6, mt: 6 }}>
      <Fade in timeout={800}>
        <Box>
          {/* Header Section */}
          <Slide direction="down" in timeout={600}>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Zoom in timeout={1000}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        backgroundColor: 'primary.main',
                        fontSize: '2rem',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        }
                      }}
                    >
                      {getAvatarInitials()}
                    </Avatar>
                  </Zoom>
                  <Box>
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 700, 
                        color: 'text.primary',
                        mb: 1,
                        opacity: 0,
                        animation: 'fadeInUp 0.8s ease forwards',
                        animationDelay: '0.2s'
                      }}
                    >
                      {getDisplayName()}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2, 
                      color: 'text.secondary',
                      opacity: 0,
                      animation: 'fadeInUp 0.8s ease forwards',
                      animationDelay: '0.4s'
                    }}>
                      {currentUser.role === 'chef' && <Restaurant sx={{ fontSize: 16 }} />}
                      <Typography variant="body2">
                        @{currentUser.username}
                      </Typography>
                      <Typography variant="body2">•</Typography>
                      <Typography variant="body2">
                        {currentUser.role === 'chef' ? 'Professional Chef' : 'Home Cook'}
                      </Typography>
                      {currentUser.isVerified && (
                        <Tooltip title="Verified Chef">
                          <Verified sx={{ fontSize: 16, color: 'primary.main' }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Box sx={{ 
                      mt: 2, 
                      display: 'flex', 
                      gap: 4,
                      opacity: 0,
                      animation: 'fadeInUp 0.8s ease forwards',
                      animationDelay: '0.6s'
                    }}>
                      <Chip
                        icon={<MenuBook />}
                        label={`${currentUser.recipesCount || 0} Recipes`}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                          }
                        }}
                      />
                      <Chip
                        icon={<Group />}
                        label={`${followersCount || 0} Followers`}
                        variant="outlined"
                        size="small"
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                {isOwnProfile && (
                  <Zoom in timeout={1200}>
                    <Tooltip title={isEditing ? 'Cancel editing' : 'Edit profile'}>
                      <IconButton
                        onClick={() => setIsEditing(!isEditing)}
                        disabled={saving}
                        sx={{
                          backgroundColor: isEditing ? 'grey.200' : 'primary.main',
                          color: isEditing ? 'text.primary' : 'white',
                          '&:hover': {
                            backgroundColor: isEditing ? 'grey.300' : 'primary.dark',
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {isEditing ? <Close /> : <Edit />}
                      </IconButton>
                    </Tooltip>
                  </Zoom>
                )}
              </Box>
            </Box>
          </Slide>

          {/* Main Content */}
          <Slide direction="up" in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                p: 6,
                borderRadius: '20px',
                background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }
              }}
            >
              {saving && (
                <LinearProgress 
                  sx={{ 
                    position: 'absolute', 
                    top: 4, 
                    left: 0, 
                    right: 0,
                    height: 2
                  }} 
                />
              )}

              {isEditing && isOwnProfile ? (
                <Fade in timeout={500}>
                  <Box sx={{ '& > div': { mb: 4 } }}>
                    <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
                      Edit Profile
                    </Typography>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                          First Name *
                        </Typography>
                        <TextField
                          fullWidth
                          value={profileData.firstName}
                          onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          size="small"
                          disabled={saving}
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: '12px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: theme.shadows[2]
                              }
                            } 
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                          Last Name *
                        </Typography>
                        <TextField
                          fullWidth
                          value={profileData.lastName}
                          onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          size="small"
                          disabled={saving}
                          sx={{ 
                            '& .MuiOutlinedInput-root': { 
                              borderRadius: '12px',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: theme.shadows[2]
                              }
                            } 
                          }}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                        Bio
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                        disabled={saving}
                        sx={{ 
                          '& .MuiOutlinedInput-root': { 
                            borderRadius: '12px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: theme.shadows[2]
                            }
                          } 
                        }}
                      />
                    </Box>

                    {currentUser.role === 'chef' && (
                      <>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Specialty
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            value={profileData.speciality || ''}
                            onChange={(e) => setProfileData({...profileData, speciality: e.target.value})}
                            size="small"
                            disabled={saving}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { 
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: theme.shadows[2]
                                }
                              } 
                            }}
                            SelectProps={{ native: true }}
                          >
                            <option value="">Select specialty</option>
                            {Object.entries(specialityLabels).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </TextField>
                        </Box>

                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Experience
                          </Typography>
                          <TextField
                            select
                            fullWidth
                            value={profileData.experience || ''}
                            onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                            size="small"
                            disabled={saving}
                            sx={{ 
                              '& .MuiOutlinedInput-root': { 
                                borderRadius: '12px',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: theme.shadows[2]
                                }
                              } 
                            }}
                            SelectProps={{ native: true }}
                          >
                            <option value="">Select experience</option>
                            {Object.entries(experienceLabels).map(([key, label]) => (
                              <option key={key} value={key}>{label}</option>
                            ))}
                          </TextField>
                        </Box>
                      </>
                    )}

                    <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                      <Box
                        component="button"
                        onClick={handleSave}
                        disabled={saving}
                        sx={{
                          px: 4,
                          py: 2,
                          backgroundColor: 'primary.main',
                          color: 'white',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: saving ? 'primary.main' : 'primary.dark',
                            transform: saving ? 'none' : 'translateY(-2px)',
                            boxShadow: saving ? 'none' : theme.shadows[4]
                          },
                        }}
                      >
                        {saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Box>
                      <Box
                        component="button"
                        onClick={handleCancel}
                        disabled={saving}
                        sx={{
                          px: 4,
                          py: 2,
                          backgroundColor: 'grey.200',
                          color: 'text.primary',
                          borderRadius: '12px',
                          border: 'none',
                          cursor: saving ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: saving ? 'grey.200' : 'grey.300',
                            transform: saving ? 'none' : 'translateY(-2px)',
                            boxShadow: saving ? 'none' : theme.shadows[2]
                          },
                        }}
                      >
                        <Cancel />
                        Cancel
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              ) : (
                <Fade in timeout={500}>
                  <Box>
                    <Box sx={{ 
                      display: 'grid', 
                      gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, 
                      gap: 4 
                    }}>
                      {/* Main Info */}
                      <Box sx={{ '& > div': { mb: 4 } }}>
                        <Card elevation={0} sx={{ 
                          background: alpha(theme.palette.background.paper, 0.7),
                          borderRadius: '16px',
                          p: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4]
                          }
                        }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 2
                          }}>
                            <Person /> About
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                            {currentUser.bio || 'No bio added yet.'}
                          </Typography>
                        </Card>

                        {currentUser.role === 'chef' && (
                          <>
                            <Card elevation={0} sx={{ 
                              background: alpha(theme.palette.background.paper, 0.7),
                              borderRadius: '16px',
                              p: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4]
                              }
                            }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 2
                              }}>
                                <Restaurant /> Specialty
                              </Typography>
                              <Chip
                                label={specialityLabels[currentUser.speciality] || 'Not specified'}
                                color="primary"
                                variant="outlined"
                              />
                            </Card>

                            <Card elevation={0} sx={{ 
                              background: alpha(theme.palette.background.paper, 0.7),
                              borderRadius: '16px',
                              p: 3,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: theme.shadows[4]
                              }
                            }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: 'text.primary',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mb: 2
                              }}>
                                <TrendingUp /> Experience
                              </Typography>
                              <Chip
                                label={experienceLabels[currentUser.experience] || 'Not specified'}
                                color="secondary"
                                variant="outlined"
                              />
                            </Card>
                          </>
                        )}
                      </Box>

                      {/* Side Info */}
                      <Box>
                        <Card elevation={0} sx={{ 
                          background: alpha(theme.palette.primary.main, 0.05),
                          borderRadius: '16px',
                          p: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4]
                          }
                        }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            color: 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 3
                          }}>
                            <CalendarToday /> Member Since
                          </Typography>
                          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                            {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'N/A'}
                          </Typography>
                          
                          <Divider sx={{ my: 2 }} />
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Recipes
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {currentUser.recipesCount || 0}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Followers
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {followersCount || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                      </Box>
                    </Box>
                  </Box>
                </Fade>
              )}
            </Paper>
          </Slide>
        </Box>
      </Fade>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* CSS Keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </Container>
  );
};

export default Profile;