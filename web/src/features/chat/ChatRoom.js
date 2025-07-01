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
  const { colors, mode } = useTheme();

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
    <div
      className="flex flex-col w-full max-w-2xl h-full max-h-[90vh] rounded-2xl shadow-lg relative"
      style={{
        border: `1px solid ${colors.border}`,
        background: colors.card,
      }}
    >
      {/* Message List */}
      <div
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3 scrollbar-thin rounded-t-2xl"
        style={{
          background: colors.card,
        }}
      >
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.sender?.uid === currentUser?.uid;
          return (
            <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}> 
              <div
                className="group rounded-xl px-4 py-3 max-w-[70%] shadow-sm flex flex-col transition-colors duration-200"
                style={{
                  wordBreak: 'break-word',
                  background: isCurrentUser ? colors.button : colors.inputBg,
                  color: isCurrentUser ? colors.text : colors.text,
                  alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
                  border: isCurrentUser ? undefined : `1px solid ${colors.border}`,
                  marginTop: idx > 0 && messages[idx-1]?.sender?.uid === msg.sender?.uid ? 4 : 12
                }}
              >
                {msg.type === 'text' && (
                  <span className="text-base leading-relaxed">{msg.text}</span>
                )}
                {msg.type === 'zoom_invite' && msg.url && (
                  <a href={msg.url} target="_blank" rel="noopener noreferrer">
                    <button style={{background: colors.button, color: colors.text}} className="px-3 py-1 rounded mt-1 text-sm transition-colors">Join Zoom</button>
                  </a>
                )}
                <span
                  className="text-xs mt-2 font-medium opacity-80 whitespace-nowrap"
                  style={{ color: isCurrentUser ? colors.inputBg : colors.inputPlaceholder }}
                >
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
        className="flex gap-2 items-center px-4 py-3 rounded-b-2xl sticky bottom-0 z-10"
        style={{
          minHeight: '64px',
          borderTop: `1px solid ${colors.border}`,
          background: colors.card
        }}
      >
        <input
          className="flex-1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 text-base"
          style={{
            border: `1px solid ${colors.border}`,
            background: colors.inputBg,
            color: colors.text,
            placeholder: colors.inputPlaceholder
          }}
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          type="submit"
          className="h-11 px-5 rounded-lg font-semibold transition-colors text-base shadow-sm"
          style={{
            background: colors.button,
            color: colors.text
          }}
        >
          Send
        </button>
        <button
          type="button"
          onClick={handleZoomInvite}
          className="h-11 px-5 rounded-lg font-semibold transition-colors text-base shadow-sm"
          style={{
            background: colors.button,
            color: colors.text
          }}
        >
          Zoom Invite
        </button>
      </form>
    </div>
  );
} 
