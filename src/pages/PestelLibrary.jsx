import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  COUNTRY_CATALOGUE,
  COVERAGE_LEVELS,
  getCountryByCode,
  getCountryCoverageLabel,
  getCountryFlag,
  searchCountries,
} from '../lib/countryCatalogue.js'

const PESTEL_AREAS = [
  {
    id: 'political',
    letter: 'P',
    label: 'Political',
    description: 'Government direction, public policy, stability, trade, and institutional context.',
    color: '#7158DC',
    background: '#F5F0FF',
    border: '#DDD1FF',
  },
  {
    id: 'economic',
    letter: 'E',
    label: 'Economic',
    description: 'Currency, inflation, purchasing power, capital, costs, and market economics.',
    color: '#1D6B4F',
    background: '#EEF4EF',
    border: '#D6E4D7',
  },
  {
    id: 'social',
    letter: 'S',
    label: 'Social',
    description: 'Customer behaviour, demographics, trust, talent, affordability, and culture.',
    color: '#35708E',
    background: '#EEF5FA',
    border: '#D5E4EF',
  },
  {
    id: 'technological',
    letter: 'T',
    label: 'Technological',
    description: 'Digital infrastructure, payment rails, innovation, connectivity, and technical capability.',
    color: '#8A6E2A',
    background: '#FCF8EE',
    border: '#EEE4C9',
  },
  {
    id: 'environmental',
    letter: 'E',
    label: 'Environmental',
    description: 'Climate exposure, energy, infrastructure, sustainability, and resource conditions.',
    color: '#417760',
    background: '#EDF5F0',
    border: '#D2E5D9',
  },
  {
    id: 'legal',
    letter: 'L',
    label: 'Legal',
    description: 'Company setup, tax, employment, data, IP, licensing, and regulatory obligations.',
    color: '#9A5252',
    background: '#FBEEEE',
    border: '#EACFCF',
  },
]

function CountryRow({ country, onOpen, current = false }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(country)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        border: '1px solid #E2DED6',
        background: '#FFFFFF',
        borderRadius: 12,
        padding: '11px 12px',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>
          {getCountryFlag(country.code)}
        </span>
        <span>
          <span
            style={{
              display: 'block',
              color: '#1C1C1A',
              fontSize: 12.5,
              fontWeight: 800,
              marginBottom: 2,
            }}
          >
            {country.name}
          </span>
          <span style={{ display: 'block', color: '#8C8A84', fontSize: 10.5 }}>
            {country.subregion} · {country.region}
          </span>
        </span>
      </span>

      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: current ? '#1D6B4F' : '#7158DC',
          fontSize: 10.5,
          fontWeight: 800,
        }}
      >
        {current ? 'Your market' : getCountryCoverageLabel(country.coverage)}
        <span>→</span>
      </span>
    </button>
  )
}

export default function PestelLibrary() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const ventureIntelligence = useDiagnosticStore(
    (state) => state.ventureIntelligenceProfile,
  )
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const corridor = useDiagnosticStore((state) => state.corridor)

  const currentCountryCode =
    ventureIntelligence?.primary_country_code ||
    founderProfile?.country_code ||
    founderProfile?.countrycode ||
    null

  const currentCountry = getCountryByCode(currentCountryCode)

  const results = useMemo(() => {
    if (!query.trim()) return []
    return searchCountries(query, { limit: 12 })
  }, [query])

  const featuredPestelCountries = useMemo(() => {
    return COUNTRY_CATALOGUE.filter((country) => country.featured).slice(0, 9)
  }, [])

  function openCountryPestel(country) {
    navigate(`/app/environment/pestel/${country.slug}`)
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
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 710 }}>
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
              Global PESTEL Library
            </h1>

            <p
              style={{
                color: '#6B6965',
                fontSize: 13,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              Understand the political, economic, social, technological,
              environmental, and legal forces around a country—then translate
              them into sharper founder questions and next actions.
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
              fontSize: 12,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ← Environment home
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
            color: '#2A6A51',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          The six lenses
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
          A PESTEL is useful only when it turns external change into a founder decision
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {PESTEL_AREAS.map((area) => (
            <div
              key={area.id}
              style={{
                background: area.background,
                border: `1px solid ${area.border}`,
                borderRadius: 13,
                padding: 13,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 7,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 8,
                    background: '#FFFFFF',
                    color: area.color,
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {area.letter}
                </span>
                <span
                  style={{
                    color: area.color,
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {area.label}
                </span>
              </div>

              <div
                style={{
                  color: '#5F5B56',
                  fontSize: 11,
                  lineHeight: 1.55,
                }}
              >
                {area.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {currentCountry ? (
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.25fr) minmax(250px, 0.75fr)',
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              background: '#EEF4EF',
              border: '1px solid #D6E4D7',
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div
              style={{
                color: '#2A6A51',
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Your current market
            </div>

            <div
              style={{
                color: '#1C1C1A',
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: 7,
              }}
            >
              {getCountryFlag(currentCountry.code)} {currentCountry.name}
            </div>

            <div
              style={{
                color: '#4D6357',
                fontSize: 12,
                lineHeight: 1.65,
                marginBottom: 13,
              }}
            >
              Start with the external forces most likely to shape your next
              market, operating, investor, or expansion decision.
            </div>

            <button
              type="button"
              onClick={() => openCountryPestel(currentCountry)}
              style={{
                border: '1px solid #1D6B4F',
                background: '#1D6B4F',
                color: '#FFFFFF',
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: 11.5,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Open {currentCountry.name} PESTEL →
            </button>
          </div>

          <div
            style={{
              background: '#F5F0FF',
              border: '1px solid #DDD1FF',
              borderRadius: 16,
              padding: 18,
            }}
          >
            <div
              style={{
                color: '#7158DC',
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Your corridor lens
            </div>

            <div
              style={{
                color: '#1C1C1A',
                fontSize: 15,
                fontWeight: 800,
                lineHeight: 1.35,
                letterSpacing: '-0.02em',
                marginBottom: 8,
              }}
            >
              {corridor?.label || 'Your global operating context'}
            </div>

            <div
              style={{
                color: '#51486A',
                fontSize: 11.5,
                lineHeight: 1.65,
              }}
            >
              Path360 will use your country, stage, and corridor to highlight
              the PESTEL factors that deserve attention before you act.
            </div>
          </div>
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
                color: '#7158DC',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Explore a country
            </div>

            <div
              style={{
                color: '#1C1C1A',
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Open a country PESTEL snapshot
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/environment/countries')}
            style={{
              border: '1px solid #D8D3C9',
              background: '#FFFFFF',
              color: '#5F5B56',
              borderRadius: 9,
              padding: '8px 11px',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Browse all countries →
          </button>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Kenya, United States, Singapore, Brazil, BVI..."
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
          }}
        />

        {query.trim() ? (
          <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
            {results.length ? (
              results.map((country) => (
                <CountryRow
                  key={country.code}
                  country={country}
                  current={country.code === currentCountry?.code}
                  onOpen={openCountryPestel}
                />
              ))
            ) : (
              <div
                style={{
                  background: '#F8F6F1',
                  border: '1px solid #ECE6DB',
                  borderRadius: 12,
                  padding: 13,
                  color: '#6B6965',
                  fontSize: 12,
                }}
              >
                No matching country or jurisdiction found. Try a country name,
                region, ISO code, or alias such as “UK”, “USA”, or “BVI”.
              </div>
            )}
          </div>
        ) : null}
      </section>

      {!query.trim() ? (
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
              color: '#2A6A51',
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Featured PESTEL markets
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
            Explore external market forces across founder-relevant countries
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 10,
            }}
          >
            {featuredPestelCountries.map((country) => (
              <CountryRow
                key={country.code}
                country={country}
                current={country.code === currentCountry?.code}
                onOpen={openCountryPestel}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}