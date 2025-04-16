// frontend/src/components/UserStatus.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext"; // Adjust path if needed
// Optional: Install Heroicons for icons: npm install @heroicons/react
import { ChevronDownIcon, ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/solid';

// Accept the isMobile prop, default to false
const UserStatus = ({ isMobile = false }) => {
    const { user, fetchUser } = useUser();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);
    const navigate = useNavigate();

    // Handle clicking outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Close if clicked outside button AND outside dropdown
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        };

        // Add listener if dropdown is open
        if (showDropdown) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        // Cleanup listener on component unmount or when dropdown closes
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown]);


    const handleLogout = async () => {
        setShowDropdown(false); // Close dropdown first
        try {
            await fetch("http://localhost:5000/api/users/logout", { // Ensure API URL is correct
                method: "POST",
                credentials: "include", // Important for cookie-based sessions
            });
            await fetchUser(); // Refresh user state from context
            navigate('/'); // Redirect to home page after logout
        } catch (error) {
            console.error("Logout failed:", error);
            // Optionally show an error message to the user
        }
    };

    const handleProfileClick = () => {
        setShowDropdown(false); // Close dropdown before navigating
        navigate('/profile');
    }

    // Helper to get initials or use avatar
    const getAvatarContent = () => {
        // Check if user object has an avatar URL (adjust property name if needed)
        if (user?.avatarUrl) {
            return <img src={user.avatarUrl} alt={user.name || 'User Avatar'} className="h-7 w-7 rounded-full object-cover" />;
        }
        // Generate initials from name
        if (user?.name) {
            const initials = user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
            return (
                <span className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-600 text-xs font-semibold text-white">
                {initials}
            </span>
            );
        }
        // Fallback icon if no name or avatar
        return <UserCircleIcon className="h-7 w-7 text-gray-400" />;
    }

    // --- Logged In State ---
    if (user) {

        // Conditionally set dropdown position classes based on context
        const dropdownPositionClasses = isMobile
            ? "absolute right-0 z-50 mb-2 w-48 bottom-full origin-bottom-right rounded-md" // Position above button
            : "absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md";   // Position below button (desktop)

        return (
            // Ensure this parent has relative positioning
            <div className={`relative ${isMobile ? '' : 'ml-3'}`}>
                {/* Dropdown Trigger Button */}
                <button
                    ref={buttonRef}
                    type="button"
                    className={`flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 transition-transform duration-150 ease-in-out hover:scale-105 ${isMobile ? 'mx-auto' : ''}`} // Center button if in mobile menu
                    id="user-menu-button"
                    aria-expanded={showDropdown}
                    aria-haspopup="true"
                    onClick={() => setShowDropdown(!showDropdown)} // Toggle on click
                >
                    <span className="sr-only">Open user menu</span>
                    {getAvatarContent()}
                    {/* Conditionally show name/chevron only on desktop */}
                    {!isMobile && user?.name && (
                        <>
                            <span className="text-white font-medium ml-2 mr-1">{user.name}</span>
                            <ChevronDownIcon className="h-4 w-4 text-gray-400 mr-2" />
                        </>
                    )}
                </button>

                {/* Dropdown Menu - Apply conditional classes */}
                {showDropdown && (
                    <div
                        ref={dropdownRef}
                        // Apply calculated position classes here
                        className={`${dropdownPositionClasses} bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-700`}
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="user-menu-button"
                        tabIndex="-1" // Allows focus programmatically if needed
                    >
                        {/* Profile Button */}
                        <button
                            onClick={handleProfileClick}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white transition-colors duration-150"
                            role="menuitem"
                            tabIndex="-1"
                            id="user-menu-item-0"
                        >
                            Your Profile
                        </button>
                        {/* Sign Out Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full text-left block px-4 py-2 text-sm text-red-400 hover:bg-red-600 hover:text-white transition-colors duration-150"
                            role="menuitem"
                            tabIndex="-1"
                            id="user-menu-item-1"
                        >
                            <ArrowRightOnRectangleIcon className="inline-block h-4 w-4 mr-2 align-text-bottom" /> {/* Icon */}
                            Sign out
                        </button>
                    </div>
                )}
            </div>
        );
    }
    // --- Logged Out State ---
    else {
        // Stack buttons vertically on mobile, horizontally on desktop
        return (
            <div className={`flex items-center ${isMobile ? 'flex-col gap-4 w-full px-4' : 'gap-3'}`}>
                {/* Secondary Button Style */}
                <Link
                    to="/login"
                    className={`px-4 py-1.5 rounded-md text-sm font-medium text-gray-200 border border-gray-600 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-150 ${isMobile ? 'w-full text-center' : ''}`} // Full width on mobile
                >
                    Sign In
                </Link>
                {/* Primary Button Style */}
                <Link
                    to="/signup"
                    className={`px-4 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-150 ${isMobile ? 'w-full text-center' : ''}`} // Full width on mobile
                >
                    Sign Up
                </Link>
            </div>
        );
    }
};

export default UserStatus;