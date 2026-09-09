import MissionEnvironmentMap from '../MissionEnvironmentMap.jsx'
import MissionFounderContext from '../MissionFounderContext.jsx'
import MissionProblemsNeedsGaps from '../MissionProblemsNeedsGaps.jsx'
import MissionTwo from '../MissionTwo.jsx'
import DiscoverObservationLearningModule from './modules/DiscoverObservationLearningModule.jsx'

const BASE_WORK = {
  evidenceUrl: '',
  evidenceName: '',
  status: 'learned',
}

export const ACADEMY_MODULES = [
  {
    key: 'founder-context-profile',
    stage: 'discover',
    number: '0.1',
    title: 'Begin with yourself',
    output: 'Founder Capability and Access Map',
    component: MissionFounderContext,
    initialWork: {
      ...BASE_WORK,
      backgroundAndExperience: '',
      networkAndAccess: '',
      startingResources: '',
      constraints: '',
      investigateNow: '',
    },
    nextKey: 'notice-friction',
    getRequirements(work, latestVersion) {
      return {
        experience: Boolean(work.backgroundAndExperience?.trim()),
        access: Boolean(work.networkAndAccess?.trim() || work.startingResources?.trim()),
        constraints: Boolean(work.constraints?.trim()),
        investigateNow: Boolean(work.investigateNow?.trim()),
        evidenceStatus: work.status === 'evidence-backed',
        saved: latestVersion > 0,
      }
    },
  },
  {
    key: 'notice-friction',
    stage: 'discover',
    number: '0.2',
    title: 'Learn to notice opportunities',
    output: 'Friction Shortlist',
    component: MissionTwo,
    initialWork: {
      ...BASE_WORK,
      reflection: '',
      problemOne: '',
      problemTwo: '',
      problemThree: '',
      decision: '',
    },
    nextKey: 'environment-map',
    getRequirements(work, latestVersion) {
      return {
        reflection: Boolean(work.reflection?.trim()),
        firstSignal: Boolean(work.problemOne?.trim()),
        secondSignal: Boolean(work.problemTwo?.trim()),
        thirdSignal: Boolean(work.problemThree?.trim()),
        decision: Boolean(work.decision?.trim()),
        evidenceStatus: work.status === 'evidence-backed',
        saved: latestVersion > 0,
      }
    },
  },
  {
    key: 'environment-map',
    stage: 'discover',
    number: '0.3',
    title: 'Map your environment',
    output: 'Environment and Opportunity Map',
    component: MissionEnvironmentMap,
    initialWork: {
      ...BASE_WORK,
      environmentLens: '',
      environmentFocus: '',
      peopleAndAccess: '',
      assetsAndResources: '',
      frictionAndGaps: '',
      changeSignal: '',
      changeDetails: '',
      opportunitySources: '',
      nextFieldwork: '',
      evidenceNote: '',
      decision: '',
    },
    nextKey: 'observation-workarounds',
    getRequirements(work, latestVersion) {
      return {
        environment: Boolean(work.environmentFocus?.trim()),
        access: Boolean(work.peopleAndAccess?.trim() || work.assetsAndResources?.trim()),
        gap: Boolean(work.frictionAndGaps?.trim()),
        change: Boolean(work.changeSignal),
        fieldwork: Boolean(work.nextFieldwork?.trim()),
        evidenceStatus: work.status === 'evidence-backed',
        saved: latestVersion > 0,
      }
    },
  },
  {
    key: 'observation-workarounds',
    stage: 'discover',
    number: '0.4',
    title: 'Observe people, behaviour, and workarounds',
    description: 'Turn an environment signal into direct evidence of customer behaviour and existing workarounds.',
    output: 'Observation Log and Workaround Evidence',
    component: DiscoverObservationLearningModule,
    nextKey: 'problems-needs-gaps',
    initialWork: {
      ...BASE_WORK,
      observationTitle: '',
      observationContext: '',
      participantRole: '',
      participantGoal: '',
      journeySteps: '',
      frictionObserved: '',
      workaroundObserved: '',
      alternativesUsed: '',
      exactSignals: '',
      founderInterpretation: '',
      confidenceLevel: '',
      patternLink: '',
      followUpAction: '',
      evidenceNote: '',
      decision: '',
    },
    getRequirements(work, latestVersion) {
      return {
        context: Boolean(work.observationContext?.trim()),
        personAndGoal: Boolean(work.participantRole?.trim() && work.participantGoal?.trim()),
        journey: Boolean(work.journeySteps?.trim()),
        friction: Boolean(work.frictionObserved?.trim()),
        workaround: Boolean(work.workaroundObserved?.trim() || work.alternativesUsed?.trim()),
        evidence: Boolean(work.exactSignals?.trim() || work.evidenceNote?.trim()),
        fieldwork: Boolean(work.followUpAction?.trim()),
        evidenceStatus: work.status === 'evidence-backed',
        saved: latestVersion > 0,
      }
    },
  },
  {
    key: 'problems-needs-gaps',
    stage: 'discover',
    number: '0.5',
    title: 'Identify problems, needs, gaps, and underused assets',
    description: 'Turn observations into evidence-bounded problem candidates before designing a solution.',
    output: 'Problem Evidence Canvas',
    component: MissionProblemsNeedsGaps,
    nextKey: 'opportunity-generation',
    initialWork: {
      ...BASE_WORK,
      problemType: '',
      affectedGroup: '',
      problemStatement: '',
      desiredOutcome: '',
      observedEvidence: '',
      currentWorkaround: '',
      currentAlternatives: '',
      impactAreas: [],
      assumptions: '',
      criticalUncertainty: '',
      nextEvidenceAction: '',
      evidenceNote: '',
      decision: '',
    },
    getRequirements(work, latestVersion) {
      return {
        problem: Boolean(work.problemStatement?.trim()),
        person: Boolean(work.affectedGroup?.trim()),
        desiredOutcome: Boolean(work.desiredOutcome?.trim()),
        evidence: Boolean(work.observedEvidence?.trim() || work.evidenceNote?.trim()),
        currentResponse: Boolean(work.currentWorkaround?.trim() || work.currentAlternatives?.trim()),
        impact: Boolean(work.impactAreas?.length),
        uncertainty: Boolean(work.criticalUncertainty?.trim()),
        nextAction: Boolean(work.nextEvidenceAction?.trim()),
        evidenceStatus: work.status === 'evidence-backed',
        saved: latestVersion > 0,
      }
    },
  },
]

export function getAcademyModule(key) {
  return ACADEMY_MODULES.find((module) => module.key === key) || null
}

export function getAcademyModulesForStage(stage) {
  return ACADEMY_MODULES.filter((module) => module.stage === stage)
}
