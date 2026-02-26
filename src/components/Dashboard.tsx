import { useHybridTelemetry } from '../hooks/useHybridTelemetry';
import { TruckInfo } from '../components/TruckInfo';
import { WearIndicator } from '../components/WearIndicator';
import { LightsPanel } from '../components/LightsPanel';
import { JobInfo } from '../components/JobInfo';
import { InputBars } from '../components/InputBars';
import { SpeedLimitDisplay } from '../components/SpeedLimitDisplay';

export function Dashboard() {
  const { 
    data, 
    connected, 
    error, 
    connectionMessage, 
    connectionType,
    reconnect,
    switchToPolling,
    switchToWebSocket,
    setUpdateFrequency
  } = useHybridTelemetry({
    updateFrequency: 500 // Default to 2 FPS to reduce server load
  });

  if (error) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="bg-dashboard-card border border-dashboard-danger rounded-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-dashboard-danger/20 border-2 border-dashboard-danger mx-auto mb-4 flex items-center justify-center">
            <span className="text-dashboard-danger text-2xl font-bold">!</span>
          </div>
          <h2 className="text-dashboard-danger font-mono text-lg font-bold mb-2">
            CONNECTION ERROR
          </h2>
          <p className="text-gray-400 font-mono text-sm mb-4">
            {error}
          </p>
          <div className="flex gap-2 justify-center mb-4">
            <button 
              onClick={reconnect}
              className="px-4 py-2 bg-dashboard-danger text-white font-mono text-sm rounded-lg hover:bg-dashboard-danger/80 transition-colors"
            >
              RECONNECT
            </button>
            {connectionType === 'websocket' && (
              <button 
                onClick={switchToPolling}
                className="px-4 py-2 bg-dashboard-accent text-white font-mono text-sm rounded-lg hover:bg-dashboard-accent/80 transition-colors"
              >
                USE POLLING
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500 font-mono mb-2">
            Connection: {connectionType?.toUpperCase() || 'NONE'}
          </div>
          <div className="text-xs text-gray-500 font-mono">
            Make sure ETS2 Telemetry Server is running on port 25555
          </div>
        </div>
      </div>
    );
  }

  if (!connected || !data) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="bg-dashboard-card border border-dashboard-border rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-dashboard-accent/20 border-2 border-dashboard-accent mx-auto mb-4 flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 border-2 border-dashboard-accent border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-dashboard-accent font-mono text-lg font-bold mb-2">
            {connectionMessage?.toUpperCase() || 'CONNECTING...'}
          </h2>
          <div className="text-gray-400 font-mono text-sm mb-4">
            Waiting for telemetry data
          </div>
          <div className="flex gap-2 justify-center mb-4">
            {connectionType !== 'websocket' && (
              <button 
                onClick={switchToWebSocket}
                className="px-3 py-1 bg-dashboard-accent/20 text-dashboard-accent font-mono text-xs rounded hover:bg-dashboard-accent/30 transition-colors"
              >
                TRY WEBSOCKET
              </button>
            )}
            {connectionType !== 'polling' && (
              <button 
                onClick={switchToPolling}
                className="px-3 py-1 bg-dashboard-accent/20 text-dashboard-accent font-mono text-xs rounded hover:bg-dashboard-accent/30 transition-colors"
              >
                TRY POLLING
              </button>
            )}
          </div>
          <div className="text-xs text-gray-500 font-mono">
            Mode: {connectionType?.toUpperCase() || 'INITIALIZING'}
          </div>
        </div>
      </div>
    );
  }

  const firstConnect = !data.game.connected;

  if (firstConnect) {
    return (
      <div className="min-h-screen bg-dashboard-bg flex items-center justify-center">
        <div className="bg-dashboard-card border border-dashboard-warning rounded-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-dashboard-warning/20 border-2 border-dashboard-warning mx-auto mb-4 flex items-center justify-center">
            <span className="text-dashboard-warning text-xl font-bold">⏵</span>
          </div>
          <h2 className="text-dashboard-warning font-mono text-lg font-bold mb-2">
            WAITING FOR GAME
          </h2>
          <p className="text-gray-400 font-mono text-sm">
            Please start Euro Truck Simulator 2 or American Truck Simulator
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-mono font-bold text-dashboard-accent tracking-wider">
            ETS2 TELEMETRY DASHBOARD
          </h1>
          <div className="flex items-center justify-center gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-dashboard-accent animate-pulse" />
              <span className="text-sm font-mono text-gray-400">
                Connected • {data.game.version}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionType === 'websocket' ? 'bg-green-400' : 'bg-blue-400'
              }`} />
              <span className="text-xs font-mono text-gray-500">
                {connectionType === 'websocket' ? 'WebSocket' : 'HTTP Polling'}
              </span>
            </div>
            {connectionType === 'websocket' && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-500">Freq:</span>
                <select 
                  onChange={(e) => setUpdateFrequency?.(parseInt(e.target.value))}
                  className="bg-dashboard-card border border-dashboard-border rounded px-1 py-0.5 text-xs font-mono text-gray-400"
                  defaultValue="500"
                >
                  <option value="100">10 FPS (100ms)</option>
                  <option value="200">5 FPS (200ms)</option>
                  <option value="500">2 FPS (500ms)</option>
                  <option value="1000">1 FPS (1000ms)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Speed Limit - Featured */}
          <div className="lg:col-span-3 xl:col-span-2">
            <SpeedLimitDisplay navigation={data.navigation} truck={data.truck} />
          </div>

          {/* Truck Info */}
          <div className="xl:col-span-1">
            <TruckInfo truck={data.truck} />
          </div>

          {/* Job Info */}
          <div className="xl:col-span-1">
            <JobInfo job={data.job} trailer={data.trailer} />
          </div>

          {/* Lights Panel */}
          <div className="lg:col-span-1">
            <LightsPanel truck={data.truck} />
          </div>

          {/* Input Bars */}
          <div className="lg:col-span-1">
            <InputBars truck={data.truck} />
          </div>

          {/* Wear Indicator */}
          <div className="lg:col-span-1">
            <WearIndicator truck={data.truck} trailer={data.trailer} />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-xs font-mono text-gray-600">
          <div>Game Time: {data.game.time}</div>
          <div className="mt-1">
            Telemetry Plugin: {data.game.telemetryPluginVersion}
          </div>
        </div>
      </div>
    </div>
  );
}