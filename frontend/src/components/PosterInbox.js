import React, { useEffect, useState } from "react";
import ChatModal from "./ChatModal";

export default function PosterInbox({ currentUser }) {
  const [threads, setThreads] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProps, setChatProps] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'POSTER') return;
    fetch(`http://localhost:8080/api/messages/poster-inbox?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setThreads(data);
        else setThreads([]);
      });
  }, [currentUser]);

  const openChat = (thread) => {
    setChatProps({
      currentUser,
      otherUser: { id: thread.hustlerId, username: thread.hustlerUsername },
      task: { id: thread.taskId, title: thread.taskTitle }
    });
    setChatOpen(true);
  };

  if (!currentUser || currentUser.role !== 'POSTER') return <div className="text-white">Login as a poster to see your inbox.</div>;

  return (
    <div className="max-w-xl mx-auto bg-[#1a2233] p-6 rounded mt-8 shadow">
      <h2 className="text-2xl font-bold text-yellow-300 mb-4">Inbox</h2>
      {(!Array.isArray(threads) || threads.length === 0) ? (
        <div className="text-gray-400">No messages yet.</div>
      ) : (
        <ul className="space-y-4">
          {threads.map(thread => (
            <li key={thread.taskId + '-' + thread.hustlerId} className="bg-[#232b3d] p-4 rounded flex flex-col gap-2">
              <div className="font-semibold text-lg text-yellow-300">
                Task: {thread.taskTitle}
              </div>
              <div className="text-white mb-2">
                With: {thread.hustlerUsername}
              </div>
              <div className="text-gray-400 text-sm">Unread: {thread.unreadCount}</div>
              <button className="bg-blue-600 text-white px-3 py-1 rounded self-start" onClick={() => openChat(thread)}>Open Chat</button>
            </li>
          ))}
        </ul>
      )}
      {chatOpen && chatProps && (
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          {...chatProps}
        />
      )}
    </div>
  );
}