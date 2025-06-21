import { ACTIVITY_TYPES } from '@/src/constants/profileConfig'

/**
 * Builds recent activity from questions and answers data
 * @param {Array} myQuestions - Array of user's questions
 * @param {Array} myAnswers - Array of user's answers
 * @param {number} limit - Maximum number of activities to return
 * @returns {Array} Sorted array of recent activities
 */
export function buildRecentActivity(myQuestions = [], myAnswers = [], limit = 6) {
  const activities = [
    ...myQuestions.map(q => ({
      type: 'asked',
      description: `Asked: ${q.title}`,
      time: q.createdAt,
    })),
    ...myAnswers.map(a => ({
      type: 'answered',
      description: `Answered: ${a.questionTitle || a.content?.substring(0, 50) + '...'}`,
      time: a.createdAt,
    })),
  ]
  
  return sortActivityByDate(activities).slice(0, limit)
}

/**
 * Sorts activities by date (most recent first)
 * @param {Array} activities - Array of activity objects
 * @returns {Array} Sorted array of activities
 */
export function sortActivityByDate(activities) {
  return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
}

/**
 * Determines if the current user is the owner of the profile
 * @param {Object} user - Current authenticated user
 * @param {string} userId - Profile user ID
 * @param {string} propUserId - Prop user ID
 * @returns {boolean} True if user is the owner
 */
export function isProfileOwner(user, userId, propUserId) {
  return user && userId === user.uid
}

/**
 * Formats a stat value based on its type
 * @param {string} statKey - The stat key
 * @param {number} value - The stat value
 * @returns {string} Formatted value
 */
export function formatStatValue(statKey, value) {
  if (statKey === 'averageRating') {
    return value.toFixed(1)
  }
  if (statKey === 'rank') {
    return `#${value}`
  }
  return value.toString()
} 