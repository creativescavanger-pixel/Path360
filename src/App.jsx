// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import supabase from './lib/supabaseClient.js'
import useDiagnosticStore from './stores/useDiagnosticStore.js'

import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Assessment from './pages/Assessment.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Studio from './pages/Studio.jsx'
import GuidedDocumentPrep from './pages/GuidedDocumentPrep.jsx'
import Memory from './pages/Memory.jsx'
import Radar from './pages/Radar.jsx'
import Reports from './pages/Reports.jsx'
import Academy from './pages/Academy.jsx'
import FounderProfile from './pages/FounderProfile.jsx'
import StageOnboarding from './pages/StageOnboarding.jsx'
import AppLayout from './layouts/AppLayout.jsx'

function FullScreenLoader() {
  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F7F5F0',
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: '#8C8A84',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        Loading PATH360...
      </div>
    </div>
  )
}

function Protected({ children }) {
  const [session, setSession] = useState(undefined)
  const [bootstrapping, setBootstrapping] = useState(true)

  const hydrateWorkspace = useDiagnosticStore((s) => s.hydrateWorkspace)
  const setUser = useDiagnosticStore((s) => s.setUser)
  const clearSessionOnly = useDiagnosticStore((s) => s.clearSessionOnly)

  // NEW: read stageAssessment so we can gate onboarding
  const stageAssessment = useDiagnosticStore((s) => s.stageAssessment)

  useEffect(() => {
    let mounted = true

    async function bootstrap(sessionValue) {
      if (!mounted) return

      if (!sessionValue?.user) {
        clearSessionOnly()
        setSession(null)
        setBootstrapping(false)
        return
      }

      try {
        setUser(sessionValue.user)
        await hydrateWorkspace(sessionValue.user.id)

        if (!mounted) return
        setSession(sessionValue)
      } catch (error) {
        console.error('Failed to bootstrap founder workspace:', error)

        if (!mounted) return
        // Even if hydrateWorkspace fails, keep the user so they can at least log in
        setUser(sessionValue.user)
        setSession(sessionValue)
      } finally {
        if (mounted) setBootstrapping(false)
      }
    }

    async function loadInitialSession() {
      try {
        const { data } = await supabase.auth.getSession()
        await bootstrap(data?.session ?? null)
      } catch (error) {
        console.error('Failed to restore session:', error)
        if (!mounted) return
        clearSessionOnly()
        setSession(null)
        setBootstrapping(false)
      }
    }

    loadInitialSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      bootstrap(nextSession)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [hydrateWorkspace, clearSessionOnly, setUser])

  if (session === undefined || bootstrapping) {
    return <FullScreenLoader />
  }

  if (!session) {
    return <Navigate to="/auth" replace />
  }

  // NEW: if the user is authenticated but has not completed stage onboarding,
  // send them to the stage onboarding route.
  //
  // We only gate here for routes under /app; StageOnboarding itself is inside AppLayout.
  if (!stageAssessment) {
    // Note: we use a relative path under /app since Protected wraps AppLayout for /app routes.
    return <Navigate to="/app/stage-onboarding" replace />
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        <Route
          path="/app"
          element={
            <Protected>
              <AppLayout />
            </Protected>
          }
        >
          {/* When stageAssessment exists, index goes to dashboard */}
          <Route index element={<Navigate to="/app/dashboard" replace />} />

          {/* Stage onboarding lives inside the app layout; Protected will redirect
              here until stageAssessment is set by StageOnboarding */}
          <Route path="stage-onboarding" element={<StageOnboarding />} />

          <Route path="assessment" element={<Assessment />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="founder-profile" element={<FounderProfile />} />
          <Route path="studio" element={<Studio />} />
          <Route path="studio/prep/:docType" element={<GuidedDocumentPrep />} />
          <Route path="memory" element={<Memory />} />
          <Route path="radar" element={<Radar />} />
          <Route path="reports" element={<Reports />} />
          <Route path="academy" element={<Academy />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}