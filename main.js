/* ───────────────────────────────────────────────
   SAGARICA — interaction layer
   Motion audited against the 12 principles:
   · entrances ease-out, exits ease-in
   · interaction feedback < 300ms
   · springs for overshoot, exit faster than enter
   · prefers-reduced-motion fully respected
   ─────────────────────────────────────────────── */
(function () {
  "use strict";

  var CFG = window.SAGARICA_CONFIG || {};
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(pointer: coarse)").matches;

  /* ─── 1 · HERO VIDEO (lazy) ─── */
  (function initVideo() {
    var v = document.getElementById("heroVideo");
    var fb = document.getElementById("heroFallback");
    if (!v) return;
    if (reduceMotion || !CFG.heroVideoSrc) { v.style.display = "none"; return; }
    if (CFG.heroVideoPoster) v.setAttribute("poster", CFG.heroVideoPoster);
    // Lazy: only attach source once hero is near/visible
    var load = function () {
      var s = document.createElement("source");
      s.src = CFG.heroVideoSrc; s.type = "video/mp4";
      v.appendChild(s); v.load();
      v.addEventListener("playing", function () { if (fb) fb.style.opacity = "0"; });
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    };
    if ("requestIdleCallback" in window) requestIdleCallback(load, { timeout: 1200 });
    else setTimeout(load, 400);
  })();

  /* ─── 2 · SMOOTH SCROLL (Lenis) ─── */
  var lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ duration: 1.1, easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); }, smoothWheel: true });
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.ScrollTrigger) { lenis.on("scroll", ScrollTrigger.update); }
  }
  function scrollToId(id) {
    var el = document.getElementById(id); if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -10 });
    else el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
  }
  document.querySelectorAll("[data-scroll]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); scrollToId(a.getAttribute("data-scroll")); });
  });

  /* ─── 3 · HERO LOAD ANIMATION ─── */
  (function heroIntro() {
    var eyebrow = document.getElementById("eyebrow");
    var lines = document.querySelectorAll(".hero-h1 .line > span");
    var sub = document.getElementById("heroSub");
    var ctas = document.getElementById("heroCtas");
    var trust = document.getElementById("heroTrust");
    if (reduceMotion || !window.gsap) {
      [eyebrow, sub, ctas, trust].forEach(function (el) { if (el) { el.style.opacity = 1; el.style.transform = "none"; } });
      lines.forEach(function (l) { l.style.transform = "none"; });
      if (eyebrow) eyebrow.classList.add("in");
      return;
    }
    var tl = gsap.timeline({ delay: 0.25 });
    tl.to(eyebrow, { opacity: 1, duration: 0.6, ease: "power2.out", onStart: function () { eyebrow.classList.add("in"); } })
      .to(lines, { y: 0, duration: 1.05, ease: "expo.out", stagger: 0.1 }, "-=0.2")
      .to(sub, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.55")
      .to(ctas, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.5")
      .to(trust, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.45");
  })();

  /* ─── 4 · OCEAN PARTICLES (canvas, GPU-light) ─── */
  (function particles() {
    var c = document.getElementById("particles");
    if (!c || reduceMotion) { if (c) c.style.display = "none"; return; }
    var ctx = c.getContext("2d"), w, h, parts = [], raf;
    var COUNT = isTouch ? 26 : 52;
    function size() { w = c.width = c.offsetWidth; h = c.height = c.offsetHeight; }
    function mk() { return { x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + 0.4, vy: -(Math.random() * 0.32 + 0.06), vx: (Math.random() - 0.5) * 0.16, a: Math.random() * 0.5 + 0.1 }; }
    function init() { size(); parts = []; for (var i = 0; i < COUNT; i++) parts.push(mk()); }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i]; p.y += p.vy; p.x += p.vx;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = "rgba(93,212,212," + p.a + ")"; ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    }
    init(); draw();
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(init, 200); });
    // pause when hero off-screen (perf)
    var hero = document.getElementById("hero");
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) { if (e.isIntersecting) { if (!raf) draw(); } else { cancelAnimationFrame(raf); raf = null; } });
      }, { threshold: 0 }).observe(hero);
    }
  })();

  /* ─── 5 · HERO MOUSE PARALLAX ─── */
  (function heroParallax() {
    var layer = document.getElementById("heroParallax");
    var vid = document.getElementById("heroVideo");
    var fb = document.getElementById("heroFallback");
    if (!layer || reduceMotion || isTouch) return;
    var tx = 0, ty = 0, cx = 0, cy = 0;
    document.getElementById("hero").addEventListener("mousemove", function (e) {
      var r = this.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5);
      ty = ((e.clientY - r.top) / r.height - 0.5);
    });
    (function loop() {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      layer.style.transform = "translate(" + (cx * -22) + "px," + (cy * -16) + "px)";
      var bgT = "translate(-50%,-50%) scale(1.08) translate(" + (cx * 18) + "px," + (cy * 14) + "px)";
      if (vid) vid.style.transform = bgT; if (fb) fb.style.transform = bgT;
      requestAnimationFrame(loop);
    })();
  })();

  /* ─── 6 · SCROLL REVEALS ─── */
  (function reveals() {
    var els = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  })();

  /* ─── 7 · PACHA CINEMATIC PARALLAX (ScrollTrigger) ─── */
  (function pachaScroll() {
    if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    var bg = document.getElementById("pachaBg");
    var word = document.getElementById("pachaWord");
    if (bg) gsap.to(bg, { yPercent: 16, ease: "none", scrollTrigger: { trigger: "#pacha", start: "top bottom", end: "bottom top", scrub: true } });
    if (word) gsap.fromTo(word, { yPercent: -8, scale: 0.94 }, { yPercent: 8, scale: 1.02, ease: "none", scrollTrigger: { trigger: "#pacha", start: "top bottom", end: "bottom top", scrub: true } });
    // guide decorative wordmark drift
    document.querySelectorAll(".bn-deco").forEach(function (d) {
      gsap.to(d, { yPercent: 12, ease: "none", scrollTrigger: { trigger: d.closest("section"), start: "top bottom", end: "bottom top", scrub: true } });
    });
  })();

  /* ─── 8 · NAV THEME SWITCH (dark over dark sections) ─── */
  (function navTheme() {
    var nav = document.getElementById("nav");
    var darkSections = ["hero", "pacha"];
    if (!("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio > 0.5) {
          if (darkSections.indexOf(e.target.id) > -1) nav.classList.add("on-dark");
          else nav.classList.remove("on-dark");
        }
      });
    }, { threshold: [0.5] });
    document.querySelectorAll("section, header").forEach(function (s) { if (s.id) io.observe(s); });
  })();

  /* ─── 9 · CURSOR + GLOW ─── */
  (function cursor() {
    var glow = document.getElementById("cglow"), dot = document.getElementById("cdot");
    if (!glow || isTouch || reduceMotion) { if (glow) glow.style.display = "none"; if (dot) dot.style.display = "none"; return; }
    var gx = 0, gy = 0, dx = 0, dy = 0, mx = 0, my = 0;
    window.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });
    (function loop() {
      dx += (mx - dx) * 0.35; dy += (my - dy) * 0.35;   // dot snappy (<300ms feel)
      gx += (mx - gx) * 0.12; gy += (my - gy) * 0.12;   // glow lags = depth
      dot.style.transform = "translate(" + dx + "px," + dy + "px) translate(-50%,-50%)";
      glow.style.transform = "translate(" + gx + "px," + gy + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    // grow on interactive
    document.querySelectorAll("button,a,.radio,.svc-card,input,textarea").forEach(function (el) {
      el.addEventListener("mouseenter", function () { dot.style.width = dot.style.height = "13px"; glow.style.opacity = "1.6"; });
      el.addEventListener("mouseleave", function () { dot.style.width = dot.style.height = "7px"; glow.style.opacity = "1"; });
    });
  })();

  /* ─── 10 · MAGNETIC BUTTONS ─── */
  (function magnetic() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll(".btn-mag").forEach(function (wrap) {
      var btn = wrap.querySelector("button,a") || wrap;
      var strength = 0.3;
      wrap.addEventListener("mousemove", function (e) {
        var r = wrap.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * strength;
        var y = (e.clientY - r.top - r.height / 2) * strength;
        btn.style.transform = "translate(" + x + "px," + y + "px)";
      });
      wrap.addEventListener("mouseleave", function () {
        // spring back (overshoot-and-settle = principle: spring physics)
        if (window.gsap) gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
        else btn.style.transform = "translate(0,0)";
      });
    });
  })();

  /* ─── 11 · FORMS (embedded JotForm, lazy iframe) ─── */
  (function forms() {
    var backdrop = document.getElementById("backdrop");
    var modal = document.getElementById("modal");
    var lastFocus = null;
    var ids = CFG.jotformIds || {};
    var loaded = {}; // form id -> true once its iframe is injected

    function showPanel(id) {
      document.querySelectorAll("[data-form-panel]").forEach(function (p) {
        p.style.display = p.getAttribute("data-form-panel") === id ? "block" : "none";
      });
    }

    // Inject the JotForm iframe only the first time a form is opened.
    function ensureEmbed(id) {
      if (loaded[id]) return;
      var formId = ids[id];
      var holder = document.querySelector('.jf-embed[data-embed="' + id + '"]');
      if (!holder) return;
      if (!formId) {
        holder.innerHTML = '<div style="padding:32px 0;text-align:center;color:var(--muted);font-size:13px;font-weight:300">Form not configured yet \u2014 add its ID in config.js.</div>';
        loaded[id] = true; return;
      }
      holder.classList.add("loading");
      var iframe = document.createElement("iframe");
      iframe.id = "JotFormIFrame-" + formId;
      iframe.title = "Sagarica inquiry form";
      iframe.allow = "geolocation; microphone; camera; fullscreen; payment";
      iframe.src = "https://form.jotform.com/" + formId;
      iframe.setAttribute("scrolling", "no");
      iframe.style.height = "560px";
      iframe.addEventListener("load", function () { holder.classList.remove("loading"); });
      holder.appendChild(iframe);
      loaded[id] = true;
    }

    function open(id) {
      showPanel(id);
      ensureEmbed(id);
      backdrop.classList.add("open");
      if (lenis) lenis.stop();
      document.body.style.overflow = "hidden";
      lastFocus = document.activeElement;
    }
    function close() {
      backdrop.classList.remove("open");
      if (lenis) lenis.start();
      document.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    }

    document.querySelectorAll("[data-form]").forEach(function (b) {
      b.addEventListener("click", function () { open(b.getAttribute("data-form")); });
    });
    document.getElementById("modalClose").addEventListener("click", close);
    backdrop.addEventListener("click", function (e) { if (e.target === backdrop) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && backdrop.classList.contains("open")) close(); });

    // JotForm posts its rendered height via window messages — keep the
    // iframe sized to its content so there is no inner scrollbar.
    window.addEventListener("message", function (e) {
      if (typeof e.data !== "string") return;
      if (e.data.indexOf("setHeight") !== 0) return;
      var parts = e.data.split(":"); // "setHeight:HEIGHT:FORMID"
      var h = parseInt(parts[1], 10);
      var fid = parts[2];
      if (!h || !fid) return;
      var f = document.getElementById("JotFormIFrame-" + fid);
      if (f) f.style.height = h + "px";
    });
  })();


  /* ─── 12 · পেঁচা external link ─── */
  document.querySelectorAll(".pacha-cta").forEach(function (a) {
    if (CFG.pachaUrl && CFG.pachaUrl !== "#") a.setAttribute("href", CFG.pachaUrl);
  });

})();
