import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { name: "Home", path: "/home" },
    { name: "Add Recipe", path: "/add-recipe" },
    { name: "Login", path: "/login" },
    { name: "Sign Up", path: "/signup" },
  ];

  return (
    <>
      <nav className="bg-black w-full fixed top-0 left-0 right-0 z-50">
        {/* Gradient line */}
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="flex justify-between items-center py-4 px-6 w-full backdrop-blur-sm bg-black/90">
          <div className="lg:hidden"></div>
          {/* Desktop Menu with increased spacing */}
          <div className="hidden lg:flex w-full justify-center">
            <ul className="text-white flex gap-x-15 font-light tracking-wide text-lg">
              {menuItems.map((item) => (
                <li key={item.name} className="relative py-2 group">
                  <Link
                    to={item.path}
                    className="inline-block relative no-underline transform transition-transform duration-300 group-hover:-translate-y-0.5"
                  >
                    <span className="absolute -left-4 top-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-1/2" />
                    <span className="relative z-10">
                      {item.name}
                      <span className="absolute bottom-[-6px] left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300 -translate-x-1/2 group-hover:left-0 group-hover:translate-x-0" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hamburger Icon for mobile */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="relative w-8 h-8 focus:outline-none group"
              aria-label="Toggle Menu"
            >
              <div className="relative flex overflow-hidden items-center justify-center w-full h-full transform transition-all duration-200">
                <div className={`flex flex-col justify-between w-6 h-4 transform transition-all duration-300 ${isOpen ? 'rotate-90' : ''}`}>
                  <span className={`bg-gradient-to-r from-blue-500 to-purple-500 h-0.5 w-6 transform transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                  <span className={`bg-gradient-to-r from-purple-500 to-pink-500 h-0.5 w-6 transform transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                  <span className={`bg-gradient-to-r from-pink-500 to-blue-500 h-0.5 w-6 transform transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden flex justify-center items-center bg-black/90 backdrop-blur-sm w-full overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
          <ul className="text-white flex flex-col gap-y-6 font-light tracking-wide text-lg">
            {menuItems.map((item, index) => (
              <li
                key={item.name}
                className="relative py-2 group"
                style={{
                  animation: isOpen ? `slideIn 0.4s ease-out ${index * 0.1}s forwards` : 'none',
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                <Link to={item.path} className="inline-block relative no-underline">
                  <span className="relative">
                    {item.name}
                    <span className="absolute bottom-[-6px] left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300 -translate-x-1/2 group-hover:left-0 group-hover:translate-x-0" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <div className="h-[73px]" />
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
