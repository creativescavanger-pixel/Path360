// src/pages/VentureIntelligence.jsx

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  getMarketCountries,
  getMarketRegions,
  loadVentureIntelligenceWorkspace,
  updateLegalAndOperatingStructure,
  updateMarketFootprint,
  FOUNDER_BASE_OPTIONS,
  ENTITY_STRUCTURE_OPTIONS,
  ENTITY_REGISTRATION_CONTEXT_OPTIONS,
  OPERATING_SCOPE_OPTIONS,
} from '../lib/ventureIntelligence.js'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'market', label: 'Market footprint' },
  { id: 'model', label: 'Venture model' },
  { id: 'structure', label: 'Legal & structure' },
  { id: 'readiness', label: 'Readiness & evidence' },
  { id: 'resources', label: 'Resources' },
]

const RESOURCE_TYPE_LABELS = {
  pestel_insight: 'Market insight',
  regulatory_check: 'Regulatory check',
  operating_check: 'Operating check',
  case_study: 'Founder case',
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function formatLabel(value, fallback = 'Not added yet') {
  if (!value) return fallback

  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getOptionLabel(options, value, fallback = 'Not added yet') {
  if (!value) return fallback
  return options.find((option) => option.value === value)?.label || formatLabel(value)
}

function countryName(code, countries) {
  if (!code) return 'Not added yet'
  return countries.find((country) => country.iso2 === code)?.name || code
}

function countryNames(codes, countries) {
  const values = asArray(codes)
  if (values.length === 0) return 'Not added yet'
  return values.map((code) => countryName(code, countries)).join(', ')
}

function tagLabels(tags) {
  const values = asArray(tags)
  if (values.length === 0) return 'Not added yet'
  return values.map((tag) => formatLabel(tag)).join(', ')
}

function stageLabel(assessment) {
  return (
    assessment?.venturestage ||
    assessment?.venturestageresult ||
    assessment?.stage ||
    'Assessment pending'
  )
}

function stageGuidance(stage) {
  const value = String(stage || '').toLowerCase()

  if (value.includes('idea')) {
    return 'Turn the problem insight into a focused, testable venture hypothesis.'
  }

  if (value.includes('validation')) {
    return 'Build credible evidence that the right customers will use and pay for the solution.'
  }

  if (value.includes('mvp')) {
    return 'Convert early learning into a repeatable product and delivery experience.'
  }

  if (value.includes('traction')) {
    return 'Strengthen retention, unit economics, and the operating systems behind growth.'
  }

  if (value.includes('growth')) {
    return 'Scale with disciplined execution, reliable metrics, and clear strategic choices.'
  }

  return 'Complete your assessment to receive a more specific strategic recommendation.'
}

function profileCompletion(profile) {
  const fields = [
    profile?.primary_region_code,
    profile?.primary_country_code,
    profile?.operating_scope,
    profile?.customer_country_codes,
    profile?.customer_model_tags,
    profile?.revenue_model_tags,
    profile?.operating_model_tags,
    profile?.biggest_operating_concern,
    profile?.founder_base_type,
    profile?.entity_structure_type,
  ]

  const completed = fields.filter((value) => {
    if (Array.isArray(value)) return value.length > 0
    return Boolean(value)
  }).length

  return Math.round((completed / fields.length) * 100)
}

function uniqueCodes(values) {
  return [...new Set(asArray(values).map((value) => String(value).toUpperCase()))]
}

function ToggleableCountryList({
  countries,
  selectedCodes,
  onChange,
  emptyMessage = 'No countries are available for this selection.',
}) {
  const selected = new Set(asArray(selectedCodes))

  if (countries.length === 0) {
    return <p style={{ margin: 0, color: '#817B73', fontSize: 12 }}>{emptyMessage}</p>
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 8,
        maxHeight: 206,
        overflowY: 'auto',
        padding: 2,
      }}
    >
      {countries.map((country) => {
        const active = selected.has(country.iso2)

        return (
          <button
            key={country.iso2}
            type="button"
            onClick={() => {
              const next = active
                ? asArray(selectedCodes).filter((code) => code !== country.iso2)
                : [...asArray(selectedCodes), country.iso2]
              onChange(uniqueCodes(next))
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              minHeight: 38,
              padding: '8px 10px',
              borderRadius: 10,
              border: active ? '1px solid #CDBEFF' : '1px solid #E2DED6',
              background: active ? '#F5F0FF' : '#FFFFFF',
              color: active ? '#6348C4' : '#4F4B46',
              textAlign: 'left',
              fontSize: 12,
              fontWeight: active ? 700 : 600,
              cursor: 'pointer',
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 14,
                height: 14,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 4,
                border: active ? '1px solid #7158DC' : '1px solid #CFC8BD',
                background: active ? '#7158DC' : '#FFFFFF',
                color: '#FFFFFF',
                fontSize: 10,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              {active ? '✓' : ''}
            </span>
            <span>{country.name}</span>
          </button>
        )
      })}
    </div>
  )
}

function ModalShell({ title, eyebrow, children, onClose }) {
  return (
    <div
      role="presentation"
      onMouseDown={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        display: 'grid',
        placeItems: 'center',
        padding: 18,
        background: 'rgba(25,24,28,0.38)',
        backdropFilter: 'blur(3px)',
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          width: 'min(760px, 100%)',
          maxHeight: 'calc(100vh - 36px)',
          overflowY: 'auto',
          borderRadius: 20,
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          boxShadow: '0 28px 72px rgba(22,24,27,0.22)',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            padding: '20px 22px 18px',
            borderBottom: '1px solid #ECE6DB',
            background: '#FBF9F5',
          }}
        >
          <div>
            <div
              style={{
                color: '#7158DC',
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              {eyebrow}
            </div>
            <h2 style={{ margin: 0, color: '#1C1C1A', fontSize: 20, fontWeight: 800 }}>
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              border: '1px solid #E2DED6',
              borderRadius: 9,
              background: '#FFFFFF',
              color: '#6E6B65',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        color: '#1C1C1A',
        fontSize: 12.5,
        fontWeight: 800,
        marginBottom: 7,
      }}
    >
      {children}
    </div>
  )
}

function HelpText({ children }) {
  return (
    <p style={{ margin: '0 0 9px', color: '#817B73', fontSize: 11.5, lineHeight: 1.55 }}>
      {children}
    </p>
  )
}

function FieldSelect({ value, onChange, options, placeholder = 'Select an option' }) {
  return (
    <select
      value={value || ''}
      onChange={(event) => onChange(event.target.value || null)}
      style={{
        width: '100%',
        height: 44,
        borderRadius: 11,
        border: '1px solid #D9D4CA',
        background: '#FFFFFF',
        color: '#2A2825',
        padding: '0 12px',
        fontSize: 12.5,
        outline: 'none',
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function DetailRow({ label, value }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.25fr)',
        gap: 14,
        padding: '12px 0',
        borderTop: '1px solid #EEE9E1',
      }}
    >
      <div style={{ color: '#817B73', fontSize: 11.5, fontWeight: 700 }}>{label}</div>
      <div style={{ color: '#393631', fontSize: 12.5, fontWeight: 700, textAlign: 'right' }}>
        {value || 'Not added yet'}
      </div>
    </div>
  )
}

function SummaryCard({ eyebrow, title, description, accent = '#7158DC', onEdit, children }) {
  return (
    <section
      style={{
        minWidth: 0,
        border: '1px solid #E3DED5',
        borderRadius: 17,
        background: '#FFFFFF',
        padding: 17,
        boxShadow: '0 6px 16px rgba(22,24,27,0.03)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: accent,
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.11em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {eyebrow}
          </div>
          <h2
            style={{
              margin: 0,
              color: '#1C1C1A',
              fontSize: 16,
              lineHeight: 1.25,
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            {title}
          </h2>
        </div>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            style={{
              border: 0,
              borderRadius: 8,
              background: '#F7F5F0',
              color: '#695C91',
              padding: '7px 8px',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            Edit
          </button>
        ) : null}
      </div>
      <p style={{ margin: '10px 0 14px', color: '#6E6B65', fontSize: 12, lineHeight: 1.55 }}>
        {description}
      </p>
      {children}
    </section>
  )
}

function ResourceCard({ item, category, onSave, saved }) {
  const type = RESOURCE_TYPE_LABELS[item.content_type] || category

  return (
    <article
      style={{
        border: '1px solid #E5E0D8',
        borderRadius: 15,
        background: '#FFFFFF',
        padding: 15,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          padding: '4px 7px',
          borderRadius: 999,
          background: '#F5F0FF',
          color: '#7158DC',
          fontSize: 9.5,
          fontWeight: 800,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}
      >
        {type}
      </div>
      <h3 style={{ margin: 0, color: '#24221F', fontSize: 14, lineHeight: 1.35, fontWeight: 800 }}>
        {item.title || 'Untitled resource'}
      </h3>
      <p style={{ margin: 0, color: '#6E6B65', fontSize: 12, lineHeight: 1.55 }}>
        {item.summary || item.body || 'A tailored PATH360 resource for your venture context.'}
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 'auto', flexWrap: 'wrap' }}>
        {item.source_url ? (
          <a
            href={item.source_url}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 34,
              padding: '0 10px',
              borderRadius: 9,
              background: '#F7F5F0',
              border: '1px solid #E4DED4',
              color: '#514C44',
              fontSize: 11.5,
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            Open resource
          </a>
        ) : null}
        <button
          type="button"
          onClick={() => onSave(item)}
          style={{
            minHeight: 34,
            padding: '0 10px',
            borderRadius: 9,
            border: saved ? '1px solid #CFE0D0' : '1px solid #D7CCFB',
            background: saved ? '#EEF4EF' : '#F8F5FF',
            color: saved ? '#1D6B4F' : '#7158DC',
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {saved ? 'Saved' : 'Save'}
        </button>
      </div>
    </article>
  )
}

export default function VentureIntelligence() {
  const user = useDiagnosticStore((state) => state.user)
  const assessmentResults = useDiagnosticStore((state) => state.assessmentResults)
  const stageAssessment = useDiagnosticStore((state) => state.stageAssessment)

  const [workspace, setWorkspace] = useState(null)
  const [regions, setRegions] = useState([])
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [editMode, setEditMode] = useState(null)
  const [marketDraft, setMarketDraft] = useState(null)
  const [structureDraft, setStructureDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [savedResourceSlugs, setSavedResourceSlugs] = useState([])

  const assessment = stageAssessment || assessmentResults
  const stage = stageLabel(assessment)
  const completion = profileCompletion(workspace?.profile)

  const refreshWorkspace = async ({ showLoader = false } = {}) => {
    if (!user?.id) {
      setLoading(false)
      return
    }

    if (showLoader) setLoading(true)

    try {
      const data = await loadVentureIntelligenceWorkspace({
        userId: user.id,
        stage,
      })
      setWorkspace(data)
      setError('')
    } catch (loadError) {
      console.error('Could not load Venture Intelligence:', loadError)
      setError('We could not load your Venture Intelligence profile right now. Please refresh and try again.')
    } finally {
      if (showLoader) setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const [regionRows, countryRows] = await Promise.all([
          getMarketRegions(),
          getMarketCountries(),
        ])

        if (!mounted) return
        setRegions(regionRows)
        setCountries(countryRows)
      } catch (loadError) {
        console.error('Could not load market options:', loadError)
      }

      if (mounted) {
        await refreshWorkspace({ showLoader: true })
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    refreshWorkspace()
  }, [stage])

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(''), 4200)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const profile = workspace?.profile || {}
  const primaryCountry = countryName(profile.primary_country_code, countries)
  const primaryRegion =
    regions.find((region) => region.code === profile.primary_region_code)?.name ||
    formatLabel(profile.primary_region_code)

  const resources = useMemo(() => {
    if (!workspace) return []

    return [
      ...asArray(workspace.pestel).map((item) => ({ ...item, _category: 'Market insight' })),
      ...asArray(workspace.regulations).map((item) => ({ ...item, _category: 'Regulatory check' })),
      ...asArray(workspace.operatingChecks).map((item) => ({ ...item, _category: 'Operating check' })),
      ...asArray(workspace.cases).map((item) => ({ ...item, _category: 'Founder case' })),
    ].slice(0, 12)
  }, [workspace])

  const openMarketEditor = () => {
    setMarketDraft({
      primary_region_code: profile.primary_region_code || '',
      primary_country_code: profile.primary_country_code || '',
      customer_country_codes: asArray(profile.customer_country_codes),
      expansion_country_codes: asArray(profile.expansion_country_codes),
      operating_scope: profile.operating_scope || '',
    })
    setEditMode('market')
  }

  const openStructureEditor = () => {
    setStructureDraft({
      founder_base_type: profile.founder_base_type || '',
      founder_base_country_codes: asArray(profile.founder_base_country_codes),
      entity_structure_type: profile.entity_structure_type || '',
      entity_jurisdiction_country_code: profile.entity_jurisdiction_country_code || '',
      entity_registration_context: profile.entity_registration_context || '',
      operating_entity_country_codes: asArray(profile.operating_entity_country_codes),
      holding_company_country_code: profile.holding_company_country_code || '',
      ip_holding_country_code: profile.ip_holding_country_code || '',
      legal_structure_notes: profile.legal_structure_notes || '',
    })
    setEditMode('structure')
  }

  const closeEditor = () => {
    if (saving) return
    setEditMode(null)
  }

  const saveMarket = async () => {
    if (!user?.id || !marketDraft) return

    setSaving(true)
    try {
      await updateMarketFootprint(user.id, marketDraft)
      await refreshWorkspace()
      setEditMode(null)
      setNotice('Market footprint updated. Your recommendations will now use this context.')
    } catch (saveError) {
      console.error('Could not save market footprint:', saveError)
      setError('We could not save your market footprint. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const saveStructure = async () => {
    if (!user?.id || !structureDraft) return

    setSaving(true)
    try {
      await updateLegalAndOperatingStructure(user.id, structureDraft)
      await refreshWorkspace()
      setEditMode(null)
      setNotice('Legal and operating structure updated. Your private workspace context is saved.')
    } catch (saveError) {
      console.error('Could not save legal structure:', saveError)
      setError('We could not save your legal and operating structure. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const saveResource = (item) => {
    if (!item?.slug) return
    setSavedResourceSlugs((current) =>
      current.includes(item.slug) ? current : [...current, item.slug],
    )
    setNotice('Resource saved. Saved resources will be collected in your workspace library next.')
  }

  const selectedRegionCountries = useMemo(() => {
    if (!marketDraft?.primary_region_code) return countries

    return countries.filter(
      (country) =>
        country.region_code === marketDraft.primary_region_code ||
        country.subregion_code === marketDraft.primary_region_code,
    )
  }, [countries, marketDraft?.primary_region_code])

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ height: 196, borderRadius: 20, background: '#ECE7DD' }} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 14,
          }}
        >
          {[1, 2, 3, 4].map((item) => (
            <div key={item} style={{ height: 210, borderRadius: 17, background: '#FFFFFF' }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', paddingBottom: 22 }}>
      {notice ? (
        <div
          role="status"
          style={{
            position: 'sticky',
            top: 10,
            zIndex: 40,
            marginBottom: 12,
            padding: '11px 13px',
            borderRadius: 12,
            background: '#EEF4EF',
            border: '1px solid #CFE0D0',
            color: '#1D6B4F',
            fontSize: 12.5,
            fontWeight: 700,
            boxShadow: '0 8px 18px rgba(29,107,79,0.08)',
          }}
        >
          {notice}
        </div>
      ) : null}

      {error ? (
        <div
          role="alert"
          style={{
            marginBottom: 14,
            padding: '12px 14px',
            borderRadius: 13,
            border: '1px solid #E9CACA',
            background: '#FBECEC',
            color: '#8A2F2F',
            fontSize: 12.5,
            lineHeight: 1.55,
          }}
        >
          {error}
        </div>
      ) : null}

      <section
        style={{
          overflow: 'hidden',
          borderRadius: 20,
          border: '1px solid #E2D8FF',
          background: 'linear-gradient(120deg, #FFFFFF 0%, #F8F4FF 56%, #F2EDFF 100%)',
          boxShadow: '0 8px 22px rgba(82,63,137,0.06)',
        }}
      >
        <div style={{ padding: '22px 22px 20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ maxWidth: 680 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '6px 9px',
                  borderRadius: 999,
                  border: '1px solid #DDD1FF',
                  background: 'rgba(255,255,255,0.72)',
                  color: '#7158DC',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.11em',
                  textTransform: 'uppercase',
                }}
              >
                ✦ Venture intelligence
              </div>
              <h1
                style={{
                  margin: '12px 0 0',
                  color: '#242032',
                  fontSize: 30,
                  lineHeight: 1.12,
                  letterSpacing: '-0.04em',
                  fontWeight: 800,
                }}
              >
                Your venture context
              </h1>
              <p
                style={{
                  margin: '9px 0 0',
                  color: '#635D6C',
                  fontSize: 13,
                  lineHeight: 1.65,
                  maxWidth: 650,
                }}
              >
                A living view of your market, venture model, operating structure, and the strategic priorities that guide your next move.
              </p>
            </div>

            <button
              type="button"
              onClick={openMarketEditor}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
                minHeight: 42,
                padding: '0 13px',
                border: '1px solid #7158DC',
                borderRadius: 11,
                background: '#7158DC',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Update profile →
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 17 }}>
            <span
              style={{
                padding: '6px 9px',
                borderRadius: 999,
                background: '#F2EDFF',
                color: '#6348C4',
                border: '1px solid #DDD1FF',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {formatLabel(stage)} stage
            </span>
            <span
              style={{
                padding: '6px 9px',
                borderRadius: 999,
                background: '#FFFFFF',
                color: '#69635D',
                border: '1px solid #E3DED5',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              {getOptionLabel(OPERATING_SCOPE_OPTIONS, profile.operating_scope, 'Market context pending')}
            </span>
            <span
              style={{
                padding: '6px 9px',
                borderRadius: 999,
                background: completion >= 70 ? '#EEF4EF' : '#FFF7E8',
                color: completion >= 70 ? '#1D6B4F' : '#8B641A',
                border: `1px solid ${completion >= 70 ? '#CFE0D0' : '#F1D9AA'}`,
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Profile {completion}% complete
            </span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
            padding: '15px 22px',
            borderTop: '1px solid #E8E0FA',
            background: 'rgba(255,255,255,0.58)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, maxWidth: 650 }}>
            <div
              style={{
                width: 31,
                height: 31,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 10,
                background: '#EDE6FF',
                color: '#7158DC',
                fontSize: 15,
                flexShrink: 0,
              }}
            >
              ✦
            </div>
            <div>
              <div
                style={{
                  color: '#7158DC',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Your next strategic move
              </div>
              <div style={{ color: '#383442', fontSize: 12.5, fontWeight: 700, lineHeight: 1.5 }}>
                {stageGuidance(stage)}
              </div>
            </div>
          </div>
          <Link
            to="/app/memory"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 36,
              padding: '0 11px',
              borderRadius: 9,
              background: '#FFFFFF',
              border: '1px solid #DCD2F8',
              color: '#7158DC',
              fontSize: 11.5,
              fontWeight: 800,
              textDecoration: 'none',
            }}
          >
            View decisions & insights →
          </Link>
        </div>
      </section>

      <nav
        aria-label="Venture Intelligence sections"
        style={{
          display: 'flex',
          gap: 5,
          overflowX: 'auto',
          marginTop: 16,
          padding: 5,
          borderRadius: 14,
          border: '1px solid #E2DED6',
          background: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(22,24,27,0.025)',
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                flexShrink: 0,
                padding: '9px 12px',
                border: 0,
                borderRadius: 10,
                background: active ? '#7158DC' : 'transparent',
                color: active ? '#FFFFFF' : '#68645E',
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </nav>

      {activeTab === 'overview' ? (
        <>
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))',
              gap: 14,
              marginTop: 16,
            }}
          >
            <SummaryCard
              eyebrow="Stage & readiness"
              title={formatLabel(stage)}
              description="Your assessment baseline informs the recommendations and learning priority in this workspace."
              accent="#7158DC"
            >
              <div style={{ padding: 11, borderRadius: 11, background: '#F8F5FF', color: '#51486A', fontSize: 11.5, fontWeight: 700, lineHeight: 1.5 }}>
                {stageGuidance(stage)}
              </div>
            </SummaryCard>

            <SummaryCard
              eyebrow="Market footprint"
              title={primaryCountry}
              description={`${primaryRegion} · ${getOptionLabel(OPERATING_SCOPE_OPTIONS, profile.operating_scope, 'Scope pending')}`}
              accent="#1D8060"
              onEdit={openMarketEditor}
            >
              <div style={{ padding: 11, borderRadius: 11, background: '#F2F8F4', color: '#315946', fontSize: 11.5, lineHeight: 1.5 }}>
                <span style={{ display: 'block', color: '#67907B', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
                  Customer markets
                </span>
                <strong>{countryNames(profile.customer_country_codes, countries)}</strong>
              </div>
            </SummaryCard>

            <SummaryCard
              eyebrow="Venture model"
              title={tagLabels(profile.customer_model_tags)}
              description={`Revenue: ${tagLabels(profile.revenue_model_tags)}`}
              accent="#2E5EAA"
            >
              <div style={{ padding: 11, borderRadius: 11, background: '#F1F6FE', color: '#34527C', fontSize: 11.5, lineHeight: 1.5 }}>
                <span style={{ display: 'block', color: '#6482AA', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>
                  Operating model
                </span>
                <strong>{tagLabels(profile.operating_model_tags)}</strong>
              </div>
            </SummaryCard>

            <SummaryCard
              eyebrow="Current focus"
              title="Next operating priority"
              description="Keep your work, evidence, and resource recommendations focused on the most important question."
              accent="#A36A1B"
            >
              <div style={{ padding: 11, borderRadius: 11, background: '#FFF8E8', color: '#72511A', fontSize: 11.5, lineHeight: 1.5, fontWeight: 700 }}>
                {profile.biggest_operating_concern || 'Add your biggest operating concern in Venture Intelligence Setup.'}
              </div>
            </SummaryCard>
          </section>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.42fr) minmax(250px, 0.58fr)',
              gap: 16,
              marginTop: 16,
            }}
          >
            <article
              style={{
                border: '1px solid #E3DED5',
                borderRadius: 17,
                background: '#FFFFFF',
                padding: 18,
                boxShadow: '0 6px 16px rgba(22,24,27,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ color: '#7158DC', fontSize: 10, fontWeight: 800, letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: 5 }}>
                    Operating context
                  </div>
                  <h2 style={{ margin: 0, color: '#1C1C1A', fontSize: 17, fontWeight: 800 }}>
                    Legal & operating structure
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={openStructureEditor}
                  style={{
                    border: '1px solid #DDD1FF',
                    borderRadius: 9,
                    background: '#F8F5FF',
                    color: '#7158DC',
                    padding: '8px 9px',
                    fontSize: 11.5,
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Edit structure
                </button>
              </div>
              <p style={{ margin: '9px 0 15px', color: '#6E6B65', fontSize: 12, lineHeight: 1.6 }}>
                Keep founder location, customer markets, incorporation, and operating entities separate so PATH360 can surface more relevant questions and resources.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 22px' }}>
                <DetailRow label="Founder base" value={getOptionLabel(FOUNDER_BASE_OPTIONS, profile.founder_base_type)} />
                <DetailRow label="Founder countries" value={countryNames(profile.founder_base_country_codes, countries)} />
                <DetailRow label="Entity structure" value={getOptionLabel(ENTITY_STRUCTURE_OPTIONS, profile.entity_structure_type)} />
                <DetailRow label="Entity jurisdiction" value={countryName(profile.entity_jurisdiction_country_code, countries)} />
                <DetailRow label="Registration context" value={getOptionLabel(ENTITY_REGISTRATION_CONTEXT_OPTIONS, profile.entity_registration_context)} />
                <DetailRow label="Operating entities" value={countryNames(profile.operating_entity_country_codes, countries)} />
                <DetailRow label="Holding-company jurisdiction" value={countryName(profile.holding_company_country_code, countries)} />
                <DetailRow label="IP-holding jurisdiction" value={countryName(profile.ip_holding_country_code, countries)} />
              </div>
              <div
                style={{
                  marginTop: 15,
                  padding: '10px 11px',
                  borderRadius: 11,
                  background: '#F8F6F1',
                  border: '1px solid #ECE6DB',
                  color: '#756F68',
                  fontSize: 11,
                  lineHeight: 1.55,
                }}
              >
                Private to your workspace. PATH360 organises venture context and resources; it does not provide legal, tax, immigration, employment, or regulatory advice.
              </div>
            </article>

            <aside
              style={{
                border: '1px solid #E2D8FF',
                borderRadius: 17,
                background: '#FBF9FF',
                padding: 18,
                boxShadow: '0 6px 16px rgba(22,24,27,0.03)',
              }}
            >
              <div style={{ color: '#7158DC', fontSize: 10, fontWeight: 800, letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: 6 }}>
                Profile quality
              </div>
              <h2 style={{ margin: 0, color: '#2E2741', fontSize: 24, fontWeight: 800, letterSpacing: '-0.035em' }}>
                {completion}% complete
              </h2>
              <p style={{ margin: '10px 0 15px', color: '#686174', fontSize: 12, lineHeight: 1.6 }}>
                Add market and structure context to make matched operating guidance and resource recommendations more relevant.
              </p>
              <div style={{ height: 8, borderRadius: 999, overflow: 'hidden', background: '#E7DFFF' }}>
                <div style={{ width: `${completion}%`, height: '100%', borderRadius: 999, background: '#7158DC' }} />
              </div>
              <button
                type="button"
                onClick={openStructureEditor}
                style={{
                  width: '100%',
                  minHeight: 40,
                  marginTop: 16,
                  border: '1px solid #7158DC',
                  borderRadius: 10,
                  background: '#7158DC',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Complete structure context →
              </button>
            </aside>
          </section>
        </>
      ) : null}

      {activeTab === 'market' ? (
        <section style={{ marginTop: 16, display: 'grid', gap: 16 }}>
          <article style={{ border: '1px solid #E3DED5', borderRadius: 17, background: '#FFFFFF', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#1D8060', fontSize: 10, fontWeight: 800, letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: 5 }}>Market footprint</div>
                <h2 style={{ margin: 0, color: '#1C1C1A', fontSize: 20, fontWeight: 800 }}>Where the venture operates and grows</h2>
                <p style={{ margin: '8px 0 0', color: '#6E6B65', fontSize: 12.5, lineHeight: 1.6, maxWidth: 690 }}>
                  Your primary operating market informs country intelligence, PESTEL guidance, operating checks, and the resources PATH360 brings into your workspace.
                </p>
              </div>
              <button type="button" onClick={openMarketEditor} style={{ minHeight: 40, padding: '0 12px', borderRadius: 10, border: '1px solid #1D8060', background: '#1D8060', color: '#FFFFFF', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Edit market footprint</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14, marginTop: 20 }}>
              <SummaryCard eyebrow="Primary market" title={primaryCountry} description={primaryRegion} accent="#1D8060">
                <div style={{ color: '#4B705C', fontSize: 11.5, fontWeight: 700 }}>{getOptionLabel(OPERATING_SCOPE_OPTIONS, profile.operating_scope, 'Scope pending')}</div>
              </SummaryCard>
              <SummaryCard eyebrow="Customer markets" title={countryNames(profile.customer_country_codes, countries)} description="Markets where you serve or intend to serve customers." accent="#1D8060" />
              <SummaryCard eyebrow="Expansion markets" title={countryNames(profile.expansion_country_codes, countries)} description="Markets you are actively exploring or prioritising next." accent="#1D8060" />
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'model' ? (
        <section style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14 }}>
          <SummaryCard eyebrow="Customer model" title={tagLabels(profile.customer_model_tags)} description="How the venture reaches and serves its customers." accent="#2E5EAA" />
          <SummaryCard eyebrow="Revenue model" title={tagLabels(profile.revenue_model_tags)} description="The revenue approach currently being tested or used." accent="#2E5EAA" />
          <SummaryCard eyebrow="Distribution" title={tagLabels(profile.distribution_model_tags)} description="How the venture gets its solution to market." accent="#2E5EAA" />
          <SummaryCard eyebrow="Operating model" title={tagLabels(profile.operating_model_tags)} description="The delivery model and operational characteristics behind the venture." accent="#2E5EAA" />
          <SummaryCard eyebrow="Key dependencies" title={tagLabels(profile.dependency_tags)} description="External systems, partners, or infrastructure that matter to execution." accent="#2E5EAA" />
          <SummaryCard eyebrow="Finance approach" title={tagLabels(profile.finance_approach_tags)} description="The funding path the founder is considering or using." accent="#2E5EAA" />
        </section>
      ) : null}

      {activeTab === 'structure' ? (
        <section style={{ marginTop: 16, display: 'grid', gap: 16 }}>
          <article style={{ border: '1px solid #E3DED5', borderRadius: 17, background: '#FFFFFF', padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#7158DC', fontSize: 10, fontWeight: 800, letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: 5 }}>Legal & operating structure</div>
                <h2 style={{ margin: 0, color: '#1C1C1A', fontSize: 20, fontWeight: 800 }}>Separate founder context from business context</h2>
                <p style={{ margin: '8px 0 0', color: '#6E6B65', fontSize: 12.5, lineHeight: 1.6, maxWidth: 690 }}>
                  PATH360 records founder location, operating markets, legal entities, e-residency, holding companies, and operating subsidiaries as separate dimensions.
                </p>
              </div>
              <button type="button" onClick={openStructureEditor} style={{ minHeight: 40, padding: '0 12px', borderRadius: 10, border: '1px solid #7158DC', background: '#7158DC', color: '#FFFFFF', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Edit legal & structure</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '0 26px', marginTop: 20 }}>
              <DetailRow label="Founder base" value={getOptionLabel(FOUNDER_BASE_OPTIONS, profile.founder_base_type)} />
              <DetailRow label="Founder countries" value={countryNames(profile.founder_base_country_codes, countries)} />
              <DetailRow label="Entity structure" value={getOptionLabel(ENTITY_STRUCTURE_OPTIONS, profile.entity_structure_type)} />
              <DetailRow label="Entity jurisdiction" value={countryName(profile.entity_jurisdiction_country_code, countries)} />
              <DetailRow label="Registration context" value={getOptionLabel(ENTITY_REGISTRATION_CONTEXT_OPTIONS, profile.entity_registration_context)} />
              <DetailRow label="Operating-entity countries" value={countryNames(profile.operating_entity_country_codes, countries)} />
              <DetailRow label="Holding-company jurisdiction" value={countryName(profile.holding_company_country_code, countries)} />
              <DetailRow label="IP-holding jurisdiction" value={countryName(profile.ip_holding_country_code, countries)} />
              <DetailRow label="Notes" value={profile.legal_structure_notes || 'Not added yet'} />
            </div>
            <div style={{ marginTop: 18, padding: 13, borderRadius: 12, background: '#F8F6F1', border: '1px solid #ECE6DB', color: '#756F68', fontSize: 11.5, lineHeight: 1.6 }}>
              Estonia e-Residency is recorded as a registration context. It is not automatically the founder’s personal residence, tax residence, customer market, or primary operating country. Confirm jurisdiction-specific obligations with qualified advisers.
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === 'readiness' ? (
        <section style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          <SummaryCard eyebrow="Current stage" title={formatLabel(stage)} description="Your assessment stage sets the baseline for what evidence matters next." accent="#7158DC" />
          <SummaryCard eyebrow="Operating concern" title={profile.biggest_operating_concern || 'Not added yet'} description="This becomes the anchor for recommendations, Academy prompts, and working priorities." accent="#A36A1B" />
          <SummaryCard eyebrow="Evidence & documents" title={`${asArray(workspace?.documents).length} matched templates`} description="Relevant documents and evidence prompts will appear here as your Resource Bank grows." accent="#1D8060" />
          <SummaryCard eyebrow="Business markers" title={`${asArray(workspace?.markers).length} matched markers`} description="Use these markers to see what credible progress can look like at your current stage." accent="#2E5EAA" />
        </section>
      ) : null}

      {activeTab === 'resources' ? (
        <section style={{ marginTop: 16 }}>
          <article style={{ border: '1px solid #E3DED5', borderRadius: 17, background: '#FFFFFF', padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ color: '#7158DC', fontSize: 10, fontWeight: 800, letterSpacing: '0.11em', textTransform: 'uppercase', marginBottom: 5 }}>Resource Bank</div>
                <h2 style={{ margin: 0, color: '#1C1C1A', fontSize: 20, fontWeight: 800 }}>Resources matched to your venture context</h2>
                <p style={{ margin: '8px 0 0', color: '#6E6B65', fontSize: 12.5, lineHeight: 1.6, maxWidth: 700 }}>
                  PATH360 filters market insight, regulatory prompts, operating checks, founder cases, documents, and performance markers using your primary market, stage, model, and dependencies.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                <span style={{ padding: '6px 8px', borderRadius: 999, border: '1px solid #D8E2D9', background: '#F1F5F1', color: '#4D6B57', fontSize: 10.5, fontWeight: 800 }}>Market: {primaryCountry}</span>
                <span style={{ padding: '6px 8px', borderRadius: 999, border: '1px solid #E2D8FF', background: '#F5F0FF', color: '#7158DC', fontSize: 10.5, fontWeight: 800 }}>Stage: {formatLabel(stage)}</span>
              </div>
            </div>

            {resources.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 14, marginTop: 20 }}>
                {resources.map((item) => (
                  <ResourceCard
                    key={item.id || item.slug || item.title}
                    item={item}
                    category={item._category}
                    saved={savedResourceSlugs.includes(item.slug)}
                    onSave={saveResource}
                  />
                ))}
              </div>
            ) : (
              <div style={{ marginTop: 20, padding: 22, borderRadius: 14, background: '#F8F6F1', border: '1px dashed #D9D4CA', textAlign: 'center' }}>
                <div style={{ color: '#564E63', fontSize: 14, fontWeight: 800 }}>Your matched Resource Bank is preparing</div>
                <p style={{ margin: '7px auto 0', maxWidth: 560, color: '#766F68', fontSize: 12, lineHeight: 1.6 }}>
                  Add or refine your market footprint and venture model, then publish market intelligence items, operating checks, cases, or templates in the PATH360 library to see them here.
                </p>
                <button type="button" onClick={openMarketEditor} style={{ marginTop: 13, minHeight: 38, padding: '0 11px', borderRadius: 9, border: '1px solid #7158DC', background: '#FFFFFF', color: '#7158DC', fontSize: 11.5, fontWeight: 800, cursor: 'pointer' }}>Refine profile context</button>
              </div>
            )}
          </article>
        </section>
      ) : null}

      {editMode === 'market' && marketDraft ? (
        <ModalShell title="Edit market footprint" eyebrow="Venture Intelligence" onClose={closeEditor}>
          <div style={{ padding: 22, display: 'grid', gap: 19 }}>
            <div>
              <SectionLabel>Primary operating region</SectionLabel>
              <HelpText>Choose the region that makes market intelligence and operating guidance most useful today.</HelpText>
              <FieldSelect
                value={marketDraft.primary_region_code}
                onChange={(value) =>
                  setMarketDraft((current) => ({
                    ...current,
                    primary_region_code: value || '',
                    primary_country_code: value ? current.primary_country_code : current.primary_country_code,
                  }))
                }
                options={regions.map((region) => ({ value: region.code, label: region.name }))}
                placeholder="Select a region or subregion"
              />
            </div>

            <div>
              <SectionLabel>Primary operating country</SectionLabel>
              <HelpText>This is the market where you most need relevant context now. You can add other customer and expansion markets below.</HelpText>
              <FieldSelect
                value={marketDraft.primary_country_code}
                onChange={(value) => setMarketDraft((current) => ({ ...current, primary_country_code: value || '' }))}
                options={selectedRegionCountries.map((country) => ({ value: country.iso2, label: country.name }))}
                placeholder="Select a country"
              />
            </div>

            <div>
              <SectionLabel>Current operating scope</SectionLabel>
              <HelpText>Choose the scope that best represents operations today, rather than only long-term ambition.</HelpText>
              <FieldSelect
                value={marketDraft.operating_scope}
                onChange={(value) => setMarketDraft((current) => ({ ...current, operating_scope: value || '' }))}
                options={OPERATING_SCOPE_OPTIONS}
                placeholder="Select operating scope"
              />
            </div>

            <div>
              <SectionLabel>Customer markets</SectionLabel>
              <HelpText>Select countries where the venture currently serves, sells to, or actively tests customers.</HelpText>
              <ToggleableCountryList
                countries={countries}
                selectedCodes={marketDraft.customer_country_codes}
                onChange={(value) => setMarketDraft((current) => ({ ...current, customer_country_codes: value }))}
              />
            </div>

            <div>
              <SectionLabel>Expansion markets</SectionLabel>
              <HelpText>Select markets the venture is actively considering next. These remain distinct from today’s primary operating market.</HelpText>
              <ToggleableCountryList
                countries={countries}
                selectedCodes={marketDraft.expansion_country_codes}
                onChange={(value) => setMarketDraft((current) => ({ ...current, expansion_country_codes: value }))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', paddingTop: 2 }}>
              <button type="button" onClick={closeEditor} disabled={saving} style={{ minHeight: 40, padding: '0 13px', borderRadius: 10, border: '1px solid #D9D4CA', background: '#FFFFFF', color: '#6E6B65', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={saveMarket} disabled={saving} style={{ minHeight: 40, padding: '0 13px', borderRadius: 10, border: '1px solid #7158DC', background: saving ? '#AFA2D5' : '#7158DC', color: '#FFFFFF', fontSize: 12, fontWeight: 800, cursor: saving ? 'default' : 'pointer' }}>{saving ? 'Saving…' : 'Save market footprint'}</button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {editMode === 'structure' && structureDraft ? (
        <ModalShell title="Edit legal & operating structure" eyebrow="Private workspace context" onClose={closeEditor}>
          <div style={{ padding: 22, display: 'grid', gap: 19 }}>
            <div>
              <SectionLabel>Founder base</SectionLabel>
              <HelpText>Founder location can be different from the venture’s primary operating market and its legal registration.</HelpText>
              <FieldSelect
                value={structureDraft.founder_base_type}
                onChange={(value) => setStructureDraft((current) => ({ ...current, founder_base_type: value || '' }))}
                options={FOUNDER_BASE_OPTIONS}
                placeholder="Select founder context"
              />
            </div>

            {structureDraft.founder_base_type !== 'not_relevant' ? (
              <div>
                <SectionLabel>Countries relevant to founder arrangements</SectionLabel>
                <HelpText>Optional. Use this for a single base, split locations, or a mobile/digital-nomad working context.</HelpText>
                <ToggleableCountryList
                  countries={countries}
                  selectedCodes={structureDraft.founder_base_country_codes}
                  onChange={(value) => setStructureDraft((current) => ({ ...current, founder_base_country_codes: value }))}
                />
              </div>
            ) : null}

            <div>
              <SectionLabel>Entity structure</SectionLabel>
              <HelpText>Describe the venture’s structure today. You can update this as the company evolves.</HelpText>
              <FieldSelect
                value={structureDraft.entity_structure_type}
                onChange={(value) => setStructureDraft((current) => ({ ...current, entity_structure_type: value || '' }))}
                options={ENTITY_STRUCTURE_OPTIONS}
                placeholder="Select entity structure"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <SectionLabel>Entity jurisdiction</SectionLabel>
                <HelpText>Where the principal legal entity is registered.</HelpText>
                <FieldSelect
                  value={structureDraft.entity_jurisdiction_country_code}
                  onChange={(value) => setStructureDraft((current) => ({ ...current, entity_jurisdiction_country_code: value || '' }))}
                  options={countries.map((country) => ({ value: country.iso2, label: country.name }))}
                  placeholder="Select country"
                />
              </div>
              <div>
                <SectionLabel>Registration context</SectionLabel>
                <HelpText>Record e-residency or foreign incorporation without treating it as the operating market.</HelpText>
                <FieldSelect
                  value={structureDraft.entity_registration_context}
                  onChange={(value) => setStructureDraft((current) => ({ ...current, entity_registration_context: value || '' }))}
                  options={ENTITY_REGISTRATION_CONTEXT_OPTIONS}
                  placeholder="Select registration context"
                />
              </div>
            </div>

            {structureDraft.entity_registration_context === 'estonia_e_residency' ? (
              <div style={{ padding: 12, borderRadius: 12, border: '1px solid #DDD1FF', background: '#F8F5FF', color: '#5D5279', fontSize: 11.5, lineHeight: 1.6 }}>
                Estonia e-Residency is a registration and administrative context. It does not by itself determine a founder’s personal residence, tax residence, customer market, or primary operating country.
              </div>
            ) : null}

            <div>
              <SectionLabel>Operating-entity countries</SectionLabel>
              <HelpText>Select countries where the venture has an operating company, subsidiary, branch, or similar local entity.</HelpText>
              <ToggleableCountryList
                countries={countries}
                selectedCodes={structureDraft.operating_entity_country_codes}
                onChange={(value) => setStructureDraft((current) => ({ ...current, operating_entity_country_codes: value }))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
              <div>
                <SectionLabel>Holding-company jurisdiction</SectionLabel>
                <HelpText>Optional. Add this only if a holding company exists.</HelpText>
                <FieldSelect
                  value={structureDraft.holding_company_country_code}
                  onChange={(value) => setStructureDraft((current) => ({ ...current, holding_company_country_code: value || '' }))}
                  options={countries.map((country) => ({ value: country.iso2, label: country.name }))}
                  placeholder="Not applicable / select country"
                />
              </div>
              <div>
                <SectionLabel>IP-holding jurisdiction</SectionLabel>
                <HelpText>Optional. Add this only if intellectual property is held separately.</HelpText>
                <FieldSelect
                  value={structureDraft.ip_holding_country_code}
                  onChange={(value) => setStructureDraft((current) => ({ ...current, ip_holding_country_code: value || '' }))}
                  options={countries.map((country) => ({ value: country.iso2, label: country.name }))}
                  placeholder="Not applicable / select country"
                />
              </div>
            </div>

            <div>
              <SectionLabel>Structure notes</SectionLabel>
              <HelpText>Optional. Add context PATH360 should retain, such as an entity in progress or a planned subsidiary.</HelpText>
              <textarea
                value={structureDraft.legal_structure_notes}
                onChange={(event) => setStructureDraft((current) => ({ ...current, legal_structure_notes: event.target.value }))}
                rows={4}
                placeholder="For example: Estonia parent is planned; Kenya operating entity is being explored."
                style={{ width: '100%', boxSizing: 'border-box', borderRadius: 11, border: '1px solid #D9D4CA', padding: 12, color: '#2A2825', fontFamily: 'inherit', fontSize: 12.5, lineHeight: 1.55, resize: 'vertical', outline: 'none' }}
              />
            </div>

            <div style={{ padding: 12, borderRadius: 12, background: '#F8F6F1', border: '1px solid #ECE6DB', color: '#756F68', fontSize: 11.5, lineHeight: 1.6 }}>
              PATH360 organises your operating context and surfaces relevant questions and resources. It does not provide legal, tax, immigration, employment, or regulatory advice.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={closeEditor} disabled={saving} style={{ minHeight: 40, padding: '0 13px', borderRadius: 10, border: '1px solid #D9D4CA', background: '#FFFFFF', color: '#6E6B65', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={saveStructure} disabled={saving} style={{ minHeight: 40, padding: '0 13px', borderRadius: 10, border: '1px solid #7158DC', background: saving ? '#AFA2D5' : '#7158DC', color: '#FFFFFF', fontSize: 12, fontWeight: 800, cursor: saving ? 'default' : 'pointer' }}>{saving ? 'Saving…' : 'Save structure'}</button>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </div>
  )
}