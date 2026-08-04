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
    var faqIndex = Array.prototype.indexOf.call(faqItems, item) + 1;
    var answerId = a.id || "faq-answer-" + faqIndex;
    a.id = answerId;
    q.setAttribute("aria-controls", answerId);
    q.setAttribute("aria-expanded", "false");
    a.setAttribute("aria-hidden", "true");
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      faqItems.forEach(function (other) {
        other.classList.remove("open");
        var oa = other.querySelector(".faq-a");
        var oq = other.querySelector(".faq-q");
        if (oa) oa.style.maxHeight = null;
        if (oa) oa.setAttribute("aria-hidden", "true");
        if (oq) oq.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
        a.setAttribute("aria-hidden", "false");
        q.setAttribute("aria-expanded", "true");
      }
    });
  });
  if (faqItems.length) {
    var first = faqItems[0];
    first.classList.add("open");
    var fa = first.querySelector(".faq-a");
    if (fa) fa.style.maxHeight = fa.scrollHeight + "px";
    if (fa) fa.setAttribute("aria-hidden", "false");
    var fq = first.querySelector(".faq-q");
    if (fq) fq.setAttribute("aria-expanded", "true");
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
  if (contactForm) {
    var requestedService = new URLSearchParams(window.location.search).get("service");
    var requestedMessage = new URLSearchParams(window.location.search).get("message");
    var serviceSelect = contactForm.querySelector('select[name="service"]');
    var concernField = contactForm.querySelector('textarea[name="concern"]');
    var enterpriseFields = document.getElementById("enterpriseFields");
    function updateEnterpriseFields() {
      if (!enterpriseFields || !serviceSelect) return;
      var isEnterprise = serviceSelect.value === "enterprise";
      enterpriseFields.hidden = !isEnterprise;
      enterpriseFields.setAttribute("aria-hidden", isEnterprise ? "false" : "true");
      enterpriseFields.querySelectorAll("[data-enterprise-required]").forEach(function (field) {
        field.required = isEnterprise;
      });
    }
    if (requestedService && serviceSelect && serviceSelect.querySelector('option[value="' + requestedService + '"]')) {
      serviceSelect.value = requestedService;
    }
    if (requestedMessage && concernField && !concernField.value.trim()) concernField.value = requestedMessage;
    updateEnterpriseFields();
    if (serviceSelect) serviceSelect.addEventListener("change", updateEnterpriseFields);
  }
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

  /* ---------- 성공사례 증빙 갤러리 ---------- */
  var lightboxTriggers = document.querySelectorAll("[data-lightbox], [data-case-gallery]");
  if (lightboxTriggers.length) {
    var caseGalleries = {
      gayeon: {
        client: "가연중식당 강남역삼점",
        result: "‘역삼역 맛집’ 광고 제외 4위",
        images: [
          ["/assets/images/cases/gayeon/keyword-yeoksam-matjip.webp", "‘역삼역 맛집’ 검색 결과", "2026년 7월 3일 검색 화면 기준"],
          ["/assets/images/cases/gayeon/keyword-yeoksam-chinese-matjip.webp", "‘역삼역 중식 맛집’ 검색 결과", "2026년 7월 3일 검색 화면 기준"],
          ["/assets/images/cases/gayeon/keyword-yeoksam-chinese-restaurant.webp", "‘역삼역 중식당’ 검색 결과", "2026년 8월 3일 검색 화면 기준"],
          ["/assets/images/cases/gayeon/before-place-structure.webp", "플레이스 정보 구조 재정비 전", "세팅 전 자료"],
          ["/assets/images/cases/gayeon/customer-feedback.webp", "검색 결과 고객 피드백", "식별 가능한 이름·프로필·계정 정보 제거"]
        ]
      },
      yetgiwa: {
        client: "옛기와 한우 부산 기장본점",
        result: "지역·메뉴·모임 목적 키워드 동시 노출",
        images: [
          ["/assets/images/cases/yetgiwa/keyword-pet-friendly.webp", "‘부산 기장 애견동반 식당’ 검색 결과", "2026년 8월 3일 검색 화면 기준"],
          ["/assets/images/cases/yetgiwa/keyword-company-dinner.webp", "‘부산 기장 회식’ 검색 결과", "원본 화면에 표시된 검색 결과 기준"],
          ["/assets/images/cases/yetgiwa/keyword-beef-restaurant.webp", "‘옛기와 소고기 맛집’ 검색 결과", "원본 화면에 표시된 검색 결과 기준"],
          ["/assets/images/cases/yetgiwa/keyword-group-gathering.webp", "‘기장 단체모임’ 검색 결과", "2026년 8월 3일 검색 화면 기준"],
          ["/assets/images/cases/yetgiwa/keyword-hanwoo.webp", "‘기장 한우 맛집’ 검색 결과", "2026년 8월 3일 검색 화면 기준"],
          ["/assets/images/cases/yetgiwa/keyword-lotte-outlet.webp", "‘기장 롯데아울렛 맛집’ 검색 결과", "원본 화면에 표시된 검색 결과 기준"]
        ]
      },
      dodam: {
        client: "도담참숯닭갈비 봉평막국수",
        result: "플레이스·블로그·상세페이지·숏폼 통합 실행",
        images: [
          ["/assets/images/cases/dodam/keyword-bundang-dakgalbi.png", "‘분당 닭갈비 맛집’ 검색 결과", "2026년 3월 9일 검색 화면 기준"],
          ["/assets/images/cases/dodam/keyword-jeongja-dakgalbi.png", "‘정자동 닭갈비 맛집’ 검색 결과", "2026년 3월 9일 검색 화면 기준"],
          ["/assets/images/cases/dodam/chicken-detail-page.webp", "닭갈비 상품 상세페이지 제작", "통합 디지털 마케팅 실행 자료"],
          ["/assets/images/cases/dodam/noodle-detail-page.webp", "막국수 상품 상세페이지 제작", "통합 디지털 마케팅 실행 자료"],
          ["/assets/images/cases/dodam/smartplace-optimization.webp", "스마트플레이스 최적화", "통합 디지털 마케팅 실행 자료"],
          ["/assets/images/cases/dodam/blog-campaign.webp", "블로그 체험단 콘텐츠 운영", "개인 계정·주소 식별 정보 가림 처리"],
          ["/assets/images/cases/dodam/review-campaign.webp", "리뷰 콘텐츠 운영", "리뷰 작성자 식별 정보 가림 처리"],
          ["/assets/images/cases/dodam/instagram-reels.webp", "인스타그램 릴스·숏폼 운영", "통합 디지털 마케팅 실행 자료"]
        ]
      }
    };
    var lightbox = document.createElement("div");
    lightbox.className = "case-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "성공사례 증빙 이미지 확대 보기");
    lightbox.innerHTML = '<div class="case-lightbox-inner"><div class="case-lightbox-head"><div><span class="case-lightbox-kicker">REAL PERFORMANCE</span><strong class="case-lightbox-title"></strong><span class="case-lightbox-result"></span></div></div><button class="case-lightbox-close" type="button" aria-label="증빙 갤러리 닫기">×</button><div class="case-lightbox-stage"><button class="case-lightbox-nav case-lightbox-prev" type="button" aria-label="이전 증빙 이미지">‹</button><img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="" /><button class="case-lightbox-nav case-lightbox-next" type="button" aria-label="다음 증빙 이미지">›</button></div><div class="case-lightbox-foot"><span class="case-lightbox-caption"></span><span class="case-lightbox-counter"></span></div></div>';
    document.body.appendChild(lightbox);

    var lightboxImage = lightbox.querySelector("img");
    var lightboxClose = lightbox.querySelector(".case-lightbox-close");
    var lightboxTitle = lightbox.querySelector(".case-lightbox-title");
    var lightboxResult = lightbox.querySelector(".case-lightbox-result");
    var lightboxCaption = lightbox.querySelector(".case-lightbox-caption");
    var lightboxCounter = lightbox.querySelector(".case-lightbox-counter");
    var lightboxPrev = lightbox.querySelector(".case-lightbox-prev");
    var lightboxNext = lightbox.querySelector(".case-lightbox-next");
    var lastLightboxTrigger = null;
    var activeGallery = null;
    var activeIndex = 0;

    function renderLightbox() {
      var image = activeGallery.images[activeIndex];
      lightboxImage.src = image[0];
      lightboxImage.alt = image[1];
      lightboxTitle.textContent = activeGallery.client;
      lightboxResult.textContent = activeGallery.result;
      lightboxCaption.textContent = image[1] + " · " + image[2];
      lightboxCounter.textContent = (activeIndex + 1) + " / " + activeGallery.images.length;
      lightboxPrev.hidden = activeGallery.images.length < 2;
      lightboxNext.hidden = activeGallery.images.length < 2;
    }

    function moveLightbox(direction) {
      activeIndex = (activeIndex + direction + activeGallery.images.length) % activeGallery.images.length;
      renderLightbox();
    }

    function closeLightbox() {
      lightbox.classList.remove("open");
      document.body.classList.remove("lightbox-open");
      lightboxImage.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
      lightboxImage.alt = "";
      activeGallery = null;
      if (lastLightboxTrigger) lastLightboxTrigger.focus();
    }

    lightboxTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        lastLightboxTrigger = trigger;
        var galleryKey = trigger.getAttribute("data-case-gallery");
        activeGallery = galleryKey ? caseGalleries[galleryKey] : {
          client: trigger.getAttribute("data-client") || "실제 성공사례",
          result: trigger.getAttribute("data-result") || "증빙 이미지 원본",
          images: [[trigger.getAttribute("data-lightbox"), trigger.getAttribute("data-alt") || "성공사례 증빙 이미지", trigger.getAttribute("data-caption") || "실제 운영 자료"]]
        };
        activeIndex = 0;
        renderLightbox();
        lightbox.classList.add("open");
        document.body.classList.add("lightbox-open");
        lightboxClose.focus();
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);
    lightboxPrev.addEventListener("click", function () { moveLightbox(-1); });
    lightboxNext.addEventListener("click", function () { moveLightbox(1); });
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
      if (event.key === "ArrowLeft" && activeGallery) moveLightbox(-1);
      if (event.key === "ArrowRight" && activeGallery) moveLightbox(1);
    });
  }
});
