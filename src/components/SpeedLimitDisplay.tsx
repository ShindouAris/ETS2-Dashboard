import { Ets2Navigation, Ets2Truck } from '../types/telemetry';

interface SpeedLimitDisplayProps {
  navigation: Ets2Navigation;
  truck: Ets2Truck;
}

export function SpeedLimitDisplay({ navigation, truck }: SpeedLimitDisplayProps) {
  const currentSpeed = Math.round(truck.speed);
  const speedLimit = navigation.speedLimit;
  const isOverSpeed = speedLimit > 0 && currentSpeed > speedLimit;
  
  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-6 space-y-4">
      <h2 className="text-dashboard-accent font-mono text-lg font-bold tracking-wider text-center">
        SPEED MONITOR
      </h2>
      
      <div className="flex items-center justify-center gap-8">
        {/* Speed Limit Sign */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-30 h-30 rounded-full border-12 border-red-500 bg-white flex items-center justify-center shadow-lg">
            {speedLimit > 0 ? (
              <span className="text-3xl font-black text-black leading-none font-BebasNeue_Regular">
          {speedLimit}
              </span>
            ) : (
              <span className="text-xl font-black text-gray-400 leading-none">
          --
              </span>
            )}
          </div>
        </div>

        {/* Current Speed */}
        <div className="flex flex-col items-center gap-2">
          <div className={`w-30 h-30 rounded-full border-6 flex flex-col items-center justify-center transition-all duration-300 ${
            isOverSpeed
              ? ' border-red-600'
              : ' border-violet-900'
          }`}>
            <span className={`text-4xl font-black leading-none font-BebasNeue_Regular ${
              isOverSpeed ? 'text-slate-200' : 'text-slate-200'
            }`}>
              {currentSpeed}
            </span>
            <span className={`text-xs tracking-widest mt-1 ${
              isOverSpeed ? 'text-slate-400' : 'text-slate-400'
            }`}>
              km/h
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}