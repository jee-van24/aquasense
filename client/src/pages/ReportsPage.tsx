import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { ReportsSummary } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  FileText,
  Download,
  Droplets,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Building2,
  Leaf,
  Zap,
  Shield,
  Award,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [data, setData] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchReports = async () => {
    try {
      const res = await reportService.getSummary();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDownloadCsv = async () => {
    setIsExporting(true);
    try {
      await reportService.downloadCsv();
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading && !data) {
    return <LoadingSpinner message="Synthesizing campus environmental conservation audit..." />;
  }

  const { summary, buildingRankings, auditPeriod, keyFindings } = data!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            Environmental Water Audit & Efficiency Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Academic Environmental Studies (EVS) resource accounting and building benchmarking report.
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          disabled={isExporting}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white rounded-lg text-xs font-semibold shadow-md flex items-center gap-2 self-start sm:self-auto transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Generating CSV...' : 'Export Audit CSV'}
        </button>
      </div>

      {/* Top Audit KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Audited Consumption</div>
          <div className="text-lg font-bold text-white">
            {summary.totalWaterConsumptionLiters.toLocaleString()} <span className="text-xs font-normal text-slate-400">L</span>
          </div>
          <span className="text-[11px] text-slate-500">Total metered flow</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Estimated Wastage</div>
          <div className="text-lg font-bold text-rose-400">
            {summary.totalEstimatedWastageLiters.toLocaleString()} <span className="text-xs font-normal text-slate-400">L</span>
          </div>
          <span className="text-[11px] text-slate-500">Uncontrolled losses</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Total Water Saved</div>
          <div className="text-lg font-bold text-emerald-400">
            {summary.totalWaterSavedLiters.toLocaleString()} <span className="text-xs font-normal text-slate-400">L</span>
          </div>
          <span className="text-[11px] text-slate-500">Via early intervention</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Resolved Incidents</div>
          <div className="text-lg font-bold text-cyan-400">
            {summary.resolvedLeaksCount} <span className="text-xs font-normal text-slate-400">/ {summary.totalLeaksDetected}</span>
          </div>
          <span className="text-[11px] text-slate-500">Maintenance closed</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Avoided Energy</div>
          <div className="text-lg font-bold text-sky-400">
            {summary.avoidedPumpingKwh} <span className="text-xs font-normal text-slate-400">kWh</span>
          </div>
          <span className="text-[11px] text-slate-500">Treatment & booster pump</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Campus Efficiency</div>
          <div className="text-lg font-bold text-purple-400">
            {summary.campusEfficiencyIndex}%
          </div>
          <span className="text-[11px] text-slate-500">Benchmark grade A</span>
        </div>
      </div>

      {/* Building Efficiency Ranking */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Campus Facility Efficiency Leaderboard
            </h2>
            <p className="text-xs text-slate-400">
              Ranked by ratio of adherence to historical design baselines and containment of excess flows
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Facility Name</th>
                <th className="py-3 px-4">Efficiency Score</th>
                <th className="py-3 px-4">Total Consumption</th>
                <th className="py-3 px-4">Estimated Wastage</th>
                <th className="py-3 px-4">Water Conserved</th>
                <th className="py-3 px-4">Leak Containment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {buildingRankings.map((b, index) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                    #{index + 1}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-200">{b.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{b.code}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-400 text-sm">
                        {b.efficiencyScore}%
                      </span>
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${b.efficiencyScore}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-slate-300">
                    {b.totalConsumptionLiters.toLocaleString()} L
                  </td>

                  <td className="py-3.5 px-4 font-medium text-rose-400">
                    {b.totalWastageLiters.toLocaleString()} L
                  </td>

                  <td className="py-3.5 px-4 font-medium text-cyan-400">
                    {b.totalSavedLiters.toLocaleString()} L
                  </td>

                  <td className="py-3.5 px-4 text-slate-400">
                    <span>{b.resolvedLeaks} resolved</span>
                    {b.activeLeaks > 0 && (
                      <span className="text-amber-400 ml-1 font-semibold">
                        ({b.activeLeaks} active)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Findings & EVS Methodology Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Findings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Key Environmental Findings & Audit Notes
            </h3>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300">
            {keyFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* EVS Calculation Rationale */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-slate-100">
              Academic EVS Accounting Methodology
            </h3>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="font-semibold text-cyan-300 block mb-1">Water Wastage Integral:</span>
              <p className="text-slate-400 font-mono text-[11px]">
                Wastage (Liters) = ∫ [Q_observed(t) - Q_baseline(t)] dt over incident duration.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="font-semibold text-sky-300 block mb-1">Energy Equivalency Factor:</span>
              <p className="text-slate-400 text-[11px]">
                Each 1,000 Liters of municipal tap water saved avoids an estimated 1.4 kWh of raw water abstraction, aeration treatment, and booster pumping power.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="font-semibold text-purple-300 block mb-1">Carbon Mitigation Rationale:</span>
              <p className="text-slate-400 text-[11px]">
                Carbon emissions averted = Avoided Pumping kWh × 0.82 kg CO₂e/kWh based on regional electrical grid generation intensity factor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
