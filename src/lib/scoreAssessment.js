import { askGemini } from './geminiClient.js'

/**
 * Processes the matrix scores deterministically to find baseline parameters,
 * and passes the full structured analysis over to Gemini.
 * 
 * @param {Object} answers - The raw 1-4 selection scores from the founder matrix.
 * @param {string} journalText - Unstructured text notes from the founder's journal section.
 * @returns {Promise<Object>} The combined object containing both the AI text feedback and computed metrics.
 */
export async function scoreAssessment(answers, journalText = '') {
  
  // 1. Calculate individual category weights to drive specific dashboard dials
  const investorReadyScore = Math.round(((answers.score_capital_readiness || answers.capital_readiness || 1) / 4) * 100)
  const executionScore = Math.round(((answers.score_market_traction || answers.market_traction || 1) / 4) * 100)
  const financialScore = Math.round(((answers.score_business_model || answers.business_model || 1) / 4) * 100)
  
  // 2. Weights your Venture Radar vectors (Economics and Traction carry massive importance)
  const weights = {
    score_problem_clarity: 0.10,
    score_customer_evidence: 0.15,
    score_solution_readiness: 0.15,
    score_business_model: 0.20,
    score_market_traction: 0.20,
    score_team_readiness: 0.10,
    score_capital_readiness: 0.10
  }

  let totalWeightedPoints = 0
  for (const track in weights) {
    // Check for both table snake_case format and direct parameter keys
    const scoreVal = answers[track] || answers[track.replace('score_', '')] || 1
    const normalizedScore = (scoreVal - 1) / 3 
    totalWeightedPoints += normalizedScore * weights[track]
  }

  const masterReadinessPercentage = Math.round(totalWeightedPoints * 100)

  // 3. Assemble the prompt context layer explicitly optimized for the funding environment
  const prompt = `
You are an elite venture capitalist and startup strategist conducting preliminary due diligence within a supportive workspace.

Analyze this founder operational assessment tracking matrix and their private structural reflections.

FOUNDER INPUT DETAILS:
- Computed Master Readiness: ${masterReadinessPercentage}%
- Tech/Solution Readiness Level: ${answers.score_solution_readiness || answers.solution_readiness || 1} / 4
- Customer Evidence Capture Level: ${answers.score_customer_evidence || answers.customer_evidence || 1} / 4
- Market Traction Deployment Level: ${answers.score_market_traction || answers.market_traction || 1} / 4
- Open Journal Reflective Context: "${journalText}"

Raw Numerical Score Context Structure:
${JSON.stringify(answers, null, 2)}

CRITICAL RESPONSE EXTRACTION CRITERIA:
- Evaluate potential traps (e.g. if code/tech level is high but customer feedback loops are unstarted or low).
- Isolate whether their text response reflects verifiable customer actions or abstract unmeasured hype.
- Keep your tone objective, direct, and supportive.

Return clean, structured analysis covering:
- overall score out of 100 (align precisely around ${masterReadinessPercentage}%)
- investor readiness
- founder strengths
- biggest risks
- strategic recommendation for their next tactical asset build
`

  const result = await askGemini(prompt)

  // Return both the clean text evaluation block and the structured score matrix values
  return {
    aiEvaluation: result,
    calculatedMetrics: {
      masterReadiness: masterReadinessPercentage,
      investorReady: investorReadyScore,
      execution: executionScore,
      financial: financialScore
    }
  }
}
