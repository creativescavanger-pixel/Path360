import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

function initialValues(profile) {
  const safeProfile = profile || {}

  return {
    foundername:
      safeProfile.foundername ||
      safeProfile.fullname ||
      safeProfile.name ||
      '',
    geography:
      safeProfile.geography ||
      safeProfile.operating_geography ||
      safeProfile.operatingGeography ||
      '',
    venturename:
      safeProfile.venturename ||
      safeProfile.venture_name ||
      safeProfile.businessname ||
      safeProfile.companyname ||
      '',
    summary:
      safeProfile.summary ||
      safeProfile.venturesummary ||
      safeProfile.venture_summary ||
      '',
  }
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  multiline = false,
}) {
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '11px 12px',
    border: '1px solid #E2DED6',
    borderRadius: 11,
    background: '#FFFFFF',
    color: '#1C1C1A',
    font: 'inherit',
    fontSize: 13,
    lineHeight: 1.5,
    outline: 'none',
    resize: multiline ? 'vertical' : 'none',
  }

  return (
    <label htmlFor={id} style={{ display: 'block' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 6,
        }}
      >
        <span style={{ color: '#40385A', fontSize: 12.5, fontWeight: 800 }}>
          {label}
        </span>

        <span style={{ color: '#8A877F', fontSize: 10.5 }}>
          {required ? 'Required' : 'Optional'}
        </span>
      </div>

      {multiline ? (
        <textarea
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
          style={inputStyle}
        />
      ) : (
        <input
          id={id}
          name={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </label>
  )
}

export default function FounderProfileOnboarding() {
  const navigate = useNavigate()

  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const updateFounderProfile = useDiagnosticStore(
    (state) => state.updateFounderProfile,
  )
  const founderRoute = useDiagnosticStore(
    (state) => state.journeyStatus?.founderRoute || null,
  )

  const [form, setForm] = useState(() => initialValues(founderProfile))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isExplorer = founderRoute === 'explorer'

  useEffect(() => {
    setForm(initialValues(founderProfile))
  }, [founderProfile])

  function setField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
    setError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const foundername = form.foundername.trim()

    if (!foundername) {
      setError('Please tell us what you would like PATH360 to call you.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await updateFounderProfile({
  foundername,
  fullname: foundername,
  geography: form.geography.trim() || null,
  venturename: form.venturename.trim() || null,
  summary: form.summary.trim() || null,
  venturesummary: form.summary.trim() || null,
})

      navigate('/app/stage-onboarding', { replace: true })
    } catch (saveError) {
      console.error('Unable to save onboarding profile:', saveError)

      setError(
        saveError?.message ||
          'We could not save your starting details. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fade-up"
      style={{
        width: '100%',
        maxWidth: 720,
        margin: '0 auto',
        padding: '12px 0 36px',
      }}
    >
      <section
        style={{
          padding: 'clamp(22px, 4vw, 36px)',
          border: '1px solid #E2D8FF',
          borderRadius: 20,
          background:
            'linear-gradient(125deg, #FFFFFF 0%, #FAF8FF 56%, #F2EDFF 100%)',
          boxShadow: '0 12px 28px rgba(80,61,150,0.08)',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 9px',
            borderRadius: 999,
            border: '1px solid #DDD1FF',
            background: '#EEE8FF',
            color: '#7158DC',
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          Step 1 of 4 · Your starting point
        </div>

        <h1
          style={{
            margin: '16px 0 8px',
            color: '#252035',
            fontSize: 'clamp(28px, 4vw, 38px)',
            fontWeight: 800,
            letterSpacing: '-0.045em',
            lineHeight: 1.1,
          }}
        >
          A little context goes a long way
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: 590,
            color: '#625B70',
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          You do not need a business plan or startup experience to begin.
          These few details help PATH360 recommend a useful next step. You can
          update everything later.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'grid',
            gap: 16,
            marginTop: 28,
          }}
        >
          <Field
            id="onboarding-founder-name"
            label="What should PATH360 call you?"
            value={form.foundername}
            onChange={(value) => setField('foundername', value)}
            placeholder="Your first name or full name"
            required
          />

          <Field
            id="onboarding-geography"
            label="Where are you primarily based or exploring?"
            value={form.geography}
            onChange={(value) => setField('geography', value)}
            placeholder="For example: Kenya, Ghana, Germany, or Global"
          />

          {isExplorer ? (
            <Field
              id="onboarding-explorer-summary"
              label="What kinds of people, problems, or areas are you curious about?"
              value={form.summary}
              onChange={(value) => setField('summary', value)}
              placeholder="For example: helping small farmers access markets, youth employment, or improving health services."
              multiline
            />
          ) : (
            <>
              <Field
                id="onboarding-venture-name"
                label="What would you like to call your idea or venture?"
                value={form.venturename}
                onChange={(value) => setField('venturename', value)}
                placeholder="A working name is completely fine"
              />

              <Field
                id="onboarding-venture-summary"
                label="What are you hoping to build or improve?"
                value={form.summary}
                onChange={(value) => setField('summary', value)}
                placeholder="For example: A service that helps local shops manage stock more easily."
                multiline
              />
            </>
          )}

          {error ? (
            <div
              role="alert"
              style={{
                padding: '11px 13px',
                border: '1px solid rgba(139,32,32,0.25)',
                borderRadius: 12,
                background: '#FDEAEA',
                color: '#8B2020',
                fontSize: 12.5,
                lineHeight: 1.55,
              }}
            >
              {error}
            </div>
          ) : null}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 14,
              flexWrap: 'wrap',
              paddingTop: 18,
              borderTop: '1px solid #E2D8FF',
            }}
          >
            <p
              style={{
                margin: 0,
                maxWidth: 400,
                color: '#6A6178',
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              Next, PATH360 will help you find the most useful place to begin.
              This takes only a few minutes.
            </p>

            <button
              type="submit"
              disabled={saving}
              style={{
                minHeight: 42,
                padding: '0 16px',
                border: '1px solid #7158DC',
                borderRadius: 10,
                background: '#7158DC',
                color: '#FFFFFF',
                font: 'inherit',
                fontSize: 13,
                fontWeight: 800,
                cursor: saving ? 'default' : 'pointer',
                opacity: saving ? 0.72 : 1,
                boxShadow: '0 8px 16px rgba(113,88,220,0.18)',
              }}
            >
              {saving ? 'Saving…' : 'Find my starting point →'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}