'use client'
import { UserCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useTheme } from '@/src/context/themeContext'
import formatDate from '@/src/utils/formatDate'
import React from 'react'

export default function UserBanner({ 
  profile, 
  isOwner, 
  editingName, 
  editName, 
  savingName, 
  onEditName, 
  onSaveName, 
  onCancelEdit, 
  onNameChange,
  onAvatarChange,
  avatarUploading,
  onAvatarDelete,
  avatarDeleting
}) {
  const { colors } = useTheme()
  const fileInputRef = React.useRef(null)

  const handleAvatarEditClick = () => {
    if (isOwner && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (file && onAvatarChange) {
      onAvatarChange(file)
    }
  }

  return (
    <div className="relative h-48 bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-end">
        <div className="relative flex-shrink-0 mb-4 sm:mb-0">
          {profile.avatar ? (
            <img 
              src={profile.avatar} 
              alt={profile.name} 
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <UserCircleIcon className="w-24 h-24 sm:w-32 sm:h-32 text-white" />
          )}
          {isOwner && (
            <>
              <button
                className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                onClick={handleAvatarEditClick}
                disabled={avatarUploading || avatarDeleting}
                title="Change profile picture"
              >
                <PencilIcon className="w-5 h-5 text-indigo-600" />
              </button>
              {profile.avatar && (
                <button
                  className="absolute bottom-0 left-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                  onClick={onAvatarDelete}
                  disabled={avatarUploading || avatarDeleting}
                  title="Delete profile picture"
                >
                  <TrashIcon className="w-5 h-5 text-red-600" />
                </button>
              )}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                disabled={avatarUploading || avatarDeleting}
              />
              {(avatarUploading || avatarDeleting) && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center bg-white/70 rounded-full w-24 h-24 sm:w-32 sm:h-32">
                  <span className={`font-semibold animate-pulse ${avatarUploading ? 'text-indigo-600' : 'text-red-600'}`}>{avatarUploading ? 'Uploading...' : 'Deleting...'}</span>
                </div>
              )}
            </>
          )}
        </div>
        <div className="text-white ml-4">
          {isOwner && editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={onNameChange}
                className="text-2xl sm:text-3xl font-bold rounded px-2 py-1 border focus:border-blue-500 outline-none"
                style={{ color: colors.text, borderColor: colors.inputBorder }}
              />
              <button 
                onClick={onSaveName} 
                disabled={savingName} 
                className="px-2 py-1 rounded bg-blue-600 text-white text-sm font-semibold"
              >
                Save
              </button>
              <button 
                onClick={onCancelEdit} 
                className="px-2 py-1 rounded text-sm" 
                style={{ color: colors.inputPlaceholder }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-bold">{profile.name}</h2>
              {isOwner && (
                <button 
                  onClick={onEditName} 
                  className="text-sm underline" 
                  style={{ color: colors.button }}
                >
                  Edit
                </button>
              )}
            </div>
          )}
          <p className="text-sm opacity-90">{profile.email}</p>
          {profile.joinDate && (
            <p className="text-sm opacity-80">
              Joined: {formatDate(profile.joinDate?.toDate ? profile.joinDate.toDate() : profile.joinDate)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 