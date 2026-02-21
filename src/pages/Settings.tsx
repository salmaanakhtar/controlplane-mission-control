import { useState, createContext, useContext } from 'react';
import { Moon, Sun, RefreshCw, Bell, Settings as SettingsIcon, Monitor } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SettingsContextType {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  refreshRate: number;
  setRefreshRate: (rate: number) => void;
  notifications: boolean;
  setNotifications: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Refresh rates as per task: 10s, 30s, 60s
const REFRESH_RATES = [
  { value: 10000, label: '10 seconds' },
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '60 seconds' },
];

function ThemeToggle({ theme, setTheme }: { theme: 'light' | 'dark'; setTheme: (theme: 'light' | 'dark') => void }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={theme === 'light' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('light')}
        className="flex items-center gap-2"
      >
        <Sun className="w-4 h-4" />
        Light
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setTheme('dark')}
        className="flex items-center gap-2"
      >
        <Moon className="w-4 h-4" />
        Dark
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          const newTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
          setTheme(newTheme);
        }}
        className="flex items-center gap-2"
      >
        <Monitor className="w-4 h-4" />
        System
      </Button>
    </div>
  );
}

function RefreshRateSelector({ refreshRate, setRefreshRate }: { refreshRate: number; setRefreshRate: (rate: number) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        How often should the dashboard refresh data?
      </p>
      <div className="flex flex-wrap gap-2">
        {REFRESH_RATES.map((rate) => (
          <Button
            key={rate.value}
            variant={refreshRate === rate.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRefreshRate(rate.value)}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshRate === rate.value ? 'animate-spin' : ''}`} style={{ animationDuration: `${rate.value}ms` }} />
            {rate.label}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Current: Refresh every {REFRESH_RATES.find(r => r.value === refreshRate)?.label || 'custom'}
      </p>
    </div>
  );
}

function NotificationToggle({ notifications, setNotifications }: { notifications: boolean; setNotifications: (enabled: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Bell className="w-5 h-5 text-muted-foreground" />
        <div>
          <p className="font-medium">Push Notifications</p>
          <p className="text-sm text-muted-foreground">Receive alerts for important events</p>
        </div>
      </div>
      <Button
        variant={notifications ? 'default' : 'outline'}
        size="sm"
        onClick={() => setNotifications(!notifications)}
      >
        {notifications ? 'Enabled' : 'Disabled'}
      </Button>
    </div>
  );
}

export function SettingsPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });
  
  const [refreshRate, setRefreshRate] = useState<number>(() => {
    const saved = localStorage.getItem('refreshRate');
    return saved ? parseInt(saved, 10) : 30000;
  });
  
  const [notifications, setNotifications] = useState<boolean>(() => {
    const saved = localStorage.getItem('notifications');
    return saved ? saved === 'true' : true;
  });

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  const handleRefreshRateChange = (rate: number) => {
    setRefreshRate(rate);
    localStorage.setItem('refreshRate', rate.toString());
  };

  const handleNotificationsChange = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('notifications', enabled.toString());
  };

  return (
    <SettingsContext.Provider value={{ theme, setTheme: handleThemeChange, refreshRate, setRefreshRate: handleRefreshRateChange, notifications, setNotifications: handleNotificationsChange }}>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Customize your Mission Control experience</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how Mission Control looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Theme</h4>
                <ThemeToggle theme={theme} setTheme={handleThemeChange} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Data Refresh
              </CardTitle>
              <CardDescription>
                Control how data is refreshed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RefreshRateSelector refreshRate={refreshRate} setRefreshRate={handleRefreshRateChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage alert preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationToggle notifications={notifications} setNotifications={handleNotificationsChange} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                About
              </CardTitle>
              <CardDescription>
                Application information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Version</span>
                <Badge>1.0.0</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Build</span>
                <span className="text-sm font-mono">2024.02.20</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Environment</span>
                <Badge variant="outline">Production</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
            <CardDescription>
              Quick actions to navigate Mission Control
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="text-sm">Go to Dashboard</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-background rounded">G D</kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="text-sm">Go to Agents</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-background rounded">G A</kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="text-sm">Go to Sessions</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-background rounded">G S</kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="text-sm">Toggle Theme</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-background rounded">Ctrl + /</kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="text-sm">Refresh Data</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-background rounded">R</kbd>
              </div>
              <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                <span className="text-sm">Search</span>
                <kbd className="px-2 py-1 text-xs font-mono bg-background rounded">Ctrl + K</kbd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsContext.Provider>
  );
}
