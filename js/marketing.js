/* MemoryAisle — App Store URLs, campaign tags, and deep-link helpers */
(function (global) {
  var APP_ID = '6761938171';
  var PT = '128439453';
  var SCHEME = 'memoryaisle';
  var PENDING_REFERRAL_KEY = 'ma_referral_code';
  var LEGACY_REFERRAL_KEY = 'ma_pending_invite';

  function appStoreUrl(ct) {
    return 'https://apps.apple.com/app/apple-store/id' + APP_ID +
      '?pt=' + PT + '&ct=' + encodeURIComponent(ct) + '&mt=8';
  }

  function appStoreReviewsUrl() {
    return 'https://apps.apple.com/us/app/id' + APP_ID + '?see-all=reviews';
  }

  function writeReviewUrl() {
    return 'https://apps.apple.com/app/id' + APP_ID + '?action=write-review';
  }

  function sanitizeCampaignToken(code) {
    var token = String(code || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    return token.slice(0, 32) || 'unknown';
  }

  /** App Store Connect campaign tag — always web-* for attribution. */
  function sanitizeCt(value) {
    var token = String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (!token) return 'web-download';
    if (token.indexOf('web-') === 0) return token.slice(0, 40);
    return ('web-' + token).slice(0, 40);
  }

  /** Resolve ct= from ?ct= or utm_* on the current page (e.g. /download). */
  function campaignTagFromPage() {
    var params = new URLSearchParams(global.location.search);
    var ct = params.get('ct');
    if (ct) return sanitizeCt(decodeURIComponent(ct));

    var source = (params.get('utm_source') || '').toLowerCase();
    var medium = (params.get('utm_medium') || '').toLowerCase();
    var campaign = (params.get('utm_campaign') || '').toLowerCase();
    if (!source && !campaign) return '';

    var parts = ['web'];
    if (source) parts.push(source.replace(/[^a-z0-9]/g, '').slice(0, 12));
    if (medium) parts.push(medium.replace(/[^a-z0-9]/g, '').slice(0, 8));
    if (campaign) parts.push(campaign.replace(/[^a-z0-9_-]/g, '').slice(0, 16));
    return sanitizeCt(parts.join('-'));
  }

  /** Short link for social posts: memoryaisle.app/go/fb-ozempic */
  function goUrl(slug, extraQuery) {
    var token = sanitizeCampaignToken(slug);
    var url = 'https://memoryaisle.app/go/' + token;
    if (!extraQuery) return url;
    var q = typeof extraQuery === 'string' ? extraQuery : Object.keys(extraQuery).map(function (k) {
      return encodeURIComponent(k) + '=' + encodeURIComponent(extraQuery[k]);
    }).join('&');
    return q ? url + '?' + q : url;
  }

  /** Direct App Store URL — paste in Facebook when you skip the website. */
  function shareAppStoreUrl(slug) {
    return appStoreUrl(sanitizeCt(slug));
  }

  function inviteCampaignTag(code) {
    return code ? ('web-invite-' + sanitizeCampaignToken(code)) : 'web-invite';
  }

  function inviteStoreUrl(code) {
    return appStoreUrl(inviteCampaignTag(code));
  }

  function inviteCodeFromPath() {
    var parts = global.location.pathname.replace(/\/+$/, '').split('/');
    var inviteIdx = parts.indexOf('invite');
    if (inviteIdx !== -1 && parts[inviteIdx + 1]) {
      return decodeURIComponent(parts[inviteIdx + 1]);
    }
    return new URLSearchParams(global.location.search).get('code') || '';
  }

  /** Opens the app with referral attribution: memoryaisle://referral/{code} */
  function referralDeepLinkPath(code) {
    if (!code) return 'referral';
    return 'referral/' + encodeURIComponent(String(code).trim());
  }

  function savePendingReferral(code) {
    if (!code) return;
    try {
      var normalized = String(code).trim().toLowerCase();
      global.localStorage.setItem(PENDING_REFERRAL_KEY, normalized);
    } catch (e) { /* private browsing */ }
  }

  function loadPendingReferral() {
    try {
      return global.localStorage.getItem(PENDING_REFERRAL_KEY) ||
        global.localStorage.getItem(LEGACY_REFERRAL_KEY) || '';
    } catch (e) {
      return '';
    }
  }

  function clearPendingReferral() {
    try {
      global.localStorage.removeItem(PENDING_REFERRAL_KEY);
      global.localStorage.removeItem(LEGACY_REFERRAL_KEY);
    } catch (e) { /* noop */ }
  }

  // Back-compat aliases used by invite/download pages
  function savePendingInvite(code) { savePendingReferral(code); }
  function loadPendingInvite() { return loadPendingReferral(); }
  function clearPendingInvite() { clearPendingReferral(); }

  function appDeepLink(path) {
    return SCHEME + '://' + path;
  }

  function tryOpenApp(path, fallbackUrl) {
    var start = Date.now();
    global.location.href = appDeepLink(path);
    global.setTimeout(function () {
      if (Date.now() - start < 2200 && fallbackUrl) {
        global.location.href = fallbackUrl;
      }
    }, 1800);
  }

  function trackAppStoreClick(ct, context) {
    if (global.MAAnalytics && typeof global.MAAnalytics.trackAppStoreClick === 'function') {
      global.MAAnalytics.trackAppStoreClick(ct, context ? { page: context } : undefined);
      return;
    }
    if (typeof global.gtag === 'function') {
      global.gtag('event', 'app_store_click', {
        event_category: 'conversion',
        event_label: ct,
        page: context || global.location.pathname
      });
    }
    if (typeof global.fbq === 'function') {
      global.fbq('track', 'Lead', { content_name: ct });
    }
  }

  function bindAppStoreLinks(root) {
    (root || global.document).querySelectorAll('a[data-ct]').forEach(function (el) {
      var ct = el.getAttribute('data-ct');
      if (!el.getAttribute('href') || el.getAttribute('href') === '#') {
        el.setAttribute('href', appStoreUrl(ct));
      }
    });
    if (global.MAAnalytics && typeof global.MAAnalytics.bindAppStoreLinks === 'function') {
      global.MAAnalytics.bindAppStoreLinks();
    }
  }

  global.MA = {
    APP_ID: APP_ID,
    PENDING_REFERRAL_KEY: PENDING_REFERRAL_KEY,
    appStoreUrl: appStoreUrl,
    appStoreReviewsUrl: appStoreReviewsUrl,
    writeReviewUrl: writeReviewUrl,
    sanitizeCt: sanitizeCt,
    campaignTagFromPage: campaignTagFromPage,
    goUrl: goUrl,
    shareAppStoreUrl: shareAppStoreUrl,
    inviteCampaignTag: inviteCampaignTag,
    inviteStoreUrl: inviteStoreUrl,
    inviteCodeFromPath: inviteCodeFromPath,
    referralDeepLinkPath: referralDeepLinkPath,
    savePendingReferral: savePendingReferral,
    loadPendingReferral: loadPendingReferral,
    clearPendingReferral: clearPendingReferral,
    savePendingInvite: savePendingInvite,
    loadPendingInvite: loadPendingInvite,
    clearPendingInvite: clearPendingInvite,
    appDeepLink: appDeepLink,
    tryOpenApp: tryOpenApp,
    trackAppStoreClick: trackAppStoreClick,
    bindAppStoreLinks: bindAppStoreLinks
  };
})(window);
