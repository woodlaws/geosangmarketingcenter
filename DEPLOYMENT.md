# GitHub · Vercel 배포 안내

## GitHub

ZIP 압축을 해제한 뒤 전체 파일을 GitHub 저장소 루트에 업로드합니다. `.env` 파일과 실제 Apps Script URL은 저장소에 올리지 않습니다.

## Vercel

1. GitHub 저장소를 Vercel 프로젝트로 가져옵니다.
2. Framework Preset은 `Other`, Root Directory는 `./`로 둡니다.
3. Install Command, Build Command, Output Directory는 비워 둡니다.
4. 환경변수 메뉴를 사용할 수 있다면 아래 값을 등록할 수 있습니다.

   - Name: `NEXT_PUBLIC_GOOGLE_SCRIPT_URL`
   - Value: 실제 Google Apps Script Web App `/exec` URL
   - Environments: Production, Preview, Development

5. 환경변수를 등록하지 않아도 `api/contact-config.js`에 설정된 Apps Script Web App URL을 fallback으로 사용합니다.

브라우저는 실제 Apps Script URL을 읽지 않습니다. `/contact`는 같은 도메인의 `/api/contact`로 제출하고, Vercel 서버리스 함수는 환경변수를 우선 사용한 뒤 없으면 설정 파일의 fallback URL로 Apps Script에 전달합니다.

## 확인

- `/contact`
- `/contact?type=enterprise&source=entity-header`
- `/contact?type=smartplace`
- `/contact?type=government-support`

Apps Script POST가 `sheet is not defined`를 반환한다면 `google-apps-script/Code.gs`를 적용하고 Apps Script를 새 버전으로 다시 배포해야 합니다.
