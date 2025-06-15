// Chat Room Page Route: /chat/[id]
// Purpose: Shows the real-time chat room for a specific request.
// Theme: Uses Tailwind for background, adapts to dark/light mode.
// Features: Loads ChatRoom component for the given requestId.

"use client";
import { useParams } from 'next/navigation';
import ChatRoom from '@/src/features/chat/ChatRoom';
import { useAuth } from '@/src/context/authContext';

export default function ChatRoomPage() {
  const params = useParams();
  const { user } = useAuth();
  // Render the chat room for the given requestId
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      <ChatRoom requestId={params.id} currentUser={user} />
    </div>
  );
} 