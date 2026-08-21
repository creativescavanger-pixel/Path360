export default function MissionCompletionCard({ title, message, nextMessage, buttonLabel, onContinue }) {
  return (
    <section
      style={{
        marginBottom: 30,
        padding: 18,
        borderRadius: 16,
        border: '1px solid #BFD9C7',
        background: '#EEF7F1',
        display: 'flex',
        gap: 14,
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 10.5,
            color: '#1D6B4F',
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 5,
          }}
        >
          {title}
        </div>

        <div
          style={{
            fontSize: 16,
            fontWeight: 800,
            color: '#19563E',
            marginBottom: 4,
          }}
        >
          {message}
        </div>

        <div
          style={{
            fontSize: 12.5,
            color: '#4E6A5A',
            lineHeight: 1.55,
          }}
        >
          {nextMessage}
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        style={{
          background: '#1D6B4F',
          border: '1px solid #1D6B4F',
          color: '#FFFFFF',
          borderRadius: 10,
          padding: '10px 13px',
          fontSize: 12.5,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        {buttonLabel}
      </button>
    </section>
  )
}
