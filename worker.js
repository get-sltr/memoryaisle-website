/** Cloudflare Worker — route /invite/{code} to invite.html (mirrors vercel.json rewrite) */
export default {
  async fetch(request, env) {
    var url = new URL(request.url);

    if (/^\/invite\/[^/]+\/?$/.test(url.pathname)) {
      url.pathname = '/invite.html';
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    var goMatch = url.pathname.match(/^\/go\/([^/]+)\/?$/);
    if (goMatch) {
      url.pathname = '/download.html';
      url.searchParams.set('ct', 'web-' + decodeURIComponent(goMatch[1]));
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    return env.ASSETS.fetch(request);
  }
};
