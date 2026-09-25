import { useEffect, useMemo, useState } from 'react'
import './lessonPage.css'

const storageKey = 'path360-academy-lesson-progress-v1'

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '{}')
  } catch {
    return {}
  }
}

function saveProgress(lessonKey, payload) {
  const current = readProgress()

  const next = {
    ...current,
    [lessonKey]: {
      ...current[lessonKey],
      ...payload,
      updatedAt: new Date().toISOString(),
    },
  }

  localStorage.setItem(storageKey, JSON.stringify(next))
  return next
}

function getInitialAnswers(lesson) {
  const saved = readProgress()[lesson.key]

  return Object.fromEntries(
    (lesson.reflection?.questions ?? []).map((question, index) => [
      `reflection-${index}`,
      saved?.reflections?.[`reflection-${index}`] ?? '',
    ]),
  )
}

function getInitialOutput(lesson) {
  const saved = readProgress()[lesson.key]

  return Object.fromEntries(
    (lesson.output?.fields ?? []).map((field) => [
      field.key,
      saved?.output?.[field.key] ?? '',
    ]),
  )
}

export default function LessonPage({
  lesson,
  onBackToWorkshop,
  onSave,
}) {
  const [reflections, setReflections] = useState(() => getInitialAnswers(lesson))
  const [output, setOutput] = useState(() => getInitialOutput(lesson))
  const [savedAt, setSavedAt] = useState(null)
  const [isComplete, setIsComplete] = useState(() => {
    return readProgress()[lesson.key]?.status === 'completed'
  })

  const completionReady = useMemo(() => {
    const hasReflection = Object.values(reflections).some(
      (value) => value.trim().length > 0,
    )

    const hasOutput = Object.values(output).some(
      (value) => value.trim().length > 0,
    )

    return hasReflection && hasOutput
  }, [reflections, output])

  useEffect(() => {
    setReflections(getInitialAnswers(lesson))
    setOutput(getInitialOutput(lesson))
    setIsComplete(readProgress()[lesson.key]?.status === 'completed')
    setSavedAt(null)
  }, [lesson])

  function handleSave(markComplete = false) {
    const nextStatus = markComplete && completionReady
      ? 'completed'
      : 'in-progress'

    const payload = {
      status: nextStatus,
      reflections,
      output,
    }

    saveProgress(lesson.key, payload)
    setIsComplete(nextStatus === 'completed')
    setSavedAt(new Date())

    onSave?.({
      lessonKey: lesson.key,
      stageKey: lesson.stageKey,
      workshopKey: lesson.workshopKey,
      ...payload,
    })
  }

  return (
    <main className="academy-lesson-page">
      <div className="academy-lesson-container">
        <button
          className="academy-back-link"
          type="button"
          onClick={onBackToWorkshop}
        >
          ← Back to workshop
        </button>

        <header className="academy-lesson-header">
          <p className="academy-kicker">
            Lesson {lesson.number} · {lesson.framework}
          </p>

          <h1>{lesson.title}</h1>

          <p className="academy-lesson-meta">
            Approximately {lesson.estimatedMinutes ?? 30} minutes
          </p>
        </header>

        <section className="academy-lesson-section">
          <p className="academy-section-kicker">Introduction</p>
          <h2>{lesson.introduction?.heading}</h2>

          {(lesson.introduction?.body ?? []).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </section>

        {lesson.caseStudy && (
          <section className="academy-lesson-section academy-case-study">
            <p className="academy-section-kicker">Case study</p>
            <h2>{lesson.caseStudy.title}</h2>

            {lesson.caseStudy.organisation && (
              <p className="academy-case-study-label">
                {lesson.caseStudy.organisation}
              </p>
            )}

            <p>{lesson.caseStudy.summary}</p>

            {lesson.caseStudy.insight && (
              <p className="academy-case-study-insight">
                <strong>What this shows:</strong> {lesson.caseStudy.insight}
              </p>
            )}

            {lesson.caseStudy.prompt && (
              <p className="academy-case-study-prompt">
                <strong>Consider:</strong> {lesson.caseStudy.prompt}
              </p>
            )}
          </section>
        )}

        {lesson.view && (
          <section className="academy-lesson-section">
            <p className="academy-section-kicker">View</p>
            <h2>{lesson.view.title}</h2>
            <p>{lesson.view.description}</p>

            <div className="academy-framework-grid">
              {(lesson.view.items ?? []).map((item) => (
                <article className="academy-framework-card" key={item.label}>
                  <h3>{item.label}</h3>
                  <p>{item.description}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {(lesson.resources ?? []).length > 0 && (
          <section className="academy-lesson-section">
            <p className="academy-section-kicker">Read or watch</p>
            <h2>Build your understanding</h2>

            <div className="academy-resource-list">
              {lesson.resources.map((resource) => (
                <article className="academy-resource-card" key={resource.title}>
                  <p className="academy-resource-type">
                    {resource.type === 'watch' ? 'Watch' : 'Read'}
                  </p>

                  <h3>{resource.title}</h3>
                  <p>{resource.description}</p>

                  {resource.href && (
                    <a href={resource.href}>Open resource →</a>
                  )}

                  {resource.videoUrl && (
                    <a
                      href={resource.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Watch video →
                    </a>
                  )}

                  {!resource.href && !resource.videoUrl && (
                    <p className="academy-resource-coming-soon">
                      Resource coming soon
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="academy-lesson-section">
          <p className="academy-section-kicker">Self-reflection</p>
          <h2>{lesson.reflection?.title ?? 'Guided self-reflection'}</h2>

          <div className="academy-reflection-list">
            {(lesson.reflection?.questions ?? []).map((question, index) => {
              const key = `reflection-${index}`

              return (
                <label className="academy-reflection-field" key={key}>
                  <span>{index + 1}. {question}</span>

                  <textarea
                    value={reflections[key] ?? ''}
                    onChange={(event) => {
                      setReflections((current) => ({
                        ...current,
                        [key]: event.target.value,
                      }))
                    }}
                    placeholder="Write your response here..."
                    rows={4}
                  />
                </label>
              )
            })}
          </div>
        </section>

        <section className="academy-lesson-section academy-lesson-output">
          <p className="academy-section-kicker">Lesson output</p>
          <h2>{lesson.output?.title}</h2>
          <p>{lesson.output?.description}</p>

          <div className="academy-output-list">
            {(lesson.output?.fields ?? []).map((field) => (
              <label className="academy-output-field" key={field.key}>
                <span>{field.label}</span>

                <textarea
                  value={output[field.key] ?? ''}
                  onChange={(event) => {
                    setOutput((current) => ({
                      ...current,
                      [field.key]: event.target.value,
                    }))
                  }}
                  placeholder={field.placeholder}
                  rows={4}
                />
              </label>
            ))}
          </div>
        </section>

        <section className="academy-save-panel">
          <div>
            <p className="academy-section-kicker">Save your work</p>
            <h2>{isComplete ? 'Lesson completed' : 'Keep your learning moving'}</h2>

            <p>
              {isComplete
                ? 'Your reflections and lesson output have been saved.'
                : 'Save a draft at any time. Mark the lesson complete when you have recorded at least one reflection and one output.'}
            </p>

            {lesson.healthImpact?.prompt && (
              <p className="academy-health-prompt">
                {lesson.healthImpact.prompt}
              </p>
            )}

            {savedAt && (
              <p className="academy-save-confirmation">
                Saved at {savedAt.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>

          <div className="academy-save-actions">
            <button
              className="academy-secondary-button"
              type="button"
              onClick={() => handleSave(false)}
            >
              Save draft
            </button>

            <button
              className="academy-primary-button"
              type="button"
              onClick={() => handleSave(true)}
              disabled={!completionReady}
            >
              {isComplete ? 'Save changes' : 'Complete lesson'}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}