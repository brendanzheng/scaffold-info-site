// Scaffold info site — small progressive-enhancement helpers.
// The site works fully without JS; this just adds the mobile menu and year.

(function () {
    "use strict";

    // ── Mobile nav toggle ────────────────────────────────────────────────
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("nav");

    if (toggle && nav) {
        toggle.addEventListener("click", function () {
            var open = nav.classList.toggle("open");
            toggle.setAttribute("aria-expanded", open ? "true" : "false");
        });

        // Close the menu when a link is tapped (single-page feel on mobile).
        nav.addEventListener("click", function (e) {
            if (e.target.closest("a")) {
                nav.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });

        // Close on Escape.
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && nav.classList.contains("open")) {
                nav.classList.remove("open");
                toggle.setAttribute("aria-expanded", "false");
                toggle.focus();
            }
        });
    }

    // ── Footer year ──────────────────────────────────────────────────────
    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
})();
