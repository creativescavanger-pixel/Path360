// src/data/founderDiagnostics.js

// This is the advanced PATH360 diagnostic, aligned with YC interview focus
// and Sequoia business-plan structure: problem, solution, why now, market,
// product, traction, business model, team, financials, and risk. [web:1370][web:1387][web:1397]

export const FOUNDATION_QUESTIONS = [
  {
    id: 'q1_problem_core',
    phase: 'problem',
    question:
      'In one or two sentences, what is your company working on, and what painful problem are you solving?',
    hint: 'Answer like a YC founder: short, concrete, impossible to misunderstand. Avoid buzzwords.',
    dimension: 'strategic_clarity',
  },
  {
    id: 'q2_customer_icp',
    phase: 'market',
    question:
      'Who is your sharpest initial customer segment (ICP), and how do you know they feel this problem strongly?',
    hint: 'Describe a specific customer profile and the situation they are in, not a broad market label.',
    dimension: 'market_understanding',
  },
  {
    id: 'q3_solution',
    phase: 'solution',
    question:
      'How does your product or service solve this problem differently or better than the current alternatives?',
    hint: 'Explain what you actually do for the customer and why switching to you makes sense right now.',
    dimension: 'product_clarity',
  },
  {
    id: 'q4_why_now',
    phase: 'timing',
    question:
      'Why is now the right time for this venture — what market, technology, or behavioural shift makes this moment different?',
    hint: 'Investors look for timing insight. Mention trends, regulation, technology, or behaviour shifts.',
    dimension: 'strategic_clarity',
  },
  {
    id: 'q5_traction',
    phase: 'traction',
    question:
      'What traction or proof do you have so far? Include specific numbers, timeframes, or experiments.',
    hint: 'Think pilots, paying customers, MRR, active users, retention, waitlists, or strong LOIs.',
    dimension: 'execution_readiness',
  },
  {
    id: 'q6_business_model',
    phase: 'business_model',
    question:
      'How does the business make money or plan to make money? Include pricing, who pays, and how often.',
    hint: 'Explain revenue model, pricing units, and any recurring aspect. Be concrete about amounts or ranges.',
    dimension: 'financial_maturity',
  },
  {
    id: 'q7_market_size',
    phase: 'market',
    question:
      'How big is the opportunity you are going after first, and how did you estimate that market size?',
    hint: 'Describe the wedge market, not just total TAM. Show your logic: number of customers × price, etc.',
    dimension: 'market_understanding',
  },
  {
    id: 'q8_competition',
    phase: 'competition',
    question:
      'Who or what are the top 2–3 alternatives your customer would realistically choose instead of you, and why do you win?',
    hint: 'Include status quo and non-obvious competitors. Avoid saying “we have no competitors”.',
    dimension: 'strategic_clarity',
  },
  {
    id: 'q9_team',
    phase: 'team',
    question:
      'Who is on the founding team, and what makes this specific team credible for this problem and market?',
    hint: 'Mention relevant experience, unfair advantages, prior startups, or deep domain insight.',
    dimension: 'team_strength',
  },
  {
    id: 'q10_risks_milestones',
    phase: 'execution',
    question:
      'Looking at the next 12–18 months, what are the 2–3 hardest risks or milestones, and how do you plan to tackle them?',
    hint: 'Be honest. Good founders name real risks (product, market, team, capital) and how they will de-risk them.',
    dimension: 'risk_awareness',
  },
]

// Dimension registry (kept for reference – Assessment uses generateAssessmentScores)
export const SCORING_DIMENSIONS = {
  founder_score: { label: 'Founder Score', icon: 'F', weight: 1.2 },
  investor_readiness: { label: 'Investor Readiness', icon: 'I', weight: 1.5 },
  strategic_clarity: { label: 'Strategic Clarity', icon: 'S', weight: 1.0 },
  execution_readiness: { label: 'Execution Readiness', icon: 'E', weight: 1.0 },
  financial_maturity: { label: 'Financial Maturity', icon: 'F', weight: 1.3 },
  market_understanding: { label: 'Market Understanding', icon: 'M', weight: 1.0 },
  team_strength: { label: 'Team Strength', icon: 'T', weight: 1.1 },
  product_clarity: { label: 'Product Clarity', icon: 'P', weight: 1.0 },
  growth_potential: { label: 'Growth Potential', icon: 'G', weight: 1.0 },
  risk_awareness: { label: 'Risk Awareness', icon: 'R', weight: 0.9 },
}

export const VENTURE_STAGES = [
  {
    id: 'idea',
    label: 'Idea Stage',
    description: 'Concept defined, early customer discovery, little or no product built.',
  },
  {
    id: 'pre_seed',
    label: 'Pre-Seed',
    description: 'MVP or prototype in progress, early pilots or design partners, little revenue.',
  },
  {
    id: 'seed',
    label: 'Seed Stage',
    description: 'Product live, early revenue or strong usage growth, iterating toward product–market fit.',
  },
  {
    id: 'series_a',
    label: 'Series A Ready',
    description: 'Repeatable revenue engine, maturing unit economics, and a clear path to scale.',
  },
]

export const RISK_CATEGORIES = [
  'Market risk',
  'Execution risk',
  'Team risk',
  'Financial risk',
  'Competitive risk',
  'Regulatory risk',
]