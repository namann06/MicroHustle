import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskCard from './TaskCard';

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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-white tracking-tight">All Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks
          .filter(task => task.status !== 'ARCHIVED') // Hide archived tasks
          .filter(task => {
            if (!search) return true;
            const s = search.toLowerCase();
            return (
              (task.title && task.title.toLowerCase().includes(s)) ||
              (task.description && task.description.toLowerCase().includes(s)) ||
              (task.tags && task.tags.toLowerCase().includes(s))
            );
          })
          .map(task => (
            <div key={task.id} className="w-full h-full">
              <TaskCard 
                task={task} 
                currentUser={currentUser}
                onPosterClick={handlePosterClick}
                onAccept={handleAccept}
                accepting={accepting}
              />
            </div>
          ))}
      </div>
    </div>
  );
}

export default TaskList;