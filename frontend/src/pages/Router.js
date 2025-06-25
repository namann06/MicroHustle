import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams, useLocation } from 'react-router-dom';
import App from './App';
import TaskDetails from '../components/TaskDetails';
import UserProfile from '../components/UserProfile';
import Layout from '../components/Layout';
import useUnreadNotifications from '../hooks/useUnreadNotifications';
import useUnreadInboxCount from '../hooks/useUnreadInboxCount';

function MainRouter() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('home');

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) setCurrentUser(JSON.parse(saved));
  }, []);

  const unreadNotificationCount = useUnreadNotifications(currentUser);
  const unreadInboxCount = useUnreadInboxCount(currentUser, 0);
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setPage('home');
  };

  return (
    <Router>
      <Layout
        currentUser={currentUser}
        onLogout={handleLogout}
        setPage={setPage}
        unreadNotificationCount={unreadNotificationCount}
        unreadInboxCount={unreadInboxCount}
      >
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/tasks/:taskId" element={<TaskDetailsWrapper />} />
          <Route path="/profile/:username" element={<UserProfileWrapper />} />
        </Routes>
      </Layout>
    </Router>
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