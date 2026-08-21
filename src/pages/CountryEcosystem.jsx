import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  getCountryBySlug,
  getCountryCoverageDescription,
  getCountryCoverageLabel,
  getCountryFlag,
} from '../lib/countryCatalogue.js'
import {
  ECOSYSTEM_DIRECTORY_UPDATED_AT,
  ECOSYSTEM_NEEDS,
  ECOSYSTEM_STAGES,
  ECOSYSTEM_SUPPORT_TYPES,
  getEcosystemCitiesByCountry,
  getEcosystemDirectoryRecords,
} from '../data/ecosystemDirectory.js'

const SHORTLIST_KEY = 'path360_ecosystem_shortlist'

function getStoredShortlist() {
  if (typeof window === 'undefined') return []

  try {
    const value = JSON.parse(window.localStorage.getItem(SHORTLIST_KEY) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function saveShortlist(records) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(SHORTLIST_KEY, JSON.stringify(records))
  } catch {
    // Shortlist storage is optional for this beta experience.
  }
}

function getOptionLabel(value, options) {
  return options.find((option) => option.value === value)?.label || value
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label style={{ display: 'grid', gap: 5, minWidth: 145, flex: '1 1 145px' }}>
      <span
        style={{
          color: '#77736D',
          fontSize: 9.5,
          fontWeight: 800,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: '100%',
          border: '1px solid #D9D4CA',
          borderRadius: 9,
          background: '#FFFFFF',
          color: '#373532',
          padding: '9px 10px',
          fontSize: 11.5,
          cursor: 'pointer',
        }}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
    </label>
  )
}

function Tag({ children, tone = 'neutral' }) {
  const styles = {
    neutral: { background: '#F7F5F0', border: '#E2DED6', color: '#5F5B56' },
    blue: { background: '#EEF5FA', border: '#D5E4EF', color: '#28627F' },
    green: { background: '#EEF4EF', border: '#D6E4D7', color: '#1D6B4F' },
    purple: { background: '#F5F0FF', border: '#DDD1FF', color: '#7158DC' },
  }
  const style = styles[tone] || styles.neutral

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: `1px solid ${style.border}`,
        background: style.background,
        color: style.color,
        borderRadius: 999,
        padding: '4px 7px',
        fontSize: 9.5,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  )
}

function DirectoryCard({ record, shortlisted, onToggleShortlist }) {
  const supportLabels = record.supportTypes
    .slice(0, 2)
    .map((value) => getOptionLabel(value, ECOSYSTEM_SUPPORT_TYPES))
  const stageLabels = record.stages
    .slice(0, 2)
    .map((value) => getOptionLabel(value, ECOSYSTEM_STAGES))

  return (
    <article
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2DED6',
        borderRadius: 14,
        padding: 15,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 7,
        }}
      >
        <div>
          <div
            style={{
              color: '#1C1C1A',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              marginBottom: 4,
            }}
          >
            {record.name}
          </div>
          <div style={{ color: '#77736D', fontSize: 10.5 }}>
            {record.city}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onToggleShortlist(record)}
          style={{
            border: shortlisted ? '1px solid #7158DC' : '1px solid #D8D3C9',
            background: shortlisted ? '#F5F0FF' : '#FFFFFF',
            color: shortlisted ? '#7158DC' : '#5F5B56',
            borderRadius: 8,
            padding: '6px 8px',
            fontSize: 10,
            fontWeight: 800,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {shortlisted ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 9 }}>
        {supportLabels.map((label) => (
          <Tag key={label} tone="blue">{label}</Tag>
        ))}
        {stageLabels.map((label) => (
          <Tag key={label} tone="purple">{label}</Tag>
        ))}
      </div>

      <p
        style={{
          color: '#5F5B56',
          fontSize: 11.5,
          lineHeight: 1.62,
          margin: '0 0 10px',
          flex: 1,
        }}
      >
        {record.description}
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 10,
          color: '#77736D',
          fontSize: 9.8,
        }}
      >
        <span>Official source</span>
        <span>Checked: {record.lastVerified}</span>
      </div>

      <a
        href={record.websiteUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          background: '#28627F',
          color: '#FFFFFF',
          borderRadius: 9,
          padding: '8px 10px',
          fontSize: 10.5,
          fontWeight: 800,
        }}
      >
        {record.sourceLabel || 'Official website'} ↗
      </a>
    </article>
  )
}

function ResearchPrompt({ number, title, description }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        background: '#F8F6F1',
        border: '1px solid #ECE6DB',
        borderRadius: 12,
        padding: 13,
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 8,
          background: '#EEF5FA',
          color: '#28627F',
          fontSize: 10.5,
          fontWeight: 900,
        }}
      >
        {number}
      </span>
      <div>
        <div
          style={{
            color: '#1C1C1A',
            fontSize: 12.5,
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div style={{ color: '#5F5B56', fontSize: 11.5, lineHeight: 1.65 }}>
          {description}
        </div>
      </div>
    </div>
  )
}

function CountryNotFound() {
  const navigate = useNavigate()

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 18,
          padding: 24,
        }}
      >
        <div
          style={{
            color: '#35708E',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Startup ecosystem explorer
        </div>
        <h1
          style={{
            color: '#1C1C1A',
            fontSize: 25,
            letterSpacing: '-0.03em',
            margin: '0 0 8px',
          }}
        >
          Country not found
        </h1>
        <p
          style={{
            color: '#6B6965',
            fontSize: 13,
            lineHeight: 1.7,
            margin: '0 0 16px',
          }}
        >
          Return to the global ecosystem explorer to search a country, jurisdiction, ISO code, or common alias.
        </p>
        <button
          type="button"
          onClick={() => navigate('/app/environment/ecosystem')}
          style={{
            border: '1px solid #28627F',
            background: '#28627F',
            color: '#FFFFFF',
            borderRadius: 10,
            padding: '10px 13px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Open ecosystem explorer →
        </button>
      </section>
    </div>
  )
}

export default function CountryEcosystem() {
  const navigate = useNavigate()
  const { countrySlug } = useParams()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('')
  const [supportType, setSupportType] = useState('')
  const [stage, setStage] = useState('')
  const [need, setNeed] = useState('')
  const [shortlist, setShortlist] = useState(() => getStoredShortlist())
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  const country = useMemo(() => getCountryBySlug(countrySlug), [countrySlug])
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const diagnosedStage = useDiagnosticStore((state) => state.diagnosedStage)
  const corridor = useDiagnosticStore((state) => state.corridor)

  const cities = useMemo(() => {
    if (!country) return []
    return getEcosystemCitiesByCountry(country.code).map((value) => ({
      value,
      label: value,
    }))
  }, [country])

  const records = useMemo(() => {
    if (!country) return []

    const results = getEcosystemDirectoryRecords({
      countryCode: country.code,
      city,
      supportType,
      stage,
      need,
      query,
    })

    return showSavedOnly
      ? results.filter((record) => shortlist.includes(record.id))
      : results
  }, [city, country, need, query, shortlist, showSavedOnly, stage, supportType])

  useEffect(() => {
    setCity('')
  }, [countrySlug])

  if (!country) return <CountryNotFound />

  const ventureName =
    founderProfile?.venturename || founderProfile?.venture_name || 'Your venture'
  const founderStage =
    diagnosedStage ||
    founderProfile?.venturestage ||
    founderProfile?.venture_stage ||
    'current'
  const filtersActive = Boolean(
    query || city || supportType || stage || need || showSavedOnly,
  )

  function toggleShortlist(record) {
    setShortlist((current) => {
      const next = current.includes(record.id)
        ? current.filter((id) => id !== record.id)
        : [...current, record.id]
      saveShortlist(next)
      return next
    })
  }

  function clearFilters() {
    setQuery('')
    setCity('')
    setSupportType('')
    setStage('')
    setNeed('')
    setShowSavedOnly(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1080 }}>
      <section
        style={{
          background:
            'linear-gradient(135deg, #FFFFFF 0%, #FBF9F4 58%, #EEF5FA 100%)',
          border: '1px solid #E2DED6',
          borderRadius: 18,
          padding: 22,
          marginBottom: 16,
          boxShadow: '0 8px 20px rgba(22,24,27,0.04)',
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
          <div style={{ maxWidth: 700 }}>
            <div
              style={{
                color: '#35708E',
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.11em',
                textTransform: 'uppercase',
                marginBottom: 7,
              }}
            >
              Startup ecosystem explorer
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>{getCountryFlag(country.code)}</span>
              <h1
                style={{
                  color: '#1C1C1A',
                  fontSize: 28,
                  lineHeight: 1.12,
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                {country.name} ecosystem directory
              </h1>
            </div>
            <p
              style={{
                color: '#6B6965',
                fontSize: 13,
                lineHeight: 1.72,
                margin: 0,
              }}
            >
              Explore currently listed organisations, public resources, programmes, communities, and capital pathways. Use filters to build your own shortlist and verify every option directly.
            </p>
          </div>

          <div
            style={{
              minWidth: 215,
              background: '#FFFFFF',
              border: '1px solid #E2DED6',
              borderRadius: 14,
              padding: 13,
            }}
          >
            <div
              style={{
                color: '#8C8A84',
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Market context
            </div>
            <div style={{ color: '#1C1C1A', fontSize: 13, fontWeight: 800, marginBottom: 5 }}>
              {country.subregion}
            </div>
            <div style={{ color: '#6B6965', fontSize: 10.5, lineHeight: 1.55 }}>
              {country.region} · {getCountryCoverageLabel(country.coverage)}
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => navigate('/app/environment/ecosystem')}
          style={{
            border: '1px solid #D8D3C9',
            background: '#FFFFFF',
            color: '#5F5B56',
            borderRadius: 9,
            padding: '8px 11px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          ← Global explorer
        </button>
        <button
          type="button"
          onClick={() => navigate(`/app/environment/countries/${country.slug}`)}
          style={{
            border: '1px solid #D8D3C9',
            background: '#FFFFFF',
            color: '#5F5B56',
            borderRadius: 9,
            padding: '8px 11px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {country.name} country brief
        </button>
        <button
          type="button"
          onClick={() => navigate(`/app/environment/pestel/${country.slug}`)}
          style={{
            border: '1px solid #D8D3C9',
            background: '#FFFFFF',
            color: '#5F5B56',
            borderRadius: 9,
            padding: '8px 11px',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {country.name} PESTEL
        </button>
      </div>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(260px, 0.82fr)',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              color: '#35708E',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Directory, not endorsement
          </div>
          <div
            style={{
              color: '#1C1C1A',
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 8,
            }}
          >
            Choose support based on the next constraint you need to solve
          </div>
          <div style={{ color: '#5F5B56', fontSize: 12, lineHeight: 1.7 }}>
            Compare organisations by location, support type, founder stage, and need. A record means PATH360 has included a useful starting point with an official source; it does not mean an organisation is currently accepting applications or is suitable for every venture.
          </div>
        </div>

        <div
          style={{
            background: '#EEF5FA',
            border: '1px solid #D5E4EF',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              color: '#35708E',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Your context
          </div>
          <div
            style={{
              color: '#1C1C1A',
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 7,
            }}
          >
            {ventureName} · {founderStage}
          </div>
          <div style={{ color: '#4F6D7D', fontSize: 11.3, lineHeight: 1.63, marginBottom: 12 }}>
            {corridor?.label
              ? `Your ${corridor.label} context can help you decide whether you need local market access, cross-border support, customer learning, or capital preparation.`
              : 'Start with the practical outcome you need: customer access, expertise, workspace, public support, or a capital pathway.'}
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/venture-intelligence')}
            style={{
              border: '1px solid #28627F',
              background: '#28627F',
              color: '#FFFFFF',
              borderRadius: 9,
              padding: '8px 10px',
              fontSize: 10.5,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Review Venture Intelligence →
          </button>
        </div>
      </section>

      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 16,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 13,
          }}
        >
          <div>
            <div
              style={{
                color: '#2A6A51',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Filter this market
            </div>
            <div
              style={{
                color: '#1C1C1A',
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Find a relevant starting point in {country.name}
            </div>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            disabled={!filtersActive}
            style={{
              border: '1px solid #D8D3C9',
              background: '#FFFFFF',
              color: filtersActive ? '#5F5B56' : '#AAA69F',
              borderRadius: 9,
              padding: '8px 10px',
              fontSize: 10.5,
              fontWeight: 800,
              cursor: filtersActive ? 'pointer' : 'default',
            }}
          >
            Clear filters
          </button>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={`Search ${country.name} organisations, cities, or support...`}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: '1px solid #D9D4CA',
            borderRadius: 10,
            background: '#F8F6F1',
            color: '#1C1C1A',
            padding: '11px 12px',
            outline: 'none',
            fontSize: 12.5,
            marginBottom: 12,
          }}
        />

        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <FilterSelect label="City" value={city} onChange={setCity} options={cities} />
          <FilterSelect
            label="Support type"
            value={supportType}
            onChange={setSupportType}
            options={ECOSYSTEM_SUPPORT_TYPES}
          />
          <FilterSelect
            label="Founder stage"
            value={stage}
            onChange={setStage}
            options={ECOSYSTEM_STAGES}
          />
          <FilterSelect
            label="Founder need"
            value={need}
            onChange={setNeed}
            options={ECOSYSTEM_NEEDS}
          />
        </div>

        <button
          type="button"
          onClick={() => setShowSavedOnly((current) => !current)}
          style={{
            marginTop: 13,
            border: showSavedOnly ? '1px solid #7158DC' : '1px solid #D8D3C9',
            background: showSavedOnly ? '#F5F0FF' : '#FFFFFF',
            color: showSavedOnly ? '#7158DC' : '#5F5B56',
            borderRadius: 999,
            padding: '7px 10px',
            fontSize: 10.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {showSavedOnly ? 'Showing saved records' : `Saved shortlist (${shortlist.length})`}
        </button>
      </section>

      {records.length ? (
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 16,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 13,
            }}
          >
            <div>
              <div
                style={{
                  color: '#35708E',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}
              >
                Ecosystem records
              </div>
              <div
                style={{
                  color: '#1C1C1A',
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                }}
              >
                {records.length} currently listed record{records.length === 1 ? '' : 's'}
              </div>
            </div>
            <div style={{ color: '#77736D', fontSize: 10.5 }}>
              Directory reviewed: {ECOSYSTEM_DIRECTORY_UPDATED_AT}
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {records.map((record) => (
              <DirectoryCard
                key={record.id}
                record={record}
                shortlisted={shortlist.includes(record.id)}
                onToggleShortlist={toggleShortlist}
              />
            ))}
          </div>
        </section>
      ) : (
        <section
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 16,
            padding: 18,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              color: '#8A6E2A',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Coverage status
          </div>
          <div
            style={{
              color: '#1C1C1A',
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 7,
            }}
          >
            No matching directory records yet
          </div>
          <div style={{ color: '#6B6965', fontSize: 12, lineHeight: 1.7, marginBottom: 12 }}>
            {getCountryCoverageDescription(country.coverage)} No current records match the filters for {country.name}. Try clearing filters, use the global explorer to compare other markets, or use the research prompts below while coverage expands.
          </div>
          <button
            type="button"
            onClick={clearFilters}
            style={{
              border: '1px solid #8A6E2A',
              background: '#FFFFFF',
              color: '#765A1E',
              borderRadius: 9,
              padding: '8px 10px',
              fontSize: 10.5,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Reset directory filters
          </button>
        </section>
      )}

      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 16,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            color: '#35708E',
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Research deliberately
        </div>
        <div
          style={{
            color: '#1C1C1A',
            fontSize: 16,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 13,
          }}
        >
          Questions to ask before you engage with ecosystem support
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          <ResearchPrompt
            number="1"
            title="What operating constraint should this help solve?"
            description="Be specific: customer access, product feedback, a technical gap, market entry, founder peer learning, workspace, funding preparation, or a pilot route."
          />
          <ResearchPrompt
            number="2"
            title="What does the organisation actually provide?"
            description="Read the official programme page for eligibility, application timing, costs, equity terms, sector focus, location requirements, and expected founder commitment."
          />
          <ResearchPrompt
            number="3"
            title="What evidence should you bring?"
            description="Prepare a concise venture narrative, current customer learning, product evidence, traction, team context, and the specific outcome you are seeking."
          />
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(250px, 0.85fr)',
          gap: 16,
        }}
      >
        <div
          style={{
            background: '#EEF5FA',
            border: '1px solid #D5E4EF',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              color: '#35708E',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Use this in PATH360
          </div>
          <div
            style={{
              color: '#1C1C1A',
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 7,
            }}
          >
            Turn ecosystem discovery into a credible next move
          </div>
          <div style={{ color: '#4F6D7D', fontSize: 12, lineHeight: 1.7, marginBottom: 13 }}>
            Use Venture Intelligence to clarify the next constraint, Academy to build the capability it reveals, and Creation Studio to prepare the application, outreach, one-pager, or investor material needed for that next step.
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/app/academy')}
              style={{
                border: '1px solid #28627F',
                background: '#28627F',
                color: '#FFFFFF',
                borderRadius: 9,
                padding: '8px 11px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Go to Academy →
            </button>
            <button
              type="button"
              onClick={() => navigate('/app/studio')}
              style={{
                border: '1px solid #9DC2D7',
                background: '#FFFFFF',
                color: '#28627F',
                borderRadius: 9,
                padding: '8px 11px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Creation Studio →
            </button>
          </div>
        </div>

        <div
          style={{
            background: '#FCF8EE',
            border: '1px solid #EEE4C9',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              color: '#8A6E2A',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Important note
          </div>
          <div style={{ color: '#6B6965', fontSize: 11.5, lineHeight: 1.7 }}>
            Programme availability, cohort dates, investment terms, eligibility, and application processes change regularly. Always confirm current details directly with the organisation before making a decision.
          </div>
        </div>
      </section>
    </div>
  )
}