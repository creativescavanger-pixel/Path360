// src/lib/posthogClient.js

let ph = null
let initialized = false

// Queue events/identify calls made before PostHog finishes loading
let pendingEvents = []
let pendingIdentify = null

export function initPostHog() {
  const key = import.meta.env.VITE_POSTHOG_KEY
  if (!key) return // silently skip if not configured

  import('posthog-js')
    .then(({ default: posthog }) => {
      posthog.init(key, {
        api_host: 'https://app.posthog.com',
        capture_pageview: true,
        // let PostHog handle default persistence (localStorage+cookie)
      })

      ph = posthog
      initialized = true

      // Flush any identify call that happened before init completed
      if (pendingIdentify) {
        const [userId, traits] = pendingIdentify
        ph.identify(userId, traits || {})
        pendingIdentify = null
      }

      // Flush any queued events
      if (pendingEvents.length > 0) {
        for (const [event, properties] of pendingEvents) {
          ph.capture(event, properties || {})
        }
        pendingEvents = []
      }
    })
    .catch((err) => {
      // If PostHog fails to load, just log and leave analytics disabled
      console.error('PostHog init failed', err)
    })
}

// Call this after login / signup
export function identifyUser(userId, traits = {}) {
  if (!userId) return

  if (initialized && ph) {
    ph.identify(userId, traits)
  } else {
    // Last identify wins before init
    pendingIdentify = [userId, traits]
  }
}

// Track key funnel events
export function track(event, properties = {}) {
  if (!event) return

  if (initialized && ph) {
    ph.capture(event, properties)
  } else {
    pendingEvents.push([event, properties])
  }
}

// Convenience event constants — use these everywhere
export const EVENTS = {
  ASSESSMENT_STARTED: 'assessment_started',
  ASSESSMENT_COMPLETED: 'assessment_completed',
  SCORE_REVEALED: 'score_revealed',
  SCORE_SHARED: 'score_shared',
  DOCUMENT_GENERATED: 'document_generated',
  DOCUMENT_INTAKE_COMPLETED: 'document_intake_completed',
  STUDIO_DRAFT_GENERATED: 'studio_draft_generated',
  DOCUMENT_EXPORTED: 'document_exported',
  AI_RAIL_USED: 'ai_rail_used',
  UPGRADE_CLICKED: 'upgrade_clicked',
  TRIAL_STARTED: 'trial_started',
  SUBSCRIPTION_STARTED: 'subscription_started',
}