import { NextResponse } from 'next/server';

export async function POST(req) {
  const { question, description } = await req.json();
  console.log('Received request for AI suggestions:', { question, description });

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

  try {
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('Sending prompt to OpenAI:', prompt);
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

    console.log(`OpenAI API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('OpenAI error details:', errorBody);
      console.log('Returning empty suggestions due to OpenAI API error.');
      return NextResponse.json({ suggestions: [] }); // Return empty suggestions on API error
    }

    const data = await response.json();
    console.log('Raw data from OpenAI response.json():', JSON.stringify(data, null, 2));

    let suggestions = [];
    const aiContent = data.choices?.[0]?.message?.content;
    console.log('AI Content to parse:', aiContent);

    try {
      suggestions = JSON.parse(aiContent || '[]');
      console.log('Successfully parsed AI suggestions:', suggestions);
    } catch (parseError) {
      console.error('Error parsing OpenAI response content:', parseError);
      suggestions = [];
      console.log('Returning empty suggestions due to JSON parsing error.');
    }

    console.log('Final suggestions to return:', suggestions);
    return NextResponse.json({ suggestions });
  } catch (err) {
    console.error('Error in AI suggestions API route (outer catch):', err);
    console.log('Returning empty suggestions due to unexpected error.');
    return NextResponse.json({ suggestions: [] }, { status: 500 }); // Handle unexpected errors
  }
} 