import React, { useEffect, useState } from "react";
import { CardContainer, CardBody, CardItem } from "./ui/aceternity-card";

function HustlerTasks({ currentUser }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    fetch(`http://localhost:8080/api/tasks/hustler/${currentUser.id}`)
      .then((res) => res.json())
      .then(setTasks);
  }, [currentUser]);

  const markTaskAsCompleted = async (taskId) => {
    try {
      await fetch(`http://localhost:8080/api/tasks/${taskId}/complete?hustlerId=${currentUser.id}`, { 
        method: 'POST' 
      });
      // Refresh tasks after marking as completed
      fetch(`http://localhost:8080/api/tasks/hustler/${currentUser.id}`)
        .then((res) => res.json())
        .then(setTasks);
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  };

  if (!currentUser) return <div>Login required</div>;
  return (
    <div className="w-full max-w-6xl mx-auto mt-8">
      <h2 className="text-3xl font-black mb-4 mt-2 text-[#101828]">Tasks You've Accepted</h2>
      {tasks.length === 0 ? (
        <div className="text-gray-400">No tasks accepted yet.</div>
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
                        {task.completedHustlers && task.completedHustlers.find && task.completedHustlers.find((u) => u.id === currentUser.id) ? (
                          <span className="text-xs px-2 py-0.5 rounded font-semibold ml-2 bg-green-900 text-green-400">Completed</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded font-semibold ml-2 bg-yellow-900 text-yellow-400">In Progress</span>
                        )}
                      </div>
                      {task.deadline && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-400">Deadline:</span>
                          <span className="text-xs text-white font-semibold">{new Date(task.deadline).toLocaleDateString()}</span>
                        </div>
                      )}
                      {task.poster && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-400">Posted by:</span>
                          <span className="text-xs text-blue-400 font-semibold">{task.poster.username}</span>
                        </div>
                      )}
                      {!(task.completedHustlers && task.completedHustlers.find && task.completedHustlers.find((u) => u.id === currentUser.id)) && (
                        <div className="flex justify-end mt-2">
                          <button
                            className="px-8 py-0.5 border-2 border-black dark:border-white uppercase bg-white text-black transition duration-200 text-sm shadow-[1px_1px_rgba(0,0,0),2px_2px_rgba(0,0,0),3px_3px_rgba(0,0,0),4px_4px_rgba(0,0,0),5px_5px_0px_0px_rgba(0,0,0)] dark:shadow-[1px_1px_rgba(255,255,255),2px_2px_rgba(255,255,255),3px_3px_rgba(255,255,255),4px_4px_rgba(255,255,255),5px_5px_0px_0px_rgba(255,255,255)] rounded-md"
                            onClick={(e) => {
                              e.preventDefault();
                              markTaskAsCompleted(task.id);
                            }}
                          >
                            Mark Complete
                          </button>
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
    </div>
  );
}

export default HustlerTasks;