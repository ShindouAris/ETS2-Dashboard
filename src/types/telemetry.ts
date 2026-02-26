// Types based on dashboard-core.js structure

export interface Ets2Vector {
  x: number;
  y: number;
  z: number;
}

export interface Ets2Placement {
  x: number;
  y: number;
  z: number;
  heading: number;
  pitch: number;
  roll: number;
}

export interface Ets2Game {
  connected: boolean;
  paused: boolean;
  time: string;
  timeScale: number;
  nextRestStopTime: string;
  version: string;
  telemetryPluginVersion: string;
}

export interface Ets2Job {
  income: number;
  deadlineTime: string;
  remainingTime: string;
  sourceCity: string;
  sourceCompany: string;
  destinationCity: string;
  destinationCompany: string;
}

export interface Ets2Truck {
  id: string;
  make: string;
  model: string;
  speed: number;
  cruiseControlSpeed: number;
  cruiseControlOn: boolean;
  odometer: number;
  gear: number;
  displayedGear: number;
  forwardGears: number;
  reverseGears: number;
  shifterType: string;
  engineRpm: number;
  engineRpmMax: number;
  fuel: number;
  fuelCapacity: number;
  fuelAverageConsumption: number;
  fuelWarningOn: boolean;
  fuelWarningFactor: number;
  wearEngine: number;
  wearTransmission: number;
  wearCabin: number;
  wearChassis: number;
  wearWheels: number;
  userSteer: number;
  userThrottle: number;
  userBrake: number;
  userClutch: number;
  gameSteer: number;
  gameThrottle: number;
  gameBrake: number;
  gameClutch: number;
  shifterSlot: number;
  shifterToggle: number;
  engineOn: boolean;
  electricOn: boolean;
  wipersOn: boolean;
  retarderBrake: number;
  retarderStepCount: number;
  parkBrakeOn: boolean;
  motorBrakeOn: boolean;
  brakeTemperature: number;
  adblue: number;
  adblueCapacity: number;
  adblueAverageConsumpton: number;
  adblueWarningOn: boolean;
  airPressure: number;
  airPressureWarningOn: boolean;
  airPressureWarningValue: number;
  airPressureEmergencyOn: boolean;
  airPressureEmergencyValue: number;
  oilTemperature: number;
  oilPressure: number;
  oilPressureWarningOn: boolean;
  oilPressureWarningValue: number;
  waterTemperature: number;
  waterTemperatureWarningOn: boolean;
  waterTemperatureWarningValue: number;
  batteryVoltage: number;
  batteryVoltageWarningOn: boolean;
  batteryVoltageWarningValue: number;
  lightsDashboardValue: number;
  lightsDashboardOn: boolean;
  blinkerLeftActive: boolean;
  blinkerRightActive: boolean;
  blinkerLeftOn: boolean;
  blinkerRightOn: boolean;
  lightsParkingOn: boolean;
  lightsBeamLowOn: boolean;
  lightsBeamHighOn: boolean;
  lightsAuxFrontOn: boolean;
  lightsAuxRoofOn: boolean;
  lightsBeaconOn: boolean;
  lightsBrakeOn: boolean;
  lightsReverseOn: boolean;
  placement: Ets2Placement;
  acceleration: Ets2Vector;
  head: Ets2Vector;
  cabin: Ets2Vector;
  hook: Ets2Vector;
}

export interface Ets2Trailer {
  attached: boolean;
  id: string;
  name: string;
  mass: number;
  wear: number;
  placement: Ets2Placement;
}

export interface Ets2Navigation {
  estimatedTime: string;
  estimatedDistance: number;
  speedLimit: number;
}

export interface Ets2TelemetryData {
  game: Ets2Game;
  truck: Ets2Truck;
  trailer: Ets2Trailer;
  job: Ets2Job;
  navigation: Ets2Navigation;
}