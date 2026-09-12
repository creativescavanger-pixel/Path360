// src/pages/StageOnboarding.jsx

import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  scoreVentureBaseline,
  computeStageBaselineScores,
} from '../lib/stageScoring.js'
import {
  PATHWAY_STAGES,
  getLegacyStageKey,
  normalisePathwayStage,
} from '../lib/pathwayStages.js'

const ITEMS = [
  {
    id: 'problem',
    label: 'Problem clarity',
    description:
      'You can clearly explain the problem, who has it, and why it matters now.',
  },
  {
    id: 'customer',
    label: 'Customer evidence',
    description:
      'You have real conversations, tests, pilots, or paying customers in your target segment.',
  },
  {
    id: 'solution',
    label: 'Solution readiness',
    description:
      'You have a concept, prototype, MVP, or working product being used by real people.',
  },
  {
    id: 'business',
    label: 'Business model',
    description:
      'You understand how the venture makes money and what drives its economics.',
  },
  {
    id: 'traction',
    label: 'Market traction',
    description:
      'You can show repeated usage, revenue, retention, or growth—not just one‑off activity.',
  },
  {
    id: 'team',
    label: 'Team readiness',
    description:
      'You have the people, capabilities, or signed plans needed for the next 6–12 months.',
  },
  {
    id: 'capital',
    label: 'Capital readiness',
    description:
      'You understand your funding needs, runway, and likely funding path.',
  },
]

const STATUS_OPTIONS = [
  {
    id: 'not_started',
    label: 'Not yet',
    fullLabel: 'Not started',
    shortLabel: 'Not yet',
    score: 0,
  },
  {
    id: 'early',
    label: 'Just starting',
    fullLabel: 'Early progress',
    shortLabel: 'Starting',
    score: 1,
  },
  {
    id: 'active',
    label: 'In motion',
    fullLabel: 'Actively working',
    shortLabel: 'In motion',
    score: 2,
  },
  {
    id: 'strong',
    label: 'Strong & repeatable',
    fullLabel: 'Strong evidence',
    shortLabel: 'Strong',
    score: 3,
  },
]

const PROGRESS_LEVELS = [
  {
    id: 'idea_only',
    label: 'Idea only',
    description: 'Clear problem and concept, no product yet.',
  },
  {
    id: 'prototype',
    label: 'Prototype / pilot',
    description: 'Prototype or pilot in testing with early users.',
  },
  {
    id: 'beta_live',
    label: 'Live with early customers',
    description: 'Working product with first active customers.',
  },
  {
    id: 'revenue_early',
    label: 'Early revenue',
    description: 'Some paying customers, learning about value and retention.',
  },
  {
    id: 'repeatable_growth',
    label: 'Repeatable growth',
    description: 'Recurring revenue with signs of repeatable demand.',
  },
]

const TENSIONS = [
  {
    id: 'opportunity_focus',
    label:
      'I am not yet sure which opportunity or problem is worth committing to.',
    stage: 'discover',
  },
  {
    id: 'customer_evidence',
    label:
      'I need real customer evidence and willingness-to-pay, not just opinions.',
    stage: 'explore',
  },
  {
    id: 'product_value',
    label:
      'The product or offer exists, but I am not confident it creates repeatable value.',
    stage: 'test',
  },
  {
    id: 'traction_growth',
    label:
      'We have some traction, but growth and retention feel inconsistent or fragile.',
    stage: 'launch',
  },
  {
    id: 'economics',
    label:
      'Our pricing, unit economics, or path to profitability feel unclear or risky.',
    stage: 'grow',
  },
  {
    id: 'team_time_capital',
    label:
      'Team, time, or capital limits what we can safely do next.',
    stage: 'build',
  },
  {
    id: 'operations_resilience',
    label:
      'Operations, quality, controls, or resilience need strengthening.',
    stage: 'optimise',
  },
  {
    id: 'transition_future',
    label:
      'We need to think about succession, sale, merger, acquisition, ownership change, or another future transition.',
    stage: 'transition',
  },
]

const DECISIONS = [
  {
    id: 'choose_opportunity',
    label: 'Which opportunity or customer problem to pursue.',
    stage: 'discover',
  },
  {
    id: 'validate_demand',
    label: 'Whether there is real demand and willingness to pay.',
    stage: 'test',
  },
  {
    id: 'build_model',
    label: 'What to build next and how the venture should work.',
    stage: 'build',
  },
  {
    id: 'launch_better',
    label: 'How to launch, sell, and deliver better.',
    stage: 'launch',
  },
  {
    id: 'grow_repeatably',
    label: 'How to turn early traction into repeatable growth.',
    stage: 'grow',
  },
  {
    id: 'expand_segment',
    label:
      'Whether expansion or a new segment is sensible and feasible.',
    stage: 'expand',
  },
  {
    id: 'strengthen_company',
    label: 'How to strengthen economics, operations, or resilience.',
    stage: 'optimise',
  },
  {
    id: 'prepare_transition',
    label: 'How to prepare for a future transition or exit.',
    stage: 'transition',
  },
]

const PRIORITIES = [
  ['clarify_problem', 'Clarity about my opportunity and customer'],
  ['validate_demand', 'Quality of customer evidence and insight'],
  ['improve_product', 'Product / offer and customer value'],
  ['gain_traction', 'Traction, growth, and retention'],
  ['growth_systems', 'Team, operating rhythm, and systems'],
  ['financial_model', 'Pricing, financial model, and economics'],
  ['investor_readiness', 'Investor readiness and narrative'],
]

const WORKSHOP_RECOMMENDATIONS = {
  discover: {
    workshop: 'Opportunity Discovery',
    reason:
      'You are still exploring direction, comparing possibilities, or building early evidence before choosing one opportunity.',
    modules: [
      'Begin with yourself',
      'Learn to notice opportunities',
      'Map your environment',
      'Observe people, behaviour, and workarounds',
    ],
    output: 'Founder Context Profile and an active Observation Log.',
  },
  explore: {
    workshop: 'Opportunity Exploration',
    reason:
      'You have a possible direction, but need a clearer customer problem, segment, alternatives view, and evidence plan before committing to a solution.',
    modules: [
      'Define the opportunity',
      'Understand the customer problem',
      'Study alternatives and market context',
      'Design your evidence plan',
    ],
    output:
      'Customer/problem evidence brief and a decision to test or revisit.',
  },
  test: {
    workshop: 'Customer, Demand and Economics Testing',
    reason:
      'You need behavioural, demand, willingness-to-pay, or economic evidence before investing further in a product, offer, or operating model.',
    modules: [
      'Design customer research',
      'Run observations and interviews',
      'Test a prototype, pilot, or MVP',
      'Test price, channels, and unit economics',
    ],
    output:
      'Evidence-backed test record and a continue, pivot, pause, or stop decision.',
  },
  build: {
    workshop: 'Venture Build',
    reason:
      'You have enough early learning to shape a workable offer, business model, operating plan, financial foundation, and launch preparation.',
    modules: [
      'Business model and offer design',
      'Pricing, costs, and financial model',
      'Operations, suppliers, legal, and governance',
      'Launch readiness',
    ],
    output: 'A coherent venture plan and launch-ready source work.',
  },
  launch: {
    workshop: 'Launch and Early Operations',
    reason:
      'Your immediate work is bringing a prepared offer to market with a clear go-to-market plan, onboarding, delivery, feedback, and cash discipline.',
    modules: [
      'Go-to-market and channel plan',
      'Customer onboarding and delivery',
      'Marketing and content',
      'First metrics, feedback, and operating rhythm',
    ],
    output:
      'Launch plan, early-market evidence, and an operating review rhythm.',
  },
  grow: {
    workshop: 'Sustainable Growth',
    reason:
      'You are working on repeatability: retention, segments, channels, pricing, economics, systems, team, leadership, and disciplined growth decisions.',
    modules: [
      'Segment revenue and unit economics',
      'Retention and customer value',
      'Channel performance and pricing',
      'Systems, team, leadership, and capital options',
    ],
    output:
      'Growth plan supported by performance evidence and operating priorities.',
  },
  expand: {
    workshop: 'Expansion Readiness',
    reason:
      'You are assessing a new country, customer segment, product, channel, or partner and need a deliberate evidence and economics route.',
    modules: [
      'Market, country, corridor, and customer screen',
      'Localisation and operating environment',
      'Partners, supply chain, and regulation',
      'Entry economics, scenarios, capital, and risk',
    ],
    output:
      'Expansion decision brief and a credible entry plan or decision not to proceed yet.',
  },
  optimise: {
    workshop: 'Optimise and Strengthen',
    reason:
      'You are strengthening the operating company through governance, reporting, profitability, quality, risk, process improvement, and resilience.',
    modules: [
      'Governance and reporting',
      'Cash, profitability, and value drivers',
      'Quality, controls, risk, and compliance',
      'Leadership bench and company resilience',
    ],
    output:
      'Operating improvement plan linked to measurable value drivers.',
  },
  transition: {
    workshop: 'Transition Preparation',
    reason:
      'You are preparing the company and owner for succession, sale, merger, acquisition, ownership change, or another future transition decision.',
    modules: [
      'Owner goals and transition options',
      'Company value drivers and readiness',
      'Governance, finance, and data room',
      'Buyer, partner, adviser, and transition plan',
    ],
    output:
      'Transition readiness plan and decision preparation materials.',
  },
}

const STEPS = [
  {
    id: 'context',
    number: '01',
    label: 'Context',
    title: 'Where are you today?',
    description:
      'Describe your venture, progress, and what you are working through over the next 90 days.',
  },
  {
    id: 'evidence',
    number: '02',
    label: 'Evidence',
    title: 'What evidence do you have?',
    description:
      'Mark what is already in motion. This prevents PATH360 from asking you to repeat work you already did.',
  },
  {
    id: 'focus',
    number: '03',
    label: 'Focus',
    title: 'What matters next?',
    description:
      'Choose near-term priorities and add any context that should shape your recommended work.',
  },
]

const PAGES_BY_STEP = {
  context: ['snapshot', 'tension'],
  evidence: ['evidence'],
  focus: ['focus'],
}

const FLOW = STEPS.flatMap((step) =>
  (PAGES_BY_STEP[step.id] || []).map((pageId) => ({
    stepId: step.id,
    pageId,
  })),
)

const OVERLAY_Z_INDEX = 2147483646
const MODAL_Z_INDEX = 2147483647

function getStatusScore(status) {
  return STATUS_OPTIONS.find((option) => option.id === status)?.score ?? 0
}

function createEmptyStatuses() {
  return ITEMS.reduce((all, item) => {
    all[item.id] = 'not_started'
    return all
  }, {})
}

function getStage(stageId) {
  return PATHWAY_STAGES.find((stage) => stage.id === stageId) || PATHWAY_STAGES[0]
}

function legacyStageToPathway(stageId) {
  return normalisePathwayStage(stageId)
}

function normaliseAssessment(assessment) {
  const fallback = createEmptyStatuses()

  return {
    declaredStage: assessment?.declaredStage
      ? legacyStageToPathway(assessment.declaredStage)
      : '',
    diagnosedStage: assessment?.diagnosedStage
      ? legacyStageToPathway(assessment.diagnosedStage)
      : '',
    statusByItem: {
      ...fallback,
      ...(assessment?.statusByItem || {}),
    },
    productMaturity: assessment?.productMaturity || '',
    customerStatus: assessment?.customerStatus || '',
    revenuePattern: assessment?.revenuePattern || '',
    goToMarketRepeatability: assessment?.goToMarketRepeatability || '',
    teamStructure: assessment?.teamStructure || '',
    fundingStage: assessment?.fundingStage || '',
    priorities: Array.isArray(assessment?.priorities)
      ? assessment.priorities
      : [],
    blockers: Array.isArray(assessment?.blockers)
      ? assessment.blockers
      : [],
    completedActivities: Array.isArray(assessment?.completedActivities)
      ? assessment.completedActivities
      : [],
    ventureSummary: assessment?.ventureSummary || '',
    ventureProblem: assessment?.ventureProblem || '',
    ventureProgressLevel: assessment?.ventureProgressLevel || '',
    recentProgress90Days: assessment?.recentProgress90Days || '',
    mainTension: assessment?.mainTension || '',
    pathDecision: assessment?.pathDecision || '',
    notes: assessment?.notes || '',
    completedAt: assessment?.completedAt || null,
    averageScore: Number(assessment?.averageScore || 0),
    evidenceScorePercent: Number(assessment?.evidenceScorePercent || 0),
    stageReadinessByStage: assessment?.stageReadinessByStage || null,
    founderStageFromProgress: assessment?.founderStageFromProgress || '',
    founderRecommendedAlignment: Number(
      assessment?.founderRecommendedAlignment || 0,
    ),
    diagnosticRecommendedAlignment:
      assessment?.diagnosticRecommendedAlignment ?? null,
    constraintSeverity: Number(assessment?.constraintSeverity || 1),
  }
}

function getTensionStage(tensionId) {
  return TENSIONS.find((item) => item.id === tensionId)?.stage || ''
}

function getDecisionStage(decisionId) {
  return DECISIONS.find((item) => item.id === decisionId)?.stage || ''
}

function getEvidenceSuggestedStage({
  productMaturity,
  customerStatus,
  revenuePattern,
  goToMarketRepeatability,
}) {
  if (
    productMaturity === 'idea' ||
    customerStatus === 'none' ||
    !customerStatus
  ) {
    return 'discover'
  }

  if (
    customerStatus === 'conversations' ||
    customerStatus === 'interviews'
  ) {
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

function getScoreSuggestedStage(legacyStage) {
  return normalisePathwayStage(legacyStage)
}

function getRecommendationStage({
  selectedStage,
  mainTension,
  pathDecision,
  evidenceSuggestedStage,
  scoreSuggestedStage,
}) {
  if (selectedStage) return selectedStage

  const tensionStage = getTensionStage(mainTension)
  if (tensionStage) return tensionStage

  const decisionStage = getDecisionStage(pathDecision)
  if (decisionStage) return decisionStage

  return evidenceSuggestedStage || scoreSuggestedStage || 'discover'
}

function getPathwayReason({
  selectedStage,
  ventureSummary,
  ventureProblem,
  ventureProgressLevel,
  mainTension,
  pathDecision,
  evidenceSuggestedStage,
  scoreSuggestedStage,
  primaryConstraint,
  recommendedStageId,
}) {
  const reasonParts = []

  if (ventureSummary) {
    reasonParts.push(`Your current venture focus: ${ventureSummary}.`)
  }

  if (ventureProblem) {
    reasonParts.push(
      `The problem and customer you described: ${ventureProblem}.`,
    )
  }

  const progressChoice = PROGRESS_LEVELS.find(
    (level) => level.id === ventureProgressLevel,
  )
  if (progressChoice) {
    reasonParts.push(
      `You see yourself at “${progressChoice.label}” (${progressChoice.description}).`,
    )
  }

  const tension = TENSIONS.find((item) => item.id === mainTension)
  if (tension?.label) {
    reasonParts.push(`Main tension: ${tension.label}`)
  }

  const decision = DECISIONS.find((item) => item.id === pathDecision)
  if (decision?.label) {
    reasonParts.push(
      `You want PATH360 to help you decide: ${decision.label}`,
    )
  }

  if (selectedStage) {
    const s = getStage(selectedStage)
    reasonParts.push(
      `You chose Stage ${s.number} · ${s.title} as the most useful context for your current work.`,
    )
  }

const finalStage = getStage(recommendedStageId)

reasonParts.push(
  `PATH360 recommends Stage ${finalStage.number} · ${finalStage.title} as the most useful focus for your current work.`,
)
  return reasonParts.join(' ')
}

function getFocusAreas(statusByItem, priorities) {
  const priorityLabels = Object.fromEntries(PRIORITIES)

  const evidenceFocus = [...ITEMS]
    .sort(
      (a, b) =>
        getStatusScore(statusByItem[a.id]) -
        getStatusScore(statusByItem[b.id]),
    )
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      label: item.label,
      type: 'evidence',
    }))

  const priorityFocus = priorities.slice(0, 3).map((priority) => ({
    id: priority,
    label: priorityLabels[priority] || priority,
    type: 'priority',
  }))

  const combined = [...priorityFocus, ...evidenceFocus]
  const unique = []

  combined.forEach((item) => {
    if (!unique.some((existing) => existing.label === item.label)) {
      unique.push(item)
    }
  })

  return unique.slice(0, 3)
}

function PathwayModal({
  open,
  selectedStage,
  recommendedStageId,
  onClose,
  onSelectStage,
}) {
  useEffect(() => {
    if (!open) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: OVERLAY_Z_INDEX,
          background: 'rgba(17, 17, 15, 0.38)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="pathway-modal-title"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: MODAL_Z_INDEX,
          display: 'grid',
          placeItems: 'center',
          padding: 18,
          pointerEvents: 'none',
        }}
      >
        <div
          className="p360-panel"
          onClick={(event) => event.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: 880,
            maxHeight: 'calc(100vh - 36px)',
            overflowY: 'auto',
            padding: 22,
            pointerEvents: 'auto',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 18,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div className="p360-kicker" style={{ marginBottom: 6 }}>
                Founder pathways
              </div>

              <h2 id="pathway-modal-title" className="p360-title-md">
                Explore every stage
              </h2>

              <p className="p360-body-sm" style={{ margin: '6px 0 0' }}>
                You are never locked into one route. Select a pathway if it is
                more useful than PATH360’s current recommendation.
              </p>
            </div>

            <button
              type="button"
              className="p360-btn-ghost"
              onClick={onClose}
              aria-label="Close pathway browser"
              style={{
                minWidth: 34,
                minHeight: 34,
                padding: 0,
                fontSize: 18,
              }}
            >
              ×
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 10,
            }}
          >
            {PATHWAY_STAGES.map((stage) => {
              const selected = selectedStage === stage.id
              const recommended = recommendedStageId === stage.id

              return (
                <button
                  key={stage.id}
                  type="button"
                  className="p360-card-soft"
                  onClick={() => {
                    onSelectStage(stage.id)
                    onClose()
                  }}
                  style={{
                    padding: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderColor: selected
                      ? 'var(--green-600)'
                      : recommended
                        ? 'rgba(37, 104, 75, 0.3)'
                        : 'var(--border)',
                    background: selected
                      ? 'var(--green-050)'
                      : 'var(--surface)',
                    boxShadow: selected
                      ? '0 0 0 3px rgba(50, 122, 88, 0.09)'
                      : 'none',
                    transition:
                      'border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        display: 'grid',
                        width: 26,
                        height: 26,
                        placeItems: 'center',
                        borderRadius: 8,
                        background: selected
                          ? 'var(--green-700)'
                          : 'var(--surface-muted)',
                        color: selected
                          ? 'var(--white)'
                          : 'var(--text-soft)',
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      {stage.number}
                    </span>

                    {recommended ? (
                      <span className="p360-tag-learning">Suggested</span>
                    ) : null}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      color: selected
                        ? 'var(--green-800)'
                        : 'var(--text)',
                      fontSize: 13,
                      fontWeight: 800,
                      lineHeight: 1.3,
                    }}
                  >
                    {stage.title}
                  </div>

                  <p
                    style={{
                      margin: '4px 0 0',
                      color: 'var(--text-soft)',
                      fontSize: 11.5,
                      lineHeight: 1.5,
                    }}
                  >
                    {stage.focus}
                  </p>
                </button>
              )
            })}
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              marginTop: 18,
              paddingTop: 16,
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              className="p360-btn-ghost"
              onClick={() => {
                onSelectStage('')
                onClose()
              }}
            >
              Use PATH360 recommendation
            </button>

            <button
              type="button"
              className="p360-btn-secondary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}

function StepNavigation({
  activeStep,
  onStepChange,
  completedEvidence,
  onboardingCompletion,
  furthestStepIndex,
}) {
  const activeIndex = Math.max(
    STEPS.findIndex((step) => step.id === activeStep),
    0,
  )

  const progressPercent = ((activeIndex + 1) / STEPS.length) * 100

  return (
    <div style={{ minWidth: 280, flex: '1 1 320px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          fontSize: 11.5,
          color: 'var(--text-soft)',
          marginBottom: 5,
        }}
      >
        <span style={{ fontWeight: 700 }}>
          Step {activeIndex + 1} of {STEPS.length}
        </span>
        <span>
          {onboardingCompletion.stepsDone}/{onboardingCompletion.total} answered
        </span>
      </div>

      <div
        style={{
          height: 4,
          borderRadius: 999,
          background: 'var(--surface-soft)',
          overflow: 'hidden',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            borderRadius: 999,
            background: 'linear-gradient(90deg, #163A2C 0%, #2D6A4F 100%)',
            transition: 'width 0.25s ease',
          }}
        />
      </div>

      <div
        aria-label="Onboarding steps"
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      >
        {STEPS.map((step, index) => {
          const active = step.id === activeStep
          const visited = index <= furthestStepIndex
          const done = index < activeIndex
          const available = visited || index <= furthestStepIndex + 1

          return (
            <div
              key={step.id}
              style={{ display: 'flex', alignItems: 'center', flex: 1 }}
            >
              <button
                type="button"
                onClick={() => available && onStepChange(step.id)}
                disabled={!available}
                aria-current={active ? 'step' : undefined}
                title={step.title}
                style={{
                  flex: 1,
                  minHeight: 34,
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  borderRadius: 999,
                  border: active
                    ? '1px solid var(--green-700)'
                    : '1px solid var(--border)',
                  background: active ? 'var(--green-700)' : 'var(--surface)',
                  color: active ? 'var(--white)' : 'var(--text-soft)',
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  cursor: available ? 'pointer' : 'not-allowed',
                  opacity: available ? 1 : 0.45,
                  transition: 'all 0.18s ease',
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    background: active
                      ? 'rgba(255,255,255,0.18)'
                      : done
                        ? 'var(--green-700)'
                        : 'var(--surface-soft)',
                    color: active || done ? 'var(--white)' : 'var(--text-soft)',
                    fontSize: 10.5,
                  }}
                >
                  {done ? '\u2713' : index + 1}
                </span>

                {step.label}

                {step.id === 'evidence' ? (
                  <span style={{ opacity: 0.75, fontWeight: 700 }}>
                    {completedEvidence}/{ITEMS.length}
                  </span>
                ) : null}
              </button>

              {index < STEPS.length - 1 ? (
                <span
                  aria-hidden="true"
                  style={{
                    width: 10,
                    height: 2,
                    flexShrink: 0,
                    borderRadius: 999,
                    background: done ? 'var(--green-700)' : 'var(--border)',
                  }}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepFooterNav({
  flowIndex,
  prevLabel,
  nextLabel,
  isLastPage,
  isSaving,
  onBack,
  onNext,
  onSave,
}) {
  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 14,
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        className="p360-btn-ghost"
        onClick={onBack}
        disabled={flowIndex === 0}
        style={{
          fontSize: 12.5,
          cursor: flowIndex === 0 ? 'default' : 'pointer',
          opacity: flowIndex === 0 ? 0.4 : 1,
        }}
      >
        {flowIndex === 0 ? 'Back' : `Back to ${prevLabel}`}
      </button>

      <div
        style={{
          fontSize: 11.5,
          color: 'var(--text-faint)',
          flex: '1 1 auto',
          textAlign: 'center',
          minWidth: 120,
        }}
      >
        {flowIndex + 1} of {FLOW.length}
      </div>

      {isLastPage ? (
        <button
          type="button"
          className="p360-btn-primary"
          onClick={onSave}
          disabled={isSaving}
          style={{ fontSize: 12.5 }}
        >
          {isSaving ? 'Saving' : 'Save baseline and finish'}
        </button>
      ) : (
        <button
          type="button"
          className="p360-btn-primary"
          onClick={onNext}
          style={{ fontSize: 12.5 }}
        >
          Next: {nextLabel}
        </button>
      )}
    </div>
  )
}

function StatTile({ label, value, hint }) {
  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        border: '1px solid var(--border)',
        background: 'var(--surface-soft)',
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-faint)',
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: 'var(--text)',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>

      {hint ? (
        <div
          style={{
            marginTop: 3,
            fontSize: 10.5,
            color: 'var(--text-faint)',
            lineHeight: 1.4,
          }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  )
}

function StagePageTopBar({
  averageScore,
  baselineScores,
  recommendedStage,
  recommendedStageId,
  activeStep,
  onboardingCompletion,
  completedEvidence,
  strongEvidence,
  furthestStepIndex,
  currentStep,
  onStepChange,
}) {
  const evidenceScore = baselineScores.evidenceScorePercent ?? 0
  const readinessScore =
    baselineScores.stageReadinessByStage?.[recommendedStageId]?.score ?? 0
  const alignmentScore = baselineScores.founderRecommendedAlignment ?? 0

  const signalHint =
    completedEvidence === 0
      ? 'Nothing in motion yet'
      : `${completedEvidence} of ${ITEMS.length} in motion, ${strongEvidence} strong`

  return (
    <section
      className="p360-card-soft"
      style={{
        padding: 18,
        marginBottom: 14,
        borderRadius: 18,
        background: 'var(--surface)',
      }}
    >
      <div style={{ maxWidth: 720 }}>
        <div className="p360-kicker" style={{ marginBottom: 5 }}>
          Stage baseline
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 21,
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: 'var(--text)',
            lineHeight: 1.25,
          }}
        >
          Build a clear, evidence-based starting point for your venture
        </h1>

        <p
          style={{
            margin: '7px 0 0',
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--text-soft)',
          }}
        >
          Answer three short steps once. PATH360 combines your view with its own
          scoring to set your workshop stage, Academy path, and investor
          readiness view.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(148px, 1fr))',
          gap: 10,
          marginTop: 14,
        }}
      >
        <StatTile
          label="Avg evidence"
          value={averageScore.toFixed(2)}
          hint="out of 3.00"
        />
        <StatTile
          label="Evidence score"
          value={`${evidenceScore}/100`}
          hint={signalHint}
        />
        <StatTile
          label="Stage readiness"
          value={`${readinessScore}/100`}
          hint={`Stage ${recommendedStage.number} baseline`}
        />
        <StatTile
          label="Your alignment"
          value={`${alignmentScore}/100`}
          hint="Your view vs PATH360"
        />
      </div>

      <div
        style={{
          marginTop: 16,
          paddingTop: 14,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 260px', maxWidth: 420 }}>
          <div className="p360-kicker" style={{ marginBottom: 5 }}>
            Step {currentStep.number}
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: 'var(--text)',
              lineHeight: 1.3,
            }}
          >
            {currentStep.title}
          </div>

          <p
            style={{
              margin: '6px 0 0',
              fontSize: 12.5,
              lineHeight: 1.6,
              color: 'var(--text-soft)',
            }}
          >
            {currentStep.description}
          </p>
        </div>

        <StepNavigation
          activeStep={activeStep}
          onStepChange={onStepChange}
          completedEvidence={completedEvidence}
          onboardingCompletion={onboardingCompletion}
          furthestStepIndex={furthestStepIndex}
        />
      </div>
    </section>
  )
}

function RecommendationPanel({
  recommendedStage,
  selectedStage,
  recommendation,
  pathwayReason,
  completedEvidence,
  prioritiesCount,
  focusAreas,
  evidenceScorePercent,
  readinessScore,
  alignmentScore,
  onExplorePathways,
  onStartWorkshop,
  onOpenAcademy,
}) {
  const isOverride = Boolean(selectedStage)
  const choiceLabel = isOverride ? 'Your choice' : 'Suggested'

  return (
    <aside
      className="p360-card"
      style={{
        position: 'sticky',
        top: 12,
        padding: 16,
        alignSelf: 'start',
        background: 'var(--surface-soft)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
        }}
      >
        <div className="p360-kicker">Your likely pathway</div>

        <span className="p360-tag-learning">{choiceLabel}</span>
      </div>

      <div
        style={{
          marginTop: 8,
          color: 'var(--text)',
          fontSize: 18.5,
          fontWeight: 800,
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
        }}
      >
        Stage {recommendedStage.number} · {recommendedStage.title}
      </div>

      <p
        className="p360-body-sm"
        style={{ margin: '8px 0 0', fontSize: 12.5 }}
      >
        {recommendation.reason}
      </p>

      <div
        style={{
          marginTop: 10,
          padding: 10,
          borderRadius: 10,
          background: 'var(--surface-soft)',
        }}
      >
        <div className="p360-kicker" style={{ marginBottom: 4 }}>
          Next steps for this stage
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 16,
            fontSize: 12,
            color: 'var(--text-soft)',
            lineHeight: 1.5,
          }}
        >
          <li>Start the {recommendation.workshop} workshop this week.</li>
          <li>Complete at least one module on customer and evidence.</li>
          <li>Update your baseline once new signals appear.</li>
        </ul>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginTop: 14,
        }}
      >
        <div className="p360-card-soft" style={{ padding: 10 }}>
          <div className="p360-kicker" style={{ marginBottom: 4 }}>
            Evidence
          </div>

          <div
            style={{
              color: 'var(--text)',
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            {completedEvidence}/7
          </div>

          <div
            style={{
              marginTop: 2,
              color: 'var(--text-faint)',
              fontSize: 10.5,
              lineHeight: 1.3,
            }}
          >
            evidence areas active
          </div>
        </div>

        <div className="p360-card-soft" style={{ padding: 10 }}>
          <div className="p360-kicker" style={{ marginBottom: 4 }}>
            Focus
          </div>

          <div
            style={{
              color: 'var(--text)',
              fontSize: 18,
              fontWeight: 800,
            }}
          >
            {prioritiesCount}/3
          </div>

          <div
            style={{
              marginTop: 2,
              color: 'var(--text-faint)',
              fontSize: 10.5,
              lineHeight: 1.3,
            }}
          >
            priorities selected
          </div>
        </div>
      </div>

      <div
        className="p360-card-soft"
        style={{ padding: 10, marginTop: 12 }}
      >
        <div className="p360-kicker" style={{ marginBottom: 4 }}>
          Baseline diagnosis
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-soft)',
            lineHeight: 1.5,
          }}
        >
          Evidence score: {evidenceScorePercent ?? 0}/100 · Stage readiness:{' '}
          {readinessScore ?? 0}/100 · Founder–PATH360 alignment:{' '}
          {alignmentScore ?? 0}/100
        </div>
      </div>

      {focusAreas.length > 0 && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}
        >
          <div className="p360-kicker" style={{ marginBottom: 6 }}>
            What to emphasise
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 16,
              fontSize: 12,
              color: 'var(--text-soft)',
              lineHeight: 1.5,
            }}
          >
            {focusAreas.map((area) => (
              <li>{area.label}</li>
            ))}
          </ul>
        </div>
      )}

      <div
        style={{
          marginTop: 16,
          paddingTop: 15,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div className="p360-kicker" style={{ marginBottom: 6 }}>
          Why this fits
        </div>

        <p
          style={{
            margin: 0,
            color: 'var(--text-soft)',
            fontSize: 12,
            lineHeight: 1.55,
          }}
        >
          {pathwayReason ||
            'Add your current context and PATH360 will refine this recommendation.'}
        </p>
      </div>

      <button
        type="button"
        className="p360-btn-primary"
        onClick={onStartWorkshop}
        style={{
          width: '100%',
          marginTop: 14,
          fontSize: 12,
        }}
      >
        Start {recommendation.workshop}
      </button>

      <button
        type="button"
        className="p360-btn-secondary"
        onClick={onOpenAcademy}
        style={{
          width: '100%',
          marginTop: 8,
          fontSize: 12,
        }}
      >
        Open Academy path for this stage
      </button>

      <button
        type="button"
        className="p360-btn-ghost"
        onClick={onExplorePathways}
        style={{
          width: '100%',
          marginTop: 10,
          fontSize: 12,
        }}
      >
        See all stages
      </button>
    </aside>
  )
}

export default function StageOnboarding() {
  const navigate = useNavigate()

  const user = useDiagnosticStore((state) => state.user)
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const stageAssessment = useDiagnosticStore((state) => state.stageAssessment)
  const assessmentResults = useDiagnosticStore(
    (state) => state.assessmentResults,
  )
  const hasCompletedStageOnboarding = useDiagnosticStore(
    (state) => state.hasCompletedStageOnboarding,
  )
  const setStageAssessment = useDiagnosticStore(
    (state) => state.setStageAssessment,
  )
  const updateFounderProfile = useDiagnosticStore(
    (state) => state.updateFounderProfile,
  )

  const existing = useMemo(
    () => normaliseAssessment(stageAssessment),
    [stageAssessment],
  )

  const [selectedStage, setSelectedStage] = useState(existing.declaredStage)
  const [statusByItem, setStatusByItem] = useState(existing.statusByItem)
  const [notes, setNotes] = useState(existing.notes)
  const [showResults, setShowResults] = useState(
    Boolean(hasCompletedStageOnboarding && existing.completedAt),
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [activeStep, setActiveStep] = useState('context')
  const [activePageId, setActivePageId] = useState(PAGES_BY_STEP.context[0])
  const [furthestStepIndex, setFurthestStepIndex] = useState(0)
  const [showPathways, setShowPathways] = useState(false)

  const [productMaturity, setProductMaturity] = useState(
    existing.productMaturity,
  )
  const [customerStatus, setCustomerStatus] = useState(
    existing.customerStatus,
  )
  const [revenuePattern, setRevenuePattern] = useState(
    existing.revenuePattern,
  )
  const [goToMarketRepeatability, setGoToMarketRepeatability] = useState(
    existing.goToMarketRepeatability,
  )
  const [teamStructure, setTeamStructure] = useState(existing.teamStructure)
  const [fundingStage, setFundingStage] = useState(existing.fundingStage)
  const [priorities, setPriorities] = useState(existing.priorities)
  const [blockers, setBlockers] = useState(existing.blockers)
  const [completedActivities, setCompletedActivities] = useState(
    existing.completedActivities,
  )

  const [ventureSummary, setVentureSummary] = useState(
    existing.ventureSummary,
  )
  const [ventureProblem, setVentureProblem] = useState(
    existing.ventureProblem,
  )
  const [ventureProgressLevel, setVentureProgressLevel] = useState(
    existing.ventureProgressLevel,
  )
  const [recentProgress90Days, setRecentProgress90Days] = useState(
    existing.recentProgress90Days,
  )
  const [mainTension, setMainTension] = useState(existing.mainTension)
  const [pathDecision, setPathDecision] = useState(existing.pathDecision)

  useEffect(() => {
    const next = normaliseAssessment(stageAssessment)

    setSelectedStage(next.declaredStage)
    setStatusByItem(next.statusByItem)
    setNotes(next.notes)
    setShowResults(Boolean(next.completedAt))
    setProductMaturity(next.productMaturity)
    setCustomerStatus(next.customerStatus)
    setRevenuePattern(next.revenuePattern)
    setGoToMarketRepeatability(next.goToMarketRepeatability)
    setTeamStructure(next.teamStructure)
    setFundingStage(next.fundingStage)
    setPriorities(next.priorities)
    setBlockers(next.blockers)
    setCompletedActivities(next.completedActivities)
    setVentureSummary(next.ventureSummary)
    setVentureProblem(next.ventureProblem)
    setVentureProgressLevel(next.ventureProgressLevel)
    setRecentProgress90Days(next.recentProgress90Days)
    setMainTension(next.mainTension)
    setPathDecision(next.pathDecision)
  }, [stageAssessment])

  const averageScore = useMemo(() => {
    const total = ITEMS.reduce(
      (sum, item) => sum + getStatusScore(statusByItem[item.id]),
      0,
    )

    return Number((total / ITEMS.length).toFixed(2))
  }, [statusByItem])

  const baselineInput = useMemo(
    () => ({
      declaredStage: getLegacyStageKey(selectedStage || 'discover'),
      productMaturity,
      customerStatus,
      revenuePattern,
      goToMarketRepeatability,
      teamStructure,
      fundingStage,
      statusByItem: Object.fromEntries(
        Object.entries(statusByItem).map(([key, status]) => [
          key,
          getStatusScore(status),
        ]),
      ),
      priorities,
      blockers,
      completedActivities,
      ventureSummary,
      ventureProblem,
      ventureProgressLevel,
      recentProgress90Days,
      mainTension,
      pathDecision,
    }),
    [
      selectedStage,
      productMaturity,
      customerStatus,
      revenuePattern,
      goToMarketRepeatability,
      teamStructure,
      fundingStage,
      statusByItem,
      priorities,
      blockers,
      completedActivities,
      ventureSummary,
      ventureProblem,
      ventureProgressLevel,
      recentProgress90Days,
      mainTension,
      pathDecision,
    ],
  )

  const stageDiagnosis = useMemo(
    () => scoreVentureBaseline(baselineInput),
    [baselineInput],
  )

  const evidenceSuggestedStage = useMemo(
    () =>
      getEvidenceSuggestedStage({
        productMaturity,
        customerStatus,
        revenuePattern,
        goToMarketRepeatability,
      }),
    [
      productMaturity,
      customerStatus,
      revenuePattern,
      goToMarketRepeatability,
    ],
  )

  const scoreSuggestedStage = useMemo(
    () => getScoreSuggestedStage(stageDiagnosis.diagnosedStage),
    [stageDiagnosis.diagnosedStage],
  )

  const recommendedStageId = useMemo(
    () =>
      getRecommendationStage({
        selectedStage,
        mainTension,
        pathDecision,
        evidenceSuggestedStage,
        scoreSuggestedStage,
      }),
    [
      selectedStage,
      mainTension,
      pathDecision,
      evidenceSuggestedStage,
      scoreSuggestedStage,
    ],
  )

  const baselineScores = useMemo(
    () =>
      computeStageBaselineScores(
        {
          ...baselineInput,
          recommendedStageId,
        },
        assessmentResults,
      ),
    [baselineInput, assessmentResults, recommendedStageId],
  )

  const recommendedStage = getStage(recommendedStageId)
  const recommendation =
    WORKSHOP_RECOMMENDATIONS[recommendedStageId] ||
    WORKSHOP_RECOMMENDATIONS.discover
  const selectedStageData = selectedStage ? getStage(selectedStage) : null

  const focusAreas = useMemo(
    () => getFocusAreas(statusByItem, priorities),
    [statusByItem, priorities],
  )

  const completedItems = useMemo(
    () =>
      ITEMS.filter((item) => getStatusScore(statusByItem[item.id]) >= 2)
        .length,
    [statusByItem],
  )

  const strongItems = useMemo(
    () =>
      ITEMS.filter((item) => getStatusScore(statusByItem[item.id]) === 3)
        .length,
    [statusByItem],
  )

  const pathwayReason = useMemo(
    () =>
      getPathwayReason({
        selectedStage,
        ventureSummary,
        ventureProblem,
        ventureProgressLevel,
        mainTension,
        pathDecision,
        evidenceSuggestedStage,
        scoreSuggestedStage,
        recommendedStageId,
      }),
    [
      selectedStage,
      ventureSummary,
      ventureProblem,
      ventureProgressLevel,
      mainTension,
      pathDecision,
      evidenceSuggestedStage,
      scoreSuggestedStage,
      recommendedStageId,
    ],
  )

  const onboardingCompletion = useMemo(() => {
    const hasNarrative = Boolean(ventureSummary && ventureProblem)
    const hasProgressChoice = Boolean(ventureProgressLevel)
    const hasTension = Boolean(mainTension)
    const hasDecision = Boolean(pathDecision)
    const hasEvidence = completedItems >= 3
    const hasFocus = priorities.length >= 1

    const stepsDone = [
      hasNarrative && hasProgressChoice && hasTension && hasDecision,
      hasEvidence,
      hasFocus,
    ].filter(Boolean).length

    return {
      stepsDone,
      total: 3,
      hasMinimum: stepsDone >= 2,
    }
  }, [
    ventureSummary,
    ventureProblem,
    ventureProgressLevel,
    mainTension,
    pathDecision,
    completedItems,
    priorities,
  ])

  function markChanged() {
    setShowResults(false)
    setSaveError('')
  }

  function updateStatus(itemId, status) {
    markChanged()

    setStatusByItem((current) => ({
      ...current,
      [itemId]: status,
    }))
  }

  function setPathwayOverride(stageId) {
    setSelectedStage(stageId)
    markChanged()
  }

  function togglePriority(key) {
    markChanged()

    setPriorities((current) => {
      if (current.includes(key)) {
        return current.filter((p) => p !== key)
      }
      if (current.length >= 3) {
        return [...current.slice(1), key]
      }
      return [...current, key]
    })
  }

  async function handleSaveAndContinue() {
    if (!user?.id) {
      setSaveError('Please sign in before saving your pathway.')
      return
    }

    setIsSaving(true)
    setSaveError('')

    try {
      const completedAt = new Date().toISOString()

      const nextAssessment = {
        declaredStage: recommendedStageId,
        diagnosedStage: stageDiagnosis.diagnosedStage
          ? legacyStageToPathway(stageDiagnosis.diagnosedStage)
          : recommendedStageId,
        statusByItem,
        productMaturity,
        customerStatus,
        revenuePattern,
        goToMarketRepeatability,
        teamStructure,
        fundingStage,
        priorities,
        blockers,
        completedActivities,
        ventureSummary,
        ventureProblem,
        ventureProgressLevel,
        recentProgress90Days,
        mainTension,
        pathDecision,
        notes,
        completedAt,
        averageScore,
        evidenceScorePercent: baselineScores.evidenceScorePercent,
        stageReadinessByStage: baselineScores.stageReadinessByStage,
        founderStageFromProgress: baselineScores.founderStageFromProgress,
        founderRecommendedAlignment: baselineScores.founderRecommendedAlignment,
        diagnosticRecommendedAlignment:
          baselineScores.diagnosticRecommendedAlignment,
        constraintSeverity: baselineScores.constraintSeverity,
      }

      setStageAssessment(nextAssessment)

      if (founderProfile) {
        updateFounderProfile({
          ...founderProfile,
          venturestage: getLegacyStageKey(recommendedStageId),
        })
      }

      setShowResults(true)

      navigate('/app/assessment', { replace: true })
    } catch (err) {
      console.error(err)
      setSaveError(
        err?.message ||
          'Your stage snapshot could not be saved. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

 function handleStartWorkshop() {
  navigate(
    `/app/academy?stage=${recommendedStageId}&workshop=${encodeURIComponent(
      recommendation.workshop,
    )}&view=workshop`,
  )
}

  function handleOpenAcademy() {
    navigate(`/app/academy?stage=${recommendedStageId}`)
  }

  const currentStepIndex = Math.max(
    STEPS.findIndex((step) => step.id === activeStep),
    0,
  )
  const currentStep = STEPS[currentStepIndex]

  const flowIndex = Math.max(
    FLOW.findIndex(
      (entry) => entry.stepId === activeStep && entry.pageId === activePageId,
    ),
    0,
  )

  const isLastPage = flowIndex === FLOW.length - 1

  const prevEntry = flowIndex > 0 ? FLOW[flowIndex - 1] : null
  const nextEntry = !isLastPage ? FLOW[flowIndex + 1] : null

  function labelForEntry(entry) {
    if (!entry) return ''
    const step = STEPS.find((item) => item.id === entry.stepId)
    return step ? step.label : ''
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function goToFlowIndex(index) {
    if (index < 0 || index >= FLOW.length) return

    const entry = FLOW[index]
    const stepIndex = STEPS.findIndex((step) => step.id === entry.stepId)

    setActiveStep(entry.stepId)
    setActivePageId(entry.pageId)
    setFurthestStepIndex((current) => Math.max(current, stepIndex))
    scrollToTop()
  }

  function goNext() {
    goToFlowIndex(flowIndex + 1)
  }

  function goBack() {
    goToFlowIndex(flowIndex - 1)
  }

  function goToStep(stepId) {
    const index = FLOW.findIndex((entry) => entry.stepId === stepId)
    if (index === -1) return
    goToFlowIndex(index)
  }

  const stepFooterProps = {
    flowIndex,
    prevLabel: labelForEntry(prevEntry),
    nextLabel: labelForEntry(nextEntry),
    isLastPage,
    isSaving,
    onBack: goBack,
    onNext: goNext,
    onSave: handleSaveAndContinue,
  }

  return (
    <div className="fade-up" style={{ width: '100%' }}>
      <StagePageTopBar
        averageScore={averageScore}
        baselineScores={baselineScores}
        recommendedStage={recommendedStage}
        recommendedStageId={recommendedStageId}
        activeStep={activeStep}
        onboardingCompletion={onboardingCompletion}
        completedEvidence={completedItems}
        strongEvidence={strongItems}
        furthestStepIndex={furthestStepIndex}
        currentStep={currentStep}
        onStepChange={goToStep}
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(320px, 1fr)',
          gap: 20,
          alignItems: 'start',
        }}
      >
        <main style={{ display: 'grid', gap: 12 }}>
          {activeStep === 'context' && activePageId === 'snapshot' && (
            <section className="p360-card" style={{ padding: 16 }}>
              <div className="p360-kicker" style={{ marginBottom: 6 }}>
                Venture snapshot (your words)
              </div>
              <p
                className="p360-body-sm"
                style={{ margin: '0 0 10px', fontSize: 13 }}
              >
                Start with your own interpretation. Keep answers short, clear,
                and focused on what is true for your venture today.
              </p>

              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--text)',
                  }}
                >
                  Describe your venture in one sentence.
                </label>
                <p
                  className="p360-body-sm"
                  style={{
                    margin: '0 0 8px',
                    fontSize: 12,
                    color: 'var(--text-soft)',
                  }}
                >
                  Use plain language. Imagine describing it to a smart friend in
                  another field.
                </p>
                <input
                  type="text"
                  value={ventureSummary}
                  onChange={(e) => {
                    setVentureSummary(e.target.value)
                    markChanged()
                  }}
                  placeholder="We help [who] [do what] so that [outcome]."
                  style={{
                    width: '100%',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    padding: '9px 11px',
                    fontSize: 13,
                  }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--text)',
                  }}
                >
                  What problem are you solving, for whom, and why now?
                </label>
                <p
                  className="p360-body-sm"
                  style={{
                    margin: '0 0 8px',
                    fontSize: 12,
                    color: 'var(--text-soft)',
                  }}
                >
                  Be specific about the customer group, their situation, and why
                  timing matters.
                </p>
                <textarea
                  value={ventureProblem}
                  onChange={(e) => {
                    setVentureProblem(e.target.value)
                    markChanged()
                  }}
                  rows={4}
                  placeholder="e.g. Health clinics struggle to see which interventions work for which patients. We focus on clinics with 5–20 staff who lack analytics tools but feel pressure to prove outcomes."
                  style={{
                    width: '100%',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    padding: '9px 11px',
                    fontSize: 13,
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--text)',
                  }}
                >
                  How far along are you today?
                </div>
                <p
                  className="p360-body-sm"
                  style={{ margin: '0 0 8px', fontSize: 12 }}
                >
                  Pick the option that best matches what exists now, not your
                  plan.
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 8,
                  }}
                >
                  {PROGRESS_LEVELS.map((level) => {
                    const active = ventureProgressLevel === level.id
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => {
                          setVentureProgressLevel(level.id)
                          markChanged()
                        }}
                        className="p360-card-soft"
                        style={{
                          padding: 9,
                          textAlign: 'left',
                          borderColor: active
                            ? 'var(--green-600)'
                            : 'var(--border)',
                          background: active
                            ? 'var(--green-050)'
                            : 'var(--surface-soft)',
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            marginBottom: 3,
                            color: active
                              ? 'var(--green-800)'
                              : 'var(--text)',
                          }}
                        >
                          {level.label}
                        </div>
                        <div
                          style={{
                            fontSize: 11.5,
                            color: 'var(--text-soft)',
                            lineHeight: 1.5,
                          }}
                        >
                          {level.description}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--text)',
                  }}
                >
                  What meaningful progress have you made in the last 90 days?
                </label>
                <p
                  className="p360-body-sm"
                  style={{
                    margin: '0 0 8px',
                    fontSize: 12,
                    color: 'var(--text-soft)',
                  }}
                >
                  Mention customer conversations, launches, revenue, or team
                  changes.
                </p>
                <textarea
                  value={recentProgress90Days}
                  onChange={(e) => {
                    setRecentProgress90Days(e.target.value)
                    markChanged()
                  }}
                  rows={3}
                  placeholder="e.g. Completed 12 customer interviews, launched a prototype with 3 clinics, and signed our first paid pilot."
                  style={{
                    width: '100%',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                    padding: '9px 11px',
                    fontSize: 13,
                    resize: 'vertical',
                  }}
                />
              </div>

              <StepFooterNav {...stepFooterProps} />
            </section>
          )}

          {activeStep === 'context' && activePageId === 'tension' && (
            <section className="p360-card" style={{ padding: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <div
                  style={{
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--text)',
                  }}
                >
                  Where does the work feel most stuck right now?
                </div>
                <p
                  className="p360-body-sm"
                  style={{ margin: '0 0 8px', fontSize: 12 }}
                >
                  Choose the tension that best matches your reality. This guides
                  your stage; it is not a score.
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 8,
                  }}
                >
                  {TENSIONS.map((tension) => {
                    const active = mainTension === tension.id
                    return (
                      <button
                        key={tension.id}
                        type="button"
                        onClick={() => {
                          setMainTension(tension.id)
                          markChanged()
                        }}
                        className="p360-card-soft"
                        style={{
                          padding: 9,
                          textAlign: 'left',
                          borderColor: active
                            ? 'var(--green-600)'
                            : 'var(--border)',
                          background: active
                            ? 'var(--green-050)'
                            : 'var(--surface-soft)',
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        {tension.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <div
                  style={{
                    marginBottom: 4,
                    fontSize: 13,
                    fontWeight: 800,
                    color: 'var(--text)',
                  }}
                >
                  If PATH360 ran a focused 2‑week sprint with you, what decision
                  should it help you make?
                </div>
                <p
                  className="p360-body-sm"
                  style={{ margin: '0 0 8px', fontSize: 12 }}
                >
                  Choose the decision that best matches what you want to resolve
                  next. This shapes your recommended workshop.
                </p>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: 8,
                  }}
                >
                  {DECISIONS.map((decision) => {
                    const active = pathDecision === decision.id
                    return (
                      <button
                        key={decision.id}
                        type="button"
                        onClick={() => {
                          setPathDecision(decision.id)
                          markChanged()
                        }}
                        className="p360-card-soft"
                        style={{
                          padding: 9,
                          textAlign: 'left',
                          borderColor: active
                            ? 'var(--green-600)'
                            : 'var(--border)',
                          background: active
                            ? 'var(--green-050)'
                            : 'var(--surface-soft)',
                          cursor: 'pointer',
                          fontSize: 12,
                        }}
                      >
                        {decision.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <StepFooterNav {...stepFooterProps} />
            </section>
          )}

          {activeStep === 'evidence' && activePageId === 'evidence' && (
            <section className="p360-card" style={{ padding: 16 }}>
              <div className="p360-kicker" style={{ marginBottom: 6 }}>
                Venture evidence snapshot
              </div>
              <p
                className="p360-body-sm"
                style={{ margin: '0 0 10px', fontSize: 13 }}
              >
                Mark where you have strong proof, where work is in motion, and
                where you have not yet started. This clarifies your stage and
                prevents PATH360 from asking you to repeat work you have already
                done.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 10,
                }}
              >
                {ITEMS.map((item) => {
                  const status = statusByItem[item.id]
                  return (
                    <div
                      key={item.id}
                      className="p360-card-soft"
                      style={{ padding: 10 }}
                    >
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          marginBottom: 4,
                          color: 'var(--text)',
                        }}
                      >
                        {item.label}
                      </div>
                      <p
                        style={{
                          margin: '0 0 8px',
                          fontSize: 12,
                          color: 'var(--text-soft)',
                          lineHeight: 1.55,
                        }}
                      >
                        {item.description}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 6,
                        }}
                      >
                        {STATUS_OPTIONS.map((option) => {
                          const active = status === option.id
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() =>
                                updateStatus(item.id, option.id)
                              }
                              style={{
                                padding: '5px 8px',
                                borderRadius: 999,
                                border: active
                                  ? '1px solid var(--green-700)'
                                  : '1px solid var(--border)',
                                background: active
                                  ? 'var(--green-050)'
                                  : 'var(--surface)',
                                color: active
                                  ? 'var(--green-800)'
                                  : 'var(--text-soft)',
                                fontSize: 11,
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              {option.shortLabel}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              <StepFooterNav {...stepFooterProps} />
            </section>
          )}

          {activeStep === 'focus' && activePageId === 'focus' && (
            <section className="p360-card" style={{ padding: 16 }}>
              <div className="p360-kicker" style={{ marginBottom: 6 }}>
                Near-term priorities
              </div>
              <p
                className="p360-body-sm"
                style={{ margin: '0 0 10px', fontSize: 13 }}
              >
                Pick up to three priorities that matter most over the next 3–6
                months. Start with one if you are unsure; you can update this as
                your evidence changes.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 8,
                }}
              >
                {PRIORITIES.map(([id, label]) => {
                  const active = priorities.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => togglePriority(id)}
                      className="p360-card-soft"
                      style={{
                        padding: 9,
                        textAlign: 'left',
                        borderColor: active
                          ? 'var(--green-600)'
                          : 'var(--border)',
                        background: active
                          ? 'var(--green-050)'
                          : 'var(--surface-soft)',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>

              <div style={{ marginTop: 14 }}>
                <div className="p360-kicker" style={{ marginBottom: 6 }}>
                  Notes for PATH360
                </div>
                <p
                  className="p360-body-sm"
                  style={{ margin: '0 0 8px', maxWidth: 560, fontSize: 12.5 }}
                >
                  Add any specific context, constraints, or ambitions you want
                  PATH360 and the AI Strategist to keep in mind when guiding
                  your work.
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    markChanged()
                  }}
                  rows={4}
                  className="p360-textarea"
                  placeholder="e.g. We are pre-seed with 9 months of runway and need to prove recurring demand before raising again."
                />
              </div>

              <StepFooterNav {...stepFooterProps} />
            </section>
          )}

          {saveError ? (
            <div
              style={{
                padding: 10,
                borderRadius: 10,
                border: '1px solid rgba(139,32,32,0.3)',
                background: '#FDEAEA',
                color: '#8B2020',
                fontSize: 12.5,
                lineHeight: 1.6,
              }}
            >
              {saveError}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
              padding: '0 2px',
            }}
          >
            <div
              style={{
                fontSize: 11.5,
                color: 'var(--text-faint)',
                lineHeight: 1.5,
                maxWidth: 460,
              }}
            >
              {showResults
                ? 'Baseline saved. You can refresh it any time your evidence changes.'
                : `${onboardingCompletion.stepsDone} of ${onboardingCompletion.total} answers captured. Save once you reach the end of Step 03.`}
            </div>

            <button
              type="button"
              className="p360-btn-ghost"
              onClick={() => setShowPathways(true)}
              style={{ fontSize: 12 }}
            >
              Browse all stages
            </button>
          </div>

        </main>

        <RecommendationPanel
          recommendedStage={recommendedStage}
          selectedStage={selectedStageData}
          recommendation={recommendation}
          pathwayReason={pathwayReason}
          completedEvidence={completedItems}
          prioritiesCount={priorities.length}
          focusAreas={focusAreas}
          evidenceScorePercent={baselineScores.evidenceScorePercent}
          readinessScore={
            baselineScores.stageReadinessByStage?.[recommendedStageId]?.score ??
            0
          }
          alignmentScore={baselineScores.founderRecommendedAlignment ?? 0}
          onExplorePathways={() => setShowPathways(true)}
          onStartWorkshop={handleStartWorkshop}
          onOpenAcademy={handleOpenAcademy}
        />
      </div>

      {showPathways && (
        <PathwayModal
          open={showPathways}
          selectedStage={selectedStage}
          recommendedStageId={recommendedStageId}
          onClose={() => setShowPathways(false)}
          onSelectStage={setPathwayOverride}
        />
      )}
    </div>
  )
}