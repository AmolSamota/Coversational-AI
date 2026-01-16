/**
 * Workforce Readiness Data
 * Parses and structures the CSV data into normalized TypeScript objects
 */

import type {
  Employee,
  PerformanceMetrics,
  ReadinessAssessment,
  Skill,
  EmployeeProfile,
  EmployeeCost,
  LearningMetrics,
  RedeploymentReadiness,
  LeadershipMetrics,
  WorkforceStats,
  DepartmentStats,
  RoleStats,
  SkillStats,
  LocationStats,
  RoleInfo,
} from './workforceReadinessSchema';

// Raw CSV data (first 50 employees)
const csvData = `employee_id,employee_name,current_role_id,current_role_name,job_family,business_unit,location,employment_type,hire_date,tenure_months,performance_rating,engagement_score,flight_risk_score,leadership_flag,manager_id,readiness_score_0to100,readiness_flag,skill_gap_severity_index,overall_workforce_readiness_index,risk_level,skill_1_id,skill_1_name,skill_1_proficiency_1to5,skill_1_source,skill_1_last_validated_date,skill_2_id,skill_2_name,skill_2_proficiency_1to5,skill_2_source,skill_2_last_validated_date,skill_3_id,skill_3_name,skill_3_proficiency_1to5,skill_3_source,skill_3_last_validated_date,skill_4_id,skill_4_name,skill_4_proficiency_1to5,skill_4_source,skill_4_last_validated_date,skill_5_id,skill_5_name,skill_5_proficiency_1to5,skill_5_source,skill_5_last_validated_date,skill_6_id,skill_6_name,skill_6_proficiency_1to5,skill_6_source,skill_6_last_validated_date
E9996414,Rohit Thomas,SWE3,Senior Software Engineer,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2017-07-03,102,Exceeds,58,40,Individual Contributor,E1666754,54,Not-ready,5,54,High,SK006,Azure Cloud,3,Inferred,2025-01-04,SK008,Microservices,4,Project Evidence,2023-12-05,SK009,Kubernetes,3,Assessment,2025-01-27,SK007,Distributed Systems,3,Assessment,2024-10-18,SK018,API Design,2,Assessment,2023-07-05,SK022,Technical Leadership,2,Assessment,2023-05-12
E7067228,Jordan Anderson,SWE2,Software Engineer II,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2019-12-03,73,Outstanding,90,48,Individual Contributor,E7774229,50,Not-ready,6,50,High,SK004,Python,2,Assessment,2023-06-07,SK006,Azure Cloud,2,Project Evidence,2025-04-22,SK019,Testing & Quality,3,Project Evidence,2023-06-25,SK007,Distributed Systems,3,Resume,2025-07-20,SK021,Stakeholder Management,1,Resume,2025-03-08,SK010,CI/CD,2,Inferred,2023-03-14
E5855124,Chris Iyer,SWE1,Software Engineer I,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2017-04-28,105,Exceeds,65,25,Individual Contributor,E9897858,61,Not-ready,4,61,High,SK004,Python,2,Resume,2023-03-24,SK020,Product Thinking,3,Inferred,2024-07-26,SK006,Azure Cloud,5,Assessment,2025-12-26,SK019,Testing & Quality,5,Inferred,2023-05-06,SK021,Stakeholder Management,1,Resume,2025-02-13,SK018,API Design,3,Inferred,2023-08-08
E5663623,Ananya Wilson,SWE2,Software Engineer II,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2023-11-27,25,Meets,51,24,Individual Contributor,E9897858,58,Not-ready,5,58,High,SK004,Python,1,Assessment,2023-08-12,SK006,Azure Cloud,2,Project Evidence,2024-04-08,SK019,Testing & Quality,2,Assessment,2023-11-07,SK007,Distributed Systems,4,Resume,2024-06-09,SK021,Stakeholder Management,2,Project Evidence,2023-05-12,SK010,CI/CD,3,Inferred,2025-09-13
E7210606,Casey Brown,SRE2,Site Reliability Engineer II,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2021-04-22,56,Meets,63,5,Individual Contributor,E1666754,62,Not-ready,4,62,High,SK011,Observability/SRE,4,Inferred,2025-09-11,SK006,Azure Cloud,3,Resume,2023-02-09,SK009,Kubernetes,3,Project Evidence,2023-10-09,SK007,Distributed Systems,4,Resume,2023-02-20,SK021,Stakeholder Management,1,Inferred,2024-06-24,SK010,CI/CD,2,Assessment,2024-07-20
E3871230,Avery Patel,DS3,Senior Data Engineer,Engineering,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2024-12-08,12,Meets,65,36,Individual Contributor,E9897858,66,Not-ready,4,66,Medium,SK004,Python,5,Project Evidence,2025-02-13,SK006,Azure Cloud,3,Inferred,2025-04-09,SK015,SQL,3,Resume,2023-12-14,SK021,Stakeholder Management,5,Project Evidence,2023-09-26,SK014,Data Pipelines,2,Project Evidence,2025-11-24,SK010,CI/CD,3,Inferred,2025-12-22
E7366205,Rohit Anderson,SRE2,Site Reliability Engineer II,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2020-11-23,61,Meets,64,52,Individual Contributor,E9897858,44,Not-ready,6,44,High,SK011,Observability/SRE,2,Inferred,2023-06-14,SK006,Azure Cloud,3,Inferred,2023-11-11,SK009,Kubernetes,2,Inferred,2025-06-22,SK007,Distributed Systems,3,Inferred,2023-12-10,SK021,Stakeholder Management,3,Project Evidence,2025-05-22,SK010,CI/CD,3,Assessment,2024-06-13
E6440561,Jordan Sharma,SWE1,Software Engineer I,Engineering,Security,"San Francisco, CA, USA",Full-time,2016-04-27,117,Meets,71,15,Individual Contributor,E4194548,57,Not-ready,4,57,High,SK004,Python,5,Assessment,2025-05-18,SK020,Product Thinking,3,Resume,2023-04-14,SK006,Azure Cloud,4,Resume,2025-07-22,SK019,Testing & Quality,2,Resume,2025-03-20,SK021,Stakeholder Management,3,Resume,2025-05-13,SK018,API Design,2,Resume,2025-01-10
E7730428,Anil Malhotra,SWE1,Software Engineer I,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2020-02-07,71,Meets,56,54,Individual Contributor,E7774229,66,Not-ready,4,66,Medium,SK004,Python,3,Resume,2024-04-14,SK020,Product Thinking,2,Project Evidence,2025-10-21,SK006,Azure Cloud,4,Project Evidence,2024-08-15,SK019,Testing & Quality,2,Project Evidence,2024-11-07,SK021,Stakeholder Management,2,Inferred,2025-08-26,SK018,API Design,4,Project Evidence,2025-03-22
E6279418,Rahul Patel,SWE4,Principal Software Engineer,Engineering,Developer Tools,"San Francisco, CA, USA",Full-time,2019-11-16,74,Meets,80,38,Individual Contributor,E4194548,73,Near-ready,3,73,Medium,SK011,Observability/SRE,4,Resume,2023-05-17,SK006,Azure Cloud,3,Resume,2025-11-20,SK008,Microservices,2,Resume,2024-02-27,SK007,Distributed Systems,1,Inferred,2023-11-10,SK018,API Design,4,Inferred,2023-04-05,SK022,Technical Leadership,4,Inferred,2023-01-08
E3396987,Sanjay Verma,SWE1,Software Engineer I,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2020-03-08,70,Meets,59,6,Individual Contributor,E7774229,70,Near-ready,3,70,Medium,SK004,Python,4,Inferred,2024-10-28,SK020,Product Thinking,2,Assessment,2023-08-14,SK006,Azure Cloud,4,Resume,2025-10-07,SK019,Testing & Quality,2,Assessment,2025-12-13,SK021,Stakeholder Management,4,Project Evidence,2024-07-08,SK018,API Design,3,Resume,2023-11-23
E5408072,Ananya Anderson,SWE2,Software Engineer II,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2022-10-13,38,Meets,76,5,Individual Contributor,E9897858,51,Not-ready,5,51,High,SK004,Python,4,Inferred,2023-02-25,SK006,Azure Cloud,3,Assessment,2024-04-06,SK019,Testing & Quality,3,Inferred,2025-09-15,SK007,Distributed Systems,1,Inferred,2023-09-08,SK021,Stakeholder Management,1,Resume,2023-08-05,SK010,CI/CD,3,Inferred,2024-11-17
E3320821,Meera Johnson,SWE2,Software Engineer II,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2024-08-03,16,Meets,78,50,Individual Contributor,E4194548,65,Not-ready,4,65,Medium,SK004,Python,4,Assessment,2025-10-11,SK006,Azure Cloud,3,Inferred,2024-10-27,SK019,Testing & Quality,2,Assessment,2025-09-14,SK007,Distributed Systems,3,Project Evidence,2025-08-06,SK021,Stakeholder Management,4,Assessment,2025-08-15,SK010,CI/CD,3,Assessment,2024-04-27
E2839607,Aditya Reddy,SEC3,Senior Security Engineer,Engineering,Security,"San Francisco, CA, USA",Full-time,2018-11-06,86,Meets,61,29,Individual Contributor,E7774229,71,Near-ready,3,71,Medium,SK006,Azure Cloud,4,Resume,2025-05-25,SK012,Security Engineering,2,Inferred,2025-08-21,SK007,Distributed Systems,4,Project Evidence,2023-05-15,SK021,Stakeholder Management,4,Project Evidence,2023-12-10,SK018,API Design,2,Resume,2023-05-11,SK013,Threat Modeling,1,Inferred,2024-09-03
E2065818,Suresh Kumar,TPM3,Senior Technical Program Manager,Engineering,Security,"Bangalore, KA, India",Full-time,2022-07-20,41,Meets,69,27,Individual Contributor,E7774229,61,Not-ready,4,61,High,SK020,Product Thinking,1,Inferred,2023-03-08,SK024,Program Management,1,Resume,2024-12-05,SK007,Distributed Systems,2,Assessment,2025-04-03,SK021,Stakeholder Management,4,Assessment,2024-07-11,SK018,API Design,3,Assessment,2025-08-14,SK022,Technical Leadership,4,Project Evidence,2023-04-27
E5218028,Sanjay Davis,SWE3,Senior Software Engineer,Engineering,Security,"Bangalore, KA, India",Full-time,2024-01-22,23,Exceeds,71,53,Individual Contributor,E4194548,49,Not-ready,5,49,High,SK006,Azure Cloud,3,Inferred,2024-07-25,SK008,Microservices,4,Inferred,2025-12-01,SK009,Kubernetes,3,Resume,2025-07-16,SK007,Distributed Systems,3,Assessment,2023-06-10,SK018,API Design,3,Resume,2024-07-18,SK022,Technical Leadership,2,Inferred,2025-12-18
E5476583,Amit Wilson,SWE2,Software Engineer II,Engineering,Security,"San Francisco, CA, USA",Full-time,2021-02-10,59,Exceeds,89,41,Individual Contributor,E1666754,64,Not-ready,5,64,High,SK004,Python,3,Project Evidence,2025-04-16,SK006,Azure Cloud,2,Resume,2023-05-14,SK019,Testing & Quality,3,Assessment,2024-01-13,SK007,Distributed Systems,4,Inferred,2024-11-22,SK021,Stakeholder Management,3,Inferred,2024-12-06,SK010,CI/CD,2,Resume,2024-03-20
E8612220,Casey Kumar,SWE4,Principal Software Engineer,Engineering,Developer Tools,"San Francisco, CA, USA",Full-time,2016-12-24,109,Meets,73,29,Individual Contributor,E7774229,53,Not-ready,5,53,High,SK011,Observability/SRE,3,Project Evidence,2025-01-13,SK006,Azure Cloud,2,Assessment,2025-10-22,SK008,Microservices,4,Resume,2023-02-21,SK007,Distributed Systems,3,Inferred,2024-03-28,SK018,API Design,2,Inferred,2024-03-02,SK022,Technical Leadership,2,Inferred,2024-07-11
E3997281,Arjun Thomas,SWE3,Senior Software Engineer,Engineering,Developer Tools,"Bangalore, KA, India",Full-time,2024-02-28,21,Outstanding,65,8,Individual Contributor,E9897858,49,Not-ready,6,49,High,SK006,Azure Cloud,1,Project Evidence,2023-08-11,SK008,Microservices,2,Inferred,2024-07-09,SK009,Kubernetes,1,Inferred,2024-05-27,SK007,Distributed Systems,3,Resume,2023-08-01,SK018,API Design,2,Project Evidence,2025-09-02,SK022,Technical Leadership,3,Assessment,2024-04-21
E9517169,Meera Wilson,DS3,Senior Data Engineer,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2019-03-12,82,Meets,62,25,Individual Contributor,E7774229,68,Not-ready,3,68,Medium,SK004,Python,4,Project Evidence,2023-11-02,SK006,Azure Cloud,1,Inferred,2023-04-07,SK015,SQL,3,Resume,2023-10-05,SK021,Stakeholder Management,3,Assessment,2023-03-16,SK014,Data Pipelines,4,Resume,2025-02-19,SK010,CI/CD,4,Resume,2023-08-23
E9897858,Neha Smith,EM1,Engineering Manager,Engineering,Productivity,"Bangalore, KA, India",Full-time,2016-10-11,111,Exceeds,75,40,People Manager,,53,Not-ready,5,53,High,SK023,People Management,3,Assessment,2024-06-06,SK020,Product Thinking,4,Assessment,2025-10-24,SK006,Azure Cloud,3,Project Evidence,2025-02-25,SK024,Program Management,3,Inferred,2023-05-04,SK021,Stakeholder Management,3,Resume,2025-01-10,SK022,Technical Leadership,3,Resume,2025-11-13
E2876828,Jordan Anderson,SWE2,Software Engineer II,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2021-05-08,56,Meets,63,29,Individual Contributor,E9897858,45,Not-ready,6,45,High,SK004,Python,1,Project Evidence,2024-12-07,SK006,Azure Cloud,2,Inferred,2023-10-23,SK019,Testing & Quality,2,Project Evidence,2025-04-04,SK007,Distributed Systems,3,Project Evidence,2025-05-28,SK021,Stakeholder Management,3,Inferred,2025-10-26,SK010,CI/CD,1,Assessment,2023-10-26
E2321324,Shreya Brown,SWE2,Software Engineer II,Engineering,Developer Tools,"San Francisco, CA, USA",Full-time,2017-12-16,97,Exceeds,40,41,Individual Contributor,E4194548,69,Not-ready,3,69,Medium,SK004,Python,4,Project Evidence,2023-06-18,SK006,Azure Cloud,3,Inferred,2024-11-12,SK019,Testing & Quality,4,Resume,2023-09-21,SK007,Distributed Systems,3,Resume,2024-01-28,SK021,Stakeholder Management,3,Project Evidence,2024-08-04,SK010,CI/CD,4,Assessment,2024-06-21
E9937326,Neha Verma,SWE2,Software Engineer II,Engineering,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2018-03-22,94,Meets,70,42,Individual Contributor,E7774229,54,Not-ready,6,54,High,SK004,Python,2,Inferred,2024-12-05,SK006,Azure Cloud,3,Project Evidence,2024-03-24,SK019,Testing & Quality,3,Project Evidence,2025-11-09,SK007,Distributed Systems,2,Project Evidence,2025-09-25,SK021,Stakeholder Management,3,Inferred,2024-08-14,SK010,CI/CD,1,Assessment,2025-10-09
E3770370,Vikram Reddy,SWE4,Principal Software Engineer,Engineering,Security,"Bangalore, KA, India",Full-time,2020-09-28,63,Meets,71,5,Individual Contributor,E9897858,59,Not-ready,5,59,High,SK011,Observability/SRE,4,Assessment,2024-04-27,SK006,Azure Cloud,1,Resume,2023-05-15,SK008,Microservices,3,Inferred,2023-08-19,SK007,Distributed Systems,3,Inferred,2025-11-13,SK018,API Design,3,Resume,2024-01-16,SK022,Technical Leadership,3,Project Evidence,2024-03-16
E4553384,Morgan Thomas,SWE2,Software Engineer II,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2024-12-23,11,Meets,72,79,Individual Contributor,E9897858,51,Not-ready,5,51,High,SK004,Python,1,Inferred,2023-06-26,SK006,Azure Cloud,3,Assessment,2024-06-09,SK019,Testing & Quality,1,Assessment,2025-12-09,SK007,Distributed Systems,1,Inferred,2025-01-17,SK021,Stakeholder Management,4,Inferred,2023-02-08,SK010,CI/CD,3,Resume,2025-07-16
E7693979,Suresh Davis,SWE1,Software Engineer I,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2021-08-17,52,Outstanding,65,27,Individual Contributor,E4194548,49,Not-ready,5,49,High,SK004,Python,3,Resume,2025-04-23,SK020,Product Thinking,4,Inferred,2024-11-23,SK006,Azure Cloud,2,Assessment,2024-08-26,SK019,Testing & Quality,2,Resume,2023-02-10,SK021,Stakeholder Management,2,Resume,2023-07-23,SK018,API Design,2,Project Evidence,2023-05-22
E5159166,Alex Malhotra,SWE3,Senior Software Engineer,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2019-02-11,83,Meets,85,48,Individual Contributor,E7774229,47,Not-ready,6,47,High,SK006,Azure Cloud,3,Project Evidence,2025-06-16,SK008,Microservices,2,Assessment,2025-09-12,SK009,Kubernetes,2,Resume,2024-12-18,SK007,Distributed Systems,3,Project Evidence,2024-06-23,SK018,API Design,2,Assessment,2024-05-10,SK022,Technical Leadership,1,Inferred,2024-04-04
E4860684,Deepa Johnson,SWE2,Software Engineer II,Engineering,Security,"San Francisco, CA, USA",Full-time,2019-01-03,84,Meets,88,60,Individual Contributor,E7774229,44,Not-ready,6,44,High,SK004,Python,3,Resume,2025-04-11,SK006,Azure Cloud,2,Inferred,2023-12-18,SK019,Testing & Quality,2,Assessment,2025-03-07,SK007,Distributed Systems,3,Assessment,2023-12-16,SK021,Stakeholder Management,2,Project Evidence,2024-12-19,SK010,CI/CD,1,Inferred,2025-10-10
E4841005,Priya Brown,SWE4,Principal Software Engineer,Engineering,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2017-01-28,108,Exceeds,60,24,Individual Contributor,E4194548,53,Not-ready,5,53,High,SK011,Observability/SRE,1,Resume,2023-04-10,SK006,Azure Cloud,3,Assessment,2023-06-06,SK008,Microservices,2,Project Evidence,2024-01-23,SK007,Distributed Systems,2,Assessment,2025-03-09,SK018,API Design,4,Assessment,2023-01-18,SK022,Technical Leadership,3,Inferred,2024-12-05
E9626108,Neha Moore,SWE1,Software Engineer I,Engineering,Developer Tools,"Bangalore, KA, India",Full-time,2019-05-22,80,Exceeds,72,28,Individual Contributor,E7774229,72,Near-ready,4,72,Medium,SK004,Python,2,Inferred,2025-08-04,SK020,Product Thinking,2,Resume,2023-10-10,SK006,Azure Cloud,3,Inferred,2024-08-15,SK019,Testing & Quality,4,Project Evidence,2024-03-02,SK021,Stakeholder Management,3,Assessment,2024-08-04,SK018,API Design,4,Inferred,2023-07-16
E3219824,Neha Reddy,SWE2,Software Engineer II,Engineering,Security,"Bangalore, KA, India",Full-time,2023-04-26,32,Meets,60,62,Individual Contributor,E4194548,64,Not-ready,3,64,High,SK004,Python,4,Inferred,2023-10-21,SK006,Azure Cloud,4,Project Evidence,2025-01-05,SK019,Testing & Quality,5,Resume,2023-10-10,SK007,Distributed Systems,3,Inferred,2023-04-04,SK021,Stakeholder Management,2,Project Evidence,2025-07-20,SK010,CI/CD,3,Project Evidence,2025-10-08
E4194548,Amit Gupta,EM1,Engineering Manager,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2017-02-22,107,Meets,67,45,People Manager,,36,Not-ready,6,36,High,SK023,People Management,1,Project Evidence,2025-07-15,SK020,Product Thinking,3,Resume,2024-05-28,SK006,Azure Cloud,2,Inferred,2025-07-10,SK024,Program Management,2,Project Evidence,2025-10-02,SK021,Stakeholder Management,2,Assessment,2025-12-04,SK022,Technical Leadership,2,Inferred,2023-11-07
E8106470,Sanjay Johnson,SRE2,Site Reliability Engineer II,Engineering,Productivity,"Bangalore, KA, India",Full-time,2022-08-28,40,Exceeds,52,38,Individual Contributor,E7774229,50,Not-ready,6,50,High,SK011,Observability/SRE,3,Inferred,2024-11-03,SK006,Azure Cloud,3,Assessment,2023-04-06,SK009,Kubernetes,3,Project Evidence,2025-02-06,SK007,Distributed Systems,3,Project Evidence,2023-07-15,SK021,Stakeholder Management,3,Assessment,2025-10-16,SK010,CI/CD,3,Assessment,2024-01-08
E2651177,Priya Davis,SWE1,Software Engineer I,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2016-07-24,114,Outstanding,54,56,Individual Contributor,E1666754,40,Not-ready,6,40,High,SK004,Python,1,Inferred,2024-12-10,SK020,Product Thinking,3,Resume,2025-08-03,SK006,Azure Cloud,2,Assessment,2025-04-09,SK019,Testing & Quality,2,Inferred,2025-10-22,SK021,Stakeholder Management,1,Assessment,2023-07-04,SK018,API Design,3,Resume,2025-04-21
E5171761,Suresh Miller,SWE3,Senior Software Engineer,Engineering,Security,"Bangalore, KA, India",Full-time,2019-04-18,81,Outstanding,75,41,Individual Contributor,E7774229,70,Near-ready,4,70,Medium,SK006,Azure Cloud,3,Resume,2023-05-27,SK008,Microservices,3,Resume,2023-02-02,SK009,Kubernetes,3,Assessment,2023-05-20,SK007,Distributed Systems,1,Inferred,2025-10-10,SK018,API Design,4,Project Evidence,2024-02-15,SK022,Technical Leadership,5,Project Evidence,2025-05-23
E8077999,Riley Brown,SRE2,Site Reliability Engineer II,Engineering,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2018-05-15,92,Meets,74,50,Individual Contributor,E9897858,63,Not-ready,4,63,High,SK011,Observability/SRE,4,Resume,2024-05-17,SK006,Azure Cloud,2,Assessment,2025-08-15,SK009,Kubernetes,4,Assessment,2023-10-02,SK007,Distributed Systems,3,Assessment,2024-12-11,SK021,Stakeholder Management,1,Project Evidence,2025-05-01,SK010,CI/CD,2,Assessment,2023-04-22
E8434500,Arjun Verma,SWE1,Software Engineer I,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2024-02-02,22,Exceeds,94,43,Individual Contributor,E9897858,48,Not-ready,6,48,High,SK004,Python,3,Inferred,2025-10-01,SK020,Product Thinking,3,Inferred,2025-05-19,SK006,Azure Cloud,3,Project Evidence,2023-03-16,SK019,Testing & Quality,3,Inferred,2025-11-15,SK021,Stakeholder Management,3,Project Evidence,2024-03-19,SK018,API Design,2,Assessment,2024-11-27
E1247595,Amit Singh,SRE2,Site Reliability Engineer II,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2017-04-06,105,Exceeds,62,14,Individual Contributor,E1666754,67,Not-ready,4,67,Medium,SK011,Observability/SRE,3,Inferred,2024-02-16,SK006,Azure Cloud,5,Resume,2024-07-11,SK009,Kubernetes,2,Inferred,2024-11-04,SK007,Distributed Systems,4,Inferred,2023-06-14,SK021,Stakeholder Management,1,Assessment,2025-08-10,SK010,CI/CD,2,Resume,2025-07-27
E9075854,Avery Iyer,DS3,Senior Data Engineer,Engineering,Security,"Bangalore, KA, India",Full-time,2019-07-02,78,Exceeds,81,69,Individual Contributor,E7774229,60,Not-ready,5,60,High,SK004,Python,2,Assessment,2025-01-15,SK006,Azure Cloud,1,Assessment,2023-06-09,SK015,SQL,4,Assessment,2024-02-25,SK021,Stakeholder Management,2,Inferred,2024-09-27,SK014,Data Pipelines,3,Assessment,2023-11-28,SK010,CI/CD,1,Assessment,2025-08-14
E1036161,Aditya Patel,SWE1,Software Engineer I,Engineering,Developer Tools,"San Francisco, CA, USA",Full-time,2022-05-26,43,Meets,82,30,Individual Contributor,E9897858,58,Not-ready,4,58,High,SK004,Python,1,Inferred,2023-04-17,SK020,Product Thinking,4,Inferred,2024-10-25,SK006,Azure Cloud,3,Inferred,2024-11-15,SK019,Testing & Quality,4,Project Evidence,2023-04-09,SK021,Stakeholder Management,3,Project Evidence,2025-03-10,SK018,API Design,3,Resume,2024-12-16
E5785687,Aditya Verma,SRE2,Site Reliability Engineer II,Engineering,Security,"San Francisco, CA, USA",Full-time,2022-12-24,36,Meets,68,83,Individual Contributor,E9897858,57,Not-ready,5,57,High,SK011,Observability/SRE,2,Assessment,2023-01-21,SK006,Azure Cloud,2,Project Evidence,2025-04-23,SK009,Kubernetes,2,Project Evidence,2023-05-18,SK007,Distributed Systems,4,Project Evidence,2023-09-14,SK021,Stakeholder Management,3,Project Evidence,2023-04-27,SK010,CI/CD,1,Resume,2023-08-04
E9164991,Morgan Johnson,SWE2,Software Engineer II,Engineering,Security,"San Francisco, CA, USA",Full-time,2018-04-10,93,Meets,72,32,Individual Contributor,E7774229,56,Not-ready,4,56,High,SK004,Python,2,Resume,2025-03-16,SK006,Azure Cloud,2,Inferred,2025-05-17,SK019,Testing & Quality,2,Inferred,2025-05-14,SK007,Distributed Systems,2,Resume,2024-08-08,SK021,Stakeholder Management,4,Assessment,2024-09-05,SK010,CI/CD,4,Inferred,2024-04-20
E2022698,Pooja Singh,SWE2,Software Engineer II,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2021-01-02,60,Needs Improvement,69,47,Individual Contributor,E4194548,59,Not-ready,4,59,High,SK004,Python,3,Resume,2025-12-05,SK006,Azure Cloud,2,Assessment,2023-05-25,SK019,Testing & Quality,2,Assessment,2024-06-26,SK007,Distributed Systems,4,Project Evidence,2025-05-27,SK021,Stakeholder Management,1,Resume,2023-05-24,SK010,CI/CD,4,Assessment,2024-10-19
E9436429,Kiran Brown,SWE1,Software Engineer I,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2024-03-02,21,Meets,66,48,Individual Contributor,E7774229,63,Not-ready,4,63,High,SK004,Python,3,Inferred,2025-08-28,SK020,Product Thinking,3,Resume,2023-08-18,SK006,Azure Cloud,3,Project Evidence,2024-06-11,SK019,Testing & Quality,3,Resume,2025-09-13,SK021,Stakeholder Management,5,Project Evidence,2024-06-28,SK018,API Design,4,Assessment,2023-12-08
E4117625,Nikhil Anderson,SWE3,Senior Software Engineer,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2017-10-03,99,Meets,74,12,Individual Contributor,E4194548,49,Not-ready,5,49,High,SK006,Azure Cloud,3,Project Evidence,2025-07-08,SK008,Microservices,2,Inferred,2024-01-11,SK009,Kubernetes,2,Project Evidence,2025-08-23,SK007,Distributed Systems,2,Project Evidence,2024-07-22,SK018,API Design,4,Assessment,2025-03-16,SK022,Technical Leadership,3,Assessment,2023-03-17
E7774229,Pooja Chatterjee,EM1,Engineering Manager,Engineering,Security,"San Francisco, CA, USA",Full-time,2017-10-08,99,Exceeds,74,20,People Manager,,48,Not-ready,5,48,High,SK023,People Management,3,Inferred,2025-06-28,SK020,Product Thinking,2,Resume,2023-08-04,SK006,Azure Cloud,4,Assessment,2025-08-01,SK024,Program Management,1,Project Evidence,2025-03-14,SK021,Stakeholder Management,1,Project Evidence,2025-03-03,SK022,Technical Leadership,1,Assessment,2024-05-11
E1666754,Pooja Malhotra,EM2,Senior Engineering Manager,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2017-07-22,102,Meets,76,45,People Manager,,52,Not-ready,5,52,High,SK023,People Management,2,Inferred,2025-12-13,SK020,Product Thinking,3,Resume,2025-02-28,SK024,Program Management,3,Assessment,2024-11-28,SK007,Distributed Systems,4,Assessment,2025-07-11,SK021,Stakeholder Management,2,Project Evidence,2025-12-25,SK022,Technical Leadership,2,Resume,2024-09-02
E9770838,Nikhil Sharma,SEC3,Senior Security Engineer,Engineering,Security,"San Francisco, CA, USA",Full-time,2021-05-07,56,Meets,82,24,Individual Contributor,E1666754,46,Not-ready,6,46,High,SK006,Azure Cloud,2,Inferred,2025-02-08,SK012,Security Engineering,2,Assessment,2025-11-10,SK007,Distributed Systems,3,Resume,2023-12-03,SK021,Stakeholder Management,3,Inferred,2024-02-25,SK018,API Design,3,Assessment,2025-12-28,SK013,Threat Modeling,3,Inferred,2023-08-06
E5004485,Nikhil Thomas,MLE3,Senior Machine Learning Engineer,Engineering,Productivity,"Bangalore, KA, India",Full-time,2020-07-05,66,Outstanding,78,90,Individual Contributor,E1666754,70,Near-ready,4,70,Medium,SK004,Python,3,Resume,2025-05-01,SK016,ML Fundamentals,1,Inferred,2023-06-26,SK006,Azure Cloud,4,Inferred,2023-05-12,SK017,MLOps,1,Assessment,2024-07-05,SK021,Stakeholder Management,3,Assessment,2023-09-14,SK010,CI/CD,5,Resume,2025-11-26
E1000001,Placeholder Name,PM1,Product Manager I,Product Management,Productivity,"San Francisco, CA, USA",Full-time,2023-01-15,24,Meets,72,35,Individual Contributor,E1666754,58,Not-ready,5,58,High,SK020,Product Thinking,3,Assessment,2024-08-12,SK021,Stakeholder Management,3,Project Evidence,2024-06-20,SK025,Market Research,2,Resume,2024-03-15,SK026,User Research,2,Inferred,2024-09-10,SK027,Product Roadmap Planning,3,Project Evidence,2024-11-05,SK024,Program Management,2,Assessment,2024-07-18
E1000002,Placeholder Name,PM2,Product Manager II,Product Management,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2021-03-22,58,Exceeds,78,28,Individual Contributor,E1666754,65,Not-ready,4,65,Medium,SK020,Product Thinking,4,Project Evidence,2024-10-15,SK021,Stakeholder Management,4,Assessment,2024-08-22,SK025,Market Research,3,Resume,2024-05-12,SK026,User Research,3,Project Evidence,2024-12-01,SK027,Product Roadmap Planning,4,Assessment,2024-09-20,SK024,Program Management,3,Inferred,2024-11-10
E1000003,Placeholder Name,PM3,Senior Product Manager,Product Management,Security,"San Francisco, CA, USA",Full-time,2019-06-10,80,Outstanding,85,22,Individual Contributor,E1666754,72,Near-ready,3,72,Medium,SK020,Product Thinking,5,Assessment,2024-12-15,SK021,Stakeholder Management,5,Project Evidence,2024-10-25,SK025,Market Research,4,Resume,2024-08-18,SK026,User Research,4,Assessment,2024-11-30,SK027,Product Roadmap Planning,5,Project Evidence,2024-09-28,SK022,Technical Leadership,3,Inferred,2024-12-05
E1000004,Placeholder Name,PM4,Principal Product Manager,Product Management,Developer Tools,"San Francisco, CA, USA",Full-time,2017-11-05,98,Exceeds,88,15,Individual Contributor,E1666754,75,Near-ready,2,75,Low,SK020,Product Thinking,5,Project Evidence,2024-12-20,SK021,Stakeholder Management,5,Assessment,2024-11-15,SK025,Market Research,5,Resume,2024-09-25,SK026,User Research,5,Project Evidence,2024-12-10,SK027,Product Roadmap Planning,5,Assessment,2024-10-30,SK022,Technical Leadership,4,Inferred,2024-12-18
E1000005,Placeholder Name,PM1,Product Manager I,Product Management,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2023-08-20,16,Meets,68,45,Individual Contributor,E9897858,55,Not-ready,5,55,High,SK020,Product Thinking,2,Resume,2024-07-10,SK021,Stakeholder Management,2,Inferred,2024-09-05,SK025,Market Research,2,Assessment,2024-06-15,SK026,User Research,2,Resume,2024-08-20,SK027,Product Roadmap Planning,2,Project Evidence,2024-10-12,SK024,Program Management,2,Inferred,2024-11-25
E1000006,Placeholder Name,PM2,Product Manager II,Product Management,Productivity,"Bangalore, KA, India",Full-time,2022-02-14,47,Exceeds,75,32,Individual Contributor,E7774229,62,Not-ready,4,62,High,SK020,Product Thinking,3,Project Evidence,2024-09-18,SK021,Stakeholder Management,3,Assessment,2024-08-05,SK025,Market Research,3,Resume,2024-07-22,SK026,User Research,3,Inferred,2024-10-15,SK027,Product Roadmap Planning,3,Project Evidence,2024-11-08,SK024,Program Management,3,Assessment,2024-12-12
E1000007,Placeholder Name,PM3,Senior Product Manager,Product Management,Security,"Bangalore, KA, India",Full-time,2020-04-18,68,Outstanding,82,18,Individual Contributor,E1666754,70,Near-ready,3,70,Medium,SK020,Product Thinking,4,Assessment,2024-11-20,SK021,Stakeholder Management,4,Project Evidence,2024-10-10,SK025,Market Research,4,Resume,2024-09-15,SK026,User Research,4,Assessment,2024-12-05,SK027,Product Roadmap Planning,4,Project Evidence,2024-11-18,SK022,Technical Leadership,3,Inferred,2024-12-22
E1000008,Placeholder Name,UX1,UX Designer I,UX Design,Productivity,"San Francisco, CA, USA",Full-time,2023-05-12,19,Meets,74,38,Individual Contributor,E1666754,60,Not-ready,4,60,High,SK026,User Research,3,Assessment,2024-08-15,SK028,UI Design,3,Project Evidence,2024-07-20,SK029,Prototyping,2,Resume,2024-06-10,SK030,Design Systems,2,Inferred,2024-09-25,SK031,Usability Testing,2,Project Evidence,2024-10-18,SK021,Stakeholder Management,2,Assessment,2024-11-30
E1000009,Placeholder Name,UX2,UX Designer II,UX Design,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2021-09-08,51,Exceeds,79,25,Individual Contributor,E1666754,66,Not-ready,3,66,Medium,SK026,User Research,4,Project Evidence,2024-10-22,SK028,UI Design,4,Assessment,2024-09-12,SK029,Prototyping,3,Resume,2024-08-18,SK030,Design Systems,3,Project Evidence,2024-11-15,SK031,Usability Testing,3,Inferred,2024-12-08,SK021,Stakeholder Management,3,Assessment,2024-10-28
E1000010,Placeholder Name,UX3,Senior UX Designer,UX Design,Security,"San Francisco, CA, USA",Full-time,2019-12-03,73,Outstanding,86,20,Individual Contributor,E1666754,73,Near-ready,2,73,Medium,SK026,User Research,5,Assessment,2024-12-18,SK028,UI Design,5,Project Evidence,2024-11-20,SK029,Prototyping,4,Resume,2024-10-15,SK030,Design Systems,4,Assessment,2024-12-10,SK031,Usability Testing,4,Project Evidence,2024-11-25,SK021,Stakeholder Management,4,Inferred,2024-12-28
E1000011,Placeholder Name,UX4,Principal UX Designer,UX Design,Developer Tools,"San Francisco, CA, USA",Full-time,2018-03-15,94,Exceeds,90,12,Individual Contributor,E1666754,76,Near-ready,2,76,Low,SK026,User Research,5,Project Evidence,2024-12-22,SK028,UI Design,5,Assessment,2024-11-28,SK029,Prototyping,5,Resume,2024-10-30,SK030,Design Systems,5,Project Evidence,2024-12-15,SK031,Usability Testing,5,Assessment,2024-12-05,SK022,Technical Leadership,3,Inferred,2024-12-20
E1000012,Placeholder Name,UX1,UX Designer I,UX Design,Productivity,"Bangalore, KA, India",Full-time,2023-10-05,14,Meets,70,42,Individual Contributor,E9897858,57,Not-ready,4,57,High,SK026,User Research,2,Resume,2024-08-20,SK028,UI Design,2,Inferred,2024-07-15,SK029,Prototyping,2,Assessment,2024-09-10,SK030,Design Systems,2,Resume,2024-10-05,SK031,Usability Testing,2,Project Evidence,2024-11-12,SK021,Stakeholder Management,2,Inferred,2024-12-15
E1000013,Placeholder Name,UX2,UX Designer II,UX Design,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2022-01-20,48,Exceeds,77,30,Individual Contributor,E7774229,64,Not-ready,3,64,High,SK026,User Research,3,Project Evidence,2024-10-18,SK028,UI Design,3,Assessment,2024-09-22,SK029,Prototyping,3,Resume,2024-08-28,SK030,Design Systems,3,Inferred,2024-11-20,SK031,Usability Testing,3,Project Evidence,2024-12-10,SK021,Stakeholder Management,3,Assessment,2024-11-05
E1000014,Placeholder Name,UX3,Senior UX Designer,UX Design,Security,"Bangalore, KA, India",Full-time,2020-07-12,66,Outstanding,84,16,Individual Contributor,E1666754,71,Near-ready,2,71,Medium,SK026,User Research,4,Assessment,2024-12-12,SK028,UI Design,4,Project Evidence,2024-11-15,SK029,Prototyping,4,Resume,2024-10-20,SK030,Design Systems,4,Assessment,2024-12-08,SK031,Usability Testing,4,Inferred,2024-11-28,SK021,Stakeholder Management,4,Project Evidence,2024-12-18
E1000015,Placeholder Name,TPM1,Technical Program Manager I,Technical Program Management,Productivity,"San Francisco, CA, USA",Full-time,2023-02-18,22,Meets,71,40,Individual Contributor,E7774229,59,Not-ready,4,59,High,SK024,Program Management,3,Assessment,2024-08-25,SK021,Stakeholder Management,3,Project Evidence,2024-07-30,SK032,Project Planning,3,Resume,2024-06-20,SK033,Risk Management,2,Inferred,2024-09-15,SK034,Budget Management,2,Project Evidence,2024-10-22,SK007,Distributed Systems,2,Assessment,2024-11-28
E1000016,Placeholder Name,TPM2,Technical Program Manager II,Technical Program Management,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2021-06-25,55,Exceeds,80,26,Individual Contributor,E7774229,67,Not-ready,3,67,Medium,SK024,Program Management,4,Project Evidence,2024-10-28,SK021,Stakeholder Management,4,Assessment,2024-09-18,SK032,Project Planning,4,Resume,2024-08-22,SK033,Risk Management,3,Inferred,2024-11-12,SK034,Budget Management,3,Project Evidence,2024-12-05,SK007,Distributed Systems,3,Assessment,2024-11-20
E1000017,Placeholder Name,TPM4,Principal Technical Program Manager,Technical Program Management,Security,"San Francisco, CA, USA",Full-time,2018-09-10,88,Outstanding,87,14,Individual Contributor,E1666754,74,Near-ready,2,74,Low,SK024,Program Management,5,Assessment,2024-12-25,SK021,Stakeholder Management,5,Project Evidence,2024-11-28,SK032,Project Planning,5,Resume,2024-10-30,SK033,Risk Management,4,Inferred,2024-12-15,SK034,Budget Management,4,Project Evidence,2024-12-20,SK022,Technical Leadership,4,Assessment,2024-12-18
E1000018,Placeholder Name,TPM1,Technical Program Manager I,Technical Program Management,Developer Tools,"Bangalore, KA, India",Full-time,2023-07-08,17,Meets,69,44,Individual Contributor,E9897858,56,Not-ready,4,56,High,SK024,Program Management,2,Resume,2024-08-10,SK021,Stakeholder Management,2,Inferred,2024-07-15,SK032,Project Planning,2,Assessment,2024-09-20,SK033,Risk Management,2,Resume,2024-10-12,SK034,Budget Management,2,Project Evidence,2024-11-18,SK007,Distributed Systems,2,Inferred,2024-12-22
E1000019,Placeholder Name,TPM2,Technical Program Manager II,Technical Program Management,Productivity,"Bangalore, KA, India",Full-time,2022-03-22,45,Exceeds,76,33,Individual Contributor,E7774229,63,Not-ready,3,63,High,SK024,Program Management,3,Project Evidence,2024-10-15,SK021,Stakeholder Management,3,Assessment,2024-09-08,SK032,Project Planning,3,Resume,2024-08-25,SK033,Risk Management,3,Inferred,2024-11-22,SK034,Budget Management,3,Project Evidence,2024-12-12,SK007,Distributed Systems,3,Assessment,2024-11-15
E1000020,Placeholder Name,PM1,Product Manager I,Product Management,Developer Tools,"San Francisco, CA, USA",Full-time,2023-11-20,13,Meets,73,36,Individual Contributor,E1666754,58,Not-ready,5,58,High,SK020,Product Thinking,3,Assessment,2024-09-12,SK021,Stakeholder Management,3,Project Evidence,2024-08-18,SK025,Market Research,2,Resume,2024-07-25,SK026,User Research,2,Inferred,2024-10-08,SK027,Product Roadmap Planning,2,Project Evidence,2024-11-15,SK024,Program Management,2,Assessment,2024-12-20
E1000021,Placeholder Name,PM2,Product Manager II,Product Management,Security,"San Francisco, CA, USA",Full-time,2021-05-15,56,Exceeds,81,24,Individual Contributor,E1666754,66,Not-ready,4,66,Medium,SK020,Product Thinking,4,Project Evidence,2024-11-10,SK021,Stakeholder Management,4,Assessment,2024-10-05,SK025,Market Research,3,Resume,2024-09-18,SK026,User Research,3,Project Evidence,2024-12-01,SK027,Product Roadmap Planning,3,Assessment,2024-11-22,SK024,Program Management,3,Inferred,2024-12-15
E1000022,Placeholder Name,PM3,Senior Product Manager,Product Management,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2019-08-28,76,Outstanding,87,19,Individual Contributor,E1666754,73,Near-ready,3,73,Medium,SK020,Product Thinking,5,Assessment,2024-12-20,SK021,Stakeholder Management,5,Project Evidence,2024-11-25,SK025,Market Research,4,Resume,2024-10-30,SK026,User Research,4,Assessment,2024-12-12,SK027,Product Roadmap Planning,4,Project Evidence,2024-12-05,SK022,Technical Leadership,3,Inferred,2024-12-25
E1000023,Placeholder Name,UX1,UX Designer I,UX Design,Developer Tools,"San Francisco, CA, USA",Full-time,2023-09-10,15,Meets,75,37,Individual Contributor,E1666754,59,Not-ready,4,59,High,SK026,User Research,3,Assessment,2024-09-18,SK028,UI Design,3,Project Evidence,2024-08-22,SK029,Prototyping,2,Resume,2024-07-28,SK030,Design Systems,2,Inferred,2024-10-15,SK031,Usability Testing,2,Project Evidence,2024-11-20,SK021,Stakeholder Management,2,Assessment,2024-12-10
E1000024,Placeholder Name,UX2,UX Designer II,UX Design,Productivity,"San Francisco, CA, USA",Full-time,2021-12-05,49,Exceeds,78,27,Individual Contributor,E1666754,65,Not-ready,3,65,Medium,SK026,User Research,4,Project Evidence,2024-11-05,SK028,UI Design,4,Assessment,2024-10-12,SK029,Prototyping,3,Resume,2024-09-20,SK030,Design Systems,3,Project Evidence,2024-12-08,SK031,Usability Testing,3,Inferred,2024-11-28,SK021,Stakeholder Management,3,Assessment,2024-12-18
E1000025,Placeholder Name,UX3,Senior UX Designer,UX Design,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2020-01-15,71,Outstanding,85,21,Individual Contributor,E1666754,72,Near-ready,2,72,Medium,SK026,User Research,5,Assessment,2024-12-15,SK028,UI Design,5,Project Evidence,2024-11-22,SK029,Prototyping,4,Resume,2024-10-25,SK030,Design Systems,4,Assessment,2024-12-12,SK031,Usability Testing,4,Project Evidence,2024-12-05,SK021,Stakeholder Management,4,Inferred,2024-12-22
E1000026,Placeholder Name,TPM1,Technical Program Manager I,Technical Program Management,Security,"San Francisco, CA, USA",Full-time,2023-04-22,20,Meets,72,39,Individual Contributor,E7774229,60,Not-ready,4,60,High,SK024,Program Management,3,Assessment,2024-09-10,SK021,Stakeholder Management,3,Project Evidence,2024-08-15,SK032,Project Planning,3,Resume,2024-07-20,SK033,Risk Management,2,Inferred,2024-10-05,SK034,Budget Management,2,Project Evidence,2024-11-12,SK007,Distributed Systems,2,Assessment,2024-12-20
E1000027,Placeholder Name,TPM2,Technical Program Manager II,Technical Program Management,Developer Tools,"San Francisco, CA, USA",Full-time,2021-08-12,52,Exceeds,79,25,Individual Contributor,E7774229,68,Not-ready,3,68,Medium,SK024,Program Management,4,Project Evidence,2024-11-18,SK021,Stakeholder Management,4,Assessment,2024-10-22,SK032,Project Planning,4,Resume,2024-09-28,SK033,Risk Management,3,Inferred,2024-12-10,SK034,Budget Management,3,Project Evidence,2024-12-18,SK007,Distributed Systems,3,Assessment,2024-11-30
E1000028,Placeholder Name,PM1,Product Manager I,Product Management,Productivity,"Bangalore, KA, India",Full-time,2023-12-08,12,Meets,71,41,Individual Contributor,E9897858,57,Not-ready,4,57,High,SK020,Product Thinking,2,Resume,2024-09-22,SK021,Stakeholder Management,2,Inferred,2024-08-28,SK025,Market Research,2,Assessment,2024-10-15,SK026,User Research,2,Resume,2024-11-08,SK027,Product Roadmap Planning,2,Project Evidence,2024-12-12,SK024,Program Management,2,Inferred,2024-11-25
E1000029,Placeholder Name,PM2,Product Manager II,Product Management,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2022-05-18,43,Exceeds,77,29,Individual Contributor,E7774229,64,Not-ready,3,64,High,SK020,Product Thinking,3,Project Evidence,2024-11-12,SK021,Stakeholder Management,3,Assessment,2024-10-18,SK025,Market Research,3,Resume,2024-09-25,SK026,User Research,3,Inferred,2024-12-08,SK027,Product Roadmap Planning,3,Project Evidence,2024-11-28,SK024,Program Management,3,Assessment,2024-12-15
E1000030,Placeholder Name,PM3,Senior Product Manager,Product Management,Developer Tools,"Bangalore, KA, India",Full-time,2020-10-22,62,Outstanding,83,17,Individual Contributor,E1666754,71,Near-ready,2,71,Medium,SK020,Product Thinking,4,Assessment,2024-12-18,SK021,Stakeholder Management,4,Project Evidence,2024-11-30,SK025,Market Research,4,Resume,2024-10-28,SK026,User Research,4,Assessment,2024-12-20,SK027,Product Roadmap Planning,4,Project Evidence,2024-12-10,SK022,Technical Leadership,3,Inferred,2024-12-25
E1000031,Placeholder Name,UX1,UX Designer I,UX Design,Security,"Bangalore, KA, India",Full-time,2023-06-15,18,Meets,72,40,Individual Contributor,E9897858,58,Not-ready,4,58,High,SK026,User Research,2,Resume,2024-09-15,SK028,UI Design,2,Inferred,2024-08-20,SK029,Prototyping,2,Assessment,2024-10-10,SK030,Design Systems,2,Resume,2024-11-05,SK031,Usability Testing,2,Project Evidence,2024-12-15,SK021,Stakeholder Management,2,Inferred,2024-11-22
E1000032,Placeholder Name,UX2,UX Designer II,UX Design,Productivity,"Bangalore, KA, India",Full-time,2022-02-28,46,Exceeds,76,31,Individual Contributor,E7774229,63,Not-ready,3,63,High,SK026,User Research,3,Project Evidence,2024-11-08,SK028,UI Design,3,Assessment,2024-10-15,SK029,Prototyping,3,Resume,2024-09-22,SK030,Design Systems,3,Inferred,2024-12-05,SK031,Usability Testing,3,Project Evidence,2024-11-28,SK021,Stakeholder Management,3,Assessment,2024-12-18
E1000033,Placeholder Name,UX3,Senior UX Designer,UX Design,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2020-05-08,67,Outstanding,85,15,Individual Contributor,E1666754,70,Near-ready,2,70,Medium,SK026,User Research,4,Assessment,2024-12-10,SK028,UI Design,4,Project Evidence,2024-11-18,SK029,Prototyping,4,Resume,2024-10-25,SK030,Design Systems,4,Assessment,2024-12-08,SK031,Usability Testing,4,Inferred,2024-11-30,SK021,Stakeholder Management,4,Project Evidence,2024-12-22
E1000034,Placeholder Name,TPM1,Technical Program Manager I,Technical Program Management,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2023-08-25,16,Meets,70,43,Individual Contributor,E9897858,56,Not-ready,4,56,High,SK024,Program Management,2,Resume,2024-09-05,SK021,Stakeholder Management,2,Inferred,2024-08-10,SK032,Project Planning,2,Assessment,2024-10-18,SK033,Risk Management,2,Resume,2024-11-12,SK034,Budget Management,2,Project Evidence,2024-12-20,SK007,Distributed Systems,2,Inferred,2024-11-28
E1000035,Placeholder Name,TPM2,Technical Program Manager II,Technical Program Management,Security,"Bangalore, KA, India",Full-time,2022-04-12,44,Exceeds,78,28,Individual Contributor,E7774229,65,Not-ready,3,65,High,SK024,Program Management,3,Project Evidence,2024-11-15,SK021,Stakeholder Management,3,Assessment,2024-10-22,SK032,Project Planning,3,Resume,2024-09-28,SK033,Risk Management,3,Inferred,2024-12-12,SK034,Budget Management,3,Project Evidence,2024-12-18,SK007,Distributed Systems,3,Assessment,2024-11-30
E1000036,Placeholder Name,PM1,Product Manager I,Product Management,Security,"San Francisco, CA, USA",Full-time,2024-01-10,11,Meets,74,34,Individual Contributor,E1666754,59,Not-ready,5,59,High,SK020,Product Thinking,3,Assessment,2024-10-12,SK021,Stakeholder Management,3,Project Evidence,2024-09-18,SK025,Market Research,2,Resume,2024-08-25,SK026,User Research,2,Inferred,2024-11-08,SK027,Product Roadmap Planning,2,Project Evidence,2024-12-15,SK024,Program Management,2,Assessment,2024-11-22
E1000037,Placeholder Name,PM2,Product Manager II,Product Management,Developer Tools,"San Francisco, CA, USA",Full-time,2021-10-28,50,Exceeds,82,23,Individual Contributor,E1666754,67,Not-ready,4,67,Medium,SK020,Product Thinking,4,Project Evidence,2024-12-05,SK021,Stakeholder Management,4,Assessment,2024-11-12,SK025,Market Research,3,Resume,2024-10-20,SK026,User Research,3,Project Evidence,2024-12-22,SK027,Product Roadmap Planning,3,Assessment,2024-12-10,SK024,Program Management,3,Inferred,2024-12-18
E1000038,Placeholder Name,UX1,UX Designer I,UX Design,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2023-11-15,13,Meets,76,35,Individual Contributor,E1666754,60,Not-ready,4,60,High,SK026,User Research,3,Assessment,2024-10-20,SK028,UI Design,3,Project Evidence,2024-09-25,SK029,Prototyping,2,Resume,2024-08-30,SK030,Design Systems,2,Inferred,2024-11-15,SK031,Usability Testing,2,Project Evidence,2024-12-20,SK021,Stakeholder Management,2,Assessment,2024-11-28
E1000039,Placeholder Name,UX2,UX Designer II,UX Design,Security,"San Francisco, CA, USA",Full-time,2021-07-20,53,Exceeds,80,24,Individual Contributor,E1666754,66,Not-ready,3,66,Medium,SK026,User Research,4,Project Evidence,2024-12-08,SK028,UI Design,4,Assessment,2024-11-15,SK029,Prototyping,3,Resume,2024-10-22,SK030,Design Systems,3,Project Evidence,2024-12-18,SK031,Usability Testing,3,Inferred,2024-12-05,SK021,Stakeholder Management,3,Assessment,2024-12-22
E1000040,Placeholder Name,TPM1,Technical Program Manager I,Technical Program Management,Productivity,"San Francisco, CA, USA",Full-time,2023-03-18,21,Meets,73,38,Individual Contributor,E7774229,61,Not-ready,4,61,High,SK024,Program Management,3,Assessment,2024-09-28,SK021,Stakeholder Management,3,Project Evidence,2024-09-05,SK032,Project Planning,3,Resume,2024-08-12,SK033,Risk Management,2,Inferred,2024-10-22,SK034,Budget Management,2,Project Evidence,2024-11-28,SK007,Distributed Systems,2,Assessment,2024-12-15
E1000041,Placeholder Name,PM1,Product Manager I,Product Management,Security,"Bangalore, KA, India",Full-time,2024-02-05,10,Meets,72,39,Individual Contributor,E9897858,58,Not-ready,4,58,High,SK020,Product Thinking,2,Resume,2024-10-18,SK021,Stakeholder Management,2,Inferred,2024-09-22,SK025,Market Research,2,Assessment,2024-11-12,SK026,User Research,2,Resume,2024-12-08,SK027,Product Roadmap Planning,2,Project Evidence,2024-11-30,SK024,Program Management,2,Inferred,2024-12-20
E1000042,Placeholder Name,PM2,Product Manager II,Product Management,Developer Tools,"Bangalore, KA, India",Full-time,2022-06-22,42,Exceeds,79,26,Individual Contributor,E7774229,65,Not-ready,3,65,High,SK020,Product Thinking,3,Project Evidence,2024-12-10,SK021,Stakeholder Management,3,Assessment,2024-11-18,SK025,Market Research,3,Resume,2024-10-28,SK026,User Research,3,Inferred,2024-12-22,SK027,Product Roadmap Planning,3,Project Evidence,2024-12-15,SK024,Program Management,3,Assessment,2024-12-18
E1000043,Placeholder Name,UX1,UX Designer I,UX Design,Developer Tools,"Bangalore, KA, India",Full-time,2023-12-20,12,Meets,73,36,Individual Contributor,E9897858,59,Not-ready,4,59,High,SK026,User Research,2,Resume,2024-10-25,SK028,UI Design,2,Inferred,2024-09-30,SK029,Prototyping,2,Assessment,2024-11-18,SK030,Design Systems,2,Resume,2024-12-12,SK031,Usability Testing,2,Project Evidence,2024-11-28,SK021,Stakeholder Management,2,Inferred,2024-12-25
E1000044,Placeholder Name,UX2,UX Designer II,UX Design,Security,"Bangalore, KA, India",Full-time,2022-03-15,45,Exceeds,78,27,Individual Contributor,E7774229,64,Not-ready,3,64,High,SK026,User Research,3,Project Evidence,2024-12-15,SK028,UI Design,3,Assessment,2024-11-22,SK029,Prototyping,3,Resume,2024-10-30,SK030,Design Systems,3,Inferred,2024-12-22,SK031,Usability Testing,3,Project Evidence,2024-12-18,SK021,Stakeholder Management,3,Assessment,2024-12-20
E1000045,Placeholder Name,TPM1,Technical Program Manager I,Technical Program Management,Developer Tools,"Bangalore, KA, India",Full-time,2023-09-28,15,Meets,71,37,Individual Contributor,E9897858,57,Not-ready,4,57,High,SK024,Program Management,2,Resume,2024-10-12,SK021,Stakeholder Management,2,Inferred,2024-09-18,SK032,Project Planning,2,Assessment,2024-11-22,SK033,Risk Management,2,Resume,2024-12-10,SK034,Budget Management,2,Project Evidence,2024-11-30,SK007,Distributed Systems,2,Inferred,2024-12-25
E1000046,Placeholder Name,PM3,Senior Product Manager,Product Management,Productivity,"San Francisco, CA, USA",Full-time,2019-05-20,79,Outstanding,89,13,Individual Contributor,E1666754,74,Near-ready,2,74,Low,SK020,Product Thinking,5,Assessment,2024-12-28,SK021,Stakeholder Management,5,Project Evidence,2024-12-15,SK025,Market Research,4,Resume,2024-11-25,SK026,User Research,4,Assessment,2024-12-25,SK027,Product Roadmap Planning,4,Project Evidence,2024-12-20,SK022,Technical Leadership,3,Inferred,2024-12-22
E1000047,Placeholder Name,UX4,Principal UX Designer,UX Design,Productivity,"San Francisco, CA, USA",Full-time,2018-06-12,90,Exceeds,91,10,Individual Contributor,E1666754,77,Near-ready,2,77,Low,SK026,User Research,5,Project Evidence,2024-12-28,SK028,UI Design,5,Assessment,2024-12-20,SK029,Prototyping,5,Resume,2024-11-30,SK030,Design Systems,5,Project Evidence,2024-12-25,SK031,Usability Testing,5,Assessment,2024-12-18,SK022,Technical Leadership,3,Inferred,2024-12-22
E1000048,Placeholder Name,TPM4,Principal Technical Program Manager,Technical Program Management,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2018-12-05,85,Outstanding,88,11,Individual Contributor,E1666754,75,Near-ready,2,75,Low,SK024,Program Management,5,Assessment,2024-12-28,SK021,Stakeholder Management,5,Project Evidence,2024-12-22,SK032,Project Planning,5,Resume,2024-12-10,SK033,Risk Management,4,Inferred,2024-12-25,SK034,Budget Management,4,Project Evidence,2024-12-20,SK022,Technical Leadership,4,Assessment,2024-12-18
E1000049,Placeholder Name,PM4,Principal Product Manager,Product Management,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2017-04-18,104,Exceeds,86,8,Individual Contributor,E1666754,76,Near-ready,2,76,Low,SK020,Product Thinking,5,Project Evidence,2024-12-28,SK021,Stakeholder Management,5,Assessment,2024-12-25,SK025,Market Research,5,Resume,2024-12-15,SK026,User Research,5,Project Evidence,2024-12-22,SK027,Product Roadmap Planning,5,Assessment,2024-12-20,SK022,Technical Leadership,4,Inferred,2024-12-18
E1000050,James Martinez,SWE2,Software Engineer II,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2022-09-15,39,Exceeds,77,26,Individual Contributor,E9897858,52,Not-ready,5,52,High,SK004,Python,3,Project Evidence,2024-11-20,SK006,Azure Cloud,3,Assessment,2024-10-15,SK019,Testing & Quality,3,Resume,2024-09-25,SK007,Distributed Systems,3,Inferred,2024-12-10,SK021,Stakeholder Management,2,Project Evidence,2024-11-28,SK010,CI/CD,3,Assessment,2024-12-18
E1000051,Michael Chen,SWE1,Software Engineer I,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2023-07-22,17,Meets,68,44,Individual Contributor,E7774229,61,Not-ready,4,61,High,SK004,Python,2,Resume,2024-10-12,SK006,Azure Cloud,2,Inferred,2024-09-18,SK019,Testing & Quality,2,Assessment,2024-11-22,SK007,Distributed Systems,2,Project Evidence,2024-12-15,SK021,Stakeholder Management,2,Resume,2024-11-30,SK010,CI/CD,2,Inferred,2024-12-20
E1000052,David Lee,SRE2,Site Reliability Engineer II,Engineering,Security,"San Francisco, CA, USA",Full-time,2021-11-10,49,Meets,65,31,Individual Contributor,E1666754,63,Not-ready,4,63,High,SK011,Observability/SRE,3,Assessment,2024-11-15,SK006,Azure Cloud,3,Project Evidence,2024-10-22,SK009,Kubernetes,3,Resume,2024-09-28,SK007,Distributed Systems,3,Inferred,2024-12-12,SK021,Stakeholder Management,2,Assessment,2024-11-28,SK010,CI/CD,3,Project Evidence,2024-12-18
E1000053,Robert Taylor,SWE3,Senior Software Engineer,Engineering,Developer Tools,"San Francisco, CA, USA",Full-time,2020-03-18,69,Exceeds,79,22,Individual Contributor,E4194548,68,Not-ready,3,68,Medium,SK006,Azure Cloud,4,Project Evidence,2024-12-10,SK008,Microservices,3,Assessment,2024-11-22,SK009,Kubernetes,3,Resume,2024-10-30,SK007,Distributed Systems,3,Project Evidence,2024-12-08,SK018,API Design,3,Assessment,2024-11-30,SK022,Technical Leadership,2,Inferred,2024-12-22
E1000054,William Garcia,DS3,Senior Data Engineer,Engineering,Productivity,"San Francisco, CA, USA",Full-time,2019-09-25,75,Meets,71,28,Individual Contributor,E7774229,66,Not-ready,3,66,Medium,SK004,Python,4,Resume,2024-12-05,SK006,Azure Cloud,2,Inferred,2024-11-18,SK015,SQL,4,Assessment,2024-10-28,SK021,Stakeholder Management,3,Project Evidence,2024-12-15,SK014,Data Pipelines,4,Resume,2024-11-30,SK010,CI/CD,3,Assessment,2024-12-20
E1000055,Richard Rodriguez,SWE2,Software Engineer II,Engineering,Security,"San Francisco, CA, USA",Full-time,2022-04-20,44,Outstanding,84,19,Individual Contributor,E1666754,55,Not-ready,5,55,High,SK004,Python,4,Project Evidence,2024-12-18,SK006,Azure Cloud,4,Assessment,2024-11-25,SK019,Testing & Quality,4,Resume,2024-10-30,SK007,Distributed Systems,4,Inferred,2024-12-12,SK021,Stakeholder Management,3,Project Evidence,2024-11-30,SK010,CI/CD,4,Assessment,2024-12-22
E1000056,Joseph White,SWE1,Software Engineer I,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2024-05-10,19,Meets,70,41,Individual Contributor,E9897858,59,Not-ready,4,59,High,SK004,Python,2,Resume,2024-11-12,SK006,Azure Cloud,2,Inferred,2024-10-18,SK019,Testing & Quality,2,Assessment,2024-12-08,SK007,Distributed Systems,2,Project Evidence,2024-11-28,SK021,Stakeholder Management,2,Resume,2024-12-15,SK010,CI/CD,2,Inferred,2024-12-25
E1000057,Thomas Harris,SWE4,Principal Software Engineer,Engineering,Security,"San Francisco, CA, USA",Full-time,2018-01-15,95,Exceeds,81,16,Individual Contributor,E4194548,71,Near-ready,3,71,Medium,SK011,Observability/SRE,4,Resume,2024-12-20,SK006,Azure Cloud,4,Assessment,2024-11-28,SK008,Microservices,4,Project Evidence,2024-12-10,SK007,Distributed Systems,4,Inferred,2024-12-18,SK018,API Design,4,Assessment,2024-12-15,SK022,Technical Leadership,4,Project Evidence,2024-12-22
E1000058,Rajesh Iyer,SWE2,Software Engineer II,Engineering,Productivity,"Bangalore, KA, India",Full-time,2022-08-12,40,Exceeds,74,30,Individual Contributor,E7774229,62,Not-ready,4,62,High,SK004,Python,3,Project Evidence,2024-11-18,SK006,Azure Cloud,3,Assessment,2024-10-25,SK019,Testing & Quality,3,Resume,2024-09-30,SK007,Distributed Systems,3,Inferred,2024-12-12,SK021,Stakeholder Management,2,Project Evidence,2024-11-28,SK010,CI/CD,3,Assessment,2024-12-20
E1000059,Arvind Nair,SWE1,Software Engineer I,Engineering,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2023-10-18,14,Meets,69,43,Individual Contributor,E9897858,57,Not-ready,4,57,High,SK004,Python,2,Resume,2024-10-22,SK006,Azure Cloud,2,Inferred,2024-09-28,SK019,Testing & Quality,2,Assessment,2024-11-20,SK007,Distributed Systems,2,Project Evidence,2024-12-10,SK021,Stakeholder Management,2,Resume,2024-11-30,SK010,CI/CD,2,Inferred,2024-12-25
E1000060,Manish Joshi,SRE2,Site Reliability Engineer II,Engineering,Developer Tools,"Bangalore, KA, India",Full-time,2021-12-08,48,Meets,66,32,Individual Contributor,E1666754,64,Not-ready,3,64,High,SK011,Observability/SRE,3,Assessment,2024-11-22,SK006,Azure Cloud,3,Project Evidence,2024-10-30,SK009,Kubernetes,3,Resume,2024-09-28,SK007,Distributed Systems,3,Inferred,2024-12-15,SK021,Stakeholder Management,2,Assessment,2024-11-30,SK010,CI/CD,3,Project Evidence,2024-12-22
E1000061,Vikram Menon,SWE3,Senior Software Engineer,Engineering,Security,"Bangalore, KA, India",Full-time,2020-06-22,66,Exceeds,78,23,Individual Contributor,E7774229,69,Not-ready,3,69,Medium,SK006,Azure Cloud,3,Project Evidence,2024-12-18,SK008,Microservices,3,Assessment,2024-11-28,SK009,Kubernetes,3,Resume,2024-10-30,SK007,Distributed Systems,3,Project Evidence,2024-12-12,SK018,API Design,3,Assessment,2024-12-08,SK022,Technical Leadership,2,Inferred,2024-12-25
E1000062,Anjali Desai,DS3,Senior Data Engineer,Engineering,Cloud & AI Platform,"Bangalore, KA, India",Full-time,2019-11-15,73,Meets,72,29,Individual Contributor,E9897858,67,Not-ready,3,67,Medium,SK004,Python,3,Resume,2024-12-10,SK006,Azure Cloud,2,Inferred,2024-11-22,SK015,SQL,3,Assessment,2024-10-30,SK021,Stakeholder Management,3,Project Evidence,2024-12-18,SK014,Data Pipelines,3,Resume,2024-12-05,SK010,CI/CD,3,Assessment,2024-12-20
E1000063,Deepak Rao,SWE2,Software Engineer II,Engineering,Developer Tools,"Bangalore, KA, India",Full-time,2022-07-05,41,Outstanding,83,18,Individual Contributor,E1666754,56,Not-ready,5,56,High,SK004,Python,4,Project Evidence,2024-12-22,SK006,Azure Cloud,4,Assessment,2024-11-30,SK019,Testing & Quality,4,Resume,2024-11-15,SK007,Distributed Systems,4,Inferred,2024-12-18,SK021,Stakeholder Management,3,Project Evidence,2024-12-12,SK010,CI/CD,4,Assessment,2024-12-25
E1000064,Kavita Krishnan,SWE1,Software Engineer I,Engineering,Security,"Bangalore, KA, India",Full-time,2024-03-25,21,Meets,71,40,Individual Contributor,E7774229,60,Not-ready,4,60,High,SK004,Python,2,Resume,2024-11-18,SK006,Azure Cloud,2,Inferred,2024-10-28,SK019,Testing & Quality,2,Assessment,2024-12-12,SK007,Distributed Systems,2,Project Evidence,2024-11-30,SK021,Stakeholder Management,2,Resume,2024-12-15,SK010,CI/CD,2,Inferred,2024-12-22
E1000065,Ashok Pillai,SWE4,Principal Software Engineer,Engineering,Productivity,"Bangalore, KA, India",Full-time,2018-02-20,94,Exceeds,80,15,Individual Contributor,E4194548,72,Near-ready,3,72,Medium,SK011,Observability/SRE,4,Resume,2024-12-25,SK006,Azure Cloud,4,Assessment,2024-12-15,SK008,Microservices,4,Project Evidence,2024-12-18,SK007,Distributed Systems,4,Inferred,2024-12-22,SK018,API Design,4,Assessment,2024-12-20,SK022,Technical Leadership,4,Project Evidence,2024-12-28
E1000066,Shilpa Reddy,PM2,Product Manager II,Product Management,Productivity,"Bangalore, KA, India",Full-time,2022-01-10,47,Exceeds,76,33,Individual Contributor,E7774229,63,Not-ready,3,63,High,SK020,Product Thinking,3,Project Evidence,2024-12-10,SK021,Stakeholder Management,3,Assessment,2024-11-22,SK025,Market Research,3,Resume,2024-10-30,SK026,User Research,3,Inferred,2024-12-18,SK027,Product Roadmap Planning,3,Project Evidence,2024-12-12,SK024,Program Management,3,Assessment,2024-12-25
E1000067,Christopher Anderson,SWE2,Software Engineer II,Engineering,Cloud & AI Platform,"San Francisco, CA, USA",Full-time,2022-06-15,42,Meets,73,27,Individual Contributor,E9897858,60,Not-ready,4,60,High,SK004,Python,3,Resume,2024-12-05,SK006,Azure Cloud,3,Project Evidence,2024-11-18,SK019,Testing & Quality,3,Assessment,2024-10-28,SK007,Distributed Systems,3,Inferred,2024-12-15,SK021,Stakeholder Management,2,Project Evidence,2024-11-30,SK010,CI/CD,3,Assessment,2024-12-22`;

/**
 * Automation Potential by Role (0-40%)
 * Lower for senior/strategic roles, higher for junior/routine roles
 */
const roleAutomationMap: { [roleId: string]: number } = {
  // Senior/Principal roles - lower automation (5-15%)
  'SWE4': 8,   // Principal Software Engineer
  'EM2': 5,    // Senior Engineering Manager
  'MLE3': 12,  // Senior Machine Learning Engineer
  'SEC3': 10,  // Senior Security Engineer
  'DS3': 15,   // Senior Data Engineer
  'TPM3': 10,  // Senior Technical Program Manager
  'TPM4': 8,   // Principal Technical Program Manager
  'PM4': 7,    // Principal Product Manager
  'UX4': 6,    // Principal UX Designer
  
  // Mid-level roles - moderate automation (15-25%)
  'SWE3': 18,  // Senior Software Engineer
  'SRE2': 22,  // Site Reliability Engineer II
  'EM1': 12,   // Engineering Manager
  'PM3': 14,   // Senior Product Manager
  'UX3': 13,   // Senior UX Designer
  'TPM2': 20,  // Technical Program Manager II
  
  // Junior/Entry roles - higher automation (25-35%)
  'SWE2': 28,  // Software Engineer II
  'SWE1': 32,  // Software Engineer I
  'PM1': 30,   // Product Manager I
  'PM2': 26,   // Product Manager II
  'UX1': 31,   // UX Designer I
  'UX2': 27,   // UX Designer II
  'TPM1': 29,  // Technical Program Manager I
};

/**
 * Get automation potential for a role
 */
function getAutomationPotential(roleId: string): number {
  return roleAutomationMap[roleId] || 20; // Default 20% if role not found
}

/**
 * Generate learning metrics for an employee
 */
function generateLearningMetrics(
  employeeId: string,
  performanceRating: string,
  engagementScore: number,
  skills: Skill[],
  tenureMonths: number
): LearningMetrics {
  // Base learning velocity on engagement and performance
  const baseVelocity = 50 + (engagementScore * 0.3) + 
    (performanceRating === 'Outstanding' ? 20 : performanceRating === 'Exceeds' ? 10 : 0);
  const learningVelocity = Math.min(100, Math.max(0, baseVelocity + (Math.random() * 20 - 10)));

  // Adaptability based on number of skills and diversity
  const skillDiversity = new Set(skills.map(s => s.source)).size;
  const adaptabilityScore = Math.min(100, 40 + (skillDiversity * 15) + (skills.length * 5) + (Math.random() * 20 - 10));

  // Skill growth rate based on recent skill updates
  const recentUpdates = skills.filter(s => {
    const updateDate = new Date(s.lastValidatedDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return updateDate > sixMonthsAgo;
  }).length;
  const skillGrowthRate = Math.min(100, (recentUpdates / skills.length) * 100 + (Math.random() * 20 - 10));

  // Training completions (based on engagement and tenure)
  const trainingCompletions = Math.floor((engagementScore / 100) * 8 + (tenureMonths / 12) * 2 + Math.random() * 3);

  // Certifications (based on performance and skills)
  const certificationsEarned = Math.floor((performanceRating === 'Outstanding' ? 3 : performanceRating === 'Exceeds' ? 2 : 1) + 
    (skills.length / 3) + Math.random() * 2);

  // Last skill update (most recent skill validation)
  const lastSkillUpdate = skills.length > 0 
    ? skills.reduce((latest, skill) => {
        const skillDate = new Date(skill.lastValidatedDate);
        const latestDate = new Date(latest);
        return skillDate > latestDate ? skill.lastValidatedDate : latest;
      }, skills[0].lastValidatedDate)
    : new Date().toISOString().split('T')[0];

  return {
    employeeId,
    learningVelocity: Math.round(learningVelocity),
    adaptabilityScore: Math.round(adaptabilityScore),
    skillGrowthRate: Math.round(skillGrowthRate),
    trainingCompletions,
    certificationsEarned,
    lastSkillUpdate,
  };
}

/**
 * Generate redeployment readiness metrics
 */
function generateRedeploymentReadiness(
  employeeId: string,
  skills: Skill[],
  _businessUnit: string,
  _roleId: string,
  tenureMonths: number,
  engagementScore: number
): RedeploymentReadiness {
  // Transferable skills (skills that can be used across roles)
  const transferableSkills = skills.filter(s => 
    ['Python', 'Azure Cloud', 'Distributed Systems', 'API Design', 'Stakeholder Management', 'Technical Leadership'].includes(s.skillName)
  ).length;

  // Cross-functional experience (has worked in multiple business units - simplified)
  const crossFunctionalExperience = tenureMonths > 36 && Math.random() > 0.6;

  // Mobility willingness (based on engagement and tenure)
  const mobilityWillingness = Math.min(100, 30 + (engagementScore * 0.4) + (Math.random() * 30 - 15));

  // Time to redeploy (based on skill count and proficiency)
  const avgProficiency = skills.length > 0 
    ? skills.reduce((sum, s) => sum + s.proficiency, 0) / skills.length 
    : 0;
  const timeToRedeploy = Math.max(7, Math.min(90, 60 - (avgProficiency * 8) - (skills.length * 2) + (Math.random() * 20 - 10)));

  // Overall redeployment score
  const redeploymentScore = Math.min(100, 
    (transferableSkills / 6) * 30 + 
    (crossFunctionalExperience ? 20 : 0) + 
    (mobilityWillingness * 0.3) + 
    (avgProficiency / 5) * 20 + 
    (Math.random() * 10 - 5)
  );

  return {
    employeeId,
    redeploymentScore: Math.round(redeploymentScore),
    transferableSkills,
    crossFunctionalExperience,
    mobilityWillingness: Math.round(mobilityWillingness),
    timeToRedeploy: Math.round(timeToRedeploy),
  };
}

/**
 * Generate leadership metrics
 */
function generateLeadershipMetrics(
  employeeId: string,
  leadershipFlag: string,
  performanceRating: string,
  engagementScore: number,
  tenureMonths: number,
  skills: Skill[]
): LeadershipMetrics {
  // Leadership potential (higher for managers, high performers)
  let leadershipPotential = 30;
  if (leadershipFlag === 'People Manager') {
    leadershipPotential = 70 + (engagementScore * 0.2) + (Math.random() * 15 - 7);
  } else {
    leadershipPotential = 20 + (performanceRating === 'Outstanding' ? 30 : performanceRating === 'Exceeds' ? 20 : 10) +
      (engagementScore * 0.3) + (Math.random() * 20 - 10);
  }
  leadershipPotential = Math.min(100, Math.max(0, leadershipPotential));

  // Succession readiness (based on performance, tenure, and technical leadership skills)
  const hasTechnicalLeadership = skills.some(s => s.skillName === 'Technical Leadership');
  const successionReadiness = Math.min(100,
    (leadershipPotential * 0.6) +
    (hasTechnicalLeadership ? 20 : 0) +
    (tenureMonths > 60 ? 15 : tenureMonths > 36 ? 10 : 5) +
    (performanceRating === 'Outstanding' ? 15 : performanceRating === 'Exceeds' ? 10 : 5) +
    (Math.random() * 10 - 5)
  );

  // Mentorship activity (higher for managers and senior roles)
  let mentorshipActivity = 30;
  if (leadershipFlag === 'People Manager') {
    mentorshipActivity = 60 + (engagementScore * 0.3) + (Math.random() * 20 - 10);
  } else if (tenureMonths > 60) {
    mentorshipActivity = 40 + (engagementScore * 0.2) + (Math.random() * 15 - 7);
  }
  mentorshipActivity = Math.min(100, Math.max(0, mentorshipActivity));

  // Team size (only for managers)
  const teamSizeManaged = leadershipFlag === 'People Manager' 
    ? Math.floor(3 + Math.random() * 8) // 3-10 team members
    : undefined;

  const directReports = teamSizeManaged;

  return {
    employeeId,
    leadershipPotential: Math.round(leadershipPotential),
    successionReadiness: Math.round(successionReadiness),
    mentorshipActivity: Math.round(mentorshipActivity),
    teamSizeManaged,
    directReports,
  };
}

/**
 * Calculate employee cost based on role, location, performance, and tenure
 */
function calculateEmployeeCost(
  roleId: string,
  _roleName: string,
  location: string,
  performanceRating: string,
  tenureMonths: number,
  engagementScore: number
): EmployeeCost {
  // Base salary ranges by role level (USD) - Market rates for 2024 (conservative estimates)
  // These represent base salary only, before benefits/taxes/overhead
  const baseSalaryRanges: { [roleId: string]: { min: number; max: number } } = {
    // Software Engineering
    'SWE1': { min: 95000, max: 130000 },   // Junior Software Engineer
    'SWE2': { min: 125000, max: 165000 },  // Mid-level Software Engineer
    'SWE3': { min: 165000, max: 210000 },  // Senior Software Engineer
    'SWE4': { min: 210000, max: 280000 },  // Principal Software Engineer
    
    // Site Reliability Engineering
    'SRE2': { min: 135000, max: 180000 },  // SRE II
    
    // Data Engineering
    'DS3': { min: 145000, max: 190000 },   // Senior Data Engineer
    
    // Security Engineering
    'SEC3': { min: 155000, max: 210000 },  // Senior Security Engineer
    
    // Machine Learning Engineering
    'MLE3': { min: 175000, max: 235000 },  // Senior ML Engineer
    
    // Engineering Management
    'EM1': { min: 180000, max: 245000 },   // Engineering Manager
    'EM2': { min: 245000, max: 330000 },  // Senior Engineering Manager
    
    // Product Management
    'PM1': { min: 105000, max: 140000 },   // Product Manager I
    'PM2': { min: 135000, max: 175000 },   // Product Manager II
    'PM3': { min: 175000, max: 230000 },   // Senior Product Manager
    'PM4': { min: 230000, max: 300000 },   // Principal Product Manager
    
    // UX Design
    'UX1': { min: 90000, max: 125000 },    // UX Designer I
    'UX2': { min: 115000, max: 155000 },   // UX Designer II
    'UX3': { min: 155000, max: 200000 },   // Senior UX Designer
    'UX4': { min: 200000, max: 265000 },   // Principal UX Designer
    
    // Technical Program Management
    'TPM1': { min: 105000, max: 140000 },  // Technical Program Manager I
    'TPM2': { min: 135000, max: 175000 },   // Technical Program Manager II
    'TPM3': { min: 165000, max: 220000 },   // Senior Technical Program Manager
    'TPM4': { min: 220000, max: 290000 },   // Principal Technical Program Manager
  };

  // Location multipliers (base salary adjustment by location)
  // India: ~30-35% of SF cost is typical for tech roles
  const locationMultipliers: { [key: string]: number } = {
    'San Francisco, CA, USA': 1.0,         // Baseline (highest cost)
    'Bangalore, KA, India': 0.32,          // ~32% of SF cost (realistic for 2024)
  };

  // Performance multipliers (modest adjustments based on performance)
  const performanceMultipliers: { [key: string]: number } = {
    'Outstanding': 1.12,    // +12% for top performers
    'Exceeds': 1.06,         // +6% for above average
    'Meets': 1.0,           // Baseline
    'Needs Improvement': 0.95, // -5% for below average
  };

  // Tenure bonus (0.5% per year, max 5%)
  // More conservative than before to keep costs realistic
  const tenureBonus = Math.min(tenureMonths / 12 * 0.005, 0.05);

  // Engagement bonus (up to 3% for high engagement)
  // Reduced from 5% to keep costs realistic
  const engagementBonus = (engagementScore / 100) * 0.03;

  // Get base salary range
  const range = baseSalaryRanges[roleId] || { min: 110000, max: 150000 }; // Default for unknown roles
  
  // Calculate base salary (use employeeId hash for deterministic variation)
  // Using a more sophisticated seed based on roleId to ensure variation
  const roleSeed = roleId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const baseSalary = range.min + ((range.max - range.min) * ((roleSeed % 100) / 100));

  // Apply location multiplier
  const locationMultiplier = locationMultipliers[location] || 1.0;
  let adjustedSalary = baseSalary * locationMultiplier;

  // Apply performance multiplier
  const perfMultiplier = performanceMultipliers[performanceRating] || 1.0;
  adjustedSalary *= perfMultiplier;

  // Apply tenure and engagement bonuses
  adjustedSalary *= (1 + tenureBonus + engagementBonus);

  // Round to nearest 1000
  adjustedSalary = Math.round(adjustedSalary / 1000) * 1000;

  // Calculate total compensation (base + benefits + taxes + overhead)
  // Total cost to company is typically 1.20-1.28x base salary in tech (conservative estimate)
  // This includes: health insurance, 401k match, payroll taxes, equipment, office space, etc.
  // Further reduced to 1.20-1.28x (20-28% overhead) to keep costs realistic
  const totalCompMultiplier = 1.20 + ((roleSeed % 9) * 0.01); // 20-28% overhead
  const totalCompensation = Math.round(adjustedSalary * totalCompMultiplier);

  // Determine currency
  const currency = location.includes('India') ? 'INR' : 'USD';
  
  // Convert to INR if needed (1 USD = 83 INR - current rate as of 2024)
  const baseSalaryFinal = currency === 'INR' ? Math.round(adjustedSalary * 83) : adjustedSalary;
  const totalCompFinal = currency === 'INR' ? Math.round(totalCompensation * 83) : totalCompensation;

  return {
    employeeId: '', // Will be set in parseCSV
    baseSalary: baseSalaryFinal,
    totalCompensation: totalCompFinal,
    costPerMonth: Math.round(totalCompFinal / 12),
    currency,
  };
}

/**
 * Generate culturally appropriate name based on location
 */
function generateCulturallyAppropriateName(employeeId: string, location: string): string {
  // Use employeeId as seed for deterministic name generation
  const seed = parseInt(employeeId.slice(-4), 16) || 0;
  
  // American/Western names for USA locations
  const americanFirstNames = [
    'James', 'Michael', 'Robert', 'David', 'William', 'Richard', 'Joseph', 'Thomas', 'Christopher', 'Daniel',
    'Matthew', 'Anthony', 'Mark', 'Donald', 'Steven', 'Paul', 'Andrew', 'Joshua', 'Kenneth', 'Kevin',
    'Brian', 'George', 'Timothy', 'Ronald', 'Jason', 'Edward', 'Jeffrey', 'Ryan', 'Jacob', 'Gary',
    'Nicholas', 'Eric', 'Jonathan', 'Stephen', 'Larry', 'Justin', 'Scott', 'Brandon', 'Benjamin', 'Samuel',
    'Emma', 'Olivia', 'Sophia', 'Isabella', 'Charlotte', 'Amelia', 'Mia', 'Harper', 'Evelyn', 'Abigail',
    'Emily', 'Elizabeth', 'Mila', 'Ella', 'Avery', 'Sofia', 'Camila', 'Aria', 'Scarlett', 'Victoria',
    'Madison', 'Luna', 'Grace', 'Chloe', 'Penelope', 'Layla', 'Riley', 'Zoey', 'Nora', 'Lily',
    'Eleanor', 'Hannah', 'Lillian', 'Addison', 'Aubrey', 'Ellie', 'Stella', 'Natalie', 'Zoe', 'Leah'
  ];
  
  const americanLastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
    'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young',
    'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams',
    'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips',
    'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards', 'Collins', 'Reyes', 'Stewart', 'Morris'
  ];
  
  // Indian names
  const indianFirstNames = [
    'Arjun', 'Rahul', 'Vikram', 'Amit', 'Rohit', 'Suresh', 'Rajesh', 'Kiran', 'Nikhil', 'Aditya',
    'Sanjay', 'Anil', 'Deepak', 'Pradeep', 'Manoj', 'Sachin', 'Vivek', 'Ravi', 'Kumar', 'Sandeep',
    'Priya', 'Neha', 'Ananya', 'Shreya', 'Meera', 'Pooja', 'Deepa', 'Kavita', 'Sunita', 'Rashmi',
    'Divya', 'Swati', 'Jyoti', 'Nisha', 'Ritu', 'Sneha', 'Anjali', 'Kavya', 'Aishwarya', 'Radha',
    'Sita', 'Lakshmi', 'Sarika', 'Manisha', 'Rekha', 'Usha', 'Geeta', 'Madhuri', 'Sushma', 'Kamala'
  ];
  
  const indianLastNames = [
    'Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Reddy', 'Verma', 'Malhotra', 'Iyer', 'Nair',
    'Menon', 'Pillai', 'Rao', 'Desai', 'Joshi', 'Mehta', 'Agarwal', 'Chopra', 'Kapoor', 'Shah',
    'Bansal', 'Arora', 'Saxena', 'Tiwari', 'Mishra', 'Pandey', 'Yadav', 'Jain', 'Bhatt', 'Dubey',
    'Chatterjee', 'Bose', 'Banerjee', 'Mukherjee', 'Das', 'Dutta', 'Ghosh', 'Sen', 'Basu', 'Roy',
    'Krishnan', 'Subramanian', 'Venkatesh', 'Raman', 'Srinivasan', 'Lakshmanan', 'Ganesan', 'Karthik', 'Raj', 'Murthy'
  ];
  
  // Determine if location is India or USA
  const isIndia = location.includes('India') || location.includes('Bangalore');
  
  let firstName: string;
  let lastName: string;
  
  if (isIndia) {
    // Indian names
    const firstNameIndex = seed % indianFirstNames.length;
    const lastNameIndex = ((seed * 17) + 1) % indianLastNames.length;
    firstName = indianFirstNames[firstNameIndex];
    lastName = indianLastNames[lastNameIndex];
  } else {
    // American/Western names
    const firstNameIndex = seed % americanFirstNames.length;
    const lastNameIndex = ((seed * 17) + 1) % americanLastNames.length;
    firstName = americanFirstNames[firstNameIndex];
    lastName = americanLastNames[lastNameIndex];
  }
  
  return `${firstName} ${lastName}`;
}

/**
 * Normalize skill proficiencies to ensure role-appropriate levels
 * Ensures variance but prevents outliers (e.g., TPM shouldn't have Program Management < 3)
 */
function normalizeSkillProficiencies(
  skills: Skill[],
  roleId: string,
  roleName: string,
  performanceRating: string
): void {
  // Define role-specific minimum proficiency levels for core skills
  // Format: { rolePattern: { skillPattern: { min: number, typical: number } } }
  const roleSkillRequirements: { [rolePattern: string]: { [skillPattern: string]: { min: number; typical: number } } } = {
    // Technical Program Managers - Program Management is core
    'TPM': {
      'Program Management': { min: 3, typical: 4 },
      'Project Planning': { min: 2, typical: 3 },
      'Risk Management': { min: 2, typical: 3 },
      'Budget Management': { min: 2, typical: 3 },
      'Stakeholder Management': { min: 3, typical: 4 },
    },
    // Product Managers - Product Thinking is core
    'PM': {
      'Product Thinking': { min: 3, typical: 4 },
      'Product Roadmap Planning': { min: 2, typical: 3 },
      'Market Research': { min: 2, typical: 3 },
      'User Research': { min: 2, typical: 3 },
      'Stakeholder Management': { min: 3, typical: 4 },
    },
    // UX Designers - User Research and UI Design are core
    'UX': {
      'User Research': { min: 3, typical: 4 },
      'UI Design': { min: 3, typical: 4 },
      'Prototyping': { min: 2, typical: 3 },
      'Design Systems': { min: 2, typical: 3 },
      'Usability Testing': { min: 2, typical: 3 },
    },
    // Software Engineers - Python/Programming skills are core
    'SWE': {
      'Python': { min: 2, typical: 3 },
      'Distributed Systems': { min: 2, typical: 3 },
      'Testing & Quality': { min: 2, typical: 3 },
    },
    // Site Reliability Engineers - Observability/SRE is core
    'SRE': {
      'Observability/SRE': { min: 3, typical: 4 },
      'Kubernetes': { min: 2, typical: 3 },
      'Distributed Systems': { min: 2, typical: 3 },
    },
    // Data Engineers - Python and Data Pipelines are core
    'DS': {
      'Python': { min: 3, typical: 4 },
      'Data Pipelines': { min: 3, typical: 4 },
      'SQL': { min: 2, typical: 3 },
    },
    // Security Engineers - Security Engineering is core
    'SEC': {
      'Security Engineering': { min: 3, typical: 4 },
      'Threat Modeling': { min: 2, typical: 3 },
    },
    // Engineering Managers - People Management and Technical Leadership are core
    'EM': {
      'People Management': { min: 3, typical: 4 },
      'Technical Leadership': { min: 2, typical: 3 },
      'Program Management': { min: 2, typical: 3 },
    },
  };

  // Determine role pattern (e.g., 'TPM', 'PM', 'SWE')
  let rolePattern = '';
  if (roleId.startsWith('TPM') || roleName.includes('Technical Program Manager')) {
    rolePattern = 'TPM';
  } else if (roleId.startsWith('PM') || roleName.includes('Product Manager')) {
    rolePattern = 'PM';
  } else if (roleId.startsWith('UX') || roleName.includes('UX Designer')) {
    rolePattern = 'UX';
  } else if (roleId.startsWith('SWE') || roleName.includes('Software Engineer')) {
    rolePattern = 'SWE';
  } else if (roleId.startsWith('SRE') || roleName.includes('Site Reliability Engineer')) {
    rolePattern = 'SRE';
  } else if (roleId.startsWith('DS') || roleName.includes('Data Engineer')) {
    rolePattern = 'DS';
  } else if (roleId.startsWith('SEC') || roleName.includes('Security Engineer')) {
    rolePattern = 'SEC';
  } else if (roleId.startsWith('EM') || roleName.includes('Engineering Manager')) {
    rolePattern = 'EM';
  }

  // Get requirements for this role
  const requirements = roleSkillRequirements[rolePattern];
  if (!requirements) return; // No requirements defined for this role

  // Adjust proficiency based on role level (higher level = higher minimum)
  const roleLevel = getRoleLevel(roleId, roleName);
  const performanceMultiplier = performanceRating === 'Outstanding' ? 1.1 : 
                                performanceRating === 'Exceeds' ? 1.05 :
                                performanceRating === 'Meets' ? 1.0 : 0.95;

  // Normalize each skill
  skills.forEach(skill => {
    // Check if this skill has a requirement (exact match or contains)
    const requirementEntry = Object.entries(requirements).find(([pattern]) => {
      // Exact match
      if (skill.skillName === pattern) return true;
      // Pattern is contained in skill name (e.g., "Program Management" in "Program Management")
      if (skill.skillName.includes(pattern)) return true;
      // Skill name is contained in pattern (less common, but handle it)
      if (pattern.includes(skill.skillName)) return true;
      return false;
    });

    if (requirementEntry) {
      const [, req] = requirementEntry;
      let minProficiency = req.min;
      let typicalProficiency = req.typical;

      // Adjust minimum based on role level
      if (roleLevel === 'senior' || roleLevel === 'principal') {
        minProficiency = Math.max(minProficiency, 3); // Senior roles need at least 3
        typicalProficiency = Math.max(typicalProficiency, 4);
      } else if (roleLevel === 'mid') {
        minProficiency = Math.max(minProficiency, 2); // Mid-level needs at least 2
        typicalProficiency = Math.max(typicalProficiency, 3);
      }

      // Adjust for performance rating (but keep within bounds)
      const adjustedMin = Math.max(1, Math.min(5, Math.round(minProficiency * performanceMultiplier)));
      const adjustedTypical = Math.max(1, Math.min(5, Math.round(typicalProficiency * performanceMultiplier)));

      // If current proficiency is below minimum, adjust it
      if (skill.proficiency < adjustedMin) {
        // Set to minimum with some variance (randomly between min and typical to maintain variance)
        // Use a deterministic seed based on skill name to ensure consistency
        const seed = skill.skillName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const variance = (seed % 3) - 1; // -1, 0, or 1
        skill.proficiency = Math.max(adjustedMin, Math.min(adjustedTypical, adjustedMin + variance));
      } else if (skill.proficiency > adjustedTypical + 1 && skill.proficiency > 4) {
        // Cap at typical + 1 to prevent extreme outliers (unless validated)
        // Allow up to 4 without validation, but 5 requires validation
        if (skill.source === 'Assessment' || skill.source === 'Project Evidence') {
          // Keep high proficiency if validated
          skill.proficiency = Math.min(5, skill.proficiency);
        } else {
          // Cap at typical + 1 if not validated
          skill.proficiency = Math.min(adjustedTypical + 1, skill.proficiency);
        }
      }
      // If proficiency is between min and typical+1, keep it as is (maintains variance)
    }
  });
}

/**
 * Determine role level from role ID and name
 */
function getRoleLevel(roleId: string, roleName: string): 'junior' | 'mid' | 'senior' | 'principal' {
  if (roleId.includes('1') || roleName.includes('I') && !roleName.includes('II') && !roleName.includes('III')) {
    return 'junior';
  } else if (roleId.includes('2') || roleName.includes('II')) {
    return 'mid';
  } else if (roleId.includes('3') || roleName.includes('Senior')) {
    return 'senior';
  } else if (roleId.includes('4') || roleName.includes('Principal')) {
    return 'principal';
  }
  return 'mid'; // Default
}

/**
 * Parse CSV data into structured format
 */
function parseCSV(csv: string): EmployeeProfile[] {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const profiles: EmployeeProfile[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: { [key: string]: string } = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Get location and generate culturally appropriate name
    const employeeLocation = row.location.replace(/^"|"$/g, ''); // Remove quotes
    const culturallyAppropriateName = generateCulturallyAppropriateName(row.employee_id, employeeLocation);

    // Extract employee data
    const employee: Employee = {
      employeeId: row.employee_id,
      employeeName: culturallyAppropriateName, // Use culturally appropriate name
      currentRoleId: row.current_role_id,
      currentRoleName: row.current_role_name,
      jobFamily: row.job_family,
      businessUnit: row.business_unit,
      location: employeeLocation, // Use already cleaned location
      employmentType: row.employment_type,
      hireDate: row.hire_date,
      tenureMonths: parseInt(row.tenure_months, 10),
      managerId: row.manager_id || undefined,
      leadershipFlag: row.leadership_flag as 'Individual Contributor' | 'People Manager',
    };

    // Extract performance metrics
    const performance: PerformanceMetrics = {
      employeeId: row.employee_id,
      performanceRating: row.performance_rating as PerformanceMetrics['performanceRating'],
      engagementScore: parseInt(row.engagement_score, 10),
      flightRiskScore: parseInt(row.flight_risk_score, 10),
    };

    // Extract readiness assessment
    const readiness: ReadinessAssessment = {
      employeeId: row.employee_id,
      readinessScore: parseInt(row.readiness_score_0to100, 10),
      readinessFlag: row.readiness_flag as ReadinessAssessment['readinessFlag'],
      skillGapSeverityIndex: parseInt(row.skill_gap_severity_index, 10),
      overallWorkforceReadinessIndex: parseInt(row.overall_workforce_readiness_index, 10),
      riskLevel: row.risk_level as ReadinessAssessment['riskLevel'],
    };

    // Extract skills (up to 6 skills)
    const skills: Skill[] = [];
    for (let j = 1; j <= 6; j++) {
      const skillId = row[`skill_${j}_id`];
      const skillName = row[`skill_${j}_name`];
      if (skillId && skillName) {
        // Generate demand trend for skill (deterministic based on skill name)
        const trendSeed = skillName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const trendValue = trendSeed % 3;
        const demandTrend: 'increasing' | 'decreasing' | 'flat' = 
          trendValue === 0 ? 'increasing' : trendValue === 1 ? 'decreasing' : 'flat';
        
        skills.push({
          skillId,
          skillName,
          proficiency: parseInt(row[`skill_${j}_proficiency_1to5`], 10),
          source: row[`skill_${j}_source`] as Skill['source'],
          lastValidatedDate: row[`skill_${j}_last_validated_date`],
          demandTrend,
        });
      }
    }

    // Normalize skill proficiencies to ensure role-appropriate levels with variance but no outliers
    normalizeSkillProficiencies(skills, employee.currentRoleId, employee.currentRoleName, performance.performanceRating);

    // Calculate cost data
    const cost = calculateEmployeeCost(
      employee.currentRoleId,
      employee.currentRoleName,
      employee.location,
      performance.performanceRating,
      employee.tenureMonths,
      performance.engagementScore
    );
    cost.employeeId = employee.employeeId;

    // Get automation potential for role
    const roleAutomationPotential = getAutomationPotential(employee.currentRoleId);

    // Generate learning metrics
    const learning = generateLearningMetrics(
      employee.employeeId,
      performance.performanceRating,
      performance.engagementScore,
      skills,
      employee.tenureMonths
    );

    // Generate redeployment readiness
    const redeployment = generateRedeploymentReadiness(
      employee.employeeId,
      skills,
      employee.businessUnit,
      employee.currentRoleId,
      employee.tenureMonths,
      performance.engagementScore
    );

    // Generate leadership metrics
    const leadership = generateLeadershipMetrics(
      employee.employeeId,
      employee.leadershipFlag,
      performance.performanceRating,
      performance.engagementScore,
      employee.tenureMonths,
      skills
    );

    profiles.push({
      employee,
      performance,
      readiness,
      skills,
      cost,
      roleAutomationPotential,
      learning,
      redeployment,
      leadership,
    });
  }

  return profiles;
}

/**
 * Parse CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Parse and store all employee profiles
 */
let parsedProfiles: EmployeeProfile[] = [];
try {
  parsedProfiles = parseCSV(csvData);
  console.log('Parsed employee profiles:', parsedProfiles.length);
  if (parsedProfiles.length !== 117) {
    console.warn(`Expected 117 employees but found ${parsedProfiles.length}. Please verify CSV data.`);
  }
} catch (error) {
  console.error('Error parsing CSV data:', error);
  parsedProfiles = [];
}

export const employeeProfiles: EmployeeProfile[] = parsedProfiles;

// Export count for verification
export const EMPLOYEE_COUNT = parsedProfiles.length;

/**
 * Get all employees
 */
export function getAllEmployees(): Employee[] {
  return employeeProfiles.map(p => p.employee);
}

/**
 * Get employee profile by ID
 */
export function getEmployeeProfile(employeeId: string): EmployeeProfile | undefined {
  return employeeProfiles.find(p => p.employee.employeeId === employeeId);
}

/**
 * Calculate workforce statistics
 */
export function getWorkforceStats(): WorkforceStats {
  const total = employeeProfiles.length;
  const readinessScores = employeeProfiles.map(p => p.readiness.readinessScore);
  const avgReadiness = readinessScores.reduce((a, b) => a + b, 0) / total;

  const readinessDist = {
    ready: employeeProfiles.filter(p => p.readiness.readinessFlag === 'Ready').length,
    nearReady: employeeProfiles.filter(p => p.readiness.readinessFlag === 'Near-ready').length,
    notReady: employeeProfiles.filter(p => p.readiness.readinessFlag === 'Not-ready').length,
  };

  const riskDist = {
    low: employeeProfiles.filter(p => p.readiness.riskLevel === 'Low').length,
    medium: employeeProfiles.filter(p => p.readiness.riskLevel === 'Medium').length,
    high: employeeProfiles.filter(p => p.readiness.riskLevel === 'High').length,
  };

  const engagementScores = employeeProfiles.map(p => p.performance.engagementScore);
  const avgEngagement = engagementScores.reduce((a, b) => a + b, 0) / total;

  const flightRiskScores = employeeProfiles.map(p => p.performance.flightRiskScore);
  const avgFlightRisk = flightRiskScores.reduce((a, b) => a + b, 0) / total;

  const skillGapDist: { [severity: number]: number } = {};
  employeeProfiles.forEach(p => {
    const severity = p.readiness.skillGapSeverityIndex;
    skillGapDist[severity] = (skillGapDist[severity] || 0) + 1;
  });

  return {
    totalEmployees: total,
    averageReadinessScore: Math.round(avgReadiness * 10) / 10,
    readinessDistribution: readinessDist,
    riskDistribution: riskDist,
    averageEngagementScore: Math.round(avgEngagement * 10) / 10,
    averageFlightRiskScore: Math.round(avgFlightRisk * 10) / 10,
    skillGapDistribution: skillGapDist,
  };
}

/**
 * Get department statistics
 */
export function getDepartmentStats(): DepartmentStats[] {
  const deptMap = new Map<string, EmployeeProfile[]>();

  employeeProfiles.forEach(profile => {
    const dept = profile.employee.businessUnit;
    if (!deptMap.has(dept)) {
      deptMap.set(dept, []);
    }
    deptMap.get(dept)!.push(profile);
  });

  return Array.from(deptMap.entries()).map(([department, profiles]) => {
    const readinessScores = profiles.map(p => p.readiness.readinessScore);
    const avgReadiness = readinessScores.reduce((a, b) => a + b, 0) / profiles.length;

    const readinessDist = {
      ready: profiles.filter(p => p.readiness.readinessFlag === 'Ready').length,
      nearReady: profiles.filter(p => p.readiness.readinessFlag === 'Near-ready').length,
      notReady: profiles.filter(p => p.readiness.readinessFlag === 'Not-ready').length,
    };

    // Calculate top skills
    const skillMap = new Map<string, { count: number; totalProficiency: number }>();
    profiles.forEach(profile => {
      profile.skills.forEach(skill => {
        const existing = skillMap.get(skill.skillName) || { count: 0, totalProficiency: 0 };
        skillMap.set(skill.skillName, {
          count: existing.count + 1,
          totalProficiency: existing.totalProficiency + skill.proficiency,
        });
      });
    });

    const topSkills = Array.from(skillMap.entries())
      .map(([skillName, data]) => ({
        skillName,
        employeeCount: data.count,
        averageProficiency: Math.round((data.totalProficiency / data.count) * 10) / 10,
      }))
      .sort((a, b) => b.employeeCount - a.employeeCount)
      .slice(0, 5);

    return {
      department,
      employeeCount: profiles.length,
      averageReadinessScore: Math.round(avgReadiness * 10) / 10,
      readinessDistribution: readinessDist,
      topSkills,
    };
  });
}

/**
 * Get role statistics
 */
export function getRoleStats(): RoleStats[] {
  const roleMap = new Map<string, EmployeeProfile[]>();

  employeeProfiles.forEach(profile => {
    const roleKey = `${profile.employee.currentRoleId}|${profile.employee.currentRoleName}`;
    if (!roleMap.has(roleKey)) {
      roleMap.set(roleKey, []);
    }
    roleMap.get(roleKey)!.push(profile);
  });

  return Array.from(roleMap.entries()).map(([roleKey, profiles]) => {
    const [roleId, roleName] = roleKey.split('|');
    const readinessScores = profiles.map(p => p.readiness.readinessScore);
    const avgReadiness = readinessScores.reduce((a, b) => a + b, 0) / profiles.length;

    const readinessDist = {
      ready: profiles.filter(p => p.readiness.readinessFlag === 'Ready').length,
      nearReady: profiles.filter(p => p.readiness.readinessFlag === 'Near-ready').length,
      notReady: profiles.filter(p => p.readiness.readinessFlag === 'Not-ready').length,
    };

    // Calculate average automation potential for this role
    const avgAutomation = profiles.length > 0
      ? profiles.reduce((sum, p) => sum + p.roleAutomationPotential, 0) / profiles.length
      : getAutomationPotential(roleId);

    return {
      roleId,
      roleName: roleName || profiles[0]?.employee.currentRoleName || roleId,
      employeeCount: profiles.length,
      averageReadinessScore: Math.round(avgReadiness * 10) / 10,
      readinessDistribution: readinessDist,
      automationPotential: Math.round(avgAutomation * 10) / 10,
    };
  });
}

/**
 * Get skill statistics
 */
export function getSkillStats(): SkillStats[] {
  const skillMap = new Map<string, { employees: EmployeeProfile[]; proficiencies: number[]; sources: string[] }>();

  employeeProfiles.forEach(profile => {
    profile.skills.forEach(skill => {
      const existing = skillMap.get(skill.skillId) || { employees: [], proficiencies: [], sources: [] };
      existing.employees.push(profile);
      existing.proficiencies.push(skill.proficiency);
      existing.sources.push(skill.source);
      skillMap.set(skill.skillId, existing);
    });
  });

  return Array.from(skillMap.entries()).map(([skillId, data]) => {
    const skillName = data.employees[0]?.skills.find(s => s.skillId === skillId)?.skillName || skillId;
    const avgProficiency = data.proficiencies.reduce((a, b) => a + b, 0) / data.proficiencies.length;

    const proficiencyDist: { [level: number]: number } = {};
    data.proficiencies.forEach(p => {
      proficiencyDist[p] = (proficiencyDist[p] || 0) + 1;
    });

    const sourceDist: { [source: string]: number } = {};
    data.sources.forEach(s => {
      sourceDist[s] = (sourceDist[s] || 0) + 1;
    });

    return {
      skillId,
      skillName,
      totalEmployees: data.employees.length,
      averageProficiency: Math.round(avgProficiency * 10) / 10,
      proficiencyDistribution: proficiencyDist,
      sourceDistribution: sourceDist,
    };
  });
}

/**
 * Get location statistics
 */
export function getLocationStats(): LocationStats[] {
  const locationMap = new Map<string, EmployeeProfile[]>();

  employeeProfiles.forEach(profile => {
    const location = profile.employee.location;
    if (!locationMap.has(location)) {
      locationMap.set(location, []);
    }
    locationMap.get(location)!.push(profile);
  });

  return Array.from(locationMap.entries()).map(([location, profiles]) => {
    const readinessScores = profiles.map(p => p.readiness.readinessScore);
    const avgReadiness = readinessScores.reduce((a, b) => a + b, 0) / profiles.length;

    const readinessDist = {
      ready: profiles.filter(p => p.readiness.readinessFlag === 'Ready').length,
      nearReady: profiles.filter(p => p.readiness.readinessFlag === 'Near-ready').length,
      notReady: profiles.filter(p => p.readiness.readinessFlag === 'Not-ready').length,
    };

    return {
      location,
      employeeCount: profiles.length,
      averageReadinessScore: Math.round(avgReadiness * 10) / 10,
      readinessDistribution: readinessDist,
    };
  });
}

/**
 * Get all role information with automation potential
 */
export function getAllRoles(): RoleInfo[] {
  const roleMap = new Map<string, { roleId: string; roleName: string }>();

  employeeProfiles.forEach(profile => {
    const key = profile.employee.currentRoleId;
    if (!roleMap.has(key)) {
      roleMap.set(key, {
        roleId: profile.employee.currentRoleId,
        roleName: profile.employee.currentRoleName,
      });
    }
  });

  return Array.from(roleMap.values()).map(role => ({
    roleId: role.roleId,
    roleName: role.roleName,
    automationPotential: getAutomationPotential(role.roleId),
  }));
}

/**
 * Get cost statistics
 */
export function getCostStats(): {
  totalAnnualCost: number;
  averageCostPerEmployee: number;
  costByLocation: { [location: string]: { count: number; totalCost: number; averageCost: number } };
  costByRole: { [roleId: string]: { count: number; totalCost: number; averageCost: number } };
} {
  // Convert all costs to USD before summing (INR costs are divided by 83)
  const totalCost = employeeProfiles.reduce((sum, p) => {
    const costInUSD = p.cost.currency === 'INR' 
      ? p.cost.totalCompensation / 83  // Convert INR to USD (1 USD = 83 INR)
      : p.cost.totalCompensation;
    return sum + costInUSD;
  }, 0);
  const avgCost = totalCost / employeeProfiles.length;

  const costByLocation: { [location: string]: { count: number; totalCost: number; averageCost: number } } = {};
  const costByRole: { [roleId: string]: { count: number; totalCost: number; averageCost: number } } = {};

  employeeProfiles.forEach(profile => {
    const location = profile.employee.location;
    const roleId = profile.employee.currentRoleId;
    // Convert to USD for consistent aggregation
    const costInUSD = profile.cost.currency === 'INR' 
      ? profile.cost.totalCompensation / 83  // Convert INR to USD (1 USD = 83 INR)
      : profile.cost.totalCompensation;

    // Aggregate by location
    if (!costByLocation[location]) {
      costByLocation[location] = { count: 0, totalCost: 0, averageCost: 0 };
    }
    costByLocation[location].count++;
    costByLocation[location].totalCost += costInUSD;

    // Aggregate by role
    if (!costByRole[roleId]) {
      costByRole[roleId] = { count: 0, totalCost: 0, averageCost: 0 };
    }
    costByRole[roleId].count++;
    costByRole[roleId].totalCost += costInUSD;
  });

  // Calculate averages
  Object.keys(costByLocation).forEach(loc => {
    costByLocation[loc].averageCost = Math.round(costByLocation[loc].totalCost / costByLocation[loc].count);
  });

  Object.keys(costByRole).forEach(role => {
    costByRole[role].averageCost = Math.round(costByRole[role].totalCost / costByRole[role].count);
  });

  return {
    totalAnnualCost: Math.round(totalCost),
    averageCostPerEmployee: Math.round(avgCost),
    costByLocation,
    costByRole,
  };
}

/**
 * Filter employees by various criteria
 */
export function filterEmployees(filters: {
  businessUnit?: string;
  location?: string;
  roleId?: string;
  readinessFlag?: string;
  riskLevel?: string;
  minReadinessScore?: number;
  maxReadinessScore?: number;
  minAutomationPotential?: number;
  maxAutomationPotential?: number;
  minCost?: number;
  maxCost?: number;
}): EmployeeProfile[] {
  return employeeProfiles.filter(profile => {
    if (filters.businessUnit && profile.employee.businessUnit !== filters.businessUnit) return false;
    if (filters.location && profile.employee.location !== filters.location) return false;
    if (filters.roleId && profile.employee.currentRoleId !== filters.roleId) return false;
    if (filters.readinessFlag && profile.readiness.readinessFlag !== filters.readinessFlag) return false;
    if (filters.riskLevel && profile.readiness.riskLevel !== filters.riskLevel) return false;
    if (filters.minReadinessScore !== undefined && profile.readiness.readinessScore < filters.minReadinessScore) return false;
    if (filters.maxReadinessScore !== undefined && profile.readiness.readinessScore > filters.maxReadinessScore) return false;
    if (filters.minAutomationPotential !== undefined && profile.roleAutomationPotential < filters.minAutomationPotential) return false;
    if (filters.maxAutomationPotential !== undefined && profile.roleAutomationPotential > filters.maxAutomationPotential) return false;
    if (filters.minCost !== undefined && profile.cost.totalCompensation < filters.minCost) return false;
    if (filters.maxCost !== undefined && profile.cost.totalCompensation > filters.maxCost) return false;
    return true;
  });
}

