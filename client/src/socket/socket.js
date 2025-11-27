// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  randomizationFactor: 0.5,
  timeout: 20000,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRoom, setCurrentRoom] = useState('global');
  const [availableRooms, setAvailableRooms] = useState(['global']);
  const [privateMessages, setPrivateMessages] = useState([]);
  const [messageReactions, setMessageReactions] = useState(new Map());
  const [error, setError] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deliveredMessages, setDeliveredMessages] = useState(new Set());

  // Connect to socket server
  const connect = () => {
    socket.connect();
  };

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Join chat with username and room
  const joinChat = (username, room = 'global') => {
    socket.emit('join', { username, room });
  };

  // Send message
  const sendMessage = (message) => {
    socket.emit('sendMessage', message);
  };

  // Send private message
  const sendPrivateMessage = (recipient, message) => {
    socket.emit('sendPrivateMessage', { recipient, message });
  };

  // Switch room
  const switchRoom = (room) => {
    socket.emit('switchRoom', room);
  };

  // Add reaction to message
  const addReaction = (messageId, reaction) => {
    socket.emit('addReaction', { messageId, reaction });
  };

  // Typing indicator
  const setTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };

  // Load older messages
  const loadOlderMessages = (offset) => {
    setIsLoadingMore(true);
    socket.emit('loadOlderMessages', { room: currentRoom, offset });
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const onDisconnect = () => {
      setIsConnected(false);
      setCurrentUser(null);
      setOnlineUsers([]);
      setTypingUsers([]);
      setCurrentRoom('global');
      setAvailableRooms(['global']);
      setPrivateMessages([]);
      setMessageReactions(new Map());
      setDeliveredMessages(new Set());
    };

    // Chat events
    const onMessage = (message) => {
      setMessages(prev => [...prev, message]);
    };

    const onOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    const onUserTyping = (data) => {
      setTypingUsers(prev => {
        const filtered = prev.filter(user => user.username !== data.username);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    };

    const onUserJoined = (username) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: `${username} joined the chat`,
        sender: 'System',
        timestamp: new Date().toISOString(),
        isSystem: true,
      }]);
    };

    const onUserLeft = (username) => {
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        text: `${username} left the chat`,
        sender: 'System',
        timestamp: new Date().toISOString(),
        isSystem: true,
      }]);
    };

    const onError = (errorMsg) => {
      setError(errorMsg);
    };

    const onAvailableRooms = (rooms) => {
      setAvailableRooms(rooms);
    };

    const onRoomSwitched = (room) => {
      setCurrentRoom(room);
      setMessages([]); // Clear messages when switching rooms
      setHasMoreMessages(false);
    };

    const onInitialMessages = (data) => {
      setMessages(data.messages);
      setHasMoreMessages(data.hasMore);
    };

    const onOlderMessages = (data) => {
      setMessages(prev => [...data.messages, ...prev]);
      setHasMoreMessages(data.hasMore);
      setIsLoadingMore(false);
    };

    const onMessageDelivered = (data) => {
      setDeliveredMessages(prev => new Set([...prev, data.messageId]));
    };

    const onPrivateMessage = (message) => {
      setPrivateMessages(prev => [...prev, message]);
    };

    const onReactionUpdate = (data) => {
      setMessageReactions(prev => {
        const newReactions = new Map(prev);
        newReactions.set(data.messageId, new Map(Object.entries(data.reactions)));
        return newReactions;
      });
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message', onMessage);
    socket.on('onlineUsers', onOnlineUsers);
    socket.on('userTyping', onUserTyping);
    socket.on('userJoined', onUserJoined);
    socket.on('userLeft', onUserLeft);
    socket.on('error', onError);
    socket.on('availableRooms', onAvailableRooms);
    socket.on('roomSwitched', onRoomSwitched);
    socket.on('privateMessage', onPrivateMessage);
    socket.on('reactionUpdate', onReactionUpdate);
    socket.on('initialMessages', onInitialMessages);
    socket.on('olderMessages', onOlderMessages);
    socket.on('messageDelivered', onMessageDelivered);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('message', onMessage);
      socket.off('onlineUsers', onOnlineUsers);
      socket.off('userTyping', onUserTyping);
      socket.off('userJoined', onUserJoined);
      socket.off('userLeft', onUserLeft);
      socket.off('error', onError);
      socket.off('availableRooms', onAvailableRooms);
      socket.off('roomSwitched', onRoomSwitched);
      socket.off('privateMessage', onPrivateMessage);
      socket.off('reactionUpdate', onReactionUpdate);
      socket.off('initialMessages', onInitialMessages);
      socket.off('olderMessages', onOlderMessages);
      socket.off('messageDelivered', onMessageDelivered);
    };
  }, []);

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    joinChat,
    sendMessage,
    sendPrivateMessage,
    switchRoom,
    addReaction,
    setTyping,
    loadOlderMessages,
    messages,
    onlineUsers,
    typingUsers,
    currentUser,
    currentRoom,
    availableRooms,
    privateMessages,
    messageReactions,
    error,
    hasMoreMessages,
    isLoadingMore,
    deliveredMessages,
  };
};

export default socket;