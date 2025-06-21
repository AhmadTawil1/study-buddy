'use client'
import { STAT_TYPES } from '@/src/constants/profileConfig'
import { formatStatValue } from '@/src/utils/profileUtils'

export default function StatsGrid({ stats }) {
  const statEntries = Object.values(STAT_TYPES)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
      {statEntries.map((statType) => {
        const Icon = statType.icon
        const value = stats[statType.key]
        
        return (
          <div key={statType.key} className={`${statType.bgColor} p-4 rounded-lg text-center shadow-sm hover:shadow-md transition-shadow`}>
            <Icon className={`w-8 h-8 ${statType.textColor} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${statType.valueColor}`}>
              {formatStatValue(statType.key, value)}
            </div>
            <div className={`text-sm ${statType.textColor}`}>
              {statType.label}
            </div>
          </div>
        )
      })}
    </div>
  )
} 