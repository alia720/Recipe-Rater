// index.js
import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";
import recipeRoutes from "./routes/recipe.js";
import ingredientRoutes from "./routes/ingredient.js";
import ratingRoutes from "./routes/rating.js";
import commentRoutes from "./routes/comment.js";
import photoRoutes from "./routes/photo.js";
import submitsRoutes from './routes/submits.js';
import belongsToRoutes from './routes/belongsTo.js';
import likesDislikesRoutes from './routes/likesDislikes.js';
import adminRemovesRatingRoutes from './routes/adminRemovesRating.js';
import customerRoutes from './routes/customer.js';
import adminRoutes from './routes/admin.js';
import categoryRoutes from "./routes/category.js";
import userRoutes from './routes/user.js';
import cors from "cors";
import session from "express-session";
import uploadRoutes from './routes/upload.js';
import searchRoutes from './routes/search.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies in requests
app.use(express.json());

// Session middleware
app.use(session({
  secret: "ingredient",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      callback(null, origin);
    },
    credentials: true,
  })
);
app.use('/api/search', searchRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/api/upload', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ingredients', ingredientRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/submits', submitsRoutes);
app.use('/api/belongs-to', belongsToRoutes);
app.use('/api/likes-dislikes', likesDislikesRoutes);
app.use('/api/admin-removes-rating', adminRemovesRatingRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/categories', categoryRoutes);


// A default route
app.get("/", (req, res) => {
  res.send("Welcome to the Recipe API");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// To Run and test, first:
// node index.js

// Then you can:
// go to ur browser and http://localhost:5000/api/recipe

// Im implementing Session-Based Auth so we dont have to deal with the headache of jwt

