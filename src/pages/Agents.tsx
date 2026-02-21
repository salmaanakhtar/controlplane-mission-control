import { Bot, Circle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useApi } from '@/hooks/useApi';
import type { Agent } from '@/types';

const mockAgents: Agent[] = [
  { id: '1', name: 'Orchestrator', status: 'busy', currentTask: 'Processing requests', lastSeen: new Date().toISOString() },
  { id: '2', name: 'Frontend Agent', status: 'idle', lastSeen: new Date().toISOString() },
  { id: '3', name: 'Backend Agent', status: 'busy', currentTask: 'Database optimization', lastSeen: new Date().toISOString() },
  { id: '4', name: 'DevOps Agent', status: 'offline', lastSeen: new Date(Date.now() - 3600000).toISOString() },
  { id: '5', name: 'Data Agent', status: 'error', currentTask: 'Connection failed', lastSeen: new Date().toISOString() },
  { id: '6', name: 'Research Agent', status: 'busy', currentTask: 'Web scraping', lastSeen: new Date().toISOString() },
];

const statusColors = {
  idle: 'bg-green-500',
  busy: 'bg-blue-500',
  error: 'bg-red-500',
  offline: 'bg-gray-500',
};

const statusBadgeVariant: Record<Agent['status'], 'success' | 'secondary' | 'destructive' | 'outline'> = {
  idle: 'success',
  busy: 'secondary',
  error: 'destructive',
  offline: 'outline',
};

export function AgentsPage() {
  const agents = useApi<Agent[]>('/api/agents', mockAgents);

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
        <h2 className="text-3xl font-bold">Agents</h2>
        <p className="text-muted-foreground">Manage and monitor AI agents</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-muted-foreground" />
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                </div>
                <Badge variant={statusBadgeVariant[agent.status]}>
                  <Circle className={`w-2 h-2 mr-1 fill-current ${statusColors[agent.status]}`} />
                  {agent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {agent.currentTask ? (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">{agent.currentTask}</span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active task</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Last seen: {formatTime(agent.lastSeen)}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
