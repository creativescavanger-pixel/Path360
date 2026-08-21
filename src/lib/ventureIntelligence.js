// src/lib/ventureIntelligence.js

import { supabase } from './supabaseClient.js'

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : []
}

function normaliseTags(value) {
  return asArray(value)
    .map((item) => String(item).trim())
    .filter(Boolean)
}

function normaliseOptionalText(value) {
  return String(value || '').trim() || null
}

/*
 * This normaliser defines the Venture Intelligence Profile’s full data shape.
 *
 * The profile deliberately separates:
 * - Where the founder is based
 * - Where the venture operates
 * - Where customers are located
 * - Where the business is incorporated
 * - Whether a holding company, subsidiary, branch, or IP entity exists
 *
 * These must not be collapsed into one "country" field for global founders.
 */
function normaliseProfile(profile = {}) {
  return {
    // ------------------------------------------------------------
    // MARKET FOOTPRINT
    // ------------------------------------------------------------
    primary_country_code: normaliseOptionalText(
      profile.primary_country_code,
    )?.toUpperCase(),

    primary_region_code: normaliseOptionalText(
      profile.primary_region_code,
    ),

    customer_country_codes: normaliseTags(
      profile.customer_country_codes,
    ).map((code) => code.toUpperCase()),

    expansion_country_codes: normaliseTags(
      profile.expansion_country_codes,
    ).map((code) => code.toUpperCase()),

    operating_scope: normaliseOptionalText(profile.operating_scope),

    // ------------------------------------------------------------
    // BUSINESS AND OPERATING MODEL
    // ------------------------------------------------------------
    customer_model_tags: normaliseTags(profile.customer_model_tags),
    revenue_model_tags: normaliseTags(profile.revenue_model_tags),
    distribution_model_tags: normaliseTags(
      profile.distribution_model_tags,
    ),
    operating_model_tags: normaliseTags(
      profile.operating_model_tags,
    ),
    dependency_tags: normaliseTags(profile.dependency_tags),

    // ------------------------------------------------------------
    // OPERATING ENVIRONMENT
    // ------------------------------------------------------------
    affordability_sensitivity:
      normaliseOptionalText(profile.affordability_sensitivity) ||
      'unknown',

    market_formality:
      normaliseOptionalText(profile.market_formality) || 'unknown',

    regulatory_exposure:
      normaliseOptionalText(profile.regulatory_exposure) || 'unknown',

    finance_approach_tags: normaliseTags(
      profile.finance_approach_tags,
    ),

    biggest_operating_concern: normaliseOptionalText(
      profile.biggest_operating_concern,
    ),

    // ------------------------------------------------------------
    // FOUNDER CONTEXT
    // Kept separate from operating-market and entity information.
    // ------------------------------------------------------------
    founder_base_type: normaliseOptionalText(profile.founder_base_type),

    founder_base_country_codes: normaliseTags(
      profile.founder_base_country_codes,
    ).map((code) => code.toUpperCase()),

    // ------------------------------------------------------------
    // LEGAL AND OPERATING STRUCTURE
    // ------------------------------------------------------------
    entity_structure_type: normaliseOptionalText(
      profile.entity_structure_type,
    ),

    entity_jurisdiction_country_code: normaliseOptionalText(
      profile.entity_jurisdiction_country_code,
    )?.toUpperCase(),

    entity_registration_context: normaliseOptionalText(
      profile.entity_registration_context,
    ),

    operating_entity_country_codes: normaliseTags(
      profile.operating_entity_country_codes,
    ).map((code) => code.toUpperCase()),

    holding_company_country_code: normaliseOptionalText(
      profile.holding_company_country_code,
    )?.toUpperCase(),

    ip_holding_country_code: normaliseOptionalText(
      profile.ip_holding_country_code,
    )?.toUpperCase(),

    legal_structure_notes: normaliseOptionalText(
      profile.legal_structure_notes,
    ),

    setup_completed_at: profile.setup_completed_at || null,
  }
}

/*
 * Keeps existing saved values whenever a caller saves only one section.
 *
 * Example:
 * - A founder edits customer markets.
 * - Their legal entity information must remain unchanged.
 *
 * This prevents a small edit drawer from unintentionally resetting
 * unrelated profile values to null or empty arrays.
 */
function mergeProfile(existingProfile = {}, changes = {}) {
  return {
    ...existingProfile,
    ...changes,
    customer_country_codes:
      changes.customer_country_codes ??
      existingProfile.customer_country_codes ??
      [],
    expansion_country_codes:
      changes.expansion_country_codes ??
      existingProfile.expansion_country_codes ??
      [],
    customer_model_tags:
      changes.customer_model_tags ??
      existingProfile.customer_model_tags ??
      [],
    revenue_model_tags:
      changes.revenue_model_tags ??
      existingProfile.revenue_model_tags ??
      [],
    distribution_model_tags:
      changes.distribution_model_tags ??
      existingProfile.distribution_model_tags ??
      [],
    operating_model_tags:
      changes.operating_model_tags ??
      existingProfile.operating_model_tags ??
      [],
    dependency_tags:
      changes.dependency_tags ??
      existingProfile.dependency_tags ??
      [],
    finance_approach_tags:
      changes.finance_approach_tags ??
      existingProfile.finance_approach_tags ??
      [],
    founder_base_country_codes:
      changes.founder_base_country_codes ??
      existingProfile.founder_base_country_codes ??
      [],
    operating_entity_country_codes:
      changes.operating_entity_country_codes ??
      existingProfile.operating_entity_country_codes ??
      [],
  }
}

function matchesAnyTag(itemTags, selectedTags) {
  const item = normaliseTags(itemTags)
  const selected = normaliseTags(selectedTags)

  if (selected.length === 0 || item.length === 0) return true

  return selected.some((tag) => item.includes(tag))
}

function matchesLocation(item, countryCode, regionCode) {
  const countries = normaliseTags(item.country_codes)
  const regions = normaliseTags(item.region_codes)

  const countryMatches =
    !countryCode ||
    countries.length === 0 ||
    countries.includes(countryCode)

  const regionMatches =
    !regionCode ||
    regions.length === 0 ||
    regions.includes(regionCode) ||
    regions.includes('global')

  return countryMatches && regionMatches
}

function matchesStage(item, stage) {
  const stages = normaliseTags(item.stage_tags)

  return !stage || stages.length === 0 || stages.includes(stage)
}

function sortByPriority(items) {
  const order = {
    critical: 0,
    high: 1,
    standard: 2,
    optional: 3,
  }

  return [...items].sort((a, b) => {
    const priorityDifference =
      (order[a.priority] ?? 9) - (order[b.priority] ?? 9)

    if (priorityDifference !== 0) return priorityDifference

    return String(a.title || '').localeCompare(String(b.title || ''))
  })
}

// ============================================================
// REGIONS AND COUNTRIES
// ============================================================

export async function getMarketRegions() {
  const { data, error } = await supabase
    .from('market_regions')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getMarketCountries({
  regionCode = null,
  includeInactive = false,
} = {}) {
  let query = supabase
    .from('market_countries')
    .select('*')
    .order('content_status', { ascending: true })
    .order('name', { ascending: true })

  if (!includeInactive) {
    query = query.eq('is_active', true)
  }

  if (regionCode) {
    query = query.or(
      `region_code.eq.${regionCode},subregion_code.eq.${regionCode}`,
    )
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function getMarketCountry(countryCode) {
  if (!countryCode) return null

  const { data, error } = await supabase
    .from('market_countries')
    .select('*')
    .eq('iso2', String(countryCode).toUpperCase())
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

// ============================================================
// FOUNDER VENTURE INTELLIGENCE PROFILE
// ============================================================

export async function getVentureIntelligenceProfile(userId) {
  if (!userId) return null

  const { data, error } = await supabase
    .from('venture_intelligence_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

/*
 * Full save:
 * Used by the original Venture Intelligence Setup journey.
 */
export async function saveVentureIntelligenceProfile(
  userId,
  profile,
  { markSetupComplete = false } = {},
) {
  if (!userId) {
    throw new Error('No authenticated user found.')
  }

  const payload = normaliseProfile(profile)

  if (markSetupComplete) {
    payload.setup_completed_at =
      payload.setup_completed_at || new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('venture_intelligence_profiles')
    .upsert(
      {
        user_id: userId,
        ...payload,
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/*
 * Partial save:
 * Used by future Overview-card drawers, Market Footprint editing,
 * Legal & Structure editing, and quick-update interactions.
 *
 * It reads the current record, merges the requested changes, normalises
 * the resulting whole profile, and saves it back safely.
 */
export async function updateVentureIntelligenceProfile(
  userId,
  changes = {},
) {
  if (!userId) {
    throw new Error('No authenticated user found.')
  }

  const existingProfile = await getVentureIntelligenceProfile(userId)
  const mergedProfile = mergeProfile(existingProfile || {}, changes)
  const payload = normaliseProfile(mergedProfile)

  const { data, error } = await supabase
    .from('venture_intelligence_profiles')
    .upsert(
      {
        user_id: userId,
        ...payload,
      },
      { onConflict: 'user_id' },
    )
    .select()
    .single()

  if (error) throw error
  return data
}

/*
 * Convenience helper for the forthcoming Market Footprint drawer.
 */
export async function updateMarketFootprint(userId, footprint = {}) {
  return updateVentureIntelligenceProfile(userId, {
    primary_country_code: footprint.primary_country_code,
    primary_region_code: footprint.primary_region_code,
    customer_country_codes: footprint.customer_country_codes,
    expansion_country_codes: footprint.expansion_country_codes,
    operating_scope: footprint.operating_scope,
  })
}

/*
 * Convenience helper for the forthcoming Legal & Operating Structure drawer.
 */
export async function updateLegalAndOperatingStructure(
  userId,
  structure = {},
) {
  return updateVentureIntelligenceProfile(userId, {
    founder_base_type: structure.founder_base_type,
    founder_base_country_codes: structure.founder_base_country_codes,
    entity_structure_type: structure.entity_structure_type,
    entity_jurisdiction_country_code:
      structure.entity_jurisdiction_country_code,
    entity_registration_context:
      structure.entity_registration_context,
    operating_entity_country_codes:
      structure.operating_entity_country_codes,
    holding_company_country_code:
      structure.holding_company_country_code,
    ip_holding_country_code: structure.ip_holding_country_code,
    legal_structure_notes: structure.legal_structure_notes,
  })
}

// ============================================================
// BUSINESS MODEL CANVAS
// ============================================================

const CANVAS_FIELDS = [
  'value_proposition',
  'customer_segments',
  'revenue_streams',
  'channels',
  'customer_relationships',
  'key_resources',
  'key_activities',
  'key_partnerships',
  'cost_structure',
  'funding_strategy',
  'governance_structure',
]

function normaliseCanvas(canvas = {}) {
  const output = {
    evidence_notes:
      canvas.evidence_notes &&
      typeof canvas.evidence_notes === 'object' &&
      !Array.isArray(canvas.evidence_notes)
        ? canvas.evidence_notes
        : {},
  }

  for (const field of CANVAS_FIELDS) {
    output[field] = String(canvas[field] || '').trim() || null
  }

  return output
}

export async function getCurrentBusinessModelCanvas(userId) {
  if (!userId) return null

  const { data, error } = await supabase
    .from('founder_business_model_canvases')
    .select('*')
    .eq('user_id', userId)
    .eq('is_current', true)
    .order('version', { ascending: false })
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

export async function getBusinessModelCanvasHistory(userId) {
  if (!userId) return []

  const { data, error } = await supabase
    .from('founder_business_model_canvases')
    .select('*')
    .eq('user_id', userId)
    .order('version', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function saveBusinessModelCanvas(userId, canvas, options = {}) {
  if (!userId) {
    throw new Error('No authenticated user found.')
  }

  const {
    createNewVersion = false,
    existingCanvasId = null,
  } = options

  const normalised = normaliseCanvas(canvas)

  if (existingCanvasId && !createNewVersion) {
    const { data, error } = await supabase
      .from('founder_business_model_canvases')
      .update(normalised)
      .eq('id', existingCanvasId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const current = await getCurrentBusinessModelCanvas(userId)
  const nextVersion = Number(current?.version || 0) + 1

  if (current?.id) {
    const { error: archiveError } = await supabase
      .from('founder_business_model_canvases')
      .update({ is_current: false })
      .eq('id', current.id)
      .eq('user_id', userId)

    if (archiveError) throw archiveError
  }

  const { data, error } = await supabase
    .from('founder_business_model_canvases')
    .insert({
      user_id: userId,
      version: nextVersion,
      is_current: true,
      ...normalised,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
// INTELLIGENCE LIBRARY / RESOURCE BANK
// ============================================================

export async function getMarketIntelligenceItems({
  countryCode = null,
  regionCode = null,
  contentType = null,
  category = null,
  pestelDimension = null,
  businessModelTags = [],
  operatingModelTags = [],
  dependencyTags = [],
  stage = null,
  sectorTags = [],
  search = '',
  limit = 200,
} = {}) {
  let query = supabase
    .from('market_intelligence_items')
    .select('*')
    .eq('is_active', true)
    .eq('content_status', 'published')
    .limit(limit)

  if (contentType) query = query.eq('content_type', contentType)
  if (category) query = query.eq('category', category)
  if (pestelDimension) {
    query = query.eq('pestel_dimension', pestelDimension)
  }

  const { data, error } = await query

  if (error) throw error

  const term = String(search || '').trim().toLowerCase()

  const filtered = (data ?? []).filter((item) => {
    if (!matchesLocation(item, countryCode, regionCode)) return false
    if (!matchesStage(item, stage)) return false

    if (!matchesAnyTag(item.business_model_tags, businessModelTags)) {
      return false
    }

    if (!matchesAnyTag(item.operating_model_tags, operatingModelTags)) {
      return false
    }

    if (!matchesAnyTag(item.dependency_tags, dependencyTags)) {
      return false
    }

    if (!matchesAnyTag(item.sector_tags, sectorTags)) {
      return false
    }

    if (!term) return true

    return [
      item.title,
      item.summary,
      item.body,
      item.category,
      item.content_type,
      item.pestel_dimension,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(term)
  })

  return sortByPriority(filtered)
}

export async function getMarketIntelligenceItemBySlug(slug) {
  if (!slug) return null

  const { data, error } = await supabase
    .from('market_intelligence_items')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('content_status', 'published')
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

export async function getPestelIntelligence(filters = {}) {
  return getMarketIntelligenceItems({
    ...filters,
    contentType: 'pestel_insight',
  })
}

export async function getRegulatoryChecks(filters = {}) {
  return getMarketIntelligenceItems({
    ...filters,
    contentType: 'regulatory_check',
  })
}

export async function getOperatingChecks(filters = {}) {
  return getMarketIntelligenceItems({
    ...filters,
    contentType: 'operating_check',
  })
}

export async function getCaseStudies(filters = {}) {
  return getMarketIntelligenceItems({
    ...filters,
    contentType: 'case_study',
  })
}

// ============================================================
// DOCUMENTS AND PERFORMANCE MARKERS
// ============================================================

export async function getReadinessDocumentTemplates({
  countryCode = null,
  regionCode = null,
  stage = null,
  category = null,
  businessModelTags = [],
  operatingModelTags = [],
  limit = 200,
} = {}) {
  let query = supabase
    .from('readiness_document_templates')
    .select('*')
    .eq('is_active', true)
    .limit(limit)

  if (category) query = query.eq('category', category)

  const { data, error } = await query

  if (error) throw error

  const filtered = (data ?? []).filter((item) => {
    if (!matchesLocation(item, countryCode, regionCode)) return false
    if (!matchesStage(item, stage)) return false

    if (!matchesAnyTag(item.business_model_tags, businessModelTags)) {
      return false
    }

    if (!matchesAnyTag(item.operating_model_tags, operatingModelTags)) {
      return false
    }

    return true
  })

  return sortByPriority(filtered)
}

export async function getBusinessModelMarkers({
  stage = null,
  markerGroup = null,
  businessModelTags = [],
  operatingModelTags = [],
  sectorTags = [],
  limit = 200,
} = {}) {
  let query = supabase
    .from('business_model_markers')
    .select('*')
    .eq('is_active', true)
    .limit(limit)

  if (markerGroup) query = query.eq('marker_group', markerGroup)

  const { data, error } = await query

  if (error) throw error

  const filtered = (data ?? []).filter((item) => {
    if (!matchesStage(item, stage)) return false

    if (!matchesAnyTag(item.business_model_tags, businessModelTags)) {
      return false
    }

    if (!matchesAnyTag(item.operating_model_tags, operatingModelTags)) {
      return false
    }

    if (!matchesAnyTag(item.sector_tags, sectorTags)) {
      return false
    }

    return true
  })

  return sortByPriority(filtered)
}

// ============================================================
// FOUNDER PROGRESS, REFLECTIONS, CHECKLISTS AND EVIDENCE
// ============================================================

export async function getFounderIntelligenceProgress(userId, options = {}) {
  if (!userId) return []

  const {
    status = null,
    itemType = null,
    itemSlug = null,
    limit = 500,
  } = options

  let query = supabase
    .from('founder_intelligence_progress')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (status) query = query.eq('status', status)
  if (itemType) query = query.eq('item_type', itemType)
  if (itemSlug) query = query.eq('item_slug', itemSlug)

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function getFounderIntelligenceProgressBySlug(userId, itemSlug) {
  if (!userId || !itemSlug) return null

  const { data, error } = await supabase
    .from('founder_intelligence_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('item_slug', itemSlug)
    .order('updated_at', { ascending: false })
    .maybeSingle()

  if (error) throw error
  return data ?? null
}

export async function saveFounderIntelligenceProgress(userId, progress = {}) {
  if (!userId) {
    throw new Error('No authenticated user found.')
  }

  const payload = {
    user_id: userId,
    item_type: progress.item_type || 'custom',
    item_id: progress.item_id || null,
    item_slug: progress.item_slug || null,
    status: progress.status || 'not_started',
    title: progress.title || null,
    reflection: progress.reflection || null,
    decision: progress.decision || null,
    evidence_url: progress.evidence_url || null,
    evidence_name: progress.evidence_name || null,
    metadata:
      progress.metadata &&
      typeof progress.metadata === 'object' &&
      !Array.isArray(progress.metadata)
        ? progress.metadata
        : {},
    completed_at:
      progress.status === 'complete'
        ? progress.completed_at || new Date().toISOString()
        : progress.completed_at || null,
  }

  if (progress.id) {
    const { data, error } = await supabase
      .from('founder_intelligence_progress')
      .update(payload)
      .eq('id', progress.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('founder_intelligence_progress')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function saveLibraryItemProgress(userId, item, progress = {}) {
  return saveFounderIntelligenceProgress(userId, {
    item_type: 'market_intelligence_item',
    item_id: item?.id || null,
    item_slug: item?.slug || null,
    title: progress.title || item?.title || null,
    ...progress,
  })
}

export async function getFounderIntelligenceEvidence(
  userId,
  progressId = null,
) {
  if (!userId) return []

  let query = supabase
    .from('founder_intelligence_evidence')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (progressId) query = query.eq('progress_id', progressId)

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

export async function saveFounderIntelligenceEvidence(
  userId,
  evidence = {},
) {
  if (!userId) {
    throw new Error('No authenticated user found.')
  }

  const payload = {
    user_id: userId,
    progress_id: evidence.progress_id || null,
    title: evidence.title || 'Untitled evidence',
    evidence_type: evidence.evidence_type || 'link',
    url: evidence.url || null,
    storage_path: evidence.storage_path || null,
    notes: evidence.notes || null,
    metadata:
      evidence.metadata &&
      typeof evidence.metadata === 'object' &&
      !Array.isArray(evidence.metadata)
        ? evidence.metadata
        : {},
  }

  if (evidence.id) {
    const { data, error } = await supabase
      .from('founder_intelligence_evidence')
      .update(payload)
      .eq('id', evidence.id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  const { data, error } = await supabase
    .from('founder_intelligence_evidence')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================================
// PERSONALISED WORKSPACE LOADER
// ============================================================

export async function loadVentureIntelligenceWorkspace({
  userId,
  stage = null,
  sectorTags = [],
} = {}) {
  if (!userId) {
    throw new Error('No authenticated user found.')
  }

  const profile = await getVentureIntelligenceProfile(userId)

  const filters = {
    countryCode: profile?.primary_country_code || null,
    regionCode: profile?.primary_region_code || null,
    stage,
    businessModelTags: profile?.revenue_model_tags || [],
    operatingModelTags: profile?.operating_model_tags || [],
    dependencyTags: profile?.dependency_tags || [],
    sectorTags,
  }

  const [
    country,
    canvas,
    progress,
    pestel,
    regulations,
    operatingChecks,
    documents,
    markers,
    cases,
  ] = await Promise.all([
    getMarketCountry(profile?.primary_country_code),
    getCurrentBusinessModelCanvas(userId),
    getFounderIntelligenceProgress(userId),
    getPestelIntelligence(filters),
    getRegulatoryChecks(filters),
    getOperatingChecks(filters),
    getReadinessDocumentTemplates(filters),
    getBusinessModelMarkers(filters),
    getCaseStudies(filters),
  ])

  return {
    profile,
    country,
    canvas,
    progress,
    filters,
    pestel,
    regulations,
    operatingChecks,
    documents,
    markers,
    cases,
  }
}

// ============================================================
// SELECT OPTIONS FOR THE SETUP AND EDIT FLOWS
// ============================================================

export const CUSTOMER_MODEL_OPTIONS = [
  { value: 'b2c', label: 'B2C — sell directly to consumers' },
  { value: 'b2b', label: 'B2B — sell to businesses' },
  {
    value: 'b2b2c',
    label: 'B2B2C — use a business partner to reach customers',
  },
  {
    value: 'b2g',
    label: 'B2G — work with public-sector buyers or programmes',
  },
  {
    value: 'marketplace',
    label: 'Marketplace — connect two sides of a market',
  },
  { value: 'multi_sided', label: 'Multi-sided platform' },
]

export const REVENUE_MODEL_OPTIONS = [
  { value: 'subscription', label: 'Subscription / recurring revenue' },
  { value: 'saas', label: 'SaaS licence' },
  { value: 'transaction_fee', label: 'Transaction or payment fee' },
  { value: 'commission', label: 'Commission / take rate' },
  { value: 'marketplace', label: 'Marketplace fees' },
  { value: 'lending', label: 'Lending / interest income' },
  { value: 'paygo', label: 'PAYGo / asset finance' },
  { value: 'licensing', label: 'Licensing or API revenue' },
  { value: 'services', label: 'Services / professional fees' },
  { value: 'advertising', label: 'Advertising / sponsorship' },
  {
    value: 'hybrid',
    label: 'Hybrid / more than one revenue stream',
  },
]

export const DISTRIBUTION_MODEL_OPTIONS = [
  { value: 'digital', label: 'Direct digital / self-service' },
  { value: 'enterprise_sales', label: 'Enterprise or B2B sales' },
  { value: 'partner_distribution', label: 'Partner distribution' },
  { value: 'agent_network', label: 'Agent network' },
  { value: 'retail', label: 'Retail / reseller network' },
  { value: 'field_sales', label: 'Field sales or field operations' },
  { value: 'mobile_ussd', label: 'Mobile app, SMS or USSD' },
  { value: 'platform_api', label: 'API / embedded distribution' },
  { value: 'hybrid', label: 'Hybrid distribution' },
]

export const OPERATING_MODEL_OPTIONS = [
  { value: 'digital', label: 'Digital product or service' },
  { value: 'physical_digital', label: 'Physical + digital delivery' },
  { value: 'agent_network', label: 'Agent-led operation' },
  { value: 'logistics', label: 'Logistics or fulfilment dependent' },
  { value: 'regulated', label: 'Regulated operation' },
  { value: 'asset_heavy', label: 'Asset-heavy operation' },
  { value: 'platform_api', label: 'Platform / API infrastructure' },
  { value: 'hybrid', label: 'Hybrid operating model' },
]

export const DEPENDENCY_OPTIONS = [
  { value: 'payments', label: 'Payment rails' },
  { value: 'collections', label: 'Collections or repayment' },
  { value: 'banking', label: 'Banks or settlement partners' },
  {
    value: 'telecom',
    label: 'Telecom or connectivity infrastructure',
  },
  { value: 'identity_kyc', label: 'Identity, KYC or verification' },
  { value: 'logistics', label: 'Logistics or fulfilment partners' },
  { value: 'retail', label: 'Retail or agent partners' },
  {
    value: 'government',
    label: 'Government or public-sector systems',
  },
  { value: 'data', label: 'External data or credit information' },
  { value: 'cross_border', label: 'Cross-border infrastructure' },
]

export const FINANCE_APPROACH_OPTIONS = [
  { value: 'bootstrapped', label: 'Bootstrapped / founder-funded' },
  { value: 'revenue_funded', label: 'Revenue-funded growth' },
  { value: 'grants', label: 'Grants or non-dilutive funding' },
  {
    value: 'impact_capital',
    label: 'Impact / development finance',
  },
  { value: 'debt', label: 'Debt or working-capital finance' },
  { value: 'equity', label: 'Equity investment' },
  { value: 'strategic', label: 'Strategic or corporate capital' },
  { value: 'hybrid', label: 'Hybrid funding approach' },
  { value: 'not_relevant_yet', label: 'Not relevant yet' },
]

// ============================================================
// NEW: FOUNDER BASE AND ENTITY-STRUCTURE OPTION SETS
// ============================================================

export const FOUNDER_BASE_OPTIONS = [
  {
    value: 'single_country',
    label: 'Based in one country',
    description:
      'The founder is primarily based and working from one country.',
  },
  {
    value: 'multi_country',
    label: 'Split between countries',
    description:
      'The founder regularly works or manages the venture across more than one country.',
  },
  {
    value: 'remote_digital_nomad',
    label: 'Remote / digital nomad',
    description:
      'The founder is mobile or works remotely across changing locations.',
  },
  {
    value: 'not_relevant',
    label: 'Not relevant to venture operations',
    description:
      'Founder location does not materially affect this venture context.',
  },
]

export const ENTITY_STRUCTURE_OPTIONS = [
  {
    value: 'not_incorporated',
    label: 'Not incorporated yet',
  },
  {
    value: 'local_operating_company',
    label: 'Local operating company',
  },
  {
    value: 'single_foreign_entity',
    label: 'Single foreign entity',
  },
  {
    value: 'parent_and_operating_subsidiary',
    label: 'Parent / holding company + operating subsidiary',
  },
  {
    value: 'multiple_operating_entities',
    label: 'Multiple operating entities',
  },
  {
    value: 'branch_or_representative_office',
    label: 'Branch or representative office',
  },
  {
    value: 'contractor_or_freelance_structure',
    label: 'Contractor / freelance structure',
  },
  {
    value: 'other',
    label: 'Other structure',
  },
  {
    value: 'not_sure',
    label: 'Not sure yet',
  },
]

export const ENTITY_REGISTRATION_CONTEXT_OPTIONS = [
  {
    value: 'local_incorporation',
    label: 'Local incorporation',
  },
  {
    value: 'estonia_e_residency',
    label: 'Estonia e-Residency',
  },
  {
    value: 'uk_company',
    label: 'United Kingdom company',
  },
  {
    value: 'us_company',
    label: 'United States company',
  },
  {
    value: 'other_foreign_incorporation',
    label: 'Other foreign incorporation',
  },
  {
    value: 'in_progress',
    label: 'Incorporation in progress',
  },
  {
    value: 'exploring',
    label: 'Exploring options',
  },
  {
    value: 'not_applicable',
    label: 'Not applicable',
  },
]

export const OPERATING_SCOPE_OPTIONS = [
  {
    value: 'local',
    label: 'One local market',
  },
  {
    value: 'regional',
    label: 'One region / several nearby markets',
  },
  {
    value: 'cross_border',
    label: 'Cross-border operation',
  },
  {
    value: 'global',
    label: 'Multiple regions / global ambition',
  },
]