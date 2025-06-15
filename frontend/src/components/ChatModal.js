import React, { useEffect, useState, useRef } from "react";

export default function ChatModal({
  open, onClose, currentUser, otherUser, task, showHeader = true
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef();

  useEffect(() => {
    if (!open) return;
    fetch(`http://localhost:8080/api/messages/thread?taskId=${task.id}&userA=${currentUser.id}&userB=${otherUser.id}`)
      .then(res => res.json())
      .then(setMessages);
  }, [open, currentUser, otherUser, task]);

  const sendMessage = async () => {
    if (!input && !attachment) return;
    let attachmentUrl = null;
    if (attachment) {
      // TODO: Implement file upload and get URL
      alert("Attachment upload not implemented");
      return;
    }
    const res = await fetch(`http://localhost:8080/api/messages/send?senderId=${currentUser.id}&recipientId=${otherUser.id}&taskId=${task.id}&content=${encodeURIComponent(input)}${attachmentUrl ? `&attachmentUrl=${encodeURIComponent(attachmentUrl)}` : ''}`,
      { method: 'POST' });
    if (res.ok) {
      const msg = await res.json();
      setMessages(m => [...m, msg]);
      setInput("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-full max-w-md rounded shadow-lg p-4 relative">
        {showHeader && (
          <div className="flex justify-between items-center mb-2">
            <div className="font-bold text-lg">Chat with {otherUser.username}</div>
            <button className="text-gray-500 hover:text-red-500" onClick={onClose}>✕</button>
          </div>
        )}
        <div className="h-64 overflow-y-auto bg-gray-100 rounded p-2 mb-2">
          {messages.length === 0 ? (
            <div className="text-gray-400 text-center mt-16">No messages yet.</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`my-1 flex ${msg.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg max-w-xs ${msg.sender.id === currentUser.id ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}>
                  {msg.content}
                  {msg.attachmentUrl && (
                    <a className="block text-xs underline mt-1" href={msg.attachmentUrl} target="_blank" rel="noopener noreferrer">Attachment</a>
                  )}
                  <div className="text-[10px] text-right mt-1">{new Date(msg.sentAt).toLocaleTimeString()} {msg.read ? '✓' : ''}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={e => setAttachment(e.target.files[0])}
            className="border rounded px-2 py-1"
          />
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded"
            onClick={sendMessage}
          >Send</button>
        </div>
      </div>
    </div>
  );
}