import { postJSON } from './api'

export async function askStrategist({ agentType, founderContext, messages }) {
  const data = await postJSON('/api/ai/chat', {
    agentType,
    founderContext,
    messages,
  })

  return data.text
}

export async function scoreAssessment({ founderProfile, qaPairs }) {
  const data = await postJSON('/api/assessment/score', {
    founderProfile,
    qaPairs,
  })

  return data
}