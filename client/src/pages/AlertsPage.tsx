import React, { useState, useEffect } from 'react';
import { alertService } from '../services/alertService';
import { buildingService } from '../services/buildingService';
import { Alert, Building } from '../types';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Droplets,
  Search,
  Filter,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [severityTab, setSeverityTab] = useState<'All' | 'Critical' | 'High' | 'Medium' | 'Low' | 'Resolved'>('All');
  const [selectedBuilding, setSelectedBuilding] = useState('All');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      const [aData, bData] = await Promise.all([
        alertService.getAlerts(),
        buildingService.getBuildings(),
      ]);
      setAlerts(aData);
      setBuildings(bData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await alertService.updateAlert(alertId, { isRead: true });
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, isRead: true } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await alertService.updateAlert(alertId, { isResolved: true, isRead: true });
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, isResolved: true, isRead: true } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await alertService.markAllAsRead();
      setAlerts(alerts.map(a => ({ ...a, isRead: true })));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (severityTab === 'Resolved') {
      if (!a.isResolved) return false;
    } else if (severityTab !== 'All') {
      if (a.isResolved || a.severity !== severityTab) return false;
    }

    if (selectedBuilding !== 'All' && a.buildingId !== selectedBuilding) return false;

    if (search) {
      const s = search.toLowerCase();
      if (!a.title.toLowerCase().includes(s) && !a.message.toLowerCase().includes(s) && !a.sensorCode.toLowerCase().includes(s)) {
        return false;
      }
    }

    return true;
  });

  if (loading && alerts.length === 0) {
    return <LoadingSpinner message="Loading active notification feed..." />;
  }

  const unreadCount = alerts.filter(a => !a.isRead && !a.isResolved).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Alert Center & Telemetry Warnings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Prioritized notifications triggered by rolling standard deviation and persistence anomaly thresholds.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={actionLoading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 self-start sm:self-auto transition"
          >
            <CheckCheck className="w-4 h-4 text-cyan-400" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        {/* Severity Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['All', 'Critical', 'High', 'Medium', 'Low', 'Resolved'] as const).map((tab) => {
            const count = tab === 'All'
              ? alerts.length
              : tab === 'Resolved'
              ? alerts.filter(a => a.isResolved).length
              : alerts.filter(a => !a.isResolved && a.severity === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setSeverityTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                  severityTab === tab
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{tab}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60 font-mono">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Building Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search alert description or sensor code..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div>
            <select
              value={selectedBuilding}
              onChange={(e) => setSelectedBuilding(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-cyan-500 transition"
            >
              <option value="All">All Facilities</option>
              {buildings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const isResolved = alert.isResolved;
          const isUnread = !alert.isRead && !isResolved;

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition ${
                isResolved
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-80'
                  : isUnread
                  ? 'bg-slate-900 border-cyan-500/40 shadow-sm'
                  : 'bg-slate-900 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  {/* Top tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-cyan-800/80">
                      {alert.sensorCode}
                    </span>
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {alert.buildingName}
                    </span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(alert.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {isUnread && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-slate-950">
                        NEW
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {alert.message}
                  </p>

                  {/* Impact metrics pill */}
                  <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <div>
                      Leak Risk: <strong className="text-rose-400">{alert.leakProbability}%</strong>
                    </div>
                    <div>
                      Estimated Wastage: <strong className="text-amber-400">~{alert.estimatedWastage} L</strong>
                    </div>
                    {alert.recommendedAction && (
                      <div className="text-[11px] text-cyan-300 italic">
                        Protocol: {alert.recommendedAction}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-start shrink-0 pt-2 sm:pt-0">
                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition font-medium"
                    >
                      Mark Read
                    </button>
                  )}

                  {!isResolved ? (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded text-xs font-medium transition flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Resolve
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="p-12 text-center text-slate-500 text-sm bg-slate-900 border border-slate-800 rounded-xl">
            No alerts matching the selected filter category.
          </div>
        )}
      </div>
    </div>
  );
};
