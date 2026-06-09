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
    'Based on your investor readiness score, there are 2-3 things a VC will pick apart before they fund this deal.',
  business_model:
    'Your business model has strong revenue potential but there are monetisation and defensibility choices you should sharpen.',
  founder_cognition:
    "I've been observing patterns in how you think about your venture. There are clear strengths and recurring blind spots to address.",
}

export default function AIStrategistRail() {
  const activeAgent = useDiagnosticStore((s) => s.activeAgent)
  const setActiveAgent = useDiagnosticStore((s) => s.setActiveAgent)
  const getConversation = useDiagnosticStore((s) => s.getConversation)
  const addMessage = useDiagnosticStore((s) => s.addMessage)
  const setConversation = useDiagnosticStore((s) => s.setConversation)
  const getFounderContext = useDiagnosticStore((s) => s.getFounderContext)
  const user = useDiagnosticStore((s) => s.user)

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
            content: STARTER_MESSAGES[activeAgent] ?? 'How can I help you today?',
          },
        ]
      : messages

  async function handleSend() {
    const text = input.trim()

    if (!text || isTyping) return

    setInput('')
    track(EVENTS.AI_RAIL_USED, { agent: activeAgent })

    const existingMessages = getConversation(activeAgent)
    const userMsg = { role: 'user', content: text }

    addMessage(activeAgent, userMsg)

    const apiMessages = [...existingMessages.slice(-10), userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }))

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
        saveConversation(user.id, activeAgent, updatedMessages).catch(console.error)
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

  return (
    <aside className="p360-rail">
      <div className="p360-rail-head">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
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
          <span className="p360-tag p360-tag-neutral" style={{ fontSize: 10 }}>
            {AGENTS?.[activeAgent]?.model ?? 'AI'}
          </span>
        </div>

        <div className="p360-rail-prompts">
          {AGENT_LIST.map((agent) => {
            const isActive = activeAgent === agent.id

            return (
              <button
                key={agent.id}
                onClick={() => setActiveAgent(agent.id)}
                className={isActive ? 'p360-tag p360-tag-success' : 'p360-tag p360-tag-neutral'}
                style={{
                  border: `1px solid ${isActive ? 'rgba(26,122,74,0.18)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}
              >
                {agent.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p360-rail-chat">
        {displayMessages.map((msg, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
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
                {AGENT_LIST.find((a) => a.id === activeAgent)?.label ?? 'AI'}
              </div>
            )}

            <div className={`p360-chat-bubble ${msg.role === 'user' ? 'user' : 'assistant'}`}>
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
              {AGENT_LIST.find((a) => a.id === activeAgent)?.label ?? 'AI'}
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

      {messages.length === 0 && (
        <div
          className="p360-card-soft"
          style={{
            padding: 12,
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: 'var(--text-faint)',
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            Try asking
          </p>

          {[
            "What's my biggest investor readiness gap?",
            'What would a VC say about my traction?',
            'Diagnose my top execution risk',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => setInput(prompt)}
              className="p360-btn-secondary"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                marginBottom: i === 2 ? 0 : 6,
                padding: '9px 10px',
                fontSize: 12,
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      <div className="p360-rail-compose">
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