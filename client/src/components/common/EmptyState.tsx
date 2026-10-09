import React from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({
  title,
  description,
  icon = <AlertCircle className="w-10 h-10 text-slate-500" />,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center rounded-xl border border-slate-800 bg-slate-900/50">
      <div className="mb-3">{icon}</div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mt-1">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
