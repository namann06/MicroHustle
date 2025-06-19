import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

function TaskList({ currentUser, search }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [accepting, setAccepting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = () => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8080/api/tasks')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load tasks');
        return res.json();
      })
      .then(data => setTasks(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAccept = async (taskId) => {
    if (!currentUser) return;
    setAccepting(taskId);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/api/tasks/${taskId}/accept?hustlerId=${currentUser.id}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to accept task');
      fetchTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(null);
    }
  };

  const handlePosterClick = (username) => {
    // Update browser URL for better routing/bookmarking
    window.history.pushState({}, '', `/profile/${encodeURIComponent(username)}`);
    const ev = new CustomEvent('viewPublicProfile', { detail: { username } });
    window.dispatchEvent(ev);
  };

  if (loading) return <div className="text-center py-8">Loading tasks...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Tasks</h2>
      <ul className="space-y-4">
        {tasks
          .filter(task => {
            if (!search) return true;
            const s = search.toLowerCase();
            return (
              (task.title && task.title.toLowerCase().includes(s)) ||
              (task.description && task.description.toLowerCase().includes(s)) ||
              (task.tags && task.tags.toLowerCase().includes(s))
            );
          })
          .map(task => {
          const acceptedIds = (task.acceptedHustlers || []).map(u => u.id);
          const hasAccepted = currentUser && acceptedIds.includes(currentUser.id);
          return (
            <li key={task.id} className="bg-white p-4 rounded shadow">
              {/* Poster info */}
              {task.poster && (
                <div className="flex items-center mb-2 cursor-pointer" onClick={() => handlePosterClick(task.poster.username)}>
                  <img
                    src={(task.poster.profilePicUrl && task.poster.profilePicUrl.startsWith('/')) ? `http://localhost:8080${task.poster.profilePicUrl}` : (task.poster.profilePicUrl || 'https://ui-avatars.com/api/?name=' + task.poster.username) }
                    alt="poster"
                    className="w-10 h-10 rounded-full mr-2"
                  />
                  <span className="text-sm text-gray-600 hover:underline">{task.poster.username}</span>
                </div>
              )}
              <div className="cursor-pointer" onClick={() => navigate(`/tasks/${task.id}`, { state: { currentUser } })}>
                <div className="font-semibold text-lg text-yellow-300">{task.title}</div>
                <div className="text-gray-400 text-sm">Budget: {task.budget}</div>
                <div className="text-blue-300 text-xs">Tags: {task.tags}</div>
              </div>
              {currentUser && currentUser.role === 'HUSTLER' && !hasAccepted && (
                <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleAccept(task.id)} disabled={accepting === task.id}>
                  {accepting === task.id ? 'Accepting...' : 'Accept'}
                </button>
              )}
              {currentUser && currentUser.role === 'HUSTLER' && hasAccepted && (
                <div className="mt-2 text-green-700">You have accepted this task.</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TaskList;