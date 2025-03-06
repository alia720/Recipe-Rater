import React, { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="bg-black w-full fixed top-0 left-0 right-0 z-50">
        {/* Gradient line at the top */}
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
        
        <div className="flex justify-between items-center py-4 px-6 w-full backdrop-blur-sm bg-black/90">
          {/* Empty div for spacing on mobile */}
          <div className="lg:hidden"></div>

          {/* Menu for larger screens */}
          <div className="hidden lg:flex w-full justify-center">
            <ul className="text-white flex gap-x-12 font-light tracking-wide text-lg">
              {['Something', 'Somethins', 'Somethin', 'Settings'].map((item, index) => (
                <li key={item} className="relative py-2 group">
                  <a
                    href="#"
                    className="inline-block relative no-underline transform transition-transform duration-300 group-hover:-translate-y-0.5"
                  >
                    {/* Glowing dot */}
                    <span className="absolute -left-4 top-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-y-1/2" />
                    
                    {/* Text with hover effect */}
                    <span className="relative z-10">
                      {item}
                      {/* Center-expanding underline */}
                      <span className="absolute bottom-[-6px] left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300 -translate-x-1/2 group-hover:left-0 group-hover:translate-x-0" />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Animated Hamburger Icon - Right-aligned on mobile */}
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

        {/* Animated Mobile Menu */}
        <div 
          className={`lg:hidden flex justify-center items-center bg-black/90 backdrop-blur-sm w-full overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-96 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'
          }`}
        >
          <ul className="text-white flex flex-col gap-y-6 font-light tracking-wide text-lg">
            {['Something', 'Somethins', 'Somethin', 'Settings'].map((item, index) => (
              <li 
                key={item} 
                className="relative py-2 group"
                style={{
                  animation: isOpen ? `slideIn 0.4s ease-out ${index * 0.1}s forwards` : 'none',
                  opacity: 0,
                  transform: 'translateY(20px)'
                }}
              >
                <a
                  href="#"
                  className="inline-block relative no-underline"
                >
                  <span className="relative">
                    {item}
                    {/* Center-expanding underline for mobile menu */}
                    <span className="absolute bottom-[-6px] left-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-full transition-all duration-300 -translate-x-1/2 group-hover:left-0 group-hover:translate-x-0" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      {/* Spacer div to prevent content from going under navbar */}
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