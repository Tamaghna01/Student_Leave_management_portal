/**
 * StatCard - A metric display card for dashboards
 */
const StatCard = ({ title, value, icon, color = 'blue', subtitle, loading = false }) => {
  const colorMap = {
    blue: {
      bg:      'bg-primary-50',
      icon:    'text-primary-600 bg-primary-100',
      value:   'text-primary-700',
      border:  'border-primary-100',
    },
    amber: {
      bg:      'bg-amber-50',
      icon:    'text-amber-600 bg-amber-100',
      value:   'text-amber-700',
      border:  'border-amber-100',
    },
    emerald: {
      bg:      'bg-emerald-50',
      icon:    'text-emerald-600 bg-emerald-100',
      value:   'text-emerald-700',
      border:  'border-emerald-100',
    },
    red: {
      bg:      'bg-red-50',
      icon:    'text-red-600 bg-red-100',
      value:   'text-red-700',
      border:  'border-red-100',
    },
    slate: {
      bg:      'bg-slate-50',
      icon:    'text-slate-600 bg-slate-100',
      value:   'text-slate-700',
      border:  'border-slate-100',
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-xl border ${c.border} shadow-card p-5 animate-scale-in hover:shadow-card-hover transition-all duration-200`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-slate-100 rounded animate-pulse" />
      ) : (
        <p className={`text-3xl font-bold ${c.value}`}>{value ?? 0}</p>
      )}
      {subtitle && !loading && (
        <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default StatCard;
