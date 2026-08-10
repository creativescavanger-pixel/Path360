import { create } from 'zustand'
import {
  loadFounderWorkspace,
  saveFounderProfile,
  saveAssessment,
  addMemory as addMemoryRecord,
  saveDocument,
  saveConversation,
  saveDocumentIntake,
  getDocumentIntakes,
  addFounderProgress as addFounderProgressRecord,
  getFounderProgress,
} from '../lib/supabaseClient.js'

const DEFAULT_AGENT = 'venture_strategist'

const STAGE_KEY_PREFIX = 'path360_stage_assessment:'
const STAGE_COMPLETED_KEY_PREFIX = 'path360_stage_completed:'
const PENDING_STAGE_KEY = 'path360_pending_stage_assessment'

function getStageKeys(userId) {
  const safeUserId = String(userId || '')

  return {
    assessment: `${STAGE_KEY_PREFIX}${safeUserId}`,
    completed: `${STAGE_COMPLETED_KEY_PREFIX}${safeUserId}`,
  }
}

function emptyLocalStage() {
  return {
    assessment: null,
    completed: false,
  }
}

function isCompletedStageAssessment(assessment) {
  return Boolean(
    assessment &&
      assessment.completedAt &&
      assessment.declaredStage &&
      assessment.diagnosedStage &&
      assessment.statusByItem &&
      Object.keys(assessment.statusByItem).length > 0
  )
}

function loadLocalStage(userId) {
  if (typeof window === 'undefined' || !userId) {
    return emptyLocalStage()
  }

  try {
    const keys = getStageKeys(userId)
    const rawAssessment = window.localStorage?.getItem(keys.assessment)
    const completedRaw = window.localStorage?.getItem(keys.completed)

    const assessment = rawAssessment ? JSON.parse(rawAssessment) : null
    const completed = completedRaw === 'true'

    if (completed && isCompletedStageAssessment(assessment)) {
      return {
        assessment,
        completed: true,
      }
    }

    const pendingRaw = window.localStorage?.getItem(PENDING_STAGE_KEY)
    const pendingAssessment = pendingRaw ? JSON.parse(pendingRaw) : null

    if (isCompletedStageAssessment(pendingAssessment)) {
      saveLocalStage(userId, pendingAssessment)

      return {
        assessment: pendingAssessment,
        completed: true,
      }
    }

    return emptyLocalStage()
  } catch {
    return emptyLocalStage()
  }
}

function saveLocalStage(userId, assessment) {
  if (typeof window === 'undefined') return

  try {
    const isComplete = isCompletedStageAssessment(assessment)

    if (!userId) {
      if (isComplete) {
        window.localStorage?.setItem(
          PENDING_STAGE_KEY,
          JSON.stringify(assessment)
        )
      } else {
        window.localStorage?.removeItem(PENDING_STAGE_KEY)
      }

      return
    }

    const keys = getStageKeys(userId)

    if (isComplete) {
      window.localStorage?.setItem(
        keys.assessment,
        JSON.stringify(assessment)
      )
      window.localStorage?.setItem(keys.completed, 'true')
      window.localStorage?.removeItem(PENDING_STAGE_KEY)
      return
    }

    window.localStorage?.removeItem(keys.assessment)
    window.localStorage?.removeItem(keys.completed)
    window.localStorage?.removeItem(PENDING_STAGE_KEY)
  } catch {
    // Local storage is a convenience layer only.
  }
}

function normaliseAssessmentHistory(history) {
  if (!Array.isArray(history)) return []

  return history
    .filter(Boolean)
    .sort((a, b) => {
      const versionA = Number(a?.versionnumber ?? 0)
      const versionB = Number(b?.versionnumber ?? 0)

      if (versionA !== versionB) {
        return versionB - versionA
      }

      return new Date(b?.createdat || 0) - new Date(a?.createdat || 0)
    })
}

function getAssessmentVersion(assessment) {
  return Number(
    assessment?.versionnumber ??
      assessment?.version_number ??
      0
  )
}

const useDiagnosticStore = create((set, get) => ({
  user: null,
  founderProfile: null,

  // Current, active completed assessment used throughout the workspace.
  assessmentResults: null,

  // Every completed assessment remains available here, newest first.
  assessmentHistory: [],

  // A safe local working copy created before a founder starts a review.
  progressReviewDraft: null,

  memories: [],
  documents: [],
  founderFiles: [],
  conversations: {},
  activeAgent: DEFAULT_AGENT,
  qaPairs: [],
  documentIntakes: [],
  progressEvents: [],

  stageAssessment: null,
  hasCompletedStageOnboarding: false,

  setUser: (user) => set({ user }),

  setFounderProfile: (profile) =>
    set({
      founderProfile: profile,
    }),

  setAssessmentResults: (results) =>
    set({
      assessmentResults: results || null,
      qaPairs: Array.isArray(results?.rawqa) ? results.rawqa : [],
    }),

  setAssessmentHistory: (history) =>
    set({
      assessmentHistory: normaliseAssessmentHistory(history),
    }),

  setProgressReviewDraft: (draft) =>
    set({
      progressReviewDraft: draft || null,
    }),

  setMemories: (memories) =>
    set({
      memories: Array.isArray(memories) ? memories : [],
    }),

  setDocuments: (documents) =>
    set({
      documents: Array.isArray(documents) ? documents : [],
    }),

  setFounderFiles: (files) =>
    set({
      founderFiles: Array.isArray(files) ? files : [],
    }),

  setConversations: (conversations) =>
    set({
      conversations: conversations || {},
    }),

  setActiveAgent: (agent) =>
    set({
      activeAgent: agent || DEFAULT_AGENT,
    }),

  setQAPairs: (qaPairs) =>
    set({
      qaPairs: Array.isArray(qaPairs) ? qaPairs : [],
    }),

  setDocumentIntakes: (intakes) =>
    set({
      documentIntakes: Array.isArray(intakes) ? intakes : [],
    }),

  setProgressEvents: (events) =>
    set({
      progressEvents: Array.isArray(events) ? events : [],
    }),

  setStageAssessment: (assessment) => {
    const userId = get().user?.id

    const nextAssessment = isCompletedStageAssessment(assessment)
      ? { ...assessment }
      : null

    set({
      stageAssessment: nextAssessment,
      hasCompletedStageOnboarding: Boolean(nextAssessment),
    })

    saveLocalStage(userId, nextAssessment)
  },

  clearStageAssessment: () => {
    const userId = get().user?.id

    saveLocalStage(userId, null)

    set({
      stageAssessment: null,
      hasCompletedStageOnboarding: false,
    })
  },

  getConversation: (agentType) => {
    const key = agentType || get().activeAgent || DEFAULT_AGENT
    const conversations = get().conversations || {}

    return Array.isArray(conversations[key]) ? conversations[key] : []
  },

  addMessage: (agentType, message) => {
    const key = agentType || get().activeAgent || DEFAULT_AGENT

    set((state) => ({
      conversations: {
        ...(state.conversations || {}),
        [key]: [
          ...(Array.isArray(state.conversations?.[key])
            ? state.conversations[key]
            : []),
          message,
        ],
      },
    }))
  },

  setConversation: (agentType, messages) => {
    const key = agentType || get().activeAgent || DEFAULT_AGENT

    set((state) => ({
      conversations: {
        ...(state.conversations || {}),
        [key]: Array.isArray(messages) ? messages : [],
      },
    }))
  },

  updateFounderProfile: async (profilePatch) => {
    const user = get().user

    if (!user?.id) {
      throw new Error('No authenticated user found.')
    }

    try {
      const currentProfile = get().founderProfile || {}

      const saved = await saveFounderProfile(user.id, {
        ...currentProfile,
        ...profilePatch,
      })

      set({
        founderProfile: saved,
      })

      try {
        await addFounderProgressRecord(
          user.id,
          'profile_updated',
          'Founder profile updated',
          'Your founder profile was saved and is now available across PATH360.',
          {
            ventureName: saved?.venturename || saved?.venture_name || null,
          }
        )
      } catch (error) {
        console.warn('Failed to record founder profile milestone', error)
      }

      return saved
    } catch (error) {
      console.error('updateFounderProfile failed', error)
      throw error
    }
  },

  /*
   * Creates the first baseline assessment if no assessment exists.
   * If a completed assessment already exists, it safely saves the submitted
   * work as a progress-review version instead of replacing past work.
   */
  addAssessment: async (results) => {
    const user = get().user

    if (!user?.id) {
      throw new Error('No authenticated user found.')
    }

    try {
      const currentAssessment = get().assessmentResults
      const history = normaliseAssessmentHistory(get().assessmentHistory)

      const isBaseline = !currentAssessment?.id
      const currentVersion = getAssessmentVersion(currentAssessment)
      const historyVersion = history.reduce(
        (highest, assessment) =>
          Math.max(highest, getAssessmentVersion(assessment)),
        0
      )

      const nextVersion = isBaseline
        ? 1
        : Math.max(currentVersion, historyVersion, 1) + 1

      const payload = {
        ...(results || {}),
        id: undefined,
        assessmentid: undefined,
        assessmenttype: isBaseline ? 'baseline' : 'progress_review',
        parentassessmentid: isBaseline ? null : currentAssessment.id,
        versionnumber: nextVersion,
        createdat: new Date().toISOString(),
        completedat: new Date().toISOString(),
      }

      const saved = await saveAssessment(user.id, payload)

      set((state) => ({
        assessmentResults: saved,
        assessmentHistory: normaliseAssessmentHistory([
          saved,
          ...(Array.isArray(state.assessmentHistory)
            ? state.assessmentHistory.filter(
                (assessment) => assessment?.id !== saved?.id
              )
            : []),
        ]),
        qaPairs: Array.isArray(saved?.rawqa) ? saved.rawqa : [],
        progressReviewDraft: null,
      }))

      try {
        await addFounderProgressRecord(
          user.id,
          isBaseline
            ? 'assessment_completed'
            : 'progress_review_completed',
          isBaseline
            ? 'Baseline assessment completed'
            : 'Progress review completed',
          isBaseline
            ? 'Your baseline assessment has been saved.'
            : `Your progress review was saved as version ${nextVersion}. Your previous assessment remains available in history.`,
          {
            assessmentid: saved?.id ?? null,
            assessmenttype: saved?.assessmenttype ?? null,
            versionnumber: saved?.versionnumber ?? nextVersion,
            founderscore: saved?.founderscore ?? null,
            investorreadiness: saved?.investorreadiness ?? null,
          }
        )
      } catch (error) {
        console.warn('Failed to record assessment milestone', error)
      }

      return saved
    } catch (error) {
      console.error('addAssessment failed', error)
      throw error
    }
  },

  /*
   * Use this when the founder selects “Review progress”.
   * It does not update Supabase or modify the existing baseline.
   */
  startProgressReview: () => {
    const currentAssessment = get().assessmentResults
    const history = normaliseAssessmentHistory(get().assessmentHistory)

    if (!currentAssessment?.id) {
      throw new Error(
        'Complete your baseline assessment before starting a progress review.'
      )
    }

    const highestVersion = history.reduce(
      (highest, assessment) =>
        Math.max(highest, getAssessmentVersion(assessment)),
      getAssessmentVersion(currentAssessment)
    )

    const now = new Date().toISOString()

    const draft = {
      ...currentAssessment,
      id: null,
      assessmentid: null,
      assessmenttype: 'progress_review',
      parentassessmentid: currentAssessment.id,
      versionnumber: highestVersion + 1,
      createdat: now,
      completedat: null,
      rawqa: Array.isArray(currentAssessment.rawqa)
        ? currentAssessment.rawqa.map((pair) => ({ ...pair }))
        : [],
    }

    set({
      progressReviewDraft: draft,
    })

    return draft
  },

  cancelProgressReview: () =>
    set({
      progressReviewDraft: null,
    }),

  setActiveAssessmentFromHistory: (assessmentId) => {
    const history = normaliseAssessmentHistory(get().assessmentHistory)

    const selectedAssessment = history.find(
      (assessment) => assessment?.id === assessmentId
    )

    if (!selectedAssessment) {
      throw new Error('Assessment version not found.')
    }

    set({
      assessmentResults: selectedAssessment,
      qaPairs: Array.isArray(selectedAssessment.rawqa)
        ? selectedAssessment.rawqa
        : [],
    })

    return selectedAssessment
  },

  addMemory: async (memoryType, content, importanceScore = 3) => {
    const user = get().user

    if (!user?.id) {
      throw new Error('No authenticated user found.')
    }

    try {
      const saved = await addMemoryRecord(
        user.id,
        memoryType,
        content,
        importanceScore
      )

      set((state) => ({
        memories: [
          saved,
          ...(Array.isArray(state.memories) ? state.memories : []),
        ],
      }))

      return saved
    } catch (error) {
      console.error('addMemory failed', error)
      throw error
    }
  },

  addDocument: (document) =>
    set((state) => ({
      documents: [
        document,
        ...(Array.isArray(state.documents) ? state.documents : []),
      ],
    })),

  createAndStoreDocument: async (docType, title, content) => {
    const user = get().user

    if (!user?.id) {
      throw new Error('No authenticated user found.')
    }

    try {
      const saved = await saveDocument(user.id, docType, title, content)

      set((state) => ({
        documents: [
          saved,
          ...(Array.isArray(state.documents) ? state.documents : []),
        ],
      }))

      return saved
    } catch (error) {
      console.error('createAndStoreDocument failed', error)
      throw error
    }
  },

  addFounderFile: (file) =>
    set((state) => ({
      founderFiles: [
        file,
        ...(Array.isArray(state.founderFiles) ? state.founderFiles : []),
      ],
    })),

  saveConversationForAgent: async (agentType, messages) => {
    const user = get().user

    if (!user?.id) {
      throw new Error('No authenticated user found.')
    }

    const key = agentType || get().activeAgent || DEFAULT_AGENT

    try {
      const saved = await saveConversation(user.id, key, messages)

      set((state) => ({
        conversations: {
          ...(state.conversations || {}),
          [key]: Array.isArray(saved?.messages)
            ? saved.messages
            : Array.isArray(messages)
              ? messages
              : [],
        },
      }))

      return saved
    } catch (error) {
      console.error('saveConversationForAgent failed', error)
      throw error
    }
  },

  loadDocumentIntakes: async (docType = null) => {
    const user = get().user

    if (!user?.id) {
      throw new Error('No authenticated user found.')
    }

    try {
      const intakes = await getDocumentIntakes(user.id, docType)

      set({
        documentIntakes: Array.isArray(intakes) ? intakes : [],
      })

      return intakes
    } catch (error) {
      console.error('loadDocumentIntakes failed', error)
      throw error
    }
  },

  createDocumentIntake: async (
    docType,
    title,
    answers,
    linkedAssessmentId = null
  ) => {
    const user = get().user

    if (!user?.id) {
      throw new Error('No authenticated user found.')
    }

    try {
      const saved = await saveDocumentIntake(
        user.id,
        docType,
        title,
        answers,
        linkedAssessmentId
      )

      set((state) => ({
        documentIntakes: [
          saved,
          ...(Array.isArray(state.documentIntakes)
            ? state.documentIntakes
            : []),
        ],
      }))

      try {
        const event = await addFounderProgressRecord(
          user.id,
          'document_prep_completed',
          'Document prep completed',
          'Your document intake answers were saved and are ready for generation.',
          {
            doctype: docType,
            intakeid: saved?.id || null,
          }
        )

        set((state) => ({
          progressEvents: [
            event,
            ...(Array.isArray(state.progressEvents)
              ? state.progressEvents
              : []),
          ],
        }))
      } catch (error) {
        console.warn('Failed to record document prep milestone', error)
      }

      return saved
    } catch (error) {
      console.error('createDocumentIntake failed', error)
      throw error
    }
  },

  loadProgress: async () => {
    const user = get().user

    if (!user?.id) {
      throw new Error('No authenticated user found.')
    }

    try {
      const events = await getFounderProgress(user.id, 20)

      set({
        progressEvents: Array.isArray(events) ? events : [],
      })

      return events
    } catch (error) {
      console.error('loadProgress failed', error)
      throw error
    }
  },

  addFounderProgress: async (
    eventType,
    title,
    description = '',
    metadata = {}
  ) => {
    const user = get().user

    if (!user?.id) {
      throw new Error('No authenticated user found.')
    }

    try {
      const saved = await addFounderProgressRecord(
        user.id,
        eventType,
        title,
        description,
        metadata
      )

      set((state) => ({
        progressEvents: [
          saved,
          ...(Array.isArray(state.progressEvents)
            ? state.progressEvents
            : []),
        ],
      }))

      return saved
    } catch (error) {
      console.error('addFounderProgress failed', error)
      throw error
    }
  },

  getFounderContext: () => {
    const state = get()
    const profile = state.founderProfile
    const assessment = state.assessmentResults
    const memories = Array.isArray(state.memories) ? state.memories : []
    const progress = Array.isArray(state.progressEvents)
      ? state.progressEvents
      : []
    const documentIntakes = Array.isArray(state.documentIntakes)
      ? state.documentIntakes
      : []

    return {
      profile: profile
        ? {
            venture_name:
              profile.venturename ||
              profile.venture_name ||
              profile.businessname ||
              profile.companyname ||
              null,
            founder_name:
              profile.foundername ||
              profile.fullname ||
              profile.name ||
              null,
            industry: profile.industry || null,
            venture_stage:
              profile.venturestage ||
              profile.venture_stage ||
              null,
            business_model:
              profile.businessmodel ||
              profile.business_model ||
              null,
            geography: profile.geography || null,
            funding_goal:
              profile.fundinggoal ||
              profile.funding_goal ||
              null,
            website: profile.website || null,
            email: profile.email || null,
            role: profile.role || null,
            linkedin: profile.linkedin || null,
            venture_summary:
              profile.venturesummary ||
              profile.venture_summary ||
              null,
          }
        : null,

      assessment: assessment
        ? {
            id: assessment.id ?? null,
            assessment_type: assessment.assessmenttype ?? 'baseline',
            version_number: assessment.versionnumber ?? 1,
            founder_score:
              assessment.founderscore ??
              assessment.founder_score ??
              null,
            investor_readiness:
              assessment.investorreadiness ??
              assessment.investor_readiness ??
              null,
            financial_maturity:
              assessment.financialmaturity ??
              assessment.financial_maturity ??
              null,
            venture_stage_result:
              assessment.venturestageresult ??
              assessment.venturestage ??
              null,
            strategic_priorities:
              assessment.strategicpriorities ??
              assessment.strategic_priorities ??
              [],
            vc_verdict:
              assessment.vcverdict ??
              assessment.vc_verdict ??
              null,
            rawqa: assessment.rawqa ?? [],
          }
        : null,

      memories: memories.map((memory) => ({
        memory_type:
          memory.memorytype ??
          memory.memory_type ??
          null,
        content: memory.content ?? '',
      })),

      progress: progress.map((event) => ({
        eventtype: event.eventtype,
        title: event.title,
        description: event.description,
        createdat: event.createdat,
      })),

      document_intakes: documentIntakes.map((intake) => ({
        doctype: intake.doctype,
        title: intake.title,
        answers: intake.answers,
        createdat: intake.createdat,
      })),
    }
  },

  isGrowthOrAbove: () => {
    const profile = get().founderProfile
    const tier = profile?.plantier || profile?.plan || 'starter'

    return ['growth', 'pro', 'scale', 'enterprise'].includes(
      String(tier).toLowerCase()
    )
  },

  hydrateWorkspace: async (userId) => {
    try {
      const workspace = await loadFounderWorkspace(userId)
      const localStage = loadLocalStage(userId)

      set({
        founderProfile: workspace?.founderProfile ?? null,
        assessmentResults: workspace?.assessmentResults ?? null,
        assessmentHistory: normaliseAssessmentHistory(
          workspace?.assessmentHistory
        ),
        progressReviewDraft: null,
        memories: Array.isArray(workspace?.memories)
          ? workspace.memories
          : [],
        documents: Array.isArray(workspace?.documents)
          ? workspace.documents
          : [],
        founderFiles: Array.isArray(workspace?.founderFiles)
          ? workspace.founderFiles
          : [],
        conversations: workspace?.conversations || {},
        qaPairs: Array.isArray(workspace?.assessmentResults?.rawqa)
          ? workspace.assessmentResults.rawqa
          : [],
        documentIntakes: Array.isArray(workspace?.documentIntakes)
          ? workspace.documentIntakes
          : [],
        progressEvents: Array.isArray(workspace?.progressEvents)
          ? workspace.progressEvents
          : [],
        stageAssessment: localStage.assessment,
        hasCompletedStageOnboarding: localStage.completed,
      })

      return workspace
    } catch (error) {
      console.error('hydrateWorkspace failed', error)
      throw error
    }
  },

  clearWorkspace: () => {
    const userId = get().user?.id

    saveLocalStage(userId, null)

    set({
      founderProfile: null,
      assessmentResults: null,
      assessmentHistory: [],
      progressReviewDraft: null,
      memories: [],
      documents: [],
      founderFiles: [],
      conversations: {},
      activeAgent: DEFAULT_AGENT,
      qaPairs: [],
      documentIntakes: [],
      progressEvents: [],
      stageAssessment: null,
      hasCompletedStageOnboarding: false,
    })
  },

  clearSessionOnly: () => {
    set({
      user: null,
      founderProfile: null,
      assessmentResults: null,
      assessmentHistory: [],
      progressReviewDraft: null,
      memories: [],
      documents: [],
      founderFiles: [],
      conversations: {},
      activeAgent: DEFAULT_AGENT,
      qaPairs: [],
      documentIntakes: [],
      progressEvents: [],
      stageAssessment: null,
      hasCompletedStageOnboarding: false,
    })
  },
}))

export default useDiagnosticStore