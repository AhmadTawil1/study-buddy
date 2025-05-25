/**
 * Formats a JS Date object into a readable string (e.g., "Jan 1, 2024")
 * @param {Date} date
 * @returns {string}
 */
export default function formatDate(date) {
  if (!date) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
