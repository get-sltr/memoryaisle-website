/* Share row for blog posts.
 *
 * Self-injecting: drops itself in above the "Related Reading" section, so a
 * post only needs to include this script rather than carry 40 lines of markup
 * that would then drift between files.
 *
 * A note on Instagram. There is no web share URL for it. Meta does not provide
 * a link-sharing intent the way X, LinkedIn, and Facebook do, so a button that
 * claimed to post there would either fail or quietly do nothing. What people
 * actually do is copy the link and paste it into a story or their bio, so that
 * is what the Instagram button does, and it says so.
 */
(function () {
  "use strict";

  function meta(selector, attr) {
    var el = document.querySelector(selector);
    return el ? el.getAttribute(attr || "content") : "";
  }

  function shareTargets(url, title) {
    var u = encodeURIComponent(url);
    var t = encodeURIComponent(title);
    return [
      {
        name: "X",
        label: "Share on X",
        href: "https://twitter.com/intent/tweet?url=" + u + "&text=" + t,
        path: "M18.9 1.6h3.6l-7.9 9 9.3 12.3h-7.3l-5.7-7.5-6.5 7.5H.8l8.4-9.6L.3 1.6h7.5l5.2 6.8ZM17.6 20.7h2L6.5 3.6H4.3Z"
      },
      {
        name: "LinkedIn",
        label: "Share on LinkedIn",
        href: "https://www.linkedin.com/sharing/share-offsite/?url=" + u,
        path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"
      },
      {
        name: "Facebook",
        label: "Share on Facebook",
        href: "https://www.facebook.com/sharer/sharer.php?u=" + u,
        path: "M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.1 24 12.07Z"
      }
    ];
  }

  function build() {
    var related = document.querySelector("section.related");
    if (!related) return;

    var url = meta('link[rel="canonical"]', "href") || window.location.href;
    var title = meta('meta[property="og:title"]') || document.title;

    var section = document.createElement("section");
    section.className = "share wrap wrap-narrow";

    var marker = document.createElement("div");
    marker.className = "share-marker";
    marker.textContent = "Share this";
    section.appendChild(marker);

    var row = document.createElement("div");
    row.className = "share-row";

    shareTargets(url, title).forEach(function (target) {
      var a = document.createElement("a");
      a.className = "share-btn";
      a.href = target.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", target.label);
      a.title = target.label;
      a.innerHTML =
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="' +
        target.path +
        '"/></svg>';
      row.appendChild(a);
    });

    // Instagram: copy the link, because there is no share intent to send it to.
    var copy = document.createElement("button");
    copy.type = "button";
    copy.className = "share-btn";
    copy.setAttribute("aria-label", "Copy link to share on Instagram");
    copy.title = "Copy link for Instagram";
    copy.innerHTML =
      '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63c-.79.3-1.46.72-2.12 1.39C1.35 2.68.93 3.35.63 4.14.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.3.79.72 1.46 1.39 2.12.66.67 1.33 1.09 2.12 1.39.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56.79-.3 1.46-.72 2.12-1.39.67-.66 1.09-1.33 1.39-2.12.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91-.3-.79-.72-1.46-1.39-2.12A5.92 5.92 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32ZM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z"/></svg>';
    copy.addEventListener("click", function () {
      var done = function () {
        var previous = copy.title;
        copy.classList.add("copied");
        copy.title = "Link copied";
        setTimeout(function () {
          copy.classList.remove("copied");
          copy.title = previous;
        }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () {});
      } else {
        var input = document.createElement("input");
        input.value = url;
        document.body.appendChild(input);
        input.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(input);
      }
    });
    row.appendChild(copy);

    var hint = document.createElement("p");
    hint.className = "share-hint";
    hint.textContent = "Instagram does not allow link sharing from the web, so that one copies the link to paste into a story or bio.";

    section.appendChild(row);
    section.appendChild(hint);
    related.parentNode.insertBefore(section, related);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
