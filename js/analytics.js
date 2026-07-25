/* MemoryAisle — analytics shim.
 *
 * Third-party analytics (GA4, Meta Pixel) were removed from this site.
 * Health-adjacent browsing data (article slugs, FAQ text, campaign tags
 * naming medications) must never be sent to ad networks.
 *
 * This shim keeps the MAAnalytics API surface so existing callers in
 * main.js, marketing.js, invite.html, download.html, and the blog posts
 * keep working with no HTML edits. Every method is a no-op.
 */
(function (global) {
  'use strict';

  function noop() {}

  global.MAAnalytics = {
    track: noop,
    trackAppStoreClick: noop,
    trackDeepLinkOpen: noop,
    trackWaitlistSignup: noop,
    bindAppStoreLinks: noop,
    initBlogPost: noop,
    init: noop
  };
})(window);
