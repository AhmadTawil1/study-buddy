import { NextResponse } from 'next/server';

export async function POST(req) {
  const { question, description } = await req.json();

  const prompt = `
You are an expert tutor. Suggest 3-5 high-quality, relevant online resources (videos, articles, or documentation) for the following question. 
For each, provide a title, a short description, and a direct link. 
Format your response as a JSON array like:
[
  { "title": "...", "description": "...", "url": "..." },
  ...
]

Question: ${question}
Description: ${description}
`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    })
  });
  const data = await response.json();
  let suggestions = [];
  try {
    suggestions = JSON.parse(data.choices?.[0]?.message?.content || '[]');
  } catch {
    suggestions = [];
  }

  return NextResponse.json({ suggestions });
} 