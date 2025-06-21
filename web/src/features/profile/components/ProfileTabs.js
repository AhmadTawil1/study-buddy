'use client'
import { Tab } from '@headlessui/react'
import { useTheme } from '@/src/context/themeContext'
import { TAB_CONFIG } from '@/src/constants/profileConfig'
import formatDate from '@/src/utils/formatDate'

export default function ProfileTabs({ 
  myQuestions, 
  myAnswers, 
  savedQuestions, 
  onQuestionClick, 
  onAnswerClick, 
  onSavedQuestionClick 
}) {
  const { colors, mode } = useTheme()

  const tabConfigs = [
    {
      key: 'myQuestions',
      label: TAB_CONFIG.MY_QUESTIONS.label,
      color: TAB_CONFIG.MY_QUESTIONS.color,
      borderColor: TAB_CONFIG.MY_QUESTIONS.borderColor,
      data: myQuestions,
      emptyMessage: 'No questions asked yet.',
      onClick: onQuestionClick,
      renderItem: (item) => ({
        title: item.title,
        subtitle: `${item.subject} • ${formatDate(item.createdAt?.toDate())}`
      })
    },
    {
      key: 'myAnswers',
      label: TAB_CONFIG.MY_ANSWERS.label,
      color: TAB_CONFIG.MY_ANSWERS.color,
      borderColor: TAB_CONFIG.MY_ANSWERS.borderColor,
      data: myAnswers,
      emptyMessage: 'No answers provided yet.',
      onClick: onAnswerClick,
      renderItem: (item) => ({
        title: item.questionTitle || item.content?.substring(0, 50) + '...',
        subtitle: `Answered on ${formatDate(item.createdAt?.toDate())}`
      })
    },
    {
      key: 'savedQuestions',
      label: TAB_CONFIG.SAVED_QUESTIONS.label,
      color: TAB_CONFIG.SAVED_QUESTIONS.color,
      borderColor: TAB_CONFIG.SAVED_QUESTIONS.borderColor,
      data: savedQuestions,
      emptyMessage: 'No saved questions yet.',
      onClick: onSavedQuestionClick,
      renderItem: (item) => ({
        title: item.title,
        subtitle: `${item.subject} • Saved on ${formatDate(item.savedAt?.toDate())}`
      })
    }
  ]

  return (
    <div className="rounded-2xl shadow-xl p-4 mb-8" style={{ background: mode === 'dark' ? '#181a20' : colors.card }}>
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl p-1" style={{ background: mode === 'dark' ? '#23272f' : '#e0e7ef' }}>
          {tabConfigs.map((tabConfig) => (
            <Tab
              key={tabConfig.key}
              className={({ selected }) =>
                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 transition-colors ` +
                (selected
                  ? `bg-gray-900 text-white border-b-2 ${tabConfig.borderColor} shadow-sm`
                  : `text-${tabConfig.color}-400 hover:text-${tabConfig.color}-200`)
              }
            >
              {tabConfig.label}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          {tabConfigs.map((tabConfig) => (
            <Tab.Panel
              key={tabConfig.key}
              className="rounded-xl p-3 mt-2"
              style={{ background: mode === 'dark' ? '#23272f' : '#fff', color: mode === 'dark' ? '#F3F4F6' : colors.text }}
            >
              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <ul className="space-y-4">
                  {tabConfig.data.length === 0 ? (
                    <li style={{ color: mode === 'dark' ? '#A1A1AA' : '#6B7280' }}>
                      {tabConfig.emptyMessage}
                    </li>
                  ) : (
                    tabConfig.data.map((item) => {
                      const renderedItem = tabConfig.renderItem(item)
                      return (
                        <li
                          key={item.id}
                          onClick={() => tabConfig.onClick(item)}
                          className="relative rounded-md p-3 hover:bg-gray-800/60 cursor-pointer transition-colors"
                          style={{ background: mode === 'dark' ? '#181a20' : '#f3f4f6' }}
                        >
                          <h3 className="text-sm font-medium leading-5" style={{ color: mode === 'dark' ? '#fff' : '#111827' }}>
                            {renderedItem.title}
                          </h3>
                          <ul className="mt-1 flex space-x-1 text-xs font-normal leading-4" style={{ color: mode === 'dark' ? '#A1A1AA' : '#6B7280' }}>
                            <li>{renderedItem.subtitle}</li>
                          </ul>
                          <span className={'absolute inset-0 rounded-md'} />
                        </li>
                      )
                    })
                  )}
                </ul>
              </div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
} 