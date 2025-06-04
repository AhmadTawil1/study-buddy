export default function calculateClarityScore(text) {
  let score = 5;
  if (text.length > 20) score += 1;
  if (text.includes('?')) score += 1;
  if (text.includes('how') || text.includes('what') || text.includes('why')) score += 1;
  if (text.length > 50) score += 1;
  return Math.min(10, score);
} 