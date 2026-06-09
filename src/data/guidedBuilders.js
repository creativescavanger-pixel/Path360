export const GUIDED_BUILDERS = {
  businessplan: {
    label: 'Business Plan',
    sections: [
      {
        key: 'problem',
        title: 'Problem',
        questions: [
          {
            key: 'problem-core',
            question: 'What exact problem are you solving, and who experiences it most painfully today?',
            significance: 'A strong business plan starts with a painful, specific problem. If the problem is vague, the whole venture feels weak.'
          },
          {
            key: 'problem-urgency',
            question: 'Why is this problem urgent enough that someone would pay or switch now?',
            significance: 'Urgency is what turns interest into buying behavior. Investors look for now, not someday.'
          }
        ]
      },
      {
        key: 'customer',
        title: 'Customer',
        questions: [
          {
            key: 'customer-icp',
            question: 'Who is your ideal first customer, not the whole market, but the sharpest early adopter?',
            significance: 'The tighter the initial customer definition, the easier it is to win traction and tell a convincing go-to-market story.'
          }
        ]
      },
      {
        key: 'businessmodel',
        title: 'Business Model',
        questions: [
          {
            key: 'revenue-model',
            question: 'How do you make money, and what exactly does a customer pay for?',
            significance: 'A founder must show how value turns into revenue. Without that, the plan reads like a concept, not a business.'
          }
        ]
      },
      {
        key: 'traction',
        title: 'Traction',
        questions: [
          {
            key: 'traction-proof',
            question: 'What proof do you have that the market wants this now?',
            significance: 'Traction is one of the clearest signs that the venture is grounded in reality rather than assumption.'
          }
        ]
      }
    ]
  },

  vcpitch: {
    label: 'VC Pitch Deck',
    sections: [
      {
        key: 'vision',
        title: 'Vision',
        questions: [
          {
            key: 'vision-one-line',
            question: 'In one sentence, what are you building and why does it matter?',
            significance: 'The best decks become memorable because the core idea is instantly clear.'
          }
        ]
      },
      {
        key: 'market',
        title: 'Market',
        questions: [
          {
            key: 'market-size',
            question: 'How big is the market you can realistically win first, and why this wedge?',
            significance: 'Investors care about scale, but they trust a believable entry wedge more than inflated TAM claims.'
          }
        ]
      }
    ]
  },

  businessmodel: {
    label: 'Business Model',
    sections: [
      {
        key: 'pricing',
        title: 'Pricing',
        questions: [
          {
            key: 'pricing-logic',
            question: 'What is your pricing model, and why is it aligned with customer value?',
            significance: 'Pricing is strategy. It signals positioning, margin potential, and how customers understand your value.'
          }
        ]
      },
      {
        key: 'economics',
        title: 'Economics',
        questions: [
          {
            key: 'unit-economics',
            question: 'What do you know today about your margins, acquisition cost, and retention?',
            significance: 'A strong business model is not just revenue; it is revenue that can compound profitably.'
          }
        ]
      }
    ]
  }
}