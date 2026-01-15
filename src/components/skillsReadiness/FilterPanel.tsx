import React from 'react';
import type { RoleInfo } from '../../data/workforceReadinessSchema';

interface FilterPanelProps {
  filters: {
    location: string;
    businessUnit: string;
    roleId: string;
  };
  filterOptions: {
    locations: string[];
    businessUnits: string[];
    roles: RoleInfo[];
  };
  onFilterChange: (filters: Partial<FilterPanelProps['filters']>) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, filterOptions, onFilterChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
      
      <div className="space-y-4">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => onFilterChange({ location: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Locations</option>
            {filterOptions.locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* Business Unit Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Unit
          </label>
          <select
            value={filters.businessUnit}
            onChange={(e) => onFilterChange({ businessUnit: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Business Units</option>
            {filterOptions.businessUnits.map(unit => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            value={filters.roleId}
            onChange={(e) => onFilterChange({ roleId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="">All Roles</option>
            {filterOptions.roles.map(role => (
              <option key={role.roleId} value={role.roleId}>
                {role.roleName}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        <button
          onClick={() => onFilterChange({
            location: '',
            businessUnit: '',
            roleId: '',
          })}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
};

export default FilterPanel;

