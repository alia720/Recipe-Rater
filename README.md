# Recipe Management System

A full-stack web application for managing recipes, built with React and Node.js. This project allows users to browse, create, and manage recipes with features like ratings, comments, and photo uploads.

## Features

- User Authentication (Admin and Customer roles)
- Recipe Management (Create, Read, Update, Delete)
- Ingredient Management
- Rating and Comment System
- Photo Upload for Recipes
- Category-based Recipe Organization
- Like/Dislike System
- Admin Dashboard for Content Moderation

## Tech Stack

### Frontend
- React.js
- TailwindCSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- MySQL
- JWT Authentication
- CORS

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/CPSC471-Recipe-Proj.git
cd CPSC471-Recipe-Proj
```

2. Install Frontend Dependencies:
```bash
cd frontend
npm install
```

3. Install Backend Dependencies:
```bash
cd ../backend
npm install
```

4. Set up environment variables:
   Create a `.env` file in the backend directory with the following variables:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_DATABASE=recipe_db
JWT_SECRET=your_jwt_secret
PORT=5000
```

5. Set up the database:
   - Create a MySQL database named `recipe_db`
   - Import the database schema

## Running the Application

1. Start the Backend Server:
   ```bash
   cd backend
   node index.js
   ```
   The server will run on http://localhost:5000

2. Start the Frontend Development Server:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on http://localhost:5173



## API Endpoints

### Authentication
- POST /api/customers/login - Customer login
- POST /api/admins/login - Admin login

### Recipes
- GET /api/recipes - Get all recipes
- GET /api/recipes/:id - Get recipe by ID
- POST /api/recipes - Create new recipe
- PUT /api/recipes/:id - Update recipe
- DELETE /api/recipes/:id - Delete recipe

### Categories
- GET /api/categories - Get all categories
- POST /api/categories - Create new category

### Ratings and Comments
- POST /api/ratings - Add rating to recipe
- POST /api/comments - Add comment to recipe
- GET /api/ratings/:recipeId - Get ratings for recipe
- GET /api/comments/:recipeId - Get comments for recipe

## Project Structure

```
CPSC471-Recipe-Proj/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.tsx         # Main application component
│   └── package.json
├── backend/                 # Node.js backend application
│   ├── routes/             # API routes
│   ├── models/             # Database models
│   ├── config/             # Configuration files
│   └── index.js            # Server entry point
└── README.md
```



## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Acknowledgments

Special thanks to all contributors, including [Name 1], [Name 2], and [Name 3].
