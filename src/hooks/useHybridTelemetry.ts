import { useState, useEffect, useRef } from 'react';
import { Ets2TelemetryData } from '../types/telemetry';
import { WebSocketTelemetryService } from '../services/webSocketTelemetryService';

interface UseHybridTelemetryOptions {
  serverUrl?: string;
  websocketTimeout?: number;
  pollingInterval?: number;
  preferWebSocket?: boolean;
  updateFrequency?: number; // WebSocket update frequency in ms
}

export function useHybridTelemetry(options: UseHybridTelemetryOptions = {}) {
  const [data, setData] = useState<Ets2TelemetryData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionMessage, setConnectionMessage] = useState<string>('Initializing...');
  const [connectionType, setConnectionType] = useState<'websocket' | 'polling' | 'none'>('none');
  
  const webSocketServiceRef = useRef<WebSocketTelemetryService | null>(null);
  const pollingIntervalRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  
  const serverUrl = options.serverUrl || `http://${window.location.hostname}:25555`;
  const websocketTimeout = options.websocketTimeout || 5000;
  const pollingInterval = options.pollingInterval || 500; // Reduced from 1000ms to 500ms  
  const preferWebSocket = options.preferWebSocket !== false; // Default to true
  const updateFrequency = options.updateFrequency || 200; // Default 200ms = 5 FPS

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const startPolling = () => {
    stopPolling();
    
    const fetchData = async () => {
      try {
        const response = await fetch(`${serverUrl}/api/ets2/telemetry`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const telemetryData = await response.json();
        
        if (mountedRef.current) {
          setData(telemetryData);
          setConnected(true);
          setError(null);
          setConnectionMessage('Connected (HTTP Polling)');
          setConnectionType('polling');
        }
      } catch (err) {
        if (mountedRef.current) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          setConnected(false);
          setError(errorMessage);
          setConnectionMessage(`Polling failed: ${errorMessage}`);
        }
      }
    };

    // Initial fetch
    fetchData();
    
    // Set up polling
    pollingIntervalRef.current = window.setInterval(fetchData, pollingInterval);
  };

  const initializeWebSocket = async () => {
    try {
      setConnectionMessage('Initializing WebSocket...');
      
      const webSocketService = new WebSocketTelemetryService(serverUrl, updateFrequency);
      webSocketServiceRef.current = webSocketService;
      
      // Set up WebSocket event handlers
      webSocketService.onData((telemetryData: Ets2TelemetryData) => {
        if (mountedRef.current) {
          setData(telemetryData);
          setError(null);
          setConnectionType('websocket');
        }
      });
      
      webSocketService.onStatusChange((isConnected: boolean, message?: string) => {
        if (mountedRef.current) {
          setConnected(isConnected);
          setConnectionMessage(message ? `WebSocket: ${message}` : (isConnected ? 'Connected (WebSocket)' : 'Disconnected'));
          
          if (!isConnected && message !== 'Reconnecting...') {
            setError(message || 'WebSocket connection lost');
          } else if (isConnected) {
            setError(null);
            setConnectionType('websocket');
            // Stop polling since WebSocket is working
            stopPolling();
          }
        }
      });
      
      // Initialize WebSocket with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('WebSocket initialization timeout')), websocketTimeout);
      });
      
      await Promise.race([
        webSocketService.initialize().then(() => webSocketService.connect()),
        timeoutPromise
      ]);
      
    } catch (err) {
      console.warn('WebSocket failed, falling back to polling:', err);
      if (mountedRef.current) {
        // Don't set error immediately, just show fallback message
        setConnectionMessage('WebSocket unavailable, using HTTP polling...');
        setConnectionType('polling');
      }
      // Fallback to polling
      startPolling();
    }
  };

  useEffect(() => {
    mountedRef.current = true;
    
    if (preferWebSocket) {
      // Try WebSocket first, fallback to polling if it fails
      initializeWebSocket();
    } else {
      // Use polling directly
      startPolling();
    }
    
    return () => {
      mountedRef.current = false;
      stopPolling();
      if (webSocketServiceRef.current) {
        webSocketServiceRef.current.disconnect();
        webSocketServiceRef.current = null;
      }
    };
}, [serverUrl, preferWebSocket]);

  const switchToPolling = () => {
    if (webSocketServiceRef.current) {
      webSocketServiceRef.current.disconnect();
      webSocketServiceRef.current = null;
    }
    startPolling();
  };

  const switchToWebSocket = () => {
    stopPolling();
    initializeWebSocket();
  };

  const reconnect = async () => {
    if (connectionType === 'websocket' && webSocketServiceRef.current) {
      try {
        setConnectionMessage('Reconnecting WebSocket...');
        await webSocketServiceRef.current.connect();
      } catch (err) {
        console.warn('WebSocket reconnection failed, switching to polling');
        switchToPolling();
      }
    } else {
      // Restart current connection type
      if (connectionType === 'polling') {
        startPolling();
      } else {
        initializeWebSocket();
      }
    }
  };

  return {
    data,
    connected,
    error,
    connectionMessage,
    connectionType,
    reconnect,
    switchToPolling,
    switchToWebSocket
  };
}