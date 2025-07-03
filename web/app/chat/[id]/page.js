// Chat Room Page Route: /chat/[id]
// Purpose: Shows the real-time chat room for a specific request.
// Theme: Uses Tailwind for background, adapts to dark/light mode.
// Features: Loads ChatRoom component for the given requestId.

"use client";
import { useParams, useSearchParams } from 'next/navigation';
import ChatRoom from '@/src/features/chat/ChatRoom';
import { useAuth } from '@/src/context/authContext';
import { useTheme } from '@/src/context/themeContext';
import { useEffect, useState } from 'react';
import { chatService } from '@/src/services/chatService';

export default function ChatRoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { colors } = useTheme();
  const [chatId, setChatId] = useState(null);
  const otherUserId = searchParams.get('with');

  useEffect(() => {
    if (user && otherUserId) {
      chatService.findOrCreateChat(user.uid, otherUserId).then(setChatId);
    }
  }, [user, otherUserId]);

  if (!chatId) return null; // Or a loading spinner

  return (
    <div className="h-screen flex items-center justify-center transition-colors duration-300"
         style={{ background: colors.page, color: colors.text }}>
      <div className="w-full max-w-2xl h-[80vh] flex items-center justify-center">
        <ChatRoom chatId={chatId} currentUser={user} />
      </div>
    </div>
  );
} 