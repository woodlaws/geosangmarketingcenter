-- 거상마케팅센터 고객지원 게시판 초기 스키마
-- 대상 프로젝트: geosangmarketing-board (kwqdbdosullbpuecvegj)

create extension if not exists pgcrypto;

create type public.board_post_type as enum ('notice', 'faq', 'resource');
create type public.board_post_status as enum ('draft', 'published', 'archived');
create type public.download_mode as enum ('direct', 'lead_gate');
create type public.inquiry_status as enum ('received', 'reviewing', 'consulting', 'completed');
create type public.attachment_status as enum ('pending', 'ready', 'replaced', 'deleted');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.board_posts (
  id uuid primary key default gen_random_uuid(),
  post_type public.board_post_type not null,
  category text not null default '안내',
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(title) between 2 and 160),
  excerpt text not null default '' check (char_length(excerpt) <= 500),
  body text not null default '',
  status public.board_post_status not null default 'draft',
  is_pinned boolean not null default false,
  display_order integer not null default 0,
  download_mode public.download_mode not null default 'lead_gate',
  target_audience text[] not null default '{}',
  usage_steps text[] not null default '{}',
  related_service_label text,
  related_service_href text check (related_service_href is null or related_service_href ~ '^/'),
  resource_version text,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_posts_publish_date check (status <> 'published' or published_at is not null)
);

create index board_posts_public_idx on public.board_posts (post_type, status, is_pinned desc, published_at desc);
create index board_posts_category_idx on public.board_posts (post_type, category, display_order, published_at desc);

create table public.board_attachments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.board_posts(id) on delete cascade,
  storage_bucket text not null default 'board-private',
  storage_path text not null unique,
  original_name text not null,
  mime_type text not null,
  extension text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 20971520),
  status public.attachment_status not null default 'pending',
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index board_attachments_post_idx on public.board_attachments (post_id, status, sort_order);

create table public.resource_leads (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  email text not null check (char_length(email) <= 254),
  company text check (char_length(company) <= 160),
  interested_service text check (char_length(interested_service) <= 160),
  created_at timestamptz not null default now()
);

create index resource_leads_email_idx on public.resource_leads (lower(email));

create table public.resource_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.resource_leads(id) on delete restrict,
  resource_id uuid not null references public.board_posts(id) on delete restrict,
  resource_version text,
  privacy_agreed boolean not null check (privacy_agreed),
  marketing_agreed boolean not null default false,
  consent_version text not null,
  consent_text text not null,
  source text check (char_length(source) <= 80),
  utm_source text check (char_length(utm_source) <= 100),
  utm_medium text check (char_length(utm_medium) <= 100),
  utm_campaign text check (char_length(utm_campaign) <= 120),
  idempotency_key uuid not null,
  is_test boolean not null default false,
  created_at timestamptz not null default now(),
  unique (resource_id, idempotency_key)
);

create index resource_requests_resource_idx on public.resource_requests (resource_id, created_at desc);
create index resource_requests_lead_idx on public.resource_requests (lead_id, created_at desc);

create table public.download_grants (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.resource_requests(id) on delete cascade,
  resource_id uuid not null references public.board_posts(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index download_grants_valid_idx on public.download_grants (token_hash, expires_at) where revoked_at is null;

create table public.download_events (
  id uuid primary key default gen_random_uuid(),
  grant_id uuid not null references public.download_grants(id) on delete cascade,
  attachment_id uuid not null references public.board_attachments(id) on delete restrict,
  event_type text not null check (event_type in ('signed_url_issued', 'download_button_clicked')),
  created_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'diagnosis' check (char_length(type) <= 80),
  source text not null default 'direct' check (char_length(source) <= 100),
  name text not null check (char_length(name) between 1 and 80),
  company text check (char_length(company) <= 160),
  phone text not null check (char_length(phone) between 7 and 40),
  email text check (char_length(email) <= 254),
  reference_url text check (char_length(reference_url) <= 2000),
  business_type text check (char_length(business_type) <= 120),
  interested_services text check (char_length(interested_services) <= 300),
  current_problems text check (char_length(current_problems) <= 5000),
  budget_range text check (char_length(budget_range) <= 160),
  preferred_contact text check (char_length(preferred_contact) <= 160),
  message text check (char_length(message) <= 10000),
  privacy_agreed boolean not null check (privacy_agreed),
  payload jsonb not null default '{}'::jsonb,
  status public.inquiry_status not null default 'received',
  last_handled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index inquiries_status_idx on public.inquiries (status, created_at desc);
create index inquiries_phone_idx on public.inquiries (phone, created_at desc);

create table public.inquiry_notes (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  note text not null check (char_length(note) between 1 and 5000),
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index inquiry_notes_inquiry_idx on public.inquiry_notes (inquiry_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger board_posts_set_updated_at before update on public.board_posts
for each row execute function public.set_updated_at();
create trigger board_attachments_set_updated_at before update on public.board_attachments
for each row execute function public.set_updated_at();
create trigger inquiries_set_updated_at before update on public.inquiries
for each row execute function public.set_updated_at();

create or replace function public.is_board_admin()
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

revoke all on function public.is_board_admin() from public;
grant execute on function public.is_board_admin() to authenticated;

alter table public.admin_users enable row level security;
alter table public.board_posts enable row level security;
alter table public.board_attachments enable row level security;
alter table public.resource_leads enable row level security;
alter table public.resource_requests enable row level security;
alter table public.download_grants enable row level security;
alter table public.download_events enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_notes enable row level security;

create policy admin_users_self_select on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));
create policy board_posts_public_select on public.board_posts for select to anon, authenticated
using (status = 'published' and published_at <= now());
create policy board_posts_admin_all on public.board_posts for all to authenticated
using ((select public.is_board_admin())) with check ((select public.is_board_admin()));
create policy board_attachments_admin_all on public.board_attachments for all to authenticated
using ((select public.is_board_admin())) with check ((select public.is_board_admin()));
create policy resource_leads_admin_select on public.resource_leads for select to authenticated
using ((select public.is_board_admin()));
create policy resource_requests_admin_select on public.resource_requests for select to authenticated
using ((select public.is_board_admin()));
create policy download_grants_admin_select on public.download_grants for select to authenticated
using ((select public.is_board_admin()));
create policy download_events_admin_select on public.download_events for select to authenticated
using ((select public.is_board_admin()));
create policy inquiries_admin_all on public.inquiries for all to authenticated
using ((select public.is_board_admin())) with check ((select public.is_board_admin()));
create policy inquiry_notes_admin_all on public.inquiry_notes for all to authenticated
using ((select public.is_board_admin())) with check ((select public.is_board_admin()));

grant usage on schema public to anon, authenticated;
grant select on public.board_posts to anon, authenticated;
grant select on public.admin_users to authenticated;
grant select, insert, update, delete on public.board_posts, public.board_attachments, public.inquiries, public.inquiry_notes to authenticated;
grant select on public.resource_leads, public.resource_requests, public.download_grants, public.download_events to authenticated;
revoke all on public.resource_leads, public.resource_requests, public.download_grants, public.download_events, public.inquiries, public.inquiry_notes, public.board_attachments, public.admin_users from anon;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'board-private',
  'board-private',
  false,
  20971520,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/zip',
    'application/x-zip-compressed'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy board_storage_admin_select on storage.objects for select to authenticated
using (bucket_id = 'board-private' and (select public.is_board_admin()));
create policy board_storage_admin_insert on storage.objects for insert to authenticated
with check (bucket_id = 'board-private' and (select public.is_board_admin()));
create policy board_storage_admin_update on storage.objects for update to authenticated
using (bucket_id = 'board-private' and (select public.is_board_admin()))
with check (bucket_id = 'board-private' and (select public.is_board_admin()));
create policy board_storage_admin_delete on storage.objects for delete to authenticated
using (bucket_id = 'board-private' and (select public.is_board_admin()));

insert into public.board_posts
  (post_type, category, slug, title, excerpt, body, status, is_pinned, published_at, related_service_label, related_service_href)
values
  ('notice', '이용 안내', 'support-guide', '거상마케팅센터 고객지원 이용 안내',
   '공지사항, 자주 묻는 질문, 무료 자료실과 1:1 문의 이용 방법을 안내합니다.',
   E'고객지원에서는 서비스 운영 안내와 실무 자료를 확인할 수 있습니다.\n\n궁금한 내용은 자주 묻는 질문에서 먼저 확인하고, 사업 상황에 맞는 상담이 필요하면 기존 상담문의 폼을 이용해 주세요. 무료 자료는 실제 파일이 준비되고 관리자가 발행한 자료만 신청할 수 있습니다.',
   'published', true, now(), '상담문의', '/contact?type=consulting&source=support-notice'),
  ('notice', '상담 안내', 'consultation-preparation', '무료 진단·상담 신청 전 준비하면 좋은 자료',
   '현재 운영 상태를 더 빠르게 확인하는 데 도움이 되는 기본 자료를 안내합니다.',
   E'스마트플레이스 링크, 홈페이지 주소, 블로그·SNS 링크와 현재 가장 큰 고민을 준비해 주세요. 광고를 운영 중이라면 채널과 대략적인 운영 범위를 함께 알려주시면 확인에 도움이 됩니다.\n\n자료가 모두 준비되지 않았더라도 상담 신청은 가능합니다. 확인되지 않은 성과를 약속하지 않고 현재 상태와 실행 우선순위를 중심으로 안내합니다.',
   'published', false, now() - interval '1 minute', '무료 진단 신청', '/contact?type=consulting&source=support-notice');

insert into public.board_posts
  (post_type, category, slug, title, excerpt, body, status, display_order, published_at, related_service_label, related_service_href)
values
  ('faq', '비용·계약', 'pricing', '마케팅 대행 비용은 어떻게 결정되나요?', '', '업종, 지역, 경쟁 강도, 현재 채널 상태와 필요한 실행 범위에 따라 달라집니다. 먼저 현재 상태를 확인한 뒤 필요한 관리 범위와 견적을 안내합니다.', 'published', 10, now(), '서비스 전체 보기', '/services'),
  ('faq', '비용·계약', 'minimum-contract', '최소 계약 기간은 얼마인가요?', '', '서비스 종류와 운영 범위에 따라 계약 조건이 달라질 수 있습니다. 상담 과정에서 필요한 작업과 운영 주기를 확인한 뒤 적용 조건을 안내합니다.', 'published', 20, now(), '상담문의', '/contact?type=consulting&source=support-faq'),
  ('faq', '진행 절차', 'workflow', '계약하면 어떤 순서로 진행되나요?', '', '현재 상태 확인, 목표와 우선순위 협의, 자료 수집, 실행, 진행 상황 공유와 개선 순서로 진행합니다. 세부 단계는 선택한 서비스 범위에 맞춰 조정합니다.', 'published', 30, now(), '진행 방식 보기', '/services'),
  ('faq', '진행 절차', 'preparation', '시작 전에 어떤 자료를 준비해야 하나요?', '', '사업자 기본 정보, 운영 중인 채널 링크, 로고와 사진, 주요 상품·서비스 설명, 현재 고민을 준비하면 좋습니다. 자료가 부족한 경우 필요한 항목부터 함께 정리합니다.', 'published', 40, now(), '상담문의', '/contact?type=consulting&source=support-faq'),
  ('faq', '스마트플레이스', 'smartplace-scope', '스마트플레이스 관리에는 어떤 작업이 포함되나요?', '', '매장 정보, 카테고리, 사진, 메뉴·상품, 소식, 리뷰 운영 상태와 주요 지역 검색어 노출을 점검합니다. 실제 적용 범위는 현재 상태와 선택한 플랜에 따라 달라집니다.', 'published', 50, now(), '스마트플레이스 서비스', '/services/smartplace'),
  ('faq', '성과·보고', 'no-guarantee', '검색 순위나 매출을 보장하나요?', '', '검색 결과와 매출은 측정 시점, 위치, 기기, 경쟁 상황과 사업 운영 등 여러 요인의 영향을 받으므로 특정 순위나 매출을 보장하지 않습니다. 확인 가능한 상태와 실행 내역을 바탕으로 개선 방향을 안내합니다.', 'published', 60, now(), '마케팅 컨설팅', '/services/consulting'),
  ('faq', '성과·보고', 'reporting', '진행 상황과 결과는 어떻게 보고받나요?', '', '작업 범위에 따라 진행 내역, 확인한 변화와 다음 개선 과제를 정리해 공유합니다. 보고 형식과 주기는 계약한 서비스 범위에서 협의합니다.', 'published', 70, now(), '상담문의', '/contact?type=consulting&source=support-faq'),
  ('faq', '홈페이지', 'website-maintenance', '홈페이지 제작 후 수정과 유지관리는 어떻게 하나요?', '', '제작 범위, 수정 요청의 성격과 운영 방식에 따라 지원 범위가 달라집니다. 제작 상담에서 필요한 기능과 향후 관리 방식을 확인한 뒤 안내합니다.', 'published', 80, now(), 'AI 홈페이지 제작', '/services/website-production');

insert into public.board_posts
  (post_type, category, slug, title, excerpt, body, status, target_audience, usage_steps, related_service_label, related_service_href, resource_version)
values
  ('resource', '스마트플레이스', 'smartplace-checklist-20', '우리 가게 스마트플레이스 점검표 20가지',
   '플레이스 기본 정보와 콘텐츠, 리뷰 운영 상태를 차례로 확인하는 체크리스트입니다.',
   '매장 정보와 검색 노출의 기본 상태를 스스로 확인할 수 있도록 구성한 실무 점검표입니다. 실제 파일을 첨부한 뒤 관리자가 발행합니다.',
   'draft', array['식당·카페 등 지역 매장', '플레이스 운영을 처음 점검하는 사업자'], array['현재 등록 정보를 확인합니다', '누락되거나 오래된 항목을 표시합니다', '우선 수정할 항목을 정리합니다'], '스마트플레이스 서비스', '/services/smartplace', '준비 중'),
  ('resource', '홈페이지', 'website-production-preparation', '홈페이지 제작 전 준비해야 할 자료 체크리스트',
   '홈페이지 제작 상담 전에 준비하면 좋은 사업 정보와 이미지, 참고 자료를 정리했습니다.',
   '사업 소개와 고객 행동을 기준으로 제작에 필요한 자료를 빠짐없이 준비하는 체크리스트입니다. 실제 파일을 첨부한 뒤 관리자가 발행합니다.',
   'draft', array['신규 홈페이지를 준비하는 사업자', '기존 홈페이지 개편을 검토하는 담당자'], array['사업과 고객 정보를 정리합니다', '보유 이미지와 문서를 모읍니다', '필요 기능과 참고 사이트를 기록합니다'], 'AI 홈페이지 제작', '/services/website-production', '준비 중'),
  ('resource', '컨설팅', 'marketing-agency-quote-comparison', '마케팅 대행 견적 비교 체크리스트',
   '가격만이 아니라 실행 범위, 보고 방식과 별도 비용을 함께 비교하도록 돕는 체크리스트입니다.',
   '대행 제안서를 비교할 때 확인해야 할 서비스 범위와 책임, 별도 비용 항목을 정리했습니다. 실제 파일을 첨부한 뒤 관리자가 발행합니다.',
   'draft', array['마케팅 대행을 처음 검토하는 사업자', '여러 제안서를 비교하는 담당자'], array['각 제안의 포함 범위를 표시합니다', '별도 비용과 준비 사항을 확인합니다', '운영·보고 방식을 비교합니다'], '마케팅 컨설팅', '/services/consulting', '준비 중');

