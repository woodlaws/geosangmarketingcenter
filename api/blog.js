const SITE_URL = "https://geosangmarketing.com";
const NOTION_VERSION = "2026-03-11";
const CACHE_SECONDS = 300;
const memoryCache = new Map();
const MIGRATED_INSIGHT_COVERS = require("../data/migrated-insight-covers.json");

const CATEGORIES = [
  "스마트플레이스", "AEO·GEO", "AI 검색 최적화", "블로그 마케팅",
  "체험단 마케팅", "식당 마케팅", "병원·치과 마케팅", "소상공인 마케팅", "마케팅 사례",
];

const SERVICE_LINKS = {
  "스마트플레이스 최적화": "/services/smartplace",
  "블로그 마케팅": "/services/content-sns",
  "체험단 마케팅": "/services/content-sns",
  "식당 마케팅": "/marketing-types/local-store",
  "치과 마케팅": "/marketing-types/local-store",
  "홈페이지 진단": "/services/website-production",
  "AEO·GEO 컨설팅": "/services/aeo-geo",
};

const INLINE_BLOG_IMAGES = {
  "experience-marketing-recruitment-checklist": [
    { afterHeading: "체험단 성과는 모집 전에 결정됩니다", src: "/images/blog/experience-marketing-recruitment-checklist/1.webp", alt: "한국 카페 대표와 한국인 마케터가 체험단 캠페인 목표를 논의하는 모습", caption: "모집 인원보다 목표 고객과 남겨야 할 콘텐츠를 먼저 정해야 합니다." },
    { afterHeading: "모집 공고에 반드시 들어갈 7가지", src: "/images/blog/experience-marketing-recruitment-checklist/2.webp", alt: "한국인 마케터가 국내 체험단 모집 공고와 일정을 작성하는 모습", caption: "제공 내역, 일정, 필수 고지와 콘텐츠 기준을 구체적으로 안내합니다." },
    { afterHeading: "지원자는 팔로워 수만으로 고르지 않습니다", src: "/images/blog/experience-marketing-recruitment-checklist/3.webp", alt: "한국인 마케팅팀이 체험단 지원자의 콘텐츠를 검토하는 모습", caption: "기존 콘텐츠의 주제 적합성, 사진과 설명의 품질, 활동 지속성을 함께 봅니다." },
    { afterHeading: "선정 후에는 운영표 한 장이 필요합니다", src: "/images/blog/experience-marketing-recruitment-checklist/4.webp", alt: "한국인 실무자들이 체험단 방문과 발행 일정을 관리하는 모습", caption: "선정, 안내, 방문, 발행, 검수와 활용 동의 상태를 한눈에 관리합니다." },
  ],
  "experience-marketing-review-quality-guide": [
    { afterHeading: "좋은 후기는 강요가 아니라 경험 설계에서 나옵니다", src: "/images/blog/experience-marketing-review-quality-guide/1.webp", alt: "한국 카페 대표가 한국인 체험단에게 대표 디저트를 설명하는 모습", caption: "촬영하기 좋은 환경과 분명한 대표 경험이 구체적인 후기의 출발점입니다." },
    { afterHeading: "체험 가이드는 답안지가 아니어야 합니다", src: "/images/blog/experience-marketing-review-quality-guide/2.webp", alt: "한국인 체험단이 국내 카페에서 음료와 디저트를 직접 촬영하는 모습", caption: "표현을 통제하기보다 확인할 정보와 솔직한 작성 원칙을 분명히 안내합니다." },
    { afterHeading: "사진은 고객의 다음 행동을 도와야 합니다", src: "/images/blog/experience-marketing-review-quality-guide/3.webp", alt: "한국 소상공인과 마케터가 후기의 제품 정보를 검수하는 모습", caption: "대표 장면, 이용 과정과 실제 크기를 이해할 수 있는 사진이 구매 판단을 돕습니다." },
    { afterHeading: "발행 후에는 2차 활용 권한을 확인합니다", src: "/images/blog/experience-marketing-review-quality-guide/4.webp", alt: "한국인 마케팅팀이 체험단 사진과 후기 자료를 정리하는 모습", caption: "홈페이지와 SNS 재활용 전에는 저작권, 초상권과 활용 기간을 확인해야 합니다." },
  ],
  "experience-marketing-roi-measurement": [
    { afterHeading: "체험단도 비용 대비 성과를 계산해야 합니다", src: "/images/blog/experience-marketing-roi-measurement/1.webp", alt: "한국 식당 대표와 한국인 마케터가 체험단 비용을 계산하는 모습", caption: "제품 원가, 운영비와 콘텐츠 활용 가치를 함께 계산해야 실제 효율이 보입니다." },
    { afterHeading: "조회 수보다 고객 행동을 기록합니다", src: "/images/blog/experience-marketing-roi-measurement/2.webp", alt: "한국인 마케터가 체험단 유입과 예약 성과를 확인하는 모습", caption: "조회 수만 보지 말고 검색, 저장, 문의, 예약과 구매 행동을 구분해 기록합니다." },
    { afterHeading: "측정 가능한 장치를 캠페인 전에 심습니다", src: "/images/blog/experience-marketing-roi-measurement/3.webp", alt: "한국 카페 대표와 마케터가 QR과 예약 경로를 준비하는 모습", caption: "전용 링크, 쿠폰 코드와 유입 질문을 미리 준비하면 성과를 추적할 수 있습니다." },
    { afterHeading: "성과가 좋은 콘텐츠는 검색 자산으로 확장합니다", src: "/images/blog/experience-marketing-roi-measurement/4.webp", alt: "한국인 마케팅팀이 체험단 성과 보고서를 발표하는 모습", caption: "우수 콘텐츠를 홈페이지, 상세페이지, SNS와 광고 소재로 연결해 수명을 늘립니다." },
  ],
  "restaurant-review-response-repeat-visit": [
    { afterHeading: "좋은 리뷰는 신규 고객의 불안을 줄입니다", src: "/images/blog/restaurant-review-response-repeat-visit/customer-review.webp", alt: "식당에서 음식 사진과 만족한 경험을 스마트폰으로 기록하는 고객들", caption: "구체적인 메뉴와 이용 상황이 담긴 후기는 처음 방문하는 고객의 판단을 돕습니다." },
    { afterHeading: "리뷰를 네 가지 항목으로 분류하세요", src: "/images/blog/restaurant-review-response-repeat-visit/review-analysis.webp", alt: "식당 운영자가 고객 리뷰를 음식 서비스 청결 대기시간 항목으로 분석하는 모습", caption: "리뷰를 감정적으로 읽기보다 음식·서비스·청결·대기시간으로 분류하면 개선 과제가 보입니다." },
    { afterHeading: "답변보다 먼저 현장의 반복 문제를 고칩니다", src: "/images/blog/restaurant-review-response-repeat-visit/staff-training.webp", alt: "식당 직원들이 고객 피드백과 서비스 개선 방법을 함께 논의하는 모습", caption: "같은 불만이 반복되면 답변 문구보다 조리·응대·대기 안내 기준을 먼저 고쳐야 합니다." },
    { afterHeading: "리뷰 관리는 재방문 설계까지 이어져야 합니다", src: "/images/blog/restaurant-review-response-repeat-visit/repeat-visit.webp", alt: "재방문 고객을 반갑게 맞이하는 식당 직원들", caption: "후기에서 발견한 고객의 기대를 현장 서비스에 반영할 때 재방문과 추천의 기반이 생깁니다." },
  ],
  "dental-marketing-channel-priority": [
    { afterHeading: "세 채널의 역할은 서로 다릅니다", src: "/images/blog/dental-marketing-channel-priority/1.webp", alt: "발견·비교·예약에서 서로 다른 역할을 맡는 플레이스, 홈페이지와 블로그", caption: "세 채널은 경쟁 관계가 아니라 환자의 선택 과정에서 서로 다른 역할을 맡습니다." },
    { afterHeading: "먼저 확인할 10분 체크리스트", src: "/images/blog/dental-marketing-channel-priority/2.webp", alt: "치과의 기본 정보와 모바일 예약 동선을 함께 점검하는 모습", caption: "채널을 늘리기 전에 기본 정보와 실제 예약 동선을 먼저 확인해야 합니다." },
    { afterHeading: "AEO·GEO 관점에서 중요한 점", src: "/images/blog/dental-marketing-channel-priority/3.webp", alt: "공식 정보와 질문형 콘텐츠를 연결해 관리하는 치과 마케팅 환경", caption: "일관된 공식 정보와 명확한 질문형 콘텐츠가 AI 검색 이해의 기반이 됩니다." },
    { afterHeading: "실행 순서", src: "/images/blog/dental-marketing-channel-priority/4.webp", alt: "치과 원장과 마케터가 개선할 채널의 우선순위를 정하는 회의", caption: "현재 환자 동선에서 가장 크게 막힌 한두 영역부터 개선합니다." },
  ],
  "hospital-ads-no-new-patients": [
    { afterHeading: "신규 환자가 늘지 않는 7가지 이유", src: "/images/blog/hospital-ads-no-new-patients/1.webp", alt: "광고 유입과 예약 사이의 문제를 검토하는 병원 마케팅 회의", caption: "광고 클릭 이후의 정보와 상담 동선이 끊기면 신규 환자로 이어지기 어렵습니다." },
    { afterHeading: "광고보다 먼저 볼 숫자", src: "/images/blog/hospital-ads-no-new-patients/2.webp", alt: "병원 광고의 문의·예약·내원 전환 지표를 확인하는 화면", caption: "클릭 수뿐 아니라 문의, 예약과 실제 내원을 단계별로 구분해 측정합니다." },
    { afterHeading: "진료별 페이지를 구분하세요", src: "/images/blog/hospital-ads-no-new-patients/3.webp", alt: "진료별 랜딩 페이지와 고객 질문을 연결하는 작업 화면", caption: "환자의 질문이 다른 진료를 하나의 일반 페이지로 연결하지 않아야 합니다." },
    { afterHeading: "2주 개선 방법", src: "/images/blog/hospital-ads-no-new-patients/4.webp", alt: "병원 광고와 상담 전환 데이터를 바탕으로 개선안을 정하는 모습", caption: "한 진료를 정해 검색어, 페이지와 상담 기록을 함께 개선하고 비교합니다." },
  ],
  "dental-website-no-consultation": [
    { afterHeading: "환자가 홈페이지에서 확인하는 것", src: "/images/blog/dental-website-no-consultation/1.webp", alt: "치과 홈페이지를 모바일과 데스크톱에서 비교하는 사용자", caption: "환자는 진료 범위, 의료진, 위치와 예약 방법을 빠르게 확인하려고 합니다." },
    { afterHeading: "문의를 막는 대표적인 화면", src: "/images/blog/dental-website-no-consultation/2.webp", alt: "모바일 치과 홈페이지에서 예약 동선을 점검하는 모습", caption: "모바일에서 가려진 정보와 긴 신청 과정은 문의를 막을 수 있습니다." },
    { afterHeading: "AEO·GEO에 맞는 페이지 구조", src: "/images/blog/dental-website-no-consultation/3.webp", alt: "질문·답변·진료 정보가 분명하게 구성된 치과 홈페이지", caption: "질문에 바로 답하고 세부 정보와 예약을 연결하는 구조가 필요합니다." },
    { afterHeading: "고칠 순서", src: "/images/blog/dental-website-no-consultation/4.webp", alt: "치과 홈페이지의 사용자 흐름을 분석하고 개선하는 담당자", caption: "전체 개편보다 문의가 많은 진료 페이지 한 곳부터 점검합니다." },
  ],
  "hospital-blog-medical-ad-law-checklist": [
    { afterHeading: "특히 조심할 표현", src: "/images/blog/hospital-blog-medical-ad-law-checklist/1.webp", alt: "병원 블로그 원고의 위험 표현을 검토하는 의료진과 마케터", caption: "치료 효과 단정, 비교와 과장 표현은 발행 전에 반드시 검토해야 합니다." },
    { afterHeading: "정보형 글도 검수해야 합니다", src: "/images/blog/hospital-blog-medical-ad-law-checklist/2.webp", alt: "의료진이 교육형 콘텐츠의 사실관계를 확인하는 모습", caption: "정보형 글도 진료 결과를 단정하거나 중요한 한계를 누락하면 안 됩니다." },
    { afterHeading: "안전한 작성 순서", src: "/images/blog/hospital-blog-medical-ad-law-checklist/3.webp", alt: "출처 확인부터 의료진 승인까지 병원 콘텐츠 검수 과정", caption: "질문 선정, 출처 확인과 최종 의료진 검수를 운영 절차로 만듭니다." },
    { afterHeading: "AEO·GEO와 법 준수는 함께 가야 합니다", src: "/images/blog/hospital-blog-medical-ad-law-checklist/4.webp", alt: "법적 기준과 검색 품질을 함께 검토하는 병원 콘텐츠 회의", caption: "명확한 답변 구조는 정확성, 균형과 법 준수를 전제로 해야 합니다." },
  ],
  "dental-naver-place-review-photo-management": [
    { afterHeading: "1단계: 기본 정보부터 맞춥니다", src: "/images/blog/dental-naver-place-review-photo-management/1.webp", alt: "치과 외부와 내부 방문 정보를 정확하게 기록한 사진", caption: "위치, 진료시간과 방문 안내를 실제 상태에 맞게 관리합니다." },
    { afterHeading: "2단계: 사진은 방문 불안을 줄여야 합니다", src: "/images/blog/dental-naver-place-review-photo-management/2.webp", alt: "치과 접수 공간에서 플레이스 사진을 확인하는 모습", caption: "입구와 접수 공간 등 실제 방문에 도움이 되는 사진을 제공합니다." },
    { afterHeading: "3단계: 리뷰 답변 원칙을 정합니다", src: "/images/blog/dental-naver-place-review-photo-management/3.webp", alt: "개인정보를 보호하며 온라인 리뷰 답변을 작성하는 담당자", caption: "공개 답변에서 진료 내용과 개인정보를 노출하지 않는 원칙이 필요합니다." },
    { afterHeading: "4단계: 예약 동선을 직접 시험합니다", src: "/images/blog/dental-naver-place-review-photo-management/4.webp", alt: "스마트폰으로 치과 전화·예약·길찾기 기능을 점검하는 모습", caption: "모바일에서 전화, 예약과 길찾기 버튼을 직접 시험해야 합니다." },
  ],
  "local-hospital-ai-search-visibility": [
    { afterHeading: "먼저 정리할 공식 정보", src: "/images/blog/local-hospital-ai-search-visibility/1.webp", alt: "여러 화면에 표시된 병원 공식 정보를 대조하는 작업 환경", caption: "병원명, 주소, 의료진과 진료 정보가 공식 채널에서 일치해야 합니다." },
    { afterHeading: "질문 하나에 페이지 하나를 만드세요", src: "/images/blog/local-hospital-ai-search-visibility/2.webp", alt: "환자 질문을 하나의 명확한 답변 페이지로 만드는 콘텐츠 작업", caption: "한 페이지에서 한 질문에 충분히 답하는 고유한 콘텐츠를 만듭니다." },
    { afterHeading: "Google의 공식 안내에서 확인할 점", src: "/images/blog/local-hospital-ai-search-visibility/3.webp", alt: "검색과 AI 콘텐츠 성과를 분석하는 병원 마케팅 담당자", caption: "특별한 비법보다 색인 가능한 구조와 사람에게 유용한 콘텐츠가 우선입니다." },
    { afterHeading: "측정 방법", src: "/images/blog/local-hospital-ai-search-visibility/4.webp", alt: "여러 AI 검색 결과를 같은 질의로 비교하는 담당자", caption: "같은 질문을 반복 측정하고 검색, 출처와 본문 인용을 구분해 기록합니다." },
  ],
  "high-consideration-dental-content-conversion": [
    { afterHeading: "환자의 질문은 단계별로 달라집니다", src: "/images/blog/high-consideration-dental-content-conversion/1.webp", alt: "치과 상담에서 환자의 단계별 질문을 설명하는 의료진", caption: "탐색, 비교와 예약 단계에 따라 환자가 필요로 하는 답이 달라집니다." },
    { afterHeading: "추천 콘텐츠 구조", src: "/images/blog/high-consideration-dental-content-conversion/2.webp", alt: "임플란트와 교정 상담 콘텐츠의 흐름을 설계하는 모습", caption: "상담 대상, 과정, 기간 요인과 준비 사항을 단계별 콘텐츠로 나눕니다." },
    { afterHeading: "가격 중심 콘텐츠의 한계", src: "/images/blog/high-consideration-dental-content-conversion/3.webp", alt: "치과 진료의 가격보다 판단 기준을 설명하는 상담 장면", caption: "가격만 강조하기보다 범위와 개인별 차이를 함께 안내해야 합니다." },
    { afterHeading: "페이지 간 연결", src: "/images/blog/high-consideration-dental-content-conversion/4.webp", alt: "질문형 콘텐츠와 진료 페이지의 전환 경로를 분석하는 화면", caption: "블로그, 진료 페이지, FAQ와 예약을 하나의 정보 흐름으로 연결합니다." },
  ],
  "hospital-marketing-agency-selection-checklist": [
    { afterHeading: "상담할 때 물어볼 8가지", src: "/images/blog/hospital-marketing-agency-selection-checklist/1.webp", alt: "병원 원장과 마케팅 담당자가 여러 제안서를 비교하는 회의", caption: "검수, 계정 소유권, 측정과 인계 조건을 계약 전에 확인합니다." },
    { afterHeading: "경계해야 할 신호", src: "/images/blog/hospital-marketing-agency-selection-checklist/2.webp", alt: "병원 마케팅 계약서와 운영 조건을 꼼꼼히 검토하는 모습", caption: "성과 보장과 불투명한 계정 운영 제안은 주의해서 살펴야 합니다." },
    { afterHeading: "좋은 보고서는 다음 행동을 보여줍니다", src: "/images/blog/hospital-marketing-agency-selection-checklist/3.webp", alt: "병원 마케팅 성과와 다음 개선안을 함께 검토하는 보고 회의", caption: "좋은 보고서는 숫자뿐 아니라 문제 원인과 다음 실행을 설명합니다." },
    { afterHeading: "계약 전에 남길 문서", src: "/images/blog/hospital-marketing-agency-selection-checklist/4.webp", alt: "병원과 대행사가 업무 범위와 자산 인계를 문서로 확인하는 모습", caption: "업무 범위, 승인 절차, 계정과 원본 인계 조건을 문서로 남깁니다." },
  ],
  "medical-staff-profile-trust-page": [
    { afterHeading: "기본으로 넣을 정보", src: "/images/blog/medical-staff-profile-trust-page/1.webp", alt: "의료진의 경력과 담당 진료 정보를 검증하는 콘텐츠 팀", caption: "확인 가능한 경력, 현재 직함과 담당 진료를 정확하게 정리합니다." },
    { afterHeading: "사진과 문장은 실제 경험과 맞아야 합니다", src: "/images/blog/medical-staff-profile-trust-page/2.webp", alt: "밝은 치과에서 자연스러운 의료진 사진을 촬영하는 모습", caption: "과도한 연출보다 실제 진료 환경과 맞는 자연스러운 이미지를 사용합니다." },
    { afterHeading: "진료 페이지와 연결합니다", src: "/images/blog/medical-staff-profile-trust-page/3.webp", alt: "의료진 프로필과 관련 진료 페이지가 연결된 홈페이지 화면", caption: "의료진 소개에서 담당 진료와 검수한 콘텐츠로 자연스럽게 이동해야 합니다." },
    { afterHeading: "AEO·GEO 관점", src: "/images/blog/medical-staff-profile-trust-page/4.webp", alt: "의료진 프로필 페이지의 정보 일관성을 점검하는 모습", caption: "이름, 직함과 담당 진료가 홈페이지와 외부 채널에서 일관되어야 합니다." },
  ],
  "hospital-inquiry-to-booking-conversion": [
    { afterHeading: "예약을 막는 대표적인 원인", src: "/images/blog/hospital-inquiry-to-booking-conversion/1.webp", alt: "많은 문의와 적은 확정 예약을 비교하는 병원 상담 담당자", caption: "문의가 많아도 늦은 응답과 불분명한 다음 단계는 예약을 막습니다." },
    { afterHeading: "첫 응대에서 확인할 것", src: "/images/blog/hospital-inquiry-to-booking-conversion/2.webp", alt: "병원 상담 직원이 표준 응대 절차를 교육받는 모습", caption: "방문 목적과 희망 시간을 확인하고 의료 상담과 행정 안내를 구분합니다." },
    { afterHeading: "홈페이지가 상담을 도와야 합니다", src: "/images/blog/hospital-inquiry-to-booking-conversion/3.webp", alt: "병원 홈페이지의 FAQ와 예약 안내를 활용하는 상담 환경", caption: "반복 질문을 홈페이지에 정리하면 환자와 담당자가 같은 기준을 볼 수 있습니다." },
    { afterHeading: "기록할 전환 단계", src: "/images/blog/hospital-inquiry-to-booking-conversion/4.webp", alt: "문의부터 실제 내원까지 전환 흐름을 분석하는 화면", caption: "문의, 응답, 예약 확정과 실제 내원을 단계별로 기록합니다." },
  ],
  "naver-smartplace-management": [
    { afterHeading: "도입: 등록은 시작일 뿐입니다", src: "/images/blog/naver-smartplace-management/profile-review.webp", alt: "매장 대표가 태블릿으로 스마트플레이스 정보를 점검하는 모습", caption: "스마트플레이스 등록은 시작이며, 고객이 보는 정보와 반응을 지속적으로 관리해야 합니다." },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/blog/naver-smartplace-management/common-mistakes.webp", alt: "영업시간 사진 리뷰 등 매장 정보가 서로 달라 혼란스러운 모습", caption: "오래된 사진, 잘못된 영업시간과 방치된 리뷰는 고객의 선택을 방해합니다." },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/blog/naver-smartplace-management/management-checklist.webp", alt: "매장 정보 사진 리뷰 예약과 지도 위치를 확인하는 체크리스트", caption: "기본 정보부터 사진, 리뷰, 예약과 지도 위치까지 빠짐없이 점검해야 합니다." },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/blog/naver-smartplace-management/monthly-cycle.webp", alt: "매장 대표와 마케터가 월간 관리 지표와 개선 주기를 검토하는 모습", caption: "월간 단위로 업데이트와 고객 반응을 확인하면 스마트플레이스가 꾸준히 성장합니다." },
  ],
  "google-business-profile-local-store": [
    { afterHeading: "도입: 고객의 지도 선택지는 하나가 아닙니다", src: "/images/blog/google-business-profile-local-store/local-discovery.webp", alt: "국내외 방문객이 지도 검색으로 한국의 지역 매장을 발견하는 모습", caption: "지역 고객과 외국인 방문객 모두 다양한 지도 검색을 통해 매장을 발견합니다." },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/blog/google-business-profile-local-store/profile-errors.webp", alt: "잘못된 지도 위치와 영업시간 오래된 사진 미답변 리뷰를 보여주는 이미지", caption: "지도 위치와 영업시간이 틀리거나 리뷰를 방치하면 방문 전 신뢰가 떨어집니다." },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/blog/google-business-profile-local-store/field-checklist.webp", alt: "지도 전화 영업시간 사진 웹사이트와 리뷰 정보를 연결한 매장 프로필", caption: "위치, 연락처, 영업시간, 사진과 웹사이트 정보를 정확하게 연결해야 합니다." },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/blog/google-business-profile-local-store/info-sync.webp", alt: "두 지도 서비스의 동일한 매장 정보를 동기화해 관리하는 모습", caption: "여러 지도 서비스에 표시되는 매장 정보를 일치시키고 정기적으로 갱신해야 합니다." },
  ],
  "why-ai-cannot-explain-your-business": [
    { afterHeading: "도입: 정보가 없어서가 아니라 연결되지 않아서입니다", src: "/images/blog/why-ai-cannot-explain-your-business/scattered-data.webp", alt: "웹사이트 블로그 지도와 문서에 흩어진 회사 정보 때문에 AI가 혼란스러운 모습", caption: "회사 정보가 여러 채널에 흩어져 있으면 AI가 하나의 정확한 답으로 연결하기 어렵습니다." },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/blog/why-ai-cannot-explain-your-business/inconsistent-identity.webp", alt: "채널마다 다른 회사 정보와 연락처 위치가 표시된 모습", caption: "회사명, 서비스, 연락처와 위치가 채널마다 다르면 사람과 AI 모두 혼란을 겪습니다." },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/blog/why-ai-cannot-explain-your-business/entity-graph.webp", alt: "회사 대표 서비스 위치 사례 FAQ와 연락처가 연결된 정보 구조", caption: "회사와 대표, 서비스, 지역, 사례와 FAQ를 일관된 구조로 연결해야 합니다." },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/blog/why-ai-cannot-explain-your-business/trusted-ai-answer.webp", alt: "정리된 회사 정보를 바탕으로 AI가 고객에게 정확히 답하는 모습", caption: "명확한 회사 소개와 구조화된 정보는 AI의 정확한 답변과 고객 신뢰로 이어집니다." },
  ],
  "consulting-business-website-faq": [
    { afterHeading: "도입: 상담 전에 이미 여러 질문이 생깁니다", src: "/images/blog/consulting-business-website-faq/pre-consultation-questions.webp", alt: "고객이 상담 전에 비용 절차 대상 기간과 결과를 고민하는 모습", caption: "상담 신청 전 고객은 비용, 절차, 대상, 기간과 결과에 관한 답을 먼저 찾습니다." },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/blog/consulting-business-website-faq/vague-website.webp", alt: "디자인은 좋지만 서비스와 절차 정보가 부족해 고객이 이탈하는 홈페이지", caption: "보기 좋은 홈페이지라도 구체적인 판단 정보가 없으면 고객은 상담 전에 이탈합니다." },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/blog/consulting-business-website-faq/service-page-flow.webp", alt: "서비스 대상 절차 사례 FAQ와 상담 신청으로 이어지는 홈페이지 구조", caption: "서비스 설명, 대상, 절차, 사례, FAQ와 상담 신청을 하나의 흐름으로 설계해야 합니다." },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/blog/consulting-business-website-faq/faq-feedback-loop.webp", alt: "실제 상담 질문을 분석해 홈페이지 FAQ를 꾸준히 갱신하는 모습", caption: "실제 상담에서 반복되는 질문을 FAQ에 반영하면 상담 효율과 고객 신뢰가 함께 높아집니다." },
  ],
  "government-support-marketing-budget": [
    { afterHeading: "도입: 선정 이후에는 실행 순서가 중요합니다", src: "/images/blog/government-support-marketing-budget/budget-planning.webp", alt: "정부지원사업 선정 후 홈페이지 콘텐츠 광고 예산을 계획하는 모습", caption: "선정 이후에는 홈페이지, 콘텐츠와 광고가 고객 행동으로 이어지도록 실행 순서를 정해야 합니다." },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/blog/government-support-marketing-budget/fragmented-budget.webp", alt: "지원 예산이 연결되지 않은 홈페이지 사진 영상 광고 제작물로 흩어진 모습", caption: "개별 결과물만 제작하면 예산은 집행되지만 고객 유입과 매출로 이어지는 흐름이 남지 않습니다." },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/blog/government-support-marketing-budget/execution-checklist.webp", alt: "지원사업 지침 소유권 원본 파일 계정과 성과 지표를 확인하는 체크리스트", caption: "집행 지침과 계정 소유권, 원본 파일, 운영 권한과 고객 행동 지표를 사전에 확인해야 합니다." },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/blog/government-support-marketing-budget/lasting-assets.webp", alt: "사업 종료 뒤에도 도메인 소스 파일 콘텐츠 운영 매뉴얼과 분석 자료가 남는 모습", caption: "사업 종료 후에도 회사 소유의 도메인, 원본, 콘텐츠와 운영 기준이 남아야 합니다." },
  ],
  "why-website-not-showing-in-search-7-reasons": [
    {
      afterHeading: "홈페이지를 만들었는데 왜 검색에 안 뜰까요?",
      src: "/images/blog/website-search-7-reasons/search-result-missing.webp",
      alt: "홈페이지가 검색 결과에 나타나지 않아 원인을 확인하는 소상공인",
      caption: "홈페이지를 공개했더라도 검색엔진이 사이트를 발견하고 이해하기까지 별도의 점검이 필요합니다.",
    },
    {
      afterHeading: "홈페이지가 검색에 안 뜨는 7가지 이유",
      src: "/images/blog/website-search-7-reasons/crawling-indexing-flow.webp",
      alt: "검색 로봇의 홈페이지 크롤링과 검색엔진 색인 과정을 설명한 이미지",
      caption: "검색 노출은 검색 로봇의 발견, 페이지 수집, 정보 이해와 색인의 순서로 이루어집니다.",
    },
    {
      afterHeading: "가장 먼저 확인할 10분 체크리스트",
      src: "/images/blog/website-search-7-reasons/technical-seo-audit.webp",
      alt: "사이트맵 모바일 속도 보안 링크와 색인 상태를 점검하는 기술 SEO 진단",
      caption: "사이트맵, 모바일 화면, 페이지 속도, 보안과 링크 상태를 함께 확인해야 합니다.",
    },
    {
      afterHeading: "검색 노출을 매출로 연결하는 운영 순서",
      src: "/images/blog/website-search-7-reasons/search-visibility-roadmap.webp",
      alt: "홈페이지 구조 개선부터 검색 노출과 고객 유입으로 이어지는 운영 순서",
      caption: "기술 구조와 콘텐츠를 보완한 뒤 검색에서 발견된 고객이 상담까지 이동하도록 연결합니다.",
    },
  ],
  "aeo-geo-small-business-guide": [
    { afterHeading: "도입: 답변에 포함될 수 있는 정보 구조", src: "/images/blog/editorial/homepage-review.webp", alt: "공식 홈페이지와 고객 질문을 함께 점검하는 소상공인과 마케팅 전문가", caption: "공식 홈페이지와 고객 질문을 함께 점검하는 소상공인과 마케팅 전문가" },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/insights/photo-ai-technology-work.jpg", alt: "AI 검색 환경에서 사업 정보를 확인하는 실무 장면", caption: "AI 검색 환경에서 사업 정보를 확인하는 실무 장면" },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/insights/entity-information-map.png", alt: "사업의 공식 정보와 채널 연결 구조", caption: "사업의 공식 정보와 채널 연결 구조" },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/insights/photo-team-laptop.jpg", alt: "고객 질문과 답변 콘텐츠를 정리하는 팀", caption: "고객 질문과 답변 콘텐츠를 정리하는 팀" },
  ],
  "ai-search-website-importance": [
    { afterHeading: "도입: 홈페이지는 공식 정보의 기준점입니다", src: "/images/blog/editorial/homepage-review.webp", alt: "공식 홈페이지와 고객 질문을 함께 점검하는 소상공인과 마케팅 전문가", caption: "공식 홈페이지와 고객 질문을 함께 점검하는 소상공인과 마케팅 전문가" },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/insights/ai-search-website-importance.jpg", alt: "AI 검색 시대 공식 정보의 중심이 되는 홈페이지", caption: "AI 검색 시대 공식 정보의 중심이 되는 홈페이지" },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/insights/photo-website-developer.jpg", alt: "홈페이지 정보 구조를 점검하는 실무자", caption: "홈페이지 정보 구조를 점검하는 실무자" },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/insights/website-conversion-checklist.png", alt: "홈페이지 정보와 상담 전환 점검 항목", caption: "홈페이지 정보와 상담 전환 점검 항목" },
  ],
  "ai-search-website-structure": [
    { afterHeading: "공식 홈페이지는 기업 정보의 기준점입니다", src: "/images/blog/editorial/entity-audit.webp", alt: "여러 채널에 흩어진 회사 정보를 하나의 기준으로 정리하는 팀", caption: "여러 채널에 흩어진 회사 정보를 하나의 기준으로 정리하는 팀" },
    { afterHeading: "질문에 답하는 구조를 만듭니다", src: "/images/insights/ai-search-local-growth.png", alt: "AI 검색과 지역 고객 유입을 연결하는 구조", caption: "AI 검색과 지역 고객 유입을 연결하는 구조" },
    { afterHeading: "AEO/GEO는 보장이 아니라 이해 기반을 만드는 일입니다", src: "/images/insights/photo-team-office.jpg", alt: "공식 홈페이지와 채널 정보를 정리하는 사무실 회의", caption: "공식 홈페이지와 채널 정보를 정리하는 사무실 회의" },
    { afterHeading: "AEO/GEO는 보장이 아니라 이해 기반을 만드는 일입니다", src: "/images/insights/photo-it-professional.jpg", alt: "여러 온라인 채널의 사업 정보를 점검하는 실무자", caption: "여러 온라인 채널의 사업 정보를 점검하는 실무자" },
  ],
  "business-type-marketing-priority": [
    { afterHeading: "매장 방문형은 발견과 방문 동선이 먼저입니다", src: "/images/blog/editorial/business-types.webp", alt: "사업 유형별로 서로 다른 마케팅 우선순위를 정리하는 소상공인들", caption: "사업 유형별로 서로 다른 마케팅 우선순위를 정리하는 소상공인들" },
    { afterHeading: "매장 방문형은 발견과 방문 동선이 먼저입니다", src: "/images/insights/photo-local-business-owners.jpg", alt: "지역 매장을 운영하는 소상공인", caption: "지역 매장을 운영하는 소상공인" },
    { afterHeading: "온라인 판매형은 비교와 구매 정보가 먼저입니다", src: "/images/insights/photo-ecommerce-devices.jpg", alt: "온라인 판매를 위한 상품 페이지와 모바일 화면", caption: "온라인 판매를 위한 상품 페이지와 모바일 화면" },
    { afterHeading: "상담·계약형은 신뢰와 문의 동선이 먼저입니다", src: "/images/insights/photo-consulting-meeting.jpg", alt: "상담 계약형 서비스의 신뢰 형성 과정", caption: "상담 계약형 서비스의 신뢰 형성 과정" },
  ],
  "consulting-contract-price-comparison": [
    { afterHeading: "도입: 차이를 이해하지 못하면 가격부터 묻게 됩니다", src: "/images/blog/editorial/consultation-value.webp", alt: "서비스 가격보다 판단 기준과 진행 과정을 설명하는 상담 장면", caption: "서비스 가격보다 판단 기준과 진행 과정을 설명하는 상담 장면" },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/insights/consulting-contract-price-comparison.jpg", alt: "상담형 서비스의 가치와 차이를 설명하는 회의", caption: "상담형 서비스의 가치와 차이를 설명하는 회의" },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/insights/photo-consulting-documents.jpg", alt: "상담 전에 비교할 서비스 범위와 자료", caption: "상담 전에 비교할 서비스 범위와 자료" },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/insights/homepage-faq-first.png", alt: "가격 문의 전에 제공해야 할 홈페이지와 FAQ 정보", caption: "가격 문의 전에 제공해야 할 홈페이지와 FAQ 정보" },
  ],
  "enterprise-entity-basics": [
    { afterHeading: "Entity는 하나의 대상으로 인식되는 정보 묶음입니다", src: "/images/blog/editorial/entity-audit.webp", alt: "여러 채널에 흩어진 회사 정보를 하나의 기준으로 정리하는 팀", caption: "여러 채널에 흩어진 회사 정보를 하나의 기준으로 정리하는 팀" },
    { afterHeading: "Entity는 하나의 대상으로 인식되는 정보 묶음입니다", src: "/images/insights/enterprise-entity-basics.jpg", alt: "기업의 공식 정보를 한곳에서 검토하는 실무 장면", caption: "기업의 공식 정보를 한곳에서 검토하는 실무 장면" },
    { afterHeading: "홈페이지를 중심으로 채널을 연결합니다", src: "/images/insights/enterprise-entity-review.png", alt: "기업명과 서비스 및 공식 채널을 연결하는 정보 구조", caption: "기업명과 서비스 및 공식 채널을 연결하는 정보 구조" },
    { afterHeading: "정보 정리는 지속적으로 관리해야 합니다", src: "/images/insights/photo-team-office.jpg", alt: "기업 정보의 일관성을 점검하는 팀", caption: "기업 정보의 일관성을 점검하는 팀" },
  ],
  "hope-return-package-marketing-assets": [
    { afterHeading: "도입: 결과물보다 운영 가능성이 중요합니다", src: "/images/blog/editorial/support-budget.webp", alt: "정부지원 마케팅 예산을 지속 가능한 자산 중심으로 설계하는 회의", caption: "정부지원 마케팅 예산을 지속 가능한 자산 중심으로 설계하는 회의" },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/insights/hope-return-package-marketing-assets.jpg", alt: "지원사업 결과물을 장기 마케팅 자산으로 계획하는 모습", caption: "지원사업 결과물을 장기 마케팅 자산으로 계획하는 모습" },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/insights/photo-budget-calculator.jpg", alt: "예산과 실행 항목을 구체적으로 계산하는 과정", caption: "예산과 실행 항목을 구체적으로 계산하는 과정" },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/insights/hope-return-assets.png", alt: "지원사업 이후 남겨야 할 마케팅 자산", caption: "지원사업 이후 남겨야 할 마케팅 자산" },
  ],
  "local-store-before-ads-checklist": [
    { afterHeading: "도입: 광고는 방문 동선을 확대합니다", src: "/images/blog/editorial/local-store-review.webp", alt: "매장 안에서 지도 정보와 리뷰 및 예약 동선을 확인하는 점주", caption: "매장 안에서 지도 정보와 리뷰 및 예약 동선을 확인하는 점주" },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/insights/local-store-before-ads-checklist.jpg", alt: "광고 전에 매장 정보와 고객 동선을 점검하는 점주", caption: "광고 전에 매장 정보와 고객 동선을 점검하는 점주" },
    { afterHeading: "광고 전에 점검할 5가지", src: "/images/insights/photo-local-cafe-interior.jpg", alt: "사진과 방문 정보가 중요한 지역 매장 내부", caption: "사진과 방문 정보가 중요한 지역 매장 내부" },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/insights/local-store-before-ads.png", alt: "지역 매장이 광고 전에 확인할 기본 항목", caption: "지역 매장이 광고 전에 확인할 기본 항목" },
  ],
  "marketing-priority-consulting": [
    { afterHeading: "도입: 채널보다 고객의 다음 행동을 먼저 봅니다", src: "/images/blog/editorial/consultation-value.webp", alt: "서비스 가격보다 판단 기준과 진행 과정을 설명하는 상담 장면", caption: "서비스 가격보다 판단 기준과 진행 과정을 설명하는 상담 장면" },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/insights/marketing-priority-consulting.jpg", alt: "마케팅 실행 순서를 상담하는 사업자와 전문가", caption: "마케팅 실행 순서를 상담하는 사업자와 전문가" },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/insights/photo-team-laptop.jpg", alt: "현재 보유한 채널과 콘텐츠를 점검하는 팀", caption: "현재 보유한 채널과 콘텐츠를 점검하는 팀" },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/insights/marketing-sequence-board.png", alt: "진단부터 개선까지 이어지는 마케팅 실행 순서", caption: "진단부터 개선까지 이어지는 마케팅 실행 순서" },
  ],
  "online-store-before-ads-checklist": [
    { afterHeading: "도입: 광고는 준비된 판매 구조로 보내야 합니다", src: "/images/blog/editorial/ecommerce-review.webp", alt: "광고 전에 상품 상세페이지와 구매 정보를 점검하는 온라인 판매자", caption: "광고 전에 상품 상세페이지와 구매 정보를 점검하는 온라인 판매자" },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/insights/online-store-before-ads-checklist.jpg", alt: "온라인 광고 전에 상품 페이지를 확인하는 판매자", caption: "온라인 광고 전에 상품 페이지를 확인하는 판매자" },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/insights/photo-ecommerce-cart.jpg", alt: "구매 전환 과정에서 확인해야 할 장바구니 동선", caption: "구매 전환 과정에서 확인해야 할 장바구니 동선" },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/insights/smartstore-ad-checklist.png", alt: "온라인 판매자가 광고 전에 점검할 항목", caption: "온라인 판매자가 광고 전에 점검할 항목" },
  ],
  "smartplace-first-checklist": [
    { afterHeading: "노출보다 기준 정보가 먼저입니다", src: "/images/blog/editorial/local-store-review.webp", alt: "매장 안에서 지도 정보와 리뷰 및 예약 동선을 확인하는 점주", caption: "매장 안에서 지도 정보와 리뷰 및 예약 동선을 확인하는 점주" },
    { afterHeading: "노출보다 기준 정보가 먼저입니다", src: "/images/insights/naver-smartplace-management.jpg", alt: "스마트플레이스 정보를 관리하는 지역 점주", caption: "스마트플레이스 정보를 관리하는 지역 점주" },
    { afterHeading: "고객이 비교하는 자료를 채웁니다", src: "/images/insights/google-map-profile-check.png", alt: "지도 검색에서 매장 정보를 확인하는 과정", caption: "지도 검색에서 매장 정보를 확인하는 과정" },
    { afterHeading: "검색어는 고객의 방문 목적에서 찾습니다", src: "/images/insights/featured-smartplace-review.png", alt: "매장 정보와 사진 및 리뷰 관리 항목", caption: "매장 정보와 사진 및 리뷰 관리 항목" },
  ],
  "what-is-entity-ai-search": [
    { afterHeading: "도입: Entity는 식별할 수 있는 하나의 대상입니다", src: "/images/blog/editorial/entity-audit.webp", alt: "여러 채널에 흩어진 회사 정보를 하나의 기준으로 정리하는 팀", caption: "여러 채널에 흩어진 회사 정보를 하나의 기준으로 정리하는 팀" },
    { afterHeading: "대표님들이 자주 하는 실수", src: "/images/insights/what-is-entity-ai-search.jpg", alt: "AI가 이해할 수 있도록 기업 정보를 연결하는 실무 장면", caption: "AI가 이해할 수 있도록 기업 정보를 연결하는 실무 장면" },
    { afterHeading: "먼저 점검해야 할 항목", src: "/images/insights/entity-information-map.png", alt: "회사와 대표자 및 서비스의 관계를 보여주는 정보 구조", caption: "회사와 대표자 및 서비스의 관계를 보여주는 정보 구조" },
    { afterHeading: "거상마케팅센터 관점의 해결 방향", src: "/images/insights/photo-ai-technology-work.jpg", alt: "AI 검색에서 기업 정보를 확인하는 과정", caption: "AI 검색에서 기업 정보를 확인하는 과정" },
  ],
  "why-homepage-is-center-of-ai-search-marketing": [
    { afterHeading: "블로그와 SNS만으로는 부족한 이유", src: "/images/blog/editorial/homepage-review.webp", alt: "공식 홈페이지와 고객 질문을 함께 점검하는 소상공인과 마케팅 전문가", caption: "공식 홈페이지와 고객 질문을 함께 점검하는 소상공인과 마케팅 전문가" },
    { afterHeading: "AI가 이해하기 좋은 홈페이지의 5가지 조건", src: "/images/insights/ai-search-website-importance.jpg", alt: "AI 검색 마케팅의 기준점이 되는 공식 홈페이지", caption: "AI 검색 마케팅의 기준점이 되는 공식 홈페이지" },
    { afterHeading: "홈페이지 중심 마케팅 퍼널", src: "/images/insights/featured-ai-website.png", alt: "홈페이지와 검색 및 상담을 연결하는 구조", caption: "홈페이지와 검색 및 상담을 연결하는 구조" },
    { afterHeading: "지금 확인해야 할 홈페이지 체크리스트", src: "/images/insights/photo-website-developer.jpg", alt: "홈페이지 콘텐츠와 기술 요소를 점검하는 실무자", caption: "홈페이지 콘텐츠와 기술 요소를 점검하는 실무자" },
  ],
  "why-local-business-needs-homepage-ai-search": [
    { afterHeading: "손님은 이제 검색창이 아니라 AI에게 묻습니다", src: "/images/blog/editorial/homepage-review.webp", alt: "공식 홈페이지와 고객 질문을 함께 점검하는 소상공인과 마케팅 전문가", caption: "공식 홈페이지와 고객 질문을 함께 점검하는 소상공인과 마케팅 전문가" },
    { afterHeading: "스마트플레이스와 SNS만으로 부족한 이유", src: "/images/insights/photo-local-business-owners.jpg", alt: "온라인 채널을 운영하는 지역 소상공인", caption: "온라인 채널을 운영하는 지역 소상공인" },
    { afterHeading: "AI 검색에 강한 홈페이지의 5가지 조건", src: "/images/insights/ai-search-local-growth.png", alt: "홈페이지와 지역 고객 유입의 연결 구조", caption: "홈페이지와 지역 고객 유입의 연결 구조" },
    { afterHeading: "소상공인 홈페이지 구축 체크리스트", src: "/images/insights/aeo-geo-small-business-guide.jpg", alt: "소상공인의 공식 홈페이지 정보를 확인하는 상담 장면", caption: "소상공인의 공식 홈페이지 정보를 확인하는 상담 장면" },
  ],
};

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

function absoluteUrl(value = "") {
  if (!value) return "";
  try { return new URL(value, SITE_URL).toString(); } catch { return ""; }
}

function safeExternalUrl(value = "") {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:" ? parsed.toString() : "";
  } catch { return ""; }
}

function richText(property) {
  const values = property?.title || property?.rich_text || [];
  return values.map((item) => item.plain_text || "").join("").trim();
}

function selectValues(property) {
  if (property?.select?.name) return [property.select.name];
  if (Array.isArray(property?.multi_select)) return property.multi_select.map((item) => item.name).filter(Boolean);
  const text = richText(property);
  return text ? text.split(",").map((item) => item.trim()).filter(Boolean) : [];
}

function fileUrl(property) {
  const file = property?.files?.[0];
  return file?.file?.url || file?.external?.url || "";
}

function mapPost(page) {
  const p = page.properties || {};
  const services = selectValues(p["관련 서비스"]);
  const rawCta = p["CTA 링크"]?.url || richText(p["CTA 링크"]);
  const ctaLink = rawCta && (rawCta.startsWith("/") || rawCta.startsWith(SITE_URL)) ? rawCta : "/contact?type=consulting&source=blog";
  const slug = richText(p["Slug"]);
  const editorialCovers = {
    "experience-marketing-blog-vs-instagram": "/images/blog/experience-marketing-blog-vs-instagram/cover.webp",
    "experience-marketing-local-keyword-guide": "/images/blog/experience-marketing-local-keyword-guide/cover.webp",
    "experience-marketing-content-reuse": "/images/blog/experience-marketing-content-reuse/cover.webp",
    "experience-marketing-recruitment-checklist": "/images/blog/experience-marketing-recruitment-checklist/cover.webp",
    "experience-marketing-review-quality-guide": "/images/blog/experience-marketing-review-quality-guide/cover.webp",
    "experience-marketing-roi-measurement": "/images/blog/experience-marketing-roi-measurement/cover.webp",
    "dental-marketing-channel-priority": "/images/blog/dental-marketing-channel-priority/cover.webp",
    "hospital-ads-no-new-patients": "/images/blog/hospital-ads-no-new-patients/cover.webp",
    "dental-website-no-consultation": "/images/blog/dental-website-no-consultation/cover.webp",
    "hospital-blog-medical-ad-law-checklist": "/images/blog/hospital-blog-medical-ad-law-checklist/cover.webp",
    "dental-naver-place-review-photo-management": "/images/blog/dental-naver-place-review-photo-management/cover.webp",
    "local-hospital-ai-search-visibility": "/images/blog/local-hospital-ai-search-visibility/cover.webp",
    "high-consideration-dental-content-conversion": "/images/blog/high-consideration-dental-content-conversion/cover.webp",
    "hospital-marketing-agency-selection-checklist": "/images/blog/hospital-marketing-agency-selection-checklist/cover.webp",
    "medical-staff-profile-trust-page": "/images/blog/medical-staff-profile-trust-page/cover.webp",
    "hospital-inquiry-to-booking-conversion": "/images/blog/hospital-inquiry-to-booking-conversion/cover.webp",
    "why-homepage-is-center-of-ai-search-marketing": "/images/blog/ai-search-homepage-center.png",
    "why-local-business-needs-homepage-ai-search": "/images/blog/ai-search-local-business-homepage.webp",
    "how-to-write-website-content-cited-by-ai-search": "/images/blog/ai-search-cited-content/cover.webp",
    "aeo-geo-website-diagnostic-checklist-20": "/images/blog/aeo-geo-checklist-20/cover.webp",
    "why-website-not-showing-in-search-7-reasons": "/images/blog/website-search-7-reasons.svg",
    "restaurant-signature-menu-marketing": "/images/blog/restaurant-signature-menu-marketing/cover-v2.webp",
    "restaurant-review-response-repeat-visit": "/images/blog/restaurant-review-response-repeat-visit/cover.webp",
    "restaurant-naver-place-photo-guide": "/images/insights/photo-local-cafe-interior.jpg",
    "restaurant-experience-group-roi": "/images/blog/restaurant-experience-group-roi/cover.webp",
    "restaurant-group-booking-marketing": "/images/blog/restaurant-group-booking-marketing/cover.webp",
    ...MIGRATED_INSIGHT_COVERS,
  };
  return {
    id: page.id,
    title: richText(p["제목"]),
    slug,
    category: selectValues(p["카테고리"])[0] || "마케팅 인사이트",
    question: richText(p["핵심 질문"]),
    excerpt: richText(p["요약"]),
    image: fileUrl(p["대표 이미지"]) || editorialCovers[slug] || "",
    publishedAt: p["작성일"]?.date?.start || "",
    modifiedAt: page.last_edited_time || "",
    seoTitle: richText(p["SEO 제목"]),
    seoDescription: richText(p["SEO 설명"]),
    keywords: selectValues(p["키워드"]),
    services,
    ctaLabel: richText(p["CTA 문구"]) || "마케팅 상담 요청하기",
    ctaLink,
  };
}

async function notionRequest(path, options = {}) {
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not configured");
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`Notion API ${response.status}: ${await response.text()}`);
  return response.json();
}

async function cached(key, loader) {
  const found = memoryCache.get(key);
  if (found && found.expires > Date.now()) return found.value;
  const value = await loader();
  memoryCache.set(key, { value, expires: Date.now() + CACHE_SECONDS * 1000 });
  return value;
}

async function fetchPosts() {
  return cached("published-posts", async () => {
    const databaseId = process.env.NOTION_BLOG_DATABASE_ID;
    if (!databaseId) throw new Error("NOTION_BLOG_DATABASE_ID is not configured");
    const database = await notionRequest(`/databases/${databaseId}`);
    const dataSourceId = database.data_sources?.[0]?.id;
    if (!dataSourceId) throw new Error("The Notion database has no readable data source");
    const results = [];
    let cursor;
    do {
      const data = await notionRequest(`/data_sources/${dataSourceId}/query`, {
        method: "POST",
        body: JSON.stringify({
          filter: { property: "공개 여부", checkbox: { equals: true } },
          sorts: [{ property: "작성일", direction: "descending" }],
          page_size: 100,
          ...(cursor ? { start_cursor: cursor } : {}),
        }),
      });
      results.push(...data.results);
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);
    return results.map(mapPost).filter((post) => post.title && post.slug && post.publishedAt);
  });
}

async function fetchBlocks(blockId) {
  return cached(`blocks:${blockId}`, async () => {
    const blocks = [];
    let cursor;
    do {
      const suffix = `?page_size=100${cursor ? `&start_cursor=${encodeURIComponent(cursor)}` : ""}`;
      const data = await notionRequest(`/blocks/${blockId}/children${suffix}`);
      blocks.push(...data.results);
      cursor = data.has_more ? data.next_cursor : null;
    } while (cursor);
    await Promise.all(blocks.filter((block) => block.type === "table" && block.has_children).map(async (block) => {
      block.children = await fetchBlocks(block.id);
    }));
    return blocks;
  });
}

function blockText(block) {
  const type = block.type;
  const rich = block[type]?.rich_text || [];
  return rich.map((item) => {
    let value = escapeHtml(item.plain_text || "");
    const href = safeExternalUrl(item.href);
    if (href) value = `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${value}</a>`;
    if (item.annotations?.bold) value = `<strong>${value}</strong>`;
    if (item.annotations?.italic) value = `<em>${value}</em>`;
    if (item.annotations?.code) value = `<code>${value}</code>`;
    return value;
  }).join("");
}

function inlineImageLayout(src = "") {
  if (src.startsWith("/images/insights/photo-") || [
    "/images/blog/editorial/business-types.webp",
    "/images/blog/editorial/local-store-review.webp",
  ].includes(src)) {
    return { className: "is-photo-four-three", width: 1200, height: 900 };
  }
  if (src.startsWith("/images/insights/") && src.endsWith(".png")) {
    return { className: "is-square-graphic", width: 900, height: 900 };
  }
  return { className: "is-landscape", width: 1600, height: 900 };
}

function renderBlocks(blocks, slug = "") {
  const output = [];
  const inlineImages = INLINE_BLOG_IMAGES[slug] || [];
  let listType = "";
  for (const block of blocks) {
    const type = block.type;
    const isList = type === "bulleted_list_item" || type === "numbered_list_item";
    const nextList = type === "numbered_list_item" ? "ol" : isList ? "ul" : "";
    if (listType && listType !== nextList) { output.push(`</${listType}>`); listType = ""; }
    if (isList) {
      if (!listType) { listType = nextList; output.push(`<${listType}>`); }
      output.push(`<li>${blockText(block)}</li>`);
      continue;
    }
    if (type === "paragraph") output.push(`<p>${blockText(block)}</p>`);
    else if (type === "heading_2") {
      const headingText = (block[type]?.rich_text || []).map((item) => item.plain_text || "").join("").trim();
      const headingId = `section-${block.id}`;
      output.push(`<h2 id="${escapeHtml(headingId)}">${blockText(block)}</h2>`);
      const matchingImages = inlineImages.filter((item) => item.afterHeading === headingText);
      for (const inlineImage of matchingImages) {
        const layout = inlineImageLayout(inlineImage.src);
        output.push(`<figure class="blog-inline-figure ${layout.className}"><img src="${escapeHtml(inlineImage.src)}" alt="${escapeHtml(inlineImage.alt)}" loading="lazy" width="${layout.width}" height="${layout.height}" /><figcaption>${escapeHtml(inlineImage.caption)}</figcaption></figure>`);
      }
    }
    else if (type === "heading_3") output.push(`<h3>${blockText(block)}</h3>`);
    else if (type === "quote") output.push(`<blockquote>${blockText(block)}</blockquote>`);
    else if (type === "table") {
      const rows = (block.children || []).filter((row) => row.type === "table_row");
      const html = rows.map((row, rowIndex) => {
        const cells = (row.table_row?.cells || []).map((cell, columnIndex) => {
          const headerRow = rowIndex === 0 && block.table?.has_column_header;
          const headerColumn = columnIndex === 0 && block.table?.has_row_header;
          const tag = headerRow || headerColumn ? "th" : "td";
          const scope = headerRow ? ' scope="col"' : headerColumn ? ' scope="row"' : "";
          const text = blockText({ type: "paragraph", paragraph: { rich_text: cell } });
          return `<${tag}${scope}>${text}</${tag}>`;
        }).join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      if (html) output.push(`<div class="blog-table-scroll" tabindex="0" role="region" aria-label="가로로 스크롤할 수 있는 비교표"><table>${html}</table></div>`);
    }
    else if (type === "image") {
      const image = block.image?.file?.url || block.image?.external?.url;
      const caption = (block.image?.caption || []).map((item) => item.plain_text).join("");
      const safeImage = safeExternalUrl(image);
      if (safeImage) output.push(`<figure><img src="${escapeHtml(safeImage)}" alt="${escapeHtml(caption || "블로그 본문 이미지")}" loading="lazy" />${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`);
    }
  }
  if (listType) output.push(`</${listType}>`);
  return output.join("\n");
}

function renderTableOfContents(blocks) {
  const headings = blocks
    .filter((block) => block.type === "heading_2")
    .map((block) => ({
      id: `section-${block.id}`,
      text: (block.heading_2?.rich_text || []).map((item) => item.plain_text || "").join("").trim(),
    }))
    .filter((heading) => heading.text);
  if (headings.length < 2) return "";
  return `<nav class="blog-toc" aria-label="이 글의 목차"><strong>목차</strong><ol>${headings.map((heading) => `<li><a href="#${escapeHtml(heading.id)}">${escapeHtml(heading.text)}</a></li>`).join("")}</ol></nav>`;
}

function formatDate(date) {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return escapeHtml(date);
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Asia/Seoul" }).format(parsed);
}

function layout({ title, description, canonical, image, body, schemas = [], type = "website", keywords = [] }) {
  const ogImage = absoluteUrl(image) || `${SITE_URL}/og-image.png`;
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8" /><meta name="naver-site-verification" content="2c7ee16c39e1aef5cabb4e7532b2b9642809f782" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}" />${keywords.length ? `<meta name="keywords" content="${escapeHtml(keywords.join(", "))}" />` : ""}<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:type" content="${escapeHtml(type)}" /><meta property="og:title" content="${escapeHtml(title)}" /><meta property="og:description" content="${escapeHtml(description)}" /><meta property="og:url" content="${escapeHtml(canonical)}" /><meta property="og:image" content="${escapeHtml(ogImage)}" />
<meta name="twitter:card" content="summary_large_image" /><link rel="icon" href="/assets/favicon.svg" /><link rel="stylesheet" href="/style.css?v=34" /><link rel="stylesheet" href="/blog.css?v=4" />
${schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`).join("")}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-E79QT0R9Z3"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-E79QT0R9Z3');</script></head>
<body class="blog-page"><header class="site-header"><div class="container header-inner"><a href="/" class="brand"><img src="/assets/logo-mark.png" class="brand-logo" alt="거상마케팅센터 로고" /><span class="brand-text"><span class="brand-name">거상마케팅센터</span><span class="brand-sub">SMARTPLACE · AEO · GEO</span></span></a><nav class="nav" aria-label="주요 메뉴"><a href="/about">센터 소개</a><div class="nav-dropdown"><a href="/services" class="nav-ddtrigger">서비스 <span class="nav-arrow">▾</span></a><div class="nav-dd-menu"><a href="/services" class="nav-dd-all">전체 서비스</a><div class="nav-dd-sep"></div><a href="/services/smartplace">네이버 스마트플레이스</a><a href="/services/google-business-profile">구글 비즈니스 프로필</a><a href="/services/aeo-geo">AEO·GEO 최적화</a><a href="/services/ads">광고 운영</a><a href="/services/content-sns">콘텐츠·SNS 운영</a><a href="/services/government-support">정부지원사업 마케팅</a><a href="/services/website-production">AI 홈페이지 제작</a><a href="/services/consulting">마케팅 컨설팅</a></div></div><a href="/marketing-diagnosis">업종별 진단</a><a href="/enterprise">기업·다점포</a><a href="/cases">성공사례</a><a href="/blog" class="active">블로그</a><a href="/support">고객지원</a><a href="/contact" class="btn-nav">상담문의</a></nav><button class="nav-toggle" id="navToggle" aria-label="메뉴 열기"><span></span><span></span><span></span></button></div><nav class="nav-mobile" id="navMobile"><a href="/about">센터 소개</a><div class="nav-mob-group"><button class="nav-mob-trigger" id="navMobSvc">서비스 <span class="nav-mob-arrow">▾</span></button><div class="nav-mob-sub" id="navMobSvcSub"><a href="/services">전체 서비스</a><a href="/services/smartplace">스마트플레이스</a><a href="/services/google-business-profile">구글 프로필</a><a href="/services/aeo-geo">AEO·GEO</a><a href="/services/ads">광고 운영</a><a href="/services/content-sns">콘텐츠·SNS</a><a href="/services/government-support">정부지원사업</a><a href="/services/website-production">AI 홈페이지 제작</a><a href="/services/consulting">컨설팅</a></div></div><a href="/marketing-diagnosis">업종별 진단</a><a href="/enterprise">기업·다점포</a><a href="/cases">성공사례</a><a href="/blog">블로그</a><a href="/support">고객지원</a><a href="/contact" class="btn-nav">상담문의</a></nav></header>${body}<footer class="site-footer"><div class="container footer-copy">© 2026 거상마케팅센터. All rights reserved. · <a href="/services/website-production">AI 홈페이지 제작</a> · <a href="/blog">블로그</a> · <a href="/contact">상담문의</a></div></footer><script src="/script.js?v=31"></script></body></html>`;
}

function card(post) {
  const image = post.image ? `<img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" loading="lazy" />` : `<div class="blog-card-placeholder" aria-hidden="true"><span>GEOSANG</span><b>MARKETING INSIGHT</b></div>`;
  return `<article class="blog-card" data-category="${escapeHtml(post.category)}" data-search="${escapeHtml(`${post.title} ${post.question} ${post.excerpt} ${post.keywords.join(" ")}`.toLowerCase())}"><a href="/blog/${encodeURIComponent(post.slug)}" class="blog-card-link">${image}<div class="blog-card-body"><span class="blog-category">${escapeHtml(post.category)}</span><h2>${escapeHtml(post.title)}</h2>${post.question ? `<strong class="blog-question">${escapeHtml(post.question)}</strong>` : ""}<p>${escapeHtml(post.excerpt)}</p><div class="blog-keywords">${post.keywords.slice(0, 4).map((keyword) => `<i>#${escapeHtml(keyword)}</i>`).join("")}</div><footer><time datetime="${escapeHtml(post.publishedAt)}">${formatDate(post.publishedAt)}</time><b>자세히 보기 →</b></footer></div></a></article>`;
}

function listPage(posts, notice = "") {
  const empty = `<div class="blog-empty"><span>CONTENT UPDATE</span><h2>마케팅 인사이트를 준비하고 있습니다</h2><p>거상마케팅센터의 스마트플레이스, AEO·GEO, 블로그 마케팅 인사이트가 곧 업데이트됩니다.</p><a href="/contact" class="btn-primary">상담 문의하기</a></div>`;
  const body = `<main><section class="blog-hero"><div class="container"><span>GEOSANG MARKETING BLOG</span><h1>마케팅 블로그</h1><p>스마트플레이스, AEO·GEO, 블로그 마케팅, 체험단 마케팅까지.<br />거상마케팅센터가 현장에서 쌓은 마케팅 인사이트를 정리합니다.</p></div></section><div class="blog-breadcrumb"><div class="container"><a href="/">홈</a><span>›</span><b>마케팅 블로그</b></div></div>
${notice ? `<div class="container blog-notice" role="status">${escapeHtml(notice)}</div>` : ""}
<section class="blog-section blog-list-section"><div class="container"><div class="blog-section-head"><span>LATEST INSIGHTS</span><h2>최신 글</h2><p>관심 있는 주제를 선택하거나 검색해 보세요.</p></div><div class="blog-tools"><div class="blog-filters" role="group" aria-label="카테고리 필터"><button type="button" class="is-active" data-filter="전체">전체</button>${CATEGORIES.map((category) => `<button type="button" data-filter="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join("")}</div><label class="blog-search"><span class="sr-only">블로그 검색</span><input type="search" id="blogSearch" placeholder="제목·질문·키워드 검색" /></label></div>${posts.length ? `<div class="blog-grid" id="blogGrid">${posts.map(card).join("")}</div><div class="blog-no-results" id="blogNoResults" hidden>검색 조건에 맞는 글이 없습니다.</div>` : empty}</div></section>
<section class="blog-cta"><div class="container"><div><span>FREE MARKETING DIAGNOSIS</span><h2>우리 사업에 맞는 마케팅 우선순위가 궁금하신가요?</h2><p>현재 온라인 노출과 콘텐츠 구조를 확인하고 먼저 해야 할 일을 정리해드립니다.</p></div><div><a href="/contact?type=consulting&source=blog-footer" class="btn-primary">무료 진단 신청하기</a><a href="https://pf.kakao.com/_hxlxaQG/chat" class="btn-kakao" target="_blank" rel="noopener noreferrer">카카오톡 상담하기</a></div></div></section></main><script src="/blog-client.js?v=1"></script>`;
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: "마케팅 블로그", item: `${SITE_URL}/blog` }] };
  const collection = { "@context": "https://schema.org", "@type": "CollectionPage", name: "거상마케팅센터 마케팅 블로그", url: `${SITE_URL}/blog`, mainEntity: { "@type": "ItemList", itemListElement: posts.map((post, index) => ({ "@type": "ListItem", position: index + 1, url: `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`, name: post.title })) } };
  return layout({ title: "마케팅 블로그 | 거상마케팅센터", description: "스마트플레이스, AEO·GEO, AI 검색 최적화, 블로그 마케팅, 체험단 마케팅, 식당 마케팅 인사이트를 전하는 거상마케팅센터 공식 블로그입니다.", canonical: `${SITE_URL}/blog`, body, schemas: [collection, breadcrumb] });
}


const READING_STEPS = [
  { eyebrow: "STEP 01", label: "기준 이해" },
  { eyebrow: "STEP 02", label: "문제 점검" },
  { eyebrow: "STEP 03", label: "실행 방법" },
  { eyebrow: "STEP 04", label: "확장·성과" },
];

function readingStage(post) {
  const text = `${post.title} ${post.question} ${post.excerpt}`;
  if (/체크리스트|점검|문제|안 뜨|못하는|늘지 않|없는 이유|미노출/.test(text)) return 1;
  if (/방법|작성법|관리|연결|구조|만드는|해야 할|실행|운영/.test(text)) return 2;
  if (/AI 검색|AEO|GEO|인용|성과|사례|Entity|추천/.test(text)) return 3;
  return 0;
}

function relatedPostsFor(post, posts) {
  const keywords = new Set(post.keywords || []);
  const services = new Set(post.services || []);
  return posts
    .filter((item) => item.slug !== post.slug)
    .map((item) => {
      const keywordOverlap = (item.keywords || []).filter((keyword) => keywords.has(keyword)).length;
      const serviceOverlap = (item.services || []).filter((service) => services.has(service)).length;
      const score =
        (item.category === post.category ? 100 : 0) +
        keywordOverlap * 16 +
        serviceOverlap * 9 +
        (item.image ? 2 : 0);
      return { item, score, stage: readingStage(item) };
    })
    .sort((a, b) => b.score - a.score || b.item.publishedAt.localeCompare(a.item.publishedAt))
    .slice(0, 4)
    .sort((a, b) => a.stage - b.stage || b.score - a.score)
    .map(({ item }) => item);
}

function relatedReading(post, posts) {
  const related = relatedPostsFor(post, posts);
  if (!related.length) return "";
  const items = related.map((item, index) => {
    const step = READING_STEPS[index] || READING_STEPS[READING_STEPS.length - 1];
    const image = item.image
      ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" loading="lazy" />`
      : `<div class="blog-related-placeholder" aria-hidden="true"><span>GEOSANG</span></div>`;
    return `<li><a href="/blog/${encodeURIComponent(item.slug)}">${image}<div><small>${step.eyebrow} · ${step.label}</small><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.excerpt || item.question)}</p><span>이어서 읽기 →</span></div></a></li>`;
  }).join("");
  return `<section class="blog-related-section" aria-labelledby="related-reading-title"><div class="container"><header><span>RECOMMENDED READING PATH</span><h2 id="related-reading-title">함께 읽을 글</h2><p>이 주제는 아래 순서로 읽으면 이해와 실행이 빨라집니다.</p></header><ol class="blog-reading-path">${items}</ol></div></section>`;
}

function detailPage(post, blocks, allPosts) {
  const canonical = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
  const description = post.seoDescription || post.excerpt;
  const schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description, datePublished: post.publishedAt, dateModified: post.modifiedAt || post.publishedAt, author: { "@type": "Organization", name: "거상마케팅센터" }, publisher: { "@type": "Organization", name: "거상마케팅센터", logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/logo-mark.png` } }, image: absoluteUrl(post.image) || `${SITE_URL}/og-image.png`, mainEntityOfPage: canonical };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: "마케팅 블로그", item: `${SITE_URL}/blog` }, { "@type": "ListItem", position: 3, name: post.title, item: canonical }] };
  const serviceLinks = post.services.map((service) => `<a href="${escapeHtml(SERVICE_LINKS[service] || "/services")}">${escapeHtml(service)} →</a>`).join("");
  const relatedSection = relatedReading(post, allPosts);
  const body = `<main><div class="blog-breadcrumb"><div class="container"><a href="/">홈</a><span>›</span><a href="/blog">마케팅 블로그</a><span>›</span><b>${escapeHtml(post.title)}</b></div></div><article><header class="blog-post-head"><div class="container"><span class="blog-category">${escapeHtml(post.category)}</span><h1>${escapeHtml(post.title)}</h1>${post.question ? `<p class="blog-post-question"><small>핵심 질문</small>${escapeHtml(post.question)}</p>` : ""}<div class="blog-post-meta"><time datetime="${escapeHtml(post.publishedAt)}">${formatDate(post.publishedAt)}</time>${post.keywords.map((keyword) => `<i>#${escapeHtml(keyword)}</i>`).join("")}</div></div></header>${post.image ? `<div class="container"><img class="blog-post-cover" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" /></div>` : ""}<div class="container blog-post-layout"><aside class="blog-toc-column">${renderTableOfContents(blocks)}</aside><div class="blog-article-main"><section class="blog-answer"><small>한 문장 결론</small><strong>${escapeHtml(post.excerpt || post.question)}</strong></section><section class="blog-content">${renderBlocks(blocks, post.slug) || `<p>본문을 준비하고 있습니다.</p>`}</section><aside class="blog-service-cta"><small>RELATED SERVICE</small><h2>${escapeHtml(post.ctaLabel)}</h2><p>${escapeHtml(post.excerpt)}</p><div>${serviceLinks}</div><a href="${escapeHtml(post.ctaLink)}" class="btn-primary">${escapeHtml(post.ctaLabel)}</a></aside></div></div></article>${relatedSection}<div class="blog-back"><a href="/blog">← 블로그 목록 보기</a></div></main>`;
  return layout({ title: post.seoTitle || `${post.title} | 거상마케팅센터`, description, canonical, image: post.image, body, schemas: [schema, breadcrumb], type: "article", keywords: post.keywords });
}

function notFoundPage() {
  return layout({ title: "블로그 글을 찾을 수 없습니다 | 거상마케팅센터", description: "요청한 블로그 글을 찾을 수 없습니다.", canonical: `${SITE_URL}/blog`, body: `<main><section class="blog-section"><div class="container">${`<div class="blog-empty"><h1>글을 찾을 수 없습니다</h1><p>주소를 확인하거나 블로그 목록에서 다른 글을 살펴보세요.</p><a href="/blog" class="btn-primary">블로그 목록 보기</a></div>`}</div></section></main>` });
}

function rss(posts) {
  const items = posts.map((post) => `<item><title>${escapeHtml(post.title)}</title><link>${SITE_URL}/blog/${encodeURIComponent(post.slug)}</link><description>${escapeHtml(post.excerpt)}</description><category>${escapeHtml(post.category)}</category><pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate><guid isPermaLink="true">${SITE_URL}/blog/${encodeURIComponent(post.slug)}</guid></item>`).join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>거상마케팅센터 마케팅 블로그</title><link>${SITE_URL}/blog</link><description>스마트플레이스, AEO·GEO와 업종별 마케팅 인사이트</description><language>ko-KR</language><atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />${items}</channel></rss>`;
}

module.exports = async function handler(req, res) {
  const mode = String(req.query.mode || "list");
  const slug = String(req.query.slug || "").trim();
  res.setHeader("Cache-Control", `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=600`);
  try {
    const posts = await fetchPosts();
    if (mode === "rss") {
      res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
      return res.status(200).send(rss(posts));
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (mode === "detail") {
      const post = posts.find((item) => item.slug === slug);
      if (!post) return res.status(404).send(notFoundPage());
      const blocks = await fetchBlocks(post.id);
      return res.status(200).send(detailPage(post, blocks, posts));
    }
    return res.status(200).send(listPage(posts));
  } catch (error) {
    console.error("[notion-blog]", error.message);
    if (mode === "rss") {
      res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
      return res.status(200).send(rss([]));
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    if (mode === "detail") return res.status(404).send(notFoundPage());
    return res.status(200).send(listPage([]));
  }
};
