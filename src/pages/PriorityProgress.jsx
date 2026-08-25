import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  getPriorityProgress,
  savePriorityProgress,
} from '../lib/supabaseClient.js'

function priorityKeyFromTitle(title, index = 0) {
  const normalized = String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return normalized || `priority-${index + 1}`
}

function statusMeta(status) {
  const map = {
    not_started: {
      label: 'Not started',
      color: '#5F675F',
      background: '#F1F4F0',
      border: '#D9DFD7',
    },
    in_progress: {
      label: 'In progress',
      color: '#8A5A00',
      background: '#FFF8E8',
      border: '#F0DEAE',
    },
    completed: {
      label: 'Completed',
      color: '#176A40',
      background: '#EAF5ED',
      border: '#BFDCC7',
    },
    blocked: {
      label: 'Blocked',
      color: '#9A3D30',
      background: '#FCEDEA',
      border: '#F1C9C2',
    },
  }

  return map[status] || map.not_started
}

function formatDate(value) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export default function PriorityProgress() {
  const navigate = useNavigate()

  const user = useDiagnosticStore((state) => state.user)
  const assessmentResults = useDiagnosticStore(
    (state) => state.assessmentResults,
  )
  const storePriorityProgress = useDiagnosticStore(
    (state) => state.priorityProgress,
  )

  const [priorityProgress, setPriorityProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingKey, setSavingKey] = useState(null)
  const [error, setError] = useState('')
  const [evidenceDrafts, setEvidenceDrafts] = useState({})

  const priorities = useMemo(
    () =>
      Array.isArray(assessmentResults?.strategicpriorities)
        ? assessmentResults.strategicpriorities.slice(0, 4)
        : [],
    [assessmentResults?.strategicpriorities],
  )

  useEffect(() => {
    let cancelled = false

    async function loadProgress() {
      if (!user?.id) {
        if (!cancelled) {
          setPriorityProgress([])
          setLoading(false)
        }
        return
      }

      const fromStore = Array.isArray(storePriorityProgress)
        ? storePriorityProgress
        : []

      if (fromStore.length) {
        if (!cancelled) {
          setPriorityProgress(fromStore)
          setLoading(false)
        }
        return
      }

      try {
        const rows = await getPriorityProgress(user.id)

        if (!cancelled) {
          setPriorityProgress(rows || [])
        }
      } catch (loadError) {
        if (!cancelled) {
          console.error('Failed to load priority progress', loadError)
          setError('Priority progress could not be loaded.')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProgress()

    return () => {
      cancelled = true
    }
  }, [user?.id, storePriorityProgress])

  const progressByKey = useMemo(() => {
    return priorityProgress.reduce((map, row) => {
      if (row?.prioritykey) {
        map[row.prioritykey] = row
      }

      return map
    }, {})
  }, [priorityProgress])

  const priorityRows = useMemo(() => {
    return priorities.map((priority, index) => {
      const title = priority?.priority || `Priority ${index + 1}`
      const prioritykey = priorityKeyFromTitle(title, index)
      const saved = progressByKey[prioritykey]
      const status = saved?.status || 'not_started'

      return {
        index,
        priority,
        prioritykey,
        title,
        rationale: priority?.rationale || 'No rationale available.',
        status,
        evidence: saved?.evidence || '',
        completedat: saved?.completedat || null,
      }
    })
  }, [priorities, progressByKey])

  const summary = useMemo(() => {
    const counts = {
      total: priorityRows.length,
      completed: 0,
      in_progress: 0,
      blocked: 0,
      not_started: 0,
    }

    priorityRows.forEach((row) => {
      counts[row.status] += 1
    })

    return counts
  }, [priorityRows])

  async function savePriority(row, status, evidenceOverride) {
    if (!user?.id) {
      setError('Sign in before saving priority progress.')
      return
    }

    const previous = progressByKey[row.prioritykey]
    const evidence =
      evidenceOverride !== undefined
        ? evidenceOverride
        : evidenceDrafts[row.prioritykey] ?? row.evidence ?? ''

    const optimistic = {
      ...previous,
      userid: user.id,
      assessmentid: assessmentResults?.id || null,
      prioritykey: row.prioritykey,
      title: row.title,
      status,
      evidence: evidence || null,
      updatedat: new Date().toISOString(),
      completedat:
        status === 'completed'
          ? previous?.completedat || new Date().toISOString()
          : null,
    }

    setError('')
    setSavingKey(row.prioritykey)

    setPriorityProgress((items) => [
      optimistic,
      ...items.filter((item) => item?.prioritykey !== row.prioritykey),
    ])

    try {
      const saved = await savePriorityProgress(user.id, optimistic)

      setPriorityProgress((items) => [
        saved,
        ...items.filter((item) => item?.prioritykey !== row.prioritykey),
      ])

      setEvidenceDrafts((drafts) => ({
        ...drafts,
        [row.prioritykey]: saved?.evidence || '',
      }))
    } catch (saveError) {
      console.error('Failed to save priority progress', saveError)
      setError(
        saveError?.message ||
          'Priority progress could not be saved. Please try again.',
      )

      setPriorityProgress((items) => {
        const remaining = items.filter(
          (item) => item?.prioritykey !== row.prioritykey,
        )

        return previous ? [previous, ...remaining] : remaining
      })
    } finally {
      setSavingKey(null)
    }
  }

  function renderPriorityCard(row) {
    const meta = statusMeta(row.status)
    const isSaving = savingKey === row.prioritykey
    const draft = evidenceDrafts[row.prioritykey] ?? row.evidence

    return (
      <div
        key={row.prioritykey}
        className="p360-card"
        style={{
          padding: 18,
          borderLeft: `4px solid ${meta.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 9,
          }}
        >
          <div style={{ flex: 1, minWidth: 220 }}>
            <div
              style={{
                fontSize: 11,
                color: '#8B938B',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              Priority {row.index + 1}
            </div>

            <div
              style={{
                fontSize: 16,
                color: '#111111',
                fontWeight: 800,
                lineHeight: 1.35,
              }}
            >
              {row.title}
            </div>
          </div>

          <span
            style={{
              borderRadius: 999,
              border: `1px solid ${meta.border}`,
              background: meta.background,
              color: meta.color,
              fontSize: 11,
              fontWeight: 800,
              padding: '6px 9px',
            }}
          >
            {isSaving ? 'Saving…' : meta.label}
          </span>
        </div>

        <div
          style={{
            fontSize: 13,
            color: '#5F675F',
            lineHeight: 1.65,
            marginBottom: 14,
          }}
        >
          {row.rationale}
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 7,
            marginBottom: 14,
          }}
        >
          {[
            ['not_started', 'Not started'],
            ['in_progress', 'Start'],
            ['completed', 'Complete'],
            ['blocked', 'Blocked'],
          ].map(([status, label]) => {
            const active = row.status === status
            const statusStyle = statusMeta(status)

            return (
              <button
                key={status}
                type="button"
                disabled={isSaving}
                onClick={() => savePriority(row, status)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 9,
                  border: `1px solid ${
                    active ? statusStyle.border : '#D9DFD7'
                  }`,
                  background: active ? statusStyle.background : '#FFFFFF',
                  color: active ? statusStyle.color : '#5F675F',
                  cursor: isSaving ? 'wait' : 'pointer',
                  fontSize: 11.5,
                  fontWeight: 700,
                  opacity: isSaving ? 0.65 : 1,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        <label
          htmlFor={`evidence-${row.prioritykey}`}
          style={{
            display: 'block',
            color: '#5F675F',
            fontSize: 11.5,
            fontWeight: 800,
            marginBottom: 7,
          }}
        >
          Evidence, next step, or blocker
        </label>

        <textarea
          id={`evidence-${row.prioritykey}`}
          value={draft}
          onChange={(event) =>
            setEvidenceDrafts((drafts) => ({
              ...drafts,
              [row.prioritykey]: event.target.value,
            }))
          }
          placeholder="Record what changed, the next action, proof of progress, or what is blocking you."
          rows={4}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            resize: 'vertical',
            borderRadius: 10,
            border: '1px solid #D9DFD7',
            padding: '10px 11px',
            color: '#2A2F2A',
            fontFamily: 'inherit',
            fontSize: 12.5,
            lineHeight: 1.55,
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
            marginTop: 10,
          }}
        >
          <div style={{ color: '#8B938B', fontSize: 11.5 }}>
            {row.completedat
              ? `Completed ${formatDate(row.completedat)}`
              : 'Progress saves to your founder workspace.'}
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => savePriority(row, row.status, draft)}
            style={{
              padding: '9px 12px',
              borderRadius: 9,
              border: '1px solid #163A2C',
              background: '#163A2C',
              color: '#FFFFFF',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: isSaving ? 'wait' : 'pointer',
              opacity: isSaving ? 0.65 : 1,
            }}
          >
            Save note
          </button>
        </div>
      </div>
    )
  }

  if (!priorities.length && !loading) {
    return (
      <div className="p360-card" style={{ padding: 24 }}>
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            color: '#111111',
            marginBottom: 8,
          }}
        >
          Complete your founder diagnostic first
        </div>

        <div
          style={{
            color: '#5F675F',
            fontSize: 13,
            lineHeight: 1.7,
            marginBottom: 16,
          }}
        >
          Your Priority Progress workspace will be populated with the most
          important investor-readiness actions from your assessment.
        </div>

        <button
          type="button"
          onClick={() => navigate('/app/assessment')}
          className="p360-btn-primary"
        >
          Start assessment
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div
        className="p360-card"
        style={{
          padding: '20px 20px 18px',
          background: 'linear-gradient(180deg, #F4F8F5 0%, #FFFFFF 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div
              style={{
                color: '#4D6B57',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                marginBottom: 7,
              }}
            >
              Founder operating plan
            </div>

            <h2
              style={{
                margin: 0,
                color: '#111111',
                fontSize: 25,
                letterSpacing: '-0.035em',
                lineHeight: 1.2,
              }}
            >
              Priority Progress
            </h2>

            <p
              style={{
                maxWidth: 700,
                color: '#5F675F',
                fontSize: 13,
                lineHeight: 1.7,
                margin: '8px 0 0',
              }}
            >
              Turn your assessment into evidence-backed action. Update each
              priority as your venture progresses, then create a new assessment
              review when your evidence materially changes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/assessment?review=1')}
            style={{
              padding: '10px 13px',
              borderRadius: 10,
              border: '1px solid #163A2C',
              background: '#163A2C',
              color: '#FFFFFF',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Update assessment
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {[
            ['Total priorities', summary.total, '#111111', '#F7F8F5'],
            ['In progress', summary.in_progress, '#8A5A00', '#FFF8E8'],
            ['Blocked', summary.blocked, '#9A3D30', '#FCEDEA'],
            ['Completed', summary.completed, '#176A40', '#EAF5ED'],
          ].map(([label, value, color, background]) => (
            <div
              key={label}
              style={{
                borderRadius: 12,
                background,
                padding: '12px 13px',
                border: '1px solid rgba(217,223,215,0.8)',
              }}
            >
              <div
                style={{
                  color: '#7A827A',
                  fontSize: 10.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  fontWeight: 800,
                  marginBottom: 5,
                }}
              >
                {label}
              </div>

              <div
                style={{
                  color,
                  fontSize: 22,
                  lineHeight: 1,
                  fontWeight: 800,
                }}
              >
                {loading ? '—' : value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          style={{
            background: '#FCEDEA',
            border: '1px solid #F1C9C2',
            borderRadius: 12,
            padding: 12,
            color: '#9A3D30',
            fontSize: 12.5,
          }}
        >
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="p360-card" style={{ padding: 20, color: '#8B938B' }}>
          Loading your priority progress…
        </div>
      ) : (
        <>
          {[
            ['in_progress', 'In progress', 'Keep momentum on the actions currently underway.'],
            ['blocked', 'Blocked', 'Capture what is preventing progress so you can address it deliberately.'],
            ['not_started', 'Not started', 'Choose the next highest-impact action to begin.'],
            ['completed', 'Completed', 'Keep the evidence here for your next assessment review.'],
          ].map(([status, label, description]) => {
            const rows = priorityRows.filter((row) => row.status === status)

            if (!rows.length) return null

            return (
              <section key={status}>
                <div style={{ margin: '2px 0 10px' }}>
                  <div
                    style={{
                      color: '#111111',
                      fontSize: 15,
                      fontWeight: 800,
                      marginBottom: 3,
                    }}
                  >
                    {label} ({rows.length})
                  </div>

                  <div style={{ color: '#8B938B', fontSize: 12 }}>
                    {description}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 12 }}>
                  {rows.map(renderPriorityCard)}
                </div>
              </section>
            )
          })}
        </>
      )}
    </div>
  )
}