import { useNavigate } from 'react-router-dom'
import logo from '../assets/path360-logo.png'

const IconLens = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="11" cy="11" r="5" stroke="currentColor" strokeWidth="1.7" />
    <path d="M15 15L19 19" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const IconTarget = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    <path d="M12 3V5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 19.5H20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M7 16V10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M12 16V6.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <path d="M17 16V12.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

export default function Landing() {
  const navigate = useNavigate()

  const metrics = [
    { value: '8 min', label: 'From start to insight' },
    { value: 'Single view', label: 'Readiness, gaps, next steps' },
    { value: 'Free beta', label: 'While we refine the engine' },
  ]

  const pillars = [
    {
      icon: <IconLens />,
      label: 'Investor signal',
      title: 'See what investors will test first',
      text: 'Surface narrative, traction, and risk questions before they surface in the room.',
    },
    {
      icon: <IconTarget />,
      label: 'Focus',
      title: 'Replace anxiety with sharp priorities',
      text: 'Move from vague pressure to a short list of actions you can execute immediately.',
    },
    {
      icon: <IconChart />,
      label: 'Momentum',
      title: 'Turn clarity into fundraising strength',
      text: 'Strengthen your proof points, structure, and timing before key conversations.',
    },
  ]

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F6F5F1',
        color: '#111111',
        fontFamily: '"DM Sans", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

        * { box-sizing: border-box; }
        body { margin: 0; }

        @media (max-width: 1080px) {
          .hero-grid {
            grid-template-columns: 1fr !important;
          }
          .metrics-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 760px) {
          .shell {
            padding: 18px 18px 32px !important;
          }
          .top-nav {
            padding: 14px 18px !important;
          }
          .brand-logo-top {
            height: 40px !important;
          }
          .hero-brand {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          .hero-logo {
            height: 68px !important;
          }
          .pillars-grid {
            grid-template-columns: 1fr !important;
          }
          .metrics-grid {
            grid-template-columns: 1fr !important;
          }
          .cta-row {
            flex-direction: column !important;
            align-items: stretch !important;
          }
        }
      `}</style>

      <header
        className="top-nav"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(246,245,241,0.94)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(17,17,17,0.06)',
          padding: '16px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <img
            src={logo}
            alt="Path 360-Beyond Borders"
            className="brand-logo-top"
            style={{
              height: 48,
              width: 'auto',
              display: 'block',
              objectFit: 'contain',
            }}
          />
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#4D6B57',
                marginBottom: 4,
              }}
            >
              Powered by
            </div>
            <div
              style={{
                color: '#111111',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              Path 360-Beyond Borders
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={() => navigate('/auth?mode=login')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(17,17,17,0.14)',
              color: '#111111',
              borderRadius: 999,
              padding: '9px 17px',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Log in
          </button>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            style={{
              background: '#111111',
              border: 'none',
              color: '#F6F5F1',
              borderRadius: 999,
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 14px 30px rgba(17,17,17,0.16)',
            }}
          >
            Start free assessment
          </button>
        </div>
      </header>

      <main
        className="shell"
        style={{
          maxWidth: 1240,
          margin: '0 auto',
          padding: '28px 32px 40px',
        }}
      >
        <section
          className="hero-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr',
            gap: 22,
          }}
        >
          <div
            style={{
              background: '#FCFBF8',
              borderRadius: 24,
              border: '1px solid rgba(17,17,17,0.08)',
              padding: '28px 28px 22px',
              boxShadow: '0 24px 60px rgba(17,17,17,0.06)',
            }}
          >
            <div
              className="hero-brand"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                marginBottom: 20,
                paddingBottom: 18,
                borderBottom: '1px solid rgba(17,17,17,0.08)',
              }}
            >
              <img
                src={logo}
                alt="Path 360-Beyond Borders"
                className="hero-logo"
                style={{
                  height: 84,
                  width: 'auto',
                  display: 'block',
                  objectFit: 'contain',
                }}
              />

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: '#4D6B57',
                    marginBottom: 6,
                  }}
                >
                  Powered by Path 360-Beyond Borders
                </div>
                <div
                  style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: '#555555',
                    maxWidth: 420,
                  }}
                >
                  Founder intelligence designed to make ambitious ventures look clearer,
                  stronger, and more investor-ready.
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '7px 12px',
                borderRadius: 999,
                border: '1px solid rgba(77,107,87,0.22)',
                background: '#F2F5F1',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: '#4D6B57',
                marginBottom: 16,
              }}
            >
              Founder assessment for real investor pressure
            </div>

            <h1
              style={{
                margin: '0 0 12px',
                fontSize: 'clamp(34px, 4.4vw, 58px)',
                lineHeight: 1.01,
                letterSpacing: '-0.055em',
                fontWeight: 800,
                color: '#111111',
              }}
            >
              Know exactly how investable you look —
              <br />
              before you enter the room.
            </h1>

            <p
              style={{
                margin: '0 0 18px',
                fontSize: 15.5,
                lineHeight: 1.8,
                color: '#5B5B5B',
                maxWidth: 650,
              }}
            >
              PATH360 gives founders a single, honest view of their venture: where they
              are strong, where investors will hesitate, and what to tighten now so they
              feel ready, not exposed.
            </p>

            <div
              className="cta-row"
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 14,
              }}
            >
              <button
                onClick={() => navigate('/auth?mode=signup')}
                style={{
                  background: '#111111',
                  border: 'none',
                  color: '#F6F5F1',
                  borderRadius: 999,
                  padding: '13px 22px',
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: 'pointer',
                  minWidth: 210,
                  boxShadow: '0 18px 34px rgba(17,17,17,0.16)',
                }}
              >
                Start free assessment
              </button>
              <button
                onClick={() => navigate('/auth?mode=login')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(17,17,17,0.14)',
                  color: '#111111',
                  borderRadius: 999,
                  padding: '12px 18px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: 140,
                }}
              >
                Log in
              </button>
              <div
                style={{
                  fontSize: 11.5,
                  color: '#666666',
                }}
              >
                Free during beta · No card required
              </div>
            </div>

            <div
              className="metrics-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
                background: 'linear-gradient(135deg, #163A2C 0%, #1F4D3A 100%)',
                borderRadius: 20,
                border: '1px solid rgba(22,58,44,0.18)',
                padding: 12,
                boxShadow: '0 18px 38px rgba(22,58,44,0.16)',
              }}
            >
              {metrics.map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.10)',
                    padding: '14px 14px 12px',
                    minHeight: 82,
                  }}
                >
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      color: '#FFFFFF',
                      marginBottom: 4,
                    }}
                  >
                    {item.value}
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      color: 'rgba(255,255,255,0.78)',
                    }}
                  >
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gap: 14 }}>
            <div
              style={{
                background: '#151515',
                borderRadius: 24,
                border: '1px solid rgba(17,17,17,0.08)',
                padding: '20px 20px 18px',
                boxShadow: '0 24px 64px rgba(17,17,17,0.14)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#A8C0B0',
                  marginBottom: 7,
                }}
              >
                Why founders want this
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#FFFFFF',
                  letterSpacing: '-0.03em',
                  marginBottom: 6,
                }}
              >
                It feels premium, serious, and useful.
              </div>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.75,
                  color: 'rgba(255,255,255,0.72)',
                  margin: 0,
                }}
              >
                The experience is designed to feel calm but sharp — not decorative,
                not noisy, and not generic.
              </p>
            </div>

            <div className="pillars-grid" style={{ display: 'grid', gap: 10 }}>
              {pillars.map((item) => (
                <div
                  key={item.title}
                  style={{
                    background: '#FCFBF8',
                    borderRadius: 18,
                    border: '1px solid rgba(17,17,17,0.08)',
                    padding: '15px 16px',
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    gap: 12,
                    alignItems: 'flex-start',
                    boxShadow: '0 10px 30px rgba(17,17,17,0.04)',
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      border: '1px solid rgba(77,107,87,0.18)',
                      background: '#F2F5F1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4D6B57',
                    }}
                  >
                    {item.icon}
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.13em',
                        textTransform: 'uppercase',
                        color: '#4D6B57',
                        marginBottom: 4,
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#111111',
                        marginBottom: 4,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        lineHeight: 1.7,
                        color: '#666666',
                      }}
                    >
                      {item.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}