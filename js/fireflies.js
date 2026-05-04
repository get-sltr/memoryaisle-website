/* MemoryAisle — atmospheric firefly canvas with cursor parallax */
(function () {
  const canvas = document.querySelector('.bg-fireflies');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let fireflies = [];
  const mouse = { x: -9999, y: -9999, active: false };
  let smoothX = 0, smoothY = 0;
  let running = true;

  // Pre-rendered radial gradient sprite — cheaper than per-frame gradients.
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 64;
  (function () {
    const sctx = sprite.getContext('2d');
    const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0,    'rgba(255, 248, 216, 1)');
    g.addColorStop(0.18, 'rgba(245, 217, 122, 0.65)');
    g.addColorStop(0.45, 'rgba(184, 138, 61, 0.18)');
    g.addColorStop(1,    'rgba(184, 138, 61, 0)');
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 64, 64);
  })();

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  }

  function seed() {
    const density = Math.min(360, Math.max(120, Math.floor((w * h) / 4200)));
    fireflies = [];
    for (let i = 0; i < density; i++) {
      const depth = 0.25 + Math.random() * 1.6;
      fireflies.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: (0.6 + Math.random() * 1.8) * (0.55 + depth * 0.35),
        a: 0.30 + Math.random() * 0.55,
        d: depth,
        p: Math.random() * Math.PI * 2,
        s: 0.25 + Math.random() * 0.7,
        amp: 3 + Math.random() * 12,
        tw: 0.4 + Math.random() * 0.8
      });
    }
  }

  function onPointer(e) {
    const t = e.touches && e.touches[0];
    const x = t ? t.clientX : e.clientX;
    const y = t ? t.clientY : e.clientY;
    if (typeof x !== 'number') return;
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;
  }
  function onLeave() { mouse.active = false; }

  let t0 = performance.now();
  function frame(now) {
    if (!running) return;
    const t = (now - t0) / 1000;

    const tx = mouse.active ? (mouse.x / w - 0.5) : 0;
    const ty = mouse.active ? (mouse.y / h - 0.5) : 0;
    smoothX += (tx - smoothX) * 0.06;
    smoothY += (ty - smoothY) * 0.06;

    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';

    for (let i = 0; i < fireflies.length; i++) {
      const f = fireflies[i];
      const drift = reduce ? 0 : 1;
      const px = f.x + Math.sin(t * f.s + f.p) * f.amp * drift - smoothX * 80 * f.d;
      const py = f.y + Math.cos(t * f.s * 0.7 + f.p) * f.amp * 0.8 * drift - smoothY * 80 * f.d;
      const tw = 0.55 + Math.sin(t * 1.8 * f.tw + f.p * 2.3) * 0.45;

      let boost = 1;
      if (mouse.active) {
        const dx = mouse.x - px, dy = mouse.y - py;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < 200 * 200) boost = 1 + (1 - Math.sqrt(dist2) / 200) * 1.6;
      }

      const alpha = Math.min(1, f.a * tw * boost);
      const radius = f.r * (1 + (boost - 1) * 0.4);
      const size = radius * 8;
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, px - size / 2, py - size / 2, size, size);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(frame);
  }

  function start() {
    if (running) return;
    running = true;
    t0 = performance.now();
    requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('mousemove', onPointer, { passive: true });
  window.addEventListener('touchmove', onPointer, { passive: true });
  window.addEventListener('mouseleave', onLeave);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });
  requestAnimationFrame(frame);
})();
