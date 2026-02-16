import React, { useEffect, useState } from "react";
import ChatModal from "./ChatModal";
import { apiFetch } from "../lib/api";

export default function HustlerInbox({ currentUser, onInboxRead }) {
  const [threads, setThreads] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProps, setChatProps] = useState(null);
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'HUSTLER') return;
    apiFetch(`/api/messages/inbox?userId=${currentUser.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setThreads(data);
        else setThreads([]);
      });
  }, [currentUser]);

  const markThreadReadHustler = (taskId, posterId, hustlerId) => {
    return apiFetch(`/api/messages/mark-thread-read-hustler?taskId=${taskId}&posterId=${posterId}&hustlerId=${hustlerId}`, {
      method: 'POST'
    });
  };

  const handleFileUpload = async (thread) => {
    if (!file) {
      console.error("No file selected for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("taskId", thread.taskId);
    formData.append("posterId", thread.posterId);
    formData.append("hustlerId", currentUser.id);

    try {
      const response = await apiFetch(`/api/messages/upload-file`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        console.error("File upload failed:", response.statusText);
        return;
      }

      console.log("File uploaded successfully.");

      // Refresh threads after upload
      const inboxResponse = await apiFetch(`/api/messages/inbox?userId=${currentUser.id}`);
      const data = await inboxResponse.json();
      setThreads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error during file upload:", error);
    }
  };

  const openChat = (thread) => {
    setChatProps({
      currentUser,
      otherUser: { id: thread.posterId, username: thread.posterUsername },
      task: { id: thread.taskId, title: thread.taskTitle }
    });
    setChatOpen(true);
    // Mark all as read for this thread for hustler
    markThreadReadHustler(thread.taskId, thread.posterId, currentUser.id);
  };

  if (!currentUser || currentUser.role !== 'HUSTLER') return <div className="text-white">Login as a hustler to see your inbox.</div>;

  return (
    <div className="inbox-container flex min-h-screen">
      <div className="inbox-list w-1/3 bg-[#1a2233] p-4 shadow-md overflow-y-auto">
        <h2 className="text-xl font-bold text-blue-300 mb-2">Chats</h2>
        {(!Array.isArray(threads) || threads.length === 0) ? (
          <div className="text-gray-400">No messages yet.</div>
        ) : (
          <ul className="space-y-2">
            {threads.map(thread => (
              <li key={thread.taskId + '-' + thread.posterId} className="bg-[#232b3d] p-3 rounded flex flex-col gap-1 cursor-pointer hover:bg-[#2a3447]" onClick={() => openChat(thread)}>
                <div className="font-semibold text-base text-blue-300">
                  {thread.taskTitle}
                </div>
                <div className="text-white">
                  From: {thread.posterUsername}
                </div>
                <div className="text-gray-400 text-xs">Unread: {thread.unreadCount}</div>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="text-gray-400 text-xs mt-2"
                />
                <button
                  onClick={() => handleFileUpload(thread)}
                  className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
                >
                  Upload File
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="chat-pane w-2/3 bg-white shadow-md">
        {chatOpen && chatProps ? (
          <ChatModal
            open={chatOpen}
            onClose={async () => {
              setChatOpen(false);
              if (currentUser && chatProps) {
                await markThreadReadHustler(
                  chatProps.task.id,
                  chatProps.otherUser.id,
                  currentUser.id
                );
                apiFetch(`/api/messages/inbox?userId=${currentUser.id}`)
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