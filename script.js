/* ============================================================
   NBC DÉPANNAGE — script.js v5 (avec widgets mécanicien)
   ============================================================ */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* ══ 1. COMPTEURS ANIMÉS ══ */
  ready(function () {
    var counters = document.querySelectorAll("[data-count]");
    counters.forEach(function (el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target) || target === 0) return;
      el.textContent = "0";
      var start = null;
      var duration = 1000;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(ease * target);
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      setTimeout(function () { requestAnimationFrame(step); }, 400);
    });
  });

  /* ══ 2. JAUGE HERO SVG ══ */
  ready(function () {
    var gauge = document.getElementById("gauge-avail");
    if (!gauge) return;
    var circ = 2 * Math.PI * 50;
    gauge.style.strokeDasharray = circ;
    gauge.style.strokeDashoffset = circ;
    setTimeout(function () {
      gauge.style.transition = "stroke-dashoffset 1.8s ease";
      gauge.style.strokeDashoffset = circ * 0.02;
    }, 500);
  });

  /* ══ 3. WIDGET TEMPÉRATURE — aiguille animée ══ */
  ready(function () {
    var needle = document.querySelector(".temp-needle");
    if (!needle) return;
    // Position "normale" : environ 90°C sur l'arc = rotation 0°
    // L'arc va de -90° (froid) à +90° (critique)
    // Normal = 90°C = environ rotation 0° (milieu)
    var targetRotation = -5; // légèrement à droite du centre = 90°C
    setTimeout(function () {
      needle.style.transform = "rotate(" + targetRotation + "deg)";
    }, 800);

    // Animation oscillation légère de l'aiguille
    var base = targetRotation;
    var dir = 1;
    setInterval(function () {
      base += dir * (Math.random() * 2);
      if (base > targetRotation + 4) dir = -1;
      if (base < targetRotation - 4) dir = 1;
      needle.style.transform = "rotate(" + base + "deg)";
    }, 2200);
  });

  /* ══ 4. CHECKLIST — auto-progression ══ */
  ready(function () {
    var fill = document.getElementById("progress-fill");
    var label = document.querySelector(".progress-label");
    if (!fill) return;
    // Simule progression
    var steps = [
      { pct: 44, text: "44% — Diagnostic en cours" },
      { pct: 60, text: "60% — Identification panne" },
      { pct: 80, text: "80% — Devis préparé" },
    ];
    var current = 0;
    setTimeout(function () {
      fill.style.width = "44%";
    }, 1000);

    setInterval(function () {
      current = (current + 1) % steps.length;
      var s = steps[current];
      fill.style.width = s.pct + "%";
      if (label) label.textContent = s.text;

      // Update active step visual
      var items = document.querySelectorAll(".check-item");
      items.forEach(function(item, idx) {
        item.classList.remove("check-item--pending");
        var icon = item.querySelector(".check-icon");
        var status = item.querySelector(".check-status");
        if (idx < current + 2) {
          icon.className = "check-icon check-done";
          icon.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
          if (status) { status.className = "check-status check-status--ok"; status.textContent = "OK"; }
        }
      });
    }, 4000);
  });

  /* ══ 5. SPEC BARS — animer à l'entrée dans viewport ══ */
  ready(function () {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".spec-bar-fill").forEach(function(el) {
        el.classList.add("animated");
      });
      return;
    }
    var fills = document.querySelectorAll(".spec-bar-fill");
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("animated");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    fills.forEach(function(el) { obs.observe(el); });
  });

  /* ══ 6. HEADER SCROLL ══ */
  var header = document.getElementById("site-header");
  function updateHeader() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  ready(updateHeader);

  /* ══ 7. MENU MOBILE ══ */
  ready(function () {
    var toggle = document.getElementById("menu-toggle");
    var nav    = document.getElementById("mobile-nav");
    if (!toggle || !nav) return;

    function closeMenu() {
      nav.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      nav.setAttribute("aria-hidden", "true");
    }

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      nav.setAttribute("aria-hidden", String(!open));
    });

    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    document.addEventListener("click", function (e) {
      if (header && !header.contains(e.target) && nav.classList.contains("open")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { closeMenu(); toggle.focus(); }
    });
  });

  /* ══ 8. SCROLL REVEAL ══ */
  ready(function () {
    if (!("IntersectionObserver" in window)) return;
    setTimeout(function () {
      var els = document.querySelectorAll(".section .reveal, .section .reveal-right");
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("did-animate");
            entry.target.classList.remove("will-animate");
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.05 });
      els.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (!inView) { el.classList.add("will-animate"); observer.observe(el); }
      });
      setTimeout(function () {
        els.forEach(function (el) { el.classList.remove("will-animate"); el.classList.add("did-animate"); });
      }, 3000);
    }, 300);
  });

  /* ══ 9. FORMULAIRE ══ */
  ready(function () {
    var form    = document.getElementById("contact-form");
    var success = document.getElementById("form-success");
    var wrap    = document.querySelector(".contact-form-wrap");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      ["#name", "#phone"].forEach(function (sel) {
        var f = form.querySelector(sel);
        if (!f || !f.value.trim()) {
          if (f) f.style.borderColor = "#ef4444";
          valid = false;
          if (f) f.addEventListener("input", function () { f.style.borderColor = ""; }, { once: true });
        }
      });
      if (!valid) return;
      var btn = form.querySelector("button[type='submit']");
      btn.textContent = "Envoi en cours…";
      btn.disabled = true;
      setTimeout(function () {
        form.hidden = true;
        var hdr = wrap && wrap.querySelector(".contact-form-header");
        if (hdr) hdr.hidden = true;
        if (success) { success.hidden = false; success.focus(); }
      }, 900);
    });
  });

  /* ══ 10. FOOTER YEAR ══ */
  ready(function () {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  });

  /* ══ 11. SMOOTH SCROLL ══ */
  ready(function () {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = document.querySelector(this.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        var hdr    = document.getElementById("site-header");
        var offset = hdr ? hdr.offsetHeight + 8 : 76;
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset, behavior: "smooth" });
      });
    });
  });

  /* ══ 12. TICKER — vitesse adaptative selon largeur contenu ══ */
  ready(function () {
    var content = document.getElementById("ticker-content");
    if (!content) return;

    // px par seconde — vitesse de lecture confortable
    var PX_PER_SEC = 80;

    function applyTickerSpeed() {
      // Largeur réelle du contenu (moitié car contenu dupliqué x2)
      var halfWidth = content.scrollWidth / 2;
      var duration  = halfWidth / PX_PER_SEC;
      // Appliquer via CSS custom property
      content.style.animation = "none";
      content.style.transform = "translateX(0)";
      // Forcer reflow puis relancer
      void content.offsetWidth;
      content.style.animation = "ticker-scroll " + duration.toFixed(1) + "s linear infinite";
    }

    // Lancer après chargement des polices (sinon scrollWidth erroné)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(applyTickerSpeed);
    } else {
      setTimeout(applyTickerSpeed, 300);
    }

    // Recalculer si la fenêtre change de taille
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applyTickerSpeed, 200);
    });
  });

  /* ══ 13. OBD SCAN ANIMATION ══ */
  ready(function() {
    var rows = document.querySelectorAll(".obd-row");
    if (!rows.length) return;
    var idx = 0;
    setInterval(function() {
      rows.forEach(function(r) { r.style.opacity = "1"; });
      var row = rows[idx % rows.length];
      row.style.opacity = "0.7";
      setTimeout(function() { row.style.opacity = "1"; }, 300);
      idx++;
    }, 2500);
  });

})();
