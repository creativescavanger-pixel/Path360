export const PATHWAY_STAGES = [
  {
    id: 'discover',
    number: '00',
    title: 'Discover opportunities',
    legacyKey: 'idea',
    description:
      'Find worthwhile directions through founder context, observation, environment mapping, and opportunity comparison.',
    focus: 'From everyday problems to a worthwhile direction.',
  },
  {
    id: 'explore',
    number: '01',
    title: 'Explore the opportunity',
    legacyKey: 'validation',
    description:
      'Clarify the customer, problem, alternatives, assumptions, and evidence plan before committing to a solution.',
    focus: 'Understand what is worth investigating.',
  },
  {
    id: 'test',
    number: '02',
    title: 'Test customer, demand and economics',
    legacyKey: 'mvp',
    description:
      'Use interviews, observation, prototypes, experiments, pricing, and evidence to learn what is true.',
    focus: 'Test the riskiest assumptions before building too much.',
  },
  {
    id: 'build',
    number: '03',
    title: 'Build the venture',
    legacyKey: 'mvp',
    description:
      'Shape the offer, business model, operations, legal foundations, financial model, and launch plan.',
    focus: 'Turn validated learning into a workable venture foundation.',
  },
  {
    id: 'launch',
    number: '04',
    title: 'Launch',
    legacyKey: 'traction',
    description:
      'Build go-to-market, delivery, onboarding, feedback, cash management, and an operating rhythm.',
    focus: 'Move from preparation into disciplined market execution.',
  },
  {
    id: 'grow',
    number: '05',
    title: 'Grow',
    legacyKey: 'growth',
    description:
      'Strengthen retention, pricing, channels, unit economics, systems, team, leadership, and capital options.',
    focus: 'Build repeatable, sustainable growth.',
  },
  {
    id: 'expand',
    number: '06',
    title: 'Expand',
    legacyKey: 'growth',
    description:
      'Assess new countries, customer segments, products, channels, partners, regulation, and entry economics.',
    focus: 'Make deliberate expansion decisions.',
  },
  {
    id: 'optimise',
    number: '07',
    title: 'Optimise',
    legacyKey: 'growth',
    description:
      'Improve governance, reporting, profitability, resilience, risk, controls, and company value drivers.',
    focus: 'Build a stronger, more resilient operating company.',
  },
  {
    id: 'transition',
    number: '08',
    title: 'Transition',
    legacyKey: 'growth',
    description:
      'Prepare for succession, sale, merger, acquisition, ownership change, or another long-term transition.',
    focus: 'Prepare the company and owner for the next chapter.',
  },
]

const LEGACY_TO_PATHWAY = {
  idea: 'discover',
  validation: 'explore',
  mvp: 'test',
  traction: 'launch',
  growth: 'grow',
}

export function getPathwayStage(stageId) {
  return PATHWAY_STAGES.find((stage) => stage.id === stageId) || null
}

export function getPathwayStageFromLegacy(legacyKey) {
  return getPathwayStage(LEGACY_TO_PATHWAY[legacyKey]) || null
}

export function normalisePathwayStage(stageId) {
  if (getPathwayStage(stageId)) return stageId

  return LEGACY_TO_PATHWAY[stageId] || 'discover'
}

export function getLegacyStageKey(pathwayStageId) {
  return getPathwayStage(pathwayStageId)?.legacyKey || 'idea'
}