/** Cloudflare Worker — route /invite/{code} to invite.html (mirrors vercel.json rewrite) */
export default {
  async fetch(request, env) {
    var url = new URL(request.url);

    if (/^\/invite\/[^/]+\/?$/.test(url.pathname)) {
      url.pathname = '/invite.html';
      return env.ASSETS.fetch(new Request(url.toString(), request));
    }

    return env.ASSETS.fetch(request);
  }
};
