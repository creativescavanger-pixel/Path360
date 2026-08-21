import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  COVERAGE_LEVELS,
  getCountryBySlug,
  getCountryCoverageDescription,
  getCountryCoverageLabel,
  getCountryFlag,
} from '../lib/countryCatalogue.js'

const PESTEL_ORDER = [
  'political',
  'economic',
  'social',
  'technological',
  'environmental',
  'legal',
]

const PESTEL_META = {
  political: {
    letter: 'P',
    label: 'Political',
    color: '#7158DC',
    background: '#F5F0FF',
    border: '#DDD1FF',
  },
  economic: {
    letter: 'E',
    label: 'Economic',
    color: '#1D6B4F',
    background: '#EEF4EF',
    border: '#D6E4D7',
  },
  social: {
    letter: 'S',
    label: 'Social',
    color: '#35708E',
    background: '#EEF5FA',
    border: '#D5E4EF',
  },
  technological: {
    letter: 'T',
    label: 'Technological',
    color: '#8A6E2A',
    background: '#FCF8EE',
    border: '#EEE4C9',
  },
  environmental: {
    letter: 'E',
    label: 'Environmental',
    color: '#417760',
    background: '#EDF5F0',
    border: '#D2E5D9',
  },
  legal: {
    letter: 'L',
    label: 'Legal',
    color: '#9A5252',
    background: '#FBEEEE',
    border: '#EACFCF',
  },
}

const PESTEL_DEEP_DIVES = {
  kenya: {
    summary:
      'Kenya offers a concentrated East African innovation environment with strong digital adoption and a practical founder ecosystem. The most useful PESTEL work is to connect market opportunity with operating discipline: clear customer evidence, realistic unit economics, governance, and verified local requirements.',
    factors: {
      political: {
        status: 'watch',
        what: 'Public policy, digital-government services, and startup ecosystem support continue to evolve. Registration and regulatory processes can become more accessible through digital channels, but founders should monitor changes that affect their sector.',
        founderLens: 'Treat policy and regulatory change as an operating assumption to monitor—not as a substitute for direct customer and market evidence.',
        nextAction: 'Identify the government or regulator most relevant to your sector, then record any licence, registration, or policy dependency in Venture Intelligence.',
      },
      economic: {
        status: 'priority_now',
        what: 'Funding, customer affordability, currency exposure, and the cost of scaling all shape venture decisions. Businesses raising or selling across borders should understand how local-currency exposure affects runway and pricing.',
        founderLens: 'Build your financial story around evidence of willingness to pay, gross-margin logic, and the currency in which revenue, costs, and capital actually move.',
        nextAction: 'Add a simple currency and unit-economics review to your next Academy or Venture Intelligence update.',
      },
      social: {
        status: 'opportunity',
        what: 'Mobile-first behaviour, strong entrepreneurial networks, and urban market concentration can make direct customer learning fast. Trust, affordability, informal alternatives, and local buying habits remain central to adoption.',
        founderLens: 'Observe behaviour in context. A customer saying they like a solution is not the same as changing a current workaround or paying for it.',
        nextAction: 'Run or review customer interviews and record recurring behaviour, switching triggers, and willingness-to-pay evidence.',
      },
      technological: {
        status: 'opportunity',
        what: 'Digital payments, mobile usage, growing cloud adoption, innovation hubs, and technical talent create opportunities for software-enabled services and locally relevant distribution models.',
        founderLens: 'Use existing local rails and channels where possible before creating expensive custom infrastructure.',
        nextAction: 'Map the technology, payment, distribution, or integration dependencies that your product cannot succeed without.',
      },
      environmental: {
        status: 'watch',
        what: 'Climate exposure, energy reliability, logistics, agriculture, and resource conditions can create both operating risks and high-value problem spaces.',
        founderLens: 'Environmental conditions may be core market drivers in climate, logistics, food, mobility, energy, insurance, and supply-chain ventures.',
        nextAction: 'Decide whether climate, energy, infrastructure, or logistics conditions affect your customer problem, cost base, or continuity plan.',
      },
      legal: {
        status: 'priority_now',
        what: 'Company formation, tax registration, contracts, founder ownership, intellectual-property assignment, employment, data, and sector rules become increasingly important as a venture takes on customers, staff, grants, or investment.',
        founderLens: 'Legal hygiene is not an investor document exercise. It protects the venture’s ownership, customer relationships, and ability to raise capital later.',
        nextAction: 'Create a short checklist for entity structure, founder agreements, IP assignment, customer contracts, tax, and any sector-specific regulatory need.',
      },
    },
  },
  'united-states': {
    summary:
      'The United States offers deep capital markets, major customer segments, and extensive startup infrastructure, but also strong competition and high expectations for focus and execution. A useful PESTEL view helps founders avoid treating market size as a strategy.',
    factors: {
      political: {
        status: 'watch',
        what: 'Federal, state, and local rules can affect company formation, employment, procurement, trade, privacy, and sector-specific operations. Requirements can vary substantially across jurisdictions.',
        founderLens: 'Define the state or states that actually matter to your incorporation, team, and customers before making broad assumptions about “the US market.”',
        nextAction: 'Document the jurisdictions where you will incorporate, hire, sell, store data, or seek regulated customers.',
      },
      economic: {
        status: 'priority_now',
        what: 'Large customer markets and capital availability coexist with high acquisition costs, demanding investor expectations, and competitive pressure. Capital efficiency and retained customer value matter.',
        founderLens: 'A large addressable market does not compensate for unclear distribution, weak retention, or unproven unit economics.',
        nextAction: 'Review the one metric that best demonstrates sustained customer value—retention, repeat use, revenue quality, or payback—and make it visible in your venture record.',
      },
      social: {
        status: 'opportunity',
        what: 'Customer segments can be large but fragmented. Buying behaviour, trust, procurement, cultural expectations, and willingness to switch vary significantly by sector and customer type.',
        founderLens: 'Win a narrow customer segment first. A specific buyer with a clear urgent problem is stronger than a broad, generic market claim.',
        nextAction: 'Define your beachhead customer and write down their triggering event, current workaround, buying process, and proof threshold.',
      },
      technological: {
        status: 'opportunity',
        what: 'The US has extensive cloud, software, AI, payments, research, talent, and startup infrastructure. This creates speed, but also raises user expectations and competitive intensity.',
        founderLens: 'Technology availability is rarely the durable advantage; customer access, domain insight, workflow fit, data, and execution often matter more.',
        nextAction: 'State which part of your advantage would still matter if a well-funded competitor used the same technology tomorrow.',
      },
      environmental: {
        status: 'watch',
        what: 'Climate exposure, state-level environmental rules, energy costs, resilience, and sustainability expectations differ materially across sectors and locations.',
        founderLens: 'For physical, climate, mobility, food, energy, logistics, or real-estate ventures, environmental variation can affect both economics and product relevance.',
        nextAction: 'Identify whether climate, energy, environmental compliance, or resilience affects your core customer problem or cost base.',
      },
      legal: {
        status: 'priority_now',
        what: 'Entity structure, equity, intellectual property, employment classification, privacy, consumer protection, taxation, contracts, and sector-specific licensing all require careful jurisdiction-aware attention.',
        founderLens: 'Keep ownership, IP, founder arrangements, customer terms, and compliance fundamentals clean before investor due diligence makes them urgent.',
        nextAction: 'Review your incorporation, cap table, IP ownership, privacy/data practices, contracts, and sector-specific regulatory dependencies with qualified advice where material.',
      },
    },
  },
}

const STATUS_META = {
  priority_now: {
    label: 'Priority now',
    background: '#FDEAEA',
    border: '#E8CACA',
    color: '#8A2F2F',
  },
  opportunity: {
    label: 'Opportunity',
    background: '#EAF1EB',
    border: '#CFE0D0',
    color: '#1D6B4F',
  },
  watch: {
    label: 'Watch',
    background: '#FCF8EE',
    border: '#EEE4C9',
    color: '#8A6E2A',
  },
}

function StatusBadge({ status }) {
  const style = STATUS_META[status] || STATUS_META.watch

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
      }}
    >
      {style.label}
    </span>
  )
}

function FactorCard({ factorKey, content, open, onToggle }) {
  const meta = PESTEL_META[factorKey]

  return (
    <div
      style={{
        background: meta.background,
        border: `1px solid ${meta.border}`,
        borderRadius: 15,
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          width: '100%',
          border: 'none',
          background: 'transparent',
          padding: 15,
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              width: 29,
              height: 29,
              display: 'grid',
              placeItems: 'center',
              borderRadius: 9,
              background: '#FFFFFF',
              color: meta.color,
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {meta.letter}
          </span>

          <span>
            <span
              style={{
                display: 'block',
                color: '#1C1C1A',
                fontSize: 14,
                fontWeight: 800,
                marginBottom: 3,
              }}
            >
              {meta.label}
            </span>
            <span style={{ display: 'block' }}>
              <StatusBadge status={content.status} />
            </span>
          </span>
        </span>

        <span
          style={{
            color: meta.color,
            fontSize: 16,
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {open ? '−' : '+'}
        </span>
      </button>

      {open ? (
        <div style={{ padding: '0 15px 15px' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid rgba(255,255,255,0.9)',
              borderRadius: 11,
              padding: 13,
            }}
          >
            <div
              style={{
                color: meta.color,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              What is important now
            </div>
            <div
              style={{
                color: '#5F5B56',
                fontSize: 11.8,
                lineHeight: 1.65,
                marginBottom: 12,
              }}
            >
              {content.what}
            </div>

            <div
              style={{
                color: meta.color,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Founder lens
            </div>
            <div
              style={{
                color: '#5F5B56',
                fontSize: 11.8,
                lineHeight: 1.65,
                marginBottom: 12,
              }}
            >
              {content.founderLens}
            </div>

            <div
              style={{
                color: meta.color,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              What to do next
            </div>
            <div
              style={{
                color: '#1C1C1A',
                fontSize: 11.8,
                lineHeight: 1.65,
                fontWeight: 700,
              }}
            >
              {content.nextAction}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function FoundationalFactor({ factorKey }) {
  const meta = PESTEL_META[factorKey]
  const prompts = {
    political:
      'Which government policies, stability factors, trade rules, public procurement pathways, or sector regulators could change your ability to operate?',
    economic:
      'How do currency, pricing, affordability, cost of capital, labour cost, inflation, and customer purchasing power affect your financial model?',
    social:
      'What customer behaviour, trust, culture, talent, adoption pattern, or informal alternative must you understand before committing?',
    technological:
      'Which connectivity, payment, cloud, data, distribution, or infrastructure dependencies are critical to your product and customer journey?',
    environmental:
      'Could climate, energy, logistics, resource constraints, resilience, or sustainability expectations affect the opportunity or operating model?',
    legal:
      'Which company, tax, employment, IP, contract, data, consumer, or sector-specific rules require official verification before you act?',
  }

  return (
    <div
      style={{
        background: meta.background,
        border: `1px solid ${meta.border}`,
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <span
          style={{
            width: 27,
            height: 27,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 9,
            background: '#FFFFFF',
            color: meta.color,
            fontSize: 11,
            fontWeight: 900,
          }}
        >
          {meta.letter}
        </span>
        <span style={{ color: '#1C1C1A', fontSize: 13, fontWeight: 800 }}>
          {meta.label}
        </span>
      </div>

      <div
        style={{
          color: '#5F5B56',
          fontSize: 11.5,
          lineHeight: 1.65,
        }}
      >
        {prompts[factorKey]}
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
            color: '#7158DC',
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Global PESTEL Library
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
          Return to the PESTEL Library to search a country, jurisdiction, ISO
          code, or common alias.
        </p>

        <button
          type="button"
          onClick={() => navigate('/app/environment/pestel')}
          style={{
            border: '1px solid #7158DC',
            background: '#7158DC',
            color: '#FFFFFF',
            borderRadius: 10,
            padding: '10px 13px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Open PESTEL Library →
        </button>
      </section>
    </div>
  )
}

export default function CountryPestel() {
  const navigate = useNavigate()
  const { countrySlug } = useParams()
  const [openFactor, setOpenFactor] = useState('economic')

  const country = useMemo(
    () => getCountryBySlug(countrySlug),
    [countrySlug],
  )

  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const diagnosedStage = useDiagnosticStore((state) => state.diagnosedStage)
  const corridor = useDiagnosticStore((state) => state.corridor)

  if (!country) return <CountryNotFound />

  const deepDive = PESTEL_DEEP_DIVES[country.slug] || null
  const isDetailed = Boolean(deepDive)

  const ventureName =
    founderProfile?.venturename ||
    founderProfile?.venture_name ||
    'Your venture'

  const founderStage =
    diagnosedStage ||
    founderProfile?.venturestage ||
    founderProfile?.venture_stage ||
    'current'

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
          <div style={{ maxWidth: 720 }}>
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
              Global PESTEL Library
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 28, lineHeight: 1 }}>
                {getCountryFlag(country.code)}
              </span>
              <h1
                style={{
                  color: '#1C1C1A',
                  fontSize: 28,
                  lineHeight: 1.12,
                  letterSpacing: '-0.03em',
                  margin: 0,
                }}
              >
                {country.name} PESTEL snapshot
              </h1>
            </div>

            <p
              style={{
                color: '#6B6965',
                fontSize: 13,
                lineHeight: 1.75,
                margin: 0,
              }}
            >
              External forces that can shape how you build, sell, hire,
              fundraise, and expand in {country.name}.
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
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 7,
              }}
            >
              Country coverage
            </div>

            <div
              style={{
                color: '#1C1C1A',
                fontSize: 13,
                fontWeight: 800,
                marginBottom: 5,
              }}
            >
              {getCountryCoverageLabel(country.coverage)}
            </div>

            <div
              style={{
                color: '#6B6965',
                fontSize: 11,
                lineHeight: 1.55,
              }}
            >
              {country.subregion} · {country.region}
            </div>
          </div>
        </div>
      </section>

      <div
        style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/app/environment/pestel')}
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
          ← PESTEL Library
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
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {country.name} country brief
        </button>
      </div>

      {isDetailed ? (
        <>
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.35fr) minmax(260px, 0.82fr)',
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
                  color: '#7158DC',
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Founder interpretation
              </div>

              <div
                style={{
                  color: '#1C1C1A',
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}
              >
                Do not collect country facts. Use them to choose the next responsible move.
              </div>

              <div
                style={{
                  color: '#5F5B56',
                  fontSize: 12.5,
                  lineHeight: 1.75,
                }}
              >
                {deepDive.summary}
              </div>
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
                Your PESTEL lens
              </div>

              <div
                style={{
                  color: '#1C1C1A',
                  fontSize: 15,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}
              >
                {founderStage} stage · {ventureName}
              </div>

              <div
                style={{
                  color: '#4D6357',
                  fontSize: 11.5,
                  lineHeight: 1.65,
                }}
              >
                {corridor?.label
                  ? `Your ${corridor.label} corridor should influence which macro factors you track first.`
                  : 'Your country, business model, and stage should determine which external factors are a priority now.'}
              </div>
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
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Country factors
            </div>

            <div
              style={{
                color: '#1C1C1A',
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: 8,
              }}
            >
              Six external forces, translated for founder decisions
            </div>

            <div
              style={{
                color: '#6B6965',
                fontSize: 12,
                lineHeight: 1.65,
                marginBottom: 14,
              }}
            >
              Expand a factor to see what is important now, why it matters for
              a founder, and one practical next action.
            </div>

            <div style={{ display: 'grid', gap: 10 }}>
              {PESTEL_ORDER.map((factorKey) => (
                <FactorCard
                  key={factorKey}
                  factorKey={factorKey}
                  content={deepDive.factors[factorKey]}
                  open={openFactor === factorKey}
                  onToggle={() =>
                    setOpenFactor((current) =>
                      current === factorKey ? '' : factorKey,
                    )
                  }
                />
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
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
                  color: '#7158DC',
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Foundational PESTEL canvas
              </div>

              <div
                style={{
                  color: '#1C1C1A',
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}
              >
                Ask the questions that make {country.name} decision-ready
              </div>

              <div
                style={{
                  color: '#5F5B56',
                  fontSize: 12.5,
                  lineHeight: 1.75,
                }}
              >
                {getCountryCoverageDescription(country.coverage)} Use this
                structured canvas to determine what you need to research and
                verify through official country sources and qualified local
                professionals before committing capital or making material
                operating decisions.
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
                  fontSize: 10.5,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Coverage grows responsibly
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
                {getCountryCoverageLabel(country.coverage)}
              </div>

              <div
                style={{
                  color: '#6B6965',
                  fontSize: 11.5,
                  lineHeight: 1.65,
                }}
              >
                Detailed country analysis is added through trusted sources and
                founder-relevant validation rather than unverified generic content.
              </div>
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
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Research canvas
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
              Six questions to structure your {country.name} research
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 11,
              }}
            >
              {PESTEL_ORDER.map((factorKey) => (
                <FoundationalFactor key={factorKey} factorKey={factorKey} />
              ))}
            </div>
          </section>
        </>
      )}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(250px, 0.85fr)',
          gap: 16,
        }}
      >
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
            Convert external signals into a venture decision
          </div>

          <div
            style={{
              color: '#51486A',
              fontSize: 12,
              lineHeight: 1.7,
              marginBottom: 13,
            }}
          >
            Update Venture Intelligence with material operating context, use
            Academy to strengthen the capability it reveals, and turn the work
            into a market-entry or investor-ready narrative in Studio.
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => navigate('/app/venture-intelligence')}
              style={{
                border: '1px solid #7158DC',
                background: '#7158DC',
                color: '#FFFFFF',
                borderRadius: 9,
                padding: '8px 11px',
                fontSize: 11,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Venture Intelligence →
            </button>

            <button
              type="button"
              onClick={() => navigate('/app/studio')}
              style={{
                border: '1px solid #C9BDF4',
                background: '#FFFFFF',
                color: '#7158DC',
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
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Important note
          </div>

          <div
            style={{
              color: '#6B6965',
              fontSize: 11.5,
              lineHeight: 1.7,
            }}
          >
            PESTEL is an external-environment framework, not legal, tax,
            investment, immigration, or regulatory advice. Verify material
            decisions through official sources and qualified professionals.
          </div>
        </div>
      </section>
    </div>
  )
}