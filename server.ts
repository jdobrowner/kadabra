// Simple local dev server to handle API routes
// This replaces vercel dev for local development
import 'dotenv/config'
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import * as trpcRoute from './api/trpc/[trpc]/route.js';
import * as googleCallbackRoute from './api/auth/google/callback/route.js';
import * as googleAuthorizeRoute from './api/auth/google/authorize/route.js';
import * as ingestRoute from './api/ingest/route.js';
import { createWSServer } from './api/trpc/ws.js';

const app = express();
const server = createServer(app);
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

// IMPORTANT: Set up WebSocket upgrade handler BEFORE Express middleware
// This ensures upgrade requests are handled before Express can intercept them
const wss = new WebSocketServer({ 
  noServer: true, // Don't auto-handle upgrades - we'll do it manually
});

// Set up tRPC WebSocket handler BEFORE handling upgrades
createWSServer(wss);

// Handle WebSocket upgrade requests - must be registered before server.listen()
server.on('upgrade', (request, socket, head) => {
  try {
    const { pathname } = new URL(request.url || '', `http://${request.headers.host}`)
    console.log(`🔌 WebSocket upgrade request for: ${pathname}`)
    
    // Only handle tRPC WebSocket connections
    if (pathname.startsWith('/api/trpc')) {
      console.log(`✅ Handling WebSocket upgrade for ${pathname}`)
      wss.handleUpgrade(request, socket, head, (ws) => {
        console.log(`✅ WebSocket connection established`)
        wss.emit('connection', ws, request)
      })
    } else {
      console.log(`❌ Rejecting WebSocket upgrade for ${pathname} (not a tRPC endpoint)`)
      socket.destroy()
    }
  } catch (error) {
    console.error('❌ Error handling WebSocket upgrade:', error)
    socket.destroy()
  }
})

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper to convert Express request to Web API Request
function expressToWebRequest(req: express.Request, baseUrl: string = BASE_URL): Request {
  // Reconstruct the full URL path (req.url might be relative if using app.use)
  const fullPath = req.originalUrl || req.url;
  const url = new URL(fullPath, baseUrl);
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value && key.toLowerCase() !== 'host') {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  });

  return new Request(url.toString(), {
    method: req.method,
    headers,
    body: req.method !== 'GET' && req.method !== 'HEAD' && req.body 
      ? JSON.stringify(req.body) 
      : undefined,
  });
}

async function sendWebResponse(res: express.Response, response: Response): Promise<void> {
  if (response.status === 302) {
    const location = response.headers.get('Location');
    if (location) {
      res.redirect(302, location);
      return;
    }
  }

  const body = await response.text();
  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });
  res.send(body);
}

// API Routes - tRPC routes
app.use('/api/trpc', async (req, res, next) => {
  try {
    // Use originalUrl to preserve the full path including query string
    const request = expressToWebRequest(req);
    
    const handler = req.method === 'GET' ? trpcRoute.GET : trpcRoute.POST;
    const response = await handler(request);
    await sendWebResponse(res, response);
  } catch (error: any) {
    console.error('tRPC error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

app.get('/api/auth/google/callback', async (req, res) => {
  try {
    const request = expressToWebRequest(req);
    const response = await googleCallbackRoute.GET(request);
    await sendWebResponse(res, response);
  } catch (error: any) {
    console.error('Google callback error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

app.get('/api/auth/google/authorize', async (req, res) => {
  try {
    const request = expressToWebRequest(req);
    const response = await googleAuthorizeRoute.GET(request);
    await sendWebResponse(res, response);
  } catch (error: any) {
    console.error('Google authorize error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

app.post('/api/ingest', async (req, res) => {
  try {
    const request = expressToWebRequest(req);
    const response = await ingestRoute.POST(request);
    await sendWebResponse(res, response);
  } catch (error: any) {
    console.error('Ingest error:', error);
    res.status(500).json({ error: error?.message || 'Internal server error' });
  }
});

// Start HTTP server (which also handles WebSocket upgrades)
server.listen(PORT, () => {
  console.log(`🚀 Local API server running on http://localhost:${PORT}`);
  console.log(`📡 API routes available at /api/*`);
  console.log(`🔌 WebSocket server available at ws://localhost:${PORT}/api/trpc`);
});

