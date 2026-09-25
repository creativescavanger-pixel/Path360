import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

const ROUTES = [
  {
    id: 'explorer',
    eyebrow: 'Explore opportunities',
    title: 'I am exploring opportunities',
    description:
      'You do not yet have one specific venture to build, or you are comparing possible problems, markets, or directions.',
    next:
      'PATH360 will begin with opportunity discovery and help you identify a direction worth investigating.',
  },
  {
    id: 'active_venture',
    eyebrow: 'Build a venture',
    title: 'I have a venture, idea, prototype, or active business',
    description:
      'You have a problem, concept, product, pilot, customers, or an existing venture you want to strengthen.',
    next:
      'PATH360 will begin by understanding your current venture and recommending the most useful next stage.',
  },
]

export default function JourneyStart() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
const isChangingRoute = searchParams.get('change') === '1'

  const founderProfile = useDiagnosticStore((state) => state.founderProfile)


const setFounderRoute = useDiagnosticStore((state) => state.setFounderRoute)

 const [selectedRoute, setSelectedRoute] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')


  const founderName =
    founderProfile?.fullname ||
    founderProfile?.foundername ||
    founderProfile?.name ||
    ''

  async function handleContinue() {
    if (!selectedRoute || isSaving) return

    setIsSaving(true)
    setError('')

   try {
  await setFounderRoute(selectedRoute)

  navigate('/app/founder-profile?onboarding=1', { replace: true })
} catch (err) {
    
      console.error('Unable to save founder route:', err)

      setError(
        err?.message ||
          'We could not save your starting point. Please try again.',
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div
      className="fade-up"
      style={{
        width: '100%',
        maxWidth: 920,
        margin: '0 auto',
        padding: '10px 0 32px',
      }}
    >
      <section
        className="p360-card"
        style={{
          padding: 'clamp(22px, 4vw, 42px)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            width: 300,
            height: 300,
            borderRadius: '50%',
            right: -140,
            top: -170,
            background:
              'radial-gradient(circle, rgba(45,106,79,0.12), transparent 68%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: 700, position: 'relative' }}>
          <div className="p360-kicker" style={{ marginBottom: 10 }}>
            {isChangingRoute
  ? 'Update your PATH360 guidance route'
  : 'Your PATH360 starting point'}
          </div>

          <h1
            style={{
              margin: 0,
              color: 'var(--text)',
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: 800,
              letterSpacing: '-0.045em',
              lineHeight: 1.08,
            }}
          >
            {isChangingRoute
  ? 'Which route best reflects your work today?'
  : `${founderName ? `Welcome, ${founderName.split(' ')[0]}. ` : ''}Where are you today?`}
          </h1>

          <p
            style={{
              margin: '14px 0 0',
              maxWidth: 620,
              color: 'var(--text-soft)',
              fontSize: 15,
              lineHeight: 1.7,
            }}
          >
            PATH360 adapts to the reality of your work today. Choose the option
            that is most true now—not where you hope to be later.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 14,
            marginTop: 30,
            position: 'relative',
          }}
        >
          {ROUTES.map((route) => {
            const selected = selectedRoute === route.id

            return (
              <button
                key={route.id}
                type="button"
                onClick={() => {
                  setSelectedRoute(route.id)
                  setError('')
                }}
                aria-pressed={selected}
                className="p360-card-soft"
                style={{
                  minHeight: 250,
                  padding: 20,
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderColor: selected
                    ? 'var(--green-700)'
                    : 'var(--border)',
                  background: selected
                    ? 'var(--green-050)'
                    : 'var(--surface-soft)',
                  boxShadow: selected
                    ? '0 0 0 3px rgba(45, 106, 79, 0.12)'
                    : 'none',
                  transition:
                    'border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <span
                    className="p360-kicker"
                    style={{
                      color: selected
                        ? 'var(--green-700)'
                        : 'var(--text-faint)',
                    }}
                  >
                    {route.eyebrow}
                  </span>

                  <span
                    aria-hidden="true"
                    style={{
                      display: 'grid',
                      width: 24,
                      height: 24,
                      placeItems: 'center',
                      borderRadius: 999,
                      border: selected
                        ? '1px solid var(--green-700)'
                        : '1px solid var(--border)',
                      background: selected
                        ? 'var(--green-700)'
                        : 'var(--surface)',
                      color: 'var(--white)',
                      fontSize: 13,
                      fontWeight: 900,
                    }}
                  >
                    {selected ? '✓' : ''}
                  </span>
                </div>

                <div
                  style={{
                    color: 'var(--text)',
                    fontSize: 20,
                    fontWeight: 800,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.22,
                  }}
                >
                  {route.title}
                </div>

                <p
                  style={{
                    margin: '10px 0 0',
                    color: 'var(--text-soft)',
                    fontSize: 13,
                    lineHeight: 1.62,
                  }}
                >
                  {route.description}
                </p>

                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: '1px solid var(--border)',
                    color: selected
                      ? 'var(--green-800)'
                      : 'var(--text-faint)',
                    fontSize: 12,
                    fontWeight: 650,
                    lineHeight: 1.55,
                  }}
                >
                  {route.next}
                </div>
              </button>
            )
          })}
        </div>

        {error ? (
          <div
            role="alert"
            style={{
              marginTop: 18,
              padding: '12px 14px',
              border: '1px solid rgba(139, 32, 32, 0.22)',
              borderRadius: 12,
              background: '#FDEAEA',
              color: '#8B2020',
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            {error}
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
            marginTop: 26,
            paddingTop: 20,
            borderTop: '1px solid var(--border)',
            position: 'relative',
          }}
        >
          <p
            style={{
              margin: 0,
              maxWidth: 520,
              color: 'var(--text-faint)',
              fontSize: 12.5,
              lineHeight: 1.55,
            }}
          >
            You can explore PATH360’s full Academy at any time. This choice only
            helps PATH360 recommend the most useful place to begin.
          </p>

          <button
            type="button"
            className="p360-btn-primary"
            disabled={!selectedRoute || isSaving}
            onClick={handleContinue}
            style={{
              minWidth: 190,
              opacity: !selectedRoute || isSaving ? 0.55 : 1,
              cursor:
                !selectedRoute || isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Saving your starting point…' : 'Continue →'}
          </button>
        </div>
      </section>

      <style>{`
        @media (max-width: 720px) {
          .p360-card > div[style*="grid-template-columns: repeat(2"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}