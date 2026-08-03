import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { getStudioDrafts } from '../lib/studioDocuments.js'
import { getDocumentExportsByDraft, createSignedExportUrl } from '../lib/documentExports.js'

export default function StudioLibrary() {
  const navigate = useNavigate()
  const user = useDiagnosticStore((s) => s.user)

  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [exportsByDraft, setExportsByDraft] = useState({})

  useEffect(() => {
    if (!user?.id) return

    let mounted = true

    async function load() {
      try {
        const rows = await getStudioDrafts(user.id)
        if (!mounted) return
        setDrafts(rows)

        const entries = await Promise.all(
          rows.map(async (draft) => [draft.id, await getDocumentExportsByDraft(draft.id)])
        )

        if (mounted) {
          setExportsByDraft(Object.fromEntries(entries))
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [user?.id])

  async function handleDownloadExport(item) {
    try {
      const signedUrl = await createSignedExportUrl(item.storage_path, 60 * 10)
      if (signedUrl) {
        window.open(signedUrl, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 14, color: '#6B6965' }}>Loading library…</div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1120 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: '#1C1C1A', marginBottom: 6 }}>
          Studio Library
        </div>
        <div style={{ fontSize: 13, color: '#6B6965' }}>
          Reopen drafts, continue guided work, and retrieve exported documents.
        </div>
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {drafts.length === 0 && (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2DED6',
              borderRadius: 14,
              padding: 16,
              fontSize: 13,
              color: '#6B6965',
            }}
          >
            No drafts yet.
          </div>
        )}

        {drafts.map((draft) => {
          const exportRows = exportsByDraft[draft.id] || []
          const progress = draft?.draftdata?.completion?.progressPercent || 0

          return (
            <section
              key={draft.id}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2DED6',
                borderRadius: 14,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1C1A' }}>
                    {draft.title || draft.doctype}
                  </div>
                  <div style={{ fontSize: 12, color: '#6B6965', marginTop: 4 }}>
                    {draft.doctype} · {draft.status} · {progress}% complete
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/studio/prep/${draft.doctype}?draft=${draft.id}`)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      border: '1px solid #1D6B4F',
                      background: '#1D6B4F',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Resume draft
                  </button>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1A', marginBottom: 8 }}>
                  Exports
                </div>

                {exportRows.length === 0 ? (
                  <div style={{ fontSize: 12, color: '#6B6965' }}>No exports yet for this draft.</div>
                ) : (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {exportRows.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          border: '1px solid #E2DED6',
                          borderRadius: 10,
                          padding: 10,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1C1C1A' }}>
                            {item.title || item.format.toUpperCase()}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#6B6965', marginTop: 3 }}>
                            {item.format.toUpperCase()} · {item.export_scope} · v{item.version}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDownloadExport(item)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 8,
                            border: '1px solid #E2DED6',
                            background: '#FFFFFF',
                            cursor: 'pointer',
                            fontSize: 12,
                          }}
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}