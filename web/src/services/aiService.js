// src/services/aiService.js
export async function rephraseQuestion(prompt) {
  try {
    const res = await fetch('/api/rephrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    const data = await res.json()

    if (data.error) {
      return `OpenAI Error: ${data.error}`
    }

    return data.rephrased || ' Rephrase failed: Empty response'
  } catch (err) {
    console.error(' Failed to call rephrase API:', err)
    return ' Rephrase failed: API error'
  }
}
