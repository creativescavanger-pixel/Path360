import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { scoreVentureBaseline } from '../lib/stageScoring.js'
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
      'You have spoken to, tested with, or sold to real target customers.',
  },
  {
    id: 'solution',
    label: 'Solution readiness',
    description:
      'You have a concept, prototype, MVP, or working product.',
  },
  {
    id: 'business',
    label: 'Business model',
    description:
      'You understand how the venture can make money and what drives its economics.',
  },
  {
    id: 'traction',
    label: 'Market traction',
    description:
      'You have meaningful usage, pilots, revenue, retention, or growth signals.',
  },
  {
    id: 'team',
    label: 'Team readiness',
    description:
      'You have the people, capabilities, or hiring plan needed for the next stage.',
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
    label: 'Not started',
    shortLabel: 'Not started',
    score: 0,
  },
  {
    id: 'early',
    label: 'Early progress',
    shortLabel: 'Early',
    score: 1,
  },
  {
    id: 'active',
    label: 'Actively working',
    shortLabel: 'Active',
    score: 2,
  },
  {
    id: 'strong',
    label: 'Strong evidence',
    shortLabel: 'Strong',
    score: 3,
  },
]

const PRIORITIES = [
  ['clarify_problem', 'Clarify my problem and customer'],
  ['validate_demand', 'Validate demand with real users'],
  ['improve_product', 'Improve my product or offer'],
  ['gain_traction', 'Gain customers and traction'],
  ['growth_systems', 'Build growth systems'],
  ['financial_model', 'Strengthen pricing and financial model'],
  ['investor_readiness', 'Prepare for investors'],
  ['team_operations', 'Build team and operations'],
  ['founder_development', 'Develop myself as a founder'],
]

const SITUATIONS = [
  {
    id: 'no_idea',
    label: 'I do not yet know what venture or opportunity to pursue',
    stage: 'discover',
  },
  {
    id: 'several_opportunities',
    label: 'I have several possible opportunities and need to compare them',
    stage: 'discover',
  },
  {
    id: 'one_opportunity',
    label:
      'I have one opportunity but need to understand the customer problem',
    stage: 'explore',
  },
  {
    id: 'testing',
    label:
      'I am testing customer demand, a prototype, or willingness to pay',
    stage: 'test',
  },
  {
    id: 'building',
    label:
      'I am preparing the model, operations, legal foundations, or launch',
    stage: 'build',
  },
  {
    id: 'launched',
    label: 'I have launched and need to improve market execution',
    stage: 'launch',
  },
  {
    id: 'growing',
    label:
      'I am improving growth, retention, systems, team, or economics',
    stage: 'grow',
  },
  {
    id: 'expanding',
    label:
      'I am considering a new market, customer segment, product, channel, or partner',
    stage: 'expand',
  },
  {
    id: 'optimising',
    label:
      'I am improving operations, governance, profitability, or resilience',
    stage: 'optimise',
  },
  {
    id: 'transitioning',
    label:
      'I am preparing for succession, sale, acquisition, merger, or ownership change',
    stage: 'transition',
  },
]

const DECISIONS = [
  {
    id: 'choose_opportunity',
    label: 'What opportunity should I investigate?',
    stage: 'discover',
  },
  {
    id: 'understand_problem',
    label: 'Which customer problem and segment should I focus on?',
    stage: 'explore',
  },
  {
    id: 'test_assumptions',
    label: 'What should I test next?',
    stage: 'test',
  },
  {
    id: 'build_model',
    label: 'What should I build and how should the venture work?',
    stage: 'build',
  },
  {
    id: 'launch_offer',
    label: 'How should I launch, sell, deliver, and learn?',
    stage: 'launch',
  },
  {
    id: 'grow_venture',
    label:
      'How should I improve growth, retention, economics, and systems?',
    stage: 'grow',
  },
  {
    id: 'expand_venture',
    label: 'Is expansion worthwhile and feasible?',
    stage: 'expand',
  },
  {
    id: 'optimise_venture',
    label: 'How should I strengthen the business and its resilience?',
    stage: 'optimise',
  },
  {
    id: 'transition_venture',
    label: 'How should I prepare for a future transition?',
    stage: 'transition',
  },
]

const CONSTRAINTS = [
  'Customer access',
  'Time available',
  'Capital available',
  'Founder or team capability',
  'Regulation or compliance',
  'Country or cross-border context',
  'Supplier, partner, or distribution access',
  'No significant constraint right now',
]

const WORKSHOP_RECOMMENDATIONS = {
  discover: {
    workshop: 'Opportunity Discovery',
    reason:
      'You are still exploring direction, comparing possibilities, or building early customer and environment evidence before choosing one opportunity.',
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
      'Your immediate work is bringing a prepared offer to market with a clear go-to-market plan, customer onboarding, delivery, feedback, and cash discipline.',
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
      'You are working on repeatability: retention, segments, channels, pricing, unit economics, systems, team, leadership, and disciplined growth decisions.',
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
      'You are assessing a new country, customer segment, product, channel, or partner and need a deliberate evidence, localisation, regulation, and economics route.',
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
      'You are strengthening the operating company through governance, reporting, profitability, quality, risk, process improvement, controls, and resilience.',
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
      'You are preparing the company and owner for succession, sale, merger, acquisition, ownership change, or another transition decision.',
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
  return (
    PATHWAY_STAGES.find((stage) => stage.id === stageId) ||
    PATHWAY_STAGES[0]
  )
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
    currentSituation: assessment?.currentSituation || '',
    currentDecision: assessment?.currentDecision || '',
    primaryConstraint: assessment?.primaryConstraint || '',
    notes: assessment?.notes || '',
    completedAt: assessment?.completedAt || null,
    averageScore: Number(assessment?.averageScore || 0),
  }
}

function getSituationStage(situationId) {
  return SITUATIONS.find((item) => item.id === situationId)?.stage || ''
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
  currentSituation,
  currentDecision,
  evidenceSuggestedStage,
  scoreSuggestedStage,
}) {
  if (selectedStage) return selectedStage

  const decisionStage = getDecisionStage(currentDecision)
  if (decisionStage) return decisionStage

  const situationStage = getSituationStage(currentSituation)
  if (situationStage) return situationStage

  return evidenceSuggestedStage || scoreSuggestedStage || 'discover'
}

function getPathwayReason({
  selectedStage,
  currentSituation,
  currentDecision,
  evidenceSuggestedStage,
  scoreSuggestedStage,
  primaryConstraint,
}) {
  const reasonParts = []

  if (selectedStage) {
    reasonParts.push(
      'You chose this stage as the most useful context for your current work.',
    )
  }

  const situation = SITUATIONS.find(
    (item) => item.id === currentSituation,
  )
  if (situation?.label) {
    reasonParts.push(`Current situation: ${situation.label}.`)
  }

  const decision = DECISIONS.find(
    (item) => item.id === currentDecision,
  )
  if (decision?.label) {
    reasonParts.push(`Current decision: ${decision.label}.`)
  }

  if (!selectedStage && evidenceSuggestedStage) {
    const evidenceStage = getStage(evidenceSuggestedStage)
    reasonParts.push(
      `Your product, customer, revenue, and reach signals currently point most strongly toward Stage ${evidenceStage.number} · ${evidenceStage.title}.`,
    )
  }

  if (!selectedStage && scoreSuggestedStage) {
    const scoreStage = getStage(scoreSuggestedStage)
    reasonParts.push(
      `Your wider evidence snapshot is most aligned with Stage ${scoreStage.number} · ${scoreStage.title}.`,
    )
  }

  if (primaryConstraint) {
    reasonParts.push(`Main constraint to keep in view: ${primaryConstraint}.`)
  }

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

export default function StageOnboarding() {
  const navigate = useNavigate()

  const user = useDiagnosticStore((state) => state.user)
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const stageAssessment = useDiagnosticStore((state) => state.stageAssessment)
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
  const [currentSituation, setCurrentSituation] = useState(
    existing.currentSituation,
  )
  const [currentDecision, setCurrentDecision] = useState(
    existing.currentDecision,
  )
  const [primaryConstraint, setPrimaryConstraint] = useState(
    existing.primaryConstraint,
  )

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
    setCurrentSituation(next.currentSituation)
    setCurrentDecision(next.currentDecision)
    setPrimaryConstraint(next.primaryConstraint)
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
        currentSituation,
        currentDecision,
        evidenceSuggestedStage,
        scoreSuggestedStage,
      }),
    [
      selectedStage,
      currentSituation,
      currentDecision,
      evidenceSuggestedStage,
      scoreSuggestedStage,
    ],
  )

  const recommendedStage = getStage(recommendedStageId)
  const selectedStageData = selectedStage ? getStage(selectedStage) : null
  const recommendation = WORKSHOP_RECOMMENDATIONS[recommendedStageId]
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
        currentSituation,
        currentDecision,
        evidenceSuggestedStage,
        scoreSuggestedStage,
        primaryConstraint,
      }),
    [
      selectedStage,
      currentSituation,
      currentDecision,
      evidenceSuggestedStage,
      scoreSuggestedStage,
      primaryConstraint,
    ],
  )

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

  function handleReset() {
    setSelectedStage('')
    setStatusByItem(createEmptyStatuses())
    setNotes('')
    setSaveError('')
    setShowResults(false)
    setProductMaturity('')
    setCustomerStatus('')
    setRevenuePattern('')
    setGoToMarketRepeatability('')
    setTeamStructure('')
    setFundingStage('')
    setPriorities([])
    setBlockers([])
    setCompletedActivities([])
    setCurrentSituation('')
    setCurrentDecision('')
    setPrimaryConstraint('')
  }

  function togglePriority(priorityId) {
    markChanged()

    setPriorities((current) => {
      if (current.includes(priorityId)) {
        return current.filter((value) => value !== priorityId)
      }

      if (current.length >= 3) {
        return current
      }

      return [...current, priorityId]
    })
  }

  async function handleComplete() {
    setSaveError('')

    if (
      !productMaturity ||
      !customerStatus ||
      !revenuePattern ||
      !goToMarketRepeatability
    ) {
      setSaveError(
        'Complete the venture reality questions for product, customer, revenue, and customer acquisition before continuing.',
      )
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const finalStageId = selectedStage || recommendedStageId
    const finalStage = getStage(finalStageId)
    const legacyStageKey = getLegacyStageKey(finalStageId)

    const assessment = {
      declaredStage: finalStageId,
      diagnosedStage: recommendedStageId,
      legacyDeclaredStage: legacyStageKey,
      legacyDiagnosedStage: getLegacyStageKey(recommendedStageId),
      statusByItem,
      notes: notes.trim(),
      averageScore,
      completedAt: new Date().toISOString(),
      productMaturity,
      customerStatus,
      revenuePattern,
      goToMarketRepeatability,
      teamStructure,
      fundingStage,
      priorities,
      blockers,
      completedActivities,
      currentSituation,
      currentDecision,
      primaryConstraint,
      pathwayReason,
      recommendedWorkshop: recommendation.workshop,
      recommendedModules: recommendation.modules,
      recommendedStageLabel: `Stage ${recommendedStage.number} · ${recommendedStage.title}`,
      stageScore: stageDiagnosis.stageScore,
      stageConfidence: 'evidence-informed pathway recommendation',
      stageReasons: [
        pathwayReason || recommendation.reason,
        ...stageDiagnosis.stageReasons,
      ].filter(Boolean),
      recommendedAcademyPath: recommendedStageId,
      legacyRecommendedAcademyPath: getLegacyStageKey(recommendedStageId),
      recommendedMissionKeys: stageDiagnosis.recommendedMissionKeys,
      priorityScores: stageDiagnosis.priorityScores,
      stageBrief: `PATH360 recommends Stage ${recommendedStage.number} · ${recommendedStage.title}: ${recommendation.reason}`,
      pathwayStage: finalStage.id,
    }

    setIsSaving(true)

    try {
      setStageAssessment(assessment)

      if (user?.id) {
        try {
          await updateFounderProfile({
            ...(founderProfile || {}),
            venturestage: finalStageId,
            legacyventurestage: legacyStageKey,
          })
        } catch (profileError) {
          console.warn(
            'Founder pathway was saved, but the profile update failed.',
            profileError,
          )
        }
      }

      setShowResults(true)

      window.setTimeout(() => {
        document
          .getElementById('pathway-results')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (error) {
      console.error('Failed to save founder pathway', error)

      setSaveError(
        'We could not save your founder pathway. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  function goToDashboard() {
    navigate('/app/dashboard')
  }

  function goToAssessment() {
    navigate('/app/assessment')
  }

  function startWorkshop() {
    navigate(`/app/academy?stage=${recommendedStageId}`)
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 1120,
        margin: '0 auto',
        padding: '8px 0 48px',
      }}
    >
      <section
        className="p360-panel"
        style={{
          marginBottom: 18,
          padding: '24px',
          background: 'var(--surface-soft)',
        }}
      >
        <div className="p360-kicker" style={{ marginBottom: 8 }}>
          Founder pathway
        </div>

        <h1
          style={{
            margin: 0,
            color: 'var(--text)',
            fontSize: 27,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
          }}
        >
          Find the founder work that matters most next
        </h1>

        <p
          className="p360-body"
          style={{
            maxWidth: 760,
            margin: '9px 0 0',
            fontSize: 13.5,
          }}
        >
          PATH360 uses your venture reality, evidence, decision, and
          constraints to recommend a useful starting pathway. You can start
          anywhere, revisit earlier work, and explore every stage whenever it
          helps.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 18,
          }}
        >
          <button
            type="button"
            className="p360-btn-primary"
            onClick={() =>
              document
                .getElementById('all-pathways')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          >
            Explore all stages
          </button>

          {showResults ? (
            <button
              type="button"
              className="p360-btn-secondary"
              onClick={() => setShowResults(false)}
            >
              Review my pathway
            </button>
          ) : null}
        </div>
      </section>

      {!showResults ? (
        <div className="p360-stack-16">
          <section className="p360-card" style={{ padding: 22 }}>
            <div className="p360-kicker" style={{ marginBottom: 6 }}>
              Step 1 of 5
            </div>

            <h2 className="p360-title-md">Your current venture context</h2>

            <p className="p360-body-sm" style={{ margin: '6px 0 16px' }}>
              You can choose a stage directly, but this context helps PATH360
              recommend the most useful route and explain why.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(225px, 1fr))',
                gap: 10,
              }}
            >
              {PATHWAY_STAGES.map((stage) => {
                const selected = selectedStage === stage.id

                return (
                  <button
                    key={stage.id}
                    type="button"
                    className="p360-card-soft"
                    onClick={() => {
                      setSelectedStage(stage.id)
                      markChanged()
                    }}
                    aria-pressed={selected}
                    style={{
                      minHeight: 112,
                      padding: 14,
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderColor: selected
                        ? 'var(--green-600)'
                        : 'var(--border)',
                      background: selected
                        ? 'var(--green-050)'
                        : 'var(--surface)',
                      boxShadow: selected
                        ? '0 0 0 3px rgba(44, 111, 80, 0.08)'
                        : 'none',
                    }}
                  >
                    <span
                      style={{
                        display: 'grid',
                        width: 28,
                        height: 28,
                        placeItems: 'center',
                        borderRadius: 9,
                        background: selected
                          ? 'var(--green-700)'
                          : 'var(--surface-muted)',
                        color: selected
                          ? 'var(--white)'
                          : 'var(--text-soft)',
                        fontSize: 10.5,
                        fontWeight: 800,
                      }}
                    >
                      {stage.number}
                    </span>

                    <span
                      style={{
                        display: 'block',
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
                    </span>

                    <span
                      style={{
                        display: 'block',
                        marginTop: 4,
                        color: 'var(--text-soft)',
                        fontSize: 11.5,
                        lineHeight: 1.45,
                      }}
                    >
                      {stage.focus}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="p360-card" style={{ padding: 22 }}>
            <div className="p360-kicker" style={{ marginBottom: 6 }}>
              Step 2 of 5
            </div>

            <h2 className="p360-title-md">Your current situation</h2>

            <p className="p360-body-sm" style={{ margin: '6px 0 16px' }}>
              Select the description that is most accurate today. This does not
              lock your journey; it simply helps PATH360 recommend useful work.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 10,
              }}
            >
              {SITUATIONS.map((situation) => {
                const selected = currentSituation === situation.id

                return (
                  <button
                    key={situation.id}
                    type="button"
                    className="p360-card-soft"
                    onClick={() => {
                      setCurrentSituation(situation.id)
                      markChanged()
                    }}
                    aria-pressed={selected}
                    style={{
                      padding: '13px 14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderColor: selected
                        ? 'var(--green-600)'
                        : 'var(--border)',
                      background: selected
                        ? 'var(--green-050)'
                        : 'var(--surface)',
                      boxShadow: selected
                        ? '0 0 0 3px rgba(44, 111, 80, 0.08)'
                        : 'none',
                    }}
                  >
                    <span
                      style={{
                        color: selected
                          ? 'var(--green-800)'
                          : 'var(--text)',
                        fontSize: 13,
                        fontWeight: 750,
                        lineHeight: 1.4,
                      }}
                    >
                      {situation.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="p360-card" style={{ padding: 22 }}>
            <div className="p360-kicker" style={{ marginBottom: 6 }}>
              Step 3 of 5
            </div>

            <h2 className="p360-title-md">Your current venture reality</h2>

            <p className="p360-body-sm" style={{ margin: '6px 0 16px' }}>
              Choose the most accurate statement for each area. These explicit
              signals help PATH360 make an evidence-informed recommendation.
            </p>

            <div className="p360-grid-2">
              <div>
                <label className="p360-label" htmlFor="product-maturity">
                  Product maturity
                </label>

                <select
                  id="product-maturity"
                  className="p360-select"
                  value={productMaturity}
                  onChange={(event) => {
                    setProductMaturity(event.target.value)
                    markChanged()
                  }}
                >
                  <option value="">Choose one</option>
                  <option value="idea">
                    I am exploring a problem or idea
                  </option>
                  <option value="prototype">
                    I have a prototype or early concept
                  </option>
                  <option value="live_early">
                    I have a live offer with early users
                  </option>
                  <option value="live_growing">
                    I have a live offer with growing usage
                  </option>
                  <option value="repeatable">
                    I have a repeatable product or service model
                  </option>
                </select>
              </div>

              <div>
                <label className="p360-label" htmlFor="customer-status">
                  Strongest customer signal
                </label>

                <select
                  id="customer-status"
                  className="p360-select"
                  value={customerStatus}
                  onChange={(event) => {
                    setCustomerStatus(event.target.value)
                    markChanged()
                  }}
                >
                  <option value="">Choose one</option>
                  <option value="none">
                    I have not yet spoken to potential customers
                  </option>
                  <option value="conversations">
                    I have informal customer conversations
                  </option>
                  <option value="interviews">
                    I have conducted structured interviews
                  </option>
                  <option value="pilots">
                    I am running a pilot or test
                  </option>
                  <option value="first_paying">
                    I have first paying customers
                  </option>
                  <option value="recurring_customers">
                    I have recurring customers or repeat usage
                  </option>
                </select>
              </div>

              <div>
                <label className="p360-label" htmlFor="revenue-pattern">
                  Revenue pattern
                </label>

                <select
                  id="revenue-pattern"
                  className="p360-select"
                  value={revenuePattern}
                  onChange={(event) => {
                    setRevenuePattern(event.target.value)
                    markChanged()
                  }}
                >
                  <option value="">Choose one</option>
                  <option value="none">No revenue yet</option>
                  <option value="pilot">Pre-revenue or paid pilot</option>
                  <option value="one_off">
                    One-off or occasional revenue
                  </option>
                  <option value="recurring">Recurring revenue</option>
                  <option value="predictable">
                    Predictable and growing revenue
                  </option>
                </select>
              </div>

              <div>
                <label className="p360-label" htmlFor="go-to-market">
                  Customer acquisition / reach
                </label>

                <select
                  id="go-to-market"
                  className="p360-select"
                  value={goToMarketRepeatability}
                  onChange={(event) => {
                    setGoToMarketRepeatability(event.target.value)
                    markChanged()
                  }}
                >
                  <option value="">Choose one</option>
                  <option value="none">
                    I have not tested a customer-acquisition approach
                  </option>
                  <option value="manual">
                    Mostly founder-led and manual outreach
                  </option>
                  <option value="emerging">
                    An early channel or process is showing promise
                  </option>
                  <option value="repeatable">
                    I have a repeatable acquisition motion
                  </option>
                </select>
              </div>

              <div>
                <label className="p360-label" htmlFor="team-structure">
                  Team structure
                </label>

                <select
                  id="team-structure"
                  className="p360-select"
                  value={teamStructure}
                  onChange={(event) => {
                    setTeamStructure(event.target.value)
                    markChanged()
                  }}
                >
                  <option value="">Choose one, if relevant</option>
                  <option value="solo">
                    I am building primarily as a solo founder
                  </option>
                  <option value="cofounders">
                    I have co-founders or a core founding team
                  </option>
                  <option value="contractors">
                    I work with contractors, advisers, or collaborators
                  </option>
                  <option value="early_team">
                    I have an early operating team
                  </option>
                  <option value="scaling_team">
                    I am building or leading a growing team
                  </option>
                </select>
              </div>

              <div>
                <label className="p360-label" htmlFor="funding-stage">
                  Capital position
                </label>

                <select
                  id="funding-stage"
                  className="p360-select"
                  value={fundingStage}
                  onChange={(event) => {
                    setFundingStage(event.target.value)
                    markChanged()
                  }}
                >
                  <option value="">Choose one, if relevant</option>
                  <option value="bootstrapping">
                    Bootstrapping or self-funded
                  </option>
                  <option value="grants">
                    Exploring grants, programmes, or non-dilutive support
                  </option>
                  <option value="friends_family">
                    Friends, family, or community capital
                  </option>
                  <option value="pre_seed">
                    Preparing for pre-seed or angel funding
                  </option>
                  <option value="seed_plus">
                    Raising or managing institutional capital
                  </option>
                  <option value="not_relevant">
                    Capital is not a current focus
                  </option>
                </select>
              </div>
            </div>
          </section>

          <section className="p360-card" style={{ padding: 22 }}>
            <div className="p360-kicker" style={{ marginBottom: 6 }}>
              Step 4 of 5
            </div>

            <h2 className="p360-title-md">
              Evidence and priorities snapshot
            </h2>

            <p className="p360-body-sm" style={{ margin: '6px 0 18px' }}>
              This is not a pass/fail test. It helps PATH360 distinguish what
              you know, what you are actively working on, and what still needs
              evidence.
            </p>

            <div className="p360-stack-12">
              {ITEMS.map((item) => {
                const activeStatus = statusByItem[item.id]
                const activeOption = STATUS_OPTIONS.find(
                  (option) => option.id === activeStatus,
                )

                return (
                  <div
                    key={item.id}
                    className="p360-card-soft"
                    style={{ padding: 16 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: 'var(--text)',
                            fontSize: 13,
                            fontWeight: 800,
                          }}
                        >
                          {item.label}
                        </div>

                        <p
                          style={{
                            maxWidth: 700,
                            margin: '4px 0 0',
                            color: 'var(--text-soft)',
                            fontSize: 11.5,
                            lineHeight: 1.52,
                          }}
                        >
                          {item.description}
                        </p>
                      </div>

                      <span className="p360-tag-learning">
                        {activeOption?.shortLabel || 'Not started'}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                      }}
                    >
                      {STATUS_OPTIONS.map((option) => {
                        const selected = activeStatus === option.id

                        return (
                          <button
                            key={option.id}
                            type="button"
                            className={
                              selected
                                ? 'p360-btn-primary'
                                : 'p360-btn-secondary'
                            }
                            onClick={() => updateStatus(item.id, option.id)}
                            aria-pressed={selected}
                            style={{
                              minHeight: 34,
                              padding: '0 10px',
                              fontSize: 11.5,
                            }}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              style={{
                marginTop: 22,
                paddingTop: 20,
                borderTop: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      color: 'var(--text)',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    Priorities for the next 14 days
                  </div>

                  <p
                    className="p360-body-sm"
                    style={{ margin: '4px 0 0' }}
                  >
                    Select up to three priorities. They help focus Academy,
                    AI Strategist, and recommended founder work.
                  </p>
                </div>

                <span className="p360-tag-learning">
                  {priorities.length}/3 selected
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                  marginTop: 14,
                }}
              >
                {PRIORITIES.map(([priorityId, label]) => {
                  const selected = priorities.includes(priorityId)

                  return (
                    <button
                      key={priorityId}
                      type="button"
                      className={
                        selected ? 'p360-btn-primary' : 'p360-btn-secondary'
                      }
                      onClick={() => togglePriority(priorityId)}
                      aria-pressed={selected}
                      style={{
                        minHeight: 36,
                        padding: '0 11px',
                        fontSize: 11.5,
                      }}
                    >
                      {label}
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          <section className="p360-card" style={{ padding: 22 }}>
            <div className="p360-kicker" style={{ marginBottom: 6 }}>
              Step 5 of 5
            </div>

            <h2 className="p360-title-md">Decision and context</h2>

            <p className="p360-body-sm" style={{ margin: '6px 0 16px' }}>
              Help PATH360 connect your current reality to the decision you
              need to make next. These answers refine the recommendation but
              never limit your access to other pathways.
            </p>

            <div className="p360-grid-2">
              <div>
                <label className="p360-label" htmlFor="current-situation">
                  Current situation
                </label>

                <select
                  id="current-situation"
                  className="p360-select"
                  value={currentSituation}
                  onChange={(event) => {
                    setCurrentSituation(event.target.value)
                    markChanged()
                  }}
                >
                  <option value="">Choose one, if relevant</option>
                  {SITUATIONS.map((situation) => (
                    <option key={situation.id} value={situation.id}>
                      {situation.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="p360-label" htmlFor="current-decision">
                  Current decision
                </label>

                <select
                  id="current-decision"
                  className="p360-select"
                  value={currentDecision}
                  onChange={(event) => {
                    setCurrentDecision(event.target.value)
                    markChanged()
                  }}
                >
                  <option value="">Choose one, if relevant</option>
                  {DECISIONS.map((decision) => (
                    <option key={decision.id} value={decision.id}>
                      {decision.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="p360-label" htmlFor="primary-constraint">
                  Main constraint
                </label>

                <select
                  id="primary-constraint"
                  className="p360-select"
                  value={primaryConstraint}
                  onChange={(event) => {
                    setPrimaryConstraint(event.target.value)
                    markChanged()
                  }}
                >
                  <option value="">Choose one, if relevant</option>
                  {CONSTRAINTS.map((constraint) => (
                    <option key={constraint} value={constraint}>
                      {constraint}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="p360-label" htmlFor="blockers">
                  Current blocker
                </label>

                <input
                  id="blockers"
                  className="p360-input"
                  value={blockers[0] || ''}
                  onChange={(event) => {
                    setBlockers(
                      event.target.value.trim() ? [event.target.value] : [],
                    )
                    markChanged()
                  }}
                  placeholder="For example: no reliable access to target customers"
                />
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="p360-label" htmlFor="completed-activities">
                Work already completed
              </label>

              <input
                id="completed-activities"
                className="p360-input"
                value={completedActivities.join(', ')}
                onChange={(event) => {
                  setCompletedActivities(
                    event.target.value
                      .split(',')
                      .map((value) => value.trim())
                      .filter(Boolean),
                  )
                  markChanged()
                }}
                placeholder="For example: 14 customer interviews, clickable prototype, market review"
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="p360-label" htmlFor="pathway-notes">
                Anything else PATH360 should keep in view
              </label>

              <textarea
                id="pathway-notes"
                className="p360-textarea"
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value)
                  markChanged()
                }}
                placeholder="For example: We have a clickable prototype, 14 customer interviews, and plan to launch a paid pilot this quarter."
              />
            </div>
          </section>

          {saveError ? (
            <div
              role="alert"
              style={{
                padding: '12px 14px',
                border: '1px solid rgba(139, 32, 32, 0.22)',
                borderRadius: 12,
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                fontSize: 12.5,
                lineHeight: 1.5,
              }}
            >
              {saveError}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              className="p360-btn-ghost"
              onClick={handleReset}
              disabled={isSaving}
            >
              Reset answers
            </button>

            <button
              type="button"
              className="p360-btn-primary"
              onClick={handleComplete}
              disabled={isSaving}
            >
              {isSaving
                ? 'Saving pathway…'
                : 'See my recommended starting point'}
            </button>
          </div>
        </div>
      ) : (
        <section
          id="pathway-results"
          className="p360-panel"
          style={{ padding: 24 }}
        >
          <div className="p360-kicker" style={{ marginBottom: 7 }}>
            Your recommended starting point
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: 720 }}>
              <h2
                style={{
                  margin: 0,
                  color: 'var(--text)',
                  fontSize: 26,
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1.12,
                }}
              >
                Stage {recommendedStage.number} · {recommendedStage.title}
              </h2>

              <p
                className="p360-body"
                style={{ margin: '9px 0 0', fontSize: 13.5 }}
              >
                {recommendation.reason}
              </p>
            </div>

            <span className="p360-tag-learning">
              Recommended workshop · {recommendation.workshop}
            </span>
          </div>

          <div
            className="p360-grid-3"
            style={{ marginTop: 20 }}
          >
            <div className="p360-card-soft" style={{ padding: 16 }}>
              <div className="p360-kicker" style={{ marginBottom: 6 }}>
                Evidence snapshot
              </div>

              <div
                style={{
                  color: 'var(--text)',
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                }}
              >
                {completedItems}/7
              </div>

              <p
                className="p360-body-sm"
                style={{ margin: '5px 0 0', fontSize: 11.5 }}
              >
                Evidence areas actively in motion
              </p>
            </div>

            <div className="p360-card-soft" style={{ padding: 16 }}>
              <div className="p360-kicker" style={{ marginBottom: 6 }}>
                Strong evidence
              </div>

              <div
                style={{
                  color: 'var(--text)',
                  fontSize: 19,
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                }}
              >
                {strongItems}
              </div>

              <p
                className="p360-body-sm"
                style={{ margin: '5px 0 0', fontSize: 11.5 }}
              >
                Areas you describe as evidence-backed
              </p>
            </div>

            <div className="p360-card-soft" style={{ padding: 16 }}>
              <div className="p360-kicker" style={{ marginBottom: 6 }}>
                Your declared context
              </div>

              <div
                style={{
                  color: 'var(--text)',
                  fontSize: 15,
                  fontWeight: 800,
                  lineHeight: 1.3,
                }}
              >
                {selectedStageData
                  ? `Stage ${selectedStageData.number} · ${selectedStageData.title}`
                  : 'PATH360 recommendation'}
              </div>

              <p
                className="p360-body-sm"
                style={{ margin: '5px 0 0', fontSize: 11.5 }}
              >
                You can change this or enter any other pathway later.
              </p>
            </div>
          </div>

          <div
            className="p360-grid-2"
            style={{ marginTop: 20 }}
          >
            <div
              className="p360-card-soft"
              style={{
                padding: 18,
                background: 'var(--green-050)',
              }}
            >
              <div className="p360-kicker" style={{ marginBottom: 6 }}>
                Why PATH360 recommends this
              </div>

              <p
                className="p360-body-sm"
                style={{ margin: 0, fontSize: 12.5 }}
              >
                {pathwayReason || recommendation.reason}
              </p>
            </div>

            <div className="p360-card-soft" style={{ padding: 18 }}>
              <div className="p360-kicker" style={{ marginBottom: 6 }}>
                First useful output
              </div>

              <p
                className="p360-body-sm"
                style={{ margin: 0, fontSize: 12.5 }}
              >
                {recommendation.output}
              </p>
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="p360-kicker" style={{ marginBottom: 8 }}>
              Start with these modules
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 10,
              }}
            >
              {recommendation.modules.map((module, index) => (
                <div
                  key={module}
                  className="p360-card-soft"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '13px 14px',
                  }}
                >
                  <span
                    style={{
                      display: 'grid',
                      width: 22,
                      height: 22,
                      flex: '0 0 auto',
                      placeItems: 'center',
                      borderRadius: 999,
                      background: 'var(--green-100)',
                      color: 'var(--green-800)',
                      fontSize: 10.5,
                      fontWeight: 800,
                    }}
                  >
                    {index + 1}
                  </span>

                  <span
                    style={{
                      color: 'var(--text)',
                      fontSize: 12.5,
                      fontWeight: 750,
                      lineHeight: 1.35,
                    }}
                  >
                    {module}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="p360-kicker" style={{ marginBottom: 8 }}>
              Suggested next focus
            </div>

            <div className="p360-stack-8">
              {focusAreas.map((focus, index) => (
                <div
                  key={`${focus.type}-${focus.id}`}
                  className="p360-card-soft"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '11px 12px',
                  }}
                >
                  <span
                    style={{
                      display: 'grid',
                      width: 23,
                      height: 23,
                      flex: '0 0 auto',
                      placeItems: 'center',
                      borderRadius: 999,
                      background: 'var(--green-100)',
                      color: 'var(--green-800)',
                      fontSize: 10.5,
                      fontWeight: 800,
                    }}
                  >
                    {index + 1}
                  </span>

                  <span
                    style={{
                      color: 'var(--text)',
                      fontSize: 12.5,
                      fontWeight: 750,
                    }}
                  >
                    {focus.label}
                  </span>

                  <span
                    style={{
                      marginLeft: 'auto',
                      color: 'var(--text-faint)',
                      fontSize: 10.5,
                      fontWeight: 700,
                    }}
                  >
                    {focus.type === 'priority'
                      ? 'Founder priority'
                      : 'Evidence to strengthen'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              className="p360-btn-secondary"
              onClick={() => setShowResults(false)}
            >
              Review or refine pathway
            </button>

            <div
              style={{
                display: 'flex',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="p360-btn-secondary"
                onClick={goToAssessment}
              >
                Take full diagnostic
              </button>

              <button
                type="button"
                className="p360-btn-secondary"
                onClick={goToDashboard}
              >
                Go to workspace
              </button>

              <button
                type="button"
                className="p360-btn-primary"
                onClick={startWorkshop}
              >
                Start recommended workshop
              </button>
            </div>
          </div>
        </section>
      )}

      <section
        id="all-pathways"
        className="p360-card"
        style={{ marginTop: 18, padding: 22 }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginBottom: 16,
          }}
        >
          <div>
            <div className="p360-kicker" style={{ marginBottom: 6 }}>
              The full PATH360 journey
            </div>

            <h2 className="p360-title-md" style={{ margin: 0 }}>
              Explore every pathway
            </h2>

            <p className="p360-body-sm" style={{ margin: '6px 0 0' }}>
              Your current focus changes recommendations, never what you are
              allowed to access.
            </p>
          </div>

          <span className="p360-tag-learning">
            Stages are never locked
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(235px, 1fr))',
            gap: 10,
          }}
        >
          {PATHWAY_STAGES.map((stage) => {
            const selected = stage.id === recommendedStageId

            return (
              <button
                key={stage.id}
                type="button"
                className="p360-card-soft"
                onClick={() => {
                  setSelectedStage(stage.id)
                  setShowResults(false)
                  setSaveError('')
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
                aria-pressed={selected}
                style={{
                  padding: 16,
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderColor: selected
                    ? 'var(--green-600)'
                    : 'var(--border)',
                  background: selected
                    ? 'var(--green-050)'
                    : 'var(--surface)',
                  boxShadow: selected
                    ? '0 0 0 3px rgba(44, 111, 80, 0.08)'
                    : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      display: 'grid',
                      width: 28,
                      height: 28,
                      placeItems: 'center',
                      borderRadius: 9,
                      background: selected
                        ? 'var(--green-700)'
                        : 'var(--surface-muted)',
                      color: selected
                        ? 'var(--white)'
                        : 'var(--text-soft)',
                      fontSize: 10.5,
                      fontWeight: 800,
                    }}
                  >
                    {stage.number}
                  </span>

                  <span
                    style={{
                      color: selected
                        ? 'var(--green-800)'
                        : 'var(--text)',
                      fontSize: 13,
                      fontWeight: 800,
                      lineHeight: 1.3,
                    }}
                  >
                    {stage.title}
                  </span>
                </div>

                <p
                  style={{
                    margin: 0,
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
      </section>
    </div>
  )
}