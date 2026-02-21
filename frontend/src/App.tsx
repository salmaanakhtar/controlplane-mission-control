import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Activity, Server, Container, Cpu, HardDrive, Users, Clock, Zap, Terminal } from 'lucide-react'

const API = 'http://localhost:3002'

interface Status {
  Gateway?: { status?: string }
  Agents?: number
  Sessions?: number
}

interface Container {
  Names: string
  Status: string
  Image: string
  Ports: string
}

function App() {
  const [tab, setTab] = useState('dashboard')
  const [status, setStatus] = useState<Status>({})
  const [metrics, setMetrics] = useState<any>({})
  const [containers, setContainers] = useState<Container[]>([])
  const [disk, setDisk] = useState<any>({})
  const [sessions, setSessions] = useState<any[]>([])
  const [agents, setAgents] = useState<string[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    fetchData()
    const ws = new WebSocket('ws://localhost:8080')
    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.status) setStatus(data.status)
      if (data.metrics) setMetrics(data.metrics)
      if (data.containers) setContainers(data.containers)
    }
    return () => ws.close()
  }, [])

  async function fetchData() {
    try {
      const [s, m, c, d, se, a] = await Promise.all([
        fetch(`${API}/api/status`).then(r => r.json()),
        fetch(`${API}/api/metrics`).then(r => r.json()),
        fetch(`${API}/api/containers`).then(r => r.json()),
        fetch(`${API}/api/disk`).then(r => r.json()),
        fetch(`${API}/api/sessions`).then(r => r.json()),
        fetch(`${API}/api/agents`).then(r => r.json())
      ])
      setStatus(s)
      setMetrics(m)
      setContainers(c)
      setDisk(d)
      setSessions(se)
      setAgents(a)
    } catch(e) { console.error(e) }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl font-bold">Mission Control</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-400">{connected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { id: 'dashboard', icon: Activity, label: 'Dashboard' },
              { id: 'agents', icon: Server, label: 'Agents' },
              { id: 'sessions', icon: Users, label: 'Sessions' },
              { id: 'system', icon: Cpu, label: 'System' },
              { id: 'docker', icon: Container, label: 'Docker' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition ${
                  tab === t.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {tab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card icon={Server} label="Gateway" value={status.Gateway?.status || 'Unknown'} />
            <Card icon={Users} label="Agents" value={status.Agents?.toString() || '0'} />
            <Card icon={Activity} label="Sessions" value={status.Sessions?.toString() || '0'} />
            <Card icon={Zap} label="Uptime" value={metrics.uptime ? Math.floor(metrics.uptime / 3600) + 'h' : 'N/A'} />
            
            <Card icon={Cpu} label="CPU" value={metrics.cpu ? `${metrics.cpu}%` : 'N/A'} />
            <Card icon={HardDrive} label="Memory" value={metrics.memory ? `${metrics.memory}%` : 'N/A'} />
            <Card icon={HardDrive} label="Disk" value={disk.percent || 'N/A'} />
            <Card icon={Container} label="Containers" value={containers.length.toString()} />
          </div>
        )}

        {tab === 'agents' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.length === 0 ? <p className="text-gray-400">Loading agents...</p> : 
              agents.filter(a => a.trim()).map((agent, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-cyan-400" />
                    <span className="font-medium">{agent}</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {tab === 'sessions' && (
          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Session</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Model</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tokens</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s: any, i: number) => (
                  <tr key={i} className="border-t border-gray-800">
                    <td className="px-4 py-3 font-mono text-sm">{s.sessionKey?.slice(0, 40) || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm">{s.model || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">{s.tokens || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'system' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">CPU Usage</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'CPU', value: metrics.cpu || 0 },
                    { name: 'Load1', value: metrics.load?.[0] || 0 },
                    { name: 'Load5', value: metrics.load?.[1] || 0 },
                    { name: 'Load15', value: metrics.load?.[2] || 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                    <Bar dataKey="value" fill="#06B6D4" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Memory</h3>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Used', value: metrics.totalMemory ? Math.round((metrics.totalMemory - metrics.freeMemory) / 1024 / 1024 / 1024) : 0 },
                    { name: 'Free', value: metrics.freeMemory ? Math.round(metrics.freeMemory / 1024 / 1024 / 1024) : 0 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
                    <Bar dataKey="value" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-sm text-gray-400 mt-2">Disk: {disk.used || 'N/A'} / {disk.total || 'N/A'} ({disk.percent || 'N/A'})</p>
            </div>
          </div>
        )}

        {tab === 'docker' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {containers.length === 0 ? <p className="text-gray-400">No containers running</p> :
              containers.map((c, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Container className="w-5 h-5 text-cyan-400" />
                      <span className="font-medium">{c.Names?.replace('/', '') || 'Unknown'}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      c.Status?.includes('Up') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {c.Status || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{c.Image}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.Ports || 'No ports'}</p>
                </div>
              ))
            }
          </div>
        )}
      </main>
    </div>
  )
}

function Card({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-cyan-500/10 rounded-lg">
          <Icon className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default App
