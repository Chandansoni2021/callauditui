import React, { useEffect } from 'react';
import bluelogo from "../assets/bluelogo.png"

const LandNavbar = () => {
  useEffect(() => {
    // Add wave animation class to desktop elements after component mounts
    const desktopElements = document.querySelectorAll('.desktop-animate');
    desktopElements.forEach((el, index) => {
      // Stagger the animation with increasing delay
      el.style.animationDelay = `${index * 0.1}s`;
      el.classList.add('animate-wave');
    });
  }, []);

  return (
    <nav className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">

          {/* Logo - Left side with animation */}
          <div className="flex-shrink-0 flex items-center desktop-animate">
            <img src={bluelogo} alt="Meridian Solution" className="h-40 w-40 object-contain" />
          </div>

          {/* Desktop Menu - Center */}
          <div className="hidden md:flex md:items-center md:justify-center md:flex-1">
            <ul className="flex space-x-8">
              {['Home', 'Features', 'About', 'Services', 'FAQ'].map((item, index) => (
                <li key={item} className="desktop-animate">
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-gray-700 hover:text-blue-600 font-medium transition-colors relative group"
                  >
                    {item}
                    <span className="absolute left-0 bottom-0 h-0.5 w-0 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button - Right side */}
          <div className="flex items-center">
            <a
              href="/login"
              className="desktop-animate hidden md:inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Get Started
              <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>

            {/* Mobile menu button */}
            <button className="md:hidden text-gray-500 hover:text-gray-900 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu (hidden by default) */}
      <div className="md:hidden bg-white border-t border-gray-200">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {['Home', 'Features', 'About', 'Services', 'FAQ'].map((item) => (
            <a
              key={item}
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-white-600 hover:bg-blue-50"
            >
              {item}
            </a>
          ))}
          <a
            href="/resume"
            className="hidden md:inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            Get Started
            <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default LandNavbar;