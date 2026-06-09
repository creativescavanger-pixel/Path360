import { useMemo, useState } from 'react'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  downloadGeneratedDocumentFile,
  downloadFounderFile,
  uploadFounderFile,
  saveFounderFileRecord,
} from '../lib/supabaseClient.js'

function SectionCard({ title, subtitle, children }) {
  return (
    <section
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2DED6',
        borderRadius: 16,
        padding: 20,
        boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
      }}
    >
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1A', marginBottom: 4 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12.5, color: '#6B6965', lineHeight: 1.6 }}>{subtitle}</div>}
      </div>
      {children}
    </section>
  )
}

function StatusPill({ status }) {
  const colorMap = {
    complete: { bg: '#EEF4EF', text: '#2A6A51', border: '#D6E4D7', label: 'Ready' },
    uploaded: { bg: '#F3F1EA', text: '#8A6E2A', border: '#E6DDC8', label: 'Uploaded' },
    draft: { bg: '#F7F5F0', text: '#8C8A84', border: '#E2DED6', label: 'Draft' },
  }

  const theme = colorMap[status] ?? colorMap.draft

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 10px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        background: theme.bg,
        color: theme.text,
        border: `1px solid ${theme.border}`,
      }}
    >
      {theme.label}
    </span>
  )
}

function formatDateLabel(value) {
  if (!value) return 'Recently'
  try {
    return new Date(value).toLocaleDateString()
  } catch {
    return 'Recently'
  }
}

function guessFileKind(name = '') {
  const lower = name.toLowerCase()
  if (lower.endsWith('.pdf')) return 'PDF'
  if (lower.endsWith('.doc') || lower.endsWith('.docx')) return 'Word'
  if (lower.endsWith('.ppt') || lower.endsWith('.pptx')) return 'Slides'
  if (lower.endsWith('.xls') || lower.endsWith('.xlsx') || lower.endsWith('.csv')) return 'Spreadsheet'
  if (lower.endsWith('.txt') || lower.endsWith('.md')) return 'Text'
  return 'File'
}

export default function Reports() {
  const user = useDiagnosticStore((s) => s.user)
  const documents = useDiagnosticStore((s) => s.documents || [])
  const founderFiles = useDiagnosticStore((s) => s.founderFiles || [])
  const addFounderFile = useDiagnosticStore((s) => s.addFounderFile)

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)

  const reportLibrary = useMemo(() => {
    const generated = documents.map((doc) => ({
      id: `generated-${doc.id}`,
      source: 'generated',
      title: doc.title,
      type: doc.doctype || 'Generated document',
      status: doc.status || 'complete',
      updated: doc.createdat,
      description: doc.content?.slice(0, 180) || 'Generated strategic document.',
      raw: doc,
    }))

    const uploaded = founderFiles.map((file) => ({
      id: `file-${file.id}`,
      source: 'uploaded',
      title: file.title || file.filename,
      type: file.filecategory || guessFileKind(file.filename),
      status: file.status || 'uploaded',
      updated: file.createdat,
      description: file.description || `Uploaded file: ${file.filename}`,
      raw: file,
    }))

    return [...generated, ...uploaded].sort((a, b) => new Date(b.updated) - new Date(a.updated))
  }, [documents, founderFiles])

  async function handleUpload(event) {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    setUploading(true)
    setError('')

    try {
      const uploaded = await uploadFounderFile(user.id, file)
      const record = await saveFounderFileRecord(user.id, {
        filename: file.name,
        filepath: uploaded.path,
        mimetype: file.type || 'application/octet-stream',
        filesize: file.size,
        title: file.name,
        filecategory: guessFileKind(file.name),
        status: 'uploaded',
      })
      addFounderFile(record)
    } catch (err) {
      setError(err?.message || 'File upload failed.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function handleDownload(item) {
    if (!item) return

    if (item.source === 'generated') {
      downloadGeneratedDocumentFile(item.raw)
      return
    }

    if (item.source === 'uploaded') {
      await downloadFounderFile(item.raw.filepath, item.raw.filename)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1180 }}>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 18,
            padding: 24,
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
              marginBottom: 10,
            }}
          >
            Reports & Files
          </div>

          <h1
            style={{
              fontSize: 26,
              lineHeight: 1.15,
              fontWeight: 700,
              color: '#1C1C1A',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}
          >
            Review, store, and reuse your founder story
          </h1>

          <p
            style={{
              fontSize: 14,
              color: '#6B6965',
              lineHeight: 1.75,
              margin: 0,
              maxWidth: 820,
            }}
          >
            This workspace brings your generated documents and uploaded business files into one place so your founder
            journey feels continuous. You should be able to move from diagnosis to story, from story to pitch, and from
            pitch to investor-ready materials without losing context.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.9fr)',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <SectionCard
              title="Library"
              subtitle="Generated outputs and uploaded files live together here, so founders can open, review, and export their full business story."
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: '1px solid #E2DED6',
                    background: '#F7F5F0',
                    color: '#1C1C1A',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: uploading ? 'default' : 'pointer',
                  }}
                >
                  {uploading ? 'Uploading…' : 'Upload file'}
                  <input type="file" onChange={handleUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>

                <div style={{ fontSize: 12, color: '#8C8A84' }}>{reportLibrary.length} item(s) in library</div>
              </div>

              {error && (
                <div
                  style={{
                    marginBottom: 12,
                    padding: 12,
                    borderRadius: 10,
                    background: '#FDEAEA',
                    border: '1px solid rgba(139,32,32,0.22)',
                    color: '#8B2020',
                    fontSize: 12.5,
                  }}
                >
                  {error}
                </div>
              )}

              {reportLibrary.length === 0 ? (
                <div
                  style={{
                    padding: 18,
                    borderRadius: 14,
                    background: '#F7F5F0',
                    border: '1px solid #ECE6DB',
                    color: '#6B6965',
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  No documents yet. Generate one from Studio or upload an existing business file to begin building your
                  founder library.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 12 }}>
                  {reportLibrary.map((report) => (
                    <div
                      key={report.id}
                      style={{
                        background: '#F7F5F0',
                        border: '1px solid #ECE6DB',
                        borderRadius: 14,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 12,
                          marginBottom: 10,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1A', marginBottom: 4 }}>{report.title}</div>
                          <div style={{ fontSize: 11.5, color: '#8C8A84' }}>
                            {report.type} · {formatDateLabel(report.updated)}
                          </div>
                        </div>

                        <StatusPill status={report.status} />
                      </div>

                      <div style={{ fontSize: 12.5, color: '#6B6965', lineHeight: 1.7, marginBottom: 14 }}>
                        {report.description}
                      </div>

                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedItem(report)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 9,
                            border: '1px solid #E2DED6',
                            background: '#FFFFFF',
                            color: '#1C1C1A',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Open
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(report)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 9,
                            border: '1px solid #E2DED6',
                            background: 'transparent',
                            color: '#6B6965',
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <SectionCard
              title="Story view"
              subtitle="This panel helps founders revisit the core narrative and see how each file contributes to the bigger story."
            >
              {selectedItem ? (
                <div style={{ display: 'grid', gap: 12 }}>
                  <div
                    style={{
                      background: '#EEF4EF',
                      border: '1px solid #D6E4D7',
                      borderRadius: 14,
                      padding: 16,
                    }}
                  >
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1A', marginBottom: 4 }}>{selectedItem.title}</div>
                    <div style={{ fontSize: 12, color: '#6B6965' }}>
                      {selectedItem.type} · {formatDateLabel(selectedItem.updated)}
                    </div>
                  </div>

                  <div
                    style={{
                      background: '#F7F5F0',
                      border: '1px solid #ECE6DB',
                      borderRadius: 14,
                      padding: 16,
                      maxHeight: 520,
                      overflowY: 'auto',
                    }}
                  >
                    {selectedItem.source === 'generated' ? (
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontSize: 12.5,
                          lineHeight: 1.8,
                          color: '#1C1C1A',
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {selectedItem.raw.content}
                      </pre>
                    ) : (
                      <div style={{ fontSize: 13, color: '#6B6965', lineHeight: 1.8 }}>
                        This uploaded file is stored in your founder library. Use the download button to open the original
                        file locally. In the next step, this can be extended into richer in-app previews for PDFs, docs,
                        and spreadsheets.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    background: '#F7F5F0',
                    border: '1px solid #ECE6DB',
                    borderRadius: 14,
                    padding: 16,
                    fontSize: 13,
                    color: '#6B6965',
                    lineHeight: 1.7,
                  }}
                >
                  Select any generated document or uploaded file to review it here. This should become the place where a
                  founder sees the thread of their business story becoming clearer over time.
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Founder journey"
              subtitle="The app should feel like one continuous venture story, not a set of unrelated tools."
            >
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  'Profile defines who the founder is and what the business is becoming.',
                  'Assessment reveals the truth about the venture today.',
                  'Memory keeps the important facts and patterns alive over time.',
                  'Strategy and Studio turn that truth into a strong founder narrative.',
                  'Reports and files make the story portable, reviewable, and pitch-ready.',
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid #ECE6DB',
                      background: '#FFFFFF',
                      color: '#6B6965',
                      fontSize: 12.5,
                      lineHeight: 1.7,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}