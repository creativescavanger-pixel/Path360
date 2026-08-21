import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  COVERAGE_LEVELS,
  getCountryBySlug,
  getCountryCoverageDescription,
  getCountryCoverageLabel,
  getCountryFlag,
} from '../lib/countryCatalogue.js'

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

const DEEP_DIVE_COPY = {
  kenya: {
    headline:
      'Build close to the market, then make the operating foundation credible.',
    summary:
      'Kenya is a major East African innovation market with strong digital-finance, commerce, logistics, climate, and enterprise-software activity. Founders benefit from a concentrated Nairobi ecosystem, but should build clear customer evidence, governance, and operating discipline before treating ecosystem visibility as traction.',
    priorities: [
      {
        title: 'Make the venture legally and operationally coherent',
        description:
          'Clarify entity structure, founder ownership, intellectual-property assignment, tax position, and contracts before major customer, hiring, or fundraising commitments.',
        action:
          'Open Company Setup to work through the operating questions that need verification.',
      },
      {
        title: 'Turn local market learning into hard evidence',
        description:
          'Use customer behaviour, repeat use, paid pilots, and commercial commitments—not encouragement alone—to prove demand.',
        action:
          'Use Academy missions to strengthen customer evidence and traction signals.',
      },
      {
        title: 'Prepare for a cross-border investor narrative',
        description:
          'If you are raising beyond the local market, investors will look for governance clarity, realistic market logic, capital efficiency, and credible expansion assumptions.',
        action:
          'Review Venture Intelligence, then create an investor-ready output in Studio.',
      },
    ],
    marketSignals: [
      'Digital payments and mobile-first behaviour can create strong distribution opportunities.',
      'Nairobi concentrates many hubs, investors, programmes, and enterprise decision-makers.',
      'Fintech, climate, agritech, commerce, logistics, health, and B2B software remain important founder categories.',
    ],
    nextAction:
      'Review the legal and operating structure that supports your next milestone.',
    officialLinks: [
      {
        label: 'Kenya Business Registration Service',
        description: 'Official starting point for company registration services.',
        url: 'https://brs.go.ke/',
      },
      {
        label: 'Kenya Revenue Authority',
        description: 'Official tax authority and taxpayer-service information.',
        url: 'https://www.kra.go.ke/',
      },
      {
        label: 'Kenya National Innovation Agency',
        description: 'Innovation ecosystem and national entrepreneurship initiatives.',
        url: 'https://www.innovationagency.go.ke/',
      },
    ],
  },

  'united-states': {
    headline:
      'Choose a clear market wedge and make the company investor-ready before scaling the story.',
    summary:
      'The United States combines deep venture capital, advanced startup infrastructure, and large customer markets with intense competition and high expectations for focus, traction, and execution. Founders should be precise about their target customer, incorporation and governance decisions, and the evidence behind their growth narrative.',
    priorities: [
      {
        title: 'Define the narrow market you can win first',
        description:
          'The US market is large, but broad positioning is rarely persuasive. Establish a clear beachhead customer, urgent problem, and repeatable path to reach them.',
        action:
          'Use Venture Intelligence and Academy to sharpen your market and distribution logic.',
      },
      {
        title: 'Keep governance, IP, and ownership clean',
        description:
          'A credible company structure, founder agreements, cap table, intellectual-property ownership, and basic legal hygiene matter early when customers, employees, and investors become involved.',
        action:
          'Open Company Setup to work through the operating questions that need verification.',
      },
      {
        title: 'Show evidence before using investor language',
        description:
          'Investors respond to retained usage, revenue quality, efficient acquisition, customer learning, and execution velocity—not only a large market or polished deck.',
        action:
          'Use Academy evidence missions, then update your investor materials in Studio.',
      },
    ],
    marketSignals: [
      'The market rewards clear customer focus and strong proof of repeatable demand.',
      'Venture capital is accessible across many hubs, but investor selectivity is high.',
      'Founder communities, accelerators, cloud programmes, and specialist networks can be valuable when matched to venture stage.',
    ],
    nextAction:
      'Clarify the one operating and evidence gap most likely to weaken your next investor or customer conversation.',
    officialLinks: [
      {
        label: 'U.S. Small Business Administration',
        description:
          'Government guidance for starting, managing, and growing a business.',
        url: 'https://www.sba.gov/',
      },
      {
        label: 'Internal Revenue Service',
        description: 'Official federal tax information for businesses.',
        url: 'https://www.irs.gov/businesses',
      },
      {
        label: 'U.S. Patent and Trademark Office',
        description:
          'Official intellectual-property and trademark resources.',
        url: 'https://www.uspto.gov/',
      },
    ],
  },
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
        padding: '4px 8px',
        fontSize: 9.5,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontWeight: 800,
      }}
    >
      {getCountryCoverageLabel(coverage)}
    </span>
  )
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          color: '#7158DC',
          fontSize: 10.5,
          fontWeight: 800,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 5,
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          color: '#1C1C1A',
          fontSize: 17,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          marginBottom: description ? 6 : 0,
        }}
      >
        {title}
      </div>

      {description ? (
        <div
          style={{
            color: '#6B6965',
            fontSize: 12,
            lineHeight: 1.65,
          }}
        >
          {description}
        </div>
      ) : null}
    </div>
  )
}

function CompanySetupHandoff({ country, navigate }) {
  return (
    <section
      style={{
        background: '#FCF8EE',
        border: '1px solid #EEE4C9',
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
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
        Company setup
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
        Set up responsibly in {country.name}
      </div>

      <div
        style={{
          color: '#6B6965',
          fontSize: 12,
          lineHeight: 1.7,
          maxWidth: 720,
          marginBottom: 13,
        }}
      >
        Work through company, tax, people, data, licensing, and cross-border
        questions at your own pace. Your saved operating checklist is separate
        for every country you explore.
      </div>

      <button
        type="button"
        onClick={() => navigate(`/app/environment/laws/${country.slug}`)}
        style={{
          border: '1px solid #765A1E',
          background: '#765A1E',
          color: '#FFFFFF',
          borderRadius: 10,
          padding: '9px 12px',
          fontSize: 11.5,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        Open Company Setup →
      </button>
    </section>
  )
}

function NotFoundCountry() {
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
          Market overview
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
          This country or jurisdiction is not currently available in the
          catalogue. Return to the Country Directory to search by name, region,
          ISO code, or a common alias.
        </p>

        <button
          type="button"
          onClick={() => navigate('/app/environment/countries')}
          style={{
            border: '1px solid #1D6B4F',
            background: '#1D6B4F',
            color: '#FFFFFF',
            borderRadius: 10,
            padding: '10px 13px',
            fontSize: 12,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Browse countries →
        </button>
      </section>
    </div>
  )
}

export default function CountryBrief() {
  const navigate = useNavigate()
  const { countrySlug } = useParams()

  const country = useMemo(() => getCountryBySlug(countrySlug), [countrySlug])

  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const assessmentResults = useDiagnosticStore(
    (state) => state.assessmentResults,
  )
  const diagnosedStage = useDiagnosticStore((state) => state.diagnosedStage)
  const corridor = useDiagnosticStore((state) => state.corridor)

  if (!country) return <NotFoundCountry />

  const intelligence = DEEP_DIVE_COPY[country.slug] || null

  const ventureName =
    founderProfile?.venturename ||
    founderProfile?.venture_name ||
    'Your venture'

  const founderStage =
    diagnosedStage ||
    assessmentResults?.diagnosedStage ||
    assessmentResults?.venturestage ||
    founderProfile?.venturestage ||
    founderProfile?.venture_stage ||
    null

  const isDeepDive = country.coverage === COVERAGE_LEVELS.DEEP_DIVE
  const isCurrentCountry =
    String(
      founderProfile?.country_code || founderProfile?.countrycode || '',
    ).toUpperCase() === country.code

  function handlePrimaryAction() {
    if (isCurrentCountry) {
      navigate('/app/venture-intelligence')
      return
    }

    navigate('/app/studio')
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
              Market overview
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
                {country.name}
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
              Understand the market context, key questions, and trusted
              starting points for building or expanding in {country.name}.
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
              Available detail
            </div>

            <CoverageBadge coverage={country.coverage} />

            <div
              style={{
                color: '#6B6965',
                fontSize: 11,
                lineHeight: 1.55,
                marginTop: 8,
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
          onClick={() => navigate('/app/environment')}
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
          ← Explore markets
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
            fontSize: 11.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          External forces
        </button>

        <button
          type="button"
          onClick={() =>
            navigate(`/app/environment/ecosystem/${country.slug}`)
          }
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
          Startup support
        </button>

        <button
          type="button"
          onClick={() => navigate(`/app/environment/laws/${country.slug}`)}
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
          Company setup
        </button>
      </div>

      {isDeepDive && intelligence ? (
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
              <SectionHeading
                eyebrow="What this means for you"
                title={intelligence.headline}
              />

              <div
                style={{
                  color: '#5F5B56',
                  fontSize: 12.5,
                  lineHeight: 1.75,
                }}
              >
                {intelligence.summary}
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
                What matters for {ventureName}
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
                {founderStage
                  ? `${founderStage} founder context`
                  : 'Founder context'}
              </div>

              <div
                style={{
                  color: '#4D6357',
                  fontSize: 12,
                  lineHeight: 1.65,
                  marginBottom: 13,
                }}
              >
                {corridor?.label
                  ? `Your ${corridor.label} corridor and current venture signals help Path360 prioritise the market questions that matter most.`
                  : 'Path360 will progressively connect this market overview to your stage, venture model, and operating priorities.'}
              </div>

              <button
                type="button"
                onClick={handlePrimaryAction}
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
                {isCurrentCountry
                  ? 'Review Venture Intelligence →'
                  : 'Create a market-entry output →'}
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
            <SectionHeading
              eyebrow="Where to focus"
              title={`Three priorities to consider in ${country.name}`}
              description="Use these practical lenses to decide what you need to investigate, validate, or document next."
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
              }}
            >
              {intelligence.priorities.map((priority, index) => (
                <div
                  key={priority.title}
                  style={{
                    background: '#F8F6F1',
                    border: '1px solid #ECE6DB',
                    borderRadius: 14,
                    padding: 15,
                  }}
                >
                  <div
                    style={{
                      width: 25,
                      height: 25,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 9,
                      background: '#EAF1EB',
                      color: '#1D6B4F',
                      fontSize: 11,
                      fontWeight: 900,
                      marginBottom: 10,
                    }}
                  >
                    {index + 1}
                  </div>

                  <div
                    style={{
                      color: '#1C1C1A',
                      fontSize: 13,
                      fontWeight: 800,
                      lineHeight: 1.35,
                      marginBottom: 7,
                    }}
                  >
                    {priority.title}
                  </div>

                  <div
                    style={{
                      color: '#6B6965',
                      fontSize: 11.5,
                      lineHeight: 1.65,
                      marginBottom: 9,
                    }}
                  >
                    {priority.description}
                  </div>

                  <div
                    style={{
                      color: '#2A6A51',
                      fontSize: 10.5,
                      fontWeight: 700,
                      lineHeight: 1.5,
                    }}
                  >
                    {priority.action}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <CompanySetupHandoff country={country} navigate={navigate} />
                    <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(290px, 0.9fr)',
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
              <SectionHeading
                eyebrow="Market signals"
                title={`Signals to investigate in ${country.name}`}
              />

              <div style={{ display: 'grid', gap: 9 }}>
                {intelligence.marketSignals.map((signal) => (
                  <div
                    key={signal}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 9,
                      color: '#5F5B56',
                      fontSize: 12,
                      lineHeight: 1.65,
                    }}
                  >
                    <span
                      style={{
                        color: '#7158DC',
                        fontWeight: 900,
                        lineHeight: 1.5,
                      }}
                    >
                      •
                    </span>
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
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
                Your next move
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
                {intelligence.nextAction}
              </div>

              <div
                style={{
                  color: '#51486A',
                  fontSize: 11.5,
                  lineHeight: 1.65,
                  marginBottom: 13,
                }}
              >
                Use Company Setup for operating questions, Startup Support to
                find pathways that may help, and Academy when you need to
                build capability for the next milestone.
              </div>

              <button
                type="button"
                onClick={() => navigate(`/app/environment/laws/${country.slug}`)}
                style={{
                  border: '1px solid #7158DC',
                  background: '#7158DC',
                  color: '#FFFFFF',
                  borderRadius: 10,
                  padding: '9px 12px',
                  fontSize: 11.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Open Company Setup →
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
            <SectionHeading
              eyebrow="Trusted starting points"
              title={`Official resources for ${country.name}`}
              description="Use official information to verify important company, tax, intellectual-property, employment, and regulatory decisions."
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 11,
              }}
            >
              {intelligence.officialLinks.map((resource) => (
                <a
                  key={resource.label}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    background: '#F8F6F1',
                    border: '1px solid #ECE6DB',
                    borderRadius: 13,
                    padding: 14,
                    color: '#1C1C1A',
                  }}
                >
                  <div
                    style={{
                      color: '#1C1C1A',
                      fontSize: 12.5,
                      fontWeight: 800,
                      lineHeight: 1.35,
                      marginBottom: 6,
                    }}
                  >
                    {resource.label} ↗
                  </div>

                  <div
                    style={{
                      color: '#6B6965',
                      fontSize: 11,
                      lineHeight: 1.6,
                    }}
                  >
                    {resource.description}
                  </div>
                </a>
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
              <SectionHeading
                eyebrow="Market starting point"
                title={`Explore ${country.name} with the right questions first`}
              />

              <div
                style={{
                  color: '#5F5B56',
                  fontSize: 12.5,
                  lineHeight: 1.75,
                }}
              >
                {getCountryCoverageDescription(country.coverage)} Path360
                builds country guidance in layers so founders can access useful
                context without being given unverified legal or tax claims.
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
                Available detail
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
                {getCountryCoverageLabel(country.coverage)}
              </div>

              <div
                style={{
                  color: '#6B6965',
                  fontSize: 11.5,
                  lineHeight: 1.65,
                }}
              >
                Deeper external-forces, startup-support, company-setup, and
                official-resource guidance is prioritised by founder demand and
                source verification.
              </div>
            </div>
          </section>

          <CompanySetupHandoff country={country} navigate={navigate} />

          <section
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2DED6',
              borderRadius: 16,
              padding: 18,
              marginBottom: 16,
            }}
          >
            <SectionHeading
              eyebrow="Research prompts"
              title={`Five questions to answer before building in ${country.name}`}
              description="Use these prompts to turn a country search into practical market and operating research."
            />

            <div style={{ display: 'grid', gap: 10 }}>
              {[
                'Which customer segment in this market has an urgent, observable problem that your venture can solve?',
                'What local behaviour, affordability, trust, distribution, or infrastructure assumption must be tested before you commit resources?',
                'Which company, tax, employment, data, licensing, or intellectual-property requirements could materially affect the venture?',
                'Which local founder communities, accelerators, investors, strategic partners, or customers can help you learn faster?',
                'What evidence would make this market credible in an investor, partner, or board conversation?',
              ].map((question, index) => (
                <div
                  key={question}
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
                      width: 23,
                      height: 23,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: 8,
                      background: '#EAF1EB',
                      color: '#1D6B4F',
                      fontSize: 10.5,
                      fontWeight: 900,
                    }}
                  >
                    {index + 1}
                  </span>

                  <div
                    style={{
                      color: '#5F5B56',
                      fontSize: 12,
                      lineHeight: 1.65,
                    }}
                  >
                    {question}
                  </div>
                </div>
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
            Next step
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
            Turn market learning into venture progress
          </div>

          <div
            style={{
              color: '#51486A',
              fontSize: 12,
              lineHeight: 1.7,
              marginBottom: 13,
            }}
          >
            Record material operating context in Venture Intelligence, build
            the capability it reveals in Academy, and use Creation Studio to
            turn evidence into a credible market-entry or investor-facing
            story.
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
            Path360 provides educational market guidance and trusted starting
            points. It does not replace qualified local legal, tax,
            immigration, employment, or investment advice.
          </div>
        </div>
      </section>
    </div>
  )
}