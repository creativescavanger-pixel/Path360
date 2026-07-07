import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  STAGE_DIAGNOSIS_QUESTIONS,
  diagnoseFounderStage,
} from '../lib/founderStageEngine.js'

export default function FounderStageIntake() {
  const navigate = useNavigate()

  const [answers, setAnswers] = useState({})
  const [showResult, setShowResult] = useState(false)

  const setFounderStageDiagnosis = useDiagnosticStore((s) => s.setFounderStageDiagnosis)

  const completion = useMemo(() => {
    const total = STAGE_DIAGNOSIS_QUESTIONS.length
    const done = STAGE_DIAGNOSIS_QUESTIONS.filter((q) => answers[q.id]).length
    return { total, done, percent: Math.round((done / total) * 100) }
  }, [answers])

  const diagnosis = useMemo(() => {
    return diagnoseFounderStage(answers)
  }, [answers])

  function handleSelect(questionId, value) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  function handleGeneratePath() {
    const result = diagnoseFounderStage(answers)
    setFounderStageDiagnosis({
      answers,
      ...result,
      createdAt: new Date().toISOString(),
    })
    setShowResult(true)
  }

  function handleContinue() {
    navigate('/app/dashboard')
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 18,
          padding: 22,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: '#8A6E2A',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Founder journey setup
        </div>

        <h1
          style={{
            fontSize: 28,
            lineHeight: 1.2,
            margin: '0 0 8px',
            color: '#1C1C1A',
            fontWeight: 700,
            letterSpacing: '-0.03em',
          }}
        >
          Let’s determine where you are right now
        </h1>

        <p
          style={{
            margin: 0,
            color: '#6B6965',
            fontSize: 13.5,
            lineHeight: 1.75,
            maxWidth: 760,
          }}
        >
          Answer a few short questions. Path360 will identify your stage, explain what it means, and tailor the next
          guided documents and recommendations to your current reality.
        </p>

        <div style={{ marginTop: 14 }}>
          <div
            style={{
              width: '100%',
              height: 8,
              borderRadius: 999,
              background: '#EEE9DF',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${completion.percent}%`,
                height: '100%',
                background: '#1D6B4F',
              }}
            />
          </div>
          <div style={{ marginTop: 6, fontSize: 11.5, color: '#8C8A84' }}>
            {completion.done} of {completion.total} answered
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.8fr', gap: 16, alignItems: 'start' }}>
        <div style={{ display: 'grid', gap: 14 }}>
          {STAGE_DIAGNOSIS_QUESTIONS.map((q, idx) => (
            <section
              key={q.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2DED6',
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 11, color: '#8C8A84', marginBottom: 6 }}>Question {idx + 1}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1C1C1A', marginBottom: 10 }}>{q.label}</div>

              <div style={{ display: 'grid', gap: 8 }}>
                {q.options.map((opt) => {
                  const active = answers[q.id] === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(q.id, opt.value)}
                      style={{
                        textAlign: 'left',
                        borderRadius: 10,
                        border: active ? '1.5px solid #1D6B4F' : '1px solid #E2DED6',
                        background: active ? '#EAF1EB' : '#F7F5F0',
                        padding: '10px 12px',
                        cursor: 'pointer',
                        fontSize: 12.5,
                        color: active ? '#1D6B4F' : '#3C3A36',
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </section>
          ))}

          <section
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2DED6',
              borderRadius: 14,
              padding: 16,
            }}
          >
            <button
              type="button"
              onClick={handleGeneratePath}
              disabled={completion.done < STAGE_DIAGNOSIS_QUESTIONS.length}
              style={{
                background:
                  completion.done < STAGE_DIAGNOSIS_QUESTIONS.length ? '#A7BBAF' : '#1D6B4F',
                border: '1px solid #1D6B4F',
                borderRadius: 10,
                padding: '11px 18px',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13,
                cursor:
                  completion.done < STAGE_DIAGNOSIS_QUESTIONS.length ? 'default' : 'pointer',
              }}
            >
              Generate my founder path
            </button>
          </section>
        </div>

        <aside
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 14,
            padding: 16,
            position: 'sticky',
            top: 18,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1A', marginBottom: 8 }}>
            What this will do
          </div>
          <div style={{ fontSize: 12.5, color: '#6B6965', lineHeight: 1.7, marginBottom: 12 }}>
            We use your answers to determine whether you are at idea, validation, MVP, traction, or growth-readiness
            stage, then tailor your guided flows and recommendations accordingly.
          </div>

          <div
            style={{
              background: '#F7F5F0',
              borderRadius: 10,
              padding: 12,
              fontSize: 12,
              color: '#6B6965',
              lineHeight: 1.6,
            }}
          >
            Founders at idea stage will still be able to create useful outputs such as a concept brief, MVP plan,
            TAM/SAM/SOM, and assumption-based financial projections.
          </div>
        </aside>
      </div>

      {showResult && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(16,16,16,0.34)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            zIndex: 50,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 760,
              background: '#FFFFFF',
              borderRadius: 20,
              padding: 24,
              boxShadow: '0 22px 60px rgba(0,0,0,0.18)',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: '#8A6E2A',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Your current stage
            </div>

            <h2
              style={{
                margin: '0 0 6px',
                fontSize: 28,
                lineHeight: 1.2,
                color: '#1C1C1A',
                fontWeight: 700,
              }}
            >
              {diagnosis.label}
            </h2>

            <div style={{ fontSize: 12, color: '#8C8A84', marginBottom: 12 }}>
              Confidence: {diagnosis.confidence}%
            </div>

            <p style={{ fontSize: 13.5, color: '#5D625C', lineHeight: 1.8, marginTop: 0 }}>
              {diagnosis.summary}
            </p>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1A', marginBottom: 6 }}>
                Recommended next steps
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {diagnosis.nextSteps.map((step, i) => (
                  <div
                    key={i}
                    style={{
                      background: '#F7F5F0',
                      border: '1px solid #ECE7DD',
                      borderRadius: 10,
                      padding: '10px 12px',
                      fontSize: 12.5,
                      color: '#3C3A36',
                    }}
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleContinue}
                style={{
                  background: '#1D6B4F',
                  border: '1px solid #1D6B4F',
                  borderRadius: 10,
                  padding: '10px 18px',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Continue into Path360
              </button>
              <button
                type="button"
                onClick={() => setShowResult(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid #E2DED6',
                  borderRadius: 10,
                  padding: '10px 18px',
                  color: '#3C3A36',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Review answers
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
