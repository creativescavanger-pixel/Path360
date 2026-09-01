import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  getDocuments,
  getPriorityProgress,
  savePriorityProgress,
} from '../lib/supabaseClient.js'
import { getStudioDocuments } from '../lib/studioDocuments.js'

function safeNumber(value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

function normalizeResults(results) {
  if (!results) return null

  return {
    id: results.id || null,
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
      results.venturestageresult || results.venturestage || 'unknown',
    assessmenttype:
      results.assessmenttype || results.assessment_type || 'baseline',
    versionnumber: safeNumber(
      results.versionnumber ?? results.version_number,
      1,
    ),
    createdat:
      results.createdat ||
      results.created_at ||
      results.completedat ||
      results.completed_at ||
      null,
    completedat:
      results.completedat ||
      results.completed_at ||
      results.createdat ||
      results.created_at ||
      null,
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

function priorityKeyFromTitle(title, index = 0) {
  const normalized = String(title || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return normalized || `priority-${index + 1}`
}

function priorityStatusMeta(status) {
  const statuses = {
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

  return statuses[status] || statuses.not_started
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
          <div style={{ fontSize: 9.5, color: '#8B938B', marginTop: 4 }}>
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
        const value = Math.max(0, Math.min(100, safeNumber(d.value))) / 100
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
        const value = Math.max(0, Math.min(100, safeNumber(d.value))) / 100
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

function formatAssessmentDate(value) {
  if (!value) return 'Date unavailable'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function deltaLabel(value) {
  const delta = safeNumber(value)
  if (delta > 0) return `+${delta}`
  if (delta < 0) return String(delta)
  return 'No change'
}

function deltaTone(value) {
  if (value > 0) return '#1A7A4A'
  if (value < 0) return '#9A3D30'
  return '#7A827A'
}

export default function Dashboard() {
  const navigate = useNavigate()

  const rawResults = useDiagnosticStore((s) => s.assessmentResults)
  const assessmentHistory = useDiagnosticStore((s) => s.assessmentHistory)
  const profile = useDiagnosticStore((s) => s.founderProfile)
  const documents = useDiagnosticStore((s) => s.documents)
  const setDocuments = useDiagnosticStore((s) => s.setDocuments)
  const user = useDiagnosticStore((s) => s.user)
  const stageAssessment = useDiagnosticStore((s) => s.stageAssessment)
  const storePriorityProgress = useDiagnosticStore((s) => s.priorityProgress)

  const [activeTab, setActiveTab] = useState('overview')
  const [studioDocs, setStudioDocs] = useState([])
  const [priorityProgress, setPriorityProgress] = useState([])
  const [savingPriorityKey, setSavingPriorityKey] = useState(null)
  const [priorityError, setPriorityError] = useState('')
  const [expandedPriorityKey, setExpandedPriorityKey] = useState(null)
  const [evidenceDrafts, setEvidenceDrafts] = useState({})

  useEffect(() => {
    let cancelled = false

    async function loadDocs() {
      if (!user?.id) return
      try {
        const rows = await getDocuments(user.id)
        if (!cancelled) setDocuments(rows)
      } catch (error) {
        if (!cancelled) console.error(error)
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
        if (!cancelled) setStudioDocs(rows || [])
      } catch (error) {
        if (!cancelled) console.error(error)
      }
    }

    loadStudioDocs()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    let cancelled = false

    async function loadPriorityProgress() {
      if (!user?.id) {
        if (!cancelled) setPriorityProgress([])
        return
      }

      const fromStore = Array.isArray(storePriorityProgress)
        ? storePriorityProgress
        : []

      if (fromStore.length) {
        if (!cancelled) setPriorityProgress(fromStore)
        return
      }

      try {
        const rows = await getPriorityProgress(user.id)
        if (!cancelled) setPriorityProgress(rows || [])
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load priority progress', error)
          setPriorityError('Priority progress could not be loaded yet.')
        }
      }
    }

    loadPriorityProgress()
    return () => {
      cancelled = true
    }
  }, [user?.id, storePriorityProgress])

  const results = useMemo(() => normalizeResults(rawResults), [rawResults])

  const normalizedHistory = useMemo(() => {
    const byId = new Map()

    ;[...(assessmentHistory || []), rawResults]
      .filter(Boolean)
      .forEach((assessment, index) => {
        const normalized = normalizeResults(assessment)
        if (!normalized) return

        const key =
          normalized.id ||
          `${normalized.versionnumber}-${normalized.createdat || index}`
        byId.set(key, normalized)
      })

    return [...byId.values()].sort((a, b) => {
      const versionDifference =
        safeNumber(b.versionnumber) - safeNumber(a.versionnumber)
      if (versionDifference !== 0) return versionDifference

      return (
        new Date(b.completedat || b.createdat || 0) -
        new Date(a.completedat || a.createdat || 0)
      )
    })
  }, [assessmentHistory, rawResults])

  const progressComparison = useMemo(() => {
    if (!results || normalizedHistory.length < 2) return null

    const current = normalizedHistory[0]
    const previous = normalizedHistory[1]
    const baseline = normalizedHistory[normalizedHistory.length - 1]

    const dimensions = [
      { key: 'investorreadiness', label: 'Investor readiness' },
      { key: 'strategicclarity', label: 'Strategy' },
      { key: 'executionreadiness', label: 'Execution' },
      { key: 'financialmaturity', label: 'Financial maturity' },
      { key: 'marketunderstanding', label: 'Market understanding' },
      { key: 'productclarity', label: 'Product clarity' },
      { key: 'teamstrength', label: 'Team strength' },
      { key: 'growthpotential', label: 'Growth potential' },
    ].map((dimension) => {
      const currentScore = safeNumber(current[dimension.key])
      const previousScore = safeNumber(previous[dimension.key])
      const baselineScore = safeNumber(baseline[dimension.key])

      return {
        ...dimension,
        current: currentScore,
        previous: previousScore,
        baseline: baselineScore,
        change: currentScore - previousScore,
        changeFromBaseline: currentScore - baselineScore,
      }
    })

    const rankedByImprovement = [...dimensions].sort((a, b) => b.change - a.change)
    const rankedByCurrentScore = [...dimensions].sort((a, b) => a.current - b.current)

    return {
      current,
      previous,
      baseline,
      dimensions,
      mostImproved: rankedByImprovement[0],
      nextFocus: rankedByCurrentScore[0],
    }
  }, [normalizedHistory, results])

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
    [results],
  )

  const priorityProgressByKey = useMemo(() => {
    return (priorityProgress || []).reduce((map, item) => {
      if (item?.prioritykey) map[item.prioritykey] = item
      return map
    }, {})
  }, [priorityProgress])

  const prioritySummary = useMemo(() => {
    const priorities = results?.strategicpriorities?.slice(0, 4) || []
    const completed = priorities.filter((priority, index) => {
      const key = priorityKeyFromTitle(priority?.priority, index)
      return priorityProgressByKey[key]?.status === 'completed'
    }).length

    return { total: priorities.length, completed }
  }, [results?.strategicpriorities, priorityProgressByKey])

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
        getField(doc, 'docType', 'doc_type', 'doctype') || 'studio_document',
      ),
      updated: getField(doc, 'updatedAt', 'updated_at', 'updatedat'),
      raw: doc,
    }))

    return [...drafts, ...generated]
      .sort((a, b) => new Date(b.updated || 0) - new Date(a.updated || 0))
      .slice(0, 4)
  }, [documents, studioDocs])

  async function updatePriority(priority, index, nextStatus, evidenceOverride) {
    if (!user?.id) {
      setPriorityError('Sign in before saving priority progress.')
      return
    }

    const title = priority?.priority || `Priority ${index + 1}`
    const prioritykey = priorityKeyFromTitle(title, index)
    const current = priorityProgressByKey[prioritykey]
    const evidence =
      evidenceOverride !== undefined
        ? evidenceOverride
        : evidenceDrafts[prioritykey] ?? current?.evidence ?? ''

    const optimistic = {
      ...current,
      userid: user.id,
      assessmentid: results?.id || null,
      prioritykey,
      title,
      status: nextStatus,
      evidence: evidence || null,
      updatedat: new Date().toISOString(),
      completedat:
        nextStatus === 'completed'
          ? current?.completedat || new Date().toISOString()
          : null,
    }

    setPriorityError('')
    setSavingPriorityKey(prioritykey)
    setPriorityProgress((items) => {
      const rest = (items || []).filter(
        (item) => item?.prioritykey !== prioritykey,
      )
      return [optimistic, ...rest]
    })

    try {
      const saved = await savePriorityProgress(user.id, optimistic)
      setPriorityProgress((items) => {
        const rest = (items || []).filter(
          (item) => item?.prioritykey !== prioritykey,
        )
        return [saved, ...rest]
      })
      setEvidenceDrafts((drafts) => ({
        ...drafts,
        [prioritykey]: saved?.evidence || '',
      }))
    } catch (error) {
      console.error('Failed to save priority progress', error)
      setPriorityError(
        error?.message || 'Priority progress could not be saved. Please try again.',
      )
      setPriorityProgress((items) => {
        const rest = (items || []).filter(
          (item) => item?.prioritykey !== prioritykey,
        )
        return current ? [current, ...rest] : rest
      })
    } finally {
      setSavingPriorityKey(null)
    }
  }

  if (!results) {
    const founderName = profile?.fullname || profile?.foundername || 'Founder'
    const ventureName =
      profile?.venturename || profile?.venture_name || 'your venture'

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
            background: 'linear-gradient(180deg, #FCFBF8 0%, #F9F7F2 100%)',
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

            <div style={{ fontSize: 12.5, color: '#8B938B' }}>
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
          <div style={{ fontSize: 12.5, color: '#8B938B' }}>
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
    { score: results.founderscore, label: 'Founder Score', color: '#111111' },
    { score: results.executionreadiness, label: 'Execution', color: '#215F46' },
    { score: results.financialmaturity, label: 'Financial', color: '#3A4A3F' },
  ]

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'progress', label: 'Progress' },
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
            <ScoreRing score={card.score} label={card.label} tone={card.color} />
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
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <RadarChart data={radarData} size={230} />
          </div>
        </div>

        <div className="p360-card" style={{ padding: 16, minHeight: 280 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'flex-start',
              marginBottom: 4,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>
              Strategic priorities
            </div>
            <div
              style={{
                fontSize: 11.5,
                fontWeight: 800,
                color: '#176A40',
                background: '#EAF5ED',
                border: '1px solid #BFDCC7',
                borderRadius: 999,
                padding: '5px 8px',
                whiteSpace: 'nowrap',
              }}
            >
              {prioritySummary.completed} of {prioritySummary.total} complete
            </div>
          </div>

          <div style={{ fontSize: 11.5, color: '#8B938B', marginBottom: 14 }}>
            Personalized from your answers and ranked by investor impact.
          </div>

          {priorityError ? (
            <div
              role="alert"
              style={{
                marginBottom: 12,
                padding: '9px 10px',
                background: '#FCEDEA',
                border: '1px solid #F1C9C2',
                borderRadius: 10,
                color: '#9A3D30',
                fontSize: 11.5,
                lineHeight: 1.45,
              }}
            >
              {priorityError}
            </div>
          ) : null}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.strategicpriorities.length ? (
              results.strategicpriorities.slice(0, 4).map((priority, index) => {
                const title = priority?.priority || `Priority ${index + 1}`
                const prioritykey = priorityKeyFromTitle(title, index)
                const savedProgress = priorityProgressByKey[prioritykey]
                const status = savedProgress?.status || 'not_started'
                const statusMeta = priorityStatusMeta(status)
                const isSaving = savingPriorityKey === prioritykey
                const isExpanded = expandedPriorityKey === prioritykey
                const evidence =
                  evidenceDrafts[prioritykey] ?? savedProgress?.evidence ?? ''

                return (
                  <div
                    key={prioritykey}
                    style={{
                      padding: '10px 0',
                      borderTop: index === 0 ? 'none' : '1px solid #EEF2EE',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
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

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            marginBottom: 4,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: '#111111',
                              flex: '1 1 220px',
                            }}
                          >
                            {title}
                          </div>

                          <span
                            style={{
                              fontSize: 10.5,
                              fontWeight: 800,
                              color: statusMeta.color,
                              background: statusMeta.background,
                              border: `1px solid ${statusMeta.border}`,
                              borderRadius: 999,
                              padding: '4px 7px',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isSaving ? 'Saving…' : statusMeta.label}
                          </span>
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: '#5F675F',
                            lineHeight: 1.6,
                            marginBottom: 9,
                          }}
                        >
                          {priority?.rationale || 'No rationale available.'}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: 6,
                            flexWrap: 'wrap',
                            alignItems: 'center',
                          }}
                        >
                          {[
                            ['not_started', 'Not started'],
                            ['in_progress', 'Start'],
                            ['completed', 'Complete'],
                            ['blocked', 'Blocked'],
                          ].map(([value, label]) => {
                            const active = status === value
                            const buttonMeta = priorityStatusMeta(value)

                            return (
                              <button
                                key={value}
                                type="button"
                                disabled={isSaving}
                                onClick={() => updatePriority(priority, index, value)}
                                style={{
                                  padding: '6px 8px',
                                  borderRadius: 8,
                                  border: `1px solid ${
                                    active ? buttonMeta.border : '#D9DFD7'
                                  }`,
                                  background: active
                                    ? buttonMeta.background
                                    : '#FFFFFF',
                                  color: active ? buttonMeta.color : '#5F675F',
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  cursor: isSaving ? 'wait' : 'pointer',
                                  opacity: isSaving ? 0.65 : 1,
                                }}
                              >
                                {label}
                              </button>
                            )
                          })}

                          <button
                            type="button"
                            onClick={() =>
                              setExpandedPriorityKey((current) =>
                                current === prioritykey ? null : prioritykey,
                              )
                            }
                            style={{
                              padding: '6px 3px',
                              border: 'none',
                              background: 'transparent',
                              color: '#1A7A4A',
                              fontSize: 10.5,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {isExpanded
                              ? 'Hide note'
                              : evidence
                                ? 'Edit note'
                                : 'Add note'}
                          </button>
                        </div>

                        {isExpanded ? (
                          <div style={{ marginTop: 10 }}>
                            <textarea
                              value={evidence}
                              onChange={(event) =>
                                setEvidenceDrafts((drafts) => ({
                                  ...drafts,
                                  [prioritykey]: event.target.value,
                                }))
                              }
                              placeholder="Add evidence, a next step, or what is blocking this priority…"
                              rows={3}
                              style={{
                                width: '100%',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                                padding: '9px 10px',
                                borderRadius: 9,
                                border: '1px solid #D9DFD7',
                                background: '#FFFFFF',
                                color: '#2A2F2A',
                                fontSize: 11.5,
                                lineHeight: 1.5,
                                fontFamily: 'inherit',
                              }}
                            />
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: 8,
                                marginTop: 7,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedPriorityKey((current) =>
                                    current === prioritykey ? null : current,
                                  )
                                }
                                style={{
                                  padding: '7px 9px',
                                  borderRadius: 8,
                                  border: '1px solid #D9DFD7',
                                  background: '#FFFFFF',
                                  color: '#5F675F',
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() =>
                                  updatePriority(priority, index, status, evidence)
                                }
                                style={{
                                  padding: '7px 9px',
                                  borderRadius: 8,
                                  border: '1px solid #163A2C',
                                  background: '#163A2C',
                                  color: '#FFFFFF',
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  cursor: isSaving ? 'wait' : 'pointer',
                                  opacity: isSaving ? 0.65 : 1,
                                }}
                              >
                                Save note
                              </button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )
              })
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

  const renderProgress = () => {
    if (!progressComparison) {
      return (
        <div className="p360-card" style={{ padding: 22 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111111',
              marginBottom: 8,
            }}
          >
            Your progress journey starts here
          </div>

          <div
            style={{
              maxWidth: 680,
              fontSize: 13.5,
              color: '#5F675F',
              lineHeight: 1.75,
              marginBottom: 18,
            }}
          >
            Complete a progress review when meaningful evidence changes—such as
            customer validation, revenue, pricing, product delivery, hiring, or
            fundraising readiness. PATH360 will compare it with your current
            baseline and show what improved.
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
              padding: 14,
              borderRadius: 14,
              background: '#F4F8F5',
              border: '1px solid #DDE7DF',
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: '#111111',
                  marginBottom: 4,
                }}
              >
                Current investor readiness: {results.investorreadiness}%
              </div>
              <div style={{ fontSize: 12, color: '#5F675F', lineHeight: 1.6 }}>
                Your latest assessment is saved. A second check-in unlocks your
                first meaningful before-and-after comparison.
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/app/assessment?review=1')}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #163A2C',
                background: '#163A2C',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Update assessment
            </button>
          </div>
        </div>
      )
    }

    const readinessChange =
      progressComparison.current.investorreadiness -
      progressComparison.previous.investorreadiness

    const latestDate = formatAssessmentDate(
      progressComparison.current.completedat ||
        progressComparison.current.createdat,
    )

    return (
      <div style={{ display: 'grid', gap: 14 }}>
        <div
          className="p360-card"
          style={{
            padding: 18,
            background: 'linear-gradient(180deg, #F4F8F5 0%, #FFFFFF 100%)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#4D6B57',
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 7,
                }}
              >
                Progress since your last check-in
              </div>
              <div
                style={{
                  fontSize: 25,
                  fontWeight: 800,
                  color: '#111111',
                  letterSpacing: '-0.04em',
                  lineHeight: 1.15,
                  marginBottom: 6,
                }}
              >
                Investor readiness: {progressComparison.previous.investorreadiness} →{' '}
                {progressComparison.current.investorreadiness}
                <span
                  style={{
                    color: deltaTone(readinessChange),
                    marginLeft: 8,
                    fontSize: 18,
                  }}
                >
                  ({deltaLabel(readinessChange)})
                </span>
              </div>
              <div style={{ fontSize: 12.5, color: '#5F675F', lineHeight: 1.65 }}>
                Latest check-in saved {latestDate}. Your active dashboard always
                reflects your newest evidence.
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/app/assessment?review=1')}
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                border: '1px solid #163A2C',
                background: '#163A2C',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Update assessment
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="p360-card" style={{ padding: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: '#8B938B',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Most improved
            </div>
            <div
              style={{
                fontSize: 17,
                color: '#111111',
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              {progressComparison.mostImproved.label}
            </div>
            <div
              style={{
                fontSize: 13,
                color: deltaTone(progressComparison.mostImproved.change),
                fontWeight: 800,
                marginBottom: 5,
              }}
            >
              {progressComparison.mostImproved.previous} →{' '}
              {progressComparison.mostImproved.current} ({deltaLabel(
                progressComparison.mostImproved.change,
              )})
            </div>
            <div style={{ fontSize: 12, color: '#5F675F', lineHeight: 1.6 }}>
              This is the area with the strongest movement since your previous
              check-in.
            </div>
          </div>

          <div className="p360-card" style={{ padding: 16 }}>
            <div
              style={{
                fontSize: 11,
                color: '#8B938B',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              Next focus
            </div>
            <div
              style={{
                fontSize: 17,
                color: '#111111',
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              {progressComparison.nextFocus.label}
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#111111',
                fontWeight: 800,
                marginBottom: 5,
              }}
            >
              Current score: {progressComparison.nextFocus.current}/100
            </div>
            <div style={{ fontSize: 12, color: '#5F675F', lineHeight: 1.6 }}>
              Focus on evidence and actions that strengthen this area before your
              next investor conversation.
            </div>
          </div>
        </div>

        <div className="p360-card" style={{ padding: 18 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#111111',
              marginBottom: 4,
            }}
          >
            What changed
          </div>
          <div style={{ fontSize: 11.5, color: '#8B938B', marginBottom: 14 }}>
            Your latest assessment compared with your previous check-in.
          </div>

          <div style={{ display: 'grid', gap: 1 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(150px, 1fr) 88px 88px 88px',
                gap: 10,
                padding: '0 10px 8px',
                color: '#8B938B',
                fontSize: 10.5,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                fontWeight: 700,
              }}
            >
              <div>Area</div>
              <div style={{ textAlign: 'right' }}>Previous</div>
              <div style={{ textAlign: 'right' }}>Current</div>
              <div style={{ textAlign: 'right' }}>Change</div>
            </div>

            {progressComparison.dimensions.map((dimension) => (
              <div
                key={dimension.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(150px, 1fr) 88px 88px 88px',
                  gap: 10,
                  alignItems: 'center',
                  padding: '11px 10px',
                  borderTop: '1px solid #EEF2EE',
                  fontSize: 12.5,
                }}
              >
                <div style={{ color: '#111111', fontWeight: 700 }}>
                  {dimension.label}
                </div>
                <div style={{ textAlign: 'right', color: '#5F675F' }}>
                  {dimension.previous}
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    color: '#111111',
                    fontWeight: 700,
                  }}
                >
                  {dimension.current}
                </div>
                <div
                  style={{
                    textAlign: 'right',
                    color: deltaTone(dimension.change),
                    fontWeight: 800,
                  }}
                >
                  {deltaLabel(dimension.change)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

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

      <div style={{ fontSize: 12, fontWeight: 700, color: '#5F675F', marginBottom: 10 }}>
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
              <div style={{ fontSize: 11, color: '#8B938B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 6 }}>
                Question
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111111', lineHeight: 1.5, marginBottom: 6 }}>
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

      <div style={{ fontSize: 12, fontWeight: 700, color: '#5F675F', marginBottom: 10 }}>
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
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111111', marginBottom: 12 }}>
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
                <div style={{ fontSize: 11, color: '#8B938B', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 6 }}>
                  Question
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111111', lineHeight: 1.5, marginBottom: 6 }}>
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

      <div style={{ fontSize: 34, fontWeight: 800, color: '#111111', lineHeight: 1, marginBottom: 12 }}>
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
            cursor: 'pointer',
          }}
        >
          Start memo prep
        </button>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: '#5F675F', marginBottom: 10 }}>
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
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 5 }}>
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

      <div style={{ fontSize: 12, fontWeight: 700, color: '#5F675F', marginBottom: 10 }}>
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
              <div style={{ fontSize: 13, fontWeight: 600, color: '#111111', marginBottom: 5 }}>
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

  const founderName = profile?.fullname || profile?.foundername || 'Founder'
  const ventureName =
    profile?.venturename || profile?.venture_name || 'your venture'
  const onboardingStage =
    stageAssessment?.diagnosedStage || stageAssessment?.declaredStage || null
  const stageToDisplay = prettifyStage(
    onboardingStage || results.venturestage || 'unknown',
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
            Stage: {stageToDisplay} · {results.strategicpriorities.length} priorities identified · {prioritySummary.completed} completed
          </div>

          {progressComparison ? (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.68)', marginTop: 4 }}>
              Investor readiness since last check-in: {deltaLabel(
                progressComparison.current.investorreadiness -
                  progressComparison.previous.investorreadiness,
              )}
            </div>
          ) : null}

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
          type="button"
          onClick={() => navigate('/app/assessment?review=1')}
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
      {activeTab === 'progress' && renderProgress()}
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
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111111', marginBottom: 3 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 11.5, color: '#8B938B' }}>
                    {item.type}
                  </div>
                </div>

                {item.source === 'studio' ? (
                  <button
                    onClick={() =>
                      navigate(`/app/reports?studioDraft=${getField(item.raw, 'id')}`)
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
              Every question and answer used in your latest assessment check-in.
            </div>
          </div>

          <button
            onClick={() => navigate('/app/assessment?review=1')}
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