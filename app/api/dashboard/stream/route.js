/**
 * Server-Sent Events (SSE) Endpoint
 * GET /api/dashboard/stream
 * Requirements: 11.4
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const sendEvent = (type, data) => {
        const event = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(event));
      };

      sendEvent('connected', { message: 'Connected to dashboard stream', timestamp: new Date().toISOString() });

      // Simulate price updates every 5 seconds
      const priceInterval = setInterval(() => {
        const basePrice = 2650;
        const variation = (Math.random() - 0.5) * 10;
        sendEvent('price_update', {
          symbol: 'XAUUSD',
          price: Math.round((basePrice + variation) * 100) / 100,
          change: Math.round(variation * 100) / 100,
          timestamp: new Date().toISOString(),
        });
      }, 5000);

      // Simulate market alerts every 30 seconds
      const alertInterval = setInterval(() => {
        const alerts = [
          { type: 'cot', message: 'COT data updated', severity: 'info' },
          { type: 'news', message: 'New market headline', severity: 'info' },
          { type: 'technical', message: 'Price approaching supply zone', severity: 'warning' },
        ];
        const alert = alerts[Math.floor(Math.random() * alerts.length)];
        sendEvent('alert', { ...alert, timestamp: new Date().toISOString() });
      }, 30000);

      // Heartbeat every 15 seconds
      const heartbeatInterval = setInterval(() => {
        sendEvent('heartbeat', { timestamp: new Date().toISOString() });
      }, 15000);

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(priceInterval);
        clearInterval(alertInterval);
        clearInterval(heartbeatInterval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
