export interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  formattedContent?: FormattedContent;
}

export interface FormattedContent {
  mainText?: string;
  keyMetrics?: MetricCallout[];
  sections?: ContentSection[];
  visualizations?: Visualization[];
  chartData?: ChartData;
}

export interface MetricCallout {
  value: string;
  label: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  trend?: 'up' | 'down' | 'stable';
  icon?: string;
}

export interface ContentSection {
  title: string;
  type: 'insights' | 'recommendations' | 'trends' | 'breakdown' | 'analysis';
  items: string[];
}

export interface BarConfig {
  key: string;
  name: string;
  color: string;
}

export interface ReferenceLine {
  value: number;
  label: string;
  color: string;
  strokeDasharray?: string;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'donut' | 'horizontalBar';
  title?: string;
  data: Array<{ [key: string]: string | number }>;
  xAxisKey?: string;
  yAxisKey?: string;
  dataKey?: string;
  nameKey?: string;
  valueKey?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  bars?: BarConfig[];
  lineColor?: string;
  referenceLine?: ReferenceLine;
}

export interface Visualization {
  type: 'bar' | 'progress' | 'comparison';
  data: any;
  chartData?: ChartData;
}

export interface QuestionData {
  question: string;
  response: FormattedContent;
  alternateQuestions?: string[];
}

export const sampleQuestions: QuestionData[] = [
  {
    question: "What is our current attrition rate by department?",
    response: {
      mainText: "Based on the last 12 months, here's the attrition breakdown by department:\n\nThe industry benchmark for tech companies is 13.2%, placing us slightly below average overall but above in Engineering and Sales.",
      keyMetrics: [
        { value: "12.3%", label: "Overall Attrition", color: "blue", trend: "stable" },
        { value: "18.2%", label: "Sales (Highest)", color: "yellow", trend: "up" },
        { value: "7.1%", label: "Operations (Lowest)", color: "green", trend: "down" },
        { value: "13.2%", label: "Industry Benchmark", color: "purple" },
      ],
      sections: [
        {
          title: "KEY INSIGHTS",
          type: "insights",
          items: [
            "Overall company attrition: 12.3%",
            "Engineering: 15.8% (↑ 3.2% from last quarter)",
            "Sales: 18.2% (highest across all departments)",
            "Marketing: 9.4%",
            "Operations: 7.1% (lowest)",
            "HR: 10.5%",
          ]
        },
        {
          title: "NOTABLE TRENDS",
          type: "trends",
          items: [
            "Engineering attrition increased significantly, primarily among mid-level engineers (5-7 years experience)",
            "Sales attrition is driven by Account Executives in the enterprise segment",
            "Operations has maintained the lowest attrition for 3 consecutive quarters",
          ]
        }
      ],
      chartData: {
        type: 'bar',
        title: 'Attrition Rate by Department',
        data: [
          { department: 'Engineering', rate: 15.8, color: '#EF4444' },
          { department: 'Sales', rate: 18.2, color: '#DC2626' },
          { department: 'Marketing', rate: 9.4, color: '#10B981' },
          { department: 'Operations', rate: 7.1, color: '#059669' },
          { department: 'HR', rate: 10.5, color: '#F59E0B' },
        ],
        xAxisKey: 'department',
        yAxisKey: 'rate',
        dataKey: 'rate',
        yAxisLabel: 'Attrition Rate (%)',
      }
    }
  },
  {
    question: "Show me diversity metrics for engineering roles",
    response: {
      mainText: "Here's the current diversity breakdown for Engineering (total headcount: 847):",
      keyMetrics: [
        { value: "847", label: "Total Engineers", color: "blue" },
        { value: "26.8%", label: "Female", color: "purple", trend: "down" },
        { value: "19.3%", label: "Female Leadership", color: "yellow", trend: "down" },
        { value: "12.1%", label: "URM Leadership", color: "purple" },
      ],
      sections: [
        {
          title: "GENDER DISTRIBUTION",
          type: "breakdown",
          items: [
            "Male: 71.2% (603 employees)",
            "Female: 26.8% (227 employees)",
            "Non-binary: 2.0% (17 employees)",
          ]
        },
        {
          title: "ETHNICITY BREAKDOWN",
          type: "breakdown",
          items: [
            "Asian: 42.3%",
            "White: 38.7%",
            "Hispanic/Latino: 9.2%",
            "Black/African American: 6.4%",
            "Other/Mixed: 3.4%",
          ]
        },
        {
          title: "LEADERSHIP REPRESENTATION (Engineering Managers & above)",
          type: "breakdown",
          items: [
            "Female representation: 19.3% (vs 26.8% overall)",
            "Underrepresented minorities: 12.1%",
          ]
        },
        {
          title: "KEY INSIGHTS",
          type: "insights",
          items: [
            "Gender gap is wider at leadership levels",
            "Female representation decreased by 1.2% year-over-year",
            "Asian representation increased by 3.4% due to recent campus hiring initiatives",
          ]
        }
      ],
      chartData: {
        type: 'pie',
        title: 'Gender Distribution in Engineering',
        data: [
          { name: 'Male', value: 71.2, count: 603, color: '#3B82F6' },
          { name: 'Female', value: 26.8, count: 227, color: '#EC4899' },
          { name: 'Non-binary', value: 2.0, count: 17, color: '#8B5CF6' },
        ],
        nameKey: 'name',
        valueKey: 'value',
        colors: ['#3B82F6', '#EC4899', '#8B5CF6'],
      }
    }
  },
  {
    question: "What are the top skill gaps in our organization?",
    response: {
      mainText: "Based on performance reviews, project demands, and manager feedback, here are the critical skill gaps:",
      keyMetrics: [
        { value: "234", label: "Cloud Architecture Gap", color: "yellow", trend: "up" },
        { value: "178", label: "Data Science & ML", color: "blue", trend: "up" },
        { value: "312", label: "Leadership Training", color: "purple", trend: "up" },
        { value: "89", label: "Cybersecurity", color: "yellow", trend: "up" },
      ],
      sections: [
        {
          title: "TOP 5 SKILL GAPS",
          type: "analysis",
          items: [
            "1. Cloud Architecture (AWS/Azure) - 234 employees need upskilling\n   Impact: High | Urgency: Critical",
            "2. Data Science & ML - 178 employees\n   Impact: High | Urgency: High",
            "3. Product Management - 145 employees\n   Impact: Medium | Urgency: High",
            "4. Leadership & People Management - 312 employees\n   Impact: High | Urgency: Medium",
            "5. Cybersecurity - 89 employees\n   Impact: Critical | Urgency: Critical",
          ]
        },
        {
          title: "RECOMMENDATIONS",
          type: "recommendations",
          items: [
            "67% of engineering teams report cloud architecture gaps blocking projects",
            "Data science skills are needed across Product, Engineering, and Marketing",
            "45% of new managers lack formal leadership training",
            "Consider partnership with cloud training platforms for rapid upskilling",
          ]
        }
      ],
      chartData: {
        type: 'horizontalBar',
        title: 'Top Skill Gaps by Employee Count',
        data: [
          { skill: 'Cloud Architecture', count: 234, color: '#EF4444' },
          { skill: 'Data Science & ML', count: 178, color: '#F59E0B' },
          { skill: 'Product Management', count: 145, color: '#10B981' },
          { skill: 'Leadership', count: 312, color: '#3B82F6' },
          { skill: 'Cybersecurity', count: 89, color: '#DC2626' },
        ],
        xAxisKey: 'count',
        yAxisKey: 'skill',
        dataKey: 'skill',
        xAxisLabel: 'Number of Employees',
      }
    }
  },
  {
    question: "What's our average time to fill open positions?",
    response: {
      mainText: "Here's the time-to-fill analysis for the past 6 months:",
      keyMetrics: [
        { value: "42 days", label: "Average Time to Fill", color: "yellow", trend: "up" },
        { value: "36 days", label: "Industry Benchmark", color: "green" },
        { value: "56 days", label: "Engineering (Longest)", color: "yellow", trend: "up" },
        { value: "28 days", label: "Operations (Fastest)", color: "green", trend: "down" },
      ],
      sections: [
        {
          title: "OVERALL METRICS",
          type: "breakdown",
          items: [
            "Average time to fill: 42 days",
            "Industry benchmark: 36 days (we're 17% slower)",
          ]
        },
        {
          title: "BY DEPARTMENT",
          type: "breakdown",
          items: [
            "Engineering: 56 days (longest)",
            "Sales: 38 days",
            "Marketing: 35 days",
            "Operations: 28 days (fastest)",
            "Product: 51 days",
          ]
        },
        {
          title: "BY ROLE LEVEL",
          type: "breakdown",
          items: [
            "Entry level: 32 days",
            "Mid-level: 45 days",
            "Senior: 58 days",
            "Leadership: 73 days",
          ]
        },
        {
          title: "BOTTLENECK ANALYSIS",
          type: "analysis",
          items: [
            "Technical screening stage adds 12 days on average for Engineering roles",
            "Senior roles have 2.3x more interview rounds than entry-level",
            "34% of delays occur in offer negotiation phase",
          ]
        },
        {
          title: "INSIGHTS",
          type: "insights",
          items: [
            "Engineering and Product roles are most challenging to fill, particularly for senior positions requiring specialized skills like ML/AI.",
          ]
        }
      ],
      chartData: {
        type: 'bar',
        title: 'Average Time to Fill by Department',
        data: [
          { department: 'Engineering', days: 56, benchmark: 36 },
          { department: 'Sales', days: 38, benchmark: 36 },
          { department: 'Marketing', days: 35, benchmark: 36 },
          { department: 'Operations', days: 28, benchmark: 36 },
          { department: 'Product', days: 51, benchmark: 36 },
        ],
        xAxisKey: 'department',
        yAxisKey: 'days',
        yAxisLabel: 'Days',
        bars: [
          { key: 'days', name: 'Our Time', color: '#3B82F6' },
          { key: 'benchmark', name: 'Industry Benchmark', color: '#94A3B8' },
        ],
      }
    }
  },
  {
    question: "Show me our headcount growth trend over the last year",
    response: {
      mainText: "Here's the headcount evolution over the past 12 months:",
      keyMetrics: [
        { value: "+16.3%", label: "Net Growth", color: "green", trend: "up" },
        { value: "3,312", label: "Current Headcount", color: "blue" },
        { value: "+465", label: "Net Employees Added", color: "green", trend: "up" },
        { value: "+198", label: "Engineering Growth", color: "green", trend: "up" },
      ],
      sections: [
        {
          title: "OVERALL GROWTH",
          type: "breakdown",
          items: [
            "Starting headcount (Nov 2024): 2,847",
            "Current headcount (Nov 2025): 3,312",
            "Net growth: +465 employees (+16.3%)",
          ]
        },
        {
          title: "QUARTERLY BREAKDOWN",
          type: "breakdown",
          items: [
            "Q4 2024: +87 employees",
            "Q1 2025: +156 employees (highest growth quarter)",
            "Q2 2025: +142 employees",
            "Q3 2025: +80 employees (slowest due to hiring freeze)",
          ]
        },
        {
          title: "BY DEPARTMENT",
          type: "breakdown",
          items: [
            "Engineering: +198 (42.6% of growth)",
            "Sales: +112 (24.1%)",
            "Product: +67 (14.4%)",
            "Marketing: +45 (9.7%)",
            "Operations: +43 (9.2%)",
          ]
        },
        {
          title: "KEY INSIGHTS",
          type: "insights",
          items: [
            "Growth rate slowed by 48% in Q3 due to macroeconomic conditions",
            "Engineering growth focused on AI/ML roles (64% of eng hires)",
            "Sales expansion primarily in enterprise segment (+73 Account Executives)",
            "Current growth trajectory: 4.3% quarter-over-quarter",
          ]
        }
      ],
      chartData: {
        type: 'line',
        title: 'Headcount Growth Trend',
        data: [
          { month: 'Nov 2024', headcount: 2847 },
          { month: 'Dec 2024', headcount: 2903 },
          { month: 'Jan 2025', headcount: 2934 },
          { month: 'Feb 2025', headcount: 3003 },
          { month: 'Mar 2025', headcount: 3089 },
          { month: 'Apr 2025', headcount: 3145 },
          { month: 'May 2025', headcount: 3231 },
          { month: 'Jun 2025', headcount: 3287 },
          { month: 'Jul 2025', headcount: 3312 },
        ],
        xAxisKey: 'month',
        yAxisKey: 'headcount',
        dataKey: 'headcount',
        yAxisLabel: 'Total Headcount',
        lineColor: '#10B981',
      }
    }
  },
  {
    question: "What's our employee satisfaction score and how has it changed?",
    response: {
      mainText: "Here's the latest employee satisfaction analysis from our quarterly survey:",
      keyMetrics: [
        { value: "7.8/10", label: "Overall Satisfaction", color: "green", trend: "up" },
        { value: "+0.3", label: "Quarter Change", color: "green", trend: "up" },
        { value: "78%", label: "Positive Sentiment", color: "blue" },
      ],
      sections: [
        {
          title: "BY CATEGORY",
          type: "breakdown",
          items: [
            "Work-life balance: 8.2/10 (↑ 0.5)",
            "Career growth: 7.1/10 (↓ 0.2)",
            "Compensation: 7.5/10 (stable)",
            "Management: 7.9/10 (↑ 0.4)",
            "Company culture: 8.4/10 (↑ 0.3)",
            "Tools & resources: 7.3/10 (↓ 0.1)",
          ]
        },
        {
          title: "RISK INDICATORS",
          type: "insights",
          items: [
            "12% of employees scored below 5/10 (flight risk)",
            "Career growth concerns highest among mid-level engineers",
            "89% would recommend company to friends (eNPS: +67)",
          ]
        }
      ],
      chartData: {
        type: 'bar',
        title: 'Employee Satisfaction by Category',
        data: [
          { category: 'Work-life balance', score: 8.2, color: '#10B981' },
          { category: 'Career growth', score: 7.1, color: '#F59E0B' },
          { category: 'Compensation', score: 7.5, color: '#3B82F6' },
          { category: 'Management', score: 7.9, color: '#8B5CF6' },
          { category: 'Company culture', score: 8.4, color: '#10B981' },
          { category: 'Tools & resources', score: 7.3, color: '#06B6D4' },
        ],
        xAxisKey: 'category',
        yAxisKey: 'score',
        dataKey: 'score',
        yAxisLabel: 'Satisfaction Score (out of 10)',
      }
    }
  },
  {
    question: "Which teams have the highest performance ratings?",
    response: {
      mainText: "Based on the latest performance review cycle, here's the performance distribution:",
      keyMetrics: [
        { value: "4.3/5.0", label: "Top Team (Platform Eng)", color: "green", trend: "up" },
        { value: "3.7/5.0", label: "Company Average", color: "blue" },
        { value: "34.7%", label: "Exceeds Expectations", color: "green" },
      ],
      sections: [
        {
          title: "TOP PERFORMING TEAMS",
          type: "breakdown",
          items: [
            "1. Platform Engineering: 4.3/5.0",
            "2. Product Design: 4.2/5.0",
            "3. Data Analytics: 4.1/5.0",
            "4. Customer Success: 4.0/5.0",
            "5. DevOps: 3.9/5.0",
          ]
        },
        {
          title: "INSIGHTS",
          type: "insights",
          items: [
            "Teams with clearer OKRs and regular feedback show 18% higher average ratings",
            "Platform Engineering's success correlates with their bi-weekly sprint reviews and peer recognition program",
            "23% of employees improved their rating from last cycle",
          ]
        }
      ],
      chartData: {
        type: 'bar',
        title: 'Top Performing Teams',
        data: [
          { team: 'Platform Engineering', rating: 4.3, color: '#10B981' },
          { team: 'Product Design', rating: 4.2, color: '#3B82F6' },
          { team: 'Data Analytics', rating: 4.1, color: '#8B5CF6' },
          { team: 'Customer Success', rating: 4.0, color: '#F59E0B' },
          { team: 'DevOps', rating: 3.9, color: '#06B6D4' },
        ],
        xAxisKey: 'team',
        yAxisKey: 'rating',
        dataKey: 'rating',
        yAxisLabel: 'Performance Rating (out of 5.0)',
      }
    }
  },
  {
    question: "What's our internal mobility rate and which roles see the most movement?",
    response: {
      mainText: "Internal mobility analysis for the past 12 months:",
      keyMetrics: [
        { value: "11.8%", label: "Mobility Rate", color: "blue" },
        { value: "391", label: "Employees Moved", color: "green" },
        { value: "18 months", label: "Avg Time Before Move", color: "purple" },
      ],
      sections: [
        {
          title: "TYPES OF MOVEMENT",
          type: "breakdown",
          items: [
            "Lateral moves (same level): 58.3% (228 employees)",
            "Promotions: 32.2% (126 employees)",
            "Department transfers: 9.5% (37 employees)",
          ]
        },
        {
          title: "INSIGHTS",
          type: "insights",
          items: [
            "Employees who move internally have 34% lower attrition rates",
            "82% of internal candidates preferred over external for open positions",
            "Internal mobility program launched 8 months ago increased movement by 43%",
          ]
        }
      ],
      chartData: {
        type: 'pie',
        title: 'Internal Mobility by Movement Type',
        data: [
          { name: 'Lateral moves', value: 58.3, count: 228, color: '#3B82F6' },
          { name: 'Promotions', value: 32.2, count: 126, color: '#10B981' },
          { name: 'Department transfers', value: 9.5, count: 37, color: '#F59E0B' },
        ],
        nameKey: 'name',
        valueKey: 'value',
        colors: ['#3B82F6', '#10B981', '#F59E0B'],
      }
    }
  },
  {
    question: "What are our compensation benchmarks compared to market rates?",
    response: {
      mainText: "Compensation analysis versus market rates (based on latest Radford survey):",
      keyMetrics: [
        { value: "97th", label: "Base Salary Percentile", color: "yellow" },
        { value: "102nd", label: "Total Comp Percentile", color: "green" },
        { value: "115th", label: "Equity Percentile", color: "green", trend: "up" },
      ],
      sections: [
        {
          title: "BY ROLE FAMILY",
          type: "breakdown",
          items: [
            "Engineering Entry level: 95% of market (at risk)",
            "Engineering Senior: 103% of market",
            "Sales SDR/BDR: 92% of market (at risk)",
            "Enterprise AE: 112% of market",
            "Product managers: 101% of market",
          ]
        },
        {
          title: "AT-RISK POSITIONS",
          type: "recommendations",
          items: [
            "Entry-level Engineering and SDR roles are below market",
            "Recommend 5-8% adjustment to remain competitive and reduce early-career attrition",
          ]
        }
      ],
      chartData: {
        type: 'bar',
        title: 'Compensation vs Market Rates by Role Level',
        data: [
          { role: 'Entry Level (L1-L2)', company: 95, market: 100 },
          { role: 'Mid Level (L3-L4)', company: 98, market: 100 },
          { role: 'Senior (L5-L6)', company: 103, market: 100 },
          { role: 'Staff+ (L7+)', company: 108, market: 100 },
        ],
        xAxisKey: 'role',
        yAxisKey: 'company',
        yAxisLabel: 'Percent of Market Rate',
        bars: [
          { key: 'company', name: 'Our Compensation', color: '#3B82F6' },
          { key: 'market', name: 'Market Benchmark', color: '#94A3B8' },
        ],
      }
    }
  },
  {
    question: "Show me our training and development program participation rates",
    response: {
      mainText: "Training and development program analytics for this year:",
      keyMetrics: [
        { value: "86%", label: "Participation Rate", color: "green" },
        { value: "32 hrs", label: "Avg Hours/Employee", color: "blue" },
        { value: "78%", label: "Budget Utilization", color: "yellow" },
      ],
      sections: [
        {
          title: "TOP PROGRAMS BY ENROLLMENT",
          type: "breakdown",
          items: [
            "1. Leadership Fundamentals: 412 employees",
            "2. AWS Cloud Certification: 387 employees",
            "3. Data Analytics with Python: 298 employees",
            "4. Effective Communication: 276 employees",
            "5. Agile Project Management: 234 employees",
          ]
        },
        {
          title: "ROI INDICATORS",
          type: "insights",
          items: [
            "Employees completing leadership training promoted 2.3x more often",
            "Cloud certification completers show 23% higher performance ratings",
            "Training participants have 19% lower attrition rates",
          ]
        }
      ],
      chartData: {
        type: 'bar',
        title: 'Training Participation by Department',
        data: [
          { department: 'Engineering', participation: 94, hours: 38, color: '#3B82F6' },
          { department: 'Product', participation: 89, hours: 35, color: '#10B981' },
          { department: 'Sales', participation: 83, hours: 28, color: '#F59E0B' },
          { department: 'Marketing', participation: 81, hours: 26, color: '#8B5CF6' },
          { department: 'Operations', participation: 78, hours: 24, color: '#06B6D4' },
        ],
        xAxisKey: 'department',
        yAxisKey: 'participation',
        dataKey: 'participation',
        yAxisLabel: 'Participation Rate (%)',
      }
    }
  },
  {
    question: "Show me attrition rate by tenure",
    alternateQuestions: [
      "attrition rate by tenure",
      "attrition by years of service",
      "attrition breakdown by employee tenure",
      "show attrition by how long employees have been here"
    ],
    response: {
      mainText: "Here's the attrition analysis broken down by employee tenure over the last 12 months:\n\nCOMPARISON TO INDUSTRY:\nTech industry benchmark for 0-1 year attrition: 22%\nWe're 29% above industry standard for early-tenure attrition.",
      keyMetrics: [
        { value: "28.4%", label: "0-1 Year (Highest)", color: "yellow", trend: "up" },
        { value: "6.2%", label: "5-7 Years (Lowest)", color: "green", trend: "down" },
        { value: "12.3%", label: "Company Average", color: "blue" },
        { value: "22%", label: "Industry Benchmark", color: "purple" },
      ],
      sections: [
        {
          title: "ATTRITION BY TENURE BRACKET",
          type: "breakdown",
          items: [
            "0-1 years: 28.4% (highest risk period) - 142 departures out of 500 employees - 67% left within first 6 months",
            "1-2 years: 18.7% - 89 departures out of 476 employees - Critical period after initial onboarding",
            "2-3 years: 11.3% - 51 departures out of 451 employees - Stabilization begins",
            "3-5 years: 8.9% - 67 departures out of 753 employees - Most stable mid-tenure group",
            "5-7 years: 6.2% (lowest attrition) - 28 departures out of 452 employees - Highly engaged, invested employees",
            "7-10 years: 9.4% - 34 departures out of 362 employees - Slight uptick, career progression related",
            "10+ years: 7.8% - 28 departures out of 359 employees - Senior employees, generally stable",
          ]
        },
        {
          title: "CRITICAL INSIGHTS",
          type: "insights",
          items: [
            "First-year attrition is 2.3x higher than company average - major red flag",
            "The \"danger zone\" is clearly in the 0-2 year tenure bracket",
            "62% of all first-year departures occur in Engineering and Sales departments",
            "Exit interviews reveal: unclear expectations (34%), limited growth visibility (28%), better external offers (22%)",
          ]
        },
        {
          title: "TENURE IMPACT BY DEPARTMENT",
          type: "breakdown",
          items: [
            "Engineering 0-1 year: 32.1% (vs 15.8% overall eng attrition)",
            "Sales 0-1 year: 35.6% (vs 18.2% overall sales attrition)",
            "Product 0-1 year: 24.3% (vs 12.1% overall product attrition)",
          ]
        },
        {
          title: "RETENTION PATTERNS",
          type: "insights",
          items: [
            "Employees who complete 2 years have 85% likelihood of staying 5+ years",
            "Internal mentorship programs reduce 0-1 year attrition by 34%",
            "Manager quality is the #1 predictor of first-year retention",
          ]
        },
        {
          title: "RECOMMENDATIONS",
          type: "recommendations",
          items: [
            "Enhance 90-day onboarding experience with structured check-ins",
            "Implement \"30-60-90 day\" manager touchpoints for all new hires",
            "Assign peer buddies in first 6 months (pilot showed 41% reduction in early attrition)",
            "Review compensation for 0-2 year employees - 23% cite better external offers",
            "Create clearer career progression frameworks visible from day one",
          ]
        }
      ],
      chartData: {
        type: 'bar',
        title: 'Attrition Rate by Employee Tenure',
        data: [
          { tenure: '0-1 years', rate: 28.4, color: '#DC2626', employees: 500, departures: 142 },
          { tenure: '1-2 years', rate: 18.7, color: '#EF4444', employees: 476, departures: 89 },
          { tenure: '2-3 years', rate: 11.3, color: '#F59E0B', employees: 451, departures: 51 },
          { tenure: '3-5 years', rate: 8.9, color: '#10B981', employees: 753, departures: 67 },
          { tenure: '5-7 years', rate: 6.2, color: '#059669', employees: 452, departures: 28 },
          { tenure: '7-10 years', rate: 9.4, color: '#F59E0B', employees: 362, departures: 34 },
          { tenure: '10+ years', rate: 7.8, color: '#10B981', employees: 359, departures: 28 },
        ],
        xAxisKey: 'tenure',
        yAxisKey: 'rate',
        dataKey: 'rate',
        yAxisLabel: 'Attrition Rate (%)',
        referenceLine: {
          value: 12.3,
          label: 'Company Average (12.3%)',
          color: '#6B7280',
          strokeDasharray: '5 5',
        },
      }
    }
  },
];

export function findResponse(question: string): FormattedContent | null {
  const normalizedQuestion = question.toLowerCase().trim();
  
  // First try exact match
  let match = sampleQuestions.find(
    (item) => item.question.toLowerCase().trim() === normalizedQuestion
  );
  
  // If no exact match, check alternate questions
  if (!match) {
    match = sampleQuestions.find((item) => {
      // Check if any alternate question matches
      if (item.alternateQuestions) {
        return item.alternateQuestions.some(alt => {
          const normalizedAlt = alt.toLowerCase();
          return normalizedQuestion.includes(normalizedAlt) || 
                 normalizedAlt.includes(normalizedQuestion) ||
                 normalizedQuestion === normalizedAlt;
        });
      }
      return false;
    });
  }
  
  // If still no match, try fuzzy matching on key terms
  if (!match) {
    const questionWords = normalizedQuestion.split(/\s+/).filter(w => w.length > 3);
    
    match = sampleQuestions.find((item) => {
      const itemQuestion = item.question.toLowerCase();
      // Check if at least 2 key words match
      const matchingWords = questionWords.filter(word => itemQuestion.includes(word));
      return matchingWords.length >= 2;
    });
  }
  
  // Special handling for tenure-related questions
  if (!match && (normalizedQuestion.includes('tenure') || normalizedQuestion.includes('years of service'))) {
    match = sampleQuestions.find(item => item.question.toLowerCase().includes('tenure'));
  }
  
  return match ? match.response : null;
}
