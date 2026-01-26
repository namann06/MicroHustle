import React, { useState, useEffect } from 'react';
import TaskList from '../components/TaskList';
import TaskDetails from '../components/TaskDetails';
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
import { HeroHighlight, Highlight } from '../components/ui/hero-highlight';

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
      } else if (path.startsWith('/task/')) {
        const taskId = path.split('/')[2];
        if (taskId) return 'taskDetails:' + taskId;
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
    <div className="min-h-screen bg-white dark:bg-black">
      {/* NavBar is now handled by Layout */}
      <div className="p-0 w-full">
        {page === 'home' && (
          <>
            <HeroHighlight containerClassName="min-h-screen">
              <div className="text-center px-4">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-neutral-700 dark:text-white max-w-7xl leading-relaxed lg:leading-snug mx-auto">
                  Find & Complete{' '}
                  <Highlight className="text-black dark:text-white">
                    Micro Tasks
                  </Highlight>{' '}
                  with Real Hustlers
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto mt-8 mb-12">
                  Connect with skilled professionals, post tasks, and get things done. 
                  Join our community of hustlers and posters today!
                </p>
                
                {/* Search Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (search.trim()) {
                      // Handle search logic here
                    }
                  }}
                  className="flex w-full justify-center px-4 mb-16"
                >
                  <div className="flex w-full max-w-md mx-auto">
                    <input
                      type="text"
                      placeholder="Search tasks..."
                      className="rounded-l-full px-6 py-3 w-full text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-r-0 border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-full px-6 py-3 flex items-center justify-center transition-colors border border-indigo-600"
                    >
                      <span role="img" aria-label="search" className="text-lg">🔍</span>
                    </button>
                  </div>
                </form>
              </div>
            </HeroHighlight>
            <div className="bg-gray-50 dark:bg-neutral-900">
              <TaskList currentUser={currentUser} search={search} />
            </div>
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
        {page.startsWith('taskDetails:') && (
          <TaskDetails 
            taskId={page.split(':')[1]}
            currentUser={currentUser}
            onBack={() => setPage('home')}
          />
        )}
        {page === 'login' && !currentUser && <Login setCurrentUser={handleLogin} />}
        {page === 'login' && currentUser && <div className="text-green-700">Already logged in.</div>}
        {page === 'register' && !currentUser && <Register setCurrentUser={setCurrentUser} />}
        {page === 'register' && currentUser && <div className="text-green-700">Already logged in.</div>}
      </div>
      {page === 'profile' && currentUser && (
        <div className="p-4">
          <UserProfile userId={currentUser.id} currentUser={currentUser} />
        </div>
      )}
      {page.startsWith('publicProfile:') && (
        <div className="p-4">
          <UserProfile username={page.split(':')[1]} currentUser={currentUser} />
        </div>
      )}
    </div>
  );
}

export default App;