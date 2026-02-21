import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as os from 'os';
import * as fs from 'fs';

const execAsync = promisify(exec);
const app = express();
const PORT = parseInt(process.env.PORT || '3002', 10);

app.use(cors());
app.use(express.json());

async function runCommand(cmd: string): Promise<string> {
  try {
    const { stdout } = await execAsync(cmd, { timeout: 10000 });
    return stdout;
  } catch (e: any) {
    return e.stdout || e.message;
  }
}

async function getDockerContainers(): Promise<any[]> {
  try {
    const output = await runCommand('docker ps --format "{{json .}}"');
    if (!output.trim()) return [];
    return output.split('\n').filter(Boolean).map((l: string) => JSON.parse(l));
  } catch {
    return [];
  }
}

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

async function getDiskUsage() {
  try {
    const output = await runCommand("df -h / | tail -1 | awk '{print $2,$3,$4,$5}'");
    const parts = output.trim().split(/\s+/);
    return { total: parts[0], used: parts[1], available: parts[2], percent: parts[3] || 'N/A' };
  } catch {
    return { total: 'N/A', used: 'N/A', available: 'N/A', percent: 'N/A' };
  }
}

app.get('/api/status', async (req, res) => {
  const containers = await getDockerContainers();
  res.json({
    Gateway: { status: 'Online' },
    Agents: 9,
    Sessions: 0,
    Containers: containers.length,
    System: 'Healthy'
  });
});

app.get('/api/sessions', async (req, res) => {
  // Return mock sessions for now
  res.json([
    { sessionKey: 'orchestrator-main', model: 'MiniMax-M2.5', tokens: '106k/200k (53%)', age: '6h ago' },
    { sessionKey: 'researcher-subagent', model: 'MiniMax-M2.5', tokens: 'unknown', age: '9h ago' },
    { sessionKey: 'frontend-main', model: 'MiniMax-M2.5', tokens: '14k/200k (7%)', age: '10h ago' }
  ]);
});

app.get('/api/agents', async (req, res) => {
  res.json([
    'orchestrator', 'backend', 'frontend', 'devops', 'gitops', 
    'tester', 'communications', 'researcher', 'observability'
  ]);
});

app.get('/api/metrics', (req, res) => {
  res.json(getSystemMetrics());
});

app.get('/api/disk', async (req, res) => {
  res.json(await getDiskUsage());
});

app.get('/api/containers', async (req, res) => {
  res.json(await getDockerContainers());
});

app.get('/api/cron', async (req, res) => {
  res.json([]);
});

app.get('/api/kanban', (req, res) => {
  try {
    const data = fs.readFileSync('/workspace/agents/communications/workspace/.kanban/board.json', 'utf-8');
    res.json(JSON.parse(data));
  } catch {
    res.json({ tasks: [] });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// WebSocket server on same port
const wss = new WebSocketServer({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  ws.on('close', () => console.log('WebSocket client disconnected'));
});

setInterval(async () => {
  const metrics = getSystemMetrics();
  const containers = await getDockerContainers();
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ metrics, containers, timestamp: Date.now() }));
    }
  });
}, 5000);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mission Control API running on port ${PORT}`);
  console.log(`WebSocket running on port 8080`);
});
