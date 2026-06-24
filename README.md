# 거상마케팅센터 랜딩페이지

네이버 **스마트플레이스 상위노출**부터 **AEO(답변 엔진 최적화)·GEO(생성형 엔진 최적화)** 까지,
동네 가게를 *AI가 추천하는 단 한 곳* 으로 만드는 마케팅 대행사 **거상마케팅센터**의 정적 랜딩페이지입니다.

- 빌드 도구·프레임워크 없는 **순수 정적 HTML/CSS/JS** 사이트
- GitHub에 그대로 올리면 **Vercel에서 바로 배포** 가능
- 반응형 지원 (데스크톱 / 태블릿 / 모바일)

---

## 📁 파일 구조

```
.
├── index.html        # 페이지 본문 (최상위) · 구조화 데이터(JSON-LD) 포함
├── style.css         # 전체 스타일
├── script.js         # FAQ 아코디언 · 상담 폼 · 모바일 메뉴 · 통계 카운트업
├── assets/           # 이미지 · 아이콘
│   └── logo-mark.png # 로고 (방패 G 마크 · 헤더/푸터/파비콘 공용)
├── robots.txt        # 검색·AI 크롤러 수집 규칙 (AEO/GEO)
├── sitemap.xml       # 사이트맵
├── vercel.json       # Vercel 정적 배포 설정
├── README.md         # 프로젝트 설명 (이 파일)
└── .gitignore
```

`index.html` 은 반드시 **최상위 폴더**에 있어야 하며, 이미지·아이콘은 모두 `assets/` 폴더에 둡니다.

---

## 🔎 AEO / GEO 최적화 (구조화 데이터)

네이버·구글 **AI 브리핑**, **ChatGPT**, **Gemini** 등이 우리 정보를 "사실"로
인식하고 인용할 수 있도록 기계가 읽는 데이터를 심어두었습니다.

- `index.html` `<head>` 안 **JSON-LD**: 업체 정보(ProfessionalService) · 서비스 · **FAQPage**
- `robots.txt`: GPTBot · PerplexityBot · Google-Extended 등 AI 크롤러 수집 허용
- `sitemap.xml`: 페이지 수집 안내
- canonical · Open Graph · Twitter 카드 메타태그

**배포 후 검증:** 구글 [리치 결과 테스트](https://search.google.com/test/rich-results)에
배포 주소를 넣으면 FAQ·업체 정보가 인식되는지 확인할 수 있습니다.

> ⚠️ JSON-LD·robots.txt·sitemap.xml·메타태그 안의 `https://geosang-marketing.com`
> 을 **실제 도메인 주소**로 모두 교체하세요. (전화번호·주소도 실제 정보로)

---

## 🖥️ 로컬에서 미리 보기

별도 빌드가 필요 없습니다. `index.html` 을 브라우저로 열면 됩니다.
간단한 로컬 서버로 보려면:

```bash
# Python 3
python -m http.server 8000
# 또는 Node
npx serve .
```

브라우저에서 `http://localhost:8000` 접속.

---

## 🚀 Vercel 배포 방법

### 1) GitHub에 업로드
```bash
git init
git add .
git commit -m "거상마케팅센터 랜딩페이지"
git branch -M main
git remote add origin https://github.com/<사용자명>/<저장소명>.git
git push -u origin main
```

### 2) Vercel에서 연결
1. [vercel.com](https://vercel.com) 로그인 → **Add New… → Project**
2. 방금 올린 GitHub 저장소를 **Import**
3. Framework Preset: **Other** (정적 사이트라 자동 감지됨)
4. Build/Output 설정은 비워둬도 됩니다 → **Deploy** 클릭

배포가 끝나면 `https://<프로젝트명>.vercel.app` 주소가 생성됩니다.
이후 GitHub `main` 브랜치에 push할 때마다 자동으로 재배포됩니다.

---

## ✏️ 수정 가이드

| 항목 | 위치 |
|------|------|
| 문구·섹션 내용 | `index.html` |
| 색상·여백·폰트 | `style.css` 상단 `:root` 변수 |
| 연락처 / 사업자번호 / 주소 | `index.html` 의 **상담 섹션 · 푸터** |
| 요금제 금액 | `index.html` 의 `#price` 섹션 |
| 상담 폼 전송 처리 | `script.js` 의 `leadForm submit` 핸들러 |

> ⚠️ 현재 **전화번호(1551-0000)·주소·사업자등록번호·요금**은 임시값입니다. 배포 전 실제 정보로 교체하세요.
> 상담 폼은 화면 안내만 표시되며 실제 데이터는 전송되지 않습니다. 운영 시 Google Forms·Formspree·이메일 API 등을 연결하세요.

---

## 🎨 디자인

- **컬러:** 로열블루 `#1a56db` + 네이비 `#0b1f4d`, 포인트 틸 `#2dd4bf`
- **폰트:** Pretendard (CDN)
- **컨셉:** 신뢰감 있는 기업형 / 소상공인 타깃

© 2026 거상마케팅센터. All rights reserved.
