import { UserRound, Clock, Cpu } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApi } from '@/hooks/useApi';
import type { Session } from '@/types';

const mockSessions: Session[] = [
  { id: '1', sessionKey: 'sess_abc123def456', model: 'claude-3-opus-20240229', tokensUsed: 125000, lastActivity: new Date().toISOString(), status: 'active' },
  { id: '2', sessionKey: 'sess_def456ghi789', model: 'gpt-4-turbo', tokensUsed: 89000, lastActivity: new Date(Date.now() - 300000).toISOString(), status: 'completed' },
  { id: '3', sessionKey: 'sess_ghi789jkl012', model: 'claude-3-sonnet', tokensUsed: 45000, lastActivity: new Date(Date.now() - 600000).toISOString(), status: 'active' },
  { id: '4', sessionKey: 'sess_jkl012mno345', model: 'gpt-3.5-turbo', tokensUsed: 23000, lastActivity: new Date(Date.now() - 3600000).toISOString(), status: 'failed' },
  { id: '5', sessionKey: 'sess_mno345pqr678', model: 'claude-3-opus', tokensUsed: 156000, lastActivity: new Date(Date.now() - 7200000).toISOString(), status: 'completed' },
];

const statusBadgeVariant: Record<Session['status'], 'success' | 'secondary' | 'destructive'> = {
  active: 'success',
  completed: 'secondary',
  failed: 'destructive',
};

export function SessionsPage() {
  const sessions = useApi<Session[]>('/api/sessions', mockSessions);

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

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Sessions</h2>
        <p className="text-muted-foreground">Active and historical sessions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="w-5 h-5" />
            Session List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Key</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Tokens Used</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-mono text-sm">
                    {session.sessionKey}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-muted-foreground" />
                      {session.model}
                    </div>
                  </TableCell>
                  <TableCell>{formatTokens(session.tokensUsed)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {formatTime(session.lastActivity)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[session.status]}>
                      {session.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
