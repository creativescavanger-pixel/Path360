export const MARKET_OPTIONS = [
  { id: 'global', label: 'Global / General' },
  { id: 'europe', label: 'Europe' },
  { id: 'africa', label: 'Africa' },
  { id: 'asia', label: 'Asia' },
]

export const MARKET_OVERLAYS = {
  global: {
    id: 'global',
    label: 'Global / General',
    description: 'Universal founder readiness lens with no special regional weighting.',
    dimensionAdjustments: {},
    extraQuestions: [
      {
        id: 'current_market',
        label: 'Current primary market',
        type: 'text',
        placeholder: 'e.g. UK, Kenya, UAE, Singapore, pan-African, global remote',
        helper: 'Where are you primarily operating today?',
      },
      {
        id: 'expansion_markets',
        label: 'Planned expansion markets',
        type: 'textarea',
        placeholder: 'List the next countries or regions you plan to enter and why.',
        helper: 'This helps tailor the go-to-market and investor-readiness diagnosis.',
      },
    ],
  },

  europe: {
    id: 'europe',
    label: 'Europe',
    description: 'Emphasises compliance, procurement, grants, and cross-border execution across fragmented markets.',
    dimensionAdjustments: {
      market_understanding: 1.08,
      execution_readiness: 1.06,
      financial_maturity: 1.04,
      investor_readiness: 1.02,
    },
    extraQuestions: [
      {
        id: 'eu_geography',
        label: 'Which European countries are you operating in or entering first?',
        type: 'textarea',
        placeholder: 'e.g. Germany first, then Netherlands and France through B2B pilots.',
      },
      {
        id: 'eu_regulatory_readiness',
        label: 'What regulatory, procurement, or compliance issues matter most to your growth?',
        type: 'textarea',
        placeholder: 'Mention GDPR, sector regulation, VAT, public procurement, certifications, etc.',
      },
      {
        id: 'eu_funding_fit',
        label: 'Are grants, public innovation programs, or corporate pilots part of your strategy?',
        type: 'textarea',
        placeholder: 'Explain whether public funding, EIC-type programs, or enterprise procurement matter.',
      },
    ],
  },

  africa: {
    id: 'africa',
    label: 'Africa',
    description: 'Emphasises distribution realities, payments, local partnerships, infrastructure, and FX constraints.',
    dimensionAdjustments: {
      execution_readiness: 1.08,
      growth_potential: 1.04,
      market_understanding: 1.06,
      risk_awareness: 1.08,
    },
    extraQuestions: [
      {
        id: 'africa_distribution',
        label: 'How do you reach customers in your market today?',
        type: 'textarea',
        placeholder: 'Describe online, offline, field sales, agents, resellers, partners, community channels, etc.',
      },
      {
        id: 'africa_payments_ops',
        label: 'What payment, logistics, FX, or infrastructure constraints affect your model?',
        type: 'textarea',
        placeholder: 'Explain collection issues, working capital, delivery barriers, FX, connectivity, etc.',
      },
      {
        id: 'africa_partnerships',
        label: 'Which local partnerships or trust channels matter most?',
        type: 'textarea',
        placeholder: 'Banks, telcos, aggregators, NGOs, community networks, distributors, etc.',
      },
    ],
  },

  asia: {
    id: 'asia',
    label: 'Asia',
    description: 'Emphasises country sequencing, localization, government enablement, and cross-market complexity.',
    dimensionAdjustments: {
      strategic_clarity: 1.03,
      market_understanding: 1.08,
      growth_potential: 1.06,
      investor_readiness: 1.03,
    },
    extraQuestions: [
      {
        id: 'asia_market_sequence',
        label: 'Which Asian markets are you prioritising first, and why in that order?',
        type: 'textarea',
        placeholder: 'e.g. Singapore for entry, then Indonesia for volume, then Japan for enterprise.',
      },
      {
        id: 'asia_localization',
        label: 'What localization is required for product, language, pricing, or channels?',
        type: 'textarea',
        placeholder: 'Explain how your offer changes across different Asian markets.',
      },
      {
        id: 'asia_govt_networks',
        label: 'Do government programs, local networks, or strategic partnerships matter to market entry?',
        type: 'textarea',
        placeholder: 'Explain whether public programs, local investors, or ecosystem partners are important.',
      },
    ],
  },
}

export function getMarketOption(id) {
  return MARKET_OPTIONS.find((item) => item.id === id) || MARKET_OPTIONS[0]
}

export function getMarketOverlay(id) {
  return MARKET_OVERLAYS[id] || MARKET_OVERLAYS.global
}

export default MARKET_OVERLAYS