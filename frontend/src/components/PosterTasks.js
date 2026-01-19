

import React, { useEffect, useState } from "react";
import RatingModal from "./RatingModal";
import { CardContainer, CardBody, CardItem } from "./ui/aceternity-card";


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
    <div className="w-full max-w-6xl mx-auto mt-8">
      <h2 className="text-3xl font-black mb-4 mt-2 text-[#101828]">Tasks You Posted</h2>
      {tasks.length === 0 ? (
        <div className="text-gray-400">No tasks posted yet.</div>
      ) : (
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {tasks.map((task) => (
              <CardContainer key={task.id} containerClassName="!py-0 !justify-start h-full">
                <CardBody className="h-full">
                  <div className="h-full flex flex-col justify-between bg-neutral-900 border border-neutral-800 rounded-2xl p-6 transition-shadow hover:shadow-2xl">
                    <div>
                      <div className="font-bold text-lg text-white mb-2 truncate">{task.title}</div>
                      <div className="text-neutral-400 text-sm mb-4 min-h-[48px] truncate" title={task.description}>{task.description}</div>
                    </div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Budget:</span>
                        <span className="text-xs text-white font-semibold">{task.budget}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-400">Status:</span>
                        {/* Status pill replaced by Done/N/A logic */}
                        {task.acceptedHustlers && task.acceptedHustlers.length > 0 && task.acceptedHustlers.every(hustler => task.completedHustlers && task.completedHustlers.find && task.completedHustlers.find((u) => u.id === hustler.id)) ? (
                          <span className="text-xs px-2 py-0.5 rounded font-semibold ml-2 bg-green-900 text-green-400">Done</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded font-semibold ml-2 bg-neutral-800 text-neutral-400">N/A</span>
                        )}
                      </div>
                      {task.status !== 'ARCHIVED' && (
                        <div className="flex justify-end mt-2">
                          <button
                            className="px-8 py-0.5 border-2 border-black dark:border-white uppercase bg-white text-black transition duration-200 text-sm shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)] rounded-md"
                            onClick={async (e) => {
                              e.preventDefault();
                              await fetch(`http://localhost:8080/api/tasks/${task.id}/archive?posterId=${currentUser.id}`, { method: 'POST' });
                              fetch(`http://localhost:8080/api/tasks/poster/${currentUser.id}`)
                                .then((res) => res.json())
                                .then(setTasks);
                            }}
                          >
                          Archive
                          </button>
                        </div>
                      )}
                      {task.acceptedHustlers && task.acceptedHustlers.length > 0 && (
                        <div className="mt-2">
                          <span className="block text-xs font-medium text-blue-400 mb-1">Accepted by:</span>
                          <ul className="space-y-1">
                            {task.acceptedHustlers.map((hustler) => (
                              <li key={hustler.id} className="flex items-center gap-2 text-xs">
                                <span className="font-medium text-white">{hustler.username}</span>
                                {task.completedHustlers && task.completedHustlers.find && task.completedHustlers.find((u) => u.id === hustler.id) ? null : (
                                  <button className="ml-2 bg-green-600 hover:bg-green-700 text-white px-2 py-0.5 rounded text-xs font-semibold transition" onClick={(e) => { e.preventDefault(); openModal(task, hustler); }}>
                                    Mark as Done
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </CardContainer>
            ))}
          </div>
        </div>
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