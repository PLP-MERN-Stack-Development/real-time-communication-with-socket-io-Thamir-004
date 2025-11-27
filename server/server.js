// server.js - Main server file for Socket.io application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Store online users
const onlineUsers = new Map();

// Store rooms and their users
const rooms = new Map();
rooms.set('global', new Set()); // Default global room

// Store private messages between users
const privateMessages = new Map();

// Store message reactions
const messageReactions = new Map();

// Store messages per room for pagination
const roomMessages = new Map();
const MESSAGES_PER_PAGE = 20;

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User authentication and join
  socket.on('join', (data) => {
    const { username, room = 'global' } = data;

    if (!username || typeof username !== 'string' || username.trim() === '') {
      socket.emit('error', 'Invalid username');
      return;
    }

    if (!room || typeof room !== 'string' || room.trim() === '') {
      socket.emit('error', 'Invalid room');
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedRoom = room.trim();

    // Check if username is already taken
    for (let [id, user] of onlineUsers) {
      if (user.username === trimmedUsername) {
        socket.emit('error', 'Username already taken');
        return;
      }
    }

    // Add user to online users
    onlineUsers.set(socket.id, { username: trimmedUsername, id: socket.id, room: trimmedRoom });

    // Create room if it doesn't exist
    if (!rooms.has(trimmedRoom)) {
      rooms.set(trimmedRoom, new Set());
    }

    // Add user to room
    rooms.get(trimmedRoom).add(socket.id);

    // Join socket.io room
    socket.join(trimmedRoom);

    // Notify users in the room about new user
    socket.to(trimmedRoom).emit('userJoined', { username: trimmedUsername, room: trimmedRoom });

    // Send current online users list in the room to the new user
    const roomUsers = Array.from(rooms.get(trimmedRoom)).map(id => onlineUsers.get(id)?.username).filter(Boolean);
    socket.emit('onlineUsers', roomUsers);

    // Send available rooms list
    const availableRooms = Array.from(rooms.keys());
    socket.emit('availableRooms', availableRooms);

    // Send initial messages (last 20)
    const messages = roomMessages.get(trimmedRoom) || [];
    const initialMessages = messages.slice(-MESSAGES_PER_PAGE);
    socket.emit('initialMessages', {
      messages: initialMessages,
      hasMore: messages.length > MESSAGES_PER_PAGE
    });

    // Broadcast updated online users to room
    io.to(trimmedRoom).emit('onlineUsers', roomUsers);

    console.log(`${trimmedUsername} joined room: ${trimmedRoom}`);
  });

  // Handle chat messages
  socket.on('sendMessage', (message) => {
    const user = onlineUsers.get(socket.id);
    if (!user) {
      socket.emit('error', 'You must join first');
      return;
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return;
    }

    const messageData = {
      id: Date.now() + Math.random(), // Simple unique ID
      text: message.trim(),
      sender: user.username,
      room: user.room,
      timestamp: new Date().toISOString(),
      reactions: new Map(), // Initialize empty reactions
    };

    // Store message in room messages
    if (!roomMessages.has(user.room)) {
      roomMessages.set(user.room, []);
    }
    roomMessages.get(user.room).push(messageData);

    // Store message reactions
    messageReactions.set(messageData.id, new Map());

    // Broadcast message to all users in current room
    io.to(user.room).emit('message', messageData);

    // Send acknowledgment to sender
    socket.emit('messageDelivered', { messageId: messageData.id });
  });

  // Handle typing indicators
  socket.on('typing', (isTyping) => {
    const user = onlineUsers.get(socket.id);
    if (!user) return;

    socket.to(user.room).emit('userTyping', {
      username: user.username,
      isTyping: !!isTyping,
    });
  });

  // Handle room switching
  socket.on('switchRoom', (newRoom) => {
    const user = onlineUsers.get(socket.id);
    if (!user) {
      socket.emit('error', 'You must join first');
      return;
    }

    if (!newRoom || typeof newRoom !== 'string' || newRoom.trim() === '') {
      socket.emit('error', 'Invalid room name');
      return;
    }

    const trimmedNewRoom = newRoom.trim();
    const oldRoom = user.room;

    if (oldRoom === trimmedNewRoom) {
      return; // Already in the room
    }

    // Leave old room
    if (rooms.has(oldRoom)) {
      rooms.get(oldRoom).delete(socket.id);
      socket.leave(oldRoom);
      socket.to(oldRoom).emit('userLeft', { username: user.username, room: oldRoom });

      // Clean up empty rooms (except global)
      if (rooms.get(oldRoom).size === 0 && oldRoom !== 'global') {
        rooms.delete(oldRoom);
      }
    }

    // Join new room
    if (!rooms.has(trimmedNewRoom)) {
      rooms.set(trimmedNewRoom, new Set());
      // Broadcast updated available rooms to all connected users
      const availableRooms = Array.from(rooms.keys());
      io.emit('availableRooms', availableRooms);
    }
    rooms.get(trimmedNewRoom).add(socket.id);
    socket.join(trimmedNewRoom);

    // Update user room
    user.room = trimmedNewRoom;

    // Notify users in new room
    socket.to(trimmedNewRoom).emit('userJoined', { username: user.username, room: trimmedNewRoom });

    // Send updated room info
    const roomUsers = Array.from(rooms.get(trimmedNewRoom)).map(id => onlineUsers.get(id)?.username).filter(Boolean);
    socket.emit('onlineUsers', roomUsers);
    socket.emit('roomSwitched', trimmedNewRoom);

    // Send initial messages for new room
    const messages = roomMessages.get(trimmedNewRoom) || [];
    const initialMessages = messages.slice(-MESSAGES_PER_PAGE);
    socket.emit('initialMessages', {
      messages: initialMessages,
      hasMore: messages.length > MESSAGES_PER_PAGE
    });

    // Broadcast updated users in new room
    io.to(trimmedNewRoom).emit('onlineUsers', roomUsers);

    // Send available rooms list
    const availableRooms = Array.from(rooms.keys());
    socket.emit('availableRooms', availableRooms);

    console.log(`${user.username} switched from ${oldRoom} to ${trimmedNewRoom}`);
  });

  // Handle private messages
  socket.on('sendPrivateMessage', (data) => {
    const { recipient, message } = data;
    const sender = onlineUsers.get(socket.id);

    if (!sender) {
      socket.emit('error', 'You must join first');
      return;
    }

    if (!recipient || typeof recipient !== 'string' || recipient.trim() === '') {
      socket.emit('error', 'Invalid recipient');
      return;
    }

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return;
    }

    // Find recipient socket
    let recipientSocket = null;
    for (let [id, user] of onlineUsers) {
      if (user.username === recipient.trim()) {
        recipientSocket = id;
        break;
      }
    }

    if (!recipientSocket) {
      socket.emit('error', 'User not found');
      return;
    }

    const messageData = {
      id: Date.now() + Math.random(),
      text: message.trim(),
      sender: sender.username,
      recipient: recipient.trim(),
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };

    // Store private message
    const chatKey = [sender.username, recipient.trim()].sort().join('-');
    if (!privateMessages.has(chatKey)) {
      privateMessages.set(chatKey, []);
    }
    privateMessages.get(chatKey).push(messageData);

    // Send to both sender and recipient
    io.to(socket.id).emit('privateMessage', messageData);
    io.to(recipientSocket).emit('privateMessage', messageData);
  });

  // Handle loading older messages
  socket.on('loadOlderMessages', (data) => {
    const { room, offset = 0 } = data;
    const user = onlineUsers.get(socket.id);

    if (!user || user.room !== room) {
      socket.emit('error', 'Invalid request');
      return;
    }

    const messages = roomMessages.get(room) || [];
    const olderMessages = messages.slice(Math.max(0, messages.length - offset - MESSAGES_PER_PAGE), messages.length - offset);

    socket.emit('olderMessages', {
      messages: olderMessages,
      hasMore: messages.length > offset + MESSAGES_PER_PAGE
    });
  });

  // Handle message reactions
  socket.on('addReaction', (data) => {
    const { messageId, reaction } = data;
    const user = onlineUsers.get(socket.id);

    if (!user) {
      socket.emit('error', 'You must join first');
      return;
    }

    if (!messageId || !reaction || typeof reaction !== 'string') {
      socket.emit('error', 'Invalid reaction data');
      return;
    }

    const reactions = messageReactions.get(messageId);
    if (!reactions) {
      socket.emit('error', 'Message not found');
      return;
    }

    // Toggle reaction (add if not present, remove if present)
    const currentCount = reactions.get(reaction) || 0;
    if (currentCount > 0) {
      reactions.set(reaction, currentCount - 1);
      if (reactions.get(reaction) === 0) {
        reactions.delete(reaction);
      }
    } else {
      reactions.set(reaction, 1);
    }

    // Broadcast reaction update to room
    io.to(user.room).emit('reactionUpdate', {
      messageId,
      reactions: Object.fromEntries(reactions),
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = onlineUsers.get(socket.id);
    if (user) {
      const room = user.room;
      onlineUsers.delete(socket.id);

      // Remove from room
      if (rooms.has(room)) {
        rooms.get(room).delete(socket.id);
        socket.to(room).emit('userLeft', { username: user.username, room });

        // Clean up empty rooms (except global)
        if (rooms.get(room).size === 0 && room !== 'global') {
          rooms.delete(room);
        } else {
          // Update online users list in room
          const roomUsers = Array.from(rooms.get(room)).map(id => onlineUsers.get(id)?.username).filter(Boolean);
          io.to(room).emit('onlineUsers', roomUsers);
        }
      }

      console.log(`${user.username} left the chat`);
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };