import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate, useParams, useLocation } from 'react-router-dom';
import App from './App';
import TaskDetails from '../components/TaskDetails';
import UserProfile from '../components/UserProfile';
import Layout from '../components/Layout';
import useUnreadNotifications from '../hooks/useUnreadNotifications';
import useUnreadInboxCount from '../hooks/useUnreadInboxCount';
import PostTask from '../components/PostTask';
import PosterTasks from '../components/PosterTasks';
import HustlerTasks from '../components/HustlerTasks';
import PosterInbox from '../components/PosterInbox';
import HustlerInbox from '../components/HustlerInbox';
import Notifications from '../components/Notifications';
import Login from './Login';
import Register from './Register';

function AppContent({ setCurrentUser, currentUser }) {
  const navigate = useNavigate();
  const unreadNotificationCount = useUnreadNotifications(currentUser);
  const unreadInboxCount = useUnreadInboxCount(currentUser, 0);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  return (
    <Layout
      currentUser={currentUser}
      onLogout={handleLogout}
      unreadNotificationCount={unreadNotificationCount}
      unreadInboxCount={unreadInboxCount}
    >
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/tasks/:taskId" element={<TaskDetailsWrapper />} />
        <Route path="/profile/:username" element={<UserProfileWrapper />} />
        <Route path="/post" element={<PostTask currentUser={currentUser} />} />
        <Route path="/posterTasks" element={<PosterTasks currentUser={currentUser} />} />
        <Route path="/hustlerTasks" element={<HustlerTasks currentUser={currentUser} />} />
        <Route path="/posterInbox" element={<PosterInbox currentUser={currentUser} />} />
        <Route path="/hustlerInbox" element={<HustlerInbox currentUser={currentUser} />} />
        <Route path="/notifications" element={<Notifications currentUser={currentUser} />} />
        <Route path="/login" element={<Login onLogin={setCurrentUser} />} />
        <Route path="/register" element={<Register onRegister={setCurrentUser} />} />
      </Routes>
    </Layout>
  );
}

function MainRouter() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

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
  return <UserProfile username={username} />;
}

export default MainRouter;