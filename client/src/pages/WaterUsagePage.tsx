import React, { useState, useEffect } from 'react';
import { waterUsageService } from '../services/waterUsageService';
import { WaterUsageAnalytics } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  BarChart3,
  Calendar,
  Droplets,
  TrendingUp,
  TrendingDown,
  Clock,
  Building2,
  Percent,
  CheckCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const WaterUsagePage: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [data, setData] = useState<WaterUsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (p: '7d' | '30d' | '90d') => {
    setLoading(true);
    try {
      const res = await waterUsageService.getAnalytics(p);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period]);

  if (loading && !data) {
    return <LoadingSpinner message="Calculating time-series consumption integrals..." />;
  }

  const { metrics, dailyTrends, buildingBreakdown, hourlyProfile } = data!;

  return (
    <div className="space-y-6">
      {/* Header & Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Water Consumption & Efficiency Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Campus-wide historical flow auditing, diurnal profiling, and excess consumption diagnostics.
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-sm self-start sm:self-auto">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                period === p
                  ? 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p === '7d' ? 'Last 7 Days' : p === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Total Consumption</div>
          <div className="text-lg font-bold text-white">
            {metrics.totalConsumption.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">L</span>
          </div>
          <span className="text-[11px] text-slate-400">{period} period total</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Daily Average</div>
          <div className="text-lg font-bold text-cyan-400">
            {metrics.averageDailyConsumption.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">L/d</span>
          </div>
          <span className="text-[11px] text-slate-400">Campus benchmark</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Peak Daily Flow</div>
          <div className="text-lg font-bold text-amber-400">
            {metrics.peakUsage.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">L</span>
          </div>
          <span className="text-[11px] text-slate-400">Maximum recorded</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Expected Baseline</div>
          <div className="text-lg font-bold text-slate-300">
            {metrics.expectedConsumption.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">L</span>
          </div>
          <span className="text-[11px] text-slate-400">Model projection</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Excess Wastage</div>
          <div className="text-lg font-bold text-rose-400">
            {metrics.excessConsumption.toLocaleString()}{' '}
            <span className="text-xs font-normal text-slate-400">L</span>
          </div>
          <span className="text-[11px] text-rose-400">Unaccounted flow</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Efficiency Index</div>
          <div className="text-lg font-bold text-emerald-400">
            {metrics.efficiencyScore}%
          </div>
          <span className="text-[11px] text-emerald-400">Campus rating: A-</span>
        </div>
      </div>

      {/* Main Trends: Daily Consumption & Expected Comparison */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Daily Water Consumption vs Historical Baseline
            </h2>
            <p className="text-xs text-slate-400">
              Green fill represents verified conserved volume; cyan indicates actual measured telemetry
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="usageActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="usageSaved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="actual" name="Actual Consumption (L)" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#usageActual)" />
              <Area type="monotone" dataKey="expected" name="Baseline Target (L)" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} fillOpacity={0} />
              <Area type="monotone" dataKey="saved" name="Water Conserved (L)" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#usageSaved)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: 24-Hour Diurnal Profile & Building Variance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hourly Diurnal Curve */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              24-Hour Diurnal Demand Profile
            </h2>
            <p className="text-xs text-slate-400">
              Reveals overnight leak continuous baseline vs standard diurnal demand peaks
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyProfile} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" tick={{ fontSize: 10 }} interval={2} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="actual" name="Observed Demand (L/h)" stroke="#06b6d4" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="expected" name="Normal Expected (L/h)" stroke="#64748b" strokeDasharray="3 3" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="excess" name="Excess Leak Delta (L/h)" stroke="#ef4444" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Building Variance Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-purple-400" />
                Facility Consumption Comparison
              </h2>
              <p className="text-xs text-slate-400">
                Audited total consumption across monitored campus structures
              </p>
            </div>

            <div className="space-y-3">
              {buildingBreakdown.map((b) => (
                <div key={b.code} className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-slate-200">{b.name}</span>
                    <span className="font-mono text-xs font-bold text-white">
                      {b.consumption.toLocaleString()} L
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 my-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.variancePercent > 10 ? 'bg-rose-500' : b.variancePercent > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (b.consumption / (b.expected * 1.3 || 1)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Baseline target: {b.expected.toLocaleString()} L</span>
                    <span className={b.variancePercent > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {b.variancePercent > 0 ? `+${b.variancePercent}% variance` : `${b.variancePercent}% variance`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/30 text-xs text-slate-300 flex items-start gap-2">
            <Droplets className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              <strong>EVS Conservation Insight:</strong> Normalization models demonstrate that early night leak isolation in student residence halls generates the highest marginal water conservation yield per technician hour.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
