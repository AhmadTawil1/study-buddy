// app/api/rephrase/route.js
import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    const { prompt } = await req.json()

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You rephrase unclear student question descriptions into clearer versions.' },
          { role: 'user', content: `Rephrase this: ${prompt}` }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    })

    const resText = await res.text();
    console.log('Raw OpenAI API response:', resText);

    const data = JSON.parse(resText);
    const message = data.choices?.[0]?.message?.content?.trim()

    return NextResponse.json({ rephrased: message })
  } catch (err) {
    console.error('❌ Error in /api/rephrase:', err)
    return NextResponse.json({ error: 'Failed to rephrase' }, { status: 500 })
  }
}
