// src/lib/documentGuides.js

export const DOCUMENT_GUIDES = {
  pitch_deck: {
    id: 'pitch_deck',
    title: 'Pitch Deck Prep',
    studioLabel: 'Pitch Deck Narrative',
    intakeType: 'pitch_deck',
    ctaLabel: 'Start guided prep',
    intro:
      'Answer these investor-style questions first. PATH360 will use this intake, your founder profile, and your assessment to create a sharper pitch deck narrative.',
    helper:
      'Use plain language. Be specific. Add numbers, dates, milestones, customer names, pricing, and fundraising details wherever you can.',
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
      'Fundraising ask',
    ],
    sections: [
      {
        key: 'company',
        title: 'Company',
        description: 'Make the company impossible to misunderstand.',
        questions: [
          {
            key: 'one_liner',
            label: 'What does your company do in one clear sentence?',
            type: 'textarea',
            required: true,
            placeholder: 'We help ... by ...',
            maxLength: 240,
          },
          {
            key: 'example',
            label: 'Give one concrete example of how a customer uses the product.',
            type: 'textarea',
            required: true,
            maxLength: 500,
          },
          {
            key: 'purpose',
            label: 'What is the company purpose in one declarative sentence?',
            type: 'textarea',
            required: true,
            maxLength: 240,
          },
        ],
      },
      {
        key: 'problem_solution',
        title: 'Problem & Solution',
        description: 'Show the pain clearly, then the wedge.',
        questions: [
          {
            key: 'problem',
            label: 'What painful problem are you solving, and for whom?',
            type: 'textarea',
            required: true,
            maxLength: 800,
          },
          {
            key: 'current_alternative',
            label: 'How do customers solve this today, and why is that broken?',
            type: 'textarea',
            required: true,
            maxLength: 800,
          },
          {
            key: 'solution',
            label: 'What is your solution and unique value proposition?',
            type: 'textarea',
            required: true,
            maxLength: 800,
          },
        ],
      },
      {
        key: 'timing_market',
        title: 'Timing & Market',
        description: 'Explain why now and show the market.',
        questions: [
          {
            key: 'why_now',
            label: 'Why now? What trend, shift, or market change makes this timely?',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
          {
            key: 'customer',
            label: 'Who is the exact customer or first wedge market?',
            type: 'textarea',
            required: true,
            maxLength: 500,
          },
          {
            key: 'market_size',
            label: 'What is the market size? Include TAM/SAM if possible and show your math.',
            type: 'textarea',
            required: true,
            maxLength: 1000,
          },
        ],
      },
      {
        key: 'traction',
        title: 'Traction',
        description: 'Momentum matters more than abstract claims.',
        questions: [
          {
            key: 'traction_metrics',
            label: 'What traction do you already have? Include numbers and timeframes.',
            type: 'textarea',
            required: true,
            placeholder: '0 → 25 pilots in 4 months, €18k MRR, 62% WAU/MAU...',
            maxLength: 1000,
          },
          {
            key: 'insight',
            label: 'What non-obvious insight do you have that others miss?',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
          {
            key: 'milestones',
            label: 'What are the next 3 major milestones?',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
        ],
      },
      {
        key: 'business',
        title: 'Business Model',
        description: 'Show how the company makes money.',
        questions: [
          {
            key: 'business_model',
            label: 'How do you make money?',
            type: 'textarea',
            required: true,
            maxLength: 600,
          },
          {
            key: 'pricing',
            label: 'What is your pricing model or expected customer value?',
            type: 'textarea',
            required: false,
            maxLength: 600,
          },
          {
            key: 'go_to_market',
            label: 'How will you acquire customers?',
            type: 'textarea',
            required: true,
            maxLength: 800,
          },
        ],
      },
      {
        key: 'competition_team_raise',
        title: 'Competition, Team & Raise',
        description: 'Prove why you can win and what funding unlocks.',
        questions: [
          {
            key: 'competition',
            label: 'Who are the main competitors or substitutes, and why do you win?',
            type: 'textarea',
            required: true,
            maxLength: 900,
          },
          {
            key: 'team',
            label: 'Why is your team uniquely suited to solve this problem?',
            type: 'textarea',
            required: true,
            maxLength: 900,
          },
          {
            key: 'raise',
            label: 'How much are you raising, and what will that funding achieve over 18–24 months?',
            type: 'textarea',
            required: true,
            maxLength: 900,
          },
        ],
      },
    ],
  },

  business_plan: {
    id: 'business_plan',
    title: 'Business Plan Prep',
    studioLabel: 'Business Plan',
    intakeType: 'business_plan',
    ctaLabel: 'Start guided prep',
    intro:
      'This guided intake collects the strategic, commercial, and operational inputs needed for a structured business plan.',
    helper:
      'Write in plain language. Include assumptions, numbers, milestones, operating details, and risks wherever possible.',
    outputFormat: [
      'Executive summary',
      'Company overview',
      'Problem and customer',
      'Market and timing',
      'Product and solution',
      'Business model',
      'Go-to-market',
      'Competition and moat',
      'Operating plan',
      'Team',
      'Financial outlook',
      'Funding ask',
      'Risks and mitigation',
    ],
    sections: [
      {
        key: 'summary',
        title: 'Executive Logic',
        description: 'Establish the core business case.',
        questions: [
          {
            key: 'company_overview',
            label: 'What does the company do, for whom, and why does it matter?',
            type: 'textarea',
            required: true,
            maxLength: 900,
          },
          {
            key: 'core_problem',
            label: 'What core problem are you solving?',
            type: 'textarea',
            required: true,
            maxLength: 800,
          },
          {
            key: 'vision',
            label: 'What is the long-term vision for the company?',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
        ],
      },
      {
        key: 'market',
        title: 'Customer & Market',
        description: 'Define customer, need, and opportunity size.',
        questions: [
          {
            key: 'target_customer',
            label: 'Who is the primary customer segment?',
            type: 'textarea',
            required: true,
            maxLength: 600,
          },
          {
            key: 'market_need',
            label: 'Why does this customer need the solution now?',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
          {
            key: 'market_analysis',
            label:
              'Describe the market opportunity, including TAM/SAM/SOM or your market sizing logic and key assumptions.',
            type: 'textarea',
            required: true,
            maxLength: 1000,
          },
        ],
      },
      {
        key: 'product',
        title: 'Product & Offer',
        description: 'Clarify the product, value, and delivery model.',
        questions: [
          {
            key: 'product_description',
            label: 'What is the product or service?',
            type: 'textarea',
            required: true,
            maxLength: 800,
          },
          {
            key: 'value_proposition',
            label: 'What is the core value proposition?',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
          {
            key: 'roadmap',
            label: 'What is on the near-term product roadmap?',
            type: 'textarea',
            required: false,
            maxLength: 800,
          },
        ],
      },
      {
        key: 'commercial',
        title: 'Commercial Model',
        description: 'Revenue, pricing, acquisition, and distribution.',
        questions: [
          {
            key: 'revenue_model',
            label: 'How does the company make money?',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
          {
            key: 'pricing_model',
            label: 'What is the pricing model?',
            type: 'textarea',
            required: false,
            maxLength: 600,
          },
          {
            key: 'gtm',
            label: 'What is the go-to-market strategy?',
            type: 'textarea',
            required: true,
            maxLength: 900,
          },
        ],
      },
      {
        key: 'operations',
        title: 'Operations & Team',
        description: 'How the business gets built and delivered.',
        questions: [
          {
            key: 'operations_plan',
            label: 'How will the company operate day to day?',
            type: 'textarea',
            required: true,
            maxLength: 900,
          },
          {
            key: 'team_structure',
            label: 'Who is on the team today, and what key hires are needed next?',
            type: 'textarea',
            required: true,
            maxLength: 900,
          },
          {
            key: 'milestones_plan',
            label: 'What are the major operating milestones for the next 12–24 months?',
            type: 'textarea',
            required: true,
            maxLength: 900,
          },
        ],
      },
      {
        key: 'finance_risk',
        title: 'Financials & Risk',
        description: 'Build credibility with assumptions and downside awareness.',
        questions: [
          {
            key: 'financial_projection',
            label: 'What are the top financial assumptions, revenue expectations, and cost drivers?',
            type: 'textarea',
            required: true,
            maxLength: 1000,
          },
          {
            key: 'funding_need',
            label: 'Do you need funding? If yes, how much and what will it be used for?',
            type: 'textarea',
            required: false,
            maxLength: 800,
          },
          {
            key: 'risks',
            label: 'What are the biggest risks, and how will you mitigate them?',
            type: 'textarea',
            required: true,
            maxLength: 1000,
          },
        ],
      },
    ],
  },

  investor_memo: {
    id: 'investor_memo',
    title: 'Investor One-Pager Prep',
    studioLabel: 'Investor One-Pager',
    intakeType: 'investor_memo',
    ctaLabel: 'Start guided prep',
    intro:
      'Prepare a concise investor-facing one-pager with the facts, framing, and ask an investor expects to scan quickly.',
    helper:
      'Keep answers brief but sharp. Lead with facts, traction, and a clear reason to care.',
    outputFormat: [
      'Company snapshot',
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
    sections: [
      {
        key: 'snapshot',
        title: 'Snapshot',
        description: 'The top of the one-pager.',
        questions: [
          {
            key: 'company_one_liner',
            label: 'What does the company do in one sentence?',
            type: 'textarea',
            required: true,
            maxLength: 220,
          },
          {
            key: 'customer',
            label: 'Who is the customer?',
            type: 'textarea',
            required: true,
            maxLength: 300,
          },
          {
            key: 'why_care',
            label: 'Why should an investor care right now?',
            type: 'textarea',
            required: true,
            maxLength: 400,
          },
        ],
      },
      {
        key: 'substance',
        title: 'Substance',
        description: 'Give the real investment case.',
        questions: [
          {
            key: 'problem_solution',
            label: 'Describe the problem and your solution.',
            type: 'textarea',
            required: true,
            maxLength: 900,
          },
          {
            key: 'traction',
            label: 'What traction do you have? Include numbers and timeframes.',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
          {
            key: 'business_model',
            label: 'How do you make money?',
            type: 'textarea',
            required: true,
            maxLength: 500,
          },
        ],
      },
      {
        key: 'investability',
        title: 'Investability',
        description: 'Answer the “why this, why now, why you” test.',
        questions: [
          {
            key: 'market',
            label: 'What is the market opportunity?',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
          {
            key: 'moat',
            label: 'What is your defensibility or unfair advantage?',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
          {
            key: 'team_raise',
            label: 'Why is this team credible, and what are you raising?',
            type: 'textarea',
            required: true,
            maxLength: 900,
          },
        ],
      },
    ],
  },

  elevator_pitch: {
    id: 'elevator_pitch',
    title: 'Elevator Pitch Prep',
    studioLabel: 'Elevator Pitch',
    intakeType: 'elevator_pitch',
    ctaLabel: 'Start guided prep',
    intro:
      'Creates crisp spoken versions of the company story for meetings, intros, and investor events.',
    helper:
      'Write conversationally. Avoid jargon. Make it understandable in one hearing.',
    outputFormat: [
      '30-second version',
      '60-second version',
      '90-second meeting opener',
    ],
    sections: [
      {
        key: 'core',
        title: 'Core Message',
        description: 'The company in spoken form.',
        questions: [
          {
            key: 'what_do_you_do',
            label: 'What does your company do?',
            type: 'textarea',
            required: true,
            maxLength: 300,
          },
          {
            key: 'who_for',
            label: 'Who is it for?',
            type: 'textarea',
            required: true,
            maxLength: 220,
          },
          {
            key: 'why_important',
            label: 'Why is this a painful and important problem?',
            type: 'textarea',
            required: true,
            maxLength: 500,
          },
        ],
      },
      {
        key: 'proof',
        title: 'Proof',
        description: 'Add credibility, not fluff.',
        questions: [
          {
            key: 'traction',
            label: 'What proof or traction do you have so far?',
            type: 'textarea',
            required: false,
            maxLength: 500,
          },
          {
            key: 'insight',
            label: 'What insight makes your approach better or different?',
            type: 'textarea',
            required: true,
            maxLength: 500,
          },
          {
            key: 'team',
            label: 'Why are you or your team the right people to build this?',
            type: 'textarea',
            required: false,
            maxLength: 500,
          },
        ],
      },
    ],
  },

  mock_interview: {
    id: 'mock_interview',
    title: 'Mock Investor Interview Prep',
    studioLabel: 'Mock Investor Interview',
    intakeType: 'investor_interview',
    ctaLabel: 'Start guided prep',
    intro:
      'Prepare for likely investor questions, stronger answers, weak-spot analysis, and follow-up challenge questions.',
    helper:
      'The more honest and specific your answers are, the better the simulated investor questions will be.',
    outputFormat: [
      'Likely investor questions',
      'Suggested strong answers',
      'Weak spots and red flags',
      'Tough follow-ups',
      'Recommended prep areas',
    ],
    sections: [
      {
        key: 'company_basics',
        title: 'Company Basics',
        description: 'Anchor the interview on clarity.',
        questions: [
          {
            key: 'company_description',
            label: 'Describe the company in 1–2 sentences.',
            type: 'textarea',
            required: true,
            maxLength: 400,
          },
          {
            key: 'problem_solution',
            label: 'What problem do you solve and how?',
            type: 'textarea',
            required: true,
            maxLength: 800,
          },
          {
            key: 'customer_market',
            label: 'Who is the customer and what market are you in?',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
        ],
      },
      {
        key: 'investor_readiness',
        title: 'Investor Readiness',
        description: 'Pressure-test the company as an investment.',
        questions: [
          {
            key: 'traction',
            label: 'What traction do you have so far?',
            type: 'textarea',
            required: true,
            maxLength: 800,
          },
          {
            key: 'business_model',
            label: 'How do you make money, or plan to make money?',
            type: 'textarea',
            required: true,
            maxLength: 700,
          },
          {
            key: 'competition',
            label: 'Who are the competitors and why do you win?',
            type: 'textarea',
            required: true,
            maxLength: 800,
          },
        ],
      },
      {
        key: 'team_risk_raise',
        title: 'Team, Risk & Raise',
        description: 'Get ready for credibility and risk questions.',
        questions: [
          {
            key: 'team',
            label: 'Why is your team suited to win?',
            type: 'textarea',
            required: true,
            maxLength: 800,
          },
          {
            key: 'risks',
            label: 'What are the biggest risks in the company right now?',
            type: 'textarea',
            required: true,
            maxLength: 800,
          },
          {
            key: 'fundraising',
            label: 'If you are raising, how much and what will it achieve?',
            type: 'textarea',
            required: false,
            maxLength: 700,
          },
        ],
      },
    ],
  },
}

export function getDocumentGuide(docType) {
  return DOCUMENT_GUIDES[docType] || null
}

export function isGuidedDocType(docType) {
  return !!DOCUMENT_GUIDES[docType]
}

export function getAllGuidedDocTypes() {
  return Object.keys(DOCUMENT_GUIDES)
}