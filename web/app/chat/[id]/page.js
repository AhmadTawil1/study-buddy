"use client";
import { useParams } from 'next/navigation';
import ChatRoom from '@/src/features/chat/ChatRoom';
import { useAuth } from '@/src/context/authContext';

export default function ChatRoomPage() {
  const params = useParams();
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 transition-colors duration-300">
      <ChatRoom requestId={params.id} currentUser={user} />
    </div>
  );
} 