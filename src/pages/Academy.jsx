// src/pages/Academy.jsx

import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import supabase from '../lib/supabaseClient.js'
import useDiagnosticStore from '../stores/useDiagnosticStore.js'

const COURSE = {
  key: 'observation-to-tested-opportunity',
  title: 'From Observation to Tested Opportunity',
  subtitle: 'Turn real-world friction into a focused opportunity worth testing.',
  stage: 'Idea stage',
  duration: 'About 90 minutes',
}

const MISSIONS = [
  {
    key: 'opportunity-foundations',
    number: 1,
    title: 'You do not need a perfect idea to begin',
    duration: '15 min',
    description: 'Start with observed problems, not polished solutions.',
    available: true,
  },
  {
    key: 'notice-friction',
    number: 2,
    title: 'Notice friction worth solving',
    duration: '15 min',
    description: 'Separate passing annoyances from recurring, costly friction.',
  },
  {
    key: 'choose-a-user',
    number: 3,
    title: 'Choose a user you can learn from',
    duration: '15 min',
    description: 'Identify a specific person or team close enough to understand.',
  },
  {
    key: 'test-assumptions',
    number: 4,
    title: 'Turn assumptions into questions',
    duration: '15 min',
    description: 'Create simple questions that reveal behaviour rather than opinions.',
  },
  {
    key: 'collect-evidence',
    number: 5,
    title: 'Collect evidence before building',
    duration: '15 min',
    description: 'Decide what would count as meaningful evidence of a real need.',
  },
  {
    key: 'choose-next-test',
    number: 6,
    title: 'Choose your next test',
    duration: '15 min',
    description: 'Commit to a small, fast learning action.',
  },
]

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
  { value: 'applied', label: 'Applied', description: 'I have completed the action.' },
  {
    value: 'evidence-backed',
    label: 'Evidence-backed',
    description: 'I have supporting notes, a link, or a document.',
  },
]

function getFounderStage(profile) {
  const raw = String(
    profile?.venture_stage || profile?.stage || profile?.venturestage || profile?.company_stage || 'Idea'
  ).trim()

  if (!raw) return 'Idea'
  return raw.charAt(0).toUpperCase() + raw.slice(1)
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

function getMarketUnderstandingScore(results) {
  if (!results || typeof results !== 'object') return null

  const candidates = [
    results.marketUnderstandingScore,
    results.market_understanding_score,
    results.marketUnderstanding,
    results.market_understanding,
    results?.scores?.marketUnderstanding,
    results?.scores?.market_understanding,
  ]

  const score = candidates.find((value) => Number.isFinite(Number(value)))
  return score === undefined ? null : Number(score)
}

function normaliseSavedWork(row) {
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
  if (status === 'evidence-backed') return { bg: '#EAF4EE', border: '#BFD9C7', text: '#17613F' }
  if (status === 'applied') return { bg: '#F5F0FF', border: '#DCD0FF', text: '#684CB5' }
  return { bg: '#F7F5EF', border: '#E2DED6', text: '#69655E' }
}

function Button({ children, onClick, variant = 'primary', disabled = false, style = {}, type = 'button' }) {
  const variants = {
    primary: { background: '#7158DC', border: '1px solid #7158DC', color: '#FFFFFF' },
    secondary: { background: '#FFFFFF', border: '1px solid #D9D4CA', color: '#46433E' },
    green: { background: '#1D6B4F', border: '1px solid #1D6B4F', color: '#FFFFFF' },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        borderRadius: 10,
        padding: '10px 13px',
        fontSize: 12.5,
        fontWeight: 800,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.58 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        color: '#7158DC',
        fontWeight: 800,
        letterSpacing: '0.11em',
        textTransform: 'uppercase',
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  )
}

function JournalField({ label, hint, value, onChange, placeholder, rows = 4 }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: '#25231F', marginBottom: 5 }}>
        {label}
      </label>
      {hint ? <div style={{ fontSize: 11.5, color: '#747069', lineHeight: 1.55, marginBottom: 7 }}>{hint}</div> : null}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          border: '1px solid #D9D4CA',
          borderRadius: 11,
          background: '#FFFFFF',
          color: '#25231F',
          padding: 11,
          resize: 'vertical',
          outline: 'none',
          fontFamily: "'Inter', 'DM Sans', sans-serif",
          fontSize: 12.5,
          lineHeight: 1.55,
        }}
      />
    </div>
  )
}

export default function Academy() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useDiagnosticStore((state) => state.user)
  const founderProfile = useDiagnosticStore((state) => state.founderProfile)
  const assessmentResults = useDiagnosticStore((state) => state.assessmentResults)

  const [work, setWork] = useState(EMPTY_WORK)
  const [latestVersion, setLatestVersion] = useState(0)
  const [journalVersions, setJournalVersions] = useState([])
  const [loadingJournal, setLoadingJournal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const activeMissionKey = searchParams.get('mission')
  const activeMission = MISSIONS.find((mission) => mission.key === activeMissionKey)
  const stage = getFounderStage(founderProfile)
  const ventureName = getVentureName(founderProfile)
  const marketScore = getMarketUnderstandingScore(assessmentResults)
  const isIdeaStage = stage.toLowerCase().includes('idea')
  const isLowMarketUnderstanding = marketScore !== null && marketScore <= 2
  const isRecommended = isIdeaStage || isLowMarketUnderstanding

  const journalTableHelp = 'Create the founder_working_journal table before saving Academy work.'

  useEffect(() => {
    if (activeMissionKey !== 'opportunity-foundations' || !user?.id) return

    let active = true
    async function loadJournal() {
      setLoadingJournal(true)
      setError('')
      try {
        const { data, error: loadError } = await supabase
          .from('founder_working_journal')
          .select('*')
          .eq('founder_id', user.id)
          .eq('mission_key', 'opportunity-foundations')
          .order('version', { ascending: false })

        if (loadError) throw loadError
        if (!active) return

        const versions = data || []
        setJournalVersions(versions)
        setLatestVersion(Number(versions[0]?.version || 0))
        setWork(versions[0] ? normaliseSavedWork(versions[0]) : EMPTY_WORK)
      } catch (loadError) {
        console.error('Academy journal load failed:', loadError)
        if (active) setError(`Your journal could not be loaded. ${journalTableHelp}`)
      } finally {
        if (active) setLoadingJournal(false)
      }
    }

    loadJournal()
    return () => {
      active = false
    }
  }, [activeMissionKey, user?.id])

  const progress = useMemo(() => {
    const completed = work.status === 'evidence-backed' ? 3 : work.status === 'applied' ? 2 : 1
    return Math.round((completed / 3) * 100)
  }, [work.status])

  function updateWork(field, value) {
    setWork((current) => ({ ...current, [field]: value }))
    setNotice('')
  }

  function openMission() {
    setSearchParams({ mission: 'opportunity-foundations' })
  }

  function returnHome() {
    setSearchParams({})
    setError('')
    setNotice('')
  }

  function continueToNextMission() {
    setSearchParams({ mission: 'notice-friction' })
    setError('')
    setNotice('')
  }

  async function handleEvidenceUpload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!user?.id) {
      setError('Sign in before uploading evidence.')
      return
    }

    setUploading(true)
    setError('')
    try {
      const extension = file.name.includes('.') ? file.name.split('.').pop() : 'file'
      const safeBaseName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 80)
      const filePath = `${user.id}/opportunity-foundations/${Date.now()}-${safeBaseName || `evidence.${extension}`}`
      const { error: uploadError } = await supabase.storage
        .from('academy-evidence')
        .upload(filePath, file, { upsert: false })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('academy-evidence').getPublicUrl(filePath)
      updateWork('evidenceUrl', data.publicUrl)
      updateWork('evidenceName', file.name)
      setNotice('Evidence uploaded. Save your journal to create a versioned record.')
    } catch (uploadError) {
      console.error('Academy evidence upload failed:', uploadError)
      setError('The file could not be uploaded. Confirm the academy-evidence storage bucket exists and its upload policy allows signed-in founders.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  async function saveJournal() {
    if (!user?.id) {
      setError('Sign in before saving work to your Founder Working Journal.')
      return
    }

    setSaving(true)
    setError('')
    setNotice('')

    const nextVersion = latestVersion + 1
    const payload = {
      founder_id: user.id,
      mission_key: 'opportunity-foundations',
      mission_title: 'You do not need a perfect idea to begin',
      course_key: COURSE.key,
      venture_name: ventureName,
      content: work,
      status: work.status,
      evidence_url: work.evidenceUrl || null,
      evidence_name: work.evidenceName || null,
      version: nextVersion,
      created_at: new Date().toISOString(),
    }

    try {
      const { data, error: saveError } = await supabase
        .from('founder_working_journal')
        .insert(payload)
        .select()
        .single()

      if (saveError) throw saveError

      setLatestVersion(nextVersion)
      setJournalVersions((current) => [data, ...current])
      setNotice(`Saved to your Founder Working Journal as version ${nextVersion}.`)
    } catch (saveError) {
      console.error('Academy journal save failed:', saveError)
      setError(`Your work could not be saved. ${journalTableHelp}`)
    } finally {
      setSaving(false)
    }
  }

  if (activeMission && activeMission.key !== 'opportunity-foundations') {
    return <ComingSoonMission mission={activeMission} onBack={returnHome} />
  }

  if (activeMission?.key === 'opportunity-foundations') {
    return (
      <MissionOne
        work={work}
        updateWork={updateWork}
        progress={progress}
        loadingJournal={loadingJournal}
        saving={saving}
        uploading={uploading}
        latestVersion={latestVersion}
        journalVersions={journalVersions}
        notice={notice}
        error={error}
        onBack={returnHome}
        onSave={saveJournal}
        onUpload={handleEvidenceUpload}
        completionReady={
          work.status === 'evidence-backed' && latestVersion > 0
        }
        onContinue={continueToNextMission}
      />
    )
  }

  return (
    <div style={{ padding: 24, maxWidth: 1160, margin: '0 auto', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <div
        style={{
          padding: '22px 22px 20px',
          borderRadius: 18,
          border: '1px solid #E7DFCF',
          background: 'linear-gradient(135deg, #F8F5EE 0%, #F5F0FF 100%)',
          marginBottom: 18,
        }}
      >
        <SectionLabel>PATH360 Academy</SectionLabel>
        <h1 style={{ margin: '0 0 8px', fontSize: 25, letterSpacing: '-0.03em', color: '#1C1C1A' }}>
          Learn by moving your venture forward
        </h1>
        <p style={{ maxWidth: 680, margin: 0, fontSize: 13.5, color: '#66625C', lineHeight: 1.7 }}>
          Practical missions that turn your diagnosis into founder decisions, evidence, and artefacts you can use.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(280px, 0.8fr)', gap: 18, alignItems: 'start' }}>
        <main style={{ display: 'grid', gap: 18 }}>
          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
            <SectionLabel>Your current context</SectionLabel>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1C1C1A', marginBottom: 5 }}>{stage} founder</div>
                <div style={{ fontSize: 12.5, color: '#6B6965', lineHeight: 1.6 }}>
                  {isRecommended
                    ? 'Your current stage suggests that opportunity discovery is the highest-value place to start.'
                    : 'This course is available to explore whenever you want to strengthen your opportunity-discovery practice.'}
                </div>
              </div>
              <div style={{ borderRadius: 12, background: '#EEF4EF', border: '1px solid #D6E4D7', padding: '9px 11px', minWidth: 150 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2A6A51', marginBottom: 3 }}>Personalised focus</div>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: '#1D6B4F' }}>Understand the problem first</div>
              </div>
            </div>
          </section>

          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
            <SectionLabel>{isRecommended ? 'Recommended next mission' : 'Start here'}</SectionLabel>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ width: 42, height: 42, borderRadius: 13, display: 'grid', placeItems: 'center', background: '#F5F0FF', color: '#7158DC', fontSize: 17, fontWeight: 900 }}>1</div>
              <div style={{ flex: 1, minWidth: 220 }}>
                <h2 style={{ margin: '0 0 5px', color: '#1C1C1A', fontSize: 18 }}>{MISSIONS[0].title}</h2>
                <div style={{ fontSize: 12.5, color: '#6B6965', lineHeight: 1.65, marginBottom: 12 }}>{MISSIONS[0].description}</div>
                <Button onClick={openMission}>Start Mission 1</Button>
              </div>
              <div style={{ fontSize: 11.5, color: '#807B73', paddingTop: 4 }}>{MISSIONS[0].duration}</div>
            </div>
          </section>

          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
            <SectionLabel>Explore Academy</SectionLabel>
            <h2 style={{ margin: '0 0 5px', fontSize: 18, color: '#1C1C1A' }}>{COURSE.title}</h2>
            <p style={{ margin: '0 0 14px', fontSize: 12.5, color: '#6B6965', lineHeight: 1.6 }}>{COURSE.subtitle}</p>
            <div style={{ display: 'grid', gap: 8 }}>
              {MISSIONS.map((mission) => (
                <button
                  key={mission.key}
                  type="button"
                  onClick={mission.available ? openMission : undefined}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', padding: '10px 11px', borderRadius: 11,
                    border: mission.available ? '1px solid #D6E4D7' : '1px solid #E7E2D9',
                    background: mission.available ? '#F4F9F5' : '#FBFAF8',
                    cursor: mission.available ? 'pointer' : 'default',
                  }}
                >
                  <span style={{ width: 23, height: 23, borderRadius: 999, display: 'grid', placeItems: 'center', background: mission.available ? '#1D6B4F' : '#E9E5DD', color: mission.available ? '#FFFFFF' : '#777168', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{mission.number}</span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontSize: 12.5, color: '#24221E', fontWeight: 800 }}>{mission.title}</span>
                    <span style={{ display: 'block', marginTop: 2, fontSize: 11, color: '#78736C' }}>{mission.duration} · {mission.available ? 'Available now' : 'Coming next'}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </main>

        <aside style={{ display: 'grid', gap: 18 }}>
          <section className="p360-card" style={{ padding: 17, borderRadius: 18, background: '#FCFBF8' }}>
            <SectionLabel>Continue path</SectionLabel>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#1C1C1A', marginBottom: 6 }}>Your first opportunity journal</div>
            <p style={{ fontSize: 12, color: '#6B6965', lineHeight: 1.6, margin: '0 0 12px' }}>Capture the problems you have already noticed, then choose one to investigate.</p>
            <Button variant="secondary" onClick={openMission} style={{ width: '100%' }}>Continue Mission 1</Button>
          </section>

          <section className="p360-card" style={{ padding: 17, borderRadius: 18 }}>
            <SectionLabel>Founder Working Journal</SectionLabel>
            <div style={{ fontSize: 13, color: '#3B3833', fontWeight: 800, marginBottom: 6 }}>Keep evidence with your decisions</div>
            <p style={{ fontSize: 12, color: '#6B6965', lineHeight: 1.6, margin: '0 0 12px' }}>Each save creates a versioned mission artefact, ready to revisit as your thinking evolves.</p>
            <Button variant="secondary" onClick={openMission} style={{ width: '100%' }}>Open journal entry</Button>
          </section>

          <section style={{ border: '1px solid #E7E0D4', borderRadius: 15, padding: 14, background: '#F8F6F1' }}>
            <div style={{ fontSize: 11.5, fontWeight: 800, color: '#6E665A', marginBottom: 4 }}>About this MVP</div>
            <div style={{ fontSize: 11.5, lineHeight: 1.55, color: '#777168' }}>{COURSE.stage} · {COURSE.duration} · Six missions, beginning with one complete working mission.</div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function MissionOne({ work, updateWork, progress, loadingJournal, saving, uploading, latestVersion, journalVersions, notice, error, onBack, onSave, onUpload, completionReady, onContinue }) {
  const currentStatus = statusColor(work.status)

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <button type="button" onClick={onBack} style={{ border: 0, padding: 0, marginBottom: 14, background: 'transparent', color: '#7158DC', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>← Back to Academy</button>

      <header style={{ padding: '20px 21px', borderRadius: 18, background: '#F5F0FF', border: '1px solid #DDD1FF', marginBottom: 18 }}>
        <SectionLabel>Mission 1 · {MISSIONS[0].duration}</SectionLabel>
        <h1 style={{ margin: '0 0 7px', color: '#2E2940', fontSize: 24, letterSpacing: '-0.03em' }}>You do not need a perfect idea to begin</h1>
        <p style={{ margin: 0, maxWidth: 700, color: '#5D566E', fontSize: 13, lineHeight: 1.7 }}>The earliest useful founder work is not defending a solution. It is noticing a real problem clearly enough to investigate it.</p>
      </header>

      {error ? <div style={{ marginBottom: 14, padding: 12, borderRadius: 11, background: '#FBECEC', border: '1px solid #E8CACA', color: '#8A2F2F', fontSize: 12.5, lineHeight: 1.55 }}>{error}</div> : null}
      {notice ? <div style={{ marginBottom: 14, padding: 12, borderRadius: 11, background: '#EEF4EF', border: '1px solid #D6E4D7', color: '#1D6B4F', fontSize: 12.5, lineHeight: 1.55 }}>{notice}</div> : null}

      {completionReady ? (
        <section
          style={{
            marginBottom: 18,
            padding: 18,
            borderRadius: 16,
            border: '1px solid #BFD9C7',
            background: '#EEF7F1',
            display: 'flex',
            gap: 14,
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontSize: 10.5,
                color: '#1D6B4F',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 5,
              }}
            >
              Mission complete
            </div>

            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: '#19563E',
                marginBottom: 4,
              }}
            >
              You have created your first evidence-backed opportunity record.
            </div>

            <div
              style={{
                fontSize: 12.5,
                color: '#4E6A5A',
                lineHeight: 1.55,
              }}
            >
              Next, learn how to separate ordinary complaints from friction
              worth investigating.
            </div>
          </div>

          <Button variant="green" onClick={onContinue}>
            Continue to Mission 2 →
          </Button>
        </section>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 255px', gap: 18, alignItems: 'start' }}>
        <main style={{ display: 'grid', gap: 18 }}>
          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
            <SectionLabel>Learn</SectionLabel>
            <h2 style={{ fontSize: 17, margin: '0 0 8px', color: '#1C1C1A' }}>A PATH360 guide</h2>
            <div style={{ fontSize: 13, color: '#55514B', lineHeight: 1.75 }}>
              <p style={{ margin: '0 0 10px' }}>Strong ventures rarely begin with certainty. They begin when a founder notices an unmet need, recurring workaround, delay, cost, or frustration and becomes curious about it.</p>
              <p style={{ margin: 0 }}>For now, do not try to prove that your idea is brilliant. Record what you have observed, who experiences it, and why it may be worth understanding better. Evidence comes after attention.</p>
            </div>
          </section>

          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
            <SectionLabel>Think</SectionLabel>
            <JournalField
              label="What friction or problem keeps catching your attention?"
              hint="Describe the situation before describing your product or solution."
              value={work.reflection}
              onChange={(event) => updateWork('reflection', event.target.value)}
              placeholder="I keep noticing that…"
            />
          </section>

          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
            <SectionLabel>Do</SectionLabel>
            <h2 style={{ fontSize: 17, margin: '0 0 6px', color: '#1C1C1A' }}>Record three observed problems or friction points</h2>
            <p style={{ fontSize: 12.5, margin: '0 0 14px', color: '#6B6965', lineHeight: 1.6 }}>Use concrete observations. A good starting point is something you saw, experienced, heard repeatedly, or watched someone work around.</p>
            <div style={{ display: 'grid', gap: 12 }}>
              <JournalField label="Observation 1" value={work.problemOne} onChange={(event) => updateWork('problemOne', event.target.value)} placeholder="For example: I watched…" rows={3} />
              <JournalField label="Observation 2" value={work.problemTwo} onChange={(event) => updateWork('problemTwo', event.target.value)} placeholder="Another friction point I noticed…" rows={3} />
              <JournalField label="Observation 3" value={work.problemThree} onChange={(event) => updateWork('problemThree', event.target.value)} placeholder="A third pattern or workaround…" rows={3} />
            </div>
          </section>

          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
            <SectionLabel>Evidence</SectionLabel>
            <p style={{ margin: '0 0 12px', fontSize: 12.5, color: '#6B6965', lineHeight: 1.6 }}>Optional: attach interview notes, a photo, a research document, or a shareable evidence link. Saving the mission preserves this with the versioned artefact.</p>
            <div style={{ display: 'grid', gap: 10 }}>
              <input
                value={work.evidenceUrl}
                onChange={(event) => updateWork('evidenceUrl', event.target.value)}
                placeholder="Paste an evidence or document link"
                type="url"
                style={{ width: '100%', boxSizing: 'border-box', height: 42, borderRadius: 10, border: '1px solid #D9D4CA', padding: '0 11px', fontSize: 12.5 }}
              />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #D9D4CA', background: '#FFFFFF', borderRadius: 10, padding: '9px 11px', color: '#514C45', fontSize: 12.5, fontWeight: 800, cursor: uploading ? 'default' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
                  <input type="file" onChange={onUpload} disabled={uploading} style={{ display: 'none' }} />
                  {uploading ? 'Uploading…' : 'Upload document'}
                </label>
                {work.evidenceName ? <span style={{ fontSize: 11.5, color: '#5E685F' }}>Attached: {work.evidenceName}</span> : null}
              </div>
            </div>
          </section>

          <section className="p360-card" style={{ padding: 18, borderRadius: 18 }}>
            <SectionLabel>Decide</SectionLabel>
            <JournalField label="What do I want to investigate next?" hint="Choose one small learning question or next conversation, not a large build task." value={work.decision} onChange={(event) => updateWork('decision', event.target.value)} placeholder="Next, I want to investigate whether…" />
          </section>

          <section style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap', paddingBottom: 30 }}>
            <Button variant="secondary" onClick={onBack}>Save later</Button>
            <Button variant="green" onClick={onSave} disabled={saving || loadingJournal}>{saving ? 'Saving…' : 'Save to Founder Working Journal'}</Button>
          </section>
        </main>

        <aside style={{ position: 'sticky', top: 18, display: 'grid', gap: 14 }}>
          <section className="p360-card" style={{ padding: 16, borderRadius: 16 }}>
            <SectionLabel>Mission status</SectionLabel>
            <div style={{ height: 7, borderRadius: 99, background: '#ECE8E0', overflow: 'hidden', marginBottom: 8 }}><div style={{ height: '100%', width: `${progress}%`, background: '#1D6B4F', borderRadius: 99 }} /></div>
            <div style={{ fontSize: 11.5, color: '#777168', marginBottom: 12 }}>{progress}% of the mission workflow complete</div>
            <div style={{ display: 'grid', gap: 7 }}>
              {STATUS_OPTIONS.map((option) => {
                const selected = work.status === option.value
                return (
                  <button key={option.value} type="button" onClick={() => updateWork('status', option.value)} style={{ textAlign: 'left', padding: 9, borderRadius: 10, border: selected ? `1px solid ${statusColor(option.value).border}` : '1px solid #E5E0D7', background: selected ? statusColor(option.value).bg : '#FFFFFF', cursor: 'pointer' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: selected ? statusColor(option.value).text : '#3E3A34' }}>{option.label}</div>
                    <div style={{ marginTop: 2, fontSize: 10.5, color: '#777168', lineHeight: 1.4 }}>{option.description}</div>
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: 12, borderRadius: 9, padding: '8px 9px', background: currentStatus.bg, color: currentStatus.text, fontSize: 11.5, fontWeight: 800 }}>Current status: {STATUS_OPTIONS.find((item) => item.value === work.status)?.label}</div>
          </section>

          <section className="p360-card" style={{ padding: 16, borderRadius: 16 }}>
            <SectionLabel>Journal versions</SectionLabel>
            {loadingJournal ? <div style={{ fontSize: 12, color: '#777168' }}>Loading your work…</div> : null}
            {!loadingJournal && journalVersions.length === 0 ? <div style={{ fontSize: 12, color: '#777168', lineHeight: 1.55 }}>No saved version yet. Your first save will create Version 1.</div> : null}
            {!loadingJournal && journalVersions.length > 0 ? <div style={{ display: 'grid', gap: 7 }}>{journalVersions.slice(0, 4).map((version) => <div key={version.id} style={{ padding: 8, border: '1px solid #E7E2D9', borderRadius: 9, background: '#FBFAF8' }}><div style={{ fontSize: 11.5, fontWeight: 800, color: '#403B35' }}>Version {version.version}</div><div style={{ marginTop: 2, fontSize: 10.5, color: '#79736B' }}>{new Date(version.created_at).toLocaleDateString()}</div></div>)}</div> : null}
            {latestVersion > 0 ? <div style={{ marginTop: 9, fontSize: 10.5, color: '#777168' }}>Saving again creates Version {latestVersion + 1}.</div> : null}
          </section>
        </aside>
      </div>
    </div>
  )
}

function ComingSoonMission({ mission, onBack }) {
  return (
    <div style={{ padding: 24, maxWidth: 760, margin: '0 auto', fontFamily: "'Inter', 'DM Sans', sans-serif" }}>
      <button type="button" onClick={onBack} style={{ border: 0, padding: 0, marginBottom: 18, background: 'transparent', color: '#7158DC', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>← Back to Academy</button>
      <div className="p360-card" style={{ padding: 24, borderRadius: 18 }}>
        <SectionLabel>Mission {mission.number}</SectionLabel>
        <h1 style={{ margin: '0 0 8px', fontSize: 22, color: '#1C1C1A' }}>{mission.title}</h1>
        <p style={{ margin: '0 0 16px', color: '#6B6965', lineHeight: 1.65, fontSize: 13 }}>{mission.description}</p>
        <div style={{ borderRadius: 11, padding: 12, background: '#F7F5EF', border: '1px solid #E7E0D4', fontSize: 12.5, color: '#676158' }}>This mission is outlined in the first Academy course and will use the same Learn, Think, Do, Evidence, Decide framework once Mission 1 is validated end-to-end.</div>
      </div>
    </div>
  )
}