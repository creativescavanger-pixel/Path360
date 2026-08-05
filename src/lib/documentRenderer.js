// src/lib/documentRenderer.js

import { getDocumentGuideSchema } from './documentGuideSchemas.js'

function renderSection(sectionSchema, sectionState) {
  const entries = Object.entries(sectionState?.answers || {}).filter(([, value]) =>
    String(value || '').trim()
  )
  if (!entries.length) return ''

  const body = entries
    .map(([key, value]) => {
      const question = sectionSchema.questions.find((q) => q.id === key)
      const label = question?.label || key
      return `${label}\n${value}`
    })
    .join('\n\n')

  return `${sectionSchema.title}\n\n${body}`
}

export function renderDocumentPreview({ docType, draftData }) {
  const schema = getDocumentGuideSchema(docType)
  if (!schema) return ''

  const sections = draftData?.sections || {}

  const renderedSections = schema.sections
    .map((section) => renderSection(section, sections[section.id]))
    .filter(Boolean)

  return [schema.title, '', ...renderedSections].join('\n\n')
}

// Render a structured document (from generateDocument) into plain text
export function renderStructuredDocumentToText(structuredDocument) {
  if (!structuredDocument) return ''

  const lines = []

  const title = structuredDocument.title || structuredDocument.docType
  if (title) {
    lines.push(String(title))
  }

  if (structuredDocument.summary) {
    lines.push('', String(structuredDocument.summary))
  }

  const sections = Array.isArray(structuredDocument.sections)
    ? structuredDocument.sections
    : []
  const slides = Array.isArray(structuredDocument.slides)
    ? structuredDocument.slides
    : []

  if (sections.length > 0) {
    sections.forEach((section) => {
      if (!section) return
      const secLines = []
      if (section.title) secLines.push(String(section.title))
      if (section.content) secLines.push('', String(section.content))
      if (secLines.length) {
        lines.push('', secLines.join('\n'))
      }
    })
  } else if (slides.length > 0) {
    slides.forEach((slide, index) => {
      if (!slide) return
      const slideLines = []
      slideLines.push(slide.title ? String(slide.title) : `Slide ${index + 1}`)
      if (slide.objective) {
        slideLines.push('', `Objective: ${String(slide.objective)}`)
      }
      if (Array.isArray(slide.keyPoints) && slide.keyPoints.length > 0) {
        slideLines.push('', 'Key points:')
        slide.keyPoints.forEach((pt) => {
          slideLines.push(`- ${String(pt)}`)
        })
      }
      if (slide.proof) {
        slideLines.push('', `What this slide proves: ${String(slide.proof)}`)
      }
      lines.push('', slideLines.join('\n'))
    })
  }

  return lines.join('\n')
}

export function renderStructuredDocumentBodyToText(structuredDocument) {
  if (!structuredDocument) return ''
  if (typeof structuredDocument === 'string') return structuredDocument

  const sections = Array.isArray(structuredDocument.sections)
    ? structuredDocument.sections
    : []

  if (sections.length > 0) {
    return sections
      .map((section) => String(section?.content || '').trim())
      .filter(Boolean)
      .join('\n\n')
  }

  const slides = Array.isArray(structuredDocument.slides)
    ? structuredDocument.slides
    : []

  if (slides.length > 0) {
    return slides
      .map((slide) => {
        const slideLines = []
        if (slide.title) slideLines.push(String(slide.title))
        if (slide.objective) slideLines.push(String(slide.objective))
        if (Array.isArray(slide.keyPoints) && slide.keyPoints.length > 0) {
          slideLines.push(...slide.keyPoints.map((pt) => String(pt)))
        }
        if (slide.proof) slideLines.push(String(slide.proof))
        return slideLines.filter(Boolean).join('\n')
      })
      .filter(Boolean)
      .join('\n\n')
  }

  if (structuredDocument.content) {
    return String(structuredDocument.content)
  }

  return ''
}