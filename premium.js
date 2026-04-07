/* ==========================================================================
   premium.js (global)
   High-end animated cursor:
   - Smooth magnetic follow (rAF + lerp)
   - Hover expansion on interactive elements
   - Click ripple/burst
   - Touch/coarse pointer safe (auto-disabled)
   - Accessible (aria-hidden, no focus interference)
   ========================================================================== */

(function () {
  "use strict";

  // Disable on touch devices / coarse pointers.
  var isCoarse =
    window.matchMedia &&
    (window.matchMedia("(hover: none)").matches ||
      window.matchMedia("(pointer: coarse)").matches);

  if (isCoarse) return;

  var root = document.documentElement;

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Create cursor DOM
  var cursor = document.createElement("div");
  cursor.className = "mt-cursor";
  cursor.setAttribute("aria-hidden", "true");

  var ring = document.createElement("div");
  ring.className = "mt-cursor__ring";

  var dot = document.createElement("div");
  dot.className = "mt-cursor__dot";

  cursor.appendChild(ring);
  cursor.appendChild(dot);

  // Mount asap (before DOMContentLoaded if possible)
  if (document.body) document.body.appendChild(cursor);
  else
    document.addEventListener("DOMContentLoaded", function () {
      document.body.appendChild(cursor);
    });

  // Only hide the native cursor when we know we can render ours
  root.classList.add("cursor-enabled");

  // Motion settings from CSS variables (read once; can be changed live if needed)
  function getCssNumber(name, fallback) {
    var v = getComputedStyle(root).getPropertyValue(name).trim();
    var n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  }

  var lerpDot = getCssNumber("--cursor-lerp-dot", 0.36);
  var lerpRing = getCssNumber("--cursor-lerp-ring", 0.18);

  // Current + target positions (client coordinates)
  var targetX = -9999;
  var targetY = -9999;
  var dotX = targetX;
  var dotY = targetY;
  var ringX = targetX;
  var ringY = targetY;

  // If user prefers reduced motion: reduce animations & smoothing.
  if (reduceMotion) {
    lerpDot = 0.55;
    lerpRing = 0.3;
    cursor.style.setProperty("animation", "none");
  }

  var rafId = 0;
  var lastTs = 0;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function render(ts) {
    rafId = window.requestAnimationFrame(render);

    // Keep frame-to-frame stable even when tab was backgrounded.
    var dt = ts - lastTs;
    lastTs = ts;
    if (dt > 120) dt = 16.7;

    dotX = lerp(dotX, targetX, lerpDot);
    dotY = lerp(dotY, targetY, lerpDot);
    ringX = lerp(ringX, targetX, lerpRing);
    ringY = lerp(ringY, targetY, lerpRing);

    // GPU-friendly translate only (no layout thrash)
    dot.style.transform =
      "translate3d(" + dotX + "px," + dotY + "px,0)";
    ring.style.transform =
      "translate3d(" + ringX + "px," + ringY + "px,0)";

    // Feed CSS animation with current ring position (used by breathe keyframes)
    cursor.style.setProperty("--mt-x", ringX + "px");
    cursor.style.setProperty("--mt-y", ringY + "px");
  }

  function onMove(e) {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!rafId) {
      lastTs = performance.now();
      rafId = window.requestAnimationFrame(render);
    }
  }

  window.addEventListener("mousemove", onMove, { passive: true });

  // Hide cursor when leaving window, show when re-entering
  window.addEventListener(
    "mouseleave",
    function () {
      cursor.style.opacity = "0";
    },
    { passive: true }
  );
  window.addEventListener(
    "mouseenter",
    function () {
      cursor.style.opacity = "1";
    },
    { passive: true }
  );

  // Hover detection (event delegation)
  var hoverSelector =
    "a, button, input, textarea, select, summary, label, [role='button'], .cursor-hover, [data-cursor-hover]";

  function isInteractive(el) {
    if (!el || el === document.documentElement) return false;
    return !!(el.closest && el.closest(hoverSelector));
  }

  document.addEventListener(
    "mouseover",
    function (e) {
      if (isInteractive(e.target)) cursor.classList.add("is-hover");
    },
    { passive: true }
  );

  document.addEventListener(
    "mouseout",
    function (e) {
      // If moving between children of the same interactive element, keep hover on.
      var fromInteractive = e.target && e.target.closest && e.target.closest(hoverSelector);
      var toInteractive =
        e.relatedTarget &&
        e.relatedTarget.closest &&
        e.relatedTarget.closest(hoverSelector);
      if (fromInteractive && toInteractive && fromInteractive === toInteractive) return;
      cursor.classList.remove("is-hover");
    },
    { passive: true }
  );

  // Click burst / ripple
  var clickTimer = 0;
  window.addEventListener(
    "mousedown",
    function () {
      cursor.classList.add("is-down");
      cursor.classList.add("is-click");
      window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(function () {
        cursor.classList.remove("is-click");
      }, 260);
    },
    { passive: true }
  );

  window.addEventListener(
    "mouseup",
    function () {
      cursor.classList.remove("is-down");
    },
    { passive: true }
  );

  // Safety: if the tab loses visibility, stop animating; resume when visible.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    } else {
      // Resume when user moves again; keep current positions
      lastTs = performance.now();
    }
  });
})();

/* ==========================================================================
   Work grid thumbnails: swap to zoom WebP in-place on hover (no popup)
   Runs on all devices; hover only applies on fine pointers / desktop.
   ========================================================================== */

(function () {
  "use strict";

  var WORK_ZOOM_MAP = {
    "darmoshark.html": "Images/darmozoom.webp",
    "tagease.html": "Images/tageasezoom.webp",
    "ite.html": "Images/Itezoom.webp",
    "luck boba.html": "Images/luckbobazoom.webp",
    "griz.html": "Images/grizzoom.webp",
    "allrage.html": "Images/allragezoom.webp",
  };

  function normalizeHrefFilename(href) {
    if (!href) return "";
    try {
      var u = new URL(href, window.location.href);
      var name = u.pathname.split("/").pop() || "";
      return decodeURIComponent(name).trim().toLowerCase();
    } catch (err) {
      var parts = href.split(/[\\/]/);
      return decodeURIComponent(parts[parts.length - 1] || "")
        .trim()
        .toLowerCase();
    }
  }

  function applyZoom(link) {
    var img = link.querySelector("img");
    if (!img) return;
    var zoom = WORK_ZOOM_MAP[normalizeHrefFilename(link.getAttribute("href"))];
    if (!zoom) return;
    if (!Object.prototype.hasOwnProperty.call(img.dataset, "mtOrigSrc")) {
      img.dataset.mtOrigSrc = img.getAttribute("src") || "";
    }
    if (img.getAttribute("src") !== zoom) img.src = zoom;
  }

  function restoreZoom(link) {
    var img = link.querySelector("img");
    if (!img || !Object.prototype.hasOwnProperty.call(img.dataset, "mtOrigSrc")) {
      return;
    }
    img.src = img.dataset.mtOrigSrc;
  }

  document.addEventListener(
    "mouseover",
    function (e) {
      var link =
        e.target.closest &&
        e.target.closest("article.work .img-container a[href]");
      if (!link) return;
      applyZoom(link);
    },
    { passive: true }
  );

  document.addEventListener(
    "mouseout",
    function (e) {
      var link =
        e.target.closest &&
        e.target.closest("article.work .img-container a[href]");
      if (!link) return;
      var to = e.relatedTarget;
      if (to && link.contains(to)) return;
      restoreZoom(link);
    },
    { passive: true }
  );
})();
