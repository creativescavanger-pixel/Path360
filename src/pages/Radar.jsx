import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const RADAR_SIGNALS = [
  {
    id: 1,
    area: 'Strategy clarity',
    category: 'strategy',
    score: 8.2,
    summary:
      'Your positioning is becoming clearer, but it strengthens most when linked directly to concrete execution priorities.',
    tone: 'strong',
    urgency: 'medium',
    confidence: 'high',
    whyItMatters:
      'If the strategy is legible but not tightly connected to execution, outside observers may understand the ambition but still doubt operating precision.',
    nextMove:
      'Translate the top strategic claims into explicit execution priorities and measurable milestones.',
    destination: '/app/reports',
    destinationLabel: 'Open Reports',
  },
  {
    id: 2,
    area: 'Investor readiness',
    category: 'funding',
    score: 6.9,
    summary:
      'The core narrative is promising, though some claims still need tighter proof and sharper prioritisation.',
    tone: 'watch',
    urgency: 'high',
    confidence: 'medium',
    whyItMatters:
      'Investors need a clean proof chain. If claims feel broader than the evidence underneath them, the venture can appear less investable than it actually is.',
    nextMove:
      'Refine your top three investor claims and connect each one to evidence, traction, or founder insight.',
    destination: '/app/assessment',
    destinationLabel: 'Open Assessment',
  },
  {
    id: 3,
    area: 'Market narrative',
    category: 'market',
    score: 7.6,
    summary:
      'The opportunity is legible, especially when framed around urgency, timing, and founder-market fit.',
    tone: 'strong',
    urgency: 'low',
    confidence: 'high',
    whyItMatters:
      'A strong market narrative helps founders explain not only why the market matters, but why this team is well positioned to win now.',
    nextMove:
      'Keep timing, urgency, and founder-market fit tightly connected across your deck, reports, and venture story.',
    destination: '/app/memory',
    destinationLabel: 'Open Decisions & Insights',
  },
  {
    id: 4,
    area: 'Execution confidence',
    category: 'execution',
    score: 6.4,
    summary:
      'Momentum is visible, but next steps need to remain extremely clear for advisors and investors.',
    tone: 'watch',
    urgency: 'high',
    confidence: 'medium',
    whyItMatters:
      'Execution confidence is what turns a good story into belief. If next steps are fuzzy, the business can appear less mature than it is.',
    nextMove:
      'Reduce ambiguity by defining the next operating priorities and making progress visible through simple milestone language.',
    destination: '/app/studio',
    destinationLabel: 'Open Studio',
  },
  {
    id: 5,
    area: 'Founder-market fit',
    category: 'team',
    score: 7.8,
    summary:
      'The founder story supports the business well, especially when personal insight is tied directly to venture logic.',
    tone: 'strong',
    urgency: 'medium',
    confidence: 'high',
    whyItMatters:
      'Founder-market fit is a multiplier. When it is visible and credible, it can elevate trust across the entire venture story.',
    nextMove:
      'Show how founder experience creates a unique advantage in understanding the customer and executing the opportunity.',
    destination: '/app/founder-profile',
    destinationLabel: 'Review Venture Profile',
  },
  {
    id: 6,
    area: 'Proof chain',
    category: 'funding',
    score: 6.1,
    summary:
      'Some important venture claims are directionally strong, but they still need more visible evidence behind them.',
    tone: 'watch',
    urgency: 'high',
    confidence: 'medium',
    whyItMatters:
      'A weak proof chain forces investors or advisors to fill in gaps themselves, which usually reduces confidence.',
    nextMove:
      'Tighten the line between claim, evidence, traction signal, and next milestone so the narrative carries less uncertainty.',
    destination: '/app/reports',
    destinationLabel: 'Strengthen Reports',
  },
]

const VIEW_OPTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'risks', label: 'Risks' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'momentum', label: 'Momentum' },
]

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All areas' },
  { id: 'strategy', label: 'Strategy' },
  { id: 'market', label: 'Market' },
  { id: 'execution', label: 'Execution' },
  { id: 'funding', label: 'Funding' },
  { id: 'team', label: 'Team' },
]

const TONE_OPTIONS = [
  { id: 'all', label: 'All strength' },
  { id: 'strong', label: 'Strong signals' },
  { id: 'watch', label: 'Watch areas' },
]

function SectionCard({ title, subtitle, children, accent = '#1D6B4F' }) {
  return (
    <section
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2DED6',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: '#1C1C1A',
            marginBottom: 4,
          }}
        >
          {title}
        </div>

        {subtitle ? (
          <div
            style={{
              fontSize: 12.5,
              color: '#6B6965',
              lineHeight: 1.6,
            }}
          >
            {subtitle}
          </div>
        ) : null}

        <div
          style={{
            width: 44,
            height: 3,
            borderRadius: 999,
            background: accent,
            marginTop: 10,
            opacity: 0.2,
          }}
        />
      </div>

      {children}
    </section>
  )
}

function getToneStyles(tone) {
  if (tone === 'strong') {
    return {
      ring: 'rgba(29,107,79,0.16)',
      fill: '#EEF4EF',
      text: '#2A6A51',
      border: '#D6E4D7',
      pill: 'Strong',
    }
  }

  return {
    ring: 'rgba(138,110,42,0.16)',
    fill: '#F8F3E9',
    text: '#8A6E2A',
    border: '#E6DDC8',
    pill: 'Watch',
  }
}

function getUrgencyStyles(urgency) {
  if (urgency === 'high') {
    return {
      bg: '#FCEDEA',
      text: '#9B3D2F',
      border: '#EAC9C1',
      label: 'High urgency',
    }
  }

  if (urgency === 'medium') {
    return {
      bg: '#F8F3E9',
      text: '#8A6E2A',
      border: '#E6DDC8',
      label: 'Medium urgency',
    }
  }

  return {
    bg: '#EEF4EF',
    text: '#2A6A51',
    border: '#D6E4D7',
    label: 'Low urgency',
  }
}

function getConfidenceStyles(confidence) {
  if (confidence === 'high') {
    return {
      bg: '#EEF4EF',
      text: '#2A6A51',
      border: '#D6E4D7',
      label: 'High confidence',
    }
  }

  return {
    bg: '#F3F1EA',
    text: '#6F6756',
    border: '#E6DED1',
    label: 'Medium confidence',
  }
}

function averageScore(signals) {
  if (!signals.length) return 0

  const total = signals.reduce((sum, item) => sum + item.score, 0)

  return (total / signals.length).toFixed(1)
}

export default function Radar() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTone, setSelectedTone] = useState('all')
  const [sortBy, setSortBy] = useState('score_desc')
  const [selectedSignalId, setSelectedSignalId] = useState(
    RADAR_SIGNALS[0]?.id ?? null
  )
  const [showOnlyUrgent, setShowOnlyUrgent] = useState(false)
  const [activeView, setActiveView] = useState('overview')

  const filteredSignals = useMemo(() => {
    let next = [...RADAR_SIGNALS]

    if (selectedCategory !== 'all') {
      next = next.filter((signal) => signal.category === selectedCategory)
    }

    if (selectedTone !== 'all') {
      next = next.filter((signal) => signal.tone === selectedTone)
    }

    if (showOnlyUrgent) {
      next = next.filter((signal) => signal.urgency === 'high')
    }

    if (activeView === 'risks') {
      next = next.filter((signal) => signal.tone === 'watch')
    }

    if (activeView === 'opportunities') {
      next = next.filter((signal) => signal.tone === 'strong')
    }

    if (activeView === 'momentum') {
      next = next.filter((signal) => signal.score >= 7.4)
    }

    next.sort((a, b) => {
      if (sortBy === 'score_asc') return a.score - b.score
      if (sortBy === 'score_desc') return b.score - a.score

      if (sortBy === 'urgency') {
        const urgencyOrder = { high: 0, medium: 1, low: 2 }
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
      }

      if (sortBy === 'confidence') {
        const confidenceOrder = { high: 0, medium: 1 }
        return confidenceOrder[a.confidence] - confidenceOrder[b.confidence]
      }

      return 0
    })

    return next
  }, [
    activeView,
    selectedCategory,
    selectedTone,
    showOnlyUrgent,
    sortBy,
  ])

  const selectedSignal =
    filteredSignals.find((signal) => signal.id === selectedSignalId) ||
    filteredSignals[0] ||
    null

  const strongCount = filteredSignals.filter(
    (signal) => signal.tone === 'strong'
  ).length

  const watchCount = filteredSignals.filter(
    (signal) => signal.tone === 'watch'
  ).length

  const urgentCount = filteredSignals.filter(
    (signal) => signal.urgency === 'high'
  ).length

  const readinessPct = `${Math.round(
    (Number(averageScore(filteredSignals)) / 10) * 100
  )}%`

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedTone !== 'all' ||
    showOnlyUrgent ||
    activeView !== 'overview' ||
    sortBy !== 'score_desc'

  function clearFilters() {
    setSelectedCategory('all')
    setSelectedTone('all')
    setShowOnlyUrgent(false)
    setActiveView('overview')
    setSortBy('score_desc')
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1180 }}>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 18,
            padding: 24,
            marginBottom: 18,
            boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#1D6B4F',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Venture Radar
          </div>

          <h1
            style={{
              fontSize: 26,
              lineHeight: 1.15,
              fontWeight: 700,
              color: '#1C1C1A',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}
          >
            Explore your venture’s live signal picture
          </h1>

          <p
            style={{
              fontSize: 14,
              color: '#6B6965',
              lineHeight: 1.75,
              margin: 0,
              maxWidth: 820,
            }}
          >
            Inspect areas that need reinforcement, identify momentum, and
            connect each signal to a concrete next move.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 12,
            marginBottom: 18,
          }}
        >
          {[
            {
              label: 'Average signal',
              value: averageScore(filteredSignals) || '0.0',
            },
            {
              label: 'Strong signals',
              value: String(strongCount).padStart(2, '0'),
            },
            {
              label: 'Watch areas',
              value: String(watchCount).padStart(2, '0'),
            },
            {
              label: 'Readiness score',
              value: readinessPct,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2DED6',
                borderRadius: 14,
                padding: 14,
                boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#8C8A84',
                  marginBottom: 6,
                }}
              >
                {stat.label}
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: '#1C1C1A',
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        <SectionCard
          title="Radar controls"
          subtitle="Choose the view first, then narrow the signals only when you need to."
          accent="#7158DC"
        >
          <div style={{ display: 'grid', gap: 14 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div
                  style={{
                    color: '#625B70',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: 7,
                  }}
                >
                  Radar view
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    gap: 4,
                    padding: 4,
                    borderRadius: 12,
                    background: '#F7F5F0',
                    border: '1px solid #E7E1D8',
                  }}
                >
                  {VIEW_OPTIONS.map((view) => {
                    const active = activeView === view.id

                    return (
                      <button
                        key={view.id}
                        type="button"
                        onClick={() => setActiveView(view.id)}
                        style={{
                          minHeight: 32,
                          padding: '0 11px',
                          borderRadius: 9,
                          border: active
                            ? '1px solid #7158DC'
                            : '1px solid transparent',
                          background: active
                            ? '#7158DC'
                            : 'transparent',
                          color: active ? '#FFFFFF' : '#5F5A54',
                          fontSize: 11.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {view.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    padding: '7px 9px',
                    border: 'none',
                    background: 'transparent',
                    color: '#7158DC',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Clear filters
                </button>
              ) : null}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'minmax(170px, 1fr) minmax(170px, 1fr) minmax(195px, 1fr) auto',
                gap: 10,
                alignItems: 'end',
                paddingTop: 13,
                borderTop: '1px solid #ECE7DF',
              }}
            >
              <label>
                <div
                  style={{
                    color: '#746D65',
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  Area
                </div>

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                  style={{
                    width: '100%',
                    height: 38,
                    borderRadius: 10,
                    border: '1px solid #E2DED6',
                    background: '#FFFFFF',
                    color: '#302D29',
                    padding: '0 11px',
                    fontSize: 12,
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div
                  style={{
                    color: '#746D65',
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  Signal strength
                </div>

                <select
                  value={selectedTone}
                  onChange={(event) =>
                    setSelectedTone(event.target.value)
                  }
                  style={{
                    width: '100%',
                    height: 38,
                    borderRadius: 10,
                    border: '1px solid #E2DED6',
                    background: '#FFFFFF',
                    color: '#302D29',
                    padding: '0 11px',
                    fontSize: 12,
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  {TONE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div
                  style={{
                    color: '#746D65',
                    fontSize: 10.5,
                    fontWeight: 800,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  Sort
                </div>

                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                  style={{
                    width: '100%',
                    height: 38,
                    borderRadius: 10,
                    border: '1px solid #E2DED6',
                    background: '#FFFFFF',
                    color: '#302D29',
                    padding: '0 11px',
                    fontSize: 12,
                    fontWeight: 700,
                    outline: 'none',
                  }}
                >
                  <option value="score_desc">Highest score</option>
                  <option value="score_asc">Lowest score</option>
                  <option value="urgency">Highest urgency</option>
                  <option value="confidence">Highest confidence</option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => setShowOnlyUrgent((current) => !current)}
                style={{
                  height: 38,
                  padding: '0 12px',
                  borderRadius: 10,
                  border: showOnlyUrgent
                    ? '1px solid #7158DC'
                    : '1px solid #E2DED6',
                  background: showOnlyUrgent
                    ? '#F5F0FF'
                    : '#FFFFFF',
                  color: showOnlyUrgent
                    ? '#7158DC'
                    : '#5F5A54',
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {showOnlyUrgent
                  ? 'Urgent only'
                  : `Urgent (${urgentCount})`}
              </button>
            </div>
          </div>
        </SectionCard>
                <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.35fr) minmax(330px, 0.9fr)',
            gap: 16,
            alignItems: 'start',
            marginTop: 18,
          }}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <SectionCard
              title="Signal map"
              subtitle="Select a signal to understand what it means and move directly to the right workspace."
              accent="#1D6B4F"
            >
              <div style={{ display: 'grid', gap: 12 }}>
                {filteredSignals.length === 0 ? (
                  <div
                    style={{
                      borderRadius: 14,
                      padding: 16,
                      background: '#F7F5F0',
                      border: '1px solid #ECE6DB',
                      fontSize: 13,
                      color: '#6B6965',
                      lineHeight: 1.7,
                    }}
                  >
                    No signals match the current filters. Clear one or two
                    filters to widen the radar view.
                  </div>
                ) : (
                  filteredSignals.map((signal) => {
                    const tone = getToneStyles(signal.tone)
                    const urgency = getUrgencyStyles(signal.urgency)
                    const confidence = getConfidenceStyles(signal.confidence)
                    const active = selectedSignal?.id === signal.id

                    return (
                      <button
                        key={signal.id}
                        type="button"
                        onClick={() => setSelectedSignalId(signal.id)}
                        style={{
                          background: active ? '#FCFBF8' : '#F7F5F0',
                          border: active
                            ? '1px solid #7158DC'
                            : '1px solid #ECE6DB',
                          borderRadius: 14,
                          padding: 16,
                          textAlign: 'left',
                          cursor: 'pointer',
                          boxShadow: active
                            ? '0 10px 22px rgba(80,61,150,0.08)'
                            : 'none',
                          transition: 'all 180ms ease',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: 12,
                            marginBottom: 12,
                            flexWrap: 'wrap',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: '#1C1C1A',
                                marginBottom: 4,
                              }}
                            >
                              {signal.area}
                            </div>

                            <div
                              style={{
                                fontSize: 11.5,
                                color: '#8C8A84',
                                textTransform: 'capitalize',
                              }}
                            >
                              {signal.category} signal
                            </div>
                          </div>

                          <div
                            style={{
                              minWidth: 62,
                              padding: '8px 12px',
                              borderRadius: 999,
                              background: tone.fill,
                              color: tone.text,
                              border: `1px solid ${tone.border}`,
                              fontSize: 16,
                              fontWeight: 700,
                              textAlign: 'center',
                              boxShadow: `inset 0 0 0 1px ${tone.ring}`,
                            }}
                          >
                            {signal.score.toFixed(1)}
                          </div>
                        </div>

                        <div
                          style={{
                            fontSize: 12.5,
                            color: '#6B6965',
                            lineHeight: 1.7,
                            marginBottom: 12,
                          }}
                        >
                          {signal.summary}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '6px 9px',
                              borderRadius: 999,
                              background: tone.fill,
                              color: tone.text,
                              border: `1px solid ${tone.border}`,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {tone.pill}
                          </span>

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '6px 9px',
                              borderRadius: 999,
                              background: urgency.bg,
                              color: urgency.text,
                              border: `1px solid ${urgency.border}`,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {urgency.label}
                          </span>

                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              padding: '6px 9px',
                              borderRadius: 999,
                              background: confidence.bg,
                              color: confidence.text,
                              border: `1px solid ${confidence.border}`,
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {confidence.label}
                          </span>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </SectionCard>
          </div>

          <div
            style={{
              display: 'grid',
              gap: 16,
              position: 'sticky',
              top: 24,
            }}
          >
            <SectionCard
              title="Selected signal"
              subtitle="Inspect the signal logic, then take one useful next action."
              accent="#7158DC"
            >
              {selectedSignal ? (
                <div style={{ display: 'grid', gap: 14 }}>
                  <div
                    style={{
                      background: '#F7F5F0',
                      border: '1px solid #ECE6DB',
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: '#8C8A84',
                        marginBottom: 6,
                      }}
                    >
                      Focus area
                    </div>

                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#1C1C1A',
                        marginBottom: 8,
                      }}
                    >
                      {selectedSignal.area}
                    </div>

                    <div
                      style={{
                        fontSize: 12.5,
                        color: '#6B6965',
                        lineHeight: 1.7,
                      }}
                    >
                      {selectedSignal.summary}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #ECE6DB',
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: '#1C1C1A',
                        marginBottom: 8,
                      }}
                    >
                      Why this matters
                    </div>

                    <div
                      style={{
                        fontSize: 12.5,
                        color: '#6B6965',
                        lineHeight: 1.7,
                      }}
                    >
                      {selectedSignal.whyItMatters}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#F5F0FF',
                      border: '1px solid #E2D8FF',
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: '#7158DC',
                        marginBottom: 8,
                      }}
                    >
                      Recommended next move
                    </div>

                    <div
                      style={{
                        fontSize: 12.5,
                        color: '#3E3850',
                        lineHeight: 1.7,
                        marginBottom: 12,
                      }}
                    >
                      {selectedSignal.nextMove}
                    </div>

                    <Link
                      to={selectedSignal.destination}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '9px 12px',
                        borderRadius: 10,
                        background: '#7158DC',
                        color: '#FFFFFF',
                        textDecoration: 'none',
                        fontSize: 12.5,
                        fontWeight: 700,
                        boxShadow: '0 7px 14px rgba(113,88,220,0.18)',
                      }}
                    >
                      {selectedSignal.destinationLabel}
                    </Link>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 12.5,
                    color: '#6B6965',
                    lineHeight: 1.7,
                  }}
                >
                  Select a signal from the left to inspect its logic and next
                  action.
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Radar summary"
              subtitle="A simple read of the current filtered signal mix."
              accent="#8A6E2A"
            >
              <div
                style={{
                  background: '#FCF8EE',
                  border: '1px solid #EEE4C9',
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: '#1C1C1A',
                    lineHeight: 1.75,
                  }}
                >
                  {watchCount > strongCount
                    ? 'This view contains more watch areas than strengths. Focus on the highest-urgency signal first, then return to the broader radar.'
                    : 'This view contains more strengths than watch areas. Use the strongest signals to reinforce your narrative while tightening the remaining gaps.'}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Priority queue"
              subtitle="The most useful actions from the current Radar view."
              accent="#1D6B4F"
            >
              <div style={{ display: 'grid', gap: 10 }}>
                {filteredSignals.slice(0, 3).map((signal) => (
                  <button
                    key={signal.id}
                    type="button"
                    onClick={() => setSelectedSignalId(signal.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border:
                        selectedSignal?.id === signal.id
                          ? '1px solid #DDD1FF'
                          : '1px solid #ECE6DB',
                      background:
                        selectedSignal?.id === signal.id
                          ? '#F5F0FF'
                          : '#FFFFFF',
                      color: '#1C1C1A',
                      fontSize: 12.5,
                      lineHeight: 1.6,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: 4,
                      }}
                    >
                      {signal.area}
                    </div>

                    <div style={{ color: '#6B6965' }}>
                      {signal.nextMove}
                    </div>
                  </button>
                ))}

                {!filteredSignals.length ? (
                  <div
                    style={{
                      color: '#6B6965',
                      fontSize: 12.5,
                      lineHeight: 1.6,
                    }}
                  >
                    Reset the current filters to restore a priority queue.
                  </div>
                ) : null}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}