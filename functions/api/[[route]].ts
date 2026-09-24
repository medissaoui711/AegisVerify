import { runCompleteSecurityAudit } from '../../server/audit-suite.js';
import { securityProxyService } from '../../server/proxy-service.js';

interface Env {
  GEMINI_API_KEY?: string;
  [key: string]: any;
}

const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
};

export async function onRequest(context: { request: Request; env: Env; params: { route?: string[] } }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;
  const requestId = request.headers.get('x-request-id') || `cf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...SECURITY_HEADERS,
        'X-Request-ID': requestId,
      },
    });
  }

  // 1. Health check
  if (pathname === '/api/health' && method === 'GET') {
    return new Response(
      JSON.stringify({
        status: 'healthy',
        platform: 'cloudflare-pages',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        requestId,
      }),
      {
        status: 200,
        headers: { ...SECURITY_HEADERS, 'X-Request-ID': requestId },
      }
    );
  }

  // 2. Audit Suite
  if (pathname === '/api/audit/run' && method === 'GET') {
    try {
      const auditResult = await runCompleteSecurityAudit();
      return new Response(
        JSON.stringify({ success: true, requestId, audit: auditResult }),
        {
          status: 200,
          headers: { ...SECURITY_HEADERS, 'X-Request-ID': requestId },
        }
      );
    } catch {
      return new Response(
        JSON.stringify({ success: false, requestId, error: 'Audit execution error' }),
        {
          status: 500,
          headers: { ...SECURITY_HEADERS, 'X-Request-ID': requestId },
        }
      );
    }
  }

  // 3. Cache stats
  if (pathname === '/api/cache/stats' && method === 'GET') {
    const stats = securityProxyService.getCacheStats();
    return new Response(
      JSON.stringify({ success: true, requestId, stats }),
      {
        status: 200,
        headers: { ...SECURITY_HEADERS, 'X-Request-ID': requestId },
      }
    );
  }

  // 4. Clear cache
  if (pathname === '/api/cache/clear' && method === 'POST') {
    securityProxyService.clearCache();
    return new Response(
      JSON.stringify({ success: true, requestId, message: 'Cache cleared successfully' }),
      {
        status: 200,
        headers: { ...SECURITY_HEADERS, 'X-Request-ID': requestId },
      }
    );
  }

  // 5. Verification Endpoint
  if (pathname.startsWith('/api/verify') && method === 'POST') {
    try {
      const bodyText = await request.text();
      let parsed: unknown = {};
      if (bodyText.trim()) {
        try {
          parsed = JSON.parse(bodyText);
        } catch {
          return new Response(
            JSON.stringify({ success: false, requestId, error: 'Invalid JSON formatting in request body' }),
            {
              status: 400,
              headers: { ...SECURITY_HEADERS, 'X-Request-ID': requestId },
            }
          );
        }
      }

      const clientIp = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '127.0.0.1';

      const result = await securityProxyService.verify(parsed, clientIp);

      const headers: Record<string, string> = {
        ...SECURITY_HEADERS,
        'X-Request-ID': requestId,
      };

      if (result.statusCode === 429 && result.retryAfter) {
        headers['Retry-After'] = result.retryAfter.toString();
      }

      return new Response(
        JSON.stringify({ ...result, requestId }),
        {
          status: result.statusCode,
          headers,
        }
      );
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          requestId,
          error: 'Internal Security Proxy Processing Error',
          errorAr: 'حدث خطأ داخلي أثناء معالجة الطلب في الخادم الوسيط.',
        }),
        {
          status: 500,
          headers: { ...SECURITY_HEADERS, 'X-Request-ID': requestId },
        }
      );
    }
  }

  return new Response(
    JSON.stringify({ success: false, error: 'Not Found' }),
    {
      status: 404,
      headers: { ...SECURITY_HEADERS, 'X-Request-ID': requestId },
    }
  );
}
