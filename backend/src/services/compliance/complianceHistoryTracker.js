/**
 * Compliance History Tracker
 * Tracks compliance improvements over time
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const historyFile = path.join(__dirname, "../../data/compliance-history.json");

function ensureHistoryFile() {
  if (!fs.existsSync(historyFile)) {
    fs.writeFileSync(historyFile, JSON.stringify([]));
  }
}

export function saveComplianceSnapshot(analysis, label) {
  ensureHistoryFile();
  
  const history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  
  const snapshot = {
    id: `snapshot-${Date.now()}`,
    label: label || `Snapshot ${new Date().toLocaleDateString()}`,
    timestamp: new Date().toISOString(),
    score: analysis.summary?.overallScore || 0,
    riskLevel: analysis.summary?.riskLevel || "unknown",
    dpdpScore: analysis.compliance?.dpdp?.score || 0,
    gdprScore: analysis.compliance?.gdpr?.score || 0,
    darkPatterns: analysis.darkPatterns?.darkPatternsFound || 0,
    criticalAlerts: analysis.riskAlerts?.criticalAlerts || 0,
    dataRightsScore: analysis.dataRights?.complianceScore || 0,
    missingClauses: analysis.policyAnalysis?.missingClauses?.length || 0,
  };
  
  history.push(snapshot);
  
  // Keep only last 50 snapshots
  const trimmedHistory = history.slice(-50);
  fs.writeFileSync(historyFile, JSON.stringify(trimmedHistory, null, 2));
  
  return snapshot;
}

export function getComplianceHistory() {
  ensureHistoryFile();
  const history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  
  if (history.length === 0) {
    return {
      history: [],
      trend: "no-data",
      improvement: 0,
    };
  }
  
  const firstSnapshot = history[0];
  const latestSnapshot = history[history.length - 1];
  
  const improvement = latestSnapshot.score - firstSnapshot.score;
  const trend = improvement > 0 ? "improving" : improvement < 0 ? "declining" : "stable";
  
  return {
    history,
    summary: {
      totalSnapshots: history.length,
      firstSnapshot: {
        date: firstSnapshot.timestamp,
        score: firstSnapshot.score,
      },
      latestSnapshot: {
        date: latestSnapshot.timestamp,
        score: latestSnapshot.score,
      },
      improvement,
      trend,
      improvementPercentage: Math.round((improvement / firstSnapshot.score) * 100),
    },
  };
}

export function deleteSnapshot(snapshotId) {
  ensureHistoryFile();
  let history = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  
  history = history.filter((s) => s.id !== snapshotId);
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  
  return { success: true };
}

export function clearHistory() {
  fs.writeFileSync(historyFile, JSON.stringify([]));
  return { success: true };
}

export {
  saveComplianceSnapshot,
  getComplianceHistory,
  deleteSnapshot,
  clearHistory,
};
