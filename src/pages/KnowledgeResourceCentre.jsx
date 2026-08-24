import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'
import { getCountryByCode, getCountryFlag } from '../lib/countryCatalogue.js'
import {
  KNOWLEDGE_RESOURCE_UPDATED_AT,
  RESOURCE_AREAS,
  RESOURCE_NEEDS,
  RESOURCE_STAGES,
  RESOURCE_TYPES,
  getKnowledgeResourceLabel,
  getKnowledgeResources,
} from '../data/knowledgeResources.js'

const SAVED_RESOURCES_KEY = 'path360_saved_knowledge_resources'

const AREA_TONES = {
  venture_building: {
    background: '#EEF4EF',
    border: '#D6E4D7',
    color: '#1D6B4F',
  },
  capital_readiness: {
    background: '#F5F0FF',
    border: '#DDD1FF',
    color: '#7158DC',
  },
  cross_border_operations: {
    background: '#FCF8EE',
    border: '#EEE4C9',
    color: '#765A1E',
  },
  market_ecosystem: {
    background: '#EEF5FA',
    border: '#D5E4EF',
    color: '#28627F',
  },
  academy_companion: {
    background: '#F8F6F1',
    border: '#E2DED6',
    color: '#5F5B56',
  },
}

function getStoredSavedResources() {
  if (typeof window === 'undefined') return []

  try {
    const stored = JSON.parse(
      window.localStorage.getItem(SAVED_RESOURCES_KEY) || '[]',
    )
    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function saveSavedResources(resourceIds) {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(
      SAVED_RESOURCES_KEY,
      JSON.stringify(resourceIds),
    )
  } catch {
    // Saving resources is a convenience feature for this beta release.
  }
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label
      style={{
        display: 'grid',
        gap: 5,
        minWidth: 145,
        flex: '1 1 145px',
      }}
    >
      <span
        style={{
          color: '#77736D',
          fontSize: 9.5,
          fontWeight: 800,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: '100%',
          border: '1px solid #D9D4CA',
          borderRadius: 9,
          background: '#FFFFFF',
          color: '#373532',
          padding: '9px 10px',
          fontSize: 11.5,
          cursor: 'pointer',
        }}
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function Tag({ children, tone = 'neutral' }) {
  const tones = {
    neutral: {
      background: '#F7F5F0',
      border: '#E2DED6',
      color: '#5F5B56',
    },
    green: {
      background: '#EEF4EF',
      border: '#D6E4D7',
      color: '#1D6B4F',
    },
    blue: {
      background: '#EEF5FA',
      border: '#D5E4EF',
      color: '#28627F',
    },
    purple: {
      background: '#F5F0FF',
      border: '#DDD1FF',
      color: '#7158DC',
    },
    gold: {
      background: '#FCF8EE',
      border: '#EEE4C9',
      color: '#765A1E',
    },
  }

  const style = tones[tone] || tones.neutral

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        border: `1px solid ${style.border}`,
        background: style.background,
        color: style.color,
        borderRadius: 999,
        padding: '4px 7px',
        fontSize: 9.5,
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      {children}
    </span>
  )
}

function AreaCard({ area, count, selected, onClick }) {
  const tone = AREA_TONES[area.value] || AREA_TONES.academy_companion

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        border: selected
          ? `2px solid ${tone.color}`
          : `1px solid ${tone.border}`,
        background: tone.background,
        borderRadius: 14,
        padding: 14,
        cursor: 'pointer',
        transition: 'transform 0.16s ease, box-shadow 0.16s ease',
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = 'translateY(-1px)'
        event.currentTarget.style.boxShadow =
          '0 8px 18px rgba(22,24,27,0.06)'
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = 'translateY(0)'
        event.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div
        style={{
          color: tone.color,
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.09em',
          textTransform: 'uppercase',
          marginBottom: 7,
        }}
      >
        {count} resource{count === 1 ? '' : 's'}
      </div>

      <div
        style={{
          color: '#1C1C1A',
          fontSize: 13,
          fontWeight: 800,
          lineHeight: 1.32,
        }}
      >
        {area.label}
      </div>

      <div
        style={{
          color: tone.color,
          fontSize: 10.5,
          fontWeight: 800,
          marginTop: 9,
        }}
      >
        {selected ? 'Selected ✓' : 'Explore →'}
      </div>
    </button>
  )
}

function ResourceCard({ resource, saved, onToggleSaved, onOpen }) {
  const tone = AREA_TONES[resource.area] || AREA_TONES.academy_companion

  const stageLabels = (resource.stages || [])
    .slice(0, 2)
    .map((value) => getKnowledgeResourceLabel(value, RESOURCE_STAGES))

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
        border: '1px solid #E2DED6',
        borderRadius: 14,
        padding: 15,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 10,
          marginBottom: 8,
        }}
      >
        <div>
          <div
            style={{
              color: tone.color,
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            {getKnowledgeResourceLabel(resource.area, RESOURCE_AREAS)}
          </div>

          <div
            style={{
              color: '#1C1C1A',
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            {resource.title}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onToggleSaved(resource.id)}
          style={{
            flexShrink: 0,
            border: saved ? '1px solid #7158DC' : '1px solid #D8D3C9',
            background: saved ? '#F5F0FF' : '#FFFFFF',
            color: saved ? '#7158DC' : '#5F5B56',
            borderRadius: 8,
            padding: '6px 8px',
            fontSize: 10,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 5,
          flexWrap: 'wrap',
          marginBottom: 9,
        }}
      >
        <Tag tone="blue">
          {getKnowledgeResourceLabel(resource.type, RESOURCE_TYPES)}
        </Tag>

        {stageLabels.map((label) => (
          <Tag key={label} tone="purple">
            {label}
          </Tag>
        ))}

        {resource.sourceKind === 'internal' ? (
          <Tag tone="green">PATH360</Tag>
        ) : (
          <Tag tone="gold">External source</Tag>
        )}
      </div>

      <p
        style={{
          color: '#5F5B56',
          fontSize: 11.5,
          lineHeight: 1.62,
          margin: '0 0 9px',
        }}
      >
        {resource.summary}
      </p>

      <div
        style={{
          background: '#F8F6F1',
          borderRadius: 10,
          padding: '9px 10px',
          color: '#6B6965',
          fontSize: 10.7,
          lineHeight: 1.55,
          marginBottom: 10,
        }}
      >
        <strong style={{ color: '#3F3C37' }}>Why it matters: </strong>
        {resource.whyItMatters}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          marginTop: 'auto',
        }}
      >
        <span style={{ color: '#8C8A84', fontSize: 9.5 }}>
          Checked: {resource.lastChecked}
        </span>

        <button
          type="button"
          onClick={() => onOpen(resource)}
          style={{
            border: `1px solid ${tone.color}`,
            background: tone.color,
            color: '#FFFFFF',
            borderRadius: 8,
            padding: '7px 9px',
            fontSize: 10.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {resource.actionLabel} →
        </button>
      </div>
    </article>
  )
}

export default function KnowledgeResourceCentre() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const stageFromAcademy = searchParams.get('stage') || ''
  const missionFromAcademy = searchParams.get('mission') || ''

  const [query, setQuery] = useState('')
  const [area, setArea] = useState('')
  const [type, setType] = useState('')
  const [stage, setStage] = useState(stageFromAcademy)
  const [need, setNeed] = useState('')
  const [savedIds, setSavedIds] = useState(() => getStoredSavedResources())
  const [savedOnly, setSavedOnly] = useState(false)

  const ventureIntelligence = useDiagnosticStore(
    (state) => state.ventureIntelligenceProfile,
  )
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const diagnosedStage = useDiagnosticStore((state) => state.diagnosedStage)

  const currentCountryCode =
    ventureIntelligence?.primary_country_code ||
    founderProfile?.country_code ||
    founderProfile?.countrycode ||
    ''

  const currentCountry = getCountryByCode(currentCountryCode)

  const profileStage =
    diagnosedStage ||
    founderProfile?.venturestage ||
    founderProfile?.venture_stage ||
    ''

  const results = useMemo(() => {
    const resources = getKnowledgeResources({
      query,
      area,
      type,
      stage,
      need,
      countryCode: currentCountryCode,
    })

    return savedOnly
      ? resources.filter((resource) => savedIds.includes(resource.id))
      : resources
  }, [area, currentCountryCode, need, query, savedIds, savedOnly, stage, type])

  const areaCounts = useMemo(() => {
    const allResources = getKnowledgeResources({
      countryCode: currentCountryCode,
    })

    return RESOURCE_AREAS.reduce((counts, item) => {
      counts[item.value] = allResources.filter(
        (resource) => resource.area === item.value,
      ).length
      return counts
    }, {})
  }, [currentCountryCode])

  const filtersActive = Boolean(
    query || area || type || stage || need || savedOnly,
  )

  function toggleSaved(resourceId) {
    setSavedIds((current) => {
      const next = current.includes(resourceId)
        ? current.filter((id) => id !== resourceId)
        : [...current, resourceId]

      saveSavedResources(next)
      return next
    })
  }

  function clearFilters() {
    setQuery('')
    setArea('')
    setType('')
    setStage('')
    setNeed('')
    setSavedOnly(false)
  }

  function openResource(resource) {
    if (resource.actionPath) {
      navigate(resource.actionPath)
      return
    }

    if (resource.actionUrl && typeof window !== 'undefined') {
      window.open(resource.actionUrl, '_blank', 'noopener,noreferrer')
    }
  }

  function useCurrentContext() {
    setStage(profileStage || '')
    setNeed('')
    setArea('')
    setType('')
    setSavedOnly(false)
  }

  return (
    <div style={{ padding: 24, maxWidth: 1120 }}>
      <section
        style={{
          background:
            'linear-gradient(135deg, #FFFFFF 0%, #FBF9F4 55%, #EEF5FA 100%)',
          border: '1px solid #E2DED6',
          borderRadius: 18,
          padding: 22,
          marginBottom: 16,
          boxShadow: '0 8px 20px rgba(22,24,27,0.04)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ maxWidth: 740 }}>
            <div
              style={{
                color: '#7158DC',
                fontSize: 10.5,
                fontWeight: 800,
                letterSpacing: '0.11em',
                textTransform: 'uppercase',
                marginBottom: 7,
              }}
            >
              Knowledge resource centre
            </div>

            <h1
              style={{
                color: '#1C1C1A',
                fontSize: 28,
                lineHeight: 1.16,
                letterSpacing: '-0.03em',
                margin: '0 0 9px',
              }}
            >
              Practical resources for the work in front of you
            </h1>

            <p
              style={{
                color: '#6B6965',
                fontSize: 13,
                lineHeight: 1.72,
                margin: 0,
              }}
            >
              Find PATH360 tools, guided worksheets, official sources, market
              research, and ecosystem directories. Save what matters to your
              private shortlist and return when you are ready to act.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/environment')}
            style={{
              border: '1px solid #D8D3C9',
              background: '#FFFFFF',
              color: '#5F5B56',
              borderRadius: 10,
              padding: '9px 12px',
              fontSize: 11.5,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Explore markets →
          </button>
        </div>
      </section>

      {missionFromAcademy ? (
        <section
          style={{
            background: '#F5F0FF',
            border: '1px solid #DDD1FF',
            borderRadius: 14,
            padding: '13px 16px',
            marginBottom: 16,
            color: '#51486A',
            fontSize: 12,
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: '#3E3850' }}>From Academy:</strong>{' '}
          You are browsing supporting resources for your current mission. The
          Resource Centre is filtered to your Academy stage; mission-specific
          recommendations will be added as the library expands.
        </section>
      ) : null}

      {currentCountry || profileStage ? (
        <section
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
            flexWrap: 'wrap',
            background: '#EEF4EF',
            border: '1px solid #D6E4D7',
            borderRadius: 14,
            padding: '14px 16px',
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                color: '#2A6A51',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Use your venture context
            </div>

            <div
              style={{
                color: '#1C1C1A',
                fontSize: 13.5,
                fontWeight: 800,
              }}
            >
              {[
                currentCountry
                  ? `${getCountryFlag(currentCountry.code)} ${
                      currentCountry.name
                    }`
                  : null,
                profileStage
                  ? `Stage: ${String(profileStage).replaceAll('_', ' ')}`
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>

          <button
            type="button"
            onClick={useCurrentContext}
            style={{
              border: '1px solid #1D6B4F',
              background: '#1D6B4F',
              color: '#FFFFFF',
              borderRadius: 9,
              padding: '8px 11px',
              fontSize: 10.5,
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            Filter for my context →
          </button>
        </section>
      ) : null}

      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 16,
          padding: 18,
          marginBottom: 16,
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
          Start with a knowledge area
        </div>

        <div
          style={{
            color: '#1C1C1A',
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: 13,
          }}
        >
          What are you trying to move forward?
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {RESOURCE_AREAS.map((item) => (
            <AreaCard
              key={item.value}
              area={item}
              count={areaCounts[item.value] || 0}
              selected={area === item.value}
              onClick={() =>
                setArea((current) =>
                  current === item.value ? '' : item.value,
                )
              }
            />
          ))}
        </div>
      </section>

      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 16,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 13,
          }}
        >
          <div>
            <div
              style={{
                color: '#2A6A51',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Find a resource
            </div>

            <div
              style={{
                color: '#1C1C1A',
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              Search by the work you need to do
            </div>
          </div>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!filtersActive}
            style={{
              border: '1px solid #D8D3C9',
              background: '#FFFFFF',
              color: filtersActive ? '#5F5B56' : '#AAA69F',
              borderRadius: 9,
              padding: '8px 10px',
              fontSize: 10.5,
              fontWeight: 800,
              cursor: filtersActive ? 'pointer' : 'default',
            }}
          >
            Clear filters
          </button>
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search interviews, funding, compliance, market entry, investor readiness..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: '1px solid #D9D4CA',
            borderRadius: 10,
            background: '#F8F6F1',
            color: '#1C1C1A',
            padding: '11px 12px',
            outline: 'none',
            fontSize: 12.5,
            marginBottom: 12,
          }}
        />

        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <FilterSelect
            label="Resource type"
            value={type}
            onChange={setType}
            options={RESOURCE_TYPES}
          />

          <FilterSelect
            label="Founder stage"
            value={stage}
            onChange={setStage}
            options={RESOURCE_STAGES}
          />

          <FilterSelect
            label="What you need"
            value={need}
            onChange={setNeed}
            options={RESOURCE_NEEDS}
          />
        </div>

        <button
          type="button"
          onClick={() => setSavedOnly((current) => !current)}
          style={{
            marginTop: 13,
            border: savedOnly ? '1px solid #7158DC' : '1px solid #D8D3C9',
            background: savedOnly ? '#F5F0FF' : '#FFFFFF',
            color: savedOnly ? '#7158DC' : '#5F5B56',
            borderRadius: 999,
            padding: '7px 10px',
            fontSize: 10.5,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {savedOnly
            ? 'Showing saved resources'
            : `My saved resources (${savedIds.length})`}
        </button>
      </section>

      <section
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2DED6',
          borderRadius: 16,
          padding: 18,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 12,
            flexWrap: 'wrap',
            marginBottom: 13,
          }}
        >
          <div>
            <div
              style={{
                color: '#35708E',
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Resource library
            </div>

            <div
              style={{
                color: '#1C1C1A',
                fontSize: 17,
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              {results.length} resource{results.length === 1 ? '' : 's'}{' '}
              available
            </div>
          </div>

          <div style={{ color: '#77736D', fontSize: 10.5 }}>
            Library reviewed: {KNOWLEDGE_RESOURCE_UPDATED_AT}
          </div>
        </div>

        {results.length ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 12,
            }}
          >
            {results.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                saved={savedIds.includes(resource.id)}
                onToggleSaved={toggleSaved}
                onOpen={openResource}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              background: '#F8F6F1',
              border: '1px solid #ECE6DB',
              borderRadius: 12,
              padding: 15,
              color: '#6B6965',
              fontSize: 12,
              lineHeight: 1.65,
            }}
          >
            No resources match these filters yet. Try removing a filter, search
            with a broader term, or explore another knowledge area. This is a
            library coverage gap—not a judgement about your venture or market.
          </div>
        )}
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.35fr) minmax(250px, 0.85fr)',
          gap: 16,
          marginTop: 16,
        }}
      >
        <div
          style={{
            background: '#EEF5FA',
            border: '1px solid #D5E4EF',
            borderRadius: 16,
            padding: 18,
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
            Use resources with purpose
          </div>

          <div
            style={{
              color: '#1C1C1A',
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: 7,
            }}
          >
            A resource should help you make a clearer next move
          </div>

          <div
            style={{
              color: '#4F6D7D',
              fontSize: 11.5,
              lineHeight: 1.67,
            }}
          >
            Save the items you want to revisit, then use Venture Intelligence,
            Academy, or Creation Studio to turn what you learn into an
            evidence-backed decision, document, or action.
          </div>
        </div>

        <div
          style={{
            background: '#FCF8EE',
            border: '1px solid #EEE4C9',
            borderRadius: 16,
            padding: 18,
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
            Source note
          </div>

          <div
            style={{
              color: '#6B6965',
              fontSize: 11.5,
              lineHeight: 1.67,
            }}
          >
            External resources are starting points. PATH360 does not endorse
            external organisations or guarantee that a programme, fund,
            regulator, or website remains current. Confirm details at the
            primary source before acting.
          </div>
        </div>
      </section>
    </div>
  )
}