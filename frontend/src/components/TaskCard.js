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
    if (task.poster?.username) {
      onPosterClick(task.poster.username);
    }
  };

  const handleCardClick = (e) => {
    // Prevent event bubbling to parent elements
    e.stopPropagation();
    // Update URL using history API with the correct path format
    window.history.pushState({}, '', `/tasks/${task.id}`);
    // Force a re-render by updating the page state
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const imageUrl = task.imageUrl || 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80';
  const profilePicUrl = task.poster?.profilePicUrl || `https://ui-avatars.com/api/?name=${task.poster?.username || 'U'}`;
  const formattedDate = task.createdAt ? new Date(task.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : '';

  return (
    <div className="w-full h-full" onClick={handleCardClick}>
      <CardContainer className="w-full h-full cursor-pointer">
        <CardBody className="w-full h-full p-5">
          <div className="flex flex-col h-full">
            {/* Status and date */}
            <div className="flex items-center justify-between w-full mb-3">
              <CardItem 
                translateZ={20}
                className="px-2 py-1 text-[10px] font-medium rounded-full"
                style={{ 
                  backgroundColor: task.status === 'OPEN' ? '#DCFCE7' : '#FEE2E2',
                  color: task.status === 'OPEN' ? '#166534' : '#991B1B'
                }}
              >
                {task.status}
              </CardItem>
              <CardItem translateZ={10} className="text-xs text-gray-500">
                {formattedDate}
              </CardItem>
            </div>

            {/* Task image */}
            <CardItem 
              translateZ={50}
              className="w-full h-36 overflow-hidden rounded-lg mb-3 relative group"
            >
              <img 
                src={imageUrl}
                alt={task.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="bg-white text-indigo-600 px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                  View Details
                </span>
              </div>
            </CardItem>

            {/* Task title and description */}
            <div className="mb-3">
              <CardItem 
                translateZ={30}
                className="text-lg font-bold mb-1 text-gray-800 dark:text-white line-clamp-1"
              >
                {task.title}
              </CardItem>
              <CardItem
                translateZ={20}
                className="text-gray-600 dark:text-gray-300 text-xs line-clamp-2 mb-2"
              >
                {task.description}
              </CardItem>
            </div>

            {/* Poster info */}
            <CardItem 
              translateZ={20}
              className="flex items-center gap-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handlePosterClick}
            >
              <img
                src={profilePicUrl}
                alt={task.poster?.username || 'User'}
                className="rounded-full w-8 h-8 object-cover border-2 border-white"
              />
              <div className="overflow-hidden">
                <p className="text-xs text-gray-400 truncate">Posted by</p>
                <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                  {task.poster?.username || 'Unknown'}
                </p>
              </div>
            </CardItem>

            {/* Tags */}
            {task.tags && (
              <CardItem 
                translateZ={10}
                className="mb-3 flex flex-wrap gap-1"
              >
                {task.tags.split(',').slice(0, 2).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-0.5 text-[10px] bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 truncate"
                  >
                    {tag.trim()}
                  </span>
                ))}
                {task.tags.split(',').length > 2 && (
                  <span className="text-xs text-gray-400">+{task.tags.split(',').length - 2} more</span>
                )}
              </CardItem>
            )}

            {/* Footer with budget and action button */}
            <CardItem 
              translateZ={30}
              className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100 dark:border-gray-800"
            >
              <div>
                <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                  ${task.budget?.toLocaleString() || '0'}
                </span>
              </div>
              
              <div className="flex-shrink-0">
                {isHustler && !hasAccepted && !isCompleted && (
                  <Button 
                    onClick={handleAccept}
                    disabled={accepting === task.id}
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                  >
                    {accepting === task.id ? '...' : 'Accept'}
                  </Button>
                )}
                
                {hasAccepted && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Accepted
                  </span>
                )}
                
                {isCompleted && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Completed
                  </span>
                )}
              </div>
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>
    </div>
  );
};

export default TaskCard;
