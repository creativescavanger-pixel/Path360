import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
const FOUNDER_FILES_BUCKET = 'founder_profiles'

if (!url || !key) {
  console.error(
    'Missing Supabase frontend env vars. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your Vite environment.'
  )
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

function isMissingRelationError(error) {
  return error?.code === 'PGRST205' || error?.code === '42P01'
}

function normaliseAssessment(assessment) {
  if (!assessment) return null

  return {
    ...assessment,
    venturestage:
      assessment.venturestageresult ??
      assessment.venturestage ??
      null,
    rawqa: Array.isArray(assessment.rawqa) ? assessment.rawqa : [],
  }
}

export async function signUp(email, password) {
  const response = await supabase.auth.signUp({ email, password })
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
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data?.user ?? null
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data?.session ?? null
}

export async function deleteAccountViaEdgeFunction() {
  const session = await getCurrentSession()
  const token = session?.access_token

  if (!token) {
    throw new Error('No active Supabase session found.')
  }

  const edgeFunctionUrl =
    import.meta.env.VITE_SUPABASE_DELETE_ACCOUNT_URL?.trim()

  if (!edgeFunctionUrl) {
    throw new Error('Missing VITE_SUPABASE_DELETE_ACCOUNT_URL env var.')
  }

  const response = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  const body = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      body?.error ||
      `Delete account request failed with status ${response.status}`
    )
  }

  return body
}

export async function saveFounderProfile(userId, profile) {
  const normalizedProfile = { ...(profile || {}) }

  if (normalizedProfile.foundername && !normalizedProfile.fullname) {
    normalizedProfile.fullname = normalizedProfile.foundername
  }

  delete normalizedProfile.foundername

  const { data, error } = await supabase
    .from('founderprofiles')
    .upsert(
      {
        userid: userId,
        ...normalizedProfile,
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
  const now = new Date().toISOString()

  const {
    id,
    assessmentid,
    createdat,
    completedat,
    ...assessmentData
  } = results || {}

  const payload = {
    userid: userId,
    ...assessmentData,
    assessmenttype: results?.assessmenttype || 'baseline',
    parentassessmentid: results?.parentassessmentid || null,
    versionnumber: Number(results?.versionnumber || 1),
    createdat: createdat || now,
    completedat: completedat || now,
  }

  const { data, error } = await supabase
    .from('assessments')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return normaliseAssessment(data)
}

export async function getLatestAssessment(userId) {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('userid', userId)
    .order('versionnumber', { ascending: false })
    .order('createdat', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return normaliseAssessment(data)
}

export async function getAssessmentHistory(userId) {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('userid', userId)
    .order('versionnumber', { ascending: false })
    .order('createdat', { ascending: false })

  if (error) throw error

  return Array.isArray(data)
    ? data.map(normaliseAssessment)
    : []
}

export async function addMemory(
  userId,
  memoryType,
  content,
  importanceScore = 3
) {
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
  if (!userId) {
    throw new Error('No user id when saving document')
  }

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
    .select('*')
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

export async function saveDocumentIntake(
  userId,
  docType,
  title,
  answers,
  linkedAssessmentId = null
) {
  const { data, error } = await supabase
    .from('documentintakes')
    .insert({
      userid: userId,
      doctype: docType,
      title: title || null,
      answers: Array.isArray(answers) ? answers : [],
      linkedassessmentid: linkedAssessmentId,
      updatedat: new Date().toISOString(),
    })
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

export async function addFounderProgress(
  userId,
  eventType,
  title,
  description = '',
  metadata = {}
) {
  const { data, error } = await supabase
    .from('founderprogress')
    .insert({
      userid: userId,
      eventtype: eventType,
      title,
      description,
      metadata: metadata || {},
    })
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

  const { data, error } = await supabase.storage
    .from(FOUNDER_FILES_BUCKET)
    .upload(path, file, {
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

  if (error) {
    if (isMissingRelationError(error)) {
      console.warn(
        'founderfiles table not found; returning empty founderFiles list.'
      )
      return []
    }

    throw error
  }

  return data ?? []
}

export async function getFounderFileDownloadUrl(path) {
  const { data, error } = await supabase.storage
    .from(FOUNDER_FILES_BUCKET)
    .createSignedUrl(path, 60 * 10)

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
  const blob = new Blob([content], {
    type: 'text/plain;charset=utf-8',
  })

  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = objectUrl
  link.download = `${
    title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim() ||
    'generated-document'
  }.txt`

  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

export async function loadFounderWorkspace(userId) {
  const results = await Promise.allSettled([
    getFounderProfile(userId),
    getLatestAssessment(userId),
    getAssessmentHistory(userId),
    getMemories(userId, 20),
    getDocuments(userId),
    getAllConversations(userId),
    getDocumentIntakes(userId),
    getFounderProgress(userId, 20),
    getFounderFiles(userId),
  ])

  const [
    founderProfileResult,
    latestAssessmentResult,
    assessmentHistoryResult,
    memoriesResult,
    documentsResult,
    conversationsResult,
    documentIntakesResult,
    progressEventsResult,
    founderFilesResult,
  ] = results

  const criticalErrors = results
    .filter((result, index) => {
      if (result.status !== 'rejected') return false
      return index !== 8
    })
    .map((result) => result.reason)

  if (criticalErrors.length > 0) {
    throw criticalErrors[0]
  }

  const conversations =
    conversationsResult.status === 'fulfilled'
      ? conversationsResult.value
      : []

  const conversationMap = (conversations ?? []).reduce((acc, row) => {
    if (row?.agenttype) {
      acc[row.agenttype] = Array.isArray(row.messages)
        ? row.messages
        : []
    }

    return acc
  }, {})

  return {
    founderProfile:
      founderProfileResult.status === 'fulfilled'
        ? founderProfileResult.value ?? null
        : null,

    assessmentResults:
      latestAssessmentResult.status === 'fulfilled'
        ? latestAssessmentResult.value ?? null
        : null,

    assessmentHistory:
      assessmentHistoryResult.status === 'fulfilled'
        ? assessmentHistoryResult.value ?? []
        : [],

    memories:
      memoriesResult.status === 'fulfilled'
        ? memoriesResult.value ?? []
        : [],

    documents:
      documentsResult.status === 'fulfilled'
        ? documentsResult.value ?? []
        : [],

    founderFiles:
      founderFilesResult.status === 'fulfilled'
        ? founderFilesResult.value ?? []
        : [],

    conversations: conversationMap,

    documentIntakes:
      documentIntakesResult.status === 'fulfilled'
        ? documentIntakesResult.value ?? []
        : [],

    progressEvents:
      progressEventsResult.status === 'fulfilled'
        ? progressEventsResult.value ?? []
        : [],
  }
}

export default supabase