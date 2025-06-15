// API route: /api/ai-suggestions/route.js
// Purpose: Suggest high-quality online resources for a question using OpenAI's GPT-3.5-turbo model.
// Input: { question: string, description: string } in POST body
// Output: { suggestions: Array<{title, description, url}> } in JSON response
// Errors: Returns an empty array if the API fails or the response cannot be parsed

import { NextResponse } from 'next/server';

export async function POST(req) {
  // Parse question and description from the request body
  const { question, description } = await req.json();
  console.log('Received request for AI suggestions:', { question, description });

  // Build the prompt for the AI model
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
    // Log API key presence and prompt for debugging
    console.log('OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    console.log('Sending prompt to OpenAI:', prompt);
    // Call OpenAI API
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

    // Log response status for debugging
    console.log(`OpenAI API Response Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      // Log and return empty suggestions on API error
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
      const errorBody = await response.text();
      console.error('OpenAI error details:', errorBody);
      console.log('Returning empty suggestions due to OpenAI API error.');
      return NextResponse.json({ suggestions: [] });
    }

    // Parse the response from OpenAI
    const data = await response.json();
    console.log('Raw data from OpenAI response.json():', JSON.stringify(data, null, 2));

    // Extract the AI's content (should be a JSON array)
    let suggestions = [];
    const aiContent = data.choices?.[0]?.message?.content;
    console.log('AI Content to parse:', aiContent);

    try {
      // Try to parse the AI's content as JSON
      suggestions = JSON.parse(aiContent || '[]');
      console.log('Successfully parsed AI suggestions:', suggestions);
    } catch (parseError) {
      // Log and return empty suggestions on parse error
      console.error('Error parsing OpenAI response content:', parseError);
      suggestions = [];
      console.log('Returning empty suggestions due to JSON parsing error.');
    }

    // Return the suggestions as JSON
    console.log('Final suggestions to return:', suggestions);
    return NextResponse.json({ suggestions });
  } catch (err) {
    // Log and return empty suggestions on unexpected error
    console.error('Error in AI suggestions API route (outer catch):', err);
    console.log('Returning empty suggestions due to unexpected error.');
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
} 