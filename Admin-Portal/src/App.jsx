import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ProjectsManager from './pages/ProjectsManager.jsx';
import SkillsManager from './pages/SkillsManager.jsx';
import TimelineManager from './pages/TimelineManager.jsx';
import AchievementsManager from './pages/AchievementsManager.jsx';
import ResumeManager from './pages/ResumeManager.jsx';
import MessagesManager from './pages/MessagesManager.jsx';

export default function App() {
  const { token } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <Login />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsManager />} />
          <Route path="/skills" element={<SkillsManager />} />
          <Route path="/timeline" element={<TimelineManager />} />
          <Route path="/achievements" element={<AchievementsManager />} />
          <Route path="/resume" element={<ResumeManager />} />
          <Route path="/messages" element={<MessagesManager />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
