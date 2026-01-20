import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { createPortal } from 'react-dom';
import type { EmployeeProfile } from '../../data/workforceReadinessSchema';

// Custom tooltip component
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">
              {entry.value}
              {entry.dataKey === 'averageScore' ? '/100' : entry.dataKey === 'averageDays' ? ' days' : ''}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface RedeploymentDashboardProps {
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

const RedeploymentDashboard: React.FC<RedeploymentDashboardProps> = ({ profiles, drillDown, onDrillDown }) => {
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    position: { top: number; left: number };
    content: React.ReactNode;
  }>({ visible: false, position: { top: 0, left: 0 }, content: null });
  
  // Redeployment readiness by department
  const redeploymentByDept = useMemo(() => {
    const deptMap = new Map<string, { total: number; count: number; employees: EmployeeProfile[] }>();
    
    profiles.forEach(profile => {
      const dept = profile.employee.businessUnit;
      const existing = deptMap.get(dept) || { total: 0, count: 0, employees: [] };
      existing.total += profile.redeployment.redeploymentScore;
      existing.count++;
      existing.employees.push(profile);
      deptMap.set(dept, existing);
    });

    return Array.from(deptMap.entries()).map(([dept, data]) => ({
      department: dept,
      averageScore: Math.round((data.total / data.count) * 10) / 10,
      employeeCount: data.count,
      employees: data.employees,
    })).sort((a, b) => b.averageScore - a.averageScore);
  }, [profiles]);

  // Redeployment readiness distribution
  const readinessDistribution = useMemo(() => {
    const ranges = [
      { label: '0-20', min: 0, max: 20, count: 0 },
      { label: '21-40', min: 21, max: 40, count: 0 },
      { label: '41-60', min: 41, max: 60, count: 0 },
      { label: '61-80', min: 61, max: 80, count: 0 },
      { label: '81-100', min: 81, max: 100, count: 0 },
    ];

    profiles.forEach(profile => {
      const score = profile.redeployment.redeploymentScore;
      const range = ranges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [profiles]);

  // Top redeployable employees
  const topRedeployable = useMemo(() => {
    return [...profiles]
      .sort((a, b) => b.redeployment.redeploymentScore - a.redeployment.redeploymentScore)
      .slice(0, 10)
      .map(profile => ({
        employeeName: profile.employee.employeeName,
        role: profile.employee.currentRoleName,
        department: profile.employee.businessUnit,
        readinessScore: profile.readiness.readinessScore,
        redeploymentScore: profile.redeployment.redeploymentScore,
        transferableSkills: profile.redeployment.transferableSkills,
        timeToRedeploy: profile.redeployment.timeToRedeploy,
        mobilityWillingness: profile.redeployment.mobilityWillingness,
        profile,
      }));
  }, [profiles]);

  // Time to redeploy by role
  const timeToRedeployByRole = useMemo(() => {
    const roleMap = new Map<string, { total: number; count: number }>();
    
    profiles.forEach(profile => {
      const role = profile.employee.currentRoleName;
      const existing = roleMap.get(role) || { total: 0, count: 0 };
      existing.total += profile.redeployment.timeToRedeploy;
      existing.count++;
      roleMap.set(role, existing);
    });

    return Array.from(roleMap.entries())
      .map(([role, data]) => ({
        role,
        averageDays: Math.round(data.total / data.count),
        employeeCount: data.count,
      }))
      .sort((a, b) => a.averageDays - b.averageDays)
      .slice(0, 10);
  }, [profiles]);

  // If drilling down to employee
  if (drillDown.view === 'employee' && drillDown.selectedEmployee) {
    const employee = profiles.find(p => p.employee.employeeName === drillDown.selectedEmployee);
    if (!employee) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Employee Details: {employee.employee.employeeName}
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
            <div className="text-sm text-gray-600">Redeployment Score</div>
            <div className="text-3xl font-bold text-blue-600">{employee.redeployment.redeploymentScore}/100</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Overall readiness for internal mobility
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Transferable Skills</div>
            <div className="text-3xl font-bold text-green-600">{employee.redeployment.transferableSkills}</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                {employee.redeployment.transferableSkills} skills applicable to other roles
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Time to Redeploy</div>
            <div className="text-3xl font-bold text-purple-600">{employee.redeployment.timeToRedeploy} days</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Estimated time to be ready for a new role
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transferable Skills</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {employee.skills
              .filter(s => ['Python', 'Azure Cloud', 'Distributed Systems', 'API Design', 'Stakeholder Management', 'Technical Leadership'].includes(s.skillName))
              .map((skill, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3">
                  <div className="font-medium text-gray-900">{skill.skillName}</div>
                  <div className="text-sm text-gray-600">Proficiency: {skill.proficiency}/5</div>
                </div>
              ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Mobility Willingness</div>
            <div className="text-2xl font-bold text-gray-900">{employee.redeployment.mobilityWillingness}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${employee.redeployment.mobilityWillingness}%` }}
              />
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Cross-Functional Experience</div>
            <div className="text-2xl font-bold text-gray-900">
              {employee.redeployment.crossFunctionalExperience ? 'Yes' : 'No'}
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
        Ability to Redeploy Talent Quickly
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Redeployment by Department */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Redeployment Readiness by Department</h3>
          {(() => {
            const avgScore = redeploymentByDept.length > 0
              ? Math.round(redeploymentByDept.reduce((sum, d) => sum + d.averageScore, 0) / redeploymentByDept.length)
              : 0;
            const insight = avgScore >= 60
              ? `Strong overall readiness - average score of ${avgScore}/100 indicates good internal mobility potential across departments.`
              : `Moderate readiness levels - average ${avgScore}/100 suggests targeted development needed to improve redeployment capabilities.`;
            return (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
                <p className="text-xs text-blue-800">{insight}</p>
              </div>
            );
          })()}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={redeploymentByDept}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar dataKey="averageScore" fill="#3b82f6" name="Avg Readiness Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Readiness Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Readiness Score Distribution</h3>
          {(() => {
            const highReadiness = readinessDistribution.filter(d => d.label.includes('61') || d.label.includes('81')).reduce((sum, d) => sum + d.count, 0);
            const total = readinessDistribution.reduce((sum, d) => sum + d.count, 0);
            const highPercent = total > 0 ? Math.round((highReadiness / total) * 100) : 0;
            const insight = highPercent >= 30
              ? `${highPercent}% of employees show high readiness (61-100), indicating a strong pool for quick redeployment.`
              : `Only ${highPercent}% have high readiness - focus on developing transferable skills to expand redeployment pool.`;
            return (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3">
                <p className="text-xs text-green-800">{insight}</p>
              </div>
            );
          })()}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={readinessDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="count" fill="#10b981" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time to Redeploy by Role */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Time to Redeploy by Role</h3>
        {(() => {
          const avgDays = timeToRedeployByRole.length > 0
            ? Math.round(timeToRedeployByRole.reduce((sum, r) => sum + r.averageDays, 0) / timeToRedeployByRole.length)
            : 0;
          const fastestRole = timeToRedeployByRole.length > 0 
            ? timeToRedeployByRole.reduce((min, r) => r.averageDays < min.averageDays ? r : min, timeToRedeployByRole[0])
            : null;
          const insight = avgDays <= 30
            ? `Fast redeployment capability - average ${avgDays} days suggests efficient internal mobility processes.`
            : fastestRole && fastestRole.averageDays < avgDays * 0.7
              ? `${fastestRole.role} shows fastest redeployment at ${fastestRole.averageDays} days - consider as a model for other roles.`
              : `Average ${avgDays} days to redeploy indicates moderate transition time - streamline processes to accelerate mobility.`;
          return (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
              <p className="text-xs text-orange-800">{insight}</p>
            </div>
          );
        })()}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeToRedeployByRole}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="role" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="averageDays" fill="#f59e0b" name="Days to Redeploy" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Redeployable Employees */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Redeployable Employees</h3>
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
                    Readiness Score
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Redeployment readiness score (0-100)"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Redeployment Score Calculation:</div>
                            <div>(Transferable Skills / 6) × 30 + Cross-functional Experience × 20 + Mobility Willingness × 0.3 + (Avg Proficiency / 5) × 20</div>
                            <div className="mt-2 text-xs">Higher scores indicate better readiness for internal mobility and role transitions.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Redeployment Score
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Number of transferable skills"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Transferable Skills:</div>
                            <div>Count of skills that can be used across different roles</div>
                            <div className="mt-2 text-xs">Includes: Python, Azure Cloud, Distributed Systems, API Design, Stakeholder Management, Technical Leadership</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Transferable Skills
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Estimated time to redeploy (days)"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Time to Redeploy Calculation:</div>
                            <div>Max(7, Min(90, 60 - (Avg Proficiency × 8) - (Skill Count × 2) + variance))</div>
                            <div className="mt-2 text-xs">Estimated days needed for employee to be ready for a new role, based on skill proficiency and count.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Time to Redeploy
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
              {topRedeployable.map((emp, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{emp.employeeName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{emp.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{emp.department}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      emp.readinessScore >= 70 ? 'bg-green-100 text-green-800' :
                      emp.readinessScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {emp.readinessScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      emp.redeploymentScore >= 70 ? 'bg-green-100 text-green-800' :
                      emp.redeploymentScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {emp.redeploymentScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{emp.transferableSkills}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{emp.timeToRedeploy} days</td>
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
      
      <CalculationTooltip
        isVisible={tooltipState.visible}
        position={tooltipState.position}
        content={tooltipState.content}
      />
    </div>
  );
};

export default RedeploymentDashboard;

