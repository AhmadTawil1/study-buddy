import { 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  TrophyIcon
} from '@heroicons/react/24/outline'

export const STAT_TYPES = {
  QUESTIONS_ASKED: {
    key: 'questionsAsked',
    label: 'Questions Asked',
    icon: QuestionMarkCircleIcon,
    color: 'indigo',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    valueColor: 'text-indigo-700'
  },
  QUESTIONS_ANSWERED: {
    key: 'questionsAnswered',
    label: 'Questions Answered',
    icon: ChatBubbleLeftRightIcon,
    color: 'emerald',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    valueColor: 'text-emerald-700'
  },
  UPVOTES_EARNED: {
    key: 'upvotesEarned',
    label: 'Upvotes Earned',
    icon: TrophyIcon,
    color: 'amber',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    valueColor: 'text-amber-700'
  },
  POINTS: {
    key: 'points',
    label: 'Points',
    icon: TrophyIcon,
    color: 'purple',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-600',
    valueColor: 'text-purple-700'
  },
  RANK: {
    key: 'rank',
    label: 'Rank',
    icon: TrophyIcon,
    color: 'rose',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    valueColor: 'text-rose-700'
  }
}

export const TAB_CONFIG = {
  MY_QUESTIONS: {
    key: 'myQuestions',
    label: 'My Questions',
    color: 'blue',
    borderColor: 'border-blue-400'
  },
  MY_ANSWERS: {
    key: 'myAnswers',
    label: 'My Answers',
    color: 'green',
    borderColor: 'border-green-400'
  },
  SAVED_QUESTIONS: {
    key: 'savedQuestions',
    label: 'Saved Questions',
    color: 'purple',
    borderColor: 'border-purple-400'
  }
}

export const ACTIVITY_TYPES = {
  ASKED: {
    key: 'asked',
    label: 'Asked',
    icon: QuestionMarkCircleIcon,
    color: '#3b82f6'
  },
  ANSWERED: {
    key: 'answered',
    label: 'Answered',
    icon: ChatBubbleLeftRightIcon,
    color: '#22c55e'
  }
} 