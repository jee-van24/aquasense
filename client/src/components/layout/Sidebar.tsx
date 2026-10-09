import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  BarChart3,
  AlertTriangle,
  Cpu,
  Building2,
  Bell,
  FileText,
  Settings,
  Droplet,
  Leaf,
  X,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose?: () => void;
  activeLeaksCount?: number;
  activeAlertsCount?: number;
}

export const Sidebar: React.FC<Props> = ({
  isOpen,
  onClose,
  activeLeaksCount = 0,
  activeAlertsCount = 0,
}) => {
  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/monitoring', label: 'Live Monitoring', icon: Radio },
    { to: '/water-usage', label: 'Water Usage', icon: BarChart3 },
    {
      to: '/leaks',
      label: 'Leak Detection',
      icon: AlertTriangle,
      badge: activeLeaksCount > 0 ? activeLeaksCount : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
    },
    { to: '/sensors', label: 'Sensor Network', icon: Cpu },
    { to: '/buildings', label: 'Campus Buildings', icon: Building2 },
    {
      to: '/alerts',
      label: 'Alerts',
      icon: Bell,
      badge: activeAlertsCount > 0 ? activeAlertsCount : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    { to: '/reports', label: 'EVS Reports', icon: FileText },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-slate-900 border-r border-slate-800 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-sky-600 shadow-lg shadow-cyan-500/20">
              <Droplet className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                AquaSense
                <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950 px-1.5 py-0.2 rounded border border-cyan-800/60">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Smart Water Conservation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            System Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 text-xs font-bold rounded-full ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* EVS Environmental Note Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/30">
            <Leaf className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-semibold text-emerald-300">EVS Academic Project</div>
              <div className="text-slate-400 text-[11px] mt-0.5 leading-snug">
                Detecting abnormal building consumption to prevent municipal potable water wastage.
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
