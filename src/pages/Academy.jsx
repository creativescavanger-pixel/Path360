import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import supabase from '../lib/supabaseClient.js'
import MissionTwo from './MissionTwo.jsx'
import MissionCompletionCard from './MissionCompletionCard.jsx'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

const COURSE = {
  key: 'path360-founder-workshop',
  title: 'PATH360 Academy',
}

const LEGACY_PATH_ORDER = ['idea', 'validation', 'mvp', 'traction', 'growth']

const ACADEMY_PATHS = {
  idea: {
    label: 'Idea',
    title: 'From observation to a focused opportunity',
    promise: 'Turn observed friction into an opportunity worth investigating.',
    focus: 'Find a real problem before committing to a solution.',
    resource: 'A founder lesson from Airbnb',
    video: {
      title: 'Watch with context: customer discovery',
      duration: '8 min suggested watch',
      searchUrl:
        'https://www.youtube.com/results?search_query=Y+Combinator+customer+discovery+startup+interviews',
      watchFor:
        'Notice how founders distinguish a real observed behaviour from a polite opinion about a possible solution.',
    },
    fieldNote: {
      company: 'Airbnb',
      title: 'Start close enough to see the real problem',
      readTime: '6 min read',
      context:
        'Before it became a global marketplace, Airbnb began with a practical problem: people needed a place to stay during busy events while hosts had spare space but little reason to trust strangers.',
      happened:
        'The early team did not learn by sitting far from customers and guessing. They went to hosts, photographed listings, listened to concerns, and noticed the small details that made people hesitate.',
      turningPoint:
        'Instead of treating the marketplace as an abstract growth problem, the founders treated it as a series of real moments between real people.',
      borrow:
        'At the earliest stage, your advantage is closeness. If you can see the workaround, delay, frustration, or decision in context, you are less likely to build around an assumption.',
      challenge:
        'Choose one situation you have noticed. Write what happened, who was involved, what they tried instead, and what the workaround cost them.',
      create: 'Opportunity journal',
    },
    missions: [
      {
        key: 'opportunity-foundations',
        number: 1,
        title: 'See the moment',
        duration: '15 min',
        founder: 'Founder field note: Airbnb',
        principle: 'Start with observed behaviour, not a polished solution.',
        framework: 'Friction observation log',
        artefact: 'Opportunity journal',
        trialIncluded: true,
      },
      {
        key: 'notice-friction',
        number: 2,
        title: 'Find meaningful friction',
        duration: '15 min',
        founder: 'Founder field note: Stripe',
        principle: 'Recurring workarounds reveal problems worth understanding.',
        framework: 'Friction significance filter',
        artefact: 'Problem shortlist',
        trialIncluded: true,
      },
      {
        key: 'choose-a-user',
        number: 3,
        title: 'Find your first learning user',
        duration: '15 min',
        founder: 'Founder field note: Figma',
        principle: 'Learn from people close enough to the problem to show you their work.',
        framework: 'Learning-user profile',
        artefact: 'Interview target list',
        trialIncluded: true,
      },
    ],
  },
  validation: {
    label: 'Validation',
    title: 'From assumption to evidence',
    promise: 'Replace assumptions with customer evidence.',
    focus:
      'Learn directly from customers, recognise patterns, then test the assumption that could break the venture.',
    resource: 'A founder lesson from Dropbox',
    video: {
      title: 'Read with context: how to interview customers',
      duration: '12–18 min suggested read',
      searchUrl:
        'https://www.lumi.studio/blog/how-to-interview-customers-guide-for-startup-founders',
      watchFor:
        'Use this guide to structure discovery and validation interviews so you get evidence instead of polite encouragement.',
    },
    fieldNote: {
      company: 'Dropbox',
      title: 'Test whether people understand the promise',
      readTime: '6 min read',
      context:
        'Dropbox was built around a simple promise: files should stay available across devices without the usual friction of manually moving them.',
      happened:
        'Rather than treating a complete product as the only way to learn, the team used a demonstration to show the intended experience and learn whether the promise created meaningful interest.',
      turningPoint:
        'A small test can reveal whether people understand, care about, and will act on a promise before major investment.',
      borrow:
        'Validation is not collecting compliments. It is reducing a specific uncertainty with behaviour, commitments, or evidence that would change your next decision.',
      challenge:
        'Name the assumption that would make your next move unsafe. Design the smallest test that could produce a useful signal this week.',
      create: 'Experiment card',
    },
    missions: [
      {
        key: 'interview-without-pitching',
        number: 1,
        title: 'Listen without pitching',
        duration: '20 min',
        founder: 'Founder field note: Airbnb',
        principle: 'Evidence is observed behaviour, not encouragement.',
        framework: 'Non-leading interview guide',
        artefact: 'Interview plan',
        trialIncluded: true,
      },
      {
        key: 'synthesise-evidence',
        number: 2,
        title: 'Turn conversations into evidence',
        duration: '25 min',
        founder: 'Founder field note: Superhuman',
        principle: 'Patterns matter more than isolated opinions.',
        framework: 'Evidence matrix',
        artefact: 'Evidence map',
        trialIncluded: true,
      },
      {
        key: 'test-key-assumption',
        number: 3,
        title: 'Test the assumption that matters',
        duration: '25 min',
        founder: 'Founder field note: Dropbox',
        principle: 'Test the uncertainty that can invalidate your next move.',
        framework: 'Riskiest-assumption test',
        artefact: 'Experiment card',
        trialIncluded: true,
      },
    ],
  },
  mvp: {
    label: 'MVP',
    title: 'From evidence to a functioning baseline',
    promise: 'Scope and build your initial core product experience.',
    focus: 'Deliver immediate customer utility while tracking real behaviour signals.',
    resource: 'A founder lesson from Zappos',
    video: {
      title: 'Watch with context: scoping down your MVP',
      duration: '10 min suggested watch',
      searchUrl: 'https://www.youtube.com/results?search_query=Y+Combinator+MVP+startup',
      watchFor:
        'Notice how teams cut non-essential features to ship and learn from a useful first version.',
    },
    fieldNote: {
      company: 'Zappos',
      title: 'Deliver value manually before automating it',
      readTime: '6 min read',
      context:
        'Zappos began by proving people would buy shoes online before building a large inventory and automation system.',
      happened:
        'The team photographed shoes in physical stores, posted them online, and fulfilled purchases manually.',
      turningPoint:
        'Manual delivery made it possible to learn where customer value actually lived before infrastructure was built.',
      borrow:
        'Build the thinnest path that fulfils the core promise. Automation should follow learning, not replace it.',
      challenge:
        'Identify the core promise of your offer and plan a manual way to deliver or test it for one active user.',
      create: 'MVP roadmap card',
    },
    missions: [
      {
        key: 'scope-minimum-utility',
        number: 1,
        title: 'Scope down to primary utility',
        duration: '20 min',
        founder: 'Founder field note: Zappos',
        principle: 'Build the thinnest path that fulfils your core promise.',
        framework: 'Feature subtraction filter',
        artefact: 'MVP roadmap card',
        trialIncluded: true,
      },
      {
        key: 'track-engagement-signals',
        number: 2,
        title: 'Design your behavioural trackers',
        duration: '15 min',
        founder: 'Founder field note: Zappos',
        principle: 'Track activation behaviours instead of abstract page views.',
        framework: 'Retention metric log',
        artefact: 'Analytics tracking sheet',
        trialIncluded: true,
      },
      {
        key: 'launch-manual-concierge',
        number: 3,
        title: 'Run a manual concierge pilot',
        duration: '30 min',
        founder: 'Founder field note: Zappos',
        principle: 'Do things manually first to see where users derive value.',
        framework: 'Concierge execution matrix',
        artefact: 'Pilot cohort tracker',
        trialIncluded: true,
      },
    ],
  },
  traction: {
    label: 'Traction',
    title: 'From early signals to repeatable growth',
    promise: 'Turn early customer signals into repeatable growth.',
    focus: 'Strengthen demand, acquisition, retention, and customer-value systems.',
    resource: 'A founder lesson from Notion',
    video: {
      title: 'Watch with context: finding repeatable demand',
      duration: '8 min suggested watch',
      searchUrl:
        'https://www.youtube.com/results?search_query=Y+Combinator+product+market+fit+retention+startup',
      watchFor:
        'Look for the difference between a customer who likes a product and one who returns, refers, or changes a workflow around it.',
    },
    fieldNote: {
      company: 'Notion',
      title: 'Look for behaviour that repeats without persuasion',
      readTime: '6 min read',
      context:
        'Notion serves many use cases, making disciplined learning about where value is strongest especially important.',
      happened:
        'Early traction is easy to misread. The stronger signal appears when customers return, bring colleagues in, and make the product part of work they already need to do.',
      turningPoint:
        'The task shifts from asking whether anyone will try the product to understanding which users receive enough value to come back.',
      borrow:
        'Do not scale a one-off win. Find the customer behaviour that repeats and the path that leads to it.',
      challenge:
        'Choose one recent customer win. Identify what was repeatable, what depended on you personally, and what you need to see again.',
      create: 'Growth signal scorecard',
    },
    missions: [
      {
        key: 'ready-to-scale',
        number: 1,
        title: 'Validate repeatable demand',
        duration: '20 min',
        founder: 'Founder field note: Notion',
        principle: 'One-off wins are not yet a growth system.',
        framework: 'Demand signal scorecard',
        artefact: 'Growth signal scorecard',
        trialIncluded: true,
      },
      {
        key: 'build-repeatability',
        number: 2,
        title: 'Build a repeatable acquisition flow',
        duration: '20 min',
        founder: 'Founder field note: HubSpot',
        principle: 'Understand how customers discover, evaluate, and choose you.',
        framework: 'Acquisition journey map',
        artefact: 'Acquisition flow',
        trialIncluded: true,
      },
    ],
  },
  growth: {
    label: 'Growth',
    title: 'From traction to expansion',
    promise: 'Build systems required to expand with confidence.',
    focus: 'Strengthen operating model, sales motion, customer economics, and growth narrative.',
    resource: 'A founder lesson from Shopify',
    video: {
      title: 'Watch with context: scaling the operating system',
      duration: '8 min suggested watch',
      searchUrl:
        'https://www.youtube.com/results?search_query=Y+Combinator+startup+operating+systems+scaling',
      watchFor:
        'Notice which decisions require a founder at first and which become safer once ownership and decision rules are explicit.',
    },
    fieldNote: {
      company: 'Shopify',
      title: 'Scale the system, not the founder',
      readTime: '6 min read',
      context:
        'Shopify began when its founders were building an online snowboard store and found available e-commerce tools inadequate.',
      happened:
        'As companies grow, the founder personally unblocking every decision becomes a constraint. Teams wait, ownership becomes fuzzy, and founder dependency rises.',
      turningPoint:
        'Growth means making important work repeatable: clear priorities, visible owners, decision rules, and a rhythm for review.',
      borrow:
        'If a recurring workflow stops whenever you step away, you do not have a system yet—you have founder dependency.',
      challenge:
        'Choose one recurring workflow that keeps pulling you back into execution. Define its trigger, owner, decision rule, and review date.',
      create: 'Operating constraint map',
    },
    missions: [
      {
        key: 'scale-systems',
        number: 1,
        title: 'Build scalable systems',
        duration: '20 min',
        founder: 'Founder field note: Shopify',
        principle: 'Systems protect focus as the company becomes more complex.',
        framework: 'Operating constraint map',
        artefact: 'Growth operating plan',
        trialIncluded: true,
      },
      {
        key: 'sell-repeatably',
        number: 2,
        title: 'Turn demand into repeatable sales',
        duration: '20 min',
        trialIncluded: false,
      },
      {
        key: 'investor-brief',
        number: 3,
        title: 'Prepare your growth narrative',
        duration: '20 min',
        trialIncluded: false,
      },
    ],
  },
}

const MISSION_DETAILS = Object.values(ACADEMY_PATHS)
  .flatMap((path) => path.missions)
  .reduce((all, mission) => {
    all[mission.key] = mission
    return all
  }, {})

const WORKSHOP_STAGES = [
  {
    key: 'discover',
    number: '00',
    label: 'Discover',
    legacyPath: 'idea',
    question: 'What opportunities could I responsibly investigate?',
    title: 'Discover Opportunities: From Everyday Problems to a Worthwhile Direction',
    description:
      'A serious opportunity-discovery workshop for founders who do not yet know what to build, have too many ideas, or want to learn how to notice meaningful market gaps.',
    duration: '2–6 weeks self-guided · 3–5 days focused workshop',
    capitalFocus:
      'Identify the smallest resources, time, access, and support needed to investigate safely before making a larger commitment.',
    modules: [
      ['0.1', 'Begin with yourself', 'Founder Context Profile', 'Founder Capability and Access Map'],
      ['0.2', 'Learn to notice opportunities', 'Opportunity Signal Guide', 'Friction Shortlist'],
      ['0.3', 'Map your environment', 'Environment and Opportunity Map', 'Opportunity Sources List'],
      ['0.4', 'Observe people, behaviour, and workarounds', 'Daily Observation Log', 'Evidence-Backed Observation Journal'],
      ['0.5', 'Identify problems, needs, gaps, and underused assets', 'Friction Significance Filter', 'Problem Pattern Map'],
      ['0.6', 'Generate multiple opportunity directions', 'Opportunity Bank', '10–30 Raw Opportunity Directions'],
      ['0.7', 'Learn from cases and business models', 'Comparable Business Model Review', 'Case-Learning Notes'],
      ['0.8', 'Connect opportunity to founder access and capability', 'Founder–Opportunity Fit Map', 'Investigation Readiness Notes'],
      ['0.9', 'Compare and filter opportunities', 'Opportunity Comparison Workshop', 'Top Three Opportunity Candidates'],
      ['0.10', 'Select an opportunity to investigate', 'Opportunity Decision Record', 'Chosen Opportunity Hypothesis'],
      ['0.11', 'Build your Explore-stage research plan', 'Explore-Stage Research Plan', 'Research Plan and First Decision Cycle'],
    ].map(([number, title, framework, output]) => ({
      number,
      title,
      framework,
      output,
    })),
    fieldwork: [
      'Complete a seven-day friction challenge.',
      'Observe one real transaction, queue, service interaction, or repeated customer task.',
      'Read customer reviews in one category and tag recurring complaints.',
      'Map where time, money, trust, and frustration move in one local ecosystem.',
      'Speak to one customer, operator, supplier, community member, or local expert.',
    ],
    outputs: [
      'Founder Context Profile',
      'Capability and Access Map',
      'Daily Observation Log',
      'Friction Shortlist',
      'Environment and Opportunity Map',
      'Opportunity Bank',
      'Opportunity Comparison Report',
      'Explore-Stage Research Plan',
    ],
    decisions: [
      'Continue observing',
      'Investigate a customer problem',
      'Compare multiple opportunity directions',
      'Research feasibility before testing',
      'Move into Stage 1: Explore',
    ],
  },
  {
    key: 'explore',
    number: '01',
    label: 'Explore',
    legacyPath: 'idea',
    question: 'Is this opportunity worth pursuing?',
    title: 'Explore a Customer Problem Before You Build',
    description:
      'Turn an opportunity hypothesis into a clear customer, problem, alternatives, assumptions, and evidence plan.',
    modules: [
      ['1.1', 'Define the opportunity', 'Opportunity Statement', 'Specific Opportunity Statement'],
      ['1.2', 'Identify your first customer', 'Customer Segment Map', 'Priority Segment Profile'],
      ['1.3', 'Understand the problem and alternatives', 'Problem and Alternatives Map', 'Customer Problem Evidence Summary'],
      ['1.4', 'Map assumptions and feasibility', 'Assumption Map', 'Prioritised Assumption Map'],
      ['1.5', 'Plan your evidence', 'Evidence Plan', 'Explore Decision Memo'],
    ].map(([number, title, framework, output]) => ({ number, title, framework, output })),
    fieldwork: [
      'Speak to potential customers about their past behaviour.',
      'Map three alternatives or workarounds.',
      'Record assumptions that could make the opportunity unsafe.',
      'Identify sourcing, operating, regulatory, or capital questions.',
    ],
    outputs: [
      'Opportunity Statement',
      'Priority Customer Segment',
      'Alternatives Map',
      'Assumption Map',
      'Value Proposition Hypothesis',
      'Evidence Plan',
    ],
    decisions: ['Move to Test', 'Investigate further', 'Pivot customer, problem, or offer', 'Pause', 'Stop'],
  },
  {
    key: 'test',
    number: '02',
    label: 'Test',
    legacyPath: 'validation',
    question: 'Is there real demand and a workable model?',
    title: 'Test Demand, Value, Price, and Assumptions',
    description:
      'Use interviews, observation, prototypes, pilots, price tests, and evidence logs to learn before investing heavily.',
    modules: [
      ['2.1', 'Conduct customer discovery', 'Non-Leading Interview Guide', 'Interview Evidence Log'],
      ['2.2', 'Test the riskiest assumption', 'Experiment Card', 'Test Design and Decision Rule'],
      ['2.3', 'Build a minimum viable test', 'MVP Test Plan', 'Minimum Viable Test'],
      ['2.4', 'Test value and price', 'Pricing and Willingness-to-Pay Test', 'Price and Value Signals'],
      ['2.5', 'Learn, decide, and iterate', 'Validation Summary', 'Customer Discovery Report'],
    ].map(([number, title, framework, output]) => ({ number, title, framework, output })),
    fieldwork: [
      'Complete customer conversations or observations.',
      'Run one low-risk experiment.',
      'Capture exact customer language and actual behaviour.',
      'Test a price, deposit, pilot, prototype, or commitment where appropriate.',
    ],
    outputs: ['Customer Discovery Report', 'Evidence Matrix', 'MVP Test Plan', 'Experiment Card', 'Pricing Test', 'Validation Summary'],
    decisions: ['Build the operating foundation', 'Retest a different segment or offer', 'Improve evidence quality', 'Pause or stop'],
  },
  {
    key: 'build',
    number: '03',
    label: 'Build',
    legacyPath: 'mvp',
    question: 'Can I create a viable operating foundation?',
    title: 'Build the Venture Foundation',
    description:
      'Connect product or service design, business model, operations, finance, compliance, capital, and launch readiness.',
    modules: [
      ['3.1', 'Design the business model', 'Extended Business Model Canvas', 'Business Model Report'],
      ['3.2', 'Define the offer and delivery model', 'Offer and Operating Model', 'Offer Design and Delivery Plan'],
      ['3.3', 'Build early economics', 'Unit Economics and Startup Cost Model', 'Initial Financial Summary'],
      ['3.4', 'Prepare the operating foundation', 'Build Readiness Checklist', 'Operating Foundation Plan'],
      ['3.5', 'Choose a capital pathway', 'Capital Options Map', 'Use-of-Funds and Next-Milestone Plan'],
    ].map(([number, title, framework, output]) => ({ number, title, framework, output })),
    fieldwork: [
      'Obtain supplier, operating, or cost information.',
      'Map the customer-to-delivery journey.',
      'Identify official requirements and specialist questions.',
      'Create a first economics and cash-exposure view.',
    ],
    outputs: ['Extended Business Model Canvas', 'Offer and Operating Plan', 'Startup Cost Model', 'Unit Economics Summary', 'Capital Options Map', 'Build Readiness Checklist'],
    decisions: ['Prepare to launch', 'Retest economics or customer segment', 'Seek specialist support', 'Choose a capital route'],
  },
  {
    key: 'launch',
    number: '04',
    label: 'Launch',
    legacyPath: 'traction',
    question: 'Can I acquire and serve initial customers repeatedly?',
    title: 'Launch, Learn, and Deliver Consistently',
    description:
      'Turn the offer into a repeatable customer experience with clear acquisition, onboarding, delivery, feedback, and early metrics.',
    modules: [
      ['4.1', 'Build the launch offer', 'Launch Offer Canvas', 'Launch Offer'],
      ['4.2', 'Choose and test channels', 'Channel Map', 'Launch Channel Plan'],
      ['4.3', 'Serve and onboard customers', 'Customer Onboarding Map', 'Customer Experience Plan'],
      ['4.4', 'Track the first signals', 'Launch Metrics Dashboard', 'Launch Evidence Update'],
    ].map(([number, title, framework, output]) => ({ number, title, framework, output })),
    fieldwork: ['Offer the product or service to real customers.', 'Track acquisition, conversion, delivery, and feedback.', 'Document customer questions and operational failures.', 'Review cash received versus cash spent.'],
    outputs: ['Launch Offer', 'Channel Plan', 'Sales Process', 'Customer Onboarding Map', 'Launch Metrics Dashboard'],
    decisions: ['Improve offer or channel', 'Move to Grow', 'Revisit Test or Build', 'Seek sales, marketing, or operations support'],
  },
  {
    key: 'grow',
    number: '05',
    label: 'Grow',
    legacyPath: 'growth',
    question: 'Where should I improve revenue, margin, and repeatability?',
    title: 'Grow the Parts of the Business That Create Value',
    description:
      'Strengthen customer economics, retention, channels, leadership, operating systems, and a strategy that does not depend on the founder alone.',
    modules: [
      ['5.1', 'See where value is created', 'Customer Segment Economics', 'Revenue-by-Segment Strategy'],
      ['5.2', 'Strengthen retention and repeatability', 'Retention and Customer Value Map', 'Retention Plan'],
      ['5.3', 'Improve channels and sales motion', 'Channel Economics and Sales Flow', 'Growth Channel Plan'],
      ['5.4', 'Build leadership and operating systems', 'Operating Constraint Map', 'Growth Operating Plan'],
      ['5.5', 'Plan the next growth milestone', 'Growth Strategy and Capital Plan', 'Growth Decision Cycle'],
    ].map(([number, title, framework, output]) => ({ number, title, framework, output })),
    fieldwork: ['Segment revenue and cost by customer, channel, product, or service line.', 'Review repeat purchase, retention, churn, and referral behaviour.', 'Map recurring founder bottlenecks and operating failures.', 'Choose one growth experiment with evidence and economics.'],
    outputs: ['Customer Segment Economics', 'Retention Plan', 'Growth Channel Plan', 'Leadership and Operating Plan', 'Growth Strategy', 'Growth Capital Options'],
    decisions: ['Optimise the current business', 'Expand into a new market, product, or channel', 'Prepare a capital pathway', 'Revisit customer, offer, or economics assumptions'],
  },
  {
    key: 'expand',
    number: '06',
    label: 'Expand',
    legacyPath: 'growth',
    question: 'Should I enter a market, partner, add a category, export, or seek capital?',
    title: 'Assess New Markets, Partnerships, and Expansion Decisions',
    description:
      'Use structured country, customer, partner, operating, regulatory, economic, and capital analysis before making an expansion commitment.',
    modules: [
      ['6.1', 'Frame the expansion decision', 'Expansion Decision Brief', 'Expansion Question and Scope'],
      ['6.2', 'Study the new market', 'Country and Market Screen', 'Market Opportunity Assessment'],
      ['6.3', 'Assess partners and operating route', 'Partner and Route-to-Market Scorecard', 'Partner Recommendation'],
      ['6.4', 'Understand local feasibility', 'Market Entry Feasibility Checklist', 'Expansion Risk and Requirements Map'],
      ['6.5', 'Model economics and capital need', 'Expansion Economics Scenario', 'Expansion Decision Pack'],
    ].map(([number, title, framework, output]) => ({ number, title, framework, output })),
    fieldwork: ['Speak to local customers, partners, suppliers, or advisers.', 'Review official regulatory, licensing, and tax sources.', 'Compare market-entry routes and partner incentives.', 'Create downside, base, and upside expansion scenarios.'],
    outputs: ['Country and Market Screen', 'Partner Scorecard', 'Market Entry Checklist', 'Expansion Economics', 'Expansion Decision Pack'],
    decisions: ['Run a market test', 'Choose a partner route', 'Delay entry', 'Prepare expansion capital materials'],
  },
  {
    key: 'optimise',
    number: '07',
    label: 'Optimise',
    legacyPath: 'growth',
    question: 'Can the business create value beyond the founder?',
    title: 'Build Resilience, Governance, Profitability, and Company Value',
    description:
      'Strengthen reporting, controls, processes, leadership, profitability, compliance, and operating discipline.',
    modules: [
      ['7.1', 'Build the operating system', 'SOP and Operating Rhythm Builder', 'Operating System Map'],
      ['7.2', 'Improve profitability and cash discipline', 'Profitability and Cash Review', 'Profit Improvement Plan'],
      ['7.3', 'Strengthen risk and governance', 'Governance and Risk Register', 'Governance Maturity Plan'],
      ['7.4', 'Build leadership bench and resilience', 'Leadership Bench Plan', 'Resilience and Capability Plan'],
    ].map(([number, title, framework, output]) => ({ number, title, framework, output })),
    fieldwork: ['Document one recurring workflow and its owner.', 'Review cash, margin, and operating bottlenecks.', 'Update the risk register and mitigation owners.', 'Identify one founder dependency to reduce.'],
    outputs: ['Operating System Map', 'Profit Improvement Plan', 'Governance and Risk Register', 'Leadership Bench Plan', 'Company Value Driver Review'],
    decisions: ['Prepare for expansion', 'Prepare for transition', 'Improve resilience before growth', 'Seek specialist support'],
  },
  {
    key: 'transition',
    number: '08',
    label: 'Transition',
    legacyPath: 'growth',
    question: 'What ownership or transaction path fits the company?',
    title: 'Prepare for Succession, Sale, Merger, Acquisition, or Private Equity',
    description:
      'Clarify owner goals, build transaction readiness, organise diligence materials, understand company value drivers, and prepare for professional advice.',
    modules: [
      ['8.1', 'Clarify owner goals and transition options', 'Owner Goals and Transition Options', 'Transition Direction'],
      ['8.2', 'Understand company value drivers', 'Value Driver Assessment', 'Value Improvement Plan'],
      ['8.3', 'Prepare governance and financial readiness', 'Transaction Readiness Review', 'Readiness Gap Map'],
      ['8.4', 'Organise the data room and adviser brief', 'Data Room Checklist and Adviser Brief', 'Transition Readiness Pack'],
    ].map(([number, title, framework, output]) => ({ number, title, framework, output })),
    fieldwork: ['Clarify owner and stakeholder goals.', 'Review financial, legal, operational, customer, and governance records.', 'Identify missing documents and key risks.', 'Prepare questions for advisers.'],
    outputs: ['Owner Goals Statement', 'Value Driver Assessment', 'Transaction Readiness Review', 'Data Room Checklist', 'Adviser Brief', 'Transition Readiness Pack'],
    decisions: ['Continue building value', 'Prepare succession', 'Begin adviser conversations', 'Prepare a sale, merger, acquisition, or PE process'],
  },
]

const LEGACY_STAGE_TO_WORKSHOP = {
  idea: 'discover',
  validation: 'test',
  mvp: 'build',
  traction: 'launch',
  growth: 'grow',
  traction_growth: 'grow',
}

const EMPTY_WORK = {
  reflection: '',
  problemOne: '',
  problemTwo: '',
  problemThree: '',
  decision: '',
  evidenceUrl: '',
  evidenceName: '',
  status: 'learned',
}

const STATUS_OPTIONS = [
  { value: 'learned', label: 'Learned', description: 'I understand the mission.' },
  { value: 'applied', label: 'Applied', description: 'I completed the action.' },
  { value: 'evidence-backed', label: 'Evidence-backed', description: 'I have notes, a link, or a document.' },
]

function SectionLabel({ children, tone = 'lilac' }) {
  const colors = {
    lilac: 'var(--lilac-700, #694FB2)',
    green: 'var(--green-700, #1A704D)',
    muted: 'var(--text-faint, #899089)',
  }

  return (
    <div
      style={{
        color: colors[tone],
        fontSize: 10,
        fontWeight: 850,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        marginBottom: 7,
      }}
    >
      {children}
    </div>
  )
}

function Button({ children, onClick, variant = 'primary', disabled = false, style = {} }) {
  const styles = {
    primary: {
      background: 'var(--green-700, #1A704D)',
      color: '#FFFFFF',
      border: '1px solid var(--green-700, #1A704D)',
    },
    secondary: {
      background: 'var(--surface, #FFFFFF)',
      color: 'var(--text-soft, #5D635D)',
      border: '1px solid var(--border, #DDE2DC)',
    },
    lilac: {
      background: 'var(--lilac-050, #F8F6FF)',
      color: 'var(--lilac-800, #5B449D)',
      border: '1px solid var(--lilac-200, #DED5F6)',
    },
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        ...styles[variant],
        borderRadius: 10,
        padding: '10px 13px',
        fontSize: 12,
        fontWeight: 850,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function JournalField({ label, hint, value, onChange, placeholder, rows = 4 }) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          marginBottom: 5,
          color: 'var(--text, #151614)',
          fontSize: 12.5,
          fontWeight: 800,
        }}
      >
        {label}
      </label>
      {hint ? (
        <div
          style={{
            marginBottom: 7,
            color: 'var(--text-soft, #5D635D)',
            fontSize: 11.5,
            lineHeight: 1.55,
          }}
        >
          {hint}
        </div>
      ) : null}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid var(--border, #DDE2DC)',
          borderRadius: 11,
          padding: 11,
          background: 'var(--surface, #FFF)',
          color: 'var(--text, #151614)',
          resize: 'vertical',
          fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
          fontSize: 12.5,
          lineHeight: 1.55,
        }}
      />
    </div>
  )
}

function getVentureName(profile) {
  return (
    profile?.venturename ||
    profile?.venture_name ||
    profile?.company_name ||
    profile?.foundername ||
    'Your venture'
  )
}

function normaliseWork(row) {
  const content = row?.content && typeof row.content === 'object' ? row.content : {}
  return {
    ...EMPTY_WORK,
    ...content,
    evidenceUrl: row?.evidence_url || content.evidenceUrl || '',
    evidenceName: row?.evidence_name || content.evidenceName || '',
    status: row?.status || content.status || 'learned',
  }
}

function statusColor(status) {
  if (status === 'evidence-backed') {
    return {
      bg: 'var(--green-100, #E9F4EC)',
      border: 'rgba(26,112,77,.22)',
      text: 'var(--green-800, #15563E)',
    }
  }
  if (status === 'applied') {
    return {
      bg: 'var(--lilac-050, #F8F6FF)',
      border: 'var(--lilac-200, #DED5F6)',
      text: 'var(--lilac-800, #5B449D)',
    }
  }
  return {
    bg: 'var(--surface-soft, #F8F9F6)',
    border: 'var(--border, #DDE2DC)',
    text: 'var(--text-soft, #5D635D)',
  }
}

function normalisePathKey(raw) {
  const key = String(raw || '').toLowerCase()
  if (ACADEMY_PATHS[key]) return key
  if (key === 'traction_growth' || key === 'tractionstage' || key === 'traction-stage') return 'traction'
  if (key === 'growthstage' || key === 'growth-stage') return 'growth'
  if (key === 'discover' || key === 'explore') return 'idea'
  if (key === 'test') return 'validation'
  if (key === 'build') return 'mvp'
  if (key === 'launch') return 'traction'
  if (key === 'grow' || key === 'expand' || key === 'optimise' || key === 'transition') return 'growth'
  return 'idea'
}

function getWorkshopStage(key) {
  return WORKSHOP_STAGES.find((stage) => stage.key === key) || WORKSHOP_STAGES[0]
}

function getWorkshopStageFromLegacyPath(path) {
  return getWorkshopStage(LEGACY_STAGE_TO_WORKSHOP[path] || 'discover')
}

export default function Academy() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useDiagnosticStore((state) => state.user)
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const assessmentResults = useDiagnosticStore((state) => state.assessmentResults)
  const stageAssessment = useDiagnosticStore((state) => state.stageAssessment)
  const investorReadyPercent = useDiagnosticStore((state) => state.investorReadyPercent)
  const diagnosedStage = useDiagnosticStore((state) => state.diagnosedStage)
  const vulnerabilityFlags = useDiagnosticStore((state) => state.vulnerabilityFlags || [])

  const rawStagePath =
    assessmentResults?.recommendedacademypath ||
    stageAssessment?.recommendedAcademyPath ||
    diagnosedStage ||
    stageAssessment?.diagnosedStage ||
    assessmentResults?.venturestageresult ||
    'idea'

  const recommendedPath = normalisePathKey(rawStagePath)
  const selectedLegacyPath = searchParams.get('stage')
  const selectedPath = selectedLegacyPath && ACADEMY_PATHS[selectedLegacyPath]
    ? selectedLegacyPath
    : recommendedPath
  const path = ACADEMY_PATHS[selectedPath]
  const recommendedWorkshopStage = getWorkshopStageFromLegacyPath(recommendedPath)
  const workshopParam = searchParams.get('workshop')
  const selectedWorkshopStage = workshopParam ? getWorkshopStage(workshopParam) : null

  const configuredKeys =
    assessmentResults?.recommendedmissionkeys ||
    stageAssessment?.recommendedMissionKeys ||
    []

  const recommendedMissions =
    selectedPath === recommendedPath && configuredKeys.length
      ? path.missions.filter((mission) => configuredKeys.includes(mission.key))
      : path.missions.slice(0, 3)

  const activeMissionKey = searchParams.get('mission')
  const activeMission = activeMissionKey ? MISSION_DETAILS[activeMissionKey] : null
  const ventureName = getVentureName(founderProfile)

  const [work, setWork] = useState(EMPTY_WORK)
  const [versions, setVersions] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [fieldNoteOpen, setFieldNoteOpen] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)

  const latestVersion = Number(versions[0]?.version || 0)
  const progress = useMemo(() => {
    const completed = work.status === 'evidence-backed' ? 3 : work.status === 'applied' ? 2 : 1
    return Math.round((completed / 3) * 100)
  }, [work.status])

  useEffect(() => {
    if (!['opportunity-foundations', 'notice-friction'].includes(activeMissionKey) || !user?.id) return
    let mounted = true

    async function loadJournal() {
      setLoading(true)
      setError('')
      const { data, error: loadError } = await supabase
        .from('founder_working_journal')
        .select('*')
        .eq('founder_id', user.id)
        .eq('mission_key', activeMissionKey)
        .order('version', { ascending: false })

      if (!mounted) return
      if (loadError) {
        setError('Your journal could not be loaded. Create the founder_working_journal table before saving Academy work.')
      } else {
        setVersions(data || [])
        setWork(data?.[0] ? normaliseWork(data[0]) : EMPTY_WORK)
      }
      setLoading(false)
    }

    loadJournal()
    return () => {
      mounted = false
    }
  }, [activeMissionKey, user?.id])

  function updateWork(field, value) {
    setWork((current) => ({ ...current, [field]: value }))
    setNotice('')
  }

  function goHome() {
    setSearchParams(selectedPath === recommendedPath ? {} : { stage: selectedPath })
    setError('')
    setNotice('')
  }

  function openMission(key) {
    setFieldNoteOpen(false)
    setVideoOpen(false)
    setSearchParams({ stage: selectedPath, mission: key })
  }

  function openMissionForStage(stageKey, missionKey) {
    setFieldNoteOpen(false)
    setVideoOpen(false)
    setSearchParams({ stage: stageKey, mission: missionKey })
  }

  function openStage(key) {
    setFieldNoteOpen(false)
    setVideoOpen(false)
    setSearchParams({ stage: key })
  }

  function openWorkshop(key) {
    setFieldNoteOpen(false)
    setVideoOpen(false)
    setSearchParams({ workshop: key })
  }

  function openResources(stage = selectedWorkshopStage?.key || selectedPath) {
    navigate(`/app/resources?stage=${encodeURIComponent(stage)}`)
  }

  async function uploadEvidence(event) {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return
    setUploading(true)
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80)
      const filePath = `${user.id}/${activeMissionKey}/${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage
        .from('academy-evidence')
        .upload(filePath, file, { upsert: false })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('academy-evidence').getPublicUrl(filePath)
      updateWork('evidenceUrl', data.publicUrl)
      updateWork('evidenceName', file.name)
      setNotice('Evidence uploaded. Save your journal to create a versioned record.')
    } catch {
      setError('The file could not be uploaded. Confirm the academy-evidence bucket and upload policy exist.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function saveJournal() {
    if (!user?.id || !activeMission) {
      setError('Sign in and choose a mission before saving.')
      return
    }
    setSaving(true)
    setError('')
    const payload = {
      founder_id: user.id,
      mission_key: activeMission.key,
      mission_title: activeMission.title,
      course_key: COURSE.key,
      venture_name: ventureName,
      content: work,
      status: work.status,
      evidence_url: work.evidenceUrl || null,
      evidence_name: work.evidenceName || null,
      version: latestVersion + 1,
      created_at: new Date().toISOString(),
    }
    const { data, error: saveError } = await supabase
      .from('founder_working_journal')
      .insert(payload)
      .select()
      .single()
    if (saveError) {
      setError('Your work could not be saved. Create the founder_working_journal table before saving Academy work.')
    } else {
      setVersions((current) => [data, ...current])
      setNotice(`Saved to your Founder Working Journal as version ${payload.version}.`)
    }
    setSaving(false)
  }

  if (activeMission?.key === 'notice-friction') {
    return (
      <MissionTwo
        work={work}
        updateWork={updateWork}
        progress={progress}
        loadingJournal={loading}
        saving={saving}
        uploading={uploading}
        latestVersion={latestVersion}
        journalVersions={versions}
        notice={notice}
        error={error}
        onBack={goHome}
        onSave={saveJournal}
        onUpload={uploadEvidence}
        completionReady={work.status === 'evidence-backed' && latestVersion > 0}
        onContinue={() => openMission('choose-a-user')}
      />
    )
  }

  if (activeMission?.key === 'opportunity-foundations') {
    return (
      <MissionOne
        work={work}
        updateWork={updateWork}
        progress={progress}
        loading={loading}
        saving={saving}
        uploading={uploading}
        versions={versions}
        latestVersion={latestVersion}
        notice={notice}
        error={error}
        onBack={goHome}
        onSave={saveJournal}
        onUpload={uploadEvidence}
        onContinue={() => openMission('notice-friction')}
      />
    )
  }

  if (activeMission) return <ComingSoonMission mission={activeMission} onBack={goHome} />

  if (selectedWorkshopStage) {
    return (
      <WorkshopStagePanel
        stage={selectedWorkshopStage}
        isRecommended={selectedWorkshopStage.key === recommendedWorkshopStage.key}
        onBack={goHome}
        onOpenResources={() => openResources(selectedWorkshopStage.key)}
        onBrowseFrameworks={() => navigate(`/app/resources?view=frameworks&stage=${selectedWorkshopStage.key}`)}
        onStart={() => {
          if (selectedWorkshopStage.key === 'discover') {
            openMission('opportunity-foundations')
          } else {
            openStage(selectedWorkshopStage.legacyPath || 'idea')
          }
        }}
        onOpenModule={(index) => {
          if (selectedWorkshopStage.key === 'discover' && index === 0) {
            openMission('opportunity-foundations')
          } else if (selectedWorkshopStage.key === 'discover' && index === 1) {
            openMission('notice-friction')
          } else {
            openStage(selectedWorkshopStage.legacyPath || 'idea')
          }
        }}
      />
    )
  }

  const totalMinutes = recommendedMissions.reduce((total, mission) => total + Number.parseInt(mission.duration, 10), 0)

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1160,
        margin: '0 auto',
        fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
        color: 'var(--text, #151614)',
      }}
    >
      <section
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '27px 28px',
          borderRadius: 20,
          background: 'linear-gradient(135deg, #FFFFFF 0%, var(--lilac-050, #F8F6FF) 100%)',
          border: '1px solid var(--lilac-200, #DED5F6)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 16,
        }}
      >
        <div style={{ position: 'absolute', width: 290, height: 290, right: -110, top: -170, borderRadius: 999, border: '1px solid var(--lilac-200, #DED5F6)', opacity: 0.9 }} />
        <div style={{ position: 'absolute', width: 185, height: 185, right: -26, top: -95, borderRadius: 999, border: '1px solid rgba(26,112,77,.16)' }} />
        <div style={{ position: 'relative', maxWidth: 720 }}>
          <SectionLabel>PATH360 ACADEMY · YOUR FOUNDER WORKSHOP</SectionLabel>
          <h1 style={{ maxWidth: 670, margin: '0 0 9px', color: 'var(--text, #151614)', fontSize: 28, fontWeight: 800, letterSpacing: '-.045em', lineHeight: 1.12 }}>
            Build your venture through guided decisions, real-world work, frameworks, evidence, and practical outputs.
          </h1>
          <p style={{ maxWidth: 650, margin: '0 0 18px', color: 'var(--text-soft, #5D635D)', fontSize: 13, lineHeight: 1.65 }}>
            Your current recommended focus is <strong>{recommendedWorkshopStage.label}</strong>. This is not a locked sequence: you can explore every stage, revisit frameworks, and start a new decision cycle whenever your venture changes.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => openWorkshop(recommendedWorkshopStage.key)}>
              Open recommended workshop →
            </Button>
            <Button variant="secondary" onClick={() => openWorkshop('discover')}>
              Explore Discover →
            </Button>
            <Button variant="lilac" onClick={() => navigate('/app/resources?view=frameworks')}>
              Browse framework library →
            </Button>
            <span style={{ color: 'var(--green-800, #15563E)', fontSize: 11.5, fontWeight: 700 }}>
              Current preparedness view: {investorReadyPercent || 0}%
            </span>
          </div>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.45fr) minmax(270px,.75fr)', gap: 16, alignItems: 'start' }}>
        <main style={{ display: 'grid', gap: 16 }}>
          <section className="p360-card" style={{ padding: 20, borderRadius: 18 }}>
            <SectionLabel>YOUR FOUNDER LIFE CYCLE</SectionLabel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: 20, letterSpacing: '-.025em' }}>You can start anywhere and revisit any stage</h2>
              <span className="p360-tag-learning">Recommended: {recommendedWorkshopStage.label}</span>
            </div>
            <p style={{ margin: '0 0 16px', maxWidth: 760, fontSize: 12.5, color: 'var(--text-soft, #5D635D)', lineHeight: 1.6 }}>
              PATH360 is a non-linear workshop environment. Each stage contains deep pathways, lessons, frameworks, exercises, fieldwork, evidence, decisions, documents, resources, and support routes.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
              {WORKSHOP_STAGES.map((stage) => {
                const recommended = stage.key === recommendedWorkshopStage.key
                return (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => openWorkshop(stage.key)}
                    style={{
                      minHeight: 108,
                      textAlign: 'left',
                      padding: 12,
                      borderRadius: 13,
                      border: recommended ? '1px solid var(--green-700, #1A704D)' : '1px solid var(--border, #DDE2DC)',
                      background: recommended ? 'var(--green-050, #F4FAF6)' : 'var(--surface-soft, #F8F9F6)',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ color: recommended ? 'var(--green-700, #1A704D)' : 'var(--text-faint, #899089)', fontSize: 10, fontWeight: 850, letterSpacing: '.09em', textTransform: 'uppercase', marginBottom: 7 }}>
                      Stage {stage.number}
                    </div>
                    <div style={{ color: 'var(--text, #151614)', fontSize: 13, fontWeight: 850, marginBottom: 5 }}>{stage.label}</div>
                    <div style={{ color: 'var(--text-soft, #5D635D)', fontSize: 10.5, lineHeight: 1.35 }}>{stage.question}</div>
                    {recommended ? <div style={{ marginTop: 8, color: 'var(--green-700, #1A704D)', fontSize: 10, fontWeight: 850 }}>Recommended focus</div> : null}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="p360-card" style={{ padding: 20, borderRadius: 18 }}>
            <SectionLabel>YOUR ACTIVE WORKSHOP PATH</SectionLabel>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 15 }}>
              <h2 style={{ margin: 0, fontSize: 19, letterSpacing: '-.025em' }}>{path.title}</h2>
              <span className="p360-tag-learning">Connected to your current assessment</span>
            </div>
            <div style={{ display: 'grid', gap: 9 }}>
              {recommendedMissions.map((mission) => (
                <LessonCard key={mission.key} mission={mission} onOpen={() => openMission(mission.key)} onResources={() => openResources(selectedPath)} />
              ))}
            </div>
          </section>

          <FieldNote path={path} isOpen={fieldNoteOpen} videoOpen={videoOpen} onToggle={() => setFieldNoteOpen((current) => !current)} onWatch={() => setVideoOpen((current) => !current)} />

          {vulnerabilityFlags.length > 0 ? (
            <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
              <SectionLabel tone="muted">CURRENT EVIDENCE AND EXECUTION RISKS</SectionLabel>
              <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--text-soft, #5D635D)', lineHeight: 1.6 }}>
                These are not failure labels. They show where a decision, framework, evidence record, or expert conversation may make the greatest difference now.
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                {vulnerabilityFlags.map((flag) => (
                  <div key={flag.key} style={{ padding: 10, borderRadius: 10, border: '1px solid rgba(139,32,32,.25)', background: '#FDEAEA' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#8B2020', marginBottom: 4 }}>{flag.title}</div>
                    <div style={{ fontSize: 11.5, color: '#8B2020', marginBottom: 8 }}>{flag.description}</div>
                    <Button variant="secondary" onClick={() => {
                      if (flag.key === 'over_engineering_trap') openMissionForStage('validation', 'interview-without-pitching')
                      else if (flag.key === 'leaky_bucket_trap') openMissionForStage('traction', 'ready-to-scale')
                      else openWorkshop(recommendedWorkshopStage.key)
                    }} style={{ padding: '6px 10px', fontSize: 11 }}>
                      Focus on this now →
                    </Button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </main>

        <aside style={{ display: 'grid', gap: 16 }}>
          <section style={{ borderRadius: 18, padding: 18, background: 'var(--green-050, #F4FAF6)', border: '1px solid rgba(26,112,77,.18)' }}>
            <SectionLabel tone="green">FOUNDER WORKING JOURNAL</SectionLabel>
            <div style={{ fontSize: 16, fontWeight: 850, marginBottom: 6 }}>Your work becomes venture intelligence.</div>
            <p style={{ margin: '0 0 14px', fontSize: 12, lineHeight: 1.6, color: 'var(--text-soft, #5D635D)' }}>
              Every evidence-backed mission creates a founder-owned artefact you can revisit and later use in PATH360 Studio, Reports, and your wider venture record.
            </p>
            <Button variant="secondary" onClick={() => openMission('opportunity-foundations')} style={{ width: '100%' }}>Open your journal →</Button>
          </section>

          <section style={{ borderRadius: 18, padding: 18, background: 'var(--lilac-050, #F8F6FF)', border: '1px solid var(--lilac-200, #DED5F6)' }}>
            <SectionLabel>EXPLORE WITHOUT LIMITS</SectionLabel>
            <div style={{ fontSize: 16, fontWeight: 850, marginBottom: 6 }}>Frameworks, cases, resources, and real work.</div>
            <p style={{ margin: '0 0 14px', fontSize: 12, lineHeight: 1.6, color: 'var(--text-soft, #5D635D)' }}>
              The Academy is a workshop system. Use the full life-cycle map to explore related tools, cases, resources, and decision routes beyond your current focus.
            </p>
            <Button variant="lilac" onClick={() => navigate('/app/resources?view=frameworks')} style={{ width: '100%' }}>Browse framework library →</Button>
          </section>

          <section className="p360-learning-surface" style={{ padding: 18 }}>
            <SectionLabel>CURATED FIELD NOTE</SectionLabel>
            <div style={{ fontSize: 15, fontWeight: 850, color: 'var(--text, #151614)', marginBottom: 7 }}>{path.resource}</div>
            <p style={{ margin: 0, fontSize: 12, color: 'var(--text-soft, #5D635D)', lineHeight: 1.6 }}>{path.fieldNote.borrow}</p>
            <button type="button" onClick={() => setFieldNoteOpen(true)} style={{ marginTop: 13, padding: 0, border: 0, background: 'transparent', color: 'var(--lilac-800, #5B449D)', fontSize: 11.5, fontWeight: 850, cursor: 'pointer' }}>Read the field note →</button>
          </section>

          <section style={{ padding: '14px 15px', border: '1px solid var(--border, #DDE2DC)', borderRadius: 15, background: 'var(--surface, #FFF)' }}>
            <div style={{ color: 'var(--text-faint, #899089)', fontSize: 10, fontWeight: 850, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 4 }}>Your active path</div>
            <div style={{ color: 'var(--text-soft, #5D635D)', fontSize: 11.5, lineHeight: 1.55 }}>
              {path.label} · {recommendedMissions.length} current starter missions · about {totalMinutes} minutes of structured work before you decide what matters next.
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function WorkshopStagePanel({ stage, isRecommended, onBack, onStart, onOpenModule, onOpenResources, onBrowseFrameworks }) {
  return (
    <div style={{ padding: 24, maxWidth: 1160, margin: '0 auto', fontFamily: 'var(--font-sans, DM Sans, sans-serif)', color: 'var(--text, #151614)' }}>
      <button type="button" onClick={onBack} style={{ border: 0, padding: 0, marginBottom: 14, background: 'transparent', color: 'var(--lilac-700, #694FB2)', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>← Back to Founder Workshop</button>
      <section style={{ padding: '28px 28px', borderRadius: 20, background: 'linear-gradient(135deg, #FFFFFF 0%, var(--lilac-050, #F8F6FF) 100%)', border: '1px solid var(--lilac-200, #DED5F6)', marginBottom: 16 }}>
        <SectionLabel>STAGE {stage.number} · {stage.label.toUpperCase()} WORKSHOP</SectionLabel>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 760 }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 30, letterSpacing: '-.045em', lineHeight: 1.12 }}>{stage.title}</h1>
            <p style={{ margin: '0 0 10px', color: 'var(--text-soft, #5D635D)', fontSize: 13.5, lineHeight: 1.7 }}>{stage.description}</p>
            <div style={{ color: 'var(--green-800, #15563E)', fontSize: 11.5, fontWeight: 750 }}>Founder question: {stage.question}</div>
            {stage.duration ? <div style={{ marginTop: 5, color: 'var(--text-faint, #899089)', fontSize: 11.5 }}>Suggested pace: {stage.duration}</div> : null}
          </div>
          {isRecommended ? <span style={{ padding: '8px 10px', borderRadius: 999, background: 'var(--green-100, #E9F4EC)', color: 'var(--green-800, #15563E)', border: '1px solid rgba(26,112,77,.18)', fontSize: 11, fontWeight: 850 }}>Recommended current focus</span> : null}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 18 }}>
          <Button variant="primary" onClick={onStart}>Start this workshop →</Button>
          <Button variant="secondary" onClick={onOpenResources}>View stage resources →</Button>
          <Button variant="lilac" onClick={onBrowseFrameworks}>Browse related frameworks →</Button>
        </div>
      </section>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.45fr) minmax(270px,.75fr)', gap: 16, alignItems: 'start' }}>
        <main style={{ display: 'grid', gap: 16 }}>
          <section className="p360-card" style={{ padding: 20, borderRadius: 18 }}>
            <SectionLabel>WORKSHOP MODULES</SectionLabel>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, letterSpacing: '-.025em' }}>Work through the questions that matter before moving forward</h2>
            <p style={{ margin: '0 0 16px', color: 'var(--text-soft, #5D635D)', fontSize: 12.5, lineHeight: 1.6 }}>This is a working programme—not a short course. Each module combines explanation, frameworks, fieldwork, evidence, reflection, and a founder-owned output.</p>
            <div style={{ display: 'grid', gap: 10 }}>
              {stage.modules.map((module, index) => (
                <article key={`${stage.key}-${module.number}`} style={{ display: 'grid', gridTemplateColumns: '46px minmax(0,1fr) auto', gap: 12, alignItems: 'center', padding: '14px 13px', border: '1px solid var(--border, #DDE2DC)', borderRadius: 14, background: 'var(--surface, #FFFFFF)' }}>
                  <div style={{ width: 36, height: 36, display: 'grid', placeItems: 'center', borderRadius: 999, background: 'var(--green-700, #1A704D)', color: '#FFFFFF', fontSize: 10, fontWeight: 850 }}>{module.number}</div>
                  <div>
                    <div style={{ color: 'var(--text, #151614)', fontSize: 13, fontWeight: 850 }}>{module.title}</div>
                    <div style={{ marginTop: 5, color: 'var(--lilac-800, #5B449D)', fontSize: 10.7, fontWeight: 800 }}>Framework: {module.framework}</div>
                    <div style={{ marginTop: 3, color: 'var(--green-800, #15563E)', fontSize: 10.7, fontWeight: 800 }}>Create: {module.output}</div>
                  </div>
                  <button type="button" onClick={() => onOpenModule(index)} style={{ border: 0, padding: '5px 2px', background: 'transparent', color: 'var(--green-700, #1A704D)', fontSize: 11, fontWeight: 850, cursor: 'pointer', whiteSpace: 'nowrap' }}>Open →</button>
                </article>
              ))}
            </div>
          </section>
          <section className="p360-card" style={{ padding: 20, borderRadius: 18 }}>
            <SectionLabel>FIELDWORK</SectionLabel>
            <h2 style={{ margin: '0 0 10px', fontSize: 18 }}>Take the work into the real world</h2>
            <div style={{ display: 'grid', gap: 8 }}>
              {stage.fieldwork.map((item) => <div key={item} style={{ display: 'flex', gap: 9, padding: '10px 11px', borderRadius: 11, background: 'var(--surface-soft, #F8F9F6)', border: '1px solid var(--border, #DDE2DC)', color: 'var(--text-soft, #5D635D)', fontSize: 12, lineHeight: 1.5 }}><span style={{ color: 'var(--green-700, #1A704D)', fontWeight: 900 }}>→</span>{item}</div>)}
            </div>
          </section>
        </main>
        <aside style={{ display: 'grid', gap: 16 }}>
          <section style={{ padding: 18, borderRadius: 18, background: 'var(--green-050, #F4FAF6)', border: '1px solid rgba(26,112,77,.18)' }}>
            <SectionLabel tone="green">WHAT YOU WILL LEAVE WITH</SectionLabel>
            <div style={{ display: 'grid', gap: 8 }}>{stage.outputs.map((item) => <div key={item} style={{ color: 'var(--text-soft, #5D635D)', fontSize: 12, lineHeight: 1.45 }}><span style={{ marginRight: 7, color: 'var(--green-700, #1A704D)', fontWeight: 900 }}>✓</span>{item}</div>)}</div>
          </section>
          <section style={{ padding: 18, borderRadius: 18, background: 'var(--lilac-050, #F8F6FF)', border: '1px solid var(--lilac-200, #DED5F6)' }}>
            <SectionLabel>DECISION ROUTES</SectionLabel>
            <p style={{ margin: '0 0 10px', color: 'var(--text-soft, #5D635D)', fontSize: 12, lineHeight: 1.55 }}>PATH360 does not force one outcome. Evidence determines the next useful route.</p>
            <div style={{ display: 'grid', gap: 7 }}>{stage.decisions.map((item) => <div key={item} style={{ padding: '9px 10px', borderRadius: 10, background: '#FFFFFF', border: '1px solid var(--lilac-200, #DED5F6)', color: 'var(--lilac-800, #5B449D)', fontSize: 11.5, fontWeight: 750 }}>{item}</div>)}</div>
          </section>
          <section className="p360-learning-surface" style={{ padding: 18 }}>
            <SectionLabel>CAPITAL & OPPORTUNITY FOCUS</SectionLabel>
            <p style={{ margin: 0, color: 'var(--text-soft, #5D635D)', fontSize: 12, lineHeight: 1.6 }}>{stage.capitalFocus || 'Identify the resources, support, and evidence needed for the next credible milestone before choosing a capital route.'}</p>
          </section>
        </aside>
      </div>
    </div>
  )
}

function LessonCard({ mission, onOpen, onResources }) {
  return (
    <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '34px minmax(0,1fr) auto auto', alignItems: 'center', gap: 12, padding: '13px 12px', background: 'var(--surface, #FFF)', border: '1px solid var(--border, #DDE2DC)', borderRadius: 13, boxSizing: 'border-box' }}>
      <span style={{ width: 29, height: 29, display: 'grid', placeItems: 'center', borderRadius: 999, background: 'var(--green-700, #1A704D)', color: '#FFF', fontSize: 11, fontWeight: 850 }}>{String(mission.number).padStart(2, '0')}</span>
      <button type="button" onClick={onOpen} style={{ minWidth: 0, padding: 0, border: 0, background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
        <span style={{ display: 'block', color: 'var(--text, #151614)', fontSize: 13, fontWeight: 850 }}>{mission.title}</span>
        <span style={{ display: 'block', marginTop: 3, color: 'var(--text-faint, #899089)', fontSize: 10.8 }}>{mission.founder || 'Founder practice'} · {mission.framework || 'Full lesson'} · {mission.duration}</span>
        {mission.artefact ? <span style={{ display: 'block', marginTop: 4, color: 'var(--green-800, #15563E)', fontSize: 10.8, fontWeight: 750 }}>Create: {mission.artefact}</span> : null}
      </button>
      <button type="button" onClick={onResources} style={{ border: 0, padding: '5px 2px', background: 'transparent', color: 'var(--lilac-800, #5B449D)', fontSize: 10.5, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>Resources</button>
      <button type="button" onClick={onOpen} style={{ border: 0, padding: '5px 2px', background: 'transparent', color: 'var(--green-700, #1A704D)', fontSize: 11.5, fontWeight: 850, cursor: 'pointer', whiteSpace: 'nowrap' }}>Begin →</button>
    </div>
  )
}

function FieldNote({ path, isOpen, videoOpen, onToggle, onWatch }) {
  const note = path.fieldNote
  return (
    <section className="p360-field-note">
      <div className="p360-field-note-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start' }}>
        <div>
          <SectionLabel>FOUNDER FIELD NOTE · {path.label} STAGE</SectionLabel>
          <h2 style={{ margin: '0 0 5px', color: 'var(--text, #151614)', fontSize: 20, letterSpacing: '-.03em' }}>{note.company}: {note.title}</h2>
          <div style={{ color: 'var(--lilac-800, #5B449D)', fontSize: 11, fontWeight: 800 }}>{note.readTime} · Story, principle, and field challenge</div>
        </div>
        <Button variant="lilac" onClick={onToggle} style={{ flexShrink: 0, padding: '8px 10px' }}>{isOpen ? 'Close note' : 'Read note →'}</Button>
      </div>
      {isOpen ? (
        <div className="p360-field-note-body">
          <h3>Context</h3><p>{note.context}</p>
          <h3>What happened</h3><p>{note.happened}</p>
          <h3>The turning point</h3><p>{note.turningPoint}</p>
          <h3>What to borrow</h3><p>{note.borrow}</p>
          <h3>Try this this week</h3><p>{note.challenge}</p>
          <div className="p360-field-note-create">Create: {note.create}</div>
          <div style={{ marginTop: 14, padding: 14, border: '1px solid var(--lilac-200, #DED5F6)', borderRadius: 12, background: 'var(--lilac-050, #F8F6FF)' }}>
            <SectionLabel>LEARN WITH CONTEXT</SectionLabel>
            <div style={{ color: 'var(--text, #151614)', fontSize: 13, fontWeight: 850, marginBottom: 4 }}>{path.video.title}</div>
            <p style={{ margin: '0 0 11px', color: 'var(--text-soft, #5D635D)', fontSize: 12, lineHeight: 1.55 }}>Focus on: {path.video.watchFor}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}><Button variant="lilac" onClick={onWatch}>{videoOpen ? 'Hide resource link' : 'Open learning resource →'}</Button><span style={{ color: 'var(--lilac-800, #5B449D)', fontSize: 10.5, fontWeight: 750 }}>{path.video.duration}</span></div>
            {videoOpen ? <div style={{ marginTop: 11, paddingTop: 11, borderTop: '1px solid var(--lilac-200, #DED5F6)' }}><a href={path.video.searchUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--green-700, #1A704D)', fontSize: 12, fontWeight: 850 }}>Open the curated article or video ↗</a><div style={{ marginTop: 6, color: 'var(--text-faint, #899089)', fontSize: 10.5, lineHeight: 1.45 }}>The resource opens in a separate tab so the Academy working space stays focused.</div></div> : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function MissionOne({ work, updateWork, progress, loading, saving, uploading, versions, latestVersion, notice, error, onBack, onSave, onUpload, onContinue }) {
  const complete = work.status === 'evidence-backed' && latestVersion > 0
  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
      <button type="button" onClick={onBack} style={{ border: 0, padding: 0, marginBottom: 14, background: 'transparent', color: 'var(--lilac-700, #694FB2)', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>← Back to Founder Workshop</button>
      <header style={{ padding: '21px 22px', borderRadius: 18, background: 'linear-gradient(135deg, #FFFFFF 0%, var(--lilac-050, #F8F6FF) 100%)', border: '1px solid var(--lilac-200, #DED5F6)', marginBottom: 18 }}>
        <SectionLabel>STAGE 0 · DISCOVER · MODULE 0.1</SectionLabel>
        <h1 style={{ margin: '0 0 7px', color: 'var(--text, #151614)', fontSize: 25, letterSpacing: '-.035em' }}>You do not need a perfect idea to begin</h1>
        <p style={{ margin: 0, maxWidth: 680, color: 'var(--text-soft, #5D635D)', fontSize: 13, lineHeight: 1.7 }}>The earliest useful founder work is not defending a solution. It is noticing a real problem clearly enough to investigate it.</p>
      </header>
      {error ? <div style={{ marginBottom: 14, padding: 12, borderRadius: 11, background: '#FDEAEA', color: '#8B2020', fontSize: 12.5 }}>{error}</div> : null}
      {notice ? <div style={{ marginBottom: 14, padding: 12, borderRadius: 11, background: 'var(--green-100, #E9F4EC)', color: 'var(--green-800, #15563E)', fontSize: 12.5 }}>{notice}</div> : null}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 255px', gap: 18, alignItems: 'start' }}>
        <main style={{ display: 'grid', gap: 18 }}>
          <section className="p360-learning-surface" style={{ padding: 18 }}><SectionLabel>WHY THIS MATTERS</SectionLabel><h2 style={{ margin: '0 0 8px', fontSize: 17 }}>Start with what people actually do</h2><p style={{ margin: 0, color: 'var(--text-soft, #5D635D)', fontSize: 13, lineHeight: 1.75 }}>Strong ventures often begin with an unmet need, recurring workaround, delay, cost, or frustration. Record what you saw and who experiences it before trying to prove your solution is right.</p></section>
          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}><SectionLabel>REFLECT</SectionLabel><JournalField label="What friction or problem keeps catching your attention?" hint="Describe the situation before describing your product or solution." value={work.reflection} onChange={(event) => updateWork('reflection', event.target.value)} placeholder="I keep noticing that…" /></section>
          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}><SectionLabel>FIELD CHALLENGE</SectionLabel><h2 style={{ margin: '0 0 8px', fontSize: 17 }}>Record three observed friction points</h2><div style={{ display: 'grid', gap: 12 }}><JournalField label="Observation 1" value={work.problemOne} onChange={(event) => updateWork('problemOne', event.target.value)} placeholder="For example: I watched…" rows={3} /><JournalField label="Observation 2" value={work.problemTwo} onChange={(event) => updateWork('problemTwo', event.target.value)} placeholder="Another friction point I noticed…" rows={3} /><JournalField label="Observation 3" value={work.problemThree} onChange={(event) => updateWork('problemThree', event.target.value)} placeholder="A third pattern or workaround…" rows={3} /></div></section>
          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}><SectionLabel>EVIDENCE</SectionLabel><input value={work.evidenceUrl} onChange={(event) => updateWork('evidenceUrl', event.target.value)} placeholder="Paste an evidence or document link" type="url" style={{ width: '100%', boxSizing: 'border-box', height: 42, borderRadius: 10, border: '1px solid var(--border, #DDE2DC)', padding: '0 11px' }} /><div style={{ marginTop: 10 }}><label style={{ display: 'inline-flex', border: '1px solid var(--border, #DDE2DC)', borderRadius: 10, padding: '9px 11px', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}><input type="file" onChange={onUpload} disabled={uploading} style={{ display: 'none' }} />{uploading ? 'Uploading…' : 'Upload document'}</label>{work.evidenceName ? <span style={{ marginLeft: 10, fontSize: 11.5 }}>Attached: {work.evidenceName}</span> : null}</div></section>
          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}><SectionLabel>DECIDE</SectionLabel><JournalField label="What do I want to investigate next?" hint="Choose a small learning action, not a large build task." value={work.decision} onChange={(event) => updateWork('decision', event.target.value)} placeholder="Next, I want to investigate whether…" /></section>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}><Button variant="secondary" onClick={onBack}>Save later</Button><Button variant="primary" onClick={onSave} disabled={saving || loading}>{saving ? 'Saving…' : 'Save to Founder Working Journal'}</Button></div>
          {complete ? <MissionCompletionCard title="Module complete" message="You have created your first evidence-backed opportunity record." nextMessage="Next, learn how to separate ordinary complaints from friction worth investigating." buttonLabel="Continue to Module 0.2 →" onContinue={onContinue} /> : null}
        </main>
        <MissionSidebar work={work} updateWork={updateWork} progress={progress} versions={versions} loading={loading} />
      </div>
    </div>
  )
}

function ComingSoonMission({ mission, onBack }) {
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto', fontFamily: 'var(--font-sans, DM Sans, sans-serif)' }}>
      <button type="button" onClick={onBack} style={{ border: 0, padding: 0, marginBottom: 14, background: 'transparent', color: 'var(--lilac-700, #694FB2)', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>← Back to Academy</button>
      <section className="p360-card" style={{ padding: 22, borderRadius: 18 }}><SectionLabel>WORKSHOP MODULE IN DEVELOPMENT</SectionLabel><h1 style={{ margin: '0 0 8px', fontSize: 24, letterSpacing: '-.035em' }}>{mission.title}</h1><p style={{ margin: 0, fontSize: 13, color: 'var(--text-soft, #5D635D)', lineHeight: 1.7 }}>This module is part of the PATH360 founder workshop. Its route, framework, evidence requirements, fieldwork, and exportable output will be added in the next content release.</p></section>
    </div>
  )
}

function MissionSidebar({ work, updateWork, progress, versions, loading }) {
  return (
    <aside style={{ position: 'sticky', top: 18, display: 'grid', gap: 14 }}>
      <section className="p360-card" style={{ padding: 16, borderRadius: 16 }}>
        <SectionLabel>MISSION STATUS</SectionLabel>
        <div className="p360-progress-rail" style={{ marginBottom: 8 }}><span style={{ width: `${progress}%` }} /></div>
        <div style={{ color: 'var(--text-faint, #899089)', fontSize: 11.5, marginBottom: 11 }}>{progress}% of the workflow complete</div>
        {STATUS_OPTIONS.map((option) => {
          const selected = work.status === option.value
          const colors = statusColor(option.value)
          return <button key={option.value} type="button" onClick={() => updateWork('status', option.value)} style={{ width: '100%', textAlign: 'left', marginBottom: 7, padding: 9, borderRadius: 10, border: selected ? `1px solid ${colors.border}` : '1px solid var(--border, #DDE2DC)', background: selected ? colors.bg : 'var(--surface, #FFF)', cursor: 'pointer' }}><div style={{ fontSize: 12, fontWeight: 800, color: selected ? colors.text : 'var(--text, #151614)' }}>{option.label}</div><div style={{ fontSize: 11, color: selected ? colors.text : 'var(--text-soft, #5D635D)' }}>{option.description}</div></button>
        })}
      </section>
      <section className="p360-card" style={{ padding: 16, borderRadius: 16 }}>
        <SectionLabel tone="muted">JOURNAL VERSIONS</SectionLabel>
        {loading ? <div style={{ fontSize: 12 }}>Loading your journal…</div> : versions.length === 0 ? <div style={{ fontSize: 12 }}>Your first save will create a versioned record of this mission.</div> : <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 11.5, color: 'var(--text-soft, #5D635D)' }}>{versions.map((version) => <li key={version.id} style={{ marginBottom: 6 }}>Version {version.version}<span style={{ color: 'var(--text-faint, #899089)' }}> · {new Date(version.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</span></li>)}</ul>}
      </section>
    </aside>
  )
}