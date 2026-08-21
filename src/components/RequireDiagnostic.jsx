import { Navigate, useLocation } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

export default function RequireDiagnostic({ children }) {
  const location = useLocation()

  const hasVentureSetup = useDiagnosticStore((state) =>
    state.hasVentureSetup()
  )

  const hasCompletedDiagnostic = useDiagnosticStore((state) =>
    state.hasCompletedDiagnostic()
  )

  const returnTo = encodeURIComponent(
    `${location.pathname}${location.search}`
  )

  if (!hasVentureSetup) {
    return (
      <Navigate
        to={`/app/venture-intelligence/setup?returnTo=${returnTo}`}
        replace
      />
    )
  }

  if (!hasCompletedDiagnostic) {
    return (
      <Navigate
        to={`/app/diagnostic?returnTo=${returnTo}`}
        replace
      />
    )
  }

  return children
}