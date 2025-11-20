import React from 'react';

const GetHelpButton: React.FC = () => {
  return (
    <button className="bg-blue-600 text-white px-6 py-4 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex flex-col items-center justify-center min-h-[200px] w-full">
      <svg className="w-6 h-6 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-sm font-medium" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>Get Help</span>
    </button>
  );
};

export default GetHelpButton;

