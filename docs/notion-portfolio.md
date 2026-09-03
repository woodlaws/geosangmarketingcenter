# Notion 홈페이지 포트폴리오 연동

`/services/website-production#portfolio`는 브라우저가 Vercel Function `/api/portfolio`를 호출해 받은 JSON으로 카드를 생성합니다. API 응답은 Vercel CDN에서 30분 동안 캐시되며, 갱신 중에는 기존 응답을 최대 1시간 더 제공할 수 있습니다.

이 프로젝트에는 `@notionhq/client`가 설치되어 있지 않습니다. 기존 Notion 블로그와 같은 공식 REST API를 사용하며, 현재 API 버전 `2026-03-11`의 `POST /v1/data_sources/{data_source_id}/query` 엔드포인트로 조회합니다. 비공식 스크래핑은 사용하지 않습니다.

## 1. Notion Integration 연결

1. Notion의 **Settings → Connections**에서 Internal Integration을 만들고 읽기 권한을 부여합니다.
2. 포트폴리오 데이터베이스 우측 상단 `•••` 메뉴에서 **Connections** 또는 **Add connections**를 선택합니다.
3. 위에서 만든 Integration을 추가해 데이터베이스를 공유합니다. 공유하지 않으면 API가 404를 반환합니다.
4. Integration Secret은 Vercel 환경변수에만 저장하고 저장소나 브라우저 코드에는 넣지 않습니다.

## 2. 필요한 속성

| Notion 속성 | 형식 | 화면 사용처 |
|---|---|---|
| 사이트명 | 제목 | 카드 제목 |
| 대표설명 | 텍스트 | 카드 설명 |
| 라이브 URL | URL | 새 탭 방문 링크 |
| 카테고리 | 선택 | 배지와 필터 |
| 상태 | 선택 | `운영중`, `작업중`만 공개 |
| 정렬 | 숫자 | 오름차순 노출 순서 |
| 제작일 | 날짜 | 카드 날짜 |
| 썸네일 | URL | 우선 대표 이미지 |
| 카드 이미지 | 파일 | 썸네일 URL이 없을 때 첫 파일 |
| GitHub | URL | 관리자용, 공개 HTML에 미출력 |

`보관` 상태는 공개되지 않습니다. `라이브 URL`이 없으면 카드 링크가 비활성화됩니다. `썸네일`과 `카드 이미지`가 모두 없거나 이미지 로딩에 실패하면 사이트 기본 이미지가 표시됩니다. Notion에 등록되지 않은 `틱톡커머스 랩`은 정렬값 12의 예외 데이터로 합쳐집니다.

## 3. Vercel 환경변수

Vercel 프로젝트의 **Settings → Environment Variables**에서 다음 값을 Production에 추가합니다. Preview에서도 확인하려면 Preview에도 같은 이름을 등록합니다.

```text
NOTION_TOKEN=<Notion Integration Secret>
NOTION_PORTFOLIO_DATA_SOURCE_ID=0b1125ab-f1e0-4ad6-8894-e1723e220941
```

설정 후에는 새 배포가 필요합니다. 로컬 Vercel 개발 환경에서는 `vercel env pull .env.local`로 받을 수 있으며 `.env.local`은 커밋하지 않습니다.

## 4. 갱신과 장애 시 동작

- Notion에서 항목을 추가·수정하면 캐시가 재검증되는 최대 약 30분 후 공개 페이지에 반영됩니다.
- Notion API 호출이나 환경변수 설정이 실패하면 `data/portfolio-fallback.js`의 전체 21개 카드가 표시되어 페이지 전체가 중단되지 않습니다.
- 서버 로그에는 상태 코드나 설정 누락 원인만 남기며 토큰 값은 출력하지 않습니다.
