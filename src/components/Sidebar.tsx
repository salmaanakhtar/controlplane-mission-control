import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Bot,
  UserRound,
  GitBranch,
  BarChart3,
  Activity,
  Settings,
  Server,
  Container,
  Wifi,
  WifiOff,
} from 'lucide-react';

interface SidebarProps {
  connected: boolean;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/agents', label: 'Agents', icon: Bot },
  { path: '/sessions', label: 'Sessions', icon: UserRound },
  { path: '/github', label: 'GitHub', icon: GitBranch },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/activity', label: 'Activity', icon: Activity },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ connected }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-64">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white">Mission Control</h1>
        <div className="flex items-center gap-2 mt-2 text-sm">
          {connected ? (
            <>
              <Wifi className="w-4 h-4 text-green-500" />
              <span className="text-green-500">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-500" />
              <span className="text-red-500">Disconnected</span>
            </>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-500">v1.0.0 • Mission Control</p>
      </div>
    </div>
  );
}
