// src/data/knowledgeResources.js
// PATH360 Knowledge Resource Centre.
// Resources are structured starting points. External links should be verified
// on the relevant official source before a founder relies on them.

export const KNOWLEDGE_RESOURCE_UPDATED_AT = '2026-08-21'

export const RESOURCE_AREAS = [
  { value: 'venture_building', label: 'Build the venture' },
  { value: 'capital_readiness', label: 'Raise and prepare' },
  { value: 'cross_border_operations', label: 'Operate across borders' },
  { value: 'market_ecosystem', label: 'Market and ecosystem' },
  { value: 'academy_companion', label: 'Academy companion' },
]

export const RESOURCE_TYPES = [
  { value: 'path360_guide', label: 'PATH360 guide' },
  { value: 'template', label: 'Template / worksheet' },
  { value: 'official_source', label: 'Official source' },
  { value: 'directory', label: 'Directory / database' },
  { value: 'learning_resource', label: 'Learning resource' },
]

export const RESOURCE_STAGES = [
  { value: 'idea', label: 'Idea' },
  { value: 'validation', label: 'Validation' },
  { value: 'mvp', label: 'MVP' },
  { value: 'traction', label: 'Traction' },
  { value: 'growth', label: 'Growth' },
]

export const RESOURCE_NEEDS = [
  { value: 'customer_discovery', label: 'Customer discovery' },
  { value: 'validation', label: 'Validation evidence' },
  { value: 'product', label: 'Product / MVP' },
  { value: 'growth', label: 'Growth and retention' },
  { value: 'funding', label: 'Funding readiness' },
  { value: 'market_entry', label: 'Market entry' },
  { value: 'compliance', label: 'Setup and compliance' },
  { value: 'operations', label: 'Operations and governance' },
  { value: 'ecosystem', label: 'Ecosystem support' },
]

export const KNOWLEDGE_RESOURCES = [
  {
    id: 'path360-customer-interview-planner',
    title: 'Customer Interview Planner',
    area: 'venture_building',
    type: 'template',
    stages: ['idea', 'validation'],
    needs: ['customer_discovery', 'validation'],
    countryCodes: [],
    summary:
      'A practical prompt set for planning non-leading conversations, recording observed behaviour, and deciding what evidence to collect next.',
    whyItMatters:
      'It helps founders avoid collecting polite encouragement when they need specific behavioural evidence.',
    actionLabel: 'Open Academy validation mission',
    actionPath: '/app/academy?stage=validation&mission=interview-without-pitching',
    sourceLabel: 'PATH360 Academy',
    sourceKind: 'internal',
    lastChecked: '2026-08-21',
  },
  {
    id: 'path360-opportunity-journal',
    title: 'Opportunity Journal',
    area: 'venture_building',
    type: 'template',
    stages: ['idea'],
    needs: ['customer_discovery', 'validation'],
    countryCodes: [],
    summary:
      'A guided workspace for capturing observed friction, workarounds, affected users, and the next question worth investigating.',
    whyItMatters:
      'The strongest early opportunities start with direct observation rather than a polished solution story.',
    actionLabel: 'Open Academy mission',
    actionPath: '/app/academy?stage=idea&mission=opportunity-foundations',
    sourceLabel: 'PATH360 Academy',
    sourceKind: 'internal',
    lastChecked: '2026-08-21',
  },
  {
    id: 'path360-mvp-roadmap',
    title: 'MVP Roadmap Card',
    area: 'venture_building',
    type: 'template',
    stages: ['mvp'],
    needs: ['product', 'validation'],
    countryCodes: [],
    summary:
      'A feature-subtraction exercise for defining the thinnest product experience that can deliver your core promise and create a useful learning loop.',
    whyItMatters:
      'It keeps an MVP focused on primary customer utility rather than a long list of features.',
    actionLabel: 'Open MVP mission',
    actionPath: '/app/academy?stage=mvp&mission=scope-minimum-utility',
    sourceLabel: 'PATH360 Academy',
    sourceKind: 'internal',
    lastChecked: '2026-08-21',
  },
  {
    id: 'path360-growth-signal-scorecard',
    title: 'Growth Signal Scorecard',
    area: 'venture_building',
    type: 'template',
    stages: ['traction', 'growth'],
    needs: ['growth', 'validation'],
    countryCodes: [],
    summary:
      'A decision tool for separating one-off customer wins from repeatable demand, retention, and referral signals.',
    whyItMatters:
      'It helps founders avoid scaling activity before they understand what customers repeatedly value.',
    actionLabel: 'Open traction mission',
    actionPath: '/app/academy?stage=traction&mission=ready-to-scale',
    sourceLabel: 'PATH360 Academy',
    sourceKind: 'internal',
    lastChecked: '2026-08-21',
  },
  {
    id: 'path360-operating-constraint-map',
    title: 'Operating Constraint Map',
    area: 'venture_building',
    type: 'template',
    stages: ['growth'],
    needs: ['operations', 'growth'],
    countryCodes: [],
    summary:
      'A guided way to identify founder dependency, clarify ownership, and make recurring decisions and workflows more repeatable.',
    whyItMatters:
      'Growth becomes harder when the founder remains the system for every recurring operating decision.',
    actionLabel: 'Open growth mission',
    actionPath: '/app/academy?stage=growth&mission=scale-systems',
    sourceLabel: 'PATH360 Academy',
    sourceKind: 'internal',
    lastChecked: '2026-08-21',
  },
  {
    id: 'path360-venture-intelligence',
    title: 'Venture Intelligence Workspace',
    area: 'venture_building',
    type: 'path360_guide',
    stages: ['idea', 'validation', 'mvp', 'traction', 'growth'],
    needs: ['validation', 'market_entry', 'operations'],
    countryCodes: [],
    summary:
      'Capture your business model, market, operating environment, dependencies, and the constraints shaping your next move.',
    whyItMatters:
      'The strongest recommendations depend on accurate venture and market context, not generic startup advice.',
    actionLabel: 'Open Venture Intelligence',
    actionPath: '/app/venture-intelligence',
    sourceLabel: 'PATH360 workspace',
    sourceKind: 'internal',
    lastChecked: '2026-08-21',
  },
  {
    id: 'path360-founder-diagnostic',
    title: 'Founder Diagnostic and Readiness Baseline',
    area: 'capital_readiness',
    type: 'path360_guide',
    stages: ['idea', 'validation', 'mvp', 'traction', 'growth'],
    needs: ['funding', 'operations', 'growth'],
    countryCodes: [],
    summary:
      'A structured readiness baseline that turns founder and venture context into priorities, vulnerability flags, and an Academy focus path.',
    whyItMatters:
      'It gives you a starting point for deciding what must be strengthened before you spend time on the wrong next step.',
    actionLabel: 'Open readiness baseline',
    actionPath: '/app/assessment',
    sourceLabel: 'PATH360 workspace',
    sourceKind: 'internal',
    lastChecked: '2026-08-21',
  },
  {
    id: 'path360-document-prep',
    title: 'Guided Document Preparation',
    area: 'capital_readiness',
    type: 'template',
    stages: ['validation', 'mvp', 'traction', 'growth'],
    needs: ['funding', 'operations'],
    countryCodes: [],
    summary:
      'Prepare structured inputs for founder documents, investor-facing materials, and venture narrative outputs before generating a final draft.',
    whyItMatters:
      'Strong documents rely on clear evidence and decisions; they should not be produced from vague prompts alone.',
    actionLabel: 'Open Creation Studio',
    actionPath: '/app/studio',
    sourceLabel: 'PATH360 workspace',
    sourceKind: 'internal',
    lastChecked: '2026-08-21',
  },
  {
    id: 'startup-genome-global',
    title: 'Startup Genome',
    area: 'market_ecosystem',
    type: 'directory',
    stages: ['idea', 'validation', 'mvp', 'traction', 'growth'],
    needs: ['ecosystem', 'market_entry', 'research'],
    countryCodes: [],
    summary:
      'Global ecosystem research, reports, and city-level startup ecosystem context.',
    whyItMatters:
      'Useful for comparing market narratives and identifying ecosystem-level questions to investigate before entering or expanding into a market.',
    actionLabel: 'Open official website',
    actionUrl: 'https://startupgenome.com/',
    sourceLabel: 'Official website',
    sourceKind: 'external',
    lastChecked: '2026-08-21',
  },
  {
    id: 'startupblink-global',
    title: 'StartupBlink Global Startup Ecosystem Map',
    area: 'market_ecosystem',
    type: 'directory',
    stages: ['idea', 'validation', 'mvp', 'traction', 'growth'],
    needs: ['ecosystem', 'market_entry', 'research'],
    countryCodes: [],
    summary:
      'A global startup ecosystem discovery platform with market, city, organisation, and ecosystem-ranking information.',
    whyItMatters:
      'Useful as one external research input when comparing market ecosystems, city hubs, and startup support landscapes.',
    actionLabel: 'Open website',
    actionUrl: 'https://www.startupblink.com/',
    sourceLabel: 'Official website',
    sourceKind: 'external',
    lastChecked: '2026-08-21',
  },
  {
    id: 'path360-ecosystem-explorer',
    title: 'PATH360 Startup Ecosystem Explorer',
    area: 'market_ecosystem',
    type: 'directory',
    stages: ['idea', 'validation', 'mvp', 'traction', 'growth'],
    needs: ['ecosystem', 'funding', 'market_entry'],
    countryCodes: [],
    summary:
      'Search startup organisations, communities, programmes, public support, and capital pathways across markets, then save a private shortlist.',
    whyItMatters:
      'It gives founders structured discovery without presenting directory entries as endorsements or recommendations.',
    actionLabel: 'Open ecosystem explorer',
    actionPath: '/app/environment/ecosystem',
    sourceLabel: 'PATH360 directory',
    sourceKind: 'internal',
    lastChecked: '2026-08-21',
  },
  {
    id: 'path360-country-explorer',
    title: 'Country, PESTEL, and Setup Explorer',
    area: 'cross_border_operations',
    type: 'path360_guide',
    stages: ['idea', 'validation', 'mvp', 'traction', 'growth'],
    needs: ['market_entry', 'compliance', 'ecosystem'],
    countryCodes: [],
    summary:
      'Browse country briefs, PESTEL signals, ecosystem resources, and practical setup questions without changing your primary venture context.',
    whyItMatters:
      'Market exploration is more useful when legal, operating, ecosystem, and external-force questions are separated clearly.',
    actionLabel: 'Explore markets',
    actionPath: '/app/environment',
    sourceLabel: 'PATH360 workspace',
    sourceKind: 'internal',
    lastChecked: '2026-08-21',
  },
  {
    id: 'world-bank-business-ready',
    title: 'World Bank Business Ready',
    area: 'cross_border_operations',
    type: 'official_source',
    stages: ['validation', 'mvp', 'traction', 'growth'],
    needs: ['compliance', 'market_entry', 'research'],
    countryCodes: [],
    summary:
      'World Bank project providing comparable information about the business environment and regulatory framework across economies.',
    whyItMatters:
      'Useful as an external reference point when forming questions about regulatory, operational, and market-entry conditions.',
    actionLabel: 'Open official source',
    actionUrl: 'https://www.worldbank.org/en/businessready',
    sourceLabel: 'World Bank',
    sourceKind: 'external',
    lastChecked: '2026-08-21',
  },
  {
    id: 'wipo-ip-portal',
    title: 'WIPO Intellectual Property Resources',
    area: 'cross_border_operations',
    type: 'official_source',
    stages: ['idea', 'validation', 'mvp', 'traction', 'growth'],
    needs: ['compliance', 'operations'],
    countryCodes: [],
    summary:
      'International intellectual-property information, resources, and links to national IP systems.',
    whyItMatters:
      'Useful when founders need to understand basic IP ownership, protection, and country-specific IP authority pathways.',
    actionLabel: 'Open official source',
    actionUrl: 'https://www.wipo.int/',
    sourceLabel: 'WIPO',
    sourceKind: 'external',
    lastChecked: '2026-08-21',
  },
  {
    id: 'ico-uk-data-protection',
    title: 'UK Information Commissioner’s Office',
    area: 'cross_border_operations',
    type: 'official_source',
    stages: ['mvp', 'traction', 'growth'],
    needs: ['compliance', 'operations'],
    countryCodes: ['GB'],
    summary:
      'Official UK regulator guidance for data protection, privacy, and related compliance responsibilities.',
    whyItMatters:
      'Useful for ventures operating in or serving the UK when they need a primary source for data-protection questions.',
    actionLabel: 'Open official source',
    actionUrl: 'https://ico.org.uk/',
    sourceLabel: 'Official regulator',
    sourceKind: 'external',
    lastChecked: '2026-08-21',
  },
  {
    id: 'sba-us-start',
    title: 'U.S. Small Business Administration',
    area: 'cross_border_operations',
    type: 'official_source',
    stages: ['idea', 'validation', 'mvp', 'traction', 'growth'],
    needs: ['compliance', 'funding', 'market_entry'],
    countryCodes: ['US'],
    summary:
      'Official US small-business resources covering startup guidance, financing programmes, contracting, and business support.',
    whyItMatters:
      'A primary source for founders researching the US operating environment and small-business support pathways.',
    actionLabel: 'Open official source',
    actionUrl: 'https://www.sba.gov/',
    sourceLabel: 'Official website',
    sourceKind: 'external',
    lastChecked: '2026-08-21',
  },
  {
    id: 'innovate-uk',
    title: 'Innovate UK',
    area: 'capital_readiness',
    type: 'official_source',
    stages: ['validation', 'mvp', 'traction', 'growth'],
    needs: ['funding', 'product', 'market_entry'],
    countryCodes: ['GB'],
    summary:
      'UK innovation agency resources covering innovation funding, commercialisation, and business-growth support.',
    whyItMatters:
      'Useful for UK-based ventures and founders investigating official innovation support and funding pathways.',
    actionLabel: 'Open official source',
    actionUrl: 'https://www.ukri.org/councils/innovate-uk/',
    sourceLabel: 'Official website',
    sourceKind: 'external',
    lastChecked: '2026-08-21',
  },
  {
    id: 'startup-sg',
    title: 'Startup SG',
    area: 'capital_readiness',
    type: 'official_source',
    stages: ['idea', 'validation', 'mvp', 'traction', 'growth'],
    needs: ['funding', 'market_entry', 'ecosystem'],
    countryCodes: ['SG'],
    summary:
      'Singapore government initiative connecting founders with grants, startup support schemes, programmes, and ecosystem information.',
    whyItMatters:
      'A primary source for founders researching official startup support and market-entry pathways in Singapore.',
    actionLabel: 'Open official source',
    actionUrl: 'https://www.startupsg.gov.sg/',
    sourceLabel: 'Official website',
    sourceKind: 'external',
    lastChecked: '2026-08-21',
  },
  {
    id: 'startup-india',
    title: 'Startup India',
    area: 'capital_readiness',
    type: 'official_source',
    stages: ['idea', 'validation', 'mvp', 'traction', 'growth'],
    needs: ['funding', 'compliance', 'market_entry'],
    countryCodes: ['IN'],
    summary:
      'Government initiative offering startup recognition, policy information, funding pathways, and founder support resources.',
    whyItMatters:
      'A starting point for founders investigating startup support, recognition, and policy-related resources in India.',
    actionLabel: 'Open official source',
    actionUrl: 'https://www.startupindia.gov.in/',
    sourceLabel: 'Official website',
    sourceKind: 'external',
    lastChecked: '2026-08-21',
  },
  {
    id: 'academy-customer-discovery-reading',
    title: 'Customer Discovery and Startup Interviews',
    area: 'academy_companion',
    type: 'learning_resource',
    stages: ['idea', 'validation'],
    needs: ['customer_discovery', 'validation'],
    countryCodes: [],
    summary:
      'A curated external learning entry for strengthening founder interviews and customer-discovery practice.',
    whyItMatters:
      'Useful when a founder needs to design a better conversation and avoid pitching before understanding the customer context.',
    actionLabel: 'Open learning resource',
    actionUrl: 'https://www.lumi.studio/blog/how-to-interview-customers-guide-for-startup-founders',
    sourceLabel: 'External learning resource',
    sourceKind: 'external',
    lastChecked: '2026-08-21',
  },
]

export function getKnowledgeResourceLabel(value, options) {
  return options.find((option) => option.value === value)?.label || value
}

export function getKnowledgeResources({
  query = '',
  area = '',
  type = '',
  stage = '',
  need = '',
  countryCode = '',
} = {}) {
  const safeQuery = String(query || '').trim().toLowerCase()
  const safeCountryCode = String(countryCode || '').trim().toUpperCase()

  return KNOWLEDGE_RESOURCES.filter((resource) => {
    if (area && resource.area !== area) return false
    if (type && resource.type !== type) return false
    if (stage && !(resource.stages || []).includes(stage)) return false
    if (need && !(resource.needs || []).includes(need)) return false

    if (
      safeCountryCode &&
      Array.isArray(resource.countryCodes) &&
      resource.countryCodes.length > 0 &&
      !resource.countryCodes.includes(safeCountryCode)
    ) {
      return false
    }

    if (!safeQuery) return true

    const haystack = [
      resource.title,
      resource.area,
      resource.type,
      resource.summary,
      resource.whyItMatters,
      ...(resource.stages || []),
      ...(resource.needs || []),
      ...(resource.countryCodes || []),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(safeQuery)
  }).sort((a, b) => a.title.localeCompare(b.title))
}