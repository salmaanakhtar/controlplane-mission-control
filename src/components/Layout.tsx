import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Sidebar';
import { useWebSocket } from '@/hooks/useApi';
import type { WebSocketMessage } from '@/types';

export function Layout() {
  const { connected } = useWebSocket<WebSocketMessage>('/ws', {
    type: 'metrics',
    data: null,
  });

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar connected={connected} />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
