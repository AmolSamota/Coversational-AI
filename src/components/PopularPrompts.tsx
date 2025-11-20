import React from 'react';

interface PromptCard {
  id: string;
  text: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBg: string;
}

interface PopularPromptsProps {
  onPromptClick?: (prompt: string) => void;
}

const PopularPrompts: React.FC<PopularPromptsProps> = ({ onPromptClick }) => {
  const prompts: PromptCard[] = [
    {
      id: '1',
      text: 'What is our current attrition rate by department?',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
    },
    {
      id: '2',
      text: 'Show me diversity metrics for engineering roles',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconColor: 'text-green-600',
      iconBg: 'bg-green-100',
    },
    {
      id: '3',
      text: 'What are the top skill gaps in our organization?',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
  ];

  const handleClick = (prompt: string) => {
    if (onPromptClick) {
      onPromptClick(prompt);
    }
  };

  return (
    <div className="mt-8">
      {/* Section Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Questions</h2>

      {/* Prompt Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleClick(prompt.text)}
              className="bg-white rounded-lg border border-gray-200 p-6 text-left hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
            >
            {/* Icon */}
            <div className={`w-12 h-12 ${prompt.iconBg} rounded-lg flex items-center justify-center mb-4 ${prompt.iconColor}`}>
              {prompt.icon}
            </div>

            {/* Prompt Text */}
            <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {prompt.text}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopularPrompts;

