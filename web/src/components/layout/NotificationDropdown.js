import { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/src/context/notificationContext';
import { BellIcon } from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import ReactDOM from 'react-dom';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/src/context/themeContext';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const router = useRouter();
  const { colors, mode } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification, e) => {
    e.preventDefault();
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    // Redirect to the correct post (try questionId, requestId, or fallback)
    const postId = notification.requestId || notification.questionId || notification.id;
    router.push(`/requests/${postId}`);
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    await markAllAsRead();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'answer':
        return '💬';
      case 'upvote':
        return '👍';
      default:
        return '🔔';
    }
  };

  return (
    <div className="relative" ref={buttonRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 focus:outline-none"
        style={{ color: colors.text }}
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && typeof window !== 'undefined' && ReactDOM.createPortal(
        <div
          ref={dropdownRef}
          className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-[1000]"
          style={{ 
            top: '70px', 
            right: '16px', 
            left: 'auto', 
            position: 'fixed', 
            transform: 'translateX(-30%)',
            background: colors.card,
            borderColor: colors.inputBorder
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: colors.inputBorder }}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold" style={{ color: colors.text }}>Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm hover:opacity-80 transition-opacity"
                  style={{ color: colors.button }}
                >
                  Mark all as read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center" style={{ color: colors.inputPlaceholder }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <a
                  key={notification.id}
                  href={`/requests/${notification.requestId || notification.questionId || notification.id}`}
                  onClick={(e) => handleNotificationClick(notification, e)}
                  className={`block p-4 border-b hover:bg-opacity-50 transition-colors ${
                    !notification.read ? 'bg-opacity-10' : ''
                  }`}
                  style={{ 
                    borderColor: colors.inputBorder,
                    background: !notification.read ? colors.button + '10' : 'transparent',
                    color: colors.text
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1">
                      <p className="text-sm" style={{ color: colors.text }}>{notification.message}</p>
                      <p className="text-xs mt-1" style={{ color: colors.inputPlaceholder }}>
                        {notification.createdAt && formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <span className="w-2 h-2 rounded-full mt-2" style={{ background: colors.button }} />
                    )}
                  </div>
                </a>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
} 