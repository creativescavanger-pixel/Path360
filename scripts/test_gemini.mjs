#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const envPath = path.resolve(process.cwd(), '.env')
if (!fs.existsSync(envPath)) {
  console.error('.env not found in project root')
  process.exit(1)
}
const env = fs.readFileSync(envPath, 'utf8')
const kv = Object.fromEntries(
  env
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => {
      const idx = l.indexOf('=')
      const k = l.slice(0, idx)
      const v = l.slice(idx + 1)
      return [k, v]
    })
)

const API_KEY = (kv.VITE_GEMINI_API_KEY || '').trim()
if (!API_KEY) {
  console.error('VITE_GEMINI_API_KEY not found in .env')
  process.exit(1)
}

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'
const prompt = 'Test ping from PATH360: Please respond with a short Hello message.'

try {
  const res = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        { parts: [ { text: prompt } ] }
      ]
    }),
  })

  console.log('HTTP status:', res.status)
  const body = await res.text()
  try {
    console.log('Response JSON:', JSON.stringify(JSON.parse(body), null, 2))
  } catch {
    console.log('Response text:', body)
  }
} catch (err) {
  console.error('Request failed:', err)
  process.exit(1)
}
