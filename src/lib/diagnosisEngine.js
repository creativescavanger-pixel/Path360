import DIAGNOSTIC_DIMENSIONS, {
  clampScore,
  average,
  getScoreBand,
  getVentureStageFromScore,
} from '../config/diagnosticSchema.js'
import { getMarketOverlay } from '../config/marketOverlays.js'

function normalizeText(value) {
  return String(value || '').trim()
}

function wordCount(value) {
  return normalizeText(value).split(/\s+/).filter(Boolean).length
}

function scoreByLength(value, rules = { low: 12, medium: 28, high: 55 }) {
  const count = wordCount(value)
  if (count >= rules.high) return 85
  if (count >= rules.medium) return 70
  if (count >= rules.low) return 55
  if (count >= 4) return 40
  return 20
}

function hasAny(value, patterns = []) {
  const text = normalizeText(value).toLowerCase()
  return patterns.some((pattern) => text.includes(pattern))
}

function scoreProblemStrength(answers) {
  let score = scoreByLength(answers.problem)
  if (hasAny(answers.problem, ['urgent', 'pain', 'cost', 'manual', 'inefficient', 'slow', 'expensive'])) score += 8
  if (hasAny(answers.current_alternative, ['excel', 'manual', 'spreadsheet', 'email', 'whatsapp', 'workaround'])) score += 7
  return clampScore(score)
}

function scoreStrategicClarity(answers) {
  let score = average([
    scoreByLength(answers.one_liner, { low: 7, medium: 14, high: 22 }),
    scoreByLength(answers.founder_motivation),
    scoreByLength(answers.why_now),
  ])
  if (wordCount(answers.one_liner) > 6 && wordCount(answers.one_liner) < 35) score += 6
  return clampScore(score)
}

function scoreProductClarity(answers) {
  let score = average([
    scoreByLength(answers.solution),
    scoreByLength(answers.current_alternative),
  ])
  if (hasAny(answers.solution, ['platform', 'software', 'tool', 'service', 'marketplace', 'api', 'workflow'])) score += 6
  if (hasAny(answers.solution, ['faster', 'cheaper', 'better', 'automate', 'simplify'])) score += 6
  return clampScore(score)
}

function scoreMarketUnderstanding(answers, marketId) {
  let score = average([
    scoreByLength(answers.customer_segment, { low: 10, medium: 20, high: 40 }),
    scoreByLength(answers.market_size),
    scoreByLength(answers.competition),
    scoreByLength(answers.go_to_market),
  ])

  if (marketId === 'europe' && hasAny(answers.eu_regulatory_readiness, ['gdpr', 'vat', 'compliance', 'procurement', 'certification'])) score += 7
  if (marketId === 'africa' && hasAny(answers.africa_distribution, ['agent', 'partner', 'offline', 'field', 'reseller', 'distribution'])) score += 7
  if (marketId === 'asia' && hasAny(answers.asia_market_sequence, ['singapore', 'india', 'indonesia', 'japan', 'korea', 'thailand', 'vietnam'])) score += 7

  return clampScore(score)
}

function scoreExecutionReadiness(answers, docType, marketId) {
  let score = average([
    scoreByLength(answers.traction),
    scoreByLength(answers.go_to_market),
    scoreByLength(answers.team),
    scoreByLength(answers.milestones_12m || answers.support_case || answers.deck_memory || answers.target_listener || answers.memo_use_case || answers.upcoming_investor_context),
  ])

  if (hasAny(answers.traction, ['revenue', 'users', 'customers', 'pilot', 'paid', 'mrr', 'arr', 'partnership'])) score += 8
  if (marketId === 'africa' && hasAny(answers.africa_payments_ops, ['fx', 'collection', 'logistics', 'working capital', 'payment'])) score += 5
  if (marketId === 'europe' && hasAny(answers.eu_funding_fit, ['grant', 'pilot', 'eic', 'corporate'])) score += 5
  if (docType === 'business_plan' && scoreByLength(answers.operating_model) >= 70) score += 5

  return clampScore(score)
}

function scoreGrowthPotential(answers, marketId) {
  let score = average([
    scoreByLength(answers.market_size),
    scoreByLength(answers.go_to_market),
    scoreByLength(answers.expansion_markets),
  ])

  if (hasAny(answers.market_size, ['million', 'billion', 'large', 'growing', 'underserved'])) score += 6
  if (marketId === 'asia' && scoreByLength(answers.asia_localization) >= 60) score += 5
  return clampScore(score)
}

function scoreTeamStrength(answers) {
  let score = scoreByLength(answers.team)
  if (hasAny(answers.team, ['founded', 'built', 'scaled', 'domain', 'operator', 'technical', 'commercial'])) score += 8
  if (hasAny(answers.team, ['missing', 'need to hire', 'gap'])) score -= 5
  return clampScore(score)
}

function scoreFinancialMaturity(answers) {
  let score = average([
    scoreByLength(answers.revenue_model),
    scoreByLength(answers.financial_state),
    scoreByLength(answers.fundraising_goal),
  ])

  if (hasAny(answers.revenue_model, ['subscription', 'saas', 'commission', 'margin', 'pricing', 'annual', 'monthly'])) score += 7
  if (hasAny(answers.financial_state, ['runway', 'burn', 'gross margin', 'forecast', 'cac', 'ltv', 'unit economics'])) score += 8
  return clampScore(score)
}

function scoreInvestorReadiness(answers, docType) {
  let score = average([
    scoreByLength(answers.one_liner),
    scoreByLength(answers.traction),
    scoreByLength(answers.market_size),
    scoreByLength(answers.fundraising_goal),
    scoreByLength(answers.deck_memory || answers.memo_use_case || answers.target_listener || answers.upcoming_investor_context),
  ])

  if (docType === 'pitch_deck' && scoreByLength(answers.deck_memory) >= 60) score += 5
  if (hasAny(answers.fundraising_goal, ['seed', 'pre-seed', 'round', 'raise', 'capital', 'milestone'])) score += 7
  return clampScore(score)
}

function scoreRiskAwareness(answers) {
  let score = scoreByLength(answers.top_risks)
  if (hasAny(answers.top_risks, ['competition', 'adoption', 'cash', 'team', 'regulation', 'execution', 'product'])) score += 10
  return clampScore(score)
}

function scoreProblemProxy(answers) {
  return scoreProblemStrength(answers)
}

function applyMarketAdjustments(scoreMap, marketId) {
  const overlay = getMarketOverlay(marketId)
  const next = { ...scoreMap }

  Object.entries(overlay.dimensionAdjustments || {}).forEach(([dimensionId, multiplier]) => {
    if (typeof next[dimensionId] === 'number') {
      next[dimensionId] = clampScore(next[dimensionId] * multiplier)
    }
  })

  return next
}

function buildStrengths(scoreMap, answers) {
  const candidates = [
    ['Strategic clarity is stronger than average.', scoreMap.strategic_clarity],
    ['The founder explains the market and customer with good specificity.', scoreMap.market_understanding],
    ['The business model and commercial logic are relatively well articulated.', scoreMap.financial_maturity],
    ['Execution signals are promising based on traction, milestones, and operating detail.', scoreMap.execution_readiness],
    ['The team story shows credible founder-market fit.', scoreMap.team_strength],
    ['The investor narrative is taking shape with improving clarity.', scoreMap.investor_readiness],
  ]

  const strengths = candidates
    .filter(([, score]) => score >= 68)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label]) => label)

  if (!strengths.length && wordCount(answers.founder_motivation) > 18) {
    strengths.push('Founder motivation and commitment are clearly visible.')
  }

  return strengths
}

function buildGaps(scoreMap) {
  const ordered = [
    ['Strategic clarity is still too vague for high-confidence investor communication.', scoreMap.strategic_clarity],
    ['The market case needs tighter sizing, segmentation, and wedge focus.', scoreMap.market_understanding],
    ['Execution readiness needs stronger milestones, evidence, or delivery proof.', scoreMap.execution_readiness],
    ['Financial maturity is still underdeveloped and needs clearer economics.', scoreMap.financial_maturity],
    ['The team story does not yet fully de-risk execution.', scoreMap.team_strength],
    ['Risk articulation needs more realism and prioritisation.', scoreMap.risk_awareness],
  ]

  return ordered
    .filter(([, score]) => score < 65)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 4)
    .map(([label]) => label)
}

function buildStrategicPriorities(scoreMap, marketId) {
  const priorities = []

  if (scoreMap.market_understanding < 70) {
    priorities.push({
      priority: 'Tighten market wedge and customer specificity',
      rationale: 'Clarify exactly who buys first, what pain is urgent, and why your initial segment is the best entry point.',
    })
  }

  if (scoreMap.execution_readiness < 70) {
    priorities.push({
      priority: 'Translate strategy into a milestone-driven execution plan',
      rationale: 'Investors need to see what gets built, sold, or validated over the next 6–12 months.',
    })
  }

  if (scoreMap.financial_maturity < 70) {
    priorities.push({
      priority: 'Strengthen commercial and financial logic',
      rationale: 'Make pricing, revenue mechanics, and the use of funds more concrete and measurable.',
    })
  }

  if (scoreMap.investor_readiness < 70) {
    priorities.push({
      priority: 'Improve the investor story',
      rationale: 'The narrative should make the opportunity, traction, and timing feel easier to believe quickly.',
    })
  }

  if (marketId === 'europe') {
    priorities.push({
      priority: 'Show cross-border and compliance readiness',
      rationale: 'European growth often depends on proving how you handle regulatory variation, pilots, and expansion across markets.',
    })
  }

  if (marketId === 'africa') {
    priorities.push({
      priority: 'Demonstrate operational realism in-market',
      rationale: 'Explain how distribution, collections, partnerships, and infrastructure realities are handled in practice.',
    })
  }

  if (marketId === 'asia') {
    priorities.push({
      priority: 'Clarify country sequencing and localization depth',
      rationale: 'Asian market expansion needs a sharper view of where you enter first, why, and how the offer changes by market.',
    })
  }

  return priorities.slice(0, 4)
}

function buildVerdict(founderScore, investorReadiness, stage) {
  const founderBand = getScoreBand(founderScore)
  const investorBand = getScoreBand(investorReadiness)

  if (investorReadiness >= 80) {
    return `This venture presents as ${founderBand.tone.toLowerCase()} overall and already shows a ${investorBand.tone.toLowerCase()} level of investor readiness. The main task now is to sharpen proof, confidence, and fundraising precision for the next stage.`
  }

  if (investorReadiness >= 60) {
    return `This venture shows credible promise and a ${stage.replace('-', ' ')} profile, but investors will still look for stronger proof, tighter positioning, and clearer commercial readiness before conviction is high.`
  }

  return `This venture has visible potential, but it is not yet communicating a sufficiently investable case. The next step is to convert ambition into sharper evidence, better structure, and more execution credibility.`
}

function buildNarrative(answers, marketId, founderScore) {
  const regionLabel =
    marketId === 'europe' ? 'European' :
    marketId === 'africa' ? 'African' :
    marketId === 'asia' ? 'Asian' :
    'global'

  const stage = getVentureStageFromScore(founderScore).replace('-', ' ')

  return `${normalizeText(answers.one_liner) || 'The company story is still forming.'} At present, the venture reads as a ${stage} opportunity with a ${regionLabel} market lens. The strongest improvement path is to tighten customer specificity, translate traction into investor-grade evidence, and make the operating and commercial path easier to trust.`
}

function buildRiskAnalysis(scoreMap, marketId) {
  return {
    strategic: scoreMap.strategic_clarity < 65 ? 'medium-high' : 'moderate',
    commercial: scoreMap.financial_maturity < 65 ? 'medium-high' : 'moderate',
    execution: scoreMap.execution_readiness < 65 ? 'medium-high' : 'moderate',
    market: scoreMap.market_understanding < 65 ? 'medium-high' : 'moderate',
    team: scoreMap.team_strength < 65 ? 'medium-high' : 'moderate',
    regional:
      marketId === 'europe'
        ? 'Cross-border regulatory and procurement complexity should be handled explicitly.'
        : marketId === 'africa'
          ? 'Operational realities such as distribution, collections, and infrastructure should be addressed explicitly.'
          : marketId === 'asia'
            ? 'Localization and country sequencing should be handled explicitly.'
            : 'Regional expansion assumptions should be made explicit.',
  }
}

function buildRawQA(guide, answers) {
  const pairs = []

  ;(guide.sections || []).forEach((section) => {
    ;(section.questions || []).forEach((question) => {
      const answer = answers?.[question.id]
      if (normalizeText(answer)) {
        pairs.push({
          question: question.label,
          answer: normalizeText(answer),
          section: section.title,
          key: question.id,
        })
      }
    })
  })

  return pairs
}

export function runDiagnosis({ guide, answers, market = 'global', docType = 'business_plan' }) {
  const marketOverlay = getMarketOverlay(market)

  const baseScores = {
    strategic_clarity: scoreStrategicClarity(answers),
    problem_strength: scoreProblemProxy(answers),
    product_clarity: scoreProductClarity(answers),
    market_understanding: scoreMarketUnderstanding(answers, marketOverlay.id),
    execution_readiness: scoreExecutionReadiness(answers, docType, marketOverlay.id),
    growth_potential: scoreGrowthPotential(answers, marketOverlay.id),
    team_strength: scoreTeamStrength(answers),
    financial_maturity: scoreFinancialMaturity(answers),
    investor_readiness: scoreInvestorReadiness(answers, docType),
    risk_awareness: scoreRiskAwareness(answers),
  }

  const adjustedScores = applyMarketAdjustments(baseScores, marketOverlay.id)

  const founderScore = clampScore(
    average(
      DIAGNOSTIC_DIMENSIONS.map((dimension) => {
        const raw = adjustedScores[dimension.id] || 0
        return raw * (dimension.weight || 1)
      })
    )
  )

  const ventureStage = getVentureStageFromScore(founderScore)
  const strengths = buildStrengths(adjustedScores, answers)
  const gaps = buildGaps(adjustedScores)
  const priorities = buildStrategicPriorities(adjustedScores, marketOverlay.id)
  const rawqa = buildRawQA(guide, answers)

  return {
    internal: {
      market: marketOverlay.id,
      dimensionScores: adjustedScores,
      founderScore,
      ventureStage,
      strengths,
      gaps,
      priorities,
      confidence: clampScore(average(Object.values(adjustedScores))),
    },

    legacy: {
      founderscore: founderScore,
      investorreadiness: adjustedScores.investor_readiness,
      strategicclarity: adjustedScores.strategic_clarity,
      executionreadiness: adjustedScores.execution_readiness,
      financialmaturity: adjustedScores.financial_maturity,
      marketunderstanding: adjustedScores.market_understanding,
      teamstrength: adjustedScores.team_strength,
      productclarity: adjustedScores.product_clarity,
      growthpotential: adjustedScores.growth_potential,
      riskawareness: adjustedScores.risk_awareness,
      venturestage: ventureStage,
      strategicpriorities: priorities,
      founderstrengths: strengths,
      criticalgaps: gaps,
      vcverdict: buildVerdict(founderScore, adjustedScores.investor_readiness, ventureStage),
      investornarrative: buildNarrative(answers, marketOverlay.id, founderScore),
      riskanalysis: buildRiskAnalysis(adjustedScores, marketOverlay.id),
      rawqa,
    },
  }
}

export default runDiagnosis