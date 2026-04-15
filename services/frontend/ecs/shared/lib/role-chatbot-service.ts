import type { RoleContextData } from '@/shared/lib/chatbot-backend-service';

export type RoleChatbotRole = 'admin' | 'program-chair' | 'project-head' | 'staff' | 'public-user' | 'unknown';

export type RoleChatbotSender = 'user' | 'bot';

export interface RoleChatbotMessage {
  id: string;
  sender: RoleChatbotSender;
  text: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
}

export interface RoleChatbotResponse {
  text: string;
  actionUrl?: string;
  actionLabel?: string;
}

interface RoleRule {
  keywords: string[];
  response: string;
}

interface RoleChatbotConfig {
  title: string;
  welcome: string;
  askGuides: string[];
  quickPrompts: string[];
  rules: RoleRule[];
  fallback: string;
}

const MAX_MESSAGES = 80;
const STORAGE_PREFIX = 'ecs_role_chatbot_history';

// Link safety: only show links if user explicitly asks for navigation
function shouldProvideLink(userMessage: string): boolean {
  const navigationPhrases = [
    'take me',
    'can you take me',
    'can you show me',
    'can you send me',
    'go to',
    'open',
    'navigate',
    'show me',
    'where is',
    'where can i',
    'link',
    'click',
    'button',
    'menu',
  ];
  const msg = userMessage.toLowerCase();
  return navigationPhrases.some((phrase) => msg.includes(phrase));
}

// Parse user intent to avoid misunderstandings
function parseUserIntent(userMessage: string): {
  wantsHelp: boolean;
  wantsNavigation: boolean;
  wantsJustInfo: boolean;
  confidence: number;
} {
  const msg = userMessage.toLowerCase();
  
  // Check for explicit "no links" or "just tell me"
  const noLink = msg.includes('just tell') || msg.includes('dont') || msg.includes('don\'t') || 
                 msg.includes('no link') || msg.includes('no menu') ||
                 msg.includes('just explain') || msg.includes('how to');
  
  // Check for navigation intent
  const navIntent = shouldProvideLink(userMessage);
  
  // Check for pure information request
  const infoRequest = msg.includes('what is') || msg.includes('explain') || 
                      msg.includes('tell me') || msg.includes('how does');
  
  return {
    wantsHelp: msg.includes('help') || msg.includes('assist'),
    wantsNavigation: navIntent && !noLink,
    wantsJustInfo: noLink || infoRequest,
    confidence: navIntent ? 0.9 : 0.7,
  };
}

// Detect if a message might be misunderstood
function isMisunderstandingRisk(userMessage: string): boolean {
  const msg = userMessage.toLowerCase();
  // Ambiguous short messages
  if (userMessage.trim().length < 4) return true;
  
  // Messages that might trigger false positives
  const risky = msg.includes('not ') && (msg.includes('help') || msg.includes('work'));
  
  return risky;
}

const COMMON_RULES: RoleRule[] = [
  {
    keywords: ['help', 'assist', 'assistant', 'what can you do', 'capabilities'],
    response:
      'I\'m a bot here to guide you through your workflows. You can ask me about any task, use the quick prompts below for common questions, or I can walk you through step-by-step processes. What would you like help with?',
  },
  {
    keywords: ['hello', 'hi', 'hey', 'greetings'],
    response: 'Hello! I\'m here to help you navigate your dashboard and complete your tasks efficiently. Feel free to ask me anything about your role or use the quick prompts for common workflows.',
  },
  {
    keywords: ['thank', 'thanks', 'appreciate'],
    response: 'You\'re welcome! Happy to help. Feel free to ask me anything else—I\'m here whenever you need guidance.',
  },
  {
    keywords: ['how are you', 'doing'],
    response: 'I\'m functioning well and ready to assist you! Let me know what you need help with today.',
  },
];

const ROLE_CONFIG: Record<RoleChatbotRole, RoleChatbotConfig> = {
  admin: {
    title: 'Chatbot Help Assistant',
    welcome:
      'I can help you manage the entire system: approving requests, managing users, monitoring budgets, and tracking analytics. What would you like to focus on?',
    askGuides: [
      'How do I approve or reject a request?',
      'How can I manage users and roles?',
      'Where do I monitor program and budget status?',
      'How do I find analytics and reports?',
    ],
    quickPrompts: [
      'How do I approve a request?',
      'How do I add or edit users?',
      'Where can I check budget analytics?',
      'How do I manage departments?',
    ],
    rules: [
      {
        keywords: ['approve', 'approval', 'reject', 'request'],
        response:
          'To approve or reject a request: 1) Open Request Management, 2) Select the pending request, 3) Review all details carefully, 4) Add your notes for the requestor, 5) Click Approve or Reject. Your comments help guide the next steps.',
      },
      {
        keywords: ['user', 'users', 'role', 'account', 'status'],
        response:
          'To manage users: 1) Go to Admin User Management, 2) Add new users or edit existing ones, 3) Assign their role (Admin, Program Chair, etc.) and department, 4) Set their status (Active/Inactive), 5) Save changes. Always double-check assignments—they control what each person can access.',
      },
      {
        keywords: ['budget', 'fund', 'allocation', 'analytics', 'report'],
        response:
          'To manage budgets as Admin: 1) Open Admin Budget Management for overall system budget status, 2) Navigate to Analytics Dashboard for detailed spending reports by department and program, 3) Use Budget Summary to track allocated vs. spent across the system, 4) Filter by time period or department to find trends, 5) Use this data to make informed allocation recommendations to senior leadership.',
      },
      {
        keywords: ['department', 'program'],
        response:
          'To manage departments and programs: 1) Use Program & Department screens, 2) Confirm ownership and visibility settings, 3) Assign department chairs and program leads, 4) Publish changes when ready. Clear ownership structure prevents confusion down the workflow.',
      },
    ],
    fallback:
      'I can help with approvals, user management, budget analytics, departments, programs, and system oversight. Try asking about any of these, or pick a quick prompt to get started.',
  },
  'program-chair': {
    title: 'Chatbot Help Assistant',
    welcome:
      'I can guide you through reviewing requests, managing your budget allocations, and organizing programs. What do you need assistance with?',
    askGuides: [
      'How do I review incoming requests?',
      'How do I assign and manage programs?',
      'How do I allocate or revert department budgets?',
      'How do I review budget requests?',
    ],
    quickPrompts: [
      'How do I review and decide requests?',
      'How do I allocate budget to departments?',
      'How do I revert an allocation?',
      'How do I review budget requests?',
    ],
    rules: [
      {
        keywords: ['review', 'approve', 'reject', 'request'],
        response:
          'To review a request: 1) Open Request Management, 2) Read the full request details (title, description, budget), 3) Check if it fits your program scope, 4) Add your decision and notes, 5) Submit. Your feedback helps requestors improve future submissions.',
      },
      {
        keywords: ['program', 'assign', 'management'],
        response:
          'To organize programs: 1) Go to Program Management. 2) Click "Create Program" and select from approved requests. 3) Fill in program details (name, description, category, department, objectives, beneficiaries, schedule). 4) Assign a project head to each program. 5) Set the timeline and budget cap. 6) Save and publish the program so teams are notified and can begin work. Clear, complete details help everyone stay on track.',
      },
      {
        keywords: ['allocate', 'allocation', 'department', 'budget'],
        response:
          'To allocate budget to departments: 1) Go to Program Chair Budget Management, 2) Check your total available budget and current allocations, 3) Select a department to allocate to, 4) Enter the allocation amount (system prevents over-allocation), 5) Add justification or notes about why you\'re allocating this amount, 6) Save. The department will see their budget immediately and can begin requesting for project funding.',
      },
      {
        keywords: ['revert', 'undo', 'remove allocation'],
        response:
          'To revert an allocation: 1) Go to Program Chair Budget Management, 2) View your allocation history to find the one to revert, 3) Click the Revert button next to the allocation, 4) Confirm the revert action (add notes about why if helpful), 5) The budget immediately returns to your available balance. You can then reallocate to other departments based on updated priorities.',
      },
    ],
    fallback:
      'I can help with request reviews, program management, budget allocation, department oversight, and more. Ask me anything or use a quick prompt!',
  },
  'project-head': {
    title: 'Chatbot Help Assistant',
    welcome:
      'I can help you manage projects, assign staff, organize tasks, and handle budget requests. What would you like to work on?',
    askGuides: [
      'How do I review and accept project requests?',
      'How do I request or assign staff to projects?',
      'How do I create and manage project tasks?',
      'How do I submit a budget request for my project?',
    ],
    quickPrompts: [
      'How do I review or accept project requests?',
      'How do I assign staff to projects?',
      'How do I create project tasks?',
      'How do I submit budget requests?',
    ],
    rules: [
      {
        keywords: ['accept', 'request', 'review', 'project request'],
        response:
          'To accept a project request: 1) Go to Project Head Request Management, 2) Review the request scope and expectations, 3) Decide to accept or reject, 4) Add notes about your decision, 5) Submit. Your acceptance signals the project is moving forward.',
      },
      {
        keywords: ['assign', 'staff', 'unassign'],
        response:
          'To work with project staff: 1) Go to Project Management → Assign Staff tab, 2) Request additional staff from available pool if needed, 3) Review pending staff assignments from Program Chair, 4) Accept or adjust assignments (check staff availability and skills), 5) Assign tasks to team members once onboarded, 6) Submit. Clear staff assignments prevent gaps and ensure accountability.',
      },
      {
        keywords: ['task', 'status', 'create', 'delete'],
        response:
          'To manage tasks: 1) Open Task Management, 2) Create new tasks with title, description, assignee, and due date, 3) Update status (Not Started → In Progress → Completed), 4) Archive completed tasks, 5) Delete only if truly unnecessary. Always keep team aligned on task status.',
      },
      {
        keywords: ['budget request', 'budget', 'finance', 'fund'],
        response:
          'To submit a budget request as Project Head: 1) Go to Budget Management, 2) Click New Budget Request, 3) Select your project and enter amount needed, 4) Provide detailed justification explaining the item, timeline, and impact, 5) List any supporting documents (quotes, invoices, proposals), 6) Submit for Program Chair review. More detailed justifications get approved faster because reviewers can quickly understand your needs.',
      },
    ],
    fallback:
      'I can help with accepting projects, assigning staff, managing tasks, submitting budgets, and tracking project progress. What would you like to do?',
  },
  staff: {
    title: 'Chatbot Help Assistant',
    welcome:
      'I can help you track your tasks, update project progress, and submit requests. How can I assist you today?',
    askGuides: [
      'How do I update task status?',
      'How do I check assigned projects?',
      'How do I submit a project or service request?',
      'How do I track request status?',
    ],
    quickPrompts: [
      'How do I update my task status?',
      'Where can I see my projects?',
      'How do I submit a request?',
      'How do I follow up on status?',
    ],
    rules: [
      {
        keywords: ['task', 'status', 'complete', 'progress'],
        response:
          'To update task status: 1) Go to Staff Dashboard → Project Tasks, 2) Find the task you\'re working on, 3) Click the task to open details, 4) Update the status (Not Started → In Progress → Completed), 5) Add notes about progress if needed, 6) Save. Keep status current so your project head can accurately track overall project progress and identify blockers early.',
      },
      {
        keywords: ['project', 'assigned'],
        response:
          'View your assigned projects in the Staff Dashboard. Each project shows: scope, timeline, assigned tasks, current progress, and department contact. Click any project to see detailed requirements, task breakdown, team members, and any updates from your project head.',
      },
      {
        keywords: ['request', 'submit', 'service', 'project request'],
        response:
          'To submit a Service Request: 1) Go to Dashboard → Submit Service Request, 2) Choose request type (service, training, resource, etc.), 3) Fill in title and detailed description of what you need, 4) Specify scope (who benefits, how many people), 5) Provide justification and attach supporting documents, 6) Submit. Clear, complete requests move through approval faster because reviewers have all context upfront.',
      },
      {
        keywords: ['follow up', 'status', 'pending', 'approval'],
        response:
          'Track your request status in the Staff Dashboard → My Requests. Status shows: Submitted → Under Review → Approved/Rejected. If pending, check that all required fields are complete. You\'ll receive notifications when reviewers provide feedback. If it\'s been more than 5 days, reach out to your Program Chair or Project Head directly.',
      },
    ],
    fallback:
      'I can help with updating task status, viewing projects, submitting requests, and tracking progress. What would you like help with?',
  },
  'public-user': {
    title: 'Chatbot Help Assistant',
    welcome:
      'I can help you submit requests, track their progress, and understand reviewer feedback. What would you like to know?',
    askGuides: [
      'How do I submit a request?',
      'How do I track request status?',
      'Where can I view feedback from reviewers?',
      'What details should I include in a request?',
    ],
    quickPrompts: [
      'How do I submit a new request?',
      'How do I track my request status?',
      'Where can I view feedback?',
      'What should I include in details?',
    ],
    rules: [
      {
        keywords: ['submit', 'new request', 'create request', 'form'],
        response:
          'To submit your request: 1) Go to Public User Dashboard → Submit Request, 2) Enter a clear title (e.g., "Summer Computer Skills Training"), 3) Write detailed description of what you\'re requesting, 4) Specify beneficiaries and how many people will benefit, 5) Estimate realistic budget, 6) Provide strong justification explaining impact and why this matters to your community, 7) Attach supporting documents (letters, quotes, references), 8) Submit. Complete, well-justified requests move through approval much faster.',
      },
      {
        keywords: ['status', 'track', 'pending', 'approved', 'rejected'],
        response:
          'Track your request in Public User Dashboard → View Requests. You\'ll see the status: Submitted (awaiting Program Chair), Under Review (being evaluated), Approved (moving to implementation), or Rejected (review feedback included). You\'ll get email notifications at each stage. Requests typically take 5-10 business days for initial review.',
      },
      {
        keywords: ['feedback', 'notes', 'comment'],
        response:
          'View reviewer feedback in your request details. Program Chairs and Project Heads add notes explaining their decisions, asking clarifying questions, or suggesting improvements. If your request is approved, feedback shows next steps and timeline. If rejected, read it carefully—feedback explains what\'s needed to resubmit successfully. You can revise and resubmit rejected requests anytime.',
      },
      {
        keywords: ['budget', 'justification', 'beneficiary'],
        response:
          'Make your request strong: 1) Estimate realistic budget with line items (materials, honorariums, meals, etc.), 2) Clearly state how many people benefit and how, 3) Explain the impact (skills gained, problems solved, community strengthened), 4) Connect to department goals if applicable, 5) Attach quotes or supporting evidence, 6) Be specific, not vague. Detailed requests get approved 3x faster because reviewers immediately understand and can advocate for you.',
      },
    ],
    fallback:
      'I can help with submitting requests, tracking status, understanding feedback, and improving request quality. Ask me anything!',
  },
  unknown: {
    title: 'Chatbot Help Assistant',
    welcome:
      'I\'m here to guide you through your workflows! I can help with requests, approvals, budgets, and tracking. What would you like to learn about?',
    askGuides: ['How do I navigate this dashboard?', 'How do I submit requests?', 'How do I check status updates?'],
    quickPrompts: ['How do I submit a request?', 'How do I check status?', 'What can this assistant do?'],
    rules: [],
    fallback:
      'I can assist with most workflow questions. Try asking about requests, approvals, budgets, tasks, staff assignments, or analytics. Pick a quick prompt or describe what you need.',
  },
};

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

function includesKeyword(text: string, keyword: string): boolean {
  return text.includes(keyword.toLowerCase());
}

export function normalizeRoleForChatbot(role?: string | null): RoleChatbotRole {
  const value = String(role || '').trim().toLowerCase().replace(/_/g, '-');
  if (value === 'admin') return 'admin';
  if (value === 'program-chair') return 'program-chair';
  if (value === 'project-head') return 'project-head';
  if (value === 'staff') return 'staff';
  if (value === 'public-user') return 'public-user';
  return 'unknown';
}

export function getRoleChatbotConfig(role: RoleChatbotRole): RoleChatbotConfig {
  return ROLE_CONFIG[role] || ROLE_CONFIG.unknown;
}

function withAction(role: RoleChatbotRole, message: string, text: string): RoleChatbotResponse {
  const action = getActionSuggestion(role, message);
  return {
    text,
    actionUrl: action?.url,
    actionLabel: action?.label,
  };
}

function roleRoutePrefix(role: RoleChatbotRole): string {
  if (role === 'program-chair') return 'program-chair';
  if (role === 'project-head') return 'project-head';
  if (role === 'public-user') return 'public-user';
  return role;
}

function getActionSuggestion(role: RoleChatbotRole, message: string): { url: string; label: string } | null {
  // SAFETY CHECK: Only provide links if user explicitly asked for navigation
  if (!shouldProvideLink(message)) {
    return null;
  }

  const prefix = roleRoutePrefix(role);
  const msg = message.toLowerCase();
  
  // Check if user is explicitly asking for navigation
  const explicitNavigation =
    msg.includes('can you take me') ||
    msg.includes('can you show me') ||
    msg.includes('take me') ||
    msg.includes('show me') ||
    msg.includes('go to') ||
    msg.includes('open') ||
    msg.includes('navigate to');

  if (!explicitNavigation) return null;

  if (includesKeyword(message, 'budget') || includesKeyword(message, 'allocation') || includesKeyword(message, 'fund')) {
    if (role === 'admin') return { url: `/${prefix}/admin-budget-management`, label: 'Go to Budget Management' };
    if (role === 'program-chair') return { url: `/${prefix}/program-chair-budget-management`, label: 'Go to Budget Management' };
    if (role === 'project-head') return { url: `/${prefix}/project-head-budget-management`, label: 'Go to Budget Management' };
    return null;
  }

  if (includesKeyword(message, 'request') || includesKeyword(message, 'approval')) {
    if (role === 'admin') return { url: `/${prefix}/admin-program-management`, label: 'Go to Program Management' };
    // For program-chair, link to Program Management with ?tab=pending to open the Pending Projects tab
    if (role === 'program-chair') return { url: `/${prefix}/program-chair-program-management?tab=pending`, label: 'Go to Program Management (Pending Requests)' };
    if (role === 'project-head') return { url: `/${prefix}/project-head-request-management`, label: 'Go to Request Management' };
    if (role === 'staff') return { url: `/${prefix}/staff-request-management`, label: 'Go to Request Management' };
    if (role === 'public-user') return { url: `/${prefix}/public-user-request-form`, label: 'Go to Request Form' };
  }

  if (includesKeyword(message, 'task')) {
    if (role === 'project-head') return { url: `/${prefix}/project-head-task-management`, label: 'Go to Task Management' };
    if (role === 'staff') return { url: `/${prefix}/staff-project-task`, label: 'Go to Project Tasks' };
  }

  if (includesKeyword(message, 'program')) {
    if (role === 'admin') return { url: `/${prefix}/admin-program-management`, label: 'Go to Program Management' };
    if (role === 'program-chair') return { url: `/${prefix}/program-chair-program-management`, label: 'Go to Program Management' };
  }

  if (includesKeyword(message, 'user') || includesKeyword(message, 'account')) {
    if (role === 'admin') return { url: `/${prefix}/admin-user-management`, label: 'Go to User Management' };
    return { url: `/${prefix}/settings`, label: 'Go to Settings' };
  }

  if (includesKeyword(message, 'analytics') || includesKeyword(message, 'report')) {
    if (role === 'admin') return { url: `/${prefix}/admin-analytics`, label: 'Go to Analytics' };
    if (role === 'program-chair') return { url: `/${prefix}/program-chair-analytics`, label: 'Go to Analytics' };
    if (role === 'project-head') return { url: `/${prefix}/project-head-analytics`, label: 'Go to Analytics' };
  }

  if (includesKeyword(message, 'project')) {
    if (role === 'program-chair') return { url: `/${prefix}/program-chair-project-list`, label: 'Go to Project List' };
    if (role === 'project-head') return { url: `/${prefix}/project-head-dashboard`, label: 'Go to Project Dashboard' };
    if (role === 'staff') return { url: `/${prefix}/staff-project-task`, label: 'Go to Project Tasks' };
    if (role === 'public-user') return { url: `/${prefix}/public-user-project-list`, label: 'Go to Project List' };
  }

  if (includesKeyword(message, 'dashboard')) {
    if (role === 'admin') return { url: `/${prefix}/admin-dashboard`, label: 'Go to Dashboard' };
    if (role === 'program-chair') return { url: `/${prefix}/program-chair-dashboard`, label: 'Go to Dashboard' };
    if (role === 'project-head') return { url: `/${prefix}/project-head-dashboard`, label: 'Go to Dashboard' };
    if (role === 'staff') return { url: `/${prefix}/staff-dashboard`, label: 'Go to Dashboard' };
    if (role === 'public-user') return { url: `/${prefix}/public-user-dashboard`, label: 'Go to Dashboard' };
  }

  return null;
}

// Detect if a question is completely off-topic for the system
function isOffTopic(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  
  // Detect insults and rude language - stricter matching
  const insults = ['stupid', 'idiot', 'dumb', 'fool', 'crazy', 'insane', 'worthless', 'useless'];
  for (const insult of insults) {
    // Match standalone word or word with punctuation
    if (lowerMessage === insult || 
        lowerMessage === insult + '?' ||
        lowerMessage === insult + '!' ||
        lowerMessage === insult + '.' ||
        lowerMessage.startsWith(insult + ' ') || 
        lowerMessage.includes(' ' + insult) ||
        lowerMessage.endsWith(' ' + insult)) {
      return true;
    }
  }
  
  // Detect political figures and controversial topics
  const politicalKeywords = [
    'duterte', 'trump', 'biden', 'marcos', 'aquino', 'politician',
    'president', 'election', 'vote', 'campaign', 'political party',
    'congress', 'senate', 'representative'
  ];
  
  const offTopicKeywords = [
    'weather', 'temperature', 'rain', 'snow', 'climate',
    'sports', 'football', 'basketball', 'baseball', 'soccer', 'game score',
    'movie', 'film', 'actor', 'actress', 'cinema', 'netflix',
    'recipe', 'cooking', 'food', 'restaurant', 'cuisine',
    'music', 'song', 'artist', 'band', 'concert',
    'birthday', 'anniversary', 'celebration',
    'joke', 'funny', 'laugh', 'meme', 'comic',
    'video game', 'gaming', 'playstation', 'xbox', 'game',
    'hobby', 'hobby interest', 'pastime',
    'pet', 'dog', 'cat', 'animal',
    'love', 'relationship', 'dating', 'boyfriend', 'girlfriend', 'crush', 'romance',
    'religion', 'theology', 'church', 'god', 'faith',
    'philosophy', 'existential',
    'vaccination', 'vaccine', 'conspiracy theory',
    'stock', 'trading', 'crypto', 'bitcoin', 'ethereum',
    'investment', 'loan', 'mortgage', 'insurance', 'financial advice',
    'medical', 'doctor', 'hospital', 'disease', 'treatment', 'health condition', 'symptom', 'diagnosis',
    'legal advice', 'lawsuit', 'divorce', 'criminal', 'attorney',
    'fashion', 'clothing', 'style', 'brand',
    'travel', 'vacation', 'destination', 'flight', 'hotel',
    'car', 'vehicle', 'driving', 'mechanic',
    'science fiction', 'fantasy', 'novel', 'book'
  ];
  
  const allOffTopicWords = [...politicalKeywords, ...offTopicKeywords];
  return allOffTopicWords.some(keyword => lowerMessage.includes(keyword));
}

// Generate proper etiquette response for off-topic questions
function getOffTopicResponse(role: RoleChatbotRole): string {
  const roleSpecific = {
    admin: "I appreciate the question, but I'm specifically designed to help with system administration, project management, budget oversight, and user management tasks. Is there anything related to the Extension Services system I can assist you with?",
    'program-chair': "I appreciate the question, but I'm here specifically to help with program management, request reviews, budget allocation, and department oversight. Is there anything related to your programs or budgets I can help with?",
    'project-head': "I appreciate the question, but I'm here to help with project management, staff assignments, task tracking, and budget requests for your projects. Can I assist you with any of these?",
    staff: "I appreciate the question, but I'm here specifically to help you with task management, project updates, and request tracking. Is there anything about your assigned tasks or projects I can help with?",
    'public-user': "I appreciate the question, but I'm here to help with submitting requests, tracking their status, and understanding feedback from reviewers. Can I assist you with your request?",
    unknown: "I appreciate the question, but I'm specialized in helping with Extension Services workflows. I can assist with requests, projects, approvals, budgets, and task management. What would you like help with?"
  };
  
  return roleSpecific[role] || roleSpecific.unknown;
}

export function generateBotResponse(role: RoleChatbotRole, userMessage: string, context?: RoleContextData): RoleChatbotResponse {
  const message = normalize(userMessage);
  if (!message) return withAction(role, message, ROLE_CONFIG[role].fallback);

  // Check for off-topic questions first and respond with proper etiquette
  if (isOffTopic(message)) {
    return withAction(role, message, getOffTopicResponse(role));
  }

  // Try context-aware response
  if (context) {
    const contextResponse = generateContextAwareResponse(role, message, context);
    if (contextResponse) return withAction(role, message, contextResponse);
  }

  const combinedRules = [...COMMON_RULES, ...ROLE_CONFIG[role].rules];
  for (const rule of combinedRules) {
    if (rule.keywords.some((keyword) => includesKeyword(message, keyword))) {
      return withAction(role, message, rule.response);
    }
  }

  // If no matching rule, provide contextual fallback instead of generic message
  const contextualFallback = getContextualFallback(role, message);
  return withAction(role, message, contextualFallback);
}

// Provide a contextual fallback message based on what the user asked about
function getContextualFallback(role: RoleChatbotRole, message: string): string {
  const lowerMsg = message.toLowerCase();
  
  // Detect partial matches and provide helpful guidance
  if (lowerMsg.includes('request')) {
    if (role === 'public-user') return "I can help with submitting, tracking, or understanding feedback on your requests. Could you be more specific about what you'd like to know?";
    if (role === 'program-chair') return "I can help with reviewing requests, approving/rejecting them, and managing your approvals workflow. What would you like to know?";
    return "I can help with various request workflows. Could you clarify what type of request you're asking about?";
  }
  
  if (lowerMsg.includes('team') || lowerMsg.includes('member') || lowerMsg.includes('colleague')) {
    if (role === 'project-head') return "I can help with assigning staff to your projects, managing team tasks, and tracking team progress. What do you need help with?";
    return "I can help with team and personnel-related features. What specifically would you like to know?";
  }
  
  if (lowerMsg.includes('report') || lowerMsg.includes('data') || lowerMsg.includes('statistic')) {
    return "I can help you find, generate, or understand reports and analytics. Would you like to know how to access reports or understand specific data?";
  }
  
  // Generic contextual fallback
  const roleDescriptions = {
    admin: "I'm here to help with system administration, user management, request approvals, and budget oversight.",
    'program-chair': "I'm here to help with program management, request reviews, budget allocation, and department supervision.",
    'project-head': "I'm here to help with project management, staff assignments, task organization, and budget submissions.",
    staff: "I'm here to help with task updates, project tracking, and request submissions.",
    'public-user': "I'm here to help with submitting requests, tracking progress, and understanding reviewer feedback.",
    unknown: "I'm here to help with Extension Services workflows and tasks."
  };
  
  return `${roleDescriptions[role] || roleDescriptions.unknown} I didn't quite understand that question. Feel free to ask about your specific role responsibilities, or pick a quick prompt to get started!`;
}

function generateContextAwareResponse(role: RoleChatbotRole, message: string, context: RoleContextData): string | null {
  // Admin context-aware responses
  if (role === 'admin') {
    if ((includesKeyword(message, 'project') || includesKeyword(message, 'status')) && context.projects) {
      const pending = context.projects.pending || 0;
      if (pending > 0) {
        return `You have ${pending} project(s) pending approval. Your total budget is allocated at $${context.budgets?.allocated || 0}, with $${context.budgets?.spent || 0} currently spent. Review pending projects in Admin Project Management to move them forward.`;
      }
    }
    if (
      (includesKeyword(message, 'assign budget') ||
        includesKeyword(message, 'allocate budget') ||
        (includesKeyword(message, 'assign') && includesKeyword(message, 'budget')) ||
        (includesKeyword(message, 'allocate') && includesKeyword(message, 'budget'))) &&
      context.budgets
    ) {
      return `Here's your current budget situation: Total Allocated: $${context.budgets.allocated}, Spent: $${context.budgets.spent}, Remaining: $${context.budgets.remaining}. To assign new budget, go to Budget Management and select a program chair to allocate funds to.`;
    }
    if ((includesKeyword(message, 'budget') || includesKeyword(message, 'spending')) && context.budgets) {
      return `Your budget overview: $${context.budgets.allocated} allocated total, $${context.budgets.spent} spent so far, $${context.budgets.remaining} remaining. You also have ${context.budgets.pending_requests || 0} pending budget requests to review.`;
    }
    if ((includesKeyword(message, 'notification') || includesKeyword(message, 'alert')) && context.notifications) {
      return `You have ${context.notifications.unread_count} unread notifications waiting for your attention. These include pending approvals and important system updates. Check your notification center to stay on top of urgent items.`;
    }
  }

  // Program Chair context-aware responses
  if (role === 'program-chair') {
    if (includesKeyword(message, 'my program') || includesKeyword(message, 'program status')) {
      if (context.programs?.total) {
        return `You manage ${context.programs.total} program(s) total. You currently have ${context.budgets?.pending_requests || 0} pending budget request(s) to review from your departments. Go to Program Management to see all your programs and their status.`;
      }
    }
    if (
      (includesKeyword(message, 'assign budget') ||
        includesKeyword(message, 'allocate budget') ||
        (includesKeyword(message, 'assign') && includesKeyword(message, 'budget')) ||
        (includesKeyword(message, 'allocate') && includesKeyword(message, 'budget'))) &&
      context.budgets
    ) {
      return `You have $${context.budgets.remaining} remaining in your budget cap. You're currently reviewing ${context.budgets.pending_requests || 0} budget request(s). Allocate wisely—once you commit funds to a department, they'll use it for their projects.`;
    }
    if ((includesKeyword(message, 'budget') || includesKeyword(message, 'allocation')) && context.budgets) {
      return `You have ${context.budgets.pending_requests || 0} budget request(s) awaiting your review. Your remaining allocation is $${context.budgets.remaining}. Visit Budget Requests to approve, reject, or request modifications from department heads.`;
    }
  }

  // Project Head context-aware responses
  if (role === 'project-head') {
    if ((includesKeyword(message, 'my project') || includesKeyword(message, 'project status')) && context.projects) {
      const pending = context.projects.pending || 0;
      return `You have ${context.projects.total} project(s) assigned. ${pending > 0 ? pending + ' need(s) your attention. ' : ''}You're managing ${context.tasks?.total || 0} total task(s) across all projects. Review your projects in Project Management to track progress.`;
    }
    // Only check for general "help" on task/staff topics, not specific HOW-TO questions
    if ((includesKeyword(message, 'help') || includesKeyword(message, 'overview')) && (includesKeyword(message, 'task') || includesKeyword(message, 'staff')) && context.tasks) {
      const inProgress = context.tasks.in_progress || 0;
      return `Your team has ${inProgress} task(s) in progress and ${context.tasks.pending || 0} pending. Keep regular updates flowing in Project Task Management so everyone stays aligned on progress.`;
    }
    if ((includesKeyword(message, 'budget') || includesKeyword(message, 'finance')) && context.budgets) {
      return `You have ${context.budgets.pending_requests || 0} pending budget request(s). Submit detailed justifications with supporting documents to speed up approvals from your Program Chair.`;
    }
  }

  // Staff context-aware responses
  if (role === 'staff') {
    if ((includesKeyword(message, 'my task') || includesKeyword(message, 'assigned')) && context.tasks) {
      const inProgress = context.tasks.in_progress || 0;
      return `You have ${context.tasks.total} task(s) assigned. ${inProgress} in progress, ${context.tasks.pending || 0} pending. Update your task status regularly in Staff Project Task view so your project head knows where you stand.`;
    }
  }

  // Public User context-aware responses
  if (role === 'public-user') {
    if ((includesKeyword(message, 'my request') || includesKeyword(message, 'status')) && context.requests) {
      const pending = context.requests.pending || 0;
      return `You have ${context.requests.total} request(s) total. ${pending > 0 ? pending + ' are pending review. ' : ''}Check your request details for reviewer feedback and next steps. Visit your request page to see real-time status updates.`;
    }
  }

  return null;
}

export function createBotWelcomeMessage(
  role: RoleChatbotRole,
  firstName?: string | null
): RoleChatbotMessage {
  const config = getRoleChatbotConfig(role);
  let welcomeText = config.welcome;
  
  // Personalize greeting with first name if available
  if (firstName) {
    const roleDisplayName = role === 'public-user' ? 'Public User' :
                           role === 'program-chair' ? 'Program Chair' :
                           role === 'project-head' ? 'Project Head' :
                           role.charAt(0).toUpperCase() + role.slice(1);
    welcomeText = `Hello ${firstName} you are logged in as a ${roleDisplayName}. ${config.welcome}`;
  }
  
  return {
    id: `bot-welcome-${Date.now()}`,
    sender: 'bot',
    text: welcomeText,
    timestamp: new Date().toISOString(),
  };
}

function getStorageKey(userID: string): string {
  return `${STORAGE_PREFIX}:${userID}`;
}

export function loadChatHistory(userID: string, role: RoleChatbotRole): RoleChatbotMessage[] {
  if (typeof window === 'undefined' || !userID) {
    return [createBotWelcomeMessage(role)];
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(userID));
    if (!raw) {
      return [createBotWelcomeMessage(role)];
    }

    const parsed = JSON.parse(raw) as { role?: RoleChatbotRole; messages?: RoleChatbotMessage[] };
    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];

    if (messages.length === 0) {
      return [createBotWelcomeMessage(role)];
    }

    if (parsed.role && parsed.role !== role) {
      return [createBotWelcomeMessage(role)];
    }

    return messages;
  } catch {
    return [createBotWelcomeMessage(role)];
  }
}

export function saveChatHistory(userID: string, role: RoleChatbotRole, messages: RoleChatbotMessage[]): void {
  if (typeof window === 'undefined' || !userID) return;

  try {
    const bounded = messages.slice(-MAX_MESSAGES);
    window.localStorage.setItem(
      getStorageKey(userID),
      JSON.stringify({ role, messages: bounded })
    );
  } catch {
    // Intentionally no-op for storage failures.
  }
}

export function clearChatHistory(userID: string): void {
  if (typeof window === 'undefined' || !userID) return;

  try {
    window.localStorage.removeItem(getStorageKey(userID));
  } catch {
    // Intentionally no-op for storage failures.
  }
}
