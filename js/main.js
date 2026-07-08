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

    // ── Demo 3 · "Establish your own criteria for success" ───────────────
    // A demo cursor glides to the wrap-up checkmark, "clicks" it to open the
    // end-session confirmation, then "clicks" Yes, end session — the session
    // softens into its ended state, and the whole thing loops. Every step
    // carries a generation token so leaving the viewport cancels cleanly.
    (function initConcludeDemo() {
        var root = document.querySelector('[data-demo="conclude"]');
        if (!root) return;

        var cursor = root.querySelector(".demo-cursor");
        var check = root.querySelector(".demo-check");
        var endBtn = root.querySelector(".demo-end");
        if (!cursor || !check || !endBtn) return;

        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var gen = 0;
        var timers = [];
        var running = false;

        // The cursor's drawn tip sits ~1/6 into its 22px box; offset so the tip
        // (not the box corner) lands on the target point.
        var TIP_X = 3.7, TIP_Y = 1.8;

        function clearTimers() { timers.forEach(clearTimeout); timers = []; }
        function wait(ms, token, fn) {
            timers.push(setTimeout(function () { if (token === gen) fn(); }, ms));
        }

        // Point the cursor at the centre of `el`, expressed relative to root.
        function pointTo(el) {
            var r = el.getBoundingClientRect();
            var rr = root.getBoundingClientRect();
            cursor.style.setProperty("--cx", (r.left - rr.left + r.width / 2 - TIP_X) + "px");
            cursor.style.setProperty("--cy", (r.top - rr.top + r.height / 2 - TIP_Y) + "px");
        }
        // Snap to a point with no transition (used to place the cursor at rest
        // before the run begins, so it doesn't fly in from the corner).
        function snapTo(el) {
            var prev = cursor.style.transition;
            cursor.style.transition = "none";
            pointTo(el);
            void cursor.offsetWidth;              // force reflow
            cursor.style.transition = prev;
        }

        function resetState() {
            root.classList.remove("is-open", "is-ended", "is-hover-check",
                "is-press-check", "is-hover-end", "is-press-end");
        }

        function cycle() {
            var token = gen;
            resetState();
            snapTo(root.querySelector(".demo-input"));   // rest over the prompt bar

            // 1 · glide to the checkmark
            wait(700, token, function () { pointTo(check); });
            // 2 · hover, then press the checkmark → open the confirmation
            wait(1500, token, function () { root.classList.add("is-hover-check"); });
            wait(1750, token, function () { root.classList.add("is-press-check"); });
            wait(1900, token, function () {
                root.classList.remove("is-press-check", "is-hover-check");
                root.classList.add("is-open");
            });
            // 3 · glide to Yes, end session
            wait(2500, token, function () { pointTo(endBtn); });
            // 4 · hover, then press it → the session ends
            wait(3300, token, function () { root.classList.add("is-hover-end"); });
            wait(3550, token, function () { root.classList.add("is-press-end"); });
            wait(3720, token, function () {
                root.classList.remove("is-press-end", "is-hover-end", "is-open");
                root.classList.add("is-ended");
            });
            // 5 · hold on the ended state, then loop
            wait(5600, token, cycle);
        }

        function start() {
            if (running) return;
            running = true;
            gen++;
            root.classList.add("is-running");
            if (reduce) { root.classList.add("is-open"); return; }
            cycle();
        }
        function stop() {
            running = false;
            gen++;
            clearTimers();
            root.classList.remove("is-running");
            resetState();
        }

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

    // ── Demo 4 · "Reflect on your progress" ──────────────────────────────
    // The frozen "interaction completed" card. A demo cursor clicks "+ Add
    // takeaway", a field drops in, and a takeaway auto-types into it — then
    // the field clears and it loops. The completed-on timestamp is stamped
    // with the current date/time (matching App.tsx formatInteractionDate).
    (function initReflectDemo() {
        var root = document.querySelector('[data-demo="reflect"]');
        if (!root) return;

        var cursor = root.querySelector(".demo-cursor");
        var addBtn = root.querySelector(".demo-tk-add");
        var field = root.querySelector(".demo-tk-field");
        var typed = root.querySelector(".demo-tk-typed");
        var when = root.querySelector(".demo-tk-when");
        var text = root.getAttribute("data-takeaway");
        if (!cursor || !addBtn || !field || !typed || !when || !text) return;

        // Stamp the completion time — "M/D/YYYY; h:mm am/pm", as in the app.
        (function stampWhen() {
            var d = new Date();
            var h = d.getHours();
            var ampm = h >= 12 ? "pm" : "am";
            h = h % 12; if (h === 0) h = 12;
            var m = String(d.getMinutes()).padStart(2, "0");
            when.textContent = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + "; " + h + ":" + m + " " + ampm;
        })();

        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var gen = 0;
        var timers = [];
        var running = false;
        var TIP_X = 3.7, TIP_Y = 1.8;

        function clearTimers() { timers.forEach(clearTimeout); timers = []; }
        function wait(ms, token, fn) {
            timers.push(setTimeout(function () { if (token === gen) fn(); }, ms));
        }
        function pointTo(el) {
            var r = el.getBoundingClientRect();
            var rr = root.getBoundingClientRect();
            cursor.style.setProperty("--cx", (r.left - rr.left + r.width / 2 - TIP_X) + "px");
            cursor.style.setProperty("--cy", (r.top - rr.top + r.height / 2 - TIP_Y) + "px");
        }
        function snapTo(el) {
            var prev = cursor.style.transition;
            cursor.style.transition = "none";
            pointTo(el);
            void cursor.offsetWidth;
            cursor.style.transition = prev;
        }
        function setText(str) {
            typed.textContent = str;
            root.classList.toggle("tk-has-text", str.length > 0);
        }

        // Type the takeaway character by character, then invoke `done`.
        function typeOut(str, token, done) {
            root.classList.add("tk-typing", "tk-has-text");
            root.classList.remove("tk-idle");
            var i = 0;
            (function step() {
                if (token !== gen) return;
                setText(str.slice(0, i));
                if (i >= str.length) {
                    root.classList.remove("tk-typing");
                    root.classList.add("tk-idle");
                    done();
                    return;
                }
                i++;
                var prev = str.charAt(i - 2);
                var delay = prev === " " ? 70 : 34 + Math.random() * 36;
                timers.push(setTimeout(step, delay));
            })();
        }

        // Slide the cursor down and off the window (and fade it), as if the
        // user let go of the mouse to type.
        function slideAway() {
            var rr = root.getBoundingClientRect();
            var app = root.querySelector(".demo-app").getBoundingClientRect();
            cursor.style.setProperty("--cx", (app.right - rr.left - 60) + "px");
            cursor.style.setProperty("--cy", (app.bottom - rr.top + 48) + "px");
            cursor.style.opacity = "0";
        }

        function cycle() {
            var token = gen;
            root.classList.remove("is-adding", "is-press-add", "tk-typing", "tk-idle", "tk-has-text");
            setText("");
            cursor.style.opacity = "";                         // restore (is-running → 1)
            snapTo(root.querySelector(".demo-tk-continue"));   // rest on the action row

            // 1 · glide to "+ Add takeaway" and press it
            wait(700, token, function () { pointTo(addBtn); });
            wait(1450, token, function () { root.classList.add("is-press-add"); });
            wait(1620, token, function () {
                root.classList.remove("is-press-add");
                root.classList.add("is-adding", "tk-idle");   // field drops in, caret blinks
            });
            // 2 · move into the field, then slide the cursor away as typing starts
            wait(2200, token, function () { pointTo(field); });
            wait(2900, token, function () {
                typeOut(text, token, function () {
                    // 4 · hold on the finished takeaway, then loop
                    wait(2800, token, cycle);
                });
            });
            // 3 · once typing is underway, the "user" moves the cursor off-window
            wait(3350, token, slideAway);
        }

        function start() {
            if (running) return;
            running = true;
            gen++;
            root.classList.add("is-running");
            if (reduce) { root.classList.add("is-adding", "tk-has-text"); setText(text); return; }
            cycle();
        }
        function stop() {
            running = false;
            gen++;
            clearTimers();
            root.classList.remove("is-running", "is-adding", "is-press-add", "tk-typing", "tk-idle");
        }

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

    // ── Demo 5 · "Save and export for future reference" ──────────────────
    // The full app window. A demo cursor clicks "Export chat" to open the
    // file-type menu, then clicks "Text file"; the menu closes and it loops.
    // The completed-on timestamp is stamped with the current date/time.
    (function initExportDemo() {
        var root = document.querySelector('[data-demo="export"]');
        if (!root) return;

        var cursor = root.querySelector(".demo-cursor");
        var exportBtn = root.querySelector(".demo-export-btn");
        var textBtn = root.querySelector(".demo-ex-text");
        var when = root.querySelector(".demo-tk-when");
        if (!cursor || !exportBtn || !textBtn || !when) return;

        // Stamp the completion time — "M/D/YYYY; h:mm am/pm", as in the app.
        (function stampWhen() {
            var d = new Date();
            var h = d.getHours();
            var ampm = h >= 12 ? "pm" : "am";
            h = h % 12; if (h === 0) h = 12;
            var m = String(d.getMinutes()).padStart(2, "0");
            when.textContent = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + "; " + h + ":" + m + " " + ampm;
        })();

        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var gen = 0;
        var timers = [];
        var running = false;
        var TIP_X = 3.7, TIP_Y = 1.8;

        function clearTimers() { timers.forEach(clearTimeout); timers = []; }
        function wait(ms, token, fn) {
            timers.push(setTimeout(function () { if (token === gen) fn(); }, ms));
        }
        function pointTo(el) {
            var r = el.getBoundingClientRect();
            var rr = root.getBoundingClientRect();
            cursor.style.setProperty("--cx", (r.left - rr.left + r.width / 2 - TIP_X) + "px");
            cursor.style.setProperty("--cy", (r.top - rr.top + r.height / 2 - TIP_Y) + "px");
        }
        function snapTo(el) {
            var prev = cursor.style.transition;
            cursor.style.transition = "none";
            pointTo(el);
            void cursor.offsetWidth;
            cursor.style.transition = prev;
        }

        function cycle() {
            var token = gen;
            root.classList.remove("is-menu-open", "is-press-export", "is-hover-text", "is-press-text");
            snapTo(root.querySelector(".demo-card"));    // rest over the interaction

            // 1 · glide to "Export chat" and press it → menu opens
            wait(800, token, function () { pointTo(exportBtn); });
            wait(1600, token, function () { root.classList.add("is-press-export"); });
            wait(1770, token, function () {
                root.classList.remove("is-press-export");
                root.classList.add("is-menu-open");
            });
            // 2 · move down to "Text file" and press it
            wait(2400, token, function () { pointTo(textBtn); });
            wait(3150, token, function () { root.classList.add("is-hover-text"); });
            wait(3400, token, function () { root.classList.add("is-press-text"); });
            wait(3570, token, function () {
                root.classList.remove("is-press-text", "is-hover-text", "is-menu-open");
            });
            // 3 · hold, then loop
            wait(5200, token, cycle);
        }

        function start() {
            if (running) return;
            running = true;
            gen++;
            root.classList.add("is-running");
            if (reduce) { root.classList.add("is-menu-open"); return; }
            cycle();
        }
        function stop() {
            running = false;
            gen++;
            clearTimers();
            root.classList.remove("is-running", "is-menu-open", "is-press-export", "is-hover-text", "is-press-text");
        }

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

    // ── Demo 2 · "Remember kernels of insight" ───────────────────────────
    // A demo cursor drags across a sentence to select it, moves to the Bold
    // (B) tool, clicks it, and the sentence turns bold — then it loops.
    (function initHighlightDemo() {
        var root = document.querySelector('[data-demo="highlight"]');
        if (!root) return;

        var cursor = root.querySelector(".demo-cursor");
        var boldable = root.querySelector(".demo-boldable");
        var boldBtn = root.querySelector(".demo-fmt-bold");
        if (!cursor || !boldable || !boldBtn) return;

        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var gen = 0;
        var timers = [];
        var running = false;
        var TIP_X = 3.7, TIP_Y = 1.8;

        function clearTimers() { timers.forEach(clearTimeout); timers = []; }
        function wait(ms, token, fn) {
            timers.push(setTimeout(function () { if (token === gen) fn(); }, ms));
        }
        function pointTo(el) {
            var r = el.getBoundingClientRect();
            var rr = root.getBoundingClientRect();
            cursor.style.setProperty("--cx", (r.left - rr.left + r.width / 2 - TIP_X) + "px");
            cursor.style.setProperty("--cy", (r.top - rr.top + r.height / 2 - TIP_Y) + "px");
        }
        // Point the cursor at the left ("start") or right ("end") edge of a
        // per-line client rect — used to sit at the sentence's start/end.
        function pointToEdge(rect, atEnd) {
            var rr = root.getBoundingClientRect();
            var x = atEnd ? rect.right : rect.left;
            var y = rect.top + rect.height / 2;
            cursor.style.setProperty("--cx", (x - rr.left - TIP_X) + "px");
            cursor.style.setProperty("--cy", (y - rr.top - TIP_Y) + "px");
        }
        function firstRect() { var r = boldable.getClientRects(); return r[0]; }
        function lastRect() { var r = boldable.getClientRects(); return r[r.length - 1]; }
        function snapToStart() {
            var prev = cursor.style.transition;
            cursor.style.transition = "none";
            pointToEdge(firstRect(), false);
            void cursor.offsetWidth;
            cursor.style.transition = prev;
        }

        function cycle() {
            var token = gen;
            root.classList.remove("is-selecting", "is-bold", "is-press-bold");
            snapToStart();                                   // rest at the sentence start

            // 1 · begin the drag-select and sweep to the end of the sentence
            wait(900, token, function () {
                root.classList.add("is-selecting");
                pointToEdge(lastRect(), true);
            });
            // 2 · move up to the Bold tool
            wait(2100, token, function () { pointTo(boldBtn); });
            // 3 · press Bold → the sentence turns bold, the selection clears
            wait(2900, token, function () { root.classList.add("is-press-bold"); });
            wait(3080, token, function () {
                root.classList.remove("is-press-bold", "is-selecting");
                root.classList.add("is-bold");
            });
            // 4 · hold on the bolded result, then loop
            wait(5400, token, cycle);
        }

        function start() {
            if (running) return;
            running = true;
            gen++;
            root.classList.add("is-running");
            if (reduce) { root.classList.add("is-bold"); return; }
            cycle();
        }
        function stop() {
            running = false;
            gen++;
            clearTimers();
            root.classList.remove("is-running", "is-selecting", "is-press-bold");
        }

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
