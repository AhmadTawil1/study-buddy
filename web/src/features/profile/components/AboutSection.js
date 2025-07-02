'use client'
import { FaUserEdit } from 'react-icons/fa'
import { useTheme } from '@/src/context/themeContext'

export default function AboutSection({ 
  profile, 
  isOwner, 
  editingAbout, 
  editAbout, 
  savingAbout, 
  saveMsg, 
  onEditAbout, 
  onSaveAbout, 
  onCancelEdit, 
  onAboutChange 
}) {
  const { colors } = useTheme()

  return (
    <div className="w-full mt-8 mb-8 p-6 rounded-xl shadow-lg flex flex-col gap-4 mx-auto" style={{ background: colors.card, color: colors.text, alignItems: 'flex-start' }}>
      <div className="flex items-center gap-3 mb-2">
        <FaUserEdit className="w-6 h-6" style={{ color: colors.button }} />
        <h3 className="text-lg font-semibold" style={{ color: colors.button }}>About</h3>
        {isOwner && !editingAbout && (
          <button 
            onClick={onEditAbout} 
            className="ml-auto px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1"
          >
            <FaUserEdit className="w-4 h-4" /> Edit
          </button>
        )}
      </div>
      {isOwner && editingAbout ? (
        <div className="flex flex-col w-full">
          <textarea
            className="w-full block rounded border px-2 py-2 mb-2 text-base"
            style={{ color: colors.text, background: colors.inputBg, borderColor: colors.inputBorder, resize: 'vertical' }}
            rows={4}
            value={editAbout}
            onChange={onAboutChange}
            disabled={savingAbout}
          />
          <div className="flex gap-2">
            <button 
              onClick={onSaveAbout} 
              disabled={savingAbout} 
              className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold"
            >
              {savingAbout ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={onCancelEdit} 
              className="px-4 py-2 rounded text-sm" 
              style={{ color: colors.inputPlaceholder }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="text-lg leading-relaxed" style={{ color: colors.text, minHeight: 40 }}>
          {profile.about || (
            isOwner ? 
              <span className="italic text-gray-400">Add a short description about yourself.</span> : 
              <span className="italic text-gray-400">No description provided.</span>
          )}
        </div>
      )}
      {saveMsg && (
        <div className="text-xs mt-1" style={{ color: saveMsg.includes('Failed') ? colors.error : colors.button }}>
          {saveMsg}
        </div>
      )}
    </div>
  )
} 