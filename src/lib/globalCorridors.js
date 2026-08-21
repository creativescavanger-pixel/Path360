// src/lib/globalCorridors.js

// Human-readable labels for each required check.
// Use these labels in Academy, Founder Profile, Reports, and readiness cards.
export const CORRIDOR_CHECK_LABELS = {
  parent_company_structure:
    'Parent company structure and jurisdiction clarity',

  local_entity_and_market_compliance:
    'Local operating entity, market compliance, and regulatory responsibilities',

  ip_assignment:
    'IP assignment and ownership across founders, employees, and contractors',

  governance_and_reporting:
    'Governance, financial reporting, and investor-ready record keeping',

  sanctions_and_counterparty_screening:
    'Sanctions, AML, and counterparty screening for key relationships',

  hard_currency_exposure:
    'Hard-currency exposure, FX risk, and foreign-exchange planning',

  cash_collection_cycle:
    'Cash-collection cycle and ability to collect revenue reliably',

  cross_border_payments:
    'Cross-border payment rails, settlement timelines, and payment reliability',

  transactional_retention:
    'Transactional retention and cohort-level repeat usage',

  regional_expansion_evidence:
    'Evidence that the venture can expand across regional markets',

  customer_affordability:
    'Customer affordability, willingness to pay, and realistic pricing',

  gdpr_data_map:
    'GDPR data map: where personal data is stored, processed, and transferred',

  data_processing_agreements:
    'Data Processing Agreements with processors and sub-processors',

  burn_multiple:
    'Burn multiple and capital efficiency at the current growth rate',

  capital_efficiency:
    'Capital efficiency and unit economics for the core product line',

  enterprise_contracting:
    'Enterprise contracting: commercial terms, SLAs, security, and data protection',

  investor_data_room:
    'Investor data room: cap table, core documents, metrics, and evidence',

  market_entry_strategy:
    'Clear target-market entry plan, buyer profile, and go-to-market approach',
}

// Geography options that can be used in the Founder Profile form.
export const OPERATING_GEOGRAPHIES = [
  { value: 'africa', label: 'Africa' },
  { value: 'europe', label: 'Europe' },
  { value: 'united_states', label: 'United States' },
  { value: 'global', label: 'Multiple regions / global' },
]

export const CAPITAL_TARGET_GEOGRAPHIES = [
  { value: 'africa', label: 'Africa' },
  { value: 'europe', label: 'Europe' },
  { value: 'united_states', label: 'United States' },
  { value: 'global', label: 'Global / multiple investor markets' },
  { value: 'not_raising_yet', label: 'Not raising capital yet' },
]

// Corridor definitions.
// A corridor describes the founder's operating geography and intended capital market.
// The Academy uses academyFocusTrack as a suggestion, not a restriction.
export const GLOBAL_CORRIDOR_MATRIX = {
  africa_to_africa: {
    label: 'African venture building and raising within African markets',
    operatingGeography: 'africa',
    capitalTargetGeography: 'africa',
    summary:
      'Build proof for local and regional markets first: reliable collections, affordability, repeat usage, operating discipline, and expansion evidence.',
    requiredChecks: [
      'local_entity_and_market_compliance',
      'ip_assignment',
      'cash_collection_cycle',
      'customer_affordability',
      'transactional_retention',
      'regional_expansion_evidence',
      'governance_and_reporting',
    ],
    academyFocusTrack: 'validation',
  },

  africa_to_us: {
    label: 'African venture raising from US investors',
    operatingGeography: 'africa',
    capitalTargetGeography: 'united_states',
    summary:
      'Translate African-market evidence into a US-investor-ready operating, governance, and funding narrative without treating US capital as the only measure of success.',
    requiredChecks: [
      'parent_company_structure',
      'local_entity_and_market_compliance',
      'ip_assignment',
      'governance_and_reporting',
      'investor_data_room',
      'sanctions_and_counterparty_screening',
      'hard_currency_exposure',
      'cross_border_payments',
      'cash_collection_cycle',
      'transactional_retention',
    ],
    academyFocusTrack: 'validation',
  },

  africa_to_europe: {
    label: 'African venture raising from European investors',
    operatingGeography: 'africa',
    capitalTargetGeography: 'europe',
    summary:
      'Prepare African-market proof, governance, data-handling clarity, and capital-efficiency evidence for European investor conversations.',
    requiredChecks: [
      'parent_company_structure',
      'local_entity_and_market_compliance',
      'ip_assignment',
      'governance_and_reporting',
      'gdpr_data_map',
      'data_processing_agreements',
      'hard_currency_exposure',
      'cross_border_payments',
      'capital_efficiency',
      'investor_data_room',
    ],
    academyFocusTrack: 'mvp',
  },

  europe_to_us: {
    label: 'European venture raising from US investors',
    operatingGeography: 'europe',
    capitalTargetGeography: 'united_states',
    summary:
      'Prepare structure, IP, privacy, and capital-efficiency evidence for a US fundraising process.',
    requiredChecks: [
      'parent_company_structure',
      'ip_assignment',
      'gdpr_data_map',
      'data_processing_agreements',
      'burn_multiple',
      'investor_data_room',
      'market_entry_strategy',
    ],
    academyFocusTrack: 'mvp',
  },

  us_to_europe: {
    label: 'US venture raising from European investors',
    operatingGeography: 'united_states',
    capitalTargetGeography: 'europe',
    summary:
      'Prepare privacy, capital-efficiency, enterprise, and European market-entry evidence.',
    requiredChecks: [
      'gdpr_data_map',
      'data_processing_agreements',
      'capital_efficiency',
      'enterprise_contracting',
      'market_entry_strategy',
      'investor_data_room',
    ],
    academyFocusTrack: 'traction',
  },

  global_to_global: {
    label: 'Multi-region venture preparing for global capital',
    operatingGeography: 'global',
    capitalTargetGeography: 'global',
    summary:
      'Build a clear cross-border operating narrative, disciplined reporting, reliable evidence, and a coherent market-expansion plan.',
    requiredChecks: [
      'parent_company_structure',
      'local_entity_and_market_compliance',
      'ip_assignment',
      'governance_and_reporting',
      'hard_currency_exposure',
      'cross_border_payments',
      'investor_data_room',
      'market_entry_strategy',
      'capital_efficiency',
    ],
    academyFocusTrack: 'traction',
  },

  // Backward compatibility:
  // Keep this key temporarily if existing records or code still reference it.
  emerging_to_us: {
    label: 'Emerging-market venture raising from US investors',
    operatingGeography: 'global',
    capitalTargetGeography: 'united_states',
    summary:
      'Legacy corridor. New African founder journeys should use africa_to_us.',
    requiredChecks: [
      'parent_company_structure',
      'ip_assignment',
      'sanctions_and_counterparty_screening',
      'hard_currency_exposure',
      'cash_collection_cycle',
      'transactional_retention',
    ],
    academyFocusTrack: 'validation',
  },
}

// Safely get one corridor from its stored key.
export function getCorridorByKey(key) {
  if (!key) return null

  const safeKey = String(key)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  return GLOBAL_CORRIDOR_MATRIX[safeKey] || null
}

// Build a corridor key from the two Founder Profile geography fields.
export function getCorridorKey(operatingGeography, capitalTargetGeography) {
  const operating = String(operatingGeography || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  const capitalTarget = String(capitalTargetGeography || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')

  if (!operating || !capitalTarget || capitalTarget === 'not_raising_yet') {
    return null
  }

  const generatedKey = `${operating}_to_${capitalTarget}`

  if (GLOBAL_CORRIDOR_MATRIX[generatedKey]) {
    return generatedKey
  }

  if (operating === 'global' || capitalTarget === 'global') {
    return 'global_to_global'
  }

  return null
}

// Return a friendly label for a raw check ID.
export function getReadableCheckLabel(checkId) {
  if (!checkId) return ''

  return (
    CORRIDOR_CHECK_LABELS[checkId] ||
    String(checkId)
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  )
}

// Return check objects ready to render in a UI.
export function getCorridorChecksFor(key) {
  const corridor = getCorridorByKey(key)

  if (!corridor) return []

  return corridor.requiredChecks.map((id) => ({
    id,
    label: getReadableCheckLabel(id),
  }))
}

// Return a complete, UI-ready context object for Academy or Founder Profile.
export function getCorridorContext(operatingGeography, capitalTargetGeography) {
  const key = getCorridorKey(operatingGeography, capitalTargetGeography)
  const corridor = getCorridorByKey(key)

  if (!corridor) {
    return null
  }

  return {
    key,
    ...corridor,
    checks: getCorridorChecksFor(key),
  }
}