import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/dashboardService';
import { DashboardData } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { RiskBadge } from '../components/common/RiskBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import {
  Droplets,
  ShieldAlert,
  Activity,
  Cpu,
  Building2,
  TrendingDown,
  Sparkles,
  Leaf,
  AlertTriangle,
  ArrowUpRight,
  ExternalLink,
  Zap,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      const res = await dashboardService.getDashboardData();
      setData(res);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Unable to connect to AquaSense backend API. Ensure server is active on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000); // 10-second poll for simulated telemetry updates
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return <LoadingSpinner message="Aggregating campus sensor telemetry and ML anomaly scores..." />;
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center bg-rose-500/10 border border-rose-500/30 rounded-xl max-w-xl mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-rose-300">Backend Connection Error</h3>
        <p className="text-sm text-slate-300 mt-2">{error}</p>
        <button
          onClick={() => { setLoading(true); fetchDashboard(); }}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-medium"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const { metrics, charts, activeLeaks, activeAlerts, aiInsights, environmentalImpact } = data!;

  return (
    <div className="space-y-6">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Campus Water Intelligence Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time algorithmic leak surveillance and environmental conservation telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Surveillance
          </span>
          <span className="text-xs text-slate-400 font-mono">
            {metrics.sensorsOnline}/{metrics.totalSensors} Sensors Active
          </span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Today's Consumption */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Today's Usage</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {metrics.todayConsumptionLiters.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">L</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 3 buildings</p>
        </div>

        {/* Water Saved */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Water Saved</span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-400 tracking-tight">
            {metrics.waterSavedTodayLiters.toLocaleString()}
            <span className="text-xs font-normal text-slate-400 ml-1">L</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Early leak aversion</p>
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Alerts</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-400 tracking-tight">
            {metrics.activeAlertsCount}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics.activeAlertsCount > 0 ? 'Requires inspection' : 'Normal parameters'}
          </p>
        </div>

        {/* Overall Leak Risk */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Overall Risk</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 tracking-tight">
            {metrics.overallLeakRiskScore}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics.overallLeakRiskScore > 75 ? 'Critical anomaly' : 'Moderate drift'}
          </p>
        </div>

        {/* Sensors Online */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Sensors Online</span>
            <Cpu className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {metrics.sensorsOnline}
            <span className="text-xs font-normal text-slate-400 ml-1">/ {metrics.totalSensors}</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">92% network uptime</p>
        </div>

        {/* Buildings Monitored */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Monitored</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white tracking-tight">
            {metrics.buildingsMonitored}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">11 campus zones</p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart: Consumption vs Baseline Over Time */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Water Consumption vs Expected Baseline (Last 7 Days)
              </h2>
              <p className="text-xs text-slate-400">
                Algorithmic baseline comparison in Liters/Day across all campus facilities
              </p>
            </div>
            <Link to="/water-usage" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Deep Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.consumptionHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expectedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="actual" name="Actual Flow (L)" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#actualGrad)" />
                <Area type="monotone" dataKey="expected" name="Historical Baseline (L)" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} fillOpacity={1} fill="url(#expectedGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Water Usage by Building */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Facility Breakdown</h2>
              <p className="text-xs text-slate-400">Current instantaneous flow (L/min)</p>
            </div>
            <Link to="/buildings" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              Buildings <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.usageByBuilding} layout="vertical" margin={{ top: 10, right: 15, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="code" stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Bar dataKey="currentFlowLpm" name="Flow Rate (L/min)" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ACTIVE LEAK ALERTS SECTION */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Active Leak Incidents ({activeLeaks.length})
              </h2>
              <p className="text-xs text-slate-400">
                Anomalies detected through continuous rolling standard deviation & persistence heuristics
              </p>
            </div>
          </div>

          <Link
            to="/leaks"
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Manage All Leaks <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {activeLeaks.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No active leaks detected. All campus zones operating within normal baseline bounds.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeLeaks.map((leak) => (
              <div
                key={leak.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-cyan-800/80">
                      {leak.sensorCode}
                    </span>
                    <SeverityBadge severity={leak.severity} />
                  </div>

                  <h3 className="text-sm font-semibold text-slate-200 line-clamp-1">
                    {leak.sensorName}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{leak.buildingName} &bull; {leak.roomName}</span>
                  </div>

                  {/* Flow Metrics Pill */}
                  <div className="my-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/90 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Observed Flow:</span>
                      <span className="font-bold text-rose-400">{leak.currentFlowRate} L/min</span>
                      <span className="text-[10px] text-slate-400 ml-1">({leak.baselineFlowRate} base)</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Loss Rate:</span>
                      <span className="font-bold text-amber-400">{leak.lossRateLph} L/h</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Leak Probability:</span>
                      <span className="font-bold text-rose-400">{leak.probability}%</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Est. Wasted:</span>
                      <span className="font-bold text-cyan-400">~{leak.estimatedLossLiters} L</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 italic mb-2">
                    "{leak.aiExplanation}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Started ~{leak.durationMinutes || 45}m ago</span>
                  </div>
                  <Link
                    to={`/leaks`}
                    className="text-cyan-400 hover:text-cyan-300 font-medium text-xs flex items-center gap-1"
                  >
                    Diagnose <ArrowUpRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI INSIGHTS & ENVIRONMENTAL IMPACT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-100">
                Algorithmic Anomaly Insights
              </h2>
              <p className="text-xs text-slate-400">
                Automated inference generated from multi-signal telemetry patterns
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-cyan-300">{insight.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                    Confidence: {insight.confidence}%
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">{insight.description}</p>
                {insight.buildingName && (
                  <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>{insight.buildingName}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Environmental Studies Conservation Impact */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-100">
                  EVS Environmental Impact & Conservation
                </h2>
                <p className="text-xs text-slate-400">
                  Measurable resource preservation metrics from early automated leak containment
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-800/30">
                <span className="text-[11px] text-emerald-300/80 font-medium block">
                  Cumulative Water Conserved
                </span>
                <span className="text-2xl font-bold text-emerald-400">
                  {environmentalImpact.totalWaterSavedLiters.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 ml-1">Liters</span>
                <p className="text-[10px] text-slate-400 mt-1">Potable water saved from runoff</p>
              </div>

              <div className="p-3.5 rounded-lg bg-sky-950/30 border border-sky-800/30">
                <span className="text-[11px] text-sky-300/80 font-medium block">
                  Pumping Energy Averted
                </span>
                <span className="text-2xl font-bold text-sky-400">
                  {environmentalImpact.pumpingEnergySavedKwh}
                </span>
                <span className="text-xs text-slate-400 ml-1">kWh</span>
                <p className="text-[10px] text-slate-400 mt-1">Avoided municipal booster power</p>
              </div>

              <div className="p-3.5 rounded-lg bg-purple-950/30 border border-purple-800/30">
                <span className="text-[11px] text-purple-300/80 font-medium block">
                  Avoided CO2 Equivalent
                </span>
                <span className="text-2xl font-bold text-purple-400">
                  {environmentalImpact.avoidedCarbonKg}
                </span>
                <span className="text-xs text-slate-400 ml-1">kg CO₂e</span>
                <p className="text-[10px] text-slate-400 mt-1">Based on 0.82 kg/kWh grid factor</p>
              </div>

              <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/30">
                <span className="text-[11px] text-amber-300/80 font-medium block">
                  Structural Leaks Prevented
                </span>
                <span className="text-2xl font-bold text-amber-400">
                  {environmentalImpact.leaksPreventedCount}
                </span>
                <span className="text-xs text-slate-400 ml-1">Incidents</span>
                <p className="text-[10px] text-slate-400 mt-1">Avoided prolonged structural damage</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-lg border border-slate-800 leading-relaxed">
              {environmentalImpact.description} Continuous real-time anomaly surveillance mitigates silent flapper seepage, open laboratory faucets, and pipe fissuring before catastrophic failure occurs.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Audit Methodology: ISO 14046 Water Footprint standard</span>
            <Link to="/reports" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View Academic Report <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
