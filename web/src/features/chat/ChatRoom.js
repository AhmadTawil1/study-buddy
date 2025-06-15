import { useState, useEffect, useRef } from 'react';
import { db } from '@/src/firebase/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useTheme } from '@/src/context/themeContext';

function useChatMessages(chatId) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('createdAt'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [chatId]);
  return messages;
}

export default function ChatRoom({ requestId, currentUser }) {
  const [input, setInput] = useState('');
  const messages = useChatMessages(requestId);
  const bottomRef = useRef(null);
  useTheme(); // just to trigger re-render on theme change

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (msg) => {
    if (!msg.text && msg.type !== 'zoom_invite') return;
    await addDoc(collection(db, `chats/${requestId}/messages`), {
      ...msg,
      sender: {
        uid: currentUser.uid,
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
      },
      createdAt: serverTimestamp(),
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage({ text: input, type: 'text' });
    setInput('');
  };

  const handleZoomInvite = async () => {
    const url = prompt('Paste your Zoom link:');
    if (url && url.startsWith('http')) {
      await sendMessage({ text: '', type: 'zoom_invite', url });
    }
  };

  return (
    <div className="flex flex-col h-[80vh] max-h-[90vh] w-full max-w-2xl mx-auto rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 relative">
      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent bg-white dark:bg-gray-900 rounded-t-2xl">
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.sender?.uid === currentUser?.uid;
          return (
            <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}> 
              <div
                className={`group rounded-xl px-4 py-3 max-w-[70%] shadow-sm flex flex-col transition-colors duration-200
                  ${isCurrentUser
                    ? 'bg-blue-500 text-white dark:bg-blue-400 dark:text-gray-900 items-end'
                    : 'bg-white text-gray-900 border border-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 items-start'}
                  ${idx > 0 && messages[idx-1]?.sender?.uid === msg.sender?.uid ? 'mt-1' : 'mt-3'}`}
                style={{ wordBreak: 'break-word' }}
              >
                {msg.type === 'text' && (
                  <span className="text-base leading-relaxed">{msg.text}</span>
                )}
                {msg.type === 'zoom_invite' && msg.url && (
                  <a href={msg.url} target="_blank" rel="noopener noreferrer">
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded mt-1 text-sm transition-colors">Join Zoom</button>
                  </a>
                )}
                <span className={`text-xs mt-2 font-medium opacity-80 ${isCurrentUser ? 'text-blue-200 dark:text-blue-900' : 'text-gray-500 dark:text-gray-400'} whitespace-nowrap`}>
                  {msg.sender?.displayName || msg.sender?.email || 'User'}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      {/* Input Bar */}
      <form
        onSubmit={handleSend}
        className="flex gap-2 items-center px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-b-2xl sticky bottom-0 z-10"
        style={{ minHeight: '64px' }}
      >
        <input
          className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 text-base placeholder-gray-400 dark:placeholder-gray-500"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="h-11 px-5 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white dark:text-gray-900 transition-colors text-base shadow-sm"
        >
          Send
        </button>
        <button
          type="button"
          onClick={handleZoomInvite}
          className="h-11 px-5 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white dark:text-gray-900 transition-colors text-base shadow-sm"
        >
          Zoom Invite
        </button>
      </form>
    </div>
  );
} 