# 거상마케팅센터 홈페이지

## 프로젝트 소개
거상마케팅센터 다페이지 홈페이지입니다.  
스마트플레이스 상위노출, AEO·GEO 최적화, 광고상품, 정부지원사업·희망리턴패키지, 마케팅 컨설팅, 홈페이지·랜딩페이지 진단 및 제작 연계 서비스를 소개합니다.

**프로젝트 유형:** 정적 HTML (빌드 불필요)

## 대표 도메인
https://geosangmarketing.com/

## 페이지 구조

| URL | 파일 |
|-----|------|
| `/` | `index.html` |
| `/about` | `about.html` |
| `/services` | `services/index.html` |
| `/services/smartplace` | `services/smartplace.html` |
| `/services/aeo-geo` | `services/aeo-geo.html` |
| `/services/ads` | `services/ads.html` |
| `/services/government-support` | `services/government-support.html` |
| `/services/marketing-consulting` | `services/marketing-consulting.html` |
| `/services/website-consulting` | `services/website-consulting.html` |
| `/cases` | `cases.html` |
| `/insights` | `insights.html` |
| `/contact` | `contact.html` |

## 배포 방법

### GitHub 업로드
1. 이 폴더 전체를 GitHub 저장소에 업로드
2. Commit message 예시: `Initial upload: Geosang Marketing Center website`

### Vercel 설정 (정적 HTML)
- **Framework Preset:** Other
- **Root Directory:** `./`
- **Install Command:** 비워두기
- **Build Command:** 비워두기
- **Output Directory:** 비워두기 (기본값)

`vercel.json`에 `cleanUrls: true`가 설정되어 있어 `.html` 없는 클린 URL이 자동 적용됩니다.  
새로고침 시 404 없음.

## 배포 후 확인할 URL
```
https://geosangmarketing.com/
https://geosangmarketing.com/about
https://geosangmarketing.com/services
https://geosangmarketing.com/services/smartplace
https://geosangmarketing.com/services/aeo-geo
https://geosangmarketing.com/services/ads
https://geosangmarketing.com/services/government-support
https://geosangmarketing.com/services/marketing-consulting
https://geosangmarketing.com/services/website-consulting
https://geosangmarketing.com/cases
https://geosangmarketing.com/insights
https://geosangmarketing.com/contact
https://geosangmarketing.com/og-image.png
https://geosangmarketing.com/robots.txt
https://geosangmarketing.com/sitemap.xml
https://geosangmarketing.com/llms.txt
```

## 배포 후 카카오톡 OG 캐시 초기화
카카오 공유 디버거에서 아래 URL을 캐시 초기화:
- https://developers.kakao.com/tool/clear/og
- 입력 URL: `https://geosangmarketing.com`

## 추후 입력/수정이 필요한 정보

| 항목 | 현재 상태 | 위치 |
|------|-----------|------|
| 이메일 주소 | 입력 예정 | `contact.html` |
| 카카오톡 채널 링크 | @거상마케팅센터 (URL 미연결) | 전 페이지 footer + contact.html |
| 상담 폼 백엔드 | 미연결 (Web3Forms 권장) | `contact.html` `#contactForm` |
| 실제 성공사례 수치 | placeholder | `cases.html` |
| 실제 고객 후기 | placeholder | `cases.html` |

### Web3Forms 연결 방법
1. https://web3forms.com 에서 API 키 발급
2. `contact.html`의 `<form id="contactForm">` 태그에 추가:
   ```html
   <input type="hidden" name="access_key" value="YOUR_API_KEY" />
   ```
3. `form` 태그의 `action` 속성 제거 (Web3Forms는 JS로 처리)
4. script.js의 `contactForm` submit 핸들러에서 실제 fetch 전송 추가

## 파일 구조
```
/
├── index.html
├── about.html
├── cases.html
├── contact.html
├── insights.html
├── style.css
├── script.js
├── robots.txt
├── sitemap.xml
├── llms.txt
├── vercel.json
├── og-image.png
├── assets/
│   ├── logo-mark.png
│   └── ceo-photo.jpg
└── services/
    ├── index.html
    ├── smartplace.html
    ├── aeo-geo.html
    ├── ads.html
    ├── government-support.html
    ├── marketing-consulting.html
    └── website-consulting.html
```

## 기술 스택
- 순수 정적 HTML / CSS / Vanilla JS
- 폰트: Pretendard (CDN)
- 배포: Vercel (정적 호스팅)
- 빌드 도구: 없음 (빌드 불필요)
