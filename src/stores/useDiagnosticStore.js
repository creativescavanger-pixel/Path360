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

const useDiagnosticStore = create((set, get) => ({
  user: null,
  founderProfile: null,
  assessmentResults: null,
  memories: [],
  documents: [],
  founderFiles: [],
  conversations: {},
  activeAgent: DEFAULT_AGENT,
  qaPairs: [],
  documentIntakes: [],
  progressEvents: [],

  // NEW: stage-first onboarding state
  stageAssessment: null,
  hasCompletedStageOnboarding: false,

  setUser: (user) => set({ user }),

  setFounderProfile: (profile) => set({ founderProfile: profile }),
  setAssessmentResults: (results) => set({ assessmentResults: results }),
  setMemories: (memories) => set({ memories: Array.isArray(memories) ? memories : [] }),
  setDocuments: (documents) => set({ documents: Array.isArray(documents) ? documents : [] }),
  setFounderFiles: (files) => set({ founderFiles: Array.isArray(files) ? files : [] }),
  setConversations: (conversations) => set({ conversations: conversations || {} }),
  setActiveAgent: (agent) => set({ activeAgent: agent || DEFAULT_AGENT }),
  setQAPairs: (qaPairs) => set({ qaPairs: Array.isArray(qaPairs) ? qaPairs : [] }),
  setDocumentIntakes: (intakes) => set({ documentIntakes: Array.isArray(intakes) ? intakes : [] }),
  setProgressEvents: (events) => set({ progressEvents: Array.isArray(events) ? events : [] }),

  // NEW: stage assessment setters
  setStageAssessment: (assessment) =>
    set(() => ({
      stageAssessment: assessment,
      hasCompletedStageOnboarding: true,
    })),

  clearStageAssessment: () =>
    set(() => ({
      stageAssessment: null,
      hasCompletedStageOnboarding: false,
    })),

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
          ...(Array.isArray(state.conversations?.[key]) ? state.conversations[key] : []),
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
    if (!user?.id) throw new Error('No authenticated user found.')

    try {
      const current = get().founderProfile || {}
      const nextProfile = { ...current, ...profilePatch }
      const saved = await saveFounderProfile(user.id, nextProfile)
      set({ founderProfile: saved })

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
      } catch (e) {
        console.warn('Failed to record founder profile milestone', e)
      }

      return saved
    } catch (err) {
      console.error('updateFounderProfile failed', err)
      throw err
    }
  },

  addAssessment: async (results) => {
    const user = get().user
    if (!user?.id) throw new Error('No authenticated user found.')

    try {
      const saved = await saveAssessment(user.id, results)
      set({
        assessmentResults: saved,
        qaPairs: Array.isArray(saved?.rawqa) ? saved.rawqa : [],
      })

      try {
        await addFounderProgressRecord(
          user.id,
          'assessment_completed',
          'Assessment completed',
          'Your founder baseline has been updated with a new assessment.',
          {
            founderscore: saved?.founderscore ?? null,
            investorreadiness: saved?.investorreadiness ?? null,
          }
        )
      } catch (e) {
        console.warn('Failed to record assessment milestone', e)
      }

      return saved
    } catch (err) {
      console.error('addAssessment failed', err)
      throw err
    }
  },

  addMemory: async (memoryType, content, importanceScore = 3) => {
    const user = get().user
    if (!user?.id) throw new Error('No authenticated user found.')

    try {
      const saved = await addMemoryRecord(user.id, memoryType, content, importanceScore)
      set((state) => ({
        memories: [saved, ...(Array.isArray(state.memories) ? state.memories : [])],
      }))
      return saved
    } catch (err) {
      console.error('addMemory failed', err)
      throw err
    }
  },

  addDocument: (document) =>
    set((state) => ({
      documents: [document, ...(Array.isArray(state.documents) ? state.documents : [])],
    })),

  createAndStoreDocument: async (docType, title, content) => {
    const user = get().user
    if (!user?.id) throw new Error('No authenticated user found.')

    try {
      const saved = await saveDocument(user.id, docType, title, content)
      set((state) => ({
        documents: [saved, ...(Array.isArray(state.documents) ? state.documents : [])],
      }))
      return saved
    } catch (err) {
      console.error('createAndStoreDocument failed', err)
      throw err
    }
  },

  addFounderFile: (file) =>
    set((state) => ({
      founderFiles: [file, ...(Array.isArray(state.founderFiles) ? state.founderFiles : [])],
    })),

  saveConversationForAgent: async (agentType, messages) => {
    const user = get().user
    if (!user?.id) throw new Error('No authenticated user found.')

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
    } catch (err) {
      console.error('saveConversationForAgent failed', err)
      throw err
    }
  },

  loadDocumentIntakes: async (docType = null) => {
    const user = get().user
    if (!user?.id) throw new Error('No authenticated user found.')

    try {
      const intakes = await getDocumentIntakes(user.id, docType)
      set({ documentIntakes: Array.isArray(intakes) ? intakes : [] })
      return intakes
    } catch (err) {
      console.error('loadDocumentIntakes failed', err)
      throw err
    }
  },

  createDocumentIntake: async (docType, title, answers, linkedAssessmentId = null) => {
    const user = get().user
    if (!user?.id) throw new Error('No authenticated user found.')

    try {
      const saved = await saveDocumentIntake(user.id, docType, title, answers, linkedAssessmentId)

      set((state) => ({
        documentIntakes: [saved, ...(Array.isArray(state.documentIntakes) ? state.documentIntakes : [])],
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
          progressEvents: [event, ...(Array.isArray(state.progressEvents) ? state.progressEvents : [])],
        }))
      } catch (e) {
        console.warn('Failed to record document prep milestone', e)
      }

      return saved
    } catch (err) {
      console.error('createDocumentIntake failed', err)
      throw err
    }
  },

  loadProgress: async () => {
    const user = get().user
    if (!user?.id) throw new Error('No authenticated user found.')

    try {
      const events = await getFounderProgress(user.id, 20)
      set({ progressEvents: Array.isArray(events) ? events : [] })
      return events
    } catch (err) {
      console.error('loadProgress failed', err)
      throw err
    }
  },

  addFounderProgress: async (eventType, title, description = '', metadata = {}) => {
    const user = get().user
    if (!user?.id) throw new Error('No authenticated user found.')

    try {
      const saved = await addFounderProgressRecord(user.id, eventType, title, description, metadata)
      set((state) => ({
        progressEvents: [saved, ...(Array.isArray(state.progressEvents) ? state.progressEvents : [])],
      }))
      return saved
    } catch (err) {
      console.error('addFounderProgress failed', err)
      throw err
    }
  },

  getFounderContext: () => {
    const state = get()
    const profile = state.founderProfile
    const assessment = state.assessmentResults
    const memories = Array.isArray(state.memories) ? state.memories : []
    const progress = Array.isArray(state.progressEvents) ? state.progressEvents : []
    const documentIntakes = Array.isArray(state.documentIntakes) ? state.documentIntakes : []

    return {
      profile: profile
        ? {
            venture_name:
              profile.venturename || profile.venture_name || profile.businessname || profile.companyname || null,
            founder_name: profile.foundername || profile.fullname || profile.name || null,
            industry: profile.industry || null,
            venture_stage: profile.venturestage || profile.venture_stage || null,
            business_model: profile.businessmodel || profile.business_model || null,
            geography: profile.geography || null,
            funding_goal: profile.fundinggoal || profile.funding_goal || null,
            website: profile.website || null,
            email: profile.email || null,
            role: profile.role || null,
            linkedin: profile.linkedin || null,
            venture_summary: profile.venturesummary || profile.venture_summary || null,
          }
        : null,
      assessment: assessment
        ? {
            founder_score: assessment.founderscore ?? assessment.founder_score ?? null,
            investor_readiness: assessment.investorreadiness ?? assessment.investor_readiness ?? null,
            financial_maturity: assessment.financialmaturity ?? assessment.financial_maturity ?? null,
            venture_stage_result: assessment.venturestageresult ?? assessment.venturestage ?? null,
            strategic_priorities: assessment.strategicpriorities ?? assessment.strategic_priorities ?? [],
            vc_verdict: assessment.vcverdict ?? assessment.vc_verdict ?? null,
            rawqa: assessment.rawqa ?? [],
          }
        : null,
      memories: memories.map((m) => ({
        memory_type: m.memorytype ?? m.memory_type ?? null,
        content: m.content ?? '',
      })),
      progress: progress.map((e) => ({
        eventtype: e.eventtype,
        title: e.title,
        description: e.description,
        createdat: e.createdat,
      })),
      document_intakes: documentIntakes.map((d) => ({
        doctype: d.doctype,
        title: d.title,
        answers: d.answers,
        createdat: d.createdat,
      })),
    }
  },

  isGrowthOrAbove: () => {
    const profile = get().founderProfile
    const tier = profile?.plantier || profile?.plan || 'starter'
    return ['growth', 'pro', 'scale', 'enterprise'].includes(String(tier).toLowerCase())
  },

  hydrateWorkspace: async (userId) => {
    try {
      const workspace = await loadFounderWorkspace(userId)
      set({
        founderProfile: workspace?.founderProfile ?? null,
        assessmentResults: workspace?.assessmentResults ?? null,
        memories: Array.isArray(workspace?.memories) ? workspace.memories : [],
        documents: Array.isArray(workspace?.documents) ? workspace.documents : [],
        founderFiles: Array.isArray(workspace?.founderFiles) ? workspace.founderFiles : [],
        conversations: workspace?.conversations || {},
        qaPairs: Array.isArray(workspace?.assessmentResults?.rawqa) ? workspace.assessmentResults.rawqa : [],
        documentIntakes: Array.isArray(workspace?.documentIntakes) ? workspace.documentIntakes : [],
        progressEvents: Array.isArray(workspace?.progressEvents) ? workspace.progressEvents : [],

        // If you later load stageAssessment from Supabase, map it here:
        stageAssessment: workspace?.stageAssessment ?? null,
        hasCompletedStageOnboarding: !!workspace?.stageAssessment,
      })
      return workspace
    } catch (err) {
      console.error('hydrateWorkspace failed', err)
      throw err
    }
  },

  clearWorkspace: () =>
    set({
      founderProfile: null,
      assessmentResults: null,
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
    }),

  clearSessionOnly: () =>
    set({
      user: null,
      founderProfile: null,
      assessmentResults: null,
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
    }),
}))

export default useDiagnosticStore