'use client'
import { 
  BellIcon,
  ShieldExclamationIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { useTheme } from '@/src/context/themeContext'

export default function AccountSettings({ onLogout }) {
  const { colors } = useTheme()

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>Account Management</h3>
      <div className="space-y-4">
        <button className="flex items-center space-x-2 transition-colors" style={{ color: colors.text }}>
          <BellIcon className="w-5 h-5" style={{ color: colors.inputPlaceholder }} />
          <span>Notification Preferences</span>
        </button>
        <button className="flex items-center space-x-2 transition-colors" style={{ color: colors.text }}>
          <ShieldExclamationIcon className="w-5 h-5" style={{ color: colors.inputPlaceholder }} />
          <span>Change Password</span>
        </button>
        <button 
          onClick={onLogout}
          className="flex items-center space-x-2 transition-colors"
          style={{ color: colors.button }}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" style={{ color: colors.button }} />
          <span>Logout</span>
        </button>
        <div className="pt-4 border-t" style={{ borderColor: colors.inputBorder }}>
          <button className="flex items-center space-x-2 transition-colors font-semibold" style={{ color: colors.error }}>
            <TrashIcon className="w-5 h-5" style={{ color: colors.error }} />
            <span>Delete Account</span>
          </button>
        </div>
      </div>
    </div>
  )
} 