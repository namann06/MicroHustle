import React from 'react';
import { useNavigate } from 'react-router-dom';

// Props: currentUser, onLogout, unreadNotificationCount, unreadInboxCount
function NavBar({ currentUser, onLogout, unreadNotificationCount, unreadInboxCount }) {
  const navigate = useNavigate();
  return (
    <nav className="bg-white shadow p-4 flex gap-4">
      <button className="font-bold" onClick={() => navigate('/')}>Home</button>
      {currentUser && currentUser.role === 'POSTER' && (
        <>
          <button onClick={() => navigate('/post')}>Post Task</button>
          <button onClick={() => navigate('/posterTasks')}>My Tasks</button>
          <button onClick={() => navigate('/posterInbox')} className="relative">
            Inbox
            {unreadInboxCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unreadInboxCount}
              </span>
            )}
          </button>
        </>
      )}
      {currentUser && currentUser.role === 'HUSTLER' && (
        <>
          <button onClick={() => navigate('/hustlerTasks')}>My Tasks</button>
          <button onClick={() => navigate('/inbox')} className="relative">
            Inbox
            {unreadInboxCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unreadInboxCount}
              </span>
            )}
          </button>
        </>
      )}
      {currentUser && (
        <button onClick={() => navigate('/notifications')} title="Updates" className="relative text-2xl">
          <span role="img" aria-label="bell">🔔</span>
          {currentUser.role === 'POSTER' && unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {unreadNotificationCount}
            </span>
          )}
        </button>
      )}
      {!currentUser && <button onClick={() => navigate('/login')}>Login</button>}
      {!currentUser && <button onClick={() => navigate('/register')}>Register</button>}
      {currentUser && (
        <>
          <button onClick={() => navigate(`/profile/${currentUser.username}`)}>Profile</button>
          <span className="ml-auto flex items-center gap-2">
            <span className="text-gray-600">Logged in as <b>{currentUser.username}</b> ({currentUser.role})</span>
            <button onClick={onLogout} className="bg-red-500 text-white px-2 py-1 rounded">Logout</button>
          </span>
        </>
      )}
    </nav>
  );
}

export default NavBar;
