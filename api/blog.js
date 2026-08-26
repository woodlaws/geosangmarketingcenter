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
  "홈페이지 진단": "/services/website-diagnosis",
  "AEO·GEO 컨설팅": "/services/aeo-geo",
};

const INLINE_BLOG_IMAGES = {
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
    "why-homepage-is-center-of-ai-search-marketing": "/images/blog/ai-search-homepage-center.png",
    "why-local-business-needs-homepage-ai-search": "/images/blog/ai-search-local-business-homepage.webp",
    "how-to-write-website-content-cited-by-ai-search": "/images/blog/ai-search-cited-content/cover.webp",
    "aeo-geo-website-diagnostic-checklist-20": "/images/blog/aeo-geo-checklist-20/cover.webp",
    "why-website-not-showing-in-search-7-reasons": "/images/blog/website-search-7-reasons.svg",
    "restaurant-signature-menu-marketing": "/images/blog/restaurant-signature-menu-marketing/cover-v2.webp",
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
      output.push(`<h2>${blockText(block)}</h2>`);
      const matchingImages = inlineImages.filter((item) => item.afterHeading === headingText);
      for (const inlineImage of matchingImages) {
        const layout = inlineImageLayout(inlineImage.src);
        output.push(`<figure class="blog-inline-figure ${layout.className}"><img src="${escapeHtml(inlineImage.src)}" alt="${escapeHtml(inlineImage.alt)}" loading="lazy" width="${layout.width}" height="${layout.height}" /><figcaption>${escapeHtml(inlineImage.caption)}</figcaption></figure>`);
      }
    }
    else if (type === "heading_3") output.push(`<h3>${blockText(block)}</h3>`);
    else if (type === "quote") output.push(`<blockquote>${blockText(block)}</blockquote>`);
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
<meta name="twitter:card" content="summary_large_image" /><link rel="icon" href="/assets/favicon.svg" /><link rel="stylesheet" href="/style.css?v=34" /><link rel="stylesheet" href="/blog.css?v=1" />
${schemas.map((schema) => `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`).join("")}
<script async src="https://www.googletagmanager.com/gtag/js?id=G-E79QT0R9Z3"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-E79QT0R9Z3');</script></head>
<body class="blog-page"><header class="site-header"><div class="container header-inner"><a href="/" class="brand"><img src="/assets/logo-mark.png" class="brand-logo" alt="거상마케팅센터 로고" /><span class="brand-text"><span class="brand-name">거상마케팅센터</span><span class="brand-sub">SMARTPLACE · AEO · GEO</span></span></a><nav class="nav" aria-label="주요 메뉴"><a href="/about">센터 소개</a><a href="/services">서비스</a><a href="/marketing-diagnosis">업종별 진단</a><a href="/enterprise">기업·다점포</a><a href="/cases">성공사례</a><a href="/blog" class="active">블로그</a><a href="/contact" class="btn-nav">상담문의</a></nav><button class="nav-toggle" id="navToggle" aria-label="메뉴 열기"><span></span><span></span><span></span></button></div><nav class="nav-mobile" id="navMobile"><a href="/about">센터 소개</a><a href="/services">서비스</a><a href="/marketing-diagnosis">업종별 진단</a><a href="/enterprise">기업·다점포</a><a href="/cases">성공사례</a><a href="/blog">마케팅 블로그</a><a href="/contact" class="btn-nav">상담문의</a></nav></header>${body}<footer class="site-footer"><div class="container footer-copy">© 2026 거상마케팅센터. All rights reserved. · <a href="/blog">마케팅 블로그</a> · <a href="/contact">상담문의</a></div></footer><script src="/script.js?v=31"></script></body></html>`;
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

function detailPage(post, blocks) {
  const canonical = `${SITE_URL}/blog/${encodeURIComponent(post.slug)}`;
  const description = post.seoDescription || post.excerpt;
  const schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description, datePublished: post.publishedAt, dateModified: post.modifiedAt || post.publishedAt, author: { "@type": "Organization", name: "거상마케팅센터" }, publisher: { "@type": "Organization", name: "거상마케팅센터", logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/logo-mark.png` } }, image: absoluteUrl(post.image) || `${SITE_URL}/og-image.png`, mainEntityOfPage: canonical };
  const breadcrumb = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "홈", item: `${SITE_URL}/` }, { "@type": "ListItem", position: 2, name: "마케팅 블로그", item: `${SITE_URL}/blog` }, { "@type": "ListItem", position: 3, name: post.title, item: canonical }] };
  const serviceLinks = post.services.map((service) => `<a href="${escapeHtml(SERVICE_LINKS[service] || "/services")}">${escapeHtml(service)} →</a>`).join("");
  const body = `<main><div class="blog-breadcrumb"><div class="container"><a href="/">홈</a><span>›</span><a href="/blog">마케팅 블로그</a><span>›</span><b>${escapeHtml(post.title)}</b></div></div><article><header class="blog-post-head"><div class="container"><span class="blog-category">${escapeHtml(post.category)}</span><h1>${escapeHtml(post.title)}</h1>${post.question ? `<p class="blog-post-question"><small>핵심 질문</small>${escapeHtml(post.question)}</p>` : ""}<div class="blog-post-meta"><time datetime="${escapeHtml(post.publishedAt)}">${formatDate(post.publishedAt)}</time>${post.keywords.map((keyword) => `<i>#${escapeHtml(keyword)}</i>`).join("")}</div></div></header>${post.image ? `<div class="container"><img class="blog-post-cover" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.title)}" /></div>` : ""}<div class="container blog-post-layout"><div><section class="blog-answer"><small>한 문장 결론</small><strong>${escapeHtml(post.excerpt || post.question)}</strong></section><section class="blog-content">${renderBlocks(blocks, post.slug) || `<p>본문을 준비하고 있습니다.</p>`}</section></div><aside class="blog-service-cta"><small>RELATED SERVICE</small><h2>${escapeHtml(post.ctaLabel)}</h2><p>${escapeHtml(post.excerpt)}</p><div>${serviceLinks}</div><a href="${escapeHtml(post.ctaLink)}" class="btn-primary">${escapeHtml(post.ctaLabel)}</a></aside></div></article><div class="blog-back"><a href="/blog">← 블로그 목록 보기</a></div></main>`;
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
      return res.status(200).send(detailPage(post, blocks));
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
