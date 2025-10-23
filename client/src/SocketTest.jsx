import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3300"); // match your server port

const SocketTest = () => {
  const [userId, setUserId] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Connection established
    socket.on("connect", () => {
      console.log("Connected to server:", socket.id);
      setMessages((prev) => [
        ...prev,
        `Connected with socket id: ${socket.id}`,
      ]);
    });

    // Listen for server messages
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, `Server: ${msg}`]);
    });

    return () => {
      socket.off("connect");
      socket.off("message");
    };
  }, []);

  const registerUser = () => {
    if (!userId) return alert("Enter a user ID");
    socket.emit("register", userId);
    setMessages((prev) => [...prev, `Registered as user: ${userId}`]);
  };

  const sendMessage = () => {
    if (!messageInput) return;
    socket.emit("test", messageInput); // server will receive this
    setMessages((prev) => [...prev, `You: ${messageInput}`]);
    setMessageInput("");
  };

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Socket.IO Test</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter user ID"
          className="border p-2 mr-2 rounded"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={registerUser}
        >
          Register
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Send message to server"
          className="border p-2 mr-2 rounded"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>

      <ul className="border p-4 rounded h-64 overflow-y-auto bg-gray-50">
        {messages.map((msg, i) => (
          <li key={i} className="mb-2">
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SocketTest;
