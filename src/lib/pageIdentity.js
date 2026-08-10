export function getPageIdentity(pathname) {
  if (pathname.startsWith('/app/stage-onboarding')) {
    return {
      eyebrow: 'Founder baseline',
      title: 'Where is your venture today?',
      description:
        'Capture your current stage and evidence so PATH360 can guide the next move with more relevance.',
      accent: '#7158DC',
      softBg: '#F5F0FF',
      border: '#E2D8FF',
      status: 'Personalised baseline',
    }
  }

  if (pathname.startsWith('/app/dashboard')) {
    return {
      eyebrow: 'Command Center',
      title: 'Founder dashboard',
      description:
        'Track where your venture stands, what matters next, and which signals deserve attention.',
      accent: '#1D6B4F',
      softBg: '#EDF6F0',
      border: '#CEE4D6',
      status: 'Your operating view',
    }
  }

  if (pathname.startsWith('/app/assessment')) {
    return {
      eyebrow: 'Diagnostic',
      title: 'Founder assessment',
      description:
        'Build a sharper baseline of investor readiness, operating maturity, and strategic gaps.',
      accent: '#7158DC',
      softBg: '#F5F0FF',
      border: '#E2D8FF',
      status: 'Founder intelligence',
    }
  }

  if (pathname.startsWith('/app/founder-profile')) {
    return {
      eyebrow: 'Venture profile',
      title: 'Your strategic source of truth',
      description:
        'Maintain the core founder and venture context that personalises every PATH360 diagnosis, signal, and investor output.',
      accent: '#4D6B57',
      softBg: '#F1F5F1',
      border: '#D8E2D9',
      status: 'Powers your workspace',
    }
  }

  if (pathname.startsWith('/app/studio')) {
    return {
      eyebrow: 'Creation Studio',
      title: 'Turn clarity into useful work',
      description:
        'Create investor materials, strategic documents, and guided working assets from your founder intelligence.',
      accent: '#0F5E64',
      softBg: '#EEF7F8',
      border: '#D1E7E9',
      status: 'Build from insight',
    }
  }

  if (pathname.startsWith('/app/memory')) {
    return {
      eyebrow: 'Decisions & Insights',
      title: 'Your venture narrative, captured over time',
      description:
        'Keep important investor feedback, decisions, milestones, and founder reflections connected to your evolving story.',
      accent: '#7158DC',
      softBg: '#F5F0FF',
      border: '#E2D8FF',
      status: 'Your working context',
    }
  }

  if (pathname.startsWith('/app/radar')) {
    return {
      eyebrow: 'Venture Radar',
      title: 'Signals that deserve attention',
      description:
        'See what PATH360 is noticing about your readiness, momentum, risks, and most useful next move.',
      accent: '#2E5EAA',
      softBg: '#EFF4FB',
      border: '#D6E3F5',
      status: 'Evidence-led signals',
    }
  }

  if (pathname.startsWith('/app/academy')) {
    return {
      eyebrow: 'Founder learning path',
      title: 'Build the capability your venture needs next',
      description:
        'Learn through short, practical lessons matched to your stage, assessment signals, and immediate founder priorities.',
      accent: '#7158DC',
      softBg: '#F5F0FF',
      border: '#E2D8FF',
      status: 'Personalised learning',
    }
  }

  if (pathname.startsWith('/app/reports')) {
    return {
      eyebrow: 'Reports & files',
      title: 'Your founder work, ready to use again',
      description:
        'Review generated outputs, saved drafts, and important source materials without losing the context behind them.',
      accent: '#6A5A4D',
      softBg: '#F6F2ED',
      border: '#E7DED4',
      status: 'Your working library',
    }
  }

  return {
    eyebrow: 'Workspace',
    title: 'Founder workspace',
    description:
      'Keep your venture context together and move from clarity to practical execution.',
    accent: '#1D6B4F',
    softBg: '#EDF6F0',
    border: '#CEE4D6',
    status: 'PATH360 workspace',
  }
}