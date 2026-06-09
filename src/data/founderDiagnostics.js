export const FOUNDATION_QUESTIONS = [
  {
    id: 'q1',
    phase: 'problem',
    question: "Let's start at the foundation. What problem are you solving, and who experiences it?",
    hint: "Be specific about the person with the problem, not just the market.",
    dimension: 'strategic_clarity',
  },
  {
    id: 'q2',
    phase: 'solution',
    question: "How does your solution solve this problem differently from what already exists?",
    hint: "The most dangerous competitor is 'doing nothing'.",
    dimension: 'strategic_clarity',
  },
  {
    id: 'q3',
    phase: 'traction',
    question: "Where is your venture today — idea, prototype, paying customers, or revenue?",
    hint: "Real numbers only. VCs have heard every estimate.",
    dimension: 'execution_readiness',
  },
  {
    id: 'q4',
    phase: 'business_model',
    question: "How do you make money, or how do you plan to? What does a customer pay, how often, and why?",
    hint: "Recurring revenue is valued 3–5× higher than one-time revenue.",
    dimension: 'financial_maturity',
  },
  {
    id: 'q5',
    phase: 'market',
    question: "Who is your ideal first customer — not your total addressable market, but the specific profile?",
    hint: "The tighter the ICP, the faster the growth.",
    dimension: 'strategic_clarity',
  },
  {
    id: 'q6',
    phase: 'team',
    question: "Who is on your team, and what makes this specific group of people the right ones to build your venture?",
    hint: "Investors invest in the team first, the idea second.",
    dimension: 'execution_readiness',
  },
  {
    id: 'q7',
    phase: 'fundraising',
    question: "Are you raising capital? If so, how much, at what valuation, and what milestones will it fund?",
    hint: "Milestones should get you to the next funding event or profitability.",
    dimension: 'investor_readiness',
  },
  {
    id: 'q8',
    phase: 'competition',
    question: "Who are your top 3 competitors, and why will customers choose you over them?",
    hint: "Saying 'we have no competitors' is a red flag to every investor.",
    dimension: 'strategic_clarity',
  },
]

export const SCORING_DIMENSIONS = {
  founder_score:        { label: 'Founder Score',       icon: 'I', weight: 1.2 },
  investor_readiness:   { label: 'Investor Readiness',  icon: 'I', weight: 1.5 },
  strategic_clarity:    { label: 'Strategic Clarity',   icon: 'I', weight: 1.0 },
  execution_readiness:  { label: 'Execution Readiness', icon: 'I', weight: 1.0 },
  financial_maturity:   { label: 'Financial Maturity',  icon: 'I', weight: 1.3 },
  market_understanding: { label: 'Market Understanding', icon: 'I', weight: 1.0 },
  team_strength:        { label: 'Team Strength',       icon: 'I', weight: 1.1 },
  product_clarity:      { label: 'Product Clarity',     icon: 'I', weight: 1.0 },
  growth_potential:     { label: 'Growth Potential',    icon: 'I', weight: 1.0 },
  risk_awareness:       { label: 'Risk Awareness',      icon: 'I', weight: 0.9 },
}

export const VENTURE_STAGES = [
  { id: 'idea',     label: 'Idea Stage',     description: 'Concept validated with limited real-world evidence and early product thinking.' },
  { id: 'pre_seed', label: 'Pre-Seed',       description: 'Early prototype or MVP, first users or revenue, still proving product-market fit.' },
  { id: 'seed',     label: 'Seed Stage',     description: 'Product in market, early revenue or strong user traction, refining business model.' },
  { id: 'series_a', label: 'Series A Ready', description: 'Proven model, scaling with predictable unit economics and repeatable growth.' },
]

export const RISK_CATEGORIES = [
  'Market risk', 'Execution risk', 'Team risk',
  'Financial risk', 'Competitive risk', 'Regulatory risk',
]
