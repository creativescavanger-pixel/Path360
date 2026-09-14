export const ACADEMY_STAGE_KEYS = [
  'discover',
  'explore',
  'test',
  'build',
  'launch',
  'grow',
  'expand',
  'optimise',
  'transition',
]

const LEGACY_PATH_KEYS = [
  'idea',
  'validation',
  'mvp',
  'traction',
  'growth',
]

const LEGACY_PATH_TO_STAGE = {
  idea: 'discover',
  validation: 'test',
  mvp: 'build',
  traction: 'launch',
  growth: 'grow',
  traction_growth: 'grow',
}

const STAGE_TO_LEGACY_PATH = {
  discover: 'idea',
  explore: 'idea',
  test: 'validation',
  build: 'mvp',
  launch: 'traction',
  grow: 'growth',
  expand: 'growth',
  optimise: 'growth',
  transition: 'growth',
}

export function normaliseStageKey(raw) {
  const key = String(raw || '').trim().toLowerCase()

  if (ACADEMY_STAGE_KEYS.includes(key)) {
    return key
  }

  if (LEGACY_PATH_TO_STAGE[key]) {
    return LEGACY_PATH_TO_STAGE[key]
  }

  return 'discover'
}

export function normalisePathKey(raw) {
  const stageKey = normaliseStageKey(raw)

  return STAGE_TO_LEGACY_PATH[stageKey] || 'idea'
}

export function getStageFromLegacyPath(raw) {
  const key = String(raw || '').trim().toLowerCase()

  return LEGACY_PATH_TO_STAGE[key] || 'discover'
}