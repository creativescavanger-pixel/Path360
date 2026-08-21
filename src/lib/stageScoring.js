const DEFAULT_PRIORITY_LABELS = {
  clarify_problem: 'Clarify my problem and customer',
  validate_demand: 'Validate demand with real users',
  improve_product: 'Improve my product or offer',
  gain_traction: 'Gain customers and traction',
  growth_systems: 'Build growth systems',
  financial_model: 'Strengthen pricing and financial model',
  investor_readiness: 'Prepare for investors',
  team_operations: 'Build team and operations',
  founder_development: 'Develop myself as a founder',
}

const STAGE_THRESHOLDS = [30, 50, 70, 85]
const STAGES = ['idea', 'validation', 'mvp', 'traction', 'growth']

function toStage(score) {
  if (score <= STAGE_THRESHOLDS[0]) return 'idea'
  if (score <= STAGE_THRESHOLDS[1]) return 'validation'
  if (score <= STAGE_THRESHOLDS[2]) return 'mvp'
  if (score <= STAGE_THRESHOLDS[3]) return 'traction'
  return 'growth'
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function normalizeScore(value, map) {
  return map[value] ?? 0
}

const PRODUCT_MATURITY_SCORE = {
  idea: 0,
  prototype: 12,
  live_early: 24,
  live_growing: 34,
  repeatable: 42,
}

const CUSTOMER_STATUS_SCORE = {
  none: 0,
  conversations: 10,
  interviews: 18,
  pilots: 28,
  first_paying: 34,
  recurring_customers: 42,
}

const REVENUE_PATTERN_SCORE = {
  none: 0,
  pilot: 10,
  one_off: 18,
  recurring: 28,
  predictable: 42,
}

const GTM_REPEATABILITY_SCORE = {
  none: 0,
  manual: 12,
  emerging: 24,
  repeatable: 40,
}

const STAGE_LABELS = {
  idea: 'Idea',
  validation: 'Validation',
  mvp: 'MVP',
  traction: 'Traction',
  growth: 'Growth',
}

export function scoreVentureBaseline(input = {}) {
  const statusValues = input.statusByItem || {}
  const statusScores = Object.values(statusValues).map((value) => Number(value) || 0)
  const statusAverage = statusScores.length
    ? statusScores.reduce((sum, value) => sum + value, 0) / statusScores.length
    : 0

  const productScore = normalizeScore(input.productMaturity, PRODUCT_MATURITY_SCORE)
  const customerScore = normalizeScore(input.customerStatus, CUSTOMER_STATUS_SCORE)
  const revenueScore = normalizeScore(input.revenuePattern, REVENUE_PATTERN_SCORE)
  const gtmScore = normalizeScore(input.goToMarketRepeatability, GTM_REPEATABILITY_SCORE)

  const stageScore = clamp(
    Math.round(
      statusAverage * 15 +
        productScore * 0.6 +
        customerScore * 0.5 +
        revenueScore * 0.35 +
        gtmScore * 0.35
    ),
    0,
    100
  )

  const diagnosedStage = toStage(stageScore)

  const confidence = clamp(
    55 + Math.round((stageScore - 30) * 0.4),
    55,
    95
  )

  const reasons = []
  if (!input.productMaturity) {
    reasons.push('Product maturity is not yet defined.')
  }
  if (!input.customerStatus) {
    reasons.push('Customer signal is still developing.')
  }
  if (!input.revenuePattern) {
    reasons.push('Revenue pattern has not been established.')
  }
  if (!input.goToMarketRepeatability) {
    reasons.push('Go-to-market repeatability needs clarity.')
  }
  if (reasons.length === 0) {
    reasons.push('Your baseline includes a clearer product, customer, revenue, and go-to-market picture.')
  }

  const recommendedAcademyPath = diagnosedStage
  const recommendedMissionKeys = []
  if (diagnosedStage === 'idea') {
    recommendedMissionKeys.push('opportunity-foundations')
  } else if (diagnosedStage === 'validation') {
    recommendedMissionKeys.push('notice-friction')
  } else if (diagnosedStage === 'mvp') {
    recommendedMissionKeys.push('choose-a-user')
  }

  const priorityScores = Array.isArray(input.priorities)
    ? input.priorities.map((key) => ({
        key,
        label: DEFAULT_PRIORITY_LABELS[key] || key,
        score: 90,
      }))
    : []

  const stageBrief = `Your baseline indicates ${STAGE_LABELS[diagnosedStage] || 'Idea'} stage readiness with a ${confidence}% confidence score and a focus on ${recommendedAcademyPath} learning.`

  return {
    diagnosedStage,
    stageScore,
    stageConfidence: confidence,
    stageReasons: reasons,
    recommendedAcademyPath,
    recommendedMissionKeys,
    priorityScores,
    stageBrief,
  }
}
