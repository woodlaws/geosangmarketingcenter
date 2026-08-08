const GOOGLE_SCRIPT_URL_PATTERN = /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/;
const { GOOGLE_SCRIPT_URL } = require("./contact-config");

module.exports = async function contactHandler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const scriptUrl = String(GOOGLE_SCRIPT_URL || "").trim();
  if (!GOOGLE_SCRIPT_URL_PATTERN.test(scriptUrl)) {
    return response.status(500).json({ ok: false, error: "Contact endpoint is not configured" });
  }

  try {
    const payload = typeof request.body === "string" ? JSON.parse(request.body) : request.body;

    if (!payload || typeof payload !== "object") {
      return response.status(400).json({ ok: false, error: "Invalid payload" });
    }

    if (String(payload.website_hidden || "").trim()) {
      return response.status(200).json({ ok: true });
    }

    if (!String(payload.name || "").trim() || !String(payload.phone || "").trim() || payload.privacyAgree !== true) {
      return response.status(400).json({ ok: false, error: "Required fields are missing" });
    }

    const upstreamResponse = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    const upstreamText = await upstreamResponse.text();
    let upstreamResult = {};

    try {
      upstreamResult = upstreamText ? JSON.parse(upstreamText) : {};
    } catch (error) {
      upstreamResult = { ok: false, error: "Invalid Apps Script response" };
    }

    if (!upstreamResponse.ok || upstreamResult.ok === false || upstreamResult.success === false) {
      console.error("Google Apps Script contact error", {
        status: upstreamResponse.status,
        error: upstreamResult.error || "Unknown error"
      });
      return response.status(502).json({ ok: false, error: "Contact storage failed" });
    }

    return response.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact API error", error);
    return response.status(500).json({ ok: false, error: "Contact submission failed" });
  }
};
