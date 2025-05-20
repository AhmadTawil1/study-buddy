export async function POST(req) {
  const { prompt } = await req.json()

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: `Rephrase this question: ${prompt}` }],
      temperature: 0.7,
    }),
  })

  const data = await res.json()

  return Response.json(data)
}
