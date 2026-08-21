// src/lib/countryCatalogue.js
// Global, founder-relevant country and jurisdiction catalogue.
// This catalogue is intentionally separate from country-specific intelligence.
// Every record can be browsed and searched; richer legal, PESTEL, ecosystem,
// and setup content belongs in countryIntelligence.js as it is verified.

export const COVERAGE_LEVELS = {
  FOUNDATIONAL: 'foundational',
  CURATED: 'curated',
  DEEP_DIVE: 'deep_dive',
}

export const COVERAGE_LABELS = {
  [COVERAGE_LEVELS.FOUNDATIONAL]: 'Foundational coverage',
  [COVERAGE_LEVELS.CURATED]: 'Curated coverage',
  [COVERAGE_LEVELS.DEEP_DIVE]: 'PATH360 deep dive',
}

export const COVERAGE_DESCRIPTIONS = {
  [COVERAGE_LEVELS.FOUNDATIONAL]:
    'Core founder context and trusted starting points. Detailed local guidance is being expanded.',
  [COVERAGE_LEVELS.CURATED]:
    'Selected founder context, official starting points, and practical country resources.',
  [COVERAGE_LEVELS.DEEP_DIVE]:
    'Country brief, PESTEL signals, startup ecosystem context, and practical setup guidance.',
}

export const REGION_ORDER = [
  'Africa',
  'Asia-Pacific',
  'Caribbean',
  'Central America',
  'Europe',
  'Middle East',
  'North America',
  'Oceania',
  'South America',
]

const DEEP_DIVE_SLUGS = new Set([
  'kenya',
  'nigeria',
  'south-africa',
  'rwanda',
  'uganda',
  'tanzania',
  'ghana',
  'egypt',
  'united-states',
  'united-kingdom',
  'canada',
  'germany',
  'netherlands',
  'france',
  'ireland',
  'estonia',
  'switzerland',
  'singapore',
  'united-arab-emirates',
  'saudi-arabia',
  'india',
  'japan',
  'south-korea',
  'israel',
  'australia',
  'brazil',
  'mexico',
  'colombia',
  'chile',
  'indonesia',
  'malaysia',
  'philippines',
  'vietnam',
  'hong-kong',
  'taiwan',
])

const CURATED_SLUGS = new Set([
  'cayman-islands',
  'british-virgin-islands',
  'bermuda',
  'jersey',
  'guernsey',
  'isle-of-man',
  'mauritius',
  'cyprus',
  'malta',
  'luxembourg',
  'liechtenstein',
  'gibraltar',
  'puerto-rico',
  'curacao',
  'bahamas',
  'panama',
  'seychelles',
  'botswana',
  'morocco',
  'tunisia',
  'senegal',
  'ethiopia',
  'zambia',
  'zimbabwe',
  'angola',
  'mozambique',
  'pakistan',
  'bangladesh',
  'sri-lanka',
  'thailand',
  'new-zealand',
  'turkey',
  'poland',
  'spain',
  'portugal',
  'sweden',
  'denmark',
  'norway',
  'finland',
  'belgium',
  'austria',
  'italy',
  'czechia',
  'romania',
  'greece',
  'qatar',
  'bahrain',
  'oman',
  'jordan',
  'taiwan',
  'macau',
])

const FEATURED_SLUGS = new Set([
  'kenya',
  'united-states',
  'united-kingdom',
  'nigeria',
  'south-africa',
  'rwanda',
  'germany',
  'netherlands',
  'singapore',
  'united-arab-emirates',
  'india',
  'canada',
  'japan',
  'australia',
  'brazil',
  'mexico',
  'hong-kong',
])

const INCORPORATION_RELEVANT_SLUGS = new Set([
  'united-states',
  'united-kingdom',
  'singapore',
  'estonia',
  'united-arab-emirates',
  'hong-kong',
  'cayman-islands',
  'british-virgin-islands',
  'bermuda',
  'jersey',
  'guernsey',
  'isle-of-man',
  'mauritius',
  'cyprus',
  'malta',
  'ireland',
  'luxembourg',
  'netherlands',
  'switzerland',
  'liechtenstein',
  'gibraltar',
  'panama',
  'seychelles',
  'bahamas',
  'curacao',
  'puerto-rico',
])

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function resolveCoverage(slug) {
  if (DEEP_DIVE_SLUGS.has(slug)) return COVERAGE_LEVELS.DEEP_DIVE
  if (CURATED_SLUGS.has(slug)) return COVERAGE_LEVELS.CURATED
  return COVERAGE_LEVELS.FOUNDATIONAL
}

function makeCountry({
  code,
  name,
  region,
  subregion,
  kind = 'sovereign_state',
  aliases = [],
  incorporationRelevant = false,
  startupRelevant = true,
}) {
  const slug = slugify(name)
  const coverage = resolveCoverage(slug)

  return {
    code,
    slug,
    name,
    region,
    subregion,
    kind,
    aliases,
    coverage,
    featured: FEATURED_SLUGS.has(slug),
    startupRelevant,
    incorporationRelevant:
      incorporationRelevant || INCORPORATION_RELEVANT_SLUGS.has(slug),
  }
}

const AFRICA = [
  ['DZ', 'Algeria', 'North Africa'],
  ['AO', 'Angola', 'Central Africa'],
  ['BJ', 'Benin', 'West Africa'],
  ['BW', 'Botswana', 'Southern Africa'],
  ['BF', 'Burkina Faso', 'West Africa'],
  ['BI', 'Burundi', 'East Africa'],
  ['CV', 'Cabo Verde', 'West Africa', ['Cape Verde']],
  ['CM', 'Cameroon', 'Central Africa'],
  ['CF', 'Central African Republic', 'Central Africa'],
  ['TD', 'Chad', 'Central Africa'],
  ['KM', 'Comoros', 'East Africa'],
  ['CD', 'Democratic Republic of the Congo', 'Central Africa', ['DR Congo', 'Congo-Kinshasa']],
  ['CG', 'Republic of the Congo', 'Central Africa', ['Congo', 'Congo-Brazzaville']],
  ['CI', "Cote d'Ivoire", 'West Africa', ['Ivory Coast', 'Côte d’Ivoire']],
  ['DJ', 'Djibouti', 'East Africa'],
  ['EG', 'Egypt', 'North Africa'],
  ['GQ', 'Equatorial Guinea', 'Central Africa'],
  ['ER', 'Eritrea', 'East Africa'],
  ['SZ', 'Eswatini', 'Southern Africa', ['Swaziland']],
  ['ET', 'Ethiopia', 'East Africa'],
  ['GA', 'Gabon', 'Central Africa'],
  ['GM', 'Gambia', 'West Africa', ['The Gambia']],
  ['GH', 'Ghana', 'West Africa'],
  ['GN', 'Guinea', 'West Africa'],
  ['GW', 'Guinea-Bissau', 'West Africa'],
  ['KE', 'Kenya', 'East Africa'],
  ['LS', 'Lesotho', 'Southern Africa'],
  ['LR', 'Liberia', 'West Africa'],
  ['LY', 'Libya', 'North Africa'],
  ['MG', 'Madagascar', 'East Africa'],
  ['MW', 'Malawi', 'East Africa'],
  ['ML', 'Mali', 'West Africa'],
  ['MR', 'Mauritania', 'West Africa'],
  ['MU', 'Mauritius', 'East Africa', [], true],
  ['MA', 'Morocco', 'North Africa'],
  ['MZ', 'Mozambique', 'East Africa'],
  ['NA', 'Namibia', 'Southern Africa'],
  ['NE', 'Niger', 'West Africa'],
  ['NG', 'Nigeria', 'West Africa'],
  ['RW', 'Rwanda', 'East Africa'],
  ['ST', 'Sao Tome and Principe', 'Central Africa', ['São Tomé and Príncipe']],
  ['SN', 'Senegal', 'West Africa'],
  ['SC', 'Seychelles', 'East Africa', [], true],
  ['SL', 'Sierra Leone', 'West Africa'],
  ['SO', 'Somalia', 'East Africa'],
  ['ZA', 'South Africa', 'Southern Africa'],
  ['SS', 'South Sudan', 'East Africa'],
  ['SD', 'Sudan', 'North Africa'],
  ['TZ', 'Tanzania', 'East Africa'],
  ['TG', 'Togo', 'West Africa'],
  ['TN', 'Tunisia', 'North Africa'],
  ['UG', 'Uganda', 'East Africa'],
  ['ZM', 'Zambia', 'East Africa'],
  ['ZW', 'Zimbabwe', 'Southern Africa'],
]

const ASIA_PACIFIC = [
  ['AF', 'Afghanistan', 'South Asia'],
  ['BD', 'Bangladesh', 'South Asia'],
  ['BT', 'Bhutan', 'South Asia'],
  ['BN', 'Brunei', 'South-East Asia'],
  ['KH', 'Cambodia', 'South-East Asia'],
  ['CN', 'China', 'East Asia'],
  ['TL', 'Timor-Leste', 'South-East Asia', ['East Timor']],
  ['IN', 'India', 'South Asia'],
  ['ID', 'Indonesia', 'South-East Asia'],
  ['JP', 'Japan', 'East Asia'],
  ['KZ', 'Kazakhstan', 'Central Asia'],
  ['KP', 'North Korea', 'East Asia', ['Democratic People’s Republic of Korea']],
  ['KR', 'South Korea', 'East Asia', ['Republic of Korea', 'Korea']],
  ['KG', 'Kyrgyzstan', 'Central Asia'],
  ['LA', 'Laos', 'South-East Asia', ['Lao PDR']],
  ['MY', 'Malaysia', 'South-East Asia'],
  ['MV', 'Maldives', 'South Asia'],
  ['MN', 'Mongolia', 'East Asia'],
  ['MM', 'Myanmar', 'South-East Asia', ['Burma']],
  ['NP', 'Nepal', 'South Asia'],
  ['PK', 'Pakistan', 'South Asia'],
  ['PH', 'Philippines', 'South-East Asia'],
  ['SG', 'Singapore', 'South-East Asia', [], true],
  ['LK', 'Sri Lanka', 'South Asia'],
  ['TW', 'Taiwan', 'East Asia', ['Republic of China'], true, true],
  ['TJ', 'Tajikistan', 'Central Asia'],
  ['TH', 'Thailand', 'South-East Asia'],
  ['TM', 'Turkmenistan', 'Central Asia'],
  ['UZ', 'Uzbekistan', 'Central Asia'],
  ['VN', 'Vietnam', 'South-East Asia'],
]

const CARIBBEAN = [
  ['AG', 'Antigua and Barbuda', 'Caribbean'],
  ['BS', 'Bahamas', 'Caribbean', [], true],
  ['BB', 'Barbados', 'Caribbean'],
  ['CU', 'Cuba', 'Caribbean'],
  ['DM', 'Dominica', 'Caribbean'],
  ['DO', 'Dominican Republic', 'Caribbean'],
  ['GD', 'Grenada', 'Caribbean'],
  ['HT', 'Haiti', 'Caribbean'],
  ['JM', 'Jamaica', 'Caribbean'],
  ['KN', 'Saint Kitts and Nevis', 'Caribbean'],
  ['LC', 'Saint Lucia', 'Caribbean'],
  ['VC', 'Saint Vincent and the Grenadines', 'Caribbean'],
  ['TT', 'Trinidad and Tobago', 'Caribbean'],
]

const CENTRAL_AMERICA = [
  ['BZ', 'Belize', 'Central America'],
  ['CR', 'Costa Rica', 'Central America'],
  ['SV', 'El Salvador', 'Central America'],
  ['GT', 'Guatemala', 'Central America'],
  ['HN', 'Honduras', 'Central America'],
  ['NI', 'Nicaragua', 'Central America'],
  ['PA', 'Panama', 'Central America', [], true],
]

const EUROPE = [
  ['AL', 'Albania', 'Southern Europe'],
  ['AD', 'Andorra', 'Southern Europe'],
  ['AM', 'Armenia', 'Eastern Europe'],
  ['AT', 'Austria', 'Western Europe'],
  ['AZ', 'Azerbaijan', 'Eastern Europe'],
  ['BY', 'Belarus', 'Eastern Europe'],
  ['BE', 'Belgium', 'Western Europe'],
  ['BA', 'Bosnia and Herzegovina', 'Southern Europe'],
  ['BG', 'Bulgaria', 'Eastern Europe'],
  ['HR', 'Croatia', 'Southern Europe'],
  ['CY', 'Cyprus', 'Southern Europe', [], true],
  ['CZ', 'Czechia', 'Eastern Europe', ['Czech Republic']],
  ['DK', 'Denmark', 'Northern Europe'],
  ['EE', 'Estonia', 'Northern Europe', [], true],
  ['FI', 'Finland', 'Northern Europe'],
  ['FR', 'France', 'Western Europe'],
  ['GE', 'Georgia', 'Eastern Europe'],
  ['DE', 'Germany', 'Western Europe'],
  ['GR', 'Greece', 'Southern Europe'],
  ['VA', 'Holy See', 'Southern Europe', ['Vatican City', 'Vatican']],
  ['HU', 'Hungary', 'Eastern Europe'],
  ['IS', 'Iceland', 'Northern Europe'],
  ['IE', 'Ireland', 'Northern Europe', [], true],
  ['IT', 'Italy', 'Southern Europe'],
  ['XK', 'Kosovo', 'Southern Europe'],
  ['LV', 'Latvia', 'Northern Europe'],
  ['LI', 'Liechtenstein', 'Western Europe', [], true],
  ['LT', 'Lithuania', 'Northern Europe'],
  ['LU', 'Luxembourg', 'Western Europe', [], true],
  ['MT', 'Malta', 'Southern Europe', [], true],
  ['MD', 'Moldova', 'Eastern Europe'],
  ['MC', 'Monaco', 'Western Europe'],
  ['ME', 'Montenegro', 'Southern Europe'],
  ['NL', 'Netherlands', 'Western Europe', [], true],
  ['MK', 'North Macedonia', 'Southern Europe'],
  ['NO', 'Norway', 'Northern Europe'],
  ['PL', 'Poland', 'Eastern Europe'],
  ['PT', 'Portugal', 'Southern Europe'],
  ['RO', 'Romania', 'Eastern Europe'],
  ['RU', 'Russia', 'Eastern Europe', ['Russian Federation']],
  ['SM', 'San Marino', 'Southern Europe'],
  ['RS', 'Serbia', 'Southern Europe'],
  ['SK', 'Slovakia', 'Eastern Europe'],
  ['SI', 'Slovenia', 'Southern Europe'],
  ['ES', 'Spain', 'Southern Europe'],
  ['SE', 'Sweden', 'Northern Europe'],
  ['CH', 'Switzerland', 'Western Europe', [], true],
  ['TR', 'Turkey', 'Eastern Europe', ['Türkiye']],
  ['UA', 'Ukraine', 'Eastern Europe'],
  ['GB', 'United Kingdom', 'Northern Europe', ['UK', 'Great Britain', 'Britain'], true],
]

const MIDDLE_EAST = [
  ['BH', 'Bahrain', 'Middle East'],
  ['IQ', 'Iraq', 'Middle East'],
  ['IL', 'Israel', 'Middle East'],
  ['JO', 'Jordan', 'Middle East'],
  ['KW', 'Kuwait', 'Middle East'],
  ['LB', 'Lebanon', 'Middle East'],
  ['OM', 'Oman', 'Middle East'],
  ['PS', 'Palestine', 'Middle East', ['State of Palestine']],
  ['QA', 'Qatar', 'Middle East'],
  ['SA', 'Saudi Arabia', 'Middle East'],
  ['SY', 'Syria', 'Middle East', ['Syrian Arab Republic']],
  ['AE', 'United Arab Emirates', 'Middle East', ['UAE'], true],
  ['YE', 'Yemen', 'Middle East'],
]

const NORTH_AMERICA = [
  ['CA', 'Canada', 'North America'],
  ['MX', 'Mexico', 'North America'],
  ['US', 'United States', 'North America', ['United States of America', 'USA', 'US'], true],
]

const OCEANIA = [
  ['AU', 'Australia', 'Australia and New Zealand'],
  ['FJ', 'Fiji', 'Melanesia'],
  ['KI', 'Kiribati', 'Micronesia'],
  ['MH', 'Marshall Islands', 'Micronesia'],
  ['FM', 'Micronesia', 'Micronesia', ['Federated States of Micronesia']],
  ['NR', 'Nauru', 'Micronesia'],
  ['NZ', 'New Zealand', 'Australia and New Zealand'],
  ['PW', 'Palau', 'Micronesia'],
  ['PG', 'Papua New Guinea', 'Melanesia'],
  ['WS', 'Samoa', 'Polynesia'],
  ['SB', 'Solomon Islands', 'Melanesia'],
  ['TO', 'Tonga', 'Polynesia'],
  ['TV', 'Tuvalu', 'Polynesia'],
  ['VU', 'Vanuatu', 'Melanesia'],
]

const SOUTH_AMERICA = [
  ['AR', 'Argentina', 'South America'],
  ['BO', 'Bolivia', 'South America'],
  ['BR', 'Brazil', 'South America'],
  ['CL', 'Chile', 'South America'],
  ['CO', 'Colombia', 'South America'],
  ['EC', 'Ecuador', 'South America'],
  ['GY', 'Guyana', 'South America'],
  ['PY', 'Paraguay', 'South America'],
  ['PE', 'Peru', 'South America'],
  ['SR', 'Suriname', 'South America'],
  ['UY', 'Uruguay', 'South America'],
  ['VE', 'Venezuela', 'South America'],
]

const TERRITORIES_AND_JURISDICTIONS = [
  {
    code: 'HK',
    name: 'Hong Kong',
    region: 'Asia-Pacific',
    subregion: 'East Asia',
    kind: 'special_administrative_region',
    aliases: ['Hong Kong SAR'],
    incorporationRelevant: true,
  },
  {
    code: 'MO',
    name: 'Macau',
    region: 'Asia-Pacific',
    subregion: 'East Asia',
    kind: 'special_administrative_region',
    aliases: ['Macao', 'Macau SAR'],
  },
  {
    code: 'AI',
    name: 'Anguilla',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'overseas_territory',
  },
  {
    code: 'AW',
    name: 'Aruba',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'constituent_country',
  },
  {
    code: 'BM',
    name: 'Bermuda',
    region: 'Caribbean',
    subregion: 'North Atlantic',
    kind: 'overseas_territory',
    incorporationRelevant: true,
  },
  {
    code: 'VG',
    name: 'British Virgin Islands',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'overseas_territory',
    aliases: ['BVI'],
    incorporationRelevant: true,
  },
  {
    code: 'KY',
    name: 'Cayman Islands',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'overseas_territory',
    incorporationRelevant: true,
  },
  {
    code: 'CW',
    name: 'Curacao',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'constituent_country',
    aliases: ['Curaçao'],
    incorporationRelevant: true,
  },
  {
    code: 'GP',
    name: 'Guadeloupe',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'overseas_department',
  },
  {
    code: 'MQ',
    name: 'Martinique',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'overseas_department',
  },
  {
    code: 'MS',
    name: 'Montserrat',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'overseas_territory',
  },
  {
    code: 'PR',
    name: 'Puerto Rico',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'unincorporated_territory',
    incorporationRelevant: true,
  },
  {
    code: 'BL',
    name: 'Saint Barthelemy',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'overseas_collectivity',
    aliases: ['Saint Barthélemy', 'St. Barts'],
  },
  {
    code: 'MF',
    name: 'Saint Martin',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'overseas_collectivity',
  },
  {
    code: 'TC',
    name: 'Turks and Caicos Islands',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'overseas_territory',
  },
  {
    code: 'VI',
    name: 'United States Virgin Islands',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'unincorporated_territory',
    aliases: ['US Virgin Islands', 'USVI'],
  },
  {
    code: 'GI',
    name: 'Gibraltar',
    region: 'Europe',
    subregion: 'Southern Europe',
    kind: 'overseas_territory',
    incorporationRelevant: true,
  },
  {
    code: 'GG',
    name: 'Guernsey',
    region: 'Europe',
    subregion: 'Northern Europe',
    kind: 'crown_dependency',
    incorporationRelevant: true,
  },
  {
    code: 'IM',
    name: 'Isle of Man',
    region: 'Europe',
    subregion: 'Northern Europe',
    kind: 'crown_dependency',
    incorporationRelevant: true,
  },
  {
    code: 'JE',
    name: 'Jersey',
    region: 'Europe',
    subregion: 'Northern Europe',
    kind: 'crown_dependency',
    incorporationRelevant: true,
  },
  {
    code: 'AX',
    name: 'Aland Islands',
    region: 'Europe',
    subregion: 'Northern Europe',
    kind: 'autonomous_region',
    aliases: ['Åland Islands'],
  },
  {
    code: 'FO',
    name: 'Faroe Islands',
    region: 'Europe',
    subregion: 'Northern Europe',
    kind: 'autonomous_territory',
  },
  {
    code: 'GL',
    name: 'Greenland',
    region: 'North America',
    subregion: 'North America',
    kind: 'autonomous_territory',
  },
  {
    code: 'GF',
    name: 'French Guiana',
    region: 'South America',
    subregion: 'South America',
    kind: 'overseas_department',
  },
  {
    code: 'NC',
    name: 'New Caledonia',
    region: 'Oceania',
    subregion: 'Melanesia',
    kind: 'special_collectivity',
  },
  {
    code: 'PF',
    name: 'French Polynesia',
    region: 'Oceania',
    subregion: 'Polynesia',
    kind: 'overseas_collectivity',
  },
  {
    code: 'RE',
    name: 'Reunion',
    region: 'Africa',
    subregion: 'East Africa',
    kind: 'overseas_department',
    aliases: ['Réunion'],
  },
  {
    code: 'YT',
    name: 'Mayotte',
    region: 'Africa',
    subregion: 'East Africa',
    kind: 'overseas_department',
  },
  {
    code: 'GU',
    name: 'Guam',
    region: 'Oceania',
    subregion: 'Micronesia',
    kind: 'unincorporated_territory',
  },
  {
    code: 'MP',
    name: 'Northern Mariana Islands',
    region: 'Oceania',
    subregion: 'Micronesia',
    kind: 'unincorporated_territory',
  },
  {
    code: 'AS',
    name: 'American Samoa',
    region: 'Oceania',
    subregion: 'Polynesia',
    kind: 'unincorporated_territory',
  },
  {
    code: 'BQ',
    name: 'Caribbean Netherlands',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'special_municipality',
    aliases: ['Bonaire, Sint Eustatius and Saba'],
  },
  {
    code: 'SX',
    name: 'Sint Maarten',
    region: 'Caribbean',
    subregion: 'Caribbean',
    kind: 'constituent_country',
  },
  {
    code: 'PM',
    name: 'Saint Pierre and Miquelon',
    region: 'North America',
    subregion: 'North America',
    kind: 'overseas_collectivity',
  },
]

function toCountryRecords(rows, region) {
  return rows.map(([code, name, subregion, aliases = [], incorporationRelevant = false]) =>
    makeCountry({
      code,
      name,
      region,
      subregion,
      aliases,
      incorporationRelevant,
    }),
  )
}

export const COUNTRY_CATALOGUE = [
  ...toCountryRecords(AFRICA, 'Africa'),
  ...toCountryRecords(ASIA_PACIFIC, 'Asia-Pacific'),
  ...toCountryRecords(CARIBBEAN, 'Caribbean'),
  ...toCountryRecords(CENTRAL_AMERICA, 'Central America'),
  ...toCountryRecords(EUROPE, 'Europe'),
  ...toCountryRecords(MIDDLE_EAST, 'Middle East'),
  ...toCountryRecords(NORTH_AMERICA, 'North America'),
  ...toCountryRecords(OCEANIA, 'Oceania'),
  ...toCountryRecords(SOUTH_AMERICA, 'South America'),
  ...TERRITORIES_AND_JURISDICTIONS.map((country) => makeCountry(country)),
].sort((a, b) => a.name.localeCompare(b.name))

export function getCountryBySlug(slug) {
  const safeSlug = slugify(slug)
  return COUNTRY_CATALOGUE.find((country) => country.slug === safeSlug) || null
}

export function getCountryByCode(code) {
  const safeCode = String(code || '').trim().toUpperCase()
  return COUNTRY_CATALOGUE.find((country) => country.code === safeCode) || null
}

export function getCountriesByRegion(region) {
  const safeRegion = String(region || '').trim().toLowerCase()
  if (!safeRegion) return []

  return COUNTRY_CATALOGUE.filter(
    (country) => country.region.toLowerCase() === safeRegion,
  )
}

export function getFeaturedCountries() {
  return COUNTRY_CATALOGUE.filter((country) => country.featured)
}

export function getCountriesByCoverage(coverage) {
  return COUNTRY_CATALOGUE.filter((country) => country.coverage === coverage)
}

export function getIncorporationJurisdictions() {
  return COUNTRY_CATALOGUE.filter((country) => country.incorporationRelevant)
}

export function searchCountries(query, options = {}) {
  const search = String(query || '').trim().toLowerCase()
  const region = String(options.region || '').trim().toLowerCase()
  const coverage = String(options.coverage || '').trim().toLowerCase()
  const incorporationOnly = Boolean(options.incorporationOnly)
  const limit = Number(options.limit || 0)

  let results = COUNTRY_CATALOGUE.filter((country) => {
    if (region && country.region.toLowerCase() !== region) return false
    if (coverage && country.coverage !== coverage) return false
    if (incorporationOnly && !country.incorporationRelevant) return false

    if (!search) return true

    const haystack = [
      country.name,
      country.code,
      country.slug,
      country.region,
      country.subregion,
      ...(country.aliases || []),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })

  results = results.sort((a, b) => {
    const aExact = a.name.toLowerCase() === search ? 1 : 0
    const bExact = b.name.toLowerCase() === search ? 1 : 0
    if (aExact !== bExact) return bExact - aExact

    const aStarts = a.name.toLowerCase().startsWith(search) ? 1 : 0
    const bStarts = b.name.toLowerCase().startsWith(search) ? 1 : 0
    if (aStarts !== bStarts) return bStarts - aStarts

    if (a.featured !== b.featured) return a.featured ? -1 : 1

    return a.name.localeCompare(b.name)
  })

  return limit > 0 ? results.slice(0, limit) : results
}

export function getCountryCoverageLabel(coverage) {
  return COVERAGE_LABELS[coverage] || COVERAGE_LABELS.foundational
}

export function getCountryCoverageDescription(coverage) {
  return COVERAGE_DESCRIPTIONS[coverage] || COVERAGE_DESCRIPTIONS.foundational
}

export function formatCountryRegion(country) {
  if (!country) return ''
  return country.subregion
    ? `${country.subregion} · ${country.region}`
    : country.region
}

export function getCountryFlag(code) {
  const safeCode = String(code || '').trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(safeCode)) return '🌐'

  return String.fromCodePoint(
    ...safeCode.split('').map((letter) => 127397 + letter.charCodeAt(0)),
  )
}