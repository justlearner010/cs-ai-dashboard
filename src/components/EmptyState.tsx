import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="glass-subtle p-4 rounded-full mb-4">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <button onClick={action.onClick} className="btn btn--solid px-4">
          {action.label}
        </button>
      )}
    </div>
  );
}
