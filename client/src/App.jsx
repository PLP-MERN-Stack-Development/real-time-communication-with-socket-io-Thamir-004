import { useState, useEffect, useRef } from 'react'
import { useSocket } from './socket/socket.js'
import './App.css'

function App() {
  const {
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
    currentRoom,
    availableRooms,
    privateMessages,
    messageReactions,
    error,
    hasMoreMessages,
    isLoadingMore,
    deliveredMessages
  } = useSocket()

  const [username, setUsername] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [privateMessageInput, setPrivateMessageInput] = useState('')
  const [newRoomName, setNewRoomName] = useState('')
  const [showPrivateChat, setShowPrivateChat] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [notificationPermission, setNotificationPermission] = useState('default')
  const [unreadCount, setUnreadCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
  }, [])

  // Handle notifications for new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.sender !== username && !lastMessage.isSystem) {
        if (soundEnabled) {
          const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav') // Placeholder sound URL
          audio.play().catch(e => console.log('Audio play failed:', e))
        }
        if (notificationPermission === 'granted' && document.hidden) {
          new Notification(`New message in ${currentRoom}`, {
            body: `${lastMessage.sender}: ${lastMessage.text}`,
            icon: '/favicon.ico'
          })
        }
      } else if (lastMessage.isSystem) {
        // Notifications for user joins/leaves
        if (soundEnabled) {
          const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav')
          audio.volume = 0.5
          audio.play().catch(e => console.log('Audio play failed:', e))
        }
        if (notificationPermission === 'granted' && document.hidden) {
          new Notification('Chat Update', {
            body: lastMessage.text,
            icon: '/favicon.ico'
          })
        }
      }
    }
  }, [messages, username, soundEnabled, notificationPermission, currentRoom])

  // Handle notifications for private messages
  useEffect(() => {
    if (privateMessages.length > 0) {
      const lastPrivate = privateMessages[privateMessages.length - 1]
      if (lastPrivate.recipient === username) {
        setUnreadCount(prev => prev + 1)
        if (soundEnabled) {
          const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav')
          audio.play().catch(e => console.log('Audio play failed:', e))
        }
        if (notificationPermission === 'granted') {
          new Notification('New private message', {
            body: `From ${lastPrivate.sender}: ${lastPrivate.text}`,
            icon: '/favicon.ico'
          })
        }
      }
    }
  }, [privateMessages, username, soundEnabled, notificationPermission])

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault()
    if (username.trim()) {
      connect()
      joinChat(username.trim(), 'global')
      setIsLoggedIn(true)
    }
  }

  // Handle sending message
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (messageInput.trim()) {
      sendMessage(messageInput.trim())
      setMessageInput('')
      setTyping(false)
    }
  }

  // Handle typing indicator
  const handleInputChange = (e) => {
    setMessageInput(e.target.value)

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Start typing
    setTyping(true)

    // Stop typing after 1 second of no input
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false)
    }, 1000)
  }

  // Handle disconnect
  const handleDisconnect = () => {
    disconnect()
    setIsLoggedIn(false)
    setUsername('')
    setMessageInput('')
    setSelectedUser(null)
    setPrivateMessageInput('')
    setNewRoomName('')
    setShowPrivateChat(false)
  }

  // Handle room switch
  const handleRoomSwitch = (room) => {
    switchRoom(room)
  }

  // Handle creating new room
  const handleCreateRoom = (e) => {
    e.preventDefault()
    if (newRoomName.trim()) {
      switchRoom(newRoomName.trim())
      setNewRoomName('')
    }
  }

  // Handle private message
  const handlePrivateMessage = (e) => {
    e.preventDefault()
    if (privateMessageInput.trim() && selectedUser) {
      sendPrivateMessage(selectedUser, privateMessageInput.trim())
      setPrivateMessageInput('')
    }
  }

  // Handle starting private chat
  const handleStartPrivateChat = (user) => {
    setSelectedUser(user)
    setShowPrivateChat(true)
  }

  // Handle closing private chat
  const handleClosePrivateChat = () => {
    setSelectedUser(null)
    setShowPrivateChat(false)
    setPrivateMessageInput('')
  }

  // Handle adding reaction
  const handleAddReaction = (messageId, reaction) => {
    addReaction(messageId, reaction)
  }

  // Handle loading more messages
  const handleLoadMore = () => {
    loadOlderMessages(messages.length)
  }

  // Filter messages based on search query
  const filteredMessages = messages.filter(msg =>
    searchQuery === '' ||
    msg.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.sender.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Request notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission)
      })
    }
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <div className="login-form">
          <h1>Join Chat</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button type="submit">Join Chat</button>
          </form>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-info">
          <h1>{currentRoom} Chat</h1>
          <span className="connection-status">
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
        </div>
        <div className="notification-controls">
          <button onClick={() => setSoundEnabled(!soundEnabled)} className="sound-toggle">
            Sound: {soundEnabled ? 'On' : 'Off'}
          </button>
          <button onClick={requestNotificationPermission} disabled={notificationPermission === 'granted'} className="notification-btn">
            {notificationPermission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
          </button>
          <span className="unread-count">Unread: {unreadCount}</span>
        </div>
        <div className="user-info">
          <span>Welcome, {username}!</span>
          <button onClick={handleDisconnect} className="disconnect-btn">Leave Chat</button>
        </div>
      </div>

      <div className="chat-main">
        {/* Room Selection */}
        <div className="room-selection">
          <h3>Rooms</h3>
          <div className="room-list">
            {availableRooms.map((room) => (
              <button
                key={room}
                className={`room-btn ${room === currentRoom ? 'active' : ''}`}
                onClick={() => handleRoomSwitch(room)}
              >
                {room}
              </button>
            ))}
          </div>
          <form onSubmit={handleCreateRoom} className="create-room-form">
            <input
              type="text"
              placeholder="New room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
            />
            <button type="submit" disabled={!newRoomName.trim()}>Create Room</button>
          </form>
        </div>

        {/* Main Chat */}
        <div className="messages-container">
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          {hasMoreMessages && searchQuery === '' && (
            <div className="load-more-container">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="load-more-btn"
              >
                {isLoadingMore ? 'Loading...' : 'Load More Messages'}
              </button>
            </div>
          )}
          <div className="messages">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.isSystem ? 'system' : ''} ${msg.sender === username ? 'own' : ''}`}
              >
                {!msg.isSystem && (
                  <div className="message-header">
                    <span className="sender">{msg.sender}</span>
                    <span className="timestamp">{formatTime(msg.timestamp)}</span>
                  </div>
                )}
                <div className="message-text">
                  {msg.text}
                  {msg.sender === username && deliveredMessages.has(msg.id) && (
                    <span className="delivery-indicator" title="Message delivered">✓</span>
                  )}
                </div>
                {!msg.isSystem && (
                  <div className="message-reactions">
                    {['👍', '❤️', '😂', '😮', '😢', '😡'].map((reaction) => (
                      <button
                        key={reaction}
                        className="reaction-btn"
                        onClick={() => handleAddReaction(msg.id, reaction)}
                      >
                        {reaction}
                      </button>
                    ))}
                    {messageReactions.get(msg.id) && (
                      <div className="reaction-display">
                        {Array.from(messageReactions.get(msg.id).entries()).map(([reaction, count]) => (
                          <span key={reaction} className="reaction-count">
                            {reaction} {count}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {typingUsers.length > 0 && (
            <div className="typing-indicator">
              {typingUsers.map((user, index) => (
                <span key={user.username}>
                  {user.username}{index < typingUsers.length - 1 ? ', ' : ''} is typing...
                </span>
              ))}
            </div>
          )}

          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={handleInputChange}
              disabled={!isConnected}
            />
            <button type="submit" disabled={!isConnected || !messageInput.trim()}>
              Send
            </button>
          </form>
        </div>

        {/* Private Chat */}
        {showPrivateChat && selectedUser && (
          <div className="private-chat">
            <div className="private-chat-header">
              <h3>Private Chat with {selectedUser}</h3>
              <button onClick={handleClosePrivateChat} className="close-btn">×</button>
            </div>
            <div className="private-messages">
              {privateMessages
                .filter(msg => (msg.sender === username && msg.recipient === selectedUser) ||
                              (msg.sender === selectedUser && msg.recipient === username))
                .map((msg) => (
                  <div
                    key={msg.id}
                    className={`private-message ${msg.sender === username ? 'own' : ''}`}
                  >
                    <div className="message-header">
                      <span className="sender">{msg.sender}</span>
                      <span className="timestamp">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div className="message-text">{msg.text}</div>
                  </div>
                ))}
            </div>
            <form onSubmit={handlePrivateMessage} className="private-message-form">
              <input
                type="text"
                placeholder={`Message ${selectedUser}...`}
                value={privateMessageInput}
                onChange={(e) => setPrivateMessageInput(e.target.value)}
                disabled={!isConnected}
              />
              <button type="submit" disabled={!isConnected || !privateMessageInput.trim()}>
                Send
              </button>
            </form>
          </div>
        )}

        {/* Online Users */}
        <div className="online-users">
          <h3>Online Users ({onlineUsers.length})</h3>
          <ul>
            {onlineUsers.map((user) => (
              <li key={user} className={user === username ? 'current-user' : ''}>
                <span>{user} {user === username && '(You)'}</span>
                {user !== username && (
                  <button
                    onClick={() => handleStartPrivateChat(user)}
                    className="private-chat-btn"
                  >
                    💬
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App