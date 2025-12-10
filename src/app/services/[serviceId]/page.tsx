'use client';

import React, { useState } from 'react';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import ContactFormModal from '../../components/ContactFormModal';
import './serviceDetail.css';

interface ServiceDetailData {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  overview: string;
  whyImportant: {
    title: string;
    description: string;
    points: string[];
  };
  process: {
    title: string;
    steps: Array<{
      number: number;
      title: string;
      description: string;
    }>;
  };
  requirements: {
    title: string;
    items: string[];
  };
  benefits: {
    title: string;
    items: string[];
  };
  challenges?: {
    title: string;
    items: string[];
  };
  timeline?: string;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

const servicesData: Record<string, ServiceDetailData> = {
  'civil-defense': {
    id: 'civil-defense',
    title: 'Civil Defense Approval',
    subtitle: 'Ensuring Fire Safety and Emergency Compliance for Your Property',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="service-detail-icon-svg">
        <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    overview: 'Civil Defense approval is a mandatory requirement for all construction projects in Dubai, ensuring that your property meets the highest fire safety and emergency preparedness standards. Our expert consultants streamline the approval process with Dubai Civil Defense, helping you obtain necessary permits and NOCs efficiently.',
    whyImportant: {
      title: 'Why Civil Defense Approval is Critical',
      description: 'Civil Defense approval is not just a regulatory requirement—it\'s essential for protecting lives and property.',
      points: [
        'Ensures compliance with Dubai fire safety regulations and building codes',
        'Protects occupants through proper fire detection, suppression, and evacuation systems',
        'Prevents costly project delays, legal penalties, and operational shutdowns',
        'Enhances property value and marketability with proper safety certifications',
        'Required before obtaining final occupancy permits and utility connections',
        'Demonstrates commitment to public safety and corporate responsibility'
      ]
    },
    process: {
      title: 'Our Streamlined Approval Process',
      steps: [
        {
          number: 1,
          title: 'Initial Consultation & Assessment',
          description: 'We review your project plans, identify fire safety requirements, and create a customized compliance roadmap based on building type and occupancy.'
        },
        {
          number: 2,
          title: 'Documentation Preparation',
          description: 'Our team compiles all required documents including architectural plans, fire safety drawings, equipment specifications, and compliance certificates.'
        },
        {
          number: 3,
          title: 'Application Submission',
          description: 'We submit your complete application package to Dubai Civil Defense through their electronic portal, ensuring accuracy and completeness.'
        },
        {
          number: 4,
          title: 'Technical Review & Coordination',
          description: 'Civil Defense engineers review your submission. We coordinate with authorities to address any queries or modification requests promptly.'
        },
        {
          number: 5,
          title: 'Site Inspection Support',
          description: 'We schedule and facilitate on-site inspections, ensuring all fire safety systems are properly installed and operational before inspection.'
        },
        {
          number: 6,
          title: 'Final Approval & NOC Issuance',
          description: 'Upon successful inspection, you receive your Civil Defense NOC and final approval certificate, clearing the path for occupancy.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Approved architectural and structural drawings',
        'Fire safety system layouts (detection, alarm, suppression)',
        'Mechanical, electrical, and plumbing (MEP) drawings',
        'Fire fighting equipment specifications and certifications',
        'Emergency evacuation plans and exit layouts',
        'Material compliance certificates (fire-rated doors, walls, etc.)',
        'Dubai Municipality building permit',
        'Property ownership documents or authorization letter',
        'Contractor and consultant licenses',
        'Test certificates for installed fire safety systems'
      ]
    },
    benefits: {
      title: 'Benefits of Professional Civil Defense Support',
      items: [
        'Faster approval timelines through expert handling',
        'Reduced risk of application rejection or delays',
        'Expert guidance on fire safety code compliance',
        'Coordination with contractors and system suppliers',
        'Ongoing support during inspections and rectifications',
        'Comprehensive documentation management',
        'Peace of mind with certified safety compliance',
        'Access to established relationships with authorities'
      ]
    },
    challenges: {
      title: 'Common Challenges We Help You Avoid',
      items: [
        'Incomplete or incorrect documentation submissions',
        'Non-compliant fire safety system specifications',
        'Delays due to failed initial inspections',
        'Communication gaps with Civil Defense authorities',
        'Missing or expired equipment certifications',
        'Inadequate emergency evacuation planning'
      ]
    },
    timeline: 'Typical approval timeline: 2-4 weeks for standard projects, depending on building complexity and documentation readiness.',
    faqs: [
      {
        question: 'What types of buildings require Civil Defense approval?',
        answer: 'All commercial buildings, residential complexes, industrial facilities, warehouses, retail spaces, hotels, and any structure accessible to the public require Civil Defense approval before occupancy.'
      },
      {
        question: 'How long does the Civil Defense approval process take?',
        answer: 'Standard projects typically take 2-4 weeks from submission to approval. Complex projects or those requiring system modifications may take longer. Our expert handling helps minimize delays.'
      },
      {
        question: 'What happens if my project fails the Civil Defense inspection?',
        answer: 'We identify deficiencies, coordinate with your contractors to rectify issues, and arrange for re-inspection. Our proactive approach minimizes the likelihood of failed inspections.'
      },
      {
        question: 'Do I need separate Civil Defense approval for renovations?',
        answer: 'Yes, any renovation affecting fire safety systems, emergency exits, or building structure requires updated Civil Defense approval and NOC.'
      }
    ]
  },
  'dewa': {
    id: 'dewa',
    title: 'DEWA Approval Service',
    subtitle: 'Streamlined Electricity and Water Connection Approvals',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="service-detail-icon-svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    overview: 'DEWA (Dubai Electricity and Water Authority) approval is essential for connecting your property to Dubai\'s electricity and water networks. We provide comprehensive support in obtaining DEWA approvals, ensuring your project meets all technical, safety, and environmental standards for utility connections.',
    whyImportant: {
      title: 'Why DEWA Approval Matters',
      description: 'DEWA approval is mandatory for all properties requiring utility connections in Dubai.',
      points: [
        'Ensures safe and compliant electrical and water installations',
        'Required before property occupancy and handover',
        'Prevents utility connection delays and project setbacks',
        'Demonstrates adherence to sustainability and efficiency standards',
        'Protects against electrical hazards and water system failures',
        'Facilitates smooth property registration and transfer'
      ]
    },
    process: {
      title: 'DEWA Approval Process',
      steps: [
        {
          number: 1,
          title: 'Application Preparation',
          description: 'Submit completed DEWA application form with property details, ownership documents, and technical specifications for electrical and water requirements.'
        },
        {
          number: 2,
          title: 'Documentation Submission',
          description: 'Provide title deed copy, passport copy, detailed architectural plans showing electrical and plumbing layouts, and project load calculations.'
        },
        {
          number: 3,
          title: 'Technical Review',
          description: 'DEWA engineers evaluate your submission for compliance with electrical safety standards, load capacity, and water supply specifications.'
        },
        {
          number: 4,
          title: 'Site Inspection',
          description: 'DEWA conducts on-site inspections to verify proper installation of electrical panels, metering equipment, and water connection points.'
        },
        {
          number: 5,
          title: 'Approval & Connection',
          description: 'Upon successful inspection, DEWA issues approval certificate and schedules utility connection activation.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Completed DEWA application form',
        'Property title deed copy',
        'Owner or authorized representative passport copy',
        'Detailed architectural plans with electrical layouts',
        'Plumbing and water supply system drawings',
        'Electrical load calculation reports',
        'MEP contractor license and approvals',
        'Building permit from Dubai Municipality',
        'Swimming pool, landscaping, or auxiliary facility permits (if applicable)'
      ]
    },
    benefits: {
      title: 'Benefits of Professional DEWA Support',
      items: [
        'Expert handling of complex application requirements',
        'Reduced processing time through accurate submissions',
        'Guidance on load calculations and technical specifications',
        'Coordination between contractors and DEWA authorities',
        'Prevention of costly resubmissions due to errors',
        'Real-time tracking of application status',
        'Comprehensive compliance verification'
      ]
    },
    challenges: {
      title: 'Common Challenges We Resolve',
      items: [
        'Documentation errors and inaccuracies',
        'Misunderstanding of electrical load requirements',
        'Communication delays with DEWA officials',
        'Incomplete technical drawings',
        'Non-compliant equipment specifications',
        'Processing timeline uncertainties'
      ]
    },
    timeline: 'Standard DEWA approval: 1-3 weeks depending on project complexity and documentation completeness.',
    faqs: [
      {
        question: 'What types of DEWA approvals are available?',
        answer: 'DEWA provides Electric Supply Approval for grid connections, Water Supply Approval for municipal water access, and additional permits for pools, landscaping, and temporary constructions.'
      },
      {
        question: 'How much does DEWA approval cost?',
        answer: 'Costs vary based on property type and consumption requirements, typically ranging from hundreds to thousands of dirhams. We recommend budgeting 10-15% above estimated costs for contingencies.'
      },
      {
        question: 'Can I track my DEWA application online?',
        answer: 'Yes, DEWA offers online tracking through their portal. We provide comprehensive tracking support and updates throughout the process.'
      },
      {
        question: 'What happens if my DEWA application is rejected?',
        answer: 'We identify the rejection reasons, rectify documentation or technical issues, and resubmit promptly to minimize delays.'
      }
    ]
  },
  'dubai-municipality': {
    id: 'dubai-municipality',
    title: 'Dubai Municipality Approval',
    subtitle: 'Comprehensive Building Permit and Compliance Services',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="service-detail-icon-svg">
        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    overview: 'Dubai Municipality approval is the cornerstone of any construction project in Dubai. From residential villas to commercial complexes, every development requires comprehensive approval from Dubai Municipality to ensure compliance with building codes, safety standards, and urban planning regulations.',
    whyImportant: {
      title: 'Why Dubai Municipality Approval is Essential',
      description: 'Dubai Municipality serves as the primary regulatory authority for construction in Dubai.',
      points: [
        'Mandatory for all residential, commercial, and infrastructural developments',
        'Ensures compliance with Dubai building codes and safety regulations',
        'Required before commencing any construction or renovation work',
        'Validates architectural, structural, and MEP design compliance',
        'Protects against legal penalties and construction halts',
        'Enables subsequent approvals from other authorities (Civil Defense, DEWA)',
        'Essential for property registration and transfer'
      ]
    },
    process: {
      title: 'Municipality Approval Process',
      steps: [
        {
          number: 1,
          title: 'Initial Submission',
          description: 'Prepare detailed application with site plans, architectural drawings, and compliance documentation meeting Dubai Municipality standards.'
        },
        {
          number: 2,
          title: 'Technical Assessment',
          description: 'Municipality evaluates submissions for adherence to zoning regulations, building codes, setback requirements, and height restrictions.'
        },
        {
          number: 3,
          title: 'Multi-Department Review',
          description: 'Various departments (Building, Planning, Health, Environment) review different aspects of your project for comprehensive compliance.'
        },
        {
          number: 4,
          title: 'Modifications & Clarifications',
          description: 'Address any requested changes, provide additional information, and resubmit revised drawings as needed.'
        },
        {
          number: 5,
          title: 'Preliminary Approval',
          description: 'Receive preliminary approval notification authorizing project commencement with specified conditions.'
        },
        {
          number: 6,
          title: 'Final Building Permit',
          description: 'Upon meeting all conditions, obtain final building permit allowing construction to proceed legally.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Completed application forms with project details',
        'Architectural plans complying with local building codes',
        'Structural engineering reports and calculations',
        'MEP (mechanical, electrical, plumbing) system drawings',
        'Site plans showing property boundaries and setbacks',
        'Property ownership proof or authorization letter',
        'Environmental impact assessments (for applicable projects)',
        'Parking calculations and traffic impact studies',
        'Landscape plans and elevation drawings',
        'Material specifications and quality certificates'
      ]
    },
    benefits: {
      title: 'Professional Support Benefits',
      items: [
        'Expert guidance on complex building code requirements',
        'Reduced approval timelines through accurate submissions',
        'Coordination with architects, engineers, and consultants',
        'Proactive identification of compliance issues',
        'Comprehensive documentation management',
        'Regular status updates and authority communication',
        'Higher first-submission approval rates',
        'Ongoing support through construction phase inspections'
      ]
    },
    challenges: {
      title: 'Common Challenges We Navigate',
      items: [
        'Extended processing timelines due to municipal backlog',
        'Incomplete documentation leading to rejections',
        'Non-compliance with updated building codes',
        'Multi-department coordination complexities',
        'Heritage preservation requirements in historic areas',
        'Sustainable building practice compliance'
      ]
    },
    timeline: 'Standard approval: 3-8 weeks for residential projects, 6-12 weeks for commercial developments, depending on project complexity.',
    faqs: [
      {
        question: 'What types of projects require Dubai Municipality approval?',
        answer: 'All construction projects including new buildings, renovations, extensions, demolitions, and alterations to existing structures require Municipality approval before commencing work.'
      },
      {
        question: 'How long does the approval process take?',
        answer: 'Timelines vary: residential projects typically take 3-8 weeks, while commercial developments may require 6-12 weeks or longer depending on complexity and documentation completeness.'
      },
      {
        question: 'Can I start construction while awaiting approval?',
        answer: 'No, starting construction without approved permits violates regulations and can result in project halts, fines, and legal complications.'
      },
      {
        question: 'What are the recent regulatory updates?',
        answer: 'Dubai Municipality has implemented electronic approval systems, mandatory sustainable building practices, energy efficiency standards, and stricter heritage preservation requirements for historically significant areas.'
      }
    ]
  },
  'emaar': {
    id: 'emaar',
    title: 'Emaar Approval Authority',
    subtitle: 'Community NOC and Development Permits for Emaar Properties',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="service-detail-icon-svg">
        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    overview: 'Emaar Properties, developer of iconic landmarks like Burj Khalifa and Dubai Mall, has specific approval requirements for all development projects within its master-planned communities. Our specialized service ensures your project meets Emaar\'s stringent standards while navigating the community NOC and permit processes efficiently.',
    whyImportant: {
      title: 'Why Emaar Approval is Crucial',
      description: 'Emaar approval ensures your development aligns with community standards and regulatory requirements.',
      points: [
        'Mandatory for all construction within Emaar-managed communities',
        'Ensures compliance with Emaar design guidelines and aesthetic standards',
        'Validates adherence to Dubai safety and environmental regulations',
        'Prevents project halts, dismantling, or substantial financial losses',
        'Enhances project marketability and investor confidence',
        'Facilitates access to favorable financing terms',
        'Required before obtaining subsequent authority approvals'
      ]
    },
    process: {
      title: 'Emaar Approval Process',
      steps: [
        {
          number: 1,
          title: 'Application Submission',
          description: 'Submit detailed project application with comprehensive documentation including architectural plans, site layouts, and design specifications.'
        },
        {
          number: 2,
          title: 'Preliminary Assessment',
          description: 'Emaar conducts initial review (10-15 business days) evaluating regulatory compliance and design guideline adherence.'
        },
        {
          number: 3,
          title: 'Detailed Technical Review',
          description: 'Multi-week evaluation covering design aesthetics, safety standards, environmental impact, and community integration.'
        },
        {
          number: 4,
          title: 'Modifications & Resubmission',
          description: 'Address any requested design changes, provide additional documentation, and resubmit for final evaluation.'
        },
        {
          number: 5,
          title: 'Final Approval & NOC',
          description: 'Receive formal approval letter with conditions, authorizing project commencement within Emaar community.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Completed Emaar application forms',
        'Architectural plans and site layouts',
        'Environmental impact assessments',
        'Structural engineering reports',
        'MEP (mechanical, electrical, plumbing) system drawings',
        'Utility provider confirmations (DEWA, Empower, etc.)',
        'Project timelines and construction method statements',
        'Trade licenses and business registration documents',
        'Zoning approvals and land use certificates',
        'Material specifications and quality certifications'
      ]
    },
    benefits: {
      title: 'Professional Service Benefits',
      items: [
        'Expert knowledge of Emaar-specific requirements',
        'Streamlined application process with higher approval rates',
        'Coordination between Emaar, contractors, and consultants',
        'Proactive resolution of compliance issues',
        'Time savings through established authority relationships',
        'Real-time application tracking and status updates',
        'Comprehensive documentation management',
        'Ongoing support through construction phase'
      ]
    },
    challenges: {
      title: 'Common Challenges We Resolve',
      items: [
        'Incomplete documentation submissions',
        'Misunderstanding Emaar design guidelines',
        'Communication delays with approval authorities',
        'Complexity of multilayered compliance standards',
        'Coordination between multiple stakeholders',
        'Timeline management and deadline pressures'
      ]
    },
    timeline: 'Preliminary assessment: 10-15 business days. Complete approval: 4-8 weeks depending on project complexity.',
    faqs: [
      {
        question: 'Which communities require Emaar approval?',
        answer: 'All Emaar-developed communities including Downtown Dubai, Dubai Marina, Arabian Ranches, Emirates Living, and others require Emaar approval for any construction or renovation work.'
      },
      {
        question: 'How does Emaar approval differ from Dubai Municipality approval?',
        answer: 'Emaar approval is specific to developments within Emaar communities and focuses on design guidelines and community standards. Dubai Municipality approval is mandatory for all projects citywide and covers broader building code compliance.'
      },
      {
        question: 'Can I expedite the Emaar approval process?',
        answer: 'While standard timelines apply, professional handling ensures accurate submissions, minimizing delays from rejections or modification requests.'
      },
      {
        question: 'What happens if my project doesn\'t meet Emaar standards?',
        answer: 'We work with your design team to modify plans to meet Emaar requirements before resubmission, avoiding costly redesigns during construction.'
      }
    ]
  },
  'nakheel': {
    id: 'nakheel',
    title: 'Nakheel Approval',
    subtitle: 'Development Permits and NOCs for Nakheel Communities',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="service-detail-icon-svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    overview: 'Nakheel, established in 2000, is a major real estate developer responsible for iconic projects like Palm Jumeirah and Dubai Islands. All development projects on Nakheel-managed land require specific approvals to ensure compliance with community standards and regulatory requirements.',
    whyImportant: {
      title: 'Why Nakheel Approval is Essential',
      description: 'Nakheel approval safeguards your investment and ensures project success within their prestigious communities.',
      points: [
        'Mandatory for all construction on Nakheel-developed land',
        'Ensures compliance with Nakheel design and quality standards',
        'Minimizes risks of project delays and legal complications',
        'Enhances project visibility among investors and stakeholders',
        'Increases credibility with authorities and contractors',
        'Required before obtaining other authority approvals',
        'Facilitates faster access to additional permits and licenses'
      ]
    },
    process: {
      title: 'Nakheel Approval Process',
      steps: [
        {
          number: 1,
          title: 'Initial Consultation',
          description: 'Stakeholders learn about Nakheel regulations and project-specific requirements through comprehensive briefing sessions.'
        },
        {
          number: 2,
          title: 'Plan Preparation',
          description: 'Architects and engineers design projects adhering to Nakheel standards, including aesthetic guidelines and technical specifications.'
        },
        {
          number: 3,
          title: 'Documentation Submission',
          description: 'Submit comprehensive plans and supporting documents to Nakheel for technical and compliance review.'
        },
        {
          number: 4,
          title: 'Technical Review',
          description: 'Nakheel evaluates submissions for compliance with community standards, safety regulations, and environmental requirements.'
        },
        {
          number: 5,
          title: 'Approval or Feedback',
          description: 'Projects either receive approval or require amendments based on Nakheel feedback and guidelines.'
        },
        {
          number: 6,
          title: 'Construction Commencement',
          description: 'Upon approval, developers proceed with obtaining building permits and commencing construction activities.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Detailed design plans including site layouts and architectural designs',
        'Engineering schematics (structural, MEP systems)',
        'Environmental Impact Assessment (EIA)',
        'Compliance certifications from Dubai Municipality',
        'Property ownership proof or authorization letter',
        'No-objection certificates from relevant authorities',
        'Material specifications and quality certificates',
        'Contractor and consultant licenses',
        'Project timeline and construction methodology',
        'Community integration plans'
      ]
    },
    benefits: {
      title: 'Professional Support Benefits',
      items: [
        'Expert interpretation of Nakheel requirements',
        'Higher first-submission approval rates',
        'Established connections with Nakheel authorities',
        'Proactive identification of compliance issues',
        'Comprehensive documentation management',
        'Time and cost savings through efficient processing',
        'Ongoing support throughout construction phase',
        'Enhanced project credibility and marketability'
      ]
    },
    challenges: {
      title: 'Common Challenges We Navigate',
      items: [
        'Incorrect or incomplete documentation submissions',
        'Misunderstanding Nakheel-specific guidelines',
        'Administrative backlogs and processing delays',
        'Coordination complexities between multiple stakeholders',
        'Design modifications to meet community standards',
        'Timeline management pressures'
      ]
    },
    timeline: 'Standard approval: 3-6 weeks depending on project complexity and documentation completeness.',
    faqs: [
      {
        question: 'Which areas require Nakheel approval?',
        answer: 'All Nakheel-developed communities including Palm Jumeirah, The World Islands, Jumeirah Park, International City, and other Nakheel master-planned developments require Nakheel approval.'
      },
      {
        question: 'Do renovations require Nakheel approval?',
        answer: 'Yes, any renovation, extension, or alteration to existing structures within Nakheel communities requires updated approval to ensure continued compliance.'
      },
      {
        question: 'How does Nakheel approval interact with other approvals?',
        answer: 'Nakheel approval is typically required before obtaining Dubai Municipality and other authority approvals. We coordinate the entire approval sequence for seamless processing.'
      }
    ]
  },
  'food-control': {
    id: 'food-control',
    title: 'Food Control Department Approval',
    subtitle: 'Restaurant and Food Establishment Licensing & Compliance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="service-detail-icon-svg">
        <path d="M18 8H19C20.1046 8 21 8.89543 21 10V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V10C3 8.89543 3.89543 8 5 8H6" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 12L12 14L16 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 8V6C8 4.93913 8.42143 3.92172 9.17157 3.17157C9.92172 2.42143 10.9391 2 12 2C13.0609 2 14.0783 2.42143 14.8284 3.17157C15.5786 3.92172 16 4.93913 16 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    overview: 'The Food Control Department operates under the Ministry of Climate Change and Environment to oversee food safety and quality standards in Dubai. Our comprehensive support ensures your food establishment meets all health, safety, and regulatory requirements for successful operation.',
    whyImportant: {
      title: 'Why Food Control Approval is Critical',
      description: 'Food Control approval demonstrates your commitment to food safety and public health.',
      points: [
        'Mandatory for all food-related businesses in Dubai',
        'Ensures compliance with health and safety standards',
        'Protects public health and consumer confidence',
        'Prevents fines, closures, and reputational damage',
        'Required for trade license and business operation',
        'Demonstrates commitment to quality and safety',
        'Essential for insurance and financing approvals'
      ]
    },
    process: {
      title: 'Food Control Approval Process',
      steps: [
        {
          number: 1,
          title: 'Documentation Preparation',
          description: 'Compile application forms, trade licenses, ownership proof, and food safety certificates required for submission.'
        },
        {
          number: 2,
          title: 'Online Submission',
          description: 'File complete application through Food Control Department online portal with all required documentation and fees.'
        },
        {
          number: 3,
          title: 'Initial Review',
          description: 'FCD reviews documentation for completeness and compliance with food safety regulations and operational standards.'
        },
        {
          number: 4,
          title: 'Premises Inspection',
          description: 'FCD inspectors conduct on-site evaluation of facilities, equipment, sanitation practices, and operational procedures.'
        },
        {
          number: 5,
          title: 'Compliance Verification',
          description: 'Address any deficiencies identified during inspection and arrange for re-inspection if necessary.'
        },
        {
          number: 6,
          title: 'Approval & Licensing',
          description: 'Upon successful inspection, receive FCD approval certificate and food establishment license.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Completed Food Control application forms',
        'Valid trade license for food business',
        'Property ownership documents or tenancy contract',
        'Food safety management system certification (HACCP)',
        'Employee health certificates and food handler permits',
        'Equipment specifications and maintenance records',
        'Water quality test reports',
        'Waste disposal agreements',
        'Detailed floor plans showing kitchen and storage areas',
        'Food supplier registration and approval documents',
        'Pest control service agreements'
      ]
    },
    benefits: {
      title: 'Professional Service Benefits',
      items: [
        'Expert guidance on complex food safety regulations',
        'Reduced approval timelines through accurate submissions',
        'Preparation support for successful inspections',
        'Staff training on food safety protocols',
        'Ongoing compliance monitoring and support',
        'Higher first-inspection pass rates',
        'Comprehensive documentation management',
        'Cost savings through efficient processing'
      ]
    },
    challenges: {
      title: 'Common Challenges We Resolve',
      items: [
        'Complex and evolving regulatory requirements',
        'Incomplete documentation causing resubmissions',
        'Facility preparation for inspection standards',
        'Staff training and certification requirements',
        'Pest control and sanitation compliance',
        'Equipment and facility upgrade needs'
      ]
    },
    timeline: 'Standard approval: 2-6 weeks depending on establishment type, size, and compliance readiness.',
    faqs: [
      {
        question: 'What types of establishments need Food Control approval?',
        answer: 'All food-related businesses including restaurants, cafés, food trucks, catering services, grocery stores, bakeries, and food manufacturing facilities require Food Control Department approval.'
      },
      {
        question: 'How often do I need to renew Food Control approval?',
        answer: 'Food establishment licenses typically require annual renewal. Regular inspections may be conducted to ensure ongoing compliance with food safety standards.'
      },
      {
        question: 'What happens if my establishment fails inspection?',
        answer: 'We identify deficiencies, guide you through necessary improvements, and coordinate re-inspection to achieve compliance efficiently.'
      },
      {
        question: 'Do staff need special certifications?',
        answer: 'Yes, all food handlers require valid health certificates and food safety training certifications. We facilitate staff certification processes.'
      }
    ]
  },
  'jafza': {
    id: 'jafza',
    title: 'JAFZA Approval',
    subtitle: 'Jebel Ali Free Zone Building and Operational Approvals',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="service-detail-icon-svg">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
        <path d="M9 21V9" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    overview: 'Jebel Ali Free Zone Authority (JAFZA), established in 1985, is the UAE\'s first and largest free zone. Our specialized service helps businesses navigate JAFZA approval requirements, leveraging the zone\'s strategic advantages including 100% foreign ownership, tax exemptions, and world-class infrastructure.',
    whyImportant: {
      title: 'Why JAFZA Approval is Valuable',
      description: 'JAFZA approval unlocks significant business advantages in Dubai\'s premier free zone.',
      points: [
        '100% foreign ownership without local partnership requirements',
        'Complete profit and capital repatriation rights',
        'Corporate tax exemptions and customs duty benefits',
        'Simplified import/export procedures',
        'Access to world-class infrastructure and logistics facilities',
        'Strategic location near Jebel Ali Port',
        'Streamlined business setup and licensing processes'
      ]
    },
    process: {
      title: 'JAFZA Approval Process',
      steps: [
        {
          number: 1,
          title: 'Business Activity Selection',
          description: 'Determine appropriate business activities and company structure aligned with JAFZA regulations and your operational requirements.'
        },
        {
          number: 2,
          title: 'Documentation Preparation',
          description: 'Compile application forms, company documents, financial records, shareholder/manager identification, and industry-specific certifications.'
        },
        {
          number: 3,
          title: 'Application Submission',
          description: 'Submit complete application package through JAFZA portal with all required documentation and initial fees.'
        },
        {
          number: 4,
          title: 'Technical Evaluation',
          description: 'JAFZA officials assess application for alignment with free zone objectives, regulatory compliance, and operational viability.'
        },
        {
          number: 5,
          title: 'Facility Allocation',
          description: 'Upon preliminary approval, select and secure office, warehouse, or industrial facility within JAFZA.'
        },
        {
          number: 6,
          title: 'Final Approval & Licensing',
          description: 'Receive final approval and company license, enabling business operations within Jebel Ali Free Zone.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Completed JAFZA application form with business details',
        'Company Memorandum and Articles of Association',
        'Bank statements and financial records',
        'Audited financial statements or business forecasts',
        'Shareholder and manager passports and residency visas',
        'Proof of registered office within JAFZA',
        'Business plan detailing operations and objectives',
        'Industry-specific licenses and certifications',
        'Trade references and company profile',
        'Health, safety, and environmental compliance documentation'
      ]
    },
    benefits: {
      title: 'JAFZA Business Advantages',
      items: [
        'Zero personal income tax and corporate tax',
        'No restrictions on currency or profit repatriation',
        'Exemption from import and export duties',
        'Simplified business setup and registration',
        'Access to skilled workforce from across the region',
        'State-of-the-art infrastructure and facilities',
        'Proximity to Jebel Ali Port and Al Maktoum Airport',
        'Professional support and business services'
      ]
    },
    challenges: {
      title: 'Common Application Challenges',
      items: [
        'Incomplete or inaccurate documentation',
        'Inadequate understanding of industry regulations',
        'Compliance issues with operational standards',
        'Health, safety, and environmental requirement gaps',
        'Business activity classification uncertainties',
        'Financial documentation requirements'
      ]
    },
    timeline: 'Standard approval: 1-3 weeks for complete applications. Complex applications may require additional processing time.',
    faqs: [
      {
        question: 'What types of businesses can operate in JAFZA?',
        answer: 'JAFZA accommodates diverse industries including trading, logistics, manufacturing, services, and e-commerce. Specific business activities must align with free zone regulations.'
      },
      {
        question: 'Can I own 100% of my company in JAFZA?',
        answer: 'Yes, JAFZA allows 100% foreign ownership without requiring a local sponsor or partner, providing complete business control.'
      },
      {
        question: 'What are the tax benefits in JAFZA?',
        answer: 'JAFZA companies enjoy zero corporate tax, zero personal income tax, no import/export duties, and complete profit repatriation without restrictions.'
      },
      {
        question: 'How do I expedite my JAFZA approval?',
        answer: 'Professional handling ensures complete, accurate documentation and proactive communication with authorities, significantly reducing approval timelines.'
      }
    ]
  },
  'dha': {
    id: 'dha',
    title: 'DHA Approval',
    subtitle: 'Dubai Health Authority Healthcare Facility Licensing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="service-detail-icon-svg">
        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    overview: 'Dubai Health Authority (DHA) approval is mandatory for all healthcare facilities in Dubai. We provide comprehensive support in obtaining DHA licenses for clinics, hospitals, pharmacies, medical centers, and wellness facilities, ensuring full compliance with Dubai healthcare regulations.',
    whyImportant: {
      title: 'Why DHA Approval is Essential',
      description: 'DHA approval ensures your healthcare facility meets the highest standards of medical care and patient safety.',
      points: [
        'Mandatory for all healthcare facilities in Dubai',
        'Ensures compliance with Dubai healthcare standards',
        'Validates medical staff qualifications and credentials',
        'Protects patient safety and quality of care',
        'Required for insurance provider network participation',
        'Prevents legal penalties and facility closures',
        'Enhances facility credibility and patient confidence'
      ]
    },
    process: {
      title: 'DHA Approval Process',
      steps: [
        {
          number: 1,
          title: 'Facility Planning',
          description: 'Determine healthcare services, facility requirements, equipment specifications, and staffing needs aligned with DHA standards.'
        },
        {
          number: 2,
          title: 'Documentation Compilation',
          description: 'Prepare comprehensive application including facility plans, equipment lists, staff credentials, and operational protocols.'
        },
        {
          number: 3,
          title: 'Application Submission',
          description: 'Submit complete application through DHA portal with all required documentation and initial licensing fees.'
        },
        {
          number: 4,
          title: 'Technical Review',
          description: 'DHA evaluates facility design, equipment specifications, staff qualifications, and compliance with healthcare standards.'
        },
        {
          number: 5,
          title: 'Facility Inspection',
          description: 'DHA inspectors conduct on-site evaluation of premises, equipment, safety systems, and operational readiness.'
        },
        {
          number: 6,
          title: 'License Issuance',
          description: 'Upon successful inspection and compliance verification, receive DHA healthcare facility license.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Completed DHA application forms',
        'Facility architectural plans and layouts',
        'Medical equipment specifications and certifications',
        'Staff qualification certificates and DHA professional licenses',
        'Infection control and safety protocols',
        'Medical waste disposal agreements',
        'Trade license and property documents',
        'Quality management system documentation',
        'Emergency response and evacuation plans',
        'Patient privacy and data protection policies',
        'Medical liability insurance certificates'
      ]
    },
    benefits: {
      title: 'Professional Support Benefits',
      items: [
        'Expert guidance on DHA healthcare regulations',
        'Staff licensing and credential verification support',
        'Facility design compliance consultation',
        'Equipment procurement and certification assistance',
        'Inspection preparation and readiness support',
        'Ongoing compliance monitoring',
        'Insurance network enrollment facilitation',
        'Comprehensive documentation management'
      ]
    },
    challenges: {
      title: 'Common Challenges We Navigate',
      items: [
        'Complex healthcare regulatory requirements',
        'Staff licensing and credential verification',
        'Facility design and equipment compliance',
        'Infection control protocol implementation',
        'Medical waste management compliance',
        'Quality assurance system development',
        'Insurance and accreditation requirements'
      ]
    },
    timeline: 'Standard approval: 6-12 weeks for new facilities. Timeline varies based on facility type, size, and services offered.',
    faqs: [
      {
        question: 'What types of facilities require DHA approval?',
        answer: 'All healthcare facilities including hospitals, clinics, medical centers, dental clinics, physiotherapy centers, pharmacies, laboratories, and wellness facilities require DHA licensing.'
      },
      {
        question: 'Do medical staff need individual DHA licenses?',
        answer: 'Yes, all healthcare practitioners including doctors, nurses, therapists, and technicians must obtain individual professional licenses from DHA before practicing.'
      },
      {
        question: 'How long does DHA facility licensing take?',
        answer: 'New facility approvals typically take 6-12 weeks from application to license issuance, depending on facility complexity and documentation completeness.'
      },
      {
        question: 'What are DHA inspection requirements?',
        answer: 'DHA inspects facility infrastructure, medical equipment, safety systems, staff credentials, operational protocols, and overall readiness to provide quality healthcare services.'
      }
    ]
  },
  'dso': {
    id: 'dso',
    title: 'DSO Approval',
    subtitle: 'Dubai Silicon Oasis Technology Park Licensing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="service-detail-icon-svg">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 21H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    overview: 'Dubai Silicon Oasis (DSO), established in 2004, is a technology park and free zone designed to support innovation-driven businesses. Our specialized service helps technology startups, SMEs, and corporations navigate DSO approval requirements for establishing operations within this premier tech hub.',
    whyImportant: {
      title: 'Why DSO Approval is Strategic',
      description: 'DSO approval provides formal recognition and access to Dubai\'s leading technology ecosystem.',
      points: [
        'Enhances credibility with clients, investors, and partners',
        'Access to state-of-the-art infrastructure and resources',
        'Streamlined administration reducing bureaucratic hurdles',
        'Compliance assurance with regulatory standards',
        'Integration into vibrant tech and innovation community',
        '100% foreign ownership opportunities',
        'Tax benefits and business incentives'
      ]
    },
    process: {
      title: 'DSO Approval Process',
      steps: [
        {
          number: 1,
          title: 'Business Planning',
          description: 'Define business activities, facility requirements, and operational structure aligned with DSO technology park objectives.'
        },
        {
          number: 2,
          title: 'Documentation Preparation',
          description: 'Compile business plan, property agreements, ownership documents, licenses, and compliance certifications.'
        },
        {
          number: 3,
          title: 'Portal Submission',
          description: 'Submit complete application through DSO Authority online portal with all required documentation and fees.'
        },
        {
          number: 4,
          title: 'Compliance Review',
          description: 'DSO evaluates application for adherence to local regulations, infrastructure requirements, and operational viability.'
        },
        {
          number: 5,
          title: 'Clarifications & Amendments',
          description: 'Address any additional information requests or documentation requirements from DSO authorities.'
        },
        {
          number: 6,
          title: 'Formal Approval',
          description: 'Receive DSO approval certificate and license, enabling business operations within Dubai Silicon Oasis.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Detailed business plan outlining operations and objectives',
        'Property agreements or facility lease documents',
        'Shareholder and director identification documents',
        'Company registration and corporate documents',
        'Industry-specific licenses and certifications',
        'Financial statements and banking references',
        'Technical specifications for operations',
        'Compliance certificates for local regulations',
        'Insurance coverage documentation',
        'Health, safety, and environmental protocols'
      ]
    },
    benefits: {
      title: 'DSO Business Advantages',
      items: [
        'Access to cutting-edge technology infrastructure',
        'Networking with innovation-driven companies',
        'Simplified business setup and licensing',
        'Tax exemptions and financial incentives',
        'Skilled talent pool from tech sector',
        'Strategic location with excellent connectivity',
        'Professional support services',
        'Research and development facilities'
      ]
    },
    challenges: {
      title: 'Common Application Challenges',
      items: [
        'Bureaucratic delays extending approval timelines',
        'Insufficient or incomplete documentation',
        'Complex compliance with infrastructure regulations',
        'Administrative complexity for first-time applicants',
        'Coordination with multiple departments',
        'Technical specification requirements'
      ]
    },
    timeline: 'Standard approval: 2-4 weeks for complete applications. Professional handling can reduce timelines by over 30%.',
    faqs: [
      {
        question: 'What types of businesses can operate in DSO?',
        answer: 'DSO accommodates technology companies, startups, research organizations, manufacturing facilities, and innovation-driven enterprises across software development, AI, IoT, electronics, and related sectors.'
      },
      {
        question: 'What are the advantages of DSO over other free zones?',
        answer: 'DSO offers specialized technology infrastructure, integrated residential communities, educational institutions, research facilities, and a focused tech ecosystem that supports innovation and collaboration.'
      },
      {
        question: 'Do I need post-approval licenses?',
        answer: 'Yes, after DSO approval you must secure industry-specific licenses, maintain compliance with local laws, obtain operational permits, and ensure regular license renewals.'
      }
    ]
  },
  'dda': {
    id: 'dda',
    title: 'Dubai Development Authority Approval',
    subtitle: 'Urban Development and Building Approvals',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="service-detail-icon-svg">
        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 18V12M9 15L12 12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    overview: 'Dubai Development Authority (DDA) serves as a crucial regulatory entity overseeing urban development across designated Dubai zones. Our comprehensive service ensures your project meets DDA standards, navigating regulatory compliance, sustainable development requirements, and smart city integration.',
    whyImportant: {
      title: 'Why DDA Approval is Critical',
      description: 'DDA approval ensures your development aligns with Dubai\'s vision for sustainable, integrated urban growth.',
      points: [
        'Mitigates legal and financial penalties',
        'Facilitates collaborative urban planning approach',
        'Accelerates approval timelines through proper procedures',
        'Promotes transparency and accountability',
        'Enhances community welfare and quality of life',
        'Supports sustainability and smart city initiatives',
        'Required for major development projects'
      ]
    },
    process: {
      title: 'DDA Approval Process',
      steps: [
        {
          number: 1,
          title: 'Preliminary Project Proposal',
          description: 'Submit initial proposal outlining essential development particulars, project scope, and preliminary designs.'
        },
        {
          number: 2,
          title: 'Documentation Compilation',
          description: 'Provide site plans, architectural designs, environmental assessments, and compliance documentation aligned with DDA regulations.'
        },
        {
          number: 3,
          title: 'Technical Review',
          description: 'DDA technical team evaluates submissions for completeness, regulatory compliance, and alignment with urban planning objectives.'
        },
        {
          number: 4,
          title: 'Modifications & Clarifications',
          description: 'Address requested changes, provide additional information, and incorporate DDA feedback into project designs.'
        },
        {
          number: 5,
          title: 'Final Assessment',
          description: 'DDA conducts comprehensive final evaluation ensuring all requirements and conditions are met.'
        },
        {
          number: 6,
          title: 'Conditional Approval',
          description: 'Upon successful completion, receive DDA approval with specified conditions, authorizing project commencement.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Preliminary Project Proposal document',
        'Detailed site plans and property surveys',
        'Architectural designs and building elevations',
        'Environmental impact assessments',
        'Sustainability and energy efficiency plans',
        'Infrastructure and utilities integration plans',
        'Traffic impact studies',
        'Property ownership or development rights documentation',
        'Financial viability and project timeline',
        'Quality assurance and safety protocols'
      ]
    },
    benefits: {
      title: 'DDA Approval Benefits',
      items: [
        'Streamlined digital submission process',
        'Real-time application status tracking',
        'Automated compliance checklists',
        'Pre-submission verification reducing rejections',
        'Comprehensive regulatory guidance',
        'Integration with smart city initiatives',
        'Access to DDA development resources',
        'Professional consultation support'
      ]
    },
    challenges: {
      title: 'Common Challenges',
      items: [
        'Complex multi-layered approval requirements',
        'Environmental sustainability compliance',
        'Smart city integration specifications',
        'Coordination with multiple authorities',
        'Documentation completeness requirements',
        'Timeline management and deadlines'
      ]
    },
    timeline: 'Standard approval: 6-10 weeks for development projects, varying based on project scale and complexity.',
    faqs: [
      {
        question: 'What areas fall under DDA jurisdiction?',
        answer: 'DDA oversees development in designated zones including Dubai Waterfront, Dubai Design District (d3), and other strategic development areas as assigned by Dubai government.'
      },
      {
        question: 'How does DDA approval differ from Dubai Municipality?',
        answer: 'DDA focuses on strategic urban development in specific zones with emphasis on smart city integration and sustainability, while Dubai Municipality handles broader citywide building permits and compliance.'
      },
      {
        question: 'What are DDA sustainability requirements?',
        answer: 'DDA requires environmental assessments, energy efficiency compliance, green building practices, waste management plans, and alignment with Dubai Clean Energy Strategy objectives.'
      }
    ]
  },
  'signage': {
    id: 'signage',
    title: 'Signage Approval',
    subtitle: 'Outdoor Advertising and Business Signage Permits',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="service-detail-icon-svg">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 8H16M8 12H16M8 16H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    overview: 'Signage approval from Dubai Municipality is mandatory for all outdoor promotional displays, business identifiers, and advertising installations. We provide comprehensive support in obtaining signage permits, ensuring compliance with Dubai regulations regarding dimensions, lighting, placement, and content standards.',
    whyImportant: {
      title: 'Why Signage Approval is Essential',
      description: 'Proper signage approval ensures your business displays comply with Dubai regulations and aesthetic standards.',
      points: [
        'Mandatory for all outdoor business signage',
        'Prevents fines, removal orders, and legal penalties',
        'Ensures compliance with cultural and aesthetic standards',
        'Validates structural safety and public protection',
        'Protects brand visibility and business identity',
        'Required for insurance and property compliance',
        'Enhances professional business image'
      ]
    },
    process: {
      title: 'Signage Approval Process',
      steps: [
        {
          number: 1,
          title: 'Design Development',
          description: 'Create signage designs meeting Dubai Municipality guidelines for dimensions, lighting, materials, and content standards.'
        },
        {
          number: 2,
          title: 'Documentation Preparation',
          description: 'Compile architectural blueprints, design mockups, engineering specifications, and site photographs with location details.'
        },
        {
          number: 3,
          title: 'Application Submission',
          description: 'Submit complete application to Dubai Municipality with all required documentation and applicable fees.'
        },
        {
          number: 4,
          title: 'Technical Evaluation',
          description: 'Municipality reviews design for compliance with regulations covering size, placement, lighting, and structural integrity (2-4 weeks typical processing).'
        },
        {
          number: 5,
          title: 'Provisional Approval',
          description: 'Receive preliminary approval with any conditions or modification requirements to be addressed.'
        },
        {
          number: 6,
          title: 'Final Approval & Installation',
          description: 'Upon meeting all conditions, receive final approval certificate authorizing signage installation.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Architectural blueprints showing signage location and dimensions',
        'Design mockups from multiple viewing angles',
        'Engineering specifications for structural integrity',
        'Site photographs providing context',
        'Trade license and property ownership documents',
        'Material specifications and certifications',
        'Lighting specifications and energy consumption',
        'Installation methodology and safety protocols',
        'Content approval for cultural compliance',
        'Maintenance and safety inspection plans'
      ]
    },
    benefits: {
      title: 'Professional Service Benefits',
      items: [
        'Expert knowledge of Dubai signage regulations',
        'Streamlined documentation and submission',
        'Design consultation for compliance',
        'Faster approval through established connections',
        'Cost-effective solutions reducing rejection risks',
        'Coordination with contractors and installers',
        'Time savings for core business focus',
        'Ongoing compliance support'
      ]
    },
    challenges: {
      title: 'Common Challenges We Resolve',
      items: [
        'Misunderstanding local signage regulations',
        'Incomplete or inaccurate documentation',
        'Design non-compliance with size/lighting limits',
        'Cultural content requirements',
        'Structural safety specifications',
        'Bureaucratic processing delays'
      ]
    },
    timeline: 'Standard approval: 2-4 weeks from application to final approval, depending on signage complexity and location.',
    faqs: [
      {
        question: 'What types of signage require Municipality approval?',
        answer: 'All outdoor signage including promotional banners, LED digital displays, wall-mounted business signs, shopfront identifiers, neon displays, and illuminated installations require approval.'
      },
      {
        question: 'What are the main signage regulations in Dubai?',
        answer: 'Dubai Municipality regulates maximum dimensions/proportions, lighting specifications to prevent glare, strategic placement requirements, and content alignment with cultural standards.'
      },
      {
        question: 'How much does signage approval cost?',
        answer: 'Costs include application submission fees, inspection charges, potential modification expenses, and possible reapplication fees if changes are needed. Total costs vary based on signage size and type.'
      },
      {
        question: 'Can I install signage while awaiting approval?',
        answer: 'No, installing signage without approval violates regulations and can result in removal orders, fines, and legal complications. Always obtain approval before installation.'
      }
    ]
  },
  'spa': {
    id: 'spa',
    title: 'Spa Approval Dubai',
    subtitle: 'Complete licensing and health & safety approval for spa facilities in Dubai',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
        <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="currentColor"/>
      </svg>
    ),
    overview: 'Dubai\'s spa industry operates under strict health, safety, and licensing regulations governed by Dubai Municipality and the Dubai Health Authority. Our comprehensive spa approval service ensures your wellness facility meets all regulatory requirements including space specifications, equipment compliance, staff licensing, and operational standards for successful legal operation.',
    whyImportant: {
      title: 'Why Spa Approval is Essential',
      description: 'Spa approval demonstrates your commitment to health standards, customer safety, and professional excellence in Dubai\'s competitive wellness industry.',
      points: [
        'Mandatory for all spa and wellness facilities operating in Dubai',
        'Ensures compliance with DHA equipment and product registration requirements',
        'Validates adherence to Dubai Municipality health and safety standards',
        'Protects against fines ranging from AED 6,500 to AED 50,000 and facility closure',
        'Required for staff work permits and DHA practitioner licensing',
        'Enhances customer confidence and business credibility',
        'Enables access to corporate wellness programs and partnerships'
      ]
    },
    process: {
      title: 'Spa Approval Process',
      steps: [
        {
          number: 1,
          title: 'Initial Consultation and Name Approval',
          description: 'Conduct inquiry with DED and Dubai Municipality officials. Obtain trade name approval from DED and draft Memorandum of Association with local service agent if required.'
        },
        {
          number: 2,
          title: 'Facility Design and Space Planning',
          description: 'Ensure ceiling height minimum of 2.30 meters. Allocate separate treatment area of at least 2.50m x 1.50m for hygiene-sensitive beauty treatments. Submit facility layout plans for review.'
        },
        {
          number: 3,
          title: 'Equipment and Product Registration',
          description: 'Register all spa machines and equipment with Dubai Health Authority (DHA). Register all products with Product Safety Division of Dubai Municipality. Obtain compliance certificates for all equipment.'
        },
        {
          number: 4,
          title: 'Health & Safety Approval',
          description: 'Submit detailed plans to Dubai Municipality Health & Safety Department. Ensure proper ventilation, sanitation facilities, and waste disposal systems. Obtain approval from planning section and health division.'
        },
        {
          number: 5,
          title: 'Staff Licensing and Documentation',
          description: 'Ensure all spa workers obtain valid DHA licenses. Provide staff training certificates and qualification documents. Secure work permits for all employees through MOHRE.'
        },
        {
          number: 6,
          title: 'Final Inspection and License Issuance',
          description: 'Schedule final inspection with Dubai Municipality and DHA. Address any compliance issues identified. Receive spa operating license and commence operations with ongoing compliance monitoring.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Trade license application with approved business name',
        'Memorandum of Association (MOA) attested by notary public',
        'Tenancy contract for commercial spa premises',
        'Facility layout plans and architectural drawings',
        'Dubai Health Authority equipment registration certificates',
        'Product Safety Division registration for all spa products',
        'Staff DHA licenses and professional qualifications',
        'Passport copies and Emirates ID of all partners/owners',
        'NOC from landlord/property owner for spa operations',
        'Fire safety and civil defense approval certificates',
        'Hygiene and sanitation system documentation',
        'Waste disposal management plan'
      ]
    },
    benefits: {
      title: 'Benefits of Professional Support',
      items: [
        'Navigate complex multi-authority approval process efficiently',
        'Ensure proper equipment and product registration compliance',
        'Avoid costly facility design errors and modifications',
        'Expedite staff DHA licensing and work permit procedures',
        'Reduce total approval timeline from 8-12 weeks to 4-6 weeks',
        'Prevent application rejections due to incomplete documentation',
        'Access industry best practices for spa facility design',
        'Ongoing compliance support for license renewals'
      ]
    },
    challenges: {
      title: 'Common Challenges',
      items: [
        'Meeting minimum space and ceiling height requirements in existing facilities',
        'Obtaining DHA equipment approvals for imported spa machines',
        'Ensuring all products meet Dubai Municipality registration standards',
        'Coordinating staff DHA licensing for international therapists',
        'Managing simultaneous approvals from multiple government entities',
        'Understanding hygiene protocols and disposable material requirements',
        'Navigating ongoing compliance monitoring and inspection schedules'
      ]
    },
    timeline: '6-10 weeks from application submission to final license issuance, depending on facility readiness and documentation completeness',
    faqs: [
      {
        question: 'What is the minimum space requirement for a spa in Dubai?',
        answer: 'The ceiling height must be at least 2.30 meters throughout the spa facility. Additionally, you must allocate a separate treatment area of at least 2.50m x 1.50m specifically for beauty treatments involving hygiene concerns.'
      },
      {
        question: 'Do all spa equipment and products need approval?',
        answer: 'Yes, absolutely. All spa machines and equipment must be registered and approved by the Dubai Health Authority (DHA). All products used in treatments must be registered with the Product Safety Division of Dubai Municipality. Operating without these approvals can result in significant fines and license suspension.'
      },
      {
        question: 'What licenses do spa staff need?',
        answer: 'All spa workers, including therapists, beauticians, and massage practitioners, must hold valid DHA licenses specific to their practice area. Additionally, they need valid work permits issued through the Ministry of Human Resources and Emiratisation (MOHRE).'
      },
      {
        question: 'What are the costs involved in spa licensing?',
        answer: 'Base spa license costs range from AED 6,500 to AED 12,000 depending on jurisdiction, plus AED 700 for trade name registration, AED 250 for initial approval, and AED 1,000-2,000 for Dubai Municipality permits. Total setup investment including infrastructure typically ranges from AED 300,000 to AED 600,000+.'
      }
    ]
  },
  'shisha': {
    id: 'shisha',
    title: 'Shisha Cafe License Dubai',
    subtitle: 'Complete shisha cafe licensing, permits, and compliance for hookah establishments',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M2 21H22V19H2V21ZM20 8H17V4H15V8H9V4H7V8H4V18H20V8ZM6 16V10H18V16H6Z" fill="currentColor"/>
        <circle cx="12" cy="13" r="2" fill="currentColor"/>
      </svg>
    ),
    overview: 'Operating a shisha cafe in Dubai requires comprehensive licensing from multiple authorities including DED, Dubai Municipality, DTCM, and Dubai Police. Our specialized service ensures your shisha establishment meets strict location, space, ventilation, and health requirements mandated by Federal Law No. 15 of 2009 on Tobacco Control and Dubai Municipality regulations.',
    whyImportant: {
      title: 'Why Shisha Cafe License is Crucial',
      description: 'Shisha licensing ensures legal compliance with tobacco control laws, protects public health, and validates your business operates according to strict Dubai standards.',
      points: [
        'Mandatory for all businesses serving hookah/shisha in Dubai',
        'Ensures compliance with Federal Law No. 15 of 2009 on Tobacco Control',
        'Validates adherence to strict location and distance requirements',
        'Prevents fines ranging from AED 10,000 to AED 40,000 and forced closure',
        'Required for separate smoking and non-smoking area compliance',
        'Demonstrates commitment to proper ventilation and health standards',
        'Enables legal operation of both indoor and outdoor shisha services'
      ]
    },
    process: {
      title: 'Shisha Cafe License Process',
      steps: [
        {
          number: 1,
          title: 'Initial Application and Trade Name',
          description: 'Submit shisha permit service request through Dubai Municipality portal. Reserve trade name with Department of Economic Development (DED). Verify location meets distance requirements (150m from residences, schools, mosques).'
        },
        {
          number: 2,
          title: 'Location and Space Compliance',
          description: 'Ensure commercial building on main road with minimum 200 sq meters interior space and 150 sq meters cafe bar area. Obtain NOC from landlord for shisha operations. Verify 150m+ distance from residential structures, schools, daycares, and mosques.'
        },
        {
          number: 3,
          title: 'Design and Ventilation Approval',
          description: 'Submit detailed location plan, architectural design, and engineering drawings. Ensure minimum 3-meter ceiling height in shisha rooms. Design separate smoking and non-smoking areas with at least three non-smoking rooms. Install approved ventilation and air filtration systems.'
        },
        {
          number: 4,
          title: 'Multi-Authority Documentation',
          description: 'Obtain NOC from landlord/sponsor. Submit application forms signed by applicant. Provide Certificate of Good Conduct from police department. Submit health certificates from licensed medical practitioners. Prepare electrical, plumbing, lighting, and ventilation system details.'
        },
        {
          number: 5,
          title: 'Agreements and Legal Documents',
          description: 'Sign Memorandum of Association and partnership agreements at Notary Public Dubai. Attest tenancy contract of premises. Submit passport copies of all partners. Obtain preliminary approval from relevant authorities.'
        },
        {
          number: 6,
          title: 'Final Inspection and License',
          description: 'Schedule premises inspection by Dubai Municipality officials. Demonstrate compliance with all health, safety, and ventilation requirements. Address any deficiencies identified. Receive final shisha cafe license with annual renewal requirement.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Trade name reservation certificate from DED',
        'Shisha permit application form (duly completed and signed)',
        'No Objection Certificate (NOC) from landlord/sponsor',
        'Certificate of Good Conduct from Dubai Police',
        'Health certificates for all staff from licensed medical facility',
        'Attested tenancy contract showing commercial premises',
        'Location plan with distances to surrounding structures',
        'Architectural and engineering design drawings',
        'Ventilation system specifications and approval',
        'Electrical, plumbing, and lighting system details',
        'Passport copies and Emirates ID of all partners',
        'Memorandum of Association (attested by Notary Public)'
      ]
    },
    benefits: {
      title: 'Benefits of Professional Support',
      items: [
        'Navigate complex multi-authority approval process (DED, Municipality, DTCM, Police)',
        'Verify location compliance before lease commitment',
        'Ensure proper ventilation system design and approval',
        'Expedite documentation preparation and submission',
        'Reduce approval timeline from 6-8 weeks to 2-4 weeks',
        'Avoid costly design errors and facility modifications',
        'Manage coordination between multiple government entities',
        'Ongoing compliance support for annual renewals'
      ]
    },
    challenges: {
      title: 'Common Challenges',
      items: [
        'Finding suitable commercial location meeting 150m distance requirements',
        'Ensuring minimum 200 sq meter interior and ceiling height compliance',
        'Designing separate smoking/non-smoking areas with proper isolation',
        'Installing approved ventilation systems meeting municipality standards',
        'Coordinating simultaneous approvals from 4+ government entities',
        'Managing high licensing costs ranging AED 10,000 to AED 40,000+',
        'Maintaining ongoing compliance with tobacco control regulations'
      ]
    },
    timeline: '4-8 weeks from application submission to final license, depending on location compliance and documentation completeness',
    faqs: [
      {
        question: 'What are the minimum space requirements for a shisha cafe?',
        answer: 'The interior area must be at least 200 square meters, with the cafe bar around 150 square meters. The shisha rooms must have a minimum ceiling height of 3 meters, and you must provide at least three separate non-smoking rooms with proper isolation from smoking areas.'
      },
      {
        question: 'What are the distance requirements for shisha cafes?',
        answer: 'Your shisha cafe must be located at least 150 meters away from any residential structures, schools, daycares, and mosques. The facility must be in a commercial building on a main road, and you must obtain verification of these distances as part of the approval process.'
      },
      {
        question: 'What ventilation requirements must be met?',
        answer: 'Shisha cafes must have an approved ventilation and air filtration system that meets Dubai Municipality standards. The ventilation must properly separate smoking and non-smoking areas, with the front of the cafe facing the main street for adequate air circulation.'
      },
      {
        question: 'How much does a shisha cafe license cost?',
        answer: 'The total cost ranges from AED 10,000 to AED 40,000+ depending on location and facility size. This includes trade license fees, municipal permits, and approval costs from multiple authorities. Additionally, you must pay an annual renewal fee of AED 3,000.'
      }
    ]
  },
  'smoking': {
    id: 'smoking',
    title: 'Smoking Permit Dubai',
    subtitle: 'Designated smoking area permits and tobacco establishment licensing',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M2 16H20V20H2V16ZM18 8C18 6.9 18.9 6 20 6V4C17.79 4 16 5.79 16 8H18ZM22 8C22 6.9 22.9 6 24 6V4C21.79 4 20 5.79 20 8H22Z" fill="currentColor"/>
        <rect x="2" y="12" width="18" height="2" fill="currentColor"/>
      </svg>
    ),
    overview: 'Dubai strictly regulates smoking areas in commercial establishments under Federal Law No. 15 of 2009 on Tobacco Control. Our smoking permit service helps businesses obtain proper authorization for designated smoking areas, ensuring compliance with ventilation, isolation, and safety requirements mandated by Dubai Municipality.',
    whyImportant: {
      title: 'Why Smoking Permit is Essential',
      description: 'Smoking permits ensure your business complies with UAE tobacco control laws, protects non-smokers, and avoids substantial fines for violations.',
      points: [
        'Mandatory for businesses providing designated smoking areas',
        'Ensures compliance with Federal Law No. 15 of 2009 on Tobacco Control',
        'Prevents fines ranging from AED 200 to AED 500 per violation',
        'Required for proper ventilation and isolation from non-smoking areas',
        'Validates adherence to Dubai Municipality technical guidelines',
        'Protects business from closure orders and legal penalties',
        'Demonstrates commitment to public health and customer safety'
      ]
    },
    process: {
      title: 'Smoking Permit Process',
      steps: [
        {
          number: 1,
          title: 'Eligibility Assessment',
          description: 'Verify applicant is at least 18 years old (21 for some permit types). Assess facility suitability for designated smoking areas. Review location compliance with distance and zoning requirements.'
        },
        {
          number: 2,
          title: 'Application Preparation',
          description: 'Download smoking permit application form from Dubai Municipality website. Complete all sections accurately with business and facility information. Gather required documentation including trade license and facility plans.'
        },
        {
          number: 3,
          title: 'Design and Ventilation Planning',
          description: 'Design completely enclosed smoking rooms isolated from non-smoking areas. Plan proper ventilation system with separate air circulation. Ensure compliance with technical guidelines for smoking area specifications. Prepare detailed architectural drawings.'
        },
        {
          number: 4,
          title: 'Medical and Safety Documentation',
          description: 'Complete required medical examination to determine health condition. Obtain safety certificates for ventilation and fire systems. Prepare emergency evacuation plans for smoking areas.'
        },
        {
          number: 5,
          title: 'Submission and Fee Payment',
          description: 'Submit completed application with all supporting documents to Dubai Municipality. Pay required permit fees as per fee schedule. Receive acknowledgment and application tracking number.'
        },
        {
          number: 6,
          title: 'Inspection and Approval',
          description: 'Schedule site inspection by Dubai Municipality officials. Demonstrate ventilation system functionality and area isolation. Address any deficiencies identified. Receive smoking area permit with operational guidelines.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Smoking permit application form (completed and signed)',
        'Valid trade license for the establishment',
        'Facility layout plans showing smoking area location',
        'Architectural drawings of designated smoking rooms',
        'Ventilation system specifications and diagrams',
        'Fire safety and emergency evacuation plans',
        'Medical examination certificate (if required)',
        'Passport copy and Emirates ID of applicant',
        'Tenancy contract or property ownership documents',
        'NOC from building management (if applicable)',
        'Technical compliance certificates',
        'Proof of fee payment to Dubai Municipality'
      ]
    },
    benefits: {
      title: 'Benefits of Professional Support',
      items: [
        'Ensure smoking area design meets technical guideline requirements',
        'Navigate complex Dubai Municipality application procedures',
        'Avoid design errors requiring costly facility modifications',
        'Expedite approval process with complete documentation',
        'Ensure proper ventilation system specifications',
        'Prevent application rejections due to non-compliance',
        'Access technical guidance for optimal smoking area layout',
        'Ongoing support for permit renewals and compliance'
      ]
    },
    challenges: {
      title: 'Common Challenges',
      items: [
        'Designing completely enclosed rooms with proper isolation',
        'Installing ventilation systems meeting Municipality specifications',
        'Balancing smoking area size with business space requirements',
        'Understanding technical guidelines and compliance standards',
        'Managing coordination with fire safety and civil defense approvals',
        'Avoiding violations that trigger AED 200-500 fines',
        'Maintaining ongoing compliance with changing regulations'
      ]
    },
    timeline: '2-4 weeks from application submission to permit issuance, depending on facility readiness and inspection scheduling',
    faqs: [
      {
        question: 'What are the requirements for a designated smoking area?',
        answer: 'Smoking areas must be completely enclosed rooms with full isolation from non-smoking areas. They require proper ventilation systems with separate air circulation, compliance with fire safety standards, and official licensing approval from Dubai Municipality. The areas must have clearly visible signage and meet all technical guideline specifications.'
      },
      {
        question: 'Who needs a smoking permit in Dubai?',
        answer: 'Any business establishment that wants to provide designated smoking areas for customers or employees needs a smoking permit. This includes restaurants, cafes, hotels, entertainment venues, and office buildings. Licensed establishments must meet regulatory conditions regarding ventilation, isolation, and municipal approval.'
      },
      {
        question: 'What are the penalties for operating without a smoking permit?',
        answer: 'Operating a smoking area without proper permits can result in fines between AED 200 and AED 500 per violation under Federal Law No. 15 of 2009 on Tobacco Control. Repeated violations can lead to increased fines, temporary closure orders, and potential license suspension.'
      },
      {
        question: 'How often must smoking permits be renewed?',
        answer: 'Smoking permits typically require annual renewal with Dubai Municipality. The renewal process involves verification that the smoking area still meets all technical requirements, ventilation systems are functioning properly, and the establishment maintains compliance with current regulations.'
      }
    ]
  },
  'pool': {
    id: 'pool',
    title: 'Swimming Pool Approval Dubai',
    subtitle: 'Complete swimming pool design approval and safety compliance permits',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M22 21C20.76 21 19.58 20.63 18.56 20.02C16.84 21.25 14.16 21.25 12.44 20.02C10.72 21.25 8.04 21.25 6.32 20.02C5.3 20.63 4.12 21 2.88 21H2V19H2.88C3.86 19 4.78 18.68 5.56 18.15C7.28 19.38 9.96 19.38 11.68 18.15C13.4 19.38 16.08 19.38 17.8 18.15C18.58 18.68 19.5 19 20.48 19H22V21ZM22 17H20.88C19.9 17 18.98 17.32 18.2 17.85C16.48 16.62 13.8 16.62 12.08 17.85C10.36 16.62 7.68 16.62 5.96 17.85C5.18 17.32 4.26 17 3.28 17H2V15H3.28C4.62 15 5.88 15.5 6.88 16.34C8.88 15 11.32 15 13.32 16.34C15.32 15 17.76 15 19.76 16.34C20.76 15.5 22.02 15 23.36 15H24V17H22Z" fill="currentColor"/>
        <path d="M6.5 11.5C7.88 11.5 9 10.38 9 9C9 7.62 7.88 6.5 6.5 6.5C5.12 6.5 4 7.62 4 9C4 10.38 5.12 11.5 6.5 11.5Z" fill="currentColor"/>
        <path d="M16.5 9C16.5 11.21 14.71 13 12.5 13C11.94 13 11.42 12.88 10.94 12.67L8.53 15.08C9.46 15.67 10.55 16 11.72 16C13.99 16 16.05 14.95 17.38 13.33L20.53 14.08L21.47 9.92L17.31 9.17C17.09 9.11 16.87 9.09 16.66 9.12L18.42 7.36C16.71 5.22 13.83 4 10.83 4C9.18 4 7.63 4.39 6.28 5.08L8.08 6.88C8.89 6.64 9.75 6.5 10.64 6.5C13.15 6.5 15.38 7.67 16.5 9Z" fill="currentColor"/>
      </svg>
    ),
    overview: 'Swimming pool construction and installation in Dubai requires comprehensive approval from Dubai Municipality or relevant free zone authorities (Trakhees, DDA, Nakheel) depending on location. Our specialized service ensures your pool design meets safety standards, structural requirements, and technical specifications mandated by Dubai regulations.',
    whyImportant: {
      title: 'Why Swimming Pool Approval is Essential',
      description: 'Pool approval ensures structural safety, protects public health, and validates compliance with Dubai safety and environmental standards.',
      points: [
        'Mandatory for all swimming pool construction and installation in Dubai',
        'Ensures compliance with Dubai Municipality safety guidelines',
        'Validates structural integrity and proper drainage systems',
        'Prevents fines up to AED 50,000, construction halts, or demolition orders',
        'Required for both residential and commercial pool projects',
        'Protects against liability issues and safety violations',
        'Enables proper insurance coverage for pool facilities'
      ]
    },
    process: {
      title: 'Swimming Pool Approval Process',
      steps: [
        {
          number: 1,
          title: 'Registration and Initial Application',
          description: 'Register project in Dubai Building Permits System (DUBAI BPS) for Municipality areas. Submit initial application with project details and location information. Verify jurisdiction (Dubai Municipality, Trakhees, DDA, or other free zone authority).'
        },
        {
          number: 2,
          title: 'Technical Design and Engineering',
          description: 'Engage approved structural engineers and consultants. Prepare comprehensive pool design including structural calculations per relevant codes (Eurocode, ACI). Conduct geotechnical investigation and obtain soil test reports.'
        },
        {
          number: 3,
          title: 'Drawing Preparation',
          description: 'Prepare multi-sheet engineering drawings in DWF format. Include pipe fitting layouts, electrical diagrams, and filtration system schematics. Show pool deck design with non-slip surface and minimum 1:40 slope. Detail safety features including ladders (minimum one per 30m circumference) and anti-slip steps.'
        },
        {
          number: 4,
          title: 'Safety and Compliance Documentation',
          description: 'Ensure stairs/ladders provided for depths exceeding 60cm. Design pool deck at least equal to pool area with proper drainage. Prepare detailed specifications for safety equipment and barriers. Submit modifications plans for any bridges or slides with detailed engineering.'
        },
        {
          number: 5,
          title: 'Submission and Fee Payment',
          description: 'Submit complete application package through appropriate authority portal. Pay applicable fees per Dubai Municipality or free zone guidelines. Receive application acknowledgment and tracking number.'
        },
        {
          number: 6,
          title: 'Review and Final Approval',
          description: 'Undergo technical review by authority engineers. Address any comments or required modifications. Schedule final inspection upon construction completion. Receive swimming pool approval certificate and construction permit.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Swimming pool design drawings (multi-sheet DWF format)',
        'Structural design calculations by approved engineer',
        'Geotechnical report and soil investigation results',
        'Pipe fitting layouts and filtration system diagrams',
        'Electrical and lighting system specifications',
        'Pool deck design with drainage and slope details',
        'Safety equipment specifications (ladders, barriers)',
        'Title deed or property ownership documents',
        'NOC from building management (if applicable)',
        'Trade license of contractor and consultant',
        'Professional engineer registration certificates',
        'Environmental impact assessment (if required)'
      ]
    },
    benefits: {
      title: 'Benefits of Professional Support',
      items: [
        'Navigate authority-specific requirements (Municipality, Trakhees, DDA)',
        'Ensure compliance with technical safety guidelines',
        'Expedite approval process with complete documentation',
        'Avoid costly design errors and reconstruction',
        'Reduce timeline from 12-16 weeks to 6-12 weeks',
        'Access approved structural engineers and consultants',
        'Coordinate geotechnical investigations efficiently',
        'Prevent fines, construction halts, and demolition orders'
      ]
    },
    challenges: {
      title: 'Common Challenges',
      items: [
        'Meeting complex technical specifications for safety equipment',
        'Ensuring proper pool deck slope and drainage requirements',
        'Obtaining geotechnical reports meeting authority standards',
        'Coordinating between multiple consultants and engineers',
        'Understanding jurisdiction-specific requirements (Municipality vs free zones)',
        'Managing structural calculations per different code standards',
        'Avoiding modifications that require additional approvals'
      ]
    },
    timeline: '6-12 weeks from application submission to approval, depending on project complexity and documentation completeness',
    faqs: [
      {
        question: 'What are the safety requirements for swimming pool ladders?',
        answer: 'Stairs or ladders must be provided if the pool depth exceeds 60cm. At least one ladder must be installed for every 30 meters of pool circumference. All ladders must be corrosion-resistant and equipped with anti-slip steps meeting Dubai Municipality specifications.'
      },
      {
        question: 'What are the pool deck requirements?',
        answer: 'The pool deck must be at least equal to the pool area in size, feature a non-slip surface, and have a minimum slope of 1 in 40 (2.5%) away from the poolside for proper drainage. The deck must meet accessibility and safety standards outlined in Dubai technical guidelines.'
      },
      {
        question: 'Can I add slides or bridges to my pool?',
        answer: 'It is prohibited to add bridges crossing the pool or slides without referring to the Health and Safety Department in Dubai Municipality and attaching detailed plans with structural calculations. Any modifications require separate approval before construction.'
      },
      {
        question: 'What are the penalties for building without approval?',
        answer: 'Building a swimming pool without proper permits can result in fines up to AED 50,000, immediate construction halt orders, or even demolition orders from Dubai Municipality. You may also face liability issues and be unable to obtain insurance coverage for the facility.'
      }
    ]
  },
  'solar': {
    id: 'solar',
    title: 'Solar Approval Dubai',
    subtitle: 'DEWA Shams Dubai solar panel installation permits and approvals',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="4" fill="currentColor"/>
        <path d="M12 2V4M12 20V22M4 12H2M6.31 6.31L4.9 4.9M17.69 6.31L19.1 4.9M6.31 17.69L4.9 19.1M17.69 17.69L19.1 19.1M22 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    overview: 'Solar panel installation in Dubai operates under the Shams Dubai initiative (Executive Council Resolution No. 46 of 2014), enabling building owners to generate electricity using rooftop solar PV systems with net metering. Our comprehensive service ensures your solar project meets DEWA requirements, uses approved equipment, and complies with grid connection standards for seamless approval and operation.',
    whyImportant: {
      title: 'Why Solar Approval is Essential',
      description: 'DEWA solar approval ensures grid safety, equipment compliance, and enables you to benefit from net metering while reducing energy costs.',
      points: [
        'Mandatory for all solar PV system installations in Dubai',
        'Required to participate in Shams Dubai net metering program',
        'Ensures use of DEWA-approved solar panels and inverters',
        'Validates compliance with grid code and safety standards',
        'Enables connection to DEWA distribution network',
        'Protects against electrical safety violations and penalties',
        'Required for contractor DEWA electrical license verification',
        'Enables export of excess generation to the grid with credits'
      ]
    },
    process: {
      title: 'Solar Approval Process',
      steps: [
        {
          number: 1,
          title: 'Contractor and Equipment Verification',
          description: 'Engage DEWA-approved consultant/contractor with valid electrical license. Verify contractor is licensed by Dubai Department of Economic Development. Ensure all equipment is listed on DEWA\'s List of Eligible Equipment through DRRG Equipment Portal.'
        },
        {
          number: 2,
          title: 'Design and Documentation Preparation',
          description: 'Prepare Design Template in Excel format with system specifications. Create Single-Line Diagram (PDF) showing solar connection meter and anti-islanding system. Develop Solar Panel Layout Plan (PDF) drawn to 1:1 scale showing panel placement at least 1.5m from roof edges.'
        },
        {
          number: 3,
          title: 'Property and Legal Documentation',
          description: 'Obtain Solar Connection Agreement signed by property owner and contractor. Provide copy of owner\'s Emirates ID (UAE nationals) or title deed (non-nationals). Secure NOC from building management or developer if required.'
        },
        {
          number: 4,
          title: 'Equipment Compliance Certificates',
          description: 'Submit mandatory compliance certificates from 3rd party ILAC-accredited labs per ISO/IEC 17025. Ensure equipment meets minimum eligibility criteria on DRRG portal. Verify inverters and panels have valid certifications and warranties.'
        },
        {
          number: 5,
          title: 'DEWA Application Submission',
          description: 'Submit complete application through DEWA online portal. Pay connection fees and meter deposit. Receive preliminary approval and technical review feedback. Address any comments from DEWA engineers.'
        },
        {
          number: 6,
          title: 'Installation and Connection',
          description: 'Complete installation per approved design with licensed contractor. Ensure proper earthing, protection systems, and safety measures. Schedule DEWA inspection for net metering connection. Receive final approval and meter installation for grid connection.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Design Template (Excel) with complete system specifications',
        'Single-Line Diagram (PDF) showing meter and anti-islanding',
        'Solar Panel Layout Plan (PDF) at 1:1 scale',
        'Solar Connection Agreement (signed by owner and contractor)',
        'Owner\'s Emirates ID copy (UAE nationals) or title deed (non-nationals)',
        'DEWA-approved contractor license and registration',
        'Equipment compliance certificates from ILAC-accredited labs',
        'Proof of equipment enrollment in DRRG Equipment Portal',
        'Structural assessment for roof load capacity',
        'Electrical single line diagram with protection systems',
        'Fire safety compliance documentation',
        'NOC from building management (if applicable)'
      ]
    },
    benefits: {
      title: 'Benefits of Professional Support',
      items: [
        'Navigate complex Shams Dubai application procedures',
        'Ensure contractor has valid DEWA electrical license',
        'Verify equipment compliance before purchase',
        'Optimize system design for maximum efficiency and approvals',
        'Expedite approval process avoiding common delays',
        'Coordinate equipment enrollment in DRRG portal',
        'Ensure proper grid connection and anti-islanding compliance',
        'Reduce approval timeline from 8-12 weeks to 4-6 weeks'
      ]
    },
    challenges: {
      title: 'Common Challenges',
      items: [
        'Finding DEWA-approved contractors with valid electrical licenses',
        'Ensuring equipment is on List of Eligible Equipment before purchase',
        'Meeting 1.5-meter distance from roof edges requirement',
        'Obtaining compliance certificates from ILAC-accredited labs',
        'Understanding grid code requirements and anti-islanding systems',
        'Coordinating structural assessments for roof load capacity',
        'Navigating DRRG Equipment Portal enrollment procedures'
      ]
    },
    timeline: '4-8 weeks from application submission to grid connection, depending on system size and documentation completeness',
    faqs: [
      {
        question: 'What is the Shams Dubai initiative?',
        answer: 'Shams Dubai is Dubai\'s distributed renewable energy program established by Executive Council Resolution No. 46 of 2014. It allows building owners and tenants to install solar PV systems on their premises, generate their own electricity, and export excess generation to the DEWA distribution system through net metering, receiving credits on their electricity bills.'
      },
      {
        question: 'Do I need a special contractor for solar installation?',
        answer: 'Yes, absolutely. Any entity installing or operating a solar PV system must be licensed by the Dubai Department of Economic Development and approved by DEWA as a consultant/contractor. Contractors and engineers must obtain a DEWA electrical license to work on solar installations legally, ensuring compliance with technical and safety standards.'
      },
      {
        question: 'What equipment requirements must be met?',
        answer: 'Solar panels and inverters must be enrolled in the DRRG Equipment Portal and appear on DEWA\'s List of Eligible Equipment. Equipment must meet minimum eligibility criteria and have mandatory compliance certificates from 3rd party ILAC-accredited labs per ISO/IEC 17025 standard. Systems must comply with grid code requirements and have proper earthing and protection.'
      },
      {
        question: 'What are the installation requirements?',
        answer: 'Solar panels must be installed at least 1.5 meters away from roof edges for safety and fire regulation compliance. The system must use DEWA-approved meters for net metering, have proper anti-islanding protection, and comply with all grid connection standards. The roof structure must be assessed for load capacity.'
      }
    ]
  },
  'tent': {
    id: 'tent',
    title: 'Tent Approval Dubai',
    subtitle: 'Entertainment tent permits and temporary structure approvals for events',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7V9H22V7L12 2Z" fill="currentColor"/>
        <path d="M2 9V22H5V9H2ZM19 9V22H22V9H19ZM7 9V22H17V9H7Z" fill="currentColor"/>
      </svg>
    ),
    overview: 'Entertainment tent permits in Dubai are required for any temporary structure hosting events, even on private property or hotel gardens when used for public entertainment. Our comprehensive service manages approvals from DTCM, Civil Defence, and Dubai Municipality, ensuring your tented event meets safety, structural, and operational requirements.',
    whyImportant: {
      title: 'Why Tent Approval is Essential',
      description: 'Tent approval ensures event safety, structural integrity, and compliance with Dubai regulations for crowd management and emergency procedures.',
      points: [
        'Mandatory for all temporary tent structures hosting public events',
        'Required even for events on private property or hotel grounds',
        'Ensures compliance with fire safety and emergency exit standards',
        'Validates structural integrity and crowd management plans',
        'Prevents event shutdowns, fines, and legal penalties',
        'Required for food service and entertainment NOCs from authorities',
        'Protects event organizers from liability issues',
        'Demonstrates commitment to guest safety and regulatory compliance'
      ]
    },
    process: {
      title: 'Tent Approval Process',
      steps: [
        {
          number: 1,
          title: 'Event Planning and Scope Definition',
          description: 'Define event scope including expected guest count, event type, and duration. Determine if event qualifies as small-scale (under 500 guests) or large-scale (over 1,000 guests). Identify all required approvals based on event activities (food service, music, etc.).'
        },
        {
          number: 2,
          title: 'Design and Layout Planning',
          description: 'Prepare tent layout plan showing entry/exit points, stage, seating arrangements, and facilities. Design emergency exits and fire escape routes. Plan crowd flow and accessibility features. Determine tent dimensions and structural specifications.'
        },
        {
          number: 3,
          title: 'Safety Documentation',
          description: 'Create comprehensive fire & safety plan with emergency exit locations and extinguisher placements. Obtain tent structure certificate confirming structural integrity from certified engineer. Develop crowd management plan with security procedures. Secure public liability insurance coverage.'
        },
        {
          number: 4,
          title: 'Multi-Authority Applications',
          description: 'Submit application to DTCM for entertainment permit. Apply to Civil Defence for fire safety approval. Obtain Dubai Municipality approval for structure, hygiene, and public access. If serving food, obtain NOC from Dubai Municipality Food Control. If featuring music, obtain NOC from Dubai Police.'
        },
        {
          number: 5,
          title: 'Compliance and Additional Approvals',
          description: 'Verify waste disposal management plans. Ensure proper sanitation and hygiene facilities. Confirm parking and traffic management arrangements. Obtain venue owner/hotel NOC if applicable.'
        },
        {
          number: 6,
          title: 'Inspection and Final Approval',
          description: 'Schedule coordinated inspection with all relevant authorities. Demonstrate compliance with fire safety, structural, and crowd management requirements. Address any deficiencies identified. Receive final entertainment tent permit with operational conditions.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Tent layout plan (entry/exit, stage, seating, facilities)',
        'Fire & safety plan with emergency exits and extinguishers',
        'Tent structure certificate (structural integrity)',
        'Crowd management plan with security procedures',
        'Public liability insurance certificate',
        'Event details (date, duration, expected attendance)',
        'Venue ownership documents or NOC from property owner',
        'Food service NOC from Dubai Municipality (if applicable)',
        'Music/entertainment NOC from Dubai Police (if applicable)',
        'Waste disposal management plan',
        'Sanitation and hygiene facility specifications',
        'Parking and traffic management plan'
      ]
    },
    benefits: {
      title: 'Benefits of Professional Support',
      items: [
        'Navigate complex multi-authority approval process (DTCM, Civil Defence, Municipality)',
        'Ensure tent design meets safety and structural requirements',
        'Expedite approval for events with tight timelines',
        'Coordinate simultaneous applications to multiple authorities',
        'Reduce approval time from 15 days to 7 days for standard events',
        'Avoid costly event cancellations due to permit issues',
        'Ensure proper crowd management and emergency planning',
        'Ongoing compliance support during event execution'
      ]
    },
    challenges: {
      title: 'Common Challenges',
      items: [
        'Coordinating approvals from multiple authorities (DTCM, Civil Defence, Municipality, Police)',
        'Meeting fire safety requirements for large-capacity tents',
        'Obtaining structural integrity certificates from certified engineers',
        'Managing timeline pressures for event dates',
        'Understanding varying requirements for different event sizes',
        'Securing additional NOCs for food service and entertainment',
        'Ensuring adequate emergency exits and crowd management plans'
      ]
    },
    timeline: 'Small-scale events (under 500 guests): 7 working days; Large-scale events (over 1,000 guests or international talent): up to 15 working days',
    faqs: [
      {
        question: 'Do I need a tent permit for events on private property?',
        answer: 'Yes, an entertainment tent permit is required even if the event is held on private property or in a hotel garden when used for public or entertainment purposes. DTCM, along with Civil Defence and Dubai Municipality, require approval to ensure safety and quality standards are met.'
      },
      {
        question: 'What is included in a tent approval application?',
        answer: 'The application must include a tent layout plan showing entry/exit, stage, seating, and facilities; a fire & safety plan with emergency exits and extinguisher placements; a tent structure certificate confirming structural integrity; a crowd management plan; and public liability insurance. Additional NOCs may be required for food service and music.'
      },
      {
        question: 'How long does tent approval take?',
        answer: 'Small-scale tents accommodating under 500 guests are typically approved within 7 working days. Larger or high-risk events (over 1,000 guests, featuring international talent, or complex setups) can take up to 15 working days. Processing time depends on documentation completeness and coordination between authorities.'
      },
      {
        question: 'What are the consequences of hosting without a permit?',
        answer: 'Hosting a tented event without the required permit can lead to immediate event shutdown orders, substantial fines, and legal penalties. Event organizers may face liability issues for guest safety, and repeated violations can impact future event permissions and business licensing.'
      }
    ]
  },
  'rta': {
    id: 'rta',
    title: 'RTA Permit and Approval Dubai',
    subtitle: 'Roads and Transport Authority permits for transport, signage, and road works',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M18 18.5C18.83 18.5 19.5 17.83 19.5 17C19.5 16.17 18.83 15.5 18 15.5C17.17 15.5 16.5 16.17 16.5 17C16.5 17.83 17.17 18.5 18 18.5ZM19.5 9.5H17V12H21.46L19.5 9.5ZM6 18.5C6.83 18.5 7.5 17.83 7.5 17C7.5 16.17 6.83 15.5 6 15.5C5.17 15.5 4.5 16.17 4.5 17C4.5 17.83 5.17 18.5 6 18.5Z" fill="currentColor"/>
        <path d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20C7.66 20 9 18.66 9 17H15C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17H23V12L20 8Z" fill="currentColor"/>
      </svg>
    ),
    overview: 'The Roads and Transport Authority (RTA) oversees Dubai\'s transportation infrastructure, vehicle licensing, and commercial transport services. Our comprehensive RTA approval service covers permits for commercial vehicles, transport businesses, road works, signage/advertising, and specialized transport activities including the new 2025 tourist transport regulations.',
    whyImportant: {
      title: 'Why RTA Approval is Crucial',
      description: 'RTA approval is mandatory for transport-related businesses and ensures compliance with Dubai road safety, vehicle, and commercial transport regulations.',
      points: [
        'Mandatory prerequisite before obtaining DED or licensing authority approval',
        'Required for commercial transport services (taxis, rentals, logistics)',
        'Essential for vehicle sales, garage services, and auto-related businesses',
        'Validates compliance with 2025 tourist transport activity regulations',
        'Prevents penalties and business license suspension',
        'Required for road works, construction affecting roads, and signage',
        'Enables legal operation of driving schools and training services',
        'Necessary for hazardous materials transport compliance'
      ]
    },
    process: {
      title: 'RTA Approval Process',
      steps: [
        {
          number: 1,
          title: 'Business Activity Assessment',
          description: 'Identify specific RTA approval type needed (transport licensing, vehicle permits, signage, road works). Verify if business requires NOC from RTA before DED licensing. Assess compliance with 2025 tourist transport regulations if applicable.'
        },
        {
          number: 2,
          title: 'Documentation Preparation',
          description: 'Gather business registration documents and trade license application. Prepare detailed business plan for transport services. Collect vehicle documentation for commercial vehicle registration. Compile driver/operator qualification certificates.'
        },
        {
          number: 3,
          title: 'Online Application Submission',
          description: 'Create account on RTA online services portal. Submit appropriate application type through e-services. Upload all required documents and certificates. Pay applicable fees and obtain application tracking number.'
        },
        {
          number: 4,
          title: 'Technical Review and Assessment',
          description: 'RTA reviews documents for completeness and compliance. Technical assessment of vehicles for commercial operation. Verification of driver licenses and qualifications. Inspection of premises for garage/service businesses.'
        },
        {
          number: 5,
          title: 'Permit Assignment (Tourist Transport)',
          description: 'For tourist transport, RTA determines permit assignment within 3 working days from complete application. Verify establishment meets all Executive Council Resolution requirements. Ensure compliance with operational conditions.'
        },
        {
          number: 6,
          title: 'Final Approval and License',
          description: 'Receive RTA approval certificate or NOC. Complete remaining licensing steps with DED or relevant authority. Obtain commercial vehicle plates and permits. Receive operational guidelines and compliance requirements.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Business registration documents and ownership proof',
        'Trade license application or existing license copy',
        'Detailed business plan for transport services',
        'Vehicle registration documents (for commercial vehicles)',
        'Driver licenses and professional qualification certificates',
        'Insurance certificates (vehicle and liability)',
        'Premises lease agreement (for garage/service businesses)',
        'Safety and operational procedure manuals',
        'Financial statements and bank guarantees (if required)',
        'NOC from sponsor (if applicable)',
        'Passport and Emirates ID copies of owners/partners',
        'Vehicle inspection certificates (for commercial operations)'
      ]
    },
    benefits: {
      title: 'Benefits of Professional Support',
      items: [
        'Navigate complex RTA approval categories and requirements',
        'Ensure compliance with 2025 tourist transport regulations',
        'Expedite multi-stage approval process',
        'Coordinate between RTA and DED licensing procedures',
        'Reduce processing time from weeks to days for standard permits',
        'Avoid application rejections due to incomplete documentation',
        'Ensure vehicle compliance before purchase commitments',
        'Ongoing support for license renewals and fleet expansion'
      ]
    },
    challenges: {
      title: 'Common Challenges',
      items: [
        'Understanding which specific RTA approval type is required',
        'Coordinating RTA approval before DED licensing',
        'Meeting new 2025 tourist transport activity requirements',
        'Ensuring commercial vehicles meet RTA technical specifications',
        'Managing driver qualification and licensing requirements',
        'Navigating different procedures for various business types',
        'Understanding hazardous materials transport special regulations'
      ]
    },
    timeline: 'Standard approvals: 3-7 working days; Complex transport permits: 2-3 weeks; Tourist transport permit assignments: 3 working days from complete application',
    faqs: [
      {
        question: 'What businesses require RTA approval?',
        answer: 'Businesses requiring RTA approval include private taxis, car rentals, vehicle sales (new and used), garage services, commercial transport and logistics, driving instruction services, and companies transporting hazardous materials. RTA endorsement or NOC is required before obtaining a license from DED or other licensing authorities.'
      },
      {
        question: 'What are the 2025 tourist transport regulations?',
        answer: 'Under 2025 regulations (Administrative Resolution No. 97), the RTA determines permit assignment applications within 3 working days from complete submission. Establishments must meet all conditions prescribed by the Executive Council Resolution and operational requirements for tourist transport activities.'
      },
      {
        question: 'How long does RTA approval take?',
        answer: 'Processing times vary by approval type. Some approvals like permit assignments are granted within 3 working days. Standard vehicle and transport licensing may take 1-2 weeks. Complex applications involving multiple vehicles or specialized services may require 2-3 weeks depending on documentation completeness.'
      },
      {
        question: 'What types of RTA approvals are there?',
        answer: 'Key RTA approval categories include: Signage & Advertising Permits for business signs and billboards; Construction & Road Permits for road works and building modifications; Vehicle & Transport Licensing for commercial vehicles, taxis, and buses; Transport Business NOCs required before DED licensing; and specialized permits for driving schools and hazardous materials transport.'
      }
    ]
  },
  'tecom': {
    id: 'tecom',
    title: 'Tecom and DCCA Approval Dubai',
    subtitle: 'Dubai Creative Clusters Authority approvals for free zone businesses',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V6H20V18Z" fill="currentColor"/>
        <path d="M6 10H8V16H6V10ZM10 10H12V16H10V10ZM14 10H16V16H14V10Z" fill="currentColor"/>
      </svg>
    ),
    overview: 'The TECOM Dubai Creative Clusters Authority (DCCA), established in 2000, regulates creative industries across multiple free zones including Dubai Internet City, Dubai Media City, and Dubai Knowledge Park. Our specialized service manages comprehensive TECOM/DCCA approvals for business setup, construction permits, and fitout approvals in these innovation-focused free zones.',
    whyImportant: {
      title: 'Why TECOM DCCA Approval is Essential',
      description: 'TECOM DCCA approval ensures compliance with free zone regulations, validates project quality, and enables business operations in Dubai\'s premier creative clusters.',
      points: [
        'Mandatory for all businesses operating in TECOM-owned free zones',
        'Required for Dubai Internet City, Media City, Knowledge Park locations',
        'Validates compliance with creative cluster design and quality standards',
        'Essential for obtaining final building permits and occupancy',
        'Prevents project delays, cost overruns, and regulatory penalties',
        'Required before commencing construction or fitout work',
        'Demonstrates commitment to innovation ecosystem standards',
        'Enables access to free zone business benefits and incentives'
      ]
    },
    process: {
      title: 'TECOM DCCA Approval Process',
      steps: [
        {
          number: 1,
          title: 'Pre-Application and Chamber Registration',
          description: 'Submit necessary documents to Dubai Chamber of Commerce and Industry. Receive review and preliminary approval confirmation. Prepare to begin TECOM DCCA approval process with cleared documentation.'
        },
        {
          number: 2,
          title: 'Online Portal Registration',
          description: 'Create account on TECOM DCCA online portal. Submit initial application with detailed project plans. Provide project scope, location within free zone, and business activities. Upload preliminary architectural concepts.'
        },
        {
          number: 3,
          title: 'Comprehensive Document Submission',
          description: 'Provide trade license, passport copies, and tenancy contracts. Submit detailed architectural, structural, and MEP drawings. Include soil investigation, soil report review, and design revision documents. Provide traffic impact study and MEP preliminary design.'
        },
        {
          number: 4,
          title: 'Pre-Construction Approvals',
          description: 'Obtain soil investigation-inspection clearance. Secure infrastructure work permit. Apply for preliminary building permit. Submit all required pre-construction documentation.'
        },
        {
          number: 5,
          title: 'Technical Review and Coordination',
          description: 'TECOM DCCA engineers review all submissions for compliance. Address comments and required revisions. Coordinate between consultants for integrated approvals. Ensure alignment with creative cluster standards.'
        },
        {
          number: 6,
          title: 'Final Permits and Occupancy',
          description: 'Receive final building permit approval. Complete construction per approved plans. Schedule final inspection by TECOM DCCA. Obtain certificate of completion and occupancy permit.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Trade license or business registration documents',
        'Passport copies and Emirates ID of partners/directors',
        'Tenancy contract for premises within free zone',
        'Detailed architectural drawings and floor plans',
        'Structural design calculations and drawings',
        'MEP (mechanical, electrical, plumbing) drawings',
        'Soil investigation report and geotechnical study',
        'Traffic impact study (if applicable)',
        'MEP preliminary design documentation',
        'Infrastructure work permit application',
        'Fire safety and civil defense compliance plans',
        'Design revision documents (if changes made)'
      ]
    },
    benefits: {
      title: 'Benefits of Professional Support',
      items: [
        'Navigate specific TECOM DCCA free zone requirements',
        'Expedite multi-stage approval process (pre-construction to occupancy)',
        'Ensure compliance with creative cluster design standards',
        'Coordinate Chamber of Commerce pre-approval requirements',
        'Reduce approval timeline from 12-16 weeks to 6-10 weeks',
        'Avoid costly design revisions and resubmissions',
        'Access expertise in Dubai Internet City and Media City projects',
        'Ongoing support for amendments and expansions'
      ]
    },
    challenges: {
      title: 'Common Challenges',
      items: [
        'Understanding free zone-specific requirements vs mainland regulations',
        'Coordinating multiple approval stages (pre-construction to final permits)',
        'Meeting creative cluster aesthetic and quality standards',
        'Managing Chamber of Commerce pre-approval requirements',
        'Navigating soil investigation and geotechnical report procedures',
        'Ensuring MEP designs comply with free zone infrastructure',
        'Coordinating traffic impact studies for larger projects'
      ]
    },
    timeline: '6-12 weeks for standard projects; larger developments may require 3-6 months depending on complexity and number of review cycles',
    faqs: [
      {
        question: 'What free zones does TECOM DCCA cover?',
        answer: 'TECOM DCCA regulates several prominent creative free zones including Dubai Internet City, Dubai Media City, Dubai Knowledge Park, Dubai Studio City, Dubai Production City, Dubai Outsource City, and Dubai International Academic City. The authority supports Dubai\'s strategy for innovation by providing a conducive environment for knowledge-based industries.'
      },
      {
        question: 'What is the pre-application process?',
        answer: 'Before applying for TECOM DCCA approval, you must submit documents to the Dubai Chamber of Commerce and Industry. After your application has been reviewed and approved by the Chamber, you can then begin the TECOM and DCCA approval process through their online portal.'
      },
      {
        question: 'What documents are required during pre-construction?',
        answer: 'Pre-construction documents include soil investigation and inspection reports, soil report review, design revision documents, traffic impact study, MEP preliminary design, infrastructure work permit application, and preliminary building permit documentation. All documents must meet TECOM DCCA technical standards.'
      },
      {
        question: 'How much does TECOM DCCA approval cost?',
        answer: 'Setting up a business in TECOM free zones including approvals involves business registration fees estimated at AED 20,000-30,000. Additional costs vary based on project scope, number of locations, and specific approvals required. Ensuring complete and correct documentation can help expedite the process and minimize costs.'
      }
    ]
  },
  'tpc': {
    id: 'tpc',
    title: 'Third Party Consultants Approval Dubai',
    subtitle: 'Third party consultant registration and approval for construction projects',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
      </svg>
    ),
    overview: 'Third party consultants in Dubai\'s construction sector require special registration and approval, particularly under the new Law No. 7 of 2025 transforming the contracting sector. Our service ensures consultant qualification verification, proper registration in contractor registries, and compliance with subcontracting approval requirements for oil, gas, marine, petrochemical, and energy sectors.',
    whyImportant: {
      title: 'Why Third Party Consultant Approval is Essential',
      description: 'Third party consultant approval ensures professional qualifications, regulatory compliance, and protects project integrity under Dubai\'s enhanced 2025 construction regulations.',
      points: [
        'Mandatory under Dubai Law No. 7 of 2025 for construction projects',
        'Required for third party subcontracting approval',
        'Ensures consultant meets minimum education and experience requirements',
        'Validates registration in official DDA approved contractors registry',
        'Prevents project delays due to non-compliant consultant engagement',
        'Required for supervision of construction activities',
        'Protects against penalties under new construction law',
        'Demonstrates commitment to professional standards and quality'
      ]
    },
    process: {
      title: 'Third Party Consultant Approval Process',
      steps: [
        {
          number: 1,
          title: 'Qualification Verification',
          description: 'Verify consultant is at least 18 years old. Confirm education level (minimum Secondary school, Diploma, or HND). Validate full-time work experience of at least 2 years. Confirm consulting experience of at least 1 year.'
        },
        {
          number: 2,
          title: 'Registry Registration',
          description: 'Register in official DDA approved contractors registry. Select appropriate category based on construction activity type. Submit professional credentials and experience documentation. Obtain consultant registration certificate.'
        },
        {
          number: 3,
          title: 'Licensing and Business Setup',
          description: 'For consultancy license: Choose between mainland (2-4 weeks) or free zone (1-2 weeks). Prepare business documentation with proper legal structure. Submit application to relevant licensing authority. Obtain consultancy business license.'
        },
        {
          number: 4,
          title: 'Project-Specific Approval',
          description: 'Obtain prior approval from client for third party execution. Secure approval from regulatory authority (Director General of Dubai Municipality). Submit architectural, structural, and electromechanical plans. Provide consultant certificate of registration.'
        },
        {
          number: 5,
          title: 'Documentation Submission',
          description: 'Submit approved architectural drawings by licensed consultant. Provide structural design calculations and drawings. Include electromechanical plans with specifications. Supply supervising contractor documentation.'
        },
        {
          number: 6,
          title: 'Final Approval and Project Assignment',
          description: 'Receive third party consultant approval from authority. Obtain project assignment clearance. Begin supervision and consulting services. Maintain ongoing compliance with 2025 construction law requirements.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Professional qualification certificates (minimum Secondary/Diploma/HND)',
        'Work experience documentation (minimum 2 years full-time)',
        'Consulting experience proof (minimum 1 year)',
        'Registration certificate from DDA approved contractors registry',
        'Consultancy business license (mainland or free zone)',
        'Professional liability insurance certificate',
        'Client approval letter for third party execution',
        'Regulatory authority approval (Dubai Municipality Director General)',
        'Architectural plans approved by licensed consultant',
        'Structural and MEP drawings with calculations',
        'Passport copy and Emirates ID',
        'Company trade license and ownership documents'
      ]
    },
    benefits: {
      title: 'Benefits of Professional Support',
      items: [
        'Navigate new 2025 construction law requirements efficiently',
        'Ensure proper registry registration and categorization',
        'Expedite consultancy license procurement',
        'Verify qualification requirements before project commitment',
        'Coordinate client and regulatory authority approvals',
        'Reduce licensing timeline for free zone (1-2 weeks) and mainland (2-4 weeks)',
        'Avoid project delays due to consultant non-compliance',
        'Ongoing support for registry renewals and compliance'
      ]
    },
    challenges: {
      title: 'Common Challenges',
      items: [
        'Meeting new 2025 construction law subcontracting approval requirements',
        'Understanding registry categories and proper classification',
        'Obtaining dual approvals from client and regulatory authority',
        'Coordinating consultancy license with project timelines',
        'Ensuring minimum qualification and experience standards',
        'Managing documentation requirements across multiple authorities',
        'Navigating sector-specific requirements (oil, gas, marine, petrochemical)'
      ]
    },
    timeline: 'Consultancy license: Mainland 2-4 weeks, Free zone 1-2 weeks; DDA project approvals: Simple permits 5-10 days, Construction projects 15-30 days',
    faqs: [
      {
        question: 'What are the minimum qualifications for third party consultants?',
        answer: 'Third party consultants must be at least 18 years old and educated to at least Secondary school level, Diploma, or Higher National Diploma (HND) level. They must have worked as a full-time employee for at least 2 years and as a consultant for at least 1 year. These qualifications must be documented and verified.'
      },
      {
        question: 'What changed under Dubai Law No. 7 of 2025?',
        answer: 'The new law requires avoiding subcontracting unless prior approval for execution of work through a third party is obtained. Specifically, prior approval from both the client and the regulatory authority (such as the Director General of Dubai Municipality) must be secured. A registry of contractors has been established, categorizing contractors based on construction activity type.'
      },
      {
        question: 'How long does consultancy licensing take?',
        answer: 'Mainland consultancy licenses typically take 2-4 weeks to process, while free zone licenses can be obtained in 1-2 weeks with proper documentation. For DDA approvals on specific projects, simple event and advertisement permits take 5-10 working days, while new construction projects and structural modifications require 15-30 working days.'
      },
      {
        question: 'What sectors commonly require third party consultants?',
        answer: 'In the UAE, third party consultants usually operate within the oil, gas, marine, petrochemical, and energy sectors. The government mandates third party consultant approval for these specialized industries to ensure professional standards and technical expertise are maintained throughout project execution.'
      }
    ]
  },
  'trakhees': {
    id: 'trakhees',
    title: 'Trakhees Approval Dubai',
    subtitle: 'Port, Customs and Free Zone Corporation approvals and EHS certification',
    icon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20C7.66 20 9 18.66 9 17H15C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17H23V12L20 8Z" fill="currentColor"/>
        <path d="M6 18.5C6.83 18.5 7.5 17.83 7.5 17C7.5 16.17 6.83 15.5 6 15.5C5.17 15.5 4.5 16.17 4.5 17C4.5 17.83 5.17 18.5 6 18.5ZM18 18.5C18.83 18.5 19.5 17.83 19.5 17C19.5 16.17 18.83 15.5 18 15.5C17.17 15.5 16.5 16.17 16.5 17C16.5 17.83 17.17 18.5 18 18.5ZM19.5 9.5H17V12H21.46L19.5 9.5Z" fill="currentColor"/>
      </svg>
    ),
    overview: 'Trakhees is the regulatory arm of the Ports, Customs, and Free Zone Corporation (PCFC) governing JAFZA, Dubai Maritime City, certain Nakheel areas, and Dubai World Central. Our comprehensive service covers Trakhees approvals for construction projects, EHS certification (mandatory for all free zone operations), company formation, and regulatory compliance in these strategic port and free zone locations.',
    whyImportant: {
      title: 'Why Trakhees Approval is Essential',
      description: 'Trakhees approval ensures environmental, health, safety compliance and validates operations in Dubai\'s premier port and free zone areas.',
      points: [
        'Mandatory EHS certification for all JAFZA and Maritime City operations',
        'Required for construction, manufacturing, retail, hospitality in free zones',
        'Validates compliance with Trakhees design and quality standards',
        'Prevents business license suspension and operational penalties',
        'Essential for legal operation and expansion in regulated free zones',
        'Required for geotechnical assessments and structural approvals',
        'Demonstrates commitment to environmental, health, and safety standards',
        'Enables access to port facilities and free zone benefits'
      ]
    },
    process: {
      title: 'Trakhees Approval Process',
      steps: [
        {
          number: 1,
          title: 'License Type Selection and Registration',
          description: 'Choose license type: Commercial (trading/import-export), Service (professional/consultancy), or Industrial (manufacturing). Create account on Trakhees Online Registration portal. Access e-services for licensing and approval applications.'
        },
        {
          number: 2,
          title: 'EHS Certification Application',
          description: 'Initiate mandatory Environment, Health, and Safety (EHS) certification process. Verify business sector (construction, manufacturing, retail, hospitality, industrial). Prepare EHS compliance documentation and procedures. Submit EHS certification application.'
        },
        {
          number: 3,
          title: 'Technical Documentation Preparation',
          description: 'Compile site plan and architectural drawings. Prepare structural drawings by registered engineers. Develop MEP (mechanical, electrical, plumbing) drawings. Create fire safety plans and obtain Civil Defence NOC. Conduct geotechnical report (soil test) per Eurocode, ACI standards.'
        },
        {
          number: 4,
          title: 'Consultant and Engineer Registration',
          description: 'Engage Trakhees-approved/registered structural engineers. Hire registered architects and consultants. Submit professional registration certificates. Provide structural design calculations per relevant codes.'
        },
        {
          number: 5,
          title: 'Application Submission and Review',
          description: 'Upload all documentation through online portal. Submit trade license and proof of ownership/lease. Provide passport/visa copies of directors. Pay applicable fees. Receive application acknowledgment and tracking number.'
        },
        {
          number: 6,
          title: 'Inspection and Final Approval',
          description: 'Schedule site inspection by Trakhees officials. Demonstrate compliance with EHS and technical standards. Address any deficiencies identified. Receive Trakhees approval certificate and EHS certification. Obtain operational clearance.'
        }
      ]
    },
    requirements: {
      title: 'Required Documentation',
      items: [
        'Site plan showing project location and boundaries',
        'Architectural drawings (detailed floor plans, elevations)',
        'Structural drawings by registered engineer',
        'MEP (mechanical, electrical, plumbing) drawings',
        'Fire safety plans and Civil Defence NOC',
        'Geotechnical report and soil investigation results',
        'Structural design calculations (Eurocode, ACI, or equivalent)',
        'Trade license or business registration documents',
        'Proof of ownership (title deed) or lease agreement',
        'Passport and visa copies of directors/shareholders',
        'Professional engineer and architect registration certificates',
        'EHS compliance procedures and safety manuals'
      ]
    },
    benefits: {
      title: 'Benefits of Professional Support',
      items: [
        'Navigate mandatory EHS certification requirements efficiently',
        'Ensure compliance with Trakhees-specific technical standards',
        'Access network of registered engineers and consultants',
        'Expedite geotechnical investigations and soil testing',
        'Coordinate multiple approval components (construction, EHS, occupancy)',
        'Reduce approval timeline for villas (1-3 weeks) and large projects (4-6 weeks)',
        'Avoid costly design errors and resubmissions',
        'Ongoing support for license renewals and expansions'
      ]
    },
    challenges: {
      title: 'Common Challenges',
      items: [
        'Understanding mandatory EHS certification requirements',
        'Meeting Trakhees-specific design and structural standards',
        'Coordinating between multiple consultants (structural, MEP, geotechnical)',
        'Ensuring engineers and architects are Trakhees-registered',
        'Obtaining geotechnical reports meeting international code standards',
        'Navigating different requirements across free zone jurisdictions (JAFZA vs Maritime City)',
        'Managing online portal submissions and documentation formats'
      ]
    },
    timeline: 'Standard villa modifications: 1-3 weeks; Large projects: 4-6 weeks depending on complexity; EHS certification: 2-4 weeks',
    faqs: [
      {
        question: 'What is EHS Trakhees Certification?',
        answer: 'The Environment, Health, and Safety (EHS) Trakhees Certification is a mandatory compliance requirement for companies operating in JAFZA, Dubai Maritime City, and other Dubai free zones regulated by Trakhees authority. Businesses in construction, manufacturing, retail, hospitality, and industrial sectors must secure EHS certification to legally operate and expand.'
      },
      {
        question: 'What free zones does Trakhees regulate?',
        answer: 'Trakhees oversees free zone areas including JAFZA (Jebel Ali Free Zone), Dubai Maritime City, certain Nakheel-developed areas, and Dubai World Central. The authority handles environmental, health, safety regulations, and licensing solutions for these strategic port and free zone locations.'
      },
      {
        question: 'What license types are available through Trakhees?',
        answer: 'Businesses can choose from several license types: Commercial License for companies in trading and import/export activities, Service License for businesses providing professional or consultancy services, and Industrial License for manufacturing and light industrial activities. The appropriate license type depends on your business activities.'
      },
      {
        question: 'What technical standards must be met?',
        answer: 'Trakhees requires approved/registered structural engineers, architects, and consultants. Geotechnical reports (soil tests) must meet relevant international codes such as Eurocode or ACI. Structural design calculations must comply with these standards, and all MEP systems must meet Trakhees specifications. Fire safety plans require Civil Defence approval.'
      }
    ]
  }
};

export default function ServiceDetailPage({ params }: { params: Promise<{ serviceId: string }> }) {
  const { serviceId } = React.use(params);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const serviceData = servicesData[serviceId];

  if (!serviceData) {
    notFound();
  }

  const serviceUrl = `https://buildingapprovals.ae/services/${serviceId}`;
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceData.title,
    description: serviceData.overview,
    serviceType: serviceData.title,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Dubai, UAE',
    },
    provider: {
      '@type': 'LocalBusiness',
      name: 'Building Approvals',
      url: 'https://buildingapprovals.ae',
      telephone: '+971589575610',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Office No: 302-2, Al Babtain building, 2nd St - Port Saeed',
        addressLocality: 'Dubai',
        addressCountry: 'AE',
      },
    },
    url: serviceUrl,
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="service-detail-page">
      <Script
        id={`ld-service-${serviceId}`}
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* Hero Section */}
      <section className="service-detail-hero">
        <div className="service-detail-hero-content">
          <div className="service-detail-icon-badge">
            {serviceData.icon}
          </div>
          <h1 className="service-detail-title">{serviceData.title}</h1>
          <p className="service-detail-subtitle">{serviceData.subtitle}</p>
          <div className="service-detail-hero-actions">
            <button
              className="btn-primary-service"
              onClick={() => setIsModalOpen(true)}
            >
              Get Started Now
            </button>
            <a href="/services" className="btn-secondary-service">
              View All Services
            </a>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="service-section service-overview">
        <div className="service-section-container">
          <h2 className="service-section-title">Overview</h2>
          <p className="service-overview-text">{serviceData.overview}</p>
        </div>
      </section>

      {/* Why Important Section */}
      <section className="service-section service-importance">
        <div className="service-section-container">
          <h2 className="service-section-title">{serviceData.whyImportant.title}</h2>
          <p className="service-importance-description">{serviceData.whyImportant.description}</p>
          <ul className="service-importance-list">
            {serviceData.whyImportant.points.map((point, index) => (
              <li key={index} className="service-importance-item">
                <svg className="check-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process Section */}
      <section className="service-section service-process">
        <div className="service-section-container">
          <h2 className="service-section-title">{serviceData.process.title}</h2>
          <div className="process-steps">
            {serviceData.process.steps.map((step) => (
              <div key={step.number} className="process-step">
                <div className="process-step-number">{step.number}</div>
                <div className="process-step-content">
                  <h3 className="process-step-title">{step.title}</h3>
                  <p className="process-step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="service-section service-requirements">
        <div className="service-section-container">
          <h2 className="service-section-title">{serviceData.requirements.title}</h2>
          <ul className="requirements-list">
            {serviceData.requirements.items.map((item, index) => (
              <li key={index} className="requirement-item">
                <svg className="doc-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2V8H20M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="service-section service-benefits">
        <div className="service-section-container">
          <h2 className="service-section-title">{serviceData.benefits.title}</h2>
          <div className="benefits-grid">
            {serviceData.benefits.items.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <svg className="benefit-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11L12 14L22 4M21 12V19C21 19.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V6C3 5.46957 3.21071 4.96086 3.58579 4.58579C3.96086 4.21071 4.46957 4 5 4H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="benefit-text">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      {serviceData.challenges && (
        <section className="service-section service-challenges">
          <div className="service-section-container">
            <h2 className="service-section-title">{serviceData.challenges.title}</h2>
            <div className="challenges-grid">
              {serviceData.challenges.items.map((challenge, index) => (
                <div key={index} className="challenge-card">
                  <svg className="challenge-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="challenge-text">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      {serviceData.timeline && (
        <section className="service-section service-timeline">
          <div className="service-section-container">
            <div className="timeline-card">
              <svg className="timeline-icon" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div>
                <h3 className="timeline-title">Approval Timeline</h3>
                <p className="timeline-text">{serviceData.timeline}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FAQs Section */}
      {serviceData.faqs && serviceData.faqs.length > 0 && (
        <section className="service-section service-faqs">
          <div className="service-section-container">
            <h2 className="service-section-title">Frequently Asked Questions</h2>
            <div className="faqs-list">
              {serviceData.faqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <button
                    className={`faq-question ${activeFaq === index ? 'active' : ''}`}
                    onClick={() => toggleFaq(index)}
                  >
                    {faq.question}
                    <svg className="faq-icon" viewBox="0 0 24 24" fill="none">
                      <path d="M19 9L12 16L5 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  {activeFaq === index && (
                    <div className="faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="service-cta-section">
        <div className="service-cta-container">
          <h2 className="service-cta-title">Ready to Get Started?</h2>
          <p className="service-cta-text">
            Let our expert consultants guide you through the approval process. Contact us today for a free consultation.
          </p>
          <div className="service-cta-actions">
            <button
              className="btn-primary-service"
              onClick={() => setIsModalOpen(true)}
            >
              Request Free Consultation
            </button>
            <a href="tel:+971589575610" className="btn-secondary-service">
              Call +971 589575610
            </a>
          </div>
        </div>
      </section>

      {/* Contact Modal */}
      <ContactFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedService={serviceData.title}
      />
    </div>
  );
}
