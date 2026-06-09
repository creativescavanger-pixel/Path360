import { askGemini }
  from './geminiClient.js'

export async function scoreAssessment(
  answers
) {
  const prompt = `
You are an elite venture capitalist and startup strategist.

Analyze this founder assessment.

Return:
- overall score out of 100
- investor readiness
- founder strengths
- biggest risks
- strategic recommendation

Assessment:
${JSON.stringify(
  answers,
  null,
  2
)}
`

  const result =
    await askGemini(prompt)

  return result
}