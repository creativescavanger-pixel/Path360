const MEMORY_FEED = [
  {
    id: 1,
    type: 'Investor feedback',
    title: 'Investors responded well to the founder-market fit story',
    detail: 'Your strongest reactions came when the narrative clearly linked your personal experience to the problem you are solving.',
    date: 'Today',
  },
  {
    id: 2,
    type: 'Strategic decision',
    title: 'Shifted positioning toward a clearer B2B narrative',
    detail: 'Messaging is moving toward a more structured, enterprise-ready explanation of product value and long-term growth.',
    date: 'Yesterday',
  },
  {
    id: 3,
    type: 'Pattern',
    title: 'Clarity improves when strategy is connected to execution',
    detail: 'The most persuasive moments are the ones that connect vision, traction, and concrete next steps in one flow.',
    date: 'This week',
  },
]

const PATTERNS = [
  'You communicate best when you start with the problem, then move into execution.',
  'Your strongest material tends to connect personal conviction with commercial logic.',
  'Investor-facing content becomes clearer when growth assumptions are made explicit.',
]

const PINNED_ITEMS = [
  'Why this founder, why this market, why now.',
  'Enterprise and investor narratives need to stay tightly aligned.',
  'Preserve important assessment outputs and strategic decisions over time.',
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

export default function Memory() {
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
            Founder Memory
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
            Your founder narrative, captured over time
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
            Track the strategic ideas, investor signals, recurring patterns, and critical decisions that shape how your venture evolves.
            This workspace gives you a living memory layer for better storytelling, sharper positioning, and more consistent execution.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 0.9fr)',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <div style={{ display: 'grid', gap: 16 }}>
            <SectionCard
              title="Strategic memory timeline"
              subtitle="A running record of feedback, decisions, and narrative shifts worth keeping visible."
            >
              <div style={{ display: 'grid', gap: 12 }}>
                {MEMORY_FEED.map((item) => (
                  <div
                    key={item.id}
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
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        marginBottom: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: '#2A6A51',
                        }}
                      >
                        {item.type}
                      </div>

                      <div style={{ fontSize: 11, color: '#8C8A84' }}>{item.date}</div>
                    </div>

                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1C1A', marginBottom: 6 }}>
                      {item.title}
                    </div>

                    <div style={{ fontSize: 12.5, color: '#6B6965', lineHeight: 1.7 }}>
                      {item.detail}
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Pinned memory"
              subtitle="The key ideas you want to keep stable across decks, reports, and strategic decisions."
            >
              <div style={{ display: 'grid', gap: 10 }}>
                {PINNED_ITEMS.map((item) => (
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
              title="AI pattern summary"
              subtitle="Early synthesis of how your strategic story is forming across assessments, content, and feedback."
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
                  Your memory signals suggest that your strongest founder narrative combines personal conviction, structured market logic,
                  and clear execution steps. The more tightly those three elements stay connected, the stronger your strategic communication becomes.
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {PATTERNS.map((pattern) => (
                  <div
                    key={pattern}
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
                    {pattern}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Memory health"
              subtitle="A simple MVP view of what your strategic record is already capturing."
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
                {[
                  { label: 'Saved themes', value: '12' },
                  { label: 'Key decisions', value: '06' },
                  { label: 'Investor notes', value: '09' },
                  { label: 'Patterns surfaced', value: '03' },
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