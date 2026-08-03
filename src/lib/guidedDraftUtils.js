export function buildInitialSections(schema) {
  const sections = {}

  for (const section of schema.sections) {
    sections[section.id] = {
      answers: Object.fromEntries(section.questions.map((q) => [q.id, ''])),
      completed: false,
      updatedAt: null,
    }
  }

  return sections
}

export function calculateCompletedSections(sections) {
  return Object.entries(sections)
    .filter(([, value]) => value?.completed)
    .map(([key]) => key)
}

export function calculateProgressPercent(schema, sections) {
  const total = schema?.sections?.length || 0
  if (!total) return 0

  const completed = calculateCompletedSections(sections).length
  return Math.round((completed / total) * 100)
}

export function isSectionComplete(schemaSection, sectionState) {
  if (!schemaSection || !sectionState) return false

  return schemaSection.questions
    .filter((q) => q.required)
    .every((q) => String(sectionState.answers?.[q.id] || '').trim().length > 0)
}