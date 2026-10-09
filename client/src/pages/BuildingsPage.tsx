import React, { useState, useEffect } from 'react';
import { buildingService } from '../services/buildingService';
import { Building } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RiskBadge } from '../components/common/RiskBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import {
  Building2,
  Cpu,
  Droplets,
  AlertTriangle,
  TrendingDown,
  Layers,
  ArrowRight,
  X,
  Gauge,
  Clock,
  CheckCircle2,
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

export const BuildingsPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const fetchBuildings = async () => {
    try {
      const data = await buildingService.getBuildings();
      setBuildings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildings();
  }, []);

  const handleOpenBuildingDetail = async (id: string) => {
    try {
      const detail = await buildingService.getBuildingById(id);
      setSelectedBuilding(detail);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && buildings.length === 0) {
    return <LoadingSpinner message="Scanning campus facility infrastructure..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          Campus Facilities & Infrastructure
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Building-level water efficiency index, aggregated flow telemetries, and zone plumbing diagnostics.
        </p>
      </div>

      {/* Buildings Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {buildings.map((b) => {
          const hasLeaks = b.activeLeaksCount > 0;
          return (
            <div
              key={b.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition flex flex-col justify-between"
            >
              <div>
                {/* Top line */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-cyan-800">
                    {b.code}
                  </span>
                  <RiskBadge level={b.riskLevel} size="sm" />
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-1">{b.name}</h3>
                <p className="text-xs text-slate-400 mb-4 line-clamp-2">{b.description}</p>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-2.5 p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs mb-4">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Current Demand:</span>
                    <span className="text-sm font-bold text-cyan-400">{b.currentFlowLpm} L/min</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Daily Average:</span>
                    <span className="text-sm font-semibold text-slate-200">{b.dailyAverageLiters.toLocaleString()} L</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Sensors Deployed:</span>
                    <span className="text-sm font-semibold text-white">{b.sensorCount} units</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Active Leaks:</span>
                    <span className={`text-sm font-bold ${hasLeaks ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {b.activeLeaksCount} {hasLeaks ? 'incident(s)' : 'none'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                  <span>Type: <strong className="text-slate-200">{b.type}</strong></span>
                  <span>Floors: <strong className="text-slate-200">{b.floors}</strong></span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-emerald-400 font-medium">
                  {b.waterSavedLiters.toLocaleString()} L saved
                </div>
                <button
                  onClick={() => handleOpenBuildingDetail(b.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  Inspect Facility <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED BUILDING DRILLDOWN MODAL */}
      {selectedBuilding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-cyan-800">
                    {selectedBuilding.code}
                  </span>
                  <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {selectedBuilding.type} &bull; {selectedBuilding.floors} Floors
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white">{selectedBuilding.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5">{selectedBuilding.description}</p>
              </div>

              <button
                onClick={() => setSelectedBuilding(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Instantaneous Demand</span>
                <span className="text-base font-bold text-cyan-400">{selectedBuilding.currentFlowLpm} L/min</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Daily Baseline</span>
                <span className="text-base font-bold text-slate-200">{selectedBuilding.dailyBaselineLiters.toLocaleString()} L</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Active Leaks</span>
                <span className={`text-base font-bold ${selectedBuilding.activeLeaksCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {selectedBuilding.activeLeaksCount}
                </span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Sensors Linked</span>
                <span className="text-base font-bold text-white">{selectedBuilding.sensors?.length || 0}</span>
              </div>
            </div>

            {/* 14-Day Consumption History Chart */}
            {selectedBuilding.consumptionHistory && selectedBuilding.consumptionHistory.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">14-Day Consumption & Baseline Trend</h4>
                <div className="h-44 w-full bg-slate-950 rounded-xl border border-slate-800 p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedBuilding.consumptionHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '11px' }} />
                      <Area type="monotone" dataKey="actual" name="Actual (L)" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                      <Area type="monotone" dataKey="expected" name="Baseline (L)" stroke="#94a3b8" strokeDasharray="3 3" fillOpacity={0} strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Sensors List inside Building */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">
                Connected Sensors ({selectedBuilding.sensors?.length || 0})
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {selectedBuilding.sensors?.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-bold">{s.code}</span>
                        <span className="text-slate-200">{s.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {s.roomName || 'Room Zone'} &bull; {s.type}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white">{s.currentFlowLpm} L/min</div>
                      <div className="text-[10px] text-slate-400">Base: {s.baselineFlowLpm} L/min</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Close button */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedBuilding(null)}
                className="px-4 py-2 bg-slate-800 text-slate-200 rounded-lg text-xs font-medium hover:bg-slate-700"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
