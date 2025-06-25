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
    <div className="max-w-2xl mx-auto mt-10">
      <button className="mb-4 text-blue-400" onClick={onBack}>← Back</button>
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-lg flex items-center justify-between p-6 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.href = `/profile/${task.poster?.username}`}
            className="focus:outline-none"
            style={{ borderRadius: '9999px' }}
            title={task.poster?.username || ''}
          >
            <div className="w-16 h-16 rounded-full bg-gray-200 border-4 border-[#e5e7eb] flex items-center justify-center overflow-hidden">
              {task.poster && task.poster.profilePicUrl ? (
                <img src={task.poster.profilePicUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-gray-400">{task.poster && task.poster.username ? task.poster.username[0].toUpperCase() : '?'}</span>
              )}
            </div>
          </button>
          <div>
            <div className="font-bold text-lg text-[#101828]">{task.poster ? task.poster.username : 'Unknown'}</div>
            <div className="text-gray-400 text-sm">@{task.poster ? task.poster.username : 'unknown'}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="px-3 py-1 rounded-full bg-[#f3f4f6] text-gray-700 font-semibold text-xs mb-1">{task.tags || 'No Tag'}</span>
        </div>
      </div>
      {/* Project Details Card */}
      <div className="bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-extrabold text-[#101828] mb-6">Project Details</h2>
        <div className="mb-6 text-gray-800 text-base">
          {task.description || 'No description provided.'}
        </div>
        <div className="flex flex-wrap gap-4 mt-6">
          <span className="bg-[#f3f4f6] text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">Budget: {task.budget}</span>
          <span className="bg-[#f3f4f6] text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">Deadline: {task.deadline || 'N/A'}</span>
          <span className="bg-[#f3f4f6] text-gray-700 rounded-full px-3 py-1 text-xs font-semibold">Status: {task.status}</span>
        </div>
      </div>
    </div>
  );
}

export default TaskDetails;