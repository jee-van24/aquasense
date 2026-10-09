import React, { useState, useEffect } from 'react';
import { leakService } from '../services/leakService';
import { Leak } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SeverityBadge } from '../components/common/SeverityBadge';
import {
  AlertTriangle,
  Clock,
  Building2,
  Droplets,
  Activity,
  CheckCircle2,
  HelpCircle,
  Eye,
  X,
  Sparkles,
  Wrench,
  Search,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const LeaksPage: React.FC = () => {
  const [leaks, setLeaks] = useState<Leak[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeak, setSelectedLeak] = useState<Leak | null>(null);
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Resolved'>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [updating, setUpdating] = useState(false);

  const fetchLeaks = async () => {
    try {
      const data = await leakService.getLeaks();
      setLeaks(data);
      if (selectedLeak) {
        const refreshed = data.find((l) => l.id === selectedLeak.id);
        if (refreshed) setSelectedLeak(refreshed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaks();
    const interval = setInterval(fetchLeaks, 8000);
    return () => clearInterval(interval);
  }, [selectedLeak?.id]);

  const handleOpenDetails = async (leakId: string) => {
    try {
      const detail = await leakService.getLeakById(leakId);
      setSelectedLeak(detail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (leakId: string, newStatus: 'Detected' | 'Investigating' | 'Resolved') => {
    setUpdating(true);
    try {
      await leakService.updateStatus(leakId, newStatus);
      await fetchLeaks();
      if (selectedLeak?.id === leakId) {
        const updated = await leakService.getLeakById(leakId);
        setSelectedLeak(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredLeaks = leaks.filter((l) => {
    if (statusFilter === 'Active' && l.status === 'Resolved') return false;
    if (statusFilter === 'Resolved' && l.status !== 'Resolved') return false;
    if (severityFilter !== 'All' && l.severity !== severityFilter) return false;
    return true;
  });

  if (loading && leaks.length === 0) {
    return <LoadingSpinner message="Scanning network for active flow anomalies..." />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Leak Detection & Incident Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Algorithmic incident verification, multi-signal anomaly diagnostics, and resolution tracking.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-sm self-start sm:self-auto">
          {(['All', 'Active', 'Resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                statusFilter === tab
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'All' ? `All (${leaks.length})` : tab === 'Active' ? `Active (${leaks.filter(l => l.status !== 'Resolved').length})` : `Resolved (${leaks.filter(l => l.status === 'Resolved').length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Leaks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Sensor / Zone</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Probability</th>
                <th className="py-3 px-4">Observed vs Baseline</th>
                <th className="py-3 px-4">Est. Loss Rate</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLeaks.map((leak) => {
                const isResolved = leak.status === 'Resolved';
                return (
                  <tr key={leak.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-cyan-400">{leak.sensorCode}</div>
                      <div className="font-medium text-slate-200 line-clamp-1">{leak.sensorName}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" />
                        <span>{leak.buildingName} &bull; {leak.roomName}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <SeverityBadge severity={leak.severity} />
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 flex items-center gap-1">
                        <Activity className={`w-3.5 h-3.5 ${leak.probability >= 80 ? 'text-rose-400' : 'text-amber-400'}`} />
                        <span>{leak.probability}%</span>
                      </div>
                      <div className="text-[10px] text-slate-400">Score: {leak.anomalyScore}%</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-rose-400">{leak.currentFlowRate} L/min</div>
                      <div className="text-[11px] text-slate-400">Base: {leak.baselineFlowRate} L/min</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-amber-400">{leak.lossRateLph} L/h</div>
                      <div className="text-[11px] text-slate-400">~{leak.estimatedLossLiters} L wasted</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>~{leak.durationMinutes} min</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(leak.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                          leak.status === 'Resolved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : leak.status === 'Investigating'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {leak.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetails(leak.id)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white rounded-lg transition font-medium text-xs inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Diagnose
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED DIAGNOSTIC MODAL */}
      {selectedLeak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-cyan-800">
                    {selectedLeak.sensorCode}
                  </span>
                  <SeverityBadge severity={selectedLeak.severity} />
                  <span
                    className={`text-xs px-2 py-0.5 rounded border font-medium ${
                      selectedLeak.status === 'Resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : selectedLeak.status === 'Investigating'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {selectedLeak.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedLeak.sensorName}</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedLeak.buildingName} &bull; {selectedLeak.roomName}
                </p>
              </div>

              <button
                onClick={() => setSelectedLeak(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnostic Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Leak Probability</span>
                <span className="text-base font-bold text-rose-400">{selectedLeak.probability}%</span>
                <span className="text-[10px] text-slate-500 block">Z-Score Calibrated</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Observed Flow</span>
                <span className="text-base font-bold text-white">{selectedLeak.currentFlowRate} L/min</span>
                <span className="text-[10px] text-slate-500 block">Base: {selectedLeak.baselineFlowRate} L/min</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Wastage Rate</span>
                <span className="text-base font-bold text-amber-400">{selectedLeak.lossRateLph} L/h</span>
                <span className="text-[10px] text-slate-500 block">Total: ~{selectedLeak.estimatedLossLiters} L</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Duration</span>
                <span className="text-base font-bold text-cyan-400">~{selectedLeak.durationMinutes} min</span>
                <span className="text-[10px] text-slate-500 block">Active window</span>
              </div>
            </div>

            {/* AI Explanation Box */}
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-cyan-300 mb-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Algorithmic Anomaly Diagnosis
              </div>
              <p className="text-slate-200 leading-relaxed italic">
                "{selectedLeak.aiExplanation}"
              </p>
            </div>

            {/* Recommended Action */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300 mb-1.5">
                <Wrench className="w-4 h-4 text-amber-400" />
                Recommended Environmental Protocol
              </div>
              <p className="text-slate-300 leading-relaxed">
                {selectedLeak.recommendedAction}
              </p>
            </div>

            {/* Flow Graph */}
            {selectedLeak.flowHistory && selectedLeak.flowHistory.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Telemetry Flow History</h4>
                <div className="h-44 w-full bg-slate-950 rounded-xl border border-slate-800 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedLeak.flowHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="flowRate" name="Flow Rate (L/min)" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeWidth={2} />
                      <Area type="monotone" dataKey="baseline" name="Normal Baseline (L/min)" stroke="#64748b" strokeDasharray="3 3" fillOpacity={0} strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Status Transition Control Buttons */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-400">Update Incident Protocol State:</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={updating || selectedLeak.status === 'Detected'}
                  onClick={() => handleUpdateStatus(selectedLeak.id, 'Detected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    selectedLeak.status === 'Detected'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  Detected
                </button>

                <button
                  disabled={updating || selectedLeak.status === 'Investigating'}
                  onClick={() => handleUpdateStatus(selectedLeak.id, 'Investigating')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    selectedLeak.status === 'Investigating'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  Investigating
                </button>

                <button
                  disabled={updating || selectedLeak.status === 'Resolved'}
                  onClick={() => handleUpdateStatus(selectedLeak.id, 'Resolved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                    selectedLeak.status === 'Resolved'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
