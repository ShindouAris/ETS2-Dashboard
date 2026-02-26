import { Ets2Job, Ets2Trailer } from '../types/telemetry';

interface JobInfoProps {
  job: Ets2Job;
  trailer: Ets2Trailer;
}

export function JobInfo({ job, trailer }: JobInfoProps) {
  const hasJob = trailer.attached && job.sourceCity;

  if (!hasJob) {
    return (
      <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4">
        <h3 className="text-dashboard-accent font-mono text-sm font-bold tracking-wider mb-3">
          JOB STATUS
        </h3>
        <div className="text-center py-8 text-gray-500 font-mono">
          NO ACTIVE JOB
        </div>
      </div>
    );
  }

  const trailerMassInTons = (trailer.mass / 1000).toFixed(1);

  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4 space-y-3">
      <h3 className="text-dashboard-accent font-mono text-sm font-bold tracking-wider">
        JOB STATUS
      </h3>
      
      <div className="space-y-2 text-sm font-mono">
        <div className="flex justify-between">
          <span className="text-gray-400">FROM:</span>
          <span className="text-white text-right">
            {job.sourceCity}
            {job.sourceCompany && (
              <div className="text-xs text-gray-400">({job.sourceCompany})</div>
            )}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-400">TO:</span>
          <span className="text-white text-right">
            {job.destinationCity}
            {job.destinationCompany && (
              <div className="text-xs text-gray-400">({job.destinationCompany})</div>
            )}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">CARGO:</span>
          <span className="text-white text-right">
            {trailer.name}
            <div className="text-xs text-dashboard-accent">{trailerMassInTons}t</div>
          </span>
        </div>

        {job.remainingTime && (
          <div className="flex justify-between">
            <span className="text-gray-400">DEADLINE:</span>
            <span className="text-dashboard-warning">{job.remainingTime}</span>
          </div>
        )}

        {job.income > 0 && (
          <div className="flex justify-between pt-2 border-t border-dashboard-border">
            <span className="text-gray-400">INCOME:</span>
            <span className="text-dashboard-accent font-bold">€{job.income.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}