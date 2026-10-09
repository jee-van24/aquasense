import React from 'react';

interface Props {
  level: string;
  size?: 'sm' | 'md';
}

export const RiskBadge: React.FC<Props> = ({ level, size = 'md' }) => {
  let style = 'bg-slate-800 text-slate-300 border-slate-700';

  const l = (level || '').toLowerCase();
  if (l.includes('high') || l.includes('critical')) {
    style = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  } else if (l.includes('medium')) {
    style = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  } else if (l.includes('low')) {
    style = 'bg-sky-500/15 text-sky-400 border-sky-500/30';
  } else if (l.includes('normal')) {
    style = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${px} ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse" />
      {level || 'Normal'}
    </span>
  );
};
