import { useState, useEffect } from 'react'
import { Activity, Server, Container, Cpu, HardDrive, Users, Zap, Terminal, GitBranch } from 'lucide-react'

const API = ''

function App() {
  const [tab, setTab] = useState('dashboard')
  const [status, setStatus] = useState<any>({})
  const [metrics, setMetrics] = useState<any>({})
  const [containers, setContainers] = useState<any[]>([])
  const [disk, setDisk] = useState<any>({})
  const [sessions, setSessions] = useState<any[]>([])
  const [agents, setAgents] = useState<string[]>([])
  const [kanban, setKanban] = useState<any>({})

  useEffect(() => {
    fetchData()
    // Poll every 10 seconds
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  async function fetchData() {
    try {
      const [s, m, c, d, se, a, k] = await Promise.all([
        fetch(API + '/api/status').then(r => r.json()),
        fetch(API + '/api/metrics').then(r => r.json()),
        fetch(API + '/api/containers').then(r => r.json()),
        fetch(API + '/api/disk').then(r => r.json()),
        fetch(API + '/api/sessions').then(r => r.json()),
        fetch(API + '/api/agents').then(r => r.json()),
        fetch(API + '/api/kanban').then(r => r.json())
      ])
      setStatus(s)
      setMetrics(m)
      setContainers(c)
      setDisk(d)
      setSessions(se)
      setAgents(a)
      setKanban(k)
    } catch(e) { console.error(e) }
  }

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    return `${h}h ${m}m`
  }

  return (
    <div>
      <header>
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Terminal className="w-6 h-6" style={{ color: '#06b6d4' }} />
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Mission Control</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="status-dot status-green" />
            <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>Live (Polling)</span>
          </div>
        </div>
      </header>

      <nav>
        <div className="nav-content">
          {[
            { id: 'dashboard', icon: Activity, label: 'Dashboard' },
            { id: 'agents', icon: Server, label: 'Agents' },
            { id: 'sessions', icon: Users, label: 'Sessions' },
            { id: 'system', icon: Cpu, label: 'System' },
            { id: 'docker', icon: Container, label: 'Docker' },
            { id: 'kanban', icon: GitBranch, label: 'Projects' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={tab === t.id ? 'active' : ''}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main>
        {tab === 'dashboard' && (
          <div className="grid grid-cols-1 grid-cols-2 grid-cols-4">
            <Card icon={Server} label="Gateway" value={status.Gateway?.status || 'Unknown'} />
            <Card icon={Users} label="Agents" value={String(status.Agents || 0)} />
            <Card icon={Activity} label="Sessions" value={String(sessions.length || 0)} />
            <Card icon={Zap} label="Uptime" value={metrics.uptime ? formatUptime(metrics.uptime) : 'N/A'} />
            <Card icon={Cpu} label="CPU" value={metrics.cpu ? metrics.cpu + '%' : 'N/A'} />
            <Card icon={HardDrive} label="Memory" value={metrics.memory ? metrics.memory + '%' : 'N/A'} />
            <Card icon={HardDrive} label="Disk" value={disk.percent || 'N/A'} />
            <Card icon={Container} label="Containers" value={String(containers.length)} />
          </div>
        )}

        {tab === 'agents' && (
          <div className="grid grid-cols-1 grid-cols-2 grid-cols-3">
            {agents.length === 0 ? <p style={{ color: '#9ca3af' }}>No agents</p> : 
              agents.map((agent, i) => (
                <div key={i} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Server className="w-5 h-5" style={{ color: '#06b6d4' }} />
                    <span style={{ fontWeight: 500 }}>{agent}</span>
                  </div>
                </div>
              ))
            }
          </div>
        )}

        {tab === 'sessions' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Model</th>
                  <th>Tokens</th>
                  <th>Age</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', color: '#9ca3af' }}>No active sessions</td></tr> :
                  sessions.map((s: any, i: number) => (
                    <tr key={i}>
                      <td className="font-mono" style={{ fontSize: '0.75rem' }}>{(s.sessionKey || '').slice(0, 50)}</td>
                      <td>{s.model || 'N/A'}</td>
                      <td>{s.tokens || 'N/A'}</td>
                      <td>{s.age || 'N/A'}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        {tab === 'system' && (
          <div className="grid grid-cols-1 grid-cols-2">
            <div className="card">
              <h3>CPU & Memory</h3>
              <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>CPU Usage: {metrics.cpu || 0}%</p>
              <div style={{ width: '100%', height: '8px', background: '#374151', borderRadius: '4px', marginBottom: '1rem' }}>
                <div style={{ width: (metrics.cpu || 0) + '%', height: '100%', background: '#06b6d4', borderRadius: '4px' }} />
              </div>
              <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>Memory Usage: {metrics.memory || 0}%</p>
              <div style={{ width: '100%', height: '8px', background: '#374151', borderRadius: '4px' }}>
                <div style={{ width: (metrics.memory || 0) + '%', height: '100%', background: '#8b5cf6', borderRadius: '4px' }} />
              </div>
              <p style={{ color: '#9ca3af', marginTop: '1rem' }}>Load Avg: {metrics.load?.join(', ') || 'N/A'}</p>
            </div>
            <div className="card">
              <h3>Disk Usage</h3>
              <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>Used: {disk.used || 'N/A'}</p>
              <p style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>Available: {disk.available || 'N/A'}</p>
              <p style={{ color: '#9ca3af' }}>Total: {disk.total || 'N/A'}</p>
              <p style={{ color: '#9ca3af', marginTop: '0.5rem' }}>Usage: {disk.percent || 'N/A'}</p>
            </div>
          </div>
        )}

        {tab === 'docker' && (
          <div className="grid grid-cols-1 grid-cols-2 grid-cols-3">
            {containers.length === 0 ? <p style={{ color: '#9ca3af' }}>No containers running</p> :
              containers.map((c: any, i: number) => (
                <div key={i} className="card">
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Container className="w-5 h-5" style={{ color: '#06b6d4' }} />
                      <span style={{ fontWeight: 500 }}>{(c.Names || '').replace('/', '')}</span>
                    </div>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.25rem',
                      background: c.Status?.includes('Up') ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                      color: c.Status?.includes('Up') ? '#4ade80' : '#f87171'
                    }}>
                      {c.Status || 'Unknown'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>{c.Image}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>{c.Ports || 'No ports'}</p>
                </div>
              ))
            }
          </div>
        )}

        {tab === 'kanban' && (
          <div className="kanban-board">
            {['Proposed', 'Approved', 'In Progress', 'Testing', 'Completed'].map(column => (
              <div key={column} className="kanban-column">
                <h3>{column}</h3>
                <div className="kanban-cards">
                  {kanban.tasks?.filter((t: any) => t.column === column).map((task: any) => (
                    <div key={task.id} className="kanban-card">
                      <p style={{ fontWeight: 500 }}>{task.title}</p>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{task.assignee}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function Card({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="card-icon">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="card-label">{label}</p>
          <p className="card-value">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default App
