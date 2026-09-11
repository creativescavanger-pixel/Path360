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

export default function MissionFounderContext({ work = {}, updateWork = () => {} }) {
  const summary = useMemo(() => {
    const entries = [
      work.backgroundAndExperience,
      work.networkAndAccess,
      work.startingResources,
      work.constraints,
      work.investigateNow,
    ].filter(Boolean)

    return entries.length
  }, [work])

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: '0 auto', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
      <section className="p360-card" style={{ padding: 20, borderRadius: 18 }}>
        <div style={{ color: 'var(--lilac-700, #694FB2)', fontSize: 10, fontWeight: 850, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
          Discover · Module 0.1
        </div>

        <h1 style={{ margin: '0 0 8px', fontSize: 24, letterSpacing: '-.035em' }}>
          Founder Context Profile
        </h1>

        <p style={{ margin: '0 0 18px', color: 'var(--text-soft, #5D635D)', fontSize: 13, lineHeight: 1.7 }}>
          Start with what you already know, what you can access, and where your next evidence should land.
        </p>

        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Background and experience</label>
            <textarea
              value={work.backgroundAndExperience || ''}
              onChange={(event) => updateWork('backgroundAndExperience', event.target.value)}
              rows={4}
              style={fieldStyle}
              placeholder="What experience, skills, or lived context already shape how you notice problems?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Network and access</label>
            <textarea
              value={work.networkAndAccess || ''}
              onChange={(event) => updateWork('networkAndAccess', event.target.value)}
              rows={4}
              style={fieldStyle}
              placeholder="Who can you already learn from, talk to, or observe?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Starting resources</label>
            <textarea
              value={work.startingResources || ''}
              onChange={(event) => updateWork('startingResources', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="Time, money, product access, tools, or support you can already rely on."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>Constraints</label>
            <textarea
              value={work.constraints || ''}
              onChange={(event) => updateWork('constraints', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="What limits your speed, budget, or reach?"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 800, fontSize: 12.5 }}>What should I investigate now?</label>
            <textarea
              value={work.investigateNow || ''}
              onChange={(event) => updateWork('investigateNow', event.target.value)}
              rows={3}
              style={fieldStyle}
              placeholder="The next small learning question or fieldwork priority."
            />
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ color: 'var(--text-soft, #5D635D)', fontSize: 12, fontWeight: 700 }}>
            {summary} captured insights
          </div>
          <span style={{ padding: '8px 10px', borderRadius: 999, background: 'var(--green-100, #E9F4EC)', color: 'var(--green-800, #15563E)', fontSize: 11, fontWeight: 850 }}>
            Founder capability map
          </span>
        </div>
      </section>
    </div>
  )
}
