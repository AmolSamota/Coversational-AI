// Plan storage utilities using localStorage

export type PlanStatus = 'draft' | 'published';

export interface SavedPlan {
  id: string;
  name: string;
  status: PlanStatus;
  createdAt: string;
  lastModified: string;
  // Scenario configuration
  dimensions: {
    businessUnits: string[];
    locations: string[];
    jobFamilies: string[];
  };
  scenarioControls: {
    enabledCapabilities: {
      genAI: boolean;
      rpa: boolean;
      ml: boolean;
    };
    adoptionRate: 'conservative' | 'moderate' | 'aggressive';
    planningHorizon: 6 | 12 | 24;
    implementationTimeline: 'immediate' | 'phased';
    strategy: 'capacity' | 'cost' | 'balanced';
  };
  // Results data
  impactResults: {
    totalCostSavings: number;
    totalCapacityGained: number;
    capacityGainedPercent: number;
    totalInvestment: number;
    netSavings: number;
    paybackPeriodMonths: number;
    headcountReductionPotential: number;
    taskPriorities: Array<{
      task: string;
      role: string;
      hoursFreed: number;
      hoursPerWeek: number;
      aiTool: string;
      phase: string;
      quickWin: boolean;
    }>;
    transitionPlan: Array<{
      role: string;
      affectedHeadcount: number;
      hoursFreed: number;
      reskillRecommendation: string;
      redeploymentOption: string;
      reductionTarget?: number;
      reductionDetails?: {
        retirementEligible: Array<{ name: string; employeeId: string; profile: any }>;
        voluntaryAttrition: Array<{ name: string; employeeId: string; profile: any }>;
        redeployment: Array<{ name: string; employeeId: string; profile: any }>;
        involuntary: Array<{ name: string; employeeId: string; profile: any }>;
      };
      redeploymentDetails?: {
        employees: Array<{ name: string; employeeId: string; profile: any }>;
      };
    }>;
    skillsGapAnalysis: Array<{
      role: string;
      currentSkill: string;
      newSkillNeeded: string;
      employeeCount: number;
      trainingInvestment: number;
    }>;
  };
  workforceSummary: {
    totalHeadcount: number;
    totalCost: number;
    roleDistribution: Array<{ role: string; headcount: number }>;
  };
}

const STORAGE_KEY = 'ai_augmentation_plans';

// Generate default plan name
export const generateDefaultPlanName = (): string => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();
  return `AI_Strategy_${month}_${year}`;
};

// Save a plan
export const savePlan = (plan: Omit<SavedPlan, 'id' | 'createdAt' | 'lastModified'>): SavedPlan => {
  const plans = getAllPlans();
  const id = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  const newPlan: SavedPlan = {
    ...plan,
    id,
    createdAt: now,
    lastModified: now,
  };
  
  plans.push(newPlan);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  
  return newPlan;
};

// Update a plan
export const updatePlan = (planId: string, updates: Partial<SavedPlan>): SavedPlan | null => {
  const plans = getAllPlans();
  const index = plans.findIndex(p => p.id === planId);
  
  if (index === -1) return null;
  
  const updatedPlan: SavedPlan = {
    ...plans[index],
    ...updates,
    id: planId, // Ensure ID doesn't change
    createdAt: plans[index].createdAt, // Preserve creation date
    lastModified: new Date().toISOString(),
  };
  
  plans[index] = updatedPlan;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  
  return updatedPlan;
};

// Get all plans
export const getAllPlans = (): SavedPlan[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error loading plans from localStorage:', error);
    return [];
  }
};

// Get a plan by ID
export const getPlanById = (planId: string): SavedPlan | null => {
  const plans = getAllPlans();
  return plans.find(p => p.id === planId) || null;
};

// Delete a plan
export const deletePlan = (planId: string): boolean => {
  const plans = getAllPlans();
  const filtered = plans.filter(p => p.id !== planId);
  
  if (filtered.length === plans.length) return false; // Plan not found
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
};

// Sort plans by last modified (newest first)
export const getSortedPlans = (): SavedPlan[] => {
  return getAllPlans().sort((a, b) => 
    new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
};
