import React from 'react';
import { CardContainer, CardBody, CardItem } from './ui/3d-card';
import { Button } from './ui/button';

const TaskCard = ({ task, currentUser, onPosterClick, onAccept, accepting }) => {
  const isHustler = currentUser?.role === 'HUSTLER';
  const isPoster = currentUser?.id === task.posterId;
  const isAccepted = task.status === 'ACCEPTED';
  const isCompleted = task.status === 'COMPLETED';
  const acceptedIds = (task.acceptedHustlers || []).map(u => u.id);
  const hasAccepted = currentUser && acceptedIds.includes(currentUser.id);

  const handleAccept = (e) => {
    e.stopPropagation();
    onAccept(task.id);
  };

  const handlePosterClick = (e) => {
    e.stopPropagation();
    onPosterClick(task.posterId);
  };

  const imageUrl = task.imageUrl || 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80';
  const profilePicUrl = task.poster?.profilePicUrl || `https://ui-avatars.com/api/?name=${task.poster?.username || 'U'}`;
  const formattedDate = task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : '';

  return (
    <div className="w-full h-full">
      <CardContainer className="w-full h-full">
        <CardBody className="w-full h-full p-6">
          <div className="flex flex-col h-full">
            {/* Header with date and status */}
            <div className="flex items-center justify-between w-full mb-4">
              <CardItem translateZ={20} className="text-sm text-gray-500">
                {formattedDate}
              </CardItem>
              <CardItem 
                translateZ={20}
                className="px-2 py-1 text-xs font-medium rounded-full"
                style={{ 
                  backgroundColor: task.status === 'OPEN' ? '#DCFCE7' : '#FEE2E2',
                  color: task.status === 'OPEN' ? '#166534' : '#991B1B'
                }}
              >
                {task.status}
              </CardItem>
            </div>

            {/* Poster info */}
            <CardItem 
              translateZ={30}
              className="flex items-center gap-3 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handlePosterClick}
            >
              <img
                src={profilePicUrl}
                alt={task.poster?.username || 'User'}
                className="rounded-full w-10 h-10 object-cover border-2 border-white"
              />
              <div>
                <p className="text-sm text-gray-400">Posted by</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {task.poster?.username || 'Unknown'}
                </p>
              </div>
            </CardItem>

            {/* Task image */}
            <CardItem 
              translateZ={50}
              className="w-full h-48 overflow-hidden rounded-xl mb-4"
            >
              <img 
                src={imageUrl}
                alt={task.title}
                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
              />
            </CardItem>

            {/* Task title */}
            <CardItem 
              translateZ={40}
              className="text-xl font-bold mb-2 text-gray-800 dark:text-white line-clamp-2"
            >
              {task.title}
            </CardItem>

            {/* Task description */}
            <CardItem
              translateZ={30}
              className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow"
            >
              {task.description}
            </CardItem>

            {/* Tags */}
            {task.tags && (
              <CardItem 
                translateZ={20}
                className="mt-auto mb-4 flex flex-wrap gap-2"
              >
                {task.tags.split(',').map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </CardItem>
            )}

            {/* Footer with budget and action button */}
            <CardItem 
              translateZ={40}
              className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100 dark:border-gray-800"
            >
              <div>
                <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${task.budget?.toLocaleString() || '0'}
                </span>
              </div>
              
              {isHustler && !hasAccepted && !isCompleted && (
                <Button 
                  onClick={handleAccept}
                  disabled={accepting === task.id}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {accepting === task.id ? 'Processing...' : 'Accept Task'}
                </Button>
              )}
              
              {hasAccepted && (
                <span className="px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-full">
                  Accepted
                </span>
              )}
              
              {isCompleted && (
                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm rounded-full">
                  Completed
                </span>
              )}
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </div>
  );
};

export default TaskCard;
