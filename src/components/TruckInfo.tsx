import { Ets2Truck } from '../types/telemetry';

interface TruckInfoProps {
  truck: Ets2Truck;
}

export function TruckInfo({ truck }: TruckInfoProps) {
  const gearDisplay = truck.displayedGear > 0 
    ? truck.displayedGear 
    : truck.displayedGear < 0 
      ? `R${Math.abs(truck.displayedGear)}` 
      : 'N';

  const rpmPercentage = (truck.engineRpm / truck.engineRpmMax) * 100;
  const speedKmh = Math.round(truck.speed);
  const fuelPercentage = (truck.fuel / truck.fuelCapacity) * 100;

  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6 space-y-4">
      <h2 className="text-dashboard-accent font-mono text-lg font-bold tracking-wider">
        TRUCK STATUS
      </h2>
      
      {/* Speed & RPM */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-white">
            {speedKmh}
          </div>
          <div className="text-xs text-gray-400 tracking-widest">KM/H</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-mono font-bold text-dashboard-info">
            {Math.round(truck.engineRpm)}
          </div>
          <div className="text-xs text-gray-400 tracking-widest">RPM</div>
        </div>
      </div>

      {/* Gear Display */}
      <div className="text-center">
        <div className={`inline-block w-16 h-16 rounded-lg border-2 flex items-center justify-center text-2xl font-mono font-black ${
          truck.displayedGear === 0 
            ? 'border-gray-500 text-gray-400' 
            : 'border-dashboard-accent text-dashboard-accent'
        }`}>
          {gearDisplay}
        </div>
        <div className="text-xs text-gray-400 mt-2 tracking-widest">GEAR</div>
      </div>

      {/* RPM Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-gray-300">
          <span>ENGINE RPM</span>
          <span>{Math.round(truck.engineRpm)} / {truck.engineRpmMax}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              rpmPercentage > 80 ? 'bg-dashboard-danger' : 
              rpmPercentage > 60 ? 'bg-dashboard-warning' : 'bg-dashboard-info'
            }`}
            style={{ width: `${rpmPercentage}%` }}
          />
        </div>
      </div>

      {/* Fuel Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-gray-300">
          <span>FUEL</span>
          <span>{Math.round(truck.fuel)}L / {Math.round(truck.fuelCapacity)}L</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              fuelPercentage < 20 ? 'bg-dashboard-danger animate-pulse' : 
              fuelPercentage < 40 ? 'bg-dashboard-warning' : 'bg-dashboard-accent'
            }`}
            style={{ width: `${fuelPercentage}%` }}
          />
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="text-xs font-mono text-gray-400 text-center pt-2 border-t border-dashboard-border">
        {truck.make} {truck.model}
      </div>
    </div>
  );
}