import { useNavigate } from 'react-router-dom'
import { track, EVENTS } from '../lib/posthogClient.js'

export default function Landing() {
  const navigate = useNavigate()

  function handleStart() {
    track(EVENTS.ASSESSMENT_STARTED, { source: 'landing' })
    navigate('/auth?mode=signup')
  }

  function handleLogin() {
    navigate('/auth?mode=login')
  }

  const featureCards = [
    {
      icon: '◐',
      title: 'Adaptive Assessment',
      desc: 'A live AI interview that adapts to your answers and probes where investors would push harder.',
    },
    {
      icon: '◎',
      title: 'Investor Readiness Score',
      desc: 'Know your exact score across strategy, execution, finance, market clarity, product, team, and growth.',
    },
    {
      icon: '✦',
      title: 'Institutional Documents',
      desc: 'Generate business plans, pitch decks, investor memos, and strategic outputs grounded in your actual venture context.',
    },
  ]

  const proofStats = [
    { value: '500+', label: 'Founders assessed' },
    { value: '73%', label: 'Avg. score improvement' },
    { value: '$12M+', label: 'Capital influenced' },
  ]

  const pricing = [
    {
      tier: 'Starter',
      price: '49',
      period: '/mo',
      features: [
        'Adaptive assessment',
        'Founder score + radar',
        'Basic document generation',
        'AI strategist access',
      ],
      highlight: false,
    },
    {
      tier: 'Growth',
      price: '99',
      period: '/mo',
      features: [
        'Everything in Starter',
        'Institutional document suite',
        'Founder memory persistence',
        'Priority AI generation',
      ],
      highlight: true,
      badge: 'Most popular',
    },
    {
      tier: 'Scale',
      price: '249',
      period: '/mo',
      features: [
        'Everything in Growth',
        'Advanced strategic outputs',
        'Board/investor memo workflows',
        'Scale-ready intelligence layer',
      ],
      highlight: false,
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0A0F1E',
        color: '#FFFFFF',
        fontFamily: '"DM Sans", sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: #0A0F1E;
        }

        button {
          font-family: inherit;
        }
      `}</style>

      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '20px 60px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background: 'rgba(10,15,30,0.82)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 7,
              background: 'linear-gradient(135deg, #C9A84C, #8A6E2A)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A0F1E',
              fontWeight: 800,
              fontSize: 13,
              boxShadow: '0 8px 20px rgba(201,168,76,0.25)',
            }}
          >
            P
          </div>
          <span
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.06em',
            }}
          >
            PATH360
          </span>
        </div>

        <button
          onClick={handleLogin}
          style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.14)',
            color: 'rgba(255,255,255,0.86)',
            borderRadius: 999,
            padding: '10px 18px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Log in
        </button>

        <button
          onClick={handleStart}
          style={{
            background: '#C9A84C',
            border: 'none',
            color: '#0A0F1E',
            borderRadius: 999,
            padding: '11px 18px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 12px 24px rgba(201,168,76,0.18)',
          }}
        >
          Start free assessment
        </button>
      </nav>

      <section
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '100px 40px 72px',
        }}
      >
        <div
          style={{
            maxWidth: 780,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(201,168,76,0.10)',
              border: '1px solid rgba(201,168,76,0.24)',
              borderRadius: 999,
              padding: '10px 18px',
              fontSize: 12,
              fontWeight: 600,
              color: '#E8C96A',
              marginBottom: 24,
              letterSpacing: '0.01em',
            }}
          >
            AI-Powered Founder Intelligence
          </div>

          <h1
            style={{
              fontSize: 'clamp(42px, 7vw, 72px)',
              lineHeight: 1.03,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              margin: '0 0 20px',
              color: '#FFFFFF',
            }}
          >
            Know exactly how{' '}
            <span style={{ color: '#C9A84C' }}>investor-ready</span>{' '}
            you are
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.64)',
              margin: '0 auto 30px',
              maxWidth: 760,
            }}
          >
            PATH360 combines adaptive AI intelligence, institutional-grade analysis,
            and founder memory to help you understand your venture&apos;s fundraising
            and execution readiness.
          </p>

          <div
            style={{
              display: 'flex',
              gap: 14,
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: 18,
            }}
          >
            <button
              onClick={handleStart}
              style={{
                background: '#C9A84C',
                border: 'none',
                color: '#0A0F1E',
                borderRadius: 12,
                padding: '14px 26px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                minWidth: 220,
                boxShadow: '0 16px 34px rgba(201,168,76,0.18)',
              }}
            >
              Get Your Founder Score Free
            </button>

            <button
              onClick={handleLogin}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                borderRadius: 12,
                padding: '14px 22px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: 160,
              }}
            >
              View Platform
            </button>
          </div>

          <p
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.34)',
              margin: 0,
            }}
          >
            No credit card required · 8 minutes to complete
          </p>
        </div>
      </section>

      <section
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: '0 auto',
            padding: '28px 40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 16,
          }}
        >
          {proofStats.map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: '#C9A84C',
                  letterSpacing: '-0.03em',
                }}
              >
                {item.value}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: 'rgba(255,255,255,0.48)',
                  marginTop: 6,
                }}
              >
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '86px 40px 34px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 38 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#8A6E2A',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 10,
            }}
          >
            What PATH360 does
          </div>
          <h2
            style={{
              fontSize: 34,
              lineHeight: 1.15,
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 12px',
            }}
          >
            Institutional intelligence for founders
          </h2>
          <p
            style={{
              maxWidth: 720,
              margin: '0 auto',
              fontSize: 15,
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            PATH360 is designed to think more like a top-tier investor and strategic
            advisor than a generic startup tool.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 18,
          }}
        >
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18,
                padding: 24,
                boxShadow: '0 18px 40px rgba(0,0,0,0.18)',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(201,168,76,0.12)',
                  border: '1px solid rgba(201,168,76,0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 20,
                  color: '#C9A84C',
                  marginBottom: 18,
                }}
              >
                {feature.icon}
              </div>

              <div
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  marginBottom: 10,
                }}
              >
                {feature.title}
              </div>

              <div
                style={{
                  fontSize: 13.5,
                  color: 'rgba(255,255,255,0.52)',
                  lineHeight: 1.7,
                }}
              >
                {feature.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: '74px 40px 90px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 34 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#8A6E2A',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: 10,
            }}
          >
            Pricing
          </div>
          <h2
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 12px',
            }}
          >
            Start with your assessment. Scale with your venture.
          </h2>
          <p
            style={{
              maxWidth: 680,
              margin: '0 auto',
              fontSize: 15,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.55)',
            }}
          >
            Built for founders who want sharper investor insight, stronger strategy,
            and venture documents that feel institutional rather than generic.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 18,
            alignItems: 'stretch',
          }}
        >
          {pricing.map((plan) => (
            <div
              key={plan.tier}
              style={{
                background: plan.highlight
                  ? 'linear-gradient(180deg, rgba(201,168,76,0.10), rgba(255,255,255,0.05))'
                  : 'rgba(255,255,255,0.04)',
                border: plan.highlight
                  ? '1px solid rgba(201,168,76,0.32)'
                  : '1px solid rgba(255,255,255,0.08)',
                borderRadius: 20,
                padding: 24,
                boxShadow: plan.highlight
                  ? '0 24px 50px rgba(0,0,0,0.24)'
                  : '0 18px 40px rgba(0,0,0,0.16)',
                position: 'relative',
              }}
            >
              {plan.badge && (
                <div
                  style={{
                    display: 'inline-block',
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#C9A84C',
                    marginBottom: 14,
                  }}
                >
                  {plan.badge}
                </div>
              )}

              <div
                style={{
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.72)',
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                {plan.tier}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 4,
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    fontSize: 38,
                    lineHeight: 1,
                    fontWeight: 800,
                    color: '#FFFFFF',
                    letterSpacing: '-0.04em',
                  }}
                >
                  ${plan.price}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.42)',
                  }}
                >
                  {plan.period}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gap: 10,
                  marginBottom: 22,
                }}
              >
                {plan.features.map((item) => (
                  <div
                    key={item}
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      color: 'rgba(255,255,255,0.58)',
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ color: '#C9A84C', marginTop: 1 }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleStart}
                style={{
                  width: '100%',
                  marginTop: 10,
                  background: '#C9A84C',
                  border: 'none',
                  color: '#0A0F1E',
                  borderRadius: 12,
                  padding: '13px 18px',
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Start 14-day trial
              </button>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          padding: '70px 40px 90px',
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: '0 auto',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24,
            padding: '42px 26px',
          }}
        >
          <h3
            style={{
              fontSize: 34,
              lineHeight: 1.12,
              fontWeight: 800,
              color: '#FFFFFF',
              margin: '0 0 12px',
            }}
          >
            Stop guessing what investors think.
          </h3>

          <p
            style={{
              maxWidth: 640,
              margin: '0 auto 24px',
              fontSize: 15,
              lineHeight: 1.75,
              color: 'rgba(255,255,255,0.56)',
            }}
          >
            Run your founder assessment, uncover your strategic gaps, and generate
            investor-grade outputs from a system built to challenge your venture like
            a serious capital partner would.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleStart}
              style={{
                background: '#C9A84C',
                border: 'none',
                color: '#0A0F1E',
                borderRadius: 12,
                padding: '14px 24px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                minWidth: 220,
              }}
            >
              Start My Assessment
            </button>

            <button
              onClick={handleLogin}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#FFFFFF',
                borderRadius: 12,
                padding: '14px 22px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: 160,
              }}
            >
              Sign in
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}