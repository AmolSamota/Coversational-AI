import React, { useState } from 'react';

const CareerHubExploreSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      {/* Container Header */}
      <div className="mb-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Get more from Career Hub</h2>
            <p className="text-sm text-gray-600">Explore the many ways you can grow here</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg 
              className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {/* Mentors Card */}
            <div className="flex-shrink-0 w-96 rounded-lg shadow-sm p-6" style={{ backgroundColor: '#FEF3C7' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">Mentors</h3>
                  <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center">
                    2
                  </span>
                </div>
                {/* Navigation Arrows */}
                <div className="flex items-center space-x-2">
                  <button className="p-1 rounded hover:bg-yellow-200 transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button className="p-1 rounded hover:bg-yellow-200 transition-colors">
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Subtitle */}
              <p className="text-sm text-gray-600 mb-4">Get guidance and support</p>

              {/* Icon */}
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>

              {/* Recommended Label */}
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-700">Recommended for you</span>
              </div>

              {/* Mentor Profile */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-lg shadow-sm">
                  DS
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">Dave Shaw</h4>
                  <p className="text-xs text-gray-600">Sales Engineer Manager</p>
                </div>
              </div>

              {/* Badge */}
              <div className="flex items-center space-x-2">
                <span className="bg-white text-gray-700 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                  Experience in 1 of your role int...
                </span>
                <span className="text-xs font-semibold text-gray-700">+3</span>
              </div>
            </div>

            {/* Jobs Card */}
            <div className="flex-shrink-0 w-96 rounded-lg shadow-sm p-6" style={{ backgroundColor: '#FEF9C3' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">Jobs</h3>
                  <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center">
                    99
                  </span>
                </div>
                {/* Navigation Arrow */}
                <button className="p-1 rounded hover:bg-yellow-200 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Subtitle */}
              <p className="text-sm text-gray-600 mb-4">Browse opportunities for you or friends</p>

              {/* Icon */}
              <div className="mb-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                </div>
              </div>

              {/* Recommended Label */}
              <div className="mb-4">
                <span className="text-xs font-medium text-gray-700">Recommended for you</span>
              </div>

              {/* Job Title */}
              <h4 className="font-semibold text-gray-900 text-base mb-4">DevOps Engineer</h4>

              {/* Skill Tags */}
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Java</span>
                </div>
                <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Python</span>
                </div>
                <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-full text-xs font-medium shadow-sm">
                  <span className="text-gray-700">DevOps</span>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default CareerHubExploreSection;
