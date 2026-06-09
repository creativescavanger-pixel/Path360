import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { getDocumentGuide } from '../lib/documentGuides.js'

function buildInitialAnswers(guide) {
  const initial = {}
  guide.sections.forEach((section) => {
    section.questions.forEach((q) => {
      initial[q.key] = ''
    })
  })
  return initial
}

function countAnswered(guide, answers) {
  let total = 0
  let answered = 0

  guide.sections.forEach((section) => {
    section.questions.forEach((q) => {
      total += 1
      if (String(answers[q.key] || '').trim()) answered += 1
    })
  })

  return { total, answered }
}

function collectMissingRequired(guide, answers) {
  const missing = []

  guide.sections.forEach((section) => {
    section.questions.forEach((q) => {
      if (q.required && !String(answers[q.key] || '').trim()) {
        missing.push({ key: q.key, label: q.label, section: section.title })
      }
    })
  })

  return missing
}

function buildStructuredPayload(guide, answers, founderProfile, assessmentResults) {
  return {
    guideId: guide.id,
    guideTitle: guide.title,
    generatedAt: new Date().toISOString(),
    founderProfile: founderProfile || null,
    assessmentResults: assessmentResults || null,
    outputFormat: guide.outputFormat,
    sections: guide.sections.map((section) => ({
      key: section.key,
      title: section.title,
      description: section.description,
      answers: section.questions.map((q) => ({
        key: q.key,
        label: q.label,
        value: String(answers[q.key] || '').trim(),
        required: !!q.required,
      })),
    })),
    flatAnswers: Object.fromEntries(
      Object.entries(answers).map(([key, value]) => [key, String(value || '').trim()])
    ),
  }
}

export default function GuidedDocumentPrep() {
  const { docType } = useParams()
  const navigate = useNavigate()

  const guide = useMemo(() => getDocumentGuide(docType), [docType])

  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const assessmentResults = useDiagnosticStore((s) => s.assessmentResults)

  const setStudioDraft = useDiagnosticStore((s) => s.setStudioDraft)
  const setStudioIntent = useDiagnosticStore((s) => s.setStudioIntent)

  const [answers, setAnswers] = useState(() => (guide ? buildInitialAnswers(guide) : {}))
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  if (!guide) {
    return (
      <div style={{ padding: 24 }}>
        <div className="p360-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#111111' }}>
            Guided prep not found
          </div>
          <div style={{ fontSize: 14, color: '#5F675F', marginBottom: 16 }}>
            This guided document type does not exist.
          </div>
          <button className="p360-btn-primary" onClick={() => navigate('/app/studio')}>
            Back to Studio
          </button>
        </div>
      </div>
    )
  }

  const { total, answered } = countAnswered(guide, answers)
  const completion = total ? Math.round((answered / total) * 100) : 0
  const missing = attemptedSubmit ? collectMissingRequired(guide, answers) : []

  const updateAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  const handleSaveAndContinue = () => {
    setAttemptedSubmit(true)

    const requiredMissing = collectMissingRequired(guide, answers)
    if (requiredMissing.length) return

    const structured = buildStructuredPayload(guide, answers, founderProfile, assessmentResults)

    if (typeof setStudioDraft === 'function') {
      setStudioDraft(structured)
    }

    if (typeof setStudioIntent === 'function') {
      setStudioIntent({
        docType: guide.id,
        title: guide.studioLabel || guide.title,
        mode: 'guided',
        promptMode: 'structured',
        outputFormat: guide.outputFormat,
      })
    }

    navigate(guide.successRedirect || '/app/studio', {
      state: {
        guidedDocType: guide.id,
        guidedDraft: structured,
      },
    })
  }

  return (
    <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18, alignItems: 'start' }}>
      <aside
        className="p360-card"
        style={{
          padding: 18,
          position: 'sticky',
          top: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#4D6B57',
              marginBottom: 8,
            }}
          >
            Guided preparation
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, color: '#111111', marginBottom: 8 }}>
            {guide.title}
          </div>
          <div style={{ fontSize: 13.5, color: '#5F675F', lineHeight: 1.7 }}>{guide.intro}</div>
        </div>

        <div
          style={{
            background: '#F6F8F5',
            border: '1px solid #E3E8E2',
            borderRadius: 14,
            padding: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#111111', marginBottom: 8 }}>
            Completion
          </div>
          <div style={{ height: 10, borderRadius: 999, background: '#E4EAE3', overflow: 'hidden', marginBottom: 8 }}>
            <div
              style={{
                width: `${completion}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #1A7A4A 0%, #2F9C66 100%)',
              }}
            />
          </div>
          <div style={{ fontSize: 12.5, color: '#5F675F' }}>
            {answered} of {total} answered · {completion}%
          </div>
        </div>

        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#111111', marginBottom: 8 }}>
            Final output format
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {guide.outputFormat.map((item) => (
              <div
                key={item}
                style={{
                  fontSize: 12.5,
                  color: '#2A2F2A',
                  background: '#F7F8F5',
                  border: '1px solid #E4E8E3',
                  borderRadius: 10,
                  padding: '8px 10px',
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: '#FCFBF8',
            border: '1px solid #EEE7DA',
            borderRadius: 14,
            padding: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#111111', marginBottom: 6 }}>
            Writing guidance
          </div>
          <div style={{ fontSize: 12.5, color: '#5F675F', lineHeight: 1.7 }}>{guide.helper}</div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate('/app/studio')}
            style={{
              flex: 1,
              border: '1px solid #D9DFD7',
              background: '#FFFFFF',
              borderRadius: 12,
              padding: '11px 14px',
              fontWeight: 700,
              fontSize: 13,
              color: '#5F675F',
            }}
          >
            Cancel
          </button>
          <button className="p360-btn-primary" onClick={handleSaveAndContinue} style={{ flex: 1 }}>
            Continue
          </button>
        </div>
      </aside>

      <main style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {missing.length > 0 && (
          <div
            className="p360-card"
            style={{
              padding: 16,
              border: '1px solid #F0D5D5',
              background: '#FFF8F8',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, color: '#7D2C2C', marginBottom: 8 }}>
              Please complete the required questions
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {missing.map((item) => (
                <div key={item.key} style={{ fontSize: 12.5, color: '#7D2C2C' }}>
                  {item.section}: {item.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {guide.sections.map((section, sectionIndex) => (
          <section key={section.key} className="p360-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 10,
                  background: '#F1F4F0',
                  color: '#1A7A4A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                {sectionIndex + 1}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#111111' }}>{section.title}</div>
                <div style={{ fontSize: 12.5, color: '#8B938B', marginTop: 2 }}>{section.description}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              {section.questions.map((q) => {
                const value = answers[q.key] || ''
                const showError = attemptedSubmit && q.required && !String(value).trim()

                return (
                  <div key={q.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>
                      {q.label}
                      {q.required ? <span style={{ color: '#A33A3A' }}> *</span> : null}
                    </label>

                    {q.type === 'textarea' ? (
                      <textarea
                        value={value}
                        onChange={(e) => updateAnswer(q.key, e.target.value)}
                        placeholder={q.placeholder || 'Write your answer here...'}
                        rows={5}
                        style={{
                          width: '100%',
                          borderRadius: 14,
                          border: showError ? '1px solid #D66A6A' : '1px solid #D9DFD7',
                          background: '#FFFFFF',
                          padding: 14,
                          fontSize: 13.5,
                          lineHeight: 1.7,
                          color: '#2A2F2A',
                          resize: 'vertical',
                          minHeight: 120,
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <input
                        value={value}
                        onChange={(e) => updateAnswer(q.key, e.target.value)}
                        placeholder={q.placeholder || 'Write your answer here...'}
                        style={{
                          width: '100%',
                          borderRadius: 14,
                          border: showError ? '1px solid #D66A6A' : '1px solid #D9DFD7',
                          background: '#FFFFFF',
                          padding: 14,
                          fontSize: 13.5,
                          color: '#2A2F2A',
                          outline: 'none',
                        }}
                      />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 11.5, color: showError ? '#B44B4B' : '#8B938B' }}>
                        {showError ? 'This field is required.' : q.required ? 'Required' : 'Optional'}
                      </div>
                      {q.maxLength ? (
                        <div style={{ fontSize: 11.5, color: '#8B938B' }}>
                          {String(value).length}/{q.maxLength}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}