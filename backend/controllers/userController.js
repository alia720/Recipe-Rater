import pool from '../db.js';

/**
 * Register a new user.
 * If "isAdmin" is true in the request body, also creates an admin record.
 */
export const registerUser = async (req, res) => {
  const { name, username, password, isAdmin, adminRank } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Insert into the user table
    const [result] = await pool.query(
      "INSERT INTO user (name, username, password) VALUES (?, ?, ?)",
      [name, username, password]
    );
    
    const userId = result.insertId;

    if (isAdmin) {
      await pool.query(
        "INSERT INTO admin (user_id, admin_rank) VALUES (?, ?)",
        [userId, adminRank || 1]
      );
    }

    // Determine role (similar to loginUser)
    let role = 'user';
    if (isAdmin) {
      role = 'admin';
    }

    // Set up the session just like in loginUser
    req.session.user = {
      user_id: userId,
      name: name,
      role
    };

    res.status(201).json({ 
      message: 'User registered successfully',
      user: req.session.user 
    });
  } catch (error) {
    console.error('Error registering user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Log in a user.
 * Checks credentials against the user table and sets a session.
 */
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM user WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    // For simplicity, we compare plain-text passwords.
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Determine if the user is an admin by checking the admin table.
    const [adminRows] = await pool.query(
      "SELECT * FROM admin WHERE user_id = ?",
      [user.user_id]
    );
    const role = adminRows.length > 0 ? 'admin' : 'user';

    // Set the session with minimal user info.
    req.session.user = {
      user_id: user.user_id,
      username: user.username,
      name: user.name,
      role
    };

    res.json({ message: 'Login successful', user: req.session.user });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Log out the current user by destroying the session.
 */
export const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json({ message: 'Logout successful' });
  });
};

/**
 * Return the current user's profile based on the session.
 */
export const getProfile = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
};
