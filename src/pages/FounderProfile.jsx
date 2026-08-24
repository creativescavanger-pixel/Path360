import { useEffect, useMemo, useState } from 'react'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  CAPITAL_TARGET_GEOGRAPHIES,
  OPERATING_GEOGRAPHIES,
  getCorridorContext,
  getReadableCheckLabel,
} from '../lib/globalCorridors.js'

function normaliseLegacyGeography(value) {
  const raw = String(value || '').trim().toLowerCase()

  if (!raw) return ''
  if (/africa|african/.test(raw)) return 'africa'
  if (/europe|european|\beu\b/.test(raw)) return 'europe'
  if (/united states|\bu\.?s\.?a?\b|america|american/.test(raw)) {
    return 'united_states'
  }
  if (/global|international|multiple regions|multi-region/.test(raw)) {
    return 'global'
  }
  if (/not raising|not fundraising|bootstrapp/.test(raw)) {
    return 'not_raising_yet'
  }

  return ''
}

function mapStoreProfile(profile) {
  const safeProfile = profile || {}

  const operatingGeography =
    safeProfile.operating_geography ||
    safeProfile.operatingGeography ||
    normaliseLegacyGeography(safeProfile.geography)

  const capitalTargetGeography =
    safeProfile.capital_target_geography ||
    safeProfile.capitalTargetGeography ||
    normaliseLegacyGeography(safeProfile.target_investor_region)

  return {
    foundername:
      safeProfile.foundername ||
      safeProfile.fullname ||
      safeProfile.name ||
      '',
    email: safeProfile.email || '',
    phone: safeProfile.phone || '',
    linkedin: safeProfile.linkedin || '',
    twitter: safeProfile.twitter || '',
    website: safeProfile.website || '',
    role: safeProfile.role || '',
    venturename:
      safeProfile.venturename ||
      safeProfile.venture_name ||
      safeProfile.businessname ||
      safeProfile.companyname ||
      '',
    industry: safeProfile.industry || '',
    geography: safeProfile.geography || '',
    operating_geography: operatingGeography || '',
    capital_target_geography: capitalTargetGeography || '',
    venturestage:
      safeProfile.venturestage ||
      safeProfile.venture_stage ||
      '',
    businessmodel:
      safeProfile.businessmodel ||
      safeProfile.business_model ||
      '',
    summary:
      safeProfile.summary ||
      safeProfile.venturesummary ||
      safeProfile.venture_summary ||
      '',
    workspace_private: safeProfile.workspace_private !== false,
    anonymous_benchmarking_opt_in:
      safeProfile.anonymous_benchmarking_opt_in === true,
    report_sharing_enabled: safeProfile.report_sharing_enabled === true,
  }
}

function formatStage(stage) {
  if (!stage) return 'Not set'

  return String(stage)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function ProfileField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  helpText,
  textarea = false,
  rows = 5,
}) {
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #E2DED6',
    borderRadius: 11,
    padding: '11px 12px',
    fontSize: 13,
    lineHeight: 1.5,
    background: '#F9F7F2',
    color: '#1C1C1A',
    outline: 'none',
    fontFamily: 'inherit',
    resize: textarea ? 'vertical' : 'none',
  }

  return (
    <label htmlFor={id} style={{ display: 'block' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: '#54514B' }}>
          {label}
        </span>

        {helpText ? (
          <span style={{ fontSize: 10.5, color: '#938D84', textAlign: 'right' }}>
            {helpText}
          </span>
        ) : null}
      </div>

      {textarea ? (
        <textarea
          id={id}
          name={id}
          rows={rows}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      ) : (
        <input
          id={id}
          name={id}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </label>
  )
}

function SelectField({ id, label, value, onChange, options, placeholder, helpText }) {
  return (
    <label htmlFor={id} style={{ display: 'block' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: '#54514B' }}>
          {label}
        </span>

        {helpText ? (
          <span style={{ fontSize: 10.5, color: '#938D84', textAlign: 'right' }}>
            {helpText}
          </span>
        ) : null}
      </div>

      <select
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid #E2DED6',
          borderRadius: 11,
          padding: '11px 12px',
          fontSize: 13,
          lineHeight: 1.5,
          background: '#F9F7F2',
          color: '#1C1C1A',
          outline: 'none',
          fontFamily: 'inherit',
          cursor: 'pointer',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function SectionCard({ eyebrow, title, description, children, accent = '#1D6B4F' }) {
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
      <div
        style={{
          fontSize: 10.5,
          color: accent,
          fontWeight: 800,
          letterSpacing: '0.11em',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {eyebrow}
      </div>

      <h2
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: '#1C1C1A',
          margin: '0 0 6px',
          letterSpacing: '-0.025em',
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: 12.5,
          color: '#6B6965',
          margin: '0 0 18px',
          lineHeight: 1.65,
          maxWidth: 760,
        }}
      >
        {description}
      </p>

      {children}
    </section>
  )
}

function PrivacyOption({ checked, onChange, title, description, disabled = false }) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 11,
        padding: 13,
        border: '1px solid #E2DED6',
        borderRadius: 12,
        background: disabled ? '#F8F6F1' : '#FFFFFF',
        cursor: disabled ? 'default' : 'pointer',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        style={{
          width: 16,
          height: 16,
          marginTop: 1,
          accentColor: '#7158DC',
          cursor: disabled ? 'default' : 'pointer',
          flexShrink: 0,
        }}
      />
      <span>
        <span
          style={{
            display: 'block',
            color: '#1C1C1A',
            fontSize: 12.5,
            fontWeight: 800,
            marginBottom: 4,
          }}
        >
          {title}
        </span>
        <span
          style={{
            display: 'block',
            color: '#6B6965',
            fontSize: 11.5,
            lineHeight: 1.6,
          }}
        >
          {description}
        </span>
      </span>
    </label>
  )
}

export default function FounderProfile() {
  const founderProfile = useDiagnosticStore((s) => s.founderProfile)
  const updateFounderProfile = useDiagnosticStore((s) => s.updateFounderProfile)
  const stageAssessment = useDiagnosticStore((s) => s.stageAssessment)
  const assessmentResults = useDiagnosticStore((s) => s.assessmentResults)
  const investorReadyPercent = useDiagnosticStore((s) => s.investorReadyPercent)
  const storedCorridor = useDiagnosticStore((s) => s.corridor)

  const [form, setForm] = useState(() => mapStoreProfile(founderProfile))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(mapStoreProfile(founderProfile))
  }, [founderProfile])

  function updateField(key, value) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }))
    setMessage('')
    setError('')
  }

  const corridorPreview = useMemo(
    () =>
      getCorridorContext(
        form.operating_geography,
        form.capital_target_geography,
      ),
    [form.operating_geography, form.capital_target_geography],
  )

  const corridor = corridorPreview || storedCorridor

  const profileFields = useMemo(
    () => [
      form.foundername,
      form.role,
      form.email,
      form.linkedin,
      form.venturename,
      form.industry,
      form.geography,
      form.operating_geography,
      form.capital_target_geography,
      form.businessmodel,
      form.summary,
    ],
    [form],
  )

  const completedFields = profileFields.filter((value) =>
    String(value || '').trim(),
  ).length

  const profileCompletion = Math.round(
    (completedFields / profileFields.length) * 100,
  )

  const missingFields = useMemo(() => {
    const fields = []

    if (!form.venturename.trim()) fields.push('venture name')
    if (!form.industry.trim()) fields.push('industry')
    if (!form.businessmodel.trim()) fields.push('business model')
    if (!form.operating_geography) fields.push('operating geography')
    if (!form.summary.trim()) fields.push('venture summary')

    return fields
  }, [form])

  const diagnosedStage =
    stageAssessment?.diagnosedStage ||
    stageAssessment?.declaredStage ||
    form.venturestage

  const investorReadiness =
    assessmentResults?.investorreadiness ??
    assessmentResults?.investor_readiness ??
    (investorReadyPercent > 0 ? investorReadyPercent : null)

  async function handleSave(event) {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const saved = await updateFounderProfile({
        foundername: form.foundername,
        fullname: form.foundername,
        email: form.email,
        phone: form.phone,
        linkedin: form.linkedin,
        twitter: form.twitter,
        website: form.website,
        role: form.role,
        venturename: form.venturename,
        industry: form.industry,
        geography: form.operating_geography || form.geography || null,
        target_investor_region: form.capital_target_geography || null,
        operating_geography: form.operating_geography || null,
        capital_target_geography: form.capital_target_geography || null,
        venturestage: form.venturestage,
        businessmodel: form.businessmodel,
        summary: form.summary,
        venturesummary: form.summary,
        workspace_private: true,
        anonymous_benchmarking_opt_in: Boolean(
          form.anonymous_benchmarking_opt_in,
        ),
        report_sharing_enabled: Boolean(form.report_sharing_enabled),
      })

      setForm(mapStoreProfile(saved))
      setMessage('Your venture profile and privacy preferences were saved.')
    } catch (saveError) {
      console.error(saveError)
      setError(
        saveError?.message ||
          'We could not save that change. Your previous information is still safe. Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1040,
        display: 'grid',
        gap: 16,
      }}
    >
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.25fr) minmax(280px, 0.75fr)',
          gap: 16,
          padding: 20,
          borderRadius: 18,
          border: '1px solid #E2D8FF',
          background:
            'linear-gradient(110deg, #FFFFFF 0%, #FAF8FF 54%, #F2EDFF 100%)',
          boxShadow: '0 8px 20px rgba(80,61,150,0.05)',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '5px 9px',
              borderRadius: 999,
              background: '#EEE8FF',
              border: '1px solid #DDD1FF',
              color: '#7158DC',
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            ✦ Venture profile
          </div>

          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: '#252035',
              margin: '0 0 8px',
              letterSpacing: '-0.04em',
              lineHeight: 1.12,
            }}
          >
            Your strategic source of truth
          </h1>

          <p
            style={{
              fontSize: 13,
              color: '#625B70',
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 650,
            }}
          >
            This context personalises your assessment, Venture Radar, AI guidance, investor materials, and founder learning path.
          </p>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: '1px solid #E2D8FF',
            background: 'rgba(255,255,255,0.82)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              marginBottom: 10,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 800, color: '#40385A' }}>
              Profile signal
            </span>
            <span style={{ color: '#7158DC', fontSize: 14, fontWeight: 800 }}>
              {profileCompletion}%
            </span>
          </div>

          <div
            style={{
              height: 8,
              borderRadius: 999,
              overflow: 'hidden',
              background: '#E8E2F5',
              marginBottom: 10,
            }}
          >
            <div
              style={{
                width: `${profileCompletion}%`,
                height: '100%',
                borderRadius: 999,
                background: 'linear-gradient(90deg, #7158DC 0%, #9A7EF2 100%)',
                transition: 'width 180ms ease',
              }}
            />
          </div>

          <div style={{ color: '#6A6178', fontSize: 11.5, lineHeight: 1.55 }}>
            {missingFields.length
              ? `Add ${missingFields.slice(0, 2).join(' and ')} to improve the relevance of your PATH360 guidance.`
              : 'Your core venture context is complete and ready to power personalised guidance.'}
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 12,
        }}
      >
        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: '1px solid #E2DED6',
            background: '#FFFFFF',
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              color: '#8A877F',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Venture stage
          </div>
          <div style={{ fontSize: 16, color: '#1D6B4F', fontWeight: 800 }}>
            {formatStage(diagnosedStage)}
          </div>
          <div style={{ fontSize: 11, color: '#7A776F', marginTop: 4 }}>
            From your stage baseline
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: '1px solid #E2DED6',
            background: '#FFFFFF',
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              color: '#8A877F',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Investor readiness
          </div>
          <div
            style={{
              fontSize: 16,
              color: investorReadiness === null ? '#76628D' : '#1D6B4F',
              fontWeight: 800,
            }}
          >
            {investorReadiness === null
              ? 'Assessment needed'
              : `${investorReadiness}%`}
          </div>
          <div style={{ fontSize: 11, color: '#7A776F', marginTop: 4 }}>
            {investorReadiness === null
              ? 'Unlock your intelligence'
              : 'From your latest assessment'}
          </div>
        </div>

        <div
          style={{
            padding: 14,
            borderRadius: 14,
            border: '1px solid #E2DED6',
            background: '#FFFFFF',
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              color: '#8A877F',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Your venture
          </div>
          <div
            style={{
              fontSize: 16,
              color: '#1C1C1A',
              fontWeight: 800,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {form.venturename || 'Add venture name'}
          </div>
          <div style={{ fontSize: 11, color: '#7A776F', marginTop: 4 }}>
            {form.industry || 'Add your industry'}
          </div>
        </div>
      </section>

      <form onSubmit={handleSave} style={{ display: 'grid', gap: 16 }}>
        <SectionCard
          eyebrow="Founder context"
          title="Who is building the venture?"
          description="These details help PATH360 personalise your founder intelligence and investor-facing materials."
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
            }}
          >
            <ProfileField
              id="foundername"
              label="Full name"
              autoComplete="name"
              value={form.foundername}
              onChange={(value) => updateField('foundername', value)}
              placeholder="Your full name"
            />
            <ProfileField
              id="role"
              label="Role"
              autoComplete="organization-title"
              value={form.role}
              onChange={(value) => updateField('role', value)}
              placeholder="Founder, CEO, Co-founder..."
            />
            <ProfileField
              id="email"
              label="Email"
              autoComplete="email"
              value={form.email}
              onChange={(value) => updateField('email', value)}
              placeholder="you@company.com"
            />
            <ProfileField
              id="phone"
              label="Phone"
              autoComplete="tel"
              value={form.phone}
              onChange={(value) => updateField('phone', value)}
              placeholder="+00 000 000 000"
            />
            <ProfileField
              id="linkedin"
              label="LinkedIn"
              autoComplete="url"
              value={form.linkedin}
              onChange={(value) => updateField('linkedin', value)}
              placeholder="linkedin.com/in/..."
            />
            <ProfileField
              id="twitter"
              label="X / Twitter"
              value={form.twitter}
              onChange={(value) => updateField('twitter', value)}
              placeholder="@yourhandle"
            />
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Venture fundamentals"
          title="What are you building?"
          description="This is the core business context PATH360 uses to interpret your stage, readiness, and strategic signals."
          accent="#1D6B4F"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
            }}
          >
            <ProfileField
              id="venturename"
              label="Venture name"
              autoComplete="organization"
              value={form.venturename}
              onChange={(value) => updateField('venturename', value)}
              placeholder="Your venture name"
            />
            <ProfileField
              id="industry"
              label="Industry"
              value={form.industry}
              onChange={(value) => updateField('industry', value)}
              placeholder="FinTech, SaaS, HealthTech..."
            />
            <ProfileField
              id="geography"
              label="Primary market or location"
              value={form.geography}
              onChange={(value) => updateField('geography', value)}
              placeholder="Kenya, Nigeria, Germany..."
              helpText="Optional detail"
            />
            <ProfileField
              id="businessmodel"
              label="Business model"
              value={form.businessmodel}
              onChange={(value) => updateField('businessmodel', value)}
              placeholder="B2B SaaS, marketplace, services..."
            />
            <ProfileField
              id="website"
              label="Website"
              autoComplete="url"
              value={form.website}
              onChange={(value) => updateField('website', value)}
              placeholder="https://..."
            />
            <ProfileField
              id="venturestage"
              label="Declared venture stage"
              value={form.venturestage}
              onChange={(value) => updateField('venturestage', value)}
              placeholder="Idea, MVP, Traction..."
              helpText="Your baseline remains the primary stage signal"
            />
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Cross-border venture context"
          title="Where are you building and raising?"
          description="PATH360 uses this context to make Academy guidance, readiness checks, and future investor materials relevant to your operating and capital environment. It does not limit your choices or assume one market is the only path to success."
          accent="#8A6E2A"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 14,
            }}
          >
            <SelectField
              id="operating_geography"
              label="Primary operating geography"
              value={form.operating_geography}
              onChange={(value) => updateField('operating_geography', value)}
              options={OPERATING_GEOGRAPHIES}
              placeholder="Select where you primarily operate"
            />
            <SelectField
              id="capital_target_geography"
              label="Capital target geography"
              value={form.capital_target_geography}
              onChange={(value) => updateField('capital_target_geography', value)}
              options={CAPITAL_TARGET_GEOGRAPHIES}
              placeholder="Select your current capital focus"
              helpText="You can change this later"
            />
          </div>

          {corridor ? (
            <div
              style={{
                marginTop: 16,
                padding: 15,
                borderRadius: 12,
                border: '1px solid #E8DEC0',
                background: '#FCF8EE',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 7,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: '#6E571A' }}>
                  {corridor.label}
                </div>
                {corridor.academyFocusTrack ? (
                  <span
                    style={{
                      padding: '4px 7px',
                      borderRadius: 999,
                      background: '#FFFFFF',
                      border: '1px solid #E8DEC0',
                      color: '#8A6E2A',
                      fontSize: 10.5,
                      fontWeight: 800,
                      textTransform: 'capitalize',
                    }}
                  >
                    Academy focus: {corridor.academyFocusTrack}
                  </span>
                ) : null}
              </div>

              {corridor.summary ? (
                <p
                  style={{
                    margin: '0 0 11px',
                    color: '#6B6965',
                    fontSize: 12,
                    lineHeight: 1.6,
                  }}
                >
                  {corridor.summary}
                </p>
              ) : null}

              {Array.isArray(corridor.requiredChecks) && corridor.requiredChecks.length ? (
                <div>
                  <div
                    style={{
                      color: '#7A776F',
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: 7,
                    }}
                  >
                    Priority readiness checks
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {corridor.requiredChecks.slice(0, 5).map((check) => (
                      <span
                        key={check}
                        style={{
                          padding: '5px 7px',
                          borderRadius: 8,
                          background: '#FFFFFF',
                          border: '1px solid #E8DEC0',
                          color: '#5F5B52',
                          fontSize: 10.5,
                          lineHeight: 1.35,
                        }}
                      >
                        {getReadableCheckLabel(check)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div
              style={{
                marginTop: 15,
                padding: '11px 12px',
                borderRadius: 10,
                background: '#F9F7F2',
                color: '#7A776F',
                fontSize: 12,
                lineHeight: 1.55,
              }}
            >
              Choose both geographies to preview the cross-border context that will shape your Academy and readiness guidance.
            </div>
          )}
        </SectionCard>

        <SectionCard
          eyebrow="Founder narrative"
          title="Explain the venture in your own words"
          description="A clear narrative gives PATH360 stronger context for strategy, investor materials, and future learning recommendations."
          accent="#7158DC"
        >
          <ProfileField
            id="summary"
            label="Venture summary"
            value={form.summary}
            onChange={(value) => updateField('summary', value)}
            placeholder="What do you do, for whom, and why does it matter now?"
            helpText="Aim for 2–4 clear sentences"
            textarea
            rows={6}
          />
        </SectionCard>

        <SectionCard
          eyebrow="Privacy & sharing"
          title="Your workspace stays private by default"
          description="Your venture details, assessment answers, documents, journals, saved resources, and work inside PATH360 are not public. You decide what to share, with whom, and when."
          accent="#28627F"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(250px, 0.9fr)',
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                border: '1px solid #D5E4EF',
                background: '#EEF5FA',
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div
                style={{
                  color: '#28627F',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Private workspace
              </div>
              <div
                style={{
                  color: '#1C1C1A',
                  fontSize: 14,
                  fontWeight: 800,
                  marginBottom: 6,
                }}
              >
                Your founder workspace is private
              </div>
              <div style={{ color: '#4F6D7D', fontSize: 11.5, lineHeight: 1.65 }}>
                PATH360 does not create a public venture profile or list your workspace in a public directory. This setting is always on for your account.
              </div>
            </div>

            <div
              style={{
                border: '1px solid #EEE4C9',
                background: '#FCF8EE',
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div
                style={{
                  color: '#765A1E',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Sharing is deliberate
              </div>
              <div
                style={{
                  color: '#1C1C1A',
                  fontSize: 14,
                  fontWeight: 800,
                  marginBottom: 6,
                }}
              >
                You control every future share
              </div>
              <div style={{ color: '#6B6965', fontSize: 11.5, lineHeight: 1.65 }}>
                Reports and documents are never shared automatically. When sharing is available, you will choose the exact item, audience, and access period.
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <PrivacyOption
              checked={form.workspace_private}
              onChange={() => {}}
              disabled
              title="Keep my venture workspace private"
              description="Private by default. Your profile, assessment answers, saved resources, documents, and founder work are not publicly visible."
            />
            <PrivacyOption
              checked={form.anonymous_benchmarking_opt_in}
              onChange={(value) => updateField('anonymous_benchmarking_opt_in', value)}
              title="Contribute anonymous product insights"
              description="Allow PATH360 to use de-identified, aggregated patterns to improve benchmarks and product learning. This does not publish your venture name, documents, responses, or personal details."
            />
            <PrivacyOption
              checked={form.report_sharing_enabled}
              onChange={(value) => updateField('report_sharing_enabled', value)}
              title="Allow me to enable report sharing later"
              description="Keep this off if you never want share controls surfaced. Turning it on does not share anything now; it only allows you to create a controlled report link when that feature is available."
            />
          </div>

          <div
            style={{
              marginTop: 14,
              padding: '10px 12px',
              borderRadius: 10,
              background: '#F9F7F2',
              color: '#6B6965',
              fontSize: 11.5,
              lineHeight: 1.65,
            }}
          >
            PATH360 can help you organise and reflect on your venture work. For legal, tax, investment, compliance, or other professional decisions, verify information with an appropriately qualified adviser.
          </div>
        </SectionCard>

        {message ? (
          <div
            role="status"
            style={{
              background: '#EDF6EF',
              border: '1px solid #D7E8DA',
              color: '#1D6B4F',
              borderRadius: 12,
              padding: '11px 13px',
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {message}
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            style={{
              background: '#FDEAEA',
              border: '1px solid rgba(139,32,32,0.25)',
              color: '#8B2020',
              borderRadius: 12,
              padding: '11px 13px',
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '14px 16px',
            borderRadius: 14,
            border: '1px solid #E2DED6',
            background: '#FFFFFF',
          }}
        >
          <div style={{ fontSize: 12, color: '#6B6965', lineHeight: 1.55 }}>
            Saved profile details strengthen your Radar, AI guidance, Reports, Studio outputs, Academy recommendations, and cross-border readiness context.
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{
              flexShrink: 0,
              minHeight: 40,
              padding: '0 15px',
              background: '#7158DC',
              border: '1px solid #7158DC',
              borderRadius: 10,
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 12.5,
              cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.72 : 1,
              boxShadow: '0 8px 16px rgba(113,88,220,0.18)',
            }}
          >
            {saving ? 'Saving profile…' : 'Save venture profile'}
          </button>
        </div>
      </form>
    </div>
  )
}