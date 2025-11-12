export interface MockCalendarEvent {
  id: string
  customerId: string
  title: string
  date: string // ISO date string
  type: 'call' | 'meeting' | 'follow_up' | 'demo'
  goal: string
  prepNotes?: string
  talkingPoints?: string[]
}

export const mockCalendarEvents: MockCalendarEvent[] = [
  {
    id: 'cal-1',
    customerId: '1',
    title: 'Follow-up Call - Billing Resolution',
    date: '2025-11-06T16:00:00Z',
    type: 'call',
    goal: 'Confirm billing correction processed and introduce dedicated account manager. Address any remaining concerns about service reliability.',
    prepNotes: 'Customer had billing issue with $2,450 charge. Correction promised within 2 hours. Express understanding of frustration and emphasize commitment to preventing future issues.',
    talkingPoints: [
      'Confirm billing correction is complete',
      'Introduce dedicated account manager',
      'Address service reliability concerns',
      'Reassure customer of our commitment'
    ]
  },
  {
    id: 'cal-2',
    customerId: '2',
    title: 'Technical Consultation - API Integration',
    date: '2025-11-08T14:00:00Z',
    type: 'call',
    goal: 'Discuss API integration requirements, review technical documentation, and identify best integration approach for their customer management platform.',
    prepNotes: 'Customer needs REST API integration with webhook support. Prepare rate limits documentation, error handling best practices, and large data sync strategies.',
    talkingPoints: [
      'Review API documentation together',
      'Discuss authentication setup',
      'Plan webhook integration',
      'Address rate limits and scalability',
      'Provide code samples'
    ]
  },
  {
    id: 'cal-3',
    customerId: '7',
    title: 'Enterprise Plan Demo',
    date: '2025-11-08T14:00:00Z',
    type: 'demo',
    goal: 'Demonstrate Enterprise features including advanced security, compliance certifications, and dedicated account management. Discuss migration path and pricing.',
    prepNotes: 'Customer is evaluating upgrade from Professional to Enterprise. Focus on security features, compliance (SOC 2), and seamless migration process.',
    talkingPoints: [
      'Show advanced security features',
      'Review compliance certifications',
      'Discuss dedicated account management',
      'Explain migration process',
      'Review pricing and value proposition'
    ]
  },
  {
    id: 'cal-4',
    customerId: '6',
    title: 'Executive Retention Call',
    date: '2025-11-06T17:00:00Z',
    type: 'call',
    goal: 'Address cancellation request, provide service improvement plan, and discuss compensation for downtime. Personal assurance from executive team.',
    prepNotes: 'CRITICAL: Customer requesting cancellation due to service outages. Prepare detailed service improvement plan, compensation proposal, and personal commitment from leadership.',
    talkingPoints: [
      'Acknowledge service issues and apologize',
      'Present comprehensive service improvement plan',
      'Discuss compensation for downtime',
      'Provide personal commitment from leadership',
      'Address concerns about future reliability'
    ]
  },
  {
    id: 'cal-5',
    customerId: '12',
    title: 'Enterprise Security Consultation',
    date: '2025-11-07T10:00:00Z',
    type: 'meeting',
    goal: 'Review security features and compliance certifications for Enterprise plan evaluation. Discuss specific compliance requirements.',
    prepNotes: 'Customer evaluating Enterprise plan for advanced security. Prepare compliance documentation and security feature overview.',
    talkingPoints: [
      'Review SOC 2 Type II certification',
      'Discuss advanced encryption',
      'Cover IP allowlisting and SSO',
      'Address specific compliance requirements'
    ]
  },
  {
    id: 'cal-6',
    customerId: '9',
    title: 'Contract Renewal Discussion',
    date: '2025-11-07T14:00:00Z',
    type: 'follow_up',
    goal: 'Review annual contract renewal, discuss usage patterns, and negotiate terms. Long-term customer relationship.',
    prepNotes: 'Annual contract renewal in 45 days. Review usage patterns and negotiate favorable terms to maintain long-term relationship.',
    talkingPoints: [
      'Review contract terms and usage',
      'Discuss renewal options',
      'Negotiate terms',
      'Address any concerns',
      'Confirm commitment to partnership'
    ]
  }
]
