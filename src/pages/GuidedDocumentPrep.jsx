import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { getDocumentGuide } from '../lib/documentGuides.js'
import {
  getStudioDocumentDraftById,
  getLatestStudioDocumentDraft,
  saveStudioDocumentDraft,
} from '../lib/studioDocuments.js'
import { generateDocument } from '../lib/agentOrchestrator.js'
import { renderStructuredDocumentBodyToText } from '../lib/documentRenderer.js'
import { track, EVENTS } from '../lib/posthogClient.js'

function buildInitialAnswers(guide) {
  const initial = {}
  guide.sections.forEach((section) => {
    section.questions.forEach((q) => {
      initial[q.key] = ''
    })
  })
  return initial
}

function buildGuidedPayload(guideId, answers, founderProfile, assessmentResults) {
  return {
    guideId,
    flatAnswers: answers,
    founderProfile: founderProfile || null,
    assessmentResults: assessmentResults || null,
    createdAt: new Date().toISOString(),
  }
}

function mergeAnswersWithGuide(guide, incoming = {}) {
  const base = buildInitialAnswers(guide)
  Object.keys(base).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(incoming, key)) {
      base[key] = String(incoming[key] ?? '')
    }
  })
  return base
}

function getField(record, ...keys) {
  for (const key of keys) {
    if (record && record[key] !== undefined && record[key] !== null) {
      return record[key]
    }
  }
  return null
}

function normalizeGeneratedContent(content) {
  if (content === undefined || content === null) return ''
  return typeof content === 'string' ? content : renderStructuredDocumentBodyToText(content)
}

function getFieldIds(guideId, questionKey) {
  const safeGuide = String(guideId || 'guide')
  const safeKey = String(questionKey || 'field')
  return {
    inputId: `${safeGuide}-${safeKey}`,
    hintId: `${safeGuide}-${safeKey}-hint`,
    errorId: `${safeGuide}-${safeKey}-error`,
  }
}

function isQuestionAnswered(value) {
  return String(value || '').trim().length > 0
}

function getSectionStats(section, answers) {
  const total = section.questions.length
  const answered = section.questions.filter((q) => isQuestionAnswered(answers[q.key])).length
  const requiredTotal = section.questions.filter((q) => q.required).length
  const requiredAnswered = section.questions.filter((q) => q.required && isQuestionAnswered(answers[q.key])).length
  const complete = requiredTotal === 0 ? answered === total : requiredAnswered === requiredTotal

  return {
    total,
    answered,
    requiredTotal,
    requiredAnswered,
    complete,
    percent: total ? Math.round((answered / total) * 100) : 0,
  }
}

function getOverallStats(guide, answers) {
  let total = 0
  let answered = 0
  let completedSections = 0

  guide.sections.forEach((section) => {
    const stats = getSectionStats(section, answers)
    total += stats.total
    answered += stats.answered
    if (stats.complete) completedSections += 1
  })

  return {
    total,
    answered,
    completedSections,
    totalSections: guide.sections.length,
    percent: total ? Math.round((answered / total) * 100) : 0,
  }
}

function collectMissingRequiredForSection(section, answers) {
  return section.questions
    .filter((q) => q.required && !isQuestionAnswered(answers[q.key]))
    .map((q) => ({ key: q.key, label: q.label }))
}

function getCompletedSectionKeys(guide, answers) {
  return guide.sections
    .filter((section) => getSectionStats(section, answers).complete)
    .map((section) => section.key)
}

function getGuideGamification(guide) {
  return {
    progressLabel: guide?.gamification?.progressLabel || 'Build progress',
    completedLabel: guide?.gamification?.completedLabel || 'Category cleared',
    unlockedLabel: guide?.gamification?.unlockedLabel || 'Next category unlocked',
    finishLabel: guide?.gamification?.finishLabel || 'Prep complete',
  }
}

function getGuideExportTypes(guide) {
  if (Array.isArray(guide?.exportTypes) && guide.exportTypes.length) return guide.exportTypes
  if (guide?.id === 'pitch_deck') return ['pdf', 'docx', 'pptx']
  return ['pdf', 'docx']
}

function canExportType(guide, type) {
  return getGuideExportTypes(guide).includes(type)
}

function getCurrentStepStatus(index, currentSectionIndex, stats) {
  if (stats.complete) return 'complete'
  if (index === currentSectionIndex) return 'current'
  if (index < currentSectionIndex) return 'visited'
  return 'upcoming'
}

function getSaveStatusTone(saveStatus) {
  const lower = String(saveStatus || '').toLowerCase()
  if (lower.includes('fail')) return '#B44B4B'
  if (lower.includes('saving')) return '#9A7B20'
  return '#8B938B'
}

export default function GuidedDocumentPrep() {
  const { docType } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const autosaveTimer = useRef(null)
  const categoryJumpRef = useRef(false)

  const guide = useMemo(() => getDocumentGuide(docType), [docType])

  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const assessmentResults = useDiagnosticStore((s) => s.assessmentResults)
  const guidedDraftStore = useDiagnosticStore((s) => s.guidedDraft ?? null)
  const setGuidedDraft = useDiagnosticStore((s) => s.setGuidedDraft)
  const setGuidedIntent = useDiagnosticStore((s) => s.setGuidedIntent)
  const user = useDiagnosticStore((s) => s.user)

  const [answers, setAnswers] = useState(() => (guide ? buildInitialAnswers(guide) : {}))
  const [draftId, setDraftId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [loadingDraft, setLoadingDraft] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [attemptedNext, setAttemptedNext] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [generationError, setGenerationError] = useState('')
  const [generationWarning, setGenerationWarning] = useState('')
  const [exportStatus, setExportStatus] = useState('')
  const [categoryFlash, setCategoryFlash] = useState('')
  const [lastSavedCompletedSections, setLastSavedCompletedSections] = useState(0)

  useEffect(() => {
    if (!guide) return

    const stateDraft =
      location.state?.guidedDraft?.guideId === guide.id ? location.state.guidedDraft : null

    const storeDraft =
      guidedDraftStore?.guideId === guide.id ? guidedDraftStore : null

    const initialFlatAnswers =
      stateDraft?.flatAnswers ||
      storeDraft?.flatAnswers ||
      {}

    setAnswers(mergeAnswersWithGuide(guide, initialFlatAnswers))
    setAttemptedNext(false)
  }, [guide, location.state, guidedDraftStore])

  useEffect(() => {
    if (!guide || !user?.id) return

    const paramDraftId = searchParams.get('draft')
    let active = true

    async function loadDraft() {
      setLoadingDraft(true)

      try {
        let draft = null

        if (paramDraftId) {
          draft = await getStudioDocumentDraftById(paramDraftId)
        } else {
          draft = await getLatestStudioDocumentDraft(user.id, guide.id)
        }

        if (!active) return

        if (!draft) {
          setDraftId(null)
          setSaveStatus('No saved draft yet')
          setLastSavedCompletedSections(0)
          return
        }

        const rawDraftData =
          getField(draft, 'draftdata') ||
          getField(draft, 'draftData') ||
          {}

        const answersFromDraft = rawDraftData?.guidedAnswers || rawDraftData || {}
        const savedSectionIndex = Number(rawDraftData?.currentSectionIndex ?? 0)
        const savedGeneratedContent = getField(draft, 'generatedcontent', 'generatedContent') || ''
        const savedCompletedSectionKeys = rawDraftData?.completedSectionKeys || []

        setDraftId(getField(draft, 'id'))
        setAnswers(mergeAnswersWithGuide(guide, answersFromDraft))
        setCurrentSectionIndex(Number.isFinite(savedSectionIndex) ? savedSectionIndex : 0)
        setGeneratedContent(savedGeneratedContent)
        setLastSavedCompletedSections(Array.isArray(savedCompletedSectionKeys) ? savedCompletedSectionKeys.length : 0)
        setSaveStatus('Draft loaded')
      } catch (err) {
        console.error(err)
        if (active) setSaveStatus('Could not load draft')
      } finally {
        if (active) setLoadingDraft(false)
      }
    }

    loadDraft()

    return () => {
      active = false
    }
  }, [guide, user?.id, searchParams])

  const overall = guide ? getOverallStats(guide, answers) : null
  const currentSection = guide ? guide.sections[currentSectionIndex] : null
  const currentStats = currentSection ? getSectionStats(currentSection, answers) : null
  const currentMissing = currentSection && attemptedNext
    ? collectMissingRequiredForSection(currentSection, answers)
    : []
  const isLastSection = guide ? currentSectionIndex === guide.sections.length - 1 : false
  const allSectionsComplete = overall ? overall.completedSections === overall.totalSections : false
  const completedSectionKeys = guide ? getCompletedSectionKeys(guide, answers) : []
  const gamification = getGuideGamification(guide)
  const exportTypes = getGuideExportTypes(guide)

  async function saveDraft(status = 'draft', overrides = {}) {
    if (!guide || !user?.id) return null

    setSaving(true)
    setSaveStatus('Saving...')

    try {
      const nextAnswers = overrides.answers || answers
      const nextCompletedSectionKeys = getCompletedSectionKeys(guide, nextAnswers)
      const nextOverall = getOverallStats(guide, nextAnswers)

      const payload = {
        id: draftId || null,
        userId: user.id,
        docType: guide.id,
        objectiveId: null,
        title: guide.studioLabel || guide.title,
        status,
        customInstructions: '',
        draftData: {
          guidedAnswers: nextAnswers,
          guideId: guide.id,
          currentSectionIndex:
            typeof overrides.currentSectionIndex === 'number'
              ? overrides.currentSectionIndex
              : currentSectionIndex,
          completedSectionKeys: nextCompletedSectionKeys,
          percentComplete: nextOverall.percent,
          totalAnswered: nextOverall.answered,
          totalQuestions: nextOverall.total,
          guideVersion: guide.version || 1,
          lastVisitedAt: new Date().toISOString(),
          completedAt: overrides.completedAt || null,
        },
        generatedContent:
          overrides.generatedContent !== undefined ? overrides.generatedContent : generatedContent || null,
      }

      const saved = await saveStudioDocumentDraft(payload)
      setDraftId(saved?.id || null)
      setLastSavedCompletedSections(nextCompletedSectionKeys.length)
      setSaveStatus('Saved just now')
      return saved
    } catch (err) {
      console.error(err)
      setSaveStatus('Save failed')
      return null
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!guide || !user?.id) return

    clearTimeout(autosaveTimer.current)

    autosaveTimer.current = setTimeout(() => {
      void saveDraft('draft')
    }, 900)

    return () => clearTimeout(autosaveTimer.current)
  }, [answers, currentSectionIndex, guide, user?.id])

  useEffect(() => {
    return () => clearTimeout(autosaveTimer.current)
  }, [])

  useEffect(() => {
    if (!overall) return
    if (overall.completedSections > lastSavedCompletedSections) {
      if (currentSection?.completionLabel) {
        setCategoryFlash(currentSection.completionLabel)
      } else {
        setCategoryFlash(gamification.completedLabel)
      }
      const timer = setTimeout(() => setCategoryFlash(''), 2200)
      return () => clearTimeout(timer)
    }
  }, [overall?.completedSections])

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

  const updateAnswer = (key, value, maxLength) => {
    const nextValue =
      typeof maxLength === 'number' && maxLength > 0 ? String(value).slice(0, maxLength) : value

    setAnswers((prev) => ({ ...prev, [key]: nextValue }))
  }

  const handleSectionJump = async (index) => {
    categoryJumpRef.current = true
    setCurrentSectionIndex(index)
    setAttemptedNext(false)
    await saveDraft('draft', { currentSectionIndex: index })
  }

  const handlePrevious = async () => {
    if (currentSectionIndex === 0) return
    const nextIndex = currentSectionIndex - 1
    setCurrentSectionIndex(nextIndex)
    await saveDraft('draft', { currentSectionIndex: nextIndex })
    setAttemptedNext(false)
  }

  const handleNext = async () => {
    setAttemptedNext(true)

    const missing = collectMissingRequiredForSection(currentSection, answers)
    if (missing.length) {
      const firstMissing = missing[0]
      const firstMissingElement = document.getElementById(`${guide.id}-${firstMissing.key}`)
      if (firstMissingElement) firstMissingElement.focus()
      return
    }

    if (isLastSection) return

    const nextIndex = currentSectionIndex + 1
    setCurrentSectionIndex(nextIndex)
    await saveDraft('draft', { currentSectionIndex: nextIndex })
    setAttemptedNext(false)
    setCategoryFlash(gamification.unlockedLabel)
    setTimeout(() => setCategoryFlash(''), 1800)
  }

  const handleGenerateFinal = async () => {
    setAttemptedNext(true)

    const missing = collectMissingRequiredForSection(currentSection, answers)
    if (missing.length) {
      const firstMissing = missing[0]
      const firstMissingElement = document.getElementById(`${guide.id}-${firstMissing.key}`)
      if (firstMissingElement) firstMissingElement.focus()
      return
    }

    setIsGenerating(true)
    setGenerationError('')
    setGenerationWarning('')
    setExportStatus('')

    try {
      const answeredCount = Object.values(answers || {}).filter((value) => String(value || '').trim()).length
      const hasMeaningfulIntake = answeredCount > 0

      if (!hasMeaningfulIntake) {
        const warningMessage = 'This guided doc is missing intake answers, so generation will use a lighter fallback. You can continue to complete the fields and try again.'
        setGenerationWarning(warningMessage)
        track(EVENTS.STUDIO_DRAFT_GENERATED, {
          docType: guide.id,
          guided: true,
          warning: 'missing_intake',
        })
      }

      track(EVENTS.DOCUMENT_INTAKE_COMPLETED, {
        docType: guide.id,
        answeredQuestions: answeredCount,
      })
      const structured = buildGuidedPayload(guide.id, answers, founderProfile, assessmentResults)

      if (typeof setGuidedDraft === 'function') {
        setGuidedDraft(structured)
      }

      if (typeof setGuidedIntent === 'function') {
        setGuidedIntent({
          docType: guide.id,
          title: guide.studioLabel || guide.title,
          mode: 'guided',
          source: 'guided-workflow',
          outputFormat: guide.outputFormat,
          exportTypes,
          guideVersion: guide.version || 1,
          generationTemplate: guide.generationTemplate || guide.id,
        })
      }

      const content = await generateDocument({
        docType: guide.id,
        founderContext: {
          founderProfile,
          assessmentResults,
          guidedAnswers: answers,
        },
        customInstructions: '',
        objectiveId: null,
      })

      const normalized = normalizeGeneratedContent(content)
      setGeneratedContent(normalized)

      track(EVENTS.STUDIO_DRAFT_GENERATED, {
        docType: guide.id,
        guided: true,
      })

      const savedDraft = await saveDraft('generated', {
        generatedContent: normalized,
        completedAt: new Date().toISOString(),
      })

      navigate(guide.successRedirect || '/app/studio', {
        state: {
          guidedDocType: guide.id,
          guidedDraft: structured,
          studioDraftId: savedDraft?.id || draftId || null,
          generatedContent: normalized,
        },
      })
    } catch (err) {
      console.error(err)
      setGenerationError('Something went wrong while generating the final document.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportDocx = async () => {
    track(EVENTS.DOCUMENT_EXPORTED, {
      docType: guide?.id,
      format: 'docx',
      exportScope: 'progress',
      guided: true,
    })
    setExportStatus('Word export is the next backend wiring step.')
  }

  const handleExportPdf = async () => {
    track(EVENTS.DOCUMENT_EXPORTED, {
      docType: guide?.id,
      format: 'pdf',
      exportScope: 'progress',
      guided: true,
    })
    setExportStatus('PDF export is the next backend wiring step.')
  }

  const handleExportPpt = async () => {
    track(EVENTS.DOCUMENT_EXPORTED, {
      docType: guide?.id,
      format: 'ppt',
      exportScope: 'progress',
      guided: true,
    })
    setExportStatus('PPT export is the next backend wiring step.')
  }

  return (
    <div style={{ padding: 24, maxWidth: 1160 }}>
      <div
        className="p360-card"
        style={{
          padding: 18,
          marginBottom: 16,
          borderRadius: 18,
          background: '#F7F5EF',
          border: '1px solid #E7DFCF',
          boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#7A6A2F',
            marginBottom: 8,
          }}
        >
          Guided builder
        </div>

        <div style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1A', marginBottom: 8 }}>
          {guide.title}
        </div>

        <div style={{ fontSize: 13.5, color: '#6B6965', lineHeight: 1.7, marginBottom: 16 }}>
          {guide.intro || 'Complete one category at a time. Your progress is saved automatically so you can leave and return later.'}
        </div>

        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E7E2D8',
            borderRadius: 14,
            padding: 14,
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 800, color: '#1C1C1A', marginBottom: 6 }}>
            {gamification.progressLabel}
          </div>

          <div
            style={{
              height: 12,
              borderRadius: 999,
              background: '#E5E8E1',
              overflow: 'hidden',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: `${overall.percent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #1A7A4A 0%, #45B36B 100%)',
                transition: 'width 0.25s ease',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 12.5, color: '#5F675F' }}>
              {overall.answered} of {overall.total} questions answered
            </div>
            <div style={{ fontSize: 12.5, color: '#5F675F' }}>
              {overall.completedSections} of {overall.totalSections} categories completed
            </div>
            <div style={{ fontSize: 12.5, color: getSaveStatusTone(saveStatus) }}>
              {loadingDraft ? 'Loading draft...' : saveStatus || 'Draft ready'}
            </div>
          </div>
        </div>

        {categoryFlash ? (
          <div
            aria-live="polite"
            style={{
              background: '#EEF9F1',
              border: '1px solid #CFE8D3',
              borderRadius: 12,
              padding: '10px 12px',
              color: '#1A7A4A',
              fontSize: 12.5,
              fontWeight: 700,
            }}
          >
            {categoryFlash}
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '290px minmax(0, 1fr)',
          gap: 18,
          alignItems: 'start',
        }}
      >
        <aside className="p360-card p360-aside-sticky" style={{ padding: 16, borderRadius: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#111111', marginBottom: 12 }}>
            Category progress
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            {guide.sections.map((section, index) => {
              const stats = getSectionStats(section, answers)
              const status = getCurrentStepStatus(index, currentSectionIndex, stats)
              const isActive = index === currentSectionIndex

              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => handleSectionJump(index)}
                  style={{
                    textAlign: 'left',
                    border:
                      status === 'complete'
                        ? '1.5px solid #1A7A4A'
                        : isActive
                          ? '1.5px solid #A7B8AB'
                          : '1px solid #DDE3DA',
                    background:
                      status === 'complete'
                        ? '#EFF7F1'
                        : isActive
                          ? '#F7F8F6'
                          : '#FFFFFF',
                    borderRadius: 12,
                    padding: 12,
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 999,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 800,
                          background: status === 'complete' ? '#1A7A4A' : '#EEF1EC',
                          color: status === 'complete' ? '#FFFFFF' : '#607060',
                          flexShrink: 0,
                        }}
                      >
                        {status === 'complete' ? '✓' : index + 1}
                      </div>

                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1C1C1A' }}>
                        {section.title}
                      </div>
                    </div>

                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: stats.complete ? '#1A7A4A' : '#8B938B',
                      }}
                    >
                      {stats.complete ? 'Done' : `${stats.percent}%`}
                    </div>
                  </div>

                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: '#E8ECE6',
                      overflow: 'hidden',
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        width: `${stats.percent}%`,
                        height: '100%',
                        background: stats.complete
                          ? 'linear-gradient(90deg, #1A7A4A 0%, #45B36B 100%)'
                          : isActive
                            ? '#94B39B'
                            : '#BAC8BD',
                      }}
                    />
                  </div>

                  <div style={{ fontSize: 11.5, color: '#7D857D' }}>
                    {stats.answered} / {stats.total} answered
                  </div>
                </button>
              )
            })}
          </div>

          <div
            style={{
              background: '#FCFBF8',
              border: '1px solid #EEE7DA',
              borderRadius: 14,
              padding: 14,
              marginTop: 14,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: '#111111', marginBottom: 6 }}>
              Progress loop
            </div>
            <div style={{ fontSize: 12.5, color: '#5F675F', lineHeight: 1.7 }}>
              Complete each category to unlock momentum, reduce fatigue, and reach the final output faster.
            </div>
          </div>
        </aside>

        <main style={{ display: 'grid', gap: 16 }}>
          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 12,
                    background: '#F1F4F0',
                    color: '#1A7A4A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {currentSectionIndex + 1}
                </div>

                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#111111' }}>
                    {currentSection.title}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#8B938B', marginTop: 2 }}>
                    {currentSection.description}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#728072',
                  background: '#F7F8F6',
                  border: '1px solid #E1E7DE',
                  borderRadius: 999,
                  padding: '7px 10px',
                }}
              >
                Category {currentSectionIndex + 1} of {guide.sections.length}
              </div>
            </div>

            {currentSection.categoryIntro ? (
              <div
                style={{
                  background: '#F7FAF7',
                  border: '1px solid #E0EADF',
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 16,
                }}
              >
                <div style={{ fontSize: 12.5, color: '#536053', lineHeight: 1.7 }}>
                  {currentSection.categoryIntro}
                </div>
              </div>
            ) : null}

            <div style={{ marginTop: 12, marginBottom: 14 }}>
              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: '#E6ECE5',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${currentStats.percent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #1A7A4A 0%, #45B36B 100%)',
                    transition: 'width 0.25s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: 12, color: '#728072', marginTop: 8 }}>
                Category progress: {currentStats.answered} of {currentStats.total} answered
              </div>
            </div>

            {generationWarning ? (
              <div
                role="status"
                style={{
                  padding: 12,
                  marginBottom: 16,
                  border: '1px solid #E7D9A8',
                  background: '#FCF7E8',
                  borderRadius: 14,
                  color: '#7A6430',
                  fontSize: 12.5,
                  lineHeight: 1.6,
                }}
              >
                {generationWarning}
              </div>
            ) : null}

            {currentMissing.length > 0 && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  padding: 14,
                  marginBottom: 16,
                  border: '1px solid #F0D5D5',
                  background: '#FFF8F8',
                  borderRadius: 14,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: '#7D2C2C', marginBottom: 8 }}>
                  Finish these required questions before moving on
                </div>
                <div style={{ display: 'grid', gap: 6 }}>
                  {currentMissing.map((item) => (
                    <div key={item.key} style={{ fontSize: 12.5, color: '#7D2C2C' }}>
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gap: 14 }}>
              {currentSection.questions.map((q) => {
                const value = answers[q.key] || ''
                const showError = attemptedNext && q.required && !isQuestionAnswered(value)
                const { inputId, hintId, errorId } = getFieldIds(guide.id, q.key)
                const describedBy = showError ? `${hintId} ${errorId}` : hintId

                return (
                  <div key={q.key} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 700, color: '#111111' }}>
                      {q.label}
                      {q.required ? <span style={{ color: '#A33A3A' }}> *</span> : null}
                    </label>

                    {q.type === 'textarea' ? (
                      <textarea
                        id={inputId}
                        value={value}
                        maxLength={q.maxLength}
                        aria-invalid={showError ? 'true' : 'false'}
                        aria-describedby={describedBy}
                        onChange={(e) => updateAnswer(q.key, e.target.value, q.maxLength)}
                        placeholder={q.placeholder || 'Write your answer here...'}
                        rows={4}
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
                          minHeight: 110,
                          outline: 'none',
                        }}
                      />
                    ) : (
                      <input
                        id={inputId}
                        value={value}
                        maxLength={q.maxLength}
                        aria-invalid={showError ? 'true' : 'false'}
                        aria-describedby={describedBy}
                        onChange={(e) => updateAnswer(q.key, e.target.value, q.maxLength)}
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div id={hintId} style={{ fontSize: 11.5, color: '#8B938B' }}>
                          {q.required ? 'Required' : 'Optional'}
                        </div>
                        {showError ? (
                          <div id={errorId} aria-live="polite" style={{ fontSize: 11.5, color: '#B44B4B' }}>
                            This field is required.
                          </div>
                        ) : null}
                      </div>

                      {q.maxLength ? (
                        <div style={{ fontSize: 11.5, color: '#8B938B', whiteSpace: 'nowrap' }}>
                          {String(value).length}/{q.maxLength}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 10,
                marginTop: 22,
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentSectionIndex === 0}
                style={{
                  minWidth: 140,
                  border: '1px solid #D9DFD7',
                  background: currentSectionIndex === 0 ? '#F3F3F1' : '#FFFFFF',
                  borderRadius: 12,
                  padding: '11px 14px',
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#5F675F',
                  cursor: currentSectionIndex === 0 ? 'default' : 'pointer',
                }}
              >
                Previous
              </button>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => saveDraft('draft')}
                  disabled={saving}
                  style={{
                    border: '1px solid #D9DFD7',
                    background: '#FFFFFF',
                    borderRadius: 12,
                    padding: '11px 14px',
                    fontWeight: 700,
                    fontSize: 13,
                    color: '#5F675F',
                    cursor: saving ? 'default' : 'pointer',
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? 'Saving...' : 'Save progress'}
                </button>

                {!isLastSection ? (
                  <button className="p360-btn-primary" onClick={handleNext}>
                    Next category
                  </button>
                ) : (
                  <button className="p360-btn-primary" onClick={handleGenerateFinal} disabled={isGenerating}>
                    {isGenerating
                      ? 'Generating final output...'
                      : guide.finalStepLabel || 'Generate final output'}
                  </button>
                )}
              </div>
            </div>
          </section>

          {guide.finalStepDescription && isLastSection && !generatedContent ? (
            <section
              className="p360-card"
              style={{
                padding: 16,
                borderRadius: 18,
                background: '#FCFBF8',
                border: '1px solid #EEE7DA',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: '#1C1C1A', marginBottom: 6 }}>
                Final step
              </div>
              <div style={{ fontSize: 12.5, color: '#5F675F', lineHeight: 1.7 }}>
                {guide.finalStepDescription}
              </div>
            </section>
          ) : null}

          {generationError ? (
            <div
              className="p360-card"
              style={{
                padding: 14,
                borderRadius: 14,
                border: '1px solid #F0D5D5',
                background: '#FFF8F8',
                color: '#7D2C2C',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {generationError}
            </div>
          ) : null}

          {generatedContent ? (
            <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111111', marginBottom: 8 }}>
                {gamification.finishLabel}
              </div>
              <div style={{ fontSize: 12.5, color: '#6C746C', marginBottom: 14 }}>
                Your answers have been turned into a generated draft. Export options can now be enabled.
              </div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                {canExportType(guide, 'pdf') ? (
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    style={{
                      border: '1px solid #D9DFD7',
                      background: '#FFFFFF',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#3F4A3F',
                    }}
                  >
                    Export PDF
                  </button>
                ) : null}

                {canExportType(guide, 'docx') ? (
                  <button
                    type="button"
                    onClick={handleExportDocx}
                    style={{
                      border: '1px solid #D9DFD7',
                      background: '#FFFFFF',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#3F4A3F',
                    }}
                  >
                    Export Word
                  </button>
                ) : null}

                {canExportType(guide, 'pptx') ? (
                  <button
                    type="button"
                    onClick={handleExportPpt}
                    style={{
                      border: '1px solid #D9DFD7',
                      background: '#FFFFFF',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#3F4A3F',
                    }}
                  >
                    Export PPT
                  </button>
                ) : null}
              </div>

              {exportStatus ? (
                <div style={{ fontSize: 12.5, color: '#728072' }}>{exportStatus}</div>
              ) : null}
            </section>
          ) : null}

          {allSectionsComplete && !generatedContent ? (
            <section
              className="p360-card"
              style={{
                padding: 16,
                borderRadius: 18,
                background: '#F5FBF6',
                border: '1px solid #D8EAD9',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: '#1A7A4A', marginBottom: 6 }}>
                {gamification.finishLabel}
              </div>
              <div style={{ fontSize: 12.5, color: '#5F675F' }}>
                Nice — the prep is complete. Generate the final output when you are ready.
              </div>
            </section>
          ) : null}
        </main>
      </div>
    </div>
  )
}