import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import App from './App';
import TaskDetails from './TaskDetails';

function MainRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/tasks/:taskId" element={<TaskDetailsWrapper />} />
      </Routes>
    </Router>
  );
}

function TaskDetailsWrapper() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  return <TaskDetails taskId={taskId} onBack={() => navigate('/')} />;
}

export default MainRouter;
