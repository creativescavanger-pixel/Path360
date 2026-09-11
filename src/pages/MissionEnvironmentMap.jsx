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

export default function MissionEnvironmentMap({ work = {}, updateWork = () => {} }) {
  const summary = useMemo(() => {
    const entries = [
      work.environmentLens,
      work.environmentFocus,
      work.peopleAndAccess,
      work.assetsAndResources,
      work.frictionAndGaps,
      work.changeSignal,
      work.nextFieldwork,
    ].filter(Boolean)

    return entries.length
  }, [work])

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
      <section className="p360-card" style={{ padding: 20, borderRadius: 18 }}>
        <div style={{ color: 'var(--lilac-700, #694FB2)', fontSize: 10, fontWeight: 850, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Discover · Module 0.3
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: 24, letterSpacing: '-.035em' }}>
          Environment and Opportunity Map
        </h1>

        <p style={{ margin: '0 0 18px', color: 'var(--text-soft, #5D635D)', fontSize: 13, lineHeight: 1.7 }}>
          Place the problem in context before guessing at a solution. Think about people, constraints, incentives, and the signals that already point to friction.
        </p>

        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Lens</label>
            <textarea
              value={work.environmentLens || ''}
              onChange={(event) => updateWork('environmentLens', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="Which environment or domain are you studying?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Focus</label>
            <textarea
              value={work.environmentFocus || ''}
              onChange={(event) => updateWork('environmentFocus', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="Where is the strongest friction, pressure, or inefficiency?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>People and access</label>
            <textarea
              value={work.peopleAndAccess || ''}
              onChange={(event) => updateWork('peopleAndAccess', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="Who is involved, who matters, and who can you talk to?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Assets and resources</label>
            <textarea
              value={work.assetsAndResources || ''}
              onChange={(event) => updateWork('assetsAndResources', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="What is already in place: tools, local knowledge, distribution, or infrastructure?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Friction and gaps</label>
            <textarea
              value={work.frictionAndGaps || ''}
              onChange={(event) => updateWork('frictionAndGaps', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="What is expensive, delayed, unreliable, or poorly served?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Next fieldwork</label>
            <textarea
              value={work.nextFieldwork || ''}
              onChange={(event) => updateWork('nextFieldwork', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="What will you observe or test next to confirm the pattern?"
            />
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ color: 'var(--text-soft, #5D635D)', fontSize: 12, fontWeight: 700 }}>
            {summary} captured observations
          </div>
          <span style={{ padding: '8px 10px', borderRadius: 999, background: 'var(--lilac-050, #F8F6FF)', color: 'var(--lilac-800, #5B449D)', fontSize: 11, fontWeight: 850 }}>
            Opportunity environment map
          </span>
        </div>
      </section>
    </div>
  )
}
