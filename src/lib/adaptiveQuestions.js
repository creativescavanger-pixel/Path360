import { FOUNDATION_QUESTIONS } from '../data/founderDiagnostics.js'

const FALLBACK_QUESTIONS = [
  {
    id: 'fallback-q1',
    phase: 'problem',
    question: 'What problem are you solving, for whom, and why is it urgent now?',
    hint: 'Be specific about the person with the problem, not just the market.',
    dimension: 'strategic_clarity',
  },
  {
    id: 'fallback-q2',
    phase: 'traction',
    question: 'What evidence do you have that customers urgently need this solution right now?',
    hint: 'Use proof, signals, or examples.',
    dimension: 'market_understanding',
  },
  {
    id: 'fallback-q3',
    phase: 'traction',
    question: 'What traction or validation have you achieved so far? Use real numbers where possible.',
    hint: 'Mention users, pilots, revenue, retention, or anything measurable.',
    dimension: 'execution_readiness',
  },
  {
    id: 'fallback-q4',
    phase: 'business_model',
    question: 'How exactly will this business make money in the first 12 months?',
    hint: 'Include pricing, frequency, and buyer logic.',
    dimension: 'financial_maturity',
  },
  {
    id: 'fallback-q5',
    phase: 'market',
    question: 'Who is your ideal first customer, and why are they the best place to start?',
    hint: 'Focus on a narrow first segment.',
    dimension: 'market_understanding',
  },
  {
    id: 'fallback-q6',
    phase: 'competition',
    question: 'Who are the strongest alternatives in the market, and why will customers choose you instead?',
    hint: 'Your competitor can also be the status quo.',
    dimension: 'strategic_clarity',
  },
  {
    id: 'fallback-q7',
    phase: 'risk',
    question: 'What is the biggest execution risk over the next 6 months?',
    hint: 'Name the hardest thing that could block progress.',
    dimension: 'risk_awareness',
  },
  {
    id: 'fallback-q8',
    phase: 'fundraising',
    question: 'What milestone are you trying to reach before your next fundraise?',
    hint: 'Think like an investor: what proof reduces risk?',
    dimension: 'investor_readiness',
  },
  {
    id: 'fallback-q9',
    phase: 'gaps',
    question: 'What is currently weakest: team, traction, product, market, or financial model, and why?',
    hint: 'Honesty improves the assessment.',
    dimension: 'team_strength',
  },
  {
    id: 'fallback-q10',
    phase: 'outcome',
    question: 'What would need to be true in the next 12 months for this venture to look genuinely investable?',
    hint: 'Describe the proof points that would change investor confidence.',
    dimension: 'investor_readiness',
  },
]

const BASELINE_STAGE_MAP = {
  idea: 0,
  validation: 5,
  mvp: 10,
  traction: 15,
  growth: 20,
}

const STAGE_LABELS = {
  idea: 'Idea',
  validation: 'Validation',
  mvp: 'MVP',
  traction: 'Traction',
  growth: 'Growth',
}

function getQuestionBank() {
  if (Array.isArray(FOUNDATION_QUESTIONS) && FOUNDATION_QUESTIONS.length > 0) {
    return FOUNDATION_QUESTIONS
  }
  return FALLBACK_QUESTIONS
}

function normalizeQuestion(item) {
  if (!item) return null
  if (typeof item === 'string') {
    return {
      id: null,
      phase: null,
      question: item,
      hint: '',
      dimension: 'strategic_clarity',
    }
  }

  return {
    id: item.id ?? null,
    phase: item.phase ?? null,
    question: item.question ?? '',
    hint: item.hint ?? '',
    dimension: item.dimension ?? 'strategic_clarity',
  }
}

export function getFirstQuestion() {
  const bank = getQuestionBank()
  return normalizeQuestion(bank[0])
}

export function getNextFoundationQuestion(answeredCount) {
  const bank = getQuestionBank()
  if (answeredCount < bank.length) {
    return normalizeQuestion(bank[answeredCount])
  }
  return null
}

export function buildConversationHistory(qaPairs) {
  const history = []
  for (const qa of qaPairs) {
    if (qa?.question) {
      history.push({ role: 'assistant', content: qa.question })
    }
    if (qa?.answer) {
      history.push({ role: 'user', content: qa.answer })
    }
  }
  return history
}

export async function generateNextQuestion(_conversationHistory, questionNumber) {
  const bank = getQuestionBank()
  const next = bank[questionNumber]
  const normalized = normalizeQuestion(next)
  return normalized?.question || null
}

function containsAny(text, patterns) {
  const lower = String(text || '').toLowerCase()
  return patterns.some((p) => lower.includes(p))
}

function scoreAnswer(answer, dimension) {
  const text = String(answer || '').trim()
  if (!text) return 20

  let score = 40

  if (text.length > 80) score += 10
  if (text.length > 180) score += 5

  if (containsAny(text, ['customer', 'users', 'founder', 'team', 'market', 'revenue', 'traction'])) {
    score += 8
  }

  if (containsAny(text, ['mvp', 'prototype', 'pilot', 'paying', 'arr', 'mrr', 'retention', 'conversion'])) {
    score += 10
  }

  if (containsAny(text, ['risk', 'challenge', 'competition', 'weakness', 'assumption'])) {
    score += 8
  }

  if (containsAny(text, ['10', '20', '100', '%', '$', '€', 'k', 'monthly', 'users', 'customers'])) {
    score += 7
  }

  if (dimension === 'financial_maturity' && containsAny(text, ['pricing', 'margin', 'subscription', 'revenue', 'cac', 'ltv'])) {
    score += 10
  }

  if (dimension === 'investor_readiness' && containsAny(text, ['raise', 'funding', 'runway', 'milestone', 'valuation'])) {
    score += 10
  }

  if (dimension === 'execution_readiness' && containsAny(text, ['build', 'launch', 'ship', 'deliver', 'team', 'hire'])) {
    score += 10
  }

  if (dimension === 'team_strength' && containsAny(text, ['team', 'hire', 'cofounder', 'operator', 'leader'])) {
    score += 10
  }

  if (dimension === 'product_clarity' && containsAny(text, ['product', 'workflow', 'feature', 'use case', 'solution'])) {
    score += 10
  }

  return Math.min(score, 92)
}

function detectStage(allText) {
  const text = String(allText || '').toLowerCase()

  if (containsAny(text, ['series a', 'scaling', 'predictable growth'])) return 'growth'
  if (containsAny(text, ['paying customers', 'revenue', 'traction', 'seed'])) return 'traction'
  if (containsAny(text, ['prototype', 'mvp', 'pilot', 'pre-seed'])) return 'validation'
  return 'idea'
}

function riskLevelFromScore(score) {
  if (score >= 75) return 'low'
  if (score >= 55) return 'medium'
  return 'high'
}

function normalizeStageKey(value) {
  if (!value) return 'idea'
  return String(value).toLowerCase().replace(/\s+/g, '_')
}

export async function generateAssessmentScores(
  conversationHistory,
  founderProfile = {},
  stageAssessment = {}
) {
  const qaOnly = conversationHistory.filter((m) => m.role === 'user')
  const allAnswers = qaOnly.map((m) => m.content || '')
  const fullText = allAnswers.join(' \n ')
  const stageBaseline = normalizeStageKey(stageAssessment.diagnosedStage)

  const dimensionMap = [
    'strategic_clarity',
    'market_understanding',
    'execution_readiness',
    'financial_maturity',
    'market_understanding',
    'strategic_clarity',
    'risk_awareness',
    'investor_readiness',
    'team_strength',
    'investor_readiness',
  ]

  const baseScores = {
    strategic_clarity: 0,
    investor_readiness: 0,
    execution_readiness: 0,
    financial_maturity: 0,
    market_understanding: 0,
    team_strength: 0,
    product_clarity: 0,
    growth_potential: 0,
    risk_awareness: 0,
  }

  allAnswers.forEach((answer, index) => {
    const dimension = dimensionMap[index] || 'strategic_clarity'
    const score = scoreAnswer(answer, dimension)

    if (!baseScores[dimension]) baseScores[dimension] = score
    else baseScores[dimension] = Math.round((baseScores[dimension] + score) / 2)
  })

  if (!baseScores.product_clarity) {
    baseScores.product_clarity = Math.round(
      ((baseScores.strategic_clarity || 55) + (baseScores.market_understanding || 55)) / 2
    )
  }

  if (!baseScores.team_strength) baseScores.team_strength = 55

  if (!baseScores.growth_potential) {
    baseScores.growth_potential = Math.round(
      ((baseScores.market_understanding || 55) + (baseScores.execution_readiness || 55)) / 2
    )
  }

  const baselineBoost = BASELINE_STAGE_MAP[stageBaseline] || 0
  const adjustedExecution = clamp((baseScores.execution_readiness || 55) + Math.round(baselineBoost * 0.35), 0, 100)
  const adjustedMarket = clamp((baseScores.market_understanding || 55) + Math.round(baselineBoost * 0.3), 0, 100)
  const adjustedFinancial = clamp((baseScores.financial_maturity || 55) + Math.round(baselineBoost * 0.2), 0, 100)

  const founder_score = Math.round(
    (
      (baseScores.strategic_clarity || 55) +
      adjustedExecution +
      adjustedFinancial +
      adjustedMarket +
      (baseScores.team_strength || 55) +
      (baseScores.product_clarity || 55) +
      (baseScores.growth_potential || 55) +
      (baseScores.risk_awareness || 55)
    ) / 8
  )

  const investor_readiness = Math.round(
    (
      founder_score +
      adjustedFinancial +
      adjustedExecution +
      adjustedMarket
    ) / 4
  )

  const venture_stage = stageBaseline !== 'idea'
    ? stageBaseline
    : detectStage(`${fullText} ${founderProfile?.venture_stage ?? ''} ${founderProfile?.venturestage ?? ''}`)

  const stageBrief = stageAssessment?.stageScore
    ? `Baseline stage assessment indicates ${STAGE_LABELS[stageBaseline] || STAGE_LABELS.idea} stage readiness with ${stageAssessment.stageScore} points and a focus on ${stageAssessment.recommendedAcademyPath || 'foundational progress'}.`
    : `This assessment reflects the current venture status and suggests a practical path to strengthen readiness.`

  const priorityScores = Array.isArray(stageAssessment?.priorities)
    ? stageAssessment.priorities.map((key) => ({
        key,
        label: key,
        score: 88,
      }))
    : []

  const recommendedMissionKeys = Array.isArray(stageAssessment?.recommendedMissionKeys)
    ? stageAssessment.recommendedMissionKeys
    : []

  const recommendedAcademyPath = stageAssessment?.recommendedAcademyPath || stageBaseline || 'idea'

  const priorities = []

  if ((baseScores.market_understanding || 0) < 65) {
    priorities.push({
      priority: 'Tighten customer definition and first beachhead segment',
      urgency: 'Critical',
      rationale: 'The venture narrative is still too broad for a focused go-to-market motion.',
    })
  }

  if ((baseScores.financial_maturity || 0) < 65) {
    priorities.push({
      priority: 'Clarify revenue model, pricing, and milestone-based funding logic',
      urgency: 'High',
      rationale: 'Investors need clearer evidence that the business can convert traction into economics.',
    })
  }

  if ((baseScores.execution_readiness || 0) < 65) {
    priorities.push({
      priority: 'Strengthen execution plan for the next 6-12 months',
      urgency: 'High',
      rationale: 'The current plan does not yet show enough operational credibility.',
    })
  }

  if ((baseScores.risk_awareness || 0) < 65) {
    priorities.push({
      priority: 'Articulate the top venture risks and mitigation plan',
      urgency: 'Medium',
      rationale: 'A stronger risk narrative improves investor trust and founder credibility.',
    })
  }

  while (priorities.length < 4) {
    priorities.push({
      priority: 'Improve investor narrative and proof points',
      urgency: 'Medium',
      rationale: 'The venture would benefit from sharper positioning and evidence-backed storytelling.',
    })
  }

  const strengths = []

  if ((baseScores.strategic_clarity || 0) >= 70) strengths.push('Clear articulation of problem and strategic direction')
  if ((adjustedExecution || 0) >= 70) strengths.push('Strong execution orientation')
  if ((adjustedMarket || 0) >= 70) strengths.push('Good understanding of customer and market dynamics')
  if ((baseScores.team_strength || 0) >= 70) strengths.push('Credible founder or team positioning')

  const fallbackStrengths = [
    'Founder demonstrates initiative',
    'Venture has early strategic potential',
    'Assessment provides a usable base for refinement',
  ]

  while (strengths.length < 3) {
    strengths.push(fallbackStrengths[strengths.length])
  }

  const criticalGaps = []

  if ((baseScores.financial_maturity || 0) < 65) criticalGaps.push('Financial model and pricing logic need work')
  if (investor_readiness < 65) criticalGaps.push('Investor readiness is not yet strong enough for a convincing raise')
  if ((baseScores.market_understanding || 0) < 65) criticalGaps.push('Customer segmentation and market focus remain underdeveloped')

  while (criticalGaps.length < 3) {
    criticalGaps.push('Narrative and proof points need sharpening')
  }

  return {
    founderscore: founder_score,
    investorreadiness: investor_readiness,
    strategicclarity: baseScores.strategic_clarity || 55,
    executionreadiness: adjustedExecution || 55,
    financialmaturity: adjustedFinancial || 55,
    marketunderstanding: adjustedMarket || 55,
    teamstrength: baseScores.team_strength || 55,
    productclarity: baseScores.product_clarity || 55,
    growthpotential: baseScores.growth_potential || 55,
    riskawareness: baseScores.risk_awareness || 55,
    venturestage: venture_stage,
    venturestageresult: venture_stage,
    strategicpriorities: priorities.slice(0, 4),
    founderstrengths: strengths.slice(0, 3),
    criticalgaps: criticalGaps.slice(0, 3),
    stagebrief: stageBrief,
    priorityscores: priorityScores,
    recommendedacademypath: recommendedAcademyPath,
    recommendedmissionkeys: recommendedMissionKeys,
    riskanalysis: {
      toprisk: criticalGaps[0] || 'Execution risk',
      marketrisk: riskLevelFromScore(baseScores.market_understanding || 55),
      executionrisk: riskLevelFromScore(baseScores.execution_readiness || 55),
      teamrisk: riskLevelFromScore(baseScores.team_strength || 55),
      financialrisk: riskLevelFromScore(baseScores.financial_maturity || 55),
    },
    investornarrative:
      'This venture should be positioned around a clearly defined customer problem, a focused entry market, and a milestone-driven plan to reduce execution and commercial risk.',
    vcverdict:
      investor_readiness >= 70
        ? 'There is enough structure here to justify deeper diligence, but the venture still needs sharper proof points before it becomes truly investable.'
        : 'The venture is directionally interesting, but it is not yet investor-ready. The founder needs stronger market evidence, better economic logic, and a clearer next-milestone narrative.',
  }
}
