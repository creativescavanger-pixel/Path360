// src/lib/documentExports.js

import { supabase } from './supabaseClient.js'
import { renderStructuredDocumentToText } from './documentRenderer.js'

const EXPORTS_BUCKET = 'document-exports'

function normalizeExport(record) {
  if (!record) return null
  return {
    id: record.id ?? null,
    studiodocumentid: record.studiodocumentid ?? null,
    userid: record.userid ?? null,
    doctype: record.doctype ?? null,
    title: record.title ?? null,
    format: record.format ?? null,
    export_scope: record.export_scope ?? null,
    sectionid: record.sectionid ?? null,
    version: record.version ?? 1,
    storage_path: record.storage_path ?? null,
    file_size: record.file_size ?? null,
    createdat: record.createdat ?? null,
  }
}

export async function getDocumentExportsByDraft(studioDocumentId) {
  const { data, error } = await supabase
    .from('document_exports')
    .select('*')
    .eq('studiodocumentid', studioDocumentId)
    .order('createdat', { ascending: false })

  if (error) throw error
  return (data || []).map(normalizeExport)
}

export async function getNextExportVersion(
  studioDocumentId,
  format,
  exportScope,
  sectionId = null
) {
  let query = supabase
    .from('document_exports')
    .select('version')
    .eq('studiodocumentid', studioDocumentId)
    .eq('format', format)
    .eq('export_scope', exportScope)
    .order('version', { ascending: false })
    .limit(1)

  if (sectionId) query = query.eq('sectionid', sectionId)
  else query = query.is('sectionid', null)

  const { data, error } = await query
  if (error) throw error

  const current = data?.[0]?.version ?? 0
  return current + 1
}

export async function uploadExportFile({
  userId,
  draftId,
  file,
  format,
  exportScope,
  sectionId = null,
}) {
  const ext = format.toLowerCase()
  const sectionPart = sectionId ? `-${sectionId}` : ''
  const fileName = `${exportScope}${sectionPart}-${Date.now()}.${ext}`
  const storagePath = `${userId}/${draftId}/${fileName}`

  const { error } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) throw error
  return storagePath
}

export async function saveDocumentExportRecord({
  studioDocumentId,
  userId,
  docType,
  title,
  format,
  exportScope,
  sectionId = null,
  storagePath,
  fileSize = null,
}) {
  const version = await getNextExportVersion(
    studioDocumentId,
    format,
    exportScope,
    sectionId
  )

  const payload = {
    studiodocumentid: studioDocumentId,
    userid: userId,
    doctype: docType,
    title,
    format,
    export_scope: exportScope,
    sectionid: sectionId || null,
    version,
    storage_path: storagePath,
    file_size: fileSize,
  }

  const { data, error } = await supabase
    .from('document_exports')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return normalizeExport(data)
}

export async function createSignedExportUrl(storagePath, expiresIn = 60 * 30) {
  const { data, error } = await supabase.storage
    .from(EXPORTS_BUCKET)
    .createSignedUrl(storagePath, expiresIn)

  if (error) throw error
  return data?.signedUrl || null
}

// High-level helper: export a structured document as a plain-text file and record it
export async function exportTextDocumentFromStructuredDoc({
  userId,
  draftId,
  docType,
  title,
  structuredDocument,
  exportScope = 'full_document',
}) {
  const text = renderStructuredDocumentToText(structuredDocument)
  const format = 'txt'
  const file = new Blob([text], { type: 'text/plain;charset=utf-8' })

  const storagePath = await uploadExportFile({
    userId,
    draftId,
    file,
    format,
    exportScope,
  })

  const record = await saveDocumentExportRecord({
    studioDocumentId: draftId,
    userId,
    docType,
    title,
    format,
    exportScope,
    sectionId: null,
    storagePath,
    fileSize: file.size,
  })

  return { record, storagePath }
}