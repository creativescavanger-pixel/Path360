// src/lib/stageScoring.js

function getEvidenceSuggestedStage({
  productMaturity,
  customerStatus,
  revenuePattern,
  goToMarketRepeatability,
}) {
  if (productMaturity === 'idea' || customerStatus === 'none' || !customerStatus) {
    return 'discover'
  }

  if (customerStatus === 'conversations' || customerStatus === 'interviews') {
    return 'explore'
  }

  if (
    customerStatus === 'pilots' ||
    revenuePattern === 'pilot' ||
    productMaturity === 'prototype'
  ) {
    return 'test'
  }

  if (
    customerStatus === 'first_paying' ||
    revenuePattern === 'one_off' ||
    productMaturity === 'live_early'
  ) {
    return 'build'
  }

  if (
    customerStatus === 'recurring_customers' &&
    revenuePattern === 'recurring' &&
    goToMarketRepeatability !== 'repeatable'
  ) {
    return 'launch'
  }

  if (
    revenuePattern === 'predictable' ||
    goToMarketRepeatability === 'repeatable' ||
    productMaturity === 'repeatable'
  ) {
    return 'grow'
  }

  return 'explore'
}

// Lightweight baseline scorer used by Assessment/StageOnboarding
export function scoreVentureBaseline(baselineInput = {}) {
  const {
    declaredStage = 'discover',
    ventureProgressLevel = '',
    productMaturity,
    customerStatus,
    revenuePattern,
    goToMarketRepeatability,
  } = baselineInput

  const progressToStage = {
    idea_only: 'discover',
    prototype: 'test',
    beta_live: 'launch',
    revenue_early: 'grow',
    repeatable_growth: 'grow',
  }

  const evidenceSuggestedStage = getEvidenceSuggestedStage({
    productMaturity,
    customerStatus,
    revenuePattern,
    goToMarketRepeatability,
  })

  const stageFromProgress = progressToStage[ventureProgressLevel] || null

  const diagnosedStage =
    evidenceSuggestedStage || stageFromProgress || declaredStage || 'discover'

  return {
    diagnosedStage,
    evidenceSuggestedStage,
    stageFromProgress,
    declaredStage,
  }
}

export function computeStageBaselineScores(
  baselineInput = {},
  assessmentResults = null,
) {
  const evidenceItems = [
    'problem',
    'customer',
    'solution',
    'business',
    'traction',
    'team',
    'capital',
  ]

  const statusScores = baselineInput.statusByItem || {}

  let evidenceScoreRaw = 0
  evidenceItems.forEach((id) => {
    const s = Number(statusScores[id] ?? 0)
    evidenceScoreRaw += s
  })

  const evidenceScoreMax = evidenceItems.length * 3
  const evidenceScorePercent =
    evidenceScoreMax > 0
      ? Math.round((evidenceScoreRaw / evidenceScoreMax) * 100)
      : 0

  const weightsByStage = {
    discover: {
      problem: 3,
      customer: 2,
      solution: 1,
      business: 1,
      traction: 0,
      team: 1,
      capital: 0,
    },
    explore: {
      problem: 3,
      customer: 3,
      solution: 1,
      business: 1,
      traction: 0,
      team: 1,
      capital: 0,
    },
    test: {
      problem: 3,
      customer: 3,
      solution: 2,
      business: 2,
      traction: 1,
      team: 1,
      capital: 1,
    },
    build: {
      problem: 2,
      customer: 2,
      solution: 3,
      business: 3,
      traction: 1,
      team: 2,
      capital: 2,
    },
    launch: {
      problem: 2,
      customer: 2,
      solution: 2,
      business: 2,
      traction: 3,
      team: 2,
      capital: 2,
    },
    grow: {
      problem: 1,
      customer: 2,
      solution: 2,
      business: 3,
      traction: 3,
      team: 3,
      capital: 2,
    },
    expand: {
      problem: 1,
      customer: 2,
      solution: 2,
      business: 3,
      traction: 3,
      team: 3,
      capital: 3,
    },
    optimise: {
      problem: 1,
      customer: 1,
      solution: 1,
      business: 3,
      traction: 3,
      team: 3,
      capital: 3,
    },
    transition: {
      problem: 0,
      customer: 1,
      solution: 1,
      business: 3,
      traction: 2,
      team: 3,
      capital: 3,
    },
  }

  const stageReadinessByStage = {}

  Object.entries(weightsByStage).forEach(([stageId, weights]) => {
    let weightedSum = 0
    let maxWeightedSum = 0

    evidenceItems.forEach((id) => {
      const w = Number(weights[id] ?? 0)
      const s = Number(statusScores[id] ?? 0)
      weightedSum += s * w
      maxWeightedSum += 3 * w
    })

    const percent =
      maxWeightedSum > 0
        ? Math.round((weightedSum / maxWeightedSum) * 100)
        : 0

    stageReadinessByStage[stageId] = {
      score: percent,
      weightedSum,
      maxWeightedSum,
    }
  })

  const stageOrder = {
    discover: 0,
    explore: 1,
    test: 2,
    build: 3,
    launch: 4,
    grow: 5,
    expand: 6,
    optimise: 7,
    transition: 8,
  }

  const progressToStage = {
    idea_only: 'discover',
    prototype: 'test',
    beta_live: 'launch',
    revenue_early: 'grow',
    repeatable_growth: 'grow',
  }

  const ventureProgressLevel = baselineInput.ventureProgressLevel || ''
  const founderStageFromProgress =
    progressToStage[ventureProgressLevel] || 'discover'

  const recommendedStageId = baselineInput.recommendedStageId || 'discover'

  let diagnosticStageId = null
  if (assessmentResults?.venturestageresult) {
    diagnosticStageId = assessmentResults.venturestageresult
  }

  function alignmentScore(fromStage, toStage) {
    const fromOrd = stageOrder[fromStage] ?? stageOrder.discover
    const toOrd = stageOrder[toStage] ?? stageOrder.discover
    const distance = Math.abs(fromOrd - toOrd)

    if (distance === 0) return 100
    if (distance === 1) return 80
    if (distance === 2) return 60
    if (distance === 3) return 40
    return 20
  }

  const founderRecommendedAlignment = alignmentScore(
    founderStageFromProgress,
    recommendedStageId,
  )

  const diagnosticRecommendedAlignment = diagnosticStageId
    ? alignmentScore(diagnosticStageId, recommendedStageId)
    : null

  const mainTension = baselineInput.mainTension || ''
  let constraintSeverity = 1

  const highTensionIds = [
    'economics',
    'team_time_capital',
    'operations_resilience',
    'transition_future',
  ]

  if (highTensionIds.includes(mainTension)) {
    constraintSeverity = 3
  } else if (mainTension) {
    constraintSeverity = 2
  }

  return {
    evidenceScoreRaw,
    evidenceScoreMax,
    evidenceScorePercent,
    stageReadinessByStage,
    founderStageFromProgress,
    recommendedStageId,
    diagnosticStageId,
    founderRecommendedAlignment,
    diagnosticRecommendedAlignment,
    constraintSeverity,
  }
}