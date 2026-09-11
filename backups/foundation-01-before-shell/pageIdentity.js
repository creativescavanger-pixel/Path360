const DEFAULT_VISUALS = {
  accent: 'var(--green-700)',
  softBg: 'var(--green-050)',
  border: 'var(--border)',
}

const INVESTMENT_VISUALS = {
  accent: 'var(--investment-lilac-800)',
  softBg: 'var(--investment-lilac-050)',
  border: 'var(--investment-lilac-200)',
}

function pageIdentity(content, visuals = DEFAULT_VISUALS) {
  return {
    ...content,
    ...visuals,
  }
}

export function getPageIdentity(pathname) {
  if (pathname.startsWith('/app/stage-onboarding')) {
    return pageIdentity({
      eyebrow: 'Founder pathway',
      title: 'Where are you in your venture journey?',
      description:
        'Share your current situation, evidence, and priorities so PATH360 can recommend a useful starting point. You can explore every pathway at any time.',
      status: 'Choose your starting point',
    })
  }

  if (pathname.startsWith('/app/dashboard')) {
    return pageIdentity({
      eyebrow: 'Command Centre',
      title: 'Your founder workspace',
      description:
        'See your current focus, evidence, priorities, and the next decision that deserves attention.',
      status: 'Your operating view',
    })
  }

  if (pathname.startsWith('/app/assessment')) {
    return pageIdentity({
      eyebrow: 'Founder diagnostic',
      title: 'Understand your current readiness',
      description:
        'Review your evidence, capability, constraints, and strategic gaps to clarify the most useful next work.',
      status: 'Diagnostic review',
    })
  }

  if (pathname.startsWith('/app/priority-progress')) {
    return pageIdentity({
      eyebrow: 'Current priorities',
      title: 'Turn priorities into evidence-backed action',
      description:
        'Track what matters now, record the evidence behind your progress, and revisit priorities as your venture learns.',
      status: 'Active founder work',
    })
  }

  if (pathname.startsWith('/app/founder-profile')) {
    return pageIdentity({
      eyebrow: 'Venture profile',
      title: 'Your strategic source of truth',
      description:
        'Maintain the founder and venture context that helps PATH360 personalise pathways, recommendations, and outputs.',
      status: 'Powers your workspace',
    })
  }

  if (pathname.startsWith('/app/venture-intelligence-setup')) {
    return pageIdentity({
      eyebrow: 'Venture setup',
      title: 'Build your venture context',
      description:
        'Set up the market, operating context, model, resources, and constraints that shape your next founder decisions.',
      status: 'Founder baseline',
    })
  }

  if (pathname.startsWith('/app/venture-intelligence')) {
    return pageIdentity({
      eyebrow: 'Venture intelligence',
      title: 'Your venture context',
      description:
        'Review and update the market, venture model, operating structure, readiness, and resources guiding your next move.',
      status: 'Founder workspace',
    })
  }

  if (pathname.startsWith('/app/environment')) {
    return pageIdentity({
      eyebrow: 'Environment intelligence',
      title: 'Explore your operating environment',
      description:
        'Use market, ecosystem, country, policy, and opportunity signals to support the decision you are working on.',
      status: 'External context',
    })
  }

  if (pathname.startsWith('/app/memory')) {
    return pageIdentity({
      eyebrow: 'Decisions and insights',
      title: 'Your venture narrative, captured over time',
      description:
        'Keep founder reflections, evidence, decisions, milestones, and investor feedback connected to your evolving venture story.',
      status: 'Your working context',
    })
  }

  if (pathname.startsWith('/app/radar')) {
    return pageIdentity({
      eyebrow: 'Opportunity radar',
      title: 'Signals that deserve attention',
      description:
        'Review readiness, momentum, risks, and useful next actions based on the evidence in your workspace.',
      status: 'Evidence-led signals',
    })
  }

  if (pathname.startsWith('/app/academy')) {
    return pageIdentity({
      eyebrow: 'Academy · Founder workshops',
      title: 'Build the capability your venture needs next',
      description:
        'Learn through guided decisions, practical frameworks, real-world fieldwork, evidence, reflection, and useful outputs.',
      status: 'Your founder workshop',
    })
  }

  if (pathname.startsWith('/app/resources')) {
    return pageIdentity({
      eyebrow: 'Knowledge Library',
      title: 'Cases, frameworks, and resources for every stage',
      description:
        'Search and explore PATH360 knowledge across the full founder journey. Your current stage shapes recommendations, never access.',
      status: 'Explore all stages',
    })
  }

  if (pathname.startsWith('/app/studio')) {
    return pageIdentity({
      eyebrow: 'Creation Studio',
      title: 'Turn founder work into useful outputs',
      description:
        'Create practical documents, plans, reports, pitch materials, and working assets from your saved source work.',
      status: 'Build from evidence',
    })
  }

  if (pathname.startsWith('/app/reports')) {
    return pageIdentity({
      eyebrow: 'Reports and outputs',
      title: 'Your founder work, ready to use again',
      description:
        'Review generated outputs, saved drafts, and source materials without losing the evidence and decisions behind them.',
      status: 'Your working records',
    })
  }

  // Reserved only for current or future dedicated funding/investment workflows.
  if (
    pathname.startsWith('/app/investment-readiness') ||
    pathname.startsWith('/app/funding') ||
    pathname.startsWith('/app/capital')
  ) {
    return pageIdentity(
      {
        eyebrow: 'Investment readiness',
        title: 'Prepare a credible capital narrative',
        description:
          'Bring together evidence, venture strategy, financial logic, and investor-facing materials for funding and diligence work.',
        status: 'Capital and diligence',
      },
      INVESTMENT_VISUALS,
    )
  }

  return pageIdentity({
    eyebrow: 'PATH360 workspace',
    title: 'Your founder workspace',
    description:
      'Keep your venture context together and move from uncertainty to informed action.',
    status: 'PATH360 workspace',
  })
}