/* ============================================================
   거상마케팅센터 랜딩페이지 — script.js
   FAQ 아코디언 / 상담 신청 폼 / 모바일 메뉴 / 통계 카운트업
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- 모바일 메뉴 ---------- */
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

  /* ---------- FAQ 아코디언 ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      // 다른 항목 닫기
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
  // 첫 번째 항목 기본 열림
  if (faqItems.length) {
    var first = faqItems[0];
    first.classList.add("open");
    var fa = first.querySelector(".faq-a");
    if (fa) fa.style.maxHeight = fa.scrollHeight + "px";
  }

  /* ---------- 상담 신청 폼 ---------- */
  var form = document.getElementById("leadForm");
  var success = document.getElementById("formSuccess");
  if (form && success) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // 실제 운영 시: 아래에서 폼 데이터를 서버/이메일/구글폼 등으로 전송하세요.
      // var data = new FormData(form);
      form.setAttribute("hidden", "");
      success.removeAttribute("hidden");
      success.scrollIntoView ? null : null; // (scrollIntoView 미사용)
    });
  }

  /* ---------- 통계 카운트업 ---------- */
  var statsGrid = document.getElementById("statsGrid");
  if (statsGrid && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            statsGrid.querySelectorAll(".stat-value").forEach(animateValue);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(statsGrid);
  }

  function animateValue(el) {
    var text = el.textContent.trim();
    var match = text.match(/([\d.]+)/);
    if (!match) return; // 숫자 없는 값(TOP 3 등)은 그대로
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
});
