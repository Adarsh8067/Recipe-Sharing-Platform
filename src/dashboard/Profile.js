import React, { useState } from 'react';
import {
  Typography,
  Box,
  TextField,
  Paper,
  Container,
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import { Restaurant, Star } from '@mui/icons-material';

const Profile = ({ currentUser = {}, onProfileUpdate = () => {} }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: currentUser.firstName || '',
    lastName: currentUser.lastName || '',
    bio: currentUser.bio || '',
    speciality: currentUser.speciality || '',
    experience: currentUser.experience || ''
  });
  const theme = useTheme();

  const handleSave = () => {
    onProfileUpdate(profileData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  if (!currentUser.name) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>
          Loading Profile...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                backgroundColor: 'primary.main',
                fontSize: '2rem',
              }}
            >
              {currentUser.firstName?.[0] || '?'}{currentUser.lastName?.[0] || '?'}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {currentUser.name || 'Anonymous'}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'text.secondary' }}>
                {currentUser.role === 'chef' && <Restaurant sx={{ fontSize: 16 }} />}
                <Typography variant="body2">
                  {currentUser.role === 'chef' ? 'Professional Chef' : 'Home Cook'}
                </Typography>
                {currentUser.isVerified && <Star sx={{ fontSize: 14, color: 'warning.main' }} />}
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 4, color: 'text.secondary' }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentUser.recipesCount || 0}
                  </Typography>
                  <Typography variant="caption">Recipes</Typography>
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    {currentUser.followersCount || 0}
                  </Typography>
                  <Typography variant="caption">Followers</Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box
            component="button"
            onClick={() => setIsEditing(!isEditing)}
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
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Box>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 6,
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        }}
      >
        {isEditing ? (
          <Box sx={{ '& > div': { mb: 4 } }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>First Name</Typography>
                <TextField
                  fullWidth
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Last Name</Typography>
                <TextField
                  fullWidth
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Bio</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Tell us about yourself..."
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>

            {currentUser.role === 'chef' && (
              <>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Specialty</Typography>
                  <TextField
                    select
                    fullWidth
                    value={profileData.speciality || ''}
                    onChange={(e) => setProfileData({...profileData, speciality: e.target.value})}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select specialty</option>
                    <option value="italian">Italian Cuisine</option>
                    <option value="french">French Cuisine</option>
                    <option value="asian">Asian Cuisine</option>
                    <option value="indian">Indian Cuisine</option>
                    <option value="mediterranean">Mediterranean</option>
                    <option value="mexican">Mexican Cuisine</option>
                    <option value="american">American Cuisine</option>
                    <option value="pastry">Pastry & Desserts</option>
                    <option value="vegetarian">Vegetarian/Vegan</option>
                    <option value="seafood">Seafood</option>
                    <option value="other">Other</option>
                  </TextField>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>Experience</Typography>
                  <TextField
                    select
                    fullWidth
                    value={profileData.experience || ''}
                    onChange={(e) => setProfileData({...profileData, experience: e.target.value})}
                    size="small"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">Select experience</option>
                    <option value="1-2">1-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="10+">10+ years</option>
                  </TextField>
                </Box>
              </>
            )}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box
                component="button"
                onClick={handleSave}
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
                Save Changes
              </Box>
              <Box
                component="button"
                onClick={() => setIsEditing(false)}
                sx={{
                  px: 4,
                  py: 2,
                  backgroundColor: 'grey.300',
                  color: 'text.primary',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'grey.400',
                  },
                }}
              >
                Cancel
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ '& > div': { mb: 4 } }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                About
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {currentUser.bio || 'No bio added yet.'}
              </Typography>
            </Box>

            {currentUser.role === 'chef' && (
              <>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Specialty
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {currentUser.speciality || 'Not specified'}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    Experience
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                    {currentUser.experience || 'Not specified'}
                  </Typography>
                </Box>
              </>
            )}

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
                Member Since
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;