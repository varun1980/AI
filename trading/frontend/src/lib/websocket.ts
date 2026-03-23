import { io, Socket } from 'socket.io-client';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket || !socket.connected) {
    socket = io(`${WS_URL}/trading`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
  }
  return socket;
}

export function subscribeTicker(symbol: string) {
  getSocket().emit('subscribe_ticker', { symbol });
}

export function unsubscribeTicker(symbol: string) {
  getSocket().emit('unsubscribe_ticker', { symbol });
}

export function requestCandles(symbol: string, granularity = 'ONE_HOUR', limit = 200) {
  getSocket().emit('get_candles', { symbol, granularity, limit });
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
