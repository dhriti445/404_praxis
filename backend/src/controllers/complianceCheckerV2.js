/**
 * Enhanced Compliance Controller v2
 * Comprehensive compliance checking with multiple analysis modules
 */

import { analyzePolicyText } from "../services/compliance/policyAnalyzer.js";
import { detectDarkPatterns } from "../services/compliance/darkPatternDetector.js";
import { detectRiskAlerts } from "../services/compliance/riskAlertSystem.js";
import { generateAutoFixes } from "../services/compliance/autoFixSuggestions.js";
import { checkDataRights } from "../services/compliance/dataRightsChecker.js";
import { analyzeConsentFlow } from "../services/compliance/consentFlowAnalyzer.js";
import { detectFakePolicy } from "../services/compliance/fakePolicyDetector.js";
import { generateFixesWithAI } from "../services/aiService.js";
import { saveReport } from "../services/reportStore.js";

export async function analyzeCompliancePolicy(req, res) {
  try {
    const policyText = String(req.body?.policyText || "").trim();
    const consentFlowDescription = String(req.body?.consentFlow || "").trim();
    const role = String(req.body?.role || "startup").toLowerCase();

    if (!policyText) {
      return res.status(400).json({
        error: "Policy text is required",
      });
    }

    // Run all compliance checks in parallel
    const policyAnalysis = analyzePolicyText(policyText);
    const darkPatterns = detectDarkPatterns(policyText);
    const riskAlerts = detectRiskAlerts(policyText);
    const dataRights = checkDataRights(policyText);
    const fakePolicy = detectFakePolicy(policyText);
    
    const consentAnalysis = consentFlowDescription
      ? analyzeConsentFlow(consentFlowDescription)
      : null;

    // Generate auto fixes
    const autoFixes = generateAutoFixes(
      policyAnalysis.missingClauses,
      darkPatterns,
      riskAlerts
    );

    // Calculate overall compliance score (weighted average)
    const overallScore = Math.round(
      (policyAnalysis.score * 0.25 +
        (100 - darkPatterns.severityScore) * 0.2 +
        (100 - (riskAlerts.totalAlerts * 10)) * 0.25 +
        dataRights.complianceScore * 0.15 +
        ((consentAnalysis?.score || 100) * 0.15)) /
        1
    );

    // Determine risk level
    const riskLevel =
      overallScore >= 80
        ? "low"
        : overallScore >= 50
          ? "medium"
          : "high";

    const result = {
      // Summary
      summary: {
        overallScore: Math.max(0, Math.min(100, overallScore)),
        riskLevel,
        policyLegitimacy: fakePolicy.verdict,
        recommendation: generateRecommendation(
          overallScore,
          darkPatterns.darkPatternsFound,
          riskAlerts.criticalAlerts
        ),
      },

      // Detailed analysis
      policyAnalysis,
      darkPatterns,
      riskAlerts,
      dataRights,
      consentAnalysis,
      fakePolicy,
      autoFixes,

      // Compliance status
      compliance: {
        dpdp: {
          score: policyAnalysis.dpdp.score,
          sections: policyAnalysis.dpdp.foundSections,
          totalRequired: policyAnalysis.dpdp.totalSections,
        },
        gdpr: {
          score: policyAnalysis.gdpr.score,
          sections: policyAnalysis.gdpr.foundSections,
          totalRequired: policyAnalysis.gdpr.totalSections,
        },
      },

      // Next steps
      nextSteps: getNextSteps(
        overallScore,
        darkPatterns.darkPatternsFound,
        riskAlerts.criticalAlerts,
        autoFixes.fixes.length
      ),

      generatedAt: new Date().toISOString(),
    };

    // Save report
    try {
      await saveReport({
        type: "policy_analysis",
        input: { policyText, consentFlow: consentFlowDescription, role },
        result,
      });
    } catch (err) {
      console.warn("[compliance] Failed to save report:", err.message);
    }

    return res.json(result);
  } catch (error) {
    console.error("[compliance] analyzeCompliancePolicy error:", error);
    return res.status(500).json({
      error: error.message || "Policy analysis failed",
    });
  }
}

function generateRecommendation(score, darkPatternCount, criticalAlerts) {
  if (score >= 80 && darkPatternCount === 0 && criticalAlerts === 0) {
    return "✅ Policy is compliant. Published it with confidence.";
  } else if (score >= 60) {
    return `⚠️ Policy has issues. Address ${darkPatternCount} dark pattern(s) and ${criticalAlerts} critical alert(s) before publishing.`;
  } else {
    return `🚨 Policy needs significant work. Use Auto-Fix suggestions to improve compliance.`;
  }
}

function getNextSteps(score, darkPatterns, criticalAlerts, fixSuggestions) {
  const steps = [];

  if (darkPatterns > 0) {
    steps.push({
      priority: "urgent",
      action: "Review dark patterns",
      description: `Found ${darkPatterns} dark pattern(s). Review and remove manipulative language.`,
    });
  }

  if (criticalAlerts > 0) {
    steps.push({
      priority: "urgent",
      action: "Address critical alerts",
      description: `Found ${criticalAlerts} critical alert(s). Fix high-risk clauses.`,
    });
  }

  if (fixSuggestions > 0) {
    steps.push({
      priority: "high",
      action: "Apply auto-fix suggestions",
      description: `${fixSuggestions} auto-generated fixes available. Apply them to improve score.`,
    });
  }

  if (score < 80) {
    steps.push({
      priority: "normal",
      action: "Review and improve",
      description: "Use the compliance checker dashboard to see what's missing.",
    });
  }

  steps.push({
    priority: "normal",
    action: "Legal review",
    description: "Have a lawyer review the final policy before publishing.",
  });

  return steps;
}
