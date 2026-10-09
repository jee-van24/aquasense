import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Sliders,
  Database,
  Radio,
  CheckCircle2,
  Shield,
  Save,
  RefreshCw,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsCritical, setSmsCritical] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);
  const [deviationThreshold, setDeviationThreshold] = useState('35');
  const [persistenceMinutes, setPersistenceMinutes] = useState('20');
  const [overnightStrictness, setOvernightStrictness] = useState('High');
  const [telemetryInterval, setTelemetryInterval] = useState('10');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
          System Configuration & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Adjust automated anomaly thresholds, telemetry streaming parameters, and facility profile settings.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configuration preferences persisted successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* User Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <User className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100">Facility Director Profile</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.name || 'Dr. Evelyn Reed'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Email Address</label>
              <input
                type="text"
                disabled
                value={user?.email || 'admin@aquasense.demo'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Institutional Role</label>
              <input
                type="text"
                disabled
                value={user?.role || 'Environmental Facility Director'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Campus Node</label>
              <input
                type="text"
                disabled
                value="Central Environmental Control & EVS Lab"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Anomaly Detection Thresholds */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              AI/ML Anomaly Calibration & Sensitivity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Deviation Threshold (%)
              </label>
              <input
                type="number"
                value={deviationThreshold}
                onChange={(e) => setDeviationThreshold(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Trigger anomaly if flow exceeds baseline by this %
              </span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Persistence Window (Minutes)
              </label>
              <input
                type="number"
                value={persistenceMinutes}
                onChange={(e) => setPersistenceMinutes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Minimum consecutive anomalous readings duration
              </span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Overnight Strictness (23:00 - 05:00)
              </label>
              <select
                value={overnightStrictness}
                onChange={(e) => setOvernightStrictness(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
              >
                <option value="High">High (Strict near-zero allowance)</option>
                <option value="Moderate">Moderate (Allows minor flow)</option>
                <option value="Permissive">Permissive</option>
              </select>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Sensitivity to nocturnal cistern seepages
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Stream Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Simulated IoT Telemetry Cadence
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Telemetry Generation Frequency
              </label>
              <select
                value={telemetryInterval}
                onChange={(e) => setTelemetryInterval(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-100"
              >
                <option value="5">Every 5 Seconds (Fast Demo Mode)</option>
                <option value="10">Every 10 Seconds (Standard Demo Mode)</option>
                <option value="30">Every 30 Seconds (Relaxed)</option>
                <option value="60">Every 60 Seconds (Production Emulation)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">
                Hardware Ingestion Protocol
              </label>
              <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-300">
                REST POST /api/sensors/reading
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Checkboxes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
            <Bell className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-slate-100">
              Emergency Dispatch & Alert Routing
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded bg-slate-950 border-slate-700"
              />
              <span className="text-slate-300">
                Send real-time email dispatch notifications for <strong>Critical</strong> severity leaks
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={smsCritical}
                onChange={(e) => setSmsCritical(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded bg-slate-950 border-slate-700"
              />
              <span className="text-slate-300">
                SMS broadcast to on-duty campus maintenance technician on burst pipe detection
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="w-4 h-4 text-cyan-600 rounded bg-slate-950 border-slate-700"
              />
              <span className="text-slate-300">
                Generate daily 06:00 AM Environmental Water Conservation executive digest
              </span>
            </label>
          </div>
        </div>

        {/* System Information Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 text-xs text-slate-400">
          <div className="flex items-center gap-2 mb-3 text-slate-200 font-semibold">
            <Database className="w-4 h-4 text-cyan-400" />
            AquaSense System Diagnostics & Academic Credentials
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
            <div>
              <span className="text-slate-500 block">Version:</span>
              <span className="font-mono text-slate-200">v1.0.0 (Release)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Database Engine:</span>
              <span className="font-mono text-slate-200">Prisma (SQLite/PostgreSQL)</span>
            </div>
            <div>
              <span className="text-slate-500 block">Anomaly Engine:</span>
              <span className="font-mono text-cyan-400">Multi-Signal Z-Score + Persistence</span>
            </div>
            <div>
              <span className="text-slate-500 block">Physical IoT:</span>
              <span className="font-mono text-amber-400">Simulated (Academic Prototype)</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-semibold text-xs rounded-lg shadow-md flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" />
            Save Configuration Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
