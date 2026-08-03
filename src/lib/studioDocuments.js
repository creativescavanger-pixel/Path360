// src/lib/studioDocuments.js

import { supabase } from './supabaseClient.js'

function isMissingRelationError(error) {
  return error?.code === 'PGRST205' || error?.code === '42P01'
}

function buildDraftPayload({
  id = null,
  userId,
  docType,
  objectiveId = null,
  title = null,
  status = 'draft',
  customInstructions = '',
  draftData = {},
  generatedContent = null,
  progress = 0,
  currentSectionIndex = 0,
}) {
  const now = new Date().toISOString()

  const payload = {
    user_id: userId,
    doc_type: docType,
    objective_id: objectiveId,
    title,
    status,
    progress: Number.isFinite(progress) ? progress : 0,
    current_section_index: Number.isFinite(currentSectionIndex) ? currentSectionIndex : 0,
    draft_data: {
      ...(draftData || {}),
      // keep custom instructions inside draft_data so older code can still read it
      customInstructions: customInstructions || '',
    },
    generated_content: generatedContent ?? null,
    updated_at: now,
  }

  if (!id) {
    // let Postgres set created_at via default
  } else {
    payload.id = id
  }

  return payload
}

function normalizeDraftRecord(record) {
  if (!record) return null

  const draftData = record.draft_data ?? record.draftdata ?? {}

  const customInstructionsFromDraft =
    draftData.customInstructions ??
    draftData.custom_instructions ??
    null

  return {
    ...record,

    // legacy-style aliases expected by existing code
    id: record.id ?? null,
    userid: record.user_id ?? record.userid ?? null,
    doctype: record.doc_type ?? record.doctype ?? null,
    objectiveid: record.objective_id ?? record.objectiveid ?? null,
    title: record.title ?? null,
    status: record.status ?? 'draft',

    progress: record.progress ?? record.progressPercent ?? 0,
    current_section_index: record.current_section_index ?? record.currentSectionIndex ?? 0,

    draftdata: draftData,
    generatedcontent: record.generated_content ?? record.generatedcontent ?? null,

    custominstructions:
      record.custom_instructions ??
      record.custominstructions ??
      customInstructionsFromDraft ??
      '',

    createdat: record.created_at ?? record.createdat ?? null,
    updatedat: record.updated_at ?? record.updatedat ?? null,
  }
}

export async function saveStudioDocumentDraft({
  id = null,
  userId,
  docType,
  objectiveId = null,
  title = null,
  status = 'draft',
  customInstructions = '',
  draftData = {},
  generatedContent = null,
  progress = 0,
  currentSectionIndex = 0,
}) {
  const payload = buildDraftPayload({
    id,
    userId,
    docType,
    objectiveId,
    title,
    status,
    customInstructions,
    draftData,
    generatedContent,
    progress,
    currentSectionIndex,
  })

  const { data, error } = await supabase
    .from('studio_documents')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return normalizeDraftRecord(data)
}

export async function getLatestStudioDocumentDraft(userId, docType) {
  const { data, error } = await supabase
    .from('studio_documents')
    .select('*')
    .eq('user_id', userId)
    .eq('doc_type', docType)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn('studio_documents table not found; returning null draft.')
      return null
    }
    throw error
  }

  return normalizeDraftRecord(data)
}

export async function getStudioDocumentDraftById(id) {
  const { data, error } = await supabase
    .from('studio_documents')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn('studio_documents table not found; returning null draft.')
      return null
    }
    throw error
  }

  return normalizeDraftRecord(data)
}

export async function getStudioDocuments(userId) {
  const { data, error } = await supabase
    .from('studio_documents')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn('studio_documents table not found; returning empty studio docs.')
      return []
    }
    throw error
  }

  return (data ?? []).map(normalizeDraftRecord)
}

export function buildGuidedDraftData({
  guideId,
  answers = {},
  currentSectionIndex = 0,
  completedSections = [],
  progressPercent = 0,
  totalQuestions = 0,
  answeredQuestions = 0,
  objective = null,
  selectedOutput = null,
  exportState = null,
  meta = {},
}) {
  return {
    mode: 'guided',
    guideId: guideId || null,
    guidedAnswers: answers || {},
    currentSectionIndex: Number.isFinite(currentSectionIndex) ? currentSectionIndex : 0,
    completedSections: Array.isArray(completedSections) ? completedSections : [],
    progressPercent: Number.isFinite(progressPercent) ? progressPercent : 0,
    totalQuestions: Number.isFinite(totalQuestions) ? totalQuestions : 0,
    answeredQuestions: Number.isFinite(answeredQuestions) ? answeredQuestions : 0,
    objective: objective || null,
    selectedOutput: selectedOutput || null,
    exportState: exportState || null,
    meta: meta || {},
    lastSavedAt: new Date().toISOString(),
  }
}

export async function saveGuidedStudioDraft({
  id = null,
  userId,
  docType,
  title = null,
  objectiveId = null,
  customInstructions = '',
  guideId,
  answers = {},
  currentSectionIndex = 0,
  completedSections = [],
  progressPercent = 0,
  totalQuestions = 0,
  answeredQuestions = 0,
  objective = null,
  selectedOutput = null,
  exportState = null,
  status = 'draft',
  generatedContent = null,
  meta = {},
}) {
  const draftData = buildGuidedDraftData({
    guideId,
    answers,
    currentSectionIndex,
    completedSections,
    progressPercent,
    totalQuestions,
    answeredQuestions,
    objective,
    selectedOutput,
    exportState,
    meta,
  })

  return saveStudioDocumentDraft({
    id,
    userId,
    docType,
    objectiveId,
    title,
    status,
    customInstructions,
    draftData,
    generatedContent,
    progress: Math.round(progressPercent || 0),
    currentSectionIndex,
  })
}

export async function getOrCreateGuidedStudioDraft({
  userId,
  docType,
  title = null,
  objectiveId = null,
  guideId = null,
  objective = null,
  selectedOutput = null,
}) {
  const existing = await getLatestStudioDocumentDraft(userId, docType)
  if (existing) return existing

  return saveGuidedStudioDraft({
    userId,
    docType,
    title,
    objectiveId,
    guideId: guideId || docType,
    answers: {},
    currentSectionIndex: 0,
    completedSections: [],
    progressPercent: 0,
    totalQuestions: 0,
    answeredQuestions: 0,
    objective,
    selectedOutput,
    status: 'draft',
    generatedContent: null,
    meta: {
      createdFrom: 'guided-studio',
    },
  })
}

export async function markStudioDraftGenerated({
  id,
  userId,
  docType,
  title = null,
  objectiveId = null,
  customInstructions = '',
  draftData = {},
  generatedContent,
  progress = 100,
  currentSectionIndex = 0,
}) {
  return saveStudioDocumentDraft({
    id,
    userId,
    docType,
    objectiveId,
    title,
    status: 'generated',
    customInstructions,
    draftData,
    generatedContent,
    progress,
    currentSectionIndex,
  })
}

export async function updateStudioDraftExportState({
  id,
  exportState,
}) {
  const existing = await getStudioDocumentDraftById(id)
  if (!existing) return null

  const nextDraftData = {
    ...(existing.draftdata || {}),
    exportState: exportState || null,
    lastSavedAt: new Date().toISOString(),
  }

  return saveStudioDocumentDraft({
    id: existing.id,
    userId: existing.userid,
    docType: existing.doctype,
    objectiveId: existing.objectiveid,
    title: existing.title,
    status: existing.status || 'draft',
    customInstructions: existing.custominstructions || '',
    draftData: nextDraftData,
    generatedContent: existing.generatedcontent || null,
    progress: existing.progress ?? 0,
    currentSectionIndex: existing.current_section_index ?? 0,
  })
}

// Compatibility aliases for existing imports
export const saveStudioDraft = saveStudioDocumentDraft
export const getStudioDraftByDocType = getLatestStudioDocumentDraft
export const getStudioDraftById = getStudioDocumentDraftById