// ChatPage.js
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

function useSocket(userId, accessToken, refreshToken) {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!userId || !accessToken || !refreshToken) return;
    const newSocket = io(SOCKET_URL, {
      auth: { token: accessToken, refreshToken },
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to server. Socket ID:', newSocket.id);
      newSocket.emit('login', { userId });
    });

    newSocket.on('tokenRefreshed', (data) => {
      console.log('Received new access token:', data.accessToken);
    });

    newSocket.on('chatMessage', (message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [userId, accessToken, refreshToken]);

  // Function to send a chat message
  const sendMessage = (recipientId, message) => {
    if (socket) {
      socket.emit('chatMessage', { senderId: userId, recipientId, message });
    }
  };

  return { socket, messages, sendMessage };
}

const ChatPage = () => {
  const userId = 'myUser';
  const accessToken = 'dummyAccessToken';
  const refreshToken = 'dummyRefreshToken';

  // Friend list (array of usernames)
  const friendList = ['Alice', 'Bob', 'Charlie'];

  // State to track the currently selected friend for chatting
  const [activeFriend, setActiveFriend] = useState(null);
  const [chatInput, setChatInput] = useState('');

  const { messages, sendMessage } = useSocket(userId, accessToken, refreshToken);

  // Filter messages to show only those between the current user and the active friend
  const filteredMessages = messages.filter((msg) => {
    if (!activeFriend) return false;
    return msg.senderId === activeFriend || msg.recipientId === activeFriend;
  });

  const handleSendMessage = () => {
    if (activeFriend && chatInput.trim() !== '') {
      sendMessage(activeFriend, chatInput);
      setChatInput('');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Friend List Section */}
      <div style={{ width: '25%', borderRight: '1px solid #ccc', padding: '1rem' }}>
        <h3>Friends</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {friendList.map((friend, index) => (
            <li
              key={index}
              style={{
                margin: '0.5rem 0',
                cursor: 'pointer',
                fontWeight: activeFriend === friend ? 'bold' : 'normal'
              }}
              onClick={() => setActiveFriend(friend)}
            >
              {friend}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Section */}
      <div style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <h3>
          {activeFriend ? `Chat with ${activeFriend}` : 'Select a friend to chat'}
        </h3>
        <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ccc', padding: '1rem' }}>
          {filteredMessages.length === 0 ? (
            <p>No messages yet.</p>
          ) : (
            filteredMessages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '0.5rem' }}>
                <strong>{msg.senderId}:</strong> {msg.message}
              </div>
            ))
          )}
        </div>
        {activeFriend && (
          <div style={{ marginTop: '1rem' }}>
            <input
              type="text"
              placeholder="Type your message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{ width: '80%', padding: '0.5rem' }}
            />
            <button onClick={handleSendMessage} style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
