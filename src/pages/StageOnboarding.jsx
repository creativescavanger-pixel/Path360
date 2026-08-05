import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

const STAGE_OPTIONS = [
  { id: 'idea', label: 'I’m exploring an idea' },
  { id: 'discovery', label: 'I’m validating a problem with customers' },
  { id: 'validation', label: 'I’m testing a solution or prototype' },
  { id: 'mvp', label: 'I have an MVP in the market' },
  { id: 'early_revenue', label: 'I have paying customers' },
  { id: 'pmf', label: 'I’m seeing strong retention and growth' },
  { id: 'unsure', label: 'I’m not sure yet' },
]

const STATUS_OPTIONS = [
  { id: 'not_started', label: 'Not started' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'established', label: 'Established' },
  { id: 'strong_evidence', label: 'Strong evidence' },
]

const CHECKLIST_SECTIONS = [
  {
    id: 'problem',
    title: 'Problem definition',
    subtitle: 'Is your problem clearly defined and meaningful?',
    items: [
      {
        id: 'problem_clarity',
        label: 'I can clearly describe the problem I am solving.',
        description:
          'You should be able to describe the problem in one sentence that a target customer would recognise immediately.',
      },
      {
        id: 'problem_target',
        label: 'I know who experiences this problem most.',
        description:
          'You should know which type of customer experiences this problem, and be able to describe their context.',
      },
      {
        id: 'problem_frequency',
        label: 'I understand how often this problem occurs.',
        description:
          'You should have a sense of whether this is an occasional irritation or a frequent operational issue.',
      },
      {
        id: 'problem_consequence',
        label: 'I know the consequences of leaving this problem unsolved.',
        description:
          'You should know what cost, delay, risk or missed opportunity this problem creates.',
      },
    ],
  },
  {
    id: 'customer',
    title: 'Customer validation',
    subtitle: 'Have real customers confirmed that this problem matters?',
    items: [
      {
        id: 'customer_interviews_count',
        label: 'I have spoken directly to several target customers.',
        description:
          'You should have multiple conversations with real target users, not just friends or colleagues.',
      },
      {
        id: 'customer_interviews_quality',
        label: 'I see repeated patterns in customer interviews.',
        description:
          'You should recognise recurring pains, language and behaviours from different customers.',
      },
      {
        id: 'customer_current_solutions',
        label: 'I understand how customers solve this problem today.',
        description:
          'You should know the main alternatives, tools and workarounds customers use, and where they fall short.',
      },
      {
        id: 'customer_action_signals',
        label: 'I have evidence that some customers are willing to take action.',
        description:
          'You should see concrete signals such as follow-ups, signups, pilots or requests for more information.',
      },
    ],
  },
  {
    id: 'solution',
    title: 'Solution readiness',
    subtitle: 'Is there a solution that customers can see, test or use?',
    items: [
      {
        id: 'solution_state',
        label: 'I have defined a clear solution concept.',
        description:
          'You should know what you are building and how it addresses the problem, beyond a vague idea.',
      },
      {
        id: 'solution_mvp',
        label: 'Customers can interact with a prototype or MVP.',
        description:
          'You should have a prototype, manual version or MVP that real users can try.',
      },
      {
        id: 'solution_feedback_loop',
        label: 'I collect structured feedback from users and act on it.',
        description:
          'You should regularly capture feedback from users and use it to improve the product.',
      },
    ],
  },
  {
    id: 'traction',
    title: 'Traction signals',
    subtitle: 'Is the market showing interest or pull?',
    items: [
      {
        id: 'traction_signals',
        label: 'I have traction signals such as signups, pilots or active users.',
        description:
          'You should see observable behaviour from users, not just conversations.',
      },
      {
        id: 'traction_icp_clarity',
        label: 'I have a clear Ideal Customer Profile (ICP).',
        description:
          'You should be able to describe your best-fit customer type, their context and buying behaviour.',
      },
      {
        id: 'traction_user_disappointment',
        label: 'I have evidence that users would be disappointed if the product disappeared.',
        description:
          'You should know how deeply users rely on your solution and how they would react if they lost it.',
      },
    ],
  },
  {
    id: 'revenue',
    title: 'Revenue readiness',
    subtitle: 'Are customers paying, and is revenue becoming repeatable?',
    items: [
      {
        id: 'revenue_payments',
        label: 'Customers are paying for the product or service.',
        description:
          'You should have moved beyond free pilots to paid usage, even if small.',
      },
      {
        id: 'revenue_pattern',
        label: 'Revenue shows some repeatable pattern.',
        description:
          'You should see early signs of recurring or predictable revenue, not just one-off deals.',
      },
      {
        id: 'revenue_retention',
        label: 'Customers stay, renew or buy again.',
        description:
          'You should see customers continuing to use or pay over time.',
      },
    ],
  },
  {
    id: 'business',
    title: 'Business readiness',
    subtitle: 'Is the business model and operating discipline emerging?',
    items: [
      {
        id: 'business_market_model',
        label: 'I have defined my target market and customer segment.',
        description:
          'You should have a basic market model and segment definition, not just a broad idea.',
      },
      {
        id: 'business_metrics_tracking',
        label: 'I track key business metrics and progress regularly.',
        description:
          'You should monitor metrics such as users, revenue, pipeline or experiments over time.',
      },
      {
        id: 'business_cash_runway',
        label: 'I understand my cash position and runway.',
        description:
          'You should know how much cash you have and how long it will last at current spending levels.',
      },
    ],
  },
]

const STATUS_SCORE = {
  not_started: 0,
  in_progress: 1,
  established: 2,
  strong_evidence: 3,
}

function buildStageSummary(result) {
  const { declaredStage, diagnosedStage, scoreRatio, statusByItem } = result

  const reasons = []
  const gaps = []

  if (
    statusByItem['problem_clarity'] === 'established' ||
    statusByItem['problem_clarity'] === 'strong_evidence'
  ) {
    reasons.push('Your problem definition is clear and recognised by target customers.')
  } else {
    gaps.push('Sharpen how you describe the problem so it is obvious to your target customer.')
  }

  if (
    statusByItem['customer_interviews_count'] === 'established' ||
    statusByItem['customer_interviews_count'] === 'strong_evidence'
  ) {
    reasons.push('You have spoken to several target customers and seen repeated patterns.')
  } else {
    gaps.push('Run more structured customer interviews to deepen validation.')
  }

  if (
    statusByItem['solution_mvp'] === 'established' ||
    statusByItem['solution_mvp'] === 'strong_evidence'
  ) {
    reasons.push('Customers can interact with a prototype or MVP.')
  } else {
    gaps.push('Bring a clear prototype or MVP into customer hands.')
  }

  if (
    statusByItem['revenue_payments'] === 'established' ||
    statusByItem['revenue_payments'] === 'strong_evidence'
  ) {
    reasons.push('Customers are paying for your product or service.')
  } else {
    gaps.push('Convert pilots and interest into initial paid usage.')
  }

  if (
    statusByItem['revenue_retention'] === 'established' ||
    statusByItem['revenue_retention'] === 'strong_evidence'
  ) {
    reasons.push('You see customers staying, renewing or buying again.')
  } else {
    gaps.push('Focus on retention and repeat use to build durable traction.')
  }

  let stageLabel = diagnosedStage
  const declaredOpt = STAGE_OPTIONS.find((o) => o.id === declaredStage)
  if (declaredOpt?.label) {
    stageLabel = declaredOpt.label
  }

  let headline
  switch (diagnosedStage) {
    case 'idea':
      headline = 'You are in the Idea / Exploration stage.'
      break
    case 'discovery':
      headline = 'You are in the Discovery stage.'
      break
    case 'validation':
      headline = 'You are in the Validation stage.'
      break
    case 'mvp':
      headline = 'You are in the MVP stage.'
      break
    case 'early_revenue':
      headline = 'You are in the Early Revenue stage.'
      break
    case 'pmf':
      headline = 'You are approaching Product–Market Fit.'
      break
    case 'growth':
      headline = 'You are in the Growth stage.'
      break
    default:
      headline = 'We have estimated your current stage from your answers.'
  }

  const ratioPct = Math.round((scoreRatio || 0) * 100)

  return {
    headline,
    stageLabel,
    ratioPct,
    reasons,
    gaps,
  }
}

export default function StageOnboarding() {
  const navigate = useNavigate()
  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const user = useDiagnosticStore((s) => s.user)
  const updateFounderProfile = useDiagnosticStore((s) => s.updateFounderProfile)
  const setStageAssessment = useDiagnosticStore((s) => s.setStageAssessment)

  const [selectedStage, setSelectedStage] = useState(null)
  const [statusByItem, setStatusByItem] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [stageSummary, setStageSummary] = useState(null)

  const founderName =
    founderProfile?.fullname ||
    founderProfile?.foundername ||
    'Founder'

  const ventureName =
    founderProfile?.venturename ||
    founderProfile?.venture_name ||
    'your venture'

  useEffect(() => {
    if (!selectedStage) {
      const profileStage = founderProfile?.venturestage || founderProfile?.venture_stage || null
      if (profileStage) {
        setSelectedStage(profileStage)
      }
    }
  }, [founderProfile, selectedStage])

  function updateStatus(itemId, statusId) {
    setStatusByItem((prev) => ({ ...prev, [itemId]: statusId }))
  }

  function computeStageFromChecklist() {
    let totalScore = 0
    let maxScore = 0

    CHECKLIST_SECTIONS.forEach((section) => {
      section.items.forEach((item) => {
        const status = statusByItem[item.id] || 'not_started'
        totalScore += STATUS_SCORE[status]
        maxScore += 3
      })
    })

    const ratio = maxScore ? totalScore / maxScore : 0

    const hasMvp =
      statusByItem['solution_mvp'] === 'established' ||
      statusByItem['solution_mvp'] === 'strong_evidence'

    const hasPayingCustomers =
      statusByItem['revenue_payments'] === 'established' ||
      statusByItem['revenue_payments'] === 'strong_evidence'

    const hasRetention =
      statusByItem['revenue_retention'] === 'established' ||
      statusByItem['revenue_retention'] === 'strong_evidence'

    const hasStrongPull =
      statusByItem['traction_user_disappointment'] === 'strong_evidence'

    let stageId = 'idea'

    if (ratio < 0.2) {
      stageId = 'idea'
    } else if (ratio < 0.35) {
      stageId = 'discovery'
    } else if (ratio < 0.5) {
      stageId = 'validation'
    } else if (!hasMvp) {
      stageId = 'validation'
    } else if (!hasPayingCustomers) {
      stageId = 'mvp'
    } else if (!hasRetention) {
      stageId = 'early_revenue'
    } else if (!hasStrongPull) {
      stageId = 'early_revenue'
    } else if (ratio < 0.8) {
      stageId = 'pmf'
    } else {
      stageId = 'growth'
    }

    return { stageId, scoreRatio: ratio }
  }

  async function handleComplete() {
    setSubmitting(true)
    setError('')

    try {
      const derived = computeStageFromChecklist()

      const result = {
        declaredStage: selectedStage,
        diagnosedStage: derived.stageId,
        scoreRatio: derived.scoreRatio,
        statusByItem,
        completedAt: new Date().toISOString(),
      }

      if (user?.id && selectedStage) {
        try {
          await updateFounderProfile({ venturestage: selectedStage })
        } catch (profileError) {
          console.warn('Failed to persist onboarding stage to profile:', profileError)
        }
      }

      const summary = buildStageSummary(result)
      setStageAssessment({ ...result, summary })
      setStageSummary(summary)
    } catch (err) {
      setError('Something went wrong while saving your stage assessment.')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = selectedStage && !submitting

  if (stageSummary) {
    return (
      <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 18,
            padding: 20,
            marginBottom: 18,
            boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#4D6B57',
              marginBottom: 6,
            }}
          >
            Stage summary
          </div>
          <h1
            style={{
              fontSize: 24,
              lineHeight: 1.2,
              letterSpacing: '-0.04em',
              fontWeight: 800,
              margin: '0 0 8px',
            }}
          >
            {founderName}, here’s where {ventureName} is today.
          </h1>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.75,
              color: '#5F675F',
              margin: 0,
            }}
          >
            This is a non-AI diagnostic based on your checklist answers. Path360 will use this stage to tailor your
            assessment and future guidance.
          </p>
        </div>

        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 16,
            padding: 18,
            marginBottom: 18,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#1C1C1A',
                marginBottom: 4,
              }}
            >
              {stageSummary.headline}
            </div>
            <div
              style={{
                fontSize: 12.5,
                color: '#6B6965',
              }}
            >
              Overall checklist completion: {stageSummary.ratioPct}% of maturity indicators marked as “in progress”
              or above.
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)',
              gap: 16,
            }}
          >
            <div
              style={{
                borderRadius: 12,
                background: '#F7F5F0',
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1C1C1A',
                  marginBottom: 6,
                }}
              >
                Why this stage fits
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: 12.5,
                  color: '#6B6965',
                  lineHeight: 1.7,
                }}
              >
                {stageSummary.reasons.length > 0 ? (
                  stageSummary.reasons.map((reason, idx) => (
                    <li key={idx} style={{ marginBottom: 4 }}>
                      • {reason}
                    </li>
                  ))
                ) : (
                  <li>We need more evidence in each area to strengthen this stage diagnosis.</li>
                )}
              </ul>
            </div>

            <div
              style={{
                borderRadius: 12,
                background: '#FCF2E8',
                padding: 12,
                border: '1px solid #EEE0CF',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1C1C1A',
                  marginBottom: 6,
                }}
              >
                What to focus on next
              </div>
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  fontSize: 12.5,
                  color: '#6B6965',
                  lineHeight: 1.7,
                }}
              >
                {stageSummary.gaps.slice(0, 4).map((gap, idx) => (
                  <li key={idx} style={{ marginBottom: 4 }}>
                    • {gap}
                  </li>
                ))}
                {stageSummary.gaps.length === 0 && (
                  <li>Use the assessment to deepen your investor-readiness view and surface finer-grained gaps.</li>
                )}
              </ul>
            </div>
          </div>
        </section>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 12.5, color: '#6B6965' }}>
            Next, Path360 will run your founder assessment so we can combine stage and readiness into one view.
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/dashboard', { replace: true })}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              border: 'none',
              background: '#163A2C',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Continue to assessment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1080, margin: '0 auto' }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 18,
          padding: 20,
          marginBottom: 18,
          boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#4D6B57',
            marginBottom: 6,
          }}
        >
          PATH360 Onboarding
        </div>
        <h1
          style={{
            fontSize: 26,
            lineHeight: 1.2,
            letterSpacing: '-0.04em',
            fontWeight: 800,
            margin: '0 0 8px',
          }}
        >
          {founderName}, let’s locate {ventureName} in the journey.
        </h1>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.75,
            color: '#5F675F',
            margin: 0,
            maxWidth: 640,
          }}
        >
          Before we show you the dashboard, we’ll run a short, guided checklist to understand your current stage.
        </p>
      </div>

      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 16,
          padding: 18,
          marginBottom: 18,
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1A', marginBottom: 4 }}>
            1. At what stage is your venture today?
          </div>
          <div style={{ fontSize: 12.5, color: '#6B6965' }}>
            Choose the option that feels closest. The checklist below will refine this into a more precise stage.
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 8,
          }}
        >
          {STAGE_OPTIONS.map((opt) => {
            const active = selectedStage === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedStage(opt.id)}
                style={{
                  textAlign: 'left',
                  borderRadius: 12,
                  border: active ? '1.5px solid #163A2C' : '1px solid #E2DED6',
                  background: active ? '#163A2C' : '#F7F5F0',
                  color: active ? '#FFFFFF' : '#1C1C1A',
                  padding: '10px 11px',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </section>

      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 16,
          padding: 18,
          marginBottom: 18,
        }}
      >
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1A', marginBottom: 4 }}>
            2. Stage checklist
          </div>
          <div style={{ fontSize: 12.5, color: '#6B6965' }}>
            Mark how far along you are on each item. This is designed to feel like a structured founder diagnostic.
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          {CHECKLIST_SECTIONS.map((section) => (
            <div
              key={section.id}
              style={{
                borderRadius: 12,
                border: '1px solid #E2DED6',
                background: '#F7F5F0',
                padding: 12,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1A' }}>{section.title}</div>
                <div style={{ fontSize: 11.5, color: '#6B6965' }}>{section.subtitle}</div>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {section.items.map((item) => {
                  const currentStatus = statusByItem[item.id] || 'not_started'
                  return (
                    <div
                      key={item.id}
                      style={{
                        borderRadius: 10,
                        background: '#FFFFFF',
                        padding: 10,
                        display: 'grid',
                        gap: 6,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1A' }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#6B6965', lineHeight: 1.6 }}>
                        {item.description}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 6,
                          marginTop: 4,
                        }}
                      >
                        {STATUS_OPTIONS.map((status) => {
                          const active = currentStatus === status.id
                          return (
                            <button
                              key={status.id}
                              type="button"
                              onClick={() => updateStatus(item.id, status.id)}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 999,
                                border: active ? '1px solid #163A2C' : '1px solid #E2DED6',
                                background: active ? '#163A2C' : '#F7F5F0',
                                color: active ? '#FFFFFF' : '#6B6965',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              {status.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ fontSize: 12.5, color: '#6B6965' }}>
          Once complete, Path360 will show you a stage summary and then unlock your dashboard and assessment.
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleComplete}
          style={{
            padding: '10px 18px',
            borderRadius: 12,
            border: 'none',
            background: canSubmit ? '#163A2C' : '#A7ABA7',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'default',
          }}
        >
          {submitting ? 'Saving…' : 'Confirm stage'}
        </button>
      </div>

      {error && (
        <div
          style={{
            marginTop: 12,
            background: '#FDEAEA',
            border: '1px solid rgba(139,32,32,0.18)',
            color: '#8B2020',
            borderRadius: 14,
            padding: '10px 12px',
            fontSize: 12.5,
          }}
        >
          {error}
        </div>
      )}
    </div>
  )
}