import type { BetStatus } from '../types';

const statusConfig: Record<BetStatus, { label: string; className: string }> = {
  pending: { label: 'Pendente', className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  won: { label: 'Ganhou', className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
  lost: { label: 'Perdeu', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  cancelled: { label: 'Cancelada', className: 'bg-slate-500/20 text-slate-400 border border-slate-500/30' },
  cashout: { label: 'Cashout', className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
};

export default function BetStatusBadge({ status }: { status: BetStatus }) {
  const { label, className } = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
