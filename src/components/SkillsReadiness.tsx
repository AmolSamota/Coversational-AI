import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { employeeProfiles, getAllRoles, EMPLOYEE_COUNT } from '../data/workforceReadinessData';
import FilterPanel from './skillsReadiness/FilterPanel';
import DashboardTabs, { type DashboardTab } from './skillsReadiness/DashboardTabs';
import Breadcrumbs from './skillsReadiness/Breadcrumbs';
import SkillAvailabilityDashboard from './skillsReadiness/SkillAvailabilityDashboard';
import RedeploymentDashboard from './skillsReadiness/RedeploymentDashboard';
import LeadershipDashboard from './skillsReadiness/LeadershipDashboard';
import LearningVelocityDashboard from './skillsReadiness/LearningVelocityDashboard';
import EngagementDashboard from './skillsReadiness/EngagementDashboard';

type DashboardView = 'overview' | 'skill' | 'employee' | 'reportees';

interface DrillDownState {
  view: DashboardView;
  selectedSkill?: string;
  selectedEmployee?: string;
  selectedManagerId?: string;
}

const SkillsReadiness: React.FC = () => {
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<DashboardTab>('availability');
  const [filters, setFilters] = useState({
    location: '',
    businessUnit: '',
    roleId: '',
  });

  const [drillDown, setDrillDown] = useState<DrillDownState>({ view: 'overview' });

  // Verify data count on mount
  useEffect(() => {
    if (employeeProfiles.length !== EMPLOYEE_COUNT) {
      console.warn(`Skills Readiness: Expected ${EMPLOYEE_COUNT} employees but found ${employeeProfiles.length}`);
    }
  }, []);

  // Get unique filter options
  const filterOptions = useMemo(() => {
    if (!employeeProfiles || employeeProfiles.length === 0) {
      return { locations: [], businessUnits: [], roles: [] };
    }
    const locations = Array.from(new Set(employeeProfiles.map(p => p.employee.location))).sort();
    const businessUnits = Array.from(new Set(employeeProfiles.map(p => p.employee.businessUnit))).sort();
    const roles = getAllRoles();
    
    return { locations, businessUnits, roles };
  }, []);

  // Filter employees based on current filters
  const filteredProfiles = useMemo(() => {
    if (!employeeProfiles || employeeProfiles.length === 0) {
      return [];
    }
    return employeeProfiles.filter(profile => {
      if (filters.location && profile.employee.location !== filters.location) return false;
      if (filters.businessUnit && profile.employee.businessUnit !== filters.businessUnit) return false;
      if (filters.roleId && profile.employee.currentRoleId !== filters.roleId) return false;
      return true;
    });
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    // Reset drill-down when filters change
    setDrillDown({ view: 'overview' });
  };

  const handleDrillDown = (type: 'skill' | 'employee' | 'reportees', id: string, managerId?: string) => {
    if (type === 'reportees') {
      setDrillDown({ view: 'reportees', selectedEmployee: id, selectedManagerId: managerId });
    } else if (type === 'employee') {
      // Preserve selectedSkill if we're drilling down from a skill view
      setDrillDown(prev => ({ 
        view: 'employee', 
        selectedEmployee: id,
        selectedSkill: prev.view === 'skill' ? prev.selectedSkill : undefined
      }));
    } else {
      setDrillDown({ view: type, selectedSkill: id });
    }
  };

  const handleTabChange = (tab: DashboardTab) => {
    setActiveTab(tab);
    // Reset drill-down when changing tabs
    setDrillDown({ view: 'overview' });
  };

  // Define getTabLabel before using it in useMemo
  const getTabLabel = (tab: DashboardTab): string => {
    const labels: Record<DashboardTab, string> = {
      availability: 'Skill Availability',
      redeployment: 'Redeployment',
      leadership: 'Leadership',
      learning: 'Learning Velocity',
      engagement: 'Engagement',
    };
    return labels[tab] || tab;
  };

  // Build breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items: Array<{ label: string; onClick?: () => void }> = [
      { 
        label: 'Readiness', 
        onClick: () => navigate('/readiness')
      },
      { 
        label: 'Skills Readiness', 
        onClick: drillDown.view !== 'overview' ? () => { 
          setDrillDown({ view: 'overview' });
          setActiveTab('availability');
        } : undefined
      },
    ];

    // Add tab label
    const tabLabel = getTabLabel(activeTab);
    if (drillDown.view !== 'overview') {
      items.push({ 
        label: tabLabel,
        onClick: () => { setDrillDown({ view: 'overview' }); }
      });
    } else {
      items.push({ label: tabLabel });
    }

    // Add drill-down level
    if (drillDown.view === 'skill' && drillDown.selectedSkill) {
      // Find skill name from profiles
      let skillName = drillDown.selectedSkill;
      for (const profile of filteredProfiles) {
        const skill = profile.skills.find(s => s.skillId === drillDown.selectedSkill);
        if (skill) {
          skillName = skill.skillName;
          break;
        }
      }
      items.push({ 
        label: skillName,
        onClick: () => { setDrillDown({ view: 'overview' }); }
      });
    }
    
    // Add employee level (can be after skill or standalone)
    if ((drillDown.view === 'employee' || drillDown.view === 'reportees') && drillDown.selectedEmployee) {
      // Check if we came from a skill drill-down
      if (drillDown.view === 'employee' && drillDown.selectedSkill) {
        // We're viewing an employee from a skill, so add skill breadcrumb first
        let skillName = drillDown.selectedSkill;
        for (const profile of filteredProfiles) {
          const skill = profile.skills.find(s => s.skillId === drillDown.selectedSkill);
          if (skill) {
            skillName = skill.skillName;
            break;
          }
        }
        items.push({ 
          label: skillName,
          onClick: () => { setDrillDown({ view: 'skill', selectedSkill: drillDown.selectedSkill }); }
        });
      }
      
      items.push({ 
        label: drillDown.selectedEmployee,
        onClick: drillDown.view === 'reportees' ? () => { 
          const employee = filteredProfiles.find(p => p.employee.employeeName === drillDown.selectedEmployee);
          if (employee) {
            setDrillDown({ view: 'employee', selectedEmployee: drillDown.selectedEmployee });
          }
        } : () => { 
          // If we came from a skill, go back to skill view, otherwise go to overview
          if (drillDown.selectedSkill) {
            setDrillDown({ view: 'skill', selectedSkill: drillDown.selectedSkill });
          } else {
            setDrillDown({ view: 'overview' });
          }
        }
      });
      if (drillDown.view === 'reportees') {
        items.push({ label: 'Direct Reports' });
      }
    }

    return items;
  }, [activeTab, drillDown, filteredProfiles, getTabLabel, navigate]);

  // Show loading state if no data
  if (!employeeProfiles || employeeProfiles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-2">No workforce data available</div>
          <div className="text-sm text-gray-500">Please check the data source</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Skills Readiness</h1>
            <p className="text-gray-600 mt-1">
              Comprehensive analysis of workforce skills, capabilities, and readiness
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <FilterPanel
              filters={filters}
              filterOptions={filterOptions}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Main Content - Show only active dashboard */}
          <div className="lg:col-span-3">
            {filteredProfiles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="text-gray-500 mb-2">No employees match the current filters</div>
                <button
                  onClick={() => setFilters({
                    location: '',
                    businessUnit: '',
                    roleId: '',
                  })}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'availability' && (
                  <SkillAvailabilityDashboard
                    profiles={filteredProfiles}
                    drillDown={drillDown}
                    onDrillDown={handleDrillDown}
                  />
                )}
                {activeTab === 'redeployment' && (
                  <RedeploymentDashboard
                    profiles={filteredProfiles}
                    drillDown={drillDown}
                    onDrillDown={handleDrillDown}
                  />
                )}
            {activeTab === 'leadership' && (
              <LeadershipDashboard
                profiles={filteredProfiles}
                allProfiles={employeeProfiles}
                drillDown={drillDown}
                onDrillDown={handleDrillDown}
              />
            )}
                {activeTab === 'learning' && (
                  <LearningVelocityDashboard
                    profiles={filteredProfiles}
                    drillDown={drillDown}
                    onDrillDown={handleDrillDown}
                  />
                )}
                {activeTab === 'engagement' && (
                  <EngagementDashboard
                    profiles={filteredProfiles}
                    drillDown={drillDown}
                    onDrillDown={handleDrillDown}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillsReadiness;

