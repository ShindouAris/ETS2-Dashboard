import { Ets2TelemetryData } from '../types/telemetry';

interface NegotiateResponse {
  ConnectionToken: string;
  ConnectionId: string;
  TryWebSockets: boolean;
  WebSocketServerUrl?: string;
  ProtocolVersion: string;
  TransportConnectTimeout: number;
  LongPollDelay: number;
}

export class WebSocketTelemetryService {
  private ws: WebSocket | null = null;
  private connectionToken: string = '';
  private connectionId: string = '';
  private isConnected: boolean = false;
  private dataCallback: ((data: Ets2TelemetryData) => void) | null = null;
  private statusCallback: ((connected: boolean, message?: string) => void) | null = null;
  private reconnectTimer: any = null;
  private pingTimer: any = null;
  private dataRequestTimer: any = null; // Timer for throttled data requests
  private endpointUrl: string;
  private messageId: number = 0;
  private updateInterval: number = 200; // Minimum 200ms between requests (5 FPS max)
  private lastRequestTime: number = 0;
  
  constructor(serverUrl?: string, updateFrequency: number = 500) {
    this.endpointUrl = serverUrl || `http://${window.location.hostname}:25555`;
    this.updateInterval = Math.max(100, updateFrequency); // Minimum 100ms (10 FPS max)
  }

  public async initialize(): Promise<void> {
    try {
      await this.negotiate();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private async negotiate(): Promise<void> {
    const negotiateUrl = `${this.endpointUrl}/signalr/negotiate?negotiateVersion=1`;
    
    try {
      console.log('Negotiating SignalR connection...', negotiateUrl);
      
      const response = await fetch(negotiateUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Negotiate failed: ${response.status} ${response.statusText}`);
      }

      const negotiateData: NegotiateResponse = await response.json();
      console.log('Negotiate response:', negotiateData);

      this.connectionToken = negotiateData.ConnectionToken;
      this.connectionId = negotiateData.ConnectionId;

      if (!negotiateData.TryWebSockets) {
        throw new Error('Server does not support WebSockets');
      }

    } catch (error) {
      console.error('Negotiate failed:', error);
      throw new Error(`Failed to negotiate connection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public async connect(): Promise<void> {
    if (!this.connectionToken) {
      throw new Error('No connection token - call negotiate first');
    }

    const wsUrl = this.buildWebSocketUrl();
    console.log('Connecting to WebSocket:', wsUrl);

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = (event) => {
          console.log('WebSocket connected:', event);
          this.isConnected = true;
          
          if (this.statusCallback) {
            this.statusCallback(true, 'Connected');
          }
          
          // Send start message
          this.sendStartMessage();
          
          // Setup ping timer
          this.setupPingTimer();
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code, event.reason);
          this.isConnected = false;
          this.cleanup();
          
          if (this.statusCallback) {
            this.statusCallback(false, 'Disconnected');
          }
          
          // Auto reconnect if not intentionally closed
          if (event.code !== 1000) {
            this.reconnectAfterDelay();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          
          if (this.statusCallback) {
            this.statusCallback(false, 'Connection error');
          }
          
          reject(new Error('WebSocket connection failed'));
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private buildWebSocketUrl(): string {
    const wsProtocol = this.endpointUrl.startsWith('https') ? 'wss' : 'ws';
    const baseUrl = this.endpointUrl.replace(/^https?:\/\//, '');
    
    const params = new URLSearchParams({
      transport: 'webSockets',
      connectionToken: this.connectionToken,
      connectionData: JSON.stringify([{ name: 'ets2telemetryhub' }]), // Try lowercase
      tid: Math.floor(Math.random() * 11).toString()
    });

    return `${wsProtocol}://${baseUrl}/signalr/connect?${params.toString()}`;
  }

  private sendStartMessage(): void {
    const startMessage = {
      H: 'ets2telemetryhub', // Hub name
      M: 'RequestData', // Method name
      A: [], // Arguments
      I: ++this.messageId // Message ID
    };

    console.log('Sending start message:', startMessage);
    this.sendMessage(startMessage);
    
    // Start throttled data request loop
    this.scheduleNextDataRequest();
    
    // Also try with capitalized hub name as fallback
    setTimeout(() => {
      const altStartMessage = {
        H: 'Ets2TelemetryHub',
        M: 'RequestData',
        A: [],
        I: ++this.messageId
      };
      console.log('Sending alt start message:', altStartMessage);
      this.sendMessage(altStartMessage);
    }, 100);
  }

  private sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private handleMessage(data: string): void {
    try {
      console.log('Received message:', data);
      
      // Handle empty keepalive messages
      if (!data || data.trim() === '') {
        return;
      }

      const message = JSON.parse(data);
      
      // Handle different message types
      if (message.M) {
        // Method invocation response
        message.M.forEach((methodCall: any) => {
          if (methodCall.M === 'updateData' || methodCall.M === 'UpdateData') {
            if (methodCall.A && methodCall.A.length > 0) {
              try {
                const telemetryData: Ets2TelemetryData = JSON.parse(methodCall.A[0]);
                console.log('Parsed telemetry data:', telemetryData);
                
                if (this.dataCallback) {
                  this.dataCallback(telemetryData);
                }
                
                // DO NOT request next update here - let the timer handle it
                // this.requestDataUpdate(); // REMOVED - causes spam
              } catch (parseError) {
                console.error('Error parsing telemetry data:', parseError);
              }
            }
          }
        });
      } else if (message.C) {
        // Connection message
        console.log('Connection message:', message.C);
      } else if (message.S) {
        // State message
        console.log('State message:', message.S);
      }

    } catch (error) {
      console.error('Error handling message:', error, 'Raw data:', data);
    }
  }

  private requestDataUpdate(): void {
    const now = Date.now();
    this.lastRequestTime = now;
    
    const requestMessage = {
      H: 'ets2telemetryhub',
      M: 'RequestData',
      A: [],
      I: ++this.messageId
    };

    console.log('Requesting data update:', requestMessage);
    this.sendMessage(requestMessage);
  }

  private scheduleNextDataRequest(): void {
    // Clear existing timer
    if (this.dataRequestTimer) {
      clearTimeout(this.dataRequestTimer);
    }

    // Calculate delay to maintain consistent interval
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const delay = Math.max(0, this.updateInterval - timeSinceLastRequest);
    
    this.dataRequestTimer = setTimeout(() => {
      if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.requestDataUpdate();
        // Schedule next request
        this.scheduleNextDataRequest();
      }
    }, delay);
  }

  public setUpdateFrequency(intervalMs: number): void {
    this.updateInterval = Math.max(100, intervalMs); // Minimum 100ms
    console.log('Update frequency set to:', this.updateInterval, 'ms');
  }

  private setupPingTimer(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // Send ping message
        this.ws.send('{}');
      }
    }, 30000); // Ping every 30 seconds
  }

  private cleanup(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
    
    if (this.dataRequestTimer) {
      clearTimeout(this.dataRequestTimer);
      this.dataRequestTimer = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  public disconnect(): void {
    console.log('Disconnecting WebSocket...');
    this.cleanup();
    
    if (this.ws) {
      this.ws.close(1000, 'Intentional disconnect');
      this.ws = null;
    }
    
    this.isConnected = false;
  }

  private reconnectAfterDelay(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.statusCallback) {
      this.statusCallback(false, 'Reconnecting...');
    }
    
    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.negotiate();
        await this.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.reconnectAfterDelay(); // Try again
      }
    }, 2000);
  }

  public onData(callback: (data: Ets2TelemetryData) => void): void {
    this.dataCallback = callback;
  }

  public onStatusChange(callback: (connected: boolean, message?: string) => void): void {
    this.statusCallback = callback;
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}