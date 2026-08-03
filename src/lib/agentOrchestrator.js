import { callOpenAI, callOpenAIStream } from './openaiClient.js'

const DEFAULT_MODEL =
  import.meta.env.VITE_DEFAULT_LLM_MODEL ||
  import.meta.env.VITE_OPENAI_MODEL ||
  'gpt-4o-mini'

// Global feature flag: AI is only used when this is "true"
const AI_ENABLED = import.meta.env.VITE_AI_ENABLED === 'true'

const AGENTS = {
  venture_strategist: {
    name: 'Venture Strategist',
    model: DEFAULT_MODEL,
    systemPrompt: `You are the Venture Strategist agent for PATH360 — an institutional AI venture advisor. You think like a combination of a YC partner and a McKinsey strategy consultant.
Your expertise: venture diagnostics, go-to-market strategy, competitive positioning, scaling readiness, execution analysis, strategic prioritisation.
Personality: analytical, direct, evidence-based. Never motivational or fluffy. Never use startup clichés. Lead with the most important insight first.
Always reference the founder's specific situation. Ask clarifying questions when needed.
Maximum response length: 4-5 sentences unless asked for a detailed breakdown.
Format: plain prose, no bullet lists unless explicitly asked.`,
  },
  investor_readiness: {
    name: 'Investor Readiness',
    model: DEFAULT_MODEL,
    systemPrompt: `You are the Investor Readiness agent for PATH360 — an AI that thinks exactly like a top-tier VC partner reviewing a deal.
Your expertise: investor narrative construction, fundraising readiness scoring, traction analysis, round sizing, due diligence preparation, term sheet dynamics, investor-founder relationship strategy.
You know how investors think, what they look for, and what kills deals in the first meeting.
Be direct about weaknesses. Tell the founder what a VC would actually think — not what they want to hear.
Response style: institutional, concise, actionable. No encouragement, no platitudes.`,
  },
  business_model: {
    name: 'Business Model',
    model: DEFAULT_MODEL,
    systemPrompt: `You are the Business Model agent for PATH360 — an AI specialising in monetisation strategy, business model design, and defensibility analysis.
Your expertise: SaaS, marketplace, D2C, subscription, enterprise, platform, creator economy, and AI-native business models.
You can compare any startup's model against these archetypes and identify monetisation gaps, pricing errors, and defensibility weaknesses.
Be specific about numbers: pricing, margins, retention economics, CAC/LTV ratios.
Never be vague. If you need more information to give a precise answer, ask for it.`,
  },
  founder_cognition: {
    name: 'Founder Cognition',
    model: DEFAULT_MODEL,
    systemPrompt: `You are the Founder Cognition agent for PATH360 — an AI that analyses founder psychology, decision-making patterns, and strategic behaviour.
Your expertise: identifying recurring bottlenecks in founder thinking, cognitive biases that affect startup decisions, resilience patterns, leadership gaps, and strategic psychology.
You are NOT a therapist. You are an analytical mirror.
You help founders see their own patterns with clinical precision, not emotional support.
Be honest about what you observe. Reference specific things the founder has said or done when making observations.`,
  },
  creation_studio: {
    name: 'Creation Studio',
    model: DEFAULT_MODEL,
    systemPrompt: `You are the Creation Studio agent for PATH360 — an AI that generates institutional-grade strategic documents for founders.
Your output should feel like it was written by a senior consultant at McKinsey or a partner at a top VC firm.
Never generic. Always specific to the founder's venture.
Document types you generate: business plans, pitch decks, strategy memos, investor memos, executive summaries, grant proposals, business cases, financial model narratives.
Always use the founder's specific data, metrics, and context.
Format documents with clear sections.
Use the frameworks VCs and institutional investors actually use (TAM/SAM/SOM, unit economics, competitive moat analysis, etc.).
When asked for structured output, return valid JSON only.`,
  },
}

const DOCUMENT_TYPES = {
  business_plan: {
    label: 'Business Plan',
    mode: 'document',
    downloadFormats: ['pdf', 'docx'],
    prompt: `Generate a comprehensive executive business plan for this venture.
Structure: Executive Summary, Problem & Solution, Market Opportunity (TAM/SAM/SOM), Business Model, Competitive Advantage & Moat, Go-to-Market Strategy, Financial Projections (Year 1-3 narrative), Team, Funding Ask & Use of Funds, Risks & Mitigations.
Use YC and Sequoia evaluation frameworks. Be specific with numbers wherever possible.`,
  },
  business_case: {
    label: 'Business Case',
    mode: 'document',
    downloadFormats: ['pdf', 'docx'],
    prompt: `Generate a sharp business case for this venture.
Structure: Opportunity Summary, Why Now, Problem Urgency, Strategic Rationale, Expected Value, Risks & Trade-Offs, Recommendation.
Write it as a decision-grade document for an investor, advisor, or strategic stakeholder evaluating whether this venture deserves support now.`,
  },
  business_case_ppt: {
    label: 'Business Case Deck',
    mode: 'deck',
    downloadFormats: ['pptx', 'pdf'],
    prompt: `Generate a business case presentation for this venture.
Return it as a board-ready PowerPoint structure with 10-12 slides.
For each slide include: title, objective, key points, and what the slide proves.
Slides should include: Title, Opportunity, Problem, Why Now, Strategic Rationale, Market Context, Business Model, Risks, Recommendation, Next Steps.`,
  },
  business_model: {
    label: 'Business Model',
    mode: 'document',
    downloadFormats: ['pdf', 'docx'],
    prompt: `Generate a business model summary for this venture.
Structure: Customer Segment, Problem, Value Proposition, Revenue Model, Pricing Logic, Distribution Model, Cost Structure, Strategic Advantage, Key Assumptions To Validate.
Make the model explicit and easy to understand.`,
  },
  pitch_deck: {
    label: 'Pitch Deck',
    mode: 'deck',
    downloadFormats: ['pptx', 'pdf'],
    prompt: `Create a structured pitch deck narrative for this venture.
Format as a 12-slide investor story.
For each slide include: slide title, key message, 2-3 supporting bullets, and what the slide must prove.
Slides should include: Thesis, Problem, Solution, Why Now, Market, Business Model, Traction, GTM, Competition, Team, Financial Outlook, Ask.`,
  },
  elevator_pitch: {
    label: 'Elevator Pitch',
    mode: 'document',
    downloadFormats: ['pdf', 'docx'],
    prompt: `Write an investor-ready elevator pitch for this founder and venture.
Provide:
1. a 30-second version,
2. a 60-second version,
3. a sharper investor-facing version.
Make the language verbal, memorable, and clear.`,
  },
  investor_memo: {
    label: 'Investor Memo',
    mode: 'document',
    downloadFormats: ['pdf', 'docx'],
    prompt: `Create a one-page investor brief for this venture.
Structure: Venture in One Line, Founder in One Line, Problem, Solution, Why Now, Market Signal, Business Model, Current Proof, Funding Ask, Key Risk.
Keep it concise, high-signal, and easy to scan.`,
  },
  mock_interview: {
    label: 'Mock Investor Interview',
    mode: 'document',
    downloadFormats: ['pdf', 'docx'],
    prompt: `Create a mock investor interview for this founder.
Include:
- 10 likely investor questions,
- a strong suggested answer for each,
- 5 harder follow-up questions,
- brief coaching notes on where the founder may sound weak or vague.
Make the questions realistic for an early-stage fundraising conversation.`,
  },
  pitch_practice: {
    label: 'Pitch Practice Pack',
    mode: 'document',
    downloadFormats: ['pdf', 'docx'],
    prompt: `Generate a pitch practice pack for this founder.
Include:
- a 3-minute pitch structure,
- a 60-second compressed version,
- 8 rehearsal prompts,
- common weak spots to avoid,
- 5 confidence-building speaking notes.
Make it practical and spoken, not essay-like.`,
  },
  vc_pitch: {
    label: 'VC Pitch Deck',
    mode: 'deck',
    downloadFormats: ['pptx', 'pdf'],
    prompt: `Create a structured VC pitch deck outline (12-15 slides) following the Sequoia Capital pitch format.
For each slide: Title, 2-3 key bullets, what the slide must prove.
Slides: Cover, Problem, Solution, Market Size, Product, Business Model, Traction, Team, Competition, Financials, Ask.`,
  },
  angel_pitch: {
    label: 'Angel Pitch Deck',
    mode: 'deck',
    downloadFormats: ['pptx', 'pdf'],
    prompt: `Create an angel investor pitch deck outline.
Angels invest earlier and care more about the founder story and mission.
Structure: Hook/Vision, Founder Story, Problem, Solution, Early Traction, Market, Business Model, Team, Ask.`,
  },
  strategy_memo: {
    label: 'Strategy Memo',
    mode: 'document',
    downloadFormats: ['pdf', 'docx'],
    prompt: `Write an institutional strategy memo (McKinsey style).
Structure: Executive Summary (1 paragraph), Situation Analysis, Strategic Options Considered, Recommended Strategy, Implementation Roadmap, Success Metrics, Risks & Mitigations.
Write it as if it will be reviewed by a board of directors.`,
  },
  financial_model: {
    label: 'Financial Model Narrative',
    mode: 'document',
    downloadFormats: ['pdf', 'xlsx', 'docx'],
    prompt: `Create a detailed financial model narrative for this venture covering:
1. Revenue model and pricing assumptions
2. Customer acquisition economics (CAC estimates, channels)
3. Unit economics (LTV estimates, payback period)
4. Year 1-3 revenue projections (with assumptions for each)
5. Burn rate and runway analysis
6. Funding requirements and milestones
Be specific with numbers based on the venture's context.`,
  },
}

function sanitizeText(value, fallback = 'Unknown') {
  const text = typeof value === 'string' ? value.trim() : value
  if (text === null || text === undefined || text === '') return fallback
  return String(text)
}

function summarizePriorities(priorities) {
  if (!Array.isArray(priorities) || priorities.length === 0) return 'None recorded'
  return priorities
    .slice(0, 4)
    .map((item, index) => {
      if (typeof item === 'string') return `${index + 1}. ${item}`
      return `${index + 1}. ${item?.priority || 'Priority'}${item?.urgency ? ` (${item.urgency})` : ''}`
    })
    .join('\n')
}

function buildContextBlock(founderContext) {
  if (!founderContext || Object.keys(founderContext).length === 0) {
    return '(No founder context available yet — the founder has not completed an assessment.)'
  }

  const profile = founderContext.profile || founderContext.founderProfile || founderContext.profileData || null
  const assessment = founderContext.assessment || founderContext.assessmentResults || null
  const memories = founderContext.memories || []
  const progress = founderContext.progress || []
  const documentIntakes = founderContext.document_intakes || founderContext.documentIntakes || []
  const guidedAnswers = founderContext.guidedAnswers || null

  let block = '--- FOUNDER CONTEXT (use this to personalise every response) ---\n'

  if (profile) {
    block += `Founder: ${sanitizeText(profile.founder_name || profile.founderName)}\n`
    block += `Venture: ${sanitizeText(profile.venture_name || profile.ventureName)}\n`
    block += `Industry: ${sanitizeText(profile.industry)}\n`
    block += `Stage: ${sanitizeText(profile.venture_stage || profile.ventureStage)}\n`
    block += `Business model: ${sanitizeText(profile.business_model || profile.businessModel)}\n`
    block += `Geography: ${sanitizeText(profile.geography)}\n`
    block += `Funding goal: ${sanitizeText(profile.funding_goal || profile.fundingGoal, 'Not specified')}\n`
    block += `Venture summary: ${sanitizeText(profile.venture_summary || profile.ventureSummary, 'Not provided')}\n`
  }

  if (assessment) {
    block += `\nAssessment scores:\n`
    block += `  Founder Score: ${sanitizeText(assessment.founder_score || assessment.founderScore, 'N/A')}/100\n`
    block += `  Investor Readiness: ${sanitizeText(assessment.investor_readiness || assessment.investorReadiness, 'N/A')}/100\n`
    block += `  Financial Maturity: ${sanitizeText(assessment.financial_maturity || assessment.financialMaturity, 'N/A')}/100\n`
    block += `  Strategic Clarity: ${sanitizeText(assessment.strategic_clarity || assessment.strategicClarity, 'N/A')}/100\n`
    block += `  Venture Stage: ${sanitizeText(assessment.venture_stage_result || assessment.venture_stage || assessment.ventureStage)}\n`
    block += `  Top priorities:\n${summarizePriorities(assessment.strategic_priorities || assessment.strategicPriorities)}\n`

    if (assessment.vc_verdict || assessment.vcVerdict) {
      block += `  VC verdict from last assessment: "${sanitizeText(assessment.vc_verdict || assessment.vcVerdict)}"\n`
    }
  }

  if (guidedAnswers && Object.keys(guidedAnswers).length > 0) {
    block += `\nGuided intake answers:\n`
    Object.entries(guidedAnswers).slice(0, 20).forEach(([key, value]) => {
      block += `  - ${sanitizeText(key)}: ${sanitizeText(value, 'Not answered')}\n`
    })
  }

  if (memories.length > 0) {
    block += `\nFounder memory (patterns observed over time):\n`
    memories.slice(0, 5).forEach((m) => {
      block += `  [${sanitizeText(m.memory_type || m.memoryType, 'memory')}] ${sanitizeText(m.content, '')}\n`
    })
  }

  if (progress.length > 0) {
    block += `\nFounder progress timeline:\n`
    progress.slice(0, 5).forEach((e) => {
      block += `  - ${sanitizeText(e.title)}: ${sanitizeText(e.description, '')}\n`
    })
  }

  if (documentIntakes.length > 0) {
    block += `\nRecent guided document prep:\n`
    documentIntakes.slice(0, 3).forEach((d) => {
      block += `  - ${sanitizeText(d.doctype)}: ${sanitizeText(d.title, 'Untitled prep')}\n`
    })
  }

  block += '---\n'
  return block
}

function buildStructuredDocumentPrompt({
  docType,
  customInstructions = '',
  objectiveId = null,
}) {
  const config = DOCUMENT_TYPES[docType]
  const basePrompt = config?.prompt ?? `Generate a ${docType} document for this founder.`

  const objectiveContext = objectiveId
    ? `\n\nCurrent founder objective: ${objectiveId}. Shape the output so it directly helps with this objective.`
    : ''

  const instructionContext = customInstructions?.trim()
    ? `\n\nAdditional instructions from the founder: ${customInstructions.trim()}`
    : ''

  return `${basePrompt}${objectiveContext}${instructionContext}


Return valid JSON only with this exact shape:
{
  "title": "string",
  "docType": "string",
  "mode": "document",
  "summary": "string",
  "downloadFormats": ["pdf"],
  "sections": [
    {
      "title": "string",
      "content": "string"
    }
  ],
  "slides": [
    {
      "title": "string",
      "objective": "string",
      "keyPoints": ["string"],
      "proof": "string"
    }
  ],
  "metadata": {
    "generatedAt": "ISO-8601 string",
    "objectiveId": "string or null",
    "parseError": false
  }
}


Rules:
- Always include title, docType, mode, summary, downloadFormats, metadata.
- mode must be "deck" for slide-based outputs and "document" for narrative outputs.
- For document-style outputs, populate sections.
- For deck-style outputs, populate slides.
- If slides are used, sections may be empty.
- If sections are used, slides may be empty.
- Keep output specific to the founder context.
- metadata.generatedAt must be a valid ISO timestamp.
- metadata.objectiveId must reflect the provided objective or null.
- Do not wrap JSON in markdown fences.
- Output valid JSON only.`
}

function safeParseJson(content) {
  if (typeof content !== 'string') return content
  try {
    return JSON.parse(content)
  } catch {
    return null
  }
}

function normalizeGeneratedDocument(docType, parsed) {
  const config = DOCUMENT_TYPES[docType] || {}
  const mode = parsed?.mode || config.mode || 'document'

  return {
    title: parsed?.title || config.label || docType,
    docType: parsed?.docType || docType,
    mode,
    summary: parsed?.summary || '',
    downloadFormats:
      Array.isArray(parsed?.downloadFormats) && parsed.downloadFormats.length > 0
        ? parsed.downloadFormats
        : config.downloadFormats || ['pdf'],
    sections: Array.isArray(parsed?.sections) ? parsed.sections : [],
    slides: Array.isArray(parsed?.slides) ? parsed.slides : [],
    metadata: {
      generatedAt: parsed?.metadata?.generatedAt || new Date().toISOString(),
      objectiveId: parsed?.metadata?.objectiveId ?? null,
      parseError: Boolean(parsed?.metadata?.parseError),
    },
  }
}

export async function askAgent({
  agentType = 'venture_strategist',
  messages = [],
  founderContext = {},
  stream = false,
  onChunk = null,
}) {
  const agent = AGENTS[agentType]

  if (!agent) {
    throw new Error(`Unknown agent: ${agentType}`)
  }

  // When AI is disabled, return a simple placeholder and never call OpenAI
  if (!AI_ENABLED) {
    const contextBlock = buildContextBlock(founderContext)
    const placeholder =
      `AI is currently disabled in this environment (VITE_AI_ENABLED is not "true").\n\n` +
      `Agent: ${agent.name}\n\n` +
      `You can continue to use all guided flows, assessments, and saving, ` +
      `but no live AI content is being generated.\n\n` +
      `Context snapshot:\n${contextBlock}`

    if (stream && typeof onChunk === 'function') {
      onChunk(placeholder)
    }

    return { content: placeholder }
  }

  const contextBlock = buildContextBlock(founderContext)
  const systemPrompt = `${agent.systemPrompt}\n\n${contextBlock}`

  if (stream && onChunk) {
    return await callOpenAIStream({
      systemPrompt,
      messages,
      model: agent.model,
    })
  }

  return await callOpenAI({
    systemPrompt,
    messages,
    model: agent.model,
  })
}

export async function generateDocument({
  docType,
  founderContext = {},
  customInstructions = '',
  objectiveId = null,
}) {
  const config = DOCUMENT_TYPES[docType] || {}
  const mode = config.mode || 'document'

  // Short‑circuit when AI is disabled: return a stubbed but well‑structured document
  if (!AI_ENABLED) {
    const now = new Date().toISOString()
    const contextBlock = buildContextBlock(founderContext)

    const summary =
      'AI generation is currently disabled for this environment. ' +
      'This is a placeholder document so you can continue testing flows and exports.'

    const baseSectionContent = [
      summary,
      '',
      `Doc type: ${config.label || docType}`,
      objectiveId ? `Current objective: ${objectiveId}` : null,
      '',
      'Founder context snapshot:',
      contextBlock,
      customInstructions
        ? `\nAdditional instructions from founder:\n${customInstructions.trim()}`
        : null,
    ]
      .filter(Boolean)
      .join('\n')

    const sections =
      mode === 'deck'
        ? []
        : [
            {
              title: config.label || 'Placeholder document',
              content: baseSectionContent,
            },
          ]

    const slides =
      mode === 'deck'
        ? [
            {
              title: config.label || 'Placeholder deck',
              objective: 'Indicate that AI generation is disabled while preserving the flow.',
              keyPoints: [
                'AI generation is currently disabled (no calls to external LLM APIs).',
                `Doc type: ${config.label || docType}`,
                objectiveId ? `Current objective: ${objectiveId}` : 'No specific objective provided.',
              ],
              proof: 'This deck was generated locally without contacting an AI provider.',
            },
          ]
        : []

    return {
      title: config.label || docType,
      docType,
      mode,
      summary,
      downloadFormats: config.downloadFormats || ['pdf'],
      sections,
      slides,
      metadata: {
        generatedAt: now,
        objectiveId,
        parseError: false,
      },
      raw: null,
    }
  }

  // Normal AI-enabled path (unchanged from your original logic)
  const fullPrompt = buildStructuredDocumentPrompt({
    docType,
    customInstructions,
    objectiveId,
  })

  const raw = await askAgent({
    agentType: 'creation_studio',
    messages: [{ role: 'user', content: fullPrompt }],
    founderContext,
  })

  const content = raw?.content || raw?.message || raw?.text || raw
  const parsed = safeParseJson(content)

  if (!parsed) {
    return {
      title: config?.label || docType,
      docType,
      mode: config?.mode || 'document',
      summary: 'Document generated, but structured parsing failed.',
      downloadFormats: config?.downloadFormats || ['pdf'],
      sections:
        config?.mode === 'deck'
          ? []
          : [
              {
                title: 'Generated Content',
                content: typeof content === 'string' ? content : JSON.stringify(content),
              },
            ],
      slides:
        config?.mode === 'deck'
          ? [
              {
                title: config?.label || docType,
                objective: 'Review generated content',
                keyPoints: [
                  typeof content === 'string'
                    ? content.slice(0, 300)
                    : JSON.stringify(content).slice(0, 300),
                ],
                proof: 'Structured parsing failed; manual review required.',
              },
            ]
          : [],
      metadata: {
        generatedAt: new Date().toISOString(),
        objectiveId,
        parseError: true,
      },
      raw,
    }
  }

  return {
    ...normalizeGeneratedDocument(docType, parsed),
    raw,
  }
}

export { AGENTS, DEFAULT_MODEL, DOCUMENT_TYPES }