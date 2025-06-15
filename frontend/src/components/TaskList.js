import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

function TaskList({ currentUser, search }) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [accepting, setAccepting] = useState(null);

  const fetchTasks = () => {
    fetch('http://localhost:8080/api/tasks')
      .then(res => res.json())
      .then(data => setTasks(data));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleAccept = async (taskId) => {
    if (!currentUser) return;
    setAccepting(taskId);
    await fetch(`http://localhost:8080/api/tasks/${taskId}/accept?hustlerId=${currentUser.id}`, { method: 'POST' });
    setAccepting(null);
    fetchTasks();
  };

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