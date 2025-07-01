// Chat Room Page Route: /chat/[id]
// Purpose: Shows the real-time chat room for a specific request.
// Theme: Uses Tailwind for background, adapts to dark/light mode.
// Features: Loads ChatRoom component for the given requestId.

"use client";
import { useParams } from 'next/navigation';
import ChatRoom from '@/src/features/chat/ChatRoom';
import { useAuth } from '@/src/context/authContext';
import { useTheme } from '@/src/context/themeContext';

export default function ChatRoomPage() {
  const params = useParams();
  const { user } = useAuth();
  const { colors } = useTheme();
  // Render the chat room for the given requestId
  return (
    <div className="h-screen flex items-center justify-center transition-colors duration-300"
         style={{ background: colors.page, color: colors.text }}>
      <div className="w-full max-w-2xl h-[80vh] flex items-center justify-center">
        <ChatRoom requestId={params.id} currentUser={user} />
      </div>
    </div>
  );
} 