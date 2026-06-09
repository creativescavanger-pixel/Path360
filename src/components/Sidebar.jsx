import { NavLink, useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { signOut } from '../lib/supabaseClient.js'
import AppLogo from './AppLogo.jsx'

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Command Center', icon: '•' },
  { to: '/app/founder-profile', label: 'Founder Profile', icon: '•' },
  { to: '/app/studio', label: 'Creation Studio', icon: '•' },
  { to: '/app/memory', label: 'Memory', icon: '•' },
  { to: '/app/radar', label: 'Venture Radar', icon: '•' },
  { to: '/app/reports', label: 'Reports', icon: '•' },
]

const styles = {
  aside: {
    width: 268,
    minHeight: '100vh',
    background: '#F6F4EF',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #D9D4CA',
    flexShrink: 0,
    fontFamily: "'Inter', 'DM Sans', sans-serif",
  },
  brandWrap: {
    padding: '12px 14px 10px',
    borderBottom: '1px solid #D9D4CA',
    minHeight: 72,
    display: 'flex',
    alignItems: 'center',
  },
  nav: {
    padding: '18px 10px 14px',
    flex: 1,
  },
  navLabel: {
    fontSize: 10,
    color: '#9A9388',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    padding: '0 10px 14px',
    margin: 0,
    fontWeight: 700,
  },
  divider: {
    height: 1,
    background: '#DDD7CC',
    margin: '18px 8px',
  },
  assessmentLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 14px',
    borderRadius: 18,
    textDecoration: 'none',
    background: '#1D6B4F',
    border: '1px solid #1D6B4F',
    color: '#FFFFFF',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(29,107,79,0.14)',
    transition: 'all 0.18s ease',
    width: '100%',
  },
  assessmentIcon: {
    width: 18,
    height: 18,
    borderRadius: 999,
    border: '1.5px solid rgba(255,255,255,0.75)',
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    fontSize: 10,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  assessmentText: {
    fontSize: 13.5,
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  footer: {
    padding: '14px 14px 18px',
    borderTop: '1px solid #D9D4CA',
  },
  accountCard: {
    background: '#EEF4EF',
    border: '1px solid #D6E4D7',
    borderRadius: 14,
    padding: '12px 12px',
    marginBottom: 10,
  },
  tier: {
    fontSize: 10,
    color: '#2A6A51',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 5,
    fontWeight: 600,
  },
  founderName: {
    fontSize: 12.5,
    color: '#1A1A18',
    fontWeight: 600,
  },
  founderMeta: {
    fontSize: 11,
    color: '#6E6B65',
    marginTop: 3,
  },
  signOut: {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    border: '1px solid #D9D4CA',
    background: 'transparent',
    color: '#6E6B65',
    fontSize: 12,
    cursor: 'pointer',
    textAlign: 'center',
  },
}

function getNavItemStyle(isActive) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 14px',
    borderRadius: 18,
    textDecoration: 'none',
    marginBottom: 6,
    background: isActive ? '#EAF1EB' : 'transparent',
    border: isActive ? '1px solid #CFE0D0' : '1px solid transparent',
    color: isActive ? '#1D6B4F' : '#6E6B65',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
    fontWeight: isActive ? 600 : 500,
  }
}

const navIconStyle = {
  fontSize: 17,
  width: 18,
  textAlign: 'center',
  lineHeight: 1,
  flexShrink: 0,
  color: 'currentColor',
}

const navLabelStyle = {
  fontSize: 13.5,
  flex: 1,
  letterSpacing: '-0.01em',
}

export default function Sidebar() {
  const navigate = useNavigate()

  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const subscriptionTier = useDiagnosticStore((s) => s.subscriptionTier)
  const assessmentResults = useDiagnosticStore((s) => s.assessmentResults)
  const clearSessionOnly = useDiagnosticStore((s) => s.clearSessionOnly)
  const setAssessmentResults = useDiagnosticStore((s) => s.setAssessmentResults)
  const setQAPairs = useDiagnosticStore((s) => s.setQAPairs)

  async function handleSignOut() {
    try {
      await signOut()
      if (clearSessionOnly) clearSessionOnly()
      navigate('/')
    } catch (e) {
      console.error(e)
    }
  }

  function handleAssessmentRestart() {
    setAssessmentResults(null)
    setQAPairs([])
    navigate('/app/assessment?restart=1')
  }

  const tierLabel =
    {
      trial: 'Free Trial',
      starter: 'Starter Plan',
      growth: 'Growth Plan',
      scale: 'Scale Plan',
    }[subscriptionTier] ?? 'Free Trial'

  const displayName =
    founderProfile?.venturename ||
    founderProfile?.fullname ||
    'Your Venture'

  const displayMeta =
    founderProfile?.industry ||
    founderProfile?.fullname ||
    'Profile not completed'

  return (
    <aside style={styles.aside}>
      <div style={styles.brandWrap}>
        <AppLogo width={188} />
      </div>

      <nav aria-label="Workspace" style={styles.nav}>
        <p style={styles.navLabel}>Workspace</p>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => getNavItemStyle(isActive)}
          >
            <span style={navIconStyle}>{item.icon}</span>
            <span style={navLabelStyle}>{item.label}</span>
          </NavLink>
        ))}

        <div style={styles.divider} />

        <button type="button" onClick={handleAssessmentRestart} style={styles.assessmentLink}>
          <span style={styles.assessmentIcon}>↺</span>
          <span style={styles.assessmentText}>
            {assessmentResults ? 'Re-run Assessment' : 'Begin Assessment'}
          </span>
        </button>
      </nav>

      <div style={styles.footer}>
        <div style={styles.accountCard}>
          <div style={styles.tier}>{tierLabel}</div>
          <div style={styles.founderName}>{displayName}</div>
          <div style={styles.founderMeta}>{displayMeta}</div>
        </div>

        <button type="button" onClick={handleSignOut} style={styles.signOut}>
          Sign out
        </button>
      </div>
    </aside>
  )
}