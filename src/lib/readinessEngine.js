// src/lib/readinessEngine.js

// ------ Part 1: weights & normalization ------

const TRACK_WEIGHTS = {
  score_problem_clarity:   0.10, // Clarity
  score_customer_evidence: 0.15, // Evidence
  score_solution_readiness:0.15, // Product
  score_business_model:    0.20, // Economics
  score_market_traction:   0.20, // Momentum
  score_team_readiness:    0.10, // Execution
  score_capital_readiness: 0.10, // Runway
}

const TRACK_KEYS = Object.keys(TRACK_WEIGHTS)

// 1–4 -> 0.0–1.0 using (raw-1)/3
function normalizeTrackScore(raw) {
  const value = Number(raw ?? 1)
  const clamped = Math.min(Math.max(value, 1), 4)
  return (clamped - 1) / 3
}

/**
 * Compute Master Readiness % from an assessment_entry row.
 * Returns integer 0–100.
 */
export function computeReadinessPercent(entry) {
  if (!entry) return 0

  let sum = 0

  for (const key of TRACK_KEYS) {
    const weight = TRACK_WEIGHTS[key]
    const normalized = normalizeTrackScore(entry[key])
    sum += normalized * weight
  }

  return Math.round(sum * 100)
}

// ------ Part 3: stage diagnosis ------

export const STAGES = {
  IDEA: 'idea',
  VALIDATION: 'validation',
  MVP: 'mvp',
  TRACTION_GROWTH: 'traction_growth',
}

/**
 * Diagnose operational stage from readiness % + gating conditions.
 * entry = latest assessment_entries row.
 */
export function diagnoseStage(entry) {
  if (!entry) return STAGES.IDEA

  const readiness = computeReadinessPercent(entry)

  const p = Number(entry.score_problem_clarity ?? 1)
  const ce = Number(entry.score_customer_evidence ?? 1)
  const sr = Number(entry.score_solution_readiness ?? 1)
  const bm = Number(entry.score_business_model ?? 1)
  const mt = Number(entry.score_market_traction ?? 1)
  const tr = Number(entry.score_team_readiness ?? 1)
  const cr = Number(entry.score_capital_readiness ?? 1)

  // Gating conditions from your blueprint
  const ideaGate =
    ce <= 2 && mt === 1

  const validationGate =
    p >= 3 && ce >= 2

  const mvpGate =
    sr >= 3 && bm >= 2 && ce >= 3

  const tractionGrowthGate =
    mt >= 3 && bm >= 3 && cr >= 3

  // Priority: gates first, then percentage ranges as fallback
  if (ideaGate || readiness <= 25) {
    return STAGES.IDEA
  }

  if (tractionGrowthGate || readiness >= 76) {
    return STAGES.TRACTION_GROWTH
  }

  if (mvpGate || (readiness >= 56 && readiness <= 75)) {
    return STAGES.MVP
  }

  if (validationGate || (readiness >= 26 && readiness <= 55)) {
    return STAGES.VALIDATION
  }

  // Default fallback
  return STAGES.VALIDATION
}

// ------ Part 4: vulnerability flags ------

export function getVulnerabilityFlags(entry) {
  if (!entry) return []

  const sr = Number(entry.score_solution_readiness ?? 1)
  const ce = Number(entry.score_customer_evidence ?? 1)
  const mt = Number(entry.score_market_traction ?? 1)
  const bm = Number(entry.score_business_model ?? 1)

  const flags = []

  // Over‑Engineering Trap
  if (sr >= 3 && ce <= 2) {
    flags.push({
      key: 'over_engineering_trap',
      title: 'Building faster than the market is validating.',
      description:
        'You are advancing product readiness without strong customer evidence. Pause feature work and focus on discovery and non‑leading tests.',
      routeAcademyModule: 'listen-without-pitching',
    })
  }

  // Leaky Bucket Trap
  if (mt >= 2 && bm <= 2) {
    flags.push({
      key: 'leaky_bucket_trap',
      title: 'You are acquiring users without proven unit economics.',
      description:
        'Traction is emerging, but pricing and payback loops are unclear. Focus on unit economics before pushing growth.',
      routeAcademyModule: 'deconstructing-unit-economics',
    })
  }

  return flags
}