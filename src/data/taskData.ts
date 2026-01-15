import { employeeProfiles } from './workforceReadinessData';
import type { Task } from './workforceReadinessSchema';

// Large task pools for each role - each role has 12-15 unique tasks
const roleTaskPools: { [roleId: string]: { name: string; hours: number; score: number; capability: 'GenAI' | 'RPA' | 'ML' | 'None' }[] } = {
  // Software Engineer I - Entry level, more routine tasks
  'SWE1': [
    { name: 'Writing Unit Tests', hours: 8, score: 72, capability: 'RPA' },
    { name: 'Code Documentation', hours: 5, score: 88, capability: 'GenAI' },
    { name: 'Bug Triage & Fixing', hours: 10, score: 55, capability: 'GenAI' },
    { name: 'Feature Implementation', hours: 12, score: 45, capability: 'None' },
    { name: 'Code Review Participation', hours: 6, score: 68, capability: 'GenAI' },
    { name: 'Standup & Status Updates', hours: 3, score: 85, capability: 'GenAI' },
    { name: 'Learning & Training', hours: 4, score: 40, capability: 'None' },
    { name: 'Test Case Writing', hours: 7, score: 70, capability: 'RPA' },
    { name: 'API Integration Testing', hours: 5, score: 65, capability: 'RPA' },
    { name: 'Code Refactoring', hours: 9, score: 50, capability: 'GenAI' },
    { name: 'Database Query Writing', hours: 6, score: 60, capability: 'GenAI' },
    { name: 'Configuration Management', hours: 4, score: 75, capability: 'RPA' },
    { name: 'Deployment Support', hours: 3, score: 80, capability: 'RPA' },
  ],
  // Software Engineer II - Mid-level, mix of routine and complex
  'SWE2': [
    { name: 'Feature Design & Development', hours: 14, score: 50, capability: 'ML' },
    { name: 'Code Review & Mentoring', hours: 7, score: 70, capability: 'GenAI' },
    { name: 'Technical Documentation', hours: 5, score: 85, capability: 'GenAI' },
    { name: 'API Design & Integration', hours: 8, score: 60, capability: 'GenAI' },
    { name: 'Test Automation Setup', hours: 4, score: 78, capability: 'RPA' },
    { name: 'Performance Optimization', hours: 6, score: 65, capability: 'ML' },
    { name: 'Sprint Planning & Estimation', hours: 3, score: 75, capability: 'GenAI' },
    { name: 'System Integration', hours: 7, score: 55, capability: 'None' },
    { name: 'Database Schema Design', hours: 5, score: 62, capability: 'ML' },
    { name: 'CI/CD Pipeline Configuration', hours: 4, score: 80, capability: 'RPA' },
    { name: 'Third-party API Integration', hours: 6, score: 58, capability: 'GenAI' },
    { name: 'Code Quality Analysis', hours: 3, score: 72, capability: 'ML' },
    { name: 'Technical Debt Reduction', hours: 5, score: 48, capability: 'None' },
    { name: 'Monitoring & Alerting Setup', hours: 4, score: 68, capability: 'RPA' },
  ],
  // Senior Software Engineer - More complex, strategic tasks
  'SWE3': [
    { name: 'Architecture Design', hours: 10, score: 35, capability: 'None' },
    { name: 'System Design Reviews', hours: 6, score: 45, capability: 'GenAI' },
    { name: 'Technical Documentation', hours: 4, score: 82, capability: 'GenAI' },
    { name: 'Mentoring Junior Engineers', hours: 5, score: 30, capability: 'None' },
    { name: 'Cross-team Collaboration', hours: 6, score: 40, capability: 'None' },
    { name: 'Code Review & Quality Gates', hours: 7, score: 68, capability: 'GenAI' },
    { name: 'Incident Response & Debugging', hours: 4, score: 55, capability: 'ML' },
    { name: 'Technology Stack Evaluation', hours: 5, score: 50, capability: 'ML' },
    { name: 'Design Pattern Implementation', hours: 6, score: 42, capability: 'None' },
    { name: 'Performance Profiling & Analysis', hours: 5, score: 65, capability: 'ML' },
    { name: 'Security Review & Assessment', hours: 4, score: 60, capability: 'GenAI' },
    { name: 'Technical Roadmap Planning', hours: 6, score: 38, capability: 'GenAI' },
    { name: 'Cross-functional Design Sessions', hours: 5, score: 35, capability: 'None' },
    { name: 'Legacy System Modernization', hours: 7, score: 45, capability: 'None' },
  ],
  // Principal Software Engineer - Strategic, high-level tasks
  'SWE4': [
    { name: 'Technical Strategy & Roadmap', hours: 8, score: 25, capability: 'None' },
    { name: 'Architecture Reviews', hours: 6, score: 40, capability: 'GenAI' },
    { name: 'Technical Writing & Publications', hours: 4, score: 80, capability: 'GenAI' },
    { name: 'Cross-functional Leadership', hours: 7, score: 30, capability: 'None' },
    { name: 'Technology Evaluation', hours: 5, score: 50, capability: 'ML' },
    { name: 'Design Pattern Development', hours: 6, score: 45, capability: 'GenAI' },
    { name: 'Industry Research & Analysis', hours: 4, score: 55, capability: 'GenAI' },
    { name: 'Technical Standards Definition', hours: 5, score: 35, capability: 'None' },
    { name: 'Complex Problem Solving', hours: 6, score: 28, capability: 'None' },
    { name: 'Innovation & R&D Projects', hours: 5, score: 40, capability: 'ML' },
    { name: 'External Speaking & Conferences', hours: 3, score: 30, capability: 'GenAI' },
    { name: 'Technical Advisory & Consulting', hours: 4, score: 32, capability: 'None' },
  ],
  // Site Reliability Engineer II
  'SRE2': [
    { name: 'Infrastructure Monitoring', hours: 8, score: 75, capability: 'ML' },
    { name: 'Incident Response & On-call', hours: 6, score: 50, capability: 'ML' },
    { name: 'Runbook Documentation', hours: 4, score: 85, capability: 'GenAI' },
    { name: 'Infrastructure as Code', hours: 7, score: 70, capability: 'RPA' },
    { name: 'Performance Tuning', hours: 5, score: 65, capability: 'ML' },
    { name: 'Capacity Planning', hours: 4, score: 72, capability: 'ML' },
    { name: 'Post-mortem Reports', hours: 3, score: 80, capability: 'GenAI' },
    { name: 'Service Level Objective Tracking', hours: 4, score: 78, capability: 'RPA' },
    { name: 'Disaster Recovery Planning', hours: 5, score: 45, capability: 'None' },
    { name: 'Automated Remediation Setup', hours: 6, score: 82, capability: 'RPA' },
    { name: 'Cost Optimization Analysis', hours: 4, score: 68, capability: 'ML' },
    { name: 'Security Patch Management', hours: 5, score: 70, capability: 'RPA' },
    { name: 'Configuration Drift Detection', hours: 4, score: 75, capability: 'ML' },
    { name: 'Chaos Engineering Experiments', hours: 3, score: 55, capability: 'ML' },
  ],
  // Senior Data Engineer
  'DS3': [
    { name: 'ETL Pipeline Development', hours: 10, score: 68, capability: 'RPA' },
    { name: 'Data Quality Checks', hours: 6, score: 75, capability: 'RPA' },
    { name: 'Data Modeling & Schema Design', hours: 7, score: 60, capability: 'ML' },
    { name: 'Data Documentation', hours: 4, score: 82, capability: 'GenAI' },
    { name: 'Performance Optimization', hours: 5, score: 65, capability: 'ML' },
    { name: 'Data Lineage Tracking', hours: 4, score: 70, capability: 'RPA' },
    { name: 'Stakeholder Reporting', hours: 3, score: 78, capability: 'GenAI' },
    { name: 'Data Warehouse Design', hours: 6, score: 58, capability: 'ML' },
    { name: 'Data Pipeline Monitoring', hours: 5, score: 72, capability: 'ML' },
    { name: 'Data Validation & Testing', hours: 6, score: 70, capability: 'RPA' },
    { name: 'Data Catalog Maintenance', hours: 4, score: 80, capability: 'GenAI' },
    { name: 'ETL Job Scheduling', hours: 3, score: 85, capability: 'RPA' },
    { name: 'Data Migration Projects', hours: 7, score: 55, capability: 'None' },
    { name: 'Data Compliance & Governance', hours: 4, score: 60, capability: 'GenAI' },
  ],
  // Senior Security Engineer
  'SEC3': [
    { name: 'Security Code Reviews', hours: 8, score: 65, capability: 'GenAI' },
    { name: 'Vulnerability Assessment', hours: 6, score: 70, capability: 'ML' },
    { name: 'Security Documentation', hours: 4, score: 80, capability: 'GenAI' },
    { name: 'Threat Modeling', hours: 5, score: 45, capability: 'None' },
    { name: 'Security Tool Configuration', hours: 5, score: 72, capability: 'RPA' },
    { name: 'Incident Response', hours: 4, score: 55, capability: 'ML' },
    { name: 'Security Training & Awareness', hours: 3, score: 60, capability: 'GenAI' },
    { name: 'Penetration Testing', hours: 6, score: 50, capability: 'None' },
    { name: 'Security Policy Development', hours: 5, score: 55, capability: 'GenAI' },
    { name: 'Compliance Audits', hours: 4, score: 65, capability: 'RPA' },
    { name: 'Security Architecture Review', hours: 5, score: 48, capability: 'None' },
    { name: 'Security Metrics & Reporting', hours: 3, score: 75, capability: 'GenAI' },
    { name: 'Security Automation Scripts', hours: 4, score: 78, capability: 'RPA' },
    { name: 'Security Risk Analysis', hours: 5, score: 58, capability: 'ML' },
  ],
  // Senior Technical Program Manager
  'TPM3': [
    { name: 'Status Report Generation', hours: 6, score: 88, capability: 'GenAI' },
    { name: 'Meeting Notes & Summaries', hours: 5, score: 90, capability: 'GenAI' },
    { name: 'Project Planning & Roadmaps', hours: 7, score: 55, capability: 'GenAI' },
    { name: 'Stakeholder Communication', hours: 8, score: 35, capability: 'None' },
    { name: 'Risk Assessment & Tracking', hours: 4, score: 70, capability: 'ML' },
    { name: 'Resource Allocation Planning', hours: 5, score: 65, capability: 'ML' },
    { name: 'Data Entry & Tracking', hours: 3, score: 92, capability: 'RPA' },
    { name: 'Budget Planning & Tracking', hours: 4, score: 75, capability: 'ML' },
    { name: 'Dependency Management', hours: 5, score: 60, capability: 'GenAI' },
    { name: 'Milestone Tracking', hours: 4, score: 85, capability: 'RPA' },
    { name: 'Stakeholder Alignment Meetings', hours: 6, score: 40, capability: 'None' },
    { name: 'Program Metrics & Dashboards', hours: 4, score: 80, capability: 'GenAI' },
    { name: 'Change Management Documentation', hours: 3, score: 82, capability: 'GenAI' },
    { name: 'Vendor Coordination', hours: 4, score: 70, capability: 'RPA' },
  ],
  // Engineering Manager
  'EM1': [
    { name: '1-on-1 Meeting Prep & Notes', hours: 5, score: 85, capability: 'GenAI' },
    { name: 'Performance Review Documentation', hours: 4, score: 80, capability: 'GenAI' },
    { name: 'Team Status Reports', hours: 4, score: 88, capability: 'GenAI' },
    { name: 'Hiring & Interview Coordination', hours: 6, score: 70, capability: 'RPA' },
    { name: 'Team Planning & Estimation', hours: 5, score: 60, capability: 'GenAI' },
    { name: 'Stakeholder Updates', hours: 4, score: 40, capability: 'None' },
    { name: 'Budget & Resource Planning', hours: 3, score: 65, capability: 'ML' },
    { name: 'Career Development Planning', hours: 4, score: 45, capability: 'GenAI' },
    { name: 'Team Retrospectives', hours: 3, score: 50, capability: 'GenAI' },
    { name: 'Recruitment Pipeline Management', hours: 5, score: 72, capability: 'RPA' },
    { name: 'Compensation Planning', hours: 3, score: 55, capability: 'ML' },
    { name: 'Team Metrics & Analytics', hours: 4, score: 75, capability: 'ML' },
    { name: 'Cross-team Coordination', hours: 5, score: 38, capability: 'None' },
    { name: 'Technical Decision Support', hours: 4, score: 42, capability: 'None' },
  ],
  // Senior Engineering Manager
  'EM2': [
    { name: 'Strategic Planning Documents', hours: 6, score: 50, capability: 'GenAI' },
    { name: 'Executive Reporting', hours: 5, score: 82, capability: 'GenAI' },
    { name: 'Cross-team Coordination', hours: 7, score: 30, capability: 'None' },
    { name: 'Organizational Design', hours: 4, score: 25, capability: 'None' },
    { name: 'Budget & Resource Allocation', hours: 5, score: 68, capability: 'ML' },
    { name: 'Talent Development Planning', hours: 4, score: 45, capability: 'GenAI' },
    { name: 'Organizational Metrics & KPIs', hours: 4, score: 70, capability: 'ML' },
    { name: 'Strategic Initiative Planning', hours: 5, score: 35, capability: 'None' },
    { name: 'Executive Presentations', hours: 4, score: 55, capability: 'GenAI' },
    { name: 'Cross-functional Alignment', hours: 6, score: 32, capability: 'None' },
    { name: 'Talent Acquisition Strategy', hours: 4, score: 48, capability: 'GenAI' },
    { name: 'Organizational Change Management', hours: 5, score: 28, capability: 'None' },
  ],
  // Senior Machine Learning Engineer
  'MLE3': [
    { name: 'Model Training & Tuning', hours: 10, score: 60, capability: 'ML' },
    { name: 'Feature Engineering', hours: 8, score: 65, capability: 'ML' },
    { name: 'Experiment Tracking & Logging', hours: 5, score: 75, capability: 'RPA' },
    { name: 'Model Documentation', hours: 4, score: 85, capability: 'GenAI' },
    { name: 'Data Preprocessing Pipelines', hours: 6, score: 70, capability: 'RPA' },
    { name: 'Model Evaluation & Metrics', hours: 5, score: 68, capability: 'ML' },
    { name: 'Research & Paper Reading', hours: 3, score: 40, capability: 'GenAI' },
    { name: 'Hyperparameter Optimization', hours: 6, score: 72, capability: 'ML' },
    { name: 'Model Deployment & Serving', hours: 5, score: 58, capability: 'None' },
    { name: 'A/B Testing Setup', hours: 4, score: 70, capability: 'RPA' },
    { name: 'Model Monitoring & Drift Detection', hours: 5, score: 75, capability: 'ML' },
    { name: 'ML Pipeline Orchestration', hours: 6, score: 68, capability: 'RPA' },
    { name: 'Feature Store Management', hours: 4, score: 65, capability: 'RPA' },
    { name: 'Model Interpretability Analysis', hours: 5, score: 62, capability: 'ML' },
  ],
  // Product Manager I
  'PM1': [
    { name: 'User Story Writing', hours: 6, score: 85, capability: 'GenAI' },
    { name: 'Product Requirements Documentation', hours: 7, score: 80, capability: 'GenAI' },
    { name: 'Stakeholder Meeting Notes', hours: 4, score: 90, capability: 'GenAI' },
    { name: 'Competitive Analysis', hours: 5, score: 70, capability: 'GenAI' },
    { name: 'Feature Prioritization', hours: 4, score: 65, capability: 'ML' },
    { name: 'User Feedback Collection', hours: 5, score: 75, capability: 'RPA' },
    { name: 'Product Metrics Tracking', hours: 4, score: 78, capability: 'RPA' },
    { name: 'Release Notes Writing', hours: 3, score: 88, capability: 'GenAI' },
    { name: 'Backlog Grooming', hours: 5, score: 72, capability: 'GenAI' },
    { name: 'User Interview Summaries', hours: 4, score: 82, capability: 'GenAI' },
    { name: 'Feature Flag Management', hours: 3, score: 80, capability: 'RPA' },
    { name: 'A/B Test Planning', hours: 4, score: 68, capability: 'ML' },
  ],
  // Product Manager II
  'PM2': [
    { name: 'Product Strategy Documents', hours: 7, score: 60, capability: 'GenAI' },
    { name: 'Roadmap Planning & Updates', hours: 6, score: 65, capability: 'GenAI' },
    { name: 'Market Research & Analysis', hours: 5, score: 70, capability: 'GenAI' },
    { name: 'Stakeholder Presentations', hours: 4, score: 55, capability: 'GenAI' },
    { name: 'Cross-functional Alignment', hours: 6, score: 40, capability: 'None' },
    { name: 'Product Metrics Analysis', hours: 5, score: 75, capability: 'ML' },
    { name: 'User Research Synthesis', hours: 4, score: 68, capability: 'GenAI' },
    { name: 'Feature Specification Writing', hours: 6, score: 78, capability: 'GenAI' },
    { name: 'Go-to-Market Planning', hours: 5, score: 50, capability: 'GenAI' },
    { name: 'Product Launch Coordination', hours: 4, score: 60, capability: 'RPA' },
    { name: 'Customer Success Collaboration', hours: 4, score: 45, capability: 'None' },
    { name: 'Product Analytics Dashboard Setup', hours: 3, score: 80, capability: 'RPA' },
  ],
  // Senior Product Manager
  'PM3': [
    { name: 'Product Vision & Strategy', hours: 8, score: 35, capability: 'None' },
    { name: 'Executive Presentations', hours: 5, score: 60, capability: 'GenAI' },
    { name: 'Market Opportunity Analysis', hours: 6, score: 55, capability: 'ML' },
    { name: 'Cross-functional Leadership', hours: 7, score: 30, capability: 'None' },
    { name: 'Product Portfolio Planning', hours: 6, score: 50, capability: 'GenAI' },
    { name: 'Strategic Roadmap Development', hours: 5, score: 45, capability: 'GenAI' },
    { name: 'Customer Advisory Board Management', hours: 4, score: 40, capability: 'None' },
    { name: 'Product-Market Fit Analysis', hours: 5, score: 58, capability: 'ML' },
    { name: 'Business Case Development', hours: 4, score: 65, capability: 'GenAI' },
    { name: 'Partnership Strategy', hours: 5, score: 42, capability: 'None' },
    { name: 'Product Innovation Workshops', hours: 4, score: 38, capability: 'None' },
  ],
  // Principal Product Manager
  'PM4': [
    { name: 'Product Strategy & Vision', hours: 8, score: 25, capability: 'None' },
    { name: 'Executive Communication', hours: 6, score: 50, capability: 'GenAI' },
    { name: 'Industry Thought Leadership', hours: 4, score: 30, capability: 'GenAI' },
    { name: 'Organizational Product Strategy', hours: 7, score: 28, capability: 'None' },
    { name: 'Product Innovation & R&D', hours: 5, score: 35, capability: 'None' },
    { name: 'Strategic Partnerships', hours: 5, score: 32, capability: 'None' },
    { name: 'Product Portfolio Optimization', hours: 6, score: 40, capability: 'ML' },
    { name: 'Market Trend Analysis', hours: 4, score: 55, capability: 'GenAI' },
    { name: 'Product Architecture Decisions', hours: 5, score: 30, capability: 'None' },
    { name: 'Cross-Product Strategy', hours: 6, score: 25, capability: 'None' },
  ],
  // UX Designer I
  'UX1': [
    { name: 'Wireframe Creation', hours: 8, score: 70, capability: 'GenAI' },
    { name: 'Design System Component Usage', hours: 6, score: 75, capability: 'RPA' },
    { name: 'User Flow Documentation', hours: 5, score: 80, capability: 'GenAI' },
    { name: 'Design Asset Organization', hours: 4, score: 85, capability: 'RPA' },
    { name: 'Usability Test Preparation', hours: 4, score: 72, capability: 'GenAI' },
    { name: 'Design Spec Writing', hours: 5, score: 78, capability: 'GenAI' },
    { name: 'Icon & Asset Creation', hours: 6, score: 65, capability: 'GenAI' },
    { name: 'Design Review Participation', hours: 4, score: 50, capability: 'None' },
    { name: 'Design Tool Maintenance', hours: 3, score: 80, capability: 'RPA' },
    { name: 'Design Pattern Research', hours: 4, score: 68, capability: 'GenAI' },
    { name: 'Accessibility Checklist Review', hours: 3, score: 75, capability: 'RPA' },
  ],
  // UX Designer II
  'UX2': [
    { name: 'User Research Planning', hours: 6, score: 60, capability: 'GenAI' },
    { name: 'Prototype Development', hours: 8, score: 65, capability: 'GenAI' },
    { name: 'Design System Contribution', hours: 5, score: 70, capability: 'RPA' },
    { name: 'Usability Testing Execution', hours: 5, score: 55, capability: 'None' },
    { name: 'Design Documentation', hours: 4, score: 82, capability: 'GenAI' },
    { name: 'Stakeholder Design Reviews', hours: 4, score: 45, capability: 'None' },
    { name: 'Design Iteration & Refinement', hours: 6, score: 58, capability: 'GenAI' },
    { name: 'User Journey Mapping', hours: 5, score: 62, capability: 'GenAI' },
    { name: 'Design Handoff Coordination', hours: 4, score: 75, capability: 'RPA' },
    { name: 'Design Quality Assurance', hours: 4, score: 70, capability: 'RPA' },
    { name: 'Accessibility Audit', hours: 4, score: 72, capability: 'RPA' },
  ],
  // Senior UX Designer
  'UX3': [
    { name: 'Design Strategy & Vision', hours: 7, score: 40, capability: 'None' },
    { name: 'User Research Synthesis', hours: 5, score: 65, capability: 'GenAI' },
    { name: 'Design System Architecture', hours: 6, score: 55, capability: 'None' },
    { name: 'Cross-functional Design Leadership', hours: 6, score: 35, capability: 'None' },
    { name: 'Design Process Optimization', hours: 4, score: 60, capability: 'GenAI' },
    { name: 'Mentoring Junior Designers', hours: 5, score: 30, capability: 'None' },
    { name: 'Design Quality Standards', hours: 4, score: 50, capability: 'GenAI' },
    { name: 'Design Innovation Workshops', hours: 4, score: 38, capability: 'None' },
    { name: 'Design Metrics & Analytics', hours: 4, score: 70, capability: 'ML' },
    { name: 'Design Tool Evaluation', hours: 3, score: 65, capability: 'GenAI' },
  ],
  // Principal UX Designer
  'UX4': [
    { name: 'Design Strategy & Vision', hours: 8, score: 25, capability: 'None' },
    { name: 'Design Organization Leadership', hours: 7, score: 28, capability: 'None' },
    { name: 'Design Innovation & Research', hours: 5, score: 35, capability: 'None' },
    { name: 'Industry Thought Leadership', hours: 4, score: 30, capability: 'GenAI' },
    { name: 'Design System Strategy', hours: 6, score: 40, capability: 'None' },
    { name: 'Cross-Product Design Strategy', hours: 6, score: 30, capability: 'None' },
    { name: 'Design Talent Development', hours: 5, score: 32, capability: 'None' },
    { name: 'Design Tool & Process Innovation', hours: 4, score: 45, capability: 'GenAI' },
  ],
  // Technical Program Manager I
  'TPM1': [
    { name: 'Status Report Generation', hours: 5, score: 90, capability: 'GenAI' },
    { name: 'Meeting Notes & Summaries', hours: 4, score: 92, capability: 'GenAI' },
    { name: 'Project Timeline Tracking', hours: 5, score: 85, capability: 'RPA' },
    { name: 'Stakeholder Communication', hours: 6, score: 40, capability: 'None' },
    { name: 'Risk Log Maintenance', hours: 3, score: 88, capability: 'RPA' },
    { name: 'Resource Allocation Tracking', hours: 4, score: 80, capability: 'RPA' },
    { name: 'Budget Tracking & Reporting', hours: 4, score: 82, capability: 'ML' },
    { name: 'Dependency Tracking', hours: 4, score: 78, capability: 'RPA' },
    { name: 'Milestone Documentation', hours: 3, score: 85, capability: 'GenAI' },
    { name: 'Action Item Tracking', hours: 3, score: 90, capability: 'RPA' },
  ],
  // Technical Program Manager II
  'TPM2': [
    { name: 'Program Planning & Roadmaps', hours: 6, score: 60, capability: 'GenAI' },
    { name: 'Stakeholder Alignment', hours: 7, score: 35, capability: 'None' },
    { name: 'Risk Assessment & Mitigation', hours: 5, score: 70, capability: 'ML' },
    { name: 'Resource Planning & Allocation', hours: 5, score: 68, capability: 'ML' },
    { name: 'Budget Planning & Management', hours: 4, score: 75, capability: 'ML' },
    { name: 'Program Metrics & Dashboards', hours: 4, score: 82, capability: 'GenAI' },
    { name: 'Cross-team Coordination', hours: 6, score: 38, capability: 'None' },
    { name: 'Change Management', hours: 4, score: 55, capability: 'GenAI' },
    { name: 'Vendor & Partner Coordination', hours: 4, score: 72, capability: 'RPA' },
    { name: 'Program Documentation', hours: 4, score: 80, capability: 'GenAI' },
  ],
  // Principal Technical Program Manager
  'TPM4': [
    { name: 'Strategic Program Planning', hours: 7, score: 30, capability: 'None' },
    { name: 'Executive Program Reporting', hours: 5, score: 75, capability: 'GenAI' },
    { name: 'Organizational Program Strategy', hours: 6, score: 25, capability: 'None' },
    { name: 'Cross-functional Program Leadership', hours: 7, score: 28, capability: 'None' },
    { name: 'Program Portfolio Management', hours: 6, score: 40, capability: 'ML' },
    { name: 'Strategic Initiative Planning', hours: 5, score: 32, capability: 'None' },
    { name: 'Program Process Innovation', hours: 4, score: 50, capability: 'GenAI' },
    { name: 'Program Talent Development', hours: 4, score: 35, capability: 'None' },
  ],
};

/**
 * Get tasks for a specific employee
 */
export function getEmployeeTasks(employeeId: string): Task[] {
  const profile = employeeProfiles.find(p => p.employee.employeeId === employeeId);
  if (!profile) return [];

  const roleId = profile.employee.currentRoleId;
  const roleName = profile.employee.currentRoleName;
  
  // Get role-specific task pool or use a default set
  let roleTaskPool = roleTaskPools[roleId];
  
  // If no pool exists, create a generic one based on role level
  if (!roleTaskPool) {
    if (roleId.includes('Senior') || roleId.includes('Principal') || roleId.includes('3') || roleId.includes('4')) {
      roleTaskPool = [
        { name: 'Strategic Planning', hours: 6, score: 30, capability: 'None' },
        { name: 'Technical Documentation', hours: 4, score: 80, capability: 'GenAI' },
        { name: 'Mentoring & Coaching', hours: 5, score: 35, capability: 'None' },
        { name: 'Cross-functional Collaboration', hours: 6, score: 40, capability: 'None' },
        { name: 'Technical Reviews', hours: 5, score: 60, capability: 'GenAI' },
        { name: 'Project Management', hours: 6, score: 55, capability: 'GenAI' },
        { name: 'Stakeholder Communication', hours: 5, score: 38, capability: 'None' },
      ];
    } else {
      roleTaskPool = [
        { name: 'Feature Development', hours: 12, score: 50, capability: 'ML' },
        { name: 'Code Review', hours: 6, score: 70, capability: 'GenAI' },
        { name: 'Documentation', hours: 4, score: 85, capability: 'GenAI' },
        { name: 'Testing & QA', hours: 6, score: 72, capability: 'RPA' },
        { name: 'Bug Fixing', hours: 8, score: 55, capability: 'GenAI' },
        { name: 'Code Implementation', hours: 10, score: 48, capability: 'None' },
        { name: 'Status Updates', hours: 3, score: 80, capability: 'GenAI' },
      ];
    }
  }

  // Use employee ID as seed for deterministic but varied task selection
  const employeeSeed = parseInt(employeeId.slice(-4), 16) || 0;
  
  // Select 5-7 unique tasks from the pool for this employee
  const numTasks = 5 + (employeeSeed % 3); // 5, 6, or 7 tasks
  const selectedIndices = new Set<number>();
  
  // Deterministic selection based on employee seed
  while (selectedIndices.size < numTasks && selectedIndices.size < roleTaskPool.length) {
    const index = (employeeSeed + selectedIndices.size * 17) % roleTaskPool.length;
    if (!selectedIndices.has(index)) {
      selectedIndices.add(index);
    } else {
      // If collision, try next index
      let nextIndex = (index + 1) % roleTaskPool.length;
      while (selectedIndices.has(nextIndex) && selectedIndices.size < roleTaskPool.length) {
        nextIndex = (nextIndex + 1) % roleTaskPool.length;
      }
      selectedIndices.add(nextIndex);
    }
  }
  
  // Create tasks from selected indices with variation
  const selectedTasks: Array<{ task: typeof roleTaskPools['SWE1'][0]; adjustedHours: number; adjustedScore: number; originalIdx: number }> = [];
  
  Array.from(selectedIndices).forEach((taskIdx, idx) => {
    const task = roleTaskPool[taskIdx];
    
    // Add variation to hours and scores for each employee
    const hourVariation = 1 + ((employeeSeed + idx * 7) % 40 - 20) / 100;
    const scoreVariation = (employeeSeed + idx * 11) % 10 - 5;
    
    const adjustedHours = Math.max(2, Math.round(task.hours * hourVariation));
    const adjustedScore = Math.max(20, Math.min(95, task.score + scoreVariation));
    
    selectedTasks.push({
      task,
      adjustedHours,
      adjustedScore,
      originalIdx: idx,
    });
  });
  
  // Normalize task hours so they sum to approximately 40 hours/week per employee
  const totalRawHours = selectedTasks.reduce((sum, t) => sum + t.adjustedHours, 0);
  const targetTotalHours = 40; // Standard work week
  const normalizationFactor = totalRawHours > 0 ? targetTotalHours / totalRawHours : 1;
  
  // Apply normalization while preserving relative proportions
  const tasks: Task[] = [];
  selectedTasks.forEach(({ task, adjustedHours, adjustedScore, originalIdx }) => {
    const normalizedHours = Math.max(1, Math.round(adjustedHours * normalizationFactor));
    
    tasks.push({
      taskId: `${employeeId}-T${originalIdx}`,
      taskName: task.name,
      roleId: roleId,
      roleName: roleName,
      hoursPerWeek: normalizedHours,
      automationScore: adjustedScore,
      aiCapabilityMatch: task.capability,
      skillRequirements: [],
    });
  });

  return tasks;
}
