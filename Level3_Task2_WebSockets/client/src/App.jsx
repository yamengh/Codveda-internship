import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SERVER = 'http://localhost:4000';

// ─── Lobby Screen ──────────────────────────────────────────────────────────
function Lobby({ onJoin }) {
  const [username, setUsername] = useState('');
  const [room, setRoom] = useState('general');

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim() && room.trim()) onJoin(username.trim(), room.trim());
  };

  return (
    <div className="lobby">
      <div className="lobby-box">
        <h1>💬 Real-Time Chat</h1>
        <p>Level 3 – Task 2: WebSockets with Socket.io</p>
        <form onSubmit={handleJoin}>
          <label>Your Name</label>
          <input
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={20}
          />
          <label>Room</label>
          <select value={room} onChange={(e) => setRoom(e.target.value)}>
            <option value="general">🌐 General</option>
            <option value="tech">💻 Tech</option>
            <option value="random">🎲 Random</option>
          </select>
          <button type="submit">Join Room →</button>
        </form>
      </div>
    </div>
  );
}

// ─── Chat Room ─────────────────────────────────────────────────────────────
function ChatRoom({ username, room, onLeave }) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    const s = io(SERVER);
    setSocket(s);

    s.on('connect', () => {
      setConnected(true);
      s.emit('join_room', { username, room });
    });

    s.on('disconnect', () => setConnected(false));

    s.on('message_history', (history) => setMessages(history));

    s.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    s.on('room_users', (userList) => setUsers(userList));

    s.on('user_typing', ({ username: u, isTyping }) => {
      setTypingUsers((prev) =>
        isTyping ? [...new Set([...prev, u])] : prev.filter((x) => x !== u)
      );
    });

    return () => s.disconnect();
  }, [username, room]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket) return;
    socket.emit('send_message', { text: input });
    setInput('');
    socket.emit('typing', false);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!socket) return;
    socket.emit('typing', true);
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket.emit('typing', false), 1500);
  };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chat-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <strong># {room}</strong>
          <span className={`dot ${connected ? 'green' : 'red'}`} />
        </div>
        <div className="users-label">Online ({users.length})</div>
        <ul className="users-list">
          {users.map((u) => (
            <li key={u} className={u === username ? 'me' : ''}>
              🟢 {u} {u === username ? '(you)' : ''}
            </li>
          ))}
        </ul>
        <button className="leave-btn" onClick={onLeave}>← Leave Room</button>
      </aside>

      {/* Chat area */}
      <div className="chat-area">
        <div className="chat-header">
          <span>💬 #{room}</span>
          <span className="status">{connected ? '● Connected' : '○ Reconnecting…'}</span>
        </div>

        <div className="messages">
          {messages.map((msg) => (
            msg.type === 'system' ? (
              <div key={msg.id} className="msg-system">{msg.text}</div>
            ) : (
              <div key={msg.id} className={`msg-bubble ${msg.username === username ? 'own' : ''}`}>
                {msg.username !== username && <div className="msg-author">{msg.username}</div>}
                <div className="msg-text">{msg.text}</div>
                <div className="msg-time">{formatTime(msg.timestamp)}</div>
              </div>
            )
          ))}
          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing…
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form className="input-area" onSubmit={handleSend}>
          <input
            placeholder={`Message #${room}…`}
            value={input}
            onChange={handleTyping}
            disabled={!connected}
          />
          <button type="submit" disabled={!input.trim() || !connected}>Send</button>
        </form>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);

  if (!session) {
    return <Lobby onJoin={(username, room) => setSession({ username, room })} />;
  }

  return (
    <ChatRoom
      username={session.username}
      room={session.room}
      onLeave={() => setSession(null)}
    />
  );
}
