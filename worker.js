import { convertHtmlToMarkdown } from './converter.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * @param {BodyInit | null} body
 * @param {number} status
 * @param {Record<string, string>} extraHeaders
 */
function jsonResponse(body, status, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
      ...extraHeaders,
    },
  });
}

/**
 * @param {BodyInit | null} body
 * @param {number} status
 * @param {Record<string, string>} extraHeaders
 */
function htmlResponse(body, status, extraHeaders = {}) {
  return new Response(body, {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'text/html; charset=utf-8',
      ...extraHeaders,
    },
  });
}

export default {
  /**
   * @param {Request} request
   * @param {{ ASSETS: { fetch: (request: Request) => Promise<Response> } }} env
   */
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === 'GET' && pathname === '/') {
      const assetRequest = new Request(new URL('/index.html', request.url), request);
      const assetResponse = await env.ASSETS.fetch(assetRequest);
      if (!assetResponse.ok) {
        return jsonResponse(JSON.stringify({ error: 'index.html not found' }), 500);
      }
      return htmlResponse(assetResponse.body, assetResponse.status);
    }

    if (request.method === 'GET' && pathname === '/health') {
      return jsonResponse(JSON.stringify({ status: 'ok' }), 200);
    }

    if (request.method === 'POST' && pathname === '/convert') {
      let payload;
      try {
        payload = await request.json();
      } catch {
        return jsonResponse(JSON.stringify({ error: 'html field is required' }), 400);
      }

      if (!payload || typeof payload.html !== 'string') {
        return jsonResponse(JSON.stringify({ error: 'html field is required' }), 400);
      }

      const markdown = convertHtmlToMarkdown(payload.html);
      return jsonResponse(JSON.stringify({ markdown }), 200);
    }

    return jsonResponse(JSON.stringify({ error: 'Not found' }), 404);
  },
};
