import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  COUNTRY_CATALOGUE,
  getCountryByCode,
  getCountryFlag,
} from '../lib/countryCatalogue.js'
import {
  ECOSYSTEM_DIRECTORY,
  ECOSYSTEM_DIRECTORY_UPDATED_AT,
  ECOSYSTEM_NEEDS,
  ECOSYSTEM_STAGES,
  ECOSYSTEM_SUPPORT_TYPES,
  getEcosystemCoverageByCountry,
  getEcosystemDirectoryRecords,
} from '../data/ecosystemDirectory.js'

const SHORTLIST_KEY = 'path360_ecosystem_shortlist'

const MAP_POSITIONS = {
  KE: { left: '53%', top: '58%' },
  NG: { left: '44%', top: '55%' },
  ZA: { left: '51%', top: '77%' },
  RW: { left: '54%', top: '61%' },
  UG: { left: '54%', top: '59%' },
  TZ: { left: '55%', top: '64%' },
  GH: { left: '43%', top: '54%' },
  EG: { left: '52%', top: '47%' },
  US: { left: '21%', top: '40%' },
  GB: { left: '45%', top: '33%' },
  DE: { left: '48%', top: '36%' },
  NL: { left: '47%', top: '35%' },
  FR: { left: '46%', top: '38%' },
  IE: { left: '43%', top: '34%' },
  EE: { left: '51%', top: '31%' },
  CH: { left: '48%', top: '40%' },
  SG: { left: '73%', top: '62%' },
  AE: { left: '59%', top: '53%' },
  SA: { left: '57%', top: '52%' },
  IN: { left: '66%', top: '54%' },
  JP: { left: '82%', top: '43%' },
  KR: { left: '79%', top: '42%' },
  IL: { left: '55%', top: '49%' },
  AU: { left: '82%', top: '77%' },
  BR: { left: '36%', top: '72%' },
  MX: { left: '22%', top: '53%' },
  CO: { left: '30%', top: '62%' },
  CL: { left: '31%', top: '79%' },
  ID: { left: '76%', top: '66%' },
  MY: { left: '72%', top: '61%' },
  PH: { left: '78%', top: '58%' },
  VN: { left: '75%', top: '56%' },
}

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

function FilterSelect({ label, value, onChange, options, disabled = false }) {
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
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: '100%',
          border: '1px solid #D9D4CA',
          borderRadius: 9,
          background: disabled ? '#F0EEE9' : '#FFFFFF',
          color: '#373532',
          padding: '9px 10px',
          fontSize: 11.5,
          cursor: disabled ? 'not-allowed' : 'pointer',
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

function DirectoryCard({ record, country, shortlisted, onToggleShortlist }) {
  const supportLabels = record.supportTypes
    .slice(0, 2)
    .map((value) => getOptionLabel(value, ECOSYSTEM_SUPPORT_TYPES))

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
          marginBottom: 8,
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
            {getCountryFlag(record.countryCode)} {record.city} · {country?.name || record.countryCode}
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

      <div
        style={{
          display: 'flex',
          gap: 5,
          flexWrap: 'wrap',
          marginBottom: 9,
        }}
      >
        {supportLabels.map((label) => (
          <Tag key={label} tone="blue">{label}</Tag>
        ))}
        <Tag tone="green">Official source</Tag>
      </div>

      <p
        style={{
          color: '#5F5B56',
          fontSize: 11.5,
          lineHeight: 1.62,
          margin: '0 0 11px',
          flex: 1,
        }}
      >
        {record.description}
      </p>

      <div
        style={{
          color: '#77736D',
          fontSize: 9.8,
          lineHeight: 1.5,
          marginBottom: 10,
        }}
      >
        Last checked: {record.lastVerified}
      </div>

      <a
        href={record.websiteUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
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

function MapMarker({ country, count, active, onClick }) {
  const position = MAP_POSITIONS[country.code]
  if (!position) return null

  const size = Math.min(38, 18 + count * 3)

  return (
    <button
      type="button"
      title={`${country.name}: ${count} directory record${count === 1 ? '' : 's'}`}
      onClick={onClick}
      style={{
        position: 'absolute',
        left: position.left,
        top: position.top,
        transform: 'translate(-50%, -50%)',
        width: size,
        height: size,
        borderRadius: 999,
        border: active ? '3px solid #FFFFFF' : '2px solid rgba(255,255,255,0.88)',
        background: active ? '#7158DC' : '#28627F',
        color: '#FFFFFF',
        boxShadow: '0 3px 9px rgba(22,24,27,0.22)',
        fontSize: 9,
        fontWeight: 900,
        cursor: 'pointer',
        zIndex: 2,
      }}
    >
      {count}
    </button>
  )
}

export default function EcosystemDirectory() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [countryCode, setCountryCode] = useState('')
  const [city, setCity] = useState('')
  const [supportType, setSupportType] = useState('')
  const [stage, setStage] = useState('')
  const [need, setNeed] = useState('')
  const [shortlist, setShortlist] = useState(() => getStoredShortlist())
  const [showSavedOnly, setShowSavedOnly] = useState(false)

  const ventureIntelligence = useDiagnosticStore(
    (state) => state.ventureIntelligenceProfile,
  )
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)

  const currentCountryCode =
    ventureIntelligence?.primary_country_code ||
    founderProfile?.country_code ||
    founderProfile?.countrycode ||
    ''
  const currentCountry = getCountryByCode(currentCountryCode)

  const coverageByCountry = useMemo(() => getEcosystemCoverageByCountry(), [])
  const directoryCountries = useMemo(
    () =>
      COUNTRY_CATALOGUE.filter((country) => coverageByCountry[country.code])
        .sort((a, b) => a.name.localeCompare(b.name)),
    [coverageByCountry],
  )

  const cityOptions = useMemo(() => {
    if (!countryCode) return []

    return [...new Set(
      ECOSYSTEM_DIRECTORY
        .filter((record) => record.countryCode === countryCode)
        .map((record) => record.city),
    )]
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b))
      .map((value) => ({ value, label: value }))
  }, [countryCode])

  const results = useMemo(() => {
    const records = getEcosystemDirectoryRecords({
      countryCode,
      city,
      supportType,
      stage,
      need,
      query,
    })

    return showSavedOnly
      ? records.filter((record) => shortlist.includes(record.id))
      : records
  }, [city, countryCode, need, query, shortlist, showSavedOnly, stage, supportType])

  const activeCountry = getCountryByCode(countryCode)
  const filtersActive = Boolean(
    query || countryCode || city || supportType || stage || need || showSavedOnly,
  )

  useEffect(() => {
    setCity('')
  }, [countryCode])

  function openCountry(country) {
    navigate(`/app/environment/ecosystem/${country.slug}`)
  }

  function chooseCountry(nextCountryCode) {
    setCountryCode(nextCountryCode)
    setCity('')
    setShowSavedOnly(false)
  }

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
    setCountryCode('')
    setCity('')
    setSupportType('')
    setStage('')
    setNeed('')
    setShowSavedOnly(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1120 }}>
      <section
        style={{
          background:
            'linear-gradient(135deg, #FFFFFF 0%, #FBF9F4 55%, #EEF5FA 100%)',
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
          <div style={{ maxWidth: 735 }}>
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
              Global startup ecosystem explorer
            </div>
            <h1
              style={{
                color: '#1C1C1A',
                fontSize: 28,
                lineHeight: 1.16,
                letterSpacing: '-0.03em',
                margin: '0 0 9px',
              }}
            >
              Discover startup support across markets
            </h1>
            <p
              style={{
                color: '#6B6965',
                fontSize: 13,
                lineHeight: 1.72,
                margin: 0,
              }}
            >
              Search a growing directory of organisations, programmes, communities, public resources, and capital pathways. Inclusion supports discovery and is not an endorsement.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/environment')}
            style={{
              border: '1px solid #D8D3C9',
              background: '#FFFFFF',
              color: '#5F5B56',
              borderRadius: 10,
              padding: '9px 12px',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ← Environment home
          </button>
        </div>
      </section>

      {currentCountry ? (
        <section
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
            background: '#EEF4EF',
            border: '1px solid #D6E4D7',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 16,
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
                marginBottom: 4,
              }}
            >
              Your primary venture market
            </div>
            <div style={{ color: '#1C1C1A', fontSize: 14, fontWeight: 800 }}>
              {getCountryFlag(currentCountry.code)} {currentCountry.name}
            </div>
          </div>
          <button
            type="button"
            onClick={() => chooseCountry(currentCountry.code)}
            style={{
              border: '1px solid #1D6B4F',
              background: '#1D6B4F',
              color: '#FFFFFF',
              borderRadius: 9,
              padding: '8px 11px',
              fontSize: 10.5,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Filter to {currentCountry.name} →
          </button>
        </section>
      ) : null}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.12fr) minmax(290px, 0.88fr)',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            minHeight: 330,
            background:
              'radial-gradient(circle at 48% 53%, rgba(105,158,190,0.16), transparent 39%), linear-gradient(145deg, #EDF4F7 0%, #F8FAF8 48%, #EDF0F7 100%)',
            border: '1px solid #D5E4EF',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div style={{ position: 'relative', zIndex: 3, maxWidth: 480 }}>
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
              Directory coverage map
            </div>
            <div
              style={{
                color: '#1C1C1A',
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: 6,
              }}
            >
              Explore countries with available directory records
            </div>
            <div style={{ color: '#5F5B56', fontSize: 11.5, lineHeight: 1.62 }}>
              Each marker shows the number of currently listed records. It represents PATH360 directory coverage, not a startup-ecosystem ranking.
            </div>
          </div>

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: '94px 18px 18px',
              borderRadius: 18,
              backgroundImage:
                'radial-gradient(circle, rgba(70,121,150,0.18) 1.2px, transparent 1.7px)',
              backgroundSize: '12px 12px',
              opacity: 0.82,
            }}
          />

          {directoryCountries.map((country) => (
            <MapMarker
              key={country.code}
              country={country}
              count={coverageByCountry[country.code]}
              active={country.code === countryCode}
              onClick={() => chooseCountry(country.code)}
            />
          ))}

          <div
            style={{
              position: 'absolute',
              right: 14,
              bottom: 12,
              zIndex: 3,
              background: 'rgba(255,255,255,0.88)',
              border: '1px solid #D5E4EF',
              borderRadius: 999,
              padding: '6px 9px',
              color: '#5F5B56',
              fontSize: 9.5,
              fontWeight: 800,
            }}
          >
            {directoryCountries.length} covered markets · {ECOSYSTEM_DIRECTORY.length} records
          </div>
        </div>

        <aside
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              color: '#7158DC',
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            How to use this
          </div>
          <div
            style={{
              color: '#1C1C1A',
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 10,
            }}
          >
            Use the directory to make your own shortlist
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              ['1', 'Choose a market', 'Click a marker or select a country filter.'],
              ['2', 'Describe the need', 'Filter by support type, stage, or the next constraint.'],
              ['3', 'Verify directly', 'Open the official source and confirm current terms and availability.'],
            ].map(([number, title, text]) => (
              <div key={number} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <span
                  style={{
                    width: 23,
                    height: 23,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    background: '#F5F0FF',
                    color: '#7158DC',
                    borderRadius: 8,
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  {number}
                </span>
                <div>
                  <div style={{ color: '#1C1C1A', fontSize: 11.5, fontWeight: 800, marginBottom: 2 }}>
                    {title}
                  </div>
                  <div style={{ color: '#6B6965', fontSize: 10.8, lineHeight: 1.55 }}>{text}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
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
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 14,
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
              Search and filter
            </div>
            <div
              style={{
                color: '#1C1C1A',
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Find support by location and need
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
          placeholder="Search an organisation, city, country, or support type..."
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
          <FilterSelect
            label="Country"
            value={countryCode}
            onChange={chooseCountry}
            options={directoryCountries.map((country) => ({
              value: country.code,
              label: `${getCountryFlag(country.code)} ${country.name}`,
            }))}
          />
          <FilterSelect
            label="City"
            value={city}
            onChange={setCity}
            options={cityOptions}
            disabled={!countryCode}
          />
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

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 13 }}>
          <button
            type="button"
            onClick={() => setShowSavedOnly((current) => !current)}
            style={{
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
          {activeCountry ? (
            <button
              type="button"
              onClick={() => openCountry(activeCountry)}
              style={{
                border: '1px solid #D5E4EF',
                background: '#EEF5FA',
                color: '#28627F',
                borderRadius: 999,
                padding: '7px 10px',
                fontSize: 10.5,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Open {activeCountry.name} explorer →
            </button>
          ) : null}
        </div>
      </section>

      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 16,
          padding: 18,
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
              Ecosystem directory
            </div>
            <div
              style={{
                color: '#1C1C1A',
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              {results.length} record{results.length === 1 ? '' : 's'} {activeCountry ? `in ${activeCountry.name}` : 'across covered markets'}
            </div>
          </div>
          <div style={{ color: '#77736D', fontSize: 10.5, lineHeight: 1.5 }}>
            Directory reviewed: {ECOSYSTEM_DIRECTORY_UPDATED_AT}
          </div>
        </div>

        {results.length ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {results.map((record) => (
              <DirectoryCard
                key={record.id}
                record={record}
                country={getCountryByCode(record.countryCode)}
                shortlisted={shortlist.includes(record.id)}
                onToggleShortlist={toggleShortlist}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              background: '#F8F6F1',
              border: '1px solid #ECE6DB',
              borderRadius: 12,
              padding: 15,
              color: '#6B6965',
              fontSize: 12,
              lineHeight: 1.65,
            }}
          >
            No directory records match these filters. Try removing a filter, choosing another market, or browse the covered markets on the map. Countries without records remain searchable through the wider Environment catalogue while directory coverage expands.
          </div>
        )}
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(250px, 0.85fr)',
          gap: 16,
          marginTop: 16,
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
            A neutral discovery tool
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
            Make your own assessment before you apply, join, or engage
          </div>
          <div style={{ color: '#4F6D7D', fontSize: 11.5, lineHeight: 1.67 }}>
            A directory entry does not mean PATH360 recommends an organisation, that it is accepting applications, or that it is right for your venture. Compare options against your next operating constraint and confirm details with the official source.
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
            Coverage note
          </div>
          <div style={{ color: '#6B6965', fontSize: 11.5, lineHeight: 1.67 }}>
            We are expanding country and city records over time. Use the map as a view of directory coverage—not as a measure of ecosystem quality, activity, or investment potential.
          </div>
        </div>
      </section>
    </div>
  )
}