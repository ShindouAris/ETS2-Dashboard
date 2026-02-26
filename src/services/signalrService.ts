import { Ets2TelemetryData } from '../types/telemetry';

declare global {
  interface Window {
    $: any;
  }
}

export class SignalRService {
  private connection: any = null;
  private hub: any = null;
  private isConnected: boolean = false;
  private dataCallback: ((data: Ets2TelemetryData) => void) | null = null;
  private statusCallback: ((connected: boolean, message?: string) => void) | null = null;
  private reconnectTimer: any = null;
  private endpointUrl: string;
  
  constructor(serverUrl?: string) {
    this.endpointUrl = serverUrl || `http://${window.location.hostname}:25555`;
  }

  public async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Dynamically load jQuery and SignalR scripts
      this.loadScripts().then(() => {
        this.initializeHub();
        resolve();
      }).catch((error) => {
        reject(error);
      });
    });
  }

  private async loadScripts(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Starting script loading...');
      
      // Load jQuery if not loaded
      if (typeof window.$ === 'undefined') {
        console.log('Loading jQuery...');
        const jquery = document.createElement('script');
        // Use jQuery 2.2.4 - compatible with SignalR 2.2.0
        jquery.src = 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js';
        jquery.onload = () => {
          console.log('jQuery loaded, version:', window.$?.fn?.jquery);
          // Add small delay to ensure jQuery is fully ready
          setTimeout(() => {
            this.loadSignalR().then(resolve).catch(reject);
          }, 100);
        };
        jquery.onerror = () => {
          console.error('Failed to load jQuery');
          reject(new Error('Failed to load jQuery'));
        };
        document.head.appendChild(jquery);
      } else {
        console.log('jQuery already available, version:', window.$?.fn?.jquery);
        this.loadSignalR().then(resolve).catch(reject);
      }
    });
  }

  private async loadSignalR(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Loading SignalR...');
      
      // Verify jQuery is available
      if (!window.$ || !window.$.fn) {
        reject(new Error('jQuery not properly loaded'));
        return;
      }
      
      console.log('jQuery version:', window.$.fn.jquery);
      
      // Check if SignalR is already loaded
      if (window.$.connection && window.$.connection.hub) {
        console.log('SignalR already available');
        resolve();
        return;
      }

      // Load SignalR script from server
      const signalr = document.createElement('script');
      signalr.src = `${this.endpointUrl}/signalr/hubs`;
      signalr.type = 'text/javascript';
      
      let retryCount = 0;
      const maxRetries = 3;
      let timeoutId: number;
      
      const cleanup = () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
      
      const checkSignalRAvailability = () => {
        console.log(`Checking SignalR availability (attempt ${retryCount + 1}/${maxRetries})...`, {
          '$': !!window.$,
          '$_fn': !!window.$?.fn,
          'connection': !!window.$?.connection,
          'hub': !!window.$?.connection?.hub,
          'connectionKeys': window.$?.connection ? Object.keys(window.$.connection) : 'N/A'
        });
        
        if (window.$ && window.$.connection && window.$.connection.hub) {
          console.log('SignalR successfully initialized');
          cleanup();
          resolve();
          return true;
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`SignalR not ready, retrying in 500ms...`);
          timeoutId = window.setTimeout(checkSignalRAvailability, 500);
          return false;
        } else {
          console.error('SignalR failed to initialize after', maxRetries, 'attempts');
          cleanup();
          reject(new Error(`SignalR initialization failed after ${maxRetries} attempts`));
          return false;
        }
      };
      
      signalr.onload = () => {
        console.log('SignalR script loaded from:', signalr.src);
        
        // Start checking with initial delay
        timeoutId = window.setTimeout(checkSignalRAvailability, 300);
      };
      
      signalr.onerror = (error) => {
        console.error('Failed to load SignalR script:', error);
        cleanup();
        reject(new Error('Failed to load SignalR script - check server connection'));
      };
      
      console.log('Adding SignalR script to head:', signalr.src);
      document.head.appendChild(signalr);
      
      // Set overall timeout (longer to account for retries)
      setTimeout(() => {
        cleanup();
        if (retryCount >= maxRetries) {
          reject(new Error('SignalR loading timeout - server may be unavailable'));
        }
      }, 15000);
    });
  }

  private initializeHub(): void {
    const $ = window.$;
    
    console.log('Initializing SignalR hub...');
    console.log('jQuery connection object:', window.$.connection);
    
    if (!$ || !$.connection) {
      throw new Error('jQuery or SignalR connection not available');
    }

    if (!$.connection.hub) {
      throw new Error('SignalR hub not available');
    }

    console.log('Available connections:', Object.keys($.connection));

    // Configure SignalR connection
    $.connection.hub.logging = true; // Enable logging for debugging
    $.connection.hub.url = `${this.endpointUrl}/signalr`;
    
    console.log('SignalR hub URL set to:', $.connection.hub.url);
    
    // Try to get the hub with different possible names
    this.hub = $.connection['ets2TelemetryHub'] || $.connection['Ets2TelemetryHub'] || $.connection['ets2telemetryhub'];
    
    if (!this.hub) {
      console.error('Available hubs:', Object.keys($.connection));
      
      // Try to find any hub that might be our telemetry hub
      const availableHubs = Object.keys($.connection).filter(key => 
        key.toLowerCase().includes('telemetry') || 
        key.toLowerCase().includes('ets2') ||
        key !== 'hub' // Exclude the main hub object
      );
      
      console.log('Potential telemetry hubs found:', availableHubs);
      
      if (availableHubs.length > 0) {
        console.log('Using hub:', availableHubs[0]);
        this.hub = $.connection[availableHubs[0]];
      } else {
        // If no specific hub found, try to see if there's a generic hub we can use
        const allHubs = Object.keys($.connection).filter(key => key !== 'hub');
        if (allHubs.length > 0) {
          console.log('Using first available hub:', allHubs[0]);
          this.hub = $.connection[allHubs[0]];
        } else {
          throw new Error('No SignalR hubs found. Available objects: ' + Object.keys($.connection).join(', '));
        }
      }
    }

    console.log('SignalR hub found:', this.hub);
    console.log('Hub client object:', this.hub.client);
    console.log('Hub server object:', this.hub.server);

    // Ensure hub has client and server objects
    if (!this.hub.client) {
      throw new Error('SignalR hub client object not available');
    }
    
    if (!this.hub.server) {
      throw new Error('SignalR hub server object not available');
    }

    // Set up client-side methods
    this.hub.client['updateData'] = (jsonData: string) => {
      try {
        console.log('Received data from SignalR:', jsonData.substring(0, 100) + '...');
        const data: Ets2TelemetryData = JSON.parse(jsonData);
        if (this.dataCallback) {
          this.dataCallback(data);
        }
        this.requestDataUpdate(); // Request next update
      } catch (error) {
        console.error('Error parsing telemetry data:', error);
      }
    };

    // Set up connection event handlers
    $.connection.hub.reconnected(() => {
      console.log('SignalR reconnected');
      this.isConnected = true;
      if (this.statusCallback) {
        this.statusCallback(true, 'Connected');
      }
      this.requestDataUpdate();
    });

    $.connection.hub.reconnecting(() => {
      console.log('SignalR reconnecting...');
      this.isConnected = false;
      if (this.statusCallback) {
        this.statusCallback(false, 'Reconnecting...');
      }
    });

    $.connection.hub.disconnected(() => {
      console.log('SignalR disconnected');
      this.isConnected = false;
      if (this.statusCallback) {
        this.statusCallback(false, 'Disconnected');
      }
      this.reconnectAfterDelay();
    });

    $.connection.hub.error((error: any) => {
      console.error('SignalR error:', error);
      if (this.statusCallback) {
        this.statusCallback(false, 'Connection error: ' + (error.message || error));
      }
    });

    // Add connection state change handler
    $.connection.hub.stateChanged((change: any) => {
      console.log('SignalR state changed:', change);
    });

    window.onbeforeunload = () => {
      $.connection.hub.stop();
    };
    
    console.log('SignalR hub initialization completed');
  }

  public async connect(): Promise<void> {
    const $ = window.$;
    
    return new Promise((resolve, reject) => {
      $.connection.hub.stop(); // Stop any existing connection
      
      $.connection.hub.start()
        .done(() => {
          this.isConnected = true;
          if (this.statusCallback) {
            this.statusCallback(true, 'Connected');
          }
          this.requestDataUpdate();
          resolve();
        })
        .fail((error: any) => {
          this.isConnected = false;
          if (this.statusCallback) {
            this.statusCallback(false, 'Failed to connect');
          }
          this.reconnectAfterDelay();
          reject(error);
        });
    });
  }

  public disconnect(): void {
    console.log('Disconnecting SignalR...');
    const $ = window.$;
    if ($ && $.connection && $.connection.hub) {
      $.connection.hub.stop();
    }
    this.isConnected = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    // Clear script elements to avoid duplicates on reconnect
    this.cleanupScripts();
  }

  private cleanupScripts(): void {
    // Remove SignalR scripts but keep jQuery
    const scripts = document.querySelectorAll('script[src*="signalr/hubs"]');
    scripts.forEach(script => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    });
    
    // Reset SignalR connection object if it exists
    if (window.$ && window.$.connection) {
      try {
        // Don't delete entire connection, just reset state
        if (window.$.connection.hub) {
          window.$.connection.hub.stop();
        }
      } catch (e) {
        console.warn('Error cleaning up SignalR connection:', e);
      }
    }
  }

  public onData(callback: (data: Ets2TelemetryData) => void): void {
    this.dataCallback = callback;
  }

  public onStatusChange(callback: (connected: boolean, message?: string) => void): void {
    this.statusCallback = callback;
  }

  private requestDataUpdate(): void {
    if (this.hub && this.hub.server && this.isConnected) {
      try {
        this.hub.server['requestData']();
      } catch (error) {
        console.error('Error requesting data:', error);
      }
    }
  }

  private reconnectAfterDelay(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    
    if (this.statusCallback) {
      this.statusCallback(false, 'Reconnecting...');
    }
    
    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, 1000);
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}