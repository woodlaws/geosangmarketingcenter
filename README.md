# 거상마케팅센터 홈페이지

거상마케팅센터의 정적 HTML 홈페이지입니다. 네이버·구글 검색 관리, AEO·GEO, 콘텐츠·광고, 업종별 진단과 기업·다점포 서비스를 안내합니다.

## 배포

- 배포 플랫폼: Vercel
- Framework Preset: Other
- Root Directory: `./`
- Install Command: 비움
- Build Command: 비움
- Output Directory: 비움
- `vercel.json`의 `cleanUrls`로 `.html` 없는 주소를 사용합니다.

## 핵심 경로

| 구분 | URL |
|---|---|
| 홈 | `/` |
| 센터 소개 | `/about` |
| 서비스 | `/services` |
| 업종별 진단 | `/marketing-diagnosis` |
| 기업·다점포 | `/enterprise` |
| 성공사례 | `/cases` |
| 인사이트 | `/insights` |
| 상담문의 | `/contact` |

### 서비스

- `/services/smartplace`
- `/services/google-business-profile`
- `/services/aeo-geo`
- `/services/ads`
- `/services/content-sns`
- `/services/government-support`
- `/services/website-diagnosis`
- `/services/consulting`

### 업종별 진단

- `/marketing-types/local-store`
- `/marketing-types/online-sales`
- `/marketing-types/consulting-contract`

### 성공사례

- `/cases/gayeon`
- `/cases/oldgiwa`
- `/cases/dodam`

## 이전 주소 호환

Vercel 영구 리디렉션으로 아래 이전 주소를 새 주소에 연결합니다.

- `/services/marketing-consulting` → `/services/consulting`
- `/services/website-consulting` → `/services/website-diagnosis`
- `/marketing-types/consulting` → `/marketing-types/consulting-contract`
- `/cases/yetgiwa` → `/cases/oldgiwa`

## 상담 폼

`/contact?type=enterprise&source=entity-header`처럼 접근하면 문의 유형과 유입 경로가 자동 반영됩니다. 폼은 `/api/contact`로 제출되며 Vercel 서버리스 함수가 `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` 환경변수의 Apps Script Web App으로 전달합니다. 실제 URL은 코드나 GitHub 저장소에 넣지 않습니다.

## 검색 파일

- `sitemap.xml`
- `robots.txt`
- `llms.txt`

검색 노출과 AI 답변 결과는 환경에 따라 달라질 수 있으며 특정 순위나 성과를 보장하지 않습니다.
