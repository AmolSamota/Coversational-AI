import React, { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { createPortal } from 'react-dom';
import type { EmployeeProfile } from '../../data/workforceReadinessSchema';
import { getEmployeeTasks } from '../../data/taskData';

// Custom tooltip components
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: <span className="font-medium">{entry.value}{entry.dataKey === 'employeeCount' ? ' employees' : entry.dataKey === 'uniqueSkills' ? ' skills' : ''}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
        <p className="text-sm" style={{ color: data.color }}>
          Count: <span className="font-medium">{data.value} skills</span>
        </p>
      </div>
    );
  }
  return null;
};

interface SkillAvailabilityDashboardProps {
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

const SkillAvailabilityDashboard: React.FC<SkillAvailabilityDashboardProps> = ({ profiles, drillDown, onDrillDown }) => {
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    position: { top: number; left: number };
    content: React.ReactNode;
  }>({ visible: false, position: { top: 0, left: 0 }, content: null });
  
  console.log('SkillAvailabilityDashboard render:', { profilesLength: profiles.length, drillDown });

  // Aggregate skill statistics
  const skillStats = useMemo(() => {
    if (!profiles || profiles.length === 0) {
      return [];
    }
    const skillMap = new Map<string, { count: number; totalProficiency: number; employees: EmployeeProfile[] }>();

    profiles.forEach(profile => {
      profile.skills.forEach(skill => {
        const existing = skillMap.get(skill.skillId) || { count: 0, totalProficiency: 0, employees: [] };
        existing.count++;
        existing.totalProficiency += skill.proficiency;
        existing.employees.push(profile);
        skillMap.set(skill.skillId, existing);
      });
    });

    return Array.from(skillMap.entries())
      .map(([skillId, data]) => {
        const skillName = data.employees[0]?.skills.find(s => s.skillId === skillId)?.skillName || skillId;
        return {
          skillId,
          skillName,
          employeeCount: data.count,
          averageProficiency: Math.round((data.totalProficiency / data.count) * 10) / 10,
          employees: data.employees,
        };
      })
      .sort((a, b) => b.employeeCount - a.employeeCount);
  }, [profiles]);

  // Proficiency distribution
  const proficiencyDistribution = useMemo(() => {
    const dist: { [level: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    profiles.forEach(profile => {
      profile.skills.forEach(skill => {
        dist[skill.proficiency] = (dist[skill.proficiency] || 0) + 1;
      });
    });
    return Object.entries(dist).map(([level, count]) => ({
      level: `Level ${level}`,
      count,
    }));
  }, [profiles]);

  // Top skills by availability
  const topSkills = skillStats.slice(0, 10);

  // Skill coverage by department
  const skillCoverageByDept = useMemo(() => {
    const deptMap = new Map<string, Set<string>>();
    profiles.forEach(profile => {
      const dept = profile.employee.businessUnit;
      if (!deptMap.has(dept)) {
        deptMap.set(dept, new Set());
      }
      profile.skills.forEach(skill => {
        deptMap.get(dept)!.add(skill.skillId);
      });
    });

    return Array.from(deptMap.entries()).map(([dept, skills]) => ({
      department: dept,
      uniqueSkills: skills.size,
      employeeCount: profiles.filter(p => p.employee.businessUnit === dept).length,
    }));
  }, [profiles]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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
          <div className="bg-blue-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Total Skills</div>
            <div className="text-3xl font-bold text-blue-600">{employee.skills.length}</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                {employee.skills.length} skills in this employee's profile
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Average Proficiency</div>
            <div className="text-3xl font-bold text-green-600">
              {employee.skills.length > 0 
                ? (employee.skills.reduce((sum, s) => sum + s.proficiency, 0) / employee.skills.length).toFixed(1)
                : 0}/5
            </div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Average skill proficiency level
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
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
          <div className="bg-purple-50 rounded-lg p-4 relative group">
            <div className="text-sm text-gray-600">Role</div>
            <div className="text-lg font-bold text-purple-600">{employee.employee.currentRoleName}</div>
            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                Current position
              </div>
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Skills</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span className="relative group cursor-help" title="Skill name">
                      Skill
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span 
                      className="relative group cursor-help inline-block" 
                      title="Skill proficiency level (1-5 scale)"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipState({
                          visible: true,
                          position: { top: rect.top, left: rect.left },
                          content: (
                            <>
                              <div className="font-semibold mb-1">Proficiency Level:</div>
                              <div>5 = Expert, 4 = Advanced, 3 = Intermediate, 2 = Beginner, 1 = Novice</div>
                            </>
                          ),
                        });
                      }}
                      onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                    >
                      Proficiency
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span 
                      className="relative group cursor-help inline-block" 
                      title="Source of skill validation"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipState({
                          visible: true,
                          position: { top: rect.top, left: rect.left },
                          content: (
                            <>
                              <div className="font-semibold mb-1">Validation Source:</div>
                              <div>• Assessment: Formal skill assessment</div>
                              <div>• Project Evidence: Demonstrated in projects</div>
                              <div>• Resume: Listed on resume</div>
                              <div>• Inferred: Estimated from role/experience</div>
                            </>
                          ),
                        });
                      }}
                      onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                    >
                      Source
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span className="relative group cursor-help" title="Date when skill was last validated or updated">
                      Last Validated
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...employee.skills]
                  .sort((a, b) => b.proficiency - a.proficiency)
                  .map((skill, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{skill.skillName}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          skill.proficiency >= 4 ? 'bg-green-100 text-green-800' :
                          skill.proficiency >= 3 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {skill.proficiency}/5
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{skill.source}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{skill.lastValidatedDate || 'N/A'}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Department</div>
            <div className="text-lg font-bold text-gray-900">{employee.employee.businessUnit}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-2">Location</div>
            <div className="text-lg font-bold text-gray-900">{employee.employee.location}</div>
          </div>
        </div>

        {/* Top Tasks Section */}
        {(() => {
          const tasks = getEmployeeTasks(employee.employee.employeeId);
          const topTasks = tasks
            .sort((a, b) => b.hoursPerWeek - a.hoursPerWeek)
            .slice(0, 5);

          if (topTasks.length === 0) return null;

          return (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Tasks</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <span className="relative group cursor-help" title="Task name">
                          Task
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <span 
                          className="relative group cursor-help inline-block" 
                          title="Hours per week spent on this task"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipState({
                              visible: true,
                              position: { top: rect.top, left: rect.left },
                              content: (
                                <>
                                  <div className="font-semibold mb-1">Hours per Week:</div>
                                  <div>Average number of hours per week this employee spends on this task</div>
                                  <div className="mt-2 text-xs">Tasks are normalized to sum to approximately 40 hours/week.</div>
                                </>
                              ),
                            });
                          }}
                          onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                        >
                          Hours/Week
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <span 
                          className="relative group cursor-help inline-block" 
                          title="Automation potential score (0-100)"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipState({
                              visible: true,
                              position: { top: rect.top, left: rect.left },
                              content: (
                                <>
                                  <div className="font-semibold mb-1">Automation Score:</div>
                                  <div>Potential for AI/automation on a scale of 0-100</div>
                                  <div className="mt-2 text-xs">Higher scores indicate tasks that are more suitable for automation.</div>
                                </>
                              ),
                            });
                          }}
                          onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                        >
                          Automation Score
                        </span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        <span 
                          className="relative group cursor-help inline-block" 
                          title="Best AI capability match for automation"
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipState({
                              visible: true,
                              position: { top: rect.top, left: rect.left },
                              content: (
                                <>
                                  <div className="font-semibold mb-1">AI Capability Match:</div>
                                  <div>• GenAI: Generative AI (e.g., ChatGPT, code generation)</div>
                                  <div>• RPA: Robotic Process Automation (e.g., workflow automation)</div>
                                  <div>• ML: Machine Learning (e.g., predictive analytics, pattern recognition)</div>
                                  <div>• None: Not suitable for current AI automation</div>
                                </>
                              ),
                            });
                          }}
                          onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                        >
                          AI Capability
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topTasks.map((task) => (
                      <tr key={task.taskId} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{task.taskName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{task.hoursPerWeek} hrs</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.automationScore >= 70 ? 'bg-green-100 text-green-800' :
                            task.automationScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {task.automationScore}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            task.aiCapabilityMatch === 'GenAI' ? 'bg-blue-100 text-blue-800' :
                            task.aiCapabilityMatch === 'RPA' ? 'bg-purple-100 text-purple-800' :
                            task.aiCapabilityMatch === 'ML' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.aiCapabilityMatch}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })()}
        
        <CalculationTooltip
          isVisible={tooltipState.visible}
          position={tooltipState.position}
          content={tooltipState.content}
        />
      </div>
    );
  }

  // If drilling down to a specific skill
  if (drillDown.view === 'skill' && drillDown.selectedSkill) {
    const skill = skillStats.find(s => s.skillId === drillDown.selectedSkill);
    if (!skill) return null;

    const employeesWithSkill = skill.employees;
    const proficiencyByEmployee = employeesWithSkill.map(emp => {
      const empSkill = emp.skills.find(s => s.skillId === skill.skillId);
      return {
        employeeName: emp.employee.employeeName,
        role: emp.employee.currentRoleName,
        department: emp.employee.businessUnit,
        proficiency: empSkill?.proficiency || 0,
        source: empSkill?.source || '',
        lastValidated: empSkill?.lastValidatedDate || '',
        readinessScore: emp.readiness.readinessScore,
        profile: emp,
      };
    }).sort((a, b) => b.proficiency - a.proficiency);

    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Skill Details: {skill.skillName}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Total Employees</div>
            <div className="text-3xl font-bold text-blue-600">{skill.employeeCount}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Average Proficiency</div>
            <div className="text-3xl font-bold text-green-600">{skill.averageProficiency}/5</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm text-gray-600">Coverage</div>
            <div className="text-3xl font-bold text-purple-600">
              {Math.round((skill.employeeCount / profiles.length) * 100)}%
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Employees with this Skill</h3>
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
                      title="Skill proficiency level (1-5 scale)"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipState({
                          visible: true,
                          position: { top: rect.top, left: rect.left },
                          content: (
                            <>
                              <div className="font-semibold mb-1">Proficiency Level:</div>
                              <div>5 = Expert, 4 = Advanced, 3 = Intermediate, 2 = Beginner, 1 = Novice</div>
                              <div className="mt-2 text-xs">Based on assessment, project evidence, resume, or inferred from experience.</div>
                            </>
                          ),
                        });
                      }}
                      onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                    >
                      Proficiency
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span 
                      className="relative group cursor-help inline-block" 
                      title="Source of skill validation"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipState({
                          visible: true,
                          position: { top: rect.top, left: rect.left },
                          content: (
                            <>
                              <div className="font-semibold mb-1">Validation Source:</div>
                              <div>• Assessment: Formal skill assessment</div>
                              <div>• Project Evidence: Demonstrated in projects</div>
                              <div>• Resume: Listed on resume</div>
                              <div>• Inferred: Estimated from role/experience</div>
                            </>
                          ),
                        });
                      }}
                      onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                    >
                      Source
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
                    <span className="relative group cursor-help" title="View detailed employee profile">
                      Actions
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {proficiencyByEmployee.map((emp, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{emp.employeeName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.role}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.department}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        emp.proficiency >= 4 ? 'bg-green-100 text-green-800' :
                        emp.proficiency >= 3 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {emp.proficiency}/5
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{emp.source}</td>
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
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Skill Availability and Proficiency
        </h2>
        <div className="text-gray-500 text-center py-8">No data available</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Skill Availability and Proficiency
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Top Skills by Availability */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills by Availability</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSkills}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="skillName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip content={<CustomBarTooltip />} />
              <Legend />
              <Bar 
                dataKey="employeeCount" 
                fill="#3b82f6" 
                name="Employees"
                onClick={(data: any) => {
                  if (data && data.activePayload && data.activePayload[0]) {
                    const skillData = data.activePayload[0].payload;
                    onDrillDown('skill', skillData.skillId);
                  }
                }}
                style={{ cursor: 'pointer' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Proficiency Distribution */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Proficiency Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={proficiencyDistribution}
                dataKey="count"
                nameKey="level"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {proficiencyDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skill Coverage by Department */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Coverage by Department</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={skillCoverageByDept}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip content={<CustomBarTooltip />} />
            <Legend />
            <Bar dataKey="uniqueSkills" fill="#10b981" name="Unique Skills" />
            <Bar dataKey="employeeCount" fill="#3b82f6" name="Employees" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Skills Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Skills</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span className="relative group cursor-help" title="Skill name">
                    Skill
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Number of employees with this skill"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Employee Count:</div>
                            <div>Total number of employees who have this skill in their profile</div>
                            <div className="mt-2 text-xs">Includes all proficiency levels (1-5).</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Employees
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Average proficiency level across all employees"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Average Proficiency Calculation:</div>
                            <div>Sum of all proficiency levels ÷ Number of employees with this skill</div>
                            <div className="mt-2 text-xs">Scale: 5 = Expert, 4 = Advanced, 3 = Intermediate, 2 = Beginner, 1 = Novice</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Avg Proficiency
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span 
                    className="relative group cursor-help inline-block" 
                    title="Percentage of workforce with this skill"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipState({
                        visible: true,
                        position: { top: rect.top, left: rect.left },
                        content: (
                          <>
                            <div className="font-semibold mb-1">Coverage Calculation:</div>
                            <div>(Employees with Skill ÷ Total Employees) × 100%</div>
                            <div className="mt-2 text-xs">Represents the percentage of the filtered workforce that has this skill.</div>
                          </>
                        ),
                      });
                    }}
                    onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                  >
                    Coverage
                  </span>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <span className="relative group cursor-help" title="View employees with this skill">
                    Actions
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {skillStats.map((skill) => (
                <tr key={skill.skillId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{skill.skillName}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{skill.employeeCount}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{skill.averageProficiency}/5</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {Math.round((skill.employeeCount / profiles.length) * 100)}%
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <button
                      onClick={() => onDrillDown('skill', skill.skillId)}
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

export default SkillAvailabilityDashboard;

