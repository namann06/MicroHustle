import React, { useEffect, useState } from "react";
import RatingModal from "./RatingModal";

function PosterTasks({ currentUser }) {
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalHustler, setModalHustler] = useState(null);
  const [modalTask, setModalTask] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`http://localhost:8080/api/tasks/poster/${currentUser.id}`)
      .then((res) => res.json())
      .then(setTasks);
  }, [currentUser]);

  const openModal = (task, hustler) => {
    setModalTask(task);
    setModalHustler(hustler);
    setModalOpen(true);
  };

  const handleSubmitRating = async (rating, comment) => {
    if (!modalTask || !modalHustler) return;
    // 1. Submit rating
    await fetch(`http://localhost:8080/api/ratings/give?hustlerId=${modalHustler.id}&posterId=${currentUser.id}&taskId=${modalTask.id}&rating=${rating}&comment=${encodeURIComponent(comment)}`, { method: 'POST' });
    // 2. Mark as done
    await fetch(`http://localhost:8080/api/tasks/${modalTask.id}/complete?hustlerId=${modalHustler.id}`, { method: 'POST' });
    // 3. Refresh tasks
    fetch(`http://localhost:8080/api/tasks/poster/${currentUser.id}`)
      .then((res) => res.json())
      .then(setTasks);
    setModalOpen(false);
  };

  if (!currentUser) return <div>Login required</div>;
  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-white">Tasks You Posted</h2>
      {tasks.length === 0 ? (
        <div className="text-gray-400">No tasks posted yet.</div>
      ) : (
        <ul className="space-y-4">
          {tasks.map((task) => (
            <li key={task.id} className="bg-[#1a2233] p-4 rounded shadow">
              <div className="font-semibold text-lg text-yellow-300">{task.title}</div>
              <div className="text-white">{task.description}</div>
              <div className="text-gray-400 text-sm">Budget: {task.budget} | Status: {task.status}</div>
              {/* Archive button for posters (if not archived) */}
              {task.status !== 'ARCHIVED' && (
                <button
                  className="mt-2 bg-red-600 text-white px-2 py-1 rounded"
                  onClick={async () => {
                    await fetch(`http://localhost:8080/api/tasks/${task.id}/archive?posterId=${currentUser.id}`, { method: 'POST' });
                    // Refresh tasks
                    fetch(`http://localhost:8080/api/tasks/poster/${currentUser.id}`)
                      .then((res) => res.json())
                      .then(setTasks);
                  }}
                >
                  Archive
                </button>
              )}
              {task.acceptedHustlers && task.acceptedHustlers.length > 0 && (
                <div className="mt-2 text-blue-400">
                  Accepted by:
                  <ul className="ml-2">
                    {task.acceptedHustlers.map(hustler => (
                      <li key={hustler.id} className="flex items-center gap-2">
                        <span>{hustler.username}</span>
                        {task.completedHustlers && task.completedHustlers.find && task.completedHustlers.find(u => u.id === hustler.id) ? (
                          <span className="text-green-400 ml-2">Done</span>
                        ) : (
                          <button className="ml-2 bg-green-600 text-white px-2 py-1 rounded" onClick={() => openModal(task, hustler)}>
                            Mark as Done
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <RatingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitRating}
        hustler={modalHustler}
        task={modalTask}
      />
    </div>
  );
}

export default PosterTasks;