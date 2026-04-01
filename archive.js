(function () {
  var ARCHIVE_PASSWORD = "12345";

  document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("archive-gate-form");
    var input = document.getElementById("archive-password");
    var err = document.getElementById("archive-gate-error");
    if (!form || !input) return;

    if (document.body.classList.contains("archive-locked")) {
      input.focus();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) err.hidden = true;
      if (input.value === ARCHIVE_PASSWORD) {
        sessionStorage.setItem("archiveUnlocked", "1");
        document.body.classList.remove("archive-locked");
        input.value = "";
      } else if (err) {
        err.hidden = false;
        input.select();
      }
    });
  });
})();

var tablinks = document.getElementsByClassName("tab-links");
var tabcontents = document.getElementsByClassName("tab-contents");
function opentab(tabname) {
  for (tablink of tablinks) {
    tablink.classList.remove("active-link");
  }

  for (tabcontent of tabcontents) {
    tabcontent.classList.remove("active-tab");
  }

  event.currentTarget.classList.add("active-link");
  document.getElementById(tabname).classList.add("active-tab");
}
