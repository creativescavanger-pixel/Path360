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
  saveComplianceProgress as saveComplianceProgressRecord,
  getComplianceProgress,
} from '../lib/supabaseClient.js'
import {
  GLOBAL_CORRIDOR_MATRIX,
  getCorridorContext,
  getCorridorKey,
} from '../lib/globalCorridors.js'
import {
  getVentureIntelligenceProfile,
  saveVentureIntelligenceProfile,
} from '../lib/ventureIntelligence.js'
import {
  computeReadinessPercent,
  diagnoseStage,
  getVulnerabilityFlags,
} from '../lib/readinessEngine.js'

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
      Object.keys(assessment.statusByItem).length > 0,
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
          JSON.stringify(assessment),
        )
      } else {
        window.localStorage?.removeItem(PENDING_STAGE_KEY)
      }

      return
    }

    const keys = getStageKeys(userId)

    if (isComplete) {
      window.localStorage?.setItem(keys.assessment, JSON.stringify(assessment))
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

      if (versionA !== versionB) return versionB - versionA

      return new Date(b?.createdat || 0) - new Date(a?.createdat || 0)
    })
}

function getAssessmentVersion(assessment) {
  return Number(assessment?.versionnumber ?? assessment?.version_number ?? 0)
}

function normaliseGeography(value) {
  const raw = String(value || '')
    .trim()
    .toLowerCase()

  if (!raw) return ''

  if (/africa|african/.test(raw)) return 'africa'
  if (/europe|european|\beu\b/.test(raw)) return 'europe'
  if (/united states|\bu\.?s\.?a?\b|america|american/.test(raw)) {
    return 'united_states'
  }
  if (/global|international|multiple regions|multi-region/.test(raw)) {
    return 'global'
  }
  if (/not raising|not fundraising|bootstrapp/.test(raw)) {
    return 'not_raising_yet'
  }

  return raw.replace(/[\s-]+/g, '_')
}

function getOperatingGeography(profile) {
  return normaliseGeography(
    profile?.operating_geography ||
      profile?.operatingGeography ||
      profile?.geography,
  )
}

function getCapitalTargetGeography(profile) {
  return normaliseGeography(
    profile?.capital_target_geography ||
      profile?.capitalTargetGeography ||
      profile?.target_investor_region,
  )
}

function resolveCorridorKey(profile) {
  if (!profile) return null

  const operatingGeography = getOperatingGeography(profile)
  const capitalTargetGeography = getCapitalTargetGeography(profile)
  const directMatch = getCorridorKey(
    operatingGeography,
    capitalTargetGeography,
  )

  if (directMatch) return directMatch

  if (
    /africa|latam|india|mena|emerging/.test(operatingGeography) &&
    capitalTargetGeography === 'united_states'
  ) {
    return 'emerging_to_us'
  }

  return null
}

function resolveCorridorContext(profile, corridorKey) {
  if (!profile) return null

  const context = getCorridorContext(
    getOperatingGeography(profile),
    getCapitalTargetGeography(profile),
  )

  if (context) return context

  const corridor = corridorKey ? GLOBAL_CORRIDOR_MATRIX[corridorKey] : null

  return corridor
    ? {
        key: corridorKey,
        ...corridor,
      }
    : null
}

function deriveAssessmentState(profile, assessment) {
  const readinessPercent = assessment ? computeReadinessPercent(assessment) : 0
  const stage = assessment ? diagnoseStage(assessment) : null
  const flags = assessment ? getVulnerabilityFlags(assessment) : []
  const resolvedCorridorKey = profile ? resolveCorridorKey(profile) : null
  const corridor = resolveCorridorContext(profile, resolvedCorridorKey)
  const corridorKey = corridor?.key || resolvedCorridorKey
  const recommendedAcademyPath = corridor?.academyFocusTrack || stage || null

  const enrichedAssessment = assessment
    ? {
        ...assessment,
        investorreadiness:
          assessment.investorreadiness ??
          assessment.investor_readiness ??
          readinessPercent,
        diagnosedStage: assessment.diagnosedStage ?? stage,
        recommendedacademypath:
          assessment.recommendedacademypath ?? recommendedAcademyPath,
        corridorKey:
          assessment.corridorKey ?? assessment.corridor_key ?? corridorKey,
      }
    : null

  return {
    assessment: enrichedAssessment,
    readinessPercent,
    stage,
    flags,
    corridorKey,
    corridor,
    recommendedAcademyPath,
  }
}

function hasCompletedVentureSetup(profile) {
  return Boolean(profile?.setup_completed_at)
}

function hasCompletedFounderDiagnostic(assessment) {
  if (!assessment) return false

  const completedAt =
    assessment.completedat || assessment.completed_at || assessment.completedAt
  const rawQa = assessment.rawqa || assessment.raw_qa || []
  const founderScore = assessment.founderscore ?? assessment.founder_score

  return Boolean(
    assessment.id &&
      completedAt &&
      (
        (Array.isArray(rawQa) && rawQa.length > 0) ||
        (founderScore !== undefined && founderScore !== null)
      ),
  )
}

const useDiagnosticStore = create((set, get) => ({
  user: null,
  founderProfile: null,

  assessmentResults: null,
  investorReadyPercent: 0,
  diagnosedStage: null,
  vulnerabilityFlags: [],

  corridorKey: null,
  corridor: null,
  recommendedAcademyPath: null,

  ventureIntelligenceProfile: null,
  hasCompletedVentureIntelligenceSetup: false,

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
  complianceProgress: {},

  stageAssessment: null,
  hasCompletedStageOnboarding: false,

  setUser: (user) => set({ user }),

  hasVentureSetup: () => {
    return hasCompletedVentureSetup(get().ventureIntelligenceProfile)
  },

  hasCompletedDiagnostic: () => {
    return hasCompletedFounderDiagnostic(get().assessmentResults)
  },

  hasCompletedPath360Baseline: () => {
    return get().hasVentureSetup() && get().hasCompletedDiagnostic()
  },

  setFounderProfile: (profile) => {
    const currentAssessment = get().assessmentResults
    const derived = deriveAssessmentState(profile, currentAssessment)

    set({
      founderProfile: profile,
      assessmentResults: derived.assessment,
      investorReadyPercent: derived.readinessPercent,
      diagnosedStage: derived.stage,
      vulnerabilityFlags: derived.flags,
      corridorKey: derived.corridorKey,
      corridor: derived.corridor,
      recommendedAcademyPath: derived.recommendedAcademyPath,
    })
  },

  setAssessmentResults: (results) => {
    const profile = get().founderProfile
    const derived = deriveAssessmentState(profile, results || null)

    set({
      assessmentResults: derived.assessment || null,
      qaPairs: Array.isArray(results?.rawqa) ? results.rawqa : [],
      investorReadyPercent: derived.readinessPercent,
      diagnosedStage: derived.stage,
      vulnerabilityFlags: derived.flags,
      corridorKey: derived.corridorKey,
      corridor: derived.corridor,
      recommendedAcademyPath: derived.recommendedAcademyPath,
    })
  },

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

  saveComplianceProgress: async (userId, countryCode, profile) => {
    if (!userId) {
      throw new Error('No authenticated user found.')
    }

    if (!countryCode) {
      throw new Error('A country code is required to save compliance progress.')
    }

    const saved = await saveComplianceProgressRecord(
      userId,
      countryCode,
      profile,
    )

    const savedProfile = {
      ...(saved?.profile_data || profile || {}),
      countryCode: saved?.country_code || countryCode,
      countryName:
        saved?.country_name ||
        profile?.countryName ||
        profile?.country_name ||
        null,
      stage: saved?.stage || profile?.stage || null,
      corridor: saved?.corridor || profile?.corridor || null,
      updatedAt: saved?.updated_at || new Date().toISOString(),
      completedCount: saved?.completed_count ?? 0,
      inProgressCount: saved?.in_progress_count ?? 0,
      totalCount: saved?.total_count ?? 0,
    }

    set((state) => ({
      complianceProgress: {
        ...(state.complianceProgress || {}),
        [countryCode]: savedProfile,
      },
    }))

    return savedProfile
  },

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

  setVentureIntelligenceProfile: (profile) =>
    set({
      ventureIntelligenceProfile: profile || null,
      hasCompletedVentureIntelligenceSetup: hasCompletedVentureSetup(profile),
    }),

  markVentureIntelligenceSetupComplete: (profile) =>
    set({
      ventureIntelligenceProfile:
        profile || get().ventureIntelligenceProfile || null,
      hasCompletedVentureIntelligenceSetup: true,
    }),

  loadVentureIntelligenceProfile: async () => {
    const user = get().user

    if (!user?.id) {
      throw new Error('No authenticated user found.')
    }

    const profile = await getVentureIntelligenceProfile(user.id)

    set({
      ventureIntelligenceProfile: profile || null,
      hasCompletedVentureIntelligenceSetup: hasCompletedVentureSetup(profile),
    })

    return profile
  },

  saveVentureIntelligenceSetup: async (profileData) => {
    const user = get().user

    if (!user?.id) {
      throw new Error('No authenticated user found.')
    }

    const saved = await saveVentureIntelligenceProfile(user.id, profileData, {
      markSetupComplete: true,
    })

    set({
      ventureIntelligenceProfile: saved,
      hasCompletedVentureIntelligenceSetup: true,
    })

    try {
      const event = await addFounderProgressRecord(
        user.id,
        'venture_intelligence_setup_completed',
        'Venture Intelligence Setup completed',
        'Your market, business model and operating environment context are now available across PATH360.',
        {
          primaryCountryCode: saved?.primary_country_code || null,
          primaryRegionCode: saved?.primary_region_code || null,
          operatingScope: saved?.operating_scope || null,
          revenueModelTags: saved?.revenue_model_tags || [],
          operatingModelTags: saved?.operating_model_tags || [],
        },
      )

      set((state) => ({
        progressEvents: [
          event,
          ...(Array.isArray(state.progressEvents) ? state.progressEvents : []),
        ],
      }))
    } catch (error) {
      console.warn(
        'Venture Intelligence Setup saved, but progress telemetry could not be recorded.',
        error,
      )
    }

    return saved
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
      const activeAssessment = get().assessmentResults
      const derived = deriveAssessmentState(saved, activeAssessment)

      set({
        founderProfile: saved,
        assessmentResults: derived.assessment,
        investorReadyPercent: derived.readinessPercent,
        diagnosedStage: derived.stage,
        vulnerabilityFlags: derived.flags,
        corridorKey: derived.corridorKey,
        corridor: derived.corridor,
        recommendedAcademyPath: derived.recommendedAcademyPath,
      })

      try {
        await addFounderProgressRecord(
          user.id,
          'profile_updated',
          'Founder profile updated',
          'Your founder profile was saved and is now available across PATH360.',
          {
            ventureName: saved?.venturename || saved?.venture_name || null,
            operatingGeography: getOperatingGeography(saved) || null,
            capitalTargetGeography: getCapitalTargetGeography(saved) || null,
            corridorKey: derived.corridorKey,
          },
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
        0,
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
      const profile = get().founderProfile
      const derived = deriveAssessmentState(profile, saved)
      const enrichedAssessment = derived.assessment

      set((state) => ({
        assessmentResults: enrichedAssessment,
        assessmentHistory: normaliseAssessmentHistory([
          enrichedAssessment,
          ...(Array.isArray(state.assessmentHistory)
            ? state.assessmentHistory.filter(
                (assessment) => assessment?.id !== enrichedAssessment?.id,
              )
            : []),
        ]),
        qaPairs: Array.isArray(enrichedAssessment?.rawqa)
          ? enrichedAssessment.rawqa
          : [],
        progressReviewDraft: null,
        investorReadyPercent: derived.readinessPercent,
        diagnosedStage: derived.stage,
        vulnerabilityFlags: derived.flags,
        corridorKey: derived.corridorKey,
        corridor: derived.corridor,
        recommendedAcademyPath: derived.recommendedAcademyPath,
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
            assessmentid: enrichedAssessment?.id ?? null,
            assessmenttype: enrichedAssessment?.assessmenttype ?? null,
            versionnumber: enrichedAssessment?.versionnumber ?? nextVersion,
            founderscore: enrichedAssessment?.founderscore ?? null,
            investorreadiness:
              enrichedAssessment?.investorreadiness ?? derived.readinessPercent,
            corridorKey: derived.corridorKey,
            recommendedAcademyPath: derived.recommendedAcademyPath,
          },
        )
      } catch (error) {
        console.warn('Failed to record assessment milestone', error)
      }

      return enrichedAssessment
    } catch (error) {
      console.error('addAssessment failed', error)
      throw error
    }
  },
   startProgressReview: () => {
    const currentAssessment = get().assessmentResults
    const history = normaliseAssessmentHistory(get().assessmentHistory)

    if (!currentAssessment?.id) {
      throw new Error(
        'Complete your baseline assessment before starting a progress review.',
      )
    }

    const highestVersion = history.reduce(
      (highest, assessment) =>
        Math.max(highest, getAssessmentVersion(assessment)),
      getAssessmentVersion(currentAssessment),
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
    const profile = get().founderProfile
    const selectedAssessment = history.find(
      (assessment) => assessment?.id === assessmentId,
    )

    if (!selectedAssessment) {
      throw new Error('Assessment version not found.')
    }

    const derived = deriveAssessmentState(profile, selectedAssessment)

    set({
      assessmentResults: derived.assessment,
      qaPairs: Array.isArray(derived.assessment?.rawqa)
        ? derived.assessment.rawqa
        : [],
      investorReadyPercent: derived.readinessPercent,
      diagnosedStage: derived.stage,
      vulnerabilityFlags: derived.flags,
      corridorKey: derived.corridorKey,
      corridor: derived.corridor,
      recommendedAcademyPath: derived.recommendedAcademyPath,
    })

    return derived.assessment
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
        importanceScore,
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
    linkedAssessmentId = null,
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
        linkedAssessmentId,
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
          },
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
    metadata = {},
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
        metadata,
      )

      set((state) => ({
        progressEvents: [
          saved,
          ...(Array.isArray(state.progressEvents) ? state.progressEvents : []),
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
    const corridorKey = state.corridorKey
    const corridor =
      state.corridor ||
      (corridorKey ? GLOBAL_CORRIDOR_MATRIX[corridorKey] : null)
    const ventureIntelligence = state.ventureIntelligenceProfile

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
              profile.venturestage || profile.venture_stage || null,
            business_model:
              profile.businessmodel || profile.business_model || null,
            geography: profile.geography || null,
            operating_geography: getOperatingGeography(profile) || null,
            capital_target_geography:
              getCapitalTargetGeography(profile) || null,
            funding_goal: profile.fundinggoal || profile.funding_goal || null,
            website: profile.website || null,
            email: profile.email || null,
            role: profile.role || null,
            linkedin: profile.linkedin || null,
            venture_summary:
              profile.venturesummary || profile.venture_summary || null,
            target_investor_region: profile.target_investor_region || null,
          }
        : null,

      assessment: assessment
        ? {
            id: assessment.id ?? null,
            assessment_type: assessment.assessmenttype ?? 'baseline',
            version_number: assessment.versionnumber ?? 1,
            founder_score:
              assessment.founderscore ?? assessment.founder_score ?? null,
            investor_readiness:
              assessment.investorreadiness ??
              assessment.investor_readiness ??
              state.investorReadyPercent ??
              null,
            financial_maturity:
              assessment.financialmaturity ?? assessment.financial_maturity ?? null,
            venture_stage_result:
              assessment.venturestageresult ??
              assessment.venturestage ??
              state.diagnosedStage ??
              null,
            strategic_priorities:
              assessment.strategicpriorities ??
              assessment.strategic_priorities ??
              [],
            vc_verdict: assessment.vcverdict ?? assessment.vc_verdict ?? null,
            rawqa: assessment.rawqa ?? [],
            corridor_key: corridorKey,
            recommended_academy_path:
              assessment.recommendedacademypath ??
              state.recommendedAcademyPath ??
              null,
          }
        : null,

      venture_intelligence: ventureIntelligence
        ? {
            primary_country_code:
              ventureIntelligence.primary_country_code || null,
            primary_region_code:
              ventureIntelligence.primary_region_code || null,
            operating_scope: ventureIntelligence.operating_scope || null,
            customer_model_tags:
              ventureIntelligence.customer_model_tags || [],
            revenue_model_tags: ventureIntelligence.revenue_model_tags || [],
            distribution_model_tags:
              ventureIntelligence.distribution_model_tags || [],
            operating_model_tags:
              ventureIntelligence.operating_model_tags || [],
            dependency_tags: ventureIntelligence.dependency_tags || [],
            finance_approach_tags:
              ventureIntelligence.finance_approach_tags || [],
            affordability_sensitivity:
              ventureIntelligence.affordability_sensitivity || null,
            market_formality: ventureIntelligence.market_formality || null,
            regulatory_exposure:
              ventureIntelligence.regulatory_exposure || null,
            biggest_operating_concern:
              ventureIntelligence.biggest_operating_concern || null,
            setup_completed_at: ventureIntelligence.setup_completed_at || null,
          }
        : null,

      corridor: corridor
        ? {
            corridor_key: corridorKey,
            label: corridor.label,
            summary: corridor.summary || null,
            operating_geography: corridor.operatingGeography || null,
            capital_target_geography:
              corridor.capitalTargetGeography || null,
            required_checks: corridor.requiredChecks || [],
            academy_focus_track: corridor.academyFocusTrack || null,
          }
        : null,

      memories: memories.map((memory) => ({
        memory_type: memory.memorytype ?? memory.memory_type ?? null,
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
      String(tier).toLowerCase(),
    )
  },

  hydrateWorkspace: async (userId) => {
    try {
      const [workspace, intelligenceProfile, savedCompliance] = await Promise.all([
        loadFounderWorkspace(userId),
        getVentureIntelligenceProfile(userId),
        getComplianceProgress(userId),
      ])

      const complianceProgress = (Array.isArray(savedCompliance)
        ? savedCompliance
        : []
      ).reduce((accumulator, record) => {
        const countryCode = record?.country_code

        if (!countryCode) return accumulator

        accumulator[countryCode] = {
          ...(record?.profile_data || {}),
          countryCode,
          countryName: record?.country_name || null,
          stage: record?.stage || null,
          corridor: record?.corridor || null,
          updatedAt: record?.updated_at || null,
          completedCount: record?.completed_count ?? 0,
          inProgressCount: record?.in_progress_count ?? 0,
          totalCount: record?.total_count ?? 0,
        }

        return accumulator
      }, {})

      const localStage = loadLocalStage(userId)
      const profile = workspace?.founderProfile ?? null
      const assessment = workspace?.assessmentResults ?? null
      const derived = deriveAssessmentState(profile, assessment)

      set({
        founderProfile: profile,
        assessmentResults: derived.assessment,
        assessmentHistory: normaliseAssessmentHistory(
          workspace?.assessmentHistory,
        ),
        progressReviewDraft: null,
        memories: Array.isArray(workspace?.memories) ? workspace.memories : [],
        documents: Array.isArray(workspace?.documents) ? workspace.documents : [],
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
        complianceProgress,
        stageAssessment: localStage.assessment,
        hasCompletedStageOnboarding: localStage.completed,
        investorReadyPercent: derived.readinessPercent,
        diagnosedStage: derived.stage,
        vulnerabilityFlags: derived.flags,
        corridorKey: derived.corridorKey,
        corridor: derived.corridor,
        recommendedAcademyPath: derived.recommendedAcademyPath,
        ventureIntelligenceProfile: intelligenceProfile || null,
        hasCompletedVentureIntelligenceSetup:
          hasCompletedVentureSetup(intelligenceProfile),
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
      investorReadyPercent: 0,
      diagnosedStage: null,
      vulnerabilityFlags: [],
      corridorKey: null,
      corridor: null,
      recommendedAcademyPath: null,
      ventureIntelligenceProfile: null,
      hasCompletedVentureIntelligenceSetup: false,
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
      complianceProgress: {},
      stageAssessment: null,
      hasCompletedStageOnboarding: false,
    })
  },

  clearSessionOnly: () => {
    set({
      user: null,
      founderProfile: null,
      assessmentResults: null,
      investorReadyPercent: 0,
      diagnosedStage: null,
      vulnerabilityFlags: [],
      corridorKey: null,
      corridor: null,
      recommendedAcademyPath: null,
      ventureIntelligenceProfile: null,
      hasCompletedVentureIntelligenceSetup: false,
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
      complianceProgress: {},
      stageAssessment: null,
      hasCompletedStageOnboarding: false,
    })
  },
}))

export default useDiagnosticStore