import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { generateDocument } from '../lib/agentOrchestrator.js'
import { saveDocument } from '../lib/supabaseClient.js'
import { track, EVENTS } from '../lib/posthogClient.js'
import { isGuidedDocType } from '../lib/documentGuides.js'

const OBJECTIVES = [
  {
    id: 'raise_funding',
    label: 'Raise funding',
    description: 'Prepare investor-ready narratives and materials for upcoming fundraising.',
  },
  {
    id: 'clarify_strategy',
    label: 'Clarify strategy',
    description: 'Turn assessment findings into a sharper, more coherent strategic story.',
  },
  {
    id: 'explain_business',
    label: 'Explain the business',
    description: 'Articulate what you do, for whom, and how the model works.',
  },
  {
    id: 'investor_meeting',
    label: 'Prepare for investor conversations',
    description: 'Get ready for calls, meetings, and follow-up exchanges.',
  },
  {
    id: 'strengthen_pitch',
    label: 'Strengthen my pitch',
    description: 'Improve how you tell the story in short and long formats.',
  },
]

const OUTPUT_TYPES = [
  {
    id: 'business_plan',
    label: 'Business Plan',
    short: 'Full strategic operating plan.',
    tier: 'starter',
    objectives: ['clarify_strategy', 'raise_funding'],
  },
  {
    id: 'business_case',
    label: 'Business Case',
    short: 'Why this venture deserves support.',
    tier: 'starter',
    objectives: ['clarify_strategy', 'raise_funding'],
  },
  {
    id: 'business_model',
    label: 'Business Model Summary',
    short: 'How you create, deliver, and capture value.',
    tier: 'starter',
    objectives: ['explain_business', 'clarify_strategy'],
  },
  {
    id: 'pitch_deck',
    label: 'Pitch Deck Narrative',
    short: 'Slide-by-slide story structure.',
    tier: 'starter',
    objectives: ['raise_funding', 'strengthen_pitch'],
  },
  {
    id: 'elevator_pitch',
    label: 'Elevator Pitch',
    short: '30–60 second verbal summary.',
    tier: 'starter',
    objectives: ['strengthen_pitch', 'investor_meeting'],
  },
  {
    id: 'investor_memo',
    label: 'Investor One-Pager',
    short: 'High-signal summary for quick review.',
    tier: 'starter',
    objectives: ['raise_funding', 'investor_meeting'],
  },
  {
    id: 'mock_interview',
    label: 'Mock Investor Interview',
    short: 'Practice questions and suggested answers.',
    tier: 'growth',
    objectives: ['investor_meeting', 'strengthen_pitch'],
  },
  {
    id: 'pitch_practice',
    label: 'Pitch Practice Prompts',
    short: 'Tight prompts to rehearse your story.',
    tier: 'growth',
    objectives: ['strengthen_pitch'],
  },
]

function canUseTier(docTier, isGrowthOrAbove) {
  if (docTier === 'starter') return true
  return isGrowthOrAbove
}

function normaliseErrorMessage(err) {
  const message = err?.message || ''
  const lower = message.toLowerCase()

  if (message.includes('429') || lower.includes('quota')) {
    return 'Generation is temporarily unavailable because the AI API quota has been reached. Please try again a bit later.'
  }

  if (lower.includes('api key') || lower.includes('vite_gemini_api_key')) {
    return 'Generation is not configured yet. Please add a valid AI API key in the backend settings.'
  }

  return 'Something went wrong while generating this document. Please try again.'
}

export default function Studio() {
  const navigate = useNavigate()

  const [objective, setObjective] = useState(null)
  const [selectedOutput, setSelectedOutput] = useState(null)
  const [customInstructions, setCustomInstructions] = useState('')
  const [generatedContent, setGeneratedContent] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [copyFeedback, setCopyFeedback] = useState('')

  const getFounderContext = useDiagnosticStore((s) => s.getFounderContext)
  const addDocument = useDiagnosticStore((s) => s.addDocument)
  const user = useDiagnosticStore((s) => s.user)
  const isGrowthOrAbove = useDiagnosticStore((s) => s.isGrowthOrAbove())
  const assessmentResults = useDiagnosticStore((s) => s.assessmentResults)

  const recommendedOutputs = useMemo(() => {
    if (!objective) return []
    return OUTPUT_TYPES.filter((out) => out.objectives.includes(objective.id))
  }, [objective])

  async function handleGenerate() {
    if (!selectedOutput || generating) return

    setGenerating(true)
    setError('')
    setGeneratedContent(null)

    try {
      const context = getFounderContext()

      const content = await generateDocument({
        docType: selectedOutput.id,
        founderContext: context,
        customInstructions,
        objectiveId: objective?.id ?? null,
      })

      setGeneratedContent(content)

      if (user?.id) {
        const saved = await saveDocument(
          user.id,
          selectedOutput.id,
          `${selectedOutput.label} — ${new Date().toLocaleDateString()}`,
          content,
        )
        addDocument(saved)
      }

      track(EVENTS.DOCUMENT_GENERATED, {
        doc_type: selectedOutput.id,
        objective: objective?.id ?? null,
      })
    } catch (err) {
      console.error(err)
      setError(normaliseErrorMessage(err))
    } finally {
      setGenerating(false)
    }
  }

  async function handleCopy() {
    if (!generatedContent) return

    try {
      await navigator.clipboard.writeText(generatedContent)
      setCopyFeedback('Copied')
      setTimeout(() => setCopyFeedback(''), 1800)
    } catch {
      setCopyFeedback('Copy failed')
      setTimeout(() => setCopyFeedback(''), 1800)
    }
  }

  function handleNew() {
    setGeneratedContent(null)
    setCustomInstructions('')
    setError('')
    setCopyFeedback('')
  }

  function handleResetFlow() {
    setObjective(null)
    setSelectedOutput(null)
    setCustomInstructions('')
    setGeneratedContent(null)
    setError('')
    setCopyFeedback('')
  }

  return (
    <div style={{ padding: 24, maxWidth: 980 }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 16,
          padding: 20,
          marginBottom: 18,
          boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: '#8A6E2A',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Creation Studio
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1C1C1A',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Turn founder intelligence into practical outputs
        </h1>

        <p
          style={{
            fontSize: 13,
            color: '#6B6965',
            margin: 0,
            lineHeight: 1.7,
            maxWidth: 720,
          }}
        >
          Start with your objective, not a template. Path360 recommends the right asset, uses your assessment and memory,
          and creates documents that are ready to refine, export, and use with investors.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(260px, 0.9fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <div style={{ display: 'grid', gap: 14 }}>
          <section
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2DED6',
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1A', marginBottom: 4 }}>
                1. What do you want to do?
              </div>
              <div style={{ fontSize: 12.5, color: '#6B6965' }}>
                Choose the goal that best matches your next move. We will recommend the right outputs based on your
                founder profile and assessment.
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 8,
              }}
            >
              {OBJECTIVES.map((obj) => {
                const isActive = objective?.id === obj.id
                return (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => {
                      setObjective(obj)
                      setSelectedOutput(null)
                      setGeneratedContent(null)
                      setCustomInstructions('')
                      setError('')
                    }}
                    style={{
                      textAlign: 'left',
                      borderRadius: 12,
                      border: isActive ? '1.5px solid #1D6B4F' : '1px solid #E2DED6',
                      background: isActive ? '#EAF1EB' : '#F7F5F0',
                      padding: '10px 11px',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: isActive ? '#1D6B4F' : '#1C1C1A',
                        marginBottom: 4,
                      }}
                    >
                      {obj.label}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#6B6965', lineHeight: 1.6 }}>{obj.description}</div>
                  </button>
                )
              })}
            </div>
          </section>

          <section
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2DED6',
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1A', marginBottom: 4 }}>
                2. Recommended outputs
              </div>
              <div style={{ fontSize: 12.5, color: '#6B6965' }}>
                We match your objective to the most useful documents and practice flows. Guided items start with a short
                intake before generation.
              </div>
            </div>

            {!objective && (
              <div
                style={{
                  fontSize: 12,
                  color: '#8C8A84',
                  background: '#F7F5F0',
                  borderRadius: 10,
                  padding: 12,
                }}
              >
                Choose an objective above to see recommended outputs.
              </div>
            )}

            {objective && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 10,
                }}
              >
                {recommendedOutputs.map((out) => {
                  const locked = !canUseTier(out.tier, isGrowthOrAbove)
                  const isSelected = selectedOutput?.id === out.id
                  const guided = isGuidedDocType(out.id)

                  return (
                    <button
                      key={out.id}
                      type="button"
                      disabled={locked}
                      onClick={() => {
                        if (!locked) {
                          if (guided) {
                            navigate(`/app/studio/prep/${out.id}`)
                            return
                          }

                          setSelectedOutput(out)
                          setGeneratedContent(null)
                          setError('')
                        }
                      }}
                      style={{
                        background: isSelected ? '#1D6B4F' : locked ? '#F7F5F0' : '#FFFFFF',
                        border: isSelected ? '1.5px solid #1D6B4F' : '1px solid #E2DED6',
                        borderRadius: 11,
                        padding: '11px 10px',
                        cursor: locked ? 'not-allowed' : 'pointer',
                        opacity: locked ? 0.55 : 1,
                        textAlign: 'left',
                        position: 'relative',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {locked && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontSize: 9.5,
                            background: '#F2EFE8',
                            color: '#8C8A84',
                            padding: '2px 6px',
                            borderRadius: 999,
                          }}
                        >
                          Growth+
                        </div>
                      )}

                      {!locked && guided && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontSize: 9.5,
                            background: '#EAF1EB',
                            color: '#1D6B4F',
                            padding: '2px 6px',
                            borderRadius: 999,
                          }}
                        >
                          Guided
                        </div>
                      )}

                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: isSelected ? '#FFFFFF' : '#1C1C1A',
                          marginBottom: 4,
                        }}
                      >
                        {out.label}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: isSelected ? 'rgba(255,255,255,0.75)' : '#6B6965',
                          marginBottom: 6,
                        }}
                      >
                        {out.short}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: isSelected ? 'rgba(255,255,255,0.7)' : '#8C8A84',
                        }}
                      >
                        {guided
                          ? `${out.tier === 'starter' ? 'Starter' : 'Growth+'} · Guided intake`
                          : out.tier === 'starter'
                            ? 'Starter'
                            : 'Growth+'}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </section>

          {selectedOutput && !generatedContent && (
            <section
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2DED6',
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1A', marginBottom: 2 }}>
                  3. Generate: {selectedOutput.label}
                </div>
                <div style={{ fontSize: 12.5, color: '#6B6965' }}>
                  This document will be created from your founder profile, assessment, and key memories. Add any
                  specific angles or constraints you want us to emphasise.
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#6B6965',
                    marginBottom: 6,
                  }}
                >
                  Additional instructions (optional)
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={3}
                  placeholder="e.g. Emphasise our B2B SaaS focus and upcoming fundraising timeline."
                  style={{
                    width: '100%',
                    border: '1px solid #E2DED6',
                    borderRadius: 9,
                    padding: '10px 12px',
                    minHeight: 92,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: '#1C1C1A',
                    background: '#F7F5F0',
                    resize: 'vertical',
                  }}
                />
              </div>

              {error && (
                <div
                  style={{
                    background: '#FDEAEA',
                    border: '1px solid rgba(139,32,32,0.3)',
                    borderRadius: 10,
                    padding: 10,
                    color: '#8B2020',
                    marginBottom: 10,
                    fontSize: 12.5,
                    lineHeight: 1.6,
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                style={{
                  background: '#1D6B4F',
                  border: '1px solid #1D6B4F',
                  borderRadius: 9,
                  padding: '10px 18px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: generating ? 'default' : 'pointer',
                }}
              >
                {generating ? 'Generating… (20–40s)' : `Generate ${selectedOutput.label}`}
              </button>
            </section>
          )}

          {generatedContent && (
            <section
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2DED6',
                borderRadius: 14,
                padding: 18,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  marginBottom: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 220 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1A' }}>
                    {selectedOutput.label} created
                  </div>
                  <div style={{ fontSize: 11.5, color: '#8C8A84', marginTop: 2 }}>
                    Generated from your latest founder context. You can refine, copy, or generate a new version.
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleCopy}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2DED6',
                      background: '#F7F5F0',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    {copyFeedback || 'Copy'}
                  </button>

                  <button
                    type="button"
                    onClick={handleNew}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2DED6',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    New version
                  </button>

                  <button
                    type="button"
                    onClick={handleResetFlow}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 8,
                      border: '1px solid #E2DED6',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Start again
                  </button>
                </div>
              </div>

              <div
                style={{
                  background: '#F7F5F0',
                  borderRadius: 10,
                  padding: 18,
                  maxHeight: 520,
                  overflowY: 'auto',
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.8,
                    color: '#1C1C1A',
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {generatedContent}
                </pre>
              </div>
            </section>
          )}
        </div>

        <aside
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 14,
            padding: 16,
            boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1A', marginBottom: 6 }}>
            How Studio thinks about this
          </div>
          <div style={{ fontSize: 12.5, color: '#6B6965', lineHeight: 1.7, marginBottom: 12 }}>
            Assessment creates the raw truth, Memory preserves it, Radar interprets it, Reports structure it, and
            Creation Studio turns it into outputs you can use with investors, partners, and your team.
          </div>

          <div
            style={{
              background: '#F7F5F0',
              borderRadius: 10,
              padding: 12,
              fontSize: 12,
              color: '#6B6965',
              lineHeight: 1.6,
              marginBottom: 10,
            }}
          >
            <strong style={{ fontWeight: 600 }}>Current signals</strong>
            <br />
            {assessmentResults
              ? 'Using your latest assessment, founder profile, and top memories to shape this output.'
              : 'Once you complete an assessment, Studio will use your founder profile and results to personalise every output.'}
          </div>

          <div
            style={{
              background: '#FCF8EE',
              borderRadius: 10,
              padding: 12,
              fontSize: 12,
              color: '#6B6965',
              lineHeight: 1.6,
              marginBottom: 10,
              border: '1px solid #EEE4C9',
            }}
          >
            <strong style={{ fontWeight: 600, color: '#1C1C1A' }}>Guided generation</strong>
            <br />
            Business Plan, Business Case, Pitch Deck, Elevator Pitch, Investor One-Pager, and Mock Investor Interview
            now start with a guided intake before drafting.
          </div>

          <div style={{ fontSize: 12, color: '#6B6965', lineHeight: 1.6 }}>
            After generating, you will find saved documents in your Reports workspace so you can review, export, and
            reuse them later.
          </div>
        </aside>
      </div>
    </div>
  )
}