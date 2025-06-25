-- Create database
CREATE DATABASE IF NOT EXISTS recipeshare_db;
USE recipeshare_db;
DROP DATABASE users;
-- Users table

select * from users;
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    user_type ENUM('user', 'chef', 'admin') DEFAULT 'user',
    bio TEXT,
    experience VARCHAR(20),
    speciality VARCHAR(50),
    is_verified BOOLEAN DEFAULT FALSE,
    recipes_count INT DEFAULT 0,
    followers_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some dummy data
INSERT INTO users (username, email, password, first_name, last_name, user_type, is_verified) VALUES
('ash', 'ash@gmail.com', '$2b$10$8Zj7QXqZ.VB1Ky7v8L0EWuJdOiGKf5cQVGhS9dHLzNxMrP2tY6eKq', 'Ash', 'Kumar', 'user', TRUE),
('admin', 'admin@example.com', '$2b$10$8Zj7QXqZ.VB1Ky7v8L0EWuJdOiGKf5cQVGhS9dHLzNxMrP2tY6eKq', 'Admin', 'User', 'admin', TRUE),
('chefmaria', 'chef@example.com', '$2b$10$8Zj7QXqZ.VB1Ky7v8L0EWuJdOiGKf5cQVGhS9dHLzNxMrP2tY6eKq', 'Chef', 'Maria', 'chef', TRUE);

-- Update chef with additional details
UPDATE users 
SET bio = 'Professional chef with 15+ years of experience in Italian cuisine', 
    experience = '10+', 
    speciality = 'italian'
WHERE username = 'chefmaria';

-- Optional: Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_user_type ON users(user_type);

-- Note: The passwords above are hashed versions of:
-- ash@gmail.com: '123456'
-- admin@example.com: 'admin123'  
-- chef@example.com: 'chef123'




SELECT * FROM RECIPES;
select * from recipes;
DROP TABLE RECIPES;
-- Updated recipes table schema
CREATE TABLE recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    cuisine VARCHAR(50),
    difficulty_level VARCHAR(20) DEFAULT 'Medium',
    cook_time VARCHAR(20),
    prep_time VARCHAR(20),
    servings INT,
    tags VARCHAR(255),
    image_url VARCHAR(255),
    nutrition_info TEXT,
    is_published TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
DROP TABLE recipe_ingredients;
CREATE TABLE recipe_ingredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_name VARCHAR(100) NOT NULL,
    quantity VARCHAR(50),
    unit VARCHAR(50),
    notes TEXT,
    order_index INT NOT NULL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

DROP TABLE recipe_instructions;

CREATE TABLE recipe_instructions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    step_number INT NOT NULL,
    instruction_text TEXT NOT NULL,
    duration_minutes INT,
    tips TEXT,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
);

DROP TABLE recipe_likes;

SELECT r.id, r.user_id
FROM recipes r
WHERE r.id IN (
  SELECT recipe_id FROM recipe_likes WHERE user_id = 2
);
select * from recipe_likes;
CREATE TABLE recipe_likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (user_id, recipe_id)
);
SELECT id, is_published FROM recipes WHERE id IN (2, 3);

DROP TABLE recipe_comments;

select * from recipe_comments;
CREATE TABLE recipe_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    rating INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

DROP TABLE saved_recipes;

select * from saved_recipes;
CREATE TABLE saved_recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_save (user_id, recipe_id)
);

DROP TABLE followers;
select * from followers;
CREATE TABLE followers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    follower_id INT NOT NULL,
    followed_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (followed_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_follow (follower_id, followed_id)
);