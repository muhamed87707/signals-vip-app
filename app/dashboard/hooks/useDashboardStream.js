'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useDashboardStream - SSE consumer hook for real-time updates
 * Requirements: 11.4
 */
export default function useDashboardStream() {
  const [connected, setConnected] = useState(false);
  const [lastPrice, setLastPrice] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const eventSource = new EventSource('/api/dashboard/stream');
      eventSourceRef.current = eventSource;

      eventSource.addEventListener('connected', (e) => {
        setConnected(true);
        setError(null);
        console.log('Dashboard stream connected');
      });

      eventSource.addEventListener('price_update', (e) => {
        const data = JSON.parse(e.data);
        setLastPrice(data);
      });

      eventSource.addEventListener('alert', (e) => {
        const data = JSON.parse(e.data);
        setAlerts(prev => [data, ...prev].slice(0, 10));
      });

      eventSource.addEventListener('heartbeat', (e) => {
        // Keep connection alive
      });

      eventSource.onerror = (e) => {
        console.error('SSE error:', e);
        setConnected(false);
        setError('Connection lost');
        eventSource.close();
        
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 5000);
      };
    } catch (err) {
      setError(err.message);
      setConnected(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setConnected(false);
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    connected,
    lastPrice,
    alerts,
    error,
    connect,
    disconnect,
    clearAlerts,
  };
}
