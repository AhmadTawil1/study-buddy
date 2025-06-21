'use client'
import { formatDistanceToNow } from 'date-fns'
import { ChatBubbleLeftRightIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/src/context/themeContext'
import { ACTIVITY_TYPES } from '@/src/constants/profileConfig'

export default function RecentActivity({ recentActivity }) {
  const { colors, mode } = useTheme()

  return (
    <div className="mb-12 px-4">
      <h3 className="font-semibold mb-6 flex items-center text-lg" style={{ color: mode === 'dark' ? '#E5E7EB' : colors.button }}>
        <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" style={{ color: mode === 'dark' ? '#3b82f6' : colors.button }} /> Recent Activity
      </h3>
      <ol className="relative border-l ml-4" style={{ borderColor: colors.inputBorder }}>
        {recentActivity.length === 0 ? (
          <li className="ml-4" style={{ color: mode === 'dark' ? '#E5E7EB' : colors.inputPlaceholder }}>No recent activity.</li>
        ) : (
          recentActivity.map((activity, idx) => {
            const activityType = activity.type === 'answered' ? ACTIVITY_TYPES.ANSWERED : ACTIVITY_TYPES.ASKED
            const Icon = activityType.icon
            
            return (
              <li key={idx} className="mb-8 ml-6">
                <span 
                  className="absolute -left-3 flex items-center justify-center w-7 h-7 rounded-full ring-8" 
                  style={{ ringColor: colors.card, background: activityType.color }}
                >
                  <Icon className="w-4 h-4" style={{ color: '#fff' }} />
                </span>
                <div className="flex flex-col bg-opacity-80 rounded-lg p-4 shadow-sm" style={{ background: colors.inputBg }}>
                  <span className="font-medium mb-1" style={{ color: mode === 'dark' ? '#fff' : colors.text }}>
                    {activity.description}
                  </span>
                  <span className="text-xs" style={{ color: mode === 'dark' ? '#E5E7EB' : colors.inputPlaceholder }}>
                    {activity.time && !isNaN(new Date(activity.time))
                      ? formatDistanceToNow(new Date(activity.time), { addSuffix: true })
                      : ''}
                  </span>
                </div>
              </li>
            )
          })
        )}
      </ol>
    </div>
  )
} 