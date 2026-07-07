export const FOUNDER_STAGES = {
  IDEA: 'idea',
  VALIDATION: 'validation',
  MVP: 'mvp',
  EARLY_TRACTION: 'early_traction',
  GROWTH_READINESS: 'growth_readiness',
}

export const FOUNDER_STAGE_LABELS = {
  [FOUNDER_STAGES.IDEA]: 'Idea / Concept',
  [FOUNDER_STAGES.VALIDATION]: 'Discovery / Validation',
  [FOUNDER_STAGES.MVP]: 'MVP In Progress',
  [FOUNDER_STAGES.EARLY_TRACTION]: 'Early Traction',
  [FOUNDER_STAGES.GROWTH_READINESS]: 'Growth Readiness',
}

export const STAGE_ORDER = [
  FOUNDER_STAGES.IDEA,
  FOUNDER_STAGES.VALIDATION,
  FOUNDER_STAGES.MVP,
  FOUNDER_STAGES.EARLY_TRACTION,
  FOUNDER_STAGES.GROWTH_READINESS,
]

export const STAGE_DIAGNOSIS_QUESTIONS = [
  {
    id: 'problem_clarity',
    label: 'How clear is the problem you are solving?',
    type: 'single',
    options: [
      { value: 'unclear', label: 'Still exploring it' },
      { value: 'somewhat_clear', label: 'Somewhat clear' },
      { value: 'very_clear', label: 'Very clear and specific' },
    ],
  },
  {
    id: 'customer_definition',
    label: 'How clearly have you defined your target customer?',
    type: 'single',
    options: [
      { value: 'not_defined', label: 'Not yet defined' },
      { value: 'broad', label: 'Broad idea only' },
      { value: 'specific', label: 'Specific persona / customer type' },
    ],
  },
  {
    id: 'customer_interviews',
    label: 'How many customer conversations have you done?',
    type: 'single',
    options: [
      { value: '0', label: 'None yet' },
      { value: '1_5', label: '1–5' },
      { value: '6_15', label: '6–15' },
      { value: '16_plus', label: '16+' },
    ],
  },
  {
    id: 'solution_state',
    label: 'What do you currently have?',
    type: 'single',
    options: [
      { value: 'idea_only', label: 'Just an idea / concept' },
      { value: 'prototype', label: 'Prototype / mockup / concept note' },
      { value: 'mvp_live', label: 'MVP is live or usable' },
      { value: 'product_live', label: 'Live product with recurring usage' },
    ],
  },
  {
    id: 'users_or_customers',
    label: 'Do you already have users, pilots, or paying customers?',
    type: 'single',
    options: [
      { value: 'none', label: 'None yet' },
      { value: 'pilots', label: 'Pilots / waitlist / early testers' },
      { value: 'early_users', label: 'Active early users or early revenue' },
      { value: 'repeat_usage', label: 'Repeat usage / retention / recurring revenue' },
    ],
  },
  {
    id: 'revenue_state',
    label: 'What best describes your revenue stage?',
    type: 'single',
    options: [
      { value: 'none', label: 'No revenue yet' },
      { value: 'testing', label: 'Testing willingness to pay' },
      { value: 'some_revenue', label: 'Some revenue exists' },
      { value: 'repeat_revenue', label: 'Recurring or repeat revenue' },
    ],
  },
  {
    id: 'business_model_clarity',
    label: 'How clear is your business model?',
    type: 'single',
    options: [
      { value: 'unclear', label: 'Still unclear' },
      { value: 'early_hypothesis', label: 'I have an early hypothesis' },
      { value: 'defined', label: 'Defined but still validating' },
      { value: 'working', label: 'Working in practice' },
    ],
  },
  {
    id: 'fundraising_timing',
    label: 'What are you aiming for next?',
    type: 'single',
    options: [
      { value: 'clarity', label: 'Clarity and validation' },
      { value: 'build_mvp', label: 'Build / refine MVP' },
      { value: 'get_traction', label: 'Get traction and prove demand' },
      { value: 'prepare_raise', label: 'Prepare to raise capital soon' },
    ],
  },
]

function toIntRangeKey(value) {
  switch (value) {
    case '0':
      return 0
    case '1_5':
      return 3
    case '6_15':
      return 10
    case '16_plus':
      return 16
    default:
      return 0
  }
}

export function diagnoseFounderStage(answers = {}) {
  const interviews = toIntRangeKey(answers.customer_interviews)
  const hasProblemClarity = answers.problem_clarity === 'very_clear'
  const hasCustomerSpecificity = answers.customer_definition === 'specific'
  const solutionState = answers.solution_state
  const userState = answers.users_or_customers
  const revenueState = answers.revenue_state
  const modelState = answers.business_model_clarity

  let score = 0

  if (hasProblemClarity) score += 10
  if (answers.problem_clarity === 'somewhat_clear') score += 5

  if (hasCustomerSpecificity) score += 10
  if (answers.customer_definition === 'broad') score += 5

  if (interviews >= 1) score += 8
  if (interviews >= 6) score += 10
  if (interviews >= 16) score += 8

  if (solutionState === 'prototype') score += 10
  if (solutionState === 'mvp_live') score += 20
  if (solutionState === 'product_live') score += 25

  if (userState === 'pilots') score += 8
  if (userState === 'early_users') score += 16
  if (userState === 'repeat_usage') score += 24

  if (revenueState === 'testing') score += 5
  if (revenueState === 'some_revenue') score += 12
  if (revenueState === 'repeat_revenue') score += 20

  if (modelState === 'early_hypothesis') score += 5
  if (modelState === 'defined') score += 10
  if (modelState === 'working') score += 15

  let stage = FOUNDER_STAGES.IDEA

  if (
    (solutionState === 'idea_only' || solutionState === 'prototype') &&
    interviews < 6 &&
    userState === 'none' &&
    revenueState === 'none'
  ) {
    stage = FOUNDER_STAGES.IDEA
  } else if (
    interviews >= 6 &&
    (solutionState === 'idea_only' || solutionState === 'prototype') &&
    userState === 'none'
  ) {
    stage = FOUNDER_STAGES.VALIDATION
  } else if (
    solutionState === 'mvp_live' &&
    (userState === 'none' || userState === 'pilots' || userState === 'early_users')
  ) {
    stage = FOUNDER_STAGES.MVP
  } else if (
    (solutionState === 'mvp_live' || solutionState === 'product_live') &&
    (userState === 'early_users' || userState === 'repeat_usage' || revenueState === 'some_revenue')
  ) {
    stage = FOUNDER_STAGES.EARLY_TRACTION
  }

  if (
    solutionState === 'product_live' &&
    (userState === 'repeat_usage' || revenueState === 'repeat_revenue') &&
    modelState === 'working'
  ) {
    stage = FOUNDER_STAGES.GROWTH_READINESS
  }

  const confidence = Math.max(55, Math.min(95, 55 + Math.round(score / 3)))

  return {
    stage,
    label: FOUNDER_STAGE_LABELS[stage],
    confidence,
    score,
    summary: buildStageSummary(stage, answers),
    nextSteps: getStageNextSteps(stage),
    suitableOutputs: getStageSuitableOutputs(stage),
  }
}

export function buildStageSummary(stage, answers = {}) {
  switch (stage) {
    case FOUNDER_STAGES.IDEA:
      return 'You are at the idea stage. Your strongest need now is to sharpen the problem, define the customer, and turn assumptions into testable hypotheses.'
    case FOUNDER_STAGES.VALIDATION:
      return 'You are in discovery and validation. You likely have a stronger problem view now, and the next job is to confirm customer pain and shape a sharp MVP.'
    case FOUNDER_STAGES.MVP:
      return 'You are at MVP stage. Something tangible exists, and the focus now is learning from real usage, improving the product, and proving early demand.'
    case FOUNDER_STAGES.EARLY_TRACTION:
      return 'You are in early traction. You have early market proof, and the next challenge is refining positioning, strengthening repeatability, and becoming more investor-ready.'
    case FOUNDER_STAGES.GROWTH_READINESS:
      return 'You are moving into growth readiness. The focus now is sharpening the growth story, financial logic, and fundraising readiness.'
    default:
      return 'You are still clarifying where the venture stands today.'
  }
}

export function getStageNextSteps(stage) {
  switch (stage) {
    case FOUNDER_STAGES.IDEA:
      return [
        'Define one customer segment and one painful problem.',
        'Run 10 customer interviews.',
        'Draft a simple concept brief and TAM/SAM/SOM.',
        'Design the smallest testable MVP.',
      ]
    case FOUNDER_STAGES.VALIDATION:
      return [
        'Synthesize interview patterns and sharpen the core pain point.',
        'Translate insights into one clear MVP scope.',
        'Test pricing or willingness to pay assumptions early.',
        'Prepare an MVP build plan and first-user acquisition plan.',
      ]
    case FOUNDER_STAGES.MVP:
      return [
        'Instrument the MVP and track actual user behaviour.',
        'Prioritize activation, retention, and learning loops.',
        'Refine customer messaging and GTM assumptions.',
        'Capture evidence that supports investor readiness later.',
      ]
    case FOUNDER_STAGES.EARLY_TRACTION:
      return [
        'Turn early wins into a repeatable traction narrative.',
        'Clarify business model and unit economics.',
        'Build a stronger investor memo and pitch narrative.',
        'Map milestones for the next 12–18 months.',
      ]
    case FOUNDER_STAGES.GROWTH_READINESS:
      return [
        'Strengthen fundraising materials and metrics story.',
        'Tighten financial planning and milestone logic.',
        'Prepare for investor diligence and hard questions.',
        'Focus on scaling the highest-performing channels.',
      ]
    default:
      return []
  }
}

export function getStageSuitableOutputs(stage) {
  switch (stage) {
    case FOUNDER_STAGES.IDEA:
      return [
        'concept_brief',
        'mvp_plan',
        'tam_sam_som',
        'financial_projection',
        'business_case',
      ]
    case FOUNDER_STAGES.VALIDATION:
      return [
        'discovery_summary',
        'mvp_plan',
        'business_model',
        'tam_sam_som',
        'investor_memo',
      ]
    case FOUNDER_STAGES.MVP:
      return [
        'business_model',
        'pitch_deck',
        'investor_memo',
        'elevator_pitch',
      ]
    case FOUNDER_STAGES.EARLY_TRACTION:
      return [
        'pitch_deck',
        'business_plan',
        'investor_memo',
        'mock_interview',
      ]
    case FOUNDER_STAGES.GROWTH_READINESS:
      return [
        'pitch_deck',
        'business_plan',
        'investor_memo',
        'mock_interview',
      ]
    default:
      return []
  }
}