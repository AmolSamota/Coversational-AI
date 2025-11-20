import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <div className="relative overflow-hidden" style={{ height: '400px' }}>
      {/* Diagonal gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #2563EB 0%, #60A5FA 100%)',
        }}
      ></div>

      {/* Diagonal white sections using clip-path for angular, modern look */}
      {/* First diagonal cut from top-right to bottom-left */}
      <div 
        className="absolute inset-0 bg-white"
        style={{
          clipPath: 'polygon(0% 0%, 80% 0%, 60% 100%, 0% 100%)',
        }}
      ></div>
      
      {/* Second diagonal cut creating layered angular effect */}
      <div 
        className="absolute inset-0 bg-white"
        style={{
          clipPath: 'polygon(0% 0%, 55% 0%, 35% 100%, 0% 100%)',
        }}
      ></div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="flex items-center space-x-6">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-2xl shadow-lg ring-4 ring-white">
              M
            </div>
          </div>

          {/* Greeting Text */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-2">
              Hi Mateo
            </h1>
            <p className="text-lg md:text-xl text-gray-600">
              Welcome to your Career Hub
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
