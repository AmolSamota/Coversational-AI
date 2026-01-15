import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
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

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">Learning Velocity: {label}</p>
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

interface LearningVelocityDashboardProps {
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

const LearningVelocityDashboard: React.FC<LearningVelocityDashboardProps> = ({ profiles, drillDown, onDrillDown }) => {
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    position: { top: number; left: number };
    content: React.ReactNode;
  }>({ visible: false, position: { top: 0, left: 0 }, content: null });
  
  // Learning velocity by department
  const learningByDept = useMemo(() => {
    const deptMap = new Map<string, { total: number; count: number; employees: EmployeeProfile[] }>();
    
    profiles.forEach(profile => {
      const dept = profile.employee.businessUnit;
      const existing = deptMap.get(dept) || { total: 0, count: 0, employees: [] };
      existing.total += profile.learning.learningVelocity;
      existing.count++;
      existing.employees.push(profile);
      deptMap.set(dept, existing);
    });

    return Array.from(deptMap.entries()).map(([dept, data]) => ({
      department: dept,
      averageVelocity: Math.round((data.total / data.count) * 10) / 10,
      averageAdaptability: Math.round(
        data.employees.reduce((sum, e) => sum + e.learning.adaptabilityScore, 0) / data.count * 10
      ) / 10,
      employeeCount: data.count,
    })).sort((a, b) => b.averageVelocity - a.averageVelocity);
  }, [profiles]);

  // Learning velocity distribution
  const velocityDistribution = useMemo(() => {
    const ranges = [
      { label: '0-30', min: 0, max: 30, count: 0 },
      { label: '31-50', min: 31, max: 50, count: 0 },
      { label: '51-70', min: 51, max: 70, count: 0 },
      { label: '71-85', min: 71, max: 85, count: 0 },
      { label: '86-100', min: 86, max: 100, count: 0 },
    ];

    profiles.forEach(profile => {
      const score = profile.learning.learningVelocity;
      const range = ranges.find(r => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [profiles]);

  // Top learners
  const topLearners = useMemo(() => {
    return [...profiles]
      .sort((a, b) => b.learning.learningVelocity - a.learning.learningVelocity)
      .slice(0, 10)
      .map(profile => ({
        employeeName: profile.employee.employeeName,
        role: profile.employee.currentRoleName,
        department: profile.employee.businessUnit,
        learningVelocity: profile.learning.learningVelocity,
        adaptabilityScore: profile.learning.adaptabilityScore,
        skillGrowthRate: profile.learning.skillGrowthRate,
        trainingCompletions: profile.learning.trainingCompletions,
        certificationsEarned: profile.learning.certificationsEarned,
        profile,
      }));
  }, [profiles]);

  // Learning vs Adaptability
  const learningAdaptability = useMemo(() => {
    return profiles.map(profile => ({
      learning: profile.learning.learningVelocity,
      adaptability: profile.learning.adaptabilityScore,
      growth: profile.learning.skillGrowthRate,
      name: profile.employee.employeeName,
    }));
  }, [profiles]);

  // Training completions by role
  const trainingByRole = useMemo(() => {
    const roleMap = new Map<string, { total: number; count: number }>();
    
    profiles.forEach(profile => {
      const role = profile.employee.currentRoleName;
      const existing = roleMap.get(role) || { total: 0, count: 0 };
      existing.total += profile.learning.trainingCompletions;
      existing.count++;
      roleMap.set(role, existing);
    });

    return Array.from(roleMap.entries())
      .map(([role, data]) => ({
        role,
        averageTrainings: Math.round((data.total / data.count) * 10) / 10,
        employeeCount: data.count,
      }))
      .sort((a, b) => b.averageTrainings - a.averageTrainings)
      .slice(0, 10);
  }, [profiles]);

  // If drilling down to employee
  if (drillDown.view === 'employee' && drillDown.selectedEmployee) {
    const employee = profiles.find(p => p.employee.employeeName === drillDown.selectedEmployee);
    if (!employee) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Learning Profile: {employee.employee.employeeName}
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
            <div className="text-sm text-gray-600">Learning Velocity</div>
            <div className="text-3xl font-bold text-blue-600">{employee.learning.learningVelocity}/100</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Speed at which this employee acquires new skills
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Adaptability Score</div>
            <div className="text-3xl font-bold text-green-600">{employee.learning.adaptabilityScore}/100</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Ability to adapt to new roles and technologies
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Skill Growth Rate</div>
            <div className="text-3xl font-bold text-purple-600">{employee.learning.skillGrowthRate}%</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Percentage increase in proficiency over time
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600 mb-2">Training Completions</div>
            <div className="text-2xl font-bold text-gray-900">{employee.learning.trainingCompletions} programs</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                {employee.learning.trainingCompletions} completed training programs
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600 mb-2">Certifications Earned</div>
            <div className="text-2xl font-bold text-gray-900">{employee.learning.certificationsEarned} certifications</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                {employee.learning.certificationsEarned} relevant certifications obtained
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600 mb-2">Learning Velocity</div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all" 
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
            <div className="text-sm text-gray-600 mb-2">Skill Growth</div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div 
                className="bg-purple-600 h-3 rounded-full transition-all" 
                style={{ width: `${employee.learning.skillGrowthRate}%` }}
              />
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                  {employee.learning.skillGrowthRate}%
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
        Learning Velocity and Adaptability
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Learning by Department */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Velocity by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={learningByDept}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar dataKey="averageVelocity" fill="#3b82f6" name="Avg Learning Velocity" />
              <Bar dataKey="averageAdaptability" fill="#10b981" name="Avg Adaptability" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Velocity Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Velocity Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={velocityDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="count" fill="#f59e0b" name="Employees" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Learning vs Adaptability */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Velocity vs Adaptability</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={learningAdaptability}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="learning" name="Learning Velocity" domain={[0, 100]} />
            <YAxis dataKey="adaptability" name="Adaptability" domain={[0, 100]} />
            <Tooltip content={<CustomAreaTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="adaptability" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Training by Role */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Training Completions by Role</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trainingByRole}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="role" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar dataKey="averageTrainings" fill="#8b5cf6" name="Avg Training Completions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Learners */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Learners</h3>
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
                    title="Learning velocity score (0-100)"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Learning Velocity Calculation:</div>
                            <div>(Performance Rating Weight × 30) + (Engagement × 0.3) + (Training Completions × 5) + (Certifications × 10) + (Skill Updates × 2)</div>
                            <div className="mt-2 text-xs">Measures the speed at which an employee acquires new skills and adapts to change.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Learning Velocity
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Adaptability score (0-100)"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Adaptability Score Calculation:</div>
                            <div>(Learning Velocity × 0.5) + (Engagement × 0.3) + (Performance Rating Weight × 0.2)</div>
                            <div className="mt-2 text-xs">Measures ability to adapt to new roles, technologies, and organizational changes.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Adaptability
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Number of training completions"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Training Completions:</div>
                            <div>Total number of training courses or programs completed</div>
                            <div className="mt-2 text-xs">Includes both mandatory and voluntary training activities.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Trainings
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Number of certifications earned"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Certifications:</div>
                            <div>Total number of professional certifications earned</div>
                            <div className="mt-2 text-xs">Includes industry certifications, technical certifications, and professional credentials.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Certifications
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
              {topLearners.map((learner, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{learner.employeeName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{learner.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{learner.department}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      learner.learningVelocity >= 70 ? 'bg-green-100 text-green-800' :
                      learner.learningVelocity >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {learner.learningVelocity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{learner.adaptabilityScore}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{learner.trainingCompletions}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{learner.certificationsEarned}</td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onDrillDown('employee', learner.employeeName)}
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

export default LearningVelocityDashboard;

