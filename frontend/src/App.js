import React, { useState, useEffect } from 'react';
import TaskList from './TaskList';
import PostTask from './PostTask';
import Register from './Register';
import Login from './Login';
import Banner from './Banner';
import Notifications from './Notifications';
import PosterTasks from './PosterTasks';
import HustlerTasks from './HustlerTasks';
import useUnreadNotifications from './useUnreadNotifications';
import HustlerInbox from './HustlerInbox';
import PosterInbox from './PosterInbox';

function App() {
  const [page, setPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");


  // Load user from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  // Logout function
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setPage('home');
  };

  // Redirect to home after login
  const handleLogin = user => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    setPage('home');
  };

  const unreadCount = useUnreadNotifications(currentUser);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex gap-4">
        <button className="font-bold" onClick={() => setPage('home')}>Home</button>
        {currentUser && currentUser.role === 'POSTER' && (
          <>
            <button onClick={() => setPage('post')}>Post Task</button>
            <button onClick={() => setPage('posterTasks')}>My Tasks</button>
            <button onClick={() => setPage('posterInbox')}>Inbox</button>
          </>
        )} 
        {currentUser && currentUser.role === 'HUSTLER' && (
          <>
            <button onClick={() => setPage('hustlerTasks')}>My Tasks</button>
            <button onClick={() => setPage('inbox')}>Inbox</button>
          </>
        )}
        {currentUser && (
          <button onClick={() => setPage('notifications')} title="Updates" className="relative text-2xl">
            <span role="img" aria-label="bell">🔔</span>
            {currentUser.role === 'POSTER' && unreadCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                {unreadCount}
              </span>
            )}
          </button>
        )}
        {!currentUser && <button onClick={() => setPage('login')}>Login</button>}
        {!currentUser && <button onClick={() => setPage('register')}>Register</button>}
        {currentUser && (
          <span className="ml-auto flex items-center gap-2">
            <span className="text-gray-600">Logged in as <b>{currentUser.username}</b> ({currentUser.role})</span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-2 py-1 rounded">Logout</button>
          </span>
        )}
      </nav>
      <div className="p-0 w-full">
        {page === 'home' && (
          <>
            <Banner onSearch={setSearch} />
            <TaskList currentUser={currentUser} search={search} />
          </>
        )}
        {page === 'post' && currentUser && currentUser.role === 'POSTER' && <PostTask currentUser={currentUser} />}
        {page === 'posterTasks' && currentUser && currentUser.role === 'POSTER' && <PosterTasks currentUser={currentUser} />}
        {page === 'hustlerTasks' && currentUser && currentUser.role === 'HUSTLER' && <HustlerTasks currentUser={currentUser} />}
        {page === 'inbox' && currentUser && currentUser.role === 'HUSTLER' && <HustlerInbox currentUser={currentUser} />}
        {page === 'posterInbox' && currentUser && currentUser.role === 'POSTER' && <PosterInbox currentUser={currentUser} />}
        {page === 'notifications' && <Notifications currentUser={currentUser} />}
        {page === 'login' && !currentUser && <Login setCurrentUser={handleLogin} />}
        {page === 'login' && currentUser && <div className="text-green-700">Already logged in.</div>}
        {page === 'register' && !currentUser && <Register setCurrentUser={setCurrentUser} />}
        {page === 'register' && currentUser && <div className="text-green-700">Already logged in.</div>}
      </div>
    </div>
  );
}

export default App;
