import React, { useEffect, useState } from "react";
import ChatModal from './ChatModal';
import '../styles/task-details.css';

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
    <div className="task-details-root">
        <button className="mb-4 text-blue-400" onClick={onBack}>← Back</button>
      {/* Header Card */}
      <div className="task-details-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => window.location.href = `/profile/${task.poster?.username}`}
            className="focus:outline-none"
            style={{ borderRadius: '9999px' }}
            title={task.poster?.username || ''}
          >
            <div className="task-details-avatar">
              {task.poster && task.poster.profilePicUrl ? (
                <img src={task.poster.profilePicUrl} alt="avatar" className="w-full h-full object-cover" onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }} />
              ) : (
                <img src={'/default-avatar.png'} alt="avatar" className="w-full h-full object-cover" />
              )}
            </div>
          </button>
          <div>
            <div className="task-details-username">{task.poster ? task.poster.username : 'Unknown'}</div>
            <div className="task-details-handle">@{task.poster ? task.poster.username : 'unknown'}</div>
          </div>
        </div>
        <div className="task-details-header-tags">
          <span className="task-details-tag">{task.tags || 'No Tag'}</span>
        </div>
      </div>
      {/* Project Details Card */}
      <div className="task-details-card">
        <h2 className="task-details-title">Project Details</h2>
        <div className="task-details-description">
          {task.description || 'No description provided.'}
        </div>
        <div className="task-details-badges">
          <span className="task-details-badge">Budget: {task.budget}</span>
          <span className="task-details-badge">Deadline: {task.deadline || 'N/A'}</span>
          <span className="task-details-badge">Status: {task.status}</span>
        </div>
      </div>
    </div>
  );
}

export default TaskDetails;