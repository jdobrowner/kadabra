export interface ActionItem {
  id: string
  type: 'email' | 'call' | 'task'
  title: string
  description: string
  status: 'pending' | 'completed'
}

export interface MockActionPlan {
  id: string
  customerId: string
  whatToDo: string
  whyStrategy: string
  status: 'active' | 'completed'
  actionItems: ActionItem[]
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export const mockActionPlans: MockActionPlan[] = [
  {
    id: 'ap-1',
    customerId: '1',
    whatToDo: 'Immediate Retention Intervention: Schedule callback within 2 hours, assign dedicated account manager, create escalation case with management involvement, and provide detailed action plan with 48-hour resolution timeline.',
    whyStrategy: 'Analysis of 3 recent calls shows escalating frustration with service delays. Customer mentioned "exploring alternatives" twice and requested manager escalation. High churn risk requires immediate high-touch intervention.',
    status: 'active',
    actionItems: [
      {
        id: 'ai-1-1',
        type: 'call',
        title: 'Call back within 2 hours',
        description: 'Acknowledge their recent concerns about service delays and apologize for inconvenience',
        status: 'pending'
      },
      {
        id: 'ai-1-2',
        type: 'email',
        title: 'Email billing resolution details',
        description: 'Send detailed breakdown of the $2,450 charge and resolution steps',
        status: 'pending'
      },
      {
        id: 'ai-1-3',
        type: 'task',
        title: 'Create escalation case',
        description: 'Create case with management involvement for priority support',
        status: 'pending'
      }
    ],
    createdAt: '2025-11-06T10:00:00Z',
    updatedAt: '2025-11-06T10:00:00Z'
  },
  {
    id: 'ap-2',
    customerId: '2',
    whatToDo: 'Schedule technical consultation call to discuss API integration requirements, provide technical documentation, and identify best integration approach for their customer management platform.',
    whyStrategy: 'Customer expressed strong interest in integration and needs technical guidance. Opportunity to upsell and strengthen relationship with technical partnership.',
    status: 'active',
    actionItems: [
      {
        id: 'ai-2-1',
        type: 'call',
        title: 'Schedule technical consultation',
        description: 'Schedule 30-minute call to discuss API integration details',
        status: 'pending'
      },
      {
        id: 'ai-2-2',
        type: 'email',
        title: 'Send technical documentation',
        description: 'Email API documentation and integration guide',
        status: 'pending'
      }
    ],
    createdAt: '2025-11-06T08:00:00Z',
    updatedAt: '2025-11-06T08:00:00Z'
  },
  {
    id: 'ap-3',
    customerId: '6',
    whatToDo: 'Urgent retention call: Address service outage concerns, offer compensation, provide service improvement plan, and escalate to executive team for personal assurance.',
    whyStrategy: 'Customer expressed frustration with recent outages that impacted business operations. Requesting cancellation - critical retention situation requiring immediate executive involvement.',
    status: 'active',
    actionItems: [
      {
        id: 'ai-3-1',
        type: 'call',
        title: 'Urgent retention call',
        description: 'Call within 30 minutes to address cancellation request',
        status: 'pending'
      },
      {
        id: 'ai-3-2',
        type: 'email',
        title: 'Send service improvement plan',
        description: 'Email detailed plan addressing outage concerns and compensation',
        status: 'pending'
      },
      {
        id: 'ai-3-3',
        type: 'task',
        title: 'Escalate to executive team',
        description: 'Request executive call to provide personal assurance',
        status: 'pending'
      }
    ],
    createdAt: '2025-11-06T14:30:00Z',
    updatedAt: '2025-11-06T14:30:00Z'
  },
  {
    id: 'ap-4',
    customerId: '7',
    whatToDo: 'Propose premium tier options: Schedule demo of Enterprise features, provide detailed pricing comparison, and discuss migration path from Professional plan.',
    whyStrategy: 'Customer actively exploring upgrade to Enterprise tier. High-value opportunity with clear buying signals. Need to demonstrate value and smooth migration process.',
    status: 'active',
    actionItems: [
      {
        id: 'ai-4-1',
        type: 'call',
        title: 'Schedule Enterprise demo',
        description: 'Schedule 45-minute demo focusing on Enterprise features',
        status: 'pending'
      },
      {
        id: 'ai-4-2',
        type: 'email',
        title: 'Send pricing comparison',
        description: 'Email detailed comparison of Professional vs Enterprise tiers',
        status: 'pending'
      }
    ],
    createdAt: '2025-11-06T09:00:00Z',
    updatedAt: '2025-11-06T09:00:00Z'
  },
  {
    id: 'ap-5',
    customerId: '11',
    whatToDo: 'Executive escalation required: Immediate executive call, provide comprehensive resolution plan addressing all complaints, and assign dedicated senior account manager.',
    whyStrategy: 'Multiple complaints filed about system performance, unresponsive support, and billing issues. Escalated to executive leadership and threatened cancellation. Requires immediate executive intervention.',
    status: 'active',
    actionItems: [
      {
        id: 'ai-5-1',
        type: 'call',
        title: 'Executive escalation call',
        description: 'Schedule immediate call with executive team',
        status: 'pending'
      },
      {
        id: 'ai-5-2',
        type: 'email',
        title: 'Send comprehensive resolution plan',
        description: 'Email plan addressing all complaints and service improvements',
        status: 'pending'
      },
      {
        id: 'ai-5-3',
        type: 'task',
        title: 'Assign senior account manager',
        description: 'Assign dedicated senior account manager for priority support',
        status: 'pending'
      }
    ],
    createdAt: '2025-11-06T15:00:00Z',
    updatedAt: '2025-11-06T15:00:00Z'
  }
]
