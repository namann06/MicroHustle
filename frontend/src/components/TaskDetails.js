import React, { useEffect, useState } from "react";
import ChatModal from './ChatModal';

function TaskDetails({ taskId, onBack, currentUser }) {
  const [task, setTask] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProps, setChatProps] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:8080/api/tasks/${taskId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load task details');
        return res.json();
      })
      .then(setTask)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [taskId]);

  if (loading) return <div className="text-white">Loading task details...</div>;
  if (error) return <div className="text-white">{error}</div>;
  if (!task) return <div className="text-white">Task not found.</div>;

  return (
    <div className="max-w-xl mx-auto bg-[#1a2233] p-6 rounded mt-8 shadow">
      <button className="mb-4 text-blue-400" onClick={onBack}>← Back</button>
      <h2 className="text-3xl font-bold text-yellow-300 mb-2">{task.title}</h2>
      <div className="text-gray-400 mb-2">Budget: {task.budget}</div>
      <div className="text-gray-400 mb-2">Tags: {task.tags}</div>
      <div className="text-white mb-2">{task.description}</div>
      <div className="text-gray-400 mb-2">Deadline: {task.deadline}</div>
      <div className="text-gray-400 mb-2">Status: {task.status}</div>
      {currentUser && task.poster && currentUser.id === task.poster.id && task.acceptedHustlers && task.acceptedHustlers.length > 0 && (
        <div className="text-blue-400 mt-2">
          Accepted by:
          {task.acceptedHustlers.map(u => (
            <span key={u.id} className="ml-2">
              {u.username}
              <button
                className="ml-2 bg-blue-600 text-white px-2 py-0.5 rounded text-xs"
                onClick={() => {
                  setChatProps({
                    currentUser,
                    otherUser: { id: u.id, username: u.username },
                    task: { id: task.id, title: task.title }
                  });
                  setChatOpen(true);
                }}
              >Message</button>
            </span>
          ))}
        </div>
      )}
      {chatOpen && chatProps && (
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          {...chatProps}
        />
      )}
      {task.poster && (
        <div className="text-gray-400 mt-2">Posted by: {task.poster.username}</div>
      )}
    </div>
  );
}

export default TaskDetails;