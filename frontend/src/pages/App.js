import React, { useState, useEffect } from 'react';
import TaskList from '../components/TaskList';
import PostTask from '../components/PostTask';
import Register from './Register';
import Login from './Login';
import Banner from '../components/Banner';
import Notifications from '../components/Notifications';
import PosterTasks from '../components/PosterTasks';
import HustlerTasks from '../components/HustlerTasks';
import useUnreadNotifications from '../hooks/useUnreadNotifications';
import useUnreadInboxCount from '../hooks/useUnreadInboxCount';
import HustlerInbox from '../components/HustlerInbox';
import PosterInbox from '../components/PosterInbox';
import UserProfile from '../components/UserProfile';

function App() {
  const [refreshInboxCount, setRefreshInboxCount] = useState(0);
  const [page, setPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);
  const [search, setSearch] = useState("");

  // Handle custom event to view public profile
  useEffect(() => {
    const handler = (e) => {
      if (e.detail && e.detail.username) {
        setPage('publicProfile:' + e.detail.username);
      }
    };
    window.addEventListener('viewPublicProfile', handler);
    return () => window.removeEventListener('viewPublicProfile', handler);
  }, []);

  // Sync page state with browser history (back/forward)
  useEffect(() => {
    const computePageFromPath = () => {
      const path = window.location.pathname;
      if (path.startsWith('/profile/')) {
        const uname = decodeURIComponent(path.split('/')[2] || '');
        if (uname) return 'publicProfile:' + uname;
      }
      return 'home';
    };
    // On mount
    setPage(computePageFromPath());
    const popHandler = () => {
      setPage(computePageFromPath());
    };
    window.addEventListener('popstate', popHandler);
    return () => window.removeEventListener('popstate', popHandler);
  }, []);

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

  const unreadNotificationCount = useUnreadNotifications(currentUser);
  const unreadInboxCount = useUnreadInboxCount(currentUser, refreshInboxCount);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NavBar is now handled by Layout */}
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
        {page === 'inbox' && currentUser && currentUser.role === 'HUSTLER' && (
          <HustlerInbox
            currentUser={currentUser}
            onInboxRead={() => setRefreshInboxCount(c => c + 1)}
          />
        )}
        {page === 'posterInbox' && currentUser && currentUser.role === 'POSTER' && (
          <PosterInbox
            currentUser={currentUser}
            onInboxRead={() => setRefreshInboxCount(c => c + 1)}
          />
        )}
        {page === 'notifications' && <Notifications currentUser={currentUser} />}
        {page === 'login' && !currentUser && <Login setCurrentUser={handleLogin} />}
        {page === 'login' && currentUser && <div className="text-green-700">Already logged in.</div>}
        {page === 'register' && !currentUser && <Register setCurrentUser={setCurrentUser} />}
        {page === 'register' && currentUser && <div className="text-green-700">Already logged in.</div>}
      </div>
      {page === 'profile' && currentUser && (
        <div className="p-4">
          <UserProfile userId={currentUser.id} />
        </div>
      )}
      {page.startsWith('publicProfile:') && (
        <div className="p-4">
          <UserProfile username={page.split(':')[1]} />
        </div>
      )}
    </div>
  );
}

export default App;