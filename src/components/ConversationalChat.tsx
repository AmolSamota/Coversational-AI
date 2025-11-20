import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Message from './Message';
import PromptInput from './PromptInput';
import SuggestedQuestions from './SuggestedQuestions';
import { findResponse } from '../data/insightsData';
import type { FormattedContent } from '../data/insightsData';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  formattedContent?: FormattedContent;
}

const ConversationalChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialPrompt = location.state?.initialPrompt;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const processedInitialPrompt = useRef<string | null>(null);

  // Generate follow-up questions based on current conversation
  const getFollowUpQuestions = (): string[] => {
    if (messages.length === 0) return [];
    
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content.toLowerCase() || '';
    
    if (lastUserMessage.includes('attrition')) {
      // Check if they already asked about tenure
      if (lastUserMessage.includes('tenure') || lastUserMessage.includes('years of service')) {
        return [
          "What are the main reasons employees leave in their first year?",
          "Show me onboarding program effectiveness",
          "Which managers have the best first-year retention rates?",
          "Compare our early-tenure attrition to competitors",
          "What's the attrition rate by department?",
        ];
      }
      // Default attrition follow-ups
      return [
        "Show me attrition rate by tenure",
        "What are the main reasons for attrition?",
        "Which managers have the highest team attrition?",
        "How does our attrition compare to last year?",
        "Which departments have improved their attrition rates?",
      ];
    }
    
    if (lastUserMessage.includes('diversity')) {
      return [
        "What's our diversity hiring pipeline?",
        "Show me promotion rates by demographics",
        "What diversity initiatives are currently running?",
        "How does diversity vary by department?",
        "What's our diversity representation in leadership?",
      ];
    }
    
    if (lastUserMessage.includes('skill gap') || lastUserMessage.includes('skill')) {
      return [
        "What training programs address these gaps?",
        "Which departments have the most skill gaps?",
        "How long will it take to close these gaps?",
        "What's the cost of upskilling?",
        "What are the priority skills to develop?",
      ];
    }
    
    if (lastUserMessage.includes('time to fill') || lastUserMessage.includes('hiring') || lastUserMessage.includes('recruiting')) {
      return [
        "What's our offer acceptance rate?",
        "Which roles are hardest to fill?",
        "What's our candidate pipeline size?",
        "How does our hiring compare to competitors?",
        "What's our hiring velocity by department?",
      ];
    }
    
    if (lastUserMessage.includes('headcount') || lastUserMessage.includes('growth') || lastUserMessage.includes('employee count')) {
      return [
        "What's our hiring plan for next quarter?",
        "Which departments are growing fastest?",
        "What's our target headcount for next year?",
        "Show me headcount by location",
        "What's our projected growth trajectory?",
      ];
    }
    
    if (lastUserMessage.includes('satisfaction') || lastUserMessage.includes('engagement')) {
      return [
        "What factors drive employee satisfaction?",
        "How has satisfaction changed over time?",
        "Which teams have the highest satisfaction?",
        "What are the main concerns from surveys?",
        "What actions are we taking to improve satisfaction?",
      ];
    }
    
    if (lastUserMessage.includes('performance') || lastUserMessage.includes('rating')) {
      return [
        "What's our performance distribution?",
        "How do performance ratings vary by department?",
        "What's the correlation between performance and retention?",
        "Which teams have improved performance most?",
        "What's our performance review completion rate?",
      ];
    }
    
    if (lastUserMessage.includes('compensation') || lastUserMessage.includes('salary') || lastUserMessage.includes('pay')) {
      return [
        "What's our compensation philosophy?",
        "Which roles are most at risk for compensation?",
        "How does our equity compensation compare?",
        "What's our compensation review cycle?",
        "Show me compensation by department",
      ];
    }
    
    if (lastUserMessage.includes('training') || lastUserMessage.includes('development') || lastUserMessage.includes('learning')) {
      return [
        "What are our most popular training programs?",
        "What's the ROI of our training programs?",
        "Which departments invest most in development?",
        "What skills are we prioritizing for training?",
        "How does training impact employee retention?",
      ];
    }
    
    // Default follow-ups
    return [
      "Tell me more about this",
      "What are the key trends?",
      "How does this compare to industry benchmarks?",
      "What are the recommendations?",
      "What actions should we take?",
    ];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = useCallback(async (prompt: string) => {
    if (!prompt.trim()) return;

    try {
      // Add user message immediately
      const userMessage: ChatMessage = {
        role: 'user',
        content: prompt,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);

      // Simulate AI processing delay (1-2 seconds)
      const delay = Math.random() * 1000 + 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Find matching response or use generic
      const formattedResponse = findResponse(prompt);
      
      const aiMessage: ChatMessage = {
        role: 'ai',
        content: formattedResponse
          ? formattedResponse.mainText || prompt
          : `This is a prototype with sample data. The full version will answer: "${prompt}"`,
        timestamp: new Date(),
        formattedContent: formattedResponse || undefined,
      };

      // Add AI message and stop typing
      // Use separate state updates to ensure both are applied
      setMessages((prev) => {
        const updated = [...prev, aiMessage];
        return updated;
      });
      setIsTyping(false);
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setIsTyping(false);
      const errorMessage: ChatMessage = {
        role: 'ai',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Handle initial prompt from navigation
  useEffect(() => {
    if (initialPrompt && messages.length === 0 && processedInitialPrompt.current !== initialPrompt) {
      processedInitialPrompt.current = initialPrompt;
      // Process immediately
      handleSubmit(initialPrompt);
    }
  }, [initialPrompt, messages.length, handleSubmit]); // Include handleSubmit in dependencies

  const handleNewConversation = () => {
    setMessages([]);
    processedInitialPrompt.current = null;
    navigate('/insights');
  };

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/insights')}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Insights
              </button>
              <h1 className="text-xl font-bold text-gray-900">Workforce Insights</h1>
            </div>
            <button
              onClick={handleNewConversation}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              New Conversation
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Suggested Questions - Mobile (above chat) */}
        <div className="mb-4 lg:hidden">
          <SuggestedQuestions
            questions={getFollowUpQuestions()}
            onQuestionClick={handleSubmit}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[72%_28%] gap-6">
          {/* Chat Messages Area */}
          <div>
            <div
              ref={chatContainerRef}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 min-h-[400px] sm:min-h-[600px] max-h-[calc(100vh-280px)] overflow-y-auto chat-scrollbar"
            >
              {messages.length === 0 && !isTyping ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-500">Start a conversation by asking a question</p>
                    {initialPrompt && (
                      <p className="text-xs text-gray-400 mt-2">Waiting for: {initialPrompt}</p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, idx) => (
                    <Message
                      key={`${message.role}-${idx}-${message.timestamp.getTime()}`}
                      role={message.role}
                      content={message.content}
                      timestamp={message.timestamp}
                      formattedContent={message.formattedContent}
                    />
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start mb-6">
                      <div className="flex items-start space-x-2">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg rounded-bl-none px-4 py-3">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Fixed Input Bar */}
            <div className="mt-4">
              <PromptInput onSubmit={handleSubmit} />
            </div>
          </div>

          {/* Suggested Questions Sidebar - Desktop */}
          <div className="hidden lg:block w-full">
            <SuggestedQuestions
              questions={getFollowUpQuestions()}
              onQuestionClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationalChat;

