import { Ets2Truck } from '../types/telemetry';

interface InputBarProps {
  label: string;
  userValue: number;
  gameValue: number;
  color?: 'blue' | 'red' | 'green';
}

function InputBar({ label, userValue, gameValue, color = 'blue' }: InputBarProps) {
  const userPercentage = userValue * 100;
  const gamePercentage = gameValue * 100;
  
  const colorClasses = {
    blue: 'bg-blue-500',
    red: 'bg-red-500', 
    green: 'bg-green-500'
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-mono text-gray-300">
        <span>{label}</span>
        <span>U:{userPercentage.toFixed(0)}% G:{gamePercentage.toFixed(0)}%</span>
      </div>
      
      {/* User Input Bar */}
      <div className="relative">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-100 ${colorClasses[color]} opacity-70`}
            style={{ width: `${userPercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">USER</div>
      </div>
      
      {/* Game Input Bar */}
      <div className="relative">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-100 ${colorClasses[color]}`}
            style={{ width: `${gamePercentage}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 mt-1">GAME</div>
      </div>
    </div>
  );
}

interface InputBarsProps {
  truck: Ets2Truck;
}

export function InputBars({ truck }: InputBarsProps) {
  return (
    <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-4 space-y-4">
      <h3 className="text-dashboard-accent font-mono text-sm font-bold tracking-wider">
        INPUT CONTROL
      </h3>
      
      <div className="space-y-4">
        <InputBar 
          label="THROTTLE"
          userValue={truck.userThrottle}
          gameValue={truck.gameThrottle}
          color="green"
        />
        
        <InputBar 
          label="BRAKE"
          userValue={truck.userBrake}
          gameValue={truck.gameBrake}
          color="red"
        />
        
        <InputBar 
          label="CLUTCH"
          userValue={truck.userClutch}
          gameValue={truck.gameClutch}
          color="blue"
        />
      </div>
      
      {/* Additional Controls */}
      <div className="pt-3 border-t border-dashboard-border space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-gray-400">STEERING:</span>
          <span className="text-white">{(truck.userSteer * 100).toFixed(0)}%</span>
        </div>
        
        {truck.retarderBrake > 0 && (
          <div className="flex justify-between text-xs font-mono">
            <span className="text-gray-400">RETARDER:</span>
            <span className="text-red-600">{truck.retarderBrake}/{truck.retarderStepCount}</span>
          </div>
        )}
      </div>
    </div>
  );
}