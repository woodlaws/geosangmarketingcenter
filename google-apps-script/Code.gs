const SPREADSHEET_ID = "1Rxs6ZRyBl5oP-sosgXOrBjV449ZObADznnu_HeGZ7xI";
const SHEET_NAME = "문의DB";

const ALLOWED_INQUIRY_TYPES = [
  "general",
  "services",
  "smartplace",
  "google-business-profile",
  "content-sns",
  "ads",
  "government-support",
  "website-diagnosis",
  "aeo-geo",
  "consulting",
  "enterprise",
  "local-store",
  "online-sales",
  "consulting-contract",
  "cases"
];

const ALLOWED_BUSINESS_TYPES = [
  "매장 방문형",
  "온라인 판매형",
  "상담·계약형",
  "기업 / B2B",
  "정부지원사업 수혜자",
  "아직 잘 모르겠음",
  "기타"
];

const ALLOWED_BUDGETS = [
  "아직 미정",
  "50만원 이하",
  "50만~100만원",
  "100만~300만원",
  "300만원 이상",
  "정부지원사업 예산 활용 예정"
];

const ALLOWED_CONTACT_METHODS = [
  "전화 상담",
  "카카오톡 상담",
  "줌 미팅",
  "방문 미팅",
  "먼저 자료 검토 후 연락 희망"
];

function doGet() {
  return jsonResponse_({
    success: true,
    service: "거상마케팅센터 통합 문의 접수",
    sheet: SHEET_NAME
  });
}

function doPost(e) {
  try {
    const data = parseRequest_(e);

    // 자동 입력 봇은 정상 응답만 반환하고 시트에는 기록하지 않습니다.
    if (clean_(data.website_hidden)) {
      return jsonResponse_({ success: true });
    }

    const name = clean_(data.name);
    const phone = clean_(data.phone);
    const company = clean_(data.company);
    const inquiryType = allowedOr_(data.type, ALLOWED_INQUIRY_TYPES, "general");
    const privacyConsent = data.privacyAgree === true || clean_(data.privacyAgree).toLowerCase() === "true";

    if (!name || !phone) {
      return jsonResponse_({ success: false, error: "필수 입력값이 누락되었습니다." });
    }
    if (!privacyConsent) {
      return jsonResponse_({ success: false, error: "개인정보 수집·이용 동의가 필요합니다." });
    }

    const row = [
      new Date(),
      inquiryType,
      safeCell_(data.source),
      safeCell_(name),
      safeCell_(company),
      safeCell_(phone),
      safeCell_(data.email),
      safeCell_(data.referenceUrl),
      allowedOr_(data.businessType, ALLOWED_BUSINESS_TYPES, "아직 잘 모르겠음"),
      safeCell_(data.interestedServices),
      safeCell_(data.currentProblems),
      allowedOr_(data.budgetRange, ALLOWED_BUDGETS, "아직 미정"),
      allowedOr_(data.preferredContact, ALLOWED_CONTACT_METHODS, "먼저 자료 검토 후 연락 희망"),
      safeCell_(data.message),
      "동의",
      "신규",
      "",
      safeCell_(data.userAgent),
      safeCell_(data.pageUrl)
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
      const sheet = spreadsheet.getSheetByName(SHEET_NAME);
      if (!sheet) throw new Error("문의DB 탭을 찾을 수 없습니다.");

      sheet.appendRow(row);
      const submittedRow = sheet.getLastRow();
      sheet.getRange(submittedRow, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

      return jsonResponse_({ success: true, row: submittedRow });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error(error);
    return jsonResponse_({ success: false, error: "문의 저장 중 오류가 발생했습니다." });
  }
}

function parseRequest_(e) {
  if (!e) return {};
  const contentType = String((e.postData && e.postData.type) || "").toLowerCase();
  const contents = String((e.postData && e.postData.contents) || "").trim();
  if (contents && (contentType.indexOf("application/json") !== -1 || contentType.indexOf("text/plain") !== -1 || contents.charAt(0) === "{")) {
    return JSON.parse(contents);
  }
  return e.parameter || {};
}

function allowedOr_(value, allowedValues, fallback) {
  const normalized = clean_(value);
  return allowedValues.indexOf(normalized) !== -1 ? normalized : fallback;
}

function clean_(value) {
  return String(value == null ? "" : value).trim().slice(0, 5000);
}

function safeCell_(value) {
  const normalized = clean_(value);
  return /^[=+\-@]/.test(normalized) ? "'" + normalized : normalized;
}

function jsonResponse_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
