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
}

export const mockConversations: MockConversation[] = [
  {
    id: 'conv-1',
    customerId: '1',
    channel: 'phone',
    date: '2025-11-06T14:30:00Z',
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
    intent: 'Billing dispute resolution'
  },
  {
    id: 'conv-2',
    customerId: '2',
    channel: 'video',
    date: '2025-11-06T12:00:00Z',
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
    intent: 'Technical integration inquiry'
  },
  {
    id: 'conv-3',
    customerId: '6',
    channel: 'phone',
    date: '2025-11-06T15:30:00Z',
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
    intent: 'Service cancellation request'
  },
  {
    id: 'conv-4',
    customerId: '1',
    channel: 'email',
    date: '2025-11-06T09:00:00Z',
    agent: 'John Smith',
    subject: 'Re: Billing Inquiry - Invoice #INV-2025-001',
    transcript: `Subject: Re: Billing Inquiry - Invoice #INV-2025-001

From: Sarah Johnson <sarah.johnson@acmecorp.com>
To: support@company.com
Date: November 6, 2025, 9:00 AM

Hi,

I'm following up on my call from yesterday. I still haven't received the billing correction you promised. I've been a loyal customer for three years and this level of service is disappointing.

I need this resolved immediately or I'll be forced to explore other options.

Best regards,
Sarah Johnson

---

From: John Smith <john.smith@company.com>
To: sarah.johnson@acmecorp.com
Date: November 6, 2025, 9:15 AM

Subject: Re: Billing Inquiry - Invoice #INV-2025-001

Hi Sarah,

I sincerely apologize for the delay. I'm looking into this right now and I'll have the correction processed within the next hour. I'll send you a confirmation email as soon as it's done.

I completely understand your frustration, and I want to make sure we make this right. I've also assigned a dedicated account manager to your account who will reach out to you today.

Again, I apologize for the inconvenience and I appreciate your patience.

Best regards,
John Smith`,
    summary: 'Customer following up on billing issue via email. Expressing frustration with delay in resolution. Threatening to explore alternatives. Response promises immediate resolution and account manager assignment.',
    sentiment: 'negative',
    intent: 'Billing follow-up and complaint'
  },
  {
    id: 'conv-5',
    customerId: '7',
    channel: 'video',
    date: '2025-11-06T11:00:00Z',
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
    intent: 'Upgrade inquiry'
  }
]
