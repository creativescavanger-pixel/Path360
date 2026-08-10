import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { getDocuments } from '../lib/supabaseClient.js'
import { getStudioDocuments } from '../lib/studioDocuments.js'

function safeNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeResults(results) {
  if (!results) return null

  return {
    founderscore: safeNumber(results.founderscore),
    investorreadiness: safeNumber(results.investorreadiness),
    strategicclarity: safeNumber(results.strategicclarity),
    executionreadiness: safeNumber(results.executionreadiness),
    financialmaturity: safeNumber(results.financialmaturity),
    marketunderstanding: safeNumber(results.marketunderstanding),
    teamstrength: safeNumber(results.teamstrength),
    productclarity: safeNumber(results.productclarity),
    growthpotential: safeNumber(results.growthpotential),
    riskawareness: safeNumber(results.riskawareness),
    venturestage:
      results.venturestageresult ||
      results.venturestage ||
      'unknown',
    strategicpriorities: Array.isArray(results.strategicpriorities)
      ? results.strategicpriorities
      : [],
    founderstrengths: Array.isArray(results.founderstrengths)
      ? results.founderstrengths
      : [],
    criticalgaps: Array.isArray(results.criticalgaps)
      ? results.criticalgaps
      : [],
    vcverdict: results.vcverdict || '',
    investornarrative: results.investornarrative || '',
    riskanalysis: results.riskanalysis || {},
    rawqa: Array.isArray(results.rawqa) ? results.rawqa : [],
  }
}

function ScoreRing({ score = 0, label, tone = '#1A7A4A', size = 86 }) {
  const radius = 28
  const stroke = 6
  const normalized = Math.max(0, Math.min(100, safeNumber(score)))
  const circumference = 2 * Math.PI * radius
  const dash = (normalized / 100) * circumference

  return (
    <div
      className="score-reveal"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#D9DFD7"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={tone}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference - dash}`}
          />
        </svg>

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#111111',
              lineHeight: 1,
            }}
          >
            {normalized}
          </div>

          <div
            style={{
              fontSize: 9.5,
              color: '#8B938B',
              marginTop: 4,
            }}
          >
            /100
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          fontSize: 11,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: '#7A827A',
          fontWeight: 600,
          textAlign: 'center',
        }}
      >
        {label}
      </div>
    </div>
  )
}

function RadarChart({ data, size = 220 }) {
  if (!data?.length) return null

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.34
  const n = data.length
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2

  const polygonPath = (level) =>
    data
      .map((_, i) => {
        const a = angle(i)
        const x = cx + Math.cos(a) * r * level
        const y = cy + Math.sin(a) * r * level

        return `${i === 0 ? 'M' : 'L'}${x} ${y}`
      })
      .join(' ') + ' Z'

  const dataPath =
    data
      .map((d, i) => {
        const a = angle(i)
        const value =
          Math.max(0, Math.min(100, safeNumber(d.value))) / 100
        const x = cx + Math.cos(a) * r * value
        const y = cy + Math.sin(a) * r * value

        return `${i === 0 ? 'M' : 'L'}${x} ${y}`
      })
      .join(' ') + ' Z'

  return (
    <svg width={size} height={size} style={{ overflow: 'visible' }}>
      {[0.25, 0.5, 0.75, 1].map((level, i) => (
        <path
          key={i}
          d={polygonPath(level)}
          fill="none"
          stroke="#D9DFD7"
          strokeWidth={i === 3 ? 1 : 0.8}
        />
      ))}

      {data.map((_, i) => {
        const a = angle(i)
        const x = cx + Math.cos(a) * r
        const y = cy + Math.sin(a) * r

        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#E2E7E1"
            strokeWidth="1"
          />
        )
      })}

      <path
        d={dataPath}
        fill="rgba(26,122,74,0.14)"
        stroke="#1A7A4A"
        strokeWidth="2"
      />

      {data.map((d, i) => {
        const a = angle(i)
        const value =
          Math.max(0, Math.min(100, safeNumber(d.value))) / 100
        const px = cx + Math.cos(a) * r * value
        const py = cy + Math.sin(a) * r * value
        const lx = cx + Math.cos(a) * (r + 22)
        const ly = cy + Math.sin(a) * (r + 22)

        return (
          <g key={d.label}>
            <circle cx={px} cy={py} r="3.2" fill="#1A7A4A" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="9.5"
              fill="#7A827A"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function buildQuestionThemes(rawqa = []) {
  const themes = {
    strategy: [],
    execution: [],
    investor: [],
    marketProduct: [],
    teamGrowth: [],
  }

  rawqa.forEach((qa) => {
    const q = (qa?.question || '').toLowerCase()

    if (!q) return

    if (
      q.includes('vision') ||
      q.includes('strategy') ||
      q.includes('positioning') ||
      q.includes('north star')
    ) {
      themes.strategy.push(qa)
    } else if (
      q.includes('execution') ||
      q.includes('roadmap') ||
      q.includes('milestone') ||
      q.includes('delivery')
    ) {
      themes.execution.push(qa)
    } else if (
      q.includes('investor') ||
      q.includes('funding') ||
      q.includes('round') ||
      q.includes('runway')
    ) {
      themes.investor.push(qa)
    } else if (
      q.includes('market') ||
      q.includes('customer') ||
      q.includes('product') ||
      q.includes('traction')
    ) {
      themes.marketProduct.push(qa)
    } else if (
      q.includes('team') ||
      q.includes('hiring') ||
      q.includes('talent') ||
      q.includes('growth')
    ) {
      themes.teamGrowth.push(qa)
    } else {
      themes.strategy.push(qa)
    }
  })

  return themes
}

function EmptyInline({ text = 'No data available yet.' }) {
  return (
    <div
      style={{
        fontSize: 12.5,
        color: '#8B938B',
        lineHeight: 1.6,
        padding: '10px 0',
      }}
    >
      {text}
    </div>
  )
}

function getField(record, ...keys) {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null) {
      return record[key]
    }
  }

  return null
}

function prettifyDocType(docType = '') {
  return String(docType || '')
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function prettifyStage(stage = '') {
  return String(stage || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

export default function Dashboard() {
  const navigate = useNavigate()

  const rawResults = useDiagnosticStore((s) => s.assessmentResults)
  const profile = useDiagnosticStore((s) => s.founderProfile)
  const documents = useDiagnosticStore((s) => s.documents)
  const setDocuments = useDiagnosticStore((s) => s.setDocuments)
  const user = useDiagnosticStore((s) => s.user)
  const stageAssessment = useDiagnosticStore((s) => s.stageAssessment)

  const [activeTab, setActiveTab] = useState('overview')
  const [studioDocs, setStudioDocs] = useState([])

  useEffect(() => {
    let cancelled = false

    async function loadDocs() {
      if (!user?.id) return

      try {
        const rows = await getDocuments(user.id)

        if (!cancelled) {
          setDocuments(rows)
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error)
        }
      }
    }

    loadDocs()

    return () => {
      cancelled = true
    }
  }, [user?.id, setDocuments])

  useEffect(() => {
    let cancelled = false

    async function loadStudioDocs() {
      if (!user?.id) return

      try {
        const rows = await getStudioDocuments(user.id)

        if (!cancelled) {
          setStudioDocs(rows || [])
        }
      } catch (error) {
        if (!cancelled) {
          console.error(error)
        }
      }
    }

    loadStudioDocs()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const results = useMemo(() => normalizeResults(rawResults), [rawResults])

  const radarData = useMemo(() => {
    if (!results) return []

    return [
      { label: 'Strategy', value: results.strategicclarity },
      { label: 'Investor', value: results.investorreadiness },
      { label: 'Execution', value: results.executionreadiness },
      { label: 'Finance', value: results.financialmaturity },
      { label: 'Market', value: results.marketunderstanding },
      { label: 'Product', value: results.productclarity },
      { label: 'Team', value: results.teamstrength },
      { label: 'Growth', value: results.growthpotential },
    ]
  }, [results])

  const questionThemes = useMemo(
    () => buildQuestionThemes(results?.rawqa || []),
    [results]
  )

  const recentItems = useMemo(() => {
    const generated = (documents || []).map((doc) => ({
      id: `generated-${doc.id}`,
      source: 'generated',
      title: doc.title || doc.doctype || 'Untitled document',
      type: doc.doctype || 'Document',
      updated: doc.createdat || null,
      raw: doc,
    }))

    const drafts = (studioDocs || []).map((doc) => ({
      id: `studio-${getField(doc, 'id')}`,
      source: 'studio',
      title: getField(doc, 'title') || 'Untitled Studio draft',
      type: prettifyDocType(
        getField(doc, 'docType', 'doc_type', 'doctype') ||
          'studio_document'
      ),
      updated: getField(doc, 'updatedAt', 'updated_at', 'updatedat'),
      raw: doc,
    }))

    return [...drafts, ...generated]
      .sort(
        (a, b) =>
          new Date(b.updated || 0) - new Date(a.updated || 0)
      )
      .slice(0, 4)
  }, [documents, studioDocs])

  if (!results) {
    const founderName =
      profile?.fullname ||
      profile?.foundername ||
      'Founder'

    const ventureName =
      profile?.venturename ||
      profile?.venture_name ||
      'your venture'

    return (
      <div
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        <div
          className="p360-card"
          style={{
            padding: '26px 24px 22px',
            background:
              'linear-gradient(180deg, #FCFBF8 0%, #F9F7F2 100%)',
            borderRadius: 24,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#4D6B57',
              marginBottom: 10,
            }}
          >
            Welcome back
          </div>

          <h1
            style={{
              margin: '0 0 8px',
              fontSize: 28,
              lineHeight: 1.2,
              letterSpacing: '-0.04em',
              color: '#111111',
              fontWeight: 800,
            }}
          >
            {founderName}, let’s baseline {ventureName}.
          </h1>

          <p
            style={{
              fontSize: 14.5,
              color: '#5F675F',
              lineHeight: 1.8,
              maxWidth: 620,
              margin: '0 0 18px',
            }}
          >
            PATH360 will run a short, adaptive assessment to understand your
            venture, then give you an investor-style readout and priorities.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <button
              className="p360-btn-primary"
              onClick={() => navigate('/app/assessment')}
              style={{ minWidth: 210 }}
            >
              Start Assessment
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/stage-onboarding')}
              style={{
                minWidth: 170,
                padding: '11px 16px',
                borderRadius: 12,
                border: '1px solid #D9DFD7',
                background: '#FFFFFF',
                color: '#1A7A4A',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Re-baseline my stage
            </button>

            <div
              style={{
                fontSize: 12.5,
                color: '#8B938B',
              }}
            >
              Takes about 12–15 minutes. You can pause and resume.
            </div>
          </div>
        </div>

        <div className="p360-card" style={{ padding: 20 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111111',
              marginBottom: 6,
            }}
          >
            Command Center
          </div>

          <div
            style={{
              fontSize: 12.5,
              color: '#8B938B',
            }}
          >
            Once the assessment is complete, this space will show your scores,
            explanations, and evidence from your own answers.
          </div>
        </div>
      </div>
    )
  }

  const scoreCards = [
    {
      score: results.investorreadiness,
      label: 'Investor Ready',
      color: '#1A7A4A',
    },
    {
      score: results.founderscore,
      label: 'Founder Score',
      color: '#111111',
    },
    {
      score: results.executionreadiness,
      label: 'Execution',
      color: '#215F46',
    },
    {
      score: results.financialmaturity,
      label: 'Financial',
      color: '#3A4A3F',
    },
  ]

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'strategy', label: 'Strategy' },
    { key: 'execution', label: 'Execution' },
    { key: 'investor', label: 'Investor Readiness' },
    { key: 'founder', label: 'Founder Intelligence' },
  ]

  const renderOverview = () => (
    <>
      <div
        className="fade-up-2"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 12,
        }}
      >
        {scoreCards.map((card) => (
          <div
            key={card.label}
            className="p360-card"
            style={{
              padding: '22px 18px 18px',
              minHeight: 146,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ScoreRing
              score={card.score}
              label={card.label}
              tone={card.color}
            />
          </div>
        ))}
      </div>

      <div
        className="fade-up-3"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 14,
        }}
      >
        <div className="p360-card" style={{ padding: 16, minHeight: 280 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111111',
              marginBottom: 16,
            }}
          >
            Venture Radar
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <RadarChart data={radarData} size={230} />
          </div>
        </div>

        <div className="p360-card" style={{ padding: 16, minHeight: 280 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111111',
              marginBottom: 4,
            }}
          >
            Strategic priorities
          </div>

          <div
            style={{
              fontSize: 11.5,
              color: '#8B938B',
              marginBottom: 14,
            }}
          >
            Personalized from your answers and ranked by investor impact.
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {results.strategicpriorities.length ? (
              results.strategicpriorities.slice(0, 4).map((priority, index) => (
                <div
                  key={`${priority?.priority || 'priority'}-${index}`}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    padding: '10px 0',
                    borderTop:
                      index === 0 ? 'none' : '1px solid #EEF2EE',
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 8,
                      background: '#F1F4F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#1A7A4A',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: '#111111',
                        marginBottom: 4,
                      }}
                    >
                      {priority?.priority || 'Priority'}
                    </div>

                    <div
                      style={{
                        fontSize: 12,
                        color: '#5F675F',
                        lineHeight: 1.6,
                      }}
                    >
                      {priority?.rationale || 'No rationale available.'}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyInline text="No strategic priorities were returned for this assessment yet." />
            )}
          </div>
        </div>
      </div>

      <div
        className="fade-up-4"
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 14,
        }}
      >
        <div className="p360-card" style={{ padding: 16, minHeight: 220 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111111',
              marginBottom: 10,
            }}
          >
            Founder strengths
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {results.founderstrengths.length ? (
              results.founderstrengths.slice(0, 4).map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      marginTop: 7,
                      borderRadius: '50%',
                      background: '#1A7A4A',
                      flexShrink: 0,
                    }}
                  />

                  <div
                    style={{
                      fontSize: 13,
                      color: '#2A2F2A',
                      lineHeight: 1.6,
                    }}
                  >
                    {item}
                  </div>
                </div>
              ))
            ) : (
              <EmptyInline text="No founder strengths were recorded yet." />
            )}
          </div>
        </div>

        <div className="p360-card" style={{ padding: 16, minHeight: 220 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111111',
              marginBottom: 10,
            }}
          >
            VC verdict
          </div>

          <div
            style={{
              background: '#F4F8F5',
              border: '1px solid #DDE7DF',
              borderRadius: 12,
              padding: 14,
              fontSize: 13,
              color: '#2A2F2A',
              lineHeight: 1.7,
            }}
          >
            {results.vcverdict || 'No investor verdict available yet.'}
          </div>
        </div>
      </div>
    </>
  )
    const renderStrategy = () => (
    <div className="p360-card" style={{ padding: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#111111', marginBottom: 10 }}>
        Strategic diagnosis
      </div>

      <div
        style={{
          fontSize: 14,
          color: '#2A2F2A',
          lineHeight: 1.75,
          marginBottom: 18,
        }}
      >
        {results.investornarrative || 'No strategic narrative available yet.'}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#5F675F',
          marginBottom: 10,
        }}
      >
        Questions that shaped your strategy score
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {questionThemes.strategy.length ? (
          questionThemes.strategy.slice(0, 4).map((qa, index) => (
            <div
              key={index}
              style={{
                background: '#F7F8F5',
                border: '1px solid #E4E8E3',
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: '#8B938B',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Question
              </div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#111111',
                  lineHeight: 1.5,
                  marginBottom: 6,
                }}
              >
                {qa?.question}
              </div>

              <div style={{ fontSize: 12.5, color: '#5F675F', lineHeight: 1.65 }}>
                {qa?.answer}
              </div>
            </div>
          ))
        ) : (
          <EmptyInline text="No strategy-specific question evidence was identified." />
        )}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#5F675F',
          marginBottom: 10,
        }}
      >
        Top strategic gaps
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {results.criticalgaps.length ? (
          results.criticalgaps.map((gap, index) => (
            <div
              key={index}
              style={{
                background: '#F7F8F5',
                border: '1px solid #E4E8E3',
                borderRadius: 12,
                padding: 12,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {gap}
            </div>
          ))
        ) : (
          <EmptyInline text="No critical gaps were generated for this assessment." />
        )}
      </div>
    </div>
  )

  const renderExecution = () => {
    const executionItems = questionThemes.execution.length
      ? questionThemes.execution
      : results.rawqa

    return (
      <div className="p360-card" style={{ padding: 18 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#111111',
            marginBottom: 12,
          }}
        >
          Execution evidence from your assessment
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {executionItems.length ? (
            executionItems.slice(0, 5).map((qa, index) => (
              <div
                key={index}
                style={{
                  background: '#F7F8F5',
                  border: '1px solid #E4E8E3',
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: '#8B938B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                    marginBottom: 6,
                  }}
                >
                  Question
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#111111',
                    lineHeight: 1.5,
                    marginBottom: 6,
                  }}
                >
                  {qa?.question}
                </div>

                <div style={{ fontSize: 12.5, color: '#5F675F', lineHeight: 1.65 }}>
                  {qa?.answer}
                </div>
              </div>
            ))
          ) : (
            <EmptyInline text="No execution-related evidence is available yet." />
          )}
        </div>
      </div>
    )
  }

  const renderInvestor = () => (
    <div className="p360-card" style={{ padding: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#111111', marginBottom: 10 }}>
        Investor readiness
      </div>

      <div
        style={{
          fontSize: 34,
          fontWeight: 800,
          color: '#111111',
          lineHeight: 1,
          marginBottom: 12,
        }}
      >
        {results.investorreadiness}%
      </div>

      <div
        style={{
          background: '#F4F8F5',
          border: '1px solid #DDE7DF',
          borderRadius: 12,
          padding: 14,
          fontSize: 13,
          color: '#2A2F2A',
          lineHeight: 1.7,
          marginBottom: 14,
        }}
      >
        {results.vcverdict || 'No investor verdict available yet.'}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 18,
          padding: 14,
          borderRadius: 12,
          background: '#FCF8EE',
          border: '1px solid #EEE4C9',
        }}
      >
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#111111', marginBottom: 4 }}>
            Guided investor memo prep
          </div>

          <div style={{ fontSize: 12.5, color: '#5F675F', lineHeight: 1.6, maxWidth: 520 }}>
            Answer a short set of investor-facing questions before generating
            your one-pager.
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/app/studio/prep/investor_memo')}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            border: '1px solid #163A2C',
            background: '#163A2C',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: 12.5,
            whiteSpace: 'nowrap',
          }}
        >
          Start memo prep
        </button>
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#5F675F',
          marginBottom: 10,
        }}
      >
        Questions that shaped investor readiness
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {questionThemes.investor.length ? (
          questionThemes.investor.slice(0, 3).map((qa, index) => (
            <div
              key={index}
              style={{
                background: '#F7F8F5',
                border: '1px solid #E4E8E3',
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#111111',
                  marginBottom: 5,
                }}
              >
                {qa?.question}
              </div>

              <div style={{ fontSize: 12.5, color: '#5F675F', lineHeight: 1.65 }}>
                {qa?.answer}
              </div>
            </div>
          ))
        ) : (
          <EmptyInline text="No investor-specific question evidence was identified." />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
        {[
          ['Strategic Clarity', results.strategicclarity],
          ['Execution Readiness', results.executionreadiness],
          ['Financial Maturity', results.financialmaturity],
          ['Market Understanding', results.marketunderstanding],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              background: '#F7F8F5',
              border: '1px solid #E4E8E3',
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div style={{ fontSize: 11, color: '#8B938B', marginBottom: 6 }}>
              {label}
            </div>

            <div style={{ fontSize: 20, fontWeight: 700, color: '#111111' }}>
              {value}/100
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderFounder = () => (
    <div className="p360-card" style={{ padding: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#111111', marginBottom: 10 }}>
        Founder intelligence baseline
      </div>

      <div
        style={{
          fontSize: 14,
          color: '#2A2F2A',
          lineHeight: 1.75,
          marginBottom: 14,
        }}
      >
        This baseline has now been stored so PATH360 can compare future
        assessments against this point in time and show how the founder has
        progressed.
      </div>

      <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
        {results.founderstrengths.length ? (
          results.founderstrengths.map((item, index) => (
            <div
              key={index}
              style={{
                background: '#F7F8F5',
                border: '1px solid #E4E8E3',
                borderRadius: 12,
                padding: 12,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              {item}
            </div>
          ))
        ) : (
          <EmptyInline text="No founder baseline strengths were stored yet." />
        )}
      </div>

      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: '#5F675F',
          marginBottom: 10,
        }}
      >
        Questions related to team & growth
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questionThemes.teamGrowth.length ? (
          questionThemes.teamGrowth.slice(0, 4).map((qa, index) => (
            <div
              key={index}
              style={{
                background: '#F7F8F5',
                border: '1px solid #E4E8E3',
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#111111',
                  marginBottom: 5,
                }}
              >
                {qa?.question}
              </div>

              <div style={{ fontSize: 12.5, color: '#5F675F', lineHeight: 1.65 }}>
                {qa?.answer}
              </div>
            </div>
          ))
        ) : (
          <EmptyInline text="No team or growth-related questions were identified." />
        )}
      </div>
    </div>
  )

  const founderName =
    profile?.fullname ||
    profile?.foundername ||
    'Founder'

  const ventureName =
    profile?.venturename ||
    profile?.venture_name ||
    'your venture'

  const onboardingStage =
    stageAssessment?.diagnosedStage ||
    stageAssessment?.declaredStage ||
    null

  const stageToDisplay = prettifyStage(
    onboardingStage ||
      results.venturestage ||
      'unknown'
  )

  const stageUpdatedLabel = stageAssessment?.completedAt
    ? stageAssessment.completedAt.slice(0, 10)
    : 'Not completed yet'

  return (
    <div
      style={{
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div
        className="fade-up"
        style={{
          display: 'flex',
          gap: 2,
          background: '#FFFFFF',
          border: '1px solid #D9DFD7',
          borderRadius: 12,
          padding: 4,
          width: 'fit-content',
          flexWrap: 'wrap',
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '8px 14px',
                borderRadius: 9,
                border: 'none',
                background: active ? '#111111' : 'transparent',
                color: active ? '#FFFFFF' : '#5F675F',
                fontSize: 12.5,
                fontWeight: active ? 700 : 600,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        className="fade-up-1"
        style={{
          background: 'linear-gradient(180deg, #163a2d 0%, #111111 100%)',
          borderRadius: 18,
          padding: '22px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          justifyContent: 'space-between',
          color: '#FFFFFF',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10.5,
              color: 'rgba(255,255,255,0.6)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: 8,
            }}
          >
            {ventureName}
          </div>

          <div
            style={{
              fontSize: 24,
              lineHeight: 1.2,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            Welcome, {founderName}. Your venture is {results.investorreadiness}% investor ready.
          </div>

          <div
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.7)',
              marginBottom: 8,
            }}
          >
            Stage: {stageToDisplay} · {results.strategicpriorities.length} priorities identified
          </div>

          <div
            style={{
              marginTop: 10,
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
              Stage baseline: <span style={{ fontWeight: 600 }}>{stageUpdatedLabel}</span>
            </div>

            <button
              type="button"
              onClick={() => navigate('/app/stage-onboarding')}
              style={{
                padding: '7px 12px',
                borderRadius: 9,
                border: '1px solid rgba(255,255,255,0.5)',
                background: 'rgba(255,255,255,0.06)',
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Re-baseline my stage
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('/app/assessment?restart=1')}
          style={{
            padding: '11px 18px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.04)',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
        >
          Improve Assessment
        </button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'strategy' && renderStrategy()}
      {activeTab === 'execution' && renderExecution()}
      {activeTab === 'investor' && renderInvestor()}
      {activeTab === 'founder' && renderFounder()}

      <div className="p360-card" style={{ padding: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>
              Recent Documents
            </div>

            <div style={{ fontSize: 11.5, color: '#8B938B', marginTop: 3 }}>
              Generated documents and Studio drafts
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/app/reports')}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#5F675F',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              View library
            </button>

            <button
              onClick={() => navigate('/app/studio')}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#1A7A4A',
                fontWeight: 700,
                fontSize: 12.5,
                cursor: 'pointer',
              }}
            >
              Create new
            </button>
          </div>
        </div>

        {recentItems?.length ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {recentItems.map((item, index) => (
              <div
                key={item.id || index}
                style={{
                  borderTop: index === 0 ? 'none' : '1px solid #EEF2EE',
                  paddingTop: index === 0 ? 0 : 10,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#111111',
                      marginBottom: 3,
                    }}
                  >
                    {item.title}
                  </div>

                  <div style={{ fontSize: 11.5, color: '#8B938B' }}>
                    {item.type}
                  </div>
                </div>

                {item.source === 'studio' ? (
                  <button
                    onClick={() =>
                      navigate(
                        `/app/reports?studioDraft=${getField(item.raw, 'id')}`
                      )
                    }
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#1A7A4A',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Review
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/app/reports')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#1A7A4A',
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Open
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '26px 10px 18px',
              color: '#8B938B',
              fontSize: 13,
            }}
          >
            No documents yet.{' '}

            <button
              onClick={() => navigate('/app/studio')}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#1A7A4A',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Create one now
            </button>
          </div>
        )}
      </div>

      <div className="p360-card" style={{ padding: 16 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>
              Assessment Q&A history
            </div>

            <div style={{ fontSize: 11.5, color: '#8B938B', marginTop: 3 }}>
              Every question and answer used in this assessment run.
            </div>
          </div>

          <button
            onClick={() => navigate('/app/assessment?restart=1')}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#1A7A4A',
              fontWeight: 700,
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Improve answers
          </button>
        </div>

        {results.rawqa?.length ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {results.rawqa.map((qa, index) => (
              <div
                key={`${index}-${qa?.question || 'question'}`}
                style={{
                  borderTop: index === 0 ? 'none' : '1px solid #EEF2EE',
                  paddingTop: index === 0 ? 0 : 10,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: '#8B938B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 700,
                    marginBottom: 4,
                  }}
                >
                  Question {index + 1}
                </div>

                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: '#111111',
                    marginBottom: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {qa?.question}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: '#5F675F',
                    lineHeight: 1.7,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {qa?.answer}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#8B938B', paddingTop: 10 }}>
            No stored interview details for this assessment.
          </div>
        )}
      </div>
    </div>
  )
}