import React from 'react';

const JobTasksCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900">My Job Tasks</h2>
          <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center">
            0
          </span>
        </div>
      </div>
      {/* Clean, minimal design - empty state for now */}
    </div>
  );
};

export default JobTasksCard;
