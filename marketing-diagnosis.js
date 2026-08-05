(function () {
  "use strict";
  var DATA = window.MarketingDiagnosisData; if (!DATA) return;
  function track(name, params) { if (typeof window.gtag === "function") window.gtag("event", name, params || {}); }
  function encodeAnswers(answers) { return DATA.questions.map(function (q) { var value = answers[q.id]; return q.id + ":" + (Array.isArray(value) ? value.join(".") : value || ""); }).join(";"); }
  function decodeAnswers(value) { var answers = {}; (value || "").split(";").forEach(function (part) { var bits = part.split(":"); if (!bits[0] || !bits[1]) return; answers[bits[0]] = bits[0] === "q8" ? bits[1].split(".") : bits[1]; }); return answers; }
  function escapeHtml(value) { return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function list(items) { return "<ul>" + items.map(function (item) { return "<li>" + escapeHtml(item) + "</li>"; }).join("") + "</ul>"; }

  var app = document.getElementById("diagnosisApp");
  if (app) {
    var questions = DATA.questions, answers = {}, index = 0;
    var intro = document.getElementById("diagnosisIntro"), quiz = document.getElementById("diagnosisQuiz"), questionMount = document.getElementById("diagnosisQuestion");
    var progress = document.getElementById("diagnosisProgress"), counter = document.getElementById("diagnosisCounter"), prev = document.getElementById("diagnosisPrev"), next = document.getElementById("diagnosisNext"), start = document.getElementById("diagnosisStart");
    track("diagnosis_view", { page_type: "diagnosis" });
    function renderQuestion() {
      var q = questions[index], selected = answers[q.id] || (q.multiple ? [] : "");
      counter.textContent = (index + 1) + " / " + questions.length;
      progress.style.width = ((index + 1) / questions.length * 100) + "%";
      var inputType = q.multiple ? "checkbox" : "radio";
      questionMount.innerHTML = '<fieldset><legend><span>Q' + (index + 1) + '</span>' + escapeHtml(q.title) + '</legend>' + (q.multiple ? '<p class="diagnosis-multiple-note">복수 선택할 수 있습니다.</p>' : '') + '<div class="diagnosis-options">' + q.options.map(function (option) {
        var checked = q.multiple ? selected.includes(option[0]) : selected === option[0];
        return '<label class="diagnosis-option' + (checked ? ' selected' : '') + '"><input type="' + inputType + '" name="' + q.id + '" value="' + option[0] + '"' + (checked ? ' checked' : '') + ' /><span>' + escapeHtml(option[1]) + '</span></label>';
      }).join("") + '</div></fieldset>';
      prev.disabled = index === 0; next.textContent = index === questions.length - 1 ? "결과 확인하기" : "다음 질문"; updateNext();
      questionMount.querySelectorAll("input").forEach(function (input) { input.addEventListener("change", function () {
        if (q.multiple) {
          var values = Array.from(questionMount.querySelectorAll("input:checked")).map(function (el) { return el.value; });
          if (input.value === "none" && input.checked) values = ["none"];
          else if (input.value !== "none") values = values.filter(function (value) { return value !== "none"; });
          answers[q.id] = values; renderQuestion();
        } else { answers[q.id] = input.value; questionMount.querySelectorAll(".diagnosis-option").forEach(function (label) { label.classList.toggle("selected", label.contains(input)); }); updateNext(); }
        track("diagnosis_question_answer", { question_id: q.id, option_code: input.value, question_number: index + 1 });
      }); });
    }
    function updateNext() { var q = questions[index], value = answers[q.id]; next.disabled = q.multiple ? !value || !value.length : !value; }
    start.addEventListener("click", function () { intro.hidden = true; quiz.hidden = false; track("diagnosis_start", { question_count: questions.length }); renderQuestion(); questionMount.focus(); });
    prev.addEventListener("click", function () { if (index > 0) { index--; renderQuestion(); questionMount.focus(); } });
    next.addEventListener("click", function () {
      if (next.disabled) return;
      if (index < questions.length - 1) { index++; renderQuestion(); questionMount.focus(); return; }
      var result = DATA.calculate(answers); track("diagnosis_complete", { primary_type: result.primary, secondary_type: result.secondary || "none", stage: result.stage });
      var query = new URLSearchParams({ type: result.primary, stage: result.stage, a: encodeAnswers(answers) }); if (result.secondary) query.set("secondary", result.secondary);
      var localPreview = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
      window.location.href = (localPreview ? "/marketing-diagnosis/result.html" : "/marketing-diagnosis/result") + "?" + query.toString();
    });
  }

  var resultMount = document.getElementById("diagnosisResult");
  if (resultMount) {
    var params = new URLSearchParams(window.location.search), decoded = decodeAnswers(params.get("a")), computed = Object.keys(decoded).length ? DATA.calculate(decoded) : null;
    var primaryKey = computed ? computed.primary : (DATA.types[params.get("type")] ? params.get("type") : "local-store");
    var secondaryKey = computed ? computed.secondary : (DATA.types[params.get("secondary")] ? params.get("secondary") : null);
    var primary = DATA.types[primaryKey], secondary = secondaryKey ? DATA.types[secondaryKey] : null;
    var ranked = computed ? computed.ranked : [{key:primaryKey,percent:secondary ? 70 : 100},{key:secondaryKey,percent:secondary ? 30 : 0}].filter(function (x) { return x.key; });
    var tags = computed ? computed.tags : [], stage = computed ? computed.stage : (params.get("stage") || "planning");
    var goal = decoded.q9 ? DATA.answerLabel("q9", decoded.q9) : primary.action, budget = decoded.q10 ? DATA.answerLabel("q10", decoded.q10) : "미정";
    var typeTitle = primary.label + " " + ranked[0].percent + "%" + (secondary ? " + " + secondary.label + " " + (ranked.find(function (x) { return x.key === secondaryKey; }) || {percent:0}).percent + "%" : "");
    var tagHtml = tags.length ? '<div class="diagnosis-tags">' + tags.map(function (tag) { return '<span>' + escapeHtml(DATA.tagLabels[tag]) + '</span>'; }).join("") + '</div>' : '';
    var bars = ranked.map(function (item) { return '<div class="diagnosis-score-row"><div><strong>' + escapeHtml(DATA.types[item.key].label) + '</strong><span>' + item.percent + '%</span></div><div class="diagnosis-score-track"><i style="width:' + item.percent + '%"></i></div></div>'; }).join("");
    var summaryLines = DATA.questions.filter(function (q) { return decoded[q.id]; }).map(function (q) { var value = decoded[q.id]; var labels = (Array.isArray(value) ? value : [value]).map(function (v) { return DATA.answerLabel(q.id, v); }); return "Q" + q.id.slice(1) + " " + labels.join(", "); });
    var message = ["내 업종 마케팅 진단 결과를 바탕으로 상담을 요청합니다.", "주 유형: " + primary.label, "보조 유형: " + (secondary ? secondary.label : "없음"), "사업 단계: " + stage, "가장 원하는 결과: " + goal, "월 예산: " + budget, "추천 포트폴리오: " + primary.portfolio, "응답 요약: " + summaryLines.join(" / ")].join("\n");
    var contactUrl = "/contact.html?service=marketing-diagnosis&source=diagnosis&message=" + encodeURIComponent(message) + "#contact-form";
    var caseHtml = primaryKey === "online-sales" ? '<a href="/cases/dodam">도담참숯닭갈비 통합 실행 사례 →</a>' : primaryKey === "local-store" ? '<a href="/cases/gayeon">가연중식당 강남역삼점 검색 사례 →</a><a href="/cases/yetgiwa">옛기와 한우 지역 검색 사례 →</a>' : '<a href="/cases">문제 유형별 성공사례 확인 →</a>';
    resultMount.innerHTML = '<section class="diagnosis-result-hero"><div class="eyebrow">YOUR DIAGNOSIS</div><h1>귀사는 ‘' + escapeHtml(typeTitle) + '’ 사업자입니다.</h1><p>가장 중요한 고객 행동은 <strong>' + escapeHtml(primary.action) + '</strong>입니다. 모든 채널을 동시에 운영하기보다 필수 기반부터 단계적으로 실행하세요.</p>' + tagHtml + '</section>' +
      '<div class="diagnosis-result-grid"><section class="diagnosis-result-card"><h2>사업자 유형 비율</h2>' + bars + '<a class="diagnosis-text-link" href="' + primary.detailUrl + '">' + primary.label + ' 상세 가이드 →</a></section><section class="diagnosis-result-card"><h2>지금 가장 중요한 목표</h2><strong class="diagnosis-main-action">' + escapeHtml(goal) + '</strong><p>월 실행 예산: ' + escapeHtml(budget) + '<br />진단 단계: ' + escapeHtml(stage) + '</p></section></div>' +
      '<section class="diagnosis-priority-section"><div class="diagnosis-priority-card essential"><span>가장 먼저·반드시</span><h2>필수 마케팅</h2>' + list(primary.essential) + '</div><div class="diagnosis-priority-card recommended"><span>다음 단계</span><h2>권장 마케팅</h2>' + list(primary.recommended) + '</div><div class="diagnosis-priority-card optional"><span>조건이 맞을 때</span><h2>선택 마케팅</h2>' + list(primary.optional) + '</div><div class="diagnosis-priority-card later"><span>현재 우선순위 낮음</span><h2>지금 하지 않아도 되는 마케팅</h2>' + list(primary.later) + '</div></section>' +
      '<section class="diagnosis-recommend-grid"><article><span>CHANNEL PRIORITY</span><h2>추천 채널 우선순위</h2>' + list(primary.channels) + '</article><article><span>CONTENT</span><h2>추천 콘텐츠</h2>' + list(primary.contents) + '</article><article><span>ADS</span><h2>추천 광고</h2>' + list(primary.ads) + '</article></section>' +
      '<section class="diagnosis-portfolio"><div><span>RECOMMENDED PORTFOLIO</span><h2>거상마케팅센터 맞춤 대행 포트폴리오</h2><p>' + escapeHtml(primary.portfolio) + '</p></div><a href="' + contactUrl + '" class="btn-teal" data-diagnosis-consult>내 업종 맞춤 견적 받기</a></section>' +
      '<section class="diagnosis-related"><div><h2>관련 성공사례</h2>' + caseHtml + '</div><div><h2>관련 대행 서비스</h2><a href="' + primary.detailUrl + '">' + primary.label + ' 마케팅 가이드 →</a><a href="/services">대행 서비스 전체 보기 →</a></div></section>' +
      '<section class="diagnosis-final-cta"><h2>이 결과를 바탕으로 우리 업체의 실행 포트폴리오를 받아보세요.</h2><p>기본 결과는 연락처 입력 없이 확인할 수 있습니다. 상담 신청 시에만 연락처와 개인정보 동의를 받습니다.</p><div><a href="' + contactUrl + '" class="btn-teal" data-diagnosis-consult>내 업종 맞춤 견적 받기</a><a href="' + contactUrl + '" class="btn-primary" data-diagnosis-consult>무료 상세 진단 요청하기</a></div></section>';
    track("diagnosis_result_type", { primary_type: primaryKey, secondary_type: secondaryKey || "none", stage: stage });
    resultMount.querySelectorAll("[data-diagnosis-consult]").forEach(function (link) { link.addEventListener("click", function () { track("diagnosis_consult_click", { primary_type: primaryKey, cta_location: "result" }); }); });
  }

  document.querySelectorAll("[data-diagnosis-type]").forEach(function (link) { link.addEventListener("click", function () { track("diagnosis_start", { entry_type: link.getAttribute("data-diagnosis-type"), entry_location: link.getAttribute("data-location") || "page" }); }); });
  document.querySelectorAll("[data-marketing-type-card]").forEach(function (link) { link.addEventListener("click", function () { track("marketing_type_card_click", { type: link.getAttribute("data-marketing-type-card"), source: "marketing-diagnosis" }); }); });
})();
