require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*', // In production, restrict to your frontend domain
    methods: ['GET', 'POST'],
  },
});

// ─── In-memory state ───────────────────────────────────────────────────────
const onlineUsers = new Map(); // socketId → { username, room }
const messageHistory = {};     // room → [messages]

// Helper: get messages for a room (last 50)
const getRoomHistory = (room) => (messageHistory[room] || []).slice(-50);

// Helper: get list of users in a room
const getUsersInRoom = (room) =>
  [...onlineUsers.values()].filter((u) => u.room === room).map((u) => u.username);

// ─── Socket.io Events ──────────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // User joins a room
  socket.on('join_room', ({ username, room }) => {
    if (!username || !room) return;

    // Leave previous room if any
    const prev = onlineUsers.get(socket.id);
    if (prev?.room) {
      socket.leave(prev.room);
      // Notify old room
      const systemMsg = { id: Date.now(), type: 'system', text: `${prev.username} left the room.`, timestamp: new Date().toISOString() };
      io.to(prev.room).emit('receive_message', systemMsg);
      io.to(prev.room).emit('room_users', getUsersInRoom(prev.room));
    }

    // Join new room
    socket.join(room);
    onlineUsers.set(socket.id, { username, room });

    // Send history to the joining user
    socket.emit('message_history', getRoomHistory(room));

    // Notify room that user joined
    const joinMsg = { id: Date.now(), type: 'system', text: `${username} joined the room.`, timestamp: new Date().toISOString() };
    if (!messageHistory[room]) messageHistory[room] = [];
    messageHistory[room].push(joinMsg);
    io.to(room).emit('receive_message', joinMsg);

    // Update online users list for the room
    io.to(room).emit('room_users', getUsersInRoom(room));

    console.log(`👤 ${username} joined room: ${room}`);
  });

  // User sends a message
  socket.on('send_message', ({ text }) => {
    const user = onlineUsers.get(socket.id);
    if (!user || !text?.trim()) return;

    const message = {
      id: Date.now(),
      type: 'message',
      username: user.username,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };

    // Save to history
    if (!messageHistory[user.room]) messageHistory[user.room] = [];
    messageHistory[user.room].push(message);

    // Broadcast to room (including sender)
    io.to(user.room).emit('receive_message', message);

    // Send a user-specific notification back to sender as confirmation
    socket.emit('message_sent', { id: message.id });
  });

  // User is typing
  socket.on('typing', (isTyping) => {
    const user = onlineUsers.get(socket.id);
    if (!user) return;
    socket.to(user.room).emit('user_typing', { username: user.username, isTyping });
  });

  // Disconnect
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      const leaveMsg = { id: Date.now(), type: 'system', text: `${user.username} disconnected.`, timestamp: new Date().toISOString() };
      if (messageHistory[user.room]) messageHistory[user.room].push(leaveMsg);
      io.to(user.room).emit('receive_message', leaveMsg);
      io.to(user.room).emit('room_users', getUsersInRoom(user.room).filter((u) => u !== user.username));
      onlineUsers.delete(socket.id);
    }
    console.log(`❌ Socket disconnected: ${socket.id}`);
  });
});

// ─── REST endpoints (optional) ─────────────────────────────────────────────
app.get('/', (req, res) => res.json({ message: 'Socket.io Chat Server ✅', onlineUsers: onlineUsers.size }));
app.get('/rooms', (req, res) => res.json({ rooms: [...new Set([...onlineUsers.values()].map((u) => u.room))] }));

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`🚀 Chat server running on http://localhost:${PORT}`));
