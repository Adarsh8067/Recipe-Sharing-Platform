const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'recipe-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// JWT helper function
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [decoded.id]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'OK', message: 'Server is running' });
});

// AUTH ROUTES
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user.id);
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.user_type,
      userType: user.user_type,
      bio: user.bio,
      experience: user.experience,
      speciality: user.speciality,
      isVerified: user.is_verified,
      recipesCount: user.recipes_count,
      followersCount: user.followers_count
    };

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      userType,
      bio,
      experience,
      speciality
    } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be filled'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      const [emailCheck] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
      const [usernameCheck] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);

      if (emailCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists. Please use a different email.'
        });
      }
      if (usernameCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Username already taken. Please choose a different username.'
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password, first_name, last_name, user_type, bio, experience, speciality, is_verified)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        username,
        email,
        hashedPassword,
        firstName,
        lastName,
        userType || 'user',
        bio || null,
        experience || null,
        speciality || null,
        userType === 'chef' ? 1 : 0
      ]
    );

    const [newUserRows] = await pool.execute('SELECT * FROM users WHERE id = ?', [result.insertId]);
    const newUser = newUserRows[0];

    const token = generateToken(newUser.id);

    const userData = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: `${newUser.first_name} ${newUser.last_name}`,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      role: newUser.user_type,
      userType: newUser.user_type,
      bio: newUser.bio,
      experience: newUser.experience,
      speciality: newUser.speciality,
      isVerified: newUser.is_verified,
      recipesCount: newUser.recipes_count,
      followersCount: newUser.followers_count
    };

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.user_type,
      userType: user.user_type,
      bio: user.bio,
      experience: user.experience,
      speciality: user.speciality,
      isVerified: user.is_verified,
      recipesCount: user.recipes_count,
      followersCount: user.followers_count
    };

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// USER PROFILE ROUTES
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      experience,
      speciality
    } = req.body;

    await pool.execute(
      `UPDATE users SET 
        first_name = ?, 
        last_name = ?, 
        bio = ?, 
        experience = ?, 
        speciality = ?
      WHERE id = ?`,
      [
        firstName || req.user.first_name,
        lastName || req.user.last_name,
        bio || req.user.bio,
        experience || req.user.experience,
        speciality || req.user.speciality,
        req.user.id
      ]
    );

    const [updatedUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.id]);

    const userData = {
      id: updatedUser[0].id,
      username: updatedUser[0].username,
      email: updatedUser[0].email,
      name: `${updatedUser[0].first_name} ${updatedUser[0].last_name}`,
      firstName: updatedUser[0].first_name,
      lastName: updatedUser[0].last_name,
      role: updatedUser[0].user_type,
      userType: updatedUser[0].user_type,
      bio: updatedUser[0].bio,
      experience: updatedUser[0].experience,
      speciality: updatedUser[0].speciality,
      isVerified: updatedUser[0].is_verified,
      recipesCount: updatedUser[0].recipes_count,
      followersCount: updatedUser[0].followers_count
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


// GET endpoint to fetch user profile (current user)
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const [userResult] = await pool.execute(
      `SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        user_type,
        bio,
        experience,
        speciality,
        is_verified,
        recipes_count,
        followers_count,
        created_at,
        updated_at
      FROM users 
      WHERE id = ?`,
      [req.user.id]
    );

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult[0];
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.user_type,
      userType: user.user_type,
      bio: user.bio,
      experience: user.experience,
      speciality: user.speciality,
      isVerified: user.is_verified,
      recipesCount: user.recipes_count,
      followersCount: user.followers_count,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };

    res.json({
      success: true,
      message: 'Profile fetched successfully',
      user: userData
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// GET endpoint to fetch any user's profile by ID (public profiles)
app.get('/api/users/profile/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId is a number
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }
    
    const [userResult] = await pool.execute(
      `SELECT 
        id,
        username,
        first_name,
        last_name,
        user_type,
        bio,
        experience,
        speciality,
        is_verified,
        recipes_count,
        followers_count,
        created_at
      FROM users 
      WHERE id = ?`,
      [parseInt(userId)]
    );

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult[0];
    const userData = {
      id: user.id,
      username: user.username,
      name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.user_type,
      userType: user.user_type,
      bio: user.bio,
      experience: user.experience,
      speciality: user.speciality,
      isVerified: user.is_verified,
      recipesCount: user.recipes_count,
      followersCount: user.followers_count,
      createdAt: user.created_at,
      isOwnProfile: req.user.id === parseInt(userId)
    };

    res.json({
      success: true,
      message: 'Profile fetched successfully',
      user: userData
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// PUT endpoint to update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      bio,
      experience,
      speciality
    } = req.body;

    // Validation
    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'First name and last name are required'
      });
    }

    // Update user profile
    await pool.execute(
      `UPDATE users SET
        first_name = ?,
        last_name = ?,
        bio = ?,
        experience = ?,
        speciality = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?`,
      [
        firstName,
        lastName,
        bio || null,
        experience || null,
        speciality || null,
        req.user.id
      ]
    );

    // Fetch updated user data
    const [updatedUser] = await pool.execute(
      `SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        user_type,
        bio,
        experience,
        speciality,
        is_verified,
        recipes_count,
        followers_count,
        created_at,
        updated_at
      FROM users 
      WHERE id = ?`,
      [req.user.id]
    );

    const userData = {
      id: updatedUser[0].id,
      username: updatedUser[0].username,
      email: updatedUser[0].email,
      name: `${updatedUser[0].first_name || ''} ${updatedUser[0].last_name || ''}`.trim() || updatedUser[0].username,
      firstName: updatedUser[0].first_name,
      lastName: updatedUser[0].last_name,
      role: updatedUser[0].user_type,
      userType: updatedUser[0].user_type,
      bio: updatedUser[0].bio,
      experience: updatedUser[0].experience,
      speciality: updatedUser[0].speciality,
      isVerified: updatedUser[0].is_verified,
      recipesCount: updatedUser[0].recipes_count,
      followersCount: updatedUser[0].followers_count,
      createdAt: updatedUser[0].created_at,
      updatedAt: updatedUser[0].updated_at
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// PATCH endpoint to update specific profile fields
app.patch('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'bio', 'experience', 'speciality'];
    const updateFields = {};
    const updateValues = [];
    const updateQueries = [];

    // Build dynamic update query
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        const dbField = key === 'firstName' ? 'first_name' : 
                       key === 'lastName' ? 'last_name' : key;
        updateFields[dbField] = req.body[key];
        updateQueries.push(`${dbField} = ?`);
        updateValues.push(req.body[key]);
      }
    });

    if (updateQueries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    // Add updated_at and user id
    updateQueries.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(req.user.id);

    const updateQuery = `UPDATE users SET ${updateQueries.join(', ')} WHERE id = ?`;
    
    await pool.execute(updateQuery, updateValues);

    // Fetch updated user data
    const [updatedUser] = await pool.execute(
      `SELECT 
        id,
        username,
        email,
        first_name,
        last_name,
        user_type,
        bio,
        experience,
        speciality,
        is_verified,
        recipes_count,
        followers_count,
        created_at,
        updated_at
      FROM users 
      WHERE id = ?`,
      [req.user.id]
    );

    const userData = {
      id: updatedUser[0].id,
      username: updatedUser[0].username,
      email: updatedUser[0].email,
      name: `${updatedUser[0].first_name || ''} ${updatedUser[0].last_name || ''}`.trim() || updatedUser[0].username,
      firstName: updatedUser[0].first_name,
      lastName: updatedUser[0].last_name,
      role: updatedUser[0].user_type,
      userType: updatedUser[0].user_type,
      bio: updatedUser[0].bio,
      experience: updatedUser[0].experience,
      speciality: updatedUser[0].speciality,
      isVerified: updatedUser[0].is_verified,
      recipesCount: updatedUser[0].recipes_count,
      followersCount: updatedUser[0].followers_count,
      createdAt: updatedUser[0].created_at,
      updatedAt: updatedUser[0].updated_at
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userData,
      updatedFields: Object.keys(updateFields)
    });

  } catch (error) {
    console.error('Patch profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.get('/api/users/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const [users] = await pool.execute(
      `SELECT 
        id, username, first_name, last_name, user_type, bio, 
        experience, speciality, is_verified, recipes_count, followers_count
      FROM users WHERE username = ?`,
      [username]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];
    const userData = {
      id: user.id,
      username: user.username,
      name: `${user.first_name} ${user.last_name}`,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.user_type,
      bio: user.bio,
      experience: user.experience,
      speciality: user.speciality,
      isVerified: user.is_verified,
      recipesCount: user.recipes_count,
      followersCount: user.followers_count
    };

    res.json({
      success: true,
      user: userData
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// FOLLOW/UNFOLLOW ROUTES
app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      });
    }

    const [userCheck] = await pool.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (userCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM followers WHERE follower_id = ? AND followed_id = ?',
      [req.user.id, id]
    );

    let isFollowing = false;
    if (existing.length > 0) {
      await pool.execute(
        'DELETE FROM followers WHERE follower_id = ? AND followed_id = ?',
        [req.user.id, id]
      );
      await pool.execute(
        'UPDATE users SET followers_count = followers_count - 1 WHERE id = ?',
        [id]
      );
      isFollowing = false;
    } else {
      await pool.execute(
        'INSERT INTO followers (follower_id, followed_id) VALUES (?, ?)',
        [req.user.id, id]
      );
      await pool.execute(
        'UPDATE users SET followers_count = followers_count + 1 WHERE id = ?',
        [id]
      );
      isFollowing = true;
    }

    const [followerCount] = await pool.execute(
      'SELECT followers_count FROM users WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: isFollowing ? 'User followed' : 'User unfollowed',
      isFollowing,
      followersCount: followerCount[0].followers_count
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [recipes] = await pool.execute(`
      SELECT 
        r.*,
        u.username as author_username,
        u.first_name,
        u.last_name,
        u.user_type as author_role,
        u.is_verified,
        u.bio as author_bio,
        COUNT(DISTINCT rl.id) as likes_count,
        COUNT(DISTINCT rc.id) as comments_count
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_likes rl ON r.id = rl.recipe_id
      LEFT JOIN recipe_comments rc ON r.id = rc.recipe_id
      WHERE r.id = ? AND r.is_published = 1
      GROUP BY r.id
    `, [id]);

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const recipe = recipes[0];

    const [ingredients] = await pool.execute(
      'SELECT * FROM recipe_ingredients WHERE recipe_id = ? ORDER BY order_index',
      [id]
    );

    const [instructions] = await pool.execute(
      'SELECT * FROM recipe_instructions WHERE recipe_id = ? ORDER BY step_number',
      [id]
    );

    const [comments] = await pool.execute(`
      SELECT 
        rc.*,
        u.username,
        u.first_name,
        u.last_name,
        u.user_type
      FROM recipe_comments rc
      JOIN users u ON rc.user_id = u.id
      WHERE rc.recipe_id = ?
      ORDER BY rc.created_at DESC
      LIMIT 10
    `, [id]);

    const formattedRecipe = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image_url ? `${req.protocol}://${req.get('host')}/${recipe.image_url}` : null,
      author: {
        username: recipe.author_username,
        name: `${recipe.first_name} ${recipe.last_name}`,
        role: recipe.author_role,
        isVerified: recipe.is_verified,
        bio: recipe.author_bio
      },
      cookTime: recipe.cook_time,
      prepTime: recipe.prep_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty_level,
      category: recipe.category,
      cuisine: recipe.cuisine,
      tags: recipe.tags ? recipe.tags.split(',') : [],
      nutritionInfo: recipe.nutrition_info ? JSON.parse(recipe.nutrition_info) : null,
      ingredients: ingredients.map(ing => ({
        id: ing.id,
        name: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes
      })),
      instructions: instructions.map(inst => ({
        id: inst.id,
        stepNumber: inst.step_number,
        instruction: inst.instruction_text,
        duration: inst.duration_minutes,
        tips: inst.tips
      })),
      likes: recipe.likes_count,
      commentsCount: recipe.comments_count,
      comments: comments.map(comment => ({
        id: comment.id,
        text: comment.comment_text,
        rating: comment.rating,
        author: {
          username: comment.username,
          name: `${comment.first_name} ${comment.last_name}`,
          role: comment.user_type
        },
        createdAt: comment.created_at
      })),
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at
    };

    res.json({
      success: true,
      recipe: formattedRecipe
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/recipes', authenticateToken, upload.single('image'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const {
      title,
      description,
      category,
      cuisine,
      difficulty,
      cookTime,
      prepTime,
      servings,
      tags,
      ingredients,
      instructions,
      nutritionInfo
    } = JSON.parse(req.body.data);

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `uploads/${req.file.filename}`;
    }

    const [recipeResult] = await connection.execute(`
      INSERT INTO recipes (
        user_id, title, description, category, cuisine, difficulty_level,
        cook_time, prep_time, servings, tags, image_url, nutrition_info, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      title,
      description,
      category,
      cuisine || null,
      difficulty || 'Medium',
      cookTime || null,
      prepTime || null,
      servings || null,
      tags || null,
      imageUrl,
      nutritionInfo ? JSON.stringify(nutritionInfo) : null,
      1
    ]);

    const recipeId = recipeResult.insertId;

    if (ingredients && Array.isArray(ingredients)) {
      for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        await connection.execute(`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes, order_index)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          recipeId,
          ingredient.name,
          ingredient.quantity || null,
          ingredient.unit || null,
          ingredient.notes || null,
          i + 1
        ]);
      }
    }

    if (instructions && Array.isArray(instructions)) {
      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];
        await connection.execute(`
          INSERT INTO recipe_instructions (recipe_id, step_number, instruction_text, duration_minutes, tips)
          VALUES (?, ?, ?, ?, ?)
        `, [
          recipeId,
          i + 1,
          instruction.text,
          instruction.duration || null,
          instruction.tips || null
        ]);
      }
    }

    await connection.execute(
      'UPDATE users SET recipes_count = recipes_count + 1 WHERE id = ?',
      [req.user.id]
    );

    await connection.commit();

    const [newRecipe] = await connection.execute(`
      SELECT 
        r.*,
        u.username as author_username,
        u.first_name,
        u.last_name,
        u.user_type as author_role
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [recipeId]);

    const recipe = newRecipe[0];

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      recipe: {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image: recipe.image_url ? `${req.protocol}://${req.get('host')}/${recipe.image_url}` : null,
        author: `${recipe.first_name} ${recipe.last_name}`,
        authorRole: recipe.author_role,
        category: recipe.category,
        difficulty: recipe.difficulty_level,
        cookTime: recipe.cook_time,
        likes: 0,
        createdAt: recipe.created_at
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
});

app.put('/api/recipes/:id', authenticateToken, upload.single('image'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      title,
      description,
      category,
      cuisine,
      difficulty,
      cookTime,
      prepTime,
      servings,
      tags,
      ingredients,
      instructions,
      nutritionInfo
    } = JSON.parse(req.body.data);

    const [recipeCheck] = await connection.execute(
      'SELECT user_id, image_url FROM recipes WHERE id = ?',
      [id]
    );

    if (recipeCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    if (recipeCheck[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to edit this recipe'
      });
    }

    let imageUrl = recipeCheck[0].image_url;
    if (req.file) {
      if (imageUrl) {
        fs.unlinkSync(path.join(__dirname, imageUrl));
      }
      imageUrl = `uploads/${req.file.filename}`;
    }

    await connection.execute(`
      UPDATE recipes SET
        title = ?,
        description = ?,
        category = ?,
        cuisine = ?,
        difficulty_level = ?,
        cook_time = ?,
        prep_time = ?,
        servings = ?,
        tags = ?,
        image_url = ?,
        nutrition_info = ?,
        updated_at = NOW()
      WHERE id = ?
    `, [
      title,
      description,
      category,
      cuisine || null,
      difficulty || 'Medium',
      cookTime || null,
      prepTime || null,
      servings || null,
      tags || null,
      imageUrl,
      nutritionInfo ? JSON.stringify(nutritionInfo) : null,
      id
    ]);

    await connection.execute(
      'DELETE FROM recipe_ingredients WHERE recipe_id = ?',
      [id]
    );

    if (ingredients && Array.isArray(ingredients)) {
      for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        await connection.execute(`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes, order_index)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          id,
          ingredient.name,
          ingredient.quantity || null,
          ingredient.unit || null,
          ingredient.notes || null,
          i + 1
        ]);
      }
    }

    await connection.execute(
      'DELETE FROM recipe_instructions WHERE recipe_id = ?',
      [id]
    );

    if (instructions && Array.isArray(instructions)) {
      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];
        await connection.execute(`
          INSERT INTO recipe_instructions (recipe_id, step_number, instruction_text, duration_minutes, tips)
          VALUES (?, ?, ?, ?, ?)
        `, [
          id,
          i + 1,
          instruction.text,
          instruction.duration || null,
          instruction.tips || null
        ]);
      }
    }

    await connection.commit();

    const [updatedRecipe] = await connection.execute(`
      SELECT 
        r.*,
        u.username as author_username,
        u.first_name,
        u.last_name,
        u.user_type as author_role
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [id]);

    const recipe = updatedRecipe[0];

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      recipe: {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image: recipe.image_url ? `${req.protocol}://${req.get('host')}/${recipe.image_url}` : null,
        author: `${recipe.first_name} ${recipe.last_name}`,
        authorRole: recipe.author_role,
        category: recipe.category,
        difficulty: recipe.difficulty_level,
        cookTime: recipe.cook_time,
        createdAt: recipe.created_at,
        updatedAt: recipe.updated_at
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Update recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
});

app.delete('/api/recipes/:id', authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { id } = req.params;

    const [recipeCheck] = await connection.execute(
      'SELECT user_id, image_url FROM recipes WHERE id = ?',
      [id]
    );

    if (recipeCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    if (recipeCheck[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this recipe'
      });
    }

    if (recipeCheck[0].image_url) {
      fs.unlinkSync(path.join(__dirname, recipeCheck[0].image_url));
    }

    await connection.execute('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [id]);
    await connection.execute('DELETE FROM recipe_instructions WHERE recipe_id = ?', [id]);
    await connection.execute('DELETE FROM recipe_likes WHERE recipe_id = ?', [id]);
    await connection.execute('DELETE FROM recipe_comments WHERE recipe_id = ?', [id]);
    await connection.execute('DELETE FROM saved_recipes WHERE recipe_id = ?', [id]);
    await connection.execute('DELETE FROM recipes WHERE id = ?', [id]);

    await connection.execute(
      'UPDATE users SET recipes_count = recipes_count - 1 WHERE id = ?',
      [req.user.id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });

  } catch (error) {
    await connection.rollback();
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
});

app.get('/api/recipes/user/my-recipes', authenticateToken, async (req, res) => {
  try {
    // Ensure we always return JSON, even for errors
    res.setHeader('Content-Type', 'application/json');
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const [recipes] = await pool.execute(`
      SELECT 
        r.*,
        u.username as author_username,
        u.first_name,
        u.last_name,
        u.user_type as author_role
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [req.user.id]);

    const formattedRecipes = recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image_url ? `${req.protocol}://${req.get('host')}/${recipe.image_url}` : null,
      author: {
        username: recipe.author_username,
        name: `${recipe.first_name} ${recipe.last_name}`,
        role: recipe.author_role
      },
      cookTime: recipe.cook_time,
      prepTime: recipe.prep_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty_level,
      category: recipe.category,
      cuisine: recipe.cuisine,
      tags: recipe.tags ? recipe.tags.split(',') : [],
      nutritionInfo: recipe.nutrition_info ? JSON.parse(recipe.nutrition_info) : null,
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at,
      isPublished: recipe.is_published
    }));

    res.json({
      success: true,
      recipes: formattedRecipes,
      total: formattedRecipes.length
    });

  } catch (error) {
    console.error('Get user recipes error:', error);
    
    // Ensure we return JSON even for server errors
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Edit Recipe Endpoint
app.put('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    
    const recipeId = req.params.id;
    const userId = req.user.id;
    
    // Validate recipe ownership
    const [ownerCheck] = await pool.execute(
      'SELECT user_id FROM recipes WHERE id = ?',
      [recipeId]
    );
    
    if (ownerCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    if (ownerCheck[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this recipe'
      });
    }
    
    const {
      title,
      description,
      category,
      cuisine,
      difficulty_level,
      cook_time,
      prep_time,
      servings,
      tags,
      image_url,
      nutrition_info,
      is_published,
      ingredients,
      instructions
    } = req.body;
    
    // Update recipe
    await pool.execute(`
      UPDATE recipes SET
        title = ?,
        description = ?,
        category = ?,
        cuisine = ?,
        difficulty_level = ?,
        cook_time = ?,
        prep_time = ?,
        servings = ?,
        tags = ?,
        image_url = ?,
        nutrition_info = ?,
        is_published = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title,
      description,
      category,
      cuisine,
      difficulty_level,
      cook_time,
      prep_time,
      servings,
      tags,
      image_url,
      nutrition_info ? JSON.stringify(nutrition_info) : null,
      is_published,
      recipeId
    ]);
    
    // Update ingredients if provided
    if (ingredients && Array.isArray(ingredients)) {
      // Delete existing ingredients
      await pool.execute('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [recipeId]);
      
      // Insert new ingredients
      for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        await pool.execute(`
          INSERT INTO recipe_ingredients 
          (recipe_id, ingredient_name, quantity, unit, notes, order_index)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          recipeId,
          ingredient.name,
          ingredient.quantity,
          ingredient.unit,
          ingredient.notes,
          i + 1
        ]);
      }
    }
    
    // Update instructions if provided
    if (instructions && Array.isArray(instructions)) {
      // Delete existing instructions
      await pool.execute('DELETE FROM recipe_instructions WHERE recipe_id = ?', [recipeId]);
      
      // Insert new instructions
      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];
        await pool.execute(`
          INSERT INTO recipe_instructions 
          (recipe_id, step_number, instruction_text, duration_minutes, tips)
          VALUES (?, ?, ?, ?, ?)
        `, [
          recipeId,
          i + 1,
          instruction.text,
          instruction.duration,
          instruction.tips
        ]);
      }
    }
    
    res.json({
      success: true,
      message: 'Recipe updated successfully'
    });
    
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete Recipe Endpoint
app.delete('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    
    const recipeId = req.params.id;
    const userId = req.user.id;
    
    // Validate recipe ownership
    const [ownerCheck] = await pool.execute(
      'SELECT user_id FROM recipes WHERE id = ?',
      [recipeId]
    );
    
    if (ownerCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    if (ownerCheck[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this recipe'
      });
    }
    
    // Delete recipe (cascading deletes will handle related tables)
    await pool.execute('DELETE FROM recipes WHERE id = ?', [recipeId]);
    
    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get Single Recipe for Editing
app.get('/api/recipes/:id/edit', authenticateToken, async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    
    const recipeId = req.params.id;
    const userId = req.user.id;
    
    // Get recipe with ownership check
    const [recipes] = await pool.execute(`
      SELECT r.*, u.username, u.first_name, u.last_name
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ? AND r.user_id = ?
    `, [recipeId, userId]);
    
    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found or not authorized'
      });
    }
    
    const recipe = recipes[0];
    
    // Get ingredients
    const [ingredients] = await pool.execute(`
      SELECT ingredient_name, quantity, unit, notes
      FROM recipe_ingredients
      WHERE recipe_id = ?
      ORDER BY order_index
    `, [recipeId]);
    
    // Get instructions
    const [instructions] = await pool.execute(`
      SELECT step_number, instruction_text, duration_minutes, tips
      FROM recipe_instructions
      WHERE recipe_id = ?
      ORDER BY step_number
    `, [recipeId]);
    
    const formattedRecipe = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      cuisine: recipe.cuisine,
      difficulty_level: recipe.difficulty_level,
      cook_time: recipe.cook_time,
      prep_time: recipe.prep_time,
      servings: recipe.servings,
      tags: recipe.tags ? recipe.tags.split(',') : [],
      image_url: recipe.image_url,
      nutrition_info: recipe.nutrition_info ? JSON.parse(recipe.nutrition_info) : null,
      is_published: recipe.is_published,
      ingredients: ingredients.map(ing => ({
        name: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes
      })),
      instructions: instructions.map(inst => ({
        step: inst.step_number,
        text: inst.instruction_text,
        duration: inst.duration_minutes,
        tips: inst.tips
      })),
      author: {
        username: recipe.username,
        name: `${recipe.first_name} ${recipe.last_name}`
      },
      created_at: recipe.created_at,
      updated_at: recipe.updated_at
    };
    
    res.json({
      success: true,
      recipe: formattedRecipe
    });
    
  } catch (error) {
    console.error('Get recipe for edit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
// Also make sure your authenticateToken middleware returns JSON errors

// DELETE recipe endpoint
app.delete('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    
    // First check if the recipe exists and belongs to the user
    const [existingRecipe] = await pool.execute(
      'SELECT id, user_id, image_url FROM recipes WHERE id = ?',
      [recipeId]
    );
    
    if (existingRecipe.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    // Check if the recipe belongs to the current user
    if (existingRecipe[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own recipes'
      });
    }
    
    // Delete the recipe from database
    const [deleteResult] = await pool.execute(
      'DELETE FROM recipes WHERE id = ? AND user_id = ?',
      [recipeId, req.user.id]
    );
    
    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found or could not be deleted'
      });
    }
    
    // Optional: Delete image file if it exists
    if (existingRecipe[0].image_url) {
      const fs = require('fs');
      const path = require('path');
      const imagePath = path.join(__dirname, existingRecipe[0].image_url);
      
      fs.unlink(imagePath, (err) => {
        if (err) console.log('Could not delete image file:', err);
      });
    }
    
    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting recipe'
    });
  }
});

// UPDATE recipe endpoint
app.put('/api/recipes/:id', authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    const {
      title,
      description,
      category,
      cuisine,
      difficulty_level,
      cook_time,
      prep_time,
      servings,
      tags,
      nutrition_info,
      is_published
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }
    
    // Check if recipe exists and belongs to user
    const [existingRecipe] = await pool.execute(
      'SELECT id, user_id FROM recipes WHERE id = ?',
      [recipeId]
    );
    
    if (existingRecipe.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }
    
    if (existingRecipe[0].user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own recipes'
      });
    }
    
    // Process tags (convert array to comma-separated string if needed)
    const processedTags = Array.isArray(tags) ? tags.join(',') : tags;
    
    // Process nutrition info (stringify if it's an object)
    const processedNutritionInfo = typeof nutrition_info === 'object' 
      ? JSON.stringify(nutrition_info) 
      : nutrition_info;
    
    // Update the recipe
    const [updateResult] = await pool.execute(`
      UPDATE recipes SET 
        title = ?,
        description = ?,
        category = ?,
        cuisine = ?,
        difficulty_level = ?,
        cook_time = ?,
        prep_time = ?,
        servings = ?,
        tags = ?,
        nutrition_info = ?,
        is_published = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [
      title,
      description,
      category,
      cuisine || null,
      difficulty_level || 'Medium',
      cook_time || null,
      prep_time || null,
      servings || null,
      processedTags || null,
      processedNutritionInfo || null,
      is_published !== undefined ? is_published : 1,
      recipeId,
      req.user.id
    ]);
    
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found or could not be updated'
      });
    }
    
    // Fetch the updated recipe to return it
    const [updatedRecipe] = await pool.execute(`
      SELECT 
        r.*,
        u.username as author_username,
        u.first_name,
        u.last_name,
        u.user_type as author_role
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [recipeId]);
    
    const formattedRecipe = {
      id: updatedRecipe[0].id,
      title: updatedRecipe[0].title,
      description: updatedRecipe[0].description,
      image: updatedRecipe[0].image_url ? `${req.protocol}://${req.get('host')}/${updatedRecipe[0].image_url}` : null,
      author: {
        username: updatedRecipe[0].author_username,
        name: `${updatedRecipe[0].first_name} ${updatedRecipe[0].last_name}`,
        role: updatedRecipe[0].author_role
      },
      cookTime: updatedRecipe[0].cook_time,
      prepTime: updatedRecipe[0].prep_time,
      servings: updatedRecipe[0].servings,
      difficulty: updatedRecipe[0].difficulty_level,
      category: updatedRecipe[0].category,
      cuisine: updatedRecipe[0].cuisine,
      tags: updatedRecipe[0].tags ? updatedRecipe[0].tags.split(',') : [],
      nutritionInfo: updatedRecipe[0].nutrition_info ? JSON.parse(updatedRecipe[0].nutrition_info) : null,
      createdAt: updatedRecipe[0].created_at,
      updatedAt: updatedRecipe[0].updated_at,
      isPublished: updatedRecipe[0].is_published
    };
    
    res.json({
      success: true,
      message: 'Recipe updated successfully',
      recipe: formattedRecipe
    });
    
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating recipe'
    });
  }
});

// GET single recipe for editing
app.get('/api/recipes/:id/edit', authenticateToken, async (req, res) => {
  try {
    const recipeId = req.params.id;
    
    const [recipe] = await pool.execute(`
      SELECT 
        r.*,
        u.username as author_username,
        u.first_name,
        u.last_name,
        u.user_type as author_role
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ? AND r.user_id = ?
    `, [recipeId, req.user.id]);
    
    if (recipe.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found or you do not have permission to edit it'
      });
    }
    
    const formattedRecipe = {
      id: recipe[0].id,
      title: recipe[0].title,
      description: recipe[0].description,
      image: recipe[0].image_url ? `${req.protocol}://${req.get('host')}/${recipe[0].image_url}` : null,
      author: {
        username: recipe[0].author_username,
        name: `${recipe[0].first_name} ${recipe[0].last_name}`,
        role: recipe[0].author_role
      },
      cookTime: recipe[0].cook_time,
      prepTime: recipe[0].prep_time,
      servings: recipe[0].servings,
      difficulty: recipe[0].difficulty_level,
      category: recipe[0].category,
      cuisine: recipe[0].cuisine,
      tags: recipe[0].tags ? recipe[0].tags.split(',') : [],
      nutritionInfo: recipe[0].nutrition_info ? JSON.parse(recipe[0].nutrition_info) : null,
      createdAt: recipe[0].created_at,
      updatedAt: recipe[0].updated_at,
      isPublished: recipe[0].is_published
    };
    
    res.json({
      success: true,
      recipe: formattedRecipe
    });
    
  } catch (error) {
    console.error('Get recipe for edit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
app.get('/api/recipes/saved', authenticateToken, async (req, res) => {
  try {
    const [savedRecipes] = await pool.execute(`
      SELECT 
        r.*,
        u.username as author_username,
        u.first_name,
        u.last_name,
        u.user_type as author_role,
        COUNT(DISTINCT rl.id) as likes_count,
        sr.created_at as saved_at
      FROM saved_recipes sr
      JOIN recipes r ON sr.recipe_id = r.id
      JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_likes rl ON r.id = rl.recipe_id
      WHERE sr.user_id = ? AND r.is_published = 1
      GROUP BY r.id
      ORDER BY sr.created_at DESC
    `, [req.user.id]);

    const formattedRecipes = savedRecipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image_url ? `${req.protocol}://${req.get('host')}/${recipe.image_url}` : null,
      author: `${recipe.first_name} ${recipe.last_name}`,
      authorRole: recipe.author_role,
      cookTime: recipe.cook_time,
      difficulty: recipe.difficulty_level,
      category: recipe.category,
      likes: recipe.likes_count,
      savedAt: recipe.saved_at,
      createdAt: recipe.created_at
    }));

    res.json({
      success: true,
      recipes: formattedRecipes
    });
  } catch (error) {
    console.error('Get saved recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/recipes/:id/toggle-save', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [recipeCheck] = await pool.execute(
      'SELECT id FROM recipes WHERE id = ? AND is_published = 1',
      [id]
    );

    if (recipeCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
      [req.user.id, id]
    );

    let isSaved = false;
    if (existing.length > 0) {
      await pool.execute(
        'DELETE FROM saved_recipes WHERE user_id = ? AND recipe_id = ?',
        [req.user.id, id]
      );
      isSaved = false;
    } else {
      await pool.execute(
        'INSERT INTO saved_recipes (user_id, recipe_id) VALUES (?, ?)',
        [req.user.id, id]
      );
      isSaved = true;
    }

    res.json({
      success: true,
      message: isSaved ? 'Recipe saved successfully' : 'Recipe removed from saved',
      isSaved
    });
  } catch (error) {
    console.error('Toggle save recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/recipes/:id/toggle-like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [recipeCheck] = await pool.execute(
      'SELECT id FROM recipes WHERE id = ? AND is_published = 1',
      [id]
    );

    if (recipeCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const [existing] = await pool.execute(
      'SELECT id FROM recipe_likes WHERE user_id = ? AND recipe_id = ?',
      [req.user.id, id]
    );

    let isLiked = false;
    if (existing.length > 0) {
      await pool.execute(
        'DELETE FROM recipe_likes WHERE user_id = ? AND recipe_id = ?',
        [req.user.id, id]
      );
      isLiked = false;
    } else {
      await pool.execute(
        'INSERT INTO recipe_likes (user_id, recipe_id) VALUES (?, ?)',
        [req.user.id, id]
      );
      isLiked = true;
    }

    const [likeCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM recipe_likes WHERE recipe_id = ?',
      [id]
    );

    res.json({
      success: true,
      message: isLiked ? 'Recipe liked' : 'Recipe unliked',
      isLiked,
      likesCount: likeCount[0].count
    });
  } catch (error) {
    console.error('Toggle like recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

app.post('/api/recipes/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, rating } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required'
      });
    }

    const [recipeCheck] = await pool.execute(
      'SELECT id FROM recipes WHERE id = ? AND is_published = 1',
      [id]
    );

    if (recipeCheck.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO recipe_comments (recipe_id, user_id, comment_text, rating) VALUES (?, ?, ?, ?)',
      [id, req.user.id, comment, rating || null]
    );

    const [newComment] = await pool.execute(`
      SELECT 
        rc.*,
        u.username,
        u.first_name,
        u.last_name,
        u.user_type
      FROM recipe_comments rc
      JOIN users u ON rc.user_id = u.id
      WHERE rc.id = ?
    `, [result.insertId]);

    const formattedComment = {
      id: newComment[0].id,
      text: newComment[0].comment_text,
      rating: newComment[0].rating,
      author: {
        username: newComment[0].username,
        name: `${newComment[0].first_name} ${newComment[0].last_name}`,
        role: newComment[0].user_type
      },
      createdAt: newComment[0].created_at
    };

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: formattedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});
// FIXED: GET single recipe endpoint
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [recipes] = await pool.execute(`
      SELECT 
        r.*,
        u.username as author_username,
        u.first_name,
        u.last_name,
        u.user_type as author_role,
        u.is_verified,
        u.bio as author_bio,
        COUNT(DISTINCT rl.id) as likes_count,
        COUNT(DISTINCT rc.id) as comments_count
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      LEFT JOIN recipe_likes rl ON r.id = rl.recipe_id
      LEFT JOIN recipe_comments rc ON r.id = rc.recipe_id
      WHERE r.id = ? AND r.is_published = 1
      GROUP BY r.id
    `, [id]);

    if (recipes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const recipe = recipes[0];

    const [ingredients] = await pool.execute(
      'SELECT * FROM recipe_ingredients WHERE recipe_id = ? ORDER BY order_index',
      [id]
    );

    const [instructions] = await pool.execute(
      'SELECT * FROM recipe_instructions WHERE recipe_id = ? ORDER BY step_number',
      [id]
    );

    const [comments] = await pool.execute(`
      SELECT 
        rc.*,
        u.username,
        u.first_name,
        u.last_name,
        u.user_type
      FROM recipe_comments rc
      JOIN users u ON rc.user_id = u.id
      WHERE rc.recipe_id = ?
      ORDER BY rc.created_at DESC
      LIMIT 10
    `, [id]);

    const formattedRecipe = {
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image_url ? `${req.protocol}://${req.get('host')}/${recipe.image_url}` : null,
      author: {
        username: recipe.author_username,
        name: `${recipe.first_name} ${recipe.last_name}`,
        role: recipe.author_role,
        isVerified: recipe.is_verified,
        bio: recipe.author_bio
      },
      cookTime: recipe.cook_time,
      prepTime: recipe.prep_time,
      servings: recipe.servings,
      difficulty: recipe.difficulty_level,
      category: recipe.category,
      cuisine: recipe.cuisine,
      tags: recipe.tags ? recipe.tags.split(',') : [],
      nutritionInfo: recipe.nutrition_info ? JSON.parse(recipe.nutrition_info) : null,
      ingredients: ingredients.map(ing => ({
        id: ing.id,
        name: ing.ingredient_name,
        quantity: ing.quantity,
        unit: ing.unit,
        notes: ing.notes
      })),
      instructions: instructions.map(inst => ({
        id: inst.id,
        stepNumber: inst.step_number,
        instruction: inst.instruction_text,
        duration: inst.duration_minutes,
        tips: inst.tips
      })),
      likes: recipe.likes_count,
      commentsCount: recipe.comments_count,
      comments: comments.map(comment => ({
        id: comment.id,
        text: comment.comment_text,
        rating: comment.rating,
        author: {
          username: comment.username,
          name: `${comment.first_name} ${comment.last_name}`,
          role: comment.user_type
        },
        createdAt: comment.created_at
      })),
      createdAt: recipe.created_at,
      updatedAt: recipe.updated_at
    };

    res.json({
      success: true,
      recipe: formattedRecipe
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// FIXED: POST create recipe endpoint
app.post('/api/recipes', authenticateToken, upload.single('image'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    // FIXED: Handle JSON parsing properly
    let data;
    try {
      data = typeof req.body.data === 'string' 
        ? JSON.parse(req.body.data) 
        : req.body.data || req.body;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON data format'
      });
    }

    const {
      title,
      description,
      category,
      cuisine,
      difficulty,
      cookTime,
      prepTime,
      servings,
      tags,
      ingredients,
      instructions,
      nutritionInfo
    } = data;

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `uploads/${req.file.filename}`;
    }

    const [recipeResult] = await connection.execute(`
      INSERT INTO recipes (
        user_id, title, description, category, cuisine, difficulty_level,
        cook_time, prep_time, servings, tags, image_url, nutrition_info, is_published
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      title,
      description,
      category,
      cuisine || null,
      difficulty || 'Medium',
      cookTime || null,
      prepTime || null,
      servings || null,
      tags || null,
      imageUrl,
      nutritionInfo ? JSON.stringify(nutritionInfo) : null,
      1
    ]);

    const recipeId = recipeResult.insertId;

    if (ingredients && Array.isArray(ingredients)) {
      for (let i = 0; i < ingredients.length; i++) {
        const ingredient = ingredients[i];
        await connection.execute(`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit, notes, order_index)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          recipeId,
          ingredient.name,
          ingredient.quantity || null,
          ingredient.unit || null,
          ingredient.notes || null,
          i + 1
        ]);
      }
    }

    if (instructions && Array.isArray(instructions)) {
      for (let i = 0; i < instructions.length; i++) {
        const instruction = instructions[i];
        await connection.execute(`
          INSERT INTO recipe_instructions (recipe_id, step_number, instruction_text, duration_minutes, tips)
          VALUES (?, ?, ?, ?, ?)
        `, [
          recipeId,
          i + 1,
          instruction.text,
          instruction.duration || null,
          instruction.tips || null
        ]);
      }
    }

    await connection.execute(
      'UPDATE users SET recipes_count = recipes_count + 1 WHERE id = ?',
      [req.user.id]
    );

    await connection.commit();

    const [newRecipe] = await connection.execute(`
      SELECT 
        r.*,
        u.username as author_username,
        u.first_name,
        u.last_name,
        u.user_type as author_role
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `, [recipeId]);

    const recipe = newRecipe[0];

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      recipe: {
        id: recipe.id,
        title: recipe.title,
        description: recipe.description,
        image: recipe.image_url ? `${req.protocol}://${req.get('host')}/${recipe.image_url}` : null,
        author: `${recipe.first_name} ${recipe.last_name}`,
        authorRole: recipe.author_role,
        category: recipe.category,
        difficulty: recipe.difficulty_level,
        cookTime: recipe.cook_time,
        likes: 0,
        createdAt: recipe.created_at
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Create recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
});



// WORKING SOLUTION - Using same GROUP BY pattern as your working single recipe endpoint
app.get('/api/recipes', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    
    console.log('Pagination params:', { page, limit, offset });
    
    // Use query() instead of execute() to avoid parameter binding issues
    const [recipes] = await pool.query(
      `SELECT 
        r.id,
        r.title,
        r.description,
        r.category,
        r.cuisine,
        r.difficulty_level,
        r.cook_time,
        r.prep_time,
        r.servings,
        r.tags,
        r.image_url,
        r.created_at,
        u.username,
        u.first_name,
        u.last_name
      FROM recipes r
      JOIN users u ON r.user_id = u.id
      WHERE r.is_published = 1
      ORDER BY r.created_at DESC 
      LIMIT ${limit} OFFSET ${offset}`
    );

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM recipes WHERE is_published = 1`
    );

    const totalRecipes = countResult[0].total;
    const totalPages = Math.ceil(totalRecipes / limit);

    // Format response
    const formattedRecipes = recipes.map(recipe => ({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      category: recipe.category,
      cuisine: recipe.cuisine,
      difficulty: recipe.difficulty_level,
      cookTime: recipe.cook_time,
      prepTime: recipe.prep_time,
      servings: recipe.servings,
      tags: recipe.tags ? recipe.tags.split(',') : [],
      image: recipe.image_url,
      author: {
        username: recipe.username,
        name: `${recipe.first_name || ''} ${recipe.last_name || ''}`.trim()
      },
      createdAt: recipe.created_at
    }));

    res.json({
      success: true,
      recipes: formattedRecipes,
      pagination: {
        page,
        limit,
        total: totalRecipes,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});