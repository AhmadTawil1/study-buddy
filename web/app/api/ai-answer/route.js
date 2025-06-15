// API route: /api/ai-answer/route.js
// Purpose: Generate an AI answer to a question using OpenAI's GPT-3.5-turbo model.
// Input: { question: string } in POST body
// Output: { answer: string } in JSON response
// Errors: Returns a fallback answer if the API fails

import { NextResponse } from 'next/server';

export async function POST(req) {
  // Parse the question from the request body
  const { question } = await req.json();

  // Call OpenAI API to generate an answer
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: question }],
      max_tokens: 300
    })
  });

  // Parse the response from OpenAI
  const data = await response.json();
  // Extract the answer or provide a fallback
  const aiAnswer = data.choices?.[0]?.message?.content || 'Sorry, I could not generate an answer.';

  // Return the answer as JSON
  return NextResponse.json({ answer: aiAnswer });
} 