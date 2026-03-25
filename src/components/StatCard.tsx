import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  accent?: 'red' | 'green' | 'blue' | 'purple' | 'yellow';
  trend?: { value: number; label: string };
}

const accentMap = {
  red: { bg: 'bg-red-600/15', icon: 'text-red-400', border: 'border-red-600/20' },
  green: { bg: 'bg-green-600/15', icon: 'text-green-400', border: 'border-green-600/20' },
  blue: { bg: 'bg-blue-600/15', icon: 'text-blue-400', border: 'border-blue-600/20' },
  purple: { bg: 'bg-purple-600/15', icon: 'text-purple-400', border: 'border-purple-600/20' },
  yellow: { bg: 'bg-yellow-600/15', icon: 'text-yellow-400', border: 'border-yellow-600/20' },
};

export default function StatCard({ icon: Icon, label, value, sub, accent = 'red', trend }: Props) {
  const style = accentMap[accent];
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${style.bg} ${style.border} border flex items-center justify-center`}>
          <Icon size={18} className={style.icon} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            <span>{trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}
