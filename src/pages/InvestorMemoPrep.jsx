import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

const QUESTIONS = [
  {
    key: 'audience',
    label: 'Who is this investor memo for?',
    placeholder: 'e.g. early-stage angels, climate-tech seed funds, strategic angels',
  },
  {
    key: 'raise',
    label: 'How much are you raising and what is the use of funds?',
    placeholder: 'Explain amount, purpose, and what milestones it unlocks.',
  },
  {
    key: 'traction',
    label: 'What traction or proof points matter most right now?',
    placeholder: 'Revenue, pilots, users, partnerships, retention, LOIs, product usage.',
  },
  {
    key: 'advantage',
    label: 'What makes this venture hard to copy?',
    placeholder: 'Insight, distribution, IP, community, team edge, data, partnerships.',
  },
  {
    key: 'concerns',
    label: 'What investor concerns are you most likely to face?',
    placeholder: 'Market timing, competition, monetization, team gaps, execution risk.',
  },
  {
    key: 'milestones',
    label: 'What should the next 12 months achieve?',
    placeholder: 'List the milestones this round should fund.',
  },
]

function countWords(value = '') {
  return value.trim().split(/\s+/).filter(Boolean).length
}

export default function InvestorMemoPrep() {
  const navigate = useNavigate()

  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const assessmentResults = useDiagnosticStore((s) => s.assessmentResults)
  const createDocumentIntake = useDiagnosticStore((s) => s.createDocumentIntake)

  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState(() =>
    QUESTIONS.map((q) => ({ key: q.key, question: q.label, answer: '' }))
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const current = QUESTIONS[step]
  const currentAnswer = answers[step]?.answer || ''
  const ventureName = founderProfile?.venturename || 'your venture'
  const progress = Math.round(((step + 1) / QUESTIONS.length) * 100)

  const helperText = useMemo(() => {
    if (error) return error
    return 'Be concise, specific, and investor-facing.'
  }, [error])

  function updateAnswer(value) {
    const next = [...answers]
    next[step] = { ...next[step], answer: value }
    setAnswers(next)
    if (error) setError('')
  }

  function validateCurrent() {
    const trimmed = currentAnswer.trim()
    if (!trimmed) return 'Please answer before continuing.'
    if (trimmed.length < 20 || countWords(trimmed) < 5) {
      return 'Please write at least one short but meaningful sentence.'
    }
    return ''
  }

  function handleNext() {
    const nextError = validateCurrent()
    if (nextError) {
      setError(nextError)
      return
    }

    if (step === QUESTIONS.length - 1) {
      handleSave()
      return
    }

    setStep((s) => s + 1)
  }

  function handleBack() {
    if (step === 0) return
    setStep((s) => s - 1)
  }

  async function handleSave() {
    const nextError = validateCurrent()
    if (nextError) {
      setError(nextError)
      return
    }

    try {
      setSaving(true)

      await createDocumentIntake(
        'investor_memo',
        `${ventureName} Investor Memo Prep`,
        answers,
        assessmentResults?.id || null
      )

      navigate('/app/studio')
    } catch (e) {
      console.error(e)
      setError(e?.message || 'Could not save your prep answers.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 24, display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: 860,
          background: '#FCFBF8',
          border: '1px solid #E3DED3',
          borderRadius: 24,
          padding: 28,
          boxShadow: '0 20px 40px rgba(17,17,17,0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
            flexWrap: 'wrap',
            marginBottom: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#4D6B57',
            }}
          >
            Guided document prep
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/studio')}
            disabled={saving}
            style={{
              border: '1px solid rgba(17,17,17,0.10)',
              background: '#F7F4EE',
              color: '#163A2C',
              borderRadius: 12,
              padding: '9px 14px',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back to Studio
          </button>
        </div>

        <h1 style={{ fontSize: 30, lineHeight: 1.15, margin: '0 0 10px', color: '#111111', fontWeight: 800 }}>
          Investor memo prep for {ventureName}
        </h1>

        <p
          style={{
            fontSize: 14.5,
            color: '#5F675F',
            lineHeight: 1.75,
            margin: '0 0 20px',
            maxWidth: 700,
          }}
        >
          Answer a few focused questions and PATH360 will use your founder profile, assessment, and these answers to
          shape stronger investor documents.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <div style={{ flex: 1, height: 6, background: '#E5E0D7', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #163A2C 0%, #2D6A4F 100%)',
              }}
            />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#8B8B86' }}>
            {step + 1}/{QUESTIONS.length}
          </div>
        </div>

        <div
          style={{
            marginBottom: 12,
            fontSize: 12,
            fontWeight: 700,
            color: '#7A827A',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Prompt
        </div>

        <h2 style={{ fontSize: 24, lineHeight: 1.3, margin: '0 0 14px', color: '#181818', fontWeight: 700 }}>
          {current.label}
        </h2>

        <textarea
          rows={8}
          value={currentAnswer}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder={current.placeholder}
          style={{
            width: '100%',
            minHeight: 210,
            borderRadius: 18,
            background: '#F7F6F2',
            padding: 16,
            fontSize: 15,
            lineHeight: 1.7,
            color: '#111111',
            outline: 'none',
            border: '1px solid rgba(17,17,17,0.10)',
            boxShadow: 'inset 0 1px 2px rgba(17,17,17,0.03)',
            fontFamily: '"DM Sans", system-ui, sans-serif',
            resize: 'vertical',
          }}
          disabled={saving}
        />

        <div
          style={{
            marginTop: 10,
            minHeight: 22,
            fontSize: 12.5,
            lineHeight: 1.6,
            color: error ? '#8B2020' : '#7B7B74',
          }}
        >
          {helperText}
        </div>

        <div
          style={{
            marginTop: 20,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || saving}
            style={{
              height: 50,
              padding: '0 20px',
              borderRadius: 14,
              border: '1px solid rgba(17,17,17,0.10)',
              background: '#F7F4EE',
              color: '#163A2C',
              fontSize: 14.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            style={{
              height: 50,
              padding: '0 20px',
              borderRadius: 14,
              border: 'none',
              background: '#163A2C',
              color: '#FFFFFF',
              fontSize: 14.5,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 16px 32px rgba(22,58,44,0.18)',
            }}
          >
            {saving ? 'Saving...' : step === QUESTIONS.length - 1 ? 'Save Prep Answers' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}