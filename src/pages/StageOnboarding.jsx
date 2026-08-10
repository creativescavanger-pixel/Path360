import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

const STAGES = [
  {
    id: 'idea',
    title: 'Idea',
    subtitle: 'You are validating the problem, customer, and opportunity.',
    color: '#7C5CFC',
  },
  {
    id: 'validation',
    title: 'Validation',
    subtitle: 'You are testing demand and proving early customer interest.',
    color: '#2D8CFF',
  },
  {
    id: 'mvp',
    title: 'MVP',
    subtitle: 'You have a usable product and are learning from real users.',
    color: '#00A984',
  },
  {
    id: 'traction',
    title: 'Traction',
    subtitle: 'You have repeatable signals of demand, customers, or revenue.',
    color: '#F59E0B',
  },
  {
    id: 'growth',
    title: 'Growth',
    subtitle: 'You are scaling a working business model and team.',
    color: '#E45757',
  },
]

const ITEMS = [
  {
    id: 'problem',
    label: 'Problem clarity',
    description: 'You can clearly explain the problem, who has it, and why it matters now.',
  },
  {
    id: 'customer',
    label: 'Customer evidence',
    description: 'You have spoken to, tested with, or sold to real target customers.',
  },
  {
    id: 'solution',
    label: 'Solution readiness',
    description: 'You have a concept, prototype, MVP, or working product.',
  },
  {
    id: 'business',
    label: 'Business model',
    description: 'You understand how the venture can make money and what drives its economics.',
  },
  {
    id: 'traction',
    label: 'Market traction',
    description: 'You have meaningful usage, pilots, revenue, retention, or growth signals.',
  },
  {
    id: 'team',
    label: 'Team readiness',
    description: 'You have the people, capabilities, or hiring plan needed for the next stage.',
  },
  {
    id: 'capital',
    label: 'Capital readiness',
    description: 'You understand your funding needs, runway, and likely funding path.',
  },
]

const STATUS_OPTIONS = [
  {
    id: 'not_started',
    label: 'Not started',
    shortLabel: 'Not started',
    score: 0,
    color: '#9CA3AF',
  },
  {
    id: 'early',
    label: 'Early progress',
    shortLabel: 'Early',
    score: 1,
    color: '#60A5FA',
  },
  {
    id: 'active',
    label: 'Actively working',
    shortLabel: 'Active',
    score: 2,
    color: '#A78BFA',
  },
  {
    id: 'strong',
    label: 'Strong evidence',
    shortLabel: 'Strong',
    score: 3,
    color: '#34D399',
  },
]

function getStatusScore(status) {
  return STATUS_OPTIONS.find((option) => option.id === status)?.score ?? 0
}

function getStageFromScore(score) {
  if (score <= 0.45) return 'idea'
  if (score <= 1.1) return 'validation'
  if (score <= 1.8) return 'mvp'
  if (score <= 2.45) return 'traction'
  return 'growth'
}

function getStageIndex(stageId) {
  return Math.max(
    0,
    STAGES.findIndex((stage) => stage.id === stageId)
  )
}

function scoreToPercent(score) {
  return Math.max(0, Math.min(100, Math.round((score / 3) * 100)))
}

function createEmptyStatuses() {
  return ITEMS.reduce((all, item) => {
    all[item.id] = 'not_started'
    return all
  }, {})
}

function normalizeAssessment(assessment) {
  const fallback = createEmptyStatuses()

  return {
    declaredStage: assessment?.declaredStage || '',
    diagnosedStage: assessment?.diagnosedStage || '',
    statusByItem: {
      ...fallback,
      ...(assessment?.statusByItem || {}),
    },
    notes: assessment?.notes || '',
    completedAt: assessment?.completedAt || null,
    averageScore: Number(assessment?.averageScore || 0),
  }
}

export default function StageOnboarding() {
  const navigate = useNavigate()

  const user = useDiagnosticStore((state) => state.user)
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const stageAssessment = useDiagnosticStore((state) => state.stageAssessment)
  const hasCompletedStageOnboarding = useDiagnosticStore(
    (state) => state.hasCompletedStageOnboarding
  )
  const setStageAssessment = useDiagnosticStore(
    (state) => state.setStageAssessment
  )
  const updateFounderProfile = useDiagnosticStore(
    (state) => state.updateFounderProfile
  )

  const existing = useMemo(
    () => normalizeAssessment(stageAssessment),
    [stageAssessment]
  )

  const [selectedStage, setSelectedStage] = useState(existing.declaredStage)
  const [statusByItem, setStatusByItem] = useState(existing.statusByItem)
  const [notes, setNotes] = useState(existing.notes)
  const [showResults, setShowResults] = useState(
    Boolean(hasCompletedStageOnboarding && existing.completedAt)
  )
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    const next = normalizeAssessment(stageAssessment)

    setSelectedStage(next.declaredStage)
    setStatusByItem(next.statusByItem)
    setNotes(next.notes)
    setShowResults(Boolean(next.completedAt))
  }, [stageAssessment])

  const averageScore = useMemo(() => {
    const total = ITEMS.reduce(
      (sum, item) => sum + getStatusScore(statusByItem[item.id]),
      0
    )

    return Number((total / ITEMS.length).toFixed(2))
  }, [statusByItem])

  const diagnosedStage = useMemo(
    () => getStageFromScore(averageScore),
    [averageScore]
  )

  const diagnosedStageData = useMemo(
    () => STAGES.find((stage) => stage.id === diagnosedStage) || STAGES[0],
    [diagnosedStage]
  )

  const declaredStageData = useMemo(
    () => STAGES.find((stage) => stage.id === selectedStage) || null,
    [selectedStage]
  )

  const completedItems = useMemo(
    () =>
      ITEMS.filter(
        (item) => getStatusScore(statusByItem[item.id]) >= 2
      ).length,
    [statusByItem]
  )

  const strongItems = useMemo(
    () =>
      ITEMS.filter(
        (item) => getStatusScore(statusByItem[item.id]) === 3
      ).length,
    [statusByItem]
  )

  const stageDifference = useMemo(() => {
    if (!selectedStage) return 0

    return getStageIndex(diagnosedStage) - getStageIndex(selectedStage)
  }, [diagnosedStage, selectedStage])

  const readinessLabel = useMemo(() => {
    if (averageScore < 0.75) return 'Foundation-building'
    if (averageScore < 1.5) return 'Early readiness'
    if (averageScore < 2.25) return 'Developing readiness'
    return 'Strong readiness'
  }, [averageScore])

  const nextFocusItems = useMemo(() => {
    return [...ITEMS]
      .sort(
        (a, b) =>
          getStatusScore(statusByItem[a.id]) -
          getStatusScore(statusByItem[b.id])
      )
      .slice(0, 3)
  }, [statusByItem])

  function updateStatus(itemId, status) {
    setShowResults(false)

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
  }

  async function handleComplete() {
    setSaveError('')

    if (!selectedStage) {
      setSaveError('Choose the stage that best describes your venture today.')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const assessment = {
      declaredStage: selectedStage,
      diagnosedStage,
      statusByItem,
      notes: notes.trim(),
      averageScore,
      completedAt: new Date().toISOString(),
    }

    setIsSaving(true)

    try {
      setStageAssessment(assessment)

      if (user?.id) {
        try {
          await updateFounderProfile({
            ...(founderProfile || {}),
            venturestage: selectedStage,
          })
        } catch (profileError) {
          console.warn(
            'Stage assessment was saved, but the profile update failed.',
            profileError
          )
        }
      }

      setShowResults(true)

      window.setTimeout(() => {
        document
          .getElementById('stage-results')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (error) {
      console.error('Failed to save stage assessment', error)

      setSaveError(
        'We could not save your stage assessment. Please try again.'
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

  return (
    <div className="stage-page">
      <style>{`
        .stage-page {
          min-height: 100%;
          padding: 34px 20px 64px;
          background:
            radial-gradient(circle at 85% 0%, rgba(124, 92, 252, 0.12), transparent 28rem),
            radial-gradient(circle at 5% 15%, rgba(45, 140, 255, 0.08), transparent 22rem),
            #f7f8fc;
          color: #182033;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .stage-shell {
          width: min(1120px, 100%);
          margin: 0 auto;
        }

        .stage-eyebrow {
          margin: 0 0 10px;
          color: #7158dc;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .stage-title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 10px;
        }

        .stage-title {
          margin: 0;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.08;
          letter-spacing: -0.045em;
        }

        .stage-description {
          max-width: 720px;
          margin: 0;
          color: #637087;
          font-size: 16px;
          line-height: 1.6;
        }

        .stage-card {
          margin-top: 28px;
          padding: clamp(20px, 4vw, 34px);
          border: 1px solid rgba(28, 38, 64, 0.08);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 18px 45px rgba(38, 52, 84, 0.08);
          backdrop-filter: blur(10px);
        }

        .stage-section-heading {
          margin: 0;
          font-size: 19px;
          letter-spacing: -0.02em;
        }

        .stage-section-copy {
          margin: 7px 0 20px;
          color: #69758a;
          font-size: 14px;
          line-height: 1.55;
        }

        .stage-options {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .stage-option {
          position: relative;
          min-height: 138px;
          padding: 18px 14px;
          overflow: hidden;
          border: 1px solid #e6e9f1;
          border-radius: 17px;
          background: #fff;
          color: #202a3c;
          cursor: pointer;
          text-align: left;
          transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
        }

        .stage-option:hover {
          transform: translateY(-2px);
          border-color: var(--stage-color);
          box-shadow: 0 12px 24px rgba(24, 32, 51, 0.08);
        }

        .stage-option.is-selected {
          border-color: var(--stage-color);
          box-shadow: 0 0 0 3px color-mix(in srgb, var(--stage-color) 14%, transparent);
        }

        .stage-option-dot {
          width: 10px;
          height: 10px;
          margin-bottom: 17px;
          border-radius: 999px;
          background: var(--stage-color);
        }

        .stage-option-title {
          display: block;
          margin-bottom: 7px;
          font-size: 15px;
          font-weight: 800;
        }

        .stage-option-copy {
          display: block;
          color: #718097;
          font-size: 12px;
          line-height: 1.45;
        }

        .readiness-grid {
          display: grid;
          gap: 15px;
        }

        .readiness-item {
          padding: 18px;
          border: 1px solid #e8ebf2;
          border-radius: 18px;
          background: #fff;
        }

        .readiness-item-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 14px;
        }

        .readiness-name {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 800;
        }

        .readiness-description {
          max-width: 680px;
          margin: 0;
          color: #718097;
          font-size: 13px;
          line-height: 1.5;
        }

        .readiness-score {
          flex: 0 0 auto;
          padding: 6px 9px;
          border-radius: 999px;
          background: #f4f2ff;
          color: #6a52d8;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .status-options {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .status-option {
          padding: 9px 11px;
          border: 1px solid #e4e8f0;
          border-radius: 10px;
          background: #fff;
          color: #657187;
          cursor: pointer;
          font-size: 12px;
          font-weight: 750;
          transition: all 150ms ease;
        }

        .status-option:hover {
          border-color: var(--status-color);
          color: var(--status-color);
        }

        .status-option.is-active {
          border-color: var(--status-color);
          background: color-mix(in srgb, var(--status-color) 10%, white);
          color: var(--status-color);
          box-shadow: inset 0 0 0 1px var(--status-color);
        }

        .stage-notes {
          width: 100%;
          min-height: 118px;
          box-sizing: border-box;
          resize: vertical;
          padding: 14px;
          border: 1px solid #e3e7ef;
          border-radius: 14px;
          outline: none;
          color: #263148;
          font: inherit;
          font-size: 14px;
          line-height: 1.55;
        }

        .stage-notes:focus {
          border-color: #7c5cfc;
          box-shadow: 0 0 0 3px rgba(124, 92, 252, 0.12);
        }

        .stage-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-top: 26px;
        }

        .stage-actions-right {
          display: flex;
          gap: 10px;
        }

        .stage-button {
          min-height: 44px;
          padding: 0 16px;
          border: 0;
          border-radius: 12px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 800;
          transition: transform 150ms ease, opacity 150ms ease, box-shadow 150ms ease;
        }

        .stage-button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .stage-button:disabled {
          cursor: not-allowed;
          opacity: 0.65;
        }

        .stage-button-primary {
          background: linear-gradient(135deg, #7454f7, #5e45d7);
          color: #fff;
          box-shadow: 0 10px 18px rgba(99, 70, 224, 0.24);
        }

        .stage-button-secondary {
          border: 1px solid #e2e6ef;
          background: #fff;
          color: #48556b;
        }

        .stage-error {
          margin: 20px 0 0;
          padding: 12px 14px;
          border: 1px solid #fecaca;
          border-radius: 12px;
          background: #fff1f2;
          color: #b42318;
          font-size: 13px;
          font-weight: 650;
        }
                  .results-card {
          scroll-margin-top: 24px;
          border: 1px solid rgba(124, 92, 252, 0.18);
          background:
            radial-gradient(circle at 100% 0%, rgba(124, 92, 252, 0.12), transparent 23rem),
            #fff;
        }

        .results-layout {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 24px;
          align-items: stretch;
        }

        .result-kicker {
          margin: 0 0 8px;
          color: #7454e7;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .result-title {
          margin: 0;
          font-size: clamp(26px, 3vw, 35px);
          letter-spacing: -0.04em;
        }

        .result-copy {
          margin: 12px 0 0;
          color: #667289;
          font-size: 15px;
          line-height: 1.6;
        }

        .result-stage-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding: 8px 11px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--diagnosed-color) 12%, white);
          color: var(--diagnosed-color);
          font-size: 13px;
          font-weight: 850;
        }

        .result-stage-pill::before {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          content: "";
        }

        .metrics-panel {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .metric {
          min-height: 105px;
          padding: 17px;
          border: 1px solid #eaedf4;
          border-radius: 17px;
          background: rgba(250, 251, 255, 0.86);
        }

        .metric-value {
          display: block;
          margin-bottom: 7px;
          color: #263148;
          font-size: 25px;
          font-weight: 850;
          letter-spacing: -0.04em;
        }

        .metric-label {
          display: block;
          color: #738097;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.35;
        }

        .focus-list {
          display: grid;
          gap: 9px;
          margin-top: 16px;
        }

        .focus-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 12px;
          border-radius: 12px;
          background: #f8f9fd;
          color: #4e5c72;
          font-size: 13px;
          font-weight: 700;
        }

        .focus-number {
          display: grid;
          width: 23px;
          height: 23px;
          flex: 0 0 auto;
          place-items: center;
          border-radius: 50%;
          background: #eae6ff;
          color: #654bd9;
          font-size: 11px;
          font-weight: 850;
        }

        .stage-match {
          margin-top: 18px;
          padding: 13px 14px;
          border-radius: 13px;
          background: #f7f8fb;
          color: #647087;
          font-size: 13px;
          line-height: 1.5;
        }

        @media (max-width: 860px) {
          .stage-options {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .results-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .stage-page {
            padding: 24px 14px 44px;
          }

          .stage-title-row,
          .stage-actions,
          .readiness-item-top {
            display: block;
          }

          .stage-options {
            grid-template-columns: 1fr;
          }

          .stage-actions-right {
            margin-top: 12px;
          }

          .stage-button {
            width: 100%;
          }

          .stage-actions-right {
            display: grid;
          }
        }
      `}</style>

      <main className="stage-shell">
        <p className="stage-eyebrow">Founder baseline</p>

        <div className="stage-title-row">
          <div>
            <h1 className="stage-title">Where is your venture today?</h1>
            <p className="stage-description">
              Choose the stage that feels most accurate, then score the
              evidence behind it. PATH360 uses this baseline to make guidance
              more relevant to your next move.
            </p>
          </div>
        </div>

        <section className="stage-card">
          <h2 className="stage-section-heading">
            1. Choose your current venture stage
          </h2>

          <p className="stage-section-copy">
            There is no wrong answer. Select the stage that best describes your
            venture right now.
          </p>

          <div className="stage-options">
            {STAGES.map((stage) => (
              <button
                key={stage.id}
                type="button"
                className={`stage-option ${
                  selectedStage === stage.id ? 'is-selected' : ''
                }`}
                style={{ '--stage-color': stage.color }}
                onClick={() => {
                  setSelectedStage(stage.id)
                  setShowResults(false)
                  setSaveError('')
                }}
                aria-pressed={selectedStage === stage.id}
              >
                <span className="stage-option-dot" />
                <span className="stage-option-title">{stage.title}</span>
                <span className="stage-option-copy">{stage.subtitle}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="stage-card">
          <h2 className="stage-section-heading">
            2. Score your current evidence
          </h2>

          <p className="stage-section-copy">
            This is not a test. It identifies where you have evidence today
            and where focused support will help most.
          </p>

          <div className="readiness-grid">
            {ITEMS.map((item) => {
              const activeStatus = statusByItem[item.id]
              const activeOption = STATUS_OPTIONS.find(
                (option) => option.id === activeStatus
              )

              return (
                <div className="readiness-item" key={item.id}>
                  <div className="readiness-item-top">
                    <div>
                      <h3 className="readiness-name">{item.label}</h3>
                      <p className="readiness-description">
                        {item.description}
                      </p>
                    </div>

                    <span
                      className="readiness-score"
                      style={{
                        color: activeOption?.color,
                        background: `${activeOption?.color}18`,
                      }}
                    >
                      {activeOption?.shortLabel || 'Not started'}
                    </span>
                  </div>

                  <div className="status-options">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        className={`status-option ${
                          activeStatus === option.id ? 'is-active' : ''
                        }`}
                        style={{ '--status-color': option.color }}
                        onClick={() => updateStatus(item.id, option.id)}
                        aria-pressed={activeStatus === option.id}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="stage-card">
          <h2 className="stage-section-heading">
            3. Add any context that matters
          </h2>

          <p className="stage-section-copy">
            Optional. Share a milestone, constraint, funding plan, launch date,
            or question you want PATH360 to keep in view.
          </p>

          <textarea
            className="stage-notes"
            value={notes}
            onChange={(event) => {
              setNotes(event.target.value)
              setShowResults(false)
            }}
            placeholder="For example: We have a clickable prototype, 14 customer interviews, and plan to launch a paid pilot this quarter."
          />
        </section>

        {saveError ? <p className="stage-error">{saveError}</p> : null}

        <div className="stage-actions">
          <button
            type="button"
            className="stage-button stage-button-secondary"
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset answers
          </button>

          <div className="stage-actions-right">
            {showResults ? (
              <button
                type="button"
                className="stage-button stage-button-secondary"
                onClick={() => setShowResults(false)}
                disabled={isSaving}
              >
                Edit assessment
              </button>
            ) : null}

            <button
              type="button"
              className="stage-button stage-button-primary"
              onClick={handleComplete}
              disabled={isSaving}
            >
              {isSaving
                ? 'Saving baseline...'
                : showResults
                  ? 'Update baseline'
                  : 'Complete stage baseline'}
            </button>
          </div>
        </div>

        {showResults ? (
          <section
            id="stage-results"
            className="stage-card results-card"
            style={{ '--diagnosed-color': diagnosedStageData.color }}
          >
            <div className="results-layout">
              <div>
                <p className="result-kicker">Your PATH360 baseline</p>

                <h2 className="result-title">
                  Your evidence currently maps to {diagnosedStageData.title}.
                </h2>

                <p className="result-copy">
                  Your self-selected stage is{' '}
                  <strong>{declaredStageData?.title || 'not selected'}</strong>.
                  {' '}The result below reflects the evidence you recorded
                  across customer validation, product, traction, team, and
                  capital readiness.
                </p>

                <span className="result-stage-pill">
                  Diagnosed stage: {diagnosedStageData.title}
                </span>

                <div className="stage-match">
                  {stageDifference === 0
                    ? 'Your selected stage and current evidence are aligned. Focus on strengthening the weakest areas to advance with confidence.'
                    : stageDifference > 0
                      ? 'Your evidence suggests you may be further along than the stage you selected. Review your strongest proof points and decide whether your positioning should reflect that progress.'
                      : 'Your selected stage is ahead of the evidence currently recorded. That is normal—use the focus areas below as the practical bridge to your next milestone.'}
                </div>
              </div>

              <div className="metrics-panel">
                <div className="metric">
                  <span className="metric-value">
                    {scoreToPercent(averageScore)}%
                  </span>
                  <span className="metric-label">{readinessLabel}</span>
                </div>

                <div className="metric">
                  <span className="metric-value">{completedItems}/7</span>
                  <span className="metric-label">
                    Areas actively in motion
                  </span>
                </div>

                <div className="metric">
                  <span className="metric-value">{strongItems}</span>
                  <span className="metric-label">
                    Areas with strong evidence
                  </span>
                </div>

                <div className="metric">
                  <span className="metric-value">
                    {declaredStageData?.title || '—'}
                  </span>
                  <span className="metric-label">
                    Your declared stage
                  </span>
                </div>
              </div>
            </div>

            <h3
              className="stage-section-heading"
              style={{ marginTop: 28 }}
            >
              Suggested next focus areas
            </h3>

            <p className="stage-section-copy">
              These are the three areas with the least evidence in your current
              baseline.
            </p>

            <div className="focus-list">
              {nextFocusItems.map((item, index) => (
                <div className="focus-item" key={item.id}>
                  <span className="focus-number">{index + 1}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="stage-actions">
              <button
                type="button"
                className="stage-button stage-button-secondary"
                onClick={() => setShowResults(false)}
              >
                Refine answers
              </button>

              <div className="stage-actions-right">
                <button
                  type="button"
                  className="stage-button stage-button-secondary"
                  onClick={goToAssessment}
                >
                  Take full assessment
                </button>

                <button
                  type="button"
                  className="stage-button stage-button-primary"
                  onClick={goToDashboard}
                >
                  Go to dashboard
                </button>
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}