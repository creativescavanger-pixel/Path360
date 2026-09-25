import { useMemo } from 'react'

const fieldStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid var(--border, #DDE2DC)',
  borderRadius: 11,
  padding: 11,
  background: 'var(--surface, #FFF)',
  color: 'var(--text, #151614)',
  fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
  fontSize: 12.5,
  lineHeight: 1.55,
  resize: 'vertical',
}

export default function MissionProblemsNeedsGaps({ work = {}, updateWork = () => {} }) {
  const summary = useMemo(() => {
    const entries = [
      work.problemType,
      work.affectedGroup,
      work.problemStatement,
      work.desiredOutcome,
      work.observedEvidence,
      work.currentWorkaround,
      work.criticalUncertainty,
      work.nextEvidenceAction,
    ].filter(Boolean)

    return entries.length
  }, [work])

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
      <section className="p360-card" style={{ padding: 20, borderRadius: 18 }}>
        <div style={{ color: 'var(--lilac-700, #694FB2)', fontSize: 10, fontWeight: 850, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Discover · Module 0.5
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: 24, letterSpacing: '-.035em' }}>
          Problems, Needs, Gaps, and Underused Assets
        </h1>

        <p style={{ margin: '0 0 18px', color: 'var(--text-soft, #5D635D)', fontSize: 13, lineHeight: 1.7 }}>
          Turn a collection of observed friction into a sharper problem statement grounded in evidence and customer reality.
        </p>

        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Problem type</label>
            <textarea
              value={work.problemType || ''}
              onChange={(event) => updateWork('problemType', event.target.value)}
              rows={2}
              style={fieldStyle}
              placeholder="Speed, trust, access, quality, admin burden, consistency, cost, clarity..."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Affected group</label>
            <textarea
              value={work.affectedGroup || ''}
              onChange={(event) => updateWork('affectedGroup', event.target.value)}
              rows={2}
              style={fieldStyle}
              placeholder="Who is directly affected by this problem?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Problem statement</label>
            <textarea
              value={work.problemStatement || ''}
              onChange={(event) => updateWork('problemStatement', event.target.value)}
              rows={4}
              style={fieldStyle}
              placeholder="State the problem clearly in terms of human friction, constraint, or missing capability."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Desired outcome</label>
            <textarea
              value={work.desiredOutcome || ''}
              onChange={(event) => updateWork('desiredOutcome', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="What would a materially better outcome look like?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Observed evidence</label>
            <textarea
              value={work.observedEvidence || ''}
              onChange={(event) => updateWork('observedEvidence', event.target.value)}
              rows={4}
              style={fieldStyle}
              placeholder="What did you see, hear, or document that suggests this is real?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Current workaround</label>
            <textarea
              value={work.currentWorkaround || ''}
              onChange={(event) => updateWork('currentWorkaround', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="How are people currently working around this problem?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Critical uncertainty</label>
            <textarea
              value={work.criticalUncertainty || ''}
              onChange={(event) => updateWork('criticalUncertainty', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="What is still uncertain and would change the opportunity?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Next evidence action</label>
            <textarea
              value={work.nextEvidenceAction || ''}
              onChange={(event) => updateWork('nextEvidenceAction', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="What will you look for next to confirm or reduce this risk?"
            />
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ color: 'var(--text-soft, #5D635D)', fontSize: 12, fontWeight: 700 }}>
            {summary} problem signals captured
          </div>
          <span style={{ padding: '8px 10px', borderRadius: 999, background: 'var(--green-100, #E9F4EC)', color: 'var(--green-800, #15563E)', fontSize: 11, fontWeight: 850 }}>
            Problem evidence canvas
          </span>
        </div>
      </section>
    </div>
  )
}
