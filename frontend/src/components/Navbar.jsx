import React, { useState, useRef, useEffect, useCallback, forwardRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import UserStatus from "./UserStatus"; // Assuming this component exists
import SearchResults from "./SearchResults"; // Assuming this component exists
import { useUser } from "../context/UserContext"; // Assuming this context exists
import { MagnifyingGlassIcon, XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

// --- NavLink Component ---
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

// --- DesktopSearch Component ---
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
      // Only close if clicking outside the search container *while it's open*
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target) && isSearchOpen) {
        toggleSearch();
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside); // Use mousedown for responsiveness
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen, toggleSearch]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      onSearchSubmit(searchQuery);
      toggleSearch(); // Close search after submitting
    }
  };

  // Use useCallback for handleCloseResults passed to SearchResults
  const handleCloseResults = useCallback(() => {
    toggleSearch();
  }, [toggleSearch]);

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
            // Ensure clicks inside the dropdown don't trigger the handleClickOutside listener above
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
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
            {/* Pass searchQuery and onClose */}
            {/* Conditionally render SearchResults only when search is open and query exists */}
            {isSearchOpen && searchQuery && <SearchResults searchQuery={searchQuery} onClose={handleCloseResults} />}
          </div>
        </div>
      </div>
  );
};


// --- MobileSearch Component ---
const MobileSearch = ({ onSearchSubmit, closeMenu }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchContainerRef = useRef(null); // Ref for the search container + results

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && searchQuery.trim() !== "") {
      onSearchSubmit(searchQuery);
      setSearchQuery(""); // Clear query after submit
      closeMenu(); // Close mobile menu
    }
  };

  // Use useCallback for consistency and potential optimization
  const handleCloseResults = useCallback(() => {
    setSearchQuery(""); // Clear query when closing results
    closeMenu(); // Close the mobile menu
  }, [closeMenu]);

  // Effect to handle clicks outside the mobile search input and results
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the search query is active and the click is outside the container
      if (searchQuery && searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSearchQuery(""); // Clear the search query, effectively hiding results
        // We don't call closeMenu() here, as the click might be elsewhere in the open mobile menu
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchQuery]); // Only depends on whether there's a search query

  return (
      // This outer li now acts as the container for click outside detection
      <li className="relative py-2 w-full px-4" ref={searchContainerRef}>
        <div className="relative w-full max-w-xs mx-auto">
          {/* Input section */}
          <div className="flex items-center bg-gray-800/80 rounded-lg px-3 py-2 border border-gray-700">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" />
            <input
                type="text"
                placeholder="Search recipes..."
                className="bg-transparent text-white placeholder-gray-500 py-1 pl-1 pr-2 w-full focus:outline-none text-base"
                value={searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                // Prevent clicks on the input itself from triggering the outside click handler
                onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
          {/* Results dropdown */}
          {searchQuery && (
              <div
                  className="absolute top-full left-0 right-0 mt-2 w-full z-50 max-w-xs mx-auto"
                  // Prevent clicks inside the results from triggering the outside click handler
                  onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="bg-gray-900 bg-opacity-95 backdrop-blur-md rounded-lg overflow-hidden shadow-xl border border-gray-700">
                  <SearchResults searchQuery={searchQuery} onClose={handleCloseResults} />
                </div>
              </div>
          )}
        </div>
      </li>
  );
};


// --- MobileMenu Component (Forward Ref) ---
const MobileMenu = forwardRef(({ isOpen, items, onSearchSubmit, closeMenu, isHomePage }, ref) => {
  return (
      <div
          ref={ref} // Apply the forwarded ref here
          className={`absolute top-full left-0 right-0 lg:hidden flex flex-col items-center bg-black/95 backdrop-blur-md w-full shadow-xl transition-all duration-300 ease-in-out border-t border-gray-800 ${
              isOpen ? "max-h-[calc(100vh-var(--navbar-height))] overflow-y-auto opacity-100 visible"
                  : "max-h-0 opacity-0 invisible"
          }`}
          style={{ '--navbar-height': '73px' }} // Ensure CSS variable is correctly applied
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
});

// --- HamburgerButton Component (Forward Ref) ---
const HamburgerButton = forwardRef(({ isOpen, onClick }, ref) => (
    <div className="lg:hidden">
      {/* Apply the ref to the button itself */}
      <button
          ref={ref}
          onClick={onClick}
          className="relative w-8 h-8 focus:outline-none group z-50 p-1" // Ensure z-index is high enough
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
));

// --- Navbar Component ---
const Navbar = () => {
  const { user } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/home';
  const mobileMenuRef = useRef(null); // Ref for the MobileMenu div
  const hamburgerRef = useRef(null); // Ref for the HamburgerButton button

  const baseMenuItems = [{ name: "Home", path: "/home" }];
  const authMenuItems = [{ name: "Add Recipe", path: "/add-recipe" }];
  const menuItems = [...baseMenuItems, ...(user ? authMenuItems : [])];

  // Memoized function to close the mobile menu
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Close mobile menu automatically on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location, closeMobileMenu]);

  // Effect to handle clicks outside the mobile menu
  useEffect(() => {
    // Only add listener if the menu is open
    if (!isMobileMenuOpen) return;

    const handleClickOutside = (event) => {
      // Check if refs are valid and click is outside both menu and hamburger button
      if (
          mobileMenuRef.current &&
          !mobileMenuRef.current.contains(event.target) &&
          hamburgerRef.current &&
          !hamburgerRef.current.contains(event.target)
      ) {
        closeMobileMenu();
      }
    };

    // Add listener on 'mousedown' for better responsiveness
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup function to remove listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen, closeMobileMenu]); // Dependencies for the effect

  // Function to toggle the mobile menu state
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // Function to handle search submission (from both desktop and mobile)
  const handleSearchSubmit = useCallback((query) => {
    if (query.trim() !== "") {
      // Navigate to home page with search query parameter
      navigate(`/home?query=${encodeURIComponent(query)}`);
      closeMobileMenu(); // Close mobile menu if it was open
    }
  }, [navigate, closeMobileMenu]);

  const navbarHeight = 73; // Define navbar height for calculations

  return (
      <>
        {/* Header container */}
        <header className="bg-black w-full fixed top-0 left-0 right-0 z-50 shadow-md">
          {/* Gradient top border */}
          <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

          {/* Main navbar content area */}
          <div
              className="flex justify-between items-center h-[calc(var(--navbar-height)-2px)] px-4 md:px-6 w-full backdrop-blur-md bg-black/85 relative"
              style={{ '--navbar-height': `${navbarHeight}px` }} // Set CSS variable for height
          >
            {/* Left section (Desktop Search or Placeholder) */}
            <div className="relative hidden lg:flex items-center lg:w-40">
              {isHomePage ? (
                  <DesktopSearch onSearchSubmit={handleSearchSubmit} />
              ) : (
                  <div className="w-40" /> // Empty div to maintain layout alignment
              )}
            </div>

            {/* Spacer for mobile layout (pushes icons to the right) */}
            <div className="lg:hidden flex-1"></div>

            {/* Center section (Desktop Navigation) */}
            <nav className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <ul className="flex text-white gap-x-8 font-normal tracking-wide text-base">
                {menuItems.map((item) => (
                    <NavLink key={item.name} to={item.path}>
                      {item.name}
                    </NavLink>
                ))}
              </ul>
            </nav>

            {/* Right section (User Status and Mobile Toggle) */}
            <div className="flex items-center gap-4">
              {/* UserStatus component (visible on all sizes unless hidden internally) */}
              <UserStatus />

              {/* Hamburger Button (visible only on smaller screens due to lg:hidden in its definition) */}
              <HamburgerButton ref={hamburgerRef} isOpen={isMobileMenuOpen} onClick={toggleMobileMenu} />
            </div>
          </div>

          {/* Mobile Menu (conditionally rendered based on state, attached below header) */}
          <MobileMenu
              ref={mobileMenuRef} // Pass the ref here
              isOpen={isMobileMenuOpen}
              items={menuItems}
              onSearchSubmit={handleSearchSubmit}
              closeMenu={closeMobileMenu}
              isHomePage={isHomePage}
          />
        </header>

        {/* Spacer div to prevent content from being hidden behind the fixed navbar */}
        <div style={{ height: `${navbarHeight}px` }} />
      </>
  );
};

export default Navbar;