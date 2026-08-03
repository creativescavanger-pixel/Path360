export function safeFileBaseName(value) {
  return String(value || 'document')
    .replace(/[^a-zA-Z0-9-_ ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

function formatSectionText(sectionTitle, lines) {
  const filtered = (lines || []).filter((value) => String(value || '').trim())
  if (!filtered.length) return ''

  return [`${sectionTitle}`, ...filtered.map((value) => `- ${value}`)].join('\n')
}

export function buildPlainTextBlob(previewText, format) {
  const normalized = String(previewText || '')
  const structured = normalized
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith('Title') || block.startsWith('Summary')) return block
      return block.replace(/\n/g, '\n- ')
    })
    .join('\n\n')

  if (format === 'pdf') {
    return new Blob([structured || normalized], { type: 'application/pdf' })
  }

  if (format === 'docx') {
    return new Blob([structured || normalized], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
  }

  if (format === 'pptx') {
    return new Blob([structured || normalized], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    })
  }

  return new Blob([structured || normalized], { type: 'text/plain;charset=utf-8' })
}

export function buildFileFromPreview({ previewText, title, format }) {
  const blob = buildPlainTextBlob(previewText, format)
  const base = safeFileBaseName(title)
  return new File([blob], `${base}.${format}`, { type: blob.type })
}