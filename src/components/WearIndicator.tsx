import { Ets2Truck, Ets2Trailer } from '../types/telemetry';

interface WearIndicatorProps {
  truck: Ets2Truck;
  trailer: Ets2Trailer;
}

interface WearItemProps {
  label: string;
  value: number;
  warning?: boolean;
}

function WearItem({ label, value, warning }: WearItemProps) {
  const percentage = value * 100;
  const isHigh = percentage > 75;
  const isCritical = percentage > 90;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono">
        <span className="text-gray-300">{label}</span>
        <span className={`${
          isCritical ? 'text-red-500 animate-pulse' : 
          isHigh ? 'text-yellow-300' : 'text-gray-300'
        }`}>
          {percentage.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isCritical ? 'bg-red-600 animate-pulse' : 
            isHigh ? 'bg-yellow-600' : 'bg-green-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function WearIndicator({ truck, trailer }: WearIndicatorProps) {
  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4 space-y-4">
      <h3 className="text-dashboard-accent font-mono text-sm font-bold tracking-wider">
        WEAR STATUS
      </h3>
      
      <div className="space-y-3">
        <WearItem label="ENGINE" value={truck.wearEngine} />
        <WearItem label="TRANSMISSION" value={truck.wearTransmission} />
        <WearItem label="CABIN" value={truck.wearCabin} />
        <WearItem label="CHASSIS" value={truck.wearChassis} />
        <WearItem label="WHEELS" value={truck.wearWheels} />
        
        {trailer.attached && (
          <div className="pt-2 border-t border-dashboard-border">
            <WearItem label="TRAILER" value={trailer.wear} />
          </div>
        )}
      </div>
    </div>
  );
}