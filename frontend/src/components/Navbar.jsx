// TODO: Implement actual working search with the search button/bar


import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import UserStatus from "./UserStatus";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef(null);
  
  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    // Focus the input when search is opened
    if (!isSearchOpen) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  // Close search on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isSearchOpen]);

  const menuItems = [
    { name: "Home", path: "/home" },
    { name: "Add Recipe", path: "/add-recipe" }
  ];

  return (
    <>
      <nav className="bg-black w-full fixed top-0 left-0 right-0 z-50">
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="flex justify-between items-center py-4 px-6 w-full backdrop-blur-sm bg-black/90 relative">
          
          
          {/* Left side: Search icon/bar */}
          <div className="flex items-center lg:w-40">
            <div className="relative">
              <button 
                onClick={toggleSearch}
                className="flex items-center justify-center w-10 h-10 text-white transition-all duration-300 hover:scale-110"
                aria-label="Search"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="26" 
                  height="26" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`transition-opacity duration-300 ${isSearchOpen ? 'opacity-0' : 'opacity-100'}`}
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="26" 
                  height="26" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={`absolute transition-opacity duration-300 ${isSearchOpen ? 'opacity-100' : 'opacity-0'}`}
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>



              {/* Search bar */}
              <div 
                className={`absolute left-0 top-full mt-3 origin-top-left transition-all duration-300 ease-in-out ${
                  isSearchOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="relative bg-black/90 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg border border-gray-800">
                  <div className="flex items-center px-4 py-3">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="22" 
                      height="22" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-gray-400 mr-3"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search recipes..."
                      className="bg-transparent text-white py-1.5 pl-1 pr-12 w-72 focus:outline-none text-lg"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 flex items-center justify-center">
                      <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">⌘K</span>
                    </div>
                  </div>
                  <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
                </div>
              </div>
            </div>
          </div>

          {/* Centered Menu Items */}
          <ul className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 text-white gap-x-15 font-light tracking-wide text-lg">
            {menuItems.map((item) => (
              <li key={item.name} className="relative py-2 group mx-6">
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



          {/* Right side: UserStatus */}
          <div className="hidden lg:flex items-center">
            <UserStatus />
          </div>



          {/* Hamburger Icon for mobile */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="relative w-8 h-8 focus:outline-none group"
              aria-label="Toggle Menu"
            >
              <div className="relative flex overflow-hidden items-center justify-center w-full h-full transform transition-all duration-200">
                <div
                  className={`flex flex-col justify-between w-6 h-4 transform transition-all duration-300 ${
                    isOpen ? "rotate-90" : ""
                  }`}
                >
                  <span
                    className={`bg-gradient-to-r from-blue-500 to-purple-500 h-0.5 w-6 transform transition-all duration-300 ${
                      isOpen ? "rotate-45 translate-y-1.5" : ""
                    }`}
                  />
                  <span
                    className={`bg-gradient-to-r from-purple-500 to-pink-500 h-0.5 w-6 transform transition-all duration-300 ${
                      isOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`bg-gradient-to-r from-pink-500 to-blue-500 h-0.5 w-6 transform transition-all duration-300 ${
                      isOpen ? "-rotate-45 -translate-y-2" : ""
                    }`}
                  />
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden flex flex-col justify-center items-center bg-black/90 backdrop-blur-sm w-full overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 py-4 opacity-100" : "max-h-0 py-0 opacity-0"
          }`}
        >
          <ul className="text-white flex flex-col gap-y-6 font-light tracking-wide text-lg">


            {/* Mobile Search */}
            <li className="relative py-2">
              <div className="relative w-72 mx-auto">
                <div className="flex items-center bg-gray-900/60 rounded-lg px-4 py-3">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="text-gray-400 mr-3"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    className="bg-transparent text-white py-1.5 pl-1 pr-2 w-full focus:outline-none text-lg"
                  />
                </div>
                <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
              </div>
            </li>
            
            {menuItems.map((item, index) => (
              <li
                key={item.name}
                className="relative py-2 group"
                style={{
                  animation: isOpen
                    ? `slideIn 0.4s ease-out ${(index + 1) * 0.1}s forwards`
                    : "none",
                  opacity: 0,
                  transform: "translateY(20px)",
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
            <li className="mt-4">
              <UserStatus />
            </li>
          </ul>
        </div>
      </nav>
      <div className="h-[73px]" />
      <style>{`
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