document.addEventListener("DOMContentLoaded", function () {
  var navs = document.querySelectorAll("nav");

  navs.forEach(function (nav, index) {
    var menu = nav.querySelector("ul");
    if (!menu) return;

    var menuId = menu.id || "mobile-nav-menu-" + index;
    menu.id = menuId;

    var toggle = nav.querySelector(".mobile-nav-toggle");
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "mobile-nav-toggle";
      toggle.setAttribute("aria-label", "Toggle navigation menu");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-controls", menuId);
      toggle.innerHTML = "<span></span><span></span><span></span>";
      nav.appendChild(toggle);
    }

    function closeMenu() {
      nav.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  });
});
