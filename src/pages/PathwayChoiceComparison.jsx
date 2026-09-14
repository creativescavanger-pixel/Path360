import React from 'react'


function getCardStyle(type) {
  const styles = {
    selected: {
      background: 'var(--surface-soft, #F8F9F6)',
      border: '1px solid var(--border, #DDE2DC)',
      accent: 'var(--text-soft, #5D635D)',
      iconBackground: '#FFFFFF',
      badgeBackground: '#FFFFFF',
      badgeBorder: '1px solid var(--border, #DDE2DC)',
      badgeColor: 'var(--text-soft, #5D635D)',
    },
    recommended: {
      background: 'var(--lilac-050, #F8F6FF)',
      border: '1px solid var(--lilac-300, #CFC0EF)',
      accent: 'var(--lilac-800, #5B449D)',
      iconBackground: '#FFFFFF',
      badgeBackground: '#FFFFFF',
      badgeBorder: '1px solid var(--lilac-300, #CFC0EF)',
      badgeColor: 'var(--lilac-800, #5B449D)',
    },
    agreed: {
      background: 'var(--green-050, #F4FAF6)',
      border: '1px solid rgba(26, 112, 77, 0.28)',
      accent: 'var(--green-800, #15563E)',
      iconBackground: '#FFFFFF',
      badgeBackground: '#FFFFFF',
      badgeBorder: '1px solid rgba(26, 112, 77, 0.28)',
      badgeColor: 'var(--green-800, #15563E)',
    },
  }

  return styles[type]
}


function PathCard({
  type,
  eyebrow,
  badge,
  icon,
  stage,
  description,
  isActive,
  actionLabel,
  onAction,
}) {
  const style = getCardStyle(type)

  return (
    <section
      aria-label={eyebrow}
      style={{
        minWidth: 0,
        padding: 13,
        borderRadius: 14,
        border: style.border,
        background: style.background,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: 7,
          minWidth: 0,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 26,
            height: 26,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
            borderRadius: 999,
            background: style.iconBackground,
            color: style.accent,
            border: style.border,
            fontSize: 14,
            fontWeight: 900,
          }}
        >
          {icon}
        </span>

        <div
          style={{
            minWidth: 0,
            maxWidth: '100%',
            color: style.accent,
            fontSize: 9,
            fontWeight: 850,
            letterSpacing: '.1em',
            textTransform: 'uppercase',
            lineHeight: 1.3,
            overflowWrap: 'anywhere',
          }}
        >
          {eyebrow}
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            maxWidth: '100%',
            padding: '4px 7px',
            borderRadius: 999,
            background: style.badgeBackground,
            border: style.badgeBorder,
            color: style.badgeColor,
            fontSize: 10,
            fontWeight: 800,
            lineHeight: 1.2,
            overflowWrap: 'anywhere',
          }}
        >
          {badge}
        </span>
      </div>

      <div
        style={{
          marginTop: 11,
          color: 'var(--text, #151614)',
          fontSize: 14,
          fontWeight: 850,
          letterSpacing: '-0.02em',
          lineHeight: 1.35,
          overflowWrap: 'anywhere',
        }}
      >
        Stage {stage.number} · {stage.title}
      </div>

      <p
        style={{
          margin: '6px 0 0',
          color: 'var(--text-soft, #5D635D)',
          fontSize: 11.5,
          lineHeight: 1.55,
        }}
      >
        {description}
      </p>

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          aria-pressed={isActive}
          style={{
            width: '100%',
            minHeight: 34,
            marginTop: 12,
            padding: '8px 10px',
            borderRadius: 9,
            border: isActive
              ? `1px solid ${style.accent}`
              : style.border,
            background: isActive ? style.accent : '#FFFFFF',
            color: isActive ? '#FFFFFF' : style.accent,
            fontSize: 11.5,
            fontWeight: 850,
            cursor: 'pointer',
            outline: 'none',
          }}
          onFocus={(event) => {
            event.currentTarget.style.outline =
              '3px solid rgba(91, 68, 157, 0.28)'
            event.currentTarget.style.outlineOffset = '2px'
          }}
          onBlur={(event) => {
            event.currentTarget.style.outline = 'none'
            event.currentTarget.style.outlineOffset = '0'
          }}
        >
          {actionLabel}
        </button>
      ) : null}
    </section>
  )
}


export default function PathwayChoiceComparison({
  userSelectedStage,
  path360RecommendedStage,
  activeStageId,
  onUseSelectedPath,
  onUseRecommendedPath,
}) {
  const hasSelectedPath = Boolean(userSelectedStage?.id)
  const hasRecommendation = Boolean(path360RecommendedStage?.id)

  if (!hasRecommendation) return null

  const pathsMatch =
    hasSelectedPath &&
    userSelectedStage.id === path360RecommendedStage.id

  if (pathsMatch) {
    return (
      <section
        aria-label="Pathway agreement"
        style={{
          padding: 14,
          borderRadius: 14,
          border: getCardStyle('agreed').border,
          background: getCardStyle('agreed').background,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 9,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 27,
              height: 27,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
              borderRadius: 999,
              background: '#FFFFFF',
              color: getCardStyle('agreed').accent,
              border: getCardStyle('agreed').border,
              fontSize: 15,
              fontWeight: 900,
            }}
          >
            ✓
          </span>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: getCardStyle('agreed').accent,
                fontSize: 10,
                fontWeight: 850,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                lineHeight: 1.3,
              }}
            >
              You and PATH360 agree
            </div>

            <div
              style={{
                marginTop: 5,
                color: 'var(--text, #151614)',
                fontSize: 14,
                fontWeight: 850,
                lineHeight: 1.35,
                overflowWrap: 'anywhere',
              }}
            >
              Stage {path360RecommendedStage.number} ·{' '}
              {path360RecommendedStage.title}
            </div>

            <p
              style={{
                margin: '5px 0 0',
                color: 'var(--text-soft, #5D635D)',
                fontSize: 11.5,
                lineHeight: 1.55,
              }}
            >
              Your selected path and PATH360’s evidence-based recommendation
              point to the same next focus.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Compare pathway choices">
      <div
        style={{
          marginBottom: 8,
          color: 'var(--text, #151614)',
          fontSize: 13,
          fontWeight: 850,
        }}
      >
        Compare your pathway options
      </div>

      <p
        style={{
          margin: '0 0 11px',
          color: 'var(--text-soft, #5D635D)',
          fontSize: 11.5,
          lineHeight: 1.55,
        }}
      >
        Your choice remains in control. PATH360’s recommendation uses your
        progress, evidence, current tension, and decision. You can use either
        path and update it later.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 9,
        }}
      >
        {hasSelectedPath ? (
          <PathCard
            type="selected"
            icon="●"
            eyebrow="Your selected path"
            badge="Your choice"
            stage={userSelectedStage}
            description="This is the pathway you selected or kept as your current focus."
            isActive={activeStageId === userSelectedStage.id}
            actionLabel={
              activeStageId === userSelectedStage.id
                ? 'Your active path'
                : 'Use my selected path'
            }
            onAction={onUseSelectedPath}
          />
        ) : (
          <section
            style={{
              minWidth: 0,
              padding: 13,
              borderRadius: 14,
              border: getCardStyle('selected').border,
              background: getCardStyle('selected').background,
            }}
          >
            <div
              style={{
                color: getCardStyle('selected').accent,
                fontSize: 9,
                fontWeight: 850,
                letterSpacing: '.1em',
                textTransform: 'uppercase',
                lineHeight: 1.3,
              }}
            >
              Your selected path
            </div>

            <p
              style={{
                margin: '10px 0 0',
                color: 'var(--text-soft, #5D635D)',
                fontSize: 11.5,
                lineHeight: 1.55,
              }}
            >
              You have not chosen a different path. PATH360’s recommendation is
              currently active.
            </p>
          </section>
        )}

        <PathCard
          type="recommended"
          icon="✦"
          eyebrow="PATH360 recommended path"
          badge="Based on your signals"
          stage={path360RecommendedStage}
          description="This recommendation is based on your progress, evidence, tension, and next decision."
          isActive={activeStageId === path360RecommendedStage.id}
          actionLabel={
            activeStageId === path360RecommendedStage.id
              ? 'PATH360 path is active'
              : `Use PATH360’s ${path360RecommendedStage.title} path`
          }
          onAction={onUseRecommendedPath}
        />
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 7,
          marginTop: 10,
          padding: '9px 10px',
          borderRadius: 10,
          background: 'var(--surface-soft, #F8F9F6)',
          border: '1px solid var(--border, #DDE2DC)',
          color: 'var(--text-soft, #5D635D)',
          fontSize: 11,
          lineHeight: 1.5,
        }}
      >
        <span aria-hidden="true" style={{ color: 'var(--lilac-800, #5B449D)' }}>
          ↔
        </span>
        <span>
          These pathways differ. Compare them before continuing; PATH360 will
          keep explaining its recommendation as your evidence changes.
        </span>
      </div>
    </section>
  )
}