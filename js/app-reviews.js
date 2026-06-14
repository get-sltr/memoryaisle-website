/* MemoryAisle — live App Store ratings & reviews via Apple's public iTunes RSS feed */
(function (global) {
  var APP_ID = '6761938171';
  var RSS_URL = 'https://itunes.apple.com/us/rss/customerreviews/id=' + APP_ID + '/sortBy=mostRecent/json';
  var MAX_REVIEWS = 6;

  function starsHtml(rating) {
    var n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    var out = '';
    for (var i = 1; i <= 5; i++) {
      out += '<span class="star-glyph' + (i <= n ? ' is-filled' : '') + '" aria-hidden="true">★</span>';
    }
    return out;
  }

  function formatDate(iso) {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch (e) {
      return '';
    }
  }

  function truncate(text, max) {
    if (!text || text.length <= max) return text;
    return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }

  function parseReviews(data) {
    var entries = data && data.feed && data.feed.entry;
    if (!entries) return [];
    if (!Array.isArray(entries)) entries = [entries];
    return entries.filter(function (e) {
      return e && e['im:rating'] && e.content;
    }).map(function (e) {
      return {
        id: e.id && e.id.label,
        rating: Number(e['im:rating'].label),
        title: e.title && e.title.label,
        body: e.content && e.content.label,
        author: e.author && e.author.name && e.author.name.label,
        date: e.updated && e.updated.label,
        version: e['im:version'] && e['im:version'].label
      };
    });
  }

  function renderSummary(el, reviews) {
    if (!reviews.length) {
      el.innerHTML = '<p class="reviews-empty">Reviews on the App Store</p>';
      return;
    }
    var sum = reviews.reduce(function (acc, r) { return acc + r.rating; }, 0);
    var avg = (sum / reviews.length).toFixed(1);
    var reviewsUrl = global.MA ? global.MA.appStoreReviewsUrl() :
      'https://apps.apple.com/us/app/id' + APP_ID + '?see-all=reviews';
    el.innerHTML =
      '<div class="reviews-summary-inner">' +
        '<div class="reviews-stars" aria-label="' + avg + ' out of 5 stars">' + starsHtml(avg) + '</div>' +
        '<p class="reviews-score"><strong>' + avg + '</strong> on the App Store</p>' +
        '<a class="reviews-link" href="' + reviewsUrl + '" target="_blank" rel="noopener">Read all reviews →</a>' +
      '</div>';
  }

  function renderList(el, reviews) {
    if (!reviews.length) {
      el.innerHTML = '';
      return;
    }
    var html = reviews.slice(0, MAX_REVIEWS).map(function (r) {
      return (
        '<article class="review-card">' +
          '<div class="review-card-head">' +
            '<div class="review-card-stars" aria-label="' + r.rating + ' out of 5">' + starsHtml(r.rating) + '</div>' +
            '<span class="review-card-date">' + formatDate(r.date) + '</span>' +
          '</div>' +
          (r.title ? '<h3 class="review-card-title">' + escapeHtml(r.title) + '</h3>' : '') +
          '<p class="review-card-body">' + escapeHtml(truncate(r.body, 320)) + '</p>' +
          '<footer class="review-card-meta">' + escapeHtml(r.author || 'App Store reviewer') +
            (r.version ? ' · v' + escapeHtml(r.version) : '') + '</footer>' +
        '</article>'
      );
    }).join('');
    el.innerHTML = html;
  }

  function renderHero(el, reviews) {
    if (!reviews.length) return;
    var sum = reviews.reduce(function (acc, r) { return acc + r.rating; }, 0);
    var avg = (sum / reviews.length).toFixed(1);
    var reviewsUrl = global.MA ? global.MA.appStoreReviewsUrl() :
      'https://apps.apple.com/us/app/id' + APP_ID + '?see-all=reviews';
    el.innerHTML =
      '<a class="hero-rating" href="' + reviewsUrl + '" target="_blank" rel="noopener">' +
        '<span class="hero-rating-stars" aria-hidden="true">' + starsHtml(avg) + '</span>' +
        '<span class="hero-rating-text">' + avg + ' · App Store</span>' +
      '</a>';
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function init() {
    var summaryEls = global.document.querySelectorAll('[data-app-reviews="summary"]');
    var listEls = global.document.querySelectorAll('[data-app-reviews="list"]');
    var heroEls = global.document.querySelectorAll('[data-app-reviews="hero"]');
    if (!summaryEls.length && !listEls.length && !heroEls.length) return;

    fetch(RSS_URL)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var reviews = parseReviews(data);
        summaryEls.forEach(function (el) { renderSummary(el, reviews); });
        listEls.forEach(function (el) { renderList(el, reviews); });
        heroEls.forEach(function (el) { renderHero(el, reviews); });
      })
      .catch(function () {
        summaryEls.forEach(function (el) {
          el.innerHTML = '<p class="reviews-empty"><a href="https://apps.apple.com/us/app/id' + APP_ID + '?see-all=reviews" target="_blank" rel="noopener">See reviews on the App Store →</a></p>';
        });
      });
  }

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
