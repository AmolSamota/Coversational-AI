import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Breadcrumbs from './skillsReadiness/Breadcrumbs';
import Modal from './Modal';

const FuturePlanning: React.FC = () => {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState('');

  const handleComingSoon = (title: string) => {
    setComingSoonTitle(title);
    setShowComingSoon(true);
  };

  const breadcrumbItems = [
    {
      label: 'Readiness',
      onClick: () => navigate('/readiness'),
    },
    {
      label: 'Future Planning',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Main content area with centered layout */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs items={breadcrumbItems} />
        
        {/* Top Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* Future Planning Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-purple-600" 
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
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Future Planning
          </h1>

          {/* Subheading/Description */}
          <p className="text-lg md:text-xl text-gray-600 text-center max-w-3xl mx-auto leading-relaxed">
            Simulate different workforce scenarios to plan for the future. Explore AI augmentation, workforce reduction, and capacity redistribution strategies.
          </p>
        </div>

        {/* Scenario Cards Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* AI Augmentation Card */}
          <Link
            to="/readiness/future-planning/ai-augmentation"
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">AI Augmentation</h3>
            </div>
            <p className="text-gray-600">
              Simulate the impact of AI and automation on your workforce. Analyze how AI augmentation can enhance productivity and reshape roles.
            </p>
          </Link>

          {/* Workforce Reduction Card */}
          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleComingSoon('Workforce Reduction')}
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
                <svg 
                  className="w-6 h-6 text-red-600" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Workforce Reduction</h3>
            </div>
            <p className="text-gray-600">
              Model workforce reduction scenarios to understand the impact on capabilities, costs, and organizational structure.
            </p>
          </div>

          {/* Capacity Redistribution Card */}
          <div 
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleComingSoon('Capacity Redistribution')}
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Capacity Redistribution</h3>
            </div>
            <p className="text-gray-600">
              Explore how to redistribute workforce capacity across departments, roles, and projects to optimize resource allocation.
            </p>
          </div>
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

export default FuturePlanning;

