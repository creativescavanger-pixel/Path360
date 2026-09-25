// src/layouts/AppLayout.jsx
import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'
import AIStrategistRail from '../components/AIStrategistRail.jsx'
import StageBanner from '../components/StageBanner.jsx'
import { getPageIdentity } from '../lib/pageIdentity.js'

export default function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const pageIdentity = getPageIdentity(location.pathname)

  const isOnStageOnboarding = location.pathname === '/app/stage-onboarding'
  const isOnVentureIntelligence =
    location.pathname === '/app/venture-intelligence'

  const shouldShowSharedPageIntro =
    !isOnStageOnboarding && !isOnVentureIntelligence

  const [isAiOpen, setIsAiOpen] = useState(false)

  return (
    <div
      className="p360-shell"
      style={{
        display: 'grid',
        gridTemplateColumns: '230px minmax(0, 1fr)',
        minHeight: '100vh',
        background: '#F6F5F1',
      }}
    >
      <aside className="p360-shell-sidebar">
        <Sidebar />
      </aside>

      <div className="p360-shell-main">
        <header
          className="p360-shell-topbar"
          style={{
            borderBottom: '1px solid #E2DED6',
            background: '#FFFFFF',
          }}
        >
          <Topbar />
        </header>

        <main
          className="p360-shell-content"
          style={{
            // Full-width working area with balanced padding,
            // aligned to the Command Center layout
            padding: '16px 24px 28px',
          }}
        >
          {!isOnStageOnboarding && (
            <div style={{ marginBottom: 10 }}>
              <StageBanner />
            </div>
          )}

          {shouldShowSharedPageIntro && (
            <section
              aria-labelledby="page-title"
              className="p360-card-soft"
              style={{
                marginBottom: 12,
                padding: '14px 18px',
                background: pageIdentity.softBg,
                borderColor: pageIdentity.border,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div
                    className="p360-kicker"
                    style={{
                      color: pageIdentity.accent,
                      marginBottom: 4,
                      fontSize: 11,
                    }}
                  >
                    {pageIdentity.eyebrow}
                  </div>

                  <h1
                    id="page-title"
                    className="p360-title-lg"
                    style={{
                      margin: 0,
                      fontSize: 22,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {pageIdentity.title}
                  </h1>

                  <p
                    className="p360-body"
                    style={{
                      maxWidth: 760,
                      marginTop: 4,
                      fontSize: 13.5,
                      lineHeight: 1.7,
                    }}
                  >
                    {pageIdentity.description}
                  </p>
                </div>

                {pageIdentity.status ? (
                  <div
                    className="p360-chip"
                    style={{
                      flexShrink: 0,
                      minHeight: 30,
                      padding: '0 10px',
                      borderColor: pageIdentity.border,
                      color: pageIdentity.accent,
                      fontSize: 11,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: pageIdentity.accent,
                        marginRight: 6,
                        display: 'inline-block',
                      }}
                    />
                    {pageIdentity.status}
                  </div>
                ) : null}
              </div>
            </section>
          )}

          <div className="p360-shell-content-inner fade-up">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Floating AI Strategist trigger */}
      <button
        type="button"
        onClick={() => setIsAiOpen(true)}
        style={{
          position: 'fixed',
          right: 20,
          bottom: 20,
          zIndex: 40,
          borderRadius: 999,
          border: '1px solid #1D6B4F',
          background: '#1D6B4F',
          color: '#FFFFFF',
          padding: '9px 13px',
          fontSize: 12.5,
          fontWeight: 800,
          boxShadow: '0 14px 40px rgba(0,0,0,0.18)',
          cursor: 'pointer',
        }}
      >
        AI Strategist
      </button>

      {/* AI Strategist overlay rail */}
      {isAiOpen && (
        <div
          aria-label="AI strategist"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 39,
            pointerEvents: 'none',
          }}
        >
          {/* click-outside layer */}
          <div
            onClick={() => setIsAiOpen(false)}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'transparent',
              pointerEvents: 'auto',
            }}
          />

          {/* rail container */}
          <div
            style={{
              position: 'absolute',
              right: 18,
              top: 80, // below topbar + banner for consistency with dashboard
              width: 420,
              maxHeight: 'calc(100vh - 100px)',
              pointerEvents: 'auto',
              borderRadius: 18,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.22)',
              background: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <AIStrategistRail />
          </div>
        </div>
      )}
    </div>
  )
}