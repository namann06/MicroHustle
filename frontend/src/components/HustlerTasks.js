import React, { useEffect, useState } from "react";

function HustlerTasks({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    if (!currentUser) return;
    fetch(`http://localhost:8080/api/tasks/hustler/${currentUser.id}`)
      .then((res) => res.json())
      .then(setTasks);
  }, [currentUser]);

  if (!currentUser) return <div>Login required</div>;
  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Tasks You've Accepted</h2>
      {tasks.length === 0 ? (
        <div className="text-gray-400">No tasks accepted yet.</div>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="bg-[#1a2233] p-4 rounded shadow">
              <div className="font-semibold text-lg text-yellow-300">{task.title}</div>
              <div className="text-white">{task.description}</div>
              <div className="text-gray-400 text-sm">Budget: {task.budget} | Status: {task.status}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default HustlerTasks;