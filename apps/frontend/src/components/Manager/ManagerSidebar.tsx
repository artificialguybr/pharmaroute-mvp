import React from 'react';
import { BarChart3, Users, MapPin, CalendarDays, LogOut, Leaf } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ManagerSidebarProps {
  activeTab: 'dashboard' | 'team' | 'territories' | 'calendar';
  setActiveTab: (tab: 'dashboard' | 'team' | 'territories' | 'calendar') => void;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard' as const, label: 'Dashboard', Icon: BarChart3 },
  { id: 'team' as const, label: 'Equipe', Icon: Users },
  { id: 'territories' as const, label: 'Zonas', Icon: MapPin },
  { id: 'calendar' as const, label: 'Agenda', Icon: CalendarDays },
];

export function ManagerSidebar({ activeTab, setActiveTab, onLogout }: ManagerSidebarProps) {
  return (
    <aside className="w-64 bg-[#2D2926] text-white flex flex-col shrink-0 z-20 h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-white/10 shrink-0 bg-[#FFC600]">
        <div className="w-8 h-8 bg-[#2D2926] flex items-center justify-center shrink-0">
          <Leaf className="w-4 h-4 text-[#FFC600]" strokeWidth={2} />
        </div>
        <div>
          <span className="font-display font-bold tracking-tight text-base leading-none block text-[#2D2926] uppercase">PharmaRoute</span>
          <span className="font-display text-[9px] font-bold tracking-[0.2em] text-[#2D2926]/60 uppercase block mt-0.5">Gestor</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 pt-6">
        <p className="font-display text-[9px] font-bold tracking-[0.2em] text-white/30 uppercase px-3 mb-4">Módulos</p>
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-3 px-3 py-3 w-full transition-all font-display font-bold text-xs tracking-widest uppercase rounded-sm group",
              activeTab === id
                ? "bg-[#FFC600] text-[#2D2926]"
                : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <Icon
              className={cn("w-4 h-4 shrink-0 transition-colors", activeTab === id ? "text-[#2D2926]" : "text-white/40 group-hover:text-white")}
              strokeWidth={2}
            />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 shrink-0">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-3 w-full text-white/40 hover:text-white hover:bg-white/5 rounded-sm font-display font-bold tracking-widest transition-colors text-xs uppercase group"
        >
          <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform shrink-0" strokeWidth={2} />
          Desconectar
        </button>
      </div>
    </aside>
  );
}
