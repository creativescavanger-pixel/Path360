// src/components/JourneyStrip.jsx
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

function getStepState(index, currentIndex) {
  if (index < currentIndex) return 'done'
  if (index === currentIndex) return 'current'
  return 'upcoming'
}

export default function JourneyStrip() {
  const navigate = useNavigate()
  const location = useLocation()

  const stageAssessment = useDiagnosticStore((s) => s.stageAssessment)
  const hasCompletedVentureIntelligenceSetup = useDiagnosticStore(
    (s) => s.hasCompletedVentureIntelligenceSetup,
  )
  const hasCompletedDiagnostic = useDiagnosticStore((s) =>
    s.hasCompletedDiagnostic(),
  )

  const steps = useMemo(
    () => [
      {
        id: 'stage',
        label: 'Stage baseline',
        description: 'Capture where your venture really is today.',
        path: '/app/stage-onboarding',
        done: Boolean(stageAssessment),
      },
      {
        id: 'vi',
        label: 'Venture Intelligence setup',
        description: 'Record core venture facts and context once.',
        path: '/app/venture-intelligence-setup',
        done:
          Boolean(stageAssessment) && hasCompletedVentureIntelligenceSetup,
      },
      {
        id: 'diagnostic',
        label: 'Founder diagnostic',
        description: 'Run your full founder assessment and score.',
        path: '/app/assessment',
        done:
          Boolean(stageAssessment) &&
          hasCompletedVentureIntelligenceSetup &&
          hasCompletedDiagnostic,
      },
      {
        id: 'operate',
        label: 'Build & use PATH360',
        description:
          'Work your priorities, workshops, markets, and investor outputs.',
        path: '/app/dashboard',
        done:
          Boolean(stageAssessment) &&
          hasCompletedVentureIntelligenceSetup &&
          hasCompletedDiagnostic,
      },
    ],
    [stageAssessment, hasCompletedVentureIntelligenceSetup, hasCompletedDiagnostic],
  )

  // Derive the "current" lifecycle index from your gating rules
  const currentIndex = useMemo(() => {
    if (!stageAssessment) return 0
    if (!hasCompletedVentureIntelligenceSetup) return 1
    if (!hasCompletedDiagnostic) return 2
    return 3
  }, [stageAssessment, hasCompletedVentureIntelligenceSetup, hasCompletedDiagnostic])

  const activeStep = steps[currentIndex] || steps[0]

  const nextAction = useMemo(() => {
    if (!stageAssessment) {
      return {
        label: 'Start your Stage baseline',
        detail: '3 short steps to set your starting point and recommended pathway.',
        path: '/app/stage-onboarding',
      }
    }

    if (!hasCompletedVentureIntelligenceSetup) {
      return {
        label: 'Set up Venture Intelligence',
        detail: 'Capture your venture facts once so PATH360 can reuse them everywhere.',
        path: '/app/venture-intelligence-setup',
      }
    }

    if (!hasCompletedDiagnostic) {
      return {
        label: 'Complete your founder diagnostic',
        detail: '10 adaptive questions to generate your founder intelligence and score.',
        path: '/app/assessment',
      }
    }

    // Post-diagnostic: encourage usage
    if (location.pathname.startsWith('/app/studio')) {
      return {
        label: 'Review your reports and priorities',
        detail: 'Use your assessment and outputs to decide what to work on next.',
        path: '/app/reports',
      }
    }

    return {
      label: 'Start working your priorities',
      detail: 'Open Priority Progress and begin moving one evidence-backed action forward.',
      path: '/app/priority-progress',
    }
  }, [
    stageAssessment,
    hasCompletedVentureIntelligenceSetup,
    hasCompletedDiagnostic,
    location.pathname,
  ])

  // Hide on public or edge cases – but you are always inside /app here,
  // so we only early-return if something is very wrong.
  if (!steps.length) return null

  return (
    <section
      className="p360-card-soft"
      style={{
        marginBottom: 12,
        padding: '10px 14px',
      }}
      aria-label="Your PATH360 journey"
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <div className="p360-kicker" style={{ marginBottom: 4 }}>
            Your PATH360 journey
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-soft)',
              marginBottom: 6,
            }}
          >
            Follow these steps from “Where am I?” to “Using PATH360 every month”.
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {steps.map((step, index) => {
              const state = getStepState(index, currentIndex)
              const isCurrent = index === currentIndex

              const coloursByState = {
                done: {
                  border: 'var(--green-600)',
                  bg: 'var(--green-050)',
                  text: 'var(--green-800)',
                  dot: 'var(--green-700)',
                },
                current: {
                  border: 'var(--lilac-500, #7158DC)',
                  bg: 'var(--lilac-050, #F5F0FF)',
                  text: 'var(--lilac-800, #51486A)',
                  dot: 'var(--lilac-500, #7158DC)',
                },
                upcoming: {
                  border: 'var(--border)',
                  bg: 'var(--surface)',
                  text: 'var(--text-soft)',
                  dot: 'var(--text-faint)',
                },
              }

              const palette = coloursByState[state]

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => navigate(step.path)}
                  style={{
                    borderRadius: 999,
                    border: `1px solid ${palette.border}`,
                    background: palette.bg,
                    color: palette.text,
                    padding: '5px 9px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: palette.dot,
                    }}
                  />
                  <span>{index + 1}.</span>
                  <span>{step.label}</span>
                  {isCurrent && (
                    <span
                      style={{
                        fontSize: 9.5,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}
                    >
                      Now
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div
          className="p360-card-soft"
          style={{
            minWidth: 230,
            maxWidth: 340,
            borderRadius: 12,
            padding: 10,
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-soft)',
              marginBottom: 4,
            }}
          >
            Next suggested action
          </div>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              color: 'var(--text)',
              marginBottom: 4,
            }}
          >
            {nextAction.label}
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-soft)',
              lineHeight: 1.5,
              marginBottom: 8,
            }}
          >
            {nextAction.detail}
          </div>
          <button
            type="button"
            className="p360-btn-primary"
            onClick={() => navigate(nextAction.path)}
            style={{
              fontSize: 11,
              padding: '7px 11px',
              minHeight: 32,
            }}
          >
            Go there now
          </button>
        </div>
      </div>
    </section>
  )
}