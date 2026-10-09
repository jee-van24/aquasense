import React, { useState } from 'react';
import { Info, X, Radio, ArrowRight } from 'lucide-react';

export const SimulatedBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-sky-950/60 border-b border-sky-800/60 px-4 py-2.5 text-xs text-sky-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-cyan-300 uppercase tracking-wider text-[11px] bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/80">
              Simulated IoT Telemetry
            </span>
            <span>
              This Environmental Studies prototype is powered by continuous simulated IoT sensor streaming.
              Physical flow-meter hardware can be integrated into the existing <code className="text-cyan-300 font-mono">/api/sensors</code> REST ingestion pipeline without architectural modification.
            </span>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-sky-400 hover:text-sky-200 transition p-1 hover:bg-sky-900/50 rounded"
          title="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
