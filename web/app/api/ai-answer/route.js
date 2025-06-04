import { NextResponse } from 'next/server';

export async function POST(req) {
  const { question } = await req.json();

  // Call OpenAI API (replace with Gemini or other provider if needed)
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
  const data = await response.json();
  const aiAnswer = data.choices?.[0]?.message?.content || 'Sorry, I could not generate an answer.';

  return NextResponse.json({ answer: aiAnswer });
} 