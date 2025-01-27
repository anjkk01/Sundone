import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const ChatPage = () => {
const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomId, setroomId] = useState(0);
  // Initialize the socket connection
  useEffect(() => {
    const socket = io("http://localhost:3000"); // Replace with your server URL

    // Listen for incoming messages
    socket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  const sendMessage = () => {
    const socket = io("http://localhost:3000");
    socket.emit("message", message);
    setMessage("");
  };
  const changeroomId = () => {
  };
  return (
    <div style={{ padding: "20px" }}>
      <h1>Socket.IO Chat</h1>
      <div style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={sendMessage}>Send</button>
      <input
        type="text"
        value={roomId}
        onChange={(e) => setroomId(e.target.value)}
        placeholder="Type your Room ID"
      />
      <button onClick={changeroomId}>Connect</button>
    </div>
  )
}

export default ChatPage
