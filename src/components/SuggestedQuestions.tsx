import React, { useState } from 'react';

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({ questions, onQuestionClick }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (questions.length === 0) return null;

  const getIcon = (index: number) => {
    const icons = [
      // Lightbulb
      <svg key="lightbulb" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      // Question mark
      <svg key="question" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      // Chart/analytics
      <svg key="chart" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
      // Trending up
      <svg key="trend" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>,
      // Search/magnifying glass
      <svg key="search" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>,
    ];
    return icons[index % icons.length];
  };

  return (
    <>
      {/* Desktop: Sticky sidebar */}
      <div className="hidden lg:block lg:sticky lg:top-24 h-fit">
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 min-w-[280px] max-w-[350px] w-full">
          <div className="flex items-center mb-4">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Suggested Follow-ups</h3>
          </div>
          <div className="space-y-2.5">
            {questions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onQuestionClick(question)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all duration-200 group active:scale-[0.98]"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-gray-400 group-hover:text-blue-600 mt-0.5 flex-shrink-0 transition-colors">
                    {getIcon(idx)}
                  </div>
                  <span className="text-xs text-gray-700 group-hover:text-blue-900 font-medium leading-relaxed flex-1 break-words">
                    {question}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: Collapsible section */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-4 flex items-center justify-between mb-2"
        >
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">You might also want to know</h3>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isExpanded && (
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 space-y-2.5">
            {questions.map((question, idx) => (
              <button
                key={idx}
                onClick={() => onQuestionClick(question)}
                className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all duration-200 group active:scale-[0.98]"
              >
                <div className="flex items-start space-x-3">
                  <div className="text-gray-400 group-hover:text-blue-600 mt-0.5 flex-shrink-0 transition-colors">
                    {getIcon(idx)}
                  </div>
                  <span className="text-xs text-gray-700 group-hover:text-blue-900 font-medium leading-relaxed flex-1 break-words">
                    {question}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SuggestedQuestions;
