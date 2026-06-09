import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  generateNextQuestion,
  generateAssessmentScores,
  buildConversationHistory,
  getNextFoundationQuestion,
  getFirstQuestion,
} from '../lib/adaptiveQuestions.js'
import { addMemory } from '../lib/supabaseClient.js'
import { track, EVENTS } from '../lib/posthogClient.js'

const TOTAL_QUESTIONS = 10
const MIN_WORDS = 5
const MIN_CHARS = 20
const FIRST_FALLBACK = 'What problem are you solving, and who exactly experiences it?'

export default function Assessment() {
  const navigate = useNavigate()
  const textRef = useRef(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const user = useDiagnosticStore((s) => s.user)
  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const results = useDiagnosticStore((s) => s.assessmentResults)
  const qaPairsInStore = useDiagnosticStore((s) => s.qaPairs || [])
  const setAssessmentResults = useDiagnosticStore((s) => s.setAssessmentResults)
  const setQAPairs = useDiagnosticStore((s) => s.setQAPairs)
  const addAssessmentToStore = useDiagnosticStore((s) => s.addAssessment)

  const [phase, setPhase] = useState(results ? 'results' : 'questioning')
  const [questions, setQuestions] = useState([])
  const [qaPairs, setLocalQAPairs] = useState(qaPairsInStore)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [answer, setAnswer] = useState('')
  const [validationError, setValidationError] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  function syncPairs(nextPairs) {
    setLocalQAPairs(nextPairs)
    setQAPairs(nextPairs)
  }

  function getBootQuestion() {
    const q = getNextFoundationQuestion(0) || getFirstQuestion() || { question: FIRST_FALLBACK }
    return typeof q === 'string' ? q : q?.question || FIRST_FALLBACK
  }

  function bootFreshAssessment(message = 'Assessment restarted.') {
    const firstQuestion = getBootQuestion()
    setAssessmentResults(null)
    syncPairs([])
    setQuestions([firstQuestion])
    setCurrentIndex(0)
    setAnswer('')
    setValidationError('')
    setInfoMessage(message)
    setPhase('questioning')

    setTimeout(() => {
      textRef.current?.focus()
    }, 50)
  }

  useEffect(() => {
    if (searchParams.get('restart') === '1') {
      bootFreshAssessment('Assessment restarted from sidebar.')
      setSearchParams({}, { replace: true })
      return
    }

    if (results) {
      setPhase('results')
      return
    }

    if (currentIndex === -1) {
      const firstQuestion = getBootQuestion()
      setQuestions([firstQuestion])
      setCurrentIndex(0)
      setPhase('questioning')

      setTimeout(() => {
        textRef.current?.focus()
      }, 50)
    }
  }, [results, currentIndex, searchParams, setSearchParams])

  const currentQuestion = questions[currentIndex] || (currentIndex === 0 ? FIRST_FALLBACK : null)
  const answeredCount = qaPairs.filter((item) => item?.answer?.trim()).length
  const currentNumber = Math.max(currentIndex + 1, 1)
  const progress = Math.min(Math.round((answeredCount / TOTAL_QUESTIONS) * 100), 100)
  const isLastStep = currentIndex === TOTAL_QUESTIONS - 1

  const helperText = useMemo(() => {
    if (validationError) return validationError
    if (infoMessage) return infoMessage
    if (!answer.trim()) return 'Use specific facts, evidence, traction, risks, or economics.'
    return 'Cmd/Ctrl + Enter to continue.'
  }, [validationError, infoMessage, answer])

  function normalizeText(value) {
    return value.replace(/\s+/g, ' ').trim()
  }

  function wordCount(value) {
    return normalizeText(value).split(' ').filter(Boolean).length
  }

  function validateAnswer(value) {
    const trimmed = normalizeText(value)
    if (!trimmed) return 'Please answer the question before continuing.'
    if (trimmed.length < MIN_CHARS || wordCount(trimmed) < MIN_WORDS) {
      return 'Please write at least one short but meaningful sentence.'
    }
    return ''
  }

  async function ensureQuestionExists(index, existingPairs, existingQuestions) {
    if (existingQuestions[index]) return existingQuestions[index]

    const foundation = getNextFoundationQuestion(index)

    if (typeof foundation === 'string') {
      const nextQuestions = [...existingQuestions]
      nextQuestions[index] = foundation
      setQuestions(nextQuestions)
      return foundation
    }

    if (foundation?.question) {
      const nextQuestions = [...existingQuestions]
      nextQuestions[index] = foundation.question
      setQuestions(nextQuestions)
      return foundation.question
    }

    const history = buildConversationHistory(existingPairs)
    const generated = await generateNextQuestion(history, index)

    if (!generated) return null

    const nextQuestions = [...existingQuestions]
    nextQuestions[index] = generated
    setQuestions(nextQuestions)
    return generated
  }

  async function handleNext() {
    if (isLoading || !currentQuestion) return

    const error = validateAnswer(answer)
    setValidationError(error)
    setInfoMessage('')
    if (error) return

    const nextPairs = [...qaPairs]
    nextPairs[currentIndex] = {
      question: currentQuestion,
      answer: answer.trim(),
    }
    syncPairs(nextPairs)

    if (isLastStep) {
      setPhase('review')
      return
    }

    setIsLoading(true)

    try {
      const nextIndex = currentIndex + 1
      const nextQuestion = await ensureQuestionExists(nextIndex, nextPairs, questions)

      if (!nextQuestion) {
        setPhase('review')
        return
      }

      setCurrentIndex(nextIndex)
      setAnswer(nextPairs[nextIndex]?.answer ?? '')
      setValidationError('')
    } catch (err) {
      console.error(err)
      setValidationError(err?.message || 'Could not load the next question.')
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        textRef.current?.focus()
      }, 50)
    }
  }

  function handlePrevious() {
    if (currentIndex <= 0 || isLoading) return

    const nextPairs = [...qaPairs]
    nextPairs[currentIndex] = {
      question: currentQuestion,
      answer: answer.trim(),
    }
    syncPairs(nextPairs)

    const prevIndex = currentIndex - 1
    setCurrentIndex(prevIndex)
    setAnswer(nextPairs[prevIndex]?.answer ?? '')
    setValidationError('')
    setInfoMessage('')

    setTimeout(() => {
      textRef.current?.focus()
    }, 50)
  }

  function handleEdit(index) {
    setCurrentIndex(index)
    setAnswer(qaPairs[index]?.answer ?? '')
    setValidationError('')
    setInfoMessage('')
    setPhase('questioning')

    setTimeout(() => {
      textRef.current?.focus()
    }, 50)
  }

  async function handleScore() {
    setIsLoading(true)
    setPhase('scoring')

    try {
      const finalPairs = qaPairs.filter((item) => item?.question && item?.answer?.trim())
      const history = buildConversationHistory(finalPairs)
      const scores = await generateAssessmentScores(history, founderProfile ?? {})
      const finalResults = { ...scores, rawqa: finalPairs }

      setAssessmentResults(finalResults)
      setQAPairs(finalPairs)

      if (user?.id) {
        await addAssessmentToStore({
          founderscore: finalResults.founderscore,
          investorreadiness: finalResults.investorreadiness,
          strategicclarity: finalResults.strategicclarity,
          executionreadiness: finalResults.executionreadiness,
          financialmaturity: finalResults.financialmaturity,
          marketunderstanding: finalResults.marketunderstanding,
          teamstrength: finalResults.teamstrength,
          productclarity: finalResults.productclarity,
          growthpotential: finalResults.growthpotential,
          riskawareness: finalResults.riskawareness,
          venturestageresult: finalResults.venturestage,
          riskanalysis: finalResults.riskanalysis,
          strategicpriorities: finalResults.strategicpriorities,
          founderstrengths: finalResults.founderstrengths,
          criticalgaps: finalResults.criticalgaps,
          rawqa: finalPairs,
          vcverdict: finalResults.vcverdict,
          investornarrative: finalResults.investornarrative,
        })

        if (finalResults?.vcverdict) {
          await addMemory(user.id, 'pattern', finalResults.vcverdict, 5)
        }
      }

      track?.(EVENTS?.ASSESSMENTCOMPLETED || 'assessment_completed', {
        founderscore: finalResults?.founderscore,
        investorreadiness: finalResults?.investorreadiness,
      })

      setPhase('results')
    } catch (err) {
      console.error(err)
      setValidationError(err?.message || 'Scoring failed.')
      setPhase('review')
    } finally {
      setIsLoading(false)
    }
  }

  if (phase === 'review') {
    return (
      <div style={pageWrap}>
        <div style={cardWide}>
          <div style={eyebrow}>Final review</div>
          <h2 style={title}>Review your answers</h2>
          <p style={subtext}>Edit anything before generating the final founder assessment.</p>

          <div style={listWrap}>
            {qaPairs.map((item, index) => (
              <div key={`${index}-${item.question}`} style={listCard}>
                <div style={listTop}>
                  <div style={listLabel}>Question {index + 1}</div>
                  <button type="button" onClick={() => handleEdit(index)} style={smallBtn}>
                    Edit
                  </button>
                </div>
                <div style={listQuestion}>{item.question}</div>
                <div style={listAnswer}>{item.answer}</div>
              </div>
            ))}
          </div>

          <div style={footerRow}>
            <button
              type="button"
              onClick={() => handleEdit(Math.max(qaPairs.length - 1, 0))}
              style={secondaryBtn}
            >
              Back
            </button>
            <button type="button" onClick={handleScore} style={primaryBtn} disabled={isLoading}>
              {isLoading ? 'Scoring...' : 'Generate Final Score'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'scoring') {
    return (
      <div style={pageWrap}>
        <div style={card}>
          <div style={eyebrow}>Analysing responses</div>
          <h2 style={title}>Building your assessment</h2>
          <p style={subtext}>PATH360 is generating your founder assessment.</p>
        </div>
      </div>
    )
  }

  if (phase === 'results' && results) {
    return (
      <div style={pageWrap}>
        <div style={cardWide}>
          <div style={eyebrow}>Assessment complete</div>
          <h2 style={title}>Founder Score: {results.founderscore}</h2>
          <p style={subtext}>{results.vcverdict}</p>

          <div style={footerRow}>
            <button type="button" onClick={() => navigate('/app/dashboard')} style={primaryBtn}>
              Open Dashboard
            </button>
            <button
              type="button"
              onClick={() => bootFreshAssessment('Assessment restarted.')}
              style={secondaryBtn}
            >
              Redo Assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageWrap}>
      <div style={card}>
        <div style={progressRow}>
          <div style={progressTrack}>
            <div style={{ ...progressBar, width: `${progress}%` }} />
          </div>
          <div style={progressText}>{currentNumber}/{TOTAL_QUESTIONS}</div>
        </div>

        <div style={eyebrow}>Question {currentNumber}</div>
        <h2 style={title}>{currentQuestion || FIRST_FALLBACK}</h2>
        <p style={subtext}>Be specific about customer, traction, market, business model, risk, or timing.</p>

        <textarea
          ref={textRef}
          rows={7}
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value)
            if (validationError) setValidationError('')
            if (infoMessage) setInfoMessage('')
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              handleNext()
            }
          }}
          style={textareaStyle}
          placeholder="Write your answer here..."
          disabled={isLoading}
        />

        <div style={helperStyle(validationError, infoMessage)}>{helperText}</div>

        <div style={footerRow}>
          <button
            type="button"
            onClick={handlePrevious}
            style={secondaryBtn}
            disabled={currentIndex <= 0 || isLoading}
          >
            Previous
          </button>
          <button type="button" onClick={handleNext} style={primaryBtn} disabled={isLoading}>
            {isLoading ? 'Thinking...' : isLastStep ? 'Review Answers' : 'Next Question'}
          </button>
        </div>
      </div>
    </div>
  )
}

const pageWrap = {
  minHeight: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
  padding: '40px 24px 56px',
  background: '#F6F5F1',
}

const card = {
  width: '100%',
  maxWidth: 760,
  background: '#FCFBF8',
  border: '1px solid rgba(17,17,17,0.08)',
  borderRadius: 28,
  padding: '32px',
  boxShadow: '0 28px 70px rgba(17,17,17,0.08)',
}

const cardWide = {
  ...card,
  maxWidth: 920,
}

const eyebrow = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.14em',
  textTransform: 'uppercase',
  color: '#4D6B57',
  marginBottom: 12,
}

const title = {
  margin: '0 0 12px',
  fontSize: 34,
  lineHeight: 1.12,
  letterSpacing: '-0.04em',
  color: '#181818',
  fontWeight: 800,
}

const subtext = {
  margin: '0 0 18px',
  fontSize: 14.5,
  lineHeight: 1.75,
  color: '#6A6A66',
}

const progressRow = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  marginBottom: 18,
}

const progressTrack = {
  flex: 1,
  height: 6,
  borderRadius: 999,
  background: '#E5E0D7',
  overflow: 'hidden',
}

const progressBar = {
  height: '100%',
  borderRadius: 999,
  background: 'linear-gradient(90deg, #163A2C 0%, #2D6A4F 100%)',
}

const progressText = {
  fontSize: 12,
  fontWeight: 700,
  color: '#8B8B86',
  minWidth: 48,
  textAlign: 'right',
}

const textareaStyle = {
  width: '100%',
  minHeight: 190,
  resize: 'vertical',
  borderRadius: 18,
  background: '#F7F6F2',
  padding: '16px',
  fontSize: 15,
  lineHeight: 1.7,
  color: '#111111',
  outline: 'none',
  border: '1px solid rgba(17,17,17,0.10)',
  boxShadow: 'inset 0 1px 2px rgba(17,17,17,0.03)',
  fontFamily: '"DM Sans", system-ui, sans-serif',
}

function helperStyle(hasError, hasNotice) {
  return {
    marginTop: 10,
    minHeight: 22,
    fontSize: 12.5,
    lineHeight: 1.6,
    color: hasError ? '#8B2020' : hasNotice ? '#185FA5' : '#7B7B74',
  }
}

const footerRow = {
  marginTop: 18,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 14,
  flexWrap: 'wrap',
}

const primaryBtn = {
  height: 52,
  padding: '0 22px',
  borderRadius: 14,
  border: 'none',
  background: '#163A2C',
  color: '#FFFFFF',
  fontSize: 14.5,
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 16px 32px rgba(22,58,44,0.18)',
}

const secondaryBtn = {
  height: 52,
  padding: '0 22px',
  borderRadius: 14,
  border: '1px solid rgba(17,17,17,0.10)',
  background: '#F7F4EE',
  color: '#163A2C',
  fontSize: 14.5,
  fontWeight: 700,
  cursor: 'pointer',
}

const listWrap = {
  display: 'grid',
  gap: 14,
  marginTop: 24,
}

const listCard = {
  background: '#F7F4EE',
  border: '1px solid rgba(17,17,17,0.08)',
  borderRadius: 20,
  padding: '18px',
}

const listTop = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  marginBottom: 10,
  flexWrap: 'wrap',
}

const listLabel = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#7A7A72',
}

const smallBtn = {
  border: '1px solid rgba(17,17,17,0.10)',
  background: '#FFFFFF',
  color: '#163A2C',
  borderRadius: 10,
  padding: '8px 12px',
  fontSize: 12.5,
  fontWeight: 700,
  cursor: 'pointer',
}

const listQuestion = {
  fontSize: 17,
  lineHeight: 1.45,
  color: '#181818',
  fontWeight: 700,
  marginBottom: 10,
}

const listAnswer = {
  fontSize: 14.5,
  lineHeight: 1.8,
  color: '#5F655F',
  whiteSpace: 'pre-wrap',
}