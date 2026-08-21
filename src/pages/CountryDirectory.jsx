import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  COUNTRY_CATALOGUE,
  COVERAGE_LEVELS,
  getCountryByCode,
  getCountryCoverageLabel,
  getCountryFlag,
  getFeaturedCountries,
  searchCountries,
} from '../lib/countryCatalogue.js'

const REGION_LABELS = {
  africa: 'Africa',
  africa_east: 'East Africa',
  east_africa: 'East Africa',
  africa_west: 'West Africa',
  west_africa: 'West Africa',
  africa_central: 'Central Africa',
  central_africa: 'Central Africa',
  africa_south: 'Southern Africa',
  southern_africa: 'Southern Africa',
  europe: 'Europe',
  europe_west: 'Western Europe',
  western_europe: 'Western Europe',
  europe_east: 'Eastern Europe',
  eastern_europe: 'Eastern Europe',
  north_america: 'North America',
  united_states: 'United States',
  latin_america: 'Latin America',
  middle_east: 'Middle East',
  mena: 'Middle East & North Africa',
  asia_pacific: 'Asia-Pacific',
  asia: 'Asia',
  global: 'Global',
}

const COVERAGE_STYLES = {
  [COVERAGE_LEVELS.DEEP_DIVE]: {
    background: '#EAF1EB',
    border: '#CFE0D0',
    color: '#1D6B4F',
  },
  [COVERAGE_LEVELS.CURATED]: {
    background: '#F5F0FF',
    border: '#DDD1FF',
    color: '#7158DC',
  },
  [COVERAGE_LEVELS.FOUNDATIONAL]: {
    background: '#F7F5F0',
    border: '#E2DED6',
    color: '#6B6965',
  },
}

function formatRegion(value) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  const normalised = raw.toLowerCase().replace(/[\s-]+/g, '_')

  if (REGION_LABELS[normalised]) return REGION_LABELS[normalised]

  return normalised
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function CoverageBadge({ coverage }) {
  const style = COVERAGE_STYLES[coverage] || COVERAGE_STYLES.foundational

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: 999,
        border: `1px solid ${style.border}`,
        background: style.background,
        color: style.color,
        padding: '3px 7px',
        fontSize: 9.5,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        fontWeight: 800,
        whiteSpace: 'nowrap',
      }}
    >
      {getCountryCoverageLabel(coverage)}
    </span>
  )
}

function CountryCard({ country, onOpen, isCurrentCountry = false }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(country)}
      style={{
        width: '100%',
        textAlign: 'left',
        border: '1px solid #E2DED6',
        background: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        cursor: 'pointer',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = 'translateY(-2px)'
        event.currentTarget.style.boxShadow = '0 10px 20px rgba(22,24,27,0.07)'
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = 'translateY(0)'
        event.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ fontSize: 22, lineHeight: 1 }}>
            {getCountryFlag(country.code)}
          </span>

          <div>
            <div
              style={{
                color: '#1C1C1A',
                fontSize: 13,
                fontWeight: 800,
                lineHeight: 1.2,
              }}
            >
              {country.name}
            </div>

            <div
              style={{
                color: '#8C8A84',
                fontSize: 10.5,
                marginTop: 3,
              }}
            >
              {country.subregion} · {country.region}
            </div>
          </div>
        </div>

        {isCurrentCountry ? (
          <span
            style={{
              borderRadius: 999,
              background: '#EAF1EB',
              color: '#1D6B4F',
              padding: '3px 6px',
              fontSize: 9,
              lineHeight: 1.2,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontWeight: 800,
            }}
          >
            Yours
          </span>
        ) : null}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <CoverageBadge coverage={country.coverage} />

        <span
          style={{
            color: '#1D6B4F',
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          Open brief →
        </span>
      </div>
    </button>
  )
}

export default function CountryDirectory() {
  const navigate = useNavigate()

  const ventureIntelligence = useDiagnosticStore(
    (state) => state.ventureIntelligenceProfile,
  )

  const founderProfile = useDiagnosticStore((state) => state.founderProfile)

  const [query, setQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedView, setSelectedView] = useState('all')

  const currentCountryCode =
    ventureIntelligence?.primary_country_code ||
    founderProfile?.country_code ||
    null

  const currentCountry = getCountryByCode(currentCountryCode)

  const regions = useMemo(() => {
    return [...new Set(COUNTRY_CATALOGUE.map((country) => country.region))]
      .sort((a, b) => a.localeCompare(b))
  }, [])

  const results = useMemo(() => {
    const base = searchCountries(query, {
      region: selectedRegion,
      incorporationOnly: selectedView === 'incorporation',
    })

    if (selectedView === 'featured') {
      return base.filter((country) => country.featured)
    }

    if (selectedView === 'deep-dive') {
      return base.filter(
        (country) => country.coverage === COVERAGE_LEVELS.DEEP_DIVE,
      )
    }

    return base
  }, [query, selectedRegion, selectedView])

  const featuredCountries = useMemo(() => {
    return getFeaturedCountries().slice(0, 8)
  }, [])

  function openCountry(country) {
    navigate(`/app/environment/countries/${country.slug}`)
  }

  function resetFilters() {
    setQuery('')
    setSelectedRegion('')
    setSelectedView('all')
  }

  return (
    <div style={{ padding: 24, maxWidth: 1080 }}>
      <section
        style={{
          background:
            'linear-gradient(135deg, #FFFFFF 0%, #FBF9F4 58%, #F4F0FF 100%)',
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
            gap: 18,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 700 }}>
            <div
              style={{
                color: '#7158DC',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.11em',
                textTransform: 'uppercase',
                marginBottom: 7,
              }}
            >
              Global venture intelligence
            </div>

            <h1
              style={{
                color: '#1C1C1A',
                fontSize: 27,
                lineHeight: 1.18,
                letterSpacing: '-0.03em',
                margin: '0 0 9px',
              }}
            >
              Explore country intelligence
            </h1>

            <p
              style={{
                color: '#6B6965',
                fontSize: 13,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              Search founder-relevant markets, startup hubs, and incorporation
              jurisdictions. Every country has a starting point; priority
              countries receive deeper PATH360 intelligence over time.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/environment')}
            style={{
              border: '1px solid #D8D3C9',
              background: '#FFFFFF',
              color: '#1C1C1A',
              borderRadius: 10,
              padding: '9px 12px',
              fontSize: 12,
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
            background: '#EEF4EF',
            border: '1px solid #D6E4D7',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                color: '#2A6A51',
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Your current market
            </div>

            <div
              style={{
                color: '#1C1C1A',
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              {getCountryFlag(currentCountry.code)} {currentCountry.name}
            </div>

            <div
              style={{
                color: '#4D6357',
                fontSize: 12,
                lineHeight: 1.55,
                marginTop: 4,
              }}
            >
              Open your country brief for personalised environment context.
            </div>
          </div>

          <button
            type="button"
            onClick={() => openCountry(currentCountry)}
            style={{
              border: '1px solid #1D6B4F',
              background: '#1D6B4F',
              color: '#FFFFFF',
              borderRadius: 10,
              padding: '9px 13px',
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Open {currentCountry.name} brief →
          </button>
        </section>
      ) : null}

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
            gap: 14,
            flexWrap: 'wrap',
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                color: '#2A6A51',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Find a country or jurisdiction
            </div>

            <div
              style={{
                color: '#1C1C1A',
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Search across the global founder landscape
            </div>
          </div>

          <div style={{ fontSize: 11.5, color: '#8C8A84' }}>
            {COUNTRY_CATALOGUE.length} countries and relevant jurisdictions
          </div>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Kenya, United States, Singapore, BVI, Brazil..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: '1px solid #D9D4CA',
            borderRadius: 11,
            background: '#F8F6F1',
            color: '#1C1C1A',
            padding: '12px 13px',
            outline: 'none',
            fontSize: 13,
            marginBottom: 12,
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <select
            value={selectedRegion}
            onChange={(event) => setSelectedRegion(event.target.value)}
            style={{
              height: 36,
              border: '1px solid #D9D4CA',
              borderRadius: 9,
              background: '#FFFFFF',
              color: '#4F4B45',
              padding: '0 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <option value="">All regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>

          {[
            { id: 'all', label: 'All countries' },
            { id: 'featured', label: 'Startup markets' },
            { id: 'deep-dive', label: 'PATH360 deep dives' },
            { id: 'incorporation', label: 'Incorporation jurisdictions' },
          ].map((view) => {
            const active = selectedView === view.id

            return (
              <button
                key={view.id}
                type="button"
                onClick={() => setSelectedView(view.id)}
                style={{
                  border: active ? '1px solid #1D6B4F' : '1px solid #D9D4CA',
                  background: active ? '#EAF1EB' : '#FFFFFF',
                  color: active ? '#1D6B4F' : '#6B6965',
                  borderRadius: 999,
                  padding: '8px 10px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {view.label}
              </button>
            )
          })}

          {(query || selectedRegion || selectedView !== 'all') && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#7158DC',
                padding: '7px 4px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {!query && !selectedRegion && selectedView === 'all' ? (
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
              color: '#7158DC',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Featured founder markets
          </div>

          <div
            style={{
              color: '#1C1C1A',
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 14,
            }}
          >
            Start with markets that are especially relevant to global founders
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
              gap: 10,
            }}
          >
            {featuredCountries.map((country) => (
              <CountryCard
                key={country.code}
                country={country}
                onOpen={openCountry}
                isCurrentCountry={country.code === currentCountry?.code}
              />
            ))}
          </div>
        </section>
      ) : null}

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
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                color: '#2A6A51',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Country results
            </div>

            <div
              style={{
                color: '#1C1C1A',
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              {results.length} result{results.length === 1 ? '' : 's'}
            </div>
          </div>

          <div
            style={{
              color: '#8C8A84',
              fontSize: 11.5,
              maxWidth: 410,
              lineHeight: 1.55,
            }}
          >
            Coverage labels show the current depth of Path360 guidance. Every
            country remains available to explore.
          </div>
        </div>

        {results.length ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 10,
            }}
          >
            {results.map((country) => (
              <CountryCard
                key={country.code}
                country={country}
                onOpen={openCountry}
                isCurrentCountry={country.code === currentCountry?.code}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              background: '#F8F6F1',
              border: '1px solid #ECE6DB',
              borderRadius: 13,
              padding: 16,
              color: '#6B6965',
              fontSize: 12.5,
              lineHeight: 1.65,
            }}
          >
            No matching country or jurisdiction was found. Try a country name,
            ISO code, region, or common alias such as “UK”, “USA”, or “BVI”.
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
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 16,
            padding: 18,
          }}
        >
          <div
            style={{
              color: '#7158DC',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 7,
            }}
          >
            A global library, built responsibly
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
            Every market has a starting point. Deeper country guidance grows
            with founder need and trusted verification.
          </div>

          <div
            style={{
              color: '#6B6965',
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            PATH360 country intelligence is designed to help founders ask
            better questions, find credible sources, and decide what matters
            next. It does not replace qualified local legal, tax, employment,
            immigration, or investment advice.
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
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 7,
            }}
          >
            Coverage guide
          </div>

          <div
            style={{
              display: 'grid',
              gap: 8,
              fontSize: 11.5,
              color: '#6B6965',
              lineHeight: 1.55,
            }}
          >
            <div>
              <CoverageBadge coverage={COVERAGE_LEVELS.DEEP_DIVE} />
              <span style={{ marginLeft: 7 }}>Detailed country intelligence</span>
            </div>

            <div>
              <CoverageBadge coverage={COVERAGE_LEVELS.CURATED} />
              <span style={{ marginLeft: 7 }}>Selected founder resources</span>
            </div>

            <div>
              <CoverageBadge coverage={COVERAGE_LEVELS.FOUNDATIONAL} />
              <span style={{ marginLeft: 7 }}>Core context and starting points</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}