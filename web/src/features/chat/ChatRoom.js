import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/src/context/themeContext';
import { chatService } from '@/src/services/chatService';
import gun from '@/src/services/gunService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/src/firebase/firebase';
import { profileService } from '@/src/services/profileService';

function useChatMessages(chatId) {
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    if (!chatId) return;
    const chat = gun.get(`chat-room-${chatId}`); // Use Firestore chatId as GunDB room name
    const handler = chat.map().on((msg, id) => {
      if (msg && msg.createdAt) {
        if (msg.sender && typeof msg.sender === 'object' && msg.sender['#']) {
          gun.get(msg.sender['#']).once(senderObj => {
            setMessages(msgs => {
              if (msgs.some(m => m._gunId === id)) return msgs;
              return [
                ...msgs,
                { ...msg, sender: senderObj, _gunId: id }
              ].sort((a, b) => a.createdAt - b.createdAt);
            });
          });
        } else {
          setMessages(msgs => {
            if (msgs.some(m => m._gunId === id)) return msgs;
            return [
              ...msgs,
              { ...msg, _gunId: id }
            ].sort((a, b) => a.createdAt - b.createdAt);
          });
        }
      }
    });
    return () => chat.off();
  }, [chatId]);
  return messages;
}

export default function ChatRoom({ chatId, currentUser }) {
  // Debugging: Log currentUser and messages
  console.log('ChatRoom currentUser:', currentUser);
  const [input, setInput] = useState('');
  const messages = useChatMessages(chatId);
  const bottomRef = useRef(null);
  const chatListRef = useRef(null);
  const { colors } = useTheme();
  const [otherUserName, setOtherUserName] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    async function fetchOtherUserName() {
      if (!chatId || !currentUser) return;
      // Fetch chat doc from Firestore
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (!chatDoc.exists()) return;
      const participants = chatDoc.data().participants;
      if (!participants || participants.length !== 2) return;
      const otherUserId = participants.find(uid => uid !== currentUser.uid);
      if (!otherUserId) return;
      // Fetch other user's public profile
      const otherProfile = await profileService.getPublicUserProfile(otherUserId);
      setOtherUserName(otherProfile?.name || 'User');
    }
    fetchOtherUserName();
  }, [chatId, currentUser]);

  const sendMessage = (msg) => {
    if (!msg.text && msg.type !== 'zoom_invite') return;
    if (!currentUser.displayName && !currentUser.email) {
      alert('Please set your display name or email before sending messages.');
      return;
    }
    gun.get(`chat-room-${chatId}`).set({
      ...msg,
      sender: {
        uid: currentUser.uid,
        displayName: currentUser.displayName || currentUser.email || currentUser.uid,
        email: currentUser.email || '',
      },
      createdAt: Date.now(),
    });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ text: input, type: 'text' });
    setInput('');
  };

  const handleZoomInvite = () => {
    const url = prompt('Paste your Zoom link:');
    if (url && url.startsWith('http')) {
      sendMessage({ text: '', type: 'zoom_invite', url });
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
      {/* Other user's name at the top */}
      <div className="px-6 py-4 border-b text-xl font-semibold" style={{ borderColor: colors.border, color: colors.text }}>
        {otherUserName ? `Chat with ${otherUserName}` : 'Chat'}
      </div>
      {/* Message List */}
      <div
        ref={chatListRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-3 scrollbar-thin rounded-t-2xl"
        style={{
          background: colors.card,
          minHeight: 0
        }}
      >
        {messages.map((msg, idx) => {
          // Debugging: Log each message sender
          console.log('Message sender:', msg.sender);
          const isCurrentUser = msg.sender?.uid === currentUser?.uid;
          return (
            <div key={msg._gunId || idx} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}> 
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
                  {/* Improved fallback for displayName */}
                  {msg.sender?.displayName?.trim() || msg.sender?.email || msg.sender?.uid || 'User'}
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
