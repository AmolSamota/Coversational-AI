import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Breadcrumbs from '../skillsReadiness/Breadcrumbs';
import { employeeProfiles, getAllRoles, EMPLOYEE_COUNT } from '../../data/workforceReadinessData';
import Modal from '../Modal';
import type { EmployeeProfile } from '../../data/workforceReadinessSchema';

// Task data structure for AI automation
interface Task {
  taskId: string;
  taskName: string;
  roleId: string;
  roleName: string;
  hoursPerWeek: number;
  automationScore: number; // 0-100
  aiCapabilityMatch: 'GenAI' | 'RPA' | 'ML' | 'None';
  skillRequirements: string[];
}

// Generate synthetic task data based on roles
const generateTaskData = (profiles: typeof employeeProfiles): Task[] => {
  const tasks: Task[] = [];
  
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

  // Generate tasks for each employee based on their role
  profiles.forEach(profile => {
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
    const employeeSeed = parseInt(profile.employee.employeeId.slice(-4), 16) || 0;
    
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
    const selectedTasks: Array<{ task: typeof roleTaskPool[0]; adjustedHours: number; adjustedScore: number; originalIdx: number }> = [];
    
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
    // This ensures realistic time allocation (employees work ~40 hours/week)
    const totalRawHours = selectedTasks.reduce((sum, t) => sum + t.adjustedHours, 0);
    const targetTotalHours = 40; // Standard work week
    const normalizationFactor = totalRawHours > 0 ? targetTotalHours / totalRawHours : 1;
    
    // Apply normalization while preserving relative proportions
    selectedTasks.forEach(({ task, adjustedHours, adjustedScore, originalIdx }) => {
      const normalizedHours = Math.max(1, Math.round(adjustedHours * normalizationFactor));
      
      tasks.push({
        taskId: `${profile.employee.employeeId}-T${originalIdx}`,
        taskName: task.name,
        roleId: roleId,
        roleName: roleName,
        hoursPerWeek: normalizedHours,
        automationScore: adjustedScore,
        aiCapabilityMatch: task.capability,
        skillRequirements: [],
      });
    });
  });

  return tasks;
};

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

const AIAugmentation: React.FC = () => {
  const navigate = useNavigate();

  // Verify data count on mount
  useEffect(() => {
    if (employeeProfiles.length !== EMPLOYEE_COUNT) {
      console.warn(`AI Augmentation: Expected ${EMPLOYEE_COUNT} employees but found ${employeeProfiles.length}`);
    }
  }, []);

  // Scope Selection State - dimensions will be initialized after filterOptions is computed
  const [planningHorizon, setPlanningHorizon] = useState<6 | 12 | 24>(12);
  
  // Tooltip state for calculation explanations
  const [tooltipState, setTooltipState] = useState<{
    visible: boolean;
    position: { top: number; left: number };
    content: React.ReactNode;
  }>({ visible: false, position: { top: 0, left: 0 }, content: null });
  
  const [reductionDetailsModal, setReductionDetailsModal] = useState<{
    isOpen: boolean;
    role: string;
    reductionDetails: {
      retirementEligible: Array<{ name: string; employeeId: string; profile: EmployeeProfile }>;
      voluntaryAttrition: Array<{ name: string; employeeId: string; profile: EmployeeProfile }>;
      redeployment: Array<{ name: string; employeeId: string; profile: EmployeeProfile }>;
      involuntary: Array<{ name: string; employeeId: string; profile: EmployeeProfile }>;
    } | null;
    redeploymentDetails: {
      employees: Array<{ name: string; employeeId: string; profile: EmployeeProfile }>;
    } | null;
  }>({
    isOpen: false,
    role: '',
    reductionDetails: null,
    redeploymentDetails: null,
  });

  // Scenario Modeling State
  const [enabledCapabilities, setEnabledCapabilities] = useState<{
    genAI: boolean;
    rpa: boolean;
    ml: boolean;
  }>({ genAI: true, rpa: true, ml: true });
  const [adoptionRate, setAdoptionRate] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [implementationTimeline, setImplementationTimeline] = useState<'immediate' | 'phased'>('phased');
  const [strategy, setStrategy] = useState<'capacity' | 'cost'>('capacity');
  const [instructionsExpanded, setInstructionsExpanded] = useState(false);

  // Generate task data
  const allTasks = useMemo(() => generateTaskData(employeeProfiles), []);

  // Filter options
  const filterOptions = useMemo(() => {
    const businessUnits = Array.from(new Set(employeeProfiles.map(p => p.employee.businessUnit))).sort();
    const locations = Array.from(new Set(employeeProfiles.map(p => p.employee.location))).sort();
    const roles = getAllRoles();
    // Use actual jobFamily field from employee data instead of deriving from role names
    const jobFamilies = Array.from(new Set(employeeProfiles.map(p => p.employee.jobFamily))).sort();
    
    return { businessUnits, locations, roles, jobFamilies };
  }, []);

  // Initialize dimensions with all options selected by default
  const [selectedBusinessUnits, setSelectedBusinessUnits] = useState<string[]>(() => filterOptions.businessUnits);
  const [selectedLocations, setSelectedLocations] = useState<string[]>(() => filterOptions.locations);
  const [selectedJobFamilies, setSelectedJobFamilies] = useState<string[]>(() => filterOptions.jobFamilies);

  // Filtered profiles based on scope
  const filteredProfiles = useMemo(() => {
    return employeeProfiles.filter(profile => {
      if (selectedBusinessUnits.length > 0 && !selectedBusinessUnits.includes(profile.employee.businessUnit)) return false;
      if (selectedLocations.length > 0 && !selectedLocations.includes(profile.employee.location)) return false;
      if (selectedJobFamilies.length > 0 && !selectedJobFamilies.includes(profile.employee.jobFamily)) return false;
      return true;
    });
  }, [selectedBusinessUnits, selectedLocations, selectedJobFamilies]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      const profile = employeeProfiles.find(p => p.employee.currentRoleId === task.roleId);
      if (!profile) return false;
      if (selectedBusinessUnits.length > 0 && !selectedBusinessUnits.includes(profile.employee.businessUnit)) return false;
      if (selectedLocations.length > 0 && !selectedLocations.includes(profile.employee.location)) return false;
      return true;
    });
  }, [allTasks, selectedBusinessUnits, selectedLocations]);

  // Current State Calculations
  const currentState = useMemo(() => {
    const roleMap = new Map<string, { headcount: number; cost: number; tasks: Task[] }>();
    
    filteredProfiles.forEach(profile => {
      const roleId = profile.employee.currentRoleId;
      const existing = roleMap.get(roleId) || { headcount: 0, cost: 0, tasks: [] };
      existing.headcount++;
      // Convert all costs to USD before summing (INR costs are divided by 83)
      const costInUSD = profile.cost.currency === 'INR' 
        ? profile.cost.totalCompensation / 83  // Convert INR to USD (1 USD = 83 INR)
        : profile.cost.totalCompensation;
      existing.cost += costInUSD;
      roleMap.set(roleId, existing);
    });

    filteredTasks.forEach(task => {
      const existing = roleMap.get(task.roleId);
      if (existing) {
        existing.tasks.push(task);
      }
    });

    const roles = Array.from(roleMap.entries()).map(([roleId, data]) => {
      const roleName = filteredProfiles.find(p => p.employee.currentRoleId === roleId)?.employee.currentRoleName || roleId;
      
      // Group tasks by task name to avoid duplicates, sum hours and average scores
      const taskMap = new Map<string, { hours: number; scores: number[]; capability: 'GenAI' | 'RPA' | 'ML' | 'None'; count: number }>();
      
      data.tasks.forEach(task => {
        const existing = taskMap.get(task.taskName) || { hours: 0, scores: [], capability: task.aiCapabilityMatch, count: 0 };
        existing.hours += task.hoursPerWeek;
        existing.scores.push(task.automationScore);
        existing.count++;
        taskMap.set(task.taskName, existing);
      });
      
      // Convert to array, calculate averages, and get top 5 by total hours (for display)
      const allTasks = Array.from(taskMap.entries())
        .map(([taskName, data]) => ({
          name: taskName,
          hours: data.hours,
          percentage: (data.hours / (data.count * 40)) * 100, // Average % of time per employee spent on this task (out of 40 hours/week)
          automationScore: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
          aiCapability: data.capability,
        }))
        .sort((a, b) => b.hours - a.hours);
      
      const topTasks = allTasks.slice(0, 5); // Top 5 for display in Current State Dashboard

      const totalHours = data.tasks.reduce((sum, t) => sum + t.hoursPerWeek, 0);
      const automatableHours = data.tasks
        .filter(t => t.automationScore > 60)
        .reduce((sum, t) => sum + t.hoursPerWeek, 0);

      return {
        roleId,
        roleName,
        headcount: data.headcount,
        annualCost: data.cost,
        topTasks,
        allTasks, // Include all tasks (aggregated) for impact calculations
        totalHours,
        automatableHours,
      };
    });

    return roles;
  }, [filteredProfiles, filteredTasks]);

  // Impact Calculations
  const impactResults = useMemo(() => {
    const adoptionRates = {
      conservative: 0.2,
      moderate: 0.5,
      aggressive: 0.8,
    };

    const rate = adoptionRates[adoptionRate];
    // Scale calculations based on planning horizon (convert to years for annual calculations)
    const horizonMultiplier = planningHorizon / 12;
    
    let totalCostSavings = 0;
    let totalCapacityGained = 0;
    const taskPriorities: Array<{
      task: string;
      role: string;
      hoursFreed: number;
      hoursPerWeek: number; // Add hours per week for Quick Win explainability
      aiTool: string;
      phase: string;
      quickWin: boolean;
    }> = [];
    const transitionPlan: Array<{
      role: string;
      affectedHeadcount: number;
      hoursFreed: number;
      reskillRecommendation: string;
      redeploymentOption: string;
      reductionTarget?: number;
      reductionDetails?: {
        retirementEligible: Array<{ name: string; employeeId: string; profile: EmployeeProfile }>;
        voluntaryAttrition: Array<{ name: string; employeeId: string; profile: EmployeeProfile }>;
        redeployment: Array<{ name: string; employeeId: string; profile: EmployeeProfile }>;
        involuntary: Array<{ name: string; employeeId: string; profile: EmployeeProfile }>;
      };
      redeploymentDetails?: {
        employees: Array<{ name: string; employeeId: string; profile: EmployeeProfile }>;
      };
    }> = [];

    currentState.forEach(role => {
      // Use ALL automatable tasks (not just top 5) for impact calculations
      // This ensures we capture all hours that can be freed, matching the "Automatable Hours" metric
      const eligibleTasks = role.allTasks.filter(t => 
        t.automationScore > 60 && 
        (enabledCapabilities.genAI && t.aiCapability === 'GenAI' ||
         enabledCapabilities.rpa && t.aiCapability === 'RPA' ||
         enabledCapabilities.ml && t.aiCapability === 'ML')
      );

      if (eligibleTasks.length === 0) return; // Skip roles with no eligible tasks

      // task.hours is already total hours per week for the role (summed across all employees)
      const hoursFreedPerWeek = eligibleTasks.reduce((sum, t) => sum + (t.hours * rate), 0);
      const hoursFreedTotal = hoursFreedPerWeek * 52 * horizonMultiplier; // Total hours over planning horizon
      const totalRoleHoursPerWeek = role.headcount * 40;
      const productivityGain = totalRoleHoursPerWeek > 0 ? hoursFreedPerWeek / totalRoleHoursPerWeek : 0;

      // Always calculate both cost savings and capacity gained
      // Cost savings scaled by planning horizon
      totalCostSavings += (role.annualCost * productivityGain) * horizonMultiplier;
      
      // Capacity gained scaled by planning horizon (FTE equivalent)
      // hoursFreedPerWeek is already total for the role, so divide by 40 hours/week per employee
      totalCapacityGained += (hoursFreedPerWeek * 52 * horizonMultiplier) / (40 * 52);

      eligibleTasks.forEach((task, idx) => {
        const phase = implementationTimeline === 'immediate' ? 'Q1' : 
          idx < 2 ? 'Q1' : idx < 4 ? 'Q2' : 'Q3';
        const quickWin = task.hours > 2.5 && phase === 'Q1';
        // Hours freed scaled by planning horizon
        // task.hours is already total hours per week for the role (summed across all employees)
        const hoursFreedScaled = task.hours * rate * 52 * horizonMultiplier;

        taskPriorities.push({
          task: task.name,
          role: role.roleName,
          hoursFreed: hoursFreedScaled,
          hoursPerWeek: task.hours, // Store hours per week for Quick Win explainability
          aiTool: task.aiCapability,
          phase,
          quickWin,
        });
      });

      if (hoursFreedPerWeek > 0) {
        // Calculate FTE equivalent based on freed capacity
        // FTE = (hours freed per week * 52 weeks * horizon multiplier) / (40 hours/week * 52 weeks)
        // hoursFreedPerWeek is already total for the role, so divide by 40 hours/week per employee
        const fteEquivalent = (hoursFreedPerWeek * 52 * horizonMultiplier) / (40 * 52);
        
        // For Cost Optimization: calculate reduction target (30% of headcount)
        const reductionTarget = strategy === 'cost' ? Math.floor(role.headcount * 0.3) : undefined;
        
        transitionPlan.push({
          role: role.roleName,
          // For Capacity Increase: use FTE equivalent; For Cost Optimization: use reduction target
          affectedHeadcount: strategy === 'capacity' ? fteEquivalent : (reductionTarget || role.headcount),
          hoursFreed: hoursFreedTotal,
          reskillRecommendation: 'AI Tool Training, Process Redesign', // Will be updated after skills gap analysis
          redeploymentOption: 'Cross-functional Projects, Innovation Teams', // Will be updated after skills gap analysis
          reductionTarget: reductionTarget,
        });
      }
    });

    const totalAnnualCost = currentState.reduce((sum, r) => sum + r.annualCost, 0);
    const totalCostOverHorizon = totalAnnualCost * horizonMultiplier;
    const costSavingsPercent = totalCostOverHorizon > 0 ? (totalCostSavings / totalCostOverHorizon) * 100 : 0;
    
    // Calculate total hours for all roles over the planning horizon
    const totalHours = currentState.reduce((sum, r) => sum + (r.headcount * 40 * 52 * horizonMultiplier), 0);
    // Capacity gained percent = (capacity gained in hours / total hours) * 100
    const capacityGainedInHours = totalCapacityGained * 40 * 52; // Convert FTE back to hours
    const capacityGainedPercent = totalHours > 0 ? (capacityGainedInHours / totalHours) * 100 : 0;

    // Map of role to skills gap data for use in transition plan
    const roleSkillsGapMap = new Map<string, { newSkillNeeded: string; currentSkill: string }>();

    // Skills Gap Analysis - Generate based on roles affected and AI capabilities
    const skillsGapAnalysis: Array<{
      role: string;
      currentSkill: string;
      newSkillNeeded: string;
      employeeCount: number;
      trainingInvestment: number;
    }> = [];

    // Map of role to retained headcount (for cost optimization strategy)
    // Map of role to redeployment eligible count (for capacity increase strategy)
    // Calculate this first so it can be used in skills gap analysis
    const roleRetainedHeadcountMap = new Map<string, number>();
    const roleRedeploymentEligibleMap = new Map<string, number>();
    
    if (strategy === 'cost') {
      transitionPlan.forEach(plan => {
        // plan.affectedHeadcount is the reduction target, not the actual headcount
        // We need to get the actual role headcount from currentState
        const roleFromState = currentState.find(r => r.roleName === plan.role);
        const actualHeadcount = roleFromState?.headcount || 0;
        const reductionTarget = plan.affectedHeadcount; // This is already the reduction target
        const retainedHeadcount = actualHeadcount - reductionTarget;
        roleRetainedHeadcountMap.set(plan.role, retainedHeadcount);
      });
    }

    // Map of role to affected employees and their current skills
    const roleSkillMap = new Map<string, { headcount: number; commonSkills: string[] }>();
    
    transitionPlan.forEach(plan => {
      if (plan.affectedHeadcount > 0) {
        // Get employees in this role
        const roleEmployees = filteredProfiles.filter(
          p => p.employee.currentRoleName === plan.role
        );
        
        // Get common skills for this role
        const skillFrequency = new Map<string, number>();
        roleEmployees.forEach(emp => {
          emp.skills.forEach(skill => {
            skillFrequency.set(skill.skillName, (skillFrequency.get(skill.skillName) || 0) + 1);
          });
        });
        
        // Get top 3 most common skills
        const commonSkills = Array.from(skillFrequency.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([skill]) => skill);
        
        // For skills gap analysis, use actual headcount (not reduction target for cost optimization)
        // Find the actual headcount from currentState
        const roleFromState = currentState.find(r => r.roleName === plan.role);
        const actualHeadcount = roleFromState?.headcount || roleEmployees.length;
        
        roleSkillMap.set(plan.role, {
          headcount: actualHeadcount, // Use actual headcount, not reduction target
          commonSkills: commonSkills.length > 0 ? commonSkills : ['Role-specific Skills'],
        });
      }
    });

    // Generate skills gap mappings based on AI capabilities and role types
    const skillMappings: Array<{
      rolePattern: string;
      currentSkillPattern: string;
      genAISkill: string;
      rpaSkill: string;
      mlSkill: string;
    }> = [
      {
        rolePattern: 'Analyst|Data|Research',
        currentSkillPattern: 'Data Analysis|Excel|Reporting|Research',
        genAISkill: 'AI-Powered Data Analysis',
        rpaSkill: 'Automated Reporting & Data Extraction',
        mlSkill: 'ML Model Interpretation & Validation',
      },
      {
        rolePattern: 'Manager|Lead|Director',
        currentSkillPattern: 'Management|Leadership|Planning',
        genAISkill: 'AI-Enhanced Decision Making',
        rpaSkill: 'Workflow Automation Management',
        mlSkill: 'Predictive Analytics for Leadership',
      },
      {
        rolePattern: 'Engineer|Developer|Technical',
        currentSkillPattern: 'Programming|Development|Technical',
        genAISkill: 'AI-Assisted Development',
        rpaSkill: 'CI/CD Automation',
        mlSkill: 'MLOps & Model Deployment',
      },
      {
        rolePattern: 'Coordinator|Specialist|Administrator',
        currentSkillPattern: 'Administration|Coordination|Process',
        genAISkill: 'AI Workflow Optimization',
        rpaSkill: 'RPA Process Design & Monitoring',
        mlSkill: 'Process Intelligence & Analytics',
      },
      {
        rolePattern: 'Consultant|Advisor|Business',
        currentSkillPattern: 'Consulting|Strategy|Business',
        genAISkill: 'GenAI-Powered Client Solutions',
        rpaSkill: 'Business Process Automation',
        mlSkill: 'Predictive Business Analytics',
      },
    ];

    // Generate skills gap for each role
    roleSkillMap.forEach((roleData, roleName) => {
      // Find matching skill mapping
      const mapping = skillMappings.find(m => 
        new RegExp(m.rolePattern, 'i').test(roleName)
      ) || skillMappings[skillMappings.length - 1]; // Default to last mapping

      // Find current skill that matches pattern
      const currentSkill = roleData.commonSkills.find(skill =>
        new RegExp(mapping.currentSkillPattern, 'i').test(skill)
      ) || roleData.commonSkills[0] || 'Role-specific Skills';

      // Determine new skill based on enabled capabilities
      let newSkill = '';
      if (enabledCapabilities.genAI && enabledCapabilities.rpa && enabledCapabilities.ml) {
        newSkill = `${mapping.genAISkill}, ${mapping.rpaSkill}, ${mapping.mlSkill}`;
      } else if (enabledCapabilities.genAI && enabledCapabilities.rpa) {
        newSkill = `${mapping.genAISkill}, ${mapping.rpaSkill}`;
      } else if (enabledCapabilities.genAI && enabledCapabilities.ml) {
        newSkill = `${mapping.genAISkill}, ${mapping.mlSkill}`;
      } else if (enabledCapabilities.rpa && enabledCapabilities.ml) {
        newSkill = `${mapping.rpaSkill}, ${mapping.mlSkill}`;
      } else if (enabledCapabilities.genAI) {
        newSkill = mapping.genAISkill;
      } else if (enabledCapabilities.rpa) {
        newSkill = mapping.rpaSkill;
      } else if (enabledCapabilities.ml) {
        newSkill = mapping.mlSkill;
      } else {
        newSkill = 'AI Tool Proficiency';
      }

      // For cost optimization, only consider retained employees
      // For capacity increase, consider employees remaining in role (actual headcount - redeployment eligible)
      const employeeCount = strategy === 'cost' 
        ? (roleRetainedHeadcountMap.get(roleName) || Math.floor(roleData.headcount * 0.7)) // 70% retained if not in map
        : Math.max(0, roleData.headcount - (roleRedeploymentEligibleMap.get(roleName) || 0)); // Actual headcount minus redeployment eligible
      
      if (employeeCount > 0) {
        skillsGapAnalysis.push({
          role: roleName,
          currentSkill,
          newSkillNeeded: newSkill,
          employeeCount,
          trainingInvestment: employeeCount * 2500,
        });
      }

      // Store skills gap data for transition plan
      roleSkillsGapMap.set(roleName, {
        newSkillNeeded: newSkill,
        currentSkill,
      });
    });

    // Also add role-specific skills gaps based on task automation priorities
    const taskBasedSkills = new Map<string, Set<string>>();
    taskPriorities.forEach(task => {
      if (!taskBasedSkills.has(task.role)) {
        taskBasedSkills.set(task.role, new Set());
      }
      
      // Map AI tool to specific skill
      if (task.aiTool === 'GenAI') {
        taskBasedSkills.get(task.role)!.add('GenAI Prompt Engineering');
      } else if (task.aiTool === 'RPA') {
        taskBasedSkills.get(task.role)!.add('RPA Process Design');
      } else if (task.aiTool === 'ML') {
        taskBasedSkills.get(task.role)!.add('ML Model Collaboration');
      }
    });

    // Add task-based skills for roles not already covered in transition plan
    taskBasedSkills.forEach((skills, roleName) => {
      const roleInTransition = roleSkillMap.has(roleName);
      
      if (!roleInTransition) {
        const roleEmployees = filteredProfiles.filter(
          p => p.employee.currentRoleName === roleName
        );
        
        if (roleEmployees.length > 0) {
          // Get common skill for this role
          const skillFrequency = new Map<string, number>();
          roleEmployees.forEach(emp => {
            emp.skills.forEach(skill => {
              skillFrequency.set(skill.skillName, (skillFrequency.get(skill.skillName) || 0) + 1);
            });
          });
          
          const commonSkill = Array.from(skillFrequency.entries())
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Task-specific Skills';
          
          const newSkillNeeded = Array.from(skills).join(', ');
          // For cost optimization, only consider retained employees
          const employeeCount = strategy === 'cost'
            ? (roleRetainedHeadcountMap.get(roleName) || Math.floor(roleEmployees.length * 0.7))
            : Math.max(0, roleEmployees.length - (roleRedeploymentEligibleMap.get(roleName) || 0)); // Actual headcount minus redeployment eligible
          
          if (employeeCount > 0) {
            skillsGapAnalysis.push({
              role: roleName,
              currentSkill: commonSkill,
              newSkillNeeded,
              employeeCount,
              trainingInvestment: employeeCount * 2500,
            });
          }

          // Also store for transition plan if role is in transition plan
          if (!roleSkillsGapMap.has(roleName)) {
            roleSkillsGapMap.set(roleName, {
              newSkillNeeded,
              currentSkill: commonSkill,
            });
          }
        }
      }
    });

    // Calculate total training investment
    const totalTrainingInvestment = skillsGapAnalysis.reduce((sum, gap) => sum + gap.trainingInvestment, 0);
    
    // Estimate AI tool costs (rough estimate: $500 per employee per year for AI tools)
    const totalAIToolCost = filteredProfiles.length * 500 * horizonMultiplier;
    const totalInvestment = totalTrainingInvestment + totalAIToolCost;
    
    // Calculate net savings (cost savings minus investment) for cost optimization
    const netSavings = totalCostSavings - totalInvestment;
    const paybackPeriodMonths = totalInvestment > 0 ? (totalInvestment / (totalCostSavings / horizonMultiplier)) * 12 : 0;
    
    // Calculate headcount reduction potential (for cost optimization)
    // Assume 30% of freed capacity can be converted to headcount reduction
    const headcountReductionPotential = Math.floor(totalCapacityGained * 0.3);
    const headcountReductionSavings = headcountReductionPotential * (totalAnnualCost / filteredProfiles.length) * horizonMultiplier;

    // Update transition plan with strategy-specific recommendations
    // Use skillsGapAnalysis as the source of truth to ensure consistency
    transitionPlan.forEach(plan => {
      // Find the matching entry in skillsGapAnalysis for this role
      const gapFromAnalysis = skillsGapAnalysis.find(gap => gap.role === plan.role);
      
      if (gapFromAnalysis) {
        // Use the exact same newSkillNeeded from skillsGapAnalysis
        plan.reskillRecommendation = gapFromAnalysis.newSkillNeeded;
        // Also update roleSkillsGapMap to keep it in sync
        roleSkillsGapMap.set(plan.role, {
          newSkillNeeded: gapFromAnalysis.newSkillNeeded,
          currentSkill: gapFromAnalysis.currentSkill,
        });
      } else {
        // Fallback: try to get from roleSkillsGapMap if available
        const skillsGap = roleSkillsGapMap.get(plan.role);
        if (skillsGap) {
          plan.reskillRecommendation = skillsGap.newSkillNeeded;
        } else {
          // Final fallback
          plan.reskillRecommendation = 'AI Tool Training, Process Redesign';
        }
      }

      // Generate strategy-specific recommendations
      const roleNameLower = plan.role.toLowerCase();
      
      if (strategy === 'capacity') {
        // Capacity Increase: Focus on redeployment to higher-value work
        if (roleNameLower.includes('analyst') || roleNameLower.includes('data') || roleNameLower.includes('research')) {
          plan.redeploymentOption = 'Data Strategy Initiatives, Advanced Analytics Projects, Research & Development';
        } else if (roleNameLower.includes('manager') || roleNameLower.includes('lead') || roleNameLower.includes('director')) {
          plan.redeploymentOption = 'Strategic Initiatives, Digital Transformation Projects, Innovation Labs';
        } else if (roleNameLower.includes('engineer') || roleNameLower.includes('developer') || roleNameLower.includes('technical')) {
          plan.redeploymentOption = 'AI/ML Development Projects, Automation Engineering, Technical Innovation Teams';
        } else if (roleNameLower.includes('coordinator') || roleNameLower.includes('specialist') || roleNameLower.includes('administrator')) {
          plan.redeploymentOption = 'Process Optimization Projects, Digital Operations, Change Management Initiatives';
        } else if (roleNameLower.includes('consultant') || roleNameLower.includes('advisor') || roleNameLower.includes('business')) {
          plan.redeploymentOption = 'Client Solutions Innovation, Business Strategy Projects, Digital Consulting';
        } else {
          plan.redeploymentOption = 'Strategic Projects, Innovation Initiatives, Growth Opportunities';
        }
        
        // Generate employee-level redeployment details for capacity increase
        const roleEmployees = filteredProfiles.filter(
          p => p.employee.currentRoleName === plan.role
        );
        
        // Sort employees by redeployment readiness (highest first) and performance (highest first)
        // Prioritize employees with high redeployment scores, transferable skills, and good performance
        const sortedByRedeployment = [...roleEmployees].sort((a, b) => {
          const scoreA = (a.redeployment?.redeploymentScore || 0) + (a.performance?.engagementScore || 0) / 2;
          const scoreB = (b.redeployment?.redeploymentScore || 0) + (b.performance?.engagementScore || 0) / 2;
          return scoreB - scoreA;
        });
        
        // Select top employees based on FTE equivalent (round up to ensure we have enough capacity)
        const fteCount = Math.ceil(plan.affectedHeadcount);
        const redeploymentEligibleCount = Math.min(fteCount, roleEmployees.length);
        const selectedEmployees = sortedByRedeployment.slice(0, redeploymentEligibleCount).map(emp => ({
          name: emp.employee.employeeName,
          employeeId: emp.employee.employeeId,
          profile: emp,
        }));
        
        // Store redeployment eligible count for skills gap analysis
        roleRedeploymentEligibleMap.set(plan.role, redeploymentEligibleCount);
        
        plan.redeploymentDetails = {
          employees: selectedEmployees,
        };
      } else {
        // Cost Optimization: Focus on workforce reduction scenarios
        // plan.affectedHeadcount is now the reduction target (30% of role headcount)
        const reductionTarget = plan.affectedHeadcount; // This is already the reduction target
        
        // Generate employee-level reduction details
        const roleEmployees = filteredProfiles.filter(
          p => p.employee.currentRoleName === plan.role
        );
        
        // Ensure we have enough employees for the reduction target
        const actualReductionTarget = Math.min(reductionTarget, roleEmployees.length);
        
        // Distribute employees across categories with better logic
        // Use a deterministic but varied approach based on role name hash to ensure different distribution per role
        const roleHash = plan.role.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const distributionSeed = roleHash % 4; // 0-3 for different distribution patterns
        
        let retirementEligible: number;
        let voluntaryAttritionTarget: number;
        let redeploymentCount: number;
        let involuntaryCount: number;
        
        // Distribute based on reduction target size and role-specific seed
        if (actualReductionTarget === 1) {
          // Single employee: assign based on seed
          const categories = ['retirement', 'voluntary', 'redeployment', 'involuntary'];
          const category = categories[distributionSeed % 4];
          retirementEligible = category === 'retirement' ? 1 : 0;
          voluntaryAttritionTarget = category === 'voluntary' ? 1 : 0;
          redeploymentCount = category === 'redeployment' ? 1 : 0;
          involuntaryCount = category === 'involuntary' ? 1 : 0;
        } else if (actualReductionTarget === 2) {
          // Two employees: distribute across two categories
          const patterns = [
            [1, 1, 0, 0], // retirement + voluntary
            [0, 1, 1, 0], // voluntary + redeployment
            [0, 0, 1, 1], // redeployment + involuntary
            [1, 0, 0, 1], // retirement + involuntary
          ];
          const pattern = patterns[distributionSeed % 4];
          retirementEligible = pattern[0];
          voluntaryAttritionTarget = pattern[1];
          redeploymentCount = pattern[2];
          involuntaryCount = pattern[3];
        } else if (actualReductionTarget === 3) {
          // Three employees: try to cover 3 categories
          const patterns = [
            [1, 1, 1, 0], // retirement + voluntary + redeployment
            [0, 1, 1, 1], // voluntary + redeployment + involuntary
            [1, 0, 1, 1], // retirement + redeployment + involuntary
            [1, 1, 0, 1], // retirement + voluntary + involuntary
          ];
          const pattern = patterns[distributionSeed % 4];
          retirementEligible = pattern[0];
          voluntaryAttritionTarget = pattern[1];
          redeploymentCount = pattern[2];
          involuntaryCount = pattern[3];
        } else {
          // Four or more: use percentage-based distribution with minimum 1 per category when possible
          retirementEligible = Math.max(1, Math.floor(actualReductionTarget * 0.15));
          voluntaryAttritionTarget = Math.max(1, Math.floor(actualReductionTarget * 0.20));
          redeploymentCount = Math.max(1, Math.floor(actualReductionTarget * 0.25));
          involuntaryCount = Math.max(0, actualReductionTarget - retirementEligible - voluntaryAttritionTarget - redeploymentCount);
          
          // Adjust if we exceeded the target
          const total = retirementEligible + voluntaryAttritionTarget + redeploymentCount + involuntaryCount;
          if (total > actualReductionTarget) {
            const excess = total - actualReductionTarget;
            // Reduce from involuntary first, then redeployment, then voluntary, then retirement
            if (involuntaryCount >= excess) {
              involuntaryCount -= excess;
            } else {
              const remaining = excess - involuntaryCount;
              involuntaryCount = 0;
              if (redeploymentCount >= remaining) {
                redeploymentCount -= remaining;
              } else {
                const remaining2 = remaining - redeploymentCount;
                redeploymentCount = 0;
                if (voluntaryAttritionTarget >= remaining2) {
                  voluntaryAttritionTarget -= remaining2;
                } else {
                  const remaining3 = remaining2 - voluntaryAttritionTarget;
                  voluntaryAttritionTarget = 0;
                  retirementEligible -= remaining3;
                }
              }
            }
          }
        }
        
        plan.reductionTarget = actualReductionTarget;
        plan.redeploymentOption = `Target: ${actualReductionTarget} roles. Breakdown: ${retirementEligible} retirement, ${voluntaryAttritionTarget} voluntary, ${redeploymentCount} redeployment, ${involuntaryCount} involuntary`;
        
        // Sort employees by different criteria for each category
        const sortedByTenure = [...roleEmployees].sort((a, b) => (b.employee.tenureMonths || 0) - (a.employee.tenureMonths || 0));
        const sortedByEngagement = [...roleEmployees].sort((a, b) => (a.readiness?.readinessScore || 0) - (b.readiness?.readinessScore || 0));
        const sortedByRedeployment = [...roleEmployees].sort((a, b) => (b.redeployment?.redeploymentScore || 0) - (a.redeployment?.redeploymentScore || 0));
        const sortedByPerformance = [...roleEmployees].sort((a, b) => {
          const scoreA = (a.performance?.engagementScore || 0) + (a.readiness?.readinessScore || 0);
          const scoreB = (b.performance?.engagementScore || 0) + (b.readiness?.readinessScore || 0);
          return scoreA - scoreB;
        });
        
        // Select employees for each category, ensuring no duplicates
        const selectedEmployeeIds = new Set<string>();
        const retirementEligibleEmployees: Array<{ name: string; employeeId: string; profile: EmployeeProfile }> = [];
        const voluntaryAttritionEmployees: Array<{ name: string; employeeId: string; profile: EmployeeProfile }> = [];
        const redeploymentEmployees: Array<{ name: string; employeeId: string; profile: EmployeeProfile }> = [];
        const involuntaryEmployees: Array<{ name: string; employeeId: string; profile: EmployeeProfile }> = [];
        
        // Select retirement eligible
        for (const emp of sortedByTenure) {
          if (retirementEligibleEmployees.length >= retirementEligible) break;
          if (!selectedEmployeeIds.has(emp.employee.employeeId)) {
            retirementEligibleEmployees.push({
              name: emp.employee.employeeName,
              employeeId: emp.employee.employeeId,
              profile: emp,
            });
            selectedEmployeeIds.add(emp.employee.employeeId);
          }
        }
        
        // Select voluntary attrition
        for (const emp of sortedByEngagement) {
          if (voluntaryAttritionEmployees.length >= voluntaryAttritionTarget) break;
          if (!selectedEmployeeIds.has(emp.employee.employeeId)) {
            voluntaryAttritionEmployees.push({
              name: emp.employee.employeeName,
              employeeId: emp.employee.employeeId,
              profile: emp,
            });
            selectedEmployeeIds.add(emp.employee.employeeId);
          }
        }
        
        // Select redeployment
        for (const emp of sortedByRedeployment) {
          if (redeploymentEmployees.length >= redeploymentCount) break;
          if (!selectedEmployeeIds.has(emp.employee.employeeId)) {
            redeploymentEmployees.push({
              name: emp.employee.employeeName,
              employeeId: emp.employee.employeeId,
              profile: emp,
            });
            selectedEmployeeIds.add(emp.employee.employeeId);
          }
        }
        
        // Select involuntary (remaining)
        for (const emp of sortedByPerformance) {
          if (involuntaryEmployees.length >= involuntaryCount) break;
          if (!selectedEmployeeIds.has(emp.employee.employeeId)) {
            involuntaryEmployees.push({
              name: emp.employee.employeeName,
              employeeId: emp.employee.employeeId,
              profile: emp,
            });
            selectedEmployeeIds.add(emp.employee.employeeId);
          }
        }
        
        plan.reductionDetails = {
          retirementEligible: retirementEligibleEmployees,
          voluntaryAttrition: voluntaryAttritionEmployees,
          redeployment: redeploymentEmployees,
          involuntary: involuntaryEmployees,
        };
      }
    });

    return {
      totalCostSavings,
      costSavingsPercent,
      totalCapacityGained,
      capacityGainedPercent,
      totalInvestment,
      totalTrainingInvestment,
      totalAIToolCost,
      netSavings,
      paybackPeriodMonths,
      headcountReductionPotential,
      headcountReductionSavings,
      taskPriorities: taskPriorities.sort((a, b) => b.hoursFreed - a.hoursFreed),
      transitionPlan,
      skillsGapAnalysis: skillsGapAnalysis.sort((a, b) => b.employeeCount - a.employeeCount),
      horizonMultiplier,
    };
  }, [currentState, enabledCapabilities, adoptionRate, implementationTimeline, strategy, planningHorizon, filteredProfiles]);

  // Workforce Summary
  const workforceSummary = useMemo(() => {
    const totalHeadcount = filteredProfiles.length;
    // Convert all costs to USD before summing (INR costs are divided by 83)
    const totalCost = filteredProfiles.reduce((sum, p) => {
      const costInUSD = p.cost.currency === 'INR' 
        ? p.cost.totalCompensation / 83  // Convert INR to USD (1 USD = 83 INR)
        : p.cost.totalCompensation;
      return sum + costInUSD;
    }, 0);
    const roleDistribution = currentState.map(r => ({
      role: r.roleName,
      headcount: r.headcount,
      percentage: (r.headcount / totalHeadcount) * 100,
    }));

    return { totalHeadcount, totalCost, roleDistribution };
  }, [filteredProfiles, currentState]);

  const breadcrumbItems = [
    { label: 'Readiness', onClick: () => navigate('/readiness') },
    { label: 'Future Planning', onClick: () => navigate('/readiness/future-planning') },
    { label: 'AI Augmentation' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <CalculationTooltip
        isVisible={tooltipState.visible}
        position={tooltipState.position}
        content={tooltipState.content}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Augmentation Simulation</h1>
        <p className="text-gray-600 mb-8">
          Model the impact of AI and automation on your workforce
        </p>

        {/* Instructions and Overview Section - Collapsible */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg mb-8">
          <button
            onClick={() => setInstructionsExpanded(!instructionsExpanded)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-blue-100 transition-colors rounded-lg"
          >
            <div className="flex items-center">
              <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">How to Use This Simulation</h2>
            </div>
            <svg
              className={`h-5 w-5 text-blue-600 transition-transform ${instructionsExpanded ? 'transform rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {instructionsExpanded && (
            <div className="px-6 pb-6">
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="font-medium mb-1">1. <strong>Select Dimensions</strong> (Left Panel)</p>
                  <p className="text-gray-600 ml-6">Choose the business units, locations, and job families you want to analyze. All dimensions are selected by default.</p>
                </div>
                <div>
                  <p className="font-medium mb-1">2. <strong>Configure Scenario Parameters</strong> (Scenario Modeling Controls)</p>
                  <p className="text-gray-600 ml-6">
                    • <strong>AI Capabilities</strong>: Enable GenAI, RPA, and/or ML based on your automation strategy<br/>
                    • <strong>Adoption Rate</strong>: Choose conservative (20%), moderate (50%), or aggressive (80%) adoption<br/>
                    • <strong>Planning Horizon</strong>: Select 6, 12, or 24 months for your planning window<br/>
                    • <strong>Implementation Timeline</strong>: Choose immediate or phased rollout<br/>
                    • <strong>Strategy</strong>: Select "Capacity Increase" to maximize output or "Cost Optimization" to reduce costs
                  </p>
                </div>
                <div>
                  <p className="font-medium mb-1">3. <strong>Review Results</strong></p>
                  <p className="text-gray-600 ml-6">
                    The simulation calculates and displays:
                  </p>
                  <ul className="list-disc list-inside text-gray-600 ml-6 mt-1 space-y-1">
                    <li><strong>Current State Dashboard</strong>: Current workforce by role, costs, and top tasks with automation potential</li>
                    <li><strong>Impact Results</strong>: Cost savings, capacity gained, productivity improvements, and investment requirements</li>
                    <li><strong>Task Automation Priorities</strong>: Tasks ranked by automation potential and hours freed</li>
                    <li><strong>Workforce Transition Plan</strong>: Employee-level recommendations for redeployment or reduction</li>
                    <li><strong>Skills Gap Analysis</strong>: Current skills vs. new skills needed for retained/redeployed employees</li>
                    <li><strong>Action Roadmap</strong>: Quarterly timeline with prioritized initiatives and investment summary</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <p className="text-sm font-medium text-gray-900 mb-2">What to Expect:</p>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  <li>Real-time calculations that update as you adjust parameters</li>
                  <li>Employee-level details with explainability for each recommendation</li>
                  <li>Strategy-specific outputs tailored to your selected approach (Capacity Increase vs. Cost Optimization)</li>
                  <li>Actionable insights with specific task priorities, workforce transitions, and skills requirements</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* 1. Scope Selection Interface */}
        <div className="mb-6">
          {/* Dimensions - Checkbox Based, Horizontal Layout */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dimensions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Business Units */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Business Units
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {filterOptions.businessUnits.map(bu => (
                    <label key={bu} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedBusinessUnits.includes(bu)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBusinessUnits([...selectedBusinessUnits, bu]);
                          } else {
                            setSelectedBusinessUnits(selectedBusinessUnits.filter(b => b !== bu));
                          }
                        }}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{bu}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Locations
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {filterOptions.locations.map(loc => (
                    <label key={loc} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedLocations.includes(loc)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLocations([...selectedLocations, loc]);
                          } else {
                            setSelectedLocations(selectedLocations.filter(l => l !== loc));
                          }
                        }}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{loc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Job Families */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Job Families
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {filterOptions.jobFamilies.map(jf => (
                    <label key={jf} className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedJobFamilies.includes(jf)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedJobFamilies([...selectedJobFamilies, jf]);
                          } else {
                            setSelectedJobFamilies(selectedJobFamilies.filter(j => j !== jf));
                          }
                        }}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">{jf}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="mt-4">
              <button
                onClick={() => {
                  setSelectedBusinessUnits([]);
                  setSelectedLocations([]);
                  setSelectedJobFamilies([]);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Workforce Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Selected Workforce Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Headcount</div>
                <div className="text-2xl font-bold text-gray-900">{workforceSummary.totalHeadcount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Annual Cost</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${(workforceSummary.totalCost / 1000000).toFixed(2)}M
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Unique Roles</div>
                <div className="text-2xl font-bold text-gray-900">{workforceSummary.roleDistribution.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Current State Dashboard */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Current State Dashboard</h2>
          
          <div className="overflow-x-auto overflow-y-visible">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 relative">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span className="relative group cursor-help" title="Job role or position title">
                      Role
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span className="relative group cursor-help" title="Number of employees in this role">
                      Headcount
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase relative">
                    <span 
                      className="relative group cursor-help inline-block" 
                      title="Total annual compensation (salary + benefits) for all employees in this role"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipState({
                          visible: true,
                          position: { top: rect.top - 10, left: rect.left },
                          content: (
                            <>
                              <div className="font-semibold mb-1">Calculation:</div>
                              <div>Sum of (Base Salary × Location Multiplier × Performance Multiplier × (1 + Tenure Bonus + Engagement Bonus) + Benefits) for all employees in this role</div>
                            </>
                          ),
                        });
                      }}
                      onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                    >
                      Annual Cost
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <span className="relative group cursor-help" title="Top 5 tasks by time allocation, showing automation score and recommended AI capability">
                      Top 5 Tasks
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase relative">
                    <span 
                      className="relative group cursor-help inline-block" 
                      title="Total weekly hours across all tasks for this role"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipState({
                          visible: true,
                          position: { top: rect.top - 10, left: rect.left },
                          content: (
                            <>
                              <div className="font-semibold mb-1">Calculation:</div>
                              <div>Sum of hours per week for all tasks assigned to employees in this role, aggregated across all employees</div>
                            </>
                          ),
                        });
                      }}
                      onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                    >
                      Total Hours
                    </span>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase relative">
                    <span 
                      className="relative group cursor-help inline-block" 
                      title="Weekly hours from tasks with automation score >60 (automatable tasks)"
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipState({
                          visible: true,
                          position: { top: rect.top - 10, left: rect.left },
                          content: (
                            <>
                              <div className="font-semibold mb-1">Calculation:</div>
                              <div>Sum of hours per week for tasks where automation score &gt;60, aggregated across all employees in this role. These are tasks eligible for AI automation</div>
                            </>
                          ),
                        });
                      }}
                      onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                    >
                      Automatable Hours
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentState.map((role, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{role.roleName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="relative group cursor-help" title={`${role.headcount} employees in this role`}>
                        {role.headcount}
                        <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                            {role.headcount} employees
                          </div>
                          <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="relative group cursor-help" title={`Total annual compensation: $${(role.annualCost / 1000000).toFixed(2)}M`}>
                        ${(role.annualCost / 1000000).toFixed(2)}M
                        <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                            ${(role.annualCost / 1000000).toFixed(2)}M total annual cost
                          </div>
                          <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="space-y-1">
                        {role.topTasks.map((task, tIdx) => (
                          <div key={tIdx} className="flex items-center gap-2">
                            <span className="relative group cursor-help" title={`${task.name} - ${task.hours} hours/week (${task.percentage.toFixed(0)}% of role time)`}>
                              {task.name}
                              <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                  {task.hours} hrs/week ({task.percentage.toFixed(0)}% of role)
                                </div>
                                <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </span>
                            <span className="text-xs text-gray-500">({task.percentage.toFixed(0)}%)</span>
                            <span 
                              className={`text-xs px-1.5 py-0.5 rounded relative group cursor-help ${
                                task.automationScore > 60 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}
                              title={`Automation Score: ${task.automationScore}/100`}
                            >
                              {task.automationScore}
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                  Automation: {task.automationScore}/100 {task.automationScore > 60 ? '(Automatable)' : '(Low potential)'}
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </span>
                            <span 
                              className="text-xs text-blue-600 relative group cursor-help" 
                              title={`AI Capability: ${task.aiCapability}`}
                            >
                              {task.aiCapability}
                              <div className="absolute bottom-full left-0 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                  {task.aiCapability === 'GenAI' ? 'Generative AI' :
                                   task.aiCapability === 'RPA' ? 'Robotic Process Automation' :
                                   task.aiCapability === 'ML' ? 'Machine Learning' : 'None'}
                                </div>
                                <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="relative group cursor-help" title={`Total Hours: ${role.totalHours.toFixed(0)} hours/week - Sum of all task hours for this role`}>
                        {role.totalHours.toFixed(0)} hrs/wk
                        <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                            Total weekly hours across all tasks
                          </div>
                          <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span 
                        className={`relative group cursor-help ${role.automatableHours > 0 ? 'text-green-600 font-medium' : ''}`}
                        title={`Automatable Hours: ${role.automatableHours.toFixed(0)} hours/week - Tasks with automation score >60`}
                      >
                        {role.automatableHours.toFixed(0)} hrs/wk
                        <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                            Hours from tasks with automation score &gt;60
                          </div>
                          <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Scenario Modeling Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Scenario Modeling Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                AI Capabilities
                <span className="ml-2 text-blue-600 cursor-help relative inline-block">
                  ℹ️
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-64">
                    <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                      Select which AI technologies to include in the simulation. Only tasks matching selected capabilities will be considered for automation.
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center relative group/item">
                  <input
                    type="checkbox"
                    checked={enabledCapabilities.genAI}
                    onChange={(e) => setEnabledCapabilities(prev => ({ ...prev, genAI: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 relative">
                    GenAI (Generative AI)
                    <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-50">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                        Natural language processing, content generation, chatbots
                      </div>
                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </span>
                </label>
                <label className="flex items-center relative group/item">
                  <input
                    type="checkbox"
                    checked={enabledCapabilities.rpa}
                    onChange={(e) => setEnabledCapabilities(prev => ({ ...prev, rpa: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 relative">
                    RPA (Robotic Process Automation)
                    <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-50">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                        Rule-based automation for repetitive tasks
                      </div>
                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </span>
                </label>
                <label className="flex items-center relative group/item">
                  <input
                    type="checkbox"
                    checked={enabledCapabilities.ml}
                    onChange={(e) => setEnabledCapabilities(prev => ({ ...prev, ml: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 relative">
                    ML (Machine Learning)
                    <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none z-50">
                      <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                        Predictive analytics, pattern recognition, data modeling
                      </div>
                      <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </span>
                </label>
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Adoption Rate
                <span className="ml-2 text-blue-600 cursor-help relative inline-block">
                  ℹ️
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-64">
                    <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                      Percentage of automatable task hours that will actually be automated. Conservative assumes slower adoption, Aggressive assumes rapid deployment.
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="adoptionRate"
                    value="conservative"
                    checked={adoptionRate === 'conservative'}
                    onChange={(e) => setAdoptionRate(e.target.value as 'conservative')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Conservative (20% of automatable)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="adoptionRate"
                    value="moderate"
                    checked={adoptionRate === 'moderate'}
                    onChange={(e) => setAdoptionRate(e.target.value as 'moderate')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Moderate (50% of automatable)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="adoptionRate"
                    value="aggressive"
                    checked={adoptionRate === 'aggressive'}
                    onChange={(e) => setAdoptionRate(e.target.value as 'aggressive')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Aggressive (80% of automatable)</span>
                </label>
              </div>
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Planning Horizon
                <span className="ml-2 text-blue-600 cursor-help relative inline-block">
                  ℹ️
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-64">
                    <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                      Time period over which cost savings and capacity gains are calculated. All metrics scale proportionally with this horizon.
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={planningHorizon}
                onChange={(e) => setPlanningHorizon(Number(e.target.value) as 6 | 12 | 24)}
              >
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
              </select>
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Implementation Timeline
                <span className="ml-2 text-blue-600 cursor-help relative inline-block">
                  ℹ️
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-64">
                    <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                      Immediate: All automations start in Q1. Phased: Automations distributed across Q1-Q3 in 3-month intervals.
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={implementationTimeline}
                onChange={(e) => setImplementationTimeline(e.target.value as 'immediate' | 'phased')}
              >
                <option value="immediate">Immediate</option>
                <option value="phased">Phased (3-month intervals)</option>
              </select>
            </div>

            <div className="relative group">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Strategy
                <span className="ml-2 text-blue-600 cursor-help relative inline-block">
                  ℹ️
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-64">
                    <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                      Capacity Increase: Focus on maximizing workforce capacity. Cost Optimization: Focus on reducing labor costs through automation.
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="strategy"
                    value="capacity"
                    checked={strategy === 'capacity'}
                    onChange={(e) => setStrategy(e.target.value as 'capacity')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Capacity Increase</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="strategy"
                    value="cost"
                    checked={strategy === 'cost'}
                    onChange={(e) => setStrategy(e.target.value as 'cost')}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Cost Optimization</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* 4 & 5. Results Dashboard */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Impact Results</h2>
          
          {/* Results Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {strategy === 'cost' ? (
              <>
                {/* Cost Optimization Strategy */}
                <div className="bg-blue-50 rounded-lg p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-gray-600">Net Cost Savings</div>
                    <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] w-80">
                      <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                        <div className="font-semibold mb-1">Calculation:</div>
                        <div>Total Cost Savings from automation minus AI tool costs and training investment. Net savings = (Annual Cost × Productivity Gain × Planning Horizon) - (AI Tools + Training)</div>
                      </div>
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ${(impactResults.netSavings / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    After AI investment
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Over {planningHorizon} months
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-gray-600">Headcount Reduction Potential</div>
                    <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] w-80">
                      <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                        <div className="font-semibold mb-1">Calculation:</div>
                        <div>Estimated roles that can be eliminated through automation. Assumes 30% of freed capacity can be converted to headcount reduction through natural attrition and role elimination.</div>
                      </div>
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {impactResults.headcountReductionPotential} roles
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Potential reduction
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Through automation
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-gray-600">Payback Period</div>
                    <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] w-80">
                      <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                        <div className="font-semibold mb-1">Calculation:</div>
                        <div>Time to recover AI investment. Payback Period = (Total Investment / Monthly Savings) in months. Monthly Savings = Annual Cost Savings / 12</div>
                      </div>
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {impactResults.paybackPeriodMonths.toFixed(1)} months
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    ROI timeline
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    To recover investment
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Capacity Increase Strategy */}
                <div className="bg-green-50 rounded-lg p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-gray-600">FTE Equivalent Gained</div>
                    <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] w-80">
                      <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                        <div className="font-semibold mb-1">Calculation:</div>
                                  <div>Sum of (Hours Freed per Week × 52 weeks × Planning Horizon) / (40 hours/week × 52 weeks) for all roles. Hours freed per week is already total for the role (aggregated across all employees). Hours freed = eligible task hours × adoption rate</div>
                      </div>
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {impactResults.totalCapacityGained.toFixed(1)} FTE
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Additional output capacity
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Over {planningHorizon} months
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-gray-600">Additional Output Capacity</div>
                    <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] w-80">
                      <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                        <div className="font-semibold mb-1">Calculation:</div>
                        <div>Percentage increase in workforce productivity. Represents the additional work capacity available for new initiatives, backlog reduction, or service expansion.</div>
                      </div>
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {impactResults.capacityGainedPercent.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Productivity increase
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Available for new work
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 relative group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm text-gray-600">Total Investment Required</div>
                    <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] w-80">
                      <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                        <div className="font-semibold mb-1">Calculation:</div>
                        <div>AI tool costs + Training investment. AI Tools: $500 per employee per year × Planning Horizon. Training: $2,500 per employee requiring upskilling.</div>
                      </div>
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600">
                    ${(impactResults.totalInvestment / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    AI tools + Training
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Over {planningHorizon} months
                  </div>
                </div>
              </>
            )}
            <div className="bg-purple-50 rounded-lg p-4 relative group">
              <div className="flex items-center justify-between mb-1">
                <div className="text-sm text-gray-600">Productivity Improvement</div>
                <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[9999] w-80">
                  <div className="bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-normal shadow-lg">
                    <div className="font-semibold mb-1">Calculation:</div>
                    <div>(Total Capacity Gained in Hours / Total Role Hours) × 100. Represents the percentage increase in workforce productivity from automation</div>
                  </div>
                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {impactResults.capacityGainedPercent.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 mt-1">
                Average across roles
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Over {planningHorizon} months
              </div>
            </div>
          </div>

          {/* Task Automation Priorities Table */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Task Automation Priorities</h3>
            <p className="text-sm text-gray-600 mb-4">
              {strategy === 'capacity' 
                ? 'Tasks prioritized for automation to free capacity for higher-value strategic work. Focus on maximizing hours freed for redeployment to growth initiatives and new service offerings.'
                : 'Tasks prioritized for automation to reduce labor costs. Focus on high-impact automations that enable workforce reduction and cost savings through headcount optimization.'}
            </p>
            <div className="overflow-x-auto overflow-y-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 relative">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span className="relative group cursor-help" title="Name of the task being automated">
                        Task
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span className="relative group cursor-help" title="Role that performs this task">
                        Role
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase relative">
                      <span 
                        className="relative group cursor-help inline-block" 
                        title={`Total hours that will be freed over ${planningHorizon} months through automation`}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipState({
                            visible: true,
                            position: { top: rect.top - 10, left: rect.left },
                            content: (
                              <>
                                <div className="font-semibold mb-1">Calculation:</div>
                                <div>Total Task Hours per Week (for role) × Adoption Rate × 52 weeks × (Planning Horizon / 12). Task hours are already aggregated across all employees in the role. Represents total hours freed over the planning period</div>
                              </>
                            ),
                          });
                        }}
                        onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                      >
                        Hours Freed
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span className="relative group cursor-help" title="Recommended AI technology for automating this task">
                        AI Tool
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span className="relative group cursor-help" title="Implementation quarter when this automation will be deployed">
                        Phase
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span className="relative group cursor-help" title="Indicates if this is a quick win - high impact task that can be automated in Q1">
                        Quick Win
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {impactResults.taskPriorities.slice(0, 20).map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{item.task}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.role}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="relative group cursor-help" title={`${item.hoursFreed.toFixed(0)} hours freed over ${planningHorizon} months`}>
                          {item.hoursFreed.toFixed(0)} hrs
                          <span className="text-xs text-gray-500 ml-1">({planningHorizon}mo)</span>
                          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                              {item.hoursFreed.toFixed(0)} hours over {planningHorizon} months
                            </div>
                            <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="relative group cursor-help" title={`${item.aiTool === 'GenAI' ? 'Generative AI' : item.aiTool === 'RPA' ? 'Robotic Process Automation' : item.aiTool === 'ML' ? 'Machine Learning' : 'None'}`}>
                          {item.aiTool}
                          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                              {item.aiTool === 'GenAI' ? 'Generative AI' :
                               item.aiTool === 'RPA' ? 'Robotic Process Automation' :
                               item.aiTool === 'ML' ? 'Machine Learning' : 'None'}
                            </div>
                            <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="relative group cursor-help" title={`Implementation phase: ${item.phase}`}>
                          {item.phase}
                          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                              Quarter {item.phase.replace('Q', '')} implementation
                            </div>
                            <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="relative group cursor-help">
                          {item.quickWin ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                              Yes
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                          {item.quickWin && (
                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-64">
                              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                                <div className="font-semibold mb-1 text-white">Quick Win Criteria Met:</div>
                                <div className="space-y-1 text-gray-200">
                                  <div>• Task requires <strong className="text-white">{item.hoursPerWeek.toFixed(1)} hours/week</strong> per employee (threshold: &gt;2.5 hrs/week)</div>
                                  <div>• Scheduled for <strong className="text-white">Q1 implementation</strong> (immediate impact)</div>
                                  <div className="mt-2 pt-2 border-t border-gray-700 text-gray-300">
                                    <strong>Why Quick Win:</strong> High time investment combined with early implementation delivers fast ROI and immediate capacity gains.
                                  </div>
                                </div>
                              </div>
                              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                          {!item.quickWin && (
                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-56">
                              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                                <div className="font-semibold mb-1 text-white">Not a Quick Win:</div>
                                <div className="space-y-1 text-gray-200">
                                  {item.hoursPerWeek <= 2.5 && (
                                    <div>• Task requires {item.hoursPerWeek.toFixed(1)} hrs/week (threshold: &gt;2.5 hrs/week)</div>
                                  )}
                                  {item.phase !== 'Q1' && (
                                    <div>• Scheduled for {item.phase} (not Q1)</div>
                                  )}
                                  <div className="mt-2 pt-2 border-t border-gray-700 text-gray-300">
                                    Quick wins require both high time investment (&gt;2.5 hrs/week) and Q1 implementation.
                                  </div>
                                </div>
                              </div>
                              <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Workforce Transition Plan */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Workforce Transition Plan
              {strategy === 'capacity' && (
                <span className="ml-2 text-sm font-normal text-gray-600">(Redeployment to Higher-Value Work)</span>
              )}
              {strategy === 'cost' && (
                <span className="ml-2 text-sm font-normal text-gray-600">(Workforce Reduction Scenarios)</span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {strategy === 'capacity'
                ? 'Plan for redeploying freed capacity to strategic projects and higher-value work. Shows capacity freed, upskilling requirements, and redeployment opportunities to maximize workforce productivity without reducing headcount.'
                : 'Plan for workforce reduction through automation. Shows affected headcount, reskilling needs for retained employees, and reduction options including retirement eligibility, voluntary attrition targets, and redeployment to critical roles. Focus is on right-sizing the workforce while maintaining essential capabilities.'}
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span className="relative group cursor-help" title="Job role affected by automation">
                        Role
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span 
                        className="relative group cursor-help inline-block" 
                        title={strategy === 'capacity' ? "FTE equivalent capacity available for redeployment based on freed hours" : "Targeted reduction count (30% of role headcount) for workforce reduction"}
                        onMouseEnter={strategy === 'capacity' ? (e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipState({
                            visible: true,
                            position: { top: rect.top, left: rect.left },
                            content: (
                              <>
                                <div className="font-semibold mb-1">FTE Equivalent Calculation:</div>
                                <div>(Hours Freed per Week × 52 weeks × Planning Horizon/12) ÷ (40 hours/week × 52 weeks)</div>
                                <div className="mt-2 text-xs">Hours freed per week is already total for the role (aggregated across all employees). This represents the full-time equivalent capacity freed, calculated from actual hours freed, not the number of employees.</div>
                              </>
                            ),
                          });
                        } : strategy === 'cost' ? (e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipState({
                            visible: true,
                            position: { top: rect.top, left: rect.left },
                            content: (
                              <>
                                <div className="font-semibold mb-1">Reduction Target Calculation:</div>
                                <div>Reduction Target = Floor(Role Headcount × 30%)</div>
                                <div className="mt-2 text-xs">This represents the targeted number of roles to be reduced, not the total headcount in the role.</div>
                              </>
                            ),
                          });
                        } : undefined}
                        onMouseLeave={strategy === 'capacity' || strategy === 'cost' ? () => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null }) : undefined}
                      >
                        {strategy === 'capacity' ? 'FTE Available for Redeployment' : 'Reduction Target'}
                      </span>
                    </th>
                    {strategy === 'capacity' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase relative">
                        <span 
                          className="relative group cursor-help inline-block" 
                          title={`Total hours that will be freed over ${planningHorizon} months for redeployment to higher-value work`}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipState({
                              visible: true,
                              position: { top: rect.top, left: rect.left },
                              content: (
                                <>
                                  <div className="font-semibold mb-1">Calculation:</div>
                                  <div>Sum of (Eligible Task Hours per Week × Adoption Rate × 52 weeks × (Planning Horizon / 12)) for all automatable tasks in this role. Task hours are already aggregated across all employees in the role.</div>
                                </>
                              ),
                            });
                          }}
                          onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                        >
                          Capacity Freed (Hours)
                        </span>
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span className="relative group cursor-help" title={strategy === 'capacity' ? "Strategic projects, initiatives, and higher-value work where freed capacity can be redeployed" : "Workforce reduction options: retirement eligibility, voluntary attrition targets, and redeployment to critical roles"}>
                        {strategy === 'capacity' ? 'Redeployment to Strategic Projects' : 'Workforce Reduction Options'}
                      </span>
                    </th>
                    {(strategy === 'cost' || strategy === 'capacity') && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {strategy === 'capacity' ? 'Redeployment Details' : 'Reduction Details'}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {impactResults.transitionPlan.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.role}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {strategy === 'capacity' ? (
                          <span 
                            className="relative group cursor-help inline-block" 
                            title={`${item.affectedHeadcount > 0 ? Math.ceil(item.affectedHeadcount) : 0} FTE equivalent available for redeployment based on freed capacity`}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltipState({
                                visible: true,
                                position: { top: rect.top, left: rect.left },
                                content: (
                                  <>
                                    <div className="font-semibold mb-1">Calculation:</div>
                                    <div>FTE Equivalent = (Hours Freed per Week × 52 weeks × Planning Horizon/12) ÷ (40 hours/week × 52 weeks)</div>
                                    <div className="mt-2 text-xs">Hours freed per week is already total for the role (aggregated across all employees). This represents the full-time equivalent capacity freed.</div>
                                    <div className="mt-2 text-xs text-gray-300">Display: Rounded up to {item.affectedHeadcount > 0 ? Math.ceil(item.affectedHeadcount) : 0} FTE (minimum 1 employee if capacity &gt; 0) to match redeployment details.</div>
                                  </>
                                ),
                              });
                            }}
                            onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                          >
                            {item.affectedHeadcount > 0 ? Math.ceil(item.affectedHeadcount) : 0} FTE
                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                {item.affectedHeadcount.toFixed(2)} FTE equivalent (rounded up to {item.affectedHeadcount > 0 ? Math.ceil(item.affectedHeadcount) : 0})
                              </div>
                              <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </span>
                        ) : (
                          <span 
                            className="relative group cursor-help inline-block" 
                            title={`${item.affectedHeadcount} roles targeted for reduction (30% of role headcount)`}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              setTooltipState({
                                visible: true,
                                position: { top: rect.top, left: rect.left },
                                content: (
                                  <>
                                    <div className="font-semibold mb-1">Calculation:</div>
                                    <div>Reduction Target = Floor(Role Headcount × 30%)</div>
                                    <div className="mt-2 text-xs">This is the targeted number of roles to be reduced, not the total headcount in the role.</div>
                                  </>
                                ),
                              });
                            }}
                            onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                          >
                            {item.affectedHeadcount}
                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                {item.affectedHeadcount} roles targeted for reduction
                              </div>
                              <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </span>
                        )}
                      </td>
                      {strategy === 'capacity' && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="relative group cursor-help" title={`${item.hoursFreed.toFixed(0)} hours freed over ${planningHorizon} months`}>
                            {item.hoursFreed.toFixed(0)} hrs
                            <span className="text-xs text-gray-500 ml-1">({planningHorizon}mo)</span>
                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                {item.hoursFreed.toFixed(0)} hours over {planningHorizon} months
                              </div>
                              <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="relative group cursor-help" title={`Redeployment options: ${item.redeploymentOption}`}>
                          {item.redeploymentOption}
                          <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-normal max-w-xs shadow-lg">
                              {item.redeploymentOption}
                            </div>
                            <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </span>
                      </td>
                      {strategy === 'capacity' && item.redeploymentDetails && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <button
                            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            onClick={() => {
                              setReductionDetailsModal({
                                isOpen: true,
                                role: item.role,
                                reductionDetails: null,
                                redeploymentDetails: item.redeploymentDetails || null,
                              });
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      )}
                      {strategy === 'cost' && item.reductionDetails && (
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <button
                            className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
                            onClick={() => {
                              setReductionDetailsModal({
                                isOpen: true,
                                role: item.role,
                                reductionDetails: item.reductionDetails || null,
                                redeploymentDetails: null,
                              });
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Skills Gap Analysis */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Skills Gap Analysis
              {strategy === 'capacity' && (
                <span className="ml-2 text-sm font-normal text-gray-600">(Upskilling for Higher-Value Work)</span>
              )}
              {strategy === 'cost' && (
                <span className="ml-2 text-sm font-normal text-gray-600">(Right-Sizing Workforce)</span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {strategy === 'capacity'
                ? 'Identifies current skills and new skills needed to upskill employees remaining in the role (actual headcount minus employees eligible for redeployment). Employees who will be redeployed to strategic projects are excluded from training needs as they will be upskilled for their new roles.'
                : 'Identifies critical skills to retain vs. roles to eliminate. Shows reskilling needs only for employees who will be retained after workforce reduction. Employee counts reflect retained headcount only, not total affected employees.'}
            </p>
            <div className="overflow-x-auto overflow-y-visible">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 relative">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span className="relative group cursor-help" title="Job role affected by automation">
                        Role
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span className="relative group cursor-help" title="Current skills that employees in this role possess">
                        Current Skill
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span className="relative group cursor-help" title="New skills required for employees to work with AI automation tools">
                        New Skill Needed
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      <span 
                        className="relative group cursor-help inline-block" 
                        title={strategy === 'capacity' ? "Number of employees remaining in role who need training (actual headcount minus redeployment eligible)" : "Number of employees who need this skill training"}
                        onMouseEnter={strategy === 'capacity' ? (e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipState({
                            visible: true,
                            position: { top: rect.top, left: rect.left },
                            content: (
                              <>
                                <div className="font-semibold mb-1">Calculation:</div>
                                <div>Employees Needing Training = Actual Role Headcount - Employees Eligible for Redeployment</div>
                                <div className="mt-2 text-xs">This represents employees who will remain in the role and need upskilling, excluding those redeployed to strategic projects.</div>
                              </>
                            ),
                          });
                        } : undefined}
                        onMouseLeave={strategy === 'capacity' ? () => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null }) : undefined}
                      >
                        {strategy === 'capacity' ? '# Employees' : '# Employees'}
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase relative">
                      <span 
                        className="relative group cursor-help inline-block" 
                        title="Estimated cost for training employees in the new skill"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipState({
                            visible: true,
                            position: { top: rect.top, left: rect.left },
                            content: (
                              <>
                                <div className="font-semibold mb-1">Calculation:</div>
                                <div>Number of Employees × $2,500 per employee. Includes training costs for AI tool proficiency, process redesign, and change management</div>
                              </>
                            ),
                          });
                        }}
                        onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                      >
                        Training Investment
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {impactResults.skillsGapAnalysis && impactResults.skillsGapAnalysis.length > 0 ? (
                    impactResults.skillsGapAnalysis.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.role}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <span className="relative group cursor-help" title={`Current skill that employees possess: ${item.currentSkill}`}>
                            {item.currentSkill}
                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-normal max-w-xs shadow-lg">
                                Current skill: {item.currentSkill}
                              </div>
                              <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="relative group cursor-help" title={`New skill required for AI automation: ${item.newSkillNeeded}`}>
                            {item.newSkillNeeded}
                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-normal max-w-xs shadow-lg">
                                New skill needed: {item.newSkillNeeded}
                              </div>
                              <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {strategy === 'capacity' ? (
                            <span 
                              className="relative group cursor-help inline-block" 
                              title={`${item.employeeCount} employees remaining in role need training (actual headcount minus redeployment eligible)`}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTooltipState({
                                  visible: true,
                                  position: { top: rect.top, left: rect.left },
                                  content: (
                                    <>
                                      <div className="font-semibold mb-1">Calculation:</div>
                                      <div>Employees Needing Training = Actual Role Headcount - Employees Eligible for Redeployment</div>
                                      <div className="mt-2 text-xs">This represents employees who will remain in the role and need upskilling for new AI tool requirements, excluding those who will be redeployed to strategic projects.</div>
                                    </>
                                  ),
                                });
                              }}
                              onMouseLeave={() => setTooltipState({ visible: false, position: { top: 0, left: 0 }, content: null })}
                            >
                              {item.employeeCount}
                              <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                  {item.employeeCount} employees remaining in role need training
                                </div>
                                <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </span>
                          ) : (
                            <span className="relative group cursor-help" title={`${item.employeeCount} employees need training for this skill transition`}>
                              {item.employeeCount}
                              <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                  {item.employeeCount} employees need training
                                </div>
                                <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                              </div>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="relative group cursor-help" title={`Training cost: $${item.trainingInvestment.toLocaleString()} ($${2500} per employee × ${item.employeeCount} employees)`}>
                            ${item.trainingInvestment.toLocaleString()}
                            <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap shadow-lg">
                                ${2500} per employee × {item.employeeCount} = ${item.trainingInvestment.toLocaleString()}
                              </div>
                              <div className="absolute top-full left-0 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        No skills gap analysis data available. Adjust scenario settings to generate skills gap information.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 6. Action Roadmap */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            6. Action Roadmap
            {strategy === 'capacity' && (
              <span className="ml-2 text-base font-normal text-gray-600">(What New Work Can We Take On?)</span>
            )}
            {strategy === 'cost' && (
              <span className="ml-2 text-base font-normal text-gray-600">(How to Reduce Spend?)</span>
            )}
          </h2>
          
          {/* Timeline View */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Implementation Timeline</h3>
            <div className="space-y-4">
              {strategy === 'capacity' ? (
                <>
                  {/* Capacity Increase: Focus on expansion initiatives */}
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Q1 - Expansion Initiatives</h4>
                      <span className="text-sm text-gray-600">
                        New service offerings
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Use freed capacity to launch new services or expand existing ones
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-700">• Launch AI-powered analytics services</div>
                      <div className="text-sm text-gray-700">• Expand client consulting capacity by {impactResults.totalCapacityGained.toFixed(1)} FTE</div>
                      <div className="text-sm text-gray-700">• New digital transformation offerings</div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Q2 - Backlog Reduction</h4>
                      <span className="text-sm text-gray-600">
                        Address accumulated work
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Apply freed capacity to reduce project backlogs and improve delivery times
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-700">• Reduce project backlog by {Math.floor(impactResults.totalCapacityGained * 0.4)} projects</div>
                      <div className="text-sm text-gray-700">• Accelerate time-to-market for strategic initiatives</div>
                      <div className="text-sm text-gray-700">• Improve service level agreements</div>
                    </div>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Q3 - Strategic Growth</h4>
                      <span className="text-sm text-gray-600">
                        Long-term expansion
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Invest freed capacity in strategic growth initiatives and innovation
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-700">• Innovation labs and R&D projects</div>
                      <div className="text-sm text-gray-700">• Market expansion initiatives</div>
                      <div className="text-sm text-gray-700">• Strategic partnerships and alliances</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Cost Optimization: Focus on consolidation and ROI */}
                  <div className="border-l-4 border-red-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Q1 - Consolidation Opportunities</h4>
                      <span className="text-sm text-gray-600">
                        Immediate cost reduction
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Identify roles and functions that can be consolidated or eliminated
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-700">• Consolidate {impactResults.headcountReductionPotential} roles through automation</div>
                      <div className="text-sm text-gray-700">• Eliminate redundant processes and functions</div>
                      <div className="text-sm text-gray-700">• Merge overlapping responsibilities</div>
                    </div>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Q2 - Vendor Replacement</h4>
                      <span className="text-sm text-gray-600">
                        Replace external costs
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Use internal automation to replace expensive vendor services
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-700">• Replace vendor services with AI-powered internal solutions</div>
                      <div className="text-sm text-gray-700">• Reduce external consulting spend</div>
                      <div className="text-sm text-gray-700">• In-house automation vs. vendor tools</div>
                    </div>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">Q3 - Automation ROI</h4>
                      <span className="text-sm text-gray-600">
                        Maximize returns
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Focus on high-ROI automations and optimize payback period
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-700">• Achieve payback in {impactResults.paybackPeriodMonths.toFixed(1)} months</div>
                      <div className="text-sm text-gray-700">• Net savings of ${(impactResults.netSavings / 1000000).toFixed(2)}M over {planningHorizon} months</div>
                      <div className="text-sm text-gray-700">• Optimize automation portfolio for maximum ROI</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Investment Summary / Cost Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {strategy === 'capacity' ? 'Investment Summary' : 'Cost Analysis'}
            </h3>
            {strategy === 'capacity' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Q1 Investment</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${(impactResults.taskPriorities.filter(t => t.phase === 'Q1').length * 15000).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">AI Tools + Training</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Q2 Investment</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${(impactResults.taskPriorities.filter(t => t.phase === 'Q2').length * 25000).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">AI Tools + Training</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Q3 Investment</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${(impactResults.taskPriorities.filter(t => t.phase === 'Q3').length * 35000).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">AI Tools + Training</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Gross Cost Savings</div>
                  <div className="text-xl font-bold text-green-600">
                    ${(impactResults.totalCostSavings / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-gray-500 mt-1">From automation</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Total Investment</div>
                  <div className="text-xl font-bold text-red-600">
                    ${(impactResults.totalInvestment / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-gray-500 mt-1">AI tools + Training</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Net Savings</div>
                  <div className="text-xl font-bold text-blue-600">
                    ${(impactResults.netSavings / 1000000).toFixed(2)}M
                  </div>
                  <div className="text-xs text-gray-500 mt-1">After investment</div>
                </div>
              </div>
            )}
            <div className={`mt-4 rounded-lg p-4 ${strategy === 'capacity' ? 'bg-indigo-50' : 'bg-blue-50'}`}>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {strategy === 'capacity' ? 'Total Investment Required' : 'Payback Period'}
              </div>
              <div className={`text-2xl font-bold ${strategy === 'capacity' ? 'text-indigo-600' : 'text-blue-600'}`}>
                {strategy === 'capacity' ? (
                  `$${(impactResults.totalInvestment / 1000000).toFixed(2)}M`
                ) : (
                  `${impactResults.paybackPeriodMonths.toFixed(1)} months`
                )}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {strategy === 'capacity' ? 'AI tools + Training over planning horizon' : `To recover ${(impactResults.totalInvestment / 1000000).toFixed(2)}M investment`}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reduction/Redeployment Details Modal */}
      <Modal
        isOpen={reductionDetailsModal.isOpen}
        onClose={() => setReductionDetailsModal({ isOpen: false, role: '', reductionDetails: null, redeploymentDetails: null })}
        title={reductionDetailsModal.reductionDetails ? `Reduction Details - ${reductionDetailsModal.role}` : `Redeployment Details - ${reductionDetailsModal.role}`}
        maxWidth="800px"
        maxHeight="90vh"
      >
        {reductionDetailsModal.reductionDetails && (
          <div className="space-y-6">
            {/* Retirement Eligible Section */}
            {reductionDetailsModal.reductionDetails.retirementEligible.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Retirement Eligible ({reductionDetailsModal.reductionDetails.retirementEligible.length})
                  </h3>
                  <span className="text-xs text-gray-500 bg-orange-100 text-orange-800 px-2 py-1 rounded">
                    Highest Tenure
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Employees with the highest tenure, prioritized for retirement eligibility based on years of service.
                </p>
                <div className="space-y-2">
                  {reductionDetailsModal.reductionDetails.retirementEligible.map((emp) => {
                    const profile = emp.profile;
                    const tenureYears = Math.floor((profile.employee.tenureMonths || 0) / 12);
                    return (
                      <div key={emp.employeeId} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{emp.name}</div>
                            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                              <div>Employee ID: {emp.employeeId}</div>
                              <div>Tenure: {tenureYears} years ({profile.employee.tenureMonths || 0} months)</div>
                              <div>Role: {profile.employee.currentRoleName}</div>
                              <div>Location: {profile.employee.location}</div>
                              {profile.readiness && (
                                <div>Readiness Score: {profile.readiness.readinessScore}/100</div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-xs font-medium text-orange-700">Selection Reason</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Top {Math.floor((reductionDetailsModal.reductionDetails?.retirementEligible.length || 0) / Math.max(1, reductionDetailsModal.reductionDetails?.retirementEligible.length || 1) * 100)}% by tenure
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Voluntary Attrition Section */}
            {reductionDetailsModal.reductionDetails.voluntaryAttrition.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Voluntary Attrition ({reductionDetailsModal.reductionDetails.voluntaryAttrition.length})
                  </h3>
                  <span className="text-xs text-gray-500 bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    Lower Readiness
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Employees with lower readiness scores, indicating higher risk of voluntary turnover and lower engagement.
                </p>
                <div className="space-y-2">
                  {reductionDetailsModal.reductionDetails.voluntaryAttrition.map((emp) => {
                    const profile = emp.profile;
                    return (
                      <div key={emp.employeeId} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{emp.name}</div>
                            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                              <div>Employee ID: {emp.employeeId}</div>
                              <div>Role: {profile.employee.currentRoleName}</div>
                              <div>Location: {profile.employee.location}</div>
                              {profile.readiness && (
                                <>
                                  <div>Readiness Score: {profile.readiness.readinessScore}/100 ({profile.readiness.readinessFlag})</div>
                                  <div>Risk Level: {profile.readiness.riskLevel}</div>
                                </>
                              )}
                              {profile.performance && (
                                <div>Performance Rating: {profile.performance.performanceRating}</div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-xs font-medium text-yellow-700">Selection Reason</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Lower readiness score indicates higher voluntary attrition risk
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Redeployment Section */}
            {reductionDetailsModal.reductionDetails.redeployment.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Redeployment ({reductionDetailsModal.reductionDetails.redeployment.length})
                  </h3>
                  <span className="text-xs text-gray-500 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Transferable Skills
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Employees with transferable skills who can be redeployed to critical roles after reskilling.
                </p>
                <div className="space-y-2">
                  {reductionDetailsModal.reductionDetails.redeployment.map((emp) => {
                    const profile = emp.profile;
                    return (
                      <div key={emp.employeeId} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{emp.name}</div>
                            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                              <div>Employee ID: {emp.employeeId}</div>
                              <div>Role: {profile.employee.currentRoleName}</div>
                              <div>Location: {profile.employee.location}</div>
                              {profile.redeployment && (
                                <>
                                  <div>Redeployment Score: {profile.redeployment.redeploymentScore}/100</div>
                                  <div>Transferable Skills: {profile.redeployment.transferableSkills}</div>
                                  <div>Mobility Willingness: {profile.redeployment.mobilityWillingness}/100</div>
                                  <div>Time to Redeploy: {profile.redeployment.timeToRedeploy} days</div>
                                </>
                              )}
                              {profile.skills && profile.skills.length > 0 && (
                                <div>Current Skills: {profile.skills.slice(0, 3).map(s => s.skillName).join(', ')}{profile.skills.length > 3 ? '...' : ''}</div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-xs font-medium text-blue-700">Selection Reason</div>
                            <div className="text-xs text-gray-600 mt-1">
                              Suitable for redeployment to critical roles
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Involuntary Actions Section */}
            {reductionDetailsModal.reductionDetails.involuntary.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Involuntary Actions ({reductionDetailsModal.reductionDetails.involuntary.length})
                  </h3>
                  <span className="text-xs text-gray-500 bg-red-100 text-red-800 px-2 py-1 rounded">
                    Performance-Based
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Employees identified for involuntary separation based on lower performance scores, engagement levels, and readiness metrics. These positions will be eliminated through layoffs or terminations.
                </p>
                <div className="space-y-2">
                  {reductionDetailsModal.reductionDetails.involuntary.map((emp) => {
                    const profile = emp.profile;
                    const engagementScore = profile.performance?.engagementScore || 0;
                    const readinessScore = profile.readiness?.readinessScore || 0;
                    return (
                      <div key={emp.employeeId} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{emp.name}</div>
                            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                              <div>Employee ID: {emp.employeeId}</div>
                              <div>Role: {profile.employee.currentRoleName}</div>
                              <div>Location: {profile.employee.location}</div>
                              {profile.performance && (
                                <>
                                  <div>Engagement Score: {profile.performance.engagementScore}/100</div>
                                  <div>Performance Rating: {profile.performance.performanceRating}</div>
                                  <div>Flight Risk Score: {profile.performance.flightRiskScore}/100</div>
                                </>
                              )}
                              {profile.readiness && (
                                <>
                                  <div>Readiness Score: {profile.readiness.readinessScore}/100 ({profile.readiness.readinessFlag})</div>
                                  <div>Risk Level: {profile.readiness.riskLevel}</div>
                                </>
                              )}
                              {profile.employee.tenureMonths && (
                                <div>Tenure: {Math.floor(profile.employee.tenureMonths / 12)} years ({profile.employee.tenureMonths} months)</div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-xs font-medium text-red-700">Selection Reason</div>
                            <div className="text-xs text-gray-600 mt-1 max-w-[150px]">
                              Lower combined performance (engagement: {engagementScore}/100, readiness: {readinessScore}/100). Position elimination recommended due to automation impact and performance metrics.
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
        {reductionDetailsModal.redeploymentDetails && (
          <div className="space-y-6">
            {/* Redeployment Employees Section */}
            {reductionDetailsModal.redeploymentDetails.employees.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Employees Eligible for Redeployment ({reductionDetailsModal.redeploymentDetails.employees.length})
                  </h3>
                  <span className="text-xs text-gray-500 bg-green-100 text-green-800 px-2 py-1 rounded">
                    High Redeployment Readiness
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Employees prioritized for redeployment to higher-value strategic work based on redeployment readiness score, transferable skills, and performance.
                </p>
                <div className="space-y-2">
                  {reductionDetailsModal.redeploymentDetails.employees.map((emp) => {
                    const profile = emp.profile;
                    const redeploymentScore = profile.redeployment?.redeploymentScore || 0;
                    const engagementScore = profile.performance?.engagementScore || 0;
                    return (
                      <div key={emp.employeeId} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">{emp.name}</div>
                            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                              <div>Employee ID: {emp.employeeId}</div>
                              <div>Role: {profile.employee.currentRoleName}</div>
                              <div>Location: {profile.employee.location}</div>
                              {profile.redeployment && (
                                <>
                                  <div>Redeployment Score: {profile.redeployment.redeploymentScore}/100</div>
                                  <div>Transferable Skills: {profile.redeployment.transferableSkills}</div>
                                  <div>Mobility Willingness: {profile.redeployment.mobilityWillingness}/100</div>
                                  <div>Time to Redeploy: {profile.redeployment.timeToRedeploy} days</div>
                                  {profile.redeployment.crossFunctionalExperience && (
                                    <div>Cross-functional Experience: Yes</div>
                                  )}
                                </>
                              )}
                              {profile.performance && (
                                <>
                                  <div>Engagement Score: {profile.performance.engagementScore}/100</div>
                                  <div>Performance Rating: {profile.performance.performanceRating}</div>
                                </>
                              )}
                              {profile.readiness && (
                                <div>Readiness Score: {profile.readiness.readinessScore}/100 ({profile.readiness.readinessFlag})</div>
                              )}
                              {profile.skills && profile.skills.length > 0 && (
                                <div>Key Skills: {profile.skills.slice(0, 5).map(s => s.skillName).join(', ')}{profile.skills.length > 5 ? '...' : ''}</div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-xs font-medium text-green-700">Selection Reason</div>
                            <div className="text-xs text-gray-600 mt-1 max-w-[150px]">
                              High redeployment readiness ({redeploymentScore}/100) and engagement ({engagementScore}/100). Strong transferable skills and mobility willingness make this employee ideal for strategic project redeployment.
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AIAugmentation;

