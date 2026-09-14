export const transitionPreparationWorkshop = {
  key: 'transition',
  number: '08',
  label: 'Transition',
  question: 'What ownership or transaction path fits the company?',
  title: 'Prepare for Succession, Sale, Merger, Acquisition, or Private Equity',
  description:
    'Clarify owner goals, build transaction readiness, organise diligence materials, understand company value drivers, and prepare for professional advice.',
  modules: [
    {
      key: 'transition-owner-goals',
      number: '8.1',
      title: 'Clarify owner goals and transition options',
      framework: 'Owner Goals and Transition Options',
      output: 'Transition Direction',
    },
    {
      key: 'transition-value-drivers',
      number: '8.2',
      title: 'Understand company value drivers',
      framework: 'Value Driver Assessment',
      output: 'Value Improvement Plan',
    },
    {
      key: 'transition-readiness',
      number: '8.3',
      title: 'Prepare governance and financial readiness',
      framework: 'Transaction Readiness Review',
      output: 'Readiness Gap Map',
    },
    {
      key: 'transition-data-room',
      number: '8.4',
      title: 'Organise the data room and adviser brief',
      framework: 'Data Room Checklist and Adviser Brief',
      output: 'Transition Readiness Pack',
    },
  ],
}