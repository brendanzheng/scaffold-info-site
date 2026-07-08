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

    // ── Scroll-reveal / entrance animations ──────────────────────────────
    // Elements with [data-reveal] fade/slide in when scrolled into view.
    // Those already in view on load (the hero) animate in immediately.
    var revealEls = document.querySelectorAll("[data-reveal]");
    if (revealEls.length) {
        if ("IntersectionObserver" in window) {
            var io = new IntersectionObserver(function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        obs.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

            revealEls.forEach(function (el) { io.observe(el); });
        } else {
            // No observer support → just show everything.
            revealEls.forEach(function (el) { el.classList.add("is-visible"); });
        }
    }

    // ── Demo 1 · "Set your own agenda" ───────────────────────────────────
    // A faithful mock of the app's opening screen. It auto-types a sample
    // thought into the chatbox, holds, "sends", clears, and loops. Every
    // scheduled step carries a generation token so leaving the viewport
    // cleanly cancels the in-flight run.
    (function initAgendaDemo() {
        var root = document.querySelector('[data-demo="agenda"]');
        if (!root) return;

        var typed = root.querySelector(".demo-typed");
        var prompt = root.getAttribute("data-prompt");
        if (!typed || !prompt) return;

        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var gen = 0;        // bumped on every (re)start to invalidate old timers
        var timers = [];
        var running = false;

        function clearTimers() {
            timers.forEach(clearTimeout);
            timers = [];
        }
        function wait(ms, token, fn) {
            timers.push(setTimeout(function () { if (token === gen) fn(); }, ms));
        }
        function setText(str) {
            typed.textContent = str;
            root.classList.toggle("has-text", str.length > 0);
        }

        // Type `str` character by character, then invoke `done`.
        function typeOut(str, token, done) {
            root.classList.add("is-typing");
            root.classList.remove("is-idle");
            var i = 0;
            (function step() {
                if (token !== gen) return;
                setText(str.slice(0, i));
                if (i >= str.length) {
                    root.classList.remove("is-typing");
                    root.classList.add("is-idle");
                    done();
                    return;
                }
                i++;
                // Slight rhythm: linger a touch after spaces.
                var prev = str.charAt(i - 2);
                var delay = prev === " " ? 78 : 38 + Math.random() * 40;
                timers.push(setTimeout(step, delay));
            })();
        }

        // Type the thought, hold, "send", clear, and repeat.
        function cycle() {
            var token = gen;
            typeOut(prompt, token, function () {
                wait(2000, token, function () {
                    root.classList.add("is-sending");
                    wait(200, token, function () {
                        root.classList.remove("is-sending");
                        setText("");
                        root.classList.remove("is-idle");
                        wait(900, token, cycle);
                    });
                });
            });
        }

        function start() {
            if (running) return;
            running = true;
            gen++;
            if (reduce) { setText(prompt); return; }
            cycle();
        }
        function stop() {
            running = false;
            gen++;                 // invalidate any pending timers
            clearTimers();
            root.classList.remove("is-typing", "is-sending");
        }

        // Only animate while the demo is on screen.
        if ("IntersectionObserver" in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) start();
                    else stop();
                });
            }, { threshold: 0.4 });
            io.observe(root);
        } else {
            start();
        }
    })();
})();
