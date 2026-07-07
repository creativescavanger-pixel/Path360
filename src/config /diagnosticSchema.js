const DIAGNOSTIC_DIMENSIONS = [
  {
    id: 'strategic_clarity',
    label: 'Strategic Clarity',
    legacyKey: 'strategicclarity',
    weight: 1.15,
    description: 'How clearly the founder explains the venture, problem, positioning, and why now.',
  },
  {
    id: 'problem_strength',
    label: 'Problem Strength',
    legacyKey: 'problemstrength',
    weight: 1.0,
    description: 'How painful, urgent, and valuable the customer problem appears to be.',
  },
  {
    id: 'product_clarity',
    label: 'Product Clarity',
    legacyKey: 'productclarity',
    weight: 1.0,
    description: 'How clearly the product, value proposition, and differentiation are expressed.',
  },
  {
    id: 'market_understanding',
    label: 'Market Understanding',
    legacyKey: 'marketunderstanding',
    weight: 1.0,
    description: 'How well the founder understands customer, market size, competitors, and segmentation.',
  },
  {
    id: 'execution_readiness',
    label: 'Execution Readiness',
    legacyKey: 'executionreadiness',
    weight: 1.05,
    description: 'How ready the venture appears to execute against milestones, roadmap, and delivery.',
  },
  {
    id: 'growth_potential',
    label: 'Growth Potential',
    legacyKey: 'growthpotential',
    weight: 0.95,
    description: 'How scalable the venture appears through channels, expansion logic, and market pull.',
  },
  {
    id: 'team_strength',
    label: 'Team Strength',
    legacyKey: 'teamstrength',
    weight: 0.95,
    description: 'How strong, complete, credible, and execution-capable the team appears to be.',
  },
  {
    id: 'financial_maturity',
    label: 'Financial Maturity',
    legacyKey: 'financialmaturity',
    weight: 1.0,
    description: 'How mature pricing, economics, cash planning, and fundraising readiness appear to be.',
  },
  {
    id: 'investor_readiness',
    label: 'Investor Readiness',
    legacyKey: 'investorreadiness',
    weight: 1.1,
    description: 'How ready the founder is to communicate a compelling, evidence-backed investor case.',
  },
  {
    id: 'risk_awareness',
    label: 'Risk Awareness',
    legacyKey: 'riskawareness',
    weight: 0.85,
    description: 'How realistically the founder identifies and manages venture risks.',
  },
]

export const LEGACY_RESULT_KEYS = {
  founderScore: 'founderscore',
  investorReadiness: 'investorreadiness',
  strategicClarity: 'strategicclarity',
  executionReadiness: 'executionreadiness',
  financialMaturity: 'financialmaturity',
  marketUnderstanding: 'marketunderstanding',
  teamStrength: 'teamstrength',
  productClarity: 'productclarity',
  growthPotential: 'growthpotential',
  riskAwareness: 'riskawareness',
  ventureStage: 'venturestage',
  strategicPriorities: 'strategicpriorities',
  founderStrengths: 'founderstrengths',
  criticalGaps: 'criticalgaps',
  vcVerdict: 'vcverdict',
  investorNarrative: 'investornarrative',
  riskAnalysis: 'riskanalysis',
  rawqa: 'rawqa',
}

export const SCORE_BANDS = [
  { min: 0, max: 39, label: 'fragile', tone: 'Needs major work' },
  { min: 40, max: 54, label: 'early', tone: 'Early but developing' },
  { min: 55, max: 69, label: 'emerging', tone: 'Promising but incomplete' },
  { min: 70, max: 84, label: 'credible', tone: 'Credible and improving' },
  { min: 85, max: 100, label: 'strong', tone: 'Strong and investable' },
]

export const STAGE_RULES = [
  { min: 0, max: 34, stage: 'idea-stage' },
  { min: 35, max: 54, stage: 'validation-stage' },
  { min: 55, max: 69, stage: 'early-traction' },
  { min: 70, max: 84, stage: 'growth-ready' },
  { min: 85, max: 100, stage: 'scale-ready' },
]

export const CORE_MEMORY_FIELDS = [
  'venture_name',
  'founder_name',
  'industry',
  'venture_stage',
  'business_model',
  'geography',
  'funding_goal',
  'venture_summary',
  'customer_segment',
  'pricing_model',
  'current_market',
  'expansion_markets',
]

export function getDimensionById(id) {
  return DIAGNOSTIC_DIMENSIONS.find((item) => item.id === id) || null
}

export function getDimensionIds() {
  return DIAGNOSTIC_DIMENSIONS.map((item) => item.id)
}

export function getScoreBand(score) {
  const safe = Number.isFinite(Number(score)) ? Number(score) : 0
  return SCORE_BANDS.find((band) => safe >= band.min && safe <= band.max) || SCORE_BANDS[0]
}

export function getVentureStageFromScore(score) {
  const safe = Number.isFinite(Number(score)) ? Number(score) : 0
  return STAGE_RULES.find((rule) => safe >= rule.min && safe <= rule.max)?.stage || 'unknown'
}

export function clampScore(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

export function average(values = []) {
  const valid = values.map(Number).filter((n) => Number.isFinite(n))
  if (!valid.length) return 0
  return valid.reduce((sum, item) => sum + item, 0) / valid.length
}

export default DIAGNOSTIC_DIMENSIONS