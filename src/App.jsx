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
        setUser(sessionValue.user)
        setSession(sessionValue)
      } finally {
        if (mounted) setBootstrapping(false)
      }
    }

    supabase.auth.getSession().then(({ data }) => {
      bootstrap(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setBootstrapping(true)
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

  return session ? children : <Navigate to="/auth" replace />
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
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="founder-profile" element={<Dashboard />} />
          <Route path="studio" element={<Studio />} />
          <Route path="studio/prep/:docType" element={<GuidedDocumentPrep />} />
          <Route path="memory" element={<Memory />} />
          <Route path="radar" element={<Radar />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}