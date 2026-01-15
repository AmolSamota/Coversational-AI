import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';

const Readiness: React.FC = () => {
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState('');

  const handleComingSoon = (title: string) => {
    setComingSoonTitle(title);
    setShowComingSoon(true);
  };
  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Main content area with centered layout */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Readiness Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-teal-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Workforce Readiness
          </h1>

          {/* Subheading/Description */}
          <p className="text-lg md:text-xl text-gray-600 text-center max-w-3xl mx-auto leading-relaxed">
            Assess and enhance your workforce readiness. Track skills, competencies, and organizational capabilities to ensure your team is prepared for future challenges.
          </p>
        </div>

        {/* Content Cards Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Skills Readiness Card */}
          <Link
            to="/readiness/skills"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer block"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <svg 
                  className="w-6 h-6 text-blue-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Skills Readiness</h3>
            </div>
            <p className="text-gray-600">
              Evaluate current skill levels and identify gaps in your workforce capabilities.
            </p>
          </Link>

          {/* Competency Assessment Card */}
          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleComingSoon('Competency Assessment')}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <svg 
                  className="w-6 h-6 text-green-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Competency Assessment</h3>
            </div>
            <p className="text-gray-600">
              Measure organizational competencies and benchmark against industry standards.
            </p>
          </div>

          {/* Future Planning Card */}
          <Link
            to="/readiness/future-planning"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer block"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <svg 
                  className="w-6 h-6 text-purple-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Future Planning</h3>
            </div>
            <p className="text-gray-600">
              Plan for future workforce needs and develop strategies for capability building.
            </p>
          </Link>
        </div>
      </div>

      {/* Coming Soon Modal */}
      <Modal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        title={comingSoonTitle}
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <svg 
              className="w-8 h-8 text-blue-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600">
            This feature is currently under development and will be available soon.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Readiness;

