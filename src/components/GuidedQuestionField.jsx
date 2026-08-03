export default function GuidedQuestionField({ question, value, onChange }) {
  const commonStyle = {
    width: '100%',
    border: '1px solid #E2DED6',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 13,
    color: '#1C1C1A',
    background: '#F7F5F0',
    fontFamily: "'DM Sans', sans-serif",
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          display: 'block',
          fontSize: 12,
          fontWeight: 600,
          color: '#1C1C1A',
          marginBottom: 6,
        }}
      >
        {question.label}
        {question.required ? ' *' : ''}
      </label>

      {question.type === 'textarea' ? (
        <textarea
          rows={5}
          value={value || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          style={{ ...commonStyle, resize: 'vertical', minHeight: 110 }}
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(question.id, e.target.value)}
          style={commonStyle}
        />
      )}
    </div>
  )
}