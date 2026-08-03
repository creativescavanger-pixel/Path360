export function getPageIdentity(pathname) {
  if (pathname.startsWith('/app/dashboard')) {
    return {
      eyebrow: 'Command Center',
      title: 'Founder dashboard',
      description: 'Track where your venture stands, what matters next, and which signals deserve attention.',
      accent: '#1D6B4F',
      softBg: '#EDF6F0',
      border: '#CEE4D6',
    }
  }

  if (pathname.startsWith('/app/assessment')) {
    return {
      eyebrow: 'Diagnostic',
      title: 'Founder assessment',
      description: 'Build a sharper baseline of investor readiness, operating maturity, and strategic gaps.',
      accent: '#8A6E2A',
      softBg: '#FCF8EE',
      border: '#EEE4C9',
    }
  }

  if (pathname.startsWith('/app/studio')) {
    return {
      eyebrow: 'Creation Studio',
      title: 'Practical outputs',
      description: 'Turn founder intelligence into documents, investor materials, and guided working assets.',
      accent: '#0F5E64',
      softBg: '#EEF7F8',
      border: '#D1E7E9',
    }
  }

  if (pathname.startsWith('/app/memory')) {
    return {
      eyebrow: 'Memory',
      title: 'Founder memory',
      description: 'Preserve key venture facts, milestones, decisions, and context across the founder journey.',
      accent: '#7D4C8E',
      softBg: '#F5F0F9',
      border: '#E2D4EC',
    }
  }

  if (pathname.startsWith('/app/radar')) {
    return {
      eyebrow: 'Radar',
      title: 'Signal interpretation',
      description: 'See what Path360 is noticing about your business, your readiness, and your momentum.',
      accent: '#2E5EAA',
      softBg: '#EFF4FB',
      border: '#D6E3F5',
    }
  }

  if (pathname.startsWith('/app/reports')) {
    return {
      eyebrow: 'Reports',
      title: 'Saved work',
      description: 'Review generated outputs, revisit materials, and keep a structured record of your progress.',
      accent: '#6A5A4D',
      softBg: '#F6F2ED',
      border: '#E7DED4',
    }
  }

  if (pathname.startsWith('/app/founder-profile')) {
    return {
      eyebrow: 'Profile',
      title: 'Founder profile',
      description: 'Maintain the core facts, context, and positioning that shape every Path360 diagnosis.',
      accent: '#4D6B57',
      softBg: '#F1F5F1',
      border: '#D8E2D9',
    }
  }

  return {
    eyebrow: 'Workspace',
    title: 'Founder workspace',
    description: 'Navigate your venture journey, keep context together, and move from clarity to execution.',
    accent: '#1D6B4F',
    softBg: '#EDF6F0',
    border: '#CEE4D6',
  }
}