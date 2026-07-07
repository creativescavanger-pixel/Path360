const COMMON_FOUNDATION = [
  {
    id: 'companyPurpose',
    label: 'What does your company do in one clear sentence?',
    type: 'textarea',
    placeholder: 'We help [customer] achieve [outcome] by [how].',
    required: true,
    section: 'Foundation',
    help: 'This should read like a crisp investor-ready company purpose statement.',
  },
  {
    id: 'problem',
    label: 'What painful problem are you solving?',
    type: 'textarea',
    placeholder: 'Describe the customer pain, current workaround, and why current options are weak.',
    required: true,
    section: 'Foundation',
  },
  {
    id: 'customer',
    label: 'Who exactly is the customer?',
    type: 'textarea',
    placeholder: 'Be specific: buyer, user, segment, geography, company size, industry, etc.',
    required: true,
    section: 'Foundation',
  },
  {
    id: 'solution',
    label: 'What is your solution and why is it better?',
    type: 'textarea',
    placeholder: 'Explain the product, wedge, experience, or advantage.',
    required: true,
    section: 'Foundation',
  },
  {
    id: 'whyNow',
    label: 'Why now?',
    type: 'textarea',
    placeholder: 'What changed in the market, technology, regulation, or behavior that makes this possible now?',
    required: true,
    section: 'Foundation',
  },
  {
    id: 'marketSize',
    label: 'How large is the market?',
    type: 'textarea',
    placeholder: 'Include TAM / SAM / wedge market if possible.',
    required: true,
    section: 'Market',
  },
  {
    id: 'traction',
    label: 'What traction or proof do you already have?',
    type: 'textarea',
    placeholder: 'Revenue, pilots, users, LOIs, retention, partnerships, growth, testimonials.',
    required: false,
    section: 'Evidence',
  },
  {
    id: 'businessModel',
    label: 'How do you make money?',
    type: 'textarea',
    placeholder: 'Pricing, revenue model, average contract value, margins, recurring vs one-time.',
    required: true,
    section: 'Business Model',
  },
  {
    id: 'competition',
    label: 'Who are the main competitors or alternatives?',
    type: 'textarea',
    placeholder: 'Direct, indirect, substitutes, and why you win.',
    required: false,
    section: 'Competition',
  },
  {
    id: 'moat',
    label: 'What is your edge or defensibility?',
    type: 'textarea',
    placeholder: 'Unique insight, data, speed, network effects, execution, brand, distribution, IP, or timing.',
    required: false,
    section: 'Competition',
  },
  {
    id: 'team',
    label: 'Why is your team uniquely positioned to win?',
    type: 'textarea',
    placeholder: 'Founder-market fit, key experience, achievements, or unusual advantages.',
    required: true,
    section: 'Team',
  },
  {
    id: 'risks',
    label: 'What are the biggest risks or open questions?',
    type: 'textarea',
    placeholder: 'Market, product, regulatory, fundraising, hiring, sales cycle, adoption, etc.',
    required: false,
    section: 'Risk',
  },
]

const FUNDRAISING = [
  {
    id: 'raiseAmount',
    label: 'How much are you raising?',
    type: 'text',
    placeholder: 'Example: €750k pre-seed',
    required: false,
    section: 'Fundraise',
  },
  {
    id: 'useOfFunds',
    label: 'What will the funding unlock?',
    type: 'textarea',
    placeholder: 'Team hires, runway, product milestones, revenue targets, expansion, compliance, etc.',
    required: false,
    section: 'Fundraise',
  },
]

const BUSINESS_PLAN_EXT = [
  {
    id: 'goToMarket',
    label: 'What is your go-to-market strategy?',
    type: 'textarea',
    placeholder: 'Channels, sales motion, partnerships, demand generation, pilot strategy, rollout.',
    required: true,
    section: 'Execution',
  },
  {
    id: 'operations',
    label: 'How will the business operate day to day?',
    type: 'textarea',
    placeholder: 'Delivery model, key workflows, supply chain, team structure, ops dependencies.',
    required: false,
    section: 'Execution',
  },
  {
    id: 'milestones',
    label: 'What milestones do you expect to hit in the next 12–24 months?',
    type: 'textarea',
    placeholder: 'Product, revenue, team, customer, regulatory, or market milestones.',
    required: true,
    section: 'Execution',
  },
  {
    id: 'financialOutlook',
    label: 'What is the financial outlook?',
    type: 'textarea',
    placeholder: 'Revenue expectations, burn, runway, gross margin, breakeven path, assumptions.',
    required: true,
    section: 'Financials',
  },
]

const PITCH_DECK_EXT = [
  {
    id: 'productWalkthrough',
    label: 'How does the product work in practice?',
    type: 'textarea',
    placeholder: 'Describe the flow, core features, or user journey.',
    required: false,
    section: 'Product',
  },
  {
    id: 'keyMetrics',
    label: 'Which 3–5 metrics matter most right now?',
    type: 'textarea',
    placeholder: 'MRR, retention, CAC, LTV, pilots, active users, pipeline, churn, etc.',
    required: false,
    section: 'Evidence',
  },
]

const ONE_PAGER_EXT = [
  {
    id: 'snapshot',
    label: 'What should an investor understand in 30 seconds?',
    type: 'textarea',
    placeholder: 'The crisp headline takeaway.',
    required: true,
    section: 'Summary',
  },
]

const ELEVATOR_PITCH_EXT = [
  {
    id: 'audienceType',
    label: 'Who is the audience?',
    type: 'select',
    options: ['Investor', 'Customer', 'Partner', 'Mentor', 'General'],
    required: true,
    section: 'Audience',
  },
  {
    id: 'tone',
    label: 'What tone should the pitch have?',
    type: 'select',
    options: ['Confident', 'Warm', 'Direct', 'Visionary', 'Analytical'],
    required: true,
    section: 'Audience',
  },
]

const INVESTOR_MEMO_EXT = [
  {
    id: 'investmentCase',
    label: 'Why is this venture investable now?',
    type: 'textarea',
    placeholder: 'Summarize the key argument for conviction.',
    required: true,
    section: 'Memo',
  },
  {
    id: 'openQuestions',
    label: 'What questions would a serious investor still need answered?',
    type: 'textarea',
    placeholder: 'Due diligence gaps, assumptions, unknowns, risks.',
    required: false,
    section: 'Memo',
  },
]

const MOCK_INVESTOR_EXT = [
  {
    id: 'interviewGoal',
    label: 'What kind of investor conversation do you want to prepare for?',
    type: 'select',
    options: ['First meeting', 'Partner meeting', 'Demo day', 'Follow-up diligence', 'General fundraising prep'],
    required: true,
    section: 'Interview',
  },
  {
    id: 'weakAreas',
    label: 'Which areas do you feel least confident about?',
    type: 'textarea',
    placeholder: 'Market sizing, pricing, competition, moat, traction, team, numbers, etc.',
    required: false,
    section: 'Interview',
  },
]

export const DOCUMENT_GUIDES = {
  business_plan: {
    title: 'Business Plan',
    intro:
      'This guided workflow helps you prepare a structured business plan using step-by-step investor and strategy questions.',
    outputFormat: [
      'Executive summary',
      'Company overview',
      'Problem and customer',
      'Market and timing',
      'Product and solution',
      'Business model',
      'Go-to-market',
      'Competition and moat',
      'Operating plan and milestones',
      'Team',
      'Financial outlook',
      'Funding ask and use of funds',
      'Risks and mitigation',
    ],
    fields: [...COMMON_FOUNDATION, ...BUSINESS_PLAN_EXT, ...FUNDRAISING],
  },

  pitch_deck: {
    title: 'Pitch Deck',
    intro:
      'This guided workflow helps you prepare a clear investor deck narrative by collecting the essential fundraising answers first.',
    outputFormat: [
      'Company purpose',
      'Problem',
      'Solution',
      'Why now',
      'Market',
      'Product',
      'Traction',
      'Business model',
      'Competition and moat',
      'Team',
      'Financial snapshot',
      'Ask',
    ],
    fields: [...COMMON_FOUNDATION, ...PITCH_DECK_EXT, ...FUNDRAISING],
  },

  investor_onepager: {
    title: 'Investor One-Pager',
    intro:
      'This guided workflow helps you prepare a concise one-page investor summary with the strongest company, market, traction, and raise signals.',
    outputFormat: [
      'One-line company description',
      'Problem',
      'Solution',
      'Customer and market',
      'Traction',
      'Business model',
      'Why now',
      'Moat',
      'Team',
      'Raise and use of funds',
    ],
    fields: [...COMMON_FOUNDATION, ...ONE_PAGER_EXT, ...FUNDRAISING],
  },

  elevator_pitch: {
    title: 'Elevator Pitch',
    intro:
      'This guided workflow helps you build short spoken versions of your pitch for different audiences and settings.',
    outputFormat: ['30-second pitch', '60-second pitch', '90-second opener'],
    fields: [...COMMON_FOUNDATION, ...ELEVATOR_PITCH_EXT],
  },

  investor_memo: {
    title: 'Investor Memo',
    intro:
      'This guided workflow helps you prepare an investor-style memo with the case for conviction, supporting evidence, and open diligence questions.',
    outputFormat: [
      'Company snapshot',
      'Investment thesis',
      'Problem and opportunity',
      'Product and differentiation',
      'Market and timing',
      'Traction and evidence',
      'Business model',
      'Team',
      'Risks',
      'Open diligence questions',
      'Recommendation',
    ],
    fields: [...COMMON_FOUNDATION, ...INVESTOR_MEMO_EXT, ...FUNDRAISING],
  },

  mock_investor_interview: {
    title: 'Mock Investor Interview',
    intro:
      'This guided workflow helps you prepare for investor conversations with structured questions, stronger answers, and likely pushback.',
    outputFormat: [
      'Investor-style question set',
      'Strong answer framing',
      'Likely pushback',
      'Weak spots to improve',
      'Follow-up questions',
    ],
    fields: [...COMMON_FOUNDATION, ...MOCK_INVESTOR_EXT, ...FUNDRAISING],
  },
}

export function getDocumentGuide(docType) {
  return DOCUMENT_GUIDES[docType] || null
}

export function groupFieldsBySection(fields = []) {
  return fields.reduce((acc, field) => {
    const key = field.section || 'General'
    if (!acc[key]) acc[key] = []
    acc[key].push(field)
    return acc
  }, {})
}
