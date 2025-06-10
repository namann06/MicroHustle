import React, { useEffect, useState } from 'react';

function TaskList({ currentUser }) {
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
        {tasks.map(task => {
          const acceptedIds = (task.acceptedHustlers || []).map(u => u.id);
          const hasAccepted = currentUser && acceptedIds.includes(currentUser.id);
          return (
            <li key={task.id} className="bg-white p-4 rounded shadow">
              <div className="font-bold">{task.title}</div>
              <div>{task.description}</div>
              <div className="text-sm text-gray-500">Budget: ₹{task.budget} | Tags: {task.tags}</div>
              {currentUser && currentUser.role === 'HUSTLER' && !hasAccepted && (
                <button className="mt-2 bg-green-600 text-white px-3 py-1 rounded" onClick={() => handleAccept(task.id)} disabled={accepting === task.id}>
                  {accepting === task.id ? 'Accepting...' : 'Accept'}
                </button>
              )}
              {currentUser && currentUser.role === 'HUSTLER' && hasAccepted && (
                <div className="mt-2 text-green-700">You have accepted this task.</div>
              )}
              {currentUser && currentUser.role === 'POSTER' && task.acceptedHustlers && task.acceptedHustlers.length > 0 && (
                <div className="mt-2 text-blue-700">
                  Accepted by: {task.acceptedHustlers.map(u => u.username).join(', ')}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default TaskList;
