import React from 'react';

interface Props {
  severity: string;
}

export const SeverityBadge: React.FC<Props> = ({ severity }) => {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  const s = (severity || '').toLowerCase();
  if (s === 'critical') {
    style = 'bg-red-500/20 text-red-400 border-red-500/40 font-semibold';
  } else if (s === 'high') {
    style = 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-medium';
  } else if (s === 'medium') {
    style = 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium';
  } else if (s === 'low') {
    style = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${style}`}>
      {severity}
    </span>
  );
};
