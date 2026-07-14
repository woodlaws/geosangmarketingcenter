/* ============================================================
   거상마케팅센터 — script.js (다페이지 v2)
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  /* ---------- 모바일 메뉴 열기/닫기 ---------- */
  var navToggle = document.getElementById("navToggle");
  var navMobile = document.getElementById("navMobile");
  if (navToggle && navMobile) {
    navToggle.addEventListener("click", function () {
      navMobile.classList.toggle("open");
    });
    navMobile.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navMobile.classList.remove("open");
      });
    });
  }

  /* ---------- 모바일 서비스 서브메뉴 아코디언 ---------- */
  var mobSvcTrigger = document.getElementById("navMobSvc");
  var mobSvcSub = document.getElementById("navMobSvcSub");
  if (mobSvcTrigger && mobSvcSub) {
    mobSvcTrigger.addEventListener("click", function () {
      var isOpen = mobSvcSub.classList.contains("open");
      mobSvcSub.classList.toggle("open", !isOpen);
      mobSvcTrigger.classList.toggle("open", !isOpen);
    });
  }

  /* ---------- FAQ 아코디언 ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        var oa = other.querySelector(".faq-a");
        if (oa) oa.style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
  if (faqItems.length) {
    var first = faqItems[0];
    first.classList.add("open");
    var fa = first.querySelector(".faq-a");
    if (fa) fa.style.maxHeight = fa.scrollHeight + "px";
  }

  /* ---------- 홈 간편 진단 폼 ---------- */
  var form = document.getElementById("leadForm");
  var success = document.getElementById("formSuccess");
  if (form && success) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      form.setAttribute("hidden", "");
      success.removeAttribute("hidden");
    });
  }

  /* ---------- 상담문의 페이지 전체 폼 ---------- */
  var contactForm = document.getElementById("contactForm");
  var contactSuccess = document.getElementById("contactSuccess");
  if (contactForm && contactSuccess) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      contactForm.setAttribute("hidden", "");
      contactSuccess.removeAttribute("hidden");
    });
  }

  /* ---------- 통계 카운트업 ---------- */
  var statsGrid = document.getElementById("statsGrid");
  if (statsGrid && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          statsGrid.querySelectorAll(".stat-value").forEach(animateValue);
          observer.disconnect();
        }
      });
    }, { threshold: 0.4 });
    observer.observe(statsGrid);
  }

  function animateValue(el) {
    var text = el.textContent.trim();
    var match = text.match(/([\d.]+)/);
    if (!match) return;
    var target = parseFloat(match[1]);
    var decimals = (match[1].split(".")[1] || "").length;
    var prefix = text.slice(0, match.index);
    var suffix = text.slice(match.index + match[1].length);
    var duration = 1200;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = (target * eased).toFixed(decimals);
      el.textContent = prefix + Number(val).toLocaleString("ko-KR") + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = text;
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 현재 경로 기반 활성 메뉴 ---------- */
  var rawPath = window.location.pathname.replace(/\/$/, "") || "/";
  document.querySelectorAll(".nav a:not(.btn-nav), .nav-mobile a:not(.btn-nav)").forEach(function (a) {
    var href = (a.getAttribute("href") || "").replace(/\/$/, "") || "/";
    if (href === rawPath || (href !== "/" && rawPath.startsWith(href))) {
      a.style.color = "var(--blue)";
      a.style.fontWeight = "800";
    }
  });
  document.querySelectorAll(".nav .nav-ddtrigger").forEach(function (el) {
    var href = (el.getAttribute("href") || "").replace(/\/$/, "");
    if (href && rawPath.startsWith(href)) {
      el.style.color = "var(--blue)";
      el.style.fontWeight = "800";
    }
  });
});
