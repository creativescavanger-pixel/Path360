import { useMemo } from 'react'
import AcademyModuleActionBar from './academy/AcademyModuleActionBar.jsx'
import AcademyStatusSelector from './academy/AcademyStatusSelector.jsx'

const STATUS_OPTIONS = [
  ['learned', 'Learned'],
  ['applied', 'Applied'],
  ['evidence-backed', 'Evidence-backed'],
]

const FIELDS = [
  ['observationTitle', 'Observation title', 'Name the situation you observed.'],
  ['observationContext', 'Context', 'Where and when did this happen?'],
  ['participantRole', 'Person or role', 'Who was involved?'],
  ['participantGoal', 'Goal', 'What were they trying to accomplish?'],
  ['journeySteps', 'Journey and steps', 'What did they do, in sequence?'],
  ['frictionObserved', 'Friction observed', 'Where did effort, delay, cost, or confusion appear?'],
  ['workaroundObserved', 'Workaround observed', 'What did they do instead?'],
  ['alternativesUsed', 'Alternatives used', 'What tools, people, or informal options did they use?'],
  ['exactSignals', 'Exact signals', 'Capture words, actions, or details you can verify.'],
  ['founderInterpretation', 'Founder interpretation', 'What do you think this evidence may mean?'],
  ['followUpAction', 'Follow-up fieldwork', 'What will you observe or ask next?'],
]

export default function MissionObservationWorkarounds({
  work,
  updateWork,
  progress,
  loadingJournal,
  saving,
  uploading,
  latestVersion,
  journalVersions,
  notice,
  error,
  onBack,
  onSave,
  onUpload,
  completionReady,
  onContinue,
  embedded = false,
}) {
  const statusLabel = useMemo(
    () =>
      STATUS_OPTIONS.find(([value]) => value === work.status)?.[1] ||
      'Learned',
    [work.status],
  )

  return (
    <main
      style={
        embedded
          ? { marginTop: 24 }
          : { maxWidth: 1040, margin: '0 auto', paddingBottom: 28 }
      }
    >
      {!embedded ? (
        <button
          type="button"
          onClick={onBack}
          style={{
            marginBottom: 16,
            padding: 0,
            border: 0,
            background: 'transparent',
            color: 'var(--green-700, #1A704D)',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          ← Back to Discover workshop
        </button>
      ) : null}

      <section className="p360-card" style={{ padding: 24, borderRadius: 18 }}>
        {!embedded ? (
          <>
            <div
              style={{
                marginBottom: 8,
                color: 'var(--green-700, #1A704D)',
                fontSize: 11,
                fontWeight: 850,
                letterSpacing: '.115em',
                textTransform: 'uppercase',
              }}
            >
              Stage 0 · Discover · Module 0.4
            </div>
            <h1
              style={{
                margin: '0 0 8px',
                fontSize: 'clamp(26px, 2.6vw, 30px)',
                lineHeight: 1.18,
              }}
            >
              Observe people, behaviour, and workarounds
            </h1>
            <p
              style={{
                maxWidth: 760,
                margin: 0,
                color: 'var(--text-soft, #5D635D)',
                fontSize: 14.5,
                lineHeight: 1.7,
              }}
            >
              Turn an environment signal into direct evidence of customer behaviour
              and existing workarounds.
            </p>
          </>
        ) : null}

        <div style={{ display: 'grid', gap: 16, marginTop: embedded ? 0 : 24 }}>
          {FIELDS.map(([key, label, hint]) => (
            <label key={key} style={{ display: 'grid', gap: 7 }}>
              <span style={{ fontSize: 14, fontWeight: 800 }}>{label}</span>
              <span
                style={{
                  color: 'var(--text-soft, #5D635D)',
                  fontSize: 12.5,
                  lineHeight: 1.5,
                }}
              >
                {hint}
              </span>
              <textarea
                value={work[key] || ''}
                onChange={(event) => updateWork(key, event.target.value)}
                rows={key === 'observationTitle' ? 2 : 4}
                className="p360-textarea"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: 12,
                  fontSize: 14,
                  lineHeight: 1.6,
                }}
              />
            </label>
          ))}

          <label style={{ display: 'grid', gap: 7 }}>
            <span style={{ fontSize: 14, fontWeight: 800 }}>Evidence file</span>
            <input type="file" onChange={onUpload} disabled={uploading} />
            {work.evidenceName ? (
              <span style={{ color: 'var(--text-soft, #5D635D)', fontSize: 12.5 }}>
                {work.evidenceName}
              </span>
            ) : null}
          </label>

          <div>
            <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 800 }}>
              Work status
            </div>
            <AcademyStatusSelector
              options={STATUS_OPTIONS.map(([value, label]) => ({
                value,
                label,
                description:
                  value === 'evidence-backed'
                    ? 'The work includes direct evidence.'
                    : value === 'applied'
                      ? 'I completed the practical work.'
                      : 'I understand the observation method.',
              }))}
              status={work.status}
              onChange={(value) => updateWork('status', value)}
            />
            <div
              style={{
                marginTop: 8,
                color: 'var(--text-soft, #5D635D)',
                fontSize: 12.5,
              }}
            >
              Current status: {statusLabel}
            </div>
          </div>
        </div>

        {notice ? (
          <div
            role="status"
            style={{
              marginTop: 18,
              color: 'var(--green-800, #15563E)',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {notice}
          </div>
        ) : null}
        {error ? (
          <div
            role="alert"
            style={{
              marginTop: 18,
              color: 'var(--danger, #8B2020)',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        ) : null}

        <AcademyModuleActionBar
          progress={progress}
          latestVersion={latestVersion}
          saving={saving}
          loadingJournal={loadingJournal}
          completionReady={completionReady}
          onSave={onSave}
          onContinue={onContinue}
          continueLabel="Continue to Discover 0.5"
          readyHelp="Your observation log is ready. Continue when you are ready to identify the problem or gap worth investigating."
        />
      </section>

      {journalVersions.length ? (
        <p style={{ color: 'var(--text-soft, #5D635D)', fontSize: 12.5 }}>
          This observation has {journalVersions.length} saved version
          {journalVersions.length === 1 ? '' : 's'}.
        </p>
      ) : null}
    </main>
  )
}
