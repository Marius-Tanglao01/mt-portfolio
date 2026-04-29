/* ==========================================================================
   premium.js (global)
   Lightweight global enhancements (cursor removed)
   ========================================================================== */

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
