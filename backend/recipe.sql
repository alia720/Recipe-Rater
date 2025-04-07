CREATE DATABASE recipe;
use recipe;


CREATE TABLE recipe(
                       recipe_id  INT AUTO_INCREMENT PRIMARY KEY,
                       name VARCHAR(255) NOT NULL,
                       steps TEXT
);

CREATE TABLE user(
                     user_id     INT AUTO_INCREMENT PRIMARY KEY,
                     name        VARCHAR(255),
                     username    VARCHAR(100) NOT NULL UNIQUE,
                     password    VARCHAR(100) NOT NULL

);

CREATE TABLE ingredient (
                            ingredient_id   INT AUTO_INCREMENT PRIMARY KEY,
                            name            VARCHAR(255) NOT NULL,
                            amount          VARCHAR(50),   -- e.g. "2 cups", "3 tbsp"
                            type            VARCHAR(50),   -- e.g. "spice",
                            recipe_id       INT NOT NULL,
                            FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id)
);

CREATE TABLE category (
                          category_id INT AUTO_INCREMENT PRIMARY KEY,
                          name        VARCHAR(100) NOT NULL,
                          description TEXT
);
-- "CUSTOMER" is a subtype of user, so user_id references app_user
CREATE TABLE customer (
                          user_id        INT PRIMARY KEY,
                          loyalty_level  INT,
                          FOREIGN KEY (user_id) REFERENCES user(user_id)
);

-- "ADMIN" is another subtype of user
CREATE TABLE admin (
                       user_id    INT PRIMARY KEY,
                       admin_rank INT,
                       FOREIGN KEY (user_id) REFERENCES user(user_id)
);
-- ====================================== -- 3. RATING, COMMENTS, PHOTO -- ======================================

CREATE TABLE rating (
                        rating_id    INT AUTO_INCREMENT PRIMARY KEY,
                        recipe_id    INT NOT NULL,
                        user_id      INT NOT NULL, -- Added user_id to track who rated
                        rating_value INT NOT NULL,
                        FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id),
                        FOREIGN KEY (user_id) REFERENCES user(user_id),
                        UNIQUE (recipe_id, user_id) -- Ensure one rating per user per recipe
);

CREATE TABLE comments (
                          comment_id INT AUTO_INCREMENT PRIMARY KEY,
                          recipe_id  INT NOT NULL,
                          user_id    INT NOT NULL,
                          title      VARCHAR(255),
                          text       TEXT,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                          FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id),
                          FOREIGN KEY (user_id)   REFERENCES user(user_id)
);

CREATE TABLE photo (
                       photo_id  INT AUTO_INCREMENT PRIMARY KEY,
                       recipe_id INT NOT NULL,
                       name      VARCHAR(255) NOT NULL,  --  filename or URL
                       caption   TEXT,
                       FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id)
);
-- ====================================== -- 4. Relationship Tables -- ======================================

-- SUBMITS:  many-to-many between user and recipe
CREATE TABLE submits (
                         user_id   INT NOT NULL,
                         recipe_id INT NOT NULL,
                         submit_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                         PRIMARY KEY (user_id, recipe_id),
                         FOREIGN KEY (user_id)   REFERENCES user(user_id),
                         FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id)
);
-- BelongsTo:  many-to-many between recipe and category
CREATE TABLE belongs_to (
                            category_id INT NOT NULL,
                            recipe_id   INT NOT NULL,
                            PRIMARY KEY (category_id, recipe_id),
                            FOREIGN KEY (category_id) REFERENCES category(category_id),
                            FOREIGN KEY (recipe_id)   REFERENCES recipe(recipe_id)
);
-- Likes/Dislikes:  many-to-many between user and recipe, plus boolean or enum
CREATE TABLE likes_dislikes (
                                user_id   INT NOT NULL,
                                recipe_id INT NOT NULL,
                                liked     BOOLEAN,  -- TRUE = like, FALSE = dislike
                                PRIMARY KEY (user_id, recipe_id),
                                FOREIGN KEY (user_id)   REFERENCES user(user_id),
                                FOREIGN KEY (recipe_id) REFERENCES recipe(recipe_id)
);

CREATE TABLE admin_removes_rating (
                                      admin_id   INT NOT NULL,   -- same as user_id in ADMIN
                                      rating_id  INT NOT NULL,
                                      remove_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                                      PRIMARY KEY (admin_id, rating_id),
                                      FOREIGN KEY (admin_id)  REFERENCES admin(user_id),
                                      FOREIGN KEY (rating_id) REFERENCES rating(rating_id)
);
