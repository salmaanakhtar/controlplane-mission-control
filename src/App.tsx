import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { DashboardPage } from '@/pages/Dashboard';
import { AgentsPage } from '@/pages/Agents';
import { SessionsPage } from '@/pages/Sessions';
import { GitHubPage, AnalyticsPage } from '@/pages/GitHub';
import { ActivityFeedPage } from '@/pages/ActivityFeed';
import { SettingsPage } from '@/pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="github" element={<GitHubPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="activity" element={<ActivityFeedPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
