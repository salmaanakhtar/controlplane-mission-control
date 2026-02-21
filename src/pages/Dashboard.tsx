import { Activity, Bot, UserRound, Server } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';
import type { Agent, Session as SessionType, Activity as ActivityType, SystemMetrics } from '@/types';

// Mock data for development - will be replaced by API
const mockAgents: Agent[] = [
  { id: '1', name: 'Orchestrator', status: 'busy', currentTask: 'Processing requests', lastSeen: new Date().toISOString() },
  { id: '2', name: 'Frontend Agent', status: 'idle', lastSeen: new Date().toISOString() },
  { id: '3', name: 'Backend Agent', status: 'busy', currentTask: 'Database optimization', lastSeen: new Date().toISOString() },
  { id: '4', name: 'DevOps Agent', status: 'offline', lastSeen: new Date(Date.now() - 3600000).toISOString() },
];

const mockSessions: SessionType[] = [
  { id: '1', sessionKey: 'sess_abc123', model: 'claude-3-opus', tokensUsed: 125000, lastActivity: new Date().toISOString(), status: 'active' },
  { id: '2', sessionKey: 'sess_def456', model: 'gpt-4', tokensUsed: 89000, lastActivity: new Date(Date.now() - 300000).toISOString(), status: 'completed' },
  { id: '3', sessionKey: 'sess_ghi789', model: 'claude-3-sonnet', tokensUsed: 45000, lastActivity: new Date(Date.now() - 600000).toISOString(), status: 'active' },
];

const mockActivities: ActivityType[] = [
  { id: '1', type: 'agent', action: 'task_completed', description: 'Frontend Agent completed: Build navigation', timestamp: new Date().toISOString() },
  { id: '2', type: 'session', action: 'session_created', description: 'New session started: sess_abc123', timestamp: new Date(Date.now() - 120000).toISOString() },
  { id: '3', type: 'system', action: 'metrics_update', description: 'CPU usage dropped to 45%', timestamp: new Date(Date.now() - 300000).toISOString() },
  { id: '4', type: 'task', action: 'task_created', description: 'New task created: Implement auth', timestamp: new Date(Date.now() - 600000).toISOString() },
];

const mockMetrics: SystemMetrics = {
  cpu: 45,
  memory: 68,
  disk: 32,
  timestamp: new Date().toISOString(),
};

export function DashboardPage() {
  const agents = useApi<Agent[]>('/api/agents', mockAgents);
  const sessions = useApi<SessionType[]>('/api/sessions', mockSessions);
  const activities = useApi<ActivityType[]>('/api/activities', mockActivities);
  const metrics = useApi<SystemMetrics>('/api/metrics', mockMetrics);

  const activeAgents = agents.filter(a => a.status === 'busy').length;
  const totalTokens = sessions.reduce((sum, s) => sum + s.tokensUsed, 0);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Dashboard</h2>
        <p className="text-muted-foreground">Mission Control Overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Bot} value={agents.length} label="Total Agents" />
        <StatCard icon={Activity} value={activeAgents} label="Active Agents" />
        <StatCard icon={UserRound} value={sessions.length} label="Active Sessions" />
        <StatCard icon={Server} value={`${metrics.cpu}%`} label="CPU Usage" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <Badge variant="outline" className="mt-0.5">
                    {activity.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Tokens Used</span>
                <span className="font-medium">{(totalTokens / 1000).toFixed(1)}K</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Memory Usage</span>
                <span className="font-medium">{metrics.memory}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Disk Usage</span>
                <span className="font-medium">{metrics.disk}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Offline Agents</span>
                <span className="font-medium">{agents.filter(a => a.status === 'offline').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
