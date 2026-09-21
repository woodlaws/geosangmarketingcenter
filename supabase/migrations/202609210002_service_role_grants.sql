-- 새 테이블 자동 공개를 끈 프로젝트에서는 서버 역할 권한도 명시적으로 부여한다.
grant usage on schema public to service_role;
grant all privileges on table
  public.admin_users,
  public.board_posts,
  public.board_attachments,
  public.resource_leads,
  public.resource_requests,
  public.download_grants,
  public.download_events,
  public.inquiries,
  public.inquiry_notes
to service_role;

notify pgrst, 'reload schema';
