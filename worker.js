/** Cloudflare Worker — route /invite/{code} to invite.html (mirrors vercel.json rewrite),
 *  and stamp security headers on every response.
 *
 *  The CSP is the enforcement layer for "no third-party trackers on a health
 *  site": only Google Fonts is allowed off-origin, so a stray GA/Meta Pixel
 *  snippet in any page is blocked at the browser even if it slips into HTML.
 */

var SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data:; " +
    "connect-src 'self'; " +
    "object-src 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self'; " +
    "frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

function withSecurityHeaders(response) {
  var out = new Response(response.body, response);
  for (var name in SECURITY_HEADERS) {
    out.headers.set(name, SECURITY_HEADERS[name]);
  }
  return out;
}

export default {
  async fetch(request, env) {
    var url = new URL(request.url);

    if (/^\/invite\/[^/]+\/?$/.test(url.pathname)) {
      url.pathname = '/invite.html';
      return withSecurityHeaders(await env.ASSETS.fetch(new Request(url.toString(), request)));
    }

    var goMatch = url.pathname.match(/^\/go\/([^/]+)\/?$/);
    if (goMatch) {
      url.pathname = '/download.html';
      url.searchParams.set('ct', 'web-' + decodeURIComponent(goMatch[1]));
      return withSecurityHeaders(await env.ASSETS.fetch(new Request(url.toString(), request)));
    }

    return withSecurityHeaders(await env.ASSETS.fetch(request));
  }
};
