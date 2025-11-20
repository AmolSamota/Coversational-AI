import React from 'react';
import { useNavigate } from 'react-router-dom';
import PopularPrompts from './PopularPrompts';
import PromptInput from './PromptInput';

const Insights: React.FC = () => {
  const navigate = useNavigate();

  const handlePromptSubmit = (prompt: string) => {
    // Navigate to chat with the prompt as initial message
    navigate('/insights/chat', { state: { initialPrompt: prompt } });
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Main content area with centered layout */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Top Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          {/* AI/Analytics Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
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
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" 
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Workforce Insights AI Assistant
          </h1>

          {/* Subheading/Description */}
          <p className="text-lg md:text-xl text-gray-600 text-center max-w-3xl mx-auto leading-relaxed">
            Get instant answers to all your workforce-related questions. Ask about headcount, attrition, diversity metrics, hiring trends, and more.
          </p>
        </div>

        {/* Popular Prompts Section */}
        <PopularPrompts onPromptClick={handlePromptSubmit} />

        {/* Prompt Input Section */}
        <div className="mt-12">
          <PromptInput onSubmit={handlePromptSubmit} />
        </div>
      </div>
    </div>
  );
};

export default Insights;
