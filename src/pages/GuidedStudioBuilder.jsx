import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { getDocumentGuideSchema, getAllowedExportFormats } from '../lib/documentGuideSchemas.js'
import { getStudioDraftByDocType, getStudioDraftById, saveStudioDraft, buildGuidedDraftData } from '../lib/studioDocuments.js'
import { buildInitialSections, calculateCompletedSections, calculateProgressPercent, isSectionComplete } from '../lib/guidedDraftUtils.js'
import { renderDocumentPreview } from '../lib/documentRenderer.js'
import { buildFileFromPreview } from '../lib/exportHelpers.js'
import { uploadExportFile, saveDocumentExportRecord, getDocumentExportsByDraft } from '../lib/documentExports.js'
import { track, EVENTS } from '../lib/posthogClient.js'
import GuidedQuestionField from '../components/GuidedQuestionField.jsx'

export default function GuidedStudioBuilder() {
  const navigate = useNavigate()
  const { docType } = useParams()
  const [searchParams] = useSearchParams()
  const autosaveTimer = useRef(null)

  const user = useDiagnosticStore((s) => s.user)

  const schema = useMemo(() => getDocumentGuideSchema(docType), [docType])
  const allowedFormats = useMemo(() => getAllowedExportFormats(docType), [docType])

  const [draftId, setDraftId] = useState(null)
  const [title, setTitle] = useState('')
  const [objectiveId, setObjectiveId] = useState(null)
  const [sections, setSections] = useState(schema ? buildInitialSections(schema) : {})
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [saveStatus, setSaveStatus] = useState('Loading...')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [exportsList, setExportsList] = useState([])
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (!schema || !user?.id) return

    let mounted = true

    async function load() {
      try {
        const draftParam = searchParams.get('draft')
        const draft = draftParam
          ? await getStudioDraftById(draftParam)
          : await getStudioDraftByDocType(user.id, docType)

        if (!mounted) return

        if (draft) {
          const dd = draft.draftdata || {}
          setDraftId(draft.id)
          setTitle(draft.title || schema.title)
          setObjectiveId(dd.objectiveId || draft.objectiveid || null)
          setSections(dd.sections || buildInitialSections(schema))
          setCurrentSectionIndex(dd.currentSectionIndex || 0)
          setSaveStatus('Draft loaded')

          const exportRows = await getDocumentExportsByDraft(draft.id)
          if (mounted) setExportsList(exportRows)
        } else {
          setTitle(schema.title)
          setSections(buildInitialSections(schema))
          setCurrentSectionIndex(0)
          setSaveStatus('Ready')
        }
      } catch (err) {
        console.error(err)
        if (mounted) setSaveStatus('Could not load draft')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [schema, user?.id, docType, searchParams])

  const currentSection = schema?.sections?.[currentSectionIndex] || null
  const currentSectionState = currentSection ? sections[currentSection.id] : null

  const completedSections = useMemo(() => calculateCompletedSections(sections), [sections])
  const progressPercent = useMemo(
    () => calculateProgressPercent(schema, sections),
    [schema, sections]
  )

  const previewText = useMemo(() => {
    return renderDocumentPreview({
      docType,
      draftData: {
        sections,
      },
    })
  }, [docType, sections])

  async function persist(nextSections = sections, nextCurrentSectionIndex = currentSectionIndex) {
    if (!user?.id || !schema) return null

    const nextCurrentSection = schema.sections[nextCurrentSectionIndex]
    const payload = buildGuidedDraftData({
      objectiveId,
      selectedOutputId: docType,
      currentSectionId: nextCurrentSection?.id || null,
      currentSectionIndex: nextCurrentSectionIndex,
      sections: nextSections,
      completedSections: calculateCompletedSections(nextSections),
      progressPercent: calculateProgressPercent(schema, nextSections),
      exportState: {},
      meta: {
        createdFrom: 'guided-studio',
      },
    })

    setSaving(true)
    setSaveStatus('Saving...')

    try {
      const saved = await saveStudioDraft({
        id: draftId || undefined,
        userId: user.id,
        docType,
        objectiveId,
        title: title || schema.title,
        status: progressPercent >= 100 ? 'completed' : 'in_progress',
        customInstructions: '',
        draftData: payload,
        generatedContent: previewText,
      })

      setDraftId(saved.id)
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

  function handleAnswerChange(questionId, value) {
    if (!currentSection) return

    const nextSections = {
      ...sections,
      [currentSection.id]: {
        ...sections[currentSection.id],
        answers: {
          ...(sections[currentSection.id]?.answers || {}),
          [questionId]: value,
        },
        updatedAt: new Date().toISOString(),
      },
    }

    const completed = isSectionComplete(currentSection, nextSections[currentSection.id])
    nextSections[currentSection.id].completed = completed

    setSections(nextSections)
    setSaveStatus('Unsaved changes')

    clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => {
      persist(nextSections, currentSectionIndex)
    }, 1000)
  }

  async function goToSection(index) {
    clearTimeout(autosaveTimer.current)
    await persist(sections, currentSectionIndex)
    setCurrentSectionIndex(index)
  }

  async function handleManualSave() {
    await persist()
  }

  async function handleExport(format, exportScope = 'progress') {
    if (!draftId || !user?.id) return

    setExporting(true)

    try {
      const sectionId = exportScope === 'section' ? currentSection?.id || null : null
      const exportTitle =
        exportScope === 'section'
          ? `${schema.title} - ${currentSection?.title || 'Section'}`
          : `${schema.title}`

      const file = buildFileFromPreview({
        previewText:
          exportScope === 'section' && currentSection
            ? `${currentSection.title}\n\n${Object.entries(currentSectionState?.answers || {})
                .filter(([, v]) => String(v || '').trim())
                .map(([k, v]) => {
                  const q = currentSection.questions.find((item) => item.id === k)
                  return `${q?.label || k}\n${v}`
                })
                .join('\n\n')}`
            : previewText,
        title: exportTitle,
        format,
      })

      const storagePath = await uploadExportFile({
        userId: user.id,
        draftId,
        file,
        format,
        exportScope,
        sectionId,
      })

      const exportRecord = await saveDocumentExportRecord({
        studioDocumentId: draftId,
        userId: user.id,
        docType,
        title: exportTitle,
        format,
        exportScope,
        sectionId,
        storagePath,
        fileSize: file.size,
      })

      track(EVENTS.DOCUMENT_EXPORTED, {
        docType,
        format,
        exportScope,
        draftId,
        guided: true,
      })

      setExportsList((prev) => [exportRecord, ...prev])
      setSaveStatus(`${format.toUpperCase()} export created`)
    } catch (err) {
      console.error(err)
      setSaveStatus('Export failed')
    } finally {
      setExporting(false)
    }
  }

  if (!schema) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 14, color: '#8B2020' }}>Unknown guided document type.</div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 14, color: '#6B6965' }}>Loading builder…</div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1280 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '280px minmax(0, 1fr) 360px',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <aside
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1C1C1A', marginBottom: 8 }}>
            {schema.title}
          </div>
          <div style={{ fontSize: 12, color: '#6B6965', marginBottom: 12 }}>
            Progress: {progressPercent}%
          </div>

          <div
            style={{
              width: '100%',
              height: 8,
              background: '#EFEAE0',
              borderRadius: 999,
              overflow: 'hidden',
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: '#1D6B4F',
              }}
            />
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {schema.sections.map((section, index) => {
              const active = index === currentSectionIndex
              const completed = completedSections.includes(section.id)

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => goToSection(index)}
                  style={{
                    textAlign: 'left',
                    borderRadius: 10,
                    border: active ? '1.5px solid #1D6B4F' : '1px solid #E2DED6',
                    background: active ? '#EAF1EB' : '#FFFFFF',
                    padding: '10px 11px',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1C1C1A' }}>
                    {section.title} {completed ? '✓' : ''}
                  </div>
                  <div style={{ fontSize: 11, color: '#6B6965', marginTop: 3 }}>
                    {section.description}
                  </div>
                </button>
              )
            })}
          </div>

          <div style={{ marginTop: 14, fontSize: 12, color: '#6B6965' }}>
            {saving ? 'Saving…' : saveStatus}
          </div>
        </aside>

        <main
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 14,
            padding: 18,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#1C1C1A', marginBottom: 4 }}>
              {currentSection?.title}
            </div>
            <div style={{ fontSize: 12.5, color: '#6B6965' }}>
              {currentSection?.description}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            {currentSection?.questions.map((question) => (
              <GuidedQuestionField
                key={question.id}
                question={question}
                value={currentSectionState?.answers?.[question.id] || ''}
                onChange={handleAnswerChange}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleManualSave}
              style={{
                background: '#FFFFFF',
                border: '1px solid #D8D3C9',
                borderRadius: 9,
                padding: '10px 18px',
                color: '#1C1C1A',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Save progress
            </button>

            {currentSectionIndex > 0 && (
              <button
                type="button"
                onClick={() => goToSection(currentSectionIndex - 1)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #D8D3C9',
                  borderRadius: 9,
                  padding: '10px 18px',
                  color: '#1C1C1A',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Previous section
              </button>
            )}

            {currentSectionIndex < schema.sections.length - 1 && (
              <button
                type="button"
                onClick={() => goToSection(currentSectionIndex + 1)}
                style={{
                  background: '#1D6B4F',
                  border: '1px solid #1D6B4F',
                  borderRadius: 9,
                  padding: '10px 18px',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Next section
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/app/studio/library')}
              style={{
                background: 'transparent',
                border: '1px solid #D8D3C9',
                borderRadius: 9,
                padding: '10px 18px',
                color: '#1C1C1A',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Open library
            </button>
          </div>
        </main>

        <aside
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1C1A', marginBottom: 10 }}>
            Preview and exports
          </div>

          <div
            style={{
              background: '#F7F5F0',
              borderRadius: 10,
              padding: 14,
              maxHeight: 360,
              overflowY: 'auto',
              marginBottom: 12,
            }}
          >
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 12.5,
                lineHeight: 1.7,
                color: '#1C1C1A',
              }}
            >
              {previewText || 'Your preview will appear here as you complete sections.'}
            </pre>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {allowedFormats.map((format) => (
              <button
                key={`${format}-section`}
                type="button"
                disabled={exporting}
                onClick={() => handleExport(format, 'section')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #E2DED6',
                  background: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Export section {format.toUpperCase()}
              </button>
            ))}

            {allowedFormats.map((format) => (
              <button
                key={`${format}-progress`}
                type="button"
                disabled={exporting}
                onClick={() => handleExport(format, 'progress')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid #E2DED6',
                  background: '#F7F5F0',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                Export progress {format.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1A', marginBottom: 8 }}>
            Recent exports
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {exportsList.length === 0 && (
              <div style={{ fontSize: 12, color: '#6B6965' }}>No exports yet.</div>
            )}

            {exportsList.slice(0, 6).map((item) => (
              <div
                key={item.id}
                style={{
                  border: '1px solid #E2DED6',
                  borderRadius: 10,
                  padding: 10,
                  background: '#FFFFFF',
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1C1C1A' }}>
                  {item.format.toUpperCase()} · v{item.version}
                </div>
                <div style={{ fontSize: 11.5, color: '#6B6965', marginTop: 3 }}>
                  {item.export_scope}{item.sectionid ? ` · ${item.sectionid}` : ''}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}