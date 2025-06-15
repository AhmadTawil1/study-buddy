// API route: /api/rephrase/route.js
// Purpose: Rephrase unclear student question descriptions using OpenAI's GPT-3.5-turbo model.
// Input: { prompt: string } in POST body
// Output: { rephrased: string } in JSON response
// Errors: Returns error message and status 500 if the API fails

import { NextResponse } from 'next/server'

export async function POST(req) {
  try {
    // Parse the prompt from the request body
    const { prompt } = await req.json()

    // Call OpenAI API to rephrase the prompt
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

    // Read and log the raw response for debugging
    const resText = await res.text();
    console.log('Raw OpenAI API response:', resText);

    // Parse the response as JSON
    const data = JSON.parse(resText);
    // Extract the rephrased message
    const message = data.choices?.[0]?.message?.content?.trim()

    // Return the rephrased message as JSON
    return NextResponse.json({ rephrased: message })
  } catch (err) {
    // Log and return error message on failure
    console.error('❌ Error in /api/rephrase:', err)
    return NextResponse.json({ error: 'Failed to rephrase' }, { status: 500 })
  }
}
