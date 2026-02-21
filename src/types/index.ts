export interface Agent {
  id: string;
  name: string;
  status: 'idle' | 'busy' | 'error' | 'offline';
  currentTask?: string;
  lastSeen: string;
}

export interface Session {
  id: string;
  sessionKey: string;
  model: string;
  tokensUsed: number;
  lastActivity: string;
  status: 'active' | 'completed' | 'failed';
}

export interface Project {
  id: string;
  name: string;
  description?: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  status: 'proposed' | 'in_progress' | 'testing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  timestamp: string;
}

export interface Container {
  id: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'restarting' | 'paused';
  uptime: string;
  ports?: string[];
}

export interface Activity {
  id: string;
  type: 'agent' | 'session' | 'task' | 'system';
  action: string;
  description: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'metrics' | 'agent_update' | 'session_update' | 'container_update' | 'activity';
  data: unknown;
}

// GitHub types
export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  state: 'open' | 'closed' | 'merged';
  author: string;
  repo: string;
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  url: string;
}

export interface Deployment {
  id: string;
  environment: 'production' | 'staging' | 'development';
  status: 'success' | 'failed' | 'pending' | 'in_progress';
  version: string;
  deployedAt: string;
  url?: string;
}

// Analytics types
export interface TokenUsage {
  timestamp: string;
  tokens: number;
  cost: number;
}

export interface SessionDuration {
  date: string;
  avgDuration: number;
  sessionCount: number;
}

export interface AgentActivity {
  agentId: string;
  agentName: string;
  tasksCompleted: number;
  tasksFailed: number;
  avgResponseTime: number;
}

// Settings types
export interface Settings {
  theme: 'light' | 'dark';
  refreshRate: number;
  notifications: boolean;
}
