/* MemoryAisle — centralized GA4 + Meta Pixel event tracking */
(function (global) {
  'use strict';

  var UTM_KEY = 'ma_utm';
  var articleOverride = null;
  var clickBound = false;

  function captureUtm() {
    try {
      var params = new URLSearchParams(global.location.search);
      var utm = {};
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (key) {
        var value = params.get(key);
        if (value) utm[key] = value;
      });
      if (Object.keys(utm).length) {
        global.sessionStorage.setItem(UTM_KEY, JSON.stringify(utm));
      }
    } catch (e) { /* private browsing */ }
  }

  function loadUtm() {
    try {
      var raw = global.sessionStorage.getItem(UTM_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function pathname() {
    return (global.location.pathname || '/')
      .replace(/\/index\.html$/i, '/')
      .replace(/\/$/, '') || '/';
  }

  function pageContext() {
    var path = pathname();
    var ctx = { page_path: path };

    if (articleOverride) {
      ctx.article_slug = articleOverride;
      ctx.content_group = 'Blog';
      ctx.page_type = 'blog_post';
      return ctx;
    }

    if (path === '/' || path === '') {
      ctx.page_type = 'home';
      ctx.content_group = 'Marketing';
      ctx.article_slug = 'home';
    } else if (path === '/blog') {
      ctx.page_type = 'blog_index';
      ctx.content_group = 'Blog';
      ctx.article_slug = 'blog-index';
    } else if (path.indexOf('/blog/') === 0) {
      ctx.page_type = 'blog_post';
      ctx.content_group = 'Blog';
      ctx.article_slug = path.split('/').pop();
    } else if (path === '/download') {
      ctx.page_type = 'landing_download';
      ctx.content_group = 'Marketing';
    } else if (path.indexOf('/invite') === 0) {
      ctx.page_type = 'landing_invite';
      ctx.content_group = 'Marketing';
    } else if (path === '/press') {
      ctx.page_type = 'press';
      ctx.content_group = 'Press';
      ctx.article_slug = 'press';
    } else if (path === '/pricing') {
      ctx.page_type = 'pricing';
      ctx.content_group = 'Marketing';
    } else if (path === '/help') {
      ctx.page_type = 'help';
      ctx.content_group = 'Support';
    } else {
      ctx.page_type = path.replace(/^\//, '').replace(/\//g, '_') || 'unknown';
      ctx.content_group = 'Other';
    }

    var bodyType = global.document.body && global.document.body.getAttribute('data-analytics-page-type');
    if (bodyType) ctx.page_type = bodyType;

    return ctx;
  }

  function track(eventName, params, options) {
    if (typeof global.gtag !== 'function') return;
    global.gtag('event', eventName, Object.assign({
      transport_type: 'beacon'
    }, pageContext(), loadUtm(), params || {}, options || {}));
  }

  function ctFromHref(href) {
    return (String(href).match(/[?&]ct=([^&]+)/) || [])[1] || 'unknown';
  }

  function isAppStoreConversionLink(href) {
    if (!href || href.indexOf('apps.apple.com') === -1) return false;
    return !/see-all=reviews|action=write-review/i.test(href);
  }

  function trackAppStoreClick(campaignTag, extra) {
    var ct = campaignTag || 'unknown';
    var params = Object.assign({
      event_category: 'conversion',
      event_label: ct,
      campaign_tag: ct
    }, extra || {});

    track('app_store_click', params);
    track('generate_lead', Object.assign({ method: 'app_store' }, params));

    if (typeof global.fbq === 'function') {
      global.fbq('track', 'Lead', { content_name: ct });
    }
  }

  function navigateAfterTrack(url, campaignTag) {
    var navigated = false;
    function go() {
      if (navigated) return;
      navigated = true;
      global.location.href = url;
    }

    var ct = campaignTag || ctFromHref(url);
    var base = Object.assign({
      event_category: 'conversion',
      event_label: ct,
      campaign_tag: ct,
      transport_type: 'beacon'
    }, pageContext(), loadUtm());

    if (typeof global.fbq === 'function') {
      global.fbq('track', 'Lead', { content_name: ct });
    }

    if (typeof global.gtag !== 'function') {
      go();
      return;
    }

    var pending = 2;
    function done() {
      pending -= 1;
      if (pending <= 0) go();
    }

    global.gtag('event', 'app_store_click', Object.assign({}, base, { event_callback: done }));
    global.gtag('event', 'generate_lead', Object.assign({ method: 'app_store' }, base, { event_callback: done }));
    global.setTimeout(go, 500);
  }

  function trackDeepLinkOpen(code, extra) {
    track('deep_link_open', Object.assign({
      event_category: 'engagement',
      event_label: code || 'none',
      referral_code: code || ''
    }, extra || {}));
  }

  function trackWaitlistSignup(label) {
    track('waitlist_signup', {
      event_category: 'engagement',
      event_label: label || 'homepage_waitlist'
    });
    if (typeof global.fbq === 'function') global.fbq('track', 'Lead');
  }

  function bindAppStoreLinks() {
    if (clickBound) return;
    clickBound = true;

    global.document.addEventListener('click', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('a') : null;
      if (!el || !el.href || el.dataset.maAnalyticsSkip) return;
      if (!isAppStoreConversionLink(el.href)) return;
      if (el.target === '_blank') return;
      e.preventDefault();
      navigateAfterTrack(el.href, el.getAttribute('data-ct'));
    }, true);
  }

  function initBlogPost(slug) {
    articleOverride = slug;
    var doc = global.document;

    doc.querySelectorAll('.related-link').forEach(function (el) {
      el.addEventListener('click', function () {
        track('related_click', { link_url: el.href });
      });
    });

    doc.querySelectorAll('.faq details').forEach(function (details) {
      details.addEventListener('toggle', function () {
        if (!details.open) return;
        var summary = details.querySelector('summary');
        track('faq_open', { question: summary ? summary.textContent.trim() : '' });
      });
    });

    var hits = {};
    global.addEventListener('scroll', function () {
      var dh = doc.documentElement.scrollHeight - global.innerHeight;
      if (dh <= 0) return;
      var pct = Math.round(global.scrollY / dh * 100);
      [25, 50, 75, 100].forEach(function (milestone) {
        if (pct >= milestone && !hits[milestone]) {
          hits[milestone] = true;
          track('scroll_depth', { event_category: 'engagement', value: milestone });
        }
      });
    }, { passive: true });

    global.setTimeout(function () {
      track('engaged_read', { engagement_time_msec: 30000 });
    }, 30000);
  }

  function init() {
    captureUtm();
    bindAppStoreLinks();
  }

  global.MAAnalytics = {
    track: track,
    trackAppStoreClick: trackAppStoreClick,
    trackDeepLinkOpen: trackDeepLinkOpen,
    trackWaitlistSignup: trackWaitlistSignup,
    bindAppStoreLinks: bindAppStoreLinks,
    initBlogPost: initBlogPost,
    init: init
  };

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
