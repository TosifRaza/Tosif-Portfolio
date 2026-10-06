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
import ProfileManager from './pages/ProfileManager.jsx';
import SiteManager from './pages/SiteManager.jsx';
import AboutManager from './pages/AboutManager.jsx';
import ExperienceManager from './pages/ExperienceManager.jsx';
import ProductsManager from './pages/ProductsManager.jsx';
import GoalsManager from './pages/GoalsManager.jsx';
import TasksManager from './pages/TasksManager.jsx';
import ActivitiesManager from './pages/ActivitiesManager.jsx';
import TimeManager from './pages/TimeManager.jsx';
import LearningManager from './pages/LearningManager.jsx';
import AnalyticsAdmin from './pages/AnalyticsAdmin.jsx';
import AIConfigManager from './pages/AIConfigManager.jsx';
import SettingsManager from './pages/SettingsManager.jsx';

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
          {/* Public website */}
          <Route path="/profile" element={<ProfileManager />} />
          <Route path="/site" element={<SiteManager />} />
          <Route path="/about" element={<AboutManager />} />
          <Route path="/experience" element={<ExperienceManager />} />
          <Route path="/skills" element={<SkillsManager />} />
          <Route path="/projects" element={<ProjectsManager />} />
          <Route path="/products" element={<ProductsManager />} />
          <Route path="/achievements" element={<AchievementsManager />} />
          <Route path="/timeline" element={<TimelineManager />} />
          <Route path="/resume" element={<ResumeManager />} />
          <Route path="/messages" element={<MessagesManager />} />
          {/* Personal OS */}
          <Route path="/goals" element={<GoalsManager />} />
          <Route path="/tasks" element={<TasksManager />} />
          <Route path="/activities" element={<ActivitiesManager />} />
          <Route path="/time" element={<TimeManager />} />
          <Route path="/learning" element={<LearningManager />} />
          {/* Analytics / AI / Settings */}
          <Route path="/analytics" element={<AnalyticsAdmin />} />
          <Route path="/ai" element={<AIConfigManager />} />
          <Route path="/settings" element={<SettingsManager />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
