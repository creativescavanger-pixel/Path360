import { useMemo, useState } from 'react'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

const MEMORY_TYPES = [
  {
    id: 'investor_feedback',
    label: 'Investor feedback',
    color: '#1D6B4F',
    background: '#EDF6F0',
    border: '#CEE4D6',
  },
  {
    id: 'strategic_decision',
    label: 'Strategic decision',
    color: '#7158DC',
    background: '#F5F0FF',
    border: '#E2D8FF',
  },
  {
    id: 'customer_insight',
    label: 'Customer insight',
    color: '#0F5E64',
    background: '#EEF7F8',
    border: '#D1E7E9',
  },
  {
    id: 'founder_reflection',
    label: 'Founder reflection',
    color: '#8A6E2A',
    background: '#FCF8EE',
    border: '#EEE4C9',
  },
  {
    id: 'milestone',
    label: 'Milestone',
    color: '#2E5EAA',
    background: '#EFF4FB',
    border: '#D6E3F5',
  },
]

function getField(record, ...keys) {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) {
      return record[key]
    }
  }

  return null
}

function getTypeMeta(memoryType) {
  return (
    MEMORY_TYPES.find((type) => type.id === memoryType) ||
    {
      id: memoryType || 'insight',
      label: String(memoryType || 'Insight')
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase()),
      color: '#7158DC',
      background: '#F5F0FF',
      border: '#E2D8FF',
    }
  )
}

function formatDate(dateValue) {
  if (!dateValue) return 'Recently'

  try {
    return new Intl.DateTimeFormat('en', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateValue))
  } catch {
    return 'Recently'
  }
}

function getTitle(content) {
  const firstLine = String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean)

  if (!firstLine) {
    return 'Untitled insight'
  }

  return firstLine.length > 96
    ? `${firstLine.slice(0, 93).trim()}…`
    : firstLine
}

function getDetail(content) {
  const lines = String(content || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length <= 1) {
    return 'Captured as founder context for future decisions and conversations.'
  }

  return lines.slice(1).join(' ')
}

function SectionCard({ title, subtitle, accent = '#7158DC', children }) {
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
            fontSize: 10.5,
            color: accent,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 6,
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
      </div>

      {children}
    </section>
  )
}

export default function Memory() {
  const memories = useDiagnosticStore((state) => state.memories)
  const addMemory = useDiagnosticStore((state) => state.addMemory)

  const [isComposerOpen, setIsComposerOpen] = useState(false)
  const [memoryType, setMemoryType] = useState('strategic_decision')
  const [content, setContent] = useState('')
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const sortedMemories = useMemo(() => {
    return [...(Array.isArray(memories) ? memories : [])].sort((a, b) => {
      const aDate = new Date(
        getField(a, 'createdat', 'created_at', 'updatedat', 'updated_at') || 0
      )

      const bDate = new Date(
        getField(b, 'createdat', 'created_at', 'updatedat', 'updated_at') || 0
      )

      return bDate - aDate
    })
  }, [memories])

  const filteredMemories = useMemo(() => {
    if (filter === 'all') {
      return sortedMemories
    }

    return sortedMemories.filter((memory) => {
      return getField(memory, 'memorytype', 'memory_type') === filter
    })
  }, [filter, sortedMemories])

  const counts = useMemo(() => {
    return MEMORY_TYPES.map((type) => ({
      ...type,
      count: sortedMemories.filter((memory) => {
        return getField(memory, 'memorytype', 'memory_type') === type.id
      }).length,
    }))
  }, [sortedMemories])

  const patternSummary = useMemo(() => {
    if (!sortedMemories.length) {
      return 'Capture feedback, decisions, customer learning, and founder reflections here. This strategic context will make future PATH360 guidance more relevant.'
    }

    const strongestTypes = counts
      .filter((type) => type.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)
      .map((type) => type.label.toLowerCase())

    if (strongestTypes.length === 1) {
      return `Your working context is currently focused on ${strongestTypes[0]}. Add a wider mix of evidence and decisions to create a stronger founder record over time.`
    }

    return `Your recent venture context is strongest around ${strongestTypes.join(' and ')}. Keep recording what changed, why it matters, and what you will do next.`
  }, [counts, sortedMemories.length])

  function openComposer(type = 'strategic_decision') {
    setMemoryType(type)
    setContent('')
    setError('')
    setMessage('')
    setIsComposerOpen(true)
  }

  async function handleSave(event) {
    event.preventDefault()

    if (!content.trim()) {
      setError('Write an insight before saving it.')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await addMemory(memoryType, content.trim(), 3)

      setContent('')
      setIsComposerOpen(false)
      setFilter('all')
      setMessage('Insight saved to your venture context.')
    } catch (saveError) {
      console.error(saveError)

      setError(
        saveError?.message ||
          'Could not save this insight. Please try again.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1120,
        display: 'grid',
        gap: 16,
      }}
    >
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(280px, 0.8fr)',
          gap: 16,
          padding: 22,
          borderRadius: 18,
          border: '1px solid #E2D8FF',
          background:
            'linear-gradient(110deg, #FFFFFF 0%, #FAF8FF 55%, #F2EDFF 100%)',
          boxShadow: '0 8px 20px rgba(80,61,150,0.05)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 9px',
              borderRadius: 999,
              background: '#EEE8FF',
              border: '1px solid #DDD1FF',
              color: '#7158DC',
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            ✦ Decisions & Insights
          </div>

          <h1
            style={{
              fontSize: 26,
              lineHeight: 1.12,
              fontWeight: 800,
              color: '#252035',
              margin: '0 0 10px',
              letterSpacing: '-0.04em',
            }}
          >
            Keep the context that changes your venture.
          </h1>

          <p
            style={{
              fontSize: 13,
              color: '#625B70',
              lineHeight: 1.7,
              margin: 0,
              maxWidth: 660,
            }}
          >
            Capture investor feedback, customer learning, strategic decisions,
            milestones, and founder reflections that should inform your next move.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 16,
            padding: 15,
            borderRadius: 14,
            border: '1px solid #E2D8FF',
            background: 'rgba(255,255,255,0.82)',
          }}
        >
          <div>
            <div
              style={{
                color: '#6A6178',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Your venture context
            </div>

            <div
              style={{
                color: '#40385A',
                fontSize: 20,
                fontWeight: 800,
              }}
            >
              {sortedMemories.length}{' '}
              {sortedMemories.length === 1 ? 'entry' : 'entries'}
            </div>
          </div>

          <button
            type="button"
            onClick={() => openComposer()}
            style={{
              minHeight: 40,
              padding: '0 13px',
              border: '1px solid #7158DC',
              borderRadius: 10,
              background: '#7158DC',
              color: '#FFFFFF',
              fontSize: 12.5,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 8px 16px rgba(113,88,220,0.18)',
            }}
          >
            Capture an insight
          </button>
        </div>
      </section>

      {isComposerOpen ? (
        <section
          style={{
            padding: 18,
            borderRadius: 16,
            border: '1px solid #E2D8FF',
            background: '#FFFFFF',
            boxShadow: '0 8px 20px rgba(80,61,150,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 14,
            }}
          >
            <div>
              <div
                style={{
                  color: '#7158DC',
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}
              >
                New venture insight
              </div>

              <div
                style={{
                  color: '#252035',
                  fontSize: 17,
                  fontWeight: 800,
                }}
              >
                What changed, what did you learn, or what needs to stay visible?
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsComposerOpen(false)
                setError('')
              }}
              style={{
                padding: '7px 9px',
                border: '1px solid #E2DED6',
                borderRadius: 9,
                background: '#FFFFFF',
                color: '#6B6965',
                fontSize: 11.5,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(190px, 0.35fr) minmax(0, 1fr)',
                gap: 14,
              }}
            >
              <label>
                <div
                  style={{
                    color: '#54514B',
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  Insight type
                </div>

                <select
                  value={memoryType}
                  onChange={(event) => setMemoryType(event.target.value)}
                  style={{
                    width: '100%',
                    minHeight: 42,
                    padding: '0 11px',
                    border: '1px solid #E2DED6',
                    borderRadius: 10,
                    background: '#F9F7F2',
                    color: '#1C1C1A',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    outline: 'none',
                  }}
                >
                  {MEMORY_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div
                  style={{
                    color: '#54514B',
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  Capture the context
                </div>

                <textarea
                  rows={5}
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="What happened? Why does it matter? What should change next?"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: 12,
                    border: '1px solid #E2DED6',
                    borderRadius: 10,
                    background: '#F9F7F2',
                    color: '#1C1C1A',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    lineHeight: 1.6,
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              </label>
            </div>

            {error ? (
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid rgba(139,32,32,0.24)',
                  background: '#FDEAEA',
                  color: '#8B2020',
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            ) : null}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 10,
                marginTop: 14,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setIsComposerOpen(false)
                  setError('')
                }}
                style={{
                  minHeight: 38,
                  padding: '0 12px',
                  border: '1px solid #E2DED6',
                  borderRadius: 10,
                  background: '#FFFFFF',
                  color: '#6B6965',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !content.trim()}
                style={{
                  minHeight: 38,
                  padding: '0 13px',
                  border: '1px solid #7158DC',
                  borderRadius: 10,
                  background:
                    saving || !content.trim()
                      ? '#B9ADC9'
                      : '#7158DC',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor:
                    saving || !content.trim()
                      ? 'default'
                      : 'pointer',
                }}
              >
                {saving ? 'Saving…' : 'Save insight'}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {message ? (
        <div
          style={{
            padding: '11px 13px',
            borderRadius: 12,
            border: '1px solid #E2D8FF',
            background: '#F5F0FF',
            color: '#7158DC',
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          {message}
        </div>
      ) : null}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(300px, 0.85fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div>
          <SectionCard
            title="Your strategic record"
            subtitle="A living timeline of feedback, decisions, learning, and milestones that should influence your next move."
          >
            <div
              style={{
                display: 'flex',
                gap: 7,
                flexWrap: 'wrap',
                marginBottom: 15,
              }}
            >
              <button
                type="button"
                onClick={() => setFilter('all')}
                style={{
                  padding: '7px 10px',
                  borderRadius: 999,
                  border:
                    filter === 'all'
                      ? '1px solid #7158DC'
                      : '1px solid #E2DED6',
                  background:
                    filter === 'all'
                      ? '#F5F0FF'
                      : '#FFFFFF',
                  color:
                    filter === 'all'
                      ? '#7158DC'
                      : '#6B6965',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                All entries
              </button>

              {MEMORY_TYPES.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFilter(type.id)}
                  style={{
                    padding: '7px 10px',
                    borderRadius: 999,
                    border:
                      filter === type.id
                        ? `1px solid ${type.color}`
                        : '1px solid #E2DED6',
                    background:
                      filter === type.id
                        ? type.background
                        : '#FFFFFF',
                    color:
                      filter === type.id
                        ? type.color
                        : '#6B6965',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
                        {filteredMemories.length ? (
              <div style={{ display: 'grid', gap: 11 }}>
                {filteredMemories.map((memory, index) => {
                  const type = getTypeMeta(
                    getField(memory, 'memorytype', 'memory_type')
                  )

                  const memoryContent =
                    getField(memory, 'content', 'body', 'text') ||
                    ''

                  const memoryDate = getField(
                    memory,
                    'createdat',
                    'created_at',
                    'updatedat',
                    'updated_at'
                  )

                  return (
                    <article
                      key={
                        getField(memory, 'id') ||
                        `${memoryContent}-${index}`
                      }
                      style={{
                        padding: 15,
                        borderRadius: 14,
                        border: `1px solid ${type.border}`,
                        background: '#FFFFFF',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          flexWrap: 'wrap',
                          marginBottom: 9,
                        }}
                      >
                        <span
                          style={{
                            padding: '4px 8px',
                            borderRadius: 999,
                            background: type.background,
                            color: type.color,
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.07em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {type.label}
                        </span>

                        <span
                          style={{
                            color: '#918B82',
                            fontSize: 11,
                          }}
                        >
                          {formatDate(memoryDate)}
                        </span>
                      </div>

                      <div
                        style={{
                          color: '#1C1C1A',
                          fontSize: 14,
                          fontWeight: 800,
                          lineHeight: 1.45,
                          marginBottom: 6,
                        }}
                      >
                        {getTitle(memoryContent)}
                      </div>

                      <div
                        style={{
                          color: '#6B6965',
                          fontSize: 12.5,
                          lineHeight: 1.7,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {getDetail(memoryContent)}
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div
                style={{
                  padding: '30px 16px',
                  borderRadius: 14,
                  border: '1px dashed #DCD3EB',
                  background: '#FAF8FF',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    color: '#40385A',
                    fontSize: 14,
                    fontWeight: 800,
                    marginBottom: 6,
                  }}
                >
                  Your strategic record starts here.
                </div>

                <div
                  style={{
                    color: '#746C80',
                    fontSize: 12.5,
                    lineHeight: 1.65,
                    marginBottom: 13,
                  }}
                >
                  Save the feedback, decision, or reflection that you do not
                  want to lose when the next important conversation happens.
                </div>

                <button
                  type="button"
                  onClick={() => openComposer()}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 10,
                    border: '1px solid #7158DC',
                    background: '#7158DC',
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Capture your first insight
                </button>
              </div>
            )}
          </SectionCard>
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <SectionCard
            title="Pattern summary"
            subtitle="A live synthesis based on the context you have actually captured."
            accent="#7158DC"
          >
            <div
              style={{
                padding: 15,
                borderRadius: 14,
                border: '1px solid #E2D8FF',
                background: '#F5F0FF',
                color: '#4E4562',
                fontSize: 12.5,
                lineHeight: 1.75,
              }}
            >
              {patternSummary}
            </div>

            <div
              style={{
                marginTop: 12,
                color: '#81778F',
                fontSize: 11.5,
                lineHeight: 1.6,
              }}
            >
              As you capture more specific decisions and evidence, this space
              can become a richer AI-driven pattern layer.
            </div>
          </SectionCard>

          <SectionCard
            title="Context health"
            subtitle="A simple view of the strategic evidence you are keeping visible."
            accent="#1D6B4F"
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 10,
              }}
            >
              {counts.map((type) => (
                <div
                  key={type.id}
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    border: `1px solid ${type.border}`,
                    background: type.background,
                  }}
                >
                  <div
                    style={{
                      color: type.color,
                      fontSize: 10.5,
                      fontWeight: 800,
                      lineHeight: 1.35,
                      marginBottom: 5,
                    }}
                  >
                    {type.label}
                  </div>

                  <div
                    style={{
                      color: '#1C1C1A',
                      fontSize: 21,
                      fontWeight: 800,
                    }}
                  >
                    {type.count}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Use this well"
            subtitle="Capture only the information that should influence a future conversation or decision."
            accent="#8A6E2A"
          >
            <div style={{ display: 'grid', gap: 9 }}>
              {[
                {
                  label:
                    'What did an investor, customer, or advisor say that changed your thinking?',
                  type: 'investor_feedback',
                },
                {
                  label:
                    'What strategic decision did you make and why?',
                  type: 'strategic_decision',
                },
                {
                  label:
                    'What assumption did you test, confirm, or challenge?',
                  type: 'customer_insight',
                },
              ].map((prompt, index) => (
                <button
                  key={prompt.label}
                  type="button"
                  onClick={() => openComposer(prompt.type)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 9,
                    width: '100%',
                    padding: 11,
                    textAlign: 'left',
                    borderRadius: 11,
                    border: '1px solid #ECE6DB',
                    background: '#FFFFFF',
                    color: '#625D56',
                    fontSize: 12,
                    lineHeight: 1.55,
                    cursor: 'pointer',
                  }}
                >
                  <span
                    style={{
                      width: 19,
                      height: 19,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      borderRadius: 999,
                      background: '#F5F0FF',
                      color: '#7158DC',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    {index + 1}
                  </span>

                  {prompt.label}
                </button>
              ))}
            </div>
          </SectionCard>
        </div>
      </section>
    </div>
  )
}