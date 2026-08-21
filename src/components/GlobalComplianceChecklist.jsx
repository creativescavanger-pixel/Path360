import { useEffect, useMemo, useState } from 'react'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

function normaliseStatus(status) {
  if (status === 'done') return 'done'
  if (status === 'in_progress') return 'in_progress'
  return 'not_started'
}

function getStatusLabel(status) {
  if (status === 'done') return 'Completed'
  if (status === 'in_progress') return 'In progress'
  return 'Not started'
}

function getRiskLabel(riskLevel) {
  if (riskLevel === 'high') return 'High impact'
  if (riskLevel === 'medium') return 'Moderate impact'
  return 'Lower impact'
}

function getRiskColor(riskLevel) {
  if (riskLevel === 'high') return '#8B2020'
  if (riskLevel === 'medium') return '#8A6E2A'
  return '#35708E'
}

function getRiskBackground(riskLevel) {
  if (riskLevel === 'high') return '#FDEAEA'
  if (riskLevel === 'medium') return '#FCF8EE'
  return '#EEF5FA'
}

function getStatusStyle(status) {
  if (status === 'done') {
    return {
      background: '#EAF1EB',
      border: '#CFE0D2',
      color: '#1D6B4F',
    }
  }

  if (status === 'in_progress') {
    return {
      background: '#FCF8EE',
      border: '#EEE4C9',
      color: '#8A6E2A',
    }
  }

  return {
    background: '#F7F5F0',
    border: '#E2DED6',
    color: '#6B6965',
  }
}

function getSafeProfile(profile) {
  return {
    countryCode: profile?.countryCode || profile?.country_code || '—',
    countryName:
      profile?.countryName || profile?.country_name || 'Country compliance',
    stage: profile?.stage || 'mvp',
    corridor: profile?.corridor || 'global',
    lastUpdated:
      profile?.lastUpdated || profile?.last_updated || 'Not started yet',
    categories: Array.isArray(profile?.categories) ? profile.categories : [],
  }
}

function getCategoryProgress(category) {
  const items = Array.isArray(category?.items) ? category.items : []
  const completed = items.filter(
    (item) => normaliseStatus(item.status) === 'done',
  ).length
  const inProgress = items.filter(
    (item) => normaliseStatus(item.status) === 'in_progress',
  ).length

  return {
    total: items.length,
    completed,
    inProgress,
  }
}

function CategorySummary({ category, open, onToggle, isStartHere }) {
  const progress = getCategoryProgress(category)
  const isComplete = progress.total > 0 && progress.completed === progress.total

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        border: open ? '1px solid #CDBFF3' : '1px solid #E2DED6',
        background: open ? '#F7F3FF' : '#FFFFFF',
        borderRadius: 12,
        padding: 13,
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span
          style={{
            width: 28,
            height: 28,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 9,
            background: isComplete ? '#EAF1EB' : open ? '#EAE1FF' : '#F7F5F0',
            color: isComplete ? '#1D6B4F' : open ? '#7158DC' : '#6B6965',
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {isComplete ? '✓' : open ? '−' : '+'}
        </span>

        <span>
          {isStartHere ? (
            <span
              style={{
                display: 'block',
                color: '#8A6E2A',
                fontSize: 9.5,
                fontWeight: 800,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
                marginBottom: 3,
              }}
            >
              Start here
            </span>
          ) : null}
          <span
            style={{
              display: 'block',
              color: '#1C1C1A',
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.35,
              marginBottom: 3,
            }}
          >
            {category.label}
          </span>
          <span
            style={{
              display: 'block',
              color: '#6B6965',
              fontSize: 11.5,
              lineHeight: 1.55,
            }}
          >
            {category.summary}
          </span>
        </span>
      </span>

      <span
        style={{
          flexShrink: 0,
          color: isComplete ? '#1D6B4F' : '#6B6965',
          fontSize: 10.5,
          fontWeight: 800,
          whiteSpace: 'nowrap',
        }}
      >
        {progress.completed}/{progress.total}
      </span>
    </button>
  )
}

function ChecklistItem({ item, categoryId, onStatusChange }) {
  const itemStatus = normaliseStatus(item.status)
  const statusStyle = getStatusStyle(itemStatus)
  const links = Array.isArray(item.links) ? item.links : []

  return (
    <li
      style={{
        background: '#FFFFFF',
        borderRadius: 10,
        padding: 11,
        border: '1px solid #E2DED6',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              flexWrap: 'wrap',
              marginBottom: 4,
            }}
          >
            <div
              style={{
                color: '#1C1C1A',
                fontSize: 12.5,
                fontWeight: 800,
                lineHeight: 1.4,
              }}
            >
              {item.label}
            </div>
            <span
              style={{
                fontSize: 9.5,
                background: getRiskBackground(item.riskLevel),
                color: getRiskColor(item.riskLevel),
                borderRadius: 999,
                padding: '3px 6px',
                fontWeight: 800,
                whiteSpace: 'nowrap',
              }}
            >
              {getRiskLabel(item.riskLevel)}
            </span>
          </div>

          {item.description ? (
            <div
              style={{
                color: '#6B6965',
                fontSize: 11.5,
                lineHeight: 1.6,
                marginBottom: links.length > 0 ? 8 : 0,
              }}
            >
              {item.description}
            </div>
          ) : null}

          {links.length > 0 ? (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {links.map((link) => (
                <a
                  key={`${item.id}-${link.url}`}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontSize: 10.5,
                    color: '#1D6B4F',
                    textDecoration: 'none',
                    background: '#EAF1EB',
                    border: '1px solid #CFE0D2',
                    padding: '3px 7px',
                    borderRadius: 999,
                    fontWeight: 800,
                  }}
                >
                  {link.label || 'Official resource'} ↗
                </a>
              ))}
            </div>
          ) : null}
        </div>

        <select
          value={itemStatus}
          onChange={(event) =>
            onStatusChange(categoryId, item.id, event.target.value)
          }
          aria-label={`Change status for ${item.label}`}
          style={{
            flexShrink: 0,
            fontSize: 10.5,
            padding: '6px 7px',
            borderRadius: 999,
            border: `1px solid ${statusStyle.border}`,
            background: statusStyle.background,
            color: statusStyle.color,
            cursor: 'pointer',
            fontWeight: 800,
            maxWidth: 112,
          }}
        >
          <option value="not_started">Not started</option>
          <option value="in_progress">In progress</option>
          <option value="done">Completed</option>
        </select>
      </div>
    </li>
  )
}

export default function GlobalComplianceChecklist({ profile }) {
  const user = useDiagnosticStore((state) => state.user)
  const saveComplianceProgress = useDiagnosticStore(
    (state) => state.saveComplianceProgress,
  )

  const [localProfile, setLocalProfile] = useState(() =>
    getSafeProfile(profile),
  )
  const [openCategoryId, setOpenCategoryId] = useState(() =>
    getSafeProfile(profile).categories?.[0]?.id || '',
  )

  useEffect(() => {
    const safeProfile = getSafeProfile(profile)
    setLocalProfile(safeProfile)
    setOpenCategoryId((currentId) => {
      const categoryExists = safeProfile.categories.some(
        (category) => category.id === currentId,
      )
      return categoryExists ? currentId : safeProfile.categories?.[0]?.id || ''
    })
  }, [profile])

  const allItems = useMemo(() => {
    return localProfile.categories.flatMap((category) =>
      Array.isArray(category.items) ? category.items : [],
    )
  }, [localProfile.categories])

  const totalItems = allItems.length
  const completedItems = allItems.filter(
    (item) => normaliseStatus(item.status) === 'done',
  ).length
  const inProgressItems = allItems.filter(
    (item) => normaliseStatus(item.status) === 'in_progress',
  ).length
  const completionPercentage =
    totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  function handleStatusChange(categoryId, itemId, nextStatus) {
    const safeStatus = normaliseStatus(nextStatus)
    const updated = {
      ...localProfile,
      lastUpdated: 'just now',
      categories: localProfile.categories.map((category) => {
        if (category.id !== categoryId) return category

        return {
          ...category,
          items: (category.items || []).map((item) => {
            if (item.id !== itemId) return item
            return { ...item, status: safeStatus }
          }),
        }
      }),
    }

    setLocalProfile(updated)

    if (user?.id && typeof saveComplianceProgress === 'function') {
      Promise.resolve(
        saveComplianceProgress(user.id, updated.countryCode, updated),
      ).catch((error) => {
        console.error('Could not save compliance progress:', error)
      })
    }
  }

  const { countryName, countryCode, stage, corridor, lastUpdated, categories } =
    localProfile

  return (
    <section
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2DED6',
        borderRadius: 16,
        padding: 18,
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 14,
          marginBottom: 14,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 620 }}>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#8A6E2A',
              marginBottom: 5,
            }}
          >
            Your operating checklist
          </div>
          <h2
            style={{
              fontSize: 19,
              fontWeight: 800,
              margin: '0 0 6px',
              color: '#1C1C1A',
              letterSpacing: '-0.02em',
            }}
          >
            Set up and run {countryName} with confidence
          </h2>
          <div
            style={{
              fontSize: 11.5,
              color: '#6B6965',
              lineHeight: 1.6,
            }}
          >
            {countryCode} · {String(stage).toUpperCase()} stage · {corridor} ·{' '}
            {lastUpdated === 'Not started yet'
              ? 'No checks started yet'
              : `Updated ${lastUpdated}`}
          </div>
        </div>

        <div
          style={{
            minWidth: 220,
            background: '#F7F5F0',
            border: '1px solid #E2DED6',
            borderRadius: 12,
            padding: 11,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 8,
              marginBottom: 7,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: '#8C8A84',
                fontWeight: 800,
                letterSpacing: '0.09em',
                textTransform: 'uppercase',
              }}
            >
              Your progress
            </div>
            <div style={{ fontSize: 13, color: '#1D6B4F', fontWeight: 800 }}>
              {completionPercentage}%
            </div>
          </div>

          <div
            style={{
              height: 7,
              borderRadius: 999,
              background: '#E2DED6',
              overflow: 'hidden',
              marginBottom: 7,
            }}
          >
            <div
              style={{
                width: `${completionPercentage}%`,
                height: '100%',
                borderRadius: 999,
                background: '#1D6B4F',
                transition: 'width 0.2s ease',
              }}
            />
          </div>

          <div style={{ fontSize: 10.5, color: '#6B6965', lineHeight: 1.45 }}>
            {completedItems} complete · {inProgressItems} in progress ·{' '}
            {totalItems} checks
          </div>
        </div>
      </header>

      <div
        style={{
          background: '#FCF8EE',
          border: '1px solid #EEE4C9',
          borderRadius: 11,
          padding: '10px 12px',
          color: '#6B6965',
          fontSize: 11.5,
          lineHeight: 1.6,
          marginBottom: 15,
        }}
      >
        Use this as a working list of questions to verify. The right answer can depend on your company structure, sector, location, customers, team, and cross-border activity.
      </div>

      {categories.length === 0 ? (
        <div
          style={{
            background: '#F7F5F0',
            border: '1px solid #E2DED6',
            borderRadius: 12,
            color: '#6B6965',
            fontSize: 12.5,
            lineHeight: 1.65,
            padding: 14,
          }}
        >
          Your operating checklist is still being prepared for this market.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 9 }}>
          {categories.map((category, index) => {
            const isOpen = openCategoryId === category.id
            const progress = getCategoryProgress(category)

            return (
              <div key={category.id}>
                <CategorySummary
                  category={category}
                  open={isOpen}
                  isStartHere={index === 0 && progress.completed < progress.total}
                  onToggle={() =>
                    setOpenCategoryId((currentId) =>
                      currentId === category.id ? '' : category.id,
                    )
                  }
                />

                {isOpen ? (
                  <div
                    style={{
                      border: '1px solid #E2DED6',
                      borderTop: 'none',
                      borderRadius: '0 0 12px 12px',
                      background: '#F8F6F1',
                      padding: 11,
                    }}
                  >
                    <div
                      style={{
                        color: '#8A6E2A',
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.09em',
                        textTransform: 'uppercase',
                        margin: '1px 0 8px',
                      }}
                    >
                      What to verify
                    </div>
                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'grid',
                        gap: 8,
                      }}
                    >
                      {(category.items || []).map((item) => (
                        <ChecklistItem
                          key={item.id}
                          item={item}
                          categoryId={category.id}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}