'use client'
import { FaGithub, FaLinkedin } from 'react-icons/fa'
import { useTheme } from '@/src/context/themeContext'

export default function SocialLinks({ 
  profile, 
  isOwner, 
  editingSocial, 
  editGithub, 
  editLinkedin, 
  savingSocial, 
  saveMsg, 
  onEditSocial, 
  onSaveSocial, 
  onCancelEdit, 
  onGithubChange, 
  onLinkedinChange 
}) {
  const { colors } = useTheme()

  return (
    <div className="max-w-2xl mx-auto mb-8 p-6 rounded-xl shadow-lg flex flex-col gap-4" style={{ background: colors.card, color: colors.text }}>
      <div className="flex items-center gap-3 mb-2">
        <FaGithub className="w-5 h-5" style={{ color: '#333' }} />
        <FaLinkedin className="w-5 h-5" style={{ color: '#0077b5' }} />
        <h3 className="text-lg font-semibold" style={{ color: colors.button }}>Social Accounts</h3>
        {isOwner && !editingSocial && (
          <button 
            onClick={onEditSocial} 
            className="ml-auto px-3 py-1 rounded bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition"
          >
            Edit
          </button>
        )}
      </div>
      {isOwner && editingSocial ? (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">GitHub URL</label>
            <input
              type="url"
              className="w-full rounded border px-2 py-2"
              value={editGithub}
              onChange={onGithubChange}
              placeholder="https://github.com/yourusername"
              style={{ color: colors.text, background: colors.inputBg, borderColor: colors.inputBorder }}
              disabled={savingSocial}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
            <input
              type="url"
              className="w-full rounded border px-2 py-2"
              value={editLinkedin}
              onChange={onLinkedinChange}
              placeholder="https://linkedin.com/in/yourusername"
              style={{ color: colors.text, background: colors.inputBg, borderColor: colors.inputBorder }}
              disabled={savingSocial}
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={onSaveSocial} 
              disabled={savingSocial} 
              className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-semibold"
            >
              {savingSocial ? 'Saving...' : 'Save'}
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <FaGithub className="w-5 h-5" style={{ color: '#333' }} />
            {profile.github ? (
              <a 
                href={profile.github} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline hover:text-blue-600"
              >
                {profile.github}
              </a>
            ) : (
              <span className="text-gray-400">Not linked</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <FaLinkedin className="w-5 h-5" style={{ color: '#0077b5' }} />
            {profile.linkedin ? (
              <a 
                href={profile.linkedin} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="underline hover:text-blue-600"
              >
                {profile.linkedin}
              </a>
            ) : (
              <span className="text-gray-400">Not linked</span>
            )}
          </div>
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