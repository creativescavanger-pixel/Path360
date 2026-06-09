import { useEffect, useState } from 'react'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

const FIELD_STYLE = {
  width: '100%',
  border: '1px solid #E2DED6',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 13,
  background: '#F7F5F0',
  color: '#1C1C1A',
  fontFamily: "'DM Sans', sans-serif",
}

export default function FounderProfile() {
  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const updateFounderProfile = useDiagnosticStore((s) => s.updateFounderProfile)

  const [form, setForm] = useState({
    foundername: '',
    email: '',
    venturename: '',
    website: '',
    linkedin: '',
    role: '',
    industry: '',
    venturestage: '',
    businessmodel: '',
    geography: '',
    fundinggoal: '',
    venturesummary: '',
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (founderProfile) {
      setForm((prev) => ({ ...prev, ...founderProfile }))
    }
  }, [founderProfile])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      await updateFounderProfile(form)
      setMessage('Founder profile saved.')
    } catch (err) {
      setError(err?.message || 'Could not save founder profile.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 980 }}>
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
          Founder Profile
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
          Define the founder and the business clearly
        </h1>

        <p style={{ fontSize: 14, color: '#6B6965', lineHeight: 1.75, margin: 0, maxWidth: 760 }}>
          This profile anchors the entire Path360 journey. It gives the app the founder identity, business context, and
          website details needed to make every insight, report, and pitch output feel grounded and personal.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 18,
          padding: 24,
          boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Founder name</label>
            <input value={form.foundername || ''} onChange={(e) => updateField('foundername', e.target.value)} style={FIELD_STYLE} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Email</label>
            <input value={form.email || ''} onChange={(e) => updateField('email', e.target.value)} style={FIELD_STYLE} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Business name</label>
            <input value={form.venturename || ''} onChange={(e) => updateField('venturename', e.target.value)} style={FIELD_STYLE} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Website</label>
            <input value={form.website || ''} onChange={(e) => updateField('website', e.target.value)} style={FIELD_STYLE} placeholder="https://..." />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>LinkedIn</label>
            <input value={form.linkedin || ''} onChange={(e) => updateField('linkedin', e.target.value)} style={FIELD_STYLE} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Role</label>
            <input value={form.role || ''} onChange={(e) => updateField('role', e.target.value)} style={FIELD_STYLE} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Industry</label>
            <input value={form.industry || ''} onChange={(e) => updateField('industry', e.target.value)} style={FIELD_STYLE} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Venture stage</label>
            <input value={form.venturestage || ''} onChange={(e) => updateField('venturestage', e.target.value)} style={FIELD_STYLE} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Business model</label>
            <input value={form.businessmodel || ''} onChange={(e) => updateField('businessmodel', e.target.value)} style={FIELD_STYLE} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Geography</label>
            <input value={form.geography || ''} onChange={(e) => updateField('geography', e.target.value)} style={FIELD_STYLE} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Funding goal</label>
            <input value={form.fundinggoal || ''} onChange={(e) => updateField('fundinggoal', e.target.value)} style={FIELD_STYLE} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Venture summary</label>
            <textarea
              value={form.venturesummary || ''}
              onChange={(e) => updateField('venturesummary', e.target.value)}
              rows={5}
              style={{ ...FIELD_STYLE, resize: 'vertical', minHeight: 120 }}
            />
          </div>
        </div>

        {message && (
          <div style={{ marginTop: 14, color: '#1D6B4F', fontSize: 12.5, fontWeight: 600 }}>{message}</div>
        )}

        {error && <div style={{ marginTop: 14, color: '#8B2020', fontSize: 12.5, fontWeight: 600 }}>{error}</div>}

        <button
          type="submit"
          disabled={saving}
          style={{
            marginTop: 18,
            padding: '10px 18px',
            borderRadius: 10,
            border: '1px solid #1D6B4F',
            background: '#1D6B4F',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 700,
            cursor: saving ? 'default' : 'pointer',
          }}
        >
          {saving ? 'Saving…' : 'Save founder profile'}
        </button>
      </form>
    </div>
  )
}