import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITESUPABASEURL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITESUPABASEANONKEY
const FOUNDER_FILES_BUCKET = 'founder-files'

if (!url || !key) {
  console.error('Missing Supabase env vars. Check your .env file.')
}

export const supabase = createClient(url, key)

export async function signUp(email, password) {
  const response = await supabase.auth.signUp({
    email,
    password,
  })

  if (response.error) throw response.error
  return response.data
}

export async function signIn(email, password) {
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (response.error) throw response.error
  return response.data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data?.user ?? null
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data?.session ?? null
}

export async function saveFounderProfile(userId, profile) {
  const { data, error } = await supabase
    .from('founderprofiles')
    .upsert(
      {
        userid: userId,
        ...profile,
        updatedat: new Date().toISOString(),
      },
      { onConflict: 'userid' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getFounderProfile(userId) {
  const { data, error } = await supabase
    .from('founderprofiles')
    .select('*')
    .eq('userid', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function saveAssessment(userId, results) {
  const payload = {
    userid: userId,
    ...results,
    createdat: results?.createdat || new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('assessments')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getLatestAssessment(userId) {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('userid', userId)
    .order('createdat', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function addMemory(userId, memoryType, content, importanceScore = 3) {
  const { data, error } = await supabase
    .from('foundermemory')
    .insert({
      userid: userId,
      memorytype: memoryType,
      content,
      importancescore: importanceScore,
      createdat: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getMemories(userId, limit = 20) {
  const { data, error } = await supabase
    .from('foundermemory')
    .select('*')
    .eq('userid', userId)
    .order('importancescore', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function saveDocument(userId, docType, title, content) {
  const { data, error } = await supabase
    .from('generateddocuments')
    .insert({
      userid: userId,
      doctype: docType,
      title,
      content,
      status: 'complete',
      version: 1,
      createdat: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDocuments(userId) {
  const { data, error } = await supabase
    .from('generateddocuments')
    .select('*')
    .eq('userid', userId)
    .order('createdat', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function saveConversation(userId, agentType, messages) {
  const { data, error } = await supabase
    .from('aiconversations')
    .upsert(
      {
        userid: userId,
        agenttype: agentType,
        messages,
        updatedat: new Date().toISOString(),
      },
      { onConflict: 'userid,agenttype' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getConversation(userId, agentType) {
  const { data, error } = await supabase
    .from('aiconversations')
    .select('*')
    .eq('userid', userId)
    .eq('agenttype', agentType)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getAllConversations(userId) {
  const { data, error } = await supabase
    .from('aiconversations')
    .select('*')
    .eq('userid', userId)
    .order('updatedat', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Document intake: store guided Q&A before generation
 */
export async function saveDocumentIntake(userId, docType, title, answers, linkedAssessmentId = null) {
  const payload = {
    userid: userId,
    doctype: docType,
    title: title || null,
    answers: Array.isArray(answers) ? answers : [],
    linkedassessmentid: linkedAssessmentId,
    updatedat: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('documentintakes')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getDocumentIntakes(userId, docType = null) {
  let query = supabase
    .from('documentintakes')
    .select('*')
    .eq('userid', userId)
    .order('createdat', { ascending: false })

  if (docType) {
    query = query.eq('doctype', docType)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

/**
 * Founder progress: journey milestones
 */
export async function addFounderProgress(userId, eventType, title, description = '', metadata = {}) {
  const payload = {
    userid: userId,
    eventtype: eventType,
    title,
    description,
    metadata: metadata || {},
  }

  const { data, error } = await supabase
    .from('founderprogress')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getFounderProgress(userId, limit = 20) {
  const { data, error } = await supabase
    .from('founderprogress')
    .select('*')
    .eq('userid', userId)
    .order('createdat', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

export async function uploadFounderFile(userId, file) {
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
  const path = `${userId}/${safeName}`

  const { data, error } = await supabase.storage.from(FOUNDER_FILES_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error
  return data
}

export async function saveFounderFileRecord(userId, file) {
  const { data, error } = await supabase
    .from('founderfiles')
    .insert({
      userid: userId,
      filename: file.filename,
      filepath: file.filepath,
      mimetype: file.mimetype,
      filesize: file.filesize,
      title: file.title || file.filename,
      description: file.description || null,
      filecategory: file.filecategory || 'File',
      status: file.status || 'uploaded',
      createdat: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getFounderFiles(userId) {
  const { data, error } = await supabase
    .from('founderfiles')
    .select('*')
    .eq('userid', userId)
    .order('createdat', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getFounderFileDownloadUrl(path) {
  const { data, error } = await supabase.storage.from(FOUNDER_FILES_BUCKET).createSignedUrl(path, 60 * 10)
  if (error) throw error
  return data?.signedUrl
}

export async function downloadFounderFile(path, filename = 'download') {
  const signedUrl = await getFounderFileDownloadUrl(path)
  const link = document.createElement('a')
  link.href = signedUrl
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function downloadGeneratedDocumentFile(doc) {
  const content = doc?.content || ''
  const title = doc?.title || 'generated-document'
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() || 'generated-document'}.txt`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Workspace load – now also pulls document intakes & progress
 */
export async function loadFounderWorkspace(userId) {
  const [
    founderProfile,
    latestAssessment,
    memories,
    documents,
    conversations,
    documentIntakes,
    progressEvents,
  ] = await Promise.all([
    getFounderProfile(userId),
    getLatestAssessment(userId),
    getMemories(userId, 20),
    getDocuments(userId),
    getAllConversations(userId),
    getDocumentIntakes(userId),
    getFounderProgress(userId, 20),
  ])

  const conversationMap = (conversations ?? []).reduce((acc, row) => {
    if (row?.agenttype) {
      acc[row.agenttype] = Array.isArray(row.messages) ? row.messages : []
    }
    return acc
  }, {})

  return {
    founderProfile: founderProfile ?? null,
    assessmentResults: latestAssessment
      ? {
          ...latestAssessment,
          venturestage: latestAssessment.venturestageresult ?? latestAssessment.venturestage ?? null,
          rawqa: latestAssessment.rawqa ?? [],
        }
      : null,
    memories: memories ?? [],
    documents: documents ?? [],
    founderFiles: [],
    conversations: conversationMap,
    documentIntakes: documentIntakes ?? [],
    progressEvents: progressEvents ?? [],
  }
}

export default supabase