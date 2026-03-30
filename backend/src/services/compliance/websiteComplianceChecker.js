/**
 * Website Compliance Checker
 * Scrapes website and analyzes it for compliance
 */

import axios from "axios";
import { JSDOM } from "jsdom";
import { analyzePolicyText } from "./policyAnalyzer.js";
import { detectDarkPatterns } from "./darkPatternDetector.js";

export async function checkWebsiteCompliance(url) {
  try {
    // Fetch the website
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    const html = response.data;
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Extract information
    const siteTitle = doc.title || url;
    const privacyLink = findPrivacyLink(doc, url);
    const cookieBanner = detectCookieBanner(doc);
    const consentWidget = detectConsentWidget(doc);
    const forms = detectForms(doc);

    // Fetch privacy policy if found
    let policyAnalysis = null;
    if (privacyLink) {
      try {
        const policyResponse = await axios.get(privacyLink, {
          timeout: 10000,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
        const policyText = extractTextContent(policyResponse.data);
        policyAnalysis = analyzePolicyText(policyText);
      } catch (err) {
        console.warn("[website-checker] Failed to fetch privacy policy:", err.message);
      }
    }

    return {
      url,
      siteTitle,
      checkedAt: new Date().toISOString(),
      findings: {
        privacyPolicy: {
          found: !!privacyLink,
          url: privacyLink,
          analysis: policyAnalysis,
        },
        cookieBanner: {
          detected: cookieBanner.found,
          details: cookieBanner.details,
        },
        consentWidget: {
          detected: consentWidget.found,
          details: consentWidget.details,
        },
        forms: {
          count: forms.length,
          details: forms,
        },
      },
      complianceScore: calculateWebsiteScore(
        policyAnalysis,
        cookieBanner.found,
        consentWidget.found
      ),
      issues: identifyIssues(
        policyAnalysis,
        cookieBanner,
        consentWidget,
        privacyLink
      ),
      recommendations: getRecommendations(
        policyAnalysis,
        cookieBanner,
        consentWidget,
        privacyLink
      ),
    };
  } catch (error) {
    throw new Error(`Failed to check website: ${error.message}`);
  }
}

function findPrivacyLink(doc, baseUrl) {
  const links = Array.from(doc.querySelectorAll("a"));
  const privacyKeys = [
    "privacy",
    "privacy policy",
    "privacy statement",
    "data protection",
    "legal",
  ];

  for (const link of links) {
    const href = link.href || link.getAttribute("href") || "";
    const text = (link.textContent || "").toLowerCase();

    if (privacyKeys.some((key) => text.includes(key))) {
      try {
        return new URL(href, baseUrl).href;
      } catch {
        return href;
      }
    }
  }

  return null;
}

function detectCookieBanner(doc) {
  const bannerSelectors = [
    '[class*="cookie"]',
    '[id*="cookie"]',
    '[class*="consent"]',
    '[id*="consent"]',
  ];

  for (const selector of bannerSelectors) {
    const element = doc.querySelector(selector);
    if (element && element.offsetHeight > 0) {
      return {
        found: true,
        details: {
          position: getElementPosition(element),
          hasAcceptButton: !!doc.querySelector([selector, " button"].join("")),
          hasRejectButton: !!doc.querySelector([selector, " .reject, ", selector, " [aria-label*='Reject']"].join("")),
        },
      };
    }
  }

  return { found: false, details: {} };
}

function detectConsentWidget(doc) {
  // Look for common consent management platforms
  const cmpScripts = [
    "osano",
    "OneTrust",
    "Cookiebot",
    "CookieConsent",
    "iubenda",
  ];

  for (const cmp of cmpScripts) {
    if (doc.innerHTML.includes(cmp)) {
      return {
        found: true,
        details: { provider: cmp },
      };
    }
  }

  return { found: false, details: {} };
}

function detectForms(doc) {
  const forms = Array.from(doc.querySelectorAll("form"));
  return forms.map((form) => ({
    id: form.id || form.name || "unnamed",
    fields: form.querySelectorAll("input, textarea").length,
    hasConsent: form.innerHTML.toLowerCase().includes("consent") ||
      form.innerHTML.toLowerCase().includes("agree"),
  }));
}

function extractTextContent(html) {
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const scripts = doc.querySelectorAll("script, style");
  scripts.forEach((script) => script.remove());
  return doc.body.textContent || "";
}

function getElementPosition(element) {
  const rect = element.getBoundingClientRect ? element.getBoundingClientRect() : null;
  if (rect) {
    return {
      top: rect.top,
      height: rect.height,
    };
  }
  return "unknown";
}

function calculateWebsiteScore(policyAnalysis, hasCookie, hasConsent) {
  let score = 40; // Base score

  if (policyAnalysis) {
    score += policyAnalysis.score * 0.3;
  } else {
    score -= 20;
  }

  if (hasCookie) score += 15;
  if (hasConsent) score += 15;

  return Math.min(100, score);
}

function identifyIssues(policyAnalysis, cookieBanner, consentWidget, privacyLink) {
  const issues = [];

  if (!privacyLink) {
    issues.push({
      severity: "critical",
      title: "Missing Privacy Policy",
      description: "No privacy policy link found on website",
    });
  } else if (policyAnalysis && policyAnalysis.score < 50) {
    issues.push({
      severity: "high",
      title: "Weak Privacy Policy",
      description: `Privacy policy compliance score is ${policyAnalysis.score}%`,
    });
  }

  if (!cookieBanner.found) {
    issues.push({
      severity: "high",
      title: "No Cookie Banner",
      description: "Website does not show cookie consent banner",
    });
  }

  if (!consentWidget.found) {
    issues.push({
      severity: "medium",
      title: "No Consent Management Platform",
      description: "No CMP (OneTrust, Cookiebot, etc.) detected",
    });
  }

  return issues;
}

function getRecommendations(policyAnalysis, cookieBanner, consentWidget, privacyLink) {
  const recs = [];

  if (!privacyLink) {
    recs.push("Create and publish a comprehensive privacy policy linked from footer/legal");
  }

  if (!cookieBanner.found) {
    recs.push("Add a cookie consent banner with clear Accept/Reject options");
  }

  if (!consentWidget.found) {
    recs.push("Implement a consent management platform (OneTrust, Cookiebot, or similar)");
  }

  if (policyAnalysis && policyAnalysis.dpdp.score < 80) {
    recs.push("Update privacy policy to cover all DPDP Act 2023 requirements");
  }

  recs.push("Conduct regular compliance audits");

  return recs;
}
