/**
 * Website Compliance Checker Controller
 */

import { checkWebsiteCompliance } from "../services/compliance/websiteComplianceChecker.js";
import { saveReport } from "../services/reportStore.js";

export async function checkWebsite(req, res) {
  try {
    const url = String(req.body?.url || "").trim();

    if (!url) {
      return res.status(400).json({
        error: "Website URL is required",
      });
    }

    // Validate URL
    let urlToCheck = url;
    if (!url.startsWith("http")) {
      urlToCheck = "https://" + url;
    }

    let parsedUrl;
    try {
      parsedUrl = new URL(urlToCheck);
    } catch {
      return res.status(400).json({
        error: "Invalid URL provided",
      });
    }

    const result = await checkWebsiteCompliance(parsedUrl.href);

    // Save report
    try {
      await saveReport({
        type: "website_compliance",
        input: { url: parsedUrl.href },
        result,
      });
    } catch (err) {
      console.warn("[website-checker] Failed to save report:", err.message);
    }

    return res.json(result);
  } catch (error) {
    console.error("[website-checker] Error:", error);
    return res.status(500).json({
      error: error.message || "Website analysis failed",
    });
  }
}
