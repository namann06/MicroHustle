import React, { useEffect, useState, useRef } from "react";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Send, Paperclip, Smile, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

function isImage(filename) {
  return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(filename);
}

function getFileTypeLabel(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (["pdf"].includes(ext)) return "View PDF";
  if (["doc", "docx"].includes(ext)) return "View Word Document";
  if (["xls", "xlsx"].includes(ext)) return "View Excel Spreadsheet";
  if (["ppt", "pptx"].includes(ext)) return "View PowerPoint";
  return "Download Attachment";
}

function renderMessageContent(content) {
  if (!content) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  return parts.map((part, i) =>
    urlRegex.test(part)
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline hover:text-blue-300">{part}</a>
      : <span key={i}>{part}</span>
  );
}

export default function ModernChatInterface({
  currentUser, otherUser, task, onClose
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [otherTyping, setOtherTyping] = useState(false);
  const fileInputRef = useRef();
  const messagesEndRef = useRef(null);
  const stompRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/messages/thread?taskId=${task.id}&userA=${currentUser.id}&userB=${otherUser.id}`)
      .then(res => res.json())
      .then(setMessages);

    const minId = Math.min(currentUser.id, otherUser.id);
    const maxId = Math.max(currentUser.id, otherUser.id);
    const topic = `/topic/chat/${task.id}-${minId}-${maxId}`;

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(topic, message => {
          const msg = JSON.parse(message.body);
          if (msg.type === 'typing') {
            setOtherTyping(msg.senderId !== currentUser.id && msg.typing);
          } else if (msg.type === 'message') {
            setMessages(prev => [...prev, msg]);
          }
        });
      }
    });
    
    client.activate();
    stompRef.current = client;

    return () => {
      if (stompRef.current) {
        stompRef.current.deactivate();
      }
    };
  }, [currentUser.id, otherUser.id, task.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendTypingIndicator = (typing) => {
    if (stompRef.current?.connected) {
      const minId = Math.min(currentUser.id, otherUser.id);
      const maxId = Math.max(currentUser.id, otherUser.id);
      stompRef.current.publish({
        destination: `/app/chat/${task.id}-${minId}-${maxId}`,
        body: JSON.stringify({
          type: 'typing',
          senderId: currentUser.id,
          typing
        })
      });
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    sendTypingIndicator(true);
    
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 1000);
  };

  const handleSend = async () => {
    if (!input.trim() && !attachment) return;

    let messageData = {
      senderId: currentUser.id,
      receiverId: otherUser.id,
      taskId: task.id,
      content: input,
      timestamp: new Date().toISOString()
    };

    if (attachment) {
      const formData = new FormData();
      formData.append('file', attachment);
      formData.append('senderId', currentUser.id);
      formData.append('receiverId', otherUser.id);
      formData.append('taskId', task.id);
      formData.append('content', input);

      await fetch('http://localhost:8080/api/messages/send-with-file', {
        method: 'POST',
        body: formData
      });
    } else {
      await fetch('http://localhost:8080/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
    }

    setInput("");
    setAttachment(null);
    sendTypingIndicator(false);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (username) => {
    return username ? username.substring(0, 2).toUpperCase() : "U";
  };

  return (
    <div className="flex flex-col h-full bg-white modern-inbox">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b glass-header">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="avatar-gradient-blue">
              {getInitials(otherUser.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{otherUser.username}</h3>
            <p className="text-sm text-gray-500">{task.title}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 messages-scroll">
        {messages.map((msg, index) => {
          const isOwn = msg.senderId === currentUser.id;
          const showAvatar = index === 0 || messages[index - 1].senderId !== msg.senderId;
          
          return (
            <div
              key={index}
              className={`flex message-enter ${isOwn ? 'justify-end' : 'justify-start'} ${
                showAvatar ? 'mt-4' : 'mt-1'
              }`}
            >
              <div className={`message-bubble flex max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? 'flex-row-reverse own' : 'flex-row other'} items-end space-x-2`}>
                {showAvatar && !isOwn && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="avatar-gradient-gray text-white text-xs">
                      {getInitials(otherUser.username)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`px-4 py-2 rounded-2xl chat-transition ${
                    isOwn
                      ? 'bg-blue-500 text-white rounded-br-sm shadow-lg'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm shadow-md'
                  }`}
                >
                  {msg.content && (
                    <div className="text-sm">
                      {renderMessageContent(msg.content)}
                    </div>
                  )}
                  
                  {msg.filename && (
                    <div className="mt-2">
                      {isImage(msg.filename) ? (
                        <img
                          src={`http://localhost:8080/api/messages/file/${msg.filename}`}
                          alt={msg.filename}
                          className="max-w-full h-auto rounded-lg cursor-pointer"
                          onClick={() => window.open(`http://localhost:8080/api/messages/file/${msg.filename}`, '_blank')}
                        />
                      ) : (
                        <a
                          href={`http://localhost:8080/api/messages/file/${msg.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center px-3 py-2 rounded-lg text-sm ${
                            isOwn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          {getFileTypeLabel(msg.filename)}
                        </a>
                      )}
                    </div>
                  )}
                  
                  <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
                
                {showAvatar && isOwn && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="avatar-gradient-blue text-white text-xs">
                      {getInitials(currentUser.username)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          );
        })}
        
        {otherTyping && (
          <div className="flex items-center space-x-2 message-enter">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="avatar-gradient-gray text-white text-xs">
                {getInitials(otherUser.username)}
              </AvatarFallback>
            </Avatar>
            <div className="bg-gray-100 px-4 py-2 rounded-2xl rounded-bl-sm shadow-md">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        {attachment && (
          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between chat-transition">
            <span className="text-sm text-blue-700">📎 {attachment.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAttachment(null)}
              className="h-6 w-6 p-0 hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setAttachment(e.target.files[0])}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 p-0 hover:bg-gray-100 chat-transition"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 chat-input"
            />
          </div>
          
          <Button
            onClick={handleSend}
            disabled={!input.trim() && !attachment}
            className="h-10 w-10 p-0 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 chat-transition"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
