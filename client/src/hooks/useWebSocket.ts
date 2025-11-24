import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function useWebSocket(layerId: string | null, options: UseWebSocketOptions = {}) {
  const ws = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const currentLayerId = useRef(layerId);
  
  // Store stable references to callbacks
  const onMessageRef = useRef(options.onMessage);
  const onConnectRef = useRef(options.onConnect);
  const onDisconnectRef = useRef(options.onDisconnect);
  
  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = options.onMessage;
    onConnectRef.current = options.onConnect;
    onDisconnectRef.current = options.onDisconnect;
  });

  useEffect(() => {
    currentLayerId.current = layerId;
    
    // If WebSocket is open and layerId changed, send join message
    if (ws.current && ws.current.readyState === WebSocket.OPEN && layerId) {
      ws.current.send(JSON.stringify({
        type: 'join_layer',
        layerId,
      }));
    }
  }, [layerId]);

  useEffect(() => {
    if (!layerId || !window.location.host || window.location.host.includes('undefined')) return;

    // Determine protocol and construct WebSocket URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    // Skip WebSocket if URL is invalid (Vite HMR issue)
    if (!wsUrl || wsUrl.includes('undefined')) return;

    try {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Wait a tick before sending join message to ensure connection is fully open
        setTimeout(() => {
          if (ws.current && ws.current.readyState === WebSocket.OPEN && currentLayerId.current) {
            ws.current.send(JSON.stringify({
              type: 'join_layer',
              layerId: currentLayerId.current,
            }));
          }
        }, 0);

        onConnectRef.current?.();
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          onMessageRef.current?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onDisconnectRef.current?.();

        // Attempt to reconnect after 3 seconds
        reconnectTimeout.current = setTimeout(() => {
          // Only reconnect if layerId is still valid
          if (currentLayerId.current) {
            // The effect will re-run and create a new connection
          }
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [layerId]); // Only depend on layerId

  const send = (message: WebSocketMessage) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, message not sent:', message);
    }
  };

  return { isConnected, send };
}
