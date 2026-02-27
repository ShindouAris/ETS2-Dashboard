import { Ets2Truck } from '../types/telemetry';

interface LightIndicatorProps {
  label: string;
  isOn: boolean;
  color?: 'green' | 'yellow' | 'red' | 'blue';
  blink?: boolean;
}

function LightIndicator({ label, isOn, color = 'green', blink }: LightIndicatorProps) {
  const colorClasses = {
    green: isOn ? 'bg-blue-400 border-blue-400 text-black' : 'bg-gray-700 border-gray-600 text-gray-500',
    yellow: isOn ? 'bg-yellow-600 border-yellow-600 text-black' : 'bg-gray-700 border-gray-600 text-gray-500',
    red: isOn ? 'bg-red-600 border-red-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-500',
    blue: isOn ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-700 border-gray-600 text-gray-500'
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded border transition-all duration-300 ${
      colorClasses[color]
    } ${blink && isOn ? 'animate-pulse' : ''}`}>
      <div className={`w-2 h-2 rounded-full ${
        isOn ? (color === 'green' ? 'bg-black' : 'bg-white') : 'bg-gray-500'
      }`} />
      <span className="text-xs font-mono font-bold tracking-wider">
        {label}
      </span>
    </div>
  );
}

interface LightsPanelProps {
  truck: Ets2Truck;
}

export function LightsPanel({ truck }: LightsPanelProps) {
  const dangerWarning = truck.blinkerLeftOn && truck.blinkerRightOn;
  const auxLights = truck.lightsAuxFrontOn || truck.lightsAuxRoofOn;
  const airPressureWarning = truck.airPressureWarningOn || truck.airPressureEmergencyOn;

  return (
    <div className="bg-gray-400 border border-green-300 rounded-xl p-4 space-y-4">
      <h3 className="text-blue-500 font-mono text-sm font-bold tracking-wider">
        LIGHTS & SIGNALS
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        <LightIndicator 
          label="LOW BEAM" 
          isOn={truck.lightsBeamLowOn} 
        />
        <LightIndicator 
          label="HIGH BEAM" 
          isOn={truck.lightsBeamHighOn} 
          color="blue"
        />
        <LightIndicator 
          label="PARKING" 
          isOn={truck.lightsParkingOn} 
          color="yellow"
        />
        <LightIndicator 
          label="BEACON" 
          isOn={truck.lightsBeaconOn} 
          color="red"
          blink={true}
        />
      </div>

      <div className="space-y-2">
        <LightIndicator 
          label="BLINKER LEFT" 
          isOn={truck.blinkerLeftOn} 
          color="yellow"
          blink={true}
        />
        <LightIndicator 
          label="BLINKER RIGHT" 
          isOn={truck.blinkerRightOn} 
          color="yellow" 
          blink={true}
        />
        <LightIndicator 
          label="CRUISE CONTROL" 
          isOn={truck.cruiseControlOn} 
          color="blue"
        />
        <LightIndicator 
          label="PARK BRAKE" 
          isOn={truck.parkBrakeOn} 
          color="red"
        />
      </div>

      {/* Special Warnings */}
      {dangerWarning && (
        <div className="pt-2 border-t border-dashboard-border">
          <LightIndicator 
            label="HAZARD WARNING" 
            isOn={true} 
            color="red"
            blink={true}
          />
        </div>
      )}
      
      {auxLights && (
        <LightIndicator 
          label="AUX LIGHTS" 
          isOn={true} 
          color="blue"
        />
      )}

      {airPressureWarning && (
        <LightIndicator 
          label="AIR PRESSURE" 
          isOn={true} 
          color="red"
          blink={true}
        />
      )}
    </div>
  );
}