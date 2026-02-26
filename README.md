# ETS2 React Telemetry Dashboard

A modern, responsive React dashboard for Euro Truck Simulator 2 / American Truck Simulator telemetry data.

## Features

🚛 **Real-time Truck Information**
- Speed, RPM, Gear display
- Fuel consumption monitoring
- Engine status indicators

🎛️ **Comprehensive Controls Display**
- User vs Game input comparison (Throttle, Brake, Clutch)
- Steering input visualization
- Retarder brake status

💡 **Lighting & Signals System**
- All truck lights (Low/High beam, Parking, Beacon)
- Turn signals with animation
- Hazard warning detection
- Auxiliary lights status

⚠️ **Wear & Diagnostics**
- Engine, transmission, cabin wear
- Chassis and wheel condition
- Trailer wear monitoring
- Color-coded warning levels

📊 **Job Management**
- Active job information
- Source and destination cities
- Cargo details and weight
- Income and deadline tracking

🚦 **Speed Monitoring**
- Current speed vs speed limit
- Visual overspeed warnings
- Speed difference indicators

## Setup & Installation

1. **Install Dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   # or  
   bun dev
   ```

3. **Start ETS2 Telemetry Server**
   - Make sure the original ETS2 telemetry server is running on port 25555
   - The React app will automatically connect to `http://localhost:25555`

## API Connection

The dashboard connects to the ETS2 telemetry API at:
- **Default URL**: `http://localhost:25555/api/ets2/telemetry`
- **Polling Interval**: 1000ms (1 second)
- **Auto-reconnect**: Enabled

### Connection States:
- 🔴 **Error**: Server unavailable or API error
- 🟡 **Connecting**: Attempting to establish connection
- 🟠 **Waiting**: Connected but game not running
- 🟢 **Active**: Connected and receiving telemetry data

## Components Architecture

```
Dashboard/
├── TruckInfo           # Speed, RPM, Gear, Fuel
├── SpeedLimitDisplay   # Speed monitoring with limits
├── WearIndicator       # Component wear status
├── LightsPanel         # Lights and signals
├── JobInfo            # Active job details
└── InputBars          # User/Game input comparison
```

## Telemetry Data Structure

Based on the original `dashboard-core.js` structure:

```typescript
interface Ets2TelemetryData {
  game: Ets2Game;        // Connection, time, version
  truck: Ets2Truck;      // All truck-related data
  trailer: Ets2Trailer;  // Trailer attachment and info
  job: Ets2Job;         // Active job details
  navigation: Ets2Navigation; // Speed limits, distances
}
```

## Styling & Theme

- **Framework**: Tailwind CSS with custom dashboard theme
- **Color Scheme**: Dark theme optimized for truck cabins
- **Typography**: Monospace fonts for technical readability
- **Animations**: Smooth transitions and pulsing alerts
- **Responsive**: Works on desktop, tablet, and mobile devices

## Build & Deploy

```bash
npm run build
# or
bun run build
```

The built files will be in the `dist/` directory and can be served by any static web server.

## Development Notes

- No skin system required - single unified dashboard
- Real-time updates via HTTP polling (no SignalR needed)
- Fully responsive design with CSS Grid
- Type-safe with TypeScript interfaces
- Component-based architecture for maintainability

---

Made with ❤️ for the ETS2/ATS trucking community
