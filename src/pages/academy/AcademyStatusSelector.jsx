export default function AcademyStatusSelector({ options = [], status, onChange }) {
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {options.map((option) => {
        const selected = option.value === status

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            style={{
              width: '100%',
              textAlign: 'left',
              border: selected ? '1px solid var(--green-700, #1A704D)' : '1px solid var(--border, #DDE2DC)',
              background: selected ? 'var(--green-050, #F4FAF6)' : '#FFFFFF',
              borderRadius: 12,
              padding: '10px 12px',
              color: selected ? 'var(--green-800, #15563E)' : 'var(--text, #151614)',
              cursor: 'pointer',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 850 }}>{option.label}</div>
            <div style={{ fontSize: 11.5, marginTop: 4, color: selected ? 'var(--green-800, #15563E)' : 'var(--text-soft, #5D635D)' }}>
              {option.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}
