import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RecipeDetail from "./pages/RecipeDetail";
import AddRecipe from "./pages/AddRecipe";
import Profile from "./pages/Profile";
import EditRecipe from "./pages/EditRecipe";
import DeleteRecipe from "./pages/DeleteRecipe";
import "./index.css";
import { UserProvider } from './context/UserContext';

const isAuthenticated = false;

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* If not authenticated, show the sign up page by default */}
          <Route path="/" element={!isAuthenticated ? <Signup /> : <Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/home" element={<Home />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/add-recipe" element={<AddRecipe />} />
          <Route path="/recipe/edit/:recipeId" element={<EditRecipe />} />
          <Route path="/recipe/delete/:recipeId" element={<DeleteRecipe />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
