import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import UserStatus from "./UserStatus";
import SearchResults from "./SearchResults";
import { useUser } from "../context/UserContext";
import { MagnifyingGlassIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

const NavLink = ({ to, children, isMobile = false, onClick = () => {} }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li className={`relative py-2 group ${isMobile ? '' : 'mx-6'}`}>
      <Link
        to={to}
        onClick={onClick}
        className={`inline-block relative no-underline transition-colors duration-200 ${isActive ? 'text-white font-medium' : 'text-gray-300 hover:text-white'}`}
      >
        {isActive && !isMobile && (
          <span className="absolute -left-4 top-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transform -translate-y-1/2 motion-safe:animate-pulse" />
        )}
        <span className="relative z-10">
          {children}
          {!isMobile && (
            <span
              className={`absolute bottom-[-6px] left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-transform duration-300 scale-x-0 group-hover:scale-x-100 ${isActive ? 'scale-x-100' : ''}`}
            />
          )}
        </span>
      </Link>
    </li>
  );
};

const DesktopSearch = ({ onSearchSubmit }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const toggleSearch = useCallback(() => {
    const nextState = !isSearchOpen;
    setIsSearchOpen(nextState);
    if (nextState) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleEscape = (e) => { 
      if (e.key === "Escape" && isSearchOpen) toggleSearch(); 
    };
    const handleClickOutside = (e) => { 
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target) && isSearchOpen
      ) toggleSearch(); 
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, toggleSearch]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      onSearchSubmit(searchQuery);
      toggleSearch();
    }
  };
  const handleCloseResults = useCallback(() => { toggleSearch(); }, [toggleSearch]);

  return (
    <div className="relative hidden lg:flex items-center lg:w-40" ref={searchContainerRef}>
      <button
        onClick={toggleSearch}
        className="flex items-center justify-center w-10 h-10 text-gray-300 hover:text-white transition-all duration-300 hover:scale-110 rounded-full hover:bg-gray-800"
        aria-label={isSearchOpen ? "Close search" : "Open search"}
      >
        {isSearchOpen ? <XMarkIcon className="h-6 w-6" /> : <MagnifyingGlassIcon className="h-6 w-6" />}
      </button>
      <div
        className={`absolute left-0 top-full mt-3 origin-top-left transition-all duration-300 ease-in-out ${
          isSearchOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="relative bg-gray-900 bg-opacity-90 backdrop-blur-md rounded-lg overflow-hidden shadow-xl border border-gray-700 w-80">
          <div className="flex items-center px-4 py-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Search recipes..."
              className="bg-transparent text-white placeholder-gray-500 py-1.5 pl-1 pr-4 w-full focus:outline-none text-base"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />
          </div>
          <div className="h-[1px] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60" />
          {searchQuery && <SearchResults searchQuery={searchQuery} onClose={handleCloseResults} />}
        </div>
      </div>
    </div>
  );
};

const MobileSearch = ({ onSearchSubmit, closeMenu }) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      onSearchSubmit(searchQuery);
      setSearchQuery("");
      closeMenu();
    }
  };
  const handleCloseResults = () => {
    setSearchQuery("");
    closeMenu();
  };

  return (
    <li className="relative py-2 w-full px-4">
      <div className="relative w-full max-w-xs mx-auto">
        <div className="flex items-center bg-gray-800/80 rounded-lg px-3 py-2 border border-gray-700">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search recipes..."
            className="bg-transparent text-white placeholder-gray-500 py-1 pl-1 pr-2 w-full focus:outline-none text-base"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
        </div>
        {searchQuery && (
          <div className="absolute top-full left-0 right-0 mt-2 w-full z-50 max-w-xs mx-auto">
            <div className="bg-gray-900 bg-opacity-95 backdrop-blur-md rounded-lg overflow-hidden shadow-xl border border-gray-700">
              <SearchResults searchQuery={searchQuery} onClose={handleCloseResults} />
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

const MobileMenu = ({ isOpen, items, onSearchSubmit, closeMenu, isHomePage }) => {
  return (
    <div
      className={`absolute top-full left-0 right-0 lg:hidden flex flex-col items-center bg-black/95 backdrop-blur-md w-full shadow-xl transition-all duration-300 ease-in-out border-t border-gray-800 ${
        isOpen ? "max-h-[calc(100vh-var(--navbar-height))] overflow-y-auto opacity-100 visible" 
               : "max-h-0 opacity-0 invisible"
      }`}
      style={{ '--navbar-height': '73px' }}
    >
      <ul className="text-white flex flex-col items-center gap-y-5 font-normal tracking-wide text-lg w-full pt-6 pb-8">
        {isHomePage && <MobileSearch onSearchSubmit={onSearchSubmit} closeMenu={closeMenu} />}
        {items.map((item) => (
          <NavLink key={item.name} to={item.path} isMobile={true} onClick={closeMenu}>
            {item.name}
          </NavLink>
        ))}
        <li className="mt-6 border-t border-gray-700 w-full flex justify-center pt-6 px-4">
          <UserStatus isMobile={true} />
        </li>
      </ul>
    </div>
  );
};

const HamburgerButton = ({ isOpen, onClick }) => (
  <div className="lg:hidden">
    <button 
      onClick={onClick} 
      className="relative w-8 h-8 focus:outline-none group z-50 p-1" 
      aria-label="Toggle Menu" 
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <XMarkIcon className="h-6 w-6 text-white transition-transform duration-300 transform rotate-180" />
      ) : (
        <Bars3Icon className="h-6 w-6 text-white transition-transform duration-300" />
      )}
    </button>
  </div>
);

const Navbar = () => {
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/home';

  const baseMenuItems = [{ name: "Home", path: "/home" }];
  const authMenuItems = [{ name: "Add Recipe", path: "/add-recipe" }];
  const menuItems = [...baseMenuItems, ...(user ? authMenuItems : [])];

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [location, closeMobileMenu]);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleSearchSubmit = useCallback((query) => {
    if (query.trim() !== "") {
      navigate(`/home?query=${encodeURIComponent(query)}`);
      closeMobileMenu();
    }
  }, [navigate, closeMobileMenu]);

  const navbarHeight = 73;

  return (
    <>
      <header className="bg-black w-full fixed top-0 left-0 right-0 z-50 shadow-md">
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div 
          className="flex justify-between items-center h-[calc(var(--navbar-height)-2px)] px-4 md:px-6 w-full backdrop-blur-md bg-black/85 relative" 
          style={{ '--navbar-height': `${navbarHeight}px` }}
        >
          <div className="relative hidden lg:flex items-center lg:w-40">
            {isHomePage ? (
              <DesktopSearch onSearchSubmit={handleSearchSubmit} />
            ) : (
              <div className="w-40" />
            )}
          </div>

          <div className="lg:hidden flex-1"></div>

          <nav className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <ul className="flex text-white gap-x-8 font-normal tracking-wide text-base">
              {menuItems.map((item) => (
                <NavLink key={item.name} to={item.path}>
                  {item.name}
                </NavLink>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <UserStatus />
          </div>

          <HamburgerButton isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />
        </div>

        <MobileMenu
          isOpen={isMobileMenuOpen}
          items={menuItems}
          onSearchSubmit={handleSearchSubmit}
          closeMenu={closeMobileMenu}
          isHomePage={isHomePage}
        />
      </header>
      <div style={{ height: `${navbarHeight}px` }} />
    </>
  );
};

export default Navbar;