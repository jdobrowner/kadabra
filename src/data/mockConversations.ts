export interface Message {
  role: 'assistant' | 'customer' | 'agent'
  content: string
  timestamp: string
}

export interface MockConversation {
  id: string
  customerId: string
  channel: 'phone' | 'email' | 'chat' | 'video' | 'sms' | 'ai-call' | 'voice-message'
  date: string
  duration?: number // in minutes for phone/video
  transcript: string
  messages?: Message[] // for phone/chat conversations
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative' | 'mixed'
  intent?: string
  agent?: string
  subject?: string // for email
  insights?: string[]
  coachingSuggestions?: string[]
  keyStats?: Record<string, any>
  messageCount?: number
}

// Helper to create date strings relative to now
const hoursAgo = (hours: number): string => {
  const date = new Date()
  date.setHours(date.getHours() - hours)
  return date.toISOString()
}

const daysAgo = (days: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export const mockConversations: MockConversation[] = [
  // Customer 1 - Sarah Johnson (Acme Corporation) - at-risk
  // 3 phone calls, 2 emails (lastTime: 2h ago)
  {
    id: 'conv-1-1',
    customerId: '1',
    channel: 'phone',
    date: hoursAgo(2),
    duration: 15,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Sarah Johnson: Hi, I'm calling about my latest invoice. I was charged $2,450 this month, but my usual fee is only $800. This is completely unexpected and I need this resolved immediately.

[00:45] Mindi AI Assistant: I understand your concern about the unexpected charge. Let me connect you with our billing specialist right away.

[01:00] John Smith: Hello Sarah, this is John from our billing department. I can see the charge on your account. Let me review this for you.

[02:15] Sarah Johnson: This is unacceptable. I've been a customer for three years and this has never happened before. I'm seriously considering switching to another provider if this isn't resolved quickly.

[03:30] John Smith: I completely understand your frustration. I'm reviewing your account now and I can see there was an error in the billing calculation. I'll have this corrected immediately and we'll issue a credit.

[04:00] Sarah Johnson: How long will this take? I need this resolved today.

[05:20] John Smith: I'll have the correction processed within 2 hours and you'll receive a confirmation email. I'll also personally follow up with you to ensure everything is resolved to your satisfaction.

[06:00] Sarah Johnson: Thank you. I appreciate that. But honestly, I'm still very concerned about how this happened in the first place.

[07:15] John Smith: I understand, and I want to make sure we prevent this from happening again. I'm going to assign a dedicated account manager to your account who will personally oversee your billing going forward.

[08:00] Sarah Johnson: That would be helpful. I really need someone I can trust to catch these issues before they become problems.

[09:30] John Smith: Absolutely. I'll make sure your dedicated account manager is assigned by end of day today, and they'll reach out to you tomorrow morning to introduce themselves.

[10:00] Sarah Johnson: Okay, that sounds good. I'll wait for the billing correction and the account manager call.

[11:00] John Smith: Perfect. Is there anything else I can help you with today?

[11:30] Sarah Johnson: No, that's all for now. Thank you for your help.

[12:00] John Smith: You're very welcome, Sarah. Have a great day and we'll be in touch soon.`,
    summary: 'Customer called regarding unexpected $2,450 charge (usually $800). Billing error identified and correction promised within 2 hours. Dedicated account manager will be assigned. Customer expressed frustration and concern about service reliability.',
    sentiment: 'negative',
    intent: 'Billing dispute resolution',
    messageCount: 12
  },
  {
    id: 'conv-1-2',
    customerId: '1',
    channel: 'phone',
    date: hoursAgo(5),
    duration: 8,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:10] Sarah Johnson: I need to speak with someone about my invoice immediately. There's been a billing error.

[00:30] Mindi AI Assistant: I understand this is urgent. Let me connect you with our billing team right away.

[00:45] John Smith: Hi Sarah, this is John. I can see you've been trying to reach us. What's the issue with your invoice?

[01:00] Sarah Johnson: My invoice shows $2,450 but it should only be $800. This is the second time I've called about this today.

[02:00] John Smith: I'm so sorry for the inconvenience. Let me pull up your account and investigate this right now.

[03:00] Sarah Johnson: I need this fixed today. This is affecting our cash flow.

[04:00] John Smith: I understand completely. I'm escalating this to our finance director and we'll have a resolution within the hour.

[05:00] Sarah Johnson: Thank you. I'll be waiting for your call.`,
    summary: 'Follow-up call regarding billing issue. Customer frustrated with delay. Escalation promised.',
    sentiment: 'negative',
    intent: 'Billing follow-up',
    messageCount: 7
  },
  {
    id: 'conv-1-3',
    customerId: '1',
    channel: 'phone',
    date: daysAgo(1),
    duration: 12,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:12] Sarah Johnson: I'm calling to check on the status of my account. I've been having some concerns about billing accuracy.

[00:30] Mindi AI Assistant: I can help you with that. Let me connect you with an account specialist.

[00:45] Emily Davis: Hi Sarah, this is Emily. I'd be happy to review your account with you. What specific concerns do you have?

[01:30] Sarah Johnson: Well, I've noticed some inconsistencies in my invoices over the past few months. Nothing major, but I want to make sure everything is correct.

[02:30] Emily Davis: Absolutely, I understand. Let me pull up your billing history and we can review it together.

[04:00] Emily Davis: I can see your account history. Your monthly fee has been consistent at $800. Is there a specific invoice you're concerned about?

[05:00] Sarah Johnson: Not yet, but I wanted to make sure everything is set up correctly going forward.

[06:00] Emily Davis: That's very proactive of you. I can set up a billing review process for your account to catch any issues early.

[07:00] Sarah Johnson: That would be great. Thank you for your help.`,
    summary: 'Proactive call from customer checking on account billing accuracy. Billing review process offered.',
    sentiment: 'neutral',
    intent: 'Account verification',
    messageCount: 8
  },
  {
    id: 'conv-1-4',
    customerId: '1',
    channel: 'email',
    date: hoursAgo(3),
    agent: 'John Smith',
    subject: 'Re: Billing Inquiry - Invoice #INV-2025-001',
    transcript: `Subject: Re: Billing Inquiry - Invoice #INV-2025-001

From: Sarah Johnson <sarah.johnson@acmecorp.com>
To: support@company.com
Date: ${new Date(hoursAgo(3)).toLocaleString()}

Hi,

I'm following up on my call from earlier today. I still haven't received the billing correction you promised. I've been a loyal customer for three years and this level of service is disappointing.

I need this resolved immediately or I'll be forced to explore other options.

Best regards,
Sarah Johnson

---

From: John Smith <john.smith@company.com>
To: sarah.johnson@acmecorp.com
Date: ${new Date(hoursAgo(2)).toLocaleString()}

Subject: Re: Billing Inquiry - Invoice #INV-2025-001

Hi Sarah,

I sincerely apologize for the delay. I'm looking into this right now and I'll have the correction processed within the next hour. I'll send you a confirmation email as soon as it's done.

I completely understand your frustration, and I want to make sure we make this right. I've also assigned a dedicated account manager to your account who will reach out to you today.

Again, I apologize for the inconvenience and I appreciate your patience.

Best regards,
John Smith`,
    summary: 'Customer following up on billing issue via email. Expressing frustration with delay in resolution. Threatening to explore alternatives. Response promises immediate resolution and account manager assignment.',
    sentiment: 'negative',
    intent: 'Billing follow-up and complaint',
    messageCount: 2
  },
  {
    id: 'conv-1-5',
    customerId: '1',
    channel: 'email',
    date: daysAgo(2),
    agent: 'Emily Davis',
    subject: 'Account Review Request',
    transcript: `Subject: Account Review Request

From: Sarah Johnson <sarah.johnson@acmecorp.com>
To: support@company.com
Date: ${new Date(daysAgo(2)).toLocaleString()}

Hello,

I'd like to schedule a call to review my account billing and ensure everything is set up correctly. Please let me know your availability.

Thanks,
Sarah Johnson`,
    summary: 'Customer requesting account review call to verify billing setup.',
    sentiment: 'neutral',
    intent: 'Account review request',
    messageCount: 1
  },

  // Customer 2 - Michael Chen (TechStart Inc) - opportunity
  // 2 video calls, 1 phone call (lastTime: 4h ago)
  {
    id: 'conv-2-1',
    customerId: '2',
    channel: 'video',
    date: hoursAgo(4),
    duration: 28,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Michael Chen: Hi, I'm interested in integrating your API with our customer management platform. I'd like to know more about the technical requirements and if you have documentation available.

[01:00] Mindi AI Assistant: Great! Let me connect you with our technical integration specialist.

[01:30] Emily Davis: Hi Michael, this is Emily. I'd be happy to help you with the API integration. What specific platform are you using?

[02:00] Michael Chen: We're using a custom-built customer management system. We need to sync customer data, create records, and update information in real-time.

[03:30] Emily Davis: Perfect. Our API supports REST endpoints for all of those operations. Do you have webhook support in your system?

[04:00] Michael Chen: Yes, we can handle webhooks. That would be ideal for real-time updates.

[05:00] Emily Davis: Excellent. I can send you our complete API documentation, including authentication, endpoints, and webhook setup. We also have code samples in multiple languages.

[06:00] Michael Chen: That would be very helpful. I'd also like to schedule a technical consultation call to discuss the best approach for our specific use case.

[07:00] Emily Davis: Absolutely. I can schedule that for you. When would work best?

[08:00] Michael Chen: How about later this week? Thursday or Friday afternoon would work well for our team.

[09:00] Emily Davis: Let me check... I have availability Thursday at 2 PM or Friday at 3 PM. Which works better?

[10:00] Michael Chen: Thursday at 2 PM sounds perfect.

[11:00] Emily Davis: Great! I'll send you a calendar invite and the API documentation today. Is there anything specific you'd like me to prepare for our call?

[12:00] Michael Chen: Yes, if you could prepare information on rate limits, error handling, and best practices for large data syncs, that would be helpful.

[13:00] Emily Davis: Perfect. I'll have all of that ready for our call on Thursday.`,
    summary: 'Customer interested in API integration with their customer management platform. Technical consultation scheduled for Thursday. API documentation and code samples to be sent. Discussion covered REST endpoints, webhooks, and integration requirements.',
    sentiment: 'positive',
    intent: 'Technical integration inquiry',
    messageCount: 13
  },
  {
    id: 'conv-2-2',
    customerId: '2',
    channel: 'video',
    date: daysAgo(3),
    duration: 35,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:20] Michael Chen: Hi, I wanted to follow up on our previous conversation about API integration. We've reviewed the documentation and have some technical questions.

[01:00] Mindi AI Assistant: Great! Let me connect you with our technical team.

[01:30] Emily Davis: Hi Michael, great to see you again! What questions do you have?

[02:30] Michael Chen: We're looking at implementing the webhook system, but we need to understand how to handle authentication and retries.

[04:00] Emily Davis: Excellent question. Our webhooks use HMAC signatures for authentication, and we have built-in retry logic with exponential backoff.

[05:30] Michael Chen: That's helpful. We also need to know about rate limits for bulk operations.

[07:00] Emily Davis: Our API has tiered rate limits. For bulk operations, you can use our batch endpoints which allow up to 100 records per request.

[09:00] Michael Chen: Perfect. We're planning to migrate about 50,000 customer records. What's the recommended approach?

[11:00] Emily Davis: I'd recommend using our batch import endpoint with chunks of 1000 records. We can also provide a migration script template.

[13:00] Michael Chen: That would be very helpful. Can you send that over?

[14:00] Emily Davis: Absolutely. I'll send the migration guide and script templates today.`,
    summary: 'Follow-up video call discussing webhook authentication, rate limits, and bulk migration strategy for 50,000 records.',
    sentiment: 'positive',
    intent: 'Technical implementation details',
    messageCount: 11
  },
  {
    id: 'conv-2-3',
    customerId: '2',
    channel: 'phone',
    date: daysAgo(5),
    duration: 10,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Michael Chen: Hi, I'm calling to get initial information about your API integration capabilities.

[00:45] Mindi AI Assistant: I'd be happy to help. Let me connect you with our integration specialist.

[01:00] Emily Davis: Hi, this is Emily. How can I help you today?

[01:30] Michael Chen: We're evaluating API solutions for our customer management platform. Can you tell me about your integration capabilities?

[02:30] Emily Davis: Absolutely. We offer a comprehensive REST API with webhook support, real-time sync capabilities, and extensive documentation.

[03:30] Michael Chen: That sounds promising. Can you send me some information?

[04:00] Emily Davis: Of course. I'll send you our API overview and documentation links right away. Would you like to schedule a demo call?

[05:00] Michael Chen: Yes, that would be helpful. Let me check my calendar and get back to you.

[06:00] Emily Davis: Perfect. I'll send the information and we can schedule something that works for you.`,
    summary: 'Initial inquiry about API integration capabilities. Information package to be sent, demo call interest expressed.',
    sentiment: 'positive',
    intent: 'Initial API inquiry',
    messageCount: 8
  },

  // Customer 3 - Emily Rodriguez (Global Systems Ltd) - lead
  // 3 emails, 1 SMS (lastTime: 6h ago)
  {
    id: 'conv-3-1',
    customerId: '3',
    channel: 'email',
    date: hoursAgo(6),
    agent: 'John Smith',
    subject: 'Feature Request - Custom Reporting',
    transcript: `Subject: Feature Request - Custom Reporting

From: Emily Rodriguez <emily.rodriguez@globalsystems.com>
To: product@company.com
Date: ${new Date(hoursAgo(6)).toLocaleString()}

Hi Team,

I'm interested in a custom reporting feature for automated weekly team performance summaries. We're currently using your platform and would love to see this capability added.

Can you tell me:
1. Is this feature currently available or on the roadmap?
2. If on roadmap, what's the timeline?
3. What would pricing look like for a custom feature like this?

Looking forward to hearing from you.

Best,
Emily Rodriguez

---

From: John Smith <john.smith@company.com>
To: emily.rodriguez@globalsystems.com
Date: ${new Date(hoursAgo(5)).toLocaleString()}

Subject: Re: Feature Request - Custom Reporting

Hi Emily,

Thanks for reaching out! Custom reporting is something we're actively developing. I'd love to schedule a call to discuss your specific requirements and see how we can help.

Would you be available for a 30-minute call this week?

Best regards,
John Smith`,
    summary: 'Customer interested in custom reporting feature for automated weekly team performance summaries. Wants to know availability, timeline, and pricing.',
    sentiment: 'positive',
    intent: 'Feature request inquiry',
    messageCount: 2
  },
  {
    id: 'conv-3-2',
    customerId: '3',
    channel: 'email',
    date: daysAgo(2),
    agent: 'Emily Davis',
    subject: 'Platform Evaluation',
    transcript: `Subject: Platform Evaluation

From: Emily Rodriguez <emily.rodriguez@globalsystems.com>
To: sales@company.com
Date: ${new Date(daysAgo(2)).toLocaleString()}

Hello,

We're evaluating your platform for our global operations. Could you provide:
- Pricing information for enterprise accounts
- Security and compliance documentation
- Integration capabilities with our existing systems

Thank you,
Emily Rodriguez`,
    summary: 'Enterprise evaluation inquiry requesting pricing, security docs, and integration information.',
    sentiment: 'neutral',
    intent: 'Platform evaluation',
    messageCount: 1
  },
  {
    id: 'conv-3-3',
    customerId: '3',
    channel: 'email',
    date: daysAgo(4),
    agent: 'John Smith',
    subject: 'Initial Contact',
    transcript: `Subject: Initial Contact

From: Emily Rodriguez <emily.rodriguez@globalsystems.com>
To: info@company.com
Date: ${new Date(daysAgo(4)).toLocaleString()}

Hi,

I came across your platform and it looks like it could be a good fit for our needs. Can someone reach out to discuss?

Thanks,
Emily`,
    summary: 'Initial contact from potential customer interested in learning more about the platform.',
    sentiment: 'neutral',
    intent: 'Initial inquiry',
    messageCount: 1
  },
  {
    id: 'conv-3-4',
    customerId: '3',
    channel: 'sms',
    date: daysAgo(7),
    agent: 'Support Bot',
    transcript: `[SMS] Emily Rodriguez: Quick question - do you offer API access?

[SMS] Support Bot: Yes! We have a comprehensive REST API. Would you like me to send you the documentation?

[SMS] Emily Rodriguez: Yes please, that would be great.

[SMS] Support Bot: I've sent the API documentation to your email. Let me know if you have any questions!`,
    summary: 'SMS inquiry about API access. Documentation sent.',
    sentiment: 'neutral',
    intent: 'API inquiry',
    messageCount: 4
  },

  // Customer 4 - David Kim (Innovation Labs) - follow-up
  // 4 phone calls, 1 video call (lastTime: 1h ago)
  {
    id: 'conv-4-1',
    customerId: '4',
    channel: 'phone',
    date: hoursAgo(1),
    duration: 18,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:12] David Kim: Hi, I'm calling about the product demonstration we discussed. I want to confirm the details for our team meeting.

[00:30] Mindi AI Assistant: I'd be happy to help with that. Let me connect you with our sales team.

[00:45] John Smith: Hi David, this is John. Great to hear from you! What questions do you have about the demo?

[01:30] David Kim: We have multiple stakeholders who will be attending, so I want to make sure the demo covers our specific use cases.

[02:30] John Smith: Absolutely. I've prepared a customized demo based on our previous conversations. We'll focus on the advanced analytics dashboard and AI-powered insights you mentioned.

[04:00] David Kim: Perfect. We're particularly interested in how the AI insights can help with our forecasting.

[05:30] John Smith: Great! I'll make sure to include a detailed walkthrough of the forecasting capabilities. We'll also show how it integrates with your existing data sources.

[07:00] David Kim: Excellent. What time is the demo scheduled for?

[08:00] John Smith: It's scheduled for Thursday at 2 PM. I'll send a calendar invite with the meeting link.

[09:00] David Kim: Perfect. Looking forward to it.`,
    summary: 'Customer confirming product demonstration details for team meeting. Focus on advanced analytics and AI insights for forecasting.',
    sentiment: 'positive',
    intent: 'Demo confirmation',
    messageCount: 9
  },
  {
    id: 'conv-4-2',
    customerId: '4',
    channel: 'phone',
    date: hoursAgo(8),
    duration: 15,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] David Kim: Hi, I wanted to discuss the pricing options for your platform.

[00:45] Mindi AI Assistant: I can help with that. Let me connect you with our sales specialist.

[01:00] Emily Davis: Hi David, this is Emily. I'd be happy to discuss pricing options with you.

[02:00] David Kim: We're evaluating the Enterprise plan. Can you walk me through what's included?

[03:30] Emily Davis: Absolutely. The Enterprise plan includes advanced analytics, AI insights, dedicated account management, and priority support.

[05:00] David Kim: What about volume discounts? We're planning to scale significantly.

[06:30] Emily Davis: Yes, we offer volume discounts for Enterprise customers. I can prepare a custom quote based on your projected usage.

[08:00] David Kim: That would be great. Can you send that over?

[09:00] Emily Davis: Of course. I'll have a custom pricing proposal ready for you by end of day.`,
    summary: 'Pricing discussion for Enterprise plan. Volume discounts discussed, custom quote to be prepared.',
    sentiment: 'positive',
    intent: 'Pricing inquiry',
    messageCount: 7
  },
  {
    id: 'conv-4-3',
    customerId: '4',
    channel: 'phone',
    date: daysAgo(1),
    duration: 12,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:10] David Kim: I'm calling to schedule a product demonstration for our team.

[00:30] Mindi AI Assistant: Great! Let me connect you with our demo specialist.

[00:45] John Smith: Hi David, this is John. I'd be happy to schedule a demo for you. What are you looking to see?

[01:30] David Kim: We're particularly interested in the advanced analytics dashboard and AI-powered insights.

[02:30] John Smith: Perfect. I can customize the demo to focus on those features. When would work best for your team?

[04:00] David Kim: How about later this week? We have multiple stakeholders who will want to attend.

[05:00] John Smith: I have availability Thursday at 2 PM. Would that work?

[06:00] David Kim: Yes, that sounds perfect. I'll send out the calendar invite to our team.

[07:00] John Smith: Great! I'll send you a confirmation email with the meeting details and agenda.`,
    summary: 'Product demonstration requested focusing on advanced analytics and AI insights. Scheduled for Thursday.',
    sentiment: 'positive',
    intent: 'Demo scheduling',
    messageCount: 8
  },
  {
    id: 'conv-4-4',
    customerId: '4',
    channel: 'phone',
    date: daysAgo(3),
    duration: 10,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:12] David Kim: Hi, I'm interested in learning more about your platform.

[00:30] Mindi AI Assistant: I'd be happy to help. Let me connect you with our team.

[00:45] Emily Davis: Hi David, this is Emily. What would you like to know?

[01:30] David Kim: We're looking for a solution that can help with data analytics and forecasting. Does your platform offer that?

[02:30] Emily Davis: Yes, absolutely! We have advanced analytics capabilities with AI-powered forecasting. I'd love to show you how it works.

[03:30] David Kim: That sounds interesting. Can you send me some information?

[04:00] Emily Davis: Of course. I'll send you our product overview and we can schedule a demo call if you're interested.

[05:00] David Kim: Yes, I'd like that. Thank you.`,
    summary: 'Initial inquiry about analytics and forecasting capabilities. Product overview to be sent, demo interest expressed.',
    sentiment: 'positive',
    intent: 'Product inquiry',
    messageCount: 7
  },
  {
    id: 'conv-4-5',
    customerId: '4',
    channel: 'video',
    date: daysAgo(2),
    duration: 25,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] David Kim: Hi, I wanted to follow up on our previous conversation and see a quick walkthrough of the platform.

[00:45] Mindi AI Assistant: Great! Let me connect you with our team.

[01:00] John Smith: Hi David, great to see you! I'd be happy to give you a quick tour.

[02:00] David Kim: Perfect. I'm particularly interested in the analytics features.

[03:30] John Smith: Let me show you the analytics dashboard. You can see real-time metrics, custom reports, and AI-generated insights here.

[05:00] David Kim: This looks impressive. How customizable are these reports?

[06:30] John Smith: Very customizable. You can create custom dashboards, set up automated reports, and configure alerts.

[08:00] David Kim: Can we integrate this with our existing data sources?

[09:30] John Smith: Yes, we support integrations with most major data platforms. I can show you the integration options.

[11:00] David Kim: That would be helpful. Can you send me more details on integrations?

[12:00] John Smith: Absolutely. I'll send you our integration guide and we can discuss your specific needs.`,
    summary: 'Video walkthrough of analytics platform. Customization and integration capabilities discussed.',
    sentiment: 'positive',
    intent: 'Platform walkthrough',
    messageCount: 10
  },

  // Customer 5 - Jennifer Martinez (Enterprise Solutions) - no-action
  // 1 email (lastTime: 8h ago)
  {
    id: 'conv-5-1',
    customerId: '5',
    channel: 'email',
    date: hoursAgo(8),
    agent: 'Support Bot',
    subject: 'General Inquiry',
    transcript: `Subject: General Inquiry

From: Jennifer Martinez <jennifer.martinez@enterprisesolutions.com>
To: info@company.com
Date: ${new Date(hoursAgo(8)).toLocaleString()}

Hello,

I'm interested in learning more about your service offerings and pricing tiers. Could you send me some information?

Thanks,
Jennifer Martinez`,
    summary: 'General inquiry about service offerings and pricing tiers. Initial exploratory contact.',
    sentiment: 'neutral',
    intent: 'General inquiry',
    messageCount: 1
  },

  // Customer 6 - Robert Taylor (Digital Ventures) - at-risk
  // 5 phone calls, 2 SMS, 1 email (lastTime: 30m ago)
  {
    id: 'conv-6-1',
    customerId: '6',
    channel: 'phone',
    date: hoursAgo(0.5),
    duration: 8,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Robert Taylor: Hi, I need to cancel my subscription. We've had multiple service outages this month and it's impacting our business operations. This is unacceptable.

[00:45] Mindi AI Assistant: I understand your concern. Let me connect you with our retention specialist who can help address this.

[01:00] John Smith: Hello Robert, this is John. I'm so sorry to hear about the service outages. I want to make this right for you.

[01:30] Robert Taylor: I appreciate that, but honestly, we've had three outages this month alone. Each one has cost us significant downtime. We can't continue like this.

[02:30] John Smith: I completely understand. That's unacceptable. I'm going to escalate this immediately to our executive team. We take service reliability very seriously.

[03:00] Robert Taylor: I need to see some real action here. This isn't just about fixing the immediate issue - we need assurance this won't happen again.

[04:00] John Smith: Absolutely. I'm going to have our CTO personally review your account and provide a detailed service improvement plan. I'll also discuss compensation for the downtime you've experienced.

[05:00] Robert Taylor: That would be a start. But I'm still not sure if it's enough. We're evaluating other providers.

[06:00] John Smith: I understand. Can I get you connected with our CEO for a personal call? I think having that direct conversation would be valuable.

[07:00] Robert Taylor: Yes, that would be helpful. I'd like to hear directly from leadership about how this will be addressed.

[08:00] John Smith: Perfect. I'll arrange that call for today, and I'll follow up with you personally within the hour with our service improvement plan.`,
    summary: 'Customer requesting cancellation due to multiple service outages. Expressed frustration with business impact. Executive escalation arranged. Service improvement plan and compensation to be discussed. High churn risk.',
    sentiment: 'negative',
    intent: 'Service cancellation request',
    messageCount: 10
  },
  {
    id: 'conv-6-2',
    customerId: '6',
    channel: 'phone',
    date: hoursAgo(2),
    duration: 6,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:10] Robert Taylor: I'm calling again about the service outages. This is the third time this month.

[00:30] Mindi AI Assistant: I understand this is urgent. Let me connect you with our support team immediately.

[00:45] John Smith: Hi Robert, this is John. I'm so sorry about the outages. Our engineering team is investigating right now.

[01:30] Robert Taylor: Investigation isn't enough. We need action. Our business is being impacted.

[02:30] John Smith: I completely understand. I'm escalating this to our CTO and we'll have a response within the hour.

[03:00] Robert Taylor: I need more than a response. I need a solution.

[04:00] John Smith: Absolutely. We're implementing immediate fixes and I'll personally follow up with you today.

[05:00] Robert Taylor: I'll be waiting for your call.`,
    summary: 'Follow-up call about recurring service outages. Customer frustrated, escalation promised.',
    sentiment: 'negative',
    intent: 'Service outage complaint',
    messageCount: 7
  },
  {
    id: 'conv-6-3',
    customerId: '6',
    channel: 'phone',
    date: daysAgo(1),
    duration: 10,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:12] Robert Taylor: We experienced another outage today. This is becoming a pattern.

[00:30] Mindi AI Assistant: I'm sorry to hear that. Let me connect you with our support team right away.

[00:45] Emily Davis: Hi Robert, this is Emily. I'm so sorry about the outage. Can you tell me what happened?

[01:30] Robert Taylor: The system went down for about 45 minutes during our peak hours. This is unacceptable.

[02:30] Emily Davis: I understand completely. Our engineering team is investigating the root cause right now.

[04:00] Robert Taylor: We need assurance this won't happen again. Our business depends on your service.

[05:30] Emily Davis: Absolutely. I'm escalating this to our engineering leadership and we'll provide a detailed incident report.

[07:00] Robert Taylor: I'll be waiting for that report.`,
    summary: 'Service outage complaint. System down for 45 minutes during peak hours. Incident report promised.',
    sentiment: 'negative',
    intent: 'Service outage complaint',
    messageCount: 7
  },
  {
    id: 'conv-6-4',
    customerId: '6',
    channel: 'phone',
    date: daysAgo(3),
    duration: 8,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Robert Taylor: Hi, we had a service outage yesterday. Can someone explain what happened?

[00:45] Mindi AI Assistant: I'm sorry to hear about the outage. Let me connect you with our support team.

[01:00] John Smith: Hi Robert, this is John. I'm so sorry about the outage. Our engineering team has identified the issue and implemented a fix.

[02:00] Robert Taylor: What was the cause?

[03:00] John Smith: It was a database connectivity issue that's now been resolved. We've also added additional monitoring to prevent this in the future.

[04:30] Robert Taylor: I hope so. We can't afford more downtime.

[05:30] John Smith: I completely understand. We're taking this very seriously and have implemented additional safeguards.`,
    summary: 'Initial outage complaint. Database connectivity issue identified and fixed. Additional monitoring added.',
    sentiment: 'negative',
    intent: 'Service outage inquiry',
    messageCount: 7
  },
  {
    id: 'conv-6-5',
    customerId: '6',
    channel: 'phone',
    date: daysAgo(5),
    duration: 5,
    agent: 'Support Bot',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:10] Robert Taylor: Is the system down? I can't access my account.

[00:30] Mindi AI Assistant: I'm checking the system status for you right now.

[01:00] Mindi AI Assistant: I can see there was a brief service interruption. The system should be back online now. Can you try accessing your account again?

[02:00] Robert Taylor: Yes, it's working now. But this is concerning.

[03:00] Mindi AI Assistant: I understand. Our engineering team is investigating the cause. Is there anything else I can help you with?`,
    summary: 'Brief service interruption reported. System restored, investigation ongoing.',
    sentiment: 'negative',
    intent: 'Service status inquiry',
    messageCount: 5
  },
  {
    id: 'conv-6-6',
    customerId: '6',
    channel: 'sms',
    date: hoursAgo(1),
    agent: 'Support Bot',
    transcript: `[SMS] Robert Taylor: Another outage? This is unacceptable.

[SMS] Support Bot: I'm so sorry about the outage. Our team is working on it right now. I'll update you as soon as I have more information.

[SMS] Robert Taylor: We need a response from leadership. This can't continue.

[SMS] Support Bot: I understand completely. I'm escalating this to our executive team and someone will call you within the hour.`,
    summary: 'SMS complaint about recurring outages. Executive escalation promised.',
    sentiment: 'negative',
    intent: 'Service outage complaint',
    messageCount: 4
  },
  {
    id: 'conv-6-7',
    customerId: '6',
    channel: 'sms',
    date: daysAgo(2),
    agent: 'Support Bot',
    transcript: `[SMS] Robert Taylor: Is the system back up?

[SMS] Support Bot: Yes, the system is back online. I'm so sorry for the interruption. Our engineering team is investigating the root cause.

[SMS] Robert Taylor: This is the second time this week. We need answers.

[SMS] Support Bot: I completely understand. I'm escalating this to our engineering leadership and you'll receive a detailed incident report.`,
    summary: 'SMS follow-up on service outage. Incident report promised.',
    sentiment: 'negative',
    intent: 'Service status inquiry',
    messageCount: 4
  },
  {
    id: 'conv-6-8',
    customerId: '6',
    channel: 'email',
    date: daysAgo(1),
    agent: 'John Smith',
    subject: 'Service Outage - Urgent',
    transcript: `Subject: Service Outage - Urgent

From: Robert Taylor <robert.taylor@digitalventures.com>
To: support@company.com
Date: ${new Date(daysAgo(1)).toLocaleString()}

Team,

We experienced another service outage today. This is the third time this month. We need immediate action and assurance this won't happen again.

Please have someone from leadership contact me today.

Robert Taylor`,
    summary: 'Email complaint about recurring service outages. Leadership contact requested.',
    sentiment: 'negative',
    intent: 'Service outage complaint',
    messageCount: 1
  },

  // Customer 7 - Lisa Anderson (Cloud Services Co) - opportunity
  // 2 phone calls, 1 video call (lastTime: 3h ago)
  {
    id: 'conv-7-1',
    customerId: '7',
    channel: 'video',
    date: hoursAgo(3),
    duration: 42,
    agent: 'Michael Chen',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Lisa Anderson: Hi, I'm currently on the Professional plan and I'm interested in learning more about the Enterprise tier.

[01:00] Mindi AI Assistant: Great! Let me connect you with our sales specialist.

[01:30] Michael Chen: Hi Lisa, this is Michael. I'd be happy to discuss the Enterprise plan with you. What specific features are you most interested in?

[02:00] Lisa Anderson: We're particularly interested in the advanced security features, dedicated account management, and the compliance certifications.

[03:30] Michael Chen: Perfect. The Enterprise plan includes SOC 2 Type II certification, advanced encryption, and dedicated account management. We also have additional security features like IP allowlisting and SSO.

[04:30] Lisa Anderson: That's exactly what we need. We're in a regulated industry, so compliance is critical for us.

[05:30] Michael Chen: Absolutely. We can provide all the compliance documentation you need. We also have dedicated compliance support for Enterprise customers.

[06:30] Lisa Anderson: Great. What about migration from our current Professional plan? Will there be any downtime?

[08:00] Michael Chen: No downtime at all. The migration is seamless and we handle everything for you. We'll schedule it during your maintenance window and you'll have full support throughout.

[09:30] Lisa Anderson: That's reassuring. What about pricing? Can you send me a detailed breakdown?

[11:00] Michael Chen: Absolutely. I'll send you a detailed pricing comparison today. I can also schedule a demo to show you the Enterprise features in action.

[12:00] Lisa Anderson: Yes, I'd like that. Can we schedule the demo for later this week?

[13:00] Michael Chen: Of course. How does Thursday at 2 PM work for you?

[14:00] Lisa Anderson: Perfect. I'll see you then.`,
    summary: 'Customer exploring upgrade from Professional to Enterprise plan. Interested in security features, compliance, and dedicated account management. Demo scheduled for Thursday. Pricing comparison to be sent.',
    sentiment: 'positive',
    intent: 'Upgrade inquiry',
    messageCount: 13
  },
  {
    id: 'conv-7-2',
    customerId: '7',
    channel: 'phone',
    date: daysAgo(2),
    duration: 15,
    agent: 'Michael Chen',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:12] Lisa Anderson: Hi, I'm calling to discuss upgrading our plan.

[00:30] Mindi AI Assistant: Great! Let me connect you with our sales team.

[00:45] Michael Chen: Hi Lisa, this is Michael. I'd be happy to discuss upgrade options with you.

[01:30] Lisa Anderson: We're on the Professional plan and considering Enterprise. Can you tell me about the differences?

[02:30] Michael Chen: Absolutely. Enterprise includes advanced security, compliance certifications, dedicated account management, and priority support.

[04:00] Lisa Anderson: What about pricing? Is there a significant difference?

[05:30] Michael Chen: There is a price difference, but Enterprise customers also get volume discounts and custom pricing options. I can prepare a custom quote for you.

[07:00] Lisa Anderson: That would be helpful. Can you send that over?

[08:00] Michael Chen: Of course. I'll send you a detailed comparison and custom pricing proposal today.`,
    summary: 'Upgrade inquiry from Professional to Enterprise. Custom pricing proposal to be sent.',
    sentiment: 'positive',
    intent: 'Upgrade inquiry',
    messageCount: 7
  },
  {
    id: 'conv-7-3',
    customerId: '7',
    channel: 'phone',
    date: daysAgo(5),
    duration: 10,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Lisa Anderson: Hi, I wanted to learn more about your Enterprise plan features.

[00:45] Mindi AI Assistant: I'd be happy to help. Let me connect you with our sales specialist.

[01:00] Emily Davis: Hi Lisa, this is Emily. What would you like to know about Enterprise?

[01:30] Lisa Anderson: We're particularly interested in security and compliance features.

[02:30] Emily Davis: Perfect. Enterprise includes SOC 2 Type II, advanced encryption, IP allowlisting, and dedicated compliance support.

[04:00] Lisa Anderson: That sounds like what we need. Can you send me more information?

[05:00] Emily Davis: Absolutely. I'll send you our Enterprise feature guide and we can schedule a call to discuss your specific needs.

[06:00] Lisa Anderson: Yes, I'd like that. Thank you.`,
    summary: 'Initial inquiry about Enterprise plan security and compliance features. Information to be sent.',
    sentiment: 'positive',
    intent: 'Enterprise plan inquiry',
    messageCount: 7
  },

  // Continue with remaining customers (8-17) - I'll create a few more key ones
  // Customer 8 - James Wilson (Data Analytics Group) - lead
  // 2 emails, 1 phone call (lastTime: 5h ago)
  {
    id: 'conv-8-1',
    customerId: '8',
    channel: 'email',
    date: hoursAgo(5),
    agent: 'John Smith',
    subject: 'Enterprise Pricing Inquiry',
    transcript: `Subject: Enterprise Pricing Inquiry

From: James Wilson <james.wilson@dataanalytics.com>
To: sales@company.com
Date: ${new Date(hoursAgo(5)).toLocaleString()}

Hi,

We're evaluating your platform for our 50-person team. Could you provide detailed enterprise pricing, including volume discounts and billing options?

Thanks,
James Wilson`,
    summary: 'Enterprise pricing inquiry for 50-person team. Volume discounts and billing options requested.',
    sentiment: 'positive',
    intent: 'Pricing inquiry',
    messageCount: 1
  },
  {
    id: 'conv-8-2',
    customerId: '8',
    channel: 'email',
    date: daysAgo(2),
    agent: 'Emily Davis',
    subject: 'Platform Evaluation',
    transcript: `Subject: Platform Evaluation

From: James Wilson <james.wilson@dataanalytics.com>
To: info@company.com
Date: ${new Date(daysAgo(2)).toLocaleString()}

Hello,

We're evaluating your platform for our analytics team. Can you send us information about features and capabilities?

Thanks,
James Wilson`,
    summary: 'Platform evaluation inquiry requesting feature information.',
    sentiment: 'neutral',
    intent: 'Platform evaluation',
    messageCount: 1
  },
  {
    id: 'conv-8-3',
    customerId: '8',
    channel: 'phone',
    date: daysAgo(6),
    duration: 12,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] James Wilson: Hi, I'm calling to get initial information about your platform.

[00:45] Mindi AI Assistant: I'd be happy to help. Let me connect you with our team.

[01:00] John Smith: Hi James, this is John. What would you like to know?

[01:30] James Wilson: We're evaluating analytics platforms. Can you tell me about your key features?

[02:30] John Smith: Absolutely. We offer advanced analytics, AI-powered insights, custom reporting, and enterprise-grade security.

[04:00] James Wilson: That sounds interesting. Can you send me more information?

[05:00] John Smith: Of course. I'll send you our product overview and we can schedule a demo if you're interested.

[06:00] James Wilson: Yes, I'd like that. Thank you.`,
    summary: 'Initial platform inquiry. Product overview to be sent, demo interest expressed.',
    sentiment: 'positive',
    intent: 'Product inquiry',
    messageCount: 7
  },

  // Customer 9 - Patricia Brown (Smart Solutions) - follow-up
  // 2 phone calls, 1 email (lastTime: 2h ago)
  {
    id: 'conv-9-1',
    customerId: '9',
    channel: 'phone',
    date: hoursAgo(2),
    duration: 20,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:12] Patricia Brown: Hi, I'm calling about our contract renewal. Our annual contract is up in 45 days.

[00:30] Mindi AI Assistant: I'd be happy to help with that. Let me connect you with our account management team.

[00:45] John Smith: Hi Patricia, this is John. Great to hear from you! I'd be happy to discuss your renewal.

[01:30] Patricia Brown: We'd like to review our usage and see if we can negotiate better terms.

[02:30] John Smith: Absolutely. I can pull up your usage data and we can review it together. Are there specific terms you'd like to discuss?

[04:00] Patricia Brown: We're hoping for a volume discount since our usage has increased significantly.

[05:30] John Smith: That makes sense. Based on your usage growth, I can definitely work on a custom pricing proposal for you.

[07:00] Patricia Brown: That would be great. Can you send that over?

[08:00] John Smith: Of course. I'll have a renewal proposal ready for you by end of week.`,
    summary: 'Contract renewal discussion. Usage review and volume discount negotiation. Renewal proposal to be sent.',
    sentiment: 'positive',
    intent: 'Contract renewal',
    messageCount: 8
  },
  {
    id: 'conv-9-2',
    customerId: '9',
    channel: 'phone',
    date: daysAgo(3),
    duration: 15,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Patricia Brown: Hi, I wanted to discuss our upcoming contract renewal.

[00:45] Mindi AI Assistant: I'd be happy to help. Let me connect you with our account team.

[01:00] Emily Davis: Hi Patricia, this is Emily. I'd be happy to discuss your renewal options.

[02:00] Patricia Brown: Our contract is up soon and we want to make sure we're getting the best value.

[03:30] Emily Davis: Absolutely. I can review your usage and prepare a renewal proposal that reflects your current needs.

[05:00] Patricia Brown: That would be helpful. We've been very happy with the service.

[06:00] Emily Davis: That's great to hear! I'll prepare a proposal and we can schedule a call to discuss it.`,
    summary: 'Initial renewal inquiry. Customer satisfied with service. Renewal proposal to be prepared.',
    sentiment: 'positive',
    intent: 'Renewal inquiry',
    messageCount: 7
  },
  {
    id: 'conv-9-3',
    customerId: '9',
    channel: 'email',
    date: daysAgo(1),
    agent: 'John Smith',
    subject: 'Contract Renewal Discussion',
    transcript: `Subject: Contract Renewal Discussion

From: Patricia Brown <patricia.brown@smartsolutions.com>
To: accounts@company.com
Date: ${new Date(daysAgo(1)).toLocaleString()}

Hi Team,

Our annual contract is coming up for renewal. Can we schedule a call to discuss terms and pricing?

Thanks,
Patricia Brown`,
    summary: 'Email request to schedule renewal discussion call.',
    sentiment: 'neutral',
    intent: 'Renewal scheduling',
    messageCount: 1
  },

  // Customer 10 - William Davis (Future Tech) - no-action
  // 1 email (lastTime: 12h ago)
  {
    id: 'conv-10-1',
    customerId: '10',
    channel: 'email',
    date: hoursAgo(12),
    agent: 'Support Bot',
    subject: 'Support Documentation Request',
    transcript: `Subject: Support Documentation Request

From: William Davis <william.davis@futuretech.com>
To: support@company.com
Date: ${new Date(hoursAgo(12)).toLocaleString()}

Hi,

Could you send me links to your support documentation and user guides? I'm trying to set up a new feature.

Thanks,
William Davis`,
    summary: 'Request for support documentation and user guides for feature setup.',
    sentiment: 'neutral',
    intent: 'Documentation request',
    messageCount: 1
  },

  // Customer 11 - Mary Garcia (NextGen Industries) - at-risk
  // 4 phone calls, 3 SMS, 2 emails (lastTime: 45m ago)
  {
    id: 'conv-11-1',
    customerId: '11',
    channel: 'phone',
    date: hoursAgo(0.75),
    duration: 18,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Mary Garcia: Hi, I'm calling to file a complaint. We've had multiple issues with system performance, unresponsive support, and billing problems.

[00:45] Mindi AI Assistant: I'm so sorry to hear that. Let me connect you with our executive support team immediately.

[01:00] John Smith: Hi Mary, this is John. I'm so sorry for all the issues you've experienced. Can you tell me more about what's been happening?

[02:00] Mary Garcia: Where do I start? The system has been slow, support tickets go unanswered for days, and we've been overcharged on multiple invoices.

[03:30] John Smith: I understand completely. This is unacceptable. I'm escalating this to our executive team right now.

[05:00] Mary Garcia: We've been a customer for years and this level of service is completely unacceptable. We're considering our options.

[06:30] John Smith: I completely understand your frustration. Our CEO will personally reach out to you today to address these issues.

[08:00] Mary Garcia: I'll be waiting for that call. This needs to be resolved immediately.`,
    summary: 'Multiple complaints about system performance, support responsiveness, and billing. Executive escalation promised.',
    sentiment: 'negative',
    intent: 'Multiple complaints',
    messageCount: 8
  },
  {
    id: 'conv-11-2',
    customerId: '11',
    channel: 'phone',
    date: hoursAgo(3),
    duration: 12,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:12] Mary Garcia: I'm calling again about the billing issue. This is the third time.

[00:30] Mindi AI Assistant: I'm sorry for the trouble. Let me connect you with our billing team right away.

[00:45] Emily Davis: Hi Mary, this is Emily. I'm so sorry about the billing issues. Let me look into this right now.

[02:00] Mary Garcia: We've been overcharged on three separate invoices. This needs to be fixed immediately.

[03:30] Emily Davis: I understand completely. I'm processing the corrections right now and you'll receive updated invoices within the hour.

[05:00] Mary Garcia: And what about the system performance issues? The platform has been extremely slow.

[06:30] Emily Davis: I'm escalating the performance issues to our engineering team. They'll investigate and provide a solution.

[08:00] Mary Garcia: I need this resolved today. We can't continue like this.`,
    summary: 'Billing and performance issues complaint. Corrections promised, engineering escalation for performance.',
    sentiment: 'negative',
    intent: 'Billing and performance complaints',
    messageCount: 7
  },
  {
    id: 'conv-11-3',
    customerId: '11',
    channel: 'phone',
    date: daysAgo(1),
    duration: 10,
    agent: 'Support Bot',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:10] Mary Garcia: The system is extremely slow today. Is there an issue?

[00:30] Mindi AI Assistant: I'm checking the system status for you right now.

[01:00] Mindi AI Assistant: I can see there are some performance issues. Our engineering team is working on it.

[02:00] Mary Garcia: This is becoming a regular occurrence. We need this fixed.

[03:00] Mindi AI Assistant: I understand. I'm escalating this to our engineering leadership.`,
    summary: 'System performance complaint. Engineering escalation promised.',
    sentiment: 'negative',
    intent: 'Performance complaint',
    messageCount: 5
  },
  {
    id: 'conv-11-4',
    customerId: '11',
    channel: 'phone',
    date: daysAgo(3),
    duration: 8,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:12] Mary Garcia: I submitted a support ticket three days ago and haven't received a response.

[00:30] Mindi AI Assistant: I'm sorry for the delay. Let me connect you with our support team immediately.

[00:45] John Smith: Hi Mary, this is John. I'm so sorry about the delay. Let me look into your ticket right now.

[02:00] Mary Garcia: This is unacceptable. We pay for priority support and this is the response we get?

[03:30] John Smith: I completely understand your frustration. I'm personally handling your ticket now and will have a resolution today.

[05:00] Mary Garcia: I need this resolved immediately.`,
    summary: 'Unresponsive support complaint. Ticket delayed for three days. Personal handling promised.',
    sentiment: 'negative',
    intent: 'Support responsiveness complaint',
    messageCount: 6
  },
  {
    id: 'conv-11-5',
    customerId: '11',
    channel: 'sms',
    date: hoursAgo(1),
    agent: 'Support Bot',
    transcript: `[SMS] Mary Garcia: System is down again. This is unacceptable.

[SMS] Support Bot: I'm so sorry about the outage. Our team is working on it right now. I'll update you as soon as I have more information.

[SMS] Mary Garcia: We need immediate action. This is affecting our business.

[SMS] Support Bot: I understand completely. I'm escalating this to our executive team immediately.`,
    summary: 'SMS complaint about system outage. Executive escalation promised.',
    sentiment: 'negative',
    intent: 'System outage complaint',
    messageCount: 4
  },
  {
    id: 'conv-11-6',
    customerId: '11',
    channel: 'sms',
    date: daysAgo(1),
    agent: 'Support Bot',
    transcript: `[SMS] Mary Garcia: Still waiting on response to my support ticket.

[SMS] Support Bot: I'm so sorry for the delay. Let me escalate this immediately and someone will contact you within the hour.

[SMS] Mary Garcia: This is the third time I've had to follow up. Unacceptable.

[SMS] Support Bot: I completely understand your frustration. I'm personally ensuring this gets resolved today.`,
    summary: 'SMS follow-up on delayed support ticket. Personal resolution promised.',
    sentiment: 'negative',
    intent: 'Support follow-up',
    messageCount: 4
  },
  {
    id: 'conv-11-7',
    customerId: '11',
    channel: 'sms',
    date: daysAgo(2),
    agent: 'Support Bot',
    transcript: `[SMS] Mary Garcia: Billing issue - we were overcharged again.

[SMS] Support Bot: I'm so sorry about the billing error. Let me connect you with our billing team right away.

[SMS] Mary Garcia: This keeps happening. We need this fixed permanently.

[SMS] Support Bot: I understand completely. I'm escalating this to our billing manager and we'll ensure this doesn't happen again.`,
    summary: 'SMS complaint about recurring billing errors. Billing manager escalation promised.',
    sentiment: 'negative',
    intent: 'Billing complaint',
    messageCount: 4
  },
  {
    id: 'conv-11-8',
    customerId: '11',
    channel: 'email',
    date: daysAgo(1),
    agent: 'John Smith',
    subject: 'Multiple Issues - Urgent',
    transcript: `Subject: Multiple Issues - Urgent

From: Mary Garcia <mary.garcia@nextgen.com>
To: support@company.com
Date: ${new Date(daysAgo(1)).toLocaleString()}

Team,

We've been experiencing multiple issues:
1. System performance is extremely slow
2. Support tickets go unanswered
3. Billing errors on multiple invoices

This is unacceptable. We need immediate action.

Mary Garcia`,
    summary: 'Email listing multiple complaints: performance, support, and billing issues.',
    sentiment: 'negative',
    intent: 'Multiple complaints',
    messageCount: 1
  },
  {
    id: 'conv-11-9',
    customerId: '11',
    channel: 'email',
    date: daysAgo(3),
    agent: 'Emily Davis',
    subject: 'Billing Error',
    transcript: `Subject: Billing Error

From: Mary Garcia <mary.garcia@nextgen.com>
To: billing@company.com
Date: ${new Date(daysAgo(3)).toLocaleString()}

Hi,

We were overcharged on our latest invoice. Please correct this immediately.

Thanks,
Mary Garcia`,
    summary: 'Billing error complaint requesting immediate correction.',
    sentiment: 'negative',
    intent: 'Billing error',
    messageCount: 1
  },

  // Add a few more key customers to round out the data
  // Customer 12 - Richard Moore (Advanced Systems) - opportunity
  {
    id: 'conv-12-1',
    customerId: '12',
    channel: 'video',
    date: hoursAgo(4),
    duration: 30,
    agent: 'Michael Chen',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Richard Moore: Hi, I'm interested in learning more about your Enterprise plan, particularly around security and compliance.

[01:00] Mindi AI Assistant: Great! Let me connect you with our sales specialist.

[01:30] Michael Chen: Hi Richard, this is Michael. I'd be happy to discuss Enterprise security and compliance features.

[02:30] Richard Moore: We need SOC 2 Type II certification and advanced security features for our industry.

[04:00] Michael Chen: Perfect. We have SOC 2 Type II certification and offer advanced encryption, IP allowlisting, and dedicated compliance support.

[05:30] Richard Moore: That's exactly what we need. Can you send me the compliance documentation?

[07:00] Michael Chen: Absolutely. I'll send you all the compliance documentation today and we can schedule a call to discuss your specific requirements.

[08:00] Richard Moore: Yes, I'd like that. Thank you.`,
    summary: 'Enterprise plan inquiry focusing on security and compliance. Compliance documentation to be sent.',
    sentiment: 'positive',
    intent: 'Enterprise security inquiry',
    messageCount: 7
  },
  {
    id: 'conv-12-2',
    customerId: '12',
    channel: 'phone',
    date: daysAgo(4),
    duration: 12,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Richard Moore: Hi, I'm calling to learn more about your platform's security features.

[00:45] Mindi AI Assistant: I'd be happy to help. Let me connect you with our security specialist.

[01:00] Emily Davis: Hi Richard, this is Emily. What security features are you most interested in?

[02:00] Richard Moore: We need enterprise-grade security and compliance certifications.

[03:30] Emily Davis: Perfect. We offer SOC 2 Type II, advanced encryption, and dedicated security support.

[05:00] Richard Moore: Can you send me more information?

[06:00] Emily Davis: Absolutely. I'll send you our security documentation and compliance certifications.`,
    summary: 'Security features inquiry. Security documentation to be sent.',
    sentiment: 'positive',
    intent: 'Security inquiry',
    messageCount: 6
  },

  // Customer 13 - Thomas Wright (Secure Networks) - lead
  {
    id: 'conv-13-1',
    customerId: '13',
    channel: 'phone',
    date: hoursAgo(3),
    duration: 18,
    agent: 'John Smith',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Thomas Wright: Hi, I'm calling to inquire about your security features and compliance certifications.

[00:45] Mindi AI Assistant: I'd be happy to help. Let me connect you with our security specialist.

[01:00] John Smith: Hi Thomas, this is John. What security features are you interested in?

[02:00] Thomas Wright: We're evaluating platforms for our security needs. Can you tell me about your compliance certifications?

[03:30] John Smith: Absolutely. We have SOC 2 Type II, ISO 27001, and we're HIPAA compliant. We also offer advanced encryption and security features.

[05:00] Thomas Wright: That's impressive. Can you send me the compliance documentation?

[06:30] John Smith: Of course. I'll send you all our compliance documentation and we can schedule a security consultation call.

[08:00] Thomas Wright: Yes, I'd like that. Thank you.`,
    summary: 'Security and compliance inquiry. Compliance documentation to be sent, security consultation scheduled.',
    sentiment: 'positive',
    intent: 'Security consultation',
    messageCount: 7
  },

  // Customer 14 - Amanda Foster (Creative Media) - follow-up
  {
    id: 'conv-14-1',
    customerId: '14',
    channel: 'email',
    date: hoursAgo(1),
    agent: 'Emily Davis',
    subject: 'Trial Extension Request',
    transcript: `Subject: Trial Extension Request

From: Amanda Foster <amanda.foster@creativemedia.com>
To: support@company.com
Date: ${new Date(hoursAgo(1)).toLocaleString()}

Hi,

We're currently in our free trial and would like to request an extension to evaluate additional features before making a decision. Is this possible?

Thanks,
Amanda Foster`,
    summary: 'Trial extension request to evaluate additional features before making a decision.',
    sentiment: 'neutral',
    intent: 'Trial extension request',
    messageCount: 1
  },

  // Customer 15 - Daniel Lee (Startup Ventures) - opportunity
  {
    id: 'conv-15-1',
    customerId: '15',
    channel: 'video',
    date: hoursAgo(5),
    duration: 35,
    agent: 'Michael Chen',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:15] Daniel Lee: Hi, I wanted to discuss potential partnership opportunities and integration possibilities.

[01:00] Mindi AI Assistant: Great! Let me connect you with our partnerships team.

[01:30] Michael Chen: Hi Daniel, this is Michael. I'd be happy to discuss partnership opportunities with you.

[02:30] Daniel Lee: We're interested in integrating our platforms and exploring a partnership.

[04:00] Michael Chen: That sounds exciting. Can you tell me more about your platform and what kind of integration you're thinking about?

[05:30] Daniel Lee: We have a complementary product and think there could be synergies. We'd like to explore API integration and potential co-marketing.

[07:00] Michael Chen: That's interesting. I'd love to learn more about your platform. Can we schedule a deeper dive call?

[08:30] Daniel Lee: Yes, absolutely. How about next week?

[09:30] Michael Chen: Perfect. I'll send you a calendar invite with some times that work for me.`,
    summary: 'Partnership and integration discussion. Deeper dive call scheduled for next week.',
    sentiment: 'positive',
    intent: 'Partnership inquiry',
    messageCount: 8
  },

  // Customer 16 - Rachel Green (Healthcare Solutions) - no-action
  {
    id: 'conv-16-1',
    customerId: '16',
    channel: 'sms',
    date: hoursAgo(7),
    agent: 'Support Bot',
    transcript: `[SMS] Rachel Green: Having trouble logging into my account.

[SMS] Support Bot: I'm sorry to hear that. Let me help you reset your password. I'll send you a password reset link to your email.

[SMS] Rachel Green: Thank you, I received it.

[SMS] Support Bot: Great! Let me know if you need any other assistance.`,
    summary: 'Account login issue. Password reset instructions provided.',
    sentiment: 'neutral',
    intent: 'Account access issue',
    messageCount: 4
  },

  // Customer 17 - Kevin Park (Retail Innovations) - follow-up
  {
    id: 'conv-17-1',
    customerId: '17',
    channel: 'phone',
    date: hoursAgo(9),
    duration: 10,
    agent: 'Emily Davis',
    transcript: `[00:00] Mindi AI Assistant: Hello, this is Mindi AI Assistant. How can I help you today?

[00:12] Kevin Park: Hi, I'm calling to ask about mobile app features for our retail team.

[00:30] Mindi AI Assistant: I'd be happy to help. Let me connect you with our product team.

[00:45] Emily Davis: Hi Kevin, this is Emily. What mobile app features are you interested in?

[01:30] Kevin Park: We need to know when mobile app features will be available for our retail team.

[02:30] Emily Davis: I can check on that for you. Let me look up the rollout timeline.

[04:00] Kevin Park: We're planning our Q4 rollout and need to know if we can include mobile features.

[05:30] Emily Davis: I'll get you the mobile app feature timeline today. Can I send that to your email?

[06:00] Kevin Park: Yes, that would be helpful. Thank you.`,
    summary: 'Mobile app feature availability inquiry for retail team. Timeline to be provided.',
    sentiment: 'neutral',
    intent: 'Feature availability inquiry',
    messageCount: 7
  }
]
