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
      <h2 className="text-2xl font-bold mb-8 ml-2">All Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
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
            const date = task.createdAt ? new Date(task.createdAt) : null;
            const formattedDate = date ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
            const imageUrl = task.imageUrl || 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80';
            return (
              <li key={task.id} className="task-list_card group list-none w-full max-w-xs">
                {/* Header: Date */}
                <div className="flex items-center justify-between mb-2">
                  <p className="task-list_date">{formattedDate}</p>
                </div>
                {/* Poster Info and Title */}
                <div className="flex items-center gap-4 mt-2 mb-3">
                  <img
                    src={(task.poster && task.poster.profilePicUrl && task.poster.profilePicUrl.startsWith('/')) ? `http://localhost:8080${task.poster.profilePicUrl}` : (task.poster?.profilePicUrl || 'https://ui-avatars.com/api/?name=' + (task.poster?.username || 'U'))}
                    alt={task.poster?.username || 'User'}
                    className="rounded-full w-12 h-12 object-cover border border-gray-200 cursor-pointer hover:brightness-90 transition"
                    onClick={() => handlePosterClick(task.poster?.username)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium truncate text-gray-800">{task.poster?.username || 'Unknown'}</p>
                    <h3 className="text-xl font-bold text-[#101828] truncate mt-1">{task.title}</h3>
                  </div>
                </div>
                {/* Description and Main Image */}
                <div className="mb-3">
                  <p className="task-list_desc">{task.description}</p>
                  <img src={imageUrl} alt="task" className="task-list_img" />
                </div>
                {/* Category/Tags and Budget */}
                <div className="flex items-center justify-between gap-3 mt-3">
                  <span className="text-xs px-3 py-1 bg-gray-100 rounded-full text-gray-600 font-medium cursor-pointer hover:bg-gray-200 transition">{task.tags || 'General'}</span>
                  <span className="text-xs px-3 py-1 bg-blue-100 rounded-full text-blue-700 font-semibold">₹{task.budget}</span>
                </div>
                {/* Details Button */}
                <button
                  className="task-list_btn mt-5 w-full"
                  onClick={() => navigate(`/tasks/${task.id}`, { state: { currentUser } })}
                >
                  Details
                </button>
                {/* Accept Button (Hustler) */}
                {currentUser && currentUser.role === 'HUSTLER' && !hasAccepted && (
                  <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded w-full" onClick={() => handleAccept(task.id)} disabled={accepting === task.id}>
                    {accepting === task.id ? 'Accepting...' : 'Accept'}
                  </button>
                )}
                {currentUser && currentUser.role === 'HUSTLER' && hasAccepted && (
                  <div className="mt-2 text-green-700 text-center">You have accepted this task.</div>
                )}
              </li>
            );
          })}
      </div>
    </div>
  );
}

export default TaskList;