import React, { useEffect, useState } from "react";
import ChatModal from "./ChatModal";
import { apiFetch } from "../lib/api";

export default function PosterInbox({ currentUser, onInboxRead }) {
  const [threads, setThreads] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProps, setChatProps] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'POSTER') return;
    apiFetch(`/api/messages/poster-inbox?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setThreads(data);
        else setThreads([]);
      });
  }, [currentUser]);

  const markThreadRead = (taskId, posterId, hustlerId) => {
    return apiFetch(`/api/messages/mark-thread-read?taskId=${taskId}&posterId=${posterId}&hustlerId=${hustlerId}`, {
      method: 'POST'
    });
  };

  const openChat = (thread) => {
    setChatProps({
      currentUser,
      otherUser: { id: thread.hustlerId, username: thread.hustlerUsername },
      task: { id: thread.taskId, title: thread.taskTitle }
    });
    setChatOpen(true);
    // Mark all as read for this thread
    markThreadRead(thread.taskId, currentUser.id, thread.hustlerId);
  };

  if (!currentUser || currentUser.role !== 'POSTER') return <div className="text-white">Login as a poster to see your inbox.</div>;

  return (
    <div className="inbox-container flex min-h-screen">
      <div className="inbox-list w-1/3 bg-[#1a2233] p-4 shadow-md overflow-y-auto">
        <h2 className="text-xl font-bold text-yellow-300 mb-2">Chats</h2>
        {(!Array.isArray(threads) || threads.length === 0) ? (
          <div className="text-gray-400">No messages yet.</div>
        ) : (
          <ul className="space-y-2">
            {threads.map(thread => (
              <li key={thread.taskId + '-' + thread.hustlerId} className="bg-[#232b3d] p-3 rounded flex flex-col gap-1 cursor-pointer hover:bg-[#2a3447]" onClick={() => openChat(thread)}>
                <div className="font-semibold text-base text-yellow-300">
                  {thread.taskTitle}
                </div>
                <div className="text-white">
                  With: {thread.hustlerUsername}
                </div>
                <div className="text-gray-400 text-xs">Unread: {thread.unreadCount}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="chat-pane w-2/3 bg-white shadow-md">
        {chatOpen && chatProps ? (
          <ChatModal
            open={chatOpen}
            onClose={() => {
              setChatOpen(false);
              if (currentUser) {
                apiFetch(`/api/messages/poster-inbox?userId=${currentUser.id}`)
                  .then(res => res.json())
                  .then(data => {
                    setThreads(Array.isArray(data) ? data : []);
                    if (typeof onInboxRead === 'function') onInboxRead();
                  });
              } else {
                if (typeof onInboxRead === 'function') onInboxRead();
              }
            }}
            {...chatProps}
          />
        ) : (
          <div className="text-center text-gray-500 p-6">Select a chat to view messages</div>
        )}
      </div>
    </div>
  );
}