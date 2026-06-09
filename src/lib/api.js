const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function postJSON(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.detail || `Request failed: ${res.status}`)
  }

  return await res.json()
}