import React from 'react';
import { useNavigate } from 'react-router-dom';

// Props: currentUser, onLogout, unreadNotificationCount, unreadInboxCount
function NavBar({ currentUser, onLogout, unreadNotificationCount, unreadInboxCount }) {
  const navigate = useNavigate();
  return (
    <nav className="bg-white shadow p-4 flex items-center gap-6">
      <button className="font-bold hover:text-yellow-500 transition-colors" onClick={() => navigate('/')}>Home</button>
      {currentUser && currentUser.role === 'POSTER' && (
        <>
          <button className="hover:text-yellow-500 transition-colors" onClick={() => navigate('/post')}>Post Task</button>
          <button className="hover:text-yellow-500 transition-colors" onClick={() => navigate('/posterTasks')}>My Tasks</button>
          <div className="relative inline-block">
            <button className="hover:text-yellow-500 transition-colors pr-6" onClick={() => navigate('/posterInbox')}>
              Inbox
            </button>
            {unreadInboxCount > 0 && (
              <span className="absolute -top-1 -right-0 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unreadInboxCount}
              </span>
            )}
          </div>
        </>
      )}
      {currentUser && currentUser.role === 'HUSTLER' && (
        <>
          <button className="hover:text-yellow-500 transition-colors" onClick={() => navigate('/hustlerTasks')}>My Tasks</button>
          <div className="relative inline-block">
            <button className="hover:text-yellow-500 transition-colors pr-6" onClick={() => navigate('/inbox')}>
              Inbox
            </button>
            {unreadInboxCount > 0 && (
              <span className="absolute -top-1 -right-0 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unreadInboxCount}
              </span>
            )}
          </div>
        </>
      )}
      {currentUser && (
        <div className="relative inline-block">
          <button className="hover:text-yellow-500 transition-colors text-2xl pr-4" onClick={() => navigate('/notifications')} title="Updates">
            <span role="img" aria-label="bell">🔔</span>
          </button>
          {currentUser.role === 'POSTER' && unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-0 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {unreadNotificationCount}
            </span>
          )}
        </div>
      )}
      {!currentUser && <button className="hover:text-yellow-500 transition-colors" onClick={() => navigate('/login')}>Login</button>}
      {!currentUser && <button className="hover:text-yellow-500 transition-colors" onClick={() => navigate('/register')}>Register</button>}
      {currentUser && (
        <>
          <button className="hover:text-yellow-500 transition-colors" onClick={() => navigate(`/profile/${currentUser.username}`)}>Profile</button>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-gray-600">Logged in as <b>{currentUser.username}</b> ({currentUser.role})</span>
            <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition-colors">Logout</button>
          </div>
        </>
      )}
    </nav>
  );
}

export default NavBar;
