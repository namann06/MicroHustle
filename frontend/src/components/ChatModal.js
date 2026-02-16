import React, { useEffect, useState, useRef } from "react";
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import '../styles/chat-modal.css';
import { apiFetch, buildUrl, assetUrl } from "../lib/api";

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
      ? <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">{part}</a>
      : <span key={i}>{part}</span>
  );
}

export default function ChatModal({
  open, onClose, currentUser, otherUser, task, showHeader = true
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
    if (!open) return;
    apiFetch(`/api/messages/thread?taskId=${task.id}&userA=${currentUser.id}&userB=${otherUser.id}`)
      .then(res => res.json())
      .then(setMessages);

    const minId = Math.min(currentUser.id, otherUser.id);
    const maxId = Math.max(currentUser.id, otherUser.id);
    const topic = `/topic/chat/${task.id}-${minId}-${maxId}`;
    const typingTopic = `/topic/chat/${task.id}-${minId}-${maxId}/typing`;
    const socket = new SockJS(buildUrl('/ws/notifications'));
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: () => {},
    });
    stompRef.current = stompClient;
    stompClient.onConnect = () => {
      stompClient.subscribe(topic, (message) => {
        const msg = JSON.parse(message.body);
        setMessages(m => {
          if (msg.recipient.id === currentUser.id && !msg.read) {
            apiFetch(`/api/messages/${msg.id}/read`, { method: 'POST' });
          }
          return [...m, msg];
        });
      });
      stompClient.subscribe(typingTopic, (msg) => {
        const typing = JSON.parse(msg.body);
        if (typing.userId === otherUser.id) {
          setOtherTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 2000);
        }
      });
    };
    stompClient.activate();

    return () => {
      stompClient.deactivate();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [open, currentUser, otherUser, task]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input && !attachment) return;
    let attachmentUrl = null;
    if (attachment) {
      const formData = new FormData();
      formData.append('file', attachment);
      try {
        const uploadRes = await apiFetch('/api/files/upload', {
          method: 'POST',
          body: formData
        });
        if (!uploadRes.ok) {
          alert('File upload failed');
          return;
        }
        attachmentUrl = await uploadRes.text();
        if (attachmentUrl.startsWith('"') && attachmentUrl.endsWith('"')) {
          attachmentUrl = attachmentUrl.substring(1, attachmentUrl.length - 1);
        }
      } catch (err) {
        alert('File upload failed');
        return;
      }
    }

    const res = await apiFetch(`/api/messages/send?senderId=${currentUser.id}&recipientId=${otherUser.id}&taskId=${task.id}&content=${encodeURIComponent(input)}${attachmentUrl ? `&attachmentUrl=${encodeURIComponent(attachmentUrl)}` : ''}`,
      { method: 'POST' });
    if (res.ok) {
      setInput("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!open) return null;

  return (
    <div className="chat-modal-card">
      {showHeader && (
        <div className="chat-modal-header">
          <button className="chat-modal-back-btn" onClick={onClose}>←</button>
          <img
            src={otherUser.profilePicUrl || 'https://via.placeholder.com/150'}
            alt={otherUser.username}
            className="chat-modal-avatar"
          />
          <div className="chat-modal-user-info">
            <div className="chat-modal-title">{otherUser.username}</div>
          </div>
        </div>
      )}
      <div className="chat-modal-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`chat-modal-message ${msg.sender.id === currentUser.id ? 'outgoing' : 'incoming'}`}>
            <div className={`chat-modal-bubble ${msg.sender.id === currentUser.id ? 'outgoing' : 'incoming'}`}>
              {renderMessageContent(msg.content)}
              {msg.attachmentUrl && (
                isImage(msg.attachmentUrl) ? (
                  <a href={assetUrl(msg.attachmentUrl)} target="_blank" rel="noopener noreferrer" className="block mt-2">
                    <img
                      src={assetUrl(msg.attachmentUrl)}
                      alt="attachment"
                      className="max-h-40 rounded-lg border"
                    />
                  </a>
                ) : (
                  <a className="block text-sm underline mt-2" href={assetUrl(msg.attachmentUrl)} target="_blank" rel="noopener noreferrer">
                    {getFileTypeLabel(msg.attachmentUrl)}
                  </a>
                )
              )}
            </div>
            <div className="chat-modal-time">
              {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {msg.sender.id === currentUser.id && (msg.read ? ' ✓✓' : ' ✓')}
            </div>
          </div>
        ))}
        {otherTyping && <div className="text-xs text-gray-500 italic p-2">{otherUser.username} is typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-modal-input-row">
        <input
          type="file"
          ref={fileInputRef}
          onChange={e => setAttachment(e.target.files[0])}
          style={{ display: 'none' }}
          id="file-input"
        />
        <button className="chat-modal-icon-btn" onClick={() => fileInputRef.current.click()}>
          📎
        </button>
        <input
          type="text"
          className="chat-modal-input"
          placeholder="Type here..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
        />
        <button className="chat-modal-icon-btn" onClick={sendMessage}>
          ➤
        </button>
      </div>
    </div>
  );
}
