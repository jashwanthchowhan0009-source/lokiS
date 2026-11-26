/* Loki'S Power Bowl: order links, popup, loader and small motion. No dependencies. */
(function () {
  "use strict";

  var PHONE = "919963603614";
  var EMAIL = "lokeshmallela91@gmail.com";
  var MENU = [
    { id: "oats", name: "Classic Oat Cloud", price: 59, orig: 69 },
    { id: "fruit", name: "Fruit Fiesta", price: 69, orig: 79 },
    { id: "sandwich", name: "Nutri Crunchwich", price: 49, orig: 59 },
    { id: "basil", name: "Basil Seeds Pudding", price: 59, orig: 69 },
    { id: "rice", name: "Rice Cake", price: 19, orig: 29 },
    { id: "choco", name: "Choco Oats Bowl", price: 99, orig: 109 }
  ];
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function orderText(qty, name, note, addr, loc) {
    var lines = ["Hi Loki'S! I'd like to order:"];
    MENU.forEach(function (m) { if (qty[m.id]) lines.push("• " + qty[m.id] + " x " + m.name + " (₹" + m.price * qty[m.id] + ")"); });
    var sum = MENU.reduce(function (a, m) { return a + qty[m.id] * m.price; }, 0);
    lines.push("Total: ₹" + sum);
    if (name) lines.push("", "Name: " + name);
    if (addr) lines.push("Delivery address: " + addr);
    if (loc) lines.push("Location: " + loc);
    if (note) lines.push("Note: " + note);
    return lines.join("\n");
  }
  function waLink(text) { return "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(text); }
  function mailLink(text) {
    return "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Order from the Loki'S website") + "&body=" + encodeURIComponent(text);
  }

  /* ---------- order form (home, order page and popup share it) ---------- */
  var uid = 0;
  function buildOrder(host, opts) {
    var p = "o" + (++uid);
    var qty = {};
    MENU.forEach(function (m) { qty[m.id] = 0; });
    var pre = host.getAttribute("data-preselect") || new URLSearchParams(location.search).get("item");
    if (pre && qty.hasOwnProperty(pre)) qty[pre] = 1;

    var rows = MENU.map(function (m) {
      return '<div class="order-row"><div><strong>' + m.name + "</strong><small>₹" + m.price + " launch price · was ₹" + m.orig + '</small></div><div class="stepper" role="group" aria-label="' + m.name + ' quantity">' +
        '<button type="button" data-step="-1" data-id="' + m.id + '" aria-label="One less ' + m.name + '">−</button>' +
        '<output id="' + p + "-" + m.id + '" aria-live="polite">' + qty[m.id] + "</output>" +
        '<button type="button" data-step="1" data-id="' + m.id + '" aria-label="One more ' + m.name + '">+</button></div></div>';
    }).join("");

    host.innerHTML =
      '<form class="order" novalidate>' + (opts && opts.head ? opts.head : "") + rows +
      '<div class="order-total" id="' + p + '-total"></div>' +
      '<div class="field"><label for="' + p + '-name">Your name (optional)</label><input id="' + p + '-name" name="name" autocomplete="given-name" maxlength="60"></div>' +
      '<div class="field"><label for="' + p + '-addr">Delivery address</label><textarea id="' + p + '-addr" rows="2" maxlength="300" autocomplete="street-address" placeholder="House no, street, area, landmark"></textarea></div>' +
      '<div class="loc-row"><button type="button" class="btn btn-ghost loc-btn" id="' + p + '-locbtn">Share my location</button><span class="loc-status" id="' + p + '-locst" aria-live="polite"></span></div>' +
      '<div class="field"><label for="' + p + '-note">Anything Lokesh should know? (optional)</label><textarea id="' + p + '-note" name="note" rows="2" maxlength="240" placeholder="Pickup time, less sweet, no nuts…"></textarea></div>' +
      '<a class="btn btn-leaf" id="' + p + '-send" target="_blank" rel="noopener" href="#">Send order on WhatsApp</a>' +
      '<p class="order-alt">No WhatsApp? <a id="' + p + '-mail" href="#">Email the order</a> or <a href="tel:+' + PHONE + '">call 99636 03614</a>.</p></form>';

    var send = $("#" + p + "-send", host), mail = $("#" + p + "-mail", host), total = $("#" + p + "-total", host);
    var nameEl = $("#" + p + "-name", host), noteEl = $("#" + p + "-note", host), addrEl = $("#" + p + "-addr", host);
    var locBtn = $("#" + p + "-locbtn", host), locSt = $("#" + p + "-locst", host), loc = "";
    locBtn.addEventListener("click", function () {
      if (!navigator.geolocation) { locSt.textContent = "Location not supported. Type your address instead."; return; }
      locSt.textContent = "Finding you…";
      navigator.geolocation.getCurrentPosition(function (pos) {
        loc = "https://maps.google.com/?q=" + pos.coords.latitude.toFixed(6) + "," + pos.coords.longitude.toFixed(6);
        locSt.innerHTML = '✓ Location added. <a href="' + loc + '" target="_blank" rel="noopener">Check on map</a>';
        locBtn.textContent = "Update location"; render();
      }, function () { locSt.textContent = "Couldn't get location. Allow location access or type your address."; }, { enableHighAccuracy: true, timeout: 15000 });
    });

    function render() {
      var n = 0, k = 0;
      MENU.forEach(function (m) {
        var q = qty[m.id]; n += q; k += q * m.price;
        $("#" + p + "-" + m.id, host).textContent = q;
      });
      total.innerHTML = n
        ? "<span><b>" + n + "</b> " + (n === 1 ? "item" : "items") + "</span><span>Total <b>₹" + k + "</b></span>"
        : "<span>Tap + to add a bowl</span>";
      var text = orderText(qty, nameEl.value.trim(), noteEl.value.trim(), addrEl.value.trim(), loc);
      send.href = n ? waLink(text) : "#";
      mail.href = n ? mailLink(text) : "#";
      send.setAttribute("aria-disabled", n ? "false" : "true");
      send.textContent = n ? "Send order on WhatsApp" : "Add at least one item";
    }
    host.addEventListener("click", function (e) {
      var b = e.target.closest("[data-step]");
      if (b) { qty[b.dataset.id] = Math.max(0, Math.min(20, qty[b.dataset.id] + Number(b.dataset.step))); render(); return; }
      var a = e.target.closest("a[href='#']");
      if (a) e.preventDefault();
    });
    host.addEventListener("input", render);
    host.addEventListener("submit", function (e) { e.preventDefault(); });
    render();
  }
  $$("[data-order]").forEach(function (h) { buildOrder(h); });

  /* ---------- floating button + popup ---------- */
  var bowlIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11h18a9 9 0 0 1-18 0Z"/><path d="M8 20.5h8"/><path d="M9 7c0-1.5 1.5-1.5 1.5-3M13.5 7c0-1.5 1.5-1.5 1.5-3"/></svg>';
  var fab = document.createElement("button");
  fab.type = "button"; fab.className = "fab"; fab.setAttribute("aria-haspopup", "dialog");
  fab.innerHTML = '<span class="fab-dot">' + bowlIcon + "</span><span>Order now</span>";
  fab.setAttribute("aria-label", "Order now");
  var sheet = document.createElement("dialog");
  sheet.className = "sheet"; sheet.setAttribute("aria-label", "Quick order");
  sheet.innerHTML = '<div data-popup></div>';
  document.body.appendChild(fab); document.body.appendChild(sheet);
  buildOrder($("[data-popup]", sheet), {
    head: '<div class="sheet-head"><h2>Quick order</h2><button type="button" class="sheet-close" aria-label="Close">✕</button></div>'
  });
  function openSheet() {
    if (typeof sheet.showModal === "function") sheet.showModal();
    else location.href = "order.html";
  }
  fab.addEventListener("click", openSheet);
  $$("[data-open-order]").forEach(function (b) { b.addEventListener("click", function (e) { e.preventDefault(); openSheet(); }); });
  sheet.addEventListener("click", function (e) {
    if (e.target === sheet || e.target.closest(".sheet-close")) sheet.close();
  });

  /* ---------- loader (home) ---------- */
  var loader = $(".loader");
  if (loader) {
    var seen = false;
    try { seen = sessionStorage.getItem("lokis-loaded") === "1"; sessionStorage.setItem("lokis-loaded", "1"); } catch (e) {}
    var count = $(".loader-count", loader);
    var finish = function () { loader.classList.add("done"); setTimeout(function () { loader.classList.add("gone"); }, 750); };
    if (seen || reduce) { loader.classList.add("gone"); }
    else {
      var t0 = performance.now(), dur = 1100;
      (function tick(now) {
        var k = Math.min(1, (now - t0) / dur);
        count.textContent = Math.round(k * k * (3 - 2 * k) * 100) + "%";
        if (k < 1) requestAnimationFrame(tick); else finish();
      })(t0);
      setTimeout(finish, 2500);
    }
  }

  /* ---------- slide-in ---------- */
  var rev = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    rev.forEach(function (el) { io.observe(el); });
  } else rev.forEach(function (el) { el.classList.add("in"); });

  /* ---------- bowl tilt ---------- */
  var plate = $(".plate-oval"), hero = $(".hero");
  if (plate && hero && !reduce && window.matchMedia("(pointer: fine)").matches) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      plate.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 14 + "deg");
      plate.style.setProperty("--rx", -((e.clientY - r.top) / r.height - 0.5) * 10 + "deg");
    });
    hero.addEventListener("pointerleave", function () { plate.style.setProperty("--ry", "0deg"); plate.style.setProperty("--rx", "0deg"); });
  }

  /* ---------- drifting leaves in the hero ---------- */
  var cv = $(".hero canvas");
  if (cv && !reduce) {
    var ctx = cv.getContext("2d"), W, H, leaves = [], dpr = Math.min(2, window.devicePixelRatio || 1), running = true;
    var size = function () { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); window.addEventListener("resize", size);
    for (var i = 0; i < 22; i++) leaves.push({ x: Math.random(), y: Math.random(), s: 8 + Math.random() * 16, a: Math.random() * 6.28, v: 0.15 + Math.random() * 0.35, w: (Math.random() - 0.5) * 0.02, c: Math.random() < 0.5 ? "rgba(130,219,89,.75)" : "rgba(0,143,72,.6)" });
    new IntersectionObserver(function (es) { running = es[0].isIntersecting; if (running) requestAnimationFrame(draw); }).observe(cv);
    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      leaves.forEach(function (l) {
        l.y += l.v / H; l.x += Math.sin(l.a) * 0.0006; l.a += l.w;
        if (l.y > 1.05) { l.y = -0.05; l.x = Math.random(); }
        ctx.save(); ctx.translate(l.x * W, l.y * H); ctx.rotate(l.a); ctx.fillStyle = l.c;
        ctx.beginPath(); ctx.moveTo(0, -l.s); ctx.quadraticCurveTo(l.s * 0.7, 0, 0, l.s); ctx.quadraticCurveTo(-l.s * 0.7, 0, 0, -l.s); ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
