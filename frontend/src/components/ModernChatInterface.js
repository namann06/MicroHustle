import React, { useEffect, useState, useRef } from "react";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { X } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { ChatForm } from "./ui/chat";
import { MessageInput } from "./ui/message-input";

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
  const [otherTyping, setOtherTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
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
    console.log('Subscribing to WebSocket topic:', topic);

    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        client.subscribe(topic, message => {
          const msg = JSON.parse(message.body);
          console.log('WebSocket message received:', msg);
          if (msg.type === 'typing') {
            setOtherTyping(msg.senderId !== currentUser.id && msg.typing);
          } else {
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

  const handleSend = async (event, files = []) => {
    event?.preventDefault?.();
    if (!input.trim() && (!files || files.length === 0)) return;
    setIsGenerating(true);
    
    try {
      let attachmentUrl = null;
      
      // If there are files, upload them first
      if (files && files.length > 0) {
        const file = files[0]; // For now, handle one file at a time
        const fileFormData = new FormData();
        fileFormData.append('file', file);
        
        console.log('Uploading file:', file.name);
        const uploadResponse = await fetch('http://localhost:8080/api/files/upload', {
          method: 'POST',
          body: fileFormData
        });
        
        if (uploadResponse.ok) {
          attachmentUrl = await uploadResponse.text();
          console.log('File uploaded successfully:', attachmentUrl);
        } else {
          throw new Error('File upload failed');
        }
      }
      
      // Send the message with optional attachment
      const formData = new URLSearchParams();
      formData.append('senderId', currentUser.id);
      formData.append('recipientId', otherUser.id);
      formData.append('taskId', task.id);
      formData.append('content', input || ''); // Allow empty content if there's an attachment
      if (attachmentUrl) {
        formData.append('attachmentUrl', attachmentUrl);
      }
      
      console.log('Sending message:', Object.fromEntries(formData));
      await fetch('http://localhost:8080/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString()
      });
      
      setInput("");
      sendTypingIndicator(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsGenerating(false);
    }
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
    <div className="flex flex-col h-full bg-black modern-inbox">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-gray-600 text-white">
              {getInitials(otherUser.username)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-white">{otherUser.username}</h3>
            <p className="text-sm text-gray-400">{task.title}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0 hover:bg-gray-800 text-gray-400"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 messages-scroll bg-black">
        {messages.map((msg, index) => {
          const isOwn = msg.sender && msg.sender.id === currentUser.id;
          const prevMsg = messages[index - 1];
          const showUserName = index === 0 || (prevMsg && prevMsg.sender && prevMsg.sender.id !== (msg.sender && msg.sender.id));
          return (
            <div
              key={index}
              className={`flex flex-col message-enter ${isOwn ? 'items-end' : 'items-start'}`}
            >
              {/* Show username for message groups */}
              {showUserName && (
                <div className={`text-sm text-gray-400 mb-2 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                  {isOwn ? currentUser.username : otherUser.username}
                </div>
              )}
              <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${showUserName ? '' : 'mt-1'} flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl text-sm shadow-md ${
                    isOwn
                      ? 'bg-gradient-to-br from-gray-200 to-white text-black ml-auto'
                      : 'bg-gradient-to-br from-gray-700 to-gray-900 text-white mr-auto'
                  }`}
                  style={{ minWidth: '60px', wordBreak: 'break-word' }}
                >
                  {msg.content && (
                    <div>
                      {renderMessageContent(msg.content)}
                    </div>
                  )}
                  {msg.attachmentUrl && (
                    <div className="mt-2">
                      {isImage(msg.attachmentUrl) ? (
                        <img
                          src={`http://localhost:8080${msg.attachmentUrl}`}
                          alt="Attachment"
                          className="max-w-full h-auto rounded-lg cursor-pointer shadow-md"
                          onClick={() => window.open(`http://localhost:8080${msg.attachmentUrl}`, '_blank')}
                        />
                      ) : (
                        <a
                          href={`http://localhost:8080${msg.attachmentUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                            isOwn ? 'bg-gray-100 hover:bg-gray-200 text-black' : 'bg-gray-700 hover:bg-gray-600'
                          }`}
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {getFileTypeLabel(msg.attachmentUrl)}
                        </a>
                      )}
                    </div>
                  )}
                  <div className={`text-xs mt-1 px-1 text-gray-400 ${isOwn ? 'text-right' : 'text-left'}`}>{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            </div>
          );
        })}
        
        {otherTyping && (
          <div className="flex items-start space-x-3 message-enter">
            <div className="text-sm text-gray-400 mb-2 px-1">
              {otherUser.username}
            </div>
          </div>
        )}
        {otherTyping && (
          <div className="flex items-start">
            <div className="bg-gray-800 px-4 py-3 rounded-2xl max-w-xs">
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

      {/* Modern Message Input */}
      <div className="border-t border-gray-800 bg-black">
        <ChatForm
          className="w-full"
          isPending={isGenerating}
          handleSubmit={(event, formFiles) => handleSend(event, formFiles)}
        >
          {({ files: formFiles, setFiles: setFormFiles }) => (
            <MessageInput
              value={input}
              onChange={handleInputChange}
              allowAttachments
              files={formFiles}
              setFiles={setFormFiles}
              placeholder="Type a message..."
              className="bg-black"
            />
          )}
        </ChatForm>
      </div>
    </div>
  );
}
