export async function rephraseQuestion(prompt) {
  try {
    const res = await fetch('/api/rephrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    const data = await res.json()
    console.log('🔥 Server response:', data)

    if (data.error) {
      return `OpenAI Error: ${data.error.message}`
    }

    return data.choices?.[0]?.message?.content || 'Could not rephrase (empty)'
  } catch (err) {
    console.error('❌ Failed to call rephrase API:', err)
    return 'Could not rephrase (API error)'
  }
}
