CREATE DATABASE recipe;
use recipe;

CREATE TABLE user (
    user_id  INT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(255) NULL,
    username VARCHAR(100) NOT NULL,
    password VARCHAR(100) NOT NULL,
    CONSTRAINT username UNIQUE (username)
);

CREATE TABLE category (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT NULL
);

-- "ADMIN" is a subtype of user
CREATE TABLE admin (
    user_id    INT NOT NULL PRIMARY KEY,
    admin_rank INT NULL,
    CONSTRAINT admin_ibfk_1 FOREIGN KEY (user_id) REFERENCES user (user_id)
);

-- "CUSTOMER" is a subtype of user
CREATE TABLE customer (
    user_id       INT NOT NULL PRIMARY KEY,
    loyalty_level INT NULL,
    CONSTRAINT customer_ibfk_1 FOREIGN KEY (user_id) REFERENCES user (user_id)
);

CREATE TABLE recipe (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(255) NOT NULL,
    steps     TEXT NULL,
    user_id   INT NULL,
    CONSTRAINT fk_user_recipe
        FOREIGN KEY (user_id) REFERENCES user (user_id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE ingredient (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    amount        VARCHAR(50)  NULL,   -- e.g. "2 cups", "3 tbsp"
    type          VARCHAR(50)  NULL,   -- e.g. "spice"
    recipe_id     INT NOT NULL,
    CONSTRAINT ingredient_ibfk_1 FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id)
);

-- ====================================== -- 3. RATING, COMMENTS, PHOTO -- ======================================

CREATE TABLE rating (
    rating_id    INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id    INT NOT NULL,
    user_id      INT NOT NULL,
    rating_value INT NOT NULL,
    CONSTRAINT recipe_id UNIQUE (recipe_id, user_id),
    CONSTRAINT rating_ibfk_1 FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id),
    CONSTRAINT rating_ibfk_2 FOREIGN KEY (user_id) REFERENCES user (user_id)
);

CREATE TABLE comments (
    comment_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id  INT NOT NULL,
    user_id    INT NOT NULL,
    title      VARCHAR(255) NULL,
    text       TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT comments_ibfk_1 FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id) ON DELETE CASCADE,
    CONSTRAINT comments_ibfk_2 FOREIGN KEY (user_id) REFERENCES user (user_id)
);

CREATE TABLE photo (
    photo_id   INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id  INT NOT NULL,
    name       VARCHAR(255) NOT NULL,  -- filename or URL
    caption    TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
    CONSTRAINT photo_ibfk_1 FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id) ON DELETE CASCADE
);

-- ====================================== -- 4. Relationship Tables -- ======================================

-- SUBMITS:  many-to-many between user and recipe
CREATE TABLE submits (
    user_id     INT NOT NULL,
    recipe_id   INT NOT NULL,
    submit_date DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
    PRIMARY KEY (user_id, recipe_id),
    CONSTRAINT submits_ibfk_1 FOREIGN KEY (user_id) REFERENCES user (user_id),
    CONSTRAINT submits_ibfk_2 FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id)
);

-- BelongsTo:  many-to-many between recipe and category
CREATE TABLE belongs_to (
    category_id INT NOT NULL,
    recipe_id   INT NOT NULL,
    PRIMARY KEY (category_id, recipe_id),
    CONSTRAINT belongs_to_ibfk_1 FOREIGN KEY (category_id) REFERENCES category (category_id) ON DELETE CASCADE,
    CONSTRAINT belongs_to_ibfk_2 FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id) ON DELETE CASCADE
);

-- Likes/Dislikes:  many-to-many between user and recipe, plus boolean or enum
CREATE TABLE likes_dislikes (
    user_id   INT NOT NULL,
    recipe_id INT NOT NULL,
    liked     TINYINT(1) NULL,  -- TRUE = like, FALSE = dislike
    PRIMARY KEY (user_id, recipe_id),
    CONSTRAINT likes_dislikes_ibfk_1 FOREIGN KEY (user_id) REFERENCES user (user_id),
    CONSTRAINT likes_dislikes_ibfk_2 FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id) ON DELETE CASCADE
);

CREATE TABLE admin_removes_rating (
    admin_id    INT NOT NULL,   -- same as user_id in ADMIN
    rating_id   INT NOT NULL,
    remove_time DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
    PRIMARY KEY (admin_id, rating_id),
    CONSTRAINT admin_removes_rating_ibfk_1 FOREIGN KEY (admin_id) REFERENCES admin (user_id),
    CONSTRAINT admin_removes_rating_ibfk_2 FOREIGN KEY (rating_id) REFERENCES rating (rating_id)
);

-- ======================================
-- OPTIMIZATION: Add indexes for performance
-- ======================================

-- For sorting/filtering recipes
CREATE INDEX idx_recipes_id ON recipe (recipe_id);

-- For username lookups during authentication
CREATE INDEX idx_user_username ON user (username);

-- For comment-related queries
CREATE INDEX idx_comments_recipe ON comments (recipe_id);
CREATE INDEX idx_comments_user ON comments (user_id);

-- For rating aggregations
CREATE INDEX idx_ratings_recipe ON rating (recipe_id);
CREATE INDEX user_id ON rating (user_id);

-- For likes/dislikes performance
CREATE INDEX idx_likes_dislikes_recipe ON likes_dislikes (recipe_id);
CREATE INDEX idx_likes_dislikes_user ON likes_dislikes (user_id);

-- For ingredient queries
CREATE INDEX idx_ingredients_recipe ON ingredient (recipe_id);

-- For photo loading
CREATE INDEX idx_photos_recipe ON photo (recipe_id);

-- For category relationships
CREATE INDEX idx_belongs_to_recipe ON belongs_to (recipe_id);
CREATE INDEX idx_belongs_to_category ON belongs_to (category_id);

-- For admin removes rating
CREATE INDEX rating_id ON admin_removes_rating (rating_id);

-- For submits relationship
CREATE INDEX recipe_id ON submits (recipe_id);

-- Category data population
INSERT INTO category (name, description) VALUES
    ('Breakfast',  NULL),
    ('Lunch',      NULL),
    ('Dinner',     NULL),
    ('Dessert',    NULL),
    ('Snack',      NULL),
    ('Appetizer',  NULL),
    ('Beverage',   NULL),
    ('Other',      NULL);