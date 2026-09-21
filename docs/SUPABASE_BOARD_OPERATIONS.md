# 거상마케팅센터 게시판 운영 안내

## 연결 대상

- Supabase 프로젝트: `geosangmarketing-board`
- 프로젝트 ID: `kwqdbdosullbpuecvegj`
- 리전: `ap-northeast-2`
- 비공개 Storage 버킷: `board-private`
- Edge Function: `board-api`

브라우저에는 Project URL과 publishable key만 사용합니다. secret key와 service role key는 코드·Git·브라우저 환경에 넣지 않습니다. Edge Function은 Supabase가 서버 런타임에 제공하는 `SUPABASE_SERVICE_ROLE_KEY`를 사용합니다.

## 최초 관리자 만들기

1. Supabase Dashboard에서 `geosangmarketing-board`를 선택합니다.
2. `Authentication` → `Users` → `Add user` → `Create new user`를 누릅니다.
3. 관리자 이메일과 직접 정한 강한 비밀번호를 입력하고 `Auto Confirm User`를 켜서 생성합니다.
4. 생성된 사용자의 `User UID`를 복사합니다.
5. `Table Editor` → `admin_users` → `Insert row`를 누릅니다.
6. `user_id`에 복사한 UID, `display_name`에 운영자 표시 이름을 입력하고 저장합니다.
7. `/admin/login`에서 방금 만든 이메일과 비밀번호로 로그인합니다.

비밀번호나 secret key는 채팅, 소스코드, 커밋에 붙여 넣지 않습니다. Auth 계정만 만들고 `admin_users` 행을 넣지 않으면 로그인 인증은 되더라도 관리자 API는 거부됩니다.

## 게시글과 자료 발행

1. `/admin/boards`에서 유형을 선택합니다: 공지사항 / FAQ / 무료 자료.
2. 처음에는 `임시저장`으로 저장합니다.
3. 자료 글은 실제 PDF·DOCX·XLSX 등의 파일을 첨부합니다. 파일당 20MB, 글당 5개까지 허용됩니다.
4. 파일 업로드 완료와 공개 문구를 확인한 뒤 상태를 `발행`으로 바꿉니다.
5. 자료실 공개 화면에서 신청 폼과 파일 목록을 확인합니다.

실제 파일이 없는 초기 자료 3개는 모두 임시저장 상태입니다. 파일 없이 발행하지 않습니다.

## 자료 신청과 다운로드

- 필수: 이름, 이메일, 자료 제공 목적의 개인정보 동의
- 선택: 업체명, 관심 서비스, 마케팅 정보 이메일 수신
- 마케팅 수신을 선택하지 않아도 다운로드할 수 있습니다.
- 신청 저장에 성공한 경우에만 10분짜리 다운로드 권한이 발급됩니다.
- Storage 원본은 비공개이며 클라이언트가 임의 경로를 서명하도록 허용하지 않습니다.

## 문의 관리

기존 `/contact`는 Google Apps Script 문의DB 전송을 유지합니다. 같은 제출 payload를 `board-api`에도 먼저 저장해 `/admin/inquiries`에서 상태와 내부 메모를 관리합니다. 60초 안에 같은 전화번호로 재시도하면 Supabase 문의함에는 중복 행을 만들지 않습니다.

## 개인정보 운영자가 확정할 항목

- 자료 신청 정보의 구체적인 보유기간
- 마케팅 이메일 발송을 실제로 시작할 경우 발송 주체와 수신 철회 방법

현재 수집 화면은 개인정보처리방침과 동일하게 “목적 달성 후 관련 법령상 의무가 없는 경우 지체 없이 파기”로 안내합니다. 구체적인 보유기간을 정하면 수집 화면, 개인정보처리방침, 동의 문구 버전을 함께 갱신합니다.

## 적용된 마이그레이션

- `support_board_initial_schema`
- `support_board_service_role_grants`
- `support_board_security_advisor_fixes`

모든 외부 API 노출 테이블에 RLS가 켜져 있습니다. 익명 사용자는 발행된 `board_posts`만 읽을 수 있으며 신청자, 문의, 내부 메모, 관리자, 첨부파일 메타데이터는 직접 조회할 수 없습니다.
