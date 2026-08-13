/**
 * Profession profiles drive the fallback AI engine (summaries, skills,
 * achievements) and the cover-letter generator so that each profession
 * gets genuinely distinct, relevant language instead of one generic
 * paragraph reused everywhere (spec §12).
 */

export type ProfessionId =
  | 'cleaning_housekeeping'
  | 'hospitality'
  | 'customer_service'
  | 'sales'
  | 'administration'
  | 'security'
  | 'delivery_driving'
  | 'digital_marketing'
  | 'web_design'
  | 'software_development'
  | 'information_technology'
  | 'engineering'
  | 'accounting_finance'
  | 'healthcare'
  | 'teaching'
  | 'construction'
  | 'retail'
  | 'custom';

export interface ProfessionProfile {
  id: ProfessionId;
  label: string;
  /** Core themes this profession's language should revolve around. */
  themes: string[];
  /** Suggested technical/hard skills, shown as "Add relevant skills" candidates. */
  suggestedSkills: string[];
  /** Suggested soft skills. */
  suggestedSoftSkills: string[];
  /** Sentence fragments used to build achievement bullets. */
  achievementVerbs: string[];
  /** Value proposition fragments used in cover letters / summaries. */
  valuePropositions: string[];
}

export const PROFESSION_PROFILES: Record<ProfessionId, ProfessionProfile> = {
  cleaning_housekeeping: {
    id: 'cleaning_housekeeping',
    label: 'Cleaning & Housekeeping',
    themes: ['hygiene standards', 'safe cleaning practices', 'reliability', 'punctuality', 'attention to detail', 'schedules', 'teamwork'],
    suggestedSkills: ['Deep cleaning', 'Sanitisation protocols', 'Chemical handling & safety', 'Laundry & linen care', 'Inventory of cleaning supplies', 'Waste management'],
    suggestedSoftSkills: ['Reliability', 'Time management', 'Attention to detail', 'Physical stamina', 'Teamwork', 'Discretion'],
    achievementVerbs: ['Maintained', 'Completed', 'Upheld', 'Coordinated', 'Restocked', 'Inspected'],
    valuePropositions: ['a consistent record of punctuality and thoroughness', 'strict adherence to hygiene and safety standards', 'dependable, detail-focused service under time pressure'],
  },
  hospitality: {
    id: 'hospitality',
    label: 'Hospitality',
    themes: ['guest experience', 'service excellence', 'hotel/restaurant standards', 'teamwork', 'multilingual service', 'problem resolution'],
    suggestedSkills: ['Guest relations', 'POS systems', 'Reservation management', 'Front office operations', 'Food & beverage service', 'Housekeeping coordination'],
    suggestedSoftSkills: ['Warm communication', 'Cultural sensitivity', 'Composure under pressure', 'Teamwork', 'Problem-solving'],
    achievementVerbs: ['Delivered', 'Resolved', 'Welcomed', 'Coordinated', 'Upsold', 'Exceeded'],
    valuePropositions: ['a genuine commitment to guest satisfaction', 'calm, professional service even during high-volume periods', 'a track record of positive guest feedback'],
  },
  customer_service: {
    id: 'customer_service',
    label: 'Customer Service',
    themes: ['issue resolution', 'communication', 'CRM systems', 'customer satisfaction', 'first-call resolution'],
    suggestedSkills: ['CRM software', 'Ticketing systems', 'Live chat support', 'Complaint handling', 'Order processing'],
    suggestedSoftSkills: ['Active listening', 'Patience', 'Clear communication', 'Empathy', 'Conflict resolution'],
    achievementVerbs: ['Resolved', 'Responded to', 'Improved', 'Reduced', 'Handled', 'Achieved'],
    valuePropositions: ['a customer-first approach that improves satisfaction scores', 'clear, patient communication under pressure', 'a track record of fast, accurate issue resolution'],
  },
  sales: {
    id: 'sales',
    label: 'Sales',
    themes: ['revenue growth', 'client relationships', 'negotiation', 'targets', 'pipeline management'],
    suggestedSkills: ['Lead generation', 'CRM (Salesforce/HubSpot)', 'Negotiation', 'Account management', 'Sales forecasting'],
    suggestedSoftSkills: ['Persuasion', 'Resilience', 'Relationship building', 'Confidence', 'Goal orientation'],
    achievementVerbs: ['Exceeded', 'Generated', 'Closed', 'Grew', 'Negotiated', 'Onboarded'],
    valuePropositions: ['a consistent record of meeting or exceeding sales targets', 'strong relationship-building that drives repeat business', 'a proactive, target-driven approach to new business'],
  },
  administration: {
    id: 'administration',
    label: 'Administration',
    themes: ['office coordination', 'scheduling', 'documentation', 'process efficiency', 'multitasking'],
    suggestedSkills: ['Microsoft Office / Google Workspace', 'Calendar & travel coordination', 'Document management', 'Data entry', 'Minutes & reporting'],
    suggestedSoftSkills: ['Organisation', 'Discretion', 'Multitasking', 'Attention to detail', 'Communication'],
    achievementVerbs: ['Organised', 'Streamlined', 'Maintained', 'Coordinated', 'Prepared', 'Managed'],
    valuePropositions: ['dependable organisation that keeps offices running smoothly', 'careful attention to detail across documentation and scheduling', 'proactive coordination across departments'],
  },
  security: {
    id: 'security',
    label: 'Security',
    themes: ['safety protocols', 'surveillance', 'access control', 'incident reporting', 'vigilance'],
    suggestedSkills: ['CCTV monitoring', 'Access control systems', 'Incident reporting', 'Patrol procedures', 'Emergency response'],
    suggestedSoftSkills: ['Vigilance', 'Integrity', 'Calm under pressure', 'Physical fitness', 'Communication'],
    achievementVerbs: ['Monitored', 'Prevented', 'Reported', 'Enforced', 'Maintained', 'Responded to'],
    valuePropositions: ['a vigilant, disciplined approach to site safety', 'calm, procedure-driven incident handling', 'a dependable presence that deters risk'],
  },
  delivery_driving: {
    id: 'delivery_driving',
    label: 'Delivery & Driving',
    themes: ['route efficiency', 'timeliness', 'vehicle care', 'safe driving', 'customer handoff'],
    suggestedSkills: ['UAE route knowledge', 'GPS navigation apps', 'Vehicle maintenance checks', 'Delivery scheduling', 'Cash/COD handling'],
    suggestedSoftSkills: ['Punctuality', 'Safe driving habits', 'Time management', 'Reliability', 'Customer courtesy'],
    achievementVerbs: ['Delivered', 'Maintained', 'Completed', 'Reduced', 'Achieved', 'Covered'],
    valuePropositions: ['a strong on-time delivery record', 'safe, courteous driving with zero at-fault incidents', 'efficient route planning across the UAE'],
  },
  digital_marketing: {
    id: 'digital_marketing',
    label: 'Digital Marketing',
    themes: ['campaign performance', 'social media growth', 'SEO/SEM', 'analytics', 'content strategy'],
    suggestedSkills: ['Google Ads', 'Meta Ads Manager', 'SEO', 'Google Analytics', 'Email marketing', 'Content calendars'],
    suggestedSoftSkills: ['Creativity', 'Data-driven thinking', 'Communication', 'Adaptability'],
    achievementVerbs: ['Increased', 'Grew', 'Launched', 'Optimised', 'Managed', 'Improved'],
    valuePropositions: ['a data-driven approach that improves campaign ROI', 'a track record of growing engaged audiences', 'strong cross-channel campaign execution'],
  },
  web_design: {
    id: 'web_design',
    label: 'Web Design',
    themes: ['responsive design', 'UX', 'mobile optimisation', 'website structure', 'business goals'],
    suggestedSkills: ['Figma', 'Responsive/mobile-first design', 'HTML/CSS', 'UX research', 'Design systems', 'Accessibility (WCAG)'],
    suggestedSoftSkills: ['Visual communication', 'Attention to detail', 'Collaboration with developers', 'Client communication'],
    achievementVerbs: ['Designed', 'Redesigned', 'Improved', 'Launched', 'Optimised', 'Delivered'],
    valuePropositions: ['clean, conversion-focused, mobile-first design', 'user experience decisions grounded in real research', 'design work that aligns closely with business goals'],
  },
  software_development: {
    id: 'software_development',
    label: 'Software Development',
    themes: ['clean code', 'system design', 'testing', 'delivery speed', 'collaboration'],
    suggestedSkills: ['JavaScript/TypeScript', 'React', 'Node.js', 'REST/GraphQL APIs', 'Git', 'CI/CD', 'Unit testing'],
    suggestedSoftSkills: ['Problem-solving', 'Collaboration', 'Communication', 'Ownership', 'Adaptability'],
    achievementVerbs: ['Built', 'Shipped', 'Refactored', 'Reduced', 'Automated', 'Optimised'],
    valuePropositions: ['reliable, well-tested code shipped on schedule', 'a pragmatic approach to solving real product problems', 'strong collaboration across product and design'],
  },
  information_technology: {
    id: 'information_technology',
    label: 'Information Technology',
    themes: ['system uptime', 'troubleshooting', 'network security', 'support tickets', 'infrastructure'],
    suggestedSkills: ['Windows/Linux administration', 'Networking (TCP/IP)', 'Active Directory', 'Helpdesk/ticketing tools', 'Cloud basics (Azure/AWS)'],
    suggestedSoftSkills: ['Troubleshooting', 'Patience', 'Clear technical communication', 'Reliability'],
    achievementVerbs: ['Resolved', 'Maintained', 'Reduced', 'Deployed', 'Configured', 'Improved'],
    valuePropositions: ['fast, reliable technical troubleshooting', 'a proactive approach to system uptime and security', 'clear communication that helps non-technical users'],
  },
  engineering: {
    id: 'engineering',
    label: 'Engineering',
    themes: ['technical precision', 'project delivery', 'standards compliance', 'safety', 'problem-solving'],
    suggestedSkills: ['AutoCAD', 'Project scheduling', 'Quality/safety standards', 'Technical documentation', 'Site supervision'],
    suggestedSoftSkills: ['Analytical thinking', 'Precision', 'Collaboration', 'Safety-consciousness'],
    achievementVerbs: ['Designed', 'Delivered', 'Reduced', 'Improved', 'Supervised', 'Ensured'],
    valuePropositions: ['precise, standards-compliant technical work', 'a strong record of on-time, on-budget delivery', 'a safety-first approach to engineering execution'],
  },
  accounting_finance: {
    id: 'accounting_finance',
    label: 'Accounting & Finance',
    themes: ['accuracy', 'reconciliation', 'reporting', 'compliance', 'budgeting'],
    suggestedSkills: ['Excel (advanced)', 'ERP systems (SAP/Oracle)', 'Reconciliation', 'VAT/UAE compliance', 'Financial reporting'],
    suggestedSoftSkills: ['Accuracy', 'Confidentiality', 'Analytical thinking', 'Organisation'],
    achievementVerbs: ['Reconciled', 'Reduced', 'Prepared', 'Managed', 'Audited', 'Streamlined'],
    valuePropositions: ['meticulous accuracy across reporting and reconciliation', 'strong command of UAE financial compliance requirements', 'process improvements that save time each close cycle'],
  },
  healthcare: {
    id: 'healthcare',
    label: 'Healthcare',
    themes: ['patient care', 'clinical accuracy', 'compliance', 'compassion', 'teamwork'],
    suggestedSkills: ['Patient assessment', 'Clinical documentation', 'DHA/HAAD/MOH licensing awareness', 'Infection control', 'Electronic health records'],
    suggestedSoftSkills: ['Compassion', 'Attention to detail', 'Composure under pressure', 'Teamwork', 'Communication'],
    achievementVerbs: ['Provided', 'Managed', 'Improved', 'Coordinated', 'Monitored', 'Supported'],
    valuePropositions: ['compassionate, patient-centred care', 'strict adherence to clinical protocols and safety', 'calm, accurate performance in high-pressure situations'],
  },
  teaching: {
    id: 'teaching',
    label: 'Teaching',
    themes: ['curriculum delivery', 'student engagement', 'classroom management', 'assessment', 'communication with parents'],
    suggestedSkills: ['Curriculum planning', 'Classroom management', 'Assessment & grading', 'Differentiated instruction', 'EdTech tools'],
    suggestedSoftSkills: ['Patience', 'Communication', 'Adaptability', 'Empathy', 'Organisation'],
    achievementVerbs: ['Taught', 'Developed', 'Improved', 'Mentored', 'Organised', 'Implemented'],
    valuePropositions: ['engaging, student-centred lesson delivery', 'measurable improvements in student outcomes', 'strong communication with students and parents alike'],
  },
  construction: {
    id: 'construction',
    label: 'Construction',
    themes: ['site safety', 'project timelines', 'quality control', 'coordination', 'compliance'],
    suggestedSkills: ['Site supervision', 'Health & safety (HSE)', 'Reading technical drawings', 'Quality control', 'Material coordination'],
    suggestedSoftSkills: ['Safety-consciousness', 'Reliability', 'Physical stamina', 'Teamwork', 'Problem-solving'],
    achievementVerbs: ['Supervised', 'Completed', 'Ensured', 'Reduced', 'Coordinated', 'Delivered'],
    valuePropositions: ['a strict, safety-first approach to site work', 'dependable delivery against tight project timelines', 'careful quality control at every stage'],
  },
  retail: {
    id: 'retail',
    label: 'Retail',
    themes: ['customer experience', 'merchandising', 'sales targets', 'stock management', 'teamwork'],
    suggestedSkills: ['POS systems', 'Visual merchandising', 'Inventory management', 'Upselling', 'Cash handling'],
    suggestedSoftSkills: ['Customer focus', 'Reliability', 'Teamwork', 'Communication', 'Adaptability'],
    achievementVerbs: ['Achieved', 'Increased', 'Maintained', 'Organised', 'Assisted', 'Reduced'],
    valuePropositions: ['a friendly, sales-focused approach to customer service', 'consistent achievement of sales and stock-accuracy targets', 'well-presented, well-stocked shop floors'],
  },
  custom: {
    id: 'custom',
    label: 'Custom profession',
    themes: ['relevant skills', 'professional reliability', 'genuine interest in the role'],
    suggestedSkills: [],
    suggestedSoftSkills: ['Communication', 'Reliability', 'Teamwork', 'Adaptability'],
    achievementVerbs: ['Achieved', 'Delivered', 'Improved', 'Managed', 'Supported', 'Completed'],
    valuePropositions: ['genuine, transferable strengths relevant to the role', 'a strong work ethic and willingness to learn quickly'],
  },
};

export const PROFESSION_LIST: ProfessionProfile[] = Object.values(PROFESSION_PROFILES);
