import React, { useState } from 'react';
import type { FormattedContent, MetricCallout, ContentSection } from '../data/insightsData';
import ChartVisualization from './ChartVisualization';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface MessageProps {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  formattedContent?: FormattedContent;
}

const Message: React.FC<MessageProps> = ({ role, content, timestamp, formattedContent }) => {
  const [showChart, setShowChart] = useState(false);
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getMetricColor = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-900',
        accent: 'text-blue-600',
        iconBg: 'bg-blue-100',
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-900',
        accent: 'text-green-600',
        iconBg: 'bg-green-100',
      },
      yellow: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-900',
        accent: 'text-yellow-600',
        iconBg: 'bg-yellow-100',
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-900',
        accent: 'text-purple-600',
        iconBg: 'bg-purple-100',
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getSectionBg = (type: string) => {
    const colors = {
      insights: 'bg-blue-50/60 border-blue-100',
      recommendations: 'bg-green-50/60 border-green-100',
      trends: 'bg-yellow-50/60 border-yellow-100',
      breakdown: 'bg-gray-50 border-gray-200',
      analysis: 'bg-purple-50/60 border-purple-100',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-50 border-gray-200';
  };

  const parseFormattedText = (text: string) => {
    // Handle bold text (**text** or **text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      return <span key={idx}>{part}</span>;
    });
  };

  const renderProgressBar = (value: number, max: number = 100, color: string = 'blue') => {
    const percentage = Math.min((value / max) * 100, 100);
    const colorClasses = {
      blue: 'bg-blue-600',
      green: 'bg-green-600',
      yellow: 'bg-yellow-600',
      purple: 'bg-purple-600',
    };
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };

  const renderBarChart = (items: string[]) => {
    // Extract percentage values from items for simple bar visualization
    return (
      <div className="space-y-3 mt-3">
        {items.slice(0, 5).map((item, idx) => {
          const match = item.match(/(\d+(?:\.\d+)?%)/);
          const percentage = match ? parseFloat(match[1]) : null;
          if (!percentage) return null;
          
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-700 font-medium">{item.split(':')[0]}</span>
                <span className="text-gray-900 font-semibold">{percentage}%</span>
              </div>
              {renderProgressBar(percentage, 100, idx % 2 === 0 ? 'blue' : 'green')}
            </div>
          );
        })}
      </div>
    );
  };

  if (role === 'user') {
    return (
      <div className="flex justify-end mb-6 animate-fadeIn">
        <div className="flex items-end space-x-2 max-w-[85%]">
          <div className="flex flex-col items-end min-w-0 flex-1">
            <div className="bg-blue-600 text-white rounded-2xl rounded-br-none px-5 py-3 shadow-md break-words overflow-wrap-anywhere">
              <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed break-words">{content}</p>
            </div>
            <span className="text-xs text-gray-500 mt-1.5 px-1">{formatTime(timestamp)}</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-sm ring-2 ring-white">
            U
          </div>
        </div>
      </div>
    );
  }

  // AI Message with rich formatting
  return (
    <div className="flex justify-start mb-6 animate-fadeIn">
      <div className="flex items-start space-x-3 max-w-[95%] min-w-0">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-white">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-5 py-4 shadow-lg break-words overflow-wrap-anywhere">
            {/* Main Text - exclude COMPARISON TO INDUSTRY as it's rendered separately */}
            {formattedContent?.mainText && (
              <div className="text-sm text-gray-800 mb-5 leading-relaxed whitespace-pre-wrap">
                {parseFormattedText(
                  formattedContent.mainText.includes('COMPARISON TO INDUSTRY')
                    ? formattedContent.mainText.split('COMPARISON TO INDUSTRY:')[0].trim()
                    : formattedContent.mainText
                )}
              </div>
            )}

            {/* Key Metrics Callouts - Enhanced with special handling for tenure response */}
            {formattedContent?.keyMetrics && formattedContent.keyMetrics.length > 0 && (
              <div className={`${formattedContent.keyMetrics.length === 4 ? 'bg-blue-50' : ''} rounded-xl p-4 mb-5 border border-blue-200 overflow-hidden`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full metrics-grid">
                  {formattedContent.keyMetrics.map((metric: MetricCallout, idx: number) => {
                    const colors = getMetricColor(metric.color);
                    const isTenureMetrics = formattedContent.keyMetrics?.length === 4 && 
                      (metric.label.includes('Highest') || metric.label.includes('Lowest') || metric.label.includes('Average') || metric.label.includes('Benchmark'));
                    
                    return (
                      <div
                        key={idx}
                        className={`${isTenureMetrics ? 'bg-white' : colors.bg} ${colors.border} border-2 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow min-w-0 overflow-hidden`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          {isTenureMetrics && metric.trend === 'up' && (
                            <TrendingUp className="w-5 h-5 text-red-600" />
                          )}
                          {isTenureMetrics && metric.trend === 'down' && (
                            <TrendingDown className="w-5 h-5 text-green-600" />
                          )}
                          {isTenureMetrics && !metric.trend && (
                            <div className="w-5 h-5 flex items-center justify-center">
                              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                            </div>
                          )}
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-600 ml-auto">
                            {metric.label}
                          </span>
                        </div>
                        <div className={`text-2xl font-bold ${colors.text} mb-1`}>
                          {metric.value}
                        </div>
                        {isTenureMetrics && (
                          <div className="text-xs text-gray-500 mt-1">
                            {metric.label.includes('Highest') && '0-1 year tenure'}
                            {metric.label.includes('Lowest') && '5-7 year tenure'}
                            {metric.label.includes('Average') && 'Overall company attrition'}
                            {metric.label.includes('Benchmark') && 'Industry standard'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Formatted Sections - Enhanced with special formatting for tenure response */}
            {formattedContent?.sections && formattedContent.sections.map((section: ContentSection, idx: number) => {
              const isTenureBracket = section.title === "ATTRITION BY TENURE BRACKET";
              const isCriticalInsights = section.title === "CRITICAL INSIGHTS";
              const isTenureImpact = section.title === "TENURE IMPACT BY DEPARTMENT";
              const isRetentionPatterns = section.title === "RETENTION PATTERNS";
              const isRecommendations = section.title === "RECOMMENDATIONS";
              
              // Determine background color based on section type
              let sectionBg = 'bg-gray-50 border-gray-200';
              if (isCriticalInsights) {
                sectionBg = 'bg-yellow-50 border-yellow-200';
              } else if (isRetentionPatterns) {
                sectionBg = 'bg-green-50 border-green-200';
              } else if (isTenureBracket || isTenureImpact) {
                sectionBg = 'bg-white border-gray-200';
              } else if (isRecommendations) {
                sectionBg = 'bg-blue-50 border-blue-200';
              } else {
                const sectionColors = getSectionBg(section.type);
                sectionBg = sectionColors;
              }
              
              const isBreakdown = section.type === 'breakdown';
              
              // Get risk level color for tenure brackets
              const getRiskColor = (rate: number) => {
                if (rate > 15) return 'text-red-600';
                if (rate >= 10) return 'text-yellow-600';
                return 'text-green-600';
              };
              
              const getRiskDot = (rate: number) => {
                if (rate > 15) return '🔴';
                if (rate >= 10) return '🟡';
                return '🟢';
              };
              
              return (
                <div
                  key={idx}
                  className={`${sectionBg} rounded-lg p-4 mb-5 border shadow-sm overflow-hidden`}
                >
                  {/* Section Header */}
                  <div className="flex items-center mb-4">
                    {isCriticalInsights && (
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0" />
                    )}
                    {isRetentionPatterns && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
                    )}
                    <h4 className="font-bold text-gray-900 text-base tracking-wide">
                      {section.title}
                    </h4>
                  </div>
                  
                  {/* Special rendering for ATTRITION BY TENURE BRACKET */}
                  {isTenureBracket && (
                    <ul className="space-y-4">
                      {section.items.map((item: string, itemIdx: number) => {
                        // Parse the item: "0-1 years: 28.4% (highest risk period) - 142 departures out of 500 employees - 67% left within first 6 months"
                        const tenureMatch = item.match(/^(\d+-\d+\s+years?|\d+\+\s+years?):\s*(\d+\.\d+)%/);
                        const departuresMatch = item.match(/(\d+)\s+departures/);
                        const employeesMatch = item.match(/out of\s+(\d+)\s+employees/);
                        const percentageMatch = item.match(/(\d+)%\s+left/);
                        
                        const tenure = tenureMatch ? tenureMatch[1] : '';
                        const rate = tenureMatch ? parseFloat(tenureMatch[2]) : 0;
                        const departures = departuresMatch ? departuresMatch[1] : '';
                        const employees = employeesMatch ? employeesMatch[1] : '';
                        const earlyExit = percentageMatch ? percentageMatch[1] : '';
                        
                        return (
                          <li key={itemIdx} className="text-sm text-gray-800">
                            <div className="flex items-start">
                              <span className="text-lg mr-2 mt-0.5">{getRiskDot(rate)}</span>
                              <div className="flex-1">
                                <div className="font-bold text-gray-900 mb-1">
                                  <span className={getRiskColor(rate)}>{tenure}: {rate}%</span>
                                  {item.includes('highest') && ' (highest risk period)'}
                                  {item.includes('lowest') && ' (lowest attrition)'}
                                </div>
                                <ul className="ml-4 space-y-1 text-gray-700">
                                  {departures && employees && (
                                    <li className="text-xs">
                                      <span className="font-semibold">{departures}</span> departures out of{' '}
                                      <span className="font-semibold">{employees}</span> employees
                                    </li>
                                  )}
                                  {earlyExit && (
                                    <li className="text-xs">
                                      <span className="font-semibold">{earlyExit}%</span> left within first 6 months
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  
                  {/* Special rendering for CRITICAL INSIGHTS */}
                  {isCriticalInsights && (
                    <ul className="space-y-3">
                      {section.items.map((item: string, itemIdx: number) => {
                        const parts = item.split(/(\d+(?:\.\d+)?x|\d+(?:\.\d+)?%|\d+%)/g);
                        return (
                          <li key={itemIdx} className="text-sm text-gray-800 flex items-start leading-relaxed">
                            <span className="text-yellow-600 mr-3 mt-1.5 font-bold">•</span>
                            <span className="flex-1">
                              {parts.map((part, partIdx) => {
                                if (/^\d+(\.\d+)?x$/.test(part) || /^\d+(\.\d+)?%$/.test(part)) {
                                  return (
                                    <span key={partIdx} className="font-bold text-gray-900">
                                      {part}
                                    </span>
                                  );
                                }
                                return <span key={partIdx}>{part}</span>;
                              })}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  
                  {/* Special rendering for TENURE IMPACT BY DEPARTMENT */}
                  {isTenureImpact && (
                    <div className="space-y-3">
                      {section.items.map((item: string, itemIdx: number) => {
                        // Parse: "Engineering 0-1 year: 32.1% (vs 15.8% overall eng attrition)"
                        const deptMatch = item.match(/^(\w+)\s+0-1\s+year:\s*(\d+\.\d+)%\s*\(vs\s*(\d+\.\d+)%\s*overall/);
                        if (deptMatch) {
                          const [, dept, firstYear, overall] = deptMatch;
                          const delta = (parseFloat(firstYear) - parseFloat(overall)).toFixed(1);
                          return (
                            <div key={itemIdx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 min-w-0">
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 text-sm mb-1 break-words">{dept}</div>
                                <div className="text-xs text-gray-600 break-words">
                                  First year: <span className="font-bold text-red-600">{firstYear}%</span> vs Overall: <span className="font-semibold">{overall}%</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1 text-red-600">
                                <ArrowUpRight className="w-4 h-4" />
                                <span className="text-sm font-bold">+{delta}%</span>
                              </div>
                            </div>
                          );
                        }
                        return (
                          <div key={itemIdx} className="text-sm text-gray-800 p-3 bg-white rounded-lg">
                            {item}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Special rendering for RETENTION PATTERNS */}
                  {isRetentionPatterns && (
                    <ul className="space-y-3">
                      {section.items.map((item: string, itemIdx: number) => {
                        const parts = item.split(/(\d+(?:\.\d+)?%|\d+#)/g);
                        return (
                          <li key={itemIdx} className="text-sm text-gray-800 flex items-start leading-relaxed">
                            <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                            <span className="flex-1">
                              {parts.map((part, partIdx) => {
                                if (/^\d+(\.\d+)?%$/.test(part)) {
                                  return (
                                    <span key={partIdx} className="font-bold text-green-700">
                                      {part}
                                    </span>
                                  );
                                }
                                if (part.includes('#')) {
                                  return (
                                    <span key={partIdx} className="font-bold text-gray-900">
                                      {part}
                                    </span>
                                  );
                                }
                                return <span key={partIdx}>{part}</span>;
                              })}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                  
                  {/* Special rendering for RECOMMENDATIONS */}
                  {isRecommendations && (
                    <ol className="space-y-3">
                      {section.items.map((item: string, itemIdx: number) => {
                        const parts = item.split(/(\d+(?:\.\d+)?%|\d+%)/g);
                        return (
                          <li key={itemIdx} className="flex items-start">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                              {itemIdx + 1}
                            </div>
                            <div className="flex-1 text-sm text-gray-800 bg-white rounded-lg p-3 border border-gray-200">
                              {parts.map((part, partIdx) => {
                                if (/^\d+(\.\d+)?%$/.test(part)) {
                                  return (
                                    <span key={partIdx} className="font-bold text-blue-700">
                                      {part}
                                    </span>
                                  );
                                }
                                return <span key={partIdx}>{part}</span>;
                              })}
                            </div>
                          </li>
                        );
                      })}
                    </ol>
                  )}
                  
                  {/* Default rendering for other sections */}
                  {!isTenureBracket && !isCriticalInsights && !isTenureImpact && !isRetentionPatterns && !isRecommendations && (
                    <>
                      {/* Render bar chart for breakdown sections if they contain percentages */}
                      {isBreakdown && section.items.some(item => item.includes('%')) && (
                        <div className="mb-4">
                          {renderBarChart(section.items)}
                        </div>
                      )}
                      
                      <ul className="space-y-2.5">
                        {section.items.map((item: string, itemIdx: number) => {
                          // Check if item contains comparison indicators
                          const hasComparison = item.includes('↑') || item.includes('↓') || item.includes('vs');
                          const parts = item.split(/(\d+(?:\.\d+)?%?|\d+)/g);
                          
                          return (
                            <li key={itemIdx} className="text-sm text-gray-800 flex items-start leading-relaxed">
                              <span className={`${hasComparison ? 'text-blue-600' : 'text-gray-400'} mr-3 mt-1.5 font-bold`}>•</span>
                              <span className="flex-1">
                                {parts.map((part, partIdx) => {
                                  // Highlight numbers and percentages
                                  if (/^\d+(\.\d+)?%?$/.test(part)) {
                                    return (
                                      <span key={partIdx} className="font-bold text-gray-900">
                                        {part}
                                      </span>
                                    );
                                  }
                                  // Highlight comparison indicators
                                  if (part.includes('↑') || part.includes('↓')) {
                                    return (
                                      <span key={partIdx} className="font-semibold text-blue-600">
                                        {part}
                                      </span>
                                    );
                                  }
                                  return <span key={partIdx}>{part}</span>;
                                })}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              );
            })}
            
            {/* COMPARISON TO INDUSTRY section - extracted from mainText */}
            {formattedContent?.mainText && formattedContent.mainText.includes('COMPARISON TO INDUSTRY') && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mt-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">COMPARISON TO INDUSTRY</h4>
                    <div className="text-sm text-gray-700 space-y-1">
                      {formattedContent.mainText.split('COMPARISON TO INDUSTRY:')[1]?.split('\n').filter(line => line.trim()).map((line, idx) => {
                        const benchmarkMatch = line.match(/(\d+)%/);
                        const aboveMatch = line.match(/(\d+)%\s+above/);
                        return (
                          <div key={idx} className="flex items-center space-x-2">
                            {benchmarkMatch && (
                              <span className="font-bold text-lg text-gray-900">{benchmarkMatch[1]}%</span>
                            )}
                            <span>{line.replace(/\d+%/g, '').trim()}</span>
                            {aboveMatch && (
                              <ArrowUpRight className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fallback to plain content if no formatting */}
            {!formattedContent && (
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{content}</p>
            )}

            {/* Chart Toggle Button */}
            {formattedContent?.chartData && (
              <div className="flex items-center justify-end mt-4 pt-3 border-t border-gray-200">
                <button
                  onClick={() => setShowChart(!showChart)}
                  className="flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all duration-200 group"
                  title={showChart ? 'Hide chart' : 'Visualize data'}
                >
                  {showChart ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Hide Chart</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>View as Chart</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Chart Visualization */}
            {showChart && formattedContent?.chartData && (
              <div className="mt-4 animate-fadeIn">
                <ChartVisualization
                  chartData={formattedContent.chartData}
                  onDownload={() => {
                    // Download functionality will be implemented
                    console.log('Download chart');
                  }}
                />
              </div>
            )}
          </div>
          <span className="text-xs text-gray-500 mt-2 block px-1">{formatTime(timestamp)}</span>
        </div>
      </div>
    </div>
  );
};

export default Message;
