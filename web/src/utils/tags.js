export function addTag(tags, tag) {
  if (tag && !tags.includes(tag)) {
    return [...tags, tag];
  }
  return tags;
}

export function removeTag(tags, tagToRemove) {
  return tags.filter(tag => tag !== tagToRemove);
} 