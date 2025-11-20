import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const [showMarketplaceDropdown, setShowMarketplaceDropdown] = useState(false);
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/career-hub';
    }
    return location.pathname === path;
  };

  // Teal infinity symbol logo SVG (Eightfold logo)
  const InfinityLogo = () => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7 14C7 11.2386 9.23858 9 12 9C13.0831 9 14.0521 9.48978 14.7188 10.1565L16 11.4377L17.2812 10.1565C17.9479 9.48978 18.9169 9 20 9C22.7614 9 25 11.2386 25 14C25 16.7614 22.7614 19 20 19C18.9169 19 17.9479 18.5102 17.2812 17.8435L16 16.5623L14.7188 17.8435C14.0521 18.5102 13.0831 19 12 19C9.23858 19 7 16.7614 7 14Z"
        stroke="#14B8A6"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M3 14C3 11.2386 5.23858 9 8 9C9.08308 9 10.0521 9.48978 10.7188 10.1565L12 11.4377L13.2812 10.1565C13.9479 9.48978 14.9169 9 16 9C18.7614 9 21 11.2386 21 14C21 16.7614 18.7614 19 16 19C14.9169 19 13.9479 18.5102 13.2812 17.8435L12 16.5623L10.7188 17.8435C10.0521 18.5102 9.08308 19 8 19C5.23858 19 3 16.7614 3 14Z"
        stroke="#14B8A6"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
      <nav className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo and Navigation */}
          <div className="flex items-center flex-1">
            {/* Logo */}
            <div className="flex-shrink-0 mr-8">
              <Link to="/" className="flex items-center">
                <InfinityLogo />
                <span className="ml-2 text-xl font-semibold text-gray-900">Eightfold</span>
              </Link>
            </div>

            {/* Navigation Items */}
            <div className="hidden lg:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/')
                    ? 'text-gray-900 border-b-2 border-blue-600'
                    : 'text-nav-gray hover:text-gray-900'
                }`}
              >
                Home
              </Link>
              <a
                href="#"
                className="text-nav-gray hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Goals
              </a>
              <a
                href="#"
                className="text-nav-gray hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Career Navigator
              </a>
              
              {/* Marketplace with dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowMarketplaceDropdown(true)}
                onMouseLeave={() => setShowMarketplaceDropdown(false)}
              >
                <a
                  href="#"
                  className="text-nav-gray hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors flex items-center"
                >
                  Marketplace
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </a>
                {showMarketplaceDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-nav-gray hover:bg-gray-50 hover:text-gray-900"
                    >
                      All Items
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-nav-gray hover:bg-gray-50 hover:text-gray-900"
                    >
                      Learning Paths
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-nav-gray hover:bg-gray-50 hover:text-gray-900"
                    >
                      Courses
                    </a>
                  </div>
                )}
              </div>

              {/* My Activity with dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setShowActivityDropdown(true)}
                onMouseLeave={() => setShowActivityDropdown(false)}
              >
                <a
                  href="#"
                  className="text-nav-gray hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors flex items-center"
                >
                  My Activity
                  <svg
                    className="ml-1 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </a>
                {showActivityDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-nav-gray hover:bg-gray-50 hover:text-gray-900"
                    >
                      My Tasks
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-nav-gray hover:bg-gray-50 hover:text-gray-900"
                    >
                      My Applications
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-nav-gray hover:bg-gray-50 hover:text-gray-900"
                    >
                      My Learning
                    </a>
                  </div>
                )}
              </div>

              <a
                href="#"
                className="text-nav-gray hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                People
              </a>
              <a
                href="#"
                className="text-nav-gray hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors"
              >
                Talent Hub
              </a>
              <Link
                to="/insights"
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  isActive('/insights')
                    ? 'text-gray-900 border-b-2 border-blue-600'
                    : 'text-nav-gray hover:text-gray-900'
                }`}
              >
                Insights
              </Link>
            </div>
          </div>

          {/* Right side: Search, Grid Icon, Profile */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {/* Search Bar */}
            <div className="hidden md:flex items-center">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for project, job, name or keywo..."
                  className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-nav-gray placeholder-gray-400"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Grid Icon (App Menu) */}
            <button
              className="text-nav-gray hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="App menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>

            {/* User Profile Avatar */}
            <button className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-sm hover:ring-2 hover:ring-teal-200 transition-all">
              JD
            </button>

            {/* Mobile menu button */}
            <button className="lg:hidden text-nav-gray hover:text-gray-900 p-2">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
