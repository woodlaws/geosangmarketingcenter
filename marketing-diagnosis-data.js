(function () {
  "use strict";

  var TYPES = {
    "online-sales": {
      label: "온라인 판매형",
      action: "온라인 주문과 결제",
      portfolio: "상세페이지 + 쇼핑 검색광고 + 릴스 + 체험단",
      detailUrl: "/marketing-types/online-sales",
      essential: ["스마트스토어 또는 자사몰 정비", "상품 검색 최적화", "상세페이지", "대표 이미지", "구매 후기", "쇼핑 검색광고", "재구매 관리"],
      recommended: ["네이버 블로그", "인스타그램 릴스", "체험단", "메타 전환 광고", "카카오 채널"],
      optional: ["유튜브 리뷰", "라이브커머스", "공동구매", "제휴 마케팅", "해외 판매"],
      later: ["상품 정보가 부족한 상태의 대규모 광고", "구매 경로와 연결되지 않은 채널 확장"],
      channels: ["판매 페이지", "쇼핑 검색", "구매 후기", "인스타그램 릴스", "카카오 채널"],
      contents: ["상품 상세페이지", "사용 장면 숏폼", "후기·비교 콘텐츠"],
      ads: ["쇼핑 검색광고", "메타 전환 광고", "재방문 리타기팅"]
    },
    "local-store": {
      label: "매장 방문형",
      action: "검색 후 방문·예약·전화",
      portfolio: "스마트플레이스 관리 + 블로그 기자단 + 체험단 + 구글 비즈니스 프로필",
      detailUrl: "/marketing-types/local-store",
      essential: ["네이버 스마트플레이스", "상호·주소·전화·영업시간 정보 통일", "메뉴·가격·사진", "예약·전화·길찾기", "리뷰 관리", "지역 검색 콘텐츠", "구글 비즈니스 프로필"],
      recommended: ["네이버 블로그", "인스타그램 릴스", "체험단", "플레이스 광고", "지역 검색광고", "카카오 채널"],
      optional: ["스레드", "유튜브 Shorts", "외국인 대상 다국어 콘텐츠"],
      later: ["일반 식당의 장기 유튜브 운영", "매장 정보가 정리되기 전의 광범위한 광고"],
      channels: ["네이버 스마트플레이스", "Google Maps", "네이버 블로그", "인스타그램", "카카오 채널"],
      contents: ["메뉴·공간 사진", "지역 검색형 블로그", "방문 이유를 보여주는 숏폼"],
      ads: ["플레이스 광고", "지역 검색광고", "방문 목적형 콘텐츠 광고"]
    },
    consulting: {
      label: "상담·계약형",
      action: "문의·상담·제안 후 계약",
      portfolio: "홈페이지·랜딩페이지 + 전문 블로그 + AEO·GEO + 검색광고",
      detailUrl: "/marketing-types/consulting",
      essential: ["서비스별 홈페이지 또는 랜딩페이지", "상담 신청 폼", "전화·카카오·톡톡 연결", "성공사례", "대표자와 담당자 신뢰 정보", "FAQ", "전문 블로그", "검색광고", "상담 후속 관리"],
      recommended: ["무료 진단", "PDF·체크리스트", "사례형 숏폼", "리타기팅", "상담 예약 자동화", "CRM"],
      optional: ["유튜브 강의", "웨비나", "뉴스레터", "백서", "진단 테스트", "견적 계산기"],
      later: ["상담 근거가 없는 단순 노출 광고", "사례와 신뢰 정보가 없는 채널 확장"],
      channels: ["서비스 홈페이지", "네이버·구글 검색", "전문 블로그", "카카오 상담", "이메일·CRM"],
      contents: ["성공사례", "문제 해결형 칼럼", "FAQ·체크리스트"],
      ads: ["고객 의도형 검색광고", "사례 콘텐츠 리타기팅", "상담 전환 캠페인"]
    }
  };

  var QUESTIONS = [
    { id: "q1", title: "고객은 주로 어떻게 구매합니까?", weight: "high", options: [
      ["online", "온라인에서 바로 주문하고 결제한다", {"online-sales": 6}],
      ["store", "매장에 방문하거나 예약한다", {"local-store": 6}],
      ["consult", "문의와 상담 후 계약한다", {consulting: 6}],
      ["hybrid", "두 가지 이상을 함께 사용한다", {"online-sales": 3, "local-store": 3, consulting: 3}, ["hybrid"]]
    ]},
    { id: "q2", title: "고객을 직접 만나는 사업장이 있습니까?", options: [
      ["store", "고객이 방문하는 매장이 있다", {"local-store": 3}],
      ["visit", "고객에게 직접 찾아간다", {consulting: 2, "local-store": 1}, ["service-area"]],
      ["both", "매장 방문과 출장·배달을 함께 제공한다", {"local-store": 2, consulting: 1}, ["hybrid", "service-area"]],
      ["online", "온라인으로만 운영한다", {"online-sales": 3}]
    ]},
    { id: "q3", title: "고객의 주요 범위는 어디입니까?", options: [
      ["local", "매장 주변 지역 고객", {"local-store": 3}], ["region", "시·도 단위 고객", {"local-store": 2, consulting: 1}],
      ["national", "전국 고객", {"online-sales": 3, consulting: 2}], ["global", "해외 고객", {"online-sales": 3, consulting: 1}, ["global"]]
    ]},
    { id: "q4", title: "평균 구매 또는 계약 금액은 얼마입니까?", options: [
      ["under5", "5만원 미만", {"local-store": 2, "online-sales": 1}], ["5-30", "5만~30만원", {"online-sales": 2, "local-store": 2}],
      ["30-300", "30만~300만원", {consulting: 3, "online-sales": 1}, ["high-consideration"]], ["over300", "300만원 이상", {consulting: 4}, ["high-consideration", "b2b"]]
    ]},
    { id: "q5", title: "고객이 구매를 결정하는 데 얼마나 걸립니까?", options: [
      ["now", "바로 결정한다", {"online-sales": 2, "local-store": 2}], ["days", "며칠 동안 비교한다", {"online-sales": 2, "local-store": 1}],
      ["weeks", "몇 주 동안 검토한다", {consulting: 3}, ["high-consideration"]], ["proposal", "상담·제안·견적 과정을 거친다", {consulting: 4}, ["high-consideration", "b2b"]]
    ]},
    { id: "q6", title: "재구매나 재방문이 중요합니까?", options: [
      ["very", "매우 중요하다", {"online-sales": 2, "local-store": 2}, ["repeat"]], ["some", "어느 정도 중요하다", {"online-sales": 1, "local-store": 1, consulting: 1}, ["repeat"]],
      ["once", "일회성 구매가 많다", {"online-sales": 1, consulting: 1}], ["contract", "장기 계약과 재계약이 중요하다", {consulting: 3}, ["repeat", "b2b"]]
    ]},
    { id: "q7", title: "고객은 주로 어디에서 우리 업체를 찾습니까?", options: [
      ["naver", "네이버 검색·지도", {"local-store": 3}], ["google", "구글 검색·지도", {"local-store": 2, consulting: 1}],
      ["social", "인스타그램·SNS", {"online-sales": 2, "local-store": 1}], ["referral", "소개·지인 추천", {consulting: 3}],
      ["ads", "광고", {"online-sales": 2, consulting: 2}], ["unknown", "잘 모르겠다", {}]
    ]},
    { id: "q8", title: "현재 운영 중인 마케팅 채널은 무엇입니까?", multiple: true, options: [
      ["place", "네이버 플레이스", {"local-store": 1}], ["blog", "네이버 블로그", {"local-store": 1, consulting: 1}], ["instagram", "인스타그램", {"online-sales": 1, "local-store": 1}],
      ["youtube", "유튜브", {"online-sales": 1, consulting: 1}], ["threads", "스레드", {consulting: 1}], ["website", "홈페이지·랜딩페이지", {"online-sales": 1, consulting: 1}],
      ["search-ads", "검색광고", {"online-sales": 1, "local-store": 1, consulting: 1}], ["kakao", "카카오 채널", {"local-store": 1, consulting: 1}], ["none", "운영 중인 채널이 없다", {}]
    ]},
    { id: "q9", title: "가장 늘리고 싶은 결과는 무엇입니까?", weight: "high", options: [
      ["orders", "온라인 주문과 매출", {"online-sales": 6}], ["visits", "매장 방문과 예약", {"local-store": 6}], ["inquiries", "상담 문의", {consulting: 6}],
      ["contracts", "고액 계약", {consulting: 6}, ["high-consideration", "b2b"]], ["repeat", "재구매와 단골", {"online-sales": 3, "local-store": 3}, ["repeat"]],
      ["brand", "브랜드 검색과 인지도", {"online-sales": 2, "local-store": 2, consulting: 2}]
    ]},
    { id: "q10", title: "월 마케팅 실행 예산은 어느 정도입니까?", options: [
      ["under30", "30만원 미만", {}], ["30-70", "30만~70만원", {}], ["70-150", "70만~150만원", {}],
      ["150-300", "150만~300만원", {}], ["over300", "300만원 이상", {}], ["undecided", "아직 정하지 않았다", {}]
    ]}
  ];

  var STAGES = { under30: "beginner", "30-70": "foundation", "70-150": "growth", "150-300": "scale", over300: "scale", undecided: "planning" };
  var TAG_LABELS = { "service-area": "출장형", hybrid: "하이브리드형", "high-consideration": "고관여형", b2b: "B2B형", repeat: "재구매형", global: "해외·외국인형" };

  function optionFor(question, value) { return question.options.find(function (option) { return option[0] === value; }); }
  function calculate(answers) {
    var scores = {"online-sales": 0, "local-store": 0, consulting: 0};
    var tags = [];
    QUESTIONS.forEach(function (question) {
      var values = Array.isArray(answers[question.id]) ? answers[question.id] : [answers[question.id]];
      values.filter(Boolean).forEach(function (value) {
        var option = optionFor(question, value); if (!option) return;
        Object.keys(option[2] || {}).forEach(function (type) { scores[type] += option[2][type]; });
        (option[3] || []).forEach(function (tag) { if (!tags.includes(tag)) tags.push(tag); });
      });
    });
    var total = Object.values(scores).reduce(function (sum, value) { return sum + value; }, 0) || 1;
    var ranked = Object.keys(scores).map(function (key) { return { key: key, score: scores[key], percent: Math.round(scores[key] / total * 100) }; }).sort(function (a, b) { return b.score - a.score; });
    var roundedTotal = ranked.reduce(function (sum, item) { return sum + item.percent; }, 0); if (roundedTotal !== 100) ranked[0].percent += 100 - roundedTotal;
    return { scores: scores, ranked: ranked, primary: ranked[0].key, secondary: ranked[1].percent >= 25 ? ranked[1].key : null, tags: tags, stage: STAGES[answers.q10] || "planning" };
  }
  function answerLabel(questionId, value) { var q = QUESTIONS.find(function (item) { return item.id === questionId; }); var o = q && optionFor(q, value); return o ? o[1] : ""; }
  window.MarketingDiagnosisData = { types: TYPES, questions: QUESTIONS, stages: STAGES, tagLabels: TAG_LABELS, calculate: calculate, answerLabel: answerLabel };
})();
