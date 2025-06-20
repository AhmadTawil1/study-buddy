// src/services/aiService.js
//
// This service handles AI-related functionality for the StudyBuddy platform.
// Currently provides question rephrasing capabilities using OpenAI API.
//
// Features:
// - Question rephrasing for better clarity
// - Error handling for API failures
// - Consistent error message formatting

/**
 * Rephrases a question using the OpenAI API to improve clarity and readability
 * @param {string} prompt - The original question text to be rephrased
 * @returns {Promise<string>} The rephrased question or error message
 */
export async function rephraseQuestion(prompt) {
  try {
    // Make API call to the rephrase endpoint
    const res = await fetch('/api/rephrase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    // Parse the JSON response
    const data = await res.json()

    // Check if the API returned an error
    if (data.error) {
      return `OpenAI Error: ${data.error}`
    }

    // Return the rephrased text or a fallback message if empty
    return data.rephrased || ' Rephrase failed: Empty response'
  } catch (err) {
    // Log the error for debugging
    console.error(' Failed to call rephrase API:', err)
    // Return a user-friendly error message
    return ' Rephrase failed: API error'
  }
}
