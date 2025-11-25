
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/auth/LoginPage';
import RegisterPage from './components/auth/RegisterPage';
import OnboardingPage from './components/auth/OnboardingPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './components/dashboard/DashboardPage';
import ProjectsPage from './components/projects/ProjectsPage';
import ProjectDetailPage from './components/projects/ProjectDetailPage';
import TasksPage from './components/tasks/TasksPage'; 
import SettingsPage from './components/settings/SettingsPage';
import ProtectedUsersPage from './components/users/ProtectedUsersPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Protected Routes - Dashboard Area */}
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="users" element={<ProtectedUsersPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
