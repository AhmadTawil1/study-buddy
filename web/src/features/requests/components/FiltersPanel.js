'use client'
import { SUBJECTS } from '@/src/constants/askConfig'

const TIME_RANGES = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: 'all', label: 'All' }
]

export default function FiltersPanel({ filters, onFilterChange }) {
  const handleSubjectSelect = (subject) => {
    onFilterChange({ ...filters, subject: filters.subject === subject ? null : subject });
  }

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center gap-2 md:gap-4 bg-white/80 rounded-full shadow-sm px-3 py-2 mt-4 mb-2 border border-gray-100">
      {/* Subject Chips */}
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 flex-1">
        {SUBJECTS.map((subject) => (
          <button
            key={subject}
            onClick={() => handleSubjectSelect(subject)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 ${
              filters.subject === subject
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700'
            }`}
            style={{ transition: 'all 0.15s' }}
          >
            {subject}
          </button>
        ))}
      </div>
      {/* Dropdowns */}
      <div className="flex gap-2 items-center flex-wrap">
        <select
          value={filters.timeRange || ''}
          onChange={(e) => {
            const val = e.target.value === 'all' ? null : e.target.value;
            if (filters.timeRange !== val) onFilterChange({ ...filters, timeRange: val });
          }}
          className="rounded-full px-3 py-1 text-xs bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
        >
          <option value="all">All</option>
          {TIME_RANGES.filter(opt => opt.value !== 'all').map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-200 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.unanswered}
            onChange={e => onFilterChange({ ...filters, unanswered: e.target.checked })}
            className="form-checkbox rounded text-blue-600 focus:ring-blue-500"
          />
          Show only unanswered
        </label>
      </div>
    </div>
  )
} 