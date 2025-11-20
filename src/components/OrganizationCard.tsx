import React from 'react';

const OrganizationCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Organization</h2>
        <a 
          href="#" 
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          View org chart
        </a>
      </div>
    </div>
  );
};

export default OrganizationCard;
