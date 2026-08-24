// src/pages/Academy.jsx

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import supabase from '../lib/supabaseClient.js'
import MissionTwo from './MissionTwo.jsx'
import MissionCompletionCard from './MissionCompletionCard.jsx'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

const COURSE = {
  key: 'observation-to-tested-opportunity',
  title: 'PATH360 Academy',
}

const PATH_ORDER = ['idea', 'validation', 'mvp', 'traction', 'growth']

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
        'Airbnb is a marketplace that helps people offer and book short-term stays. Before it became a global platform, its founders were trying to solve a practical problem: people needed a place to stay during busy events, while hosts had spare space but little reason to trust strangers.',
      happened:
        'The early team did not learn the business by sitting far from customers and guessing. They went to hosts, photographed listings themselves, listened to concerns, and noticed the small details that made people hesitate. The work was manual and unglamorous, but it revealed where trust and quality were actually breaking down.',
      turningPoint:
        'Instead of treating the marketplace as an abstract growth problem, the founders treated it as a series of real moments between real people. That proximity helped them improve the experience before trying to scale it.',
      borrow:
        'At the idea stage, your advantage is closeness. If you can see the workaround, delay, frustration, or decision in context, you are less likely to build around an assumption.',
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
        principle:
          'Learn from people close enough to the problem to show you their work.',
        framework: 'Learning-user profile',
        artefact: 'Interview target list',
        trialIncluded: true,
      },
      {
        key: 'map-early-evidence',
        number: 4,
        title: 'Map early evidence',
        duration: '20 min',
        trialIncluded: false,
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
        'Dropbox is a cloud-storage product built around a simple promise: files should stay available across devices without the usual friction of manually moving them. The technical product was difficult to demonstrate before it was fully built.',
      happened:
        'Rather than treating a complete product as the only way to learn, the team used a simple demonstration video to show the intended experience. It gave prospective users something concrete to react to and helped the team see whether the promise itself created meaningful interest.',
      turningPoint:
        'The lesson was not that a video replaces a product. The lesson was to test the uncertainty that matters before investing heavily in the wrong solution. A small test can reveal whether people understand, care about, and will act on a promise.',
      borrow:
        'Validation is not collecting compliments. It is reducing a specific uncertainty with behaviour, commitments, or evidence that would change your next decision.',
      challenge:
        'Name the assumption that would make your next build or growth move unsafe. Design the smallest test that could produce a useful signal this week.',
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
      {
        key: 'define-priorities',
        number: 4,
        title: 'Define your next growth priorities',
        duration: '20 min',
        trialIncluded: false,
      },
    ],
  },

  mvp: {
    label: 'MVP',
    title: 'From evidence to a functioning baseline',
    promise: 'Scope and build your initial core product experience.',
    focus: 'Deliver immediate client utility while tracking behavior signals.',
    resource: 'A founder lesson from Zappos',
    video: {
      title: 'Watch with context: scoping down your MVP',
      duration: '10 min watch',
      searchUrl: 'https://youtube.com',
      watchFor:
        'Notice how top teams cut non-essential features to ship utility within weeks.',
    },
    fieldNote: {
      company: 'Zappos',
      title: 'Fulfill the value manually before writing automation loops',
      readTime: '6 min read',
      context:
        'Zappos proved massive transaction interest by photographing shoes in physical stores, posting them online, and shipping purchases manually through the post office when orders cleared.',
      happened:
        'The team prioritised manual fulfilment to validate demand and learn where value actually lived, long before building full automation.',
      turningPoint:
        'They learned that shipping value manually was the fastest way to see whether the core promise resonated and where to invest next.',
      borrow:
        'Your product layout should prioritise primary human utility over automated infrastructure lines.',
      challenge:
        'Identify the core promise of your SaaS layout. Plan a workflow to deliver it manually for one active business user without writing any new code this week.',
      create: 'MVP roadmap card',
    },
    missions: [
      {
        key: 'scope-minimum-utility',
        number: 1,
        title: 'Scope down to primary utility',
        duration: '20 min',
        founder: 'Founder field note: Zappos',
        principle:
          'Build the thinnest path that fulfills your core promise.',
        framework: 'Feature subtraction filter',
        artefact: 'MVP roadmap card',
        trialIncluded: true,
      },
      {
        key: 'track-engagement-signals',
        number: 2,
        title: 'Design your behavioral trackers',
        duration: '15 min',
        founder: 'Founder field note: Zappos',
        principle:
          'Track explicit activation behaviors instead of abstract page views.',
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
        principle:
          'Do things manually first to see exactly where users derive value.',
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
    focus: 'Strengthen demand, acquisition, and customer-value systems.',
    resource: 'A founder lesson from Notion',
    video: {
      title: 'Watch with context: finding repeatable demand',
      duration: '8 min suggested watch',
      searchUrl:
        'https://www.youtube.com/results?search_query=Y+Combinator+product+market+fit+retention+startup',
      watchFor:
        'Look for the difference between a customer who likes a product and one who returns, refers, or changes their workflow around it.',
    },
    fieldNote: {
      company: 'Notion',
      title: 'Look for behaviour that repeats without persuasion',
      readTime: '6 min read',
      context:
        'Notion is a workspace product that lets teams and individuals combine notes, documents, databases, and planning in one flexible environment. Its product can serve many use cases, which makes disciplined learning about where value is strongest especially important.',
      happened:
        'Early traction is easy to misread. A launch, a friendly introduction, or a small group of enthusiastic users can feel like a growth engine. The stronger signal appears when customers keep returning, bring colleagues in, and make the product part of work they already need to do.',
      turningPoint:
        'The founder task shifts from asking whether anyone will try the product to understanding which users receive enough value to come back—and what conditions make that repeatable.',
      borrow:
        'Do not scale a one-off win. Find the customer behaviour that repeats, the path that leads to it, and the evidence that it happens beyond founder-led effort.',
      challenge:
        'Choose one recent customer win. Identify what was repeatable, what depended on you personally, and what you would need to observe three more times before calling it a real signal.',
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
      {
        key: 'measure-customer-value',
        number: 3,
        title: 'Measure real customer value',
        duration: '20 min',
        trialIncluded: false,
      },
    ],
  },

  growth: {
    label: 'Growth',
    title: 'From traction to expansion',
    promise: 'Build the systems required to expand with confidence.',
    focus: 'Focus your operating model, sales motion, and growth narrative.',
    resource: 'A founder lesson from Shopify',
    video: {
      title: 'Watch with context: scaling the operating system',
      duration: '8 min suggested watch',
      searchUrl:
        'https://www.youtube.com/results?search_query=Y+Combinator+startup+operating+systems+scaling',
      watchFor:
        'Notice which decisions require a founder at first, and which decisions become safer and faster once ownership and decision rules are explicit.',
    },
    fieldNote: {
      company: 'Shopify',
      title: 'Scale the system, not the founder',
      readTime: '6 min read',
      context:
        'Shopify is a commerce platform that helps entrepreneurs and companies create online stores, manage products, accept payments, and sell across channels. It began when its founders were building an online snowboard store and found the available e-commerce tools inadequate for what they needed.',
      happened:
        'At an early stage, closeness is an advantage: founders can see customers, products, and decisions directly. But as a company grows, the same instinct to personally unblock every decision can become a constraint. Teams wait for approval, ownership becomes fuzzy, and the founder becomes the operating system by default.',
      turningPoint:
        'The growth task is not simply producing more activity. It is making important work repeatable: clear priorities, visible owners, decision rules, and a rhythm for reviewing what happened. The company gets stronger when good decisions can move without the founder being present in every room.',
      borrow:
        'If a recurring workflow stops whenever you step away, you do not have a system yet—you have founder dependency. Scale comes from making the few high-leverage decisions repeatable.',
      challenge:
        'Choose one recurring workflow that keeps pulling you back into execution. Define its trigger, accountable owner, decision rule, and next review date.',
      create: 'Operating Constraint Map',
    },
    missions: [
      {
        key: 'scale-systems',
        number: 1,
        title: 'Build scalable systems',
        duration: '20 min',
        founder: 'Founder field note: Shopify',
        principle:
          'Systems protect focus as the company becomes more complex.',
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
    if (!all[mission.key]) all[mission.key] = mission
    return all
  }, {})

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
  {
    value: 'applied',
    label: 'Applied',
    description: 'I completed the action.',
  },
  {
    value: 'evidence-backed',
    label: 'Evidence-backed',
    description: 'I have notes, a link, or a document.',
  },
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
        fontWeight: 800,
        letterSpacing: '.12em',
        textTransform: 'uppercase',
        marginBottom: 7,
      }}
    >
      {children}
    </div>
  )
}

function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  style = {},
}) {
  const styles = {
    primary: {
      background: 'var(--green-700, #1A704D)',
      color: 'var(--white, #FFFFFF)',
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
        fontWeight: 800,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function JournalField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  rows = 4,
}) {
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
  const content =
    row?.content && typeof row.content === 'object' ? row.content : {}

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

  if (key === 'traction_growth') return 'traction'
  if (key === 'tractionstage' || key === 'traction-stage') return 'traction'
  if (key === 'growthstage' || key === 'growth-stage') return 'growth'

  return 'idea'
}

export default function Academy() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const user = useDiagnosticStore((state) => state.user)
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const assessmentResults = useDiagnosticStore(
    (state) => state.assessmentResults,
  )
  const stageAssessment = useDiagnosticStore((state) => state.stageAssessment)
  const investorReadyPercent = useDiagnosticStore(
    (state) => state.investorReadyPercent,
  )
  const diagnosedStage = useDiagnosticStore((state) => state.diagnosedStage)
  const vulnerabilityFlags = useDiagnosticStore(
    (state) => state.vulnerabilityFlags || [],
  )

  const rawStagePath =
    assessmentResults?.recommendedacademypath ||
    stageAssessment?.recommendedAcademyPath ||
    diagnosedStage ||
    stageAssessment?.diagnosedStage ||
    assessmentResults?.venturestageresult ||
    'idea'

  const recommendedPath = normalisePathKey(rawStagePath)

  const stageParam = searchParams.get('stage')
  const selectedPath =
    stageParam && ACADEMY_PATHS[stageParam] ? stageParam : recommendedPath

  const path = ACADEMY_PATHS[selectedPath]

  const configuredKeys =
    assessmentResults?.recommendedmissionkeys ||
    stageAssessment?.recommendedMissionKeys ||
    []

  const recommendedMissions =
    selectedPath === recommendedPath && configuredKeys.length
      ? path.missions.filter((mission) =>
          configuredKeys.includes(mission.key),
        )
      : path.missions.slice(0, 3)

  const activeMissionKey = searchParams.get('mission')
  const activeMission = activeMissionKey
    ? MISSION_DETAILS[activeMissionKey]
    : null

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
    const completed =
      work.status === 'evidence-backed'
        ? 3
        : work.status === 'applied'
          ? 2
          : 1

    return Math.round((completed / 3) * 100)
  }, [work.status])

  useEffect(() => {
    if (
      !['opportunity-foundations', 'notice-friction'].includes(
        activeMissionKey,
      ) ||
      !user?.id
    ) {
      return
    }

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
        setError(
          'Your journal could not be loaded. Create the founder_working_journal table before saving Academy work.',
        )
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

  function openSupportingResources(missionKey = '') {
    const params = new URLSearchParams({
      stage: selectedPath,
    })

    if (missionKey) {
      params.set('mission', missionKey)
    }

    navigate(`/app/resources?${params.toString()}`)
  }

  async function uploadEvidence(event) {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    setUploading(true)

    try {
      const safeName = file.name
        .replace(/[^a-zA-Z0-9._-]/g, '-')
        .slice(0, 80)
      const filePath = `${user.id}/${activeMissionKey}/${Date.now()}-${safeName}`

      const { error: uploadError } = await supabase.storage
        .from('academy-evidence')
        .upload(filePath, file, { upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('academy-evidence')
        .getPublicUrl(filePath)

      updateWork('evidenceUrl', data.publicUrl)
      updateWork('evidenceName', file.name)
      setNotice(
        'Evidence uploaded. Save your journal to create a versioned record.',
      )
    } catch {
      setError(
        'The file could not be uploaded. Confirm the academy-evidence bucket and upload policy exist.',
      )
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
      setError(
        'Your work could not be saved. Create the founder_working_journal table before saving Academy work.',
      )
    } else {
      setVersions((current) => [data, ...current])
      setNotice(
        `Saved to your Founder Working Journal as version ${payload.version}.`,
      )
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
        completionReady={
          work.status === 'evidence-backed' && latestVersion > 0
        }
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

  if (activeMission) {
    return <ComingSoonMission mission={activeMission} onBack={goHome} />
  }

  const totalMinutes = recommendedMissions.reduce(
    (total, mission) => total + Number.parseInt(mission.duration, 10),
    0,
  )

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
          background:
            'linear-gradient(135deg, #FFFFFF 0%, var(--lilac-050, #F8F6FF) 100%)',
          border: '1px solid var(--lilac-200, #DED5F6)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 290,
            height: 290,
            right: -110,
            top: -170,
            borderRadius: 999,
            border: '1px solid var(--lilac-200, #DED5F6)',
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 185,
            height: 185,
            right: -26,
            top: -95,
            borderRadius: 999,
            border: '1px solid rgba(26,112,77,.16)',
          }}
        />
        <div style={{ position: 'relative', maxWidth: 720 }}>
          <SectionLabel>PATH360 ACADEMY · FOUNDER PRACTICE</SectionLabel>
          <h1
            style={{
              maxWidth: 650,
              margin: '0 0 9px',
              color: 'var(--text, #151614)',
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: '-.045em',
              lineHeight: 1.12,
            }}
          >
            Your highest-leverage work this week:{' '}
            {path.promise.toLowerCase()}
          </h1>
          <p
            style={{
              maxWidth: 610,
              margin: '0 0 18px',
              color: 'var(--text-soft, #5D635D)',
              fontSize: 13,
              lineHeight: 1.65,
            }}
          >
            {path.focus}
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="primary"
              onClick={() => openMission(recommendedMissions[0]?.key)}
            >
              {recommendedMissions[0]
                ? `Begin: ${recommendedMissions[0].title}`
                : 'Begin your path'}{' '}
              →
            </Button>

            <Button
              variant="secondary"
              onClick={() => openSupportingResources()}
            >
              Find supporting resources →
            </Button>

            <span
              style={{
                color: 'var(--green-800, #15563E)',
                fontSize: 11.5,
                fontWeight: 700,
              }}
            >
              {path.label} stage · {recommendedMissions.length} essential lessons
              · about {totalMinutes} minutes · investor readiness{' '}
              {investorReadyPercent || 0}%
            </span>
          </div>
        </div>
      </section>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.45fr) minmax(270px,.75fr)',
          gap: 16,
          alignItems: 'start',
        }}
      >
        <main style={{ display: 'grid', gap: 16 }}>
          <section
            className="p360-card"
            style={{ padding: 20, borderRadius: 18 }}
          >
            <SectionLabel>YOUR FOCUSED LEARNING SEQUENCE</SectionLabel>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
                marginBottom: 15,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 19,
                  letterSpacing: '-.025em',
                }}
              >
                {path.title}
              </h2>
              <span className="p360-tag-learning">Selected for your stage</span>
            </div>
            <div style={{ display: 'grid', gap: 9 }}>
              {recommendedMissions.map((mission) => (
                <LessonCard
                  key={mission.key}
                  mission={mission}
                  onOpen={() => openMission(mission.key)}
                  onFindResources={() => openSupportingResources(mission.key)}
                />
              ))}
            </div>
          </section>
                    <FieldNote
            path={path}
            isOpen={fieldNoteOpen}
            videoOpen={videoOpen}
            onToggle={() => setFieldNoteOpen((current) => !current)}
            onWatch={() => setVideoOpen((current) => !current)}
          />

          <section
            className="p360-card"
            style={{ padding: 20, borderRadius: 18 }}
          >
            <SectionLabel>YOUR PATH THROUGH ACADEMY</SectionLabel>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, minmax(0,1fr))',
                gap: 7,
              }}
            >
              {PATH_ORDER.map((key, index) => {
                const item = ACADEMY_PATHS[key]
                const selected = key === selectedPath
                const current = key === recommendedPath

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => openStage(key)}
                    style={{
                      minHeight: 94,
                      textAlign: 'left',
                      padding: 11,
                      borderRadius: 12,
                      border: selected
                        ? '1px solid var(--lilac-200, #DED5F6)'
                        : '1px solid var(--border, #DDE2DC)',
                      background: selected
                        ? 'var(--lilac-050, #F8F6FF)'
                        : 'var(--surface-soft, #F8F9F6)',
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        color: selected
                          ? 'var(--lilac-700, #694FB2)'
                          : 'var(--text-faint, #899089)',
                        fontSize: 10,
                        fontWeight: 850,
                        letterSpacing: '.08em',
                        textTransform: 'uppercase',
                        marginBottom: 7,
                      }}
                    >
                      0{index + 1}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 850,
                        color: 'var(--text, #151614)',
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 10,
                        color: current
                          ? 'var(--green-700, #1A704D)'
                          : 'var(--text-faint, #899089)',
                        lineHeight: 1.3,
                      }}
                    >
                      {current ? 'Your current stage' : 'Explore path'}
                    </div>
                  </button>
                )
              })}
            </div>

            <div
              style={{
                marginTop: 13,
                paddingTop: 13,
                borderTop: '1px solid var(--border, #DDE2DC)',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--text-soft, #5D635D)',
                }}
              >
                All stages are available during your trial. Your diagnosis keeps
                the highest-value path in focus.
              </div>

              <Button
                variant="secondary"
                onClick={() => openStage(recommendedPath)}
                style={{ padding: '8px 10px', flexShrink: 0 }}
              >
                Return to my path
              </Button>
            </div>
          </section>

          {vulnerabilityFlags.length > 0 && (
            <section
              className="p360-card"
              style={{ padding: 18, borderRadius: 18 }}
            >
              <SectionLabel tone="muted">
                STRUCTURAL RISKS IN YOUR CURRENT PLAN
              </SectionLabel>
              <p
                style={{
                  margin: '0 0 10px',
                  fontSize: 12,
                  color: 'var(--text-soft, #5D635D)',
                  lineHeight: 1.6,
                }}
              >
                Your readiness scores reveal imbalances between product,
                evidence, and unit economics. Use these flags to focus your
                next Academy sessions on the risks that matter most.
              </p>

              <div style={{ display: 'grid', gap: 8 }}>
                {vulnerabilityFlags.map((flag) => (
                  <div
                    key={flag.key}
                    style={{
                      padding: 10,
                      borderRadius: 10,
                      border: '1px solid rgba(139,32,32,.25)',
                      background: '#FDEAEA',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 800,
                        color: '#8B2020',
                        marginBottom: 4,
                      }}
                    >
                      {flag.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        color: '#8B2020',
                        marginBottom: 8,
                      }}
                    >
                      {flag.description}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (flag.key === 'over_engineering_trap') {
                            openMissionForStage(
                              'validation',
                              'interview-without-pitching',
                            )
                          } else if (flag.key === 'leaky_bucket_trap') {
                            openMissionForStage(
                              'traction',
                              'ready-to-scale',
                            )
                          }
                        }}
                        style={{
                          padding: '6px 10px',
                          fontSize: 11,
                        }}
                      >
                        Focus on this risk →
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          if (flag.key === 'over_engineering_trap') {
                            openSupportingResources(
                              'interview-without-pitching',
                            )
                          } else if (flag.key === 'leaky_bucket_trap') {
                            openSupportingResources('ready-to-scale')
                          } else {
                            openSupportingResources()
                          }
                        }}
                        style={{
                          border: 0,
                          padding: '6px 2px',
                          background: 'transparent',
                          color: '#8B2020',
                          fontSize: 10.5,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Find resources →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <aside style={{ display: 'grid', gap: 16 }}>
          <section
            style={{
              borderRadius: 18,
              padding: 18,
              background: 'var(--green-050, #F4FAF6)',
              border: '1px solid rgba(26,112,77,.18)',
            }}
          >
            <SectionLabel tone="green">FOUNDER WORKING JOURNAL</SectionLabel>
            <div
              style={{
                fontSize: 16,
                fontWeight: 850,
                marginBottom: 6,
              }}
            >
              Your work becomes venture intelligence.
            </div>
            <p
              style={{
                margin: '0 0 14px',
                fontSize: 12,
                lineHeight: 1.6,
                color: 'var(--text-soft, #5D635D)',
              }}
            >
              Every evidence-backed mission creates an artefact you can revisit
              and later use in PATH360 Studio, Reports, and your AI Strategist
              context.
            </p>
            <Button
              variant="secondary"
              onClick={() => openMission('opportunity-foundations')}
              style={{ width: '100%' }}
            >
              Open your journal →
            </Button>
          </section>

          <section
            style={{
              borderRadius: 18,
              padding: 18,
              background: 'var(--lilac-050, #F8F6FF)',
              border: '1px solid var(--lilac-200, #DED5F6)',
            }}
          >
            <SectionLabel>RESOURCE CENTRE</SectionLabel>
            <div
              style={{
                fontSize: 16,
                fontWeight: 850,
                marginBottom: 6,
                color: 'var(--text, #151614)',
              }}
            >
              Find tools for your next move.
            </div>
            <p
              style={{
                margin: '0 0 14px',
                fontSize: 12,
                lineHeight: 1.6,
                color: 'var(--text-soft, #5D635D)',
              }}
            >
              Browse supporting templates, official sources, market research,
              ecosystem directories, and PATH360 tools for the {path.label.toLowerCase()}{' '}
              stage.
            </p>
            <Button
              variant="lilac"
              onClick={() => openSupportingResources()}
              style={{ width: '100%' }}
            >
              Explore resources →
            </Button>
          </section>

          <section className="p360-learning-surface" style={{ padding: 18 }}>
            <SectionLabel>CURATED FIELD NOTE</SectionLabel>
            <div
              style={{
                fontSize: 15,
                fontWeight: 850,
                color: 'var(--text, #151614)',
                marginBottom: 7,
              }}
            >
              {path.resource}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                color: 'var(--text-soft, #5D635D)',
                lineHeight: 1.6,
              }}
            >
              {path.fieldNote.borrow}
            </p>
            <button
              type="button"
              onClick={() => setFieldNoteOpen(true)}
              style={{
                marginTop: 13,
                padding: 0,
                border: 0,
                background: 'transparent',
                color: 'var(--lilac-800, #5B449D)',
                fontSize: 11.5,
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              Read the field note →
            </button>
          </section>

          <section
            style={{
              padding: '14px 15px',
              border: '1px solid var(--border, #DDE2DC)',
              borderRadius: 15,
              background: 'var(--surface, #FFF)',
            }}
          >
            <div
              style={{
                color: 'var(--text-faint, #899089)',
                fontSize: 10,
                fontWeight: 850,
                letterSpacing: '.08em',
                textTransform: 'uppercase',
                marginBottom: 4,
              }}
            >
              Your two-week founder baseline
            </div>
            <div
              style={{
                color: 'var(--text-soft, #5D635D)',
                fontSize: 11.5,
                lineHeight: 1.55,
              }}
            >
              Complete three essential lessons, create evidence, and leave with
              venture artefacts you can use immediately.
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function LessonCard({ mission, onOpen, onFindResources }) {
  return (
    <div
      style={{
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '34px minmax(0,1fr) auto auto',
        alignItems: 'center',
        gap: 12,
        padding: '13px 12px',
        background: 'var(--surface, #FFF)',
        border: '1px solid var(--border, #DDE2DC)',
        borderRadius: 13,
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          width: 29,
          height: 29,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 999,
          background: 'var(--green-700, #1A704D)',
          color: 'var(--white, #FFF)',
          fontSize: 11,
          fontWeight: 850,
        }}
      >
        {String(mission.number).padStart(2, '0')}
      </span>

      <button
        type="button"
        onClick={onOpen}
        style={{
          minWidth: 0,
          padding: 0,
          border: 0,
          background: 'transparent',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            display: 'block',
            color: 'var(--text, #151614)',
            fontSize: 13,
            fontWeight: 850,
          }}
        >
          {mission.title}
        </span>
        <span
          style={{
            display: 'block',
            marginTop: 3,
            color: 'var(--text-faint, #899089)',
            fontSize: 10.8,
          }}
        >
          {mission.founder || 'Founder practice'} ·{' '}
          {mission.framework || 'Full lesson'} · {mission.duration}
        </span>
        {mission.artefact ? (
          <span
            style={{
              display: 'block',
              marginTop: 4,
              color: 'var(--green-800, #15563E)',
              fontSize: 10.8,
              fontWeight: 750,
            }}
          >
            Create: {mission.artefact}
          </span>
        ) : null}
      </button>

      <button
        type="button"
        onClick={onFindResources}
        style={{
          border: 0,
          padding: '5px 2px',
          background: 'transparent',
          color: 'var(--lilac-800, #5B449D)',
          fontSize: 10.5,
          fontWeight: 800,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Resources
      </button>

      <button
        type="button"
        onClick={onOpen}
        style={{
          border: 0,
          padding: '5px 2px',
          background: 'transparent',
          color: 'var(--green-700, #1A704D)',
          fontSize: 11.5,
          fontWeight: 850,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Begin →
      </button>
    </div>
  )
}

function FieldNote({ path, isOpen, videoOpen, onToggle, onWatch }) {
  const note = path.fieldNote

  return (
    <section className="p360-field-note">
      <div
        className="p360-field-note-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <div>
          <SectionLabel>
            FOUNDER FIELD NOTE · {path.label} STAGE
          </SectionLabel>
          <h2
            style={{
              margin: '0 0 5px',
              color: 'var(--text, #151614)',
              fontSize: 20,
              letterSpacing: '-.03em',
            }}
          >
            {note.company}: {note.title}
          </h2>
          <div
            style={{
              color: 'var(--lilac-800, #5B449D)',
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {note.readTime} · Story, principle, and field challenge
          </div>
        </div>

        <Button
          variant="lilac"
          onClick={onToggle}
          style={{ flexShrink: 0, padding: '8px 10px' }}
        >
          {isOpen ? 'Close note' : 'Read note →'}
        </Button>
      </div>

      {isOpen ? (
        <div className="p360-field-note-body">
          <h3>Context</h3>
          <p>{note.context}</p>

          <h3>What happened</h3>
          <p>{note.happened}</p>

          <h3>The turning point</h3>
          <p>{note.turningPoint}</p>

          <h3>What to borrow</h3>
          <p>{note.borrow}</p>

          <h3>Try this this week</h3>
          <p>{note.challenge}</p>

          <div className="p360-field-note-create">
            Create: {note.create}
          </div>

          <div
            style={{
              marginTop: 14,
              padding: 14,
              border: '1px solid var(--lilac-200, #DED5F6)',
              borderRadius: 12,
              background: 'var(--lilac-050, #F8F6FF)',
            }}
          >
            <SectionLabel>LEARN WITH CONTEXT</SectionLabel>

            <div
              style={{
                color: 'var(--text, #151614)',
                fontSize: 13,
                fontWeight: 850,
                marginBottom: 4,
              }}
            >
              {path.video.title}
            </div>

            <p
              style={{
                margin: '0 0 11px',
                color: 'var(--text-soft, #5D635D)',
                fontSize: 12,
                lineHeight: 1.55,
              }}
            >
              Focus on: {path.video.watchFor}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <Button variant="lilac" onClick={onWatch}>
                {videoOpen ? 'Hide resource link' : 'Open learning resource →'}
              </Button>

              <span
                style={{
                  color: 'var(--lilac-800, #5B449D)',
                  fontSize: 10.5,
                  fontWeight: 750,
                }}
              >
                {path.video.duration}
              </span>
            </div>

            {videoOpen ? (
              <div
                style={{
                  marginTop: 11,
                  paddingTop: 11,
                  borderTop: '1px solid var(--lilac-200, #DED5F6)',
                }}
              >
                <a
                  href={path.video.searchUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: 'var(--green-700, #1A704D)',
                    fontSize: 12,
                    fontWeight: 850,
                  }}
                >
                  Open the curated article or video ↗
                </a>
                <div
                  style={{
                    marginTop: 6,
                    color: 'var(--text-faint, #899089)',
                    fontSize: 10.5,
                    lineHeight: 1.45,
                  }}
                >
                  The resource opens in a separate tab so the Academy working
                  space stays focused.
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )
}

function MissionOne({
  work,
  updateWork,
  progress,
  loading,
  saving,
  uploading,
  versions,
  latestVersion,
  notice,
  error,
  onBack,
  onSave,
  onUpload,
  onContinue,
}) {
  const complete = work.status === 'evidence-backed' && latestVersion > 0

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1000,
        margin: '0 auto',
        fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
      }}
    >
      <button
        type="button"
        onClick={onBack}
        style={{
          border: 0,
          padding: 0,
          marginBottom: 14,
          background: 'transparent',
          color: 'var(--lilac-700, #694FB2)',
          fontSize: 12.5,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        ← Back to Academy
      </button>

      <header
        style={{
          padding: '21px 22px',
          borderRadius: 18,
          background:
            'linear-gradient(135deg, #FFFFFF 0%, var(--lilac-050, #F8F6FF) 100%)',
          border: '1px solid var(--lilac-200, #DED5F6)',
          marginBottom: 18,
        }}
      >
        <SectionLabel>MISSION 1 · IDEA STAGE · 15 MIN</SectionLabel>
        <h1
          style={{
            margin: '0 0 7px',
            color: 'var(--text, #151614)',
            fontSize: 25,
            letterSpacing: '-.035em',
          }}
        >
          You do not need a perfect idea to begin
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: 680,
            color: 'var(--text-soft, #5D635D)',
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          The earliest useful founder work is not defending a solution. It is
          noticing a real problem clearly enough to investigate it.
        </p>
      </header>

      {error ? (
        <div
          style={{
            marginBottom: 14,
            padding: 12,
            borderRadius: 11,
            background: '#FDEAEA',
            color: '#8B2020',
            fontSize: 12.5,
          }}
        >
          {error}
        </div>
      ) : null}

      {notice ? (
        <div
          style={{
            marginBottom: 14,
            padding: 12,
            borderRadius: 11,
            background: 'var(--green-100, #E9F4EC)',
            color: 'var(--green-800, #15563E)',
            fontSize: 12.5,
          }}
        >
          {notice}
        </div>
      ) : null}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) 255px',
          gap: 18,
          alignItems: 'start',
        }}
      >
        <main style={{ display: 'grid', gap: 18 }}>
          <section className="p360-learning-surface" style={{ padding: 18 }}>
            <SectionLabel>FOUNDER FIELD NOTE</SectionLabel>
            <h2 style={{ margin: '0 0 8px', fontSize: 17 }}>
              Start with what people actually do
            </h2>
            <p
              style={{
                margin: 0,
                color: 'var(--text-soft, #5D635D)',
                fontSize: 13,
                lineHeight: 1.75,
              }}
            >
              Strong ventures often begin with an unmet need, recurring
              workaround, delay, cost, or frustration. Record what you saw and
              who experiences it before trying to prove your solution is right.
            </p>
          </section>

          <section
            className="p360-card"
            style={{ padding: 18, borderRadius: 18 }}
          >
            <SectionLabel>REFLECT</SectionLabel>
            <JournalField
              label="What friction or problem keeps catching your attention?"
              hint="Describe the situation before describing your product or solution."
              value={work.reflection}
              onChange={(event) =>
                updateWork('reflection', event.target.value)
              }
              placeholder="I keep noticing that…"
            />
          </section>

          <section
            className="p360-card"
            style={{ padding: 18, borderRadius: 18 }}
          >
            <SectionLabel>FIELD CHALLENGE</SectionLabel>
            <h2 style={{ margin: '0 0 8px', fontSize: 17 }}>
              Record three observed friction points
            </h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <JournalField
                label="Observation 1"
                value={work.problemOne}
                onChange={(event) =>
                  updateWork('problemOne', event.target.value)
                }
                placeholder="For example: I watched…"
                rows={3}
              />
              <JournalField
                label="Observation 2"
                value={work.problemTwo}
                onChange={(event) =>
                  updateWork('problemTwo', event.target.value)
                }
                placeholder="Another friction point I noticed…"
                rows={3}
              />
              <JournalField
                label="Observation 3"
                value={work.problemThree}
                onChange={(event) =>
                  updateWork('problemThree', event.target.value)
                }
                placeholder="A third pattern or workaround…"
                rows={3}
              />
            </div>
          </section>

          <section
            className="p360-card"
            style={{ padding: 18, borderRadius: 18 }}
          >
            <SectionLabel>EVIDENCE</SectionLabel>
            <input
              value={work.evidenceUrl}
              onChange={(event) =>
                updateWork('evidenceUrl', event.target.value)
              }
              placeholder="Paste an evidence or document link"
              type="url"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                height: 42,
                borderRadius: 10,
                border: '1px solid var(--border, #DDE2DC)',
                padding: '0 11px',
              }}
            />
            <div style={{ marginTop: 10 }}>
              <label
                style={{
                  display: 'inline-flex',
                  border: '1px solid var(--border, #DDE2DC)',
                  borderRadius: 10,
                  padding: '9px 11px',
                  fontSize: 12.5,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="file"
                  onChange={onUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                {uploading ? 'Uploading…' : 'Upload document'}
              </label>
              {work.evidenceName ? (
                <span style={{ marginLeft: 10, fontSize: 11.5 }}>
                  Attached: {work.evidenceName}
                </span>
              ) : null}
            </div>
          </section>

          <section
            className="p360-card"
            style={{ padding: 18, borderRadius: 18 }}
          >
            <SectionLabel>DECIDE</SectionLabel>
            <JournalField
              label="What do I want to investigate next?"
              hint="Choose a small learning action, not a large build task."
              value={work.decision}
              onChange={(event) =>
                updateWork('decision', event.target.value)
              }
              placeholder="Next, I want to investigate whether…"
            />
          </section>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
            }}
          >
            <Button variant="secondary" onClick={onBack}>
              Save later
            </Button>
            <Button
              variant="primary"
              onClick={onSave}
              disabled={saving || loading}
            >
              {saving ? 'Saving…' : 'Save to Founder Working Journal'}
            </Button>
          </div>

          {complete ? (
            <MissionCompletionCard
              title="Mission complete"
              message="You have created your first evidence-backed opportunity record."
              nextMessage="Next, learn how to separate ordinary complaints from friction worth investigating."
              buttonLabel="Continue to Mission 2 →"
              onContinue={onContinue}
            />
          ) : null}
        </main>

        <MissionSidebar
          work={work}
          updateWork={updateWork}
          progress={progress}
          versions={versions}
          loading={loading}
        />
      </div>
    </div>
  )
}

function ComingSoonMission({ mission, onBack }) {
  return (
    <div
      style={{
        padding: 24,
        maxWidth: 800,
        margin: '0 auto',
        fontFamily: 'var(--font-sans, DM Sans, sans-serif)',
      }}
    >
      <button
        type="button"
        onClick={onBack}
        style={{
          border: 0,
          padding: 0,
          marginBottom: 14,
          background: 'transparent',
          color: 'var(--lilac-700, #694FB2)',
          fontSize: 12.5,
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        ← Back to Academy
      </button>

      <section
        className="p360-card"
        style={{ padding: 22, borderRadius: 18 }}
      >
        <SectionLabel>COMING SOON</SectionLabel>
        <h1
          style={{
            margin: '0 0 8px',
            fontSize: 24,
            letterSpacing: '-.035em',
          }}
        >
          {mission.title}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--text-soft, #5D635D)',
            lineHeight: 1.7,
          }}
        >
          This mission is part of your PATH360 Academy journey and will be
          added in an upcoming update.
        </p>
      </section>
    </div>
  )
}

function MissionSidebar({ work, updateWork, progress, versions, loading }) {
  const current = statusColor(work.status)

  return (
    <aside
      style={{
        position: 'sticky',
        top: 18,
        display: 'grid',
        gap: 14,
      }}
    >
      <section className="p360-card" style={{ padding: 16, borderRadius: 16 }}>
        <SectionLabel>MISSION STATUS</SectionLabel>
        <div className="p360-progress-rail" style={{ marginBottom: 8 }}>
          <span style={{ width: `${progress}%` }} />
        </div>
        <div
          style={{
            color: 'var(--text-faint, #899089)',
            fontSize: 11.5,
            marginBottom: 11,
          }}
        >
          {progress}% of the workflow complete
        </div>

        {STATUS_OPTIONS.map((option) => {
          const selected = work.status === option.value
          const colors = statusColor(option.value)

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => updateWork('status', option.value)}
              style={{
                width: '100%',
                textAlign: 'left',
                marginBottom: 7,
                padding: 9,
                borderRadius: 10,
                border: selected
                  ? `1px solid ${colors.border}`
                  : '1px solid var(--border, #DDE2DC)',
                background: selected ? colors.bg : 'var(--surface, #FFF)',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: selected ? colors.text : 'var(--text, #151614)',
                }}
              >
                {option.label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: selected
                    ? colors.text
                    : 'var(--text-soft, #5D635D)',
                }}
              >
                {option.description}
              </div>
            </button>
          )
        })}
      </section>

      <section className="p360-card" style={{ padding: 16, borderRadius: 16 }}>
        <SectionLabel tone="muted">JOURNAL VERSIONS</SectionLabel>
        {loading ? (
          <div style={{ fontSize: 12 }}>Loading your journal…</div>
        ) : versions.length === 0 ? (
          <div style={{ fontSize: 12 }}>
            Your first save will create a versioned record of this mission.
          </div>
        ) : (
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              fontSize: 11.5,
              color: 'var(--text-soft, #5D635D)',
            }}
          >
            {versions.map((version) => (
              <li key={version.id} style={{ marginBottom: 6 }}>
                Version {version.version}{' '}
                <span style={{ color: 'var(--text-faint, #899089)' }}>
                  ·{' '}
                  {new Date(version.created_at).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}