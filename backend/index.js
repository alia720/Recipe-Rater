// index.js
import express from "express";
import dotenv from "dotenv";
import pool from "./db.js";
import recipeRoutes from "./routes/recipe.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies in requests
app.use(express.json());
app.use('/api/recipes', recipeRoutes);

// A sample route to get all recipes
app.get("/api/recipe", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM recipe");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).json({ error: "Server error" });
  }
});

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


