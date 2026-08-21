import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import {
  CUSTOMER_MODEL_OPTIONS,
  DEPENDENCY_OPTIONS,
  DISTRIBUTION_MODEL_OPTIONS,
  FINANCE_APPROACH_OPTIONS,
  OPERATING_MODEL_OPTIONS,
  REVENUE_MODEL_OPTIONS,
  getMarketCountries,
  getMarketRegions,
} from '../lib/ventureIntelligence.js'

const STEPS = [
  {
    id: 'market',
    eyebrow: 'Market footprint',
    title: 'Where does your venture operate?',
    description:
      'Start with the market you know best. PATH360 uses this context to surface relevant operating conditions, resources, founder cases, and checklists.',
  },
  {
    id: 'model',
    eyebrow: 'Business model',
    title: 'How does your venture create and capture value?',
    description:
      'Choose the mechanics that best describe the business today. You can refine these as the venture evolves.',
  },
  {
    id: 'environment',
    eyebrow: 'Operating environment',
    title: 'What must work around your product?',
    description:
      'Identify the infrastructure, partners, and operating conditions that shape whether the venture can work in practice.',
  },
  {
    id: 'focus',
    eyebrow: 'Current focus',
    title: 'What do you need help thinking through now?',
    description:
      'This helps PATH360 prioritise the right Market Intelligence, documents, performance markers, and Academy context.',
  },
]

const OPERATING_SCOPE_OPTIONS = [
  { value: 'local', label: 'One local market' },
  { value: 'regional', label: 'One region / several nearby markets' },
  { value: 'cross_border', label: 'Cross-border operation' },
  { value: 'global', label: 'Multiple regions / global ambition' },
]

const AFFORDABILITY_OPTIONS = [
  { value: 'low', label: 'Low — price sensitivity is not a central issue' },
  { value: 'medium', label: 'Medium — affordability matters for some customers' },
  { value: 'high', label: 'High — price and payment flexibility are central' },
  { value: 'unknown', label: 'Still learning' },
]

const FORMALITY_OPTIONS = [
  { value: 'formal', label: 'Mostly formal customers and businesses' },
  { value: 'informal', label: 'Mostly informal customers or businesses' },
  { value: 'mixed', label: 'A mix of formal and informal activity' },
  { value: 'unknown', label: 'Still learning' },
]

const REGULATORY_OPTIONS = [
  { value: 'low', label: 'Low — no clear regulated activity identified' },
  { value: 'medium', label: 'Medium — requirements may shape the model' },
  { value: 'high', label: 'High — licensing, regulated partners, or strict rules matter' },
  { value: 'unknown', label: 'Still learning' },
]

function emptySetup() {
  return {
    primary_region_code: '',
    primary_country_code: '',
    customer_country_codes: [],
    expansion_country_codes: [],
    operating_scope: '',
    customer_model_tags: [],
    revenue_model_tags: [],
    distribution_model_tags: [],
    operating_model_tags: [],
    dependency_tags: [],
    affordability_sensitivity: 'unknown',
    market_formality: 'unknown',
    regulatory_exposure: 'unknown',
    finance_approach_tags: [],
    biggest_operating_concern: '',
  }
}

function fieldStyle() {
  return {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #E2DED6',
    borderRadius: 11,
    padding: '11px 12px',
    fontSize: 13,
    color: '#1C1C1A',
    background: '#F9F7F2',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
  }
}

function Label({ children, hint }) {
  return (
    <div style={{ marginBottom: 7 }}>
      <div style={{ fontSize: 12, fontWeight: 750, color: '#45413B' }}>
        {children}
      </div>
      {hint ? (
        <div
          style={{
            marginTop: 3,
            fontSize: 11.5,
            lineHeight: 1.5,
            color: '#817B72',
          }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  )
}

function TagPicker({
  options,
  selected,
  onChange,
  emptyText = 'No selections yet.',
}) {
  function toggle(value) {
    const values = Array.isArray(selected) ? selected : []
    const next = values.includes(value)
      ? values.filter((item) => item !== value)
      : [...values, value]

    onChange(next)
  }

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((option) => {
          const active = selected.includes(option.value)

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              style={{
                border: active ? '1px solid #7158DC' : '1px solid #E2DED6',
                borderRadius: 999,
                padding: '8px 10px',
                background: active ? '#F0ECFF' : '#FFFFFF',
                color: active ? '#5D45BA' : '#625D55',
                fontSize: 11.5,
                fontWeight: active ? 750 : 600,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {active ? '✓ ' : ''}
              {option.label}
            </button>
          )
        })}
      </div>

      {selected.length === 0 ? (
        <div style={{ marginTop: 9, fontSize: 11.5, color: '#938D84' }}>
          {emptyText}
        </div>
      ) : null}
    </div>
  )
}

function SetupShell({ step, children }) {
  return (
    <div
      style={{
        minHeight: '100%',
        padding: 24,
        maxWidth: 1040,
        margin: '0 auto',
        fontFamily: "'DM Sans', sans-serif",
        color: '#1C1C1A',
      }}
    >
      <div
        style={{
          borderRadius: 20,
          border: '1px solid #E2D8FF',
          padding: 24,
          background:
            'linear-gradient(115deg, #FFFFFF 0%, #FAF8FF 52%, #F1EBFF 100%)',
          boxShadow: '0 10px 24px rgba(80,61,150,0.06)',
          marginBottom: 16,
        }}
      >
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
          ✦ Venture Intelligence Setup
        </div>

        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 27,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1.12,
            color: '#29213B',
          }}
        >
          Build the context behind your venture
        </h1>

        <p
          style={{
            margin: 0,
            maxWidth: 720,
            fontSize: 13,
            lineHeight: 1.7,
            color: '#645B72',
          }}
        >
          Your stage assessment shows where you are. This setup helps PATH360
          understand how your venture works and the environment it must work
          within.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 8,
          marginBottom: 16,
        }}
      >
        {STEPS.map((item, index) => {
          const active = index === step
          const complete = index < step

          return (
            <div
              key={item.id}
              style={{
                padding: '10px 11px',
                borderRadius: 12,
                border: active
                  ? '1px solid #BDAEFF'
                  : '1px solid #E5E0D8',
                background: active
                  ? '#F3F0FF'
                  : complete
                    ? '#F6FBF7'
                    : '#FFFFFF',
              }}
            >
              <div
                style={{
                  color: active
                    ? '#7158DC'
                    : complete
                      ? '#1D6B4F'
                      : '#9A948A',
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                {complete ? 'Complete' : `Step ${index + 1}`}
              </div>
              <div
                style={{ fontSize: 11.5, fontWeight: 750, color: '#45413B' }}
              >
                {item.eyebrow}
              </div>
            </div>
          )
        })}
      </div>

      {children}
    </div>
  )
}

export default function VentureIntelligenceSetup() {
  const navigate = useNavigate()
  const user = useDiagnosticStore((s) => s.user)
  const stage = useDiagnosticStore((s) => s.diagnosedStage)
  const saveVentureIntelligenceSetup = useDiagnosticStore(
    (s) => s.saveVentureIntelligenceSetup,
  )

  const [step, setStep] = useState(0)
  const [form, setForm] = useState(emptySetup)
  const [regions, setRegions] = useState([])
  const [countries, setCountries] = useState([])
  const [loadingReference, setLoadingReference] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function loadReferenceData() {
      setLoadingReference(true)
      setError('')

      try {
        const [loadedRegions, loadedCountries] = await Promise.all([
          getMarketRegions(),
          getMarketCountries(),
        ])

        if (!mounted) return

        setRegions(loadedRegions)
        setCountries(loadedCountries)
      } catch (loadError) {
        if (!mounted) return
        console.error(loadError)
        setError(
          'Could not load market reference data. Please refresh and try again.',
        )
      } finally {
        if (mounted) setLoadingReference(false)
      }
    }

    loadReferenceData()

    return () => {
      mounted = false
    }
  }, [])

  const selectedCountry = useMemo(
    () =>
      countries.find(
        (country) => country.iso2 === form.primary_country_code,
      ) || null,
    [countries, form.primary_country_code],
  )

  const countryOptions = useMemo(
    () =>
      countries
        .filter((country) => {
          if (!form.primary_region_code) return true

          return (
            country.region_code === form.primary_region_code ||
            country.subregion_code === form.primary_region_code
          )
        })
        .map((country) => ({
          value: country.iso2,
          label: `${country.name}${
            country.content_status === 'core' ? ' · Core intelligence' : ''
          }`,
        })),
    [countries, form.primary_region_code],
  )

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
  }

  function setPrimaryCountry(value) {
    const country = countries.find((item) => item.iso2 === value)

    setForm((current) => ({
      ...current,
      primary_country_code: value,
      primary_region_code:
        country?.subregion_code ||
        country?.region_code ||
        current.primary_region_code,
    }))
    setError('')
  }

  function validateCurrentStep() {
    if (step === 0) {
      if (!form.primary_country_code) {
        setError('Choose your primary operating country to continue.')
        return false
      }

      if (!form.operating_scope) {
        setError('Choose the current operating scope of your venture.')
        return false
      }
    }

    if (step === 1) {
      if (form.customer_model_tags.length === 0) {
        setError('Choose at least one customer model.')
        return false
      }

      if (form.revenue_model_tags.length === 0) {
        setError('Choose at least one revenue model.')
        return false
      }
    }

    if (step === 2 && form.operating_model_tags.length === 0) {
      setError('Choose at least one operating model.')
      return false
    }

    return true
  }

  function handleNext() {
    if (!validateCurrentStep()) return

    setStep((current) => Math.min(current + 1, STEPS.length - 1))
    setError('')
  }

  function handleBack() {
    setStep((current) => Math.max(current - 1, 0))
    setError('')
  }

  async function handleComplete() {
    if (!validateCurrentStep()) return

    if (!user?.id) {
      setError('No authenticated user found. Please sign in again.')
      return
    }

    setSaving(true)
    setError('')

    try {
      await saveVentureIntelligenceSetup(form)

      // The Zustand store is now updated immediately by the save action,
      // so Protected allows this navigation without returning to setup.
      navigate('/app/dashboard', { replace: true })
    } catch (saveError) {
      console.error(saveError)
      setError(
        saveError?.message ||
          'Could not save Venture Intelligence Setup.',
      )
    } finally {
      setSaving(false)
    }
  }

  function renderMarketStep() {
    return (
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <Label hint="Your country selection makes Market Intelligence, PESTEL guidance and resources more practical.">
            Primary operating region
          </Label>
          <select
            value={form.primary_region_code}
            onChange={(event) => {
              updateField('primary_region_code', event.target.value)
              updateField('primary_country_code', '')
            }}
            style={fieldStyle()}
            disabled={loadingReference}
          >
            <option value="">Select a region or subregion</option>
            {regions.map((region) => (
              <option key={region.code} value={region.code}>
                {region.parent_code ? `↳ ${region.name}` : region.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label hint="You can add expansion markets later. Start with the market where you need the most useful context today.">
            Primary operating country
          </Label>
          <select
            value={form.primary_country_code}
            onChange={(event) => setPrimaryCountry(event.target.value)}
            style={fieldStyle()}
            disabled={loadingReference}
          >
            <option value="">Select a country</option>
            {countryOptions.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        {selectedCountry ? (
          <div
            style={{
              borderRadius: 12,
              border: '1px solid #DCE8DF',
              background: '#F4FAF6',
              padding: 13,
            }}
          >
            <div
              style={{
                color: '#1D6B4F',
                fontSize: 12,
                fontWeight: 800,
                marginBottom: 4,
              }}
            >
              {selectedCountry.name}
            </div>
            <div style={{ color: '#637068', fontSize: 12, lineHeight: 1.6 }}>
              {selectedCountry.summary ||
                'Market context will be available as you build your Venture Intelligence workspace.'}
            </div>
          </div>
        ) : null}

        <div>
          <Label>Current operating scope</Label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 8,
            }}
          >
            {OPERATING_SCOPE_OPTIONS.map((option) => {
              const active = form.operating_scope === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('operating_scope', option.value)}
                  style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderRadius: 11,
                    border: active
                      ? '1px solid #7158DC'
                      : '1px solid #E2DED6',
                    background: active ? '#F0ECFF' : '#FFFFFF',
                    color: active ? '#5D45BA' : '#554F47',
                    fontSize: 12,
                    fontWeight: active ? 750 : 600,
                    cursor: 'pointer',
                  }}
                >
                  {active ? '✓ ' : ''}
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  function renderModelStep() {
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        <div>
          <Label hint="Choose every option that meaningfully describes the business today.">
            Who do you create value for?
          </Label>
          <TagPicker
            options={CUSTOMER_MODEL_OPTIONS}
            selected={form.customer_model_tags}
            onChange={(value) => updateField('customer_model_tags', value)}
            emptyText="Choose at least one customer model."
          />
        </div>

        <div>
          <Label>How does the venture make money?</Label>
          <TagPicker
            options={REVENUE_MODEL_OPTIONS}
            selected={form.revenue_model_tags}
            onChange={(value) => updateField('revenue_model_tags', value)}
            emptyText="Choose at least one revenue model."
          />
        </div>

        <div>
          <Label hint="This may be different from how the service is delivered.">
            How do customers find, buy or access the venture?
          </Label>
          <TagPicker
            options={DISTRIBUTION_MODEL_OPTIONS}
            selected={form.distribution_model_tags}
            onChange={(value) =>
              updateField('distribution_model_tags', value)
            }
          />
        </div>
      </div>
    )
  }

  function renderEnvironmentStep() {
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        <div>
          <Label hint="Think about what has to work reliably around your product for the customer to get value.">
            Operating model
          </Label>
          <TagPicker
            options={OPERATING_MODEL_OPTIONS}
            selected={form.operating_model_tags}
            onChange={(value) => updateField('operating_model_tags', value)}
            emptyText="Choose at least one operating model."
          />
        </div>

        <div>
          <Label>Key dependencies</Label>
          <TagPicker
            options={DEPENDENCY_OPTIONS}
            selected={form.dependency_tags}
            onChange={(value) => updateField('dependency_tags', value)}
            emptyText="Optional for now. Add the dependencies most likely to affect delivery, trust or scale."
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          <div>
            <Label>Affordability sensitivity</Label>
            <select
              value={form.affordability_sensitivity}
              onChange={(event) =>
                updateField('affordability_sensitivity', event.target.value)
              }
              style={fieldStyle()}
            >
              {AFFORDABILITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Market formality</Label>
            <select
              value={form.market_formality}
              onChange={(event) =>
                updateField('market_formality', event.target.value)
              }
              style={fieldStyle()}
            >
              {FORMALITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Regulatory exposure</Label>
            <select
              value={form.regulatory_exposure}
              onChange={(event) =>
                updateField('regulatory_exposure', event.target.value)
              }
              style={fieldStyle()}
            >
              {REGULATORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    )
  }

  function renderFocusStep() {
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        <div>
          <Label hint="This does not lock you into a funding path. It helps PATH360 show relevant documents, markers and resources.">
            How are you currently financing or planning to finance the venture?
          </Label>
          <TagPicker
            options={FINANCE_APPROACH_OPTIONS}
            selected={form.finance_approach_tags}
            onChange={(value) => updateField('finance_approach_tags', value)}
            emptyText="Optional for now. You can choose more than one approach."
          />
        </div>

        <div>
          <Label hint="Be direct. This becomes a starting point for your readiness checklist and Academy context.">
            What is the biggest operating question or concern right now?
          </Label>
          <textarea
            value={form.biggest_operating_concern}
            onChange={(event) =>
              updateField('biggest_operating_concern', event.target.value)
            }
            rows={5}
            placeholder="For example: We need to understand whether customers will pay regularly, how to build a reliable agent network, or what documents we need before signing enterprise pilots."
            style={{ ...fieldStyle(), resize: 'vertical', lineHeight: 1.6 }}
          />
        </div>

        <div
          style={{
            borderRadius: 13,
            border: '1px solid #DCE8DF',
            background: '#F4FAF6',
            padding: 15,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: '#1D6B4F',
              marginBottom: 6,
            }}
          >
            What PATH360 will prepare
          </div>
          <div style={{ color: '#5B6D60', fontSize: 12, lineHeight: 1.65 }}>
            Your workspace will combine your {stage || 'current'} stage with{' '}
            {selectedCountry?.name || 'your selected market'}, your business
            model, dependencies and operating environment. You will receive a
            living Business Model Canvas, relevant PESTEL prompts, documents,
            performance markers, founder cases and a filtered Resource Bank.
          </div>
        </div>
      </div>
    )
  }

  function renderCurrentStep() {
    if (step === 0) return renderMarketStep()
    if (step === 1) return renderModelStep()
    if (step === 2) return renderEnvironmentStep()
    return renderFocusStep()
  }

  const current = STEPS[step]

  return (
    <SetupShell step={step}>
      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 18,
          padding: 22,
          boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
        }}
      >
        <div
          style={{
            color: '#8A6E2A',
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 7,
          }}
        >
          {current.eyebrow}
        </div>
        <h2
          style={{
            margin: '0 0 7px',
            fontSize: 21,
            letterSpacing: '-0.03em',
            color: '#252035',
          }}
        >
          {current.title}
        </h2>
        <p
          style={{
            margin: '0 0 21px',
            color: '#6B6965',
            fontSize: 12.5,
            lineHeight: 1.65,
            maxWidth: 720,
          }}
        >
          {current.description}
        </p>

        {loadingReference ? (
          <div style={{ color: '#7A776F', fontSize: 13, padding: '22px 0' }}>
            Loading Venture Intelligence reference data…
          </div>
        ) : (
          renderCurrentStep()
        )}

        {error ? (
          <div
            style={{
              marginTop: 18,
              padding: '10px 12px',
              borderRadius: 10,
              background: '#FDEAEA',
              border: '1px solid rgba(139,32,32,0.22)',
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
            gap: 12,
            marginTop: 24,
            paddingTop: 16,
            borderTop: '1px solid #EEEAE2',
          }}
        >
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || saving}
            style={{
              padding: '10px 13px',
              borderRadius: 10,
              border: '1px solid #E2DED6',
              background: '#FFFFFF',
              color: '#625D55',
              fontSize: 12.5,
              fontWeight: 750,
              cursor: step === 0 || saving ? 'default' : 'pointer',
              opacity: step === 0 || saving ? 0.5 : 1,
            }}
          >
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={loadingReference || saving}
              style={{
                padding: '10px 15px',
                borderRadius: 10,
                border: '1px solid #7158DC',
                background: '#7158DC',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: loadingReference || saving ? 'default' : 'pointer',
                opacity: loadingReference || saving ? 0.65 : 1,
                boxShadow: '0 8px 16px rgba(113,88,220,0.18)',
              }}
            >
              Continue →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={saving || loadingReference}
              style={{
                padding: '10px 15px',
                borderRadius: 10,
                border: '1px solid #1D6B4F',
                background: '#1D6B4F',
                color: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 800,
                cursor: saving || loadingReference ? 'default' : 'pointer',
                opacity: saving || loadingReference ? 0.65 : 1,
                boxShadow: '0 8px 16px rgba(29,107,79,0.16)',
              }}
            >
              {saving
                ? 'Preparing your workspace…'
                : 'Create Venture Intelligence workspace'}
            </button>
          )}
        </div>
      </section>

      <div
        style={{
          marginTop: 13,
          textAlign: 'center',
          color: '#8A847A',
          fontSize: 11.5,
          lineHeight: 1.55,
        }}
      >
        Your answers are private to your workspace. You can update them as the
        venture, market and strategy evolve.
      </div>
    </SetupShell>
  )
}