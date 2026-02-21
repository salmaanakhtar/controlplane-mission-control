import { useState } from 'react';
import { Activity, Bot, UserRound, ListTodo, Server, GitPullRequest, GitCommit, Clock, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Activity as ActivityType } from '@/types';

interface ActivityEvent {
  id: string;
  type: 'agent' | 'session' | 'task' | 'system' | 'github';
  action: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

const mockActivities: ActivityEvent[] = [
  { id: '1', type: 'agent', action: 'task_completed', description: 'Frontend Agent completed: Build navigation component', timestamp: new Date().toISOString(), metadata: { agent: 'Frontend Agent', task: 'Build navigation' } },
  { id: '2', type: 'github', action: 'pr_opened', description: 'New PR #142: feat: Add analytics dashboard', timestamp: new Date(Date.now() - 1800000).toISOString(), metadata: { pr: '#142', repo: 'controlplane-mission-control' } },
  { id: '3', type: 'session', action: 'session_created', description: 'New session started: sess_abc123def456', timestamp: new Date(Date.now() - 3600000).toISOString(), metadata: { model: 'claude-3-opus' } },
  { id: '4', type: 'task', action: 'task_created', description: 'New task created: Implement dark mode toggle', timestamp: new Date(Date.now() - 5400000).toISOString(), metadata: { priority: 'medium' } },
  { id: '5', type: 'system', action: 'metrics_update', description: 'System metrics updated: CPU 45%, Memory 68%', timestamp: new Date(Date.now() - 7200000).toISOString(), metadata: { cpu: '45%', memory: '68%' } },
  { id: '6', type: 'agent', action: 'task_started', description: 'Backend Agent started: Database optimization', timestamp: new Date(Date.now() - 9000000).toISOString(), metadata: { agent: 'Backend Agent' } },
  { id: '7', type: 'github', action: 'commit_pushed', description: 'Commit a1b2c3d: feat: Add token usage charts', timestamp: new Date(Date.now() - 10800000).toISOString(), metadata: { author: 'salmaan' } },
  { id: '8', type: 'session', action: 'session_ended', description: 'Session sess_def456ghi789 completed', timestamp: new Date(Date.now() - 14400000).toISOString(), metadata: { tokens: '89K', duration: '45 min' } },
  { id: '9', type: 'task', action: 'task_completed', description: 'Task completed: Setup CI/CD pipeline', timestamp: new Date(Date.now() - 18000000).toISOString(), metadata: { assignee: 'DevOps Agent' } },
  { id: '10', type: 'system', action: 'container_restart', description: 'Container redis restarted', timestamp: new Date(Date.now() - 21600000).toISOString(), metadata: { container: 'redis', reason: 'health check failed' } },
  { id: '11', type: 'github', action: 'deployment_success', description: 'Production deployment v1.2.3 successful', timestamp: new Date(Date.now() - 25200000).toISOString(), metadata: { version: 'v1.2.3', env: 'production' } },
  { id: '12', type: 'agent', action: 'error', description: 'Research Agent failed: Rate limit exceeded', timestamp: new Date(Date.now() - 28800000).toISOString(), metadata: { agent: 'Research Agent', error: 'rate_limit' } },
];

const typeIcons: Record<ActivityEvent['type'], React.ElementType> = {
  session: UserRound,
  task: ListTodo,
  agent: Bot,
  system: Server,
  github: GitPullRequest,
};

const typeColors: Record<ActivityEvent['type'], string> = {
  agent: 'text-blue-500',
  session: 'text-purple-500',
  task: 'text-green-500',
  system: 'text-orange-500',
  github: 'text-yellow-500',
};

type FilterType = 'all' | ActivityEvent['type'];

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function ActivityCard({ activity }: { activity: ActivityEvent }) {
  const Icon = typeIcons[activity.type];
  
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className={`p-2 rounded-full bg-background ${typeColors[activity.type]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-sm">{activity.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {activity.type}
              </Badge>
              <span className="text-xs text-muted-foreground">{activity.action.replace('_', ' ')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
            <Clock className="w-3 h-3" />
            {formatTime(activity.timestamp)}
          </div>
        </div>
        {activity.metadata && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(activity.metadata).map(([key, value]) => (
              <span key={key} className="text-xs px-2 py-0.5 rounded bg-background">
                <span className="text-muted-foreground">{key}:</span> {value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ActivityFeedPage() {
  const [filter, setFilter] = useState<FilterType>('all');
  
  const filteredActivities = filter === 'all' 
    ? mockActivities 
    : mockActivities.filter(a => a.type === filter);

  const activityCounts = {
    all: mockActivities.length,
    agent: mockActivities.filter(a => a.type === 'agent').length,
    session: mockActivities.filter(a => a.type === 'session').length,
    task: mockActivities.filter(a => a.type === 'task').length,
    system: mockActivities.filter(a => a.type === 'system').length,
    github: mockActivities.filter(a => a.type === 'github').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Activity Feed</h2>
          <p className="text-muted-foreground">Real-time events across all agents and systems</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Live
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card 
          className={`cursor-pointer transition-all ${filter === 'all' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">All Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityCounts.all}</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${filter === 'agent' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('agent')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-500" />
              Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityCounts.agent}</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${filter === 'session' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('session')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserRound className="w-4 h-4 text-purple-500" />
              Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityCounts.session}</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${filter === 'task' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('task')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-green-500" />
              Task
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityCounts.task}</div>
          </CardContent>
        </Card>
        <Card 
          className={`cursor-pointer transition-all ${filter === 'github' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('github')}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-yellow-500" />
              GitHub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activityCounts.github}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
