import React, { useEffect, useState } from "react";

function Notifications({ currentUser }) {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'POSTER') return;
    fetch(`http://localhost:8080/api/notifications/poster/${currentUser.id}?unread=true`)
      .then(res => res.json())
      .then(setNotifications);
  }, [currentUser]);

  const markAsRead = async (id) => {
    await fetch(`http://localhost:8080/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications(notifications.filter(n => n.id !== id));
  };

  if (!currentUser || currentUser.role !== 'POSTER') return <div className="text-white">Login as a poster to see updates.</div>;

  return (
    <div className="max-w-xl mx-auto bg-[#1a2233] p-6 rounded mt-8 shadow">
      <h2 className="text-2xl font-bold text-yellow-300 mb-4">Task Updates</h2>
      {notifications.length === 0 ? (
        <div className="text-gray-400">No new updates yet.</div>
      ) : (
        <ul className="space-y-4">
          {notifications.map(n => (
            <li key={n.id} className="bg-[#232b3d] p-4 rounded flex flex-col gap-2">
              <div className="font-semibold text-lg text-yellow-300">
                Task: {n.taskTitle ? n.taskTitle : `ID: ${n.taskId}`}
              </div>
              <div className="text-white mb-2">
                Accepted by: {n.hustlerUsername ? n.hustlerUsername : `ID: ${n.hustlerId}`}
              </div>
              <div className="text-gray-400 text-sm">Received: {new Date(n.createdAt).toLocaleString()}</div>
              <button className="bg-green-600 text-white px-3 py-1 rounded self-start" onClick={() => markAsRead(n.id)}>Mark as Read</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;
