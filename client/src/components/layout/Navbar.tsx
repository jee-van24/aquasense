import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Radio,
  Play,
  Pause,
  RefreshCw,
  LogOut,
  User,
  ShieldCheck,
  Menu,
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { Link } from 'react-router-dom';

interface Props {
  onToggleSidebar?: () => void;
  activeAlertsCount?: number;
}

export const Navbar: React.FC<Props> = ({ onToggleSidebar, activeAlertsCount = 0 }) => {
  const { user, logout } = useAuth();
  const [isSimulating, setIsSimulating] = useState(true);
  const [isTicking, setIsTicking] = useState(false);

  const handleToggleSimulator = async () => {
    try {
      const res = await aiService.toggleSimulator();
      setIsSimulating(res.isRunning);
    } catch (e) {
      console.error(e);
    }
  };

  const handleManualTick = async () => {
    setIsTicking(true);
    try {
      await aiService.triggerSimulatorTick();
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setIsTicking(false), 600);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 text-slate-400 hover:text-slate-100 rounded-lg md:hidden hover:bg-slate-800 transition"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-950/80 text-cyan-300 border border-cyan-800/80">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            IoT Simulation Mode
          </span>
          <span className="text-xs text-slate-400 hidden lg:inline">
            Campus Telemetry: Active
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Simulator controls */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-800/70 p-1 rounded-lg border border-slate-700/60">
          <button
            onClick={handleToggleSimulator}
            className={`p-1.5 rounded text-xs flex items-center gap-1 font-medium transition ${
              isSimulating ? 'bg-cyan-600/30 text-cyan-300 hover:bg-cyan-600/40' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={isSimulating ? 'Pause simulated streaming' : 'Resume simulated streaming'}
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isSimulating ? 'Streaming' : 'Paused'}</span>
          </button>

          <button
            onClick={handleManualTick}
            disabled={isTicking}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded hover:bg-slate-700/50 transition"
            title="Generate instantaneous telemetry cycle"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTicking ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Alerts Bell */}
        <Link
          to="/alerts"
          className="relative p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-lg transition"
          title="View active alerts"
        >
          <Bell className="w-5 h-5" />
          {activeAlertsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg">
              {activeAlertsCount}
            </span>
          )}
        </Link>

        {/* User profile dropdown info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-semibold text-slate-200">{user?.name || 'Admin'}</div>
            <div className="text-[11px] text-cyan-400 font-mono">{user?.role || 'Facility Lead'}</div>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-white font-semibold text-xs shadow-md">
            {user?.name?.charAt(0) || 'A'}
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            title="Sign out of demo session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
