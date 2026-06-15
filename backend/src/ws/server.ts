import { IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { URL } from 'url';
import { Match } from '../models/Match';
import { redisSub } from '../services/redis';
import { logger } from '../logger';

interface AuthenticatedClient {
  ws: WebSocket;
  userId: string;
  isAlive: boolean;
}

interface JwtPayload {
  id: string;
  email: string;
  isAdmin: boolean;
}

const clients = new Map<WebSocket, AuthenticatedClient>();

function authenticate(req: IncomingMessage): JwtPayload | null {
  try {
    const url = new URL(req.url ?? '', `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) return null;

    return jwt.verify(token, secret) as JwtPayload;
  } catch {
    return null;
  }
}

async function sendOddsSnapshot(ws: WebSocket): Promise<void> {
  try {
    const matches = await Match.find({ status: { $ne: 'finished' } }).sort({ date: 1 });
    const message = JSON.stringify({ type: 'odds_snapshot', data: { matches } });
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  } catch (err) {
    logger.error({ err }, 'Erro ao enviar odds_snapshot');
  }
}

export function initWebSocketServer(): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  // Subscribe to Redis channels
  redisSub.subscribe('odds', (err) => {
    if (err) {
      logger.error({ err }, 'Erro ao subscribir canal "odds" no Redis');
    } else {
      logger.info('Redis subscribed to channel: odds');
    }
  });

  redisSub.psubscribe('balance:*', (err) => {
    if (err) {
      logger.error({ err }, 'Erro ao subscribir canal "balance:*" no Redis');
    } else {
      logger.info('Redis psubscribed to pattern: balance:*');
    }
  });

  // Handle incoming Redis messages
  redisSub.on('message', (channel, message) => {
    if (channel === 'odds') {
      // Broadcast to all connected clients
      const payload = JSON.stringify({ type: 'odds_update', data: JSON.parse(message) });
      for (const [ws, client] of clients) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(payload);
        } else {
          clients.delete(ws);
        }
      }
    }
  });

  redisSub.on('pmessage', (_pattern, channel, message) => {
    // channel format: balance:<userId>
    const userId = channel.replace('balance:', '');
    const payload = JSON.stringify({ type: 'balance_update', data: JSON.parse(message) });

    for (const [ws, client] of clients) {
      if (client.userId === userId && ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    }
  });

  // Ping/pong keepalive every 30 seconds
  const pingInterval = setInterval(() => {
    for (const [ws, client] of clients) {
      if (!client.isAlive) {
        ws.terminate();
        clients.delete(ws);
        continue;
      }
      client.isAlive = false;
      ws.ping();
    }
  }, 30000);

  wss.on('close', () => {
    clearInterval(pingInterval);
  });

  // Handle new WebSocket connections
  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    const payload = authenticate(req);

    if (!payload) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    const client: AuthenticatedClient = {
      ws,
      userId: payload.id,
      isAlive: true,
    };

    clients.set(ws, client);

    logger.info({ userId: payload.id }, 'WebSocket client conectado');

    // Send odds snapshot on connection
    await sendOddsSnapshot(ws);

    // Handle pong responses
    ws.on('pong', () => {
      const c = clients.get(ws);
      if (c) c.isAlive = true;
    });

    ws.on('close', () => {
      clients.delete(ws);
      logger.info({ userId: payload.id }, 'WebSocket client desconectado');
    });

    ws.on('error', (err) => {
      logger.error({ err, userId: payload.id }, 'Erro no WebSocket client');
      clients.delete(ws);
    });
  });

  logger.info('WebSocket server inicializado');

  return wss;
}
