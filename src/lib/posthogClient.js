let ph = null
export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return // silently skip if not configured
  import('posthog-js').then(({ default: posthog }) => {
    posthog.init(key, {
      api_host: 'https://app.posthog.com',
      capture_pageview: true,
      persistence: 'localStorage',
    })
    ph = posthog
  })
}
// Call this after login / signup
export function identifyUser(userId, traits = {}) {
  ph?.identify(userId, traits)
}
// Track key funnel events
export function track(event, properties = {}) {
  ph?.capture(event, properties)
}
// Convenience event constants — use these everywhere
export const EVENTS = {
  ASSESSMENT_STARTED:    'assessment_started',
  ASSESSMENT_COMPLETED:  'assessment_completed',
  SCORE_REVEALED:        'score_revealed',
  SCORE_SHARED:          'score_shared',
  DOCUMENT_GENERATED:    'document_generated',
  AI_RAIL_USED:          'ai_rail_used',
  UPGRADE_CLICKED:       'upgrade_clicked',
  TRIAL_STARTED:         'trial_started',
  SUBSCRIPTION_STARTED:  'subscription_started',
}
