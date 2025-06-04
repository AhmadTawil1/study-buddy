export default function pluralize(count, singular, plural = null) {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural || singular + 's'}`;
} 