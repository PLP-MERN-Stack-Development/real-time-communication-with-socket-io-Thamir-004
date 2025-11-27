# 💬 Real-Time Chat Application

A modern, feature-rich real-time chat application built with Socket.io, featuring multiple chat rooms, private messaging, typing indicators, message reactions, and comprehensive notification system.

![Real-Time Chat](https://img.shields.io/badge/Real--Time-Chat-blue?style=for-the-badge&logo=socket.io)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7.2-010101?style=flat-square&logo=socket.io)

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Technology Stack](#-technology-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [Architecture](#-architecture)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Chat Functionality
- **Real-time Messaging**: Instant message delivery with WebSocket connections
- **Multiple Chat Rooms**: Create and join different chat rooms for organized conversations
- **Private Messaging**: One-on-one private conversations between users
- **User Authentication**: Simple username-based authentication with duplicate prevention
- **Online Status**: Real-time display of online users in each room

### Advanced Features
- **Typing Indicators**: See when other users are typing
- **Message Reactions**: React to messages with emojis (👍, ❤️, 😂, 😮, 😢, 😡)
- **Message Search**: Search through chat history by content or sender
- **Message Pagination**: Load older messages on demand for better performance
- **Delivery Indicators**: Visual confirmation when messages are delivered

### Notifications & UX
- **Sound Notifications**: Audio alerts for new messages and user activity
- **Browser Notifications**: Desktop notifications when the app is not in focus
- **Unread Message Counter**: Track unread private messages
- **Auto-scroll**: Automatic scrolling to new messages with smooth animations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Technical Features
- **Auto-reconnection**: Automatic reconnection on connection loss
- **Room Management**: Dynamic room creation and cleanup
- **Message History**: Persistent message storage per room
- **Error Handling**: Comprehensive error handling and user feedback
- **Performance Optimized**: Efficient message rendering and state management

## 🎥 Demo

The application includes both client and server components:

- **Client**: React-based frontend served on `http://localhost:5173`
- **Server**: Node.js/Express backend with Socket.io on `http://localhost:5000`

### Screenshots

#### Login Screen
Clean, simple login interface where users enter their username to join the chat.

#### Main Chat Interface
- **Room Selection Panel**: List of available rooms with active room highlighting
- **Messages Area**: Real-time message display with timestamps and sender information
- **Online Users Panel**: List of currently online users with private chat buttons
- **Message Input**: Send messages with typing indicators

#### Private Messaging
Dedicated private chat interface for one-on-one conversations.

## 🛠 Technology Stack

### Frontend
- **React 18.2.0**: Modern React with hooks for state management
- **Vite**: Fast build tool and development server
- **Socket.io Client 4.7.2**: Real-time bidirectional communication
- **CSS3**: Custom styling with responsive design

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **Socket.io 4.7.2**: Real-time communication engine
- **CORS**: Cross-origin resource sharing support
- **Dotenv**: Environment variable management

### Development Tools
- **Nodemon**: Automatic server restart during development
- **ESLint**: Code linting for React
- **Vite Plugins**: React plugin for fast development

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)
- Modern web browser with WebSocket support

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd real-time-communication-with-socket-io-Thamir-004
```

### 2. Install Server Dependencies

```bash
cd server
npm install
```

### 3. Install Client Dependencies

```bash
cd ../client
npm install
```

### 4. Environment Configuration (Optional)

Create a `.env` file in the server directory:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 5. Start the Development Servers

#### Terminal 1: Start the Server
```bash
cd server
npm start
# Server will run on http://localhost:5000
```

#### Terminal 2: Start the Client
```bash
cd client
npm run dev
# Client will run on http://localhost:5173
```

### 6. Access the Application

Open your browser and navigate to `http://localhost:5173` to start chatting!

## 📖 Usage

### Getting Started

1. **Join the Chat**: Enter a unique username on the login screen
2. **Start Chatting**: Begin sending messages in the global room
3. **Explore Features**: Try creating rooms, private messaging, and reactions

### Key Features Guide

#### Creating and Switching Rooms
- Use the "Rooms" panel to see available rooms
- Click on any room name to switch to it
- Create new rooms by entering a name in the "New room name" field

#### Private Messaging
- Click the chat icon (💬) next to any online user
- A private chat panel will open on the right side
- Send private messages that only you and the recipient can see

#### Message Reactions
- Hover over any message to see reaction buttons
- Click any emoji to add/remove your reaction
- See reaction counts displayed below messages

#### Notifications
- **Sound**: Toggle sound notifications using the "Sound" button
- **Browser**: Click "Enable Notifications" to allow desktop notifications
- **Unread Counter**: See unread private message count in the header

#### Message Search
- Use the search bar above messages to filter by content or sender
- Search works across all loaded messages in the current room

#### Loading More Messages
- Click "Load More Messages" to fetch older messages
- Pagination helps maintain performance with large chat histories

## 🏗 Architecture

### System Overview

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   React Client  │◄──────────────►│  Express Server │
│                 │                │   + Socket.io   │
│ - Components    │                │                 │
│ - Socket Hook   │                │ - Event Handlers│
│ - State Mgmt    │                │ - Room Mgmt     │
└─────────────────┘                └─────────────────┘
```

### Client Architecture

```
client/
├── src/
│   ├── App.jsx           # Main application component
│   ├── socket/
│   │   └── socket.js     # Socket.io client setup & hooks
│   ├── App.css           # Main styling
│   └── index.css         # Global styles
├── index.html            # HTML template
└── package.json          # Dependencies & scripts
```

### Server Architecture

```
server/
├── server.js             # Main server file
│   ├── Express setup     # HTTP server & middleware
│   ├── Socket.io config  # WebSocket server setup
│   ├── Event handlers    # Socket event processing
│   ├── Data structures   # In-memory storage
│   └── Room management   # Dynamic room handling
└── package.json          # Dependencies & scripts
```

### Data Flow

1. **Connection**: Client connects to Socket.io server
2. **Authentication**: User joins with username and room
3. **Messaging**: Messages flow bidirectionally via WebSocket events
4. **State Sync**: Server broadcasts updates to all connected clients
5. **Persistence**: Messages stored in memory per room

## 📚 API Documentation

### Socket Events

#### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ username: string, room?: string }` | Join chat with username and optional room |
| `sendMessage` | `string` | Send message to current room |
| `sendPrivateMessage` | `{ recipient: string, message: string }` | Send private message to user |
| `switchRoom` | `string` | Switch to different room |
| `typing` | `boolean` | Indicate typing status |
| `addReaction` | `{ messageId: string, reaction: string }` | Add reaction to message |
| `loadOlderMessages` | `{ room: string, offset: number }` | Request older messages |

#### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `connect` | - | Connection established |
| `disconnect` | - | Connection lost |
| `message` | `Message` | New message in room |
| `privateMessage` | `PrivateMessage` | New private message |
| `onlineUsers` | `string[]` | List of online users in room |
| `userJoined` | `{ username: string, room: string }` | User joined room |
| `userLeft` | `{ username: string, room: string }` | User left room |
| `userTyping` | `{ username: string, isTyping: boolean }` | User typing status |
| `availableRooms` | `string[]` | List of all available rooms |
| `roomSwitched` | `string` | Successfully switched rooms |
| `initialMessages` | `{ messages: Message[], hasMore: boolean }` | Initial message history |
| `olderMessages` | `{ messages: Message[], hasMore: boolean }` | Older messages loaded |
| `messageDelivered` | `{ messageId: string }` | Message delivery confirmation |
| `reactionUpdate` | `{ messageId: string, reactions: object }` | Updated message reactions |
| `error` | `string` | Error message |

### Message Object Structure

```javascript
{
  id: string,           // Unique message identifier
  text: string,         // Message content
  sender: string,       // Sender's username
  room: string,         // Room name
  timestamp: string,    // ISO timestamp
  reactions: Map,       // Message reactions
  isPrivate?: boolean,  // Private message flag
  recipient?: string    // Recipient for private messages
}
```

## 🚀 Deployment

### Backend Deployment

#### Option 1: Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Option 2: Render
1. Connect your GitHub repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables in Render dashboard

#### Option 3: Heroku
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### Frontend Deployment

#### Option 1: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd client
vercel --prod
```

#### Option 2: Netlify
1. Build the client: `npm run build`
2. Drag the `dist` folder to Netlify's deployment area
3. Configure environment variables if needed

### Environment Variables for Production

```env
PORT=5000
CLIENT_URL=https://your-frontend-domain.com
NODE_ENV=production
```

## 💻 Development

### Available Scripts

#### Server
```bash
npm start      # Start production server
npm run dev    # Start development server with nodemon
```

#### Client
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Development Workflow

1. **Make Changes**: Edit files in your preferred code editor
2. **Test Locally**: Run both client and server in development mode
3. **Build & Test**: Use `npm run build` to create production builds
4. **Commit Changes**: Use descriptive commit messages
5. **Deploy**: Push to your deployment platform

### Code Structure

- **Modular Components**: React components are organized by functionality
- **Custom Hooks**: Socket logic abstracted into reusable hooks
- **Separation of Concerns**: Clear separation between client and server logic
- **Error Boundaries**: Proper error handling throughout the application

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Make** your changes and test thoroughly
4. **Commit** with descriptive messages: `git commit -m "Add: feature description"`
5. **Push** to your branch: `git push origin feature/your-feature-name`
6. **Create** a Pull Request with detailed description

### Guidelines

- Follow existing code style and conventions
- Add comments for complex logic
- Test your changes across different browsers
- Update documentation if needed
- Ensure responsive design works on mobile devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Socket.io**: For providing excellent real-time communication capabilities
- **React**: For the robust frontend framework
- **Node.js Community**: For the extensive ecosystem of packages
- **Open Source Community**: For inspiration and learning resources

---

**Built with ❤️ using Socket.io, React, and Node.js**

For questions or support, please open an issue on GitHub.