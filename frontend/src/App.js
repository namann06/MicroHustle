import React, { useState, useEffect } from 'react';
import TaskList from './TaskList';
import PostTask from './PostTask';
import Register from './Register';
import Banner from './Banner';

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

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow p-4 flex gap-4">
        <button className="font-bold" onClick={() => setPage('home')}>Home</button>
        {currentUser && currentUser.role === 'POSTER' && (
          <button onClick={() => setPage('post')}>Post Task</button>
        )}
        {!currentUser && <button onClick={() => setPage('register')}>Register</button>}
        {currentUser && (
          <span className="ml-auto flex items-center gap-2">
            <span className="text-gray-600">Logged in as <b>{currentUser.username}</b> ({currentUser.role})</span>
            <button onClick={handleLogout} className="bg-red-500 text-white px-2 py-1 rounded">Logout</button>
          </span>
        )}
      </nav>
      <div className="p-0 w-full">
        {page === 'home' && <>
          <Banner onSearch={setSearch} />
          <TaskList currentUser={currentUser} search={search} />
        </>}
        {page === 'post' && currentUser && currentUser.role === 'POSTER' && <PostTask currentUser={currentUser} />}
        {page === 'register' && !currentUser && <Register setCurrentUser={setCurrentUser} />}
        {page === 'register' && currentUser && <div className="text-green-700">Already logged in.</div>}
      </div>
    </div>
  );
}

export default App;
