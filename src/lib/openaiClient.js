import { GoogleGenerativeAI } from '@google/generative-ai'

// ======================================================
// ENV
// ======================================================

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// ======================================================
// INIT
// ======================================================

if (!API_KEY) {
  console.error('Missing VITE_GEMINI_API_KEY in .env')
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

// ======================================================
// DEFAULT MODEL
// ======================================================

const DEFAULT_MODEL = 'gemini-2.0-flash'

// ======================================================
// HELPERS
// ======================================================

function buildPrompt(systemPrompt, messages = []) {
  const conversation = messages
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n\n')

  return `${systemPrompt}\n\n${conversation}`.trim()
}

// ======================================================
// MAIN CALL
// ======================================================

export async function callOpenAI({
  systemPrompt,
  messages = [],
  model = DEFAULT_MODEL,
}) {
  if (!genAI) {
    throw new Error('Missing VITE_GEMINI_API_KEY in .env')
  }

  try {
    const activeModel = genAI.getGenerativeModel({ model })
    const prompt = buildPrompt(systemPrompt, messages)

    const result = await activeModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return text
  } catch (error) {
    console.error('Gemini request failed:', error)
    throw error
  }
}

// ======================================================
// STREAM VERSION
// ======================================================

export async function callOpenAIStream({
  systemPrompt,
  messages = [],
  model = DEFAULT_MODEL,
  onChunk,
}) {
  if (!genAI) {
    throw new Error('Missing VITE_GEMINI_API_KEY in .env')
  }

  try {
    const activeModel = genAI.getGenerativeModel({ model })
    const prompt = buildPrompt(systemPrompt, messages)

    const result = await activeModel.generateContentStream(prompt)

    let fullText = ''

    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      if (!chunkText) continue

      fullText += chunkText

      if (onChunk) {
        onChunk(chunkText, fullText)
      }
    }

    return fullText
  } catch (error) {
    console.error('Gemini stream failed:', error)
    throw error
  }
}

export default callOpenAI