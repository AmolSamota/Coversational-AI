import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
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
          Leadership: <span className="font-medium">{data.leadership}/100</span>
        </p>
        <p className="text-sm text-green-600">
          Succession: <span className="font-medium">{data.succession}/100</span>
        </p>
        <p className="text-sm text-purple-600">
          Mentorship: <span className="font-medium">{data.mentorship}/100</span>
        </p>
      </div>
    );
  }
  return null;
};

interface LeadershipDashboardProps {
  profiles: EmployeeProfile[];
  allProfiles?: EmployeeProfile[];
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

const LeadershipDashboard: React.FC<LeadershipDashboardProps> = ({ profiles, allProfiles, drillDown, onDrillDown }) => {
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    position: { top: number; left: number };
    content: React.ReactNode;
  }>({ visible: false, position: { top: 0, left: 0 }, content: null });
  
  // Use allProfiles for finding reportees (they might be filtered out)
  const allProfilesForLookup = allProfiles || profiles;
  // Leadership potential by department
  const leadershipByDept = useMemo(() => {
    const deptMap = new Map<string, { total: number; count: number; employees: EmployeeProfile[] }>();
    
    profiles.forEach(profile => {
      const dept = profile.employee.businessUnit;
      const existing = deptMap.get(dept) || { total: 0, count: 0, employees: [] };
      existing.total += profile.leadership.leadershipPotential;
      existing.count++;
      existing.employees.push(profile);
      deptMap.set(dept, existing);
    });

    return Array.from(deptMap.entries()).map(([dept, data]) => ({
      department: dept,
      averagePotential: Math.round((data.total / data.count) * 10) / 10,
      employeeCount: data.count,
      employees: data.employees,
    })).sort((a, b) => b.averagePotential - a.averagePotential);
  }, [profiles]);

  // Succession readiness distribution
  const successionDistribution = useMemo(() => {
    const ranges = [
      { label: '0-30', min: 0, max: 30, count: 0 },
      { label: '31-50', min: 31, max: 50, count: 0 },
      { label: '51-70', min: 51, max: 70, count: 0 },
      { label: '71-85', min: 71, max: 85, count: 0 },
      { label: '86-100', min: 86, max: 100, count: 0 },
    ];

    profiles.forEach(profile => {
      const score = profile.leadership.successionReadiness;
      const range = ranges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [profiles]);

  // Top leadership candidates
  const topLeaders = useMemo(() => {
    return [...profiles]
      .sort((a, b) => b.leadership.leadershipPotential - a.leadership.leadershipPotential)
      .slice(0, 10)
      .map(profile => ({
        employeeName: profile.employee.employeeName,
        role: profile.employee.currentRoleName,
        department: profile.employee.businessUnit,
        leadershipPotential: profile.leadership.leadershipPotential,
        successionReadiness: profile.leadership.successionReadiness,
        mentorshipActivity: profile.leadership.mentorshipActivity,
        teamSize: profile.leadership.teamSizeManaged || 0,
        profile,
      }));
  }, [profiles]);

  // Leadership vs Succession scatter
  const leadershipScatter = useMemo(() => {
    return profiles.map(profile => ({
      leadership: profile.leadership.leadershipPotential,
      succession: profile.leadership.successionReadiness,
      mentorship: profile.leadership.mentorshipActivity,
      name: profile.employee.employeeName,
    }));
  }, [profiles]);

  // Current managers
  const managers = useMemo(() => {
    return profiles.filter(p => p.employee.leadershipFlag === 'People Manager').map(profile => {
      // Count actual direct reports (use allProfiles to get accurate count)
      const actualReportCount = allProfilesForLookup.filter(p => p.employee.managerId === profile.employee.employeeId).length;
      return {
        employeeName: profile.employee.employeeName,
        employeeId: profile.employee.employeeId,
        role: profile.employee.currentRoleName,
        department: profile.employee.businessUnit,
        teamSize: actualReportCount || profile.leadership.teamSizeManaged || 0,
        mentorshipActivity: profile.leadership.mentorshipActivity,
        successionReadiness: profile.leadership.successionReadiness,
        profile,
      };
    });
  }, [profiles, allProfilesForLookup]);

  // Get direct reports for a manager (use allProfiles to find reportees even if filtered)
  const getDirectReports = (managerId: string): EmployeeProfile[] => {
    return allProfilesForLookup.filter(p => p.employee.managerId === managerId);
  };

  // If drilling down to reportees
  if (drillDown.view === 'reportees' && drillDown.selectedManagerId) {
    const manager = allProfilesForLookup.find(p => p.employee.employeeId === drillDown.selectedManagerId);
    const directReports = getDirectReports(drillDown.selectedManagerId);

    if (!manager) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Direct Reports: {manager.employee.employeeName}
        </h2>
        <p className="text-gray-600 mb-6">{manager.employee.currentRoleName} • {manager.employee.businessUnit}</p>

        {directReports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No direct reports found</p>
            <p className="text-sm">This manager currently has no direct reports in the dataset.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 bg-blue-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Direct Reports</div>
              <div className="text-3xl font-bold text-blue-600">{directReports.length}</div>
            </div>

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
                      <span className="relative group cursor-help" title="Performance rating (Outstanding, Exceeds, Meets, Needs Improvement)">
                        Performance
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
                        title="Overall workforce readiness score (0-100)"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipState({
                            visible: true,
                            position: { top: rect.top, left: rect.left },
                            content: (
                              <>
                                <div className="font-semibold mb-1">Readiness Score:</div>
                                <div>Overall workforce readiness score on a scale of 0-100</div>
                                <div className="mt-2 text-xs">Higher scores indicate better readiness for current and future role requirements.</div>
                              </>
                            ),
                          });
                        }}
                        onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                      >
                        Readiness
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span 
                        className="relative group cursor-help inline-block" 
                        title="Leadership potential score (0-100)"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipState({
                            visible: true,
                            position: { top: rect.top, left: rect.left },
                            content: (
                              <>
                                <div className="font-semibold mb-1">Leadership Potential Calculation:</div>
                                <div>(Performance Rating Weight × 30) + (Engagement × 0.2) + (Tenure Factor × 20) + (Skill Count Factor × 20) + (Mentorship Activity × 10)</div>
                                <div className="mt-2 text-xs">Higher scores indicate stronger potential for leadership roles and succession planning.</div>
                              </>
                            ),
                          });
                        }}
                        onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                      >
                        Leadership Potential
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
                  {directReports.map((report, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{report.employee.employeeName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{report.employee.currentRoleName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{report.employee.businessUnit}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.performance.performanceRating === 'Outstanding' ? 'bg-green-100 text-green-800' :
                          report.performance.performanceRating === 'Exceeds' ? 'bg-blue-100 text-blue-800' :
                          report.performance.performanceRating === 'Meets' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.performance.performanceRating}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{report.performance.engagementScore}/100</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          report.readiness.readinessScore >= 70 ? 'bg-green-100 text-green-800' :
                          report.readiness.readinessScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {report.readiness.readinessScore}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{report.leadership.leadershipPotential}/100</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => onDrillDown('employee', report.employee.employeeName)}
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

            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Avg Engagement</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(directReports.reduce((sum, r) => sum + r.performance.engagementScore, 0) / directReports.length)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Avg Readiness</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(directReports.reduce((sum, r) => sum + r.readiness.readinessScore, 0) / directReports.length)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Avg Leadership Potential</div>
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(directReports.reduce((sum, r) => sum + r.leadership.leadershipPotential, 0) / directReports.length)}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">High Performers</div>
                <div className="text-2xl font-bold text-gray-900">
                  {directReports.filter(r => r.performance.performanceRating === 'Outstanding' || r.performance.performanceRating === 'Exceeds').length}
                </div>
              </div>
            </div>
          </>
        )}
        
        <CalculationTooltip
          isVisible={tooltipState.visible}
          position={tooltipState.position}
          content={tooltipState.content}
        />
      </div>
    );
  }

  // If drilling down to employee
  if (drillDown.view === 'employee' && drillDown.selectedEmployee) {
    const employee = profiles.find(p => p.employee.employeeName === drillDown.selectedEmployee);
    if (!employee) return null;

    const directReports = employee.employee.leadershipFlag === 'People Manager' 
      ? getDirectReports(employee.employee.employeeId)
      : [];

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Leadership Profile: {employee.employee.employeeName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Leadership Potential</div>
            <div className="text-3xl font-bold text-blue-600">{employee.leadership.leadershipPotential}/100</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Assessed potential for leadership roles
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Succession Readiness</div>
            <div className="text-3xl font-bold text-green-600">{employee.leadership.successionReadiness}/100</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Readiness for a specific successor role
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Mentorship Activity</div>
            <div className="text-3xl font-bold text-purple-600">{employee.leadership.mentorshipActivity}/100</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Level of engagement in mentoring others
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        {employee.leadership.teamSizeManaged && (
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-2">Current Team Size</div>
                <div className="text-2xl font-bold text-gray-900">{employee.leadership.teamSizeManaged} team members</div>
              </div>
              {directReports.length > 0 && (
                <button
                  onClick={() => onDrillDown('reportees', employee.employee.employeeName, employee.employee.employeeId)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Direct Reports ({directReports.length})
                </button>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Leadership Potential</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full" 
                style={{ width: `${employee.leadership.leadershipPotential}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Succession Readiness</div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-600 h-3 rounded-full" 
                style={{ width: `${employee.leadership.successionReadiness}%` }}
              />
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
        Leadership and Succession Strength
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Leadership by Department */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leadership Potential by Department</h3>
          {(() => {
            const avgPotential = leadershipByDept.length > 0
              ? Math.round(leadershipByDept.reduce((sum, d) => sum + d.averagePotential, 0) / leadershipByDept.length)
              : 0;
            const topDept = leadershipByDept.length > 0 ? leadershipByDept[0] : null;
            const insight = avgPotential >= 65
              ? `Strong leadership pipeline - average potential of ${avgPotential}/100 indicates robust succession planning foundation.`
              : topDept && topDept.averagePotential > avgPotential + 10
                ? `${topDept.department} leads with ${topDept.averagePotential}/100 - leverage as a leadership development model.`
                : `Moderate leadership potential at ${avgPotential}/100 - invest in leadership development programs to strengthen pipeline.`;
            return (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                <p className="text-xs text-blue-800">{insight}</p>
              </div>
            );
          })()}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leadershipByDept}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar dataKey="averagePotential" fill="#3b82f6" name="Avg Leadership Potential" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Succession Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Succession Readiness Distribution</h3>
          {(() => {
            const readyCount = successionDistribution.filter(d => d.label.includes('61') || d.label.includes('81')).reduce((sum, d) => sum + d.count, 0);
            const total = successionDistribution.reduce((sum, d) => sum + d.count, 0);
            const readyPercent = total > 0 ? Math.round((readyCount / total) * 100) : 0;
            const insight = readyPercent >= 25
              ? `${readyPercent}% of employees are succession-ready (61-100), indicating strong bench strength for key roles.`
              : `Only ${readyPercent}% show high succession readiness - accelerate development programs to build leadership bench.`;
            return (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                <p className="text-xs text-green-800">{insight}</p>
              </div>
            );
          })()}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={successionDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="count" fill="#10b981" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leadership vs Succession Scatter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Leadership Potential vs Succession Readiness</h3>
        {(() => {
          const highBoth = leadershipScatter.filter(e => e.leadership >= 70 && e.succession >= 70).length;
          const total = leadershipScatter.length;
          const highPercent = total > 0 ? Math.round((highBoth / total) * 100) : 0;
          const insight = highPercent >= 15
            ? `${highPercent}% of employees show strong alignment in both metrics, indicating well-rounded leadership candidates.`
            : `Limited overlap - only ${highPercent}% excel in both areas, suggesting need for targeted development in specific competencies.`;
          return (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mb-3">
              <p className="text-xs text-purple-800">{insight}</p>
            </div>
          );
        })()}
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="leadership" name="Leadership Potential" domain={[0, 100]} />
            <YAxis dataKey="succession" name="Succession Readiness" domain={[0, 100]} />
            <ZAxis dataKey="mentorship" name="Mentorship" range={[50, 200]} />
            <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Legend />
            <Scatter name="Employees" data={leadershipScatter} fill="#3b82f6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Top Leadership Candidates */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Leadership Candidates</h3>
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
                    title="Leadership potential score (0-100)"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Leadership Potential Calculation:</div>
                            <div>(Performance Rating Weight × 30) + (Engagement × 0.2) + (Tenure Factor × 20) + (Skill Count Factor × 20) + (Mentorship Activity × 10)</div>
                            <div className="mt-2 text-xs">Higher scores indicate stronger potential for leadership roles.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Leadership Potential
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Succession readiness score (0-100)"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Succession Readiness Calculation:</div>
                            <div>(Leadership Potential × 0.6) + (Performance Rating Weight × 0.3) + (Tenure Factor × 0.1)</div>
                            <div className="mt-2 text-xs">Measures readiness to step into higher-level roles or replace departing leaders.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Succession Readiness
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Mentorship activity score (0-100)"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Mentorship Activity:</div>
                            <div>Score based on mentoring activities, knowledge sharing, and team development</div>
                            <div className="mt-2 text-xs">Higher scores indicate more active mentorship and development of others.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Mentorship
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
              {topLeaders.map((leader, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{leader.employeeName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{leader.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{leader.department}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      leader.leadershipPotential >= 70 ? 'bg-green-100 text-green-800' :
                      leader.leadershipPotential >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {leader.leadershipPotential}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{leader.successionReadiness}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{leader.mentorshipActivity}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onDrillDown('employee', leader.employeeName)}
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

      {/* Current Managers */}
      {managers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current People Managers</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span className="relative group cursor-help" title="Manager name">
                      Manager
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
                      title="Number of direct reports"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipState({
                          visible: true,
                          position: { top: rect.top, left: rect.left },
                          content: (
                            <>
                              <div className="font-semibold mb-1">Team Size:</div>
                              <div>Total number of direct reports managed by this person</div>
                              <div className="mt-2 text-xs">Includes all employees reporting directly to this manager.</div>
                            </>
                          ),
                        });
                      }}
                      onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                    >
                      Team Size
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span 
                      className="relative group cursor-help inline-block" 
                      title="Mentorship activity score (0-100)"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipState({
                          visible: true,
                          position: { top: rect.top, left: rect.left },
                          content: (
                            <>
                              <div className="font-semibold mb-1">Mentorship Activity:</div>
                              <div>Score based on mentoring activities, knowledge sharing, and team development</div>
                              <div className="mt-2 text-xs">Higher scores indicate more active mentorship and development of direct reports.</div>
                            </>
                          ),
                        });
                      }}
                      onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                    >
                      Mentorship Activity
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span className="relative group cursor-help" title="View direct reports">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {managers.map((manager, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{manager.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{manager.role}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{manager.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{manager.teamSize}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{manager.mentorshipActivity}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onDrillDown('employee', manager.employeeName)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                        {manager.teamSize > 0 && (
                          <button
                            onClick={() => onDrillDown('reportees', manager.employeeName, manager.employeeId)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            View Reportees ({manager.teamSize})
                          </button>
                        )}
                      </div>
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

export default LeadershipDashboard;

