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
  alpha,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Collapse,
  Tooltip,
  Badge
} from '@mui/material';
import {
  Restaurant,
  FavoriteOutlined,
  Favorite,
  ChatBubbleOutline,
  PersonAdd,
  PersonRemove,
  Send,
  BookmarkBorder,
  Bookmark
} from '@mui/icons-material';

const RecipeFeed = ({ currentUser = {} }) => {
  const theme = useTheme();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [commentDialogs, setCommentDialogs] = useState({});
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [comments, setComments] = useState({});
  const [likesDialogs, setLikesDialogs] = useState({});
  const [likesData, setLikesData] = useState({});

  useEffect(() => {
    fetchRecipes();
  }, []);

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

  const handleToggleLike = async (recipeId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${recipeId}/toggle-like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, isLiked: data.isLiked, likes: data.likesCount }
            : recipe
        ));
        // Clear likes data to refresh when opened next time
        setLikesData(prev => ({ ...prev, [recipeId]: null }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleToggleSave = async (recipeId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${recipeId}/toggle-save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, isSaved: data.isSaved }
            : recipe
        ));
      }
    } catch (err) {
      console.error('Error toggling save:', err);
    }
  };

  const handleToggleFollow = async (userId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setRecipes(prev => prev.map(recipe => 
          recipe.author.id === userId 
            ? { 
                ...recipe, 
                isAuthorFollowed: data.isFollowing,
                author: {
                  ...recipe.author,
                  followersCount: data.followersCount
                }
              }
            : recipe
        ));
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const fetchComments = async (recipeId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${recipeId}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setComments(prev => ({ ...prev, [recipeId]: data.comments }));
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const fetchLikes = async (recipeId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${recipeId}/likes`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      
      if (data.success) {
        setLikesData(prev => ({ ...prev, [recipeId]: data.users }));
      }
    } catch (err) {
      console.error('Error fetching likes:', err);
    }
  };

  const handleAddComment = async (recipeId) => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${recipeId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          comment: newComment,
          rating: newRating || null
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setComments(prev => ({
          ...prev,
          [recipeId]: [data.comment, ...(prev[recipeId] || [])]
        }));
        setRecipes(prev => prev.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, comments: recipe.comments + 1 }
            : recipe
        ));
        setNewComment('');
        setNewRating(0);
        setCommentDialogs(prev => ({ ...prev, [recipeId]: false }));
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const toggleComments = (recipeId) => {
    setExpandedComments(prev => ({
      ...prev,
      [recipeId]: !prev[recipeId]
    }));
    
    if (!expandedComments[recipeId] && !comments[recipeId]) {
      fetchComments(recipeId);
    }
  };

  const openCommentDialog = (recipeId) => {
    setCommentDialogs(prev => ({ ...prev, [recipeId]: true }));
  };

  const closeCommentDialog = (recipeId) => {
    setCommentDialogs(prev => ({ ...prev, [recipeId]: false }));
    setNewComment('');
    setNewRating(0);
  };

  const openLikesDialog = (recipeId) => {
    setLikesDialogs(prev => ({ ...prev, [recipeId]: true }));
    if (!likesData[recipeId]) {
      fetchLikes(recipeId);
    }
  };

  const closeLikesDialog = (recipeId) => {
    setLikesDialogs(prev => ({ ...prev, [recipeId]: false }));
  };

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

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 3 }}>
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

                {/* Author section with follow button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                      {recipe.author.name?.[0] || '?'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {recipe.author.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          @{recipe.author.username}
                        </Typography>
                        {recipe.author.role === 'chef' && (
                          <Restaurant sx={{ fontSize: 14, color: 'primary.main' }} />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {recipe.author.id !== currentUser.id && (
                    <Tooltip title={recipe.isAuthorFollowed ? 'Unfollow' : 'Follow'}>
                      <IconButton
                        onClick={() => handleToggleFollow(recipe.author.id)}
                        sx={{
                          color: recipe.isAuthorFollowed ? 'primary.main' : 'text.secondary',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        {recipe.isAuthorFollowed ? <PersonRemove /> : <PersonAdd />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                {/* Recipe details */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {recipe.cookTime && <Chip label={recipe.cookTime} size="small" variant="outlined" />}
                  {recipe.difficulty && <Chip label={recipe.difficulty} size="small" variant="outlined" />}
                </Box>

                {/* Action buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Like">
                      <IconButton
                        onClick={() => handleToggleLike(recipe.id)}
                        sx={{
                          color: recipe.isLiked ? 'error.main' : 'text.secondary',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.2)',
                          },
                        }}
                      >
                        {recipe.isLiked ? <Favorite /> : <FavoriteOutlined />}
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="View Comments">
                      <IconButton
                        onClick={() => toggleComments(recipe.id)}
                        sx={{
                          color: 'text.secondary',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.2)',
                          },
                        }}
                      >
                        <Badge badgeContent={recipe.comments} color="primary">
                          <ChatBubbleOutline />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {recipe.likes > 0 && (
                      <Button
                        size="small"
                        onClick={() => openLikesDialog(recipe.id)}
                        sx={{
                          borderRadius: '20px',
                          textTransform: 'none',
                          minWidth: 'auto',
                          px: 1
                        }}
                      >
                        {recipe.likes} {recipe.likes === 1 ? 'like' : 'likes'}
                      </Button>
                    )}

                    <Button
                      size="small"
                      onClick={() => openCommentDialog(recipe.id)}
                      startIcon={<Send />}
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                      }}
                    >
                      Comment
                    </Button>

                    <Tooltip title={recipe.isSaved ? 'Unsave' : 'Save'}>
                      <IconButton
                        onClick={() => handleToggleSave(recipe.id)}
                        sx={{
                          color: recipe.isSaved ? 'warning.main' : 'text.secondary',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {recipe.isSaved ? <Bookmark /> : <BookmarkBorder />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Comments section */}
                <Collapse in={expandedComments[recipe.id]}>
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Comments {recipe.comments > 0 && `(${recipe.comments})`}
                    </Typography>
                    {comments[recipe.id] ? (
                      <List sx={{ maxHeight: 200, overflow: 'auto' }}>
                        {comments[recipe.id].map((comment) => (
                          <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                                {comment.author?.name?.[0] || '?'}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                    {comment.author?.name || 'Unknown'}
                                  </Typography>
                                  {comment.rating && (
                                    <Rating size="small" value={comment.rating} readOnly />
                                  )}
                                </Box>
                              }
                              secondary={comment.text}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No comments yet. Be the first to comment!
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Box>

              {/* Comment Dialog */}
              <Dialog
                open={commentDialogs[recipe.id] || false}
                onClose={() => closeCommentDialog(recipe.id)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>Add Comment</DialogTitle>
                <DialogContent>
                  <TextField
                    autoFocus
                    margin="dense"
                    label="Your comment"
                    fullWidth
                    multiline
                    rows={3}
                    variant="outlined"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Box sx={{ mt: 2 }}>
                    <Typography component="legend">Rating (optional)</Typography>
                    <Rating
                      value={newRating}
                      onChange={(event, newValue) => {
                        setNewRating(newValue);
                      }}
                    />
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => closeCommentDialog(recipe.id)}>Cancel</Button>
                  <Button 
                    onClick={() => handleAddComment(recipe.id)}
                    variant="contained"
                    disabled={!newComment.trim()}
                  >
                    Post Comment
                  </Button>
                </DialogActions>
              </Dialog>

              {/* Likes Dialog */}
              <Dialog
                open={likesDialogs[recipe.id] || false}
                onClose={() => closeLikesDialog(recipe.id)}
                maxWidth="sm"
                fullWidth
              >
                <DialogTitle>
                  Liked by {recipe.likes} {recipe.likes === 1 ? 'person' : 'people'}
                </DialogTitle>
                <DialogContent>
                  {likesData[recipe.id] ? (
                    <List>
                      {likesData[recipe.id].map((user) => (
                        <ListItem key={user.id} sx={{ px: 0 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                              {user.name?.[0] || '?'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={user.name}
                            secondary={`@${user.username}`}
                          />
                          {user.id !== currentUser.id && (
                            <Button
                              size="small"
                              onClick={() => handleToggleFollow(user.id)}
                              startIcon={<PersonAdd />}
                              sx={{ ml: 1 }}
                            >
                              Follow
                            </Button>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>Loading...</Typography>
                  )}
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => closeLikesDialog(recipe.id)}>Close</Button>
                </DialogActions>
              </Dialog>
            </Paper>
          </Zoom>
        ))}
      </Box>
    </Container>
  );
};

export default RecipeFeed;