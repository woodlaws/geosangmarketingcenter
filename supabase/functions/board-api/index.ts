import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PUBLIC_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const BUCKET = "board-private";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 5;
const CONSENT_VERSION = "2026-09-21-v1";
const CONSENT_TEXT = "자료 제공과 관련 문의 확인을 위해 이름·이메일을 이용하며, 목적 달성 후 관련 법령상 보관 의무가 없는 경우 지체 없이 파기합니다.";
const ALLOWED_EXTENSIONS = new Set(["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "jpeg", "png", "webp", "zip"]);
const ALLOWED_ORIGINS = new Set([
  "https://geosangmarketing.com",
  "https://www.geosangmarketing.com",
  "http://127.0.0.1:8787",
  "http://127.0.0.1:8788",
  "http://localhost:8787",
]);

const service = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.has(origin) || /^https:\/\/geosangmarketingcenter-[a-z0-9-]+\.vercel\.app$/.test(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://geosangmarketing.com",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-idempotency-key",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Vary": "Origin",
  };
}

function json(request: Request, value: unknown, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...corsHeaders(request), "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

function clean(value: unknown, max = 500) {
  return String(value ?? "").trim().slice(0, max);
}

function emailValid(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

function getPath(request: Request) {
  const url = new URL(request.url);
  return url.pathname.replace(/^\/board-api\/?/, "/").replace(/\/{2,}/g, "/");
}

async function bodyJson(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function requireAdmin(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const authClient = createClient(SUPABASE_URL, PUBLIC_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  if (userError || !userData.user) return null;
  const { data: admin } = await service.from("admin_users").select("user_id, display_name").eq("user_id", userData.user.id).maybeSingle();
  return admin ? { user: userData.user, admin } : null;
}

const publicPostFields = "id,post_type,category,slug,title,excerpt,body,is_pinned,display_order,download_mode,target_audience,usage_steps,related_service_label,related_service_href,resource_version,published_at,updated_at";

async function listPublicPosts(type: string, request: Request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const size = Math.min(30, Math.max(1, Number(url.searchParams.get("size") || 12)));
  const search = clean(url.searchParams.get("q"), 80);
  let query = service.from("board_posts").select(publicPostFields, { count: "exact" })
    .eq("post_type", type).eq("status", "published").lte("published_at", new Date().toISOString());
  if (search) query = query.or(`title.ilike.%${search.replace(/[%_,()]/g, "")}%,excerpt.ilike.%${search.replace(/[%_,()]/g, "")}%,body.ilike.%${search.replace(/[%_,()]/g, "")}%`);
  query = type === "faq"
    ? query.order("display_order", { ascending: true })
    : query.order("is_pinned", { ascending: false }).order("published_at", { ascending: false });
  const from = (page - 1) * size;
  const { data, error, count } = await query.range(from, from + size - 1);
  if (error) {
    console.error("listPublicPosts", error);
    return json(request, { ok: false, error: "목록을 불러오지 못했습니다." }, 500);
  }
  return json(request, { ok: true, items: data ?? [], page, size, total: count ?? 0 });
}

async function publicDetail(type: string, slug: string, request: Request) {
  const { data: post, error } = await service.from("board_posts").select(publicPostFields)
    .eq("post_type", type).eq("slug", slug).eq("status", "published").lte("published_at", new Date().toISOString()).maybeSingle();
  if (error || !post) return json(request, { ok: false, error: "게시물을 찾을 수 없습니다." }, 404);
  const { data: files } = await service.from("board_attachments")
    .select("id,original_name,mime_type,extension,size_bytes,sort_order")
    .eq("post_id", post.id).eq("status", "ready").order("sort_order");
  return json(request, { ok: true, item: { ...post, attachments: files ?? [] } });
}

async function createResourceRequest(request: Request, slug: string) {
  const payload = await bodyJson(request);
  if (!payload || clean(payload.website_hidden, 120)) return json(request, { ok: true, ignored: true });
  const name = clean(payload.name, 80);
  const email = clean(payload.email, 254).toLowerCase();
  const privacyAgreed = payload.privacyAgree === true;
  const idempotency = clean(request.headers.get("x-idempotency-key") || payload.idempotencyKey, 64);
  if (!name || !emailValid(email) || !privacyAgreed || !/^[0-9a-f-]{36}$/i.test(idempotency)) {
    return json(request, { ok: false, error: "이름, 올바른 이메일, 개인정보 동의를 확인해 주세요." }, 400);
  }
  const { data: resource } = await service.from("board_posts").select("id,resource_version,download_mode")
    .eq("post_type", "resource").eq("slug", slug).eq("status", "published").lte("published_at", new Date().toISOString()).maybeSingle();
  if (!resource) return json(request, { ok: false, error: "현재 신청할 수 없는 자료입니다." }, 404);
  const { data: attachments } = await service.from("board_attachments").select("id")
    .eq("post_id", resource.id).eq("status", "ready").limit(MAX_FILES);
  if (!attachments?.length) return json(request, { ok: false, error: "다운로드 파일이 아직 준비되지 않았습니다." }, 409);

  let { data: existing } = await service.from("resource_requests").select("id")
    .eq("resource_id", resource.id).eq("idempotency_key", idempotency).maybeSingle();
  let requestId = existing?.id;
  if (!requestId) {
    const { data: lead, error: leadError } = await service.from("resource_leads").insert({
      name, email, company: clean(payload.company, 160) || null,
      interested_service: clean(payload.interestedService, 160) || null,
    }).select("id").single();
    if (leadError || !lead) return json(request, { ok: false, error: "신청 정보를 저장하지 못했습니다." }, 500);
    const { data: saved, error: saveError } = await service.from("resource_requests").insert({
      lead_id: lead.id,
      resource_id: resource.id,
      resource_version: resource.resource_version,
      privacy_agreed: true,
      marketing_agreed: payload.marketingAgree === true,
      consent_version: CONSENT_VERSION,
      consent_text: CONSENT_TEXT,
      source: clean(payload.source, 80) || "resource-detail",
      utm_source: clean(payload.utmSource, 100) || null,
      utm_medium: clean(payload.utmMedium, 100) || null,
      utm_campaign: clean(payload.utmCampaign, 120) || null,
      idempotency_key: idempotency,
    }).select("id").single();
    if (saveError || !saved) return json(request, { ok: false, error: "신청 정보를 저장하지 못했습니다." }, 500);
    requestId = saved.id;
  }
  const token = randomToken();
  const { error: grantError } = await service.from("download_grants").insert({
    request_id: requestId,
    resource_id: resource.id,
    token_hash: await sha256(token),
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  });
  if (grantError) return json(request, { ok: false, error: "다운로드 권한을 만들지 못했습니다." }, 500);
  return json(request, { ok: true, message: "신청이 완료되었습니다. 아래 버튼으로 자료를 받아보세요.", token, expiresIn: 600 });
}

async function issueDownload(request: Request) {
  const payload = await bodyJson(request);
  const token = clean(payload?.token, 200);
  const attachmentId = clean(payload?.attachmentId, 50);
  if (!token || !attachmentId) return json(request, { ok: false, error: "다운로드 정보가 올바르지 않습니다." }, 400);
  const { data: grant } = await service.from("download_grants").select("id,resource_id,expires_at,revoked_at")
    .eq("token_hash", await sha256(token)).maybeSingle();
  if (!grant || grant.revoked_at || new Date(grant.expires_at).getTime() <= Date.now()) {
    return json(request, { ok: false, error: "다운로드 시간이 만료되었습니다. 자료를 다시 신청해 주세요." }, 403);
  }
  const { data: file } = await service.from("board_attachments")
    .select("id,post_id,storage_bucket,storage_path,original_name,mime_type,size_bytes")
    .eq("id", attachmentId).eq("post_id", grant.resource_id).eq("status", "ready").maybeSingle();
  if (!file) return json(request, { ok: false, error: "요청한 파일을 찾을 수 없습니다." }, 404);
  const { data: signed, error } = await service.storage.from(file.storage_bucket).createSignedUrl(file.storage_path, 600, { download: file.original_name });
  if (error || !signed?.signedUrl) return json(request, { ok: false, error: "다운로드 링크를 만들지 못했습니다." }, 500);
  await service.from("download_events").insert({ grant_id: grant.id, attachment_id: file.id, event_type: "download_button_clicked" });
  return json(request, { ok: true, url: signed.signedUrl, filename: file.original_name, expiresIn: 600 });
}

async function saveInquiry(request: Request) {
  const payload = await bodyJson(request);
  if (!payload || clean(payload.website_hidden, 120)) return json(request, { ok: true, ignored: true });
  const name = clean(payload.name, 80);
  const phone = clean(payload.phone, 40);
  if (!name || phone.length < 7 || payload.privacyAgree !== true) return json(request, { ok: false, error: "이름, 연락처, 개인정보 동의를 확인해 주세요." }, 400);
  const since = new Date(Date.now() - 60 * 1000).toISOString();
  const { data: recent } = await service.from("inquiries").select("id").eq("phone", phone).gte("created_at", since).limit(1);
  if (recent?.length) return json(request, { ok: true, duplicate: true });
  const safePayload = {
    websiteStatus: clean(payload.websiteStatus, 100), websitePlan: clean(payload.websitePlan, 100),
    productionGoal: clean(payload.productionGoal, 2000), desiredFeatures: clean(payload.desiredFeatures, 2000),
    desiredLaunchDate: clean(payload.desiredLaunchDate, 160), referenceWebsites: clean(payload.referenceWebsites, 2000),
    availableAssets: clean(payload.availableAssets, 2000), branchCount: clean(payload.branchCount, 100),
    managementChannel: clean(payload.managementChannel, 500), region: clean(payload.region, 160), industry: clean(payload.industry, 160),
  };
  const { error } = await service.from("inquiries").insert({
    type: clean(payload.type, 80) || "diagnosis", source: clean(payload.source, 100) || "direct", name,
    company: clean(payload.company, 160) || null, phone, email: clean(payload.email, 254) || null,
    reference_url: clean(payload.referenceUrl, 2000) || null, business_type: clean(payload.businessType, 120) || null,
    interested_services: clean(payload.interestedServices, 300) || null, current_problems: clean(payload.currentProblems, 5000) || null,
    budget_range: clean(payload.budgetRange, 160) || null, preferred_contact: clean(payload.preferredContact, 160) || null,
    message: clean(payload.message, 10000) || null, privacy_agreed: true, payload: safePayload,
  });
  return error ? json(request, { ok: false, error: "관리자 문의함 저장에 실패했습니다." }, 500) : json(request, { ok: true });
}

async function adminRoute(request: Request, path: string) {
  const session = await requireAdmin(request);
  if (!session) return json(request, { ok: false, error: "관리자 권한이 필요합니다." }, 401);
  const url = new URL(request.url);
  if (request.method === "GET" && path === "/admin/dashboard") {
    const [posts, inquiries, leads] = await Promise.all([
      service.from("board_posts").select("id", { count: "exact", head: true }),
      service.from("inquiries").select("id", { count: "exact", head: true }).neq("status", "completed"),
      service.from("resource_requests").select("id", { count: "exact", head: true }),
    ]);
    return json(request, { ok: true, counts: { posts: posts.count ?? 0, openInquiries: inquiries.count ?? 0, resourceRequests: leads.count ?? 0 }, admin: session.admin });
  }
  if (request.method === "GET" && path === "/admin/posts") {
    const { data, error } = await service.from("board_posts").select("*,board_attachments(id,original_name,mime_type,extension,size_bytes,status,sort_order)").order("updated_at", { ascending: false });
    return error ? json(request, { ok: false, error: "게시글을 불러오지 못했습니다." }, 500) : json(request, { ok: true, items: data ?? [] });
  }
  if (request.method === "POST" && path === "/admin/posts") {
    const payload = await bodyJson(request);
    const record = postRecord(payload, session.user.id);
    const { data, error } = await service.from("board_posts").insert(record).select().single();
    return error ? json(request, { ok: false, error: error.message }, 400) : json(request, { ok: true, item: data }, 201);
  }
  const postMatch = path.match(/^\/admin\/posts\/([0-9a-f-]{36})$/i);
  if (postMatch && request.method === "PUT") {
    const payload = await bodyJson(request);
    const { data, error } = await service.from("board_posts").update(postRecord(payload, session.user.id, true)).eq("id", postMatch[1]).select().single();
    return error ? json(request, { ok: false, error: error.message }, 400) : json(request, { ok: true, item: data });
  }
  if (postMatch && request.method === "DELETE") {
    const { error } = await service.from("board_posts").update({ status: "archived", updated_by: session.user.id }).eq("id", postMatch[1]);
    return error ? json(request, { ok: false, error: error.message }, 400) : json(request, { ok: true });
  }
  if (request.method === "POST" && path === "/admin/attachments/finalize") {
    const payload = await bodyJson(request);
    const postId = clean(payload?.postId, 50); const storagePath = clean(payload?.storagePath, 500);
    const originalName = clean(payload?.originalName, 255); const mimeType = clean(payload?.mimeType, 200);
    const sizeBytes = Number(payload?.sizeBytes || 0); const extension = originalName.split(".").pop()?.toLowerCase() ?? "";
    if (!/^[0-9a-f-]{36}$/i.test(postId) || !storagePath.startsWith(`${postId}/`) || !ALLOWED_EXTENSIONS.has(extension) || sizeBytes <= 0 || sizeBytes > MAX_FILE_SIZE) {
      return json(request, { ok: false, error: "첨부파일 정보가 올바르지 않습니다." }, 400);
    }
    const { count } = await service.from("board_attachments").select("id", { count: "exact", head: true }).eq("post_id", postId).eq("status", "ready");
    if ((count ?? 0) >= MAX_FILES) return json(request, { ok: false, error: "글당 첨부파일은 최대 5개입니다." }, 400);
    const { data: items } = await service.storage.from(BUCKET).list(postId, { search: storagePath.split("/").pop(), limit: 10 });
    if (!items?.some((item) => `${postId}/${item.name}` === storagePath)) return json(request, { ok: false, error: "업로드 완료 파일을 확인할 수 없습니다." }, 409);
    const { data, error } = await service.from("board_attachments").insert({ post_id: postId, storage_path: storagePath, original_name: originalName, mime_type: mimeType, extension, size_bytes: sizeBytes, status: "ready", created_by: session.user.id }).select().single();
    return error ? json(request, { ok: false, error: error.message }, 400) : json(request, { ok: true, item: data }, 201);
  }
  const attachmentMatch = path.match(/^\/admin\/attachments\/([0-9a-f-]{36})$/i);
  if (attachmentMatch && request.method === "DELETE") {
    const { data: file } = await service.from("board_attachments").select("storage_bucket,storage_path").eq("id", attachmentMatch[1]).maybeSingle();
    if (!file) return json(request, { ok: false, error: "파일을 찾을 수 없습니다." }, 404);
    const { error: removeError } = await service.storage.from(file.storage_bucket).remove([file.storage_path]);
    if (removeError) return json(request, { ok: false, error: "Storage 파일 삭제에 실패했습니다." }, 500);
    await service.from("board_attachments").update({ status: "deleted" }).eq("id", attachmentMatch[1]);
    return json(request, { ok: true });
  }
  if (request.method === "GET" && path === "/admin/inquiries") {
    const status = clean(url.searchParams.get("status"), 30);
    let query = service.from("inquiries").select("*").order("created_at", { ascending: false }).limit(200);
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    return error ? json(request, { ok: false, error: "문의 목록을 불러오지 못했습니다." }, 500) : json(request, { ok: true, items: data ?? [] });
  }
  const inquiryMatch = path.match(/^\/admin\/inquiries\/([0-9a-f-]{36})$/i);
  if (inquiryMatch && request.method === "PUT") {
    const payload = await bodyJson(request); const status = clean(payload?.status, 30);
    if (!["received", "reviewing", "consulting", "completed"].includes(status)) return json(request, { ok: false, error: "상태가 올바르지 않습니다." }, 400);
    const { error } = await service.from("inquiries").update({ status, last_handled_at: new Date().toISOString() }).eq("id", inquiryMatch[1]);
    if (!error && clean(payload?.note, 5000)) await service.from("inquiry_notes").insert({ inquiry_id: inquiryMatch[1], note: clean(payload.note, 5000), created_by: session.user.id });
    return error ? json(request, { ok: false, error: error.message }, 400) : json(request, { ok: true });
  }
  if (request.method === "GET" && path === "/admin/leads") {
    const { data, error } = await service.from("resource_requests").select("id,resource_version,privacy_agreed,marketing_agreed,consent_version,source,created_at,resource_leads(name,email,company,interested_service),board_posts(title,slug)").order("created_at", { ascending: false }).limit(500);
    return error ? json(request, { ok: false, error: "신청자 목록을 불러오지 못했습니다." }, 500) : json(request, { ok: true, items: data ?? [] });
  }
  return json(request, { ok: false, error: "관리자 경로를 찾을 수 없습니다." }, 404);
}

function postRecord(payload: Record<string, unknown> | null, userId: string, updating = false) {
  const status = ["draft", "published", "archived"].includes(clean(payload?.status, 20)) ? clean(payload?.status, 20) : "draft";
  const record: Record<string, unknown> = {
    post_type: clean(payload?.postType, 20), category: clean(payload?.category, 80) || "안내", slug: clean(payload?.slug, 160),
    title: clean(payload?.title, 160), excerpt: clean(payload?.excerpt, 500), body: clean(payload?.body, 50000), status,
    is_pinned: payload?.isPinned === true, display_order: Number(payload?.displayOrder || 0),
    download_mode: payload?.downloadMode === "direct" ? "direct" : "lead_gate",
    target_audience: Array.isArray(payload?.targetAudience) ? payload.targetAudience.map((item) => clean(item, 160)).filter(Boolean).slice(0, 10) : [],
    usage_steps: Array.isArray(payload?.usageSteps) ? payload.usageSteps.map((item) => clean(item, 300)).filter(Boolean).slice(0, 10) : [],
    related_service_label: clean(payload?.relatedServiceLabel, 100) || null,
    related_service_href: clean(payload?.relatedServiceHref, 300) || null,
    resource_version: clean(payload?.resourceVersion, 80) || null,
    published_at: status === "published" ? (clean(payload?.publishedAt, 40) || new Date().toISOString()) : null,
    updated_by: userId,
  };
  if (!updating) record.created_by = userId;
  return record;
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });
  if (!SUPABASE_URL || !SERVICE_KEY) return json(request, { ok: false, error: "서버 설정이 완료되지 않았습니다." }, 503);
  const path = getPath(request);
  if (path.startsWith("/admin/")) return adminRoute(request, path);
  if (request.method === "GET" && path === "/notices") return listPublicPosts("notice", request);
  if (request.method === "GET" && path === "/faqs") return listPublicPosts("faq", request);
  if (request.method === "GET" && path === "/resources") return listPublicPosts("resource", request);
  const detail = path.match(/^\/(notices|resources)\/([a-z0-9-]+)$/);
  if (detail && request.method === "GET") return publicDetail(detail[1] === "notices" ? "notice" : "resource", detail[2], request);
  const requestMatch = path.match(/^\/resources\/([a-z0-9-]+)\/request$/);
  if (requestMatch && request.method === "POST") return createResourceRequest(request, requestMatch[1]);
  if (path === "/downloads" && request.method === "POST") return issueDownload(request);
  if (path === "/inquiries" && request.method === "POST") return saveInquiry(request);
  return json(request, { ok: false, error: "경로를 찾을 수 없습니다." }, 404);
});
