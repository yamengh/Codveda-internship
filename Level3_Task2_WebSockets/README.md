# Level 3 – Task 2: WebSockets for Real-Time Communication

## Overview
A real-time multi-room chat application built with Socket.io (server) and React (client). Demonstrates bidirectional WebSocket communication, user-specific notifications, typing indicators, and message history.

## Features
- Real-time bidirectional messaging with Socket.io
- Multiple chat rooms (general, tech, random)
- Online users list per room
- Typing indicator (shows when other users are typing)
- Message history loaded on room join (last 50 messages)
- System notifications (join / leave events)
- User-specific message styling (own messages vs others)
- Auto-scroll to latest message
- Connection status indicator

## Project Structure

```
Level3_Task2_WebSockets/
├── server/
│   ├── index.js       Socket.io server with all event handlers
│   └── package.json
└── client/
    ├── src/
    │   ├── App.jsx    Lobby + ChatRoom components
    │   └── App.css
    └── public/
```

## Setup & Run

### Server
```bash
cd server
npm install
npm run dev       # runs on http://localhost:4000
```

### Client
```bash
cd client
npm install
npm start         # runs on http://localhost:3000
```

Open multiple browser tabs at `http://localhost:3000` to test real-time features.

## Socket.io Events

### Client → Server
| Event          | Payload                        | Description                    |
|----------------|-------------------------------|--------------------------------|
| `join_room`    | `{ username, room }`          | Join a chat room               |
| `send_message` | `{ text }`                    | Send a message to the room     |
| `typing`       | `boolean`                     | Notify room of typing status   |

### Server → Client
| Event             | Payload                          | Description                      |
|-------------------|----------------------------------|----------------------------------|
| `message_history` | `[messages]`                     | Last 50 messages on join         |
| `receive_message` | `{ id, type, username, text, timestamp }` | New message in room    |
| `room_users`      | `[usernames]`                    | Updated list of online users     |
| `user_typing`     | `{ username, isTyping }`         | Typing notification              |
| `message_sent`    | `{ id }`                         | Confirmation to sender           |

## Technologies
- **Socket.io** – WebSocket library for real-time bidirectional communication
- **Express** – HTTP server to host the Socket.io server
- **React 18** – Frontend with hooks (useState, useEffect, useRef)
- **socket.io-client** – Socket.io client for React
