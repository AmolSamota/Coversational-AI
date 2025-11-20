import React from 'react';

const MyTasksCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
          <span className="h-5 w-5 rounded-full bg-blue-600 text-white text-xs font-medium flex items-center justify-center">
            1
          </span>
        </div>
        <a 
          href="#" 
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          View all tasks
        </a>
      </div>

      {/* Task item */}
      <div className="space-y-4">
        <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded transition-colors">
          <div className="flex items-center space-x-3 flex-1">
            <span className="text-gray-400 group-hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
            <span className="text-sm text-gray-900">Work on development plans</span>
          </div>
        </div>

        {/* Yellow badge with hammer icon */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 rounded-full px-3 py-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.71 19.29l-3.4-3.39A7.92 7.92 0 0 0 19 11a8 8 0 1 0-8 8 7.92 7.92 0 0 0 4.9-1.69l3.39 3.4a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42zM5 11a6 6 0 1 1 12 0 6 6 0 0 1-12 0z"/>
              <path d="M13 10h-2V7a1 1 0 0 0-2 0v3H7a1 1 0 0 0 0 2h2v3a1 1 0 0 0 2 0v-3h2a1 1 0 0 0 0-2z"/>
            </svg>
            <span className="text-xs font-medium">Build your skills</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="pt-2">
          <p className="text-xs text-gray-600">1/75 plans</p>
        </div>
      </div>
    </div>
  );
};

export default MyTasksCard;
