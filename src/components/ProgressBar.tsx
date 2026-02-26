interface ProgressBarProps {
  value: number;
  max?: number;
  label: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  unit?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  label, 
  color = 'blue', 
  unit = '', 
  showPercentage = false 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-dashboard-accent',
    yellow: 'bg-dashboard-warning',
    red: 'bg-dashboard-danger'
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono text-gray-300">
        <span>{label}</span>
        <span>
          {showPercentage ? `${percentage.toFixed(1)}%` : `${value}${unit}`}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}