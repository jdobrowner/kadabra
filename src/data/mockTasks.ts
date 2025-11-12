export interface MockTask {
  id: string
  customerId?: string
  conversationId?: string
  actionPlanId?: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'done'
  dueDate?: string // ISO date string
  owner?: string
  createdAt: string
  updatedAt: string
}

export const mockTasks: MockTask[] = [
  {
    id: 'task-1',
    customerId: '1',
    actionPlanId: 'ap-1',
    title: 'Process billing correction for Sarah Johnson',
    description: 'Correct $2,450 charge to standard $800 fee and issue credit. Send confirmation email.',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2025-11-06T16:00:00Z',
    owner: 'John Smith',
    createdAt: '2025-11-06T10:00:00Z',
    updatedAt: '2025-11-06T14:30:00Z'
  },
  {
    id: 'task-2',
    customerId: '1',
    actionPlanId: 'ap-1',
    title: 'Assign dedicated account manager to Sarah Johnson',
    description: 'Assign senior account manager to oversee billing and provide personalized support.',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-11-06T18:00:00Z',
    owner: 'John Smith',
    createdAt: '2025-11-06T10:00:00Z',
    updatedAt: '2025-11-06T10:00:00Z'
  },
  {
    id: 'task-3',
    customerId: '2',
    actionPlanId: 'ap-2',
    title: 'Send API documentation to Michael Chen',
    description: 'Send complete API documentation including authentication, endpoints, webhook setup, and code samples.',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-11-06T18:00:00Z',
    owner: 'Emily Davis',
    createdAt: '2025-11-06T08:00:00Z',
    updatedAt: '2025-11-06T08:00:00Z'
  },
  {
    id: 'task-4',
    customerId: '6',
    actionPlanId: 'ap-3',
    title: 'Prepare service improvement plan for Robert Taylor',
    description: 'Create comprehensive plan addressing outage concerns, compensation proposal, and future reliability measures.',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2025-11-06T16:30:00Z',
    owner: 'John Smith',
    createdAt: '2025-11-06T14:30:00Z',
    updatedAt: '2025-11-06T15:00:00Z'
  },
  {
    id: 'task-5',
    customerId: '6',
    actionPlanId: 'ap-3',
    title: 'Arrange executive call with Robert Taylor',
    description: 'Schedule call with CEO or CTO to provide personal assurance and address cancellation request.',
    priority: 'urgent',
    status: 'todo',
    dueDate: '2025-11-06T17:00:00Z',
    owner: 'John Smith',
    createdAt: '2025-11-06T14:30:00Z',
    updatedAt: '2025-11-06T14:30:00Z'
  },
  {
    id: 'task-6',
    customerId: '7',
    actionPlanId: 'ap-4',
    title: 'Prepare Enterprise plan pricing comparison',
    description: 'Create detailed comparison of Professional vs Enterprise tiers with feature breakdown and migration costs.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2025-11-06T18:00:00Z',
    owner: 'Michael Chen',
    createdAt: '2025-11-06T09:00:00Z',
    updatedAt: '2025-11-06T09:00:00Z'
  },
  {
    id: 'task-7',
    customerId: '11',
    actionPlanId: 'ap-5',
    title: 'Executive escalation for Mary Garcia',
    description: 'Arrange immediate call with executive team to address multiple complaints and prevent cancellation.',
    priority: 'urgent',
    status: 'todo',
    dueDate: '2025-11-06T16:00:00Z',
    owner: 'John Smith',
    createdAt: '2025-11-06T15:00:00Z',
    updatedAt: '2025-11-06T15:00:00Z'
  },
  {
    id: 'task-8',
    customerId: '11',
    actionPlanId: 'ap-5',
    title: 'Create comprehensive resolution plan for Mary Garcia',
    description: 'Address all complaints: system performance, unresponsive support, and billing issues. Include service improvements and compensation.',
    priority: 'urgent',
    status: 'in_progress',
    dueDate: '2025-11-06T17:00:00Z',
    owner: 'John Smith',
    createdAt: '2025-11-06T15:00:00Z',
    updatedAt: '2025-11-06T15:30:00Z'
  },
  {
    id: 'task-9',
    customerId: '3',
    title: 'Follow up on feature request for Emily Rodriguez',
    description: 'Review custom reporting feature request and prepare response with feasibility assessment and timeline.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2025-11-07T12:00:00Z',
    owner: 'Emily Davis',
    createdAt: '2025-11-06T06:00:00Z',
    updatedAt: '2025-11-06T06:00:00Z'
  },
  {
    id: 'task-10',
    customerId: '4',
    title: 'Schedule product demo for David Kim',
    description: 'Schedule demo focusing on advanced analytics dashboard and AI-powered insights. Multiple stakeholders will attend.',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-11-07T14:00:00Z',
    owner: 'Michael Chen',
    createdAt: '2025-11-06T01:00:00Z',
    updatedAt: '2025-11-06T01:00:00Z'
  },
  {
    id: 'task-11',
    customerId: '12',
    title: 'Prepare compliance documentation for Richard Moore',
    description: 'Gather all compliance certifications and documentation for Enterprise plan evaluation.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2025-11-07T09:00:00Z',
    owner: 'Michael Chen',
    createdAt: '2025-11-06T04:00:00Z',
    updatedAt: '2025-11-06T04:00:00Z'
  },
  {
    id: 'task-12',
    customerId: '9',
    title: 'Review contract renewal terms for Patricia Brown',
    description: 'Review annual contract renewal, analyze usage patterns, and prepare negotiation proposal.',
    priority: 'medium',
    status: 'todo',
    dueDate: '2025-11-07T13:00:00Z',
    owner: 'Emily Davis',
    createdAt: '2025-11-06T02:00:00Z',
    updatedAt: '2025-11-06T02:00:00Z'
  }
]
