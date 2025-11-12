export interface Communication {
  type: 'phone' | 'video' | 'email' | 'sms' | 'ai-call' | 'voice-message'
  count: number
  lastTime: string
}

export interface MockCustomer {
  id: string
  name: string
  companyName: string
  badge: 'at-risk' | 'opportunity' | 'lead' | 'follow-up' | 'no-action'
  communications: Communication[]
  topic: string
  longTopic: string
  aiRecommendation: string
  lastCallTime: string
  avatar: string
}

export const mockCustomers: MockCustomer[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    companyName: 'Acme Corporation',
    badge: 'at-risk',
    communications: [
      { type: 'phone', count: 3, lastTime: '2h ago' },
      { type: 'email', count: 2, lastTime: '5h ago' }
    ],
    topic: 'Billing Issue - Overcharge',
    longTopic: 'Customer contacted us regarding an unexpected charge of $2,450 on their monthly invoice, significantly higher than their usual $800 fee. Immediate billing review needed.',
    aiRecommendation: 'Immediate callback with billing specialist',
    lastCallTime: '2h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
  },
  {
    id: '2',
    name: 'Michael Chen',
    companyName: 'TechStart Inc',
    badge: 'opportunity',
    communications: [
      { type: 'video', count: 2, lastTime: '4h ago' },
      { type: 'phone', count: 1, lastTime: '6h ago' }
    ],
    topic: 'Integration Support',
    longTopic: 'Looking to integrate our API with their customer management platform. Needs technical documentation and wants to schedule a consultation call.',
    aiRecommendation: 'Schedule technical consultation',
    lastCallTime: '4h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    companyName: 'Global Systems Ltd',
    badge: 'lead',
    communications: [
      { type: 'email', count: 3, lastTime: '6h ago' },
      { type: 'sms', count: 1, lastTime: '8h ago' }
    ],
    topic: 'Feature Request',
    longTopic: 'Interested in a custom reporting feature for automated weekly team performance summaries. Wants to know if we can build it, timeline, and pricing.',
    aiRecommendation: 'Add to product roadmap discussion',
    lastCallTime: '6h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
  },
  {
    id: '4',
    name: 'David Kim',
    companyName: 'Innovation Labs',
    badge: 'follow-up',
    communications: [
      { type: 'phone', count: 4, lastTime: '1h ago' },
      { type: 'video', count: 1, lastTime: '3h ago' }
    ],
    topic: 'Product Demo Request',
    longTopic: 'Requested a product demonstration focusing on advanced analytics dashboard and AI-powered insights. Multiple stakeholders will attend.',
    aiRecommendation: 'Schedule product demonstration',
    lastCallTime: '1h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
  },
  {
    id: '5',
    name: 'Jennifer Martinez',
    companyName: 'Enterprise Solutions',
    badge: 'no-action',
    communications: [
      { type: 'email', count: 1, lastTime: '8h ago' }
    ],
    topic: 'General Inquiry',
    longTopic: 'General inquiry about service offerings and pricing tiers. Initial exploratory contact with no specific requirements.',
    aiRecommendation: 'Standard information package sent',
    lastCallTime: '8h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
  },
  {
    id: '6',
    name: 'Robert Taylor',
    companyName: 'Digital Ventures',
    badge: 'at-risk',
    communications: [
      { type: 'phone', count: 5, lastTime: '30m ago' },
      { type: 'sms', count: 2, lastTime: '1h ago' },
      { type: 'email', count: 1, lastTime: '2h ago' }
    ],
    topic: 'Service Cancellation Request',
    longTopic: 'Expressed frustration with recent service outages and requesting subscription cancellation. Downtime impacted business operations. Critical retention situation.',
    aiRecommendation: 'Urgent retention call needed',
    lastCallTime: '30m ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
  },
  {
    id: '7',
    name: 'Lisa Anderson',
    companyName: 'Cloud Services Co',
    badge: 'opportunity',
    communications: [
      { type: 'phone', count: 2, lastTime: '3h ago' },
      { type: 'video', count: 1, lastTime: '4h ago' }
    ],
    topic: 'Upgrade Inquiry',
    longTopic: 'Currently on Professional plan, exploring upgrade to Enterprise tier. Wants details on additional features, pricing, and migration considerations.',
    aiRecommendation: 'Propose premium tier options',
    lastCallTime: '3h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
  },
  {
    id: '8',
    name: 'James Wilson',
    companyName: 'Data Analytics Group',
    badge: 'lead',
    communications: [
      { type: 'email', count: 2, lastTime: '5h ago' },
      { type: 'phone', count: 1, lastTime: '7h ago' }
    ],
    topic: 'Pricing Information',
    longTopic: 'Evaluating platform for 50-person team. Requested detailed enterprise pricing, including volume discounts and billing options.',
    aiRecommendation: 'Send detailed pricing sheet',
    lastCallTime: '5h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
  },
  {
    id: '9',
    name: 'Patricia Brown',
    companyName: 'Smart Solutions',
    badge: 'follow-up',
    communications: [
      { type: 'phone', count: 2, lastTime: '2h ago' },
      { type: 'email', count: 1, lastTime: '3h ago' }
    ],
    topic: 'Contract Renewal',
    longTopic: 'Annual contract up for renewal in 45 days. Initiated discussions to review usage and negotiate terms. Long-term customer with strong relationship.',
    aiRecommendation: 'Schedule renewal discussion',
    lastCallTime: '2h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-10.jpg',
  },
  {
    id: '10',
    name: 'William Davis',
    companyName: 'Future Tech',
    badge: 'no-action',
    communications: [
      { type: 'email', count: 1, lastTime: '12h ago' }
    ],
    topic: 'Support Documentation',
    longTopic: 'Requested links to support documentation and user guides. Trying to set up a new feature and reviewing resources first.',
    aiRecommendation: 'Email documentation links',
    lastCallTime: '12h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-11.jpg',
  },
  {
    id: '11',
    name: 'Mary Garcia',
    companyName: 'NextGen Industries',
    badge: 'at-risk',
    communications: [
      { type: 'phone', count: 4, lastTime: '45m ago' },
      { type: 'sms', count: 3, lastTime: '1h ago' },
      { type: 'email', count: 2, lastTime: '2h ago' }
    ],
    topic: 'Multiple Complaints',
    longTopic: 'Filed multiple complaints about system performance, unresponsive support, and billing issues. Escalated to executive leadership and threatened cancellation.',
    aiRecommendation: 'Executive escalation required',
    lastCallTime: '45m ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-12.jpg',
  },
  {
    id: '12',
    name: 'Richard Moore',
    companyName: 'Advanced Systems',
    badge: 'opportunity',
    communications: [
      { type: 'video', count: 1, lastTime: '4h ago' },
      { type: 'phone', count: 1, lastTime: '5h ago' }
    ],
    topic: 'Enterprise Plan Interest',
    longTopic: 'Evaluating upgrade to Enterprise plan for advanced security features and dedicated account management. Needs compliance certification verification.',
    aiRecommendation: 'Qualify for enterprise sale',
    lastCallTime: '4h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
  },
  {
    id: '13',
    name: 'Thomas Wright',
    companyName: 'Secure Networks',
    badge: 'lead',
    communications: [
      { type: 'phone', count: 1, lastTime: '3h ago' }
    ],
    topic: 'Security Consultation',
    longTopic: 'Called to inquire about our security features and compliance certifications. First-time contact interested in learning more.',
    aiRecommendation: 'Schedule security consultation call',
    lastCallTime: '3h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-13.jpg',
  },
  {
    id: '14',
    name: 'Amanda Foster',
    companyName: 'Creative Media',
    badge: 'follow-up',
    communications: [
      { type: 'email', count: 1, lastTime: '1h ago' }
    ],
    topic: 'Trial Extension Request',
    longTopic: 'Requested extension of free trial period to evaluate additional features before making a decision. Currently in evaluation phase.',
    aiRecommendation: 'Review trial extension request',
    lastCallTime: '1h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-14.jpg',
  },
  {
    id: '15',
    name: 'Daniel Lee',
    companyName: 'Startup Ventures',
    badge: 'opportunity',
    communications: [
      { type: 'video', count: 1, lastTime: '5h ago' }
    ],
    topic: 'Partnership Inquiry',
    longTopic: 'Scheduled a video call to discuss potential partnership opportunities and integration possibilities between our platforms.',
    aiRecommendation: 'Follow up on partnership discussion',
    lastCallTime: '5h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-15.jpg',
  },
  {
    id: '16',
    name: 'Rachel Green',
    companyName: 'Healthcare Solutions',
    badge: 'no-action',
    communications: [
      { type: 'sms', count: 1, lastTime: '7h ago' }
    ],
    topic: 'Account Access Issue',
    longTopic: 'Sent SMS regarding account login problems. Standard password reset instructions have been provided. No further action needed.',
    aiRecommendation: 'Monitor account access resolution',
    lastCallTime: '7h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-16.jpg',
  },
  {
    id: '17',
    name: 'Kevin Park',
    companyName: 'Retail Innovations',
    badge: 'follow-up',
    communications: [
      { type: 'phone', count: 1, lastTime: '9h ago' }
    ],
    topic: 'Feature Availability',
    longTopic: 'Called to ask about availability of mobile app features for their retail team. Needs clarification on rollout timeline.',
    aiRecommendation: 'Provide mobile app feature timeline',
    lastCallTime: '9h ago',
    avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-17.jpg',
  },
]
