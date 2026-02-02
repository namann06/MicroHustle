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
    <div className="min-h-screen bg-gray-900 -mx-8 -my-8 px-8 py-8">
      <div className="w-full max-w-4xl mx-auto pt-8">
        <h2 className="text-3xl font-bold mb-6 text-white">Tasks You've Accepted</h2>
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No tasks accepted yet.</div>
            <div className="text-gray-500 text-sm">Browse available tasks to get started!</div>
          </div>
        ) : (
          <div className="grid gap-6">
            {tasks.map((task) => (
              <div key={task.id} className="bg-[#1a2233] border border-gray-700 rounded-xl p-6 hover:border-yellow-500 transition-all duration-300 shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="font-bold text-xl text-yellow-300">{task.title}</div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium">
                      {task.status}
                    </span>
                  </div>
                </div>
                <div className="text-gray-300 mb-4 leading-relaxed">{task.description}</div>
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-400">
                    <span className="font-medium">Budget:</span> <span className="text-green-400 font-bold">₹{task.budget}</span>
                  </div>
                  {task.deadline && (
                    <div className="text-gray-400">
                      <span className="font-medium">Deadline:</span> <span className="text-yellow-400">{new Date(task.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HustlerTasks;