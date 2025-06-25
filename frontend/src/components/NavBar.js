import React from 'react';

// Props: currentUser, onLogout, setPage, unreadNotificationCount, unreadInboxCount
function NavBar({ currentUser, onLogout, setPage, unreadNotificationCount, unreadInboxCount }) {
  return (
    <nav className="bg-white shadow p-4 flex gap-4">
      <button className="font-bold" onClick={() => setPage('home')}>Home</button>
      {currentUser && currentUser.role === 'POSTER' && (
        <>
          <button onClick={() => setPage('post')}>Post Task</button>
          <button onClick={() => setPage('posterTasks')}>My Tasks</button>
          <button onClick={() => setPage('posterInbox')} className="relative">
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
          <button onClick={() => setPage('hustlerTasks')}>My Tasks</button>
          <button onClick={() => setPage('inbox')} className="relative">
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
        <button onClick={() => setPage('notifications')} title="Updates" className="relative text-2xl">
          <span role="img" aria-label="bell">🔔</span>
          {currentUser.role === 'POSTER' && unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
              {unreadNotificationCount}
            </span>
          )}
        </button>
      )}
      {!currentUser && <button onClick={() => setPage('login')}>Login</button>}
      {!currentUser && <button onClick={() => setPage('register')}>Register</button>}
      {currentUser && (
        <>
          <button onClick={() => setPage('profile')}>Profile</button>
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
