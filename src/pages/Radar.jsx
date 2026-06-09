const RADAR_SIGNALS = [
  {
    id: 1,
    area: 'Strategy clarity',
    score: '8.2',
    summary: 'Your positioning is becoming clearer, but it strengthens most when linked directly to concrete execution priorities.',
    tone: 'strong',
  },
  {
    id: 2,
    area: 'Investor readiness',
    score: '6.9',
    summary: 'The core narrative is promising, though some claims still need tighter proof and sharper prioritisation.',
    tone: 'watch',
  },
  {
    id: 3,
    area: 'Market narrative',
    score: '7.6',
    summary: 'The opportunity is legible, especially when framed around urgency, timing, and founder-market fit.',
    tone: 'strong',
  },
  {
    id: 4,
    area: 'Execution confidence',
    score: '6.4',
    summary: 'Momentum is visible, but next steps need to remain extremely clear for advisors and investors.',
    tone: 'watch',
  },
]

const PRIORITIES = [
  'Strengthen the bridge between founder story and business evidence.',
  'Turn assessment insights into sharper investor-facing proof points.',
  'Make next-step execution priorities easier to communicate at a glance.',
]

const RECOMMENDATIONS = [
  'Refine the top three claims you want investors to believe, then connect each one to evidence.',
  'Keep market timing, founder insight, and product direction in one narrative thread across all outputs.',
  'Use Reports and Memory together so strategic learning compounds instead of getting lost over time.',
]

function SectionCard({ title, subtitle, children }) {
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
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1A', marginBottom: 4 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 12.5, color: '#6B6965', lineHeight: 1.6 }}>{subtitle}</div>
        )}
      </div>
      {children}
    </section>
  )
}

function getToneStyles(tone) {
  if (tone === 'strong') {
    return {
      ring: 'rgba(42,106,81,0.16)',
      fill: '#EEF4EF',
      text: '#2A6A51',
      border: '#D6E4D7',
    }
  }

  return {
    ring: 'rgba(138,110,42,0.16)',
    fill: '#F3F1EA',
    text: '#8A6E2A',
    border: '#E6DDC8',
  }
}

export default function Radar() {
  return (
    <div style={{ padding: 24 }}>
      <div style={{ maxWidth: 1080 }}>
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2DED6',
            borderRadius: 18,
            padding: 24,
            marginBottom: 18,
            boxShadow: '0 6px 16px rgba(22,24,27,0.04)',
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: '#8A6E2A',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Venture Radar
          </div>

          <h1
            style={{
              fontSize: 26,
              lineHeight: 1.15,
              fontWeight: 700,
              color: '#1C1C1A',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}
          >
            See your venture&apos;s current signal strength
          </h1>

          <p
            style={{
              fontSize: 14,
              color: '#6B6965',
              lineHeight: 1.75,
              margin: 0,
              maxWidth: 760,
            }}
          >
            Track the strongest and weakest signals across strategy, market story, execution, and investor readiness.
            This workspace helps surface where your venture feels convincing, where it needs reinforcement, and what should be prioritised next.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.45fr) minmax(320px, 0.9fr)',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <SectionCard
              title="Signal map"
              subtitle="A lightweight MVP replacement for the future interactive radar view."
            >
              <div style={{ display: 'grid', gap: 12 }}>
                {RADAR_SIGNALS.map((signal) => {
                  const tone = getToneStyles(signal.tone)

                  return (
                    <div
                      key={signal.id}
                      style={{
                        background: '#F7F5F0',
                        border: '1px solid #ECE6DB',
                        borderRadius: 14,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 12,
                          marginBottom: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1A', marginBottom: 4 }}>
                            {signal.area}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#8C8A84' }}>Current venture signal</div>
                        </div>

                        <div
                          style={{
                            minWidth: 62,
                            padding: '8px 12px',
                            borderRadius: 999,
                            background: tone.fill,
                            color: tone.text,
                            border: `1px solid ${tone.border}`,
                            fontSize: 16,
                            fontWeight: 700,
                            textAlign: 'center',
                            boxShadow: `inset 0 0 0 1px ${tone.ring}`,
                          }}
                        >
                          {signal.score}
                        </div>
                      </div>

                      <div style={{ fontSize: 12.5, color: '#6B6965', lineHeight: 1.7 }}>{signal.summary}</div>
                    </div>
                  )
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Priority focus"
              subtitle="The areas that deserve the most attention based on your current signal mix."
            >
              <div style={{ display: 'grid', gap: 10 }}>
                {PRIORITIES.map((item) => (
                  <div
                    key={item}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: '#F7F5F0',
                      border: '1px solid #ECE6DB',
                    }}
                  >
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: 999,
                        background: 'rgba(33,95,70,0.10)',
                        color: '#1D6B4F',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 11,
                        fontWeight: 800,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      •
                    </div>
                    <div style={{ fontSize: 13, color: '#1C1C1A', lineHeight: 1.65 }}>{item}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            <SectionCard
              title="Radar summary"
              subtitle="A quick read on what the venture currently signals to an outside observer."
            >
              <div
                style={{
                  background: '#EEF4EF',
                  border: '1px solid #D6E4D7',
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ fontSize: 13, color: '#1C1C1A', lineHeight: 1.75 }}>
                  The venture currently signals strongest in strategic clarity and market narrative, while investor readiness and execution confidence still need tighter framing.
                  The opportunity is credible, but the proof chain must stay visible and easy to follow.
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Recommended moves"
              subtitle="A simple MVP decision layer that makes the radar tab actionable."
            >
              <div style={{ display: 'grid', gap: 10 }}>
                {RECOMMENDATIONS.map((item) => (
                  <div
                    key={item}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      border: '1px solid #ECE6DB',
                      background: '#FFFFFF',
                      color: '#6B6965',
                      fontSize: 12.5,
                      lineHeight: 1.7,
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Radar health"
              subtitle="A simple snapshot of the current venture-readiness picture."
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                {[
                  { label: 'Strong signals', value: '02' },
                  { label: 'Watch areas', value: '02' },
                  { label: 'Key priorities', value: '03' },
                  { label: 'Readiness score', value: '74%' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    style={{
                      background: '#F7F5F0',
                      border: '1px solid #ECE6DB',
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div style={{ fontSize: 11, color: '#8C8A84', marginBottom: 6 }}>{stat.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#1C1C1A' }}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  )
}