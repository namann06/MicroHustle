import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useParams, useLocation, Navigate, useNavigate } from 'react-router-dom';
import App from './App';
import TaskDetails from '../components/TaskDetails';
import UserProfile from '../components/UserProfile';
import Layout from '../components/Layout';
import useUnreadNotifications from '../hooks/useUnreadNotifications';
import useUnreadInboxCount from '../hooks/useUnreadInboxCount';
import PostTask from '../components/PostTask';
import PosterTasks from '../components/PosterTasks';
import HustlerTasks from '../components/HustlerTasks';
import ModernPosterInbox from '../components/ModernPosterInbox';
import ModernHustlerInbox from '../components/ModernHustlerInbox';
import Notifications from '../components/Notifications';
import Login from './Login';
import Register from './Register';
import { LandingPage } from './LandingPage';
import BrowseTasksPage from './BrowseTasksPage';

function AppContent({ setCurrentUser, currentUser }) {
  // Always call the hook, but it will return 0 for non-POSTER users internally
  const unreadNotificationCount = useUnreadNotifications(currentUser);
  const [inboxUpdateTrigger, setInboxUpdateTrigger] = useState(0);
  const unreadInboxCount = useUnreadInboxCount(currentUser, inboxUpdateTrigger);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const handleInboxRead = () => {
    setInboxUpdateTrigger(prev => prev + 1);
  };

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    console.log('ProtectedRoute - currentUser:', currentUser);
    
    // Check localStorage as fallback
    const storedUser = localStorage.getItem('currentUser');
    console.log('ProtectedRoute - localStorage user:', storedUser);
    
    if (!currentUser && !storedUser) {
      console.log('ProtectedRoute - No user found, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Public routes that don't require authentication
  const publicRoutes = [
    { path: "/login", element: <Login setCurrentUser={setCurrentUser} /> },
    { path: "/register", element: <Register setCurrentUser={setCurrentUser} /> },
    { 
      path: "/", 
      element: !currentUser ? <LandingPage /> : <App />
    },
    {
      path: "/browse",
      element: <BrowseTasksPage />
    }
  ];

  // Protected routes that require authentication
  const protectedRoutes = [
    { path: "/tasks/:taskId", element: <TaskDetailsWrapper /> },
    { path: "/profile/:username", element: <UserProfileWrapper /> },
    { path: "/post", element: <PostTask currentUser={currentUser} /> },
    { path: "/posterTasks", element: <PosterTasks currentUser={currentUser} /> },
    { path: "/hustlerTasks", element: <HustlerTasks currentUser={currentUser} /> },
    { path: "/posterInbox", element: <ModernPosterInbox currentUser={currentUser} onInboxRead={handleInboxRead} /> },
    { path: "/hustlerInbox", element: <ModernHustlerInbox currentUser={currentUser} onInboxRead={handleInboxRead} /> },
  ];

  // Notifications route only for POSTER users
  const posterOnlyRoutes = [
    { path: "/notifications", element: <Notifications currentUser={currentUser} /> },
  ];

  return (
    <Layout
      currentUser={currentUser}
      onLogout={handleLogout}
      unreadNotificationCount={unreadNotificationCount}
      unreadInboxCount={unreadInboxCount}
    >
      <Routes>
        {/* Public routes */}
        {publicRoutes.map((route, index) => (
          <Route key={`public-${index}`} path={route.path} element={route.element} />
        ))}
        
        {/* Protected routes */}
        {protectedRoutes.map((route, index) => (
          <Route 
            key={`protected-${index}`} 
            path={route.path} 
            element={
              <ProtectedRoute>
                {route.element}
              </ProtectedRoute>
            } 
          />
        ))}

        {/* Poster-only routes */}
        {currentUser?.role === 'POSTER' && posterOnlyRoutes.map((route, index) => (
          <Route 
            key={`poster-${index}`} 
            path={route.path} 
            element={
              <ProtectedRoute>
                {route.element}
              </ProtectedRoute>
            } 
          />
        ))}
      </Routes>
    </Layout>
  );
}

function MainRouter() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    console.log('MainRouter useEffect - Loading user from localStorage');
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        console.log('MainRouter - Loaded user from localStorage:', user);
        setCurrentUser(user);
      } catch (error) {
        console.error('MainRouter - Error parsing user from localStorage:', error);
        setCurrentUser(null);
      }
    } else {
      console.log('MainRouter - No user found in localStorage');
      setCurrentUser(null);
    }
  }, []);

  // Debug: Log currentUser changes
  useEffect(() => {
    console.log('MainRouter - currentUser changed:', currentUser);
  }, [currentUser]);

  return (
    <BrowserRouter>
      <AppContent currentUser={currentUser} setCurrentUser={setCurrentUser} />
    </BrowserRouter>
  );
}

function TaskDetailsWrapper() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const location = useLocation();
  const currentUser = location.state && location.state.currentUser ? location.state.currentUser : null;
  return <TaskDetails taskId={taskId} onBack={() => navigate('/')} currentUser={currentUser} />;
}

function UserProfileWrapper() {
  const { username } = useParams();
  const location = useLocation();
  // Try to get currentUser from location.state, fallback to localStorage
  let currentUser = location.state && location.state.currentUser ? location.state.currentUser : null;
  if (!currentUser) {
    const saved = localStorage.getItem('currentUser');
    if (saved) currentUser = JSON.parse(saved);
  }
  return <UserProfile username={username} currentUser={currentUser} />;
}

export default MainRouter;