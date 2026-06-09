const API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY

const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export async function askGemini(prompt) {
  try {
    const response = await fetch(
      `${API_URL}?key=${API_KEY}`,
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      }
    )

    if (!response.ok) {
      throw new Error(
        'Gemini request failed'
      )
    }

    const data =
      await response.json()

    return (
      data?.candidates?.[0]
        ?.content?.parts?.[0]
        ?.text || ''
    )
  } catch (err) {
    console.error(err)
    throw err
  }
}