export const DOC_TYPES = {
  business_plan: {
    id: 'business_plan',
    label: 'Business Plan',
    short: 'Full strategic operating plan.',
    tier: 'starter',
    objectives: ['clarify_strategy', 'raise_funding'],
    guided: true,
    allowedExports: ['pdf', 'docx'],
  },
  business_case: {
    id: 'business_case',
    label: 'Business Case',
    short: 'Why this venture deserves support.',
    tier: 'starter',
    objectives: ['clarify_strategy', 'raise_funding'],
    guided: true,
    allowedExports: ['pdf', 'docx'],
  },
  business_model: {
    id: 'business_model',
    label: 'Business Model Summary',
    short: 'How you create, deliver, and capture value.',
    tier: 'starter',
    objectives: ['explain_business', 'clarify_strategy'],
    guided: false,
    allowedExports: ['pdf', 'docx'],
  },
  pitch_deck: {
    id: 'pitch_deck',
    label: 'Pitch Deck Narrative',
    short: 'Slide-by-slide story structure.',
    tier: 'starter',
    objectives: ['raise_funding', 'strengthen_pitch'],
    guided: true,
    allowedExports: ['pdf', 'docx', 'pptx'],
  },
  elevator_pitch: {
    id: 'elevator_pitch',
    label: 'Elevator Pitch',
    short: '30–60 second verbal summary.',
    tier: 'starter',
    objectives: ['strengthen_pitch', 'investor_meeting'],
    guided: true,
    allowedExports: ['pdf', 'docx'],
  },
  investor_memo: {
    id: 'investor_memo',
    label: 'Investor One-Pager',
    short: 'High-signal summary for quick review.',
    tier: 'starter',
    objectives: ['raise_funding', 'investor_meeting'],
    guided: true,
    allowedExports: ['pdf', 'docx'],
  },
  mock_interview: {
    id: 'mock_interview',
    label: 'Mock Investor Interview',
    short: 'Practice questions and suggested answers.',
    tier: 'growth',
    objectives: ['investor_meeting', 'strengthen_pitch'],
    guided: true,
    allowedExports: ['pdf', 'docx'],
  },
  pitch_practice: {
    id: 'pitch_practice',
    label: 'Pitch Practice Prompts',
    short: 'Tight prompts to rehearse your story.',
    tier: 'growth',
    objectives: ['strengthen_pitch'],
    guided: false,
    allowedExports: ['pdf', 'docx'],
  },
}

export function getDocTypeConfig(docType) {
  return DOC_TYPES[docType] || null
}

export function getAllDocTypes() {
  return Object.values(DOC_TYPES)
}

export function isDocTypeGuided(docType) {
  return !!DOC_TYPES[docType]?.guided
}

export function getDocTypeLabel(docType) {
  return DOC_TYPES[docType]?.label || 'Document'
}

export function getDocTypeAllowedExports(docType) {
  return DOC_TYPES[docType]?.allowedExports || ['pdf', 'docx']
}
