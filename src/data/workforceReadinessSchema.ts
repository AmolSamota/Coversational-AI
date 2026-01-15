/**
 * Workforce Readiness Data Schema
 * Defines the structure for workforce planning and readiness data
 */

// Employee Basic Information
export interface Employee {
  employeeId: string;
  employeeName: string;
  currentRoleId: string;
  currentRoleName: string;
  jobFamily: string;
  businessUnit: string;
  location: string;
  employmentType: string;
  hireDate: string;
  tenureMonths: number;
  managerId?: string;
  leadershipFlag: 'Individual Contributor' | 'People Manager';
}

// Performance Metrics
export interface PerformanceMetrics {
  employeeId: string;
  performanceRating: 'Outstanding' | 'Exceeds' | 'Meets' | 'Needs Improvement';
  engagementScore: number; // 0-100
  flightRiskScore: number; // 0-100
}

// Readiness Assessment
export interface ReadinessAssessment {
  employeeId: string;
  readinessScore: number; // 0-100
  readinessFlag: 'Not-ready' | 'Near-ready' | 'Ready';
  skillGapSeverityIndex: number; // 1-6
  overallWorkforceReadinessIndex: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
}

// Skill Information
export interface Skill {
  skillId: string;
  skillName: string;
  proficiency: number; // 1-5
  source: 'Assessment' | 'Project Evidence' | 'Resume' | 'Inferred';
  lastValidatedDate: string;
  demandTrend?: 'increasing' | 'decreasing' | 'flat'; // Demand trend for the skill
}

// Employee Skills (many-to-many relationship)
export interface EmployeeSkill {
  employeeId: string;
  skill: Skill;
}

// Learning and Adaptability Metrics
export interface LearningMetrics {
  employeeId: string;
  learningVelocity: number; // 0-100: Speed of skill acquisition
  adaptabilityScore: number; // 0-100: Ability to adapt to change
  skillGrowthRate: number; // 0-100: Rate of skill improvement over time
  trainingCompletions: number; // Number of training programs completed
  certificationsEarned: number; // Number of certifications
  lastSkillUpdate: string; // Date of last skill update
}

// Redeployment Readiness
export interface RedeploymentReadiness {
  employeeId: string;
  redeploymentScore: number; // 0-100: Overall readiness to redeploy
  transferableSkills: number; // Count of transferable skills
  crossFunctionalExperience: boolean; // Has worked across functions
  mobilityWillingness: number; // 0-100: Willingness to relocate/change roles
  timeToRedeploy: number; // Days to be ready for new role
}

// Leadership and Succession
export interface LeadershipMetrics {
  employeeId: string;
  leadershipPotential: number; // 0-100: Potential for leadership role
  successionReadiness: number; // 0-100: Readiness for next level
  mentorshipActivity: number; // 0-100: Active mentoring score
  teamSizeManaged?: number; // Current team size (if manager)
  directReports?: number; // Number of direct reports
}

// Complete Employee Profile
export interface EmployeeProfile {
  employee: Employee;
  performance: PerformanceMetrics;
  readiness: ReadinessAssessment;
  skills: Skill[];
  cost: EmployeeCost;
  roleAutomationPotential: number; // 0-40% from role
  learning: LearningMetrics;
  redeployment: RedeploymentReadiness;
  leadership: LeadershipMetrics;
}

// Aggregated Statistics
export interface WorkforceStats {
  totalEmployees: number;
  averageReadinessScore: number;
  readinessDistribution: {
    ready: number;
    nearReady: number;
    notReady: number;
  };
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  averageEngagementScore: number;
  averageFlightRiskScore: number;
  skillGapDistribution: {
    [severity: number]: number;
  };
}

// Department/Unit Statistics
export interface DepartmentStats {
  department: string;
  employeeCount: number;
  averageReadinessScore: number;
  readinessDistribution: {
    ready: number;
    nearReady: number;
    notReady: number;
  };
  topSkills: Array<{
    skillName: string;
    employeeCount: number;
    averageProficiency: number;
  }>;
}

// Role Information with Automation Potential
export interface RoleInfo {
  roleId: string;
  roleName: string;
  automationPotential: number; // 0-40% percentage
}

// Employee Cost Data
export interface EmployeeCost {
  employeeId: string;
  baseSalary: number; // Annual salary in USD
  totalCompensation: number; // Total comp including bonuses, equity, etc.
  costPerMonth: number; // Monthly cost
  currency: string; // USD or INR
}

// Role Statistics
export interface RoleStats {
  roleId: string;
  roleName: string;
  employeeCount: number;
  averageReadinessScore: number;
  readinessDistribution: {
    ready: number;
    nearReady: number;
    notReady: number;
  };
  automationPotential?: number; // Average automation potential for this role
}

// Skill Statistics
export interface SkillStats {
  skillId: string;
  skillName: string;
  totalEmployees: number;
  averageProficiency: number;
  proficiencyDistribution: {
    [level: number]: number; // level 1-5
  };
  sourceDistribution: {
    [source: string]: number;
  };
}

// Location Statistics
export interface LocationStats {
  location: string;
  employeeCount: number;
  averageReadinessScore: number;
  readinessDistribution: {
    ready: number;
    nearReady: number;
    notReady: number;
  };
}

// Task data structure for AI automation
export interface Task {
  taskId: string;
  taskName: string;
  roleId: string;
  roleName: string;
  hoursPerWeek: number;
  automationScore: number; // 0-100
  aiCapabilityMatch: 'GenAI' | 'RPA' | 'ML' | 'None';
  skillRequirements: string[];
}

