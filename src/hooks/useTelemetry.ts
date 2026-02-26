import { useState, useEffect, useRef } from 'react';
import { Ets2TelemetryData } from '../types/telemetry';
import { SignalRService } from '../services/signalrService';

interface UseTelemetryOptions {
  serverUrl?: string;
}

export function useTelemetry(options: UseTelemetryOptions = {}) {
  const [data, setData] = useState<Ets2TelemetryData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string>('Initializing...');
  
  const signalRServiceRef = useRef<SignalRService | null>(null);
  const serverUrl = options.serverUrl || `http://${window.location.hostname}:25555`;

  useEffect(() => {
    let mounted = true;
    
    const initializeSignalR = async () => {
      try {
        setConnectionMessage('Loading SignalR...');
        
        // Create SignalR service instance
        const signalRService = new SignalRService(serverUrl);
        signalRServiceRef.current = signalRService;
        
        // Set up event handlers
        signalRService.onData((telemetryData: Ets2TelemetryData) => {
          if (mounted) {
            setData(telemetryData);
            setError(null);
          }
        });
        
        signalRService.onStatusChange((isConnected: boolean, message?: string) => {
          if (mounted) {
            setConnected(isConnected);
            setConnectionMessage(message || (isConnected ? 'Connected' : 'Disconnected'));
            if (!isConnected && message !== 'Reconnecting...') {
              setError(message || 'Connection lost');
            } else if (isConnected) {
              setError(null);
            }
          }
        });
        
        // Initialize and connect
        await signalRService.initialize();
        await signalRService.connect();
        
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize SignalR';
          setError(errorMessage);
          setConnectionMessage(errorMessage);
          setConnected(false);
          console.error('SignalR initialization error:', err);
        }
      }
    };
    
    initializeSignalR();
    
    // Cleanup function
    return () => {
      mounted = false;
      if (signalRServiceRef.current) {
        signalRServiceRef.current.disconnect();
        signalRServiceRef.current = null;
      }
    };
  }, [serverUrl]);

  // Manual reconnection function
  const reconnect = async () => {
    if (signalRServiceRef.current) {
      try {
        setConnectionMessage('Reconnecting...');
        await signalRServiceRef.current.connect();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Reconnection failed';
        setError(errorMessage);
        setConnectionMessage(errorMessage);
      }
    }
  };

  return {
    data,
    connected,
    error,
    connectionMessage,
    reconnect
  };
}