import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome back! Check out your recipes or add a new one.</p>
      <div className="mt-6">
        <Link
          to="/add-recipe"
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Add Recipe
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
