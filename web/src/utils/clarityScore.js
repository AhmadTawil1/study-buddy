export default function calculateClarityScore(text) {
  let score = 5;
  if (text.length < 20) score += 1;
  if (text.includes('?')) score += 1;
  if (text.includes('how') || text.includes('what') || text.includes('why') || text.includes('How') || text.includes('What') || text.includes('Why')) score += 1;
  return Math.min(10, score);
} 