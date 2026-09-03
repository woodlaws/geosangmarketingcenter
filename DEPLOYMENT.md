# GitHub · Vercel 배포 안내

## GitHub

ZIP 압축을 해제한 뒤 전체 파일을 GitHub 저장소 루트에 업로드합니다. `.env` 파일과 실제 Apps Script URL은 저장소에 올리지 않습니다.

## Vercel

1. GitHub 저장소를 Vercel 프로젝트로 가져옵니다.
2. Framework Preset은 `Other`, Root Directory는 `./`로 둡니다.
3. Install Command, Build Command, Output Directory는 비워 둡니다.
4. `contact-form-config.js`의 Google Apps Script Web App URL을 확인합니다.
5. Notion 포트폴리오용 `NOTION_TOKEN`, `NOTION_PORTFOLIO_DATA_SOURCE_ID`와 블로그용 `NOTION_BLOG_DATABASE_ID`를 Vercel 환경변수로 등록합니다.
6. 별도 빌드 없이 배포합니다.

`/contact`는 설정 파일의 Apps Script Web App URL로 `no-cors` POST 전송합니다. 브라우저는 opaque 응답을 읽지 않으며 fetch가 reject되지 않으면 접수 완료 화면을 표시합니다.

## 확인

- `/contact`
- `/contact?type=enterprise&source=entity-header`
- `/contact?type=smartplace`
- `/contact?type=government-support`
- `/services/website-production#portfolio`

Apps Script POST가 `sheet is not defined`를 반환한다면 `google-apps-script/Code.gs`를 적용하고 Apps Script를 새 버전으로 다시 배포해야 합니다.
