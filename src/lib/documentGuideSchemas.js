import { getDocTypeConfig } from '../config/documentTypes.js'

export const DOCUMENT_GUIDE_SCHEMAS = {
  business_plan: {
    id: 'business_plan',
    title: 'Business Plan',
    allowedExports: ['pdf', 'docx'],
    sections: [
      {
        id: 'overview',
        title: 'Business overview',
        description: 'Core company identity and what the business does.',
        questions: [
          { id: 'companyName', label: 'Company name', type: 'text', required: true },
          { id: 'oneLiner', label: 'One-line description', type: 'textarea', required: true },
          { id: 'location', label: 'Primary location', type: 'text' },
          { id: 'foundedYear', label: 'Founded year', type: 'text' },
        ],
      },
      {
        id: 'problem',
        title: 'Problem',
        description: 'What painful problem exists and for whom.',
        questions: [
          { id: 'customerSegment', label: 'Who is the customer?', type: 'textarea', required: true },
          { id: 'customerProblem', label: 'What problem are you solving?', type: 'textarea', required: true },
          { id: 'urgency', label: 'Why is this urgent now?', type: 'textarea' },
        ],
      },
      {
        id: 'solution',
        title: 'Solution',
        description: 'How your product or service solves the problem.',
        questions: [
          { id: 'solutionSummary', label: 'Describe your solution', type: 'textarea', required: true },
          { id: 'differentiation', label: 'What makes it different?', type: 'textarea' },
        ],
      },
      {
        id: 'market',
        title: 'Market',
        description: 'Market demand, target customer, and opportunity.',
        questions: [
          { id: 'marketNeed', label: 'Why does the market need this?', type: 'textarea' },
          { id: 'targetBuyer', label: 'Who buys it?', type: 'textarea' },
          { id: 'marketOpportunity', label: 'How big is the opportunity?', type: 'textarea' },
        ],
      },
      {
        id: 'business_model',
        title: 'Business model',
        description: 'How the business creates and captures value.',
        questions: [
          { id: 'revenueModel', label: 'How do you make money?', type: 'textarea', required: true },
          { id: 'pricingModel', label: 'How do you price?', type: 'textarea' },
          { id: 'deliveryModel', label: 'How do you deliver the solution?', type: 'textarea' },
        ],
      },
      {
        id: 'traction',
        title: 'Traction',
        description: 'Evidence, progress, customers, or milestones.',
        questions: [
          { id: 'tractionSignals', label: 'What evidence of traction do you have?', type: 'textarea' },
          { id: 'currentStage', label: 'What stage are you at now?', type: 'textarea' },
        ],
      },
      {
        id: 'team',
        title: 'Team',
        description: 'Who is building this and why they can win.',
        questions: [
          { id: 'founderSummary', label: 'Founding team summary', type: 'textarea', required: true },
          { id: 'teamStrength', label: 'Why is this team suited to solve this?', type: 'textarea' },
        ],
      },
    ],
  },

  pitch_deck: {
    id: 'pitch_deck',
    title: 'Pitch Deck',
    allowedExports: ['pdf', 'docx', 'pptx'],
    sections: [
      {
        id: 'vision',
        title: 'Vision',
        description: 'Your company and the high-level story.',
        questions: [
          { id: 'companyName', label: 'Company name', type: 'text', required: true },
          { id: 'vision', label: 'Vision statement', type: 'textarea', required: true },
          { id: 'oneLiner', label: 'What do you do in one line?', type: 'textarea', required: true },
        ],
      },
      {
        id: 'problem',
        title: 'Problem',
        description: 'What problem matters enough to solve.',
        questions: [
          { id: 'problem', label: 'Customer problem', type: 'textarea', required: true },
          { id: 'whoFeelsIt', label: 'Who feels this problem most?', type: 'textarea' },
        ],
      },
      {
        id: 'solution',
        title: 'Solution',
        description: 'How your company addresses the problem.',
        questions: [
          { id: 'solution', label: 'Your solution', type: 'textarea', required: true },
          { id: 'whyNow', label: 'Why now?', type: 'textarea' },
        ],
      },
      {
        id: 'market',
        title: 'Market',
        description: 'Who you serve and how large the opportunity is.',
        questions: [
          { id: 'customer', label: 'Primary customer', type: 'textarea' },
          { id: 'marketSize', label: 'Market size or opportunity', type: 'textarea' },
        ],
      },
      {
        id: 'model',
        title: 'Business model',
        description: 'How you make money.',
        questions: [
          { id: 'businessModel', label: 'Business model', type: 'textarea', required: true },
          { id: 'pricing', label: 'Pricing approach', type: 'textarea' },
        ],
      },
      {
        id: 'traction',
        title: 'Traction',
        description: 'Signals that prove movement.',
        questions: [
          { id: 'traction', label: 'Traction or milestones', type: 'textarea' },
          { id: 'proof', label: 'What proves customer demand?', type: 'textarea' },
        ],
      },
      {
        id: 'ask',
        title: 'Ask',
        description: 'What you want from investors.',
        questions: [
          { id: 'fundraisingAsk', label: 'Raise amount or ask', type: 'textarea' },
          { id: 'useOfFunds', label: 'Use of funds', type: 'textarea' },
        ],
      },
    ],
  },

  investor_memo: {
    id: 'investor_memo',
    title: 'Investor One-Pager',
    allowedExports: ['pdf', 'docx'],
    sections: [
      {
        id: 'summary',
        title: 'Summary',
        description: 'The business in brief.',
        questions: [
          { id: 'companyName', label: 'Company name', type: 'text', required: true },
          { id: 'summary', label: 'Business summary', type: 'textarea', required: true },
        ],
      },
      {
        id: 'problem_solution',
        title: 'Problem and solution',
        description: 'Why the problem matters and what you do about it.',
        questions: [
          { id: 'problem', label: 'Problem', type: 'textarea', required: true },
          { id: 'solution', label: 'Solution', type: 'textarea', required: true },
        ],
      },
      {
        id: 'market_model',
        title: 'Market and model',
        description: 'Opportunity and revenue logic.',
        questions: [
          { id: 'market', label: 'Market', type: 'textarea' },
          { id: 'model', label: 'Revenue model', type: 'textarea' },
        ],
      },
      {
        id: 'traction_ask',
        title: 'Traction and ask',
        description: 'Why now and what support you want.',
        questions: [
          { id: 'traction', label: 'Traction', type: 'textarea' },
          { id: 'ask', label: 'Investment ask', type: 'textarea' },
        ],
      },
    ],
  },
}

export function getDocumentGuideSchema(docType) {
  return DOCUMENT_GUIDE_SCHEMAS[docType] || null
}

export function getAllowedExportFormats(docType) {
  return DOCUMENT_GUIDE_SCHEMAS[docType]?.allowedExports || ['pdf', 'docx']
}