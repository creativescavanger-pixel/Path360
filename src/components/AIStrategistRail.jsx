// src/components/AIStrategistRail.jsx

import { useState, useRef, useEffect } from 'react'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { askAgent, AGENTS } from '../lib/agentOrchestrator.js'
import { track, EVENTS } from '../lib/posthogClient.js'
import { saveConversation } from '../lib/supabaseClient.js'

const AGENT_LIST = [
  { id: 'venture_strategist', label: 'Venture', short: 'VS' },
  { id: 'investor_readiness', label: 'Investor', short: 'IR' },
  { id: 'business_model', label: 'Model', short: 'BM' },
  { id: 'founder_cognition', label: 'Cognition', short: 'FC' },
]

const STARTER_MESSAGES = {
  venture_strategist:
    "I've reviewed your assessment. Your biggest strategic gap is clearly defined by your current stage and traction.",
  investor_readiness:
    'Based on your investor readiness score, there are 2–3 things a VC will pick apart before they fund this deal.',
  business_model:
    'Your business model has strong revenue potential but there are monetisation and defensibility choices you should sharpen.',
  founder_cognition:
    "I've been observing patterns in how you think about your venture. There are clear strengths and recurring blind spots to address.",
}

const SUGGESTED_PROMPTS = [
  "What's my biggest investor readiness gap?",
  'What would a VC say about my traction?',
  'Diagnose my top execution risk',
]

export default function AIStrategistRail() {
  const activeAgent = useDiagnosticStore((s) => s.activeAgent)
  const setActiveAgent = useDiagnosticStore((s) => s.setActiveAgent)
  const getConversation = useDiagnosticStore((s) => s.getConversation)
  const addMessage = useDiagnosticStore((s) => s.addMessage)
  const setConversation = useDiagnosticStore((s) => s.setConversation)
  const getFounderContext = useDiagnosticStore((s) => s.getFounderContext)
  const user = useDiagnosticStore((s) => s.user)
  const stageAssessment = useDiagnosticStore((s) => s.stageAssessment)
  const founderProfile = useDiagnosticStore((s) => s.founderProfile)

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const bottomRef = useRef(null)

  const messages = getConversation(activeAgent)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const displayMessages =
    messages.length === 0
      ? [
          {
            role: 'assistant',
            content:
              STARTER_MESSAGES[activeAgent] ??
              'How can I help you today?',
          },
        ]
      : messages

  const currentStage =
    stageAssessment?.declaredStage ||
    stageAssessment?.diagnosedStage ||
    ''
  const stageLabel = currentStage
    ? `Stage: ${currentStage}`
    : 'Stage baseline active'

  async function handleSend() {
    const text = input.trim()
    if (!text || isTyping) return

    setInput('')
    track(EVENTS.AI_RAIL_USED, { agent: activeAgent })

    const existingMessages = getConversation(activeAgent)
    const userMsg = { role: 'user', content: text }

    addMessage(activeAgent, userMsg)

    const apiMessages = [...existingMessages.slice(-10), userMsg].map(
      (m) => ({
        role: m.role,
        content: m.content,
      }),
    )

    setIsTyping(true)
    setStreamingText('')

    try {
      let fullResponse = ''

      await askAgent({
        agentType: activeAgent,
        messages: apiMessages,
        founderContext: getFounderContext(),
        stream: true,
        onChunk: (_chunk, full) => {
          setStreamingText(full)
          fullResponse = full
        },
      })

      const assistantMsg = {
        role: 'assistant',
        content: fullResponse || 'No response generated.',
      }

      const updatedMessages = [...existingMessages, userMsg, assistantMsg]

      setConversation(activeAgent, updatedMessages)
      setStreamingText('')

      if (user?.id) {
        saveConversation(user.id, activeAgent, updatedMessages).catch(
          console.error,
        )
      }
    } catch (err) {
      const errorMsg = {
        role: 'assistant',
        content: `I encountered an error: ${err.message}. Please check your AI client configuration.`,
      }

      addMessage(activeAgent, errorMsg)
    } finally {
      setIsTyping(false)
      setStreamingText('')
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handlePromptClick(prompt) {
    if (isTyping) return
    setInput(prompt)
  }

  return (
    <aside
      className="p360-rail"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#FFFFFF',
      }}
    >
      {/* header */}
      <div
        className="p360-rail-head"
        style={{
          padding: '10px 14px 8px',
          borderBottom: '1px solid #E2DED6',
          background: '#FCF8EE',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <div
            className="ai-pulse"
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--green-700)',
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--text)',
              flex: 1,
              letterSpacing: '0.02em',
            }}
          >
            AI Strategist
          </span>
          <span
            className="p360-tag p360-tag-neutral"
            style={{ fontSize: 10 }}
          >
            {AGENTS?.[activeAgent]?.model ?? 'AI'}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                color: '#6B6965',
                lineHeight: 1.6,
              }}
            >
              I use your stage baseline, assessment, and venture profile to help
              you make sharper, investor‑ready decisions.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 999,
                border: '1px solid #D8D3C9',
                background: '#FFFFFF',
                color: '#6B6965',
                whiteSpace: 'nowrap',
              }}
            >
              {stageLabel}
            </div>
            {founderProfile?.firstname && (
              <div
                style={{
                  fontSize: 10.5,
                  color: '#8C8A84',
                }}
              >
                Working with {founderProfile.firstname}
              </div>
            )}
          </div>
        </div>

        {/* agent selection pills */}
        <div
          className="p360-rail-prompts"
          style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}
        >
          {AGENT_LIST.map((agent) => {
            const isActive = activeAgent === agent.id

            return (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent.id)}
                className={
                  isActive
                    ? 'p360-tag p360-tag-success'
                    : 'p360-tag p360-tag-neutral'
                }
                style={{
                  border: `1px solid ${
                    isActive
                      ? 'rgba(26,122,74,0.18)'
                      : 'var(--border)'
                  }`,
                  cursor: 'pointer',
                  fontSize: 11,
                }}
              >
                {agent.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* chat body */}
      <div
        className="p360-rail-chat"
        style={{
          flex: 1,
          padding: '10px 14px 12px',
          overflowY: 'auto',
          background: '#F7F5F0',
        }}
      >
        {displayMessages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems:
                msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 8,
            }}
          >
            {msg.role === 'assistant' && (
              <div
                style={{
                  fontSize: 10,
                  color: 'var(--green-700)',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 5,
                }}
              >
                {AGENT_LIST.find((a) => a.id === activeAgent)?.label ??
                  'AI'}
              </div>
            )}

            <div
              className={`p360-chat-bubble ${
                msg.role === 'user' ? 'user' : 'assistant'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && streamingText && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: 'var(--green-700)',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              {AGENT_LIST.find((a) => a.id === activeAgent)?.label ??
                'AI'}
            </div>

            <div className="p360-chat-bubble assistant">
              {streamingText}
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: 13,
                  background: 'var(--green-700)',
                  marginLeft: 3,
                  verticalAlign: 'middle',
                  animation: 'pulse 1s infinite',
                }}
              />
            </div>
          </div>
        )}

        {isTyping && !streamingText && (
          <div style={{ display: 'flex', gap: 5, padding: '6px 2px' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--green-600)',
                  animation: `pulse 1s ${i * 0.2}s ease-in-out infinite`,
                }}
              />
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* bottom: suggestions + compose */}
      <div
        className="p360-rail-compose"
        style={{
          borderTop: '1px solid #E2DED6',
          padding: '8px 10px 10px',
          background: '#FFFFFF',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 6,
          }}
        >
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className="p360-btn-secondary"
              style={{
                padding: '6px 9px',
                borderRadius: 999,
                fontSize: 11,
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your AI strategist..."
            rows={2}
            disabled={isTyping}
            className="p360-textarea"
            style={{
              flex: 1,
              minHeight: 76,
              opacity: isTyping ? 0.55 : 1,
            }}
          />

          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="p360-btn-primary"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              padding: 0,
              display: 'grid',
              placeItems: 'center',
              fontSize: 16,
              flexShrink: 0,
              opacity: !input.trim() || isTyping ? 0.45 : 1,
            }}
          >
            ↑
          </button>
        </div>

        <p
          style={{
            fontSize: 10,
            color: 'var(--text-faint)',
            marginTop: 7,
            textAlign: 'center',
          }}
        >
          Shift+Enter for new line · Enter to send
        </p>
      </div>
    </aside>
  )
}