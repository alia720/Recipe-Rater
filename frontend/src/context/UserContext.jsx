// frontend/src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        credentials: "include",
      });
      const data = await res.ok ? await res.json() : null;
      setUser(data?.user || null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);