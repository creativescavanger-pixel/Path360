import { callOpenAI, callOpenAIStream } from './openaiClient.js'

const DEFAULT_MODEL = 'gemini-2.0-flash'

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
Document types you generate: business plans, pitch decks (as structured outlines), strategy memos, investor memos, executive summaries, grant proposals.
Always use the founder's specific data, metrics, and context.
Format documents with clear sections.
Use the frameworks VCs and institutional investors actually use (TAM/SAM/SOM, unit economics, competitive moat analysis, etc.).`,
  },
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

  const contextBlock = buildContextBlock(founderContext)
  const systemPrompt = `${agent.systemPrompt}\n\n${contextBlock}`

  if (stream && onChunk) {
    return await callOpenAIStream({
      systemPrompt,
      messages,
      model: agent.model,
      onChunk,
    })
  }

  return await callOpenAI({
    systemPrompt,
    messages,
    model: agent.model,
  })
}

function buildContextBlock(founderContext) {
  if (!founderContext || Object.keys(founderContext).length === 0) {
    return '(No founder context available yet — the founder has not completed an assessment.)'
  }

  const { profile, assessment, memories } = founderContext
  let block = '--- FOUNDER CONTEXT (use this to personalise every response) ---\n'

  if (profile) {
    block += `Venture: ${profile.venture_name ?? 'Unknown'}\n`
    block += `Industry: ${profile.industry ?? 'Unknown'}\n`
    block += `Stage: ${profile.venture_stage ?? 'Unknown'}\n`
    block += `Business model: ${profile.business_model ?? 'Unknown'}\n`
    block += `Geography: ${profile.geography ?? 'Unknown'}\n`
    block += `Funding goal: ${profile.funding_goal ?? 'Not specified'}\n`
  }

  if (assessment) {
    block += `\nAssessment scores:\n`
    block += `  Founder Score: ${assessment.founder_score}/100\n`
    block += `  Investor Readiness: ${assessment.investor_readiness}/100\n`
    block += `  Financial Maturity: ${assessment.financial_maturity}/100\n`
    block += `  Venture Stage: ${assessment.venture_stage_result}\n`

    if (assessment.strategic_priorities) {
      block += `  Top priorities: ${JSON.stringify(assessment.strategic_priorities)}\n`
    }

    if (assessment.vc_verdict) {
      block += `  VC verdict from last assessment: "${assessment.vc_verdict}"\n`
    }
  }

  if (memories && memories.length > 0) {
    block += `\nFounder memory (patterns observed over time):\n`
    memories.slice(0, 5).forEach((m) => {
      block += `  [${m.memory_type}] ${m.content}\n`
    })
  }

  block += '---\n'
  return block
}

export async function generateDocument({
  docType,
  founderContext,
  customInstructions = '',
  objectiveId = null,
}) {
  const docPrompts = {
    business_plan: `Generate a comprehensive executive business plan for this venture.
Structure: Executive Summary, Problem & Solution, Market Opportunity (TAM/SAM/SOM), Business Model, Competitive Advantage & Moat, Go-to-Market Strategy, Financial Projections (Year 1-3 narrative), Team, Funding Ask & Use of Funds, Risks & Mitigations.
Use YC and Sequoia evaluation frameworks. Be specific with numbers wherever possible.`,

    business_case: `Generate a sharp business case for this venture.
Structure: Opportunity Summary, Why Now, Problem Urgency, Strategic Rationale, Expected Value, Risks & Trade-Offs, Recommendation.
Write it as a decision-grade document for an investor, advisor, or strategic stakeholder evaluating whether this venture deserves support now.`,

    business_model: `Generate a business model summary for this venture.
Structure: Customer Segment, Problem, Value Proposition, Revenue Model, Pricing Logic, Distribution Model, Cost Structure, Strategic Advantage, Key Assumptions To Validate.
Make the model explicit and easy to understand.`,

    pitch_deck: `Create a structured pitch deck narrative for this venture.
Format as a 12-slide investor story.
For each slide include: slide title, key message, 2-3 supporting bullets, and what the slide must prove.
Slides should include: Thesis, Problem, Solution, Why Now, Market, Business Model, Traction, GTM, Competition, Team, Financial Outlook, Ask.`,

    elevator_pitch: `Write an investor-ready elevator pitch for this founder and venture.
Provide:
1. a 30-second version,
2. a 60-second version,
3. a sharper investor-facing version.
Make the language verbal, memorable, and clear.`,

    investor_card: `Create a one-page investor brief for this venture.
Structure: Venture in One Line, Founder in One Line, Problem, Solution, Why Now, Market Signal, Business Model, Current Proof, Funding Ask, Key Risk.
Keep it concise, high-signal, and easy to scan.`,

    mock_interview: `Create a mock investor interview for this founder.
Include:
- 10 likely investor questions,
- a strong suggested answer for each,
- 5 harder follow-up questions,
- brief coaching notes on where the founder may sound weak or vague.
Make the questions realistic for an early-stage fundraising conversation.`,

    pitch_practice: `Generate a pitch practice pack for this founder.
Include:
- a 3-minute pitch structure,
- a 60-second compressed version,
- 8 rehearsal prompts,
- common weak spots to avoid,
- 5 confidence-building speaking notes.
Make it practical and spoken, not essay-like.`,

    vc_pitch: `Create a structured VC pitch deck outline (12-15 slides) following the Sequoia Capital pitch format.
For each slide: Title, 2-3 key bullets, what the slide must prove.
Slides: Cover, Problem, Solution, Market Size, Product, Business Model, Traction, Team, Competition, Financials, Ask.`,

    angel_pitch: `Create an angel investor pitch deck outline.
Angels invest earlier and care more about the founder story and mission.
Structure: Hook/Vision, Founder Story, Problem, Solution, Early Traction, Market, Business Model, Team, Ask.`,

    strategy_memo: `Write an institutional strategy memo (McKinsey style).
Structure: Executive Summary (1 paragraph), Situation Analysis, Strategic Options Considered, Recommended Strategy, Implementation Roadmap, Success Metrics, Risks & Mitigations.
Write it as if it will be reviewed by a board of directors.`,

    financial_model: `Create a detailed financial model narrative for this venture covering:
1. Revenue model and pricing assumptions
2. Customer acquisition economics (CAC estimates, channels)
3. Unit economics (LTV estimates, payback period)
4. Year 1-3 revenue projections (with assumptions for each)
5. Burn rate and runway analysis
6. Funding requirements and milestones
Be specific with numbers based on the venture's context.`,

    investor_memo: `Write an institutional investor memo (2-3 pages) that a VC would use internally to champion this deal.
Structure: Investment Thesis (why now, why this team), Market Analysis, Competitive Positioning, Business Model & Unit Economics, Risks & Mitigants, Comparable Exits, Recommendation.`,
  }

  const basePrompt =
    docPrompts[docType] ?? `Generate a ${docType} document for this founder.`

  const objectiveContext = objectiveId
    ? `\n\nCurrent founder objective: ${objectiveId}. Shape the output so it directly helps with this objective.`
    : ''

  const instructionContext = customInstructions
    ? `\n\nAdditional instructions from the founder: ${customInstructions}`
    : ''

  const fullPrompt = `${basePrompt}${objectiveContext}${instructionContext}`

  return await askAgent({
    agentType: 'creation_studio',
    messages: [{ role: 'user', content: fullPrompt }],
    founderContext,
  })
}

export { AGENTS, DEFAULT_MODEL }