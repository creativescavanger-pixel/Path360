export const beginWithYourselfLesson = {
  key: 'begin-with-yourself',
  stageKey: 'discover',
  workshopKey: 'discover-opportunities',
  number: '0.1',
  title: 'Begin with yourself',
  framework: 'Founder Capability and Access Map',
  estimatedMinutes: 30,

  introduction: {
    heading: 'Start with the founder behind the opportunity',
    body: [
      'The opportunities you can investigate responsibly are shaped by more than market demand. They are also shaped by your knowledge, access, constraints, energy, credibility, and ability to learn.',
      'This lesson helps you identify the capabilities and access you already have, as well as the gaps you would need to address before pursuing a particular opportunity.',
    ],
  },

  caseStudy: {
    title: 'Case study: A useful idea outside the founder’s reach',
    organisation: 'Illustrative founder scenario',
    summary:
      'A founder noticed recurring problems in a regulated service market and quickly identified a promising software idea. Early interviews showed genuine pain, but the founder had no direct customer access, limited understanding of regulation, and no partner with domain credibility.',
    insight:
      'The idea was not rejected. Instead, the founder narrowed the opportunity and spent time building access before committing to a solution.',
    prompt:
      'Which part of this founder’s situation is most similar to yours: knowledge, access, credibility, time, capital, or relationships?',
  },

  view: {
    title: 'View: Founder Capability and Access Map',
    description:
      'Assess what you bring to an opportunity before deciding whether it is worth investigating further.',
    items: [
      {
        label: 'Knowledge',
        description:
          'What lived experience, industry understanding, technical knowledge, or customer insight do you have?',
      },
      {
        label: 'Access',
        description:
          'Who can you speak with, observe, test with, sell to, partner with, or learn from?',
      },
      {
        label: 'Credibility',
        description:
          'Why would customers, partners, advisers, or future hires trust you with this problem?',
      },
      {
        label: 'Capacity',
        description:
          'What time, energy, money, tools, and operational support can you commit?',
      },
      {
        label: 'Learning gaps',
        description:
          'What must you understand, validate, or gain access to before moving forward?',
      },
    ],
  },

  resources: [
    {
      type: 'read',
      title: 'Founder Capability and Access Map',
      description:
        'Use this worksheet to map your relevant knowledge, relationships, credibility, constraints, and learning gaps.',
      href: '',
    },
    {
      type: 'watch',
      title: 'How founders earn the right to investigate a problem',
      description:
        'A short future video resource on building access before committing to an idea.',
      videoUrl: '',
    },
  ],

  reflection: {
    title: 'Guided self-reflection',
    questions: [
      'Which industries, communities, or problem spaces do I understand unusually well?',
      'What problems have I experienced directly or observed repeatedly?',
      'Who can I speak with this week to learn more about those problems?',
      'Where do I have credibility, trust, or a warm introduction that others may not have?',
      'What practical constraints could limit my ability to investigate or build an opportunity?',
      'Which one capability or access gap would be most important to close first?',
    ],
  },

  output: {
    title: 'Create your Founder Capability and Access Map',
    description:
      'Write a concise map of the assets and constraints that should shape the opportunities you explore next.',
    fields: [
      {
        key: 'knowledge',
        label: 'Knowledge and lived experience',
        placeholder: 'What do you know from experience, work, study, or observation?',
      },
      {
        key: 'access',
        label: 'Access to people and environments',
        placeholder: 'Who can you speak with, observe, or learn from?',
      },
      {
        key: 'credibility',
        label: 'Credibility and trust',
        placeholder: 'Why might others trust you with this problem or market?',
      },
      {
        key: 'constraints',
        label: 'Constraints to work around',
        placeholder: 'What limits your time, money, energy, network, or ability to act?',
      },
      {
        key: 'nextStep',
        label: 'One next action',
        placeholder: 'What will you do in the next seven days to improve your evidence or access?',
      },
    ],
  },

  healthImpact: {
    dimension: 'Founder capability',
    prompt:
      'After saving, update whether your current capability and access are healthy, need attention, or need action.',
  },
}