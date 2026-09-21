create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_board_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users au where au.user_id = (select auth.uid())
  );
$$;

revoke all on function private.is_board_admin() from public, anon;
grant execute on function private.is_board_admin() to authenticated, service_role;

drop policy if exists board_posts_public_select on public.board_posts;
drop policy if exists board_posts_admin_all on public.board_posts;
create policy board_posts_anon_select on public.board_posts for select to anon
using (status = 'published' and published_at <= now());
create policy board_posts_authenticated_select on public.board_posts for select to authenticated
using ((status = 'published' and published_at <= now()) or (select private.is_board_admin()));
create policy board_posts_admin_insert on public.board_posts for insert to authenticated
with check ((select private.is_board_admin()));
create policy board_posts_admin_update on public.board_posts for update to authenticated
using ((select private.is_board_admin())) with check ((select private.is_board_admin()));
create policy board_posts_admin_delete on public.board_posts for delete to authenticated
using ((select private.is_board_admin()));

alter policy board_attachments_admin_all on public.board_attachments
using ((select private.is_board_admin())) with check ((select private.is_board_admin()));
alter policy resource_leads_admin_select on public.resource_leads
using ((select private.is_board_admin()));
alter policy resource_requests_admin_select on public.resource_requests
using ((select private.is_board_admin()));
alter policy download_grants_admin_select on public.download_grants
using ((select private.is_board_admin()));
alter policy download_events_admin_select on public.download_events
using ((select private.is_board_admin()));
alter policy inquiries_admin_all on public.inquiries
using ((select private.is_board_admin())) with check ((select private.is_board_admin()));
alter policy inquiry_notes_admin_all on public.inquiry_notes
using ((select private.is_board_admin())) with check ((select private.is_board_admin()));
alter policy board_storage_admin_select on storage.objects
using (bucket_id = 'board-private' and (select private.is_board_admin()));
alter policy board_storage_admin_insert on storage.objects
with check (bucket_id = 'board-private' and (select private.is_board_admin()));
alter policy board_storage_admin_update on storage.objects
using (bucket_id = 'board-private' and (select private.is_board_admin()))
with check (bucket_id = 'board-private' and (select private.is_board_admin()));
alter policy board_storage_admin_delete on storage.objects
using (bucket_id = 'board-private' and (select private.is_board_admin()));

drop function if exists public.is_board_admin();
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;

create index if not exists board_attachments_created_by_idx on public.board_attachments(created_by);
create index if not exists board_posts_created_by_idx on public.board_posts(created_by);
create index if not exists board_posts_updated_by_idx on public.board_posts(updated_by);
create index if not exists download_events_attachment_idx on public.download_events(attachment_id);
create index if not exists download_events_grant_idx on public.download_events(grant_id);
create index if not exists download_grants_request_idx on public.download_grants(request_id);
create index if not exists download_grants_resource_idx on public.download_grants(resource_id);
create index if not exists inquiry_notes_created_by_idx on public.inquiry_notes(created_by);
