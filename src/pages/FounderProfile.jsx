import { useEffect, useState } from 'react'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { saveFounderProfile } from '../lib/supabaseClient.js'

function mapStoreProfile(profile) {
  const safeProfile = profile || {}

  return {
    foundername: safeProfile.foundername || safeProfile.fullname || safeProfile.name || '',
    email: safeProfile.email || '',
    phone: safeProfile.phone || '',
    linkedin: safeProfile.linkedin || '',
    twitter: safeProfile.twitter || '',
    website: safeProfile.website || '',
    role: safeProfile.role || '',
    venturename:
      safeProfile.venturename || safeProfile.venture_name || safeProfile.businessname || safeProfile.companyname || '',
    industry: safeProfile.industry || '',
    geography: safeProfile.geography || '',
    venturestage: safeProfile.venturestage || safeProfile.venture_stage || '',
    businessmodel: safeProfile.businessmodel || safeProfile.business_model || '',
    summary: safeProfile.summary || safeProfile.venturesummary || safeProfile.venture_summary || '',
  }
}

export default function FounderProfile() {
  const user = useDiagnosticStore((s) => s.user)
  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const setFounderProfile = useDiagnosticStore((s) => s.setFounderProfile)

  const [form, setForm] = useState(() => mapStoreProfile(founderProfile))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(mapStoreProfile(founderProfile))
  }, [founderProfile])

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave(e) {
    e.preventDefault()

    if (!user?.id) {
      setError('No authenticated user found.')
      return
    }

    setSaving(true)
    setMessage('')
    setError('')

    try {
      const saved = await saveFounderProfile(user.id, {
        fullname: form.foundername,
        email: form.email,
        phone: form.phone,
        linkedin: form.linkedin,
        twitter: form.twitter,
        website: form.website,
        role: form.role,
        venturename: form.venturename,
        industry: form.industry,
        geography: form.geography,
        venturestage: form.venturestage,
        businessmodel: form.businessmodel,
        summary: form.summary,
        venturesummary: form.summary,
      })

      setFounderProfile({
        ...saved,
        foundername: saved?.foundername || saved?.fullname || form.foundername,
      })
      setMessage('Profile saved successfully.')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    border: '1px solid #E2DED6',
    borderRadius: 10,
    padding: '11px 12px',
    fontSize: 13,
    background: '#F7F5F0',
    color: '#1C1C1A',
  }

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
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
            marginBottom: 6,
          }}
        >
          Founder Profile
        </div>

        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1C1C1A',
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}
        >
          Personal and venture details
        </h1>

        <p style={{ fontSize: 13, color: '#6B6965', margin: 0, lineHeight: 1.7, maxWidth: 720 }}>
          Complete this profile so Path360 can personalize diagnostics, reports, and investor-facing outputs.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 16,
          padding: 20,
          display: 'grid',
          gap: 16,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label htmlFor="foundername">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Full name</div>
            <input
              id="foundername"
              name="foundername"
              autoComplete="name"
              value={form.foundername}
              onChange={(e) => updateField('foundername', e.target.value)}
              style={inputStyle}
            />
          </label>

          <label htmlFor="role">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Role</div>
            <input
              id="role"
              name="role"
              autoComplete="organization-title"
              value={form.role}
              onChange={(e) => updateField('role', e.target.value)}
              style={inputStyle}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label htmlFor="email">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Email</div>
            <input
              id="email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              style={inputStyle}
            />
          </label>

          <label htmlFor="phone">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Phone</div>
            <input
              id="phone"
              name="phone"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              style={inputStyle}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <label htmlFor="linkedin">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>LinkedIn</div>
            <input
              id="linkedin"
              name="linkedin"
              autoComplete="url"
              value={form.linkedin}
              onChange={(e) => updateField('linkedin', e.target.value)}
              style={inputStyle}
            />
          </label>

          <label htmlFor="twitter">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>X / Twitter</div>
            <input
              id="twitter"
              name="twitter"
              value={form.twitter}
              onChange={(e) => updateField('twitter', e.target.value)}
              style={inputStyle}
            />
          </label>

          <label htmlFor="website">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Website</div>
            <input
              id="website"
              name="website"
              autoComplete="url"
              value={form.website}
              onChange={(e) => updateField('website', e.target.value)}
              style={inputStyle}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label htmlFor="venturename">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Venture name</div>
            <input
              id="venturename"
              name="venturename"
              autoComplete="organization"
              value={form.venturename}
              onChange={(e) => updateField('venturename', e.target.value)}
              style={inputStyle}
            />
          </label>

          <label htmlFor="industry">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Industry</div>
            <input
              id="industry"
              name="industry"
              value={form.industry}
              onChange={(e) => updateField('industry', e.target.value)}
              style={inputStyle}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <label htmlFor="geography">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Geography</div>
            <input
              id="geography"
              name="geography"
              value={form.geography}
              onChange={(e) => updateField('geography', e.target.value)}
              style={inputStyle}
            />
          </label>

          <label htmlFor="venturestage">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Venture stage</div>
            <input
              id="venturestage"
              name="venturestage"
              value={form.venturestage}
              onChange={(e) => updateField('venturestage', e.target.value)}
              style={inputStyle}
            />
          </label>

          <label htmlFor="businessmodel">
            <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Business model</div>
            <input
              id="businessmodel"
              name="businessmodel"
              value={form.businessmodel}
              onChange={(e) => updateField('businessmodel', e.target.value)}
              style={inputStyle}
            />
          </label>
        </div>

        <label htmlFor="summary">
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6B6965', marginBottom: 6 }}>Venture summary</div>
          <textarea
            id="summary"
            name="summary"
            rows={5}
            value={form.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </label>

        {message && (
          <div
            style={{
              background: '#EDF6EF',
              border: '1px solid #D7E8DA',
              color: '#1D6B4F',
              borderRadius: 10,
              padding: 10,
              fontSize: 12.5,
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              background: '#FDEAEA',
              border: '1px solid rgba(139,32,32,0.25)',
              color: '#8B2020',
              borderRadius: 10,
              padding: 10,
              fontSize: 12.5,
            }}
          >
            {error}
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={saving}
            style={{
              background: '#1D6B4F',
              border: '1px solid #1D6B4F',
              borderRadius: 10,
              padding: '11px 16px',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 13,
              cursor: saving ? 'default' : 'pointer',
            }}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  )
}