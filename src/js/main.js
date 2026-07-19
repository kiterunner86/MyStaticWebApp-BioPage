/* ═══════════════════════════════════════════════════
   SREEJITHSOMAN.COM — 2026
   GSAP + ScrollTrigger + Lenis experience layer
   ═══════════════════════════════════════════════════ */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = window.matchMedia("(min-width: 721px)").matches;
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.documentElement.classList.add("js");
  gsap.registerPlugin(ScrollTrigger);

  /* ── LENIS SMOOTH SCROLL ── */
  let lenis = null;
  if (!reducedMotion) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Anchor links → smooth scroll through Lenis
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      closeMobileMenu();
      if (lenis) lenis.scrollTo(target, { offset: 0 });
      else target.scrollIntoView();
    });
  });

  /* ── PRELOADER ── */
  const preloader = document.getElementById("preloader");
  const runIntro = () => {
    document.body.removeAttribute("data-loading");
    heroIntro();
  };

  if (reducedMotion) {
    preloader.remove();
    runIntro();
  } else {
    const pct = { v: 0 };
    const tl = gsap.timeline({
      onComplete: () => { preloader.remove(); runIntro(); },
    });
    tl.to(".preloader-word", { y: 0, duration: 0.8, stagger: 0.12, ease: "power4.out" })
      .to(pct, {
        v: 100, duration: 1.0, ease: "power2.inOut",
        onUpdate: () => {
          document.getElementById("preloader-pct").textContent = String(Math.round(pct.v)).padStart(2, "0");
          document.getElementById("preloader-fill").style.width = pct.v + "%";
        },
      }, "-=0.5")
      .to(".preloader-inner", { opacity: 0, y: -30, duration: 0.45, ease: "power3.in" })
      .to(preloader, { yPercent: -100, duration: 0.7, ease: "power4.inOut" }, "-=0.1");
  }

  /* ── HERO ENTRANCE ── */
  function heroIntro() {
    if (reducedMotion) return;
    const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
    tl.to("[data-hero-line]", { y: 0, duration: 1.2, stagger: 0.14 })
      .to(".hero-portrait-mask", { clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "power4.inOut" }, "-=1.0")
      .fromTo(".hero-portrait-mask img", { scale: 1.25 }, { scale: 1, duration: 1.6, ease: "power3.out" }, "<")
      .to("[data-hero-fade]", { opacity: 1, duration: 0.9, stagger: 0.09 }, "-=0.9");
  }

  /* ── MOUSE-REACTIVE HERO GLOW + PORTRAIT PARALLAX ── */
  const glow = document.getElementById("hero-glow");
  if (hasFinePointer && !reducedMotion && glow) {
    const gx = gsap.quickTo(glow, "x", { duration: 1.2, ease: "power3" });
    const gy = gsap.quickTo(glow, "y", { duration: 1.2, ease: "power3" });
    window.addEventListener("mousemove", (e) => {
      gx((e.clientX / innerWidth - 0.5) * 260);
      gy((e.clientY / innerHeight - 0.5) * 200);
    }, { passive: true });
  }
  if (!reducedMotion) {
    gsap.to(".hero-portrait", {
      y: -70, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 },
    });
    gsap.to(".hero-title", {
      y: 90, opacity: 0.25, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: 1.2 },
    });
  }

  /* ── NAV: shrink + hide on scroll down ── */
  const nav = document.getElementById("nav");
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-scrolled", y > 40);
      nav.classList.toggle("is-hidden", y > 500 && y > lastY && !mobileMenuOpen);
      lastY = y;
    },
  });

  /* ── SCROLL PROGRESS BAR ── */
  gsap.to("#scroll-progress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });

  /* ── MOBILE MENU ── */
  const burger = document.getElementById("nav-burger");
  const mobileMenu = document.getElementById("mobile-menu");
  let mobileMenuOpen = false;
  function closeMobileMenu() {
    mobileMenuOpen = false;
    mobileMenu.classList.remove("is-open");
    mobileMenu.setAttribute("aria-hidden", "true");
    burger.setAttribute("aria-expanded", "false");
    if (lenis) lenis.start();
  }
  burger.addEventListener("click", () => {
    mobileMenuOpen = !mobileMenuOpen;
    mobileMenu.classList.toggle("is-open", mobileMenuOpen);
    mobileMenu.setAttribute("aria-hidden", String(!mobileMenuOpen));
    burger.setAttribute("aria-expanded", String(mobileMenuOpen));
    if (lenis) mobileMenuOpen ? lenis.stop() : lenis.start();
  });

  /* ── GENERIC SCROLL REVEALS ── */
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: reducedMotion ? 0 : 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  /* ── TICKER MARQUEE ── */
  const ticker = document.getElementById("ticker-track");
  if (ticker && !reducedMotion) {
    ticker.innerHTML += ticker.innerHTML; // duplicate for seamless loop
    gsap.to(ticker, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
  }

  /* ── MANIFESTO: word-by-word color scrub ── */
  const manifesto = document.getElementById("manifesto-text");
  if (manifesto) {
    manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/)
      .map((w) => `<span class="w">${w}</span>`).join(" ");
    if (!reducedMotion) {
      gsap.to(manifesto.querySelectorAll(".w"), {
        color: "#f4f6fb", stagger: 0.06, ease: "none",
        scrollTrigger: { trigger: manifesto, start: "top 78%", end: "bottom 45%", scrub: 0.6 },
      });
    } else {
      manifesto.querySelectorAll(".w").forEach((w) => (w.style.color = "#f4f6fb"));
    }
  }

  /* ── STORY: floating card ── */
  if (!reducedMotion) {
    gsap.to("[data-float]", {
      y: -16, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1,
    });
  }

  /* ── STORY: abstract network map (canvas) ── */
  (() => {
    const canvas = document.getElementById("network-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const BLUE = "47,107,255", CYAN = "103,232,249", ICE = "165,200,255";
    const LINK_DIST = 150;
    let w = 0, h = 0, dpr = 1, nodes = [], pulses = [], raf = 0, visible = false;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      w = r.width; h = r.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (reducedMotion) draw(0);
    }

    function seed() {
      const count = Math.round((w * h) / 5200);
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() < 0.12 ? 3.4 : 1.1 + Math.random() * 1.2,
        tw: Math.random() * Math.PI * 2,
      }));
      pulses = [];
    }

    function spawnPulse() {
      const a = nodes[(Math.random() * nodes.length) | 0];
      let best = null, bd = LINK_DIST * LINK_DIST;
      for (const b of nodes) {
        if (b === a) continue;
        const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
        if (d < bd) { bd = d; best = b; }
      }
      if (best) pulses.push({ a, b: best, t: 0 });
    }

    function draw(time) {
      ctx.clearRect(0, 0, w, h);

      // faint grid
      ctx.strokeStyle = `rgba(${ICE},0.045)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 44) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y < h; y += 44) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      // links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            ctx.strokeStyle = `rgba(${BLUE},${0.34 * (1 - d / LINK_DIST)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      // pulses travelling along links
      for (const p of pulses) {
        const x = p.a.x + (p.b.x - p.a.x) * p.t;
        const y = p.a.y + (p.b.y - p.a.y) * p.t;
        ctx.fillStyle = `rgba(${CYAN},${0.9 * Math.sin(Math.PI * p.t)})`;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      }

      // nodes
      for (const n of nodes) {
        const glow = n.r > 3;
        const alpha = glow ? 0.9 : 0.5 + 0.3 * Math.sin(n.tw + time * 0.0016);
        if (glow) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 16);
          g.addColorStop(0, `rgba(${CYAN},0.35)`); g.addColorStop(1, `rgba(${CYAN},0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(n.x, n.y, 16, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = glow ? `rgba(${CYAN},${alpha})` : `rgba(${ICE},${alpha})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
      }
    }

    function tick(time) {
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < -10) n.x = w + 10; else if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10; else if (n.y > h + 10) n.y = -10;
      }
      if (Math.random() < 0.05 && pulses.length < 14) spawnPulse();
      for (const p of pulses) p.t += 0.012;
      pulses = pulses.filter((p) => p.t < 1);
      draw(time);
      raf = requestAnimationFrame(tick);
    }

    function start() { if (!raf && !reducedMotion) raf = requestAnimationFrame(tick); }
    function stop() { cancelAnimationFrame(raf); raf = 0; }

    new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      visible ? start() : stop();
    }, { rootMargin: "80px" }).observe(canvas);

    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    resize();
    if (reducedMotion) draw(0);
  })();

  /* ── NUMBERS: counters + uptime ring ── */
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    ScrollTrigger.create({
      trigger: el, start: "top 90%", once: true,
      onEnter: () => {
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: reducedMotion ? 0 : 2.2, ease: "power3.out",
          onUpdate: () => {
            el.textContent = decimals
              ? obj.v.toFixed(decimals)
              : Math.round(obj.v).toLocaleString();
          },
        });
      },
    });
  });
  const ring = document.querySelector("[data-ring]");
  if (ring) {
    const C = 2 * Math.PI * 52;
    ScrollTrigger.create({
      trigger: ring, start: "top 90%", once: true,
      onEnter: () => gsap.to(ring, {
        strokeDashoffset: C * (1 - 99.99 / 100),
        duration: reducedMotion ? 0 : 2.2, ease: "power3.inOut",
      }),
    });
  }

  // Spotlight hover on stat cards
  if (hasFinePointer) {
    document.querySelectorAll(".num-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }, { passive: true });
    });
  }

  /* ── CAREER: pinned horizontal scroll (desktop only) ── */
  const careerTrack = document.getElementById("career-track");
  if (careerTrack && isDesktop && !reducedMotion) {
    const getDistance = () => careerTrack.scrollWidth - document.documentElement.clientWidth;
    const chapterEl = document.getElementById("career-chapter");
    const panels = careerTrack.querySelectorAll(".career-panel").length;
    gsap.to(careerTrack, {
      x: () => -getDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: "#career-pin",
        start: "top top",
        end: () => "+=" + getDistance(),
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          gsap.set("#career-fill", { scaleX: self.progress });
          const ch = Math.min(panels, Math.floor(self.progress * panels) + 1);
          chapterEl.textContent = "CH.0" + ch;
        },
      },
    });
  }

  /* ── EXPERTISE: expandable rows ── */
  const expRows = document.querySelectorAll("[data-exp]");
  expRows.forEach((row) => {
    const head = row.querySelector(".exp-row-head");
    const body = row.querySelector(".exp-row-body");
    head.setAttribute("role", "button");
    head.setAttribute("tabindex", "0");
    head.setAttribute("aria-expanded", "false");
    const toggle = () => {
      const open = row.classList.contains("is-open");
      expRows.forEach((r) => {
        r.classList.remove("is-open");
        r.querySelector(".exp-row-body").style.maxHeight = "0px";
        r.querySelector(".exp-row-head").setAttribute("aria-expanded", "false");
      });
      if (!open) {
        row.classList.add("is-open");
        body.style.maxHeight = body.scrollHeight + "px";
        head.setAttribute("aria-expanded", "true");
      }
    };
    head.addEventListener("click", toggle);
    head.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });
  if (expRows[0]) { // first row open by default
    expRows[0].classList.add("is-open");
    const b = expRows[0].querySelector(".exp-row-body");
    requestAnimationFrame(() => (b.style.maxHeight = b.scrollHeight + "px"));
  }

  /* ── STACK MARQUEES ── */
  document.querySelectorAll(".stack-marquee").forEach((mq) => {
    const row = mq.querySelector(".stack-row");
    row.innerHTML += row.innerHTML;
    if (reducedMotion) return;
    const dir = mq.dataset.direction === "right" ? 1 : -1;
    gsap.fromTo(row,
      { xPercent: dir === 1 ? -50 : 0 },
      { xPercent: dir === 1 ? 0 : -50, duration: 36, ease: "none", repeat: -1 });
  });

  /* ── TILT (perspective hover) ── */
  if (hasFinePointer && !reducedMotion) {
    document.querySelectorAll("[data-tilt]").forEach((el) => {
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.6, ease: "power3" });
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.6, ease: "power3" });
      gsap.set(el, { transformPerspective: 900 });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        rx(((e.clientY - r.top) / r.height - 0.5) * -7);
        ry(((e.clientX - r.left) / r.width - 0.5) * 7);
      }, { passive: true });
      el.addEventListener("pointerleave", () => { rx(0); ry(0); });
    });
  }

  /* ── MAGNETIC ELEMENTS ── */
  if (hasFinePointer && !reducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
      const my = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * 0.3);
        my((e.clientY - (r.top + r.height / 2)) * 0.3);
      }, { passive: true });
      el.addEventListener("pointerleave", () => { mx(0); my(0); });
    });
  }

  /* ── CUSTOM CURSOR ── */
  if (hasFinePointer && !reducedMotion) {
    const dot = document.getElementById("cursor-dot");
    const ringEl = document.getElementById("cursor-ring");
    const dx = gsap.quickTo(dot, "x", { duration: 0.08 });
    const dy = gsap.quickTo(dot, "y", { duration: 0.08 });
    const rx2 = gsap.quickTo(ringEl, "x", { duration: 0.35, ease: "power3" });
    const ry2 = gsap.quickTo(ringEl, "y", { duration: 0.35, ease: "power3" });
    window.addEventListener("mousemove", (e) => {
      dx(e.clientX); dy(e.clientY); rx2(e.clientX); ry2(e.clientY);
    }, { passive: true });
    document.querySelectorAll("a, button, [data-cursor], .exp-row-head").forEach((el) => {
      el.addEventListener("pointerenter", () => ringEl.classList.add("is-active"));
      el.addEventListener("pointerleave", () => ringEl.classList.remove("is-active"));
    });
  }

  /* ── AURORA BACKGROUND CANVAS ── */
  const aurora = document.getElementById("aurora");
  if (aurora && !reducedMotion) {
    const ctx = aurora.getContext("2d");
    let w, h, t = 0, running = true;
    const DPR = Math.min(devicePixelRatio || 1, 1.5);
    const blobs = [
      { hue: 222, sat: 90, l: 55, r: 0.42, sx: 0.00021, sy: 0.00017, ox: 0.25, oy: 0.3, a: 0.10 },
      { hue: 190, sat: 85, l: 60, r: 0.36, sx: 0.00017, sy: 0.00023, ox: 0.75, oy: 0.55, a: 0.07 },
      { hue: 240, sat: 70, l: 45, r: 0.5,  sx: 0.00013, sy: 0.00019, ox: 0.5,  oy: 0.85, a: 0.08 },
    ];
    const resize = () => {
      w = aurora.width = innerWidth * DPR;
      h = aurora.height = innerHeight * DPR;
    };
    resize();
    addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => (running = !document.hidden));
    (function draw(now) {
      requestAnimationFrame(draw);
      if (!running) return;
      t = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const b of blobs) {
        const x = (b.ox + Math.sin(t * b.sx) * 0.18) * w;
        const y = (b.oy + Math.cos(t * b.sy) * 0.16) * h;
        const rad = b.r * Math.min(w, h);
        const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
        g.addColorStop(0, `hsla(${b.hue}, ${b.sat}%, ${b.l}%, ${b.a})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g;
        ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
    })(0);
  }

  /* ── CONSTELLATION CANVAS (expertise) ── */
  const conste = document.getElementById("constellation");
  if (conste && !reducedMotion && isDesktop) {
    const ctx = conste.getContext("2d");
    let w, h, visible = false;
    const N = 42, pts = [];
    const resize = () => {
      const r = conste.parentElement.getBoundingClientRect();
      w = conste.width = r.width;
      h = conste.height = r.height;
    };
    resize();
    addEventListener("resize", resize, { passive: true });
    for (let i = 0; i < N; i++) {
      pts.push({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.00012, vy: (Math.random() - 0.5) * 0.00012 });
    }
    new IntersectionObserver((e) => (visible = e[0].isIntersecting), { rootMargin: "100px" }).observe(conste);
    (function draw() {
      requestAnimationFrame(draw);
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x = (p.x + p.vx + 1) % 1; p.y = (p.y + p.vy + 1) % 1;
      }
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const a = pts[i], b = pts[j];
          const dx = (a.x - b.x) * w, dy = (a.y - b.y) * h;
          const d2 = dx * dx + dy * dy;
          if (d2 < 22000) {
            ctx.strokeStyle = `rgba(103, 232, 249, ${0.14 * (1 - d2 / 22000)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(165, 200, 255, 0.5)";
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    })();
  }

  /* ── CONTACT FORM (async submit + success state) ── */
  const form = document.getElementById("contact-form");
  const FORM_ID = "a3dedd9fd13059605f192d10cfefc2ce"; // FormSubmit alias — hides the real email
  if (form) {
    form.action = "https://formsubmit.co/" + FORM_ID;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = form.querySelector(".form-submit");
      const label = form.querySelector(".form-submit-label");
      label.textContent = "Sending…";
      btn.disabled = true;
      try {
        const res = await fetch("https://formsubmit.co/ajax/" + FORM_ID, {
          method: "POST",
          headers: { Accept: "application/json" },
          referrerPolicy: "unsafe-url", // Cloudflare sets same-origin site-wide; FormSubmit needs the referrer
          body: new FormData(form),
        });
        const data = await res.json();
        if (!res.ok || String(data.success) !== "true") throw new Error();
        label.textContent = "Sent";
        document.getElementById("form-success").hidden = false;
        form.querySelectorAll("input, textarea").forEach((f) => (f.value = ""));
        if (!reducedMotion) gsap.fromTo("#form-success", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
      } catch {
        // Fallback: native POST — FormSubmit shows its own status page
        btn.disabled = false;
        form.submit();
        return;
      }
      btn.disabled = false;
    });
    // Returning from FormSubmit's native flow after successful delivery
    if (new URLSearchParams(location.search).has("sent")) {
      document.getElementById("form-success").hidden = false;
    }
  }

  /* ── REFRESH TRIGGERS AFTER FULL LOAD (images settle layout) ── */
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
