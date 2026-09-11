export default function AcademyModuleActionBar({
  progress = 0,
  latestVersion = 0,
  saving = false,
  loadingJournal = false,
  completionReady = false,
  onSave,
  onContinue,
  continueLabel = 'Continue',
  readyHelp = 'This module is ready to continue.',
}) {
  return (
    <div
      style={{
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        border: '1px solid var(--border, #DDE2DC)',
        background: 'var(--surface-soft, #F8F9F6)',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              color: 'var(--text-faint, #899089)',
              fontSize: 10,
              fontWeight: 850,
              letterSpacing: '.09em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Progress
          </div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>{progress}% complete</div>
        </div>

        <div style={{ color: 'var(--text-soft, #5D635D)', fontSize: 12 }}>
          Latest version: {latestVersion || 0}
        </div>
      </div>

      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: 'var(--surface, #FFFFFF)',
          border: '1px solid var(--border, #DDE2DC)',
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: `${Math.min(100, Math.max(0, progress))}%`,
            height: '100%',
            background: 'linear-gradient(90deg, var(--green-700, #1A704D), var(--lilac-700, #694FB2))',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <button
          type="button"
          onClick={onSave}
          disabled={saving || loadingJournal}
          style={{
            border: '1px solid var(--border, #DDE2DC)',
            background: '#FFFFFF',
            color: 'var(--text, #151614)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 12,
            fontWeight: 800,
            cursor: saving || loadingJournal ? 'not-allowed' : 'pointer',
            opacity: saving || loadingJournal ? 0.7 : 1,
          }}
        >
          {saving ? 'Saving…' : loadingJournal ? 'Loading…' : 'Save progress'}
        </button>

        <button
          type="button"
          onClick={onContinue}
          disabled={!completionReady}
          style={{
            border: '1px solid var(--green-700, #1A704D)',
            background: completionReady ? 'var(--green-700, #1A704D)' : 'var(--surface, #FFFFFF)',
            color: completionReady ? '#FFFFFF' : 'var(--text-faint, #899089)',
            borderRadius: 10,
            padding: '10px 12px',
            fontSize: 12,
            fontWeight: 800,
            cursor: completionReady ? 'pointer' : 'not-allowed',
          }}
        >
          {continueLabel}
        </button>
      </div>

      {completionReady ? (
        <div style={{ marginTop: 12, fontSize: 12, color: 'var(--green-800, #15563E)', fontWeight: 700 }}>
          {readyHelp}
        </div>
      ) : null}
    </div>
  )
}
