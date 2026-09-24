import { IncomingMessage, ServerResponse } from 'http';
import { runCompleteSecurityAudit } from './audit-suite.js';
import { securityProxyService } from './proxy-service.js';
import { VerifyRequest } from './types.js';

export function getProductionSecurityHeaders(requestId?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self' https:;",
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
  };

  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }

  return headers;
}

export async function handleApiRoute(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 1. Health check: GET /api/health
  if (url === '/api/health' && req.method === 'GET') {
    const headers = {
      ...getProductionSecurityHeaders(requestId),
      'Content-Type': 'application/json',
    };
    res.writeHead(200, headers);
    res.end(JSON.stringify({ 
      status: 'healthy', 
      version: '1.0.0',
      uptimeSec: Math.floor(process.uptime()), 
      timestamp: new Date().toISOString(),
      requestId
    }));
    return true;
  }

  // 2. Automated Security Audit Endpoint: GET /api/audit/run
  if (url === '/api/audit/run' && req.method === 'GET') {
    try {
      const auditResult = await runCompleteSecurityAudit();
      const headers = {
        ...getProductionSecurityHeaders(requestId),
        'Content-Type': 'application/json',
      };
      res.writeHead(200, headers);
      res.end(JSON.stringify({ success: true, requestId, audit: auditResult }));
    } catch (err: any) {
      const headers = {
        ...getProductionSecurityHeaders(requestId),
        'Content-Type': 'application/json',
      };
      res.writeHead(500, headers);
      res.end(JSON.stringify({ success: false, requestId, error: 'Audit execution error' }));
    }
    return true;
  }

  // 3. Cache statistics endpoint: GET /api/cache/stats
  if (url === '/api/cache/stats' && req.method === 'GET') {
    const stats = securityProxyService.getCacheStats();
    const headers = {
      ...getProductionSecurityHeaders(requestId),
      'Content-Type': 'application/json',
    };
    res.writeHead(200, headers);
    res.end(JSON.stringify({ success: true, requestId, stats }));
    return true;
  }

  // 4. Clear cache endpoint: POST /api/cache/clear
  if (url === '/api/cache/clear' && req.method === 'POST') {
    securityProxyService.clearCache();
    const headers = {
      ...getProductionSecurityHeaders(requestId),
      'Content-Type': 'application/json',
    };
    res.writeHead(200, headers);
    res.end(JSON.stringify({ success: true, requestId, message: 'Cache cleared successfully' }));
    return true;
  }

  // 5. Main Hardened Verification Endpoint: POST /api/verify
  if (url.startsWith('/api/verify') && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      // Protect against gigantic payloads (1MB max limit)
      if (body.length > 1024 * 1024) {
        const headers = {
          ...getProductionSecurityHeaders(requestId),
          'Content-Type': 'application/json',
        };
        res.writeHead(413, headers);
        res.end(JSON.stringify({ success: false, requestId, error: 'Payload too large (1MB max)' }));
        req.destroy();
      }
    });

    req.on('end', async () => {
      try {
        let parsed: unknown = {};
        if (body.trim()) {
          try {
            parsed = JSON.parse(body);
          } catch {
            const headers = {
              ...getProductionSecurityHeaders(requestId),
              'Content-Type': 'application/json',
            };
            res.writeHead(400, headers);
            res.end(JSON.stringify({ success: false, requestId, error: 'Invalid JSON formatting in request body' }));
            return;
          }
        }

        const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';

        const result = await securityProxyService.verify(parsed, clientIp);

        const headers: Record<string, string> = {
          ...getProductionSecurityHeaders(requestId),
          'Content-Type': 'application/json',
        };

        if (result.statusCode === 429 && result.retryAfter) {
          headers['Retry-After'] = result.retryAfter.toString();
        }

        res.writeHead(result.statusCode, headers);
        res.end(JSON.stringify({
          ...result,
          requestId,
        }));
      } catch (err: any) {
        // Defensive: Never expose internal stack traces or environment variables
        const headers = {
          ...getProductionSecurityHeaders(requestId),
          'Content-Type': 'application/json',
        };
        res.writeHead(500, headers);
        res.end(JSON.stringify({
          success: false,
          requestId,
          error: 'Internal Security Proxy Processing Error',
          errorAr: 'حدث خطأ داخلي أثناء معالجة الطلب في الخادم الوسيط.',
        }));
      }
    });

    return true;
  }

  // Handle CORS preflight for /api/*
  if (url.startsWith('/api/') && req.method === 'OPTIONS') {
    res.writeHead(204, getProductionSecurityHeaders(requestId));
    res.end();
    return true;
  }

  return false;
}
