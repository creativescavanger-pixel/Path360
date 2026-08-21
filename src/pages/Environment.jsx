import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  getCountryByCode,
  getCountryFlag,
  searchCountries,
} from '../lib/countryCatalogue.js'

const RECENT_MARKETS_KEY = 'path360_recent_markets'

const LENSES = [
  {
    id: 'overview',
    eyebrow: 'Market overview',
    title: 'Understand this market',
    description:
      'See practical context, founder questions, and trusted starting points for building or expanding here.',
    route: (country) => `/app/environment/countries/${country.slug}`,
    tone: 'green',
  },
  {
    id: 'pestel',
    eyebrow: 'External forces',
    title: 'Explore market signals',
    description:
      'See political, economic, social, technology, environmental, and legal factors that can shape your next move.',
    route: (country) => `/app/environment/pestel/${country.slug}`,
    tone: 'purple',
  },
  {
    id: 'ecosystem',
    eyebrow: 'Startup support',
    title: 'Find useful pathways',
    description:
      'Explore communities, programmes, capital pathways, and ecosystem resources when you need support for a specific goal.',
    route: (country) => `/app/environment/ecosystem/${country.slug}`,
    tone: 'blue',
  },
  {
    id: 'setup',
    eyebrow: 'Company setup',
    title: 'Set up responsibly',
    description:
      'Work through company, tax, people, data, licensing, and cross-border questions at your own pace.',
    route: (country) => `/app/environment/laws/${country.slug}`,
    tone: 'gold',
  },
]

const REGION_LABELS = {
  africa_east: 'East Africa',
  east_africa: 'East Africa',
  africa_west: 'West Africa',
  west_africa: 'West Africa',
  africa_central: 'Central Africa',
  central_africa: 'Central Africa',
  africa_south: 'Southern Africa',
  southern_africa: 'Southern Africa',
  north_africa: 'North Africa',
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

function getToneStyle(tone) {
  const tones = {
    green: {
      background: '#EEF4EF',
      border: '#D6E4D7',
      eyebrow: '#2A6A51',
      iconBackground: '#DDEDE0',
      iconColor: '#1D6B4F',
      button: '#1D6B4F',
    },
    purple: {
      background: '#F5F0FF',
      border: '#DDD1FF',
      eyebrow: '#7158DC',
      iconBackground: '#EAE1FF',
      iconColor: '#7158DC',
      button: '#7158DC',
    },
    blue: {
      background: '#EEF5FA',
      border: '#D5E4EF',
      eyebrow: '#35708E',
      iconBackground: '#DCECF7',
      iconColor: '#28627F',
      button: '#28627F',
    },
    gold: {
      background: '#FCF8EE',
      border: '#EEE4C9',
      eyebrow: '#8A6E2A',
      iconBackground: '#F6EED8',
      iconColor: '#765A1E',
      button: '#765A1E',
    },
  }

  return tones[tone] || tones.green
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

function getStoredRecentMarkets() {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(RECENT_MARKETS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.slice(0, 5) : []
  } catch {
    return []
  }
}

function saveRecentMarket(country) {
  if (typeof window === 'undefined' || !country) return

  try {
    const current = getStoredRecentMarkets()
    const next = [
      {
        code: country.code,
        slug: country.slug,
        name: country.name,
        region: country.region,
        subregion: country.subregion,
      },
      ...current.filter((item) => item.code !== country.code),
    ].slice(0, 5)

    window.localStorage.setItem(RECENT_MARKETS_KEY, JSON.stringify(next))
  } catch {
    // Recent markets are a convenience feature only.
  }
}

function LensCard({ lens, country, onOpen }) {
  const tone = getToneStyle(lens.tone)

  return (
    <button
      type="button"
      onClick={() => onOpen(lens)}
      style={{
        textAlign: 'left',
        border: `1px solid ${tone.border}`,
        background: tone.background,
        borderRadius: 15,
        padding: 16,
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
          width: 30,
          height: 30,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 10,
          background: tone.iconBackground,
          color: tone.iconColor,
          fontWeight: 900,
          fontSize: 14,
          marginBottom: 12,
        }}
      >
        →
      </div>
      <div
        style={{
          fontSize: 10,
          color: tone.eyebrow,
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 5,
        }}
      >
        {lens.eyebrow}
      </div>
      <div
        style={{
          fontSize: 16,
          color: '#1C1C1A',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBottom: 7,
        }}
      >
        {lens.title}
      </div>
      <div
        style={{
          fontSize: 12,
          color: '#5F5B56',
          lineHeight: 1.65,
          marginBottom: 12,
        }}
      >
        {lens.description}
      </div>
      <div
        style={{
          color: tone.eyebrow,
          fontSize: 10.5,
          fontWeight: 800,
        }}
      >
        Explore {country.name} →
      </div>
    </button>
  )
}

function MarketRow({ country, current, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(country)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: '#FFFFFF',
        border: '1px solid #E2DED6',
        borderRadius: 11,
        padding: '10px 12px',
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
          <span
            style={{
              display: 'block',
              color: '#8C8A84',
              fontSize: 10.5,
            }}
          >
            {country.subregion} · {country.region}
          </span>
        </span>
      </span>
      <span
        style={{
          color: current ? '#1D6B4F' : '#35708E',
          fontSize: 10.5,
          fontWeight: 800,
          whiteSpace: 'nowrap',
        }}
      >
        {current ? 'Current context' : 'View market'} →
      </span>
    </button>
  )
}

export default function Environment() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [recentMarkets, setRecentMarkets] = useState(() =>
    getStoredRecentMarkets(),
  )

  const ventureIntelligence = useDiagnosticStore(
    (state) => state.ventureIntelligenceProfile,
  )
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const diagnosedStage = useDiagnosticStore((state) => state.diagnosedStage)
  const corridor = useDiagnosticStore((state) => state.corridor)

  const primaryCountryCode =
    ventureIntelligence?.primary_country_code ||
    founderProfile?.country_code ||
    founderProfile?.countrycode ||
    null

  const currentCountry = getCountryByCode(primaryCountryCode)
  const rawRegion =
    ventureIntelligence?.primary_region_code ||
    founderProfile?.operating_geography ||
    founderProfile?.operatingGeography ||
    ''
  const regionName = formatRegion(rawRegion) || currentCountry?.subregion || ''
  const currentStage =
    diagnosedStage ||
    founderProfile?.venturestage ||
    founderProfile?.venture_stage ||
    null

  const searchResults = useMemo(() => {
    if (!query.trim()) return []
    return searchCountries(query, { limit: 8 })
  }, [query])

  useEffect(() => {
    if (!selectedCountry && currentCountry) {
      setSelectedCountry(currentCountry)
    }
  }, [currentCountry, selectedCountry])

  function selectMarket(country) {
    setSelectedCountry(country)
    setQuery('')
    saveRecentMarket(country)
    setRecentMarkets(getStoredRecentMarkets())
  }

  function openLens(lens) {
    if (!selectedCountry) return
    saveRecentMarket(selectedCountry)
    setRecentMarkets(getStoredRecentMarkets())
    navigate(lens.route(selectedCountry))
  }

  const viewingDifferentMarket =
    selectedCountry &&
    currentCountry &&
    selectedCountry.code !== currentCountry.code

  return (
    <div style={{ padding: 24, maxWidth: 1080 }}>
      <section
        style={{
          background:
            'linear-gradient(135deg, #FFFFFF 0%, #FBF9F4 62%, #F4F0FF 100%)',
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
          <div style={{ maxWidth: 690 }}>
            <div
              style={{
                fontSize: 11,
                color: '#7158DC',
                fontWeight: 800,
                letterSpacing: '0.11em',
                textTransform: 'uppercase',
                marginBottom: 7,
              }}
            >
              Market guidance
            </div>
            <h1
              style={{
                fontSize: 27,
                lineHeight: 1.18,
                letterSpacing: '-0.03em',
                color: '#1C1C1A',
                margin: '0 0 9px',
              }}
            >
              Explore markets with a clear next step
            </h1>
            <p
              style={{
                fontSize: 13,
                color: '#6B6965',
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              Research any country or jurisdiction, then choose the market lens that helps you make your next credible move.
            </p>
          </div>

          <div
            style={{
              minWidth: 238,
              background: '#FFFFFF',
              border: '1px solid #E2DED6',
              borderRadius: 14,
              padding: 13,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: '#8C8A84',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Your venture context
            </div>
            <div
              style={{
                fontSize: 13,
                color: '#1C1C1A',
                fontWeight: 800,
                marginBottom: 5,
              }}
            >
              {currentCountry
                ? `${getCountryFlag(currentCountry.code)} ${currentCountry.name}`
                : 'Set your primary market'}
            </div>
            <div
              style={{
                fontSize: 11.5,
                color: '#6B6965',
                lineHeight: 1.55,
              }}
            >
              {[regionName, currentStage, corridor?.label]
                .filter(Boolean)
                .join(' · ') || 'Your market, stage, and operating context'}
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(270px, 0.8fr)',
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
              color: '#2A6A51',
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Choose a market
          </div>
          <div
            style={{
              color: '#1C1C1A',
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 7,
            }}
          >
            Start with your context, or explore anywhere
          </div>
          <div
            style={{
              color: '#6B6965',
              fontSize: 12,
              lineHeight: 1.65,
              marginBottom: 13,
            }}
          >
            Viewing another country does not change your primary venture market. You can research Kenya, the United States, or any other market freely.
          </div>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a country, ISO code, region, or alias..."
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
              {searchResults.length ? (
                searchResults.map((country) => (
                  <MarketRow
                    key={country.code}
                    country={country}
                    current={country.code === currentCountry?.code}
                    onSelect={selectMarket}
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
                    lineHeight: 1.6,
                  }}
                >
                  No matching country or jurisdiction found. Try a country name, ISO code, region, or an alias such as UK, USA, or BVI.
                </div>
              )}
            </div>
          ) : null}
        </div>

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
            Current viewing market
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
            {selectedCountry
              ? `${getCountryFlag(selectedCountry.code)} ${selectedCountry.name}`
              : 'Choose a market'}
          </div>
          <div
            style={{
              color: '#4D6357',
              fontSize: 12,
              lineHeight: 1.65,
              marginBottom: currentCountry ? 13 : 0,
            }}
          >
            {viewingDifferentMarket
              ? `You are researching ${selectedCountry.name}. Your primary venture context remains ${currentCountry.name}.`
              : selectedCountry
                ? 'Choose the lens that best matches what you need to understand right now.'
                : 'Search for a country above, then select the kind of guidance you need.'}
          </div>
          {currentCountry ? (
            <button
              type="button"
              onClick={() => selectMarket(currentCountry)}
              disabled={!viewingDifferentMarket}
              style={{
                border: '1px solid #1D6B4F',
                background: viewingDifferentMarket ? '#1D6B4F' : '#DDEDE0',
                color: viewingDifferentMarket ? '#FFFFFF' : '#2A6A51',
                borderRadius: 10,
                padding: '9px 12px',
                fontSize: 11.5,
                fontWeight: 800,
                cursor: viewingDifferentMarket ? 'pointer' : 'default',
                opacity: viewingDifferentMarket ? 1 : 0.9,
              }}
            >
              {viewingDifferentMarket
                ? `Return to ${currentCountry.name} →`
                : `Viewing ${currentCountry.name} ✓`}
            </button>
          ) : null}
        </div>
      </section>

      {recentMarkets.length ? (
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
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Recently explored
          </div>
          <div
            style={{
              color: '#1C1C1A',
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 12,
            }}
          >
            Continue your market research
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {recentMarkets.map((market) => (
              <button
                key={market.code}
                type="button"
                onClick={() =>
                  selectMarket({
                    ...market,
                    aliases: [],
                  })
                }
                style={{
                  border: '1px solid #DDD1FF',
                  background: '#F5F0FF',
                  color: '#51486A',
                  borderRadius: 999,
                  padding: '8px 10px',
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {getCountryFlag(market.code)} {market.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => navigate('/app/environment/countries')}
              style={{
                border: '1px solid #D8D3C9',
                background: '#FFFFFF',
                color: '#5F5B56',
                borderRadius: 999,
                padding: '8px 10px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Browse all countries →
            </button>
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
              color: '#7158DC',
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Explore freely
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
            Your recently viewed markets will appear here
          </div>
          <div
            style={{
              color: '#6B6965',
              fontSize: 12,
              lineHeight: 1.65,
              marginBottom: 12,
            }}
          >
            Researching another country is always separate from changing your primary venture market.
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/environment/countries')}
            style={{
              border: '1px solid #7158DC',
              background: '#FFFFFF',
              color: '#7158DC',
              borderRadius: 9,
              padding: '8px 11px',
              fontSize: 11,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Browse all countries →
          </button>
        </section>
      )}

      {selectedCountry ? (
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
              color: '#35708E',
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Choose a lens
          </div>
          <div
            style={{
              color: '#1C1C1A',
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 7,
            }}
          >
            What would you like to understand about {selectedCountry.name}?
          </div>
          <div
            style={{
              color: '#6B6965',
              fontSize: 12,
              lineHeight: 1.65,
              marginBottom: 14,
            }}
          >
            Start with one lens. You can move between the market overview, external forces, startup support, and company setup whenever you need to.
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {LENSES.map((lens) => (
              <LensCard
                key={lens.id}
                lens={lens}
                country={selectedCountry}
                onOpen={openLens}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}