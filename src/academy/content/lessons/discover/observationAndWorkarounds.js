import { airbnbObservationCase } from '../../cases';
import { customerDiscoveryResources } from '../../resources';

export const observationAndWorkaroundsLesson = {
  id: 'discover-observation-and-workarounds',
  stageKey: 'discover',
  moduleKey: 'observation-and-workarounds',
  order: 4,
  title: 'Observe people, behaviour, and workarounds',
  eyebrow: 'Discover · Lesson 0.4',
  duration: '35–50 minutes',
  journey: ['Understand', 'See a case', 'Watch and read', 'Apply', 'Fieldwork', 'Reflect'],
  orientation: {
    decision: 'Which real behaviours and workarounds point to meaningful friction?',
    whyItMatters: 'People can describe a problem. Their current behaviour shows what the problem costs them in time, money, effort, attention, or trust.',
    outcome: 'A structured observation record with evidence, an interpretation, and a clear next investigation.'
  },
  concept: {
    title: 'Observe before you interpret',
    introduction: 'Do not begin by asking whether someone likes your idea. Start by understanding what they already do when they are trying to get an important task done.',
    distinctions: [
      {
        term: 'Complaint',
        definition: 'A stated frustration. It is a signal, but it does not automatically show frequency, severity, or willingness to change behaviour.'
      },
      {
        term: 'Behaviour',
        definition: 'What a person actually does, including delays, repetition, abandonment, spending, asking for help, or changing a routine.'
      },
      {
        term: 'Workaround',
        definition: 'A substitute, manual process, informal service, spreadsheet, extra trip, personal contact, or unreliable alternative used to cope with friction.'
      },
      {
        term: 'Pattern',
        definition: 'A similar friction or workaround appearing across more than one person, moment, or source.'
      },
      {
        term: 'Hypothesis',
        definition: 'A possible explanation for what you observed. It still needs evidence and should not be treated as a fact.'
      }
    ],
    commonMistakes: [
      'Treating polite enthusiasm as proof of demand.',
      'Writing an interpretation as if it were an observed fact.',
      'Introducing your proposed solution before understanding the current workaround.',
      'Generalising from one conversation without looking for a pattern.'
    ]
  },
  caseStudy: airbnbObservationCase,
  resources: customerDiscoveryResources,
  framework: {
    title: 'Observation and Workaround Canvas',
    purpose: 'Use this canvas after you have enough context to capture what you saw, what supports it, and what you need to investigate next.',
    fields: [
      'Context: where and when did this task, transaction, or interaction occur?',
      'Person or role: who was trying to get something done?',
      'Goal: what outcome were they trying to reach?',
      'Journey: what steps did they take?',
      'Friction: where did time, money, effort, attention, or trust become costly?',
      'Workaround: what did they do instead?',
      'Evidence: what exact words, actions, records, or artefacts support your note?',
      'Interpretation: what might the evidence mean?',
      'Next investigation: what needs validating before you make a decision?'
    ],
    workedExample: {
      title: 'Worked example: a busy lunchtime queue',
      summary: 'A customer leaves a lunch queue after waiting for several minutes and sends a colleague to buy food later.',
      evidence: 'Observed at 12:35. The customer checked the queue twice, said “I cannot wait that long,” and messaged a colleague. The colleague returned about 25 minutes later with food.',
      interpretation: 'The problem may not be only queue length. Timing uncertainty and the inability to leave work may make waiting feel risky.',
      nextStep: 'Observe three more lunchtime transactions and ask recent customers how they currently decide whether to queue, leave, order, or delegate.'
    }
  },
  fieldwork: {
    title: 'Go into the field: observe one real task',
    timeBox: '20–40 minutes',
    instruction: 'Choose one person, task, transaction, service, or place connected to the problem area you are exploring. Observe directly, or reconstruct a recent experience in detail with someone who lived it.',
    evidenceToCapture: [
      'Who was involved and what role did they have?',
      'What were they trying to achieve?',
      'What steps did they take?',
      'Where did friction, hesitation, delay, confusion, or risk appear?',
      'What did they do instead?',
      'What did the workaround cost in time, money, effort, trust, or attention?',
      'What exact words, actions, or artefacts support your note?'
    ],
    guardrail: 'Do not introduce your solution idea during the observation. Your purpose is to learn about the current reality, not to win approval for a proposal.'
  },
  reflection: {
    title: 'Reflect before moving on',
    prompts: [
      'What did you observe that surprised you?',
      'Which parts of your notes are direct evidence, and which are interpretation?',
      'Which assumption became weaker or stronger?',
      'What pattern do you need to see again before you take it seriously?',
      'What is your next investigation or fieldwork action?'
    ],
    decisionPrompt: 'Based on your evidence so far, what problem territory is worth investigating next—and what would make you change your mind?'
  },
  nextLessonId: 'discover-problem-evidence-canvas'
};
