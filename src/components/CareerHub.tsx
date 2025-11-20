import React from 'react';
import HeroSection from './HeroSection';
import JobTasksCard from './JobTasksCard';
import MyTasksCard from './MyTasksCard';
import OrganizationCard from './OrganizationCard';
import CareerHubExploreSection from './CareerHubExploreSection';
import GetHelpButton from './GetHelpButton';

const CareerHub: React.FC = () => {
  return (
    <>
      {/* Hero section spans full width */}
      <HeroSection />
      
      {/* Main content area with 3-column grid layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Desktop (lg): 3-column layout, Tablet (md): 2-column, Mobile: 1-column */}
        <div className="grid grid-cols-1 md:grid-cols-12 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - narrower column */}
          {/* Mobile: full width, Tablet: 4 cols, Desktop: 3 cols */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <JobTasksCard />
            <MyTasksCard />
            <OrganizationCard />
          </div>

          {/* Main Content Area - wider column */}
          {/* Mobile: full width, Tablet: 8 cols, Desktop: 7 cols */}
          <div className="md:col-span-8 lg:col-span-7">
            <CareerHubExploreSection />
          </div>

          {/* Right Sidebar - Get Help button */}
          {/* Mobile: full width, Tablet: full width (stacks), Desktop: 2 cols */}
          <div className="md:col-span-12 lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <GetHelpButton />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareerHub;

