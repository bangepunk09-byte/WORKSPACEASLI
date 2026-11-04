import React from 'react';
import { LayoutDashboard, Kanban, CalendarDays, FileText, Settings } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const NewSidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useWorkspace();

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: Kanban },
    { id: 'meetings', label: 'Meetings', icon: CalendarDays },
    { id: 'documents', label: 'Docs', icon: FileText },
    { id: 'admin', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-20 bg-slate-900 h-screen flex flex-col items-center py-6 gap-6">
      <div className="text-white font-bold text-xl">A</div>
      <nav className="flex flex-col gap-4">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-xl transition ${
                isActive ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className="h-6 w-6" />
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
