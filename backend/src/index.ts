import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as fs from 'fs';

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Helper to run shell commands
async function runCommand(cmd: string): Promise<string> {
  try {
    const { stdout } = await execAsync(cmd, { timeout: 10000 });
    return stdout;
  } catch (e: any) {
    return e.stdout || e.message;
  }
}

// Parse openclaw status JSON
async function getOpenClawStatus(): Promise<any> {
  try {
    const output = await runCommand('openclaw status --json');
    return JSON.parse(output);
  } catch {
    return { error: 'Failed to get status' };
  }
}

// Get sessions
async function getSessions(): Promise<any[]> {
  try {
    const output = await runCommand('openclaw sessions --json');
    return JSON.parse(output);
  } catch {
    return [];
  }
}

// Get agents
async function getAgents(): Promise<string[]> {
  try {
    const output = await runCommand('openclaw agents list');
    return output.split('\n').filter((l: string) => l.trim());
  } catch {
    return [];
  }
}

// Get Docker containers
async function getContainers(): Promise<any[]> {
  try {
    const output = await runCommand('docker ps --format "{{json .}}"');
    return output.split('\n').filter(Boolean).map((l: string) => JSON.parse(l));
  } catch {
    return [];
  }
}

// Get system metrics
function getSystemMetrics() {
  const cpus = os.cpus();
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  
  let idle = 0;
  let total = 0;
  cpus.forEach(cpu => {
    for (let type in cpu.times) {
      total += cpu.times[type as keyof typeof cpu.times];
    }
    idle += cpu.times.idle;
  });
  
  return {
    cpu: Math.round((1 - idle / total) * 100),
    memory: Math.round(((totalMem - freeMem) / totalMem) * 100),
    uptime: os.uptime(),
    load: os.loadavg(),
    totalMemory: totalMem,
    freeMemory: freeMem
  };
}

// Get disk usage
async function getDiskUsage() {
  try {
    const output = await runCommand('df -h / | tail -1 | awk "{print \$2,\$3,\$4,\$5}"');
    const parts = output.trim().split(/\s+/);
    return { total: parts[0], used: parts[1], available: parts[2], percent: parts[3] };
  } catch {
    return { total: 'N/A', used: 'N/A', available: 'N/A', percent: 'N/A' };
  }
}

// API Routes
app.get('/api/status', async (req, res) => {
  const status = await getOpenClawStatus();
  res.json(status);
});

app.get('/api/sessions', async (req, res) => {
  const sessions = await getSessions();
  res.json(sessions);
});

app.get('/api/agents', async (req, res) => {
  const agents = await getAgents();
  res.json(agents);
});

app.get('/api/metrics', (req, res) => {
  const metrics = getSystemMetrics();
  res.json(metrics);
});

app.get('/api/disk', async (req, res) => {
  const disk = await getDiskUsage();
  res.json(disk);
});

app.get('/api/containers', async (req, res) => {
  const containers = await getContainers();
  res.json(containers);
});

app.get('/api/cron', async (req, res) => {
  try {
    const output = await runCommand('openclaw cron list --json');
    res.json(JSON.parse(output));
  } catch {
    res.json([]);
  }
});

// Kanban - read from existing JSON
app.get('/api/kanban', (req, res) => {
  try {
    const data = fs.readFileSync('/workspace/agents/communications/workspace/.kanban/board.json', 'utf-8');
    res.json(JSON.parse(data));
  } catch {
    res.json({ tasks: [] });
  }
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// WebSocket server
const wss = new WebSocketServer({ port: 8080 });
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('WebSocket client connected');
  
  ws.on('close', () => {
    clients.delete(ws);
  });
});

// Broadcast to all clients
function broadcast(data: any) {
  const message = JSON.stringify(data);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Periodic updates
setInterval(async () => {
  const status = await getOpenClawStatus();
  const metrics = getSystemMetrics();
  const containers = await getContainers();
  broadcast({ type: 'update', status, metrics, containers });
}, 5000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mission Control API running on port ${PORT}`);
  console.log(`WebSocket running on port 8080`);
});
