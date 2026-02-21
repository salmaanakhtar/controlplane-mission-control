import { useState, useEffect, useCallback } from 'react';
import { GitPullRequest, GitCommit, Rocket, ExternalLink, CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import type { GitHubPR, GitHubCommit, Deployment, TokenUsage, SessionDuration, AgentActivity } from '@/types';

// API Base URL
const API_BASE = import.meta.env.VITE_API_URL || '';

// Mock data for GitHub (fallback when API unavailable)
const mockPRs: GitHubPR[] = [
  { id: 1, number: 142, title: 'feat: Add analytics dashboard', state: 'open', author: 'salmaan', repo: 'controlplane-mission-control', createdAt: new Date(Date.now() - 3600000).toISOString(), updatedAt: new Date().toISOString(), url: 'https://github.com/salmaan/controlplane-mission-control/pull/142' },
  { id: 2, number: 141, title: 'fix: Resolve memory leak in agent pool', state: 'merged', author: 'devops', repo: 'controlplane-mission-control', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date(Date.now() - 43200000).toISOString(), url: 'https://github.com/salmaan/controlplane-mission-control/pull/141' },
  { id: 3, number: 140, title: 'chore: Update dependencies', state: 'closed', author: 'renovate', repo: 'controlplane-mission-control', createdAt: new Date(Date.now() - 172800000).toISOString(), updatedAt: new Date(Date.now() - 86400000).toISOString(), url: 'https://github.com/salmaan/controlplane-mission-control/pull/140' },
  { id: 4, number: 139, title: 'feat: Implement WebSocket real-time updates', state: 'merged', author: 'frontend-dev', repo: 'controlplane-mission-control', createdAt: new Date(Date.now() - 259200000).toISOString(), updatedAt: new Date(Date.now() - 172800000).toISOString(), url: 'https://github.com/salmaan/controlplane-mission-control/pull/139' },
  { id: 5, number: 138, title: 'fix: Docker container health checks', state: 'open', author: 'devops', repo: 'controlplane-mission-control', createdAt: new Date(Date.now() - 7200000).toISOString(), updatedAt: new Date(Date.now() - 3600000).toISOString(), url: 'https://github.com/salmaan/controlplane-mission-control/pull/138' },
];

const mockCommits: GitHubCommit[] = [
  { sha: 'a1b2c3d', message: 'feat: Add token usage charts', author: 'salmaan', date: new Date(Date.now() - 1800000).toISOString(), url: 'https://github.com/salmaan/controlplane-mission-control/commit/a1b2c3d' },
  { sha: 'e4f5g6h', message: 'fix: Resolve session timeout issue', author: 'devops', date: new Date(Date.now() - 7200000).toISOString(), url: 'https://github.com/salmaan/controlplane-mission-control/commit/e4f5g6h' },
  { sha: 'i7j8k9l', message: 'chore: Update npm dependencies', author: 'renovate', date: new Date(Date.now() - 14400000).toISOString(), url: 'https://github.com/salmaan/controlplane-mission-control/commit/i7j8k9l' },
  { sha: 'm0n1o2p', message: 'feat: Add dark mode support', author: 'frontend-dev', date: new Date(Date.now() - 28800000).toISOString(), url: 'https://github.com/salmaan/controlplane-mission-control/commit/m0n1o2p' },
  { sha: 'q3r4s5t', message: 'refactor: Improve API response caching', author: 'backend-dev', date: new Date(Date.now() - 43200000).toISOString(), url: 'https://github.com/salmaan/controlplane-mission-control/commit/q3r4s5t' },
  { sha: 'u6v7w8x', message: 'docs: Update API documentation', author: 'salmaan', date: new Date(Date.now() - 86400000).toISOString(), url: 'https://github.com/salmaan/controlplane-mission-control/commit/u6v7w8x' },
];

const mockDeployments: Deployment[] = [
  { id: 'd1', environment: 'production', status: 'success', version: 'v1.2.3', deployedAt: new Date(Date.now() - 7200000).toISOString(), url: 'https://pm.salmaan.dev' },
  { id: 'd2', environment: 'staging', status: 'success', version: 'v1.2.4-rc1', deployedAt: new Date(Date.now() - 3600000).toISOString(), url: 'https://staging.salmaan.dev' },
  { id: 'd3', environment: 'development', status: 'in_progress', version: 'v1.2.4-dev', deployedAt: new Date().toISOString() },
  { id: 'd4', environment: 'production', status: 'failed', version: 'v1.2.2', deployedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'd5', environment: 'staging', status: 'success', version: 'v1.2.3', deployedAt: new Date(Date.now() - 172800000).toISOString() },
];

// Mock analytics data
const mockTokenUsage: TokenUsage[] = Array.from({ length: 14 }, (_, i) => ({
  timestamp: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
  tokens: Math.floor(Math.random() * 50000) + 20000,
  cost: Math.floor(Math.random() * 50) + 20,
}));

const mockSessionDuration: SessionDuration[] = Array.from({ length: 7 }, (_, i) => ({
  date: new Date(Date.now() - (6 - i) * 86400000).toISOString().split('T')[0],
  avgDuration: Math.floor(Math.random() * 30) + 10,
  sessionCount: Math.floor(Math.random() * 20) + 5,
}));

const mockAgentActivity: AgentActivity[] = [
  { agentId: '1', agentName: 'Orchestrator', tasksCompleted: 156, tasksFailed: 3, avgResponseTime: 1.2 },
  { agentId: '2', agentName: 'Frontend Agent', tasksCompleted: 89, tasksFailed: 2, avgResponseTime: 0.8 },
  { agentId: '3', agentName: 'Backend Agent', tasksCompleted: 124, tasksFailed: 5, avgResponseTime: 1.5 },
  { agentId: '4', agentName: 'DevOps Agent', tasksCompleted: 67, tasksFailed: 1, avgResponseTime: 2.1 },
  { agentId: '5', agentName: 'Research Agent', tasksCompleted: 45, tasksFailed: 0, avgResponseTime: 3.2 },
];

const prStateColors: Record<GitHubPR['state'], string> = {
  open: 'bg-green-500',
  closed: 'bg-red-500',
  merged: 'bg-purple-500',
};

const deploymentStatusColors: Record<Deployment['status'], string> = {
  success: 'text-green-500',
  failed: 'text-red-500',
  pending: 'text-yellow-500',
  in_progress: 'text-blue-500',
};

const deploymentBadgeVariant: Record<Deployment['status'], 'success' | 'secondary' | 'destructive' | 'outline'> = {
  success: 'success',
  failed: 'destructive',
  pending: 'outline',
  in_progress: 'secondary',
};

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

// Custom hook to fetch GitHub data from API with fallback
function useGitHubData<T>(endpoint: string, mockData: T): {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const [data, setData] = useState<T>(mockData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}${endpoint}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      // Fall back to mock data on error
      setError(err instanceof Error ? err.message : 'Unknown error');
      setData(mockData);
    } finally {
      setLoading(false);
    }
  }, [endpoint, mockData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function GitHubPage() {
  const [activeTab, setActiveTab] = useState('prs');
  
  // Fetch data from API with fallback to mock data
  const { data: prs, loading: prsLoading } = useGitHubData<GitHubPR[]>('/api/github/prs', mockPRs);
  const { data: commits, loading: commitsLoading } = useGitHubData<GitHubCommit[]>('/api/github/commits', mockCommits);
  const { data: deployments, loading: deploymentsLoading } = useGitHubData<Deployment[]>('/api/github/deployments', mockDeployments);

  const openPRs = prs.filter(pr => pr.state === 'open').length;
  const mergedPRs = prs.filter(pr => pr.state === 'merged').length;
  const successDeployments = deployments.filter(d => d.status === 'success').length;

  const isLoading = prsLoading || commitsLoading || deploymentsLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">GitHub</h2>
        <p className="text-muted-foreground">Repository status, deployments and activity</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span className="text-muted-foreground">Loading GitHub data...</span>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open PRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openPRs}</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Merged PRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mergedPRs}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful Deploys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successDeployments}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="prs">Pull Requests</TabsTrigger>
          <TabsTrigger value="commits">Commits</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
        </TabsList>

        <TabsContent value="prs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitPullRequest className="w-5 h-5" />
                Recent Pull Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {prs.map((pr) => (
                  <div key={pr.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-start gap-3">
                      <GitPullRequest className={`w-5 h-5 mt-0.5 ${prStateColors[pr.state]}`} />
                      <div>
                        <p className="font-medium">#{pr.number} {pr.title}</p>
                        <p className="text-sm text-muted-foreground">
                          by {pr.author} • {pr.repo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={pr.state === 'open' ? 'success' : pr.state === 'merged' ? 'secondary' : 'outline'}>
                        {pr.state}
                      </Badge>
                      {pr.url && (
                        <a href={pr.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitCommit className="w-5 h-5" />
                Recent Commits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {commits.map((commit) => (
                  <div key={commit.sha} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-start gap-3">
                      <GitCommit className="w-5 h-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium font-mono text-sm">{commit.sha.slice(0, 7)}</p>
                        <p className="text-sm">{commit.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {commit.author} • {formatTime(commit.date)}
                        </p>
                      </div>
                    </div>
                    {commit.url && (
                      <a href={commit.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Deployment Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deployments.map((deployment) => (
                  <div key={deployment.id} className="flex items-start justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-start gap-3">
                      {deployment.status === 'success' ? (
                        <CheckCircle className={`w-5 h-5 mt-0.5 ${deploymentStatusColors[deployment.status]}`} />
                      ) : deployment.status === 'failed' ? (
                        <XCircle className={`w-5 h-5 mt-0.5 ${deploymentStatusColors[deployment.status]}`} />
                      ) : deployment.status === 'in_progress' ? (
                        <Clock className={`w-5 h-5 mt-0.5 ${deploymentStatusColors[deployment.status]}`} />
                      ) : (
                        <AlertCircle className={`w-5 h-5 mt-0.5 ${deploymentStatusColors[deployment.status]}`} />
                      )}
                      <div>
                        <p className="font-medium">{deployment.environment}</p>
                        <p className="text-sm text-muted-foreground">
                          {deployment.version} • {formatTime(deployment.deployedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={deploymentBadgeVariant[deployment.status]}>
                        {deployment.status.replace('_', ' ')}
                      </Badge>
                      {deployment.url && (
                        <a href={deployment.url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function AnalyticsPage() {
  // Use mock analytics data (in production, these would come from API)
  const tokenUsage = mockTokenUsage;
  const sessionDuration = mockSessionDuration;
  const agentActivity = mockAgentActivity;

  const totalTokens = tokenUsage.reduce((sum, d) => sum + d.tokens, 0);
  const totalCost = tokenUsage.reduce((sum, d) => sum + d.cost, 0);
  const avgSessionDuration = Math.round(sessionDuration.reduce((sum, d) => sum + d.avgDuration, 0) / sessionDuration.length);
  const totalTasks = agentActivity.reduce((sum, d) => sum + d.tasksCompleted, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Analytics</h2>
        <p className="text-muted-foreground">Usage metrics and performance insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens (14d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalTokens / 1000).toFixed(1)}K</div>
            <p className="text-xs text-muted-foreground">~${totalCost.toFixed(2)} cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSessionDuration} min</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">All agents</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">Task completion</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Token Usage Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={tokenUsage}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 3 }}
                    name="Tokens"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--secondary))', r: 3 }}
                    name="Cost ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Duration & Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sessionDuration}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { weekday: 'short' })}
                    className="text-xs"
                  />
                  <YAxis yAxisId="left" className="text-xs" />
                  <YAxis yAxisId="right" orientation="right" className="text-xs" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Bar yAxisId="left" dataKey="avgDuration" fill="hsl(var(--primary))" name="Avg Duration (min)" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="sessionCount" fill="hsl(var(--secondary))" name="Session Count" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentActivity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" className="text-xs" />
                <YAxis dataKey="agentName" type="category" width={100} className="text-xs" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="tasksCompleted" fill="hsl(var(--primary))" name="Tasks Completed" radius={[0, 4, 4, 0]} />
                <Bar dataKey="tasksFailed" fill="hsl(var(--destructive))" name="Tasks Failed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Performance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agentActivity.map((agent) => (
              <div key={agent.agentId} className="p-4 rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">{agent.agentName}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasks Completed</span>
                    <span className="font-medium">{agent.tasksCompleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tasks Failed</span>
                    <span className="font-medium text-destructive">{agent.tasksFailed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Response</span>
                    <span className="font-medium">{agent.avgResponseTime}s</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
