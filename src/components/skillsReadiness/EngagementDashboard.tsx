import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, ScatterChart, Scatter } from 'recharts';
import { createPortal } from 'react-dom';
import type { EmployeeProfile } from '../../data/workforceReadinessSchema';

// Custom tooltip components
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{entry.value}/100</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{data.name || 'Employee'}</p>
        <p className="text-sm text-blue-600">
          Engagement: <span className="font-medium">{data.engagement}/100</span>
        </p>
        <p className="text-sm text-red-600">
          Flight Risk: <span className="font-medium">{data.flightRisk}/100</span>
        </p>
      </div>
    );
  }
  return null;
};

interface EngagementDashboardProps {
  profiles: EmployeeProfile[];
  drillDown: { view: 'overview' | 'skill' | 'employee' | 'reportees'; selectedSkill?: string; selectedEmployee?: string; selectedManagerId?: string };
  onDrillDown: (type: 'skill' | 'employee' | 'reportees', id: string, managerId?: string) => void;
}

// Tooltip component that renders outside table overflow
const CalculationTooltip: React.FC<{
  isVisible: boolean;
  position: { top: number; left: number };
  content: React.ReactNode;
}> = ({ isVisible, position, content }) => {
  if (!isVisible) return null;

  return createPortal(
    <div
      className="fixed pointer-events-none z-[9999] w-80 transition-opacity"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: isVisible ? 1 : 0,
        transform: 'translateY(-100%)',
        marginTop: '-8px',
      }}
    >
      <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
        {content}
      </div>
      <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
    </div>,
    document.body
  );
};

const EngagementDashboard: React.FC<EngagementDashboardProps> = ({ profiles, drillDown, onDrillDown }) => {
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    position: { top: number; left: number };
    content: React.ReactNode;
  }>({ visible: false, position: { top: 0, left: 0 }, content: null });
  
  // Engagement by department
  const engagementByDept = useMemo(() => {
    const deptMap = new Map<string, { totalEngagement: number; totalFlightRisk: number; count: number; employees: EmployeeProfile[] }>();
    
    profiles.forEach(profile => {
      const dept = profile.employee.businessUnit;
      const existing = deptMap.get(dept) || { totalEngagement: 0, totalFlightRisk: 0, count: 0, employees: [] };
      existing.totalEngagement += profile.performance.engagementScore;
      existing.totalFlightRisk += profile.performance.flightRiskScore;
      existing.count++;
      existing.employees.push(profile);
      deptMap.set(dept, existing);
    });

    return Array.from(deptMap.entries()).map(([dept, data]) => ({
      department: dept,
      averageEngagement: Math.round((data.totalEngagement / data.count) * 10) / 10,
      averageFlightRisk: Math.round((data.totalFlightRisk / data.count) * 10) / 10,
      employeeCount: data.count,
      employees: data.employees,
    })).sort((a, b) => b.averageEngagement - a.averageEngagement);
  }, [profiles]);

  // Engagement distribution
  const engagementDistribution = useMemo(() => {
    const ranges = [
      { label: '0-30', min: 0, max: 30, count: 0 },
      { label: '31-50', min: 31, max: 50, count: 0 },
      { label: '51-70', min: 51, max: 70, count: 0 },
      { label: '71-85', min: 71, max: 85, count: 0 },
      { label: '86-100', min: 86, max: 100, count: 0 },
    ];

    profiles.forEach(profile => {
      const score = profile.performance.engagementScore;
      const range = ranges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [profiles]);

  // Change readiness (combination of engagement, adaptability, and learning)
  const changeReadiness = useMemo(() => {
    return profiles.map(profile => ({
      employeeName: profile.employee.employeeName,
      role: profile.employee.currentRoleName,
      department: profile.employee.businessUnit,
      engagement: profile.performance.engagementScore,
      adaptability: profile.learning.adaptabilityScore,
      learningVelocity: profile.learning.learningVelocity,
      changeReadiness: Math.round(
        (profile.performance.engagementScore * 0.4) +
        (profile.learning.adaptabilityScore * 0.4) +
        (profile.learning.learningVelocity * 0.2)
      ),
      flightRisk: profile.performance.flightRiskScore,
      profile,
    })).sort((a, b) => b.changeReadiness - a.changeReadiness);
  }, [profiles]);


  // High flight risk employees
  const highRiskEmployees = useMemo(() => {
    return [...profiles]
      .filter(p => p.performance.flightRiskScore >= 50)
      .sort((a, b) => b.performance.flightRiskScore - a.performance.flightRiskScore)
      .slice(0, 10)
      .map(profile => ({
        employeeName: profile.employee.employeeName,
        role: profile.employee.currentRoleName,
        department: profile.employee.businessUnit,
        engagementScore: profile.performance.engagementScore,
        flightRiskScore: profile.performance.flightRiskScore,
        profile,
      }));
  }, [profiles]);

  // Engagement vs Flight Risk
  const engagementRisk = useMemo(() => {
    return profiles.map(profile => ({
      engagement: profile.performance.engagementScore,
      flightRisk: profile.performance.flightRiskScore,
      name: profile.employee.employeeName,
    }));
  }, [profiles]);

  // If drilling down to employee
  if (drillDown.view === 'employee' && drillDown.selectedEmployee) {
    const employee = profiles.find(p => p.employee.employeeName === drillDown.selectedEmployee);
    if (!employee) return null;

    const changeReadinessScore = Math.round(
      (employee.performance.engagementScore * 0.4) +
      (employee.learning.adaptabilityScore * 0.4) +
      (employee.learning.learningVelocity * 0.2)
    );

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Engagement Profile: {employee.employee.employeeName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-orange-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Readiness Score</div>
            <div className="text-3xl font-bold text-orange-600">{employee.readiness.readinessScore}/100</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Overall workforce readiness score (0-100)
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Engagement Score</div>
            <div className="text-3xl font-bold text-blue-600">{employee.performance.engagementScore}/100</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Overall employee engagement level
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Flight Risk Score</div>
            <div className="text-3xl font-bold text-red-600">{employee.performance.flightRiskScore}/100</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Likelihood of employee leaving the organization
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Change Readiness</div>
            <div className="text-3xl font-bold text-green-600">{changeReadinessScore}/100</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Readiness to adapt to organizational changes
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600 mb-2">Engagement</div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all" 
                style={{ width: `${employee.performance.engagementScore}%` }}
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  {employee.performance.engagementScore}/100
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600 mb-2">Flight Risk</div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div 
                className={`h-3 rounded-full transition-all ${
                  employee.performance.flightRiskScore >= 70 ? 'bg-red-600' :
                  employee.performance.flightRiskScore >= 50 ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${employee.performance.flightRiskScore}%` }}
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  {employee.performance.flightRiskScore}/100
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600 mb-2">Adaptability</div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div 
                className="bg-green-600 h-3 rounded-full transition-all" 
                style={{ width: `${employee.learning.adaptabilityScore}%` }}
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  {employee.learning.adaptabilityScore}/100
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600 mb-2">Learning Velocity</div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all" 
                style={{ width: `${employee.learning.learningVelocity}%` }}
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  {employee.learning.learningVelocity}/100
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600 mb-2">Change Readiness</div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div 
                className="bg-teal-600 h-3 rounded-full transition-all" 
                style={{ width: `${changeReadinessScore}%` }}
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  {changeReadinessScore}/100
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        </div>

        <CalculationTooltip
          isVisible={tooltipState.visible}
          position={tooltipState.position}
          content={tooltipState.content}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Engagement and Change Readiness
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Engagement by Department */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement vs Flight Risk by Department</h3>
          {(() => {
            const avgEngagement = engagementByDept.length > 0
              ? Math.round(engagementByDept.reduce((sum, d) => sum + d.averageEngagement, 0) / engagementByDept.length)
              : 0;
            const avgFlightRisk = engagementByDept.length > 0
              ? Math.round(engagementByDept.reduce((sum, d) => sum + d.averageFlightRisk, 0) / engagementByDept.length)
              : 0;
            const insight = avgEngagement >= 65 && avgFlightRisk <= 35
              ? `Healthy engagement levels - ${avgEngagement}/100 engagement with ${avgFlightRisk}/100 flight risk indicates stable workforce.`
              : avgFlightRisk > 50
                ? `High flight risk at ${avgFlightRisk}/100 requires immediate retention strategies to prevent talent loss.`
                : `Moderate engagement at ${avgEngagement}/100 - focus on improving employee experience to boost retention.`;
            return (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                <p className="text-xs text-blue-800">{insight}</p>
              </div>
            );
          })()}
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={engagementByDept}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar dataKey="averageEngagement" fill="#3b82f6" name="Avg Engagement" />
              <Bar dataKey="averageFlightRisk" fill="#ef4444" name="Avg Flight Risk" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Score Distribution</h3>
          {(() => {
            const highEngagement = engagementDistribution.filter(d => d.label.includes('61') || d.label.includes('81')).reduce((sum, d) => sum + d.count, 0);
            const total = engagementDistribution.reduce((sum, d) => sum + d.count, 0);
            const highPercent = total > 0 ? Math.round((highEngagement / total) * 100) : 0;
            const insight = highPercent >= 30
              ? `${highPercent}% of employees show high engagement (61-100), indicating a motivated and committed workforce.`
              : `Only ${highPercent}% demonstrate high engagement - prioritize employee experience initiatives to improve satisfaction.`;
            return (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                <p className="text-xs text-green-800">{insight}</p>
              </div>
            );
          })()}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="count" fill="#10b981" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Engagement vs Flight Risk */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement vs Flight Risk</h3>
        {(() => {
          const atRisk = engagementRisk.filter(e => e.engagement < 50 && e.flightRisk > 50).length;
          const champions = engagementRisk.filter(e => e.engagement >= 70 && e.flightRisk <= 30).length;
          const total = engagementRisk.length;
          const riskPercent = total > 0 ? Math.round((atRisk / total) * 100) : 0;
          const championPercent = total > 0 ? Math.round((champions / total) * 100) : 0;
          const insight = riskPercent > 15
            ? `${riskPercent}% are at high risk (low engagement, high flight risk) - immediate intervention needed to prevent turnover.`
            : championPercent >= 20
              ? `${championPercent}% are engagement champions (high engagement, low risk) - leverage as change agents and mentors.`
              : `Balanced distribution - monitor engagement trends to proactively address potential retention issues.`;
          return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
              <p className="text-xs text-red-800">{insight}</p>
            </div>
          );
        })()}
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="engagement" name="Engagement" domain={[0, 100]} />
            <YAxis dataKey="flightRisk" name="Flight Risk" domain={[0, 100]} />
            <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Employees" data={engagementRisk} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Top Engaged Employees */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Engaged Employees</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span className="relative group cursor-help" title="Employee name">
                    Employee
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span className="relative group cursor-help" title="Current job role">
                    Role
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span className="relative group cursor-help" title="Business unit or department">
                    Department
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Employee engagement score (0-100)"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Engagement Score:</div>
                            <div>Overall employee engagement level on a scale of 0-100</div>
                            <div className="mt-2 text-xs">Higher scores indicate better employee engagement, satisfaction, and commitment to the organization.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Engagement
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Flight risk score (0-100)"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Flight Risk Score:</div>
                            <div>Likelihood of employee leaving the organization on a scale of 0-100</div>
                            <div className="mt-2 text-xs">Higher scores indicate higher risk of employee turnover. Factors include engagement, performance, tenure, and market conditions.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Flight Risk
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Change readiness score (0-100)"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Change Readiness Calculation:</div>
                            <div>(Engagement × 0.4) + (Adaptability Score × 0.4) + (Learning Velocity × 0.2)</div>
                            <div className="mt-2 text-xs">Measures readiness to adapt to organizational changes, new processes, and evolving role requirements.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Change Readiness
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span className="relative group cursor-help" title="View detailed employee profile">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {changeReadiness.slice(0, 10).map((emp, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.employeeName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{emp.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{emp.department}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      emp.engagement >= 70 ? 'bg-green-100 text-green-800' :
                      emp.engagement >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {emp.engagement}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      emp.flightRisk >= 70 ? 'bg-red-100 text-red-800' :
                      emp.flightRisk >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {emp.flightRisk}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{emp.changeReadiness}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onDrillDown('employee', emp.employeeName)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* High Flight Risk Employees */}
      {highRiskEmployees.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">High Flight Risk Employees (Requires Attention)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span className="relative group cursor-help" title="Employee name">
                      Employee
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span className="relative group cursor-help" title="Current job role">
                      Role
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span className="relative group cursor-help" title="Business unit or department">
                      Department
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span 
                      className="relative group cursor-help inline-block" 
                      title="Employee engagement score (0-100)"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipState({
                          visible: true,
                          position: { top: rect.top, left: rect.left },
                          content: (
                            <>
                              <div className="font-semibold mb-1">Engagement Score:</div>
                              <div>Overall employee engagement level on a scale of 0-100</div>
                              <div className="mt-2 text-xs">Higher scores indicate better employee engagement and satisfaction.</div>
                            </>
                          ),
                        });
                      }}
                      onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                    >
                      Engagement
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span 
                      className="relative group cursor-help inline-block" 
                      title="Flight risk score (0-100)"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipState({
                          visible: true,
                          position: { top: rect.top, left: rect.left },
                          content: (
                            <>
                              <div className="font-semibold mb-1">Flight Risk Score:</div>
                              <div>Likelihood of employee leaving the organization on a scale of 0-100</div>
                              <div className="mt-2 text-xs">Higher scores indicate higher risk of employee turnover.</div>
                            </>
                          ),
                        });
                      }}
                      onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                    >
                      Flight Risk
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span className="relative group cursor-help" title="View detailed employee profile">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {highRiskEmployees.map((emp, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.role}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.engagementScore}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        {emp.flightRiskScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => onDrillDown('employee', emp.employeeName)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <CalculationTooltip
        isVisible={tooltipState.visible}
        position={tooltipState.position}
        content={tooltipState.content}
      />
    </div>
  );
};

export default EngagementDashboard;

