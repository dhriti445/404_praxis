import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";

import { ComplianceReport } from "../models/ComplianceReport.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fallbackFilePath = path.resolve(__dirname, "../data/reports.json");

async function ensureFallbackFile() {
  await fs.mkdir(path.dirname(fallbackFilePath), { recursive: true });

  try {
    await fs.access(fallbackFilePath);
  } catch {
    await fs.writeFile(fallbackFilePath, "[]", "utf8");
  }
}

async function readFallbackReports() {
  await ensureFallbackFile();
  const raw = await fs.readFile(fallbackFilePath, "utf8");

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeFallbackReports(reports) {
  await ensureFallbackFile();
  await fs.writeFile(fallbackFilePath, JSON.stringify(reports, null, 2), "utf8");
}

export async function saveReport(reportType, input, result) {
  const payload = { reportType, input, result };

  try {
    return await ComplianceReport.create(payload);
  } catch {
    const existing = await readFallbackReports();
    const entry = {
      _id: randomUUID(),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      source: "file",
    };

    const updated = [entry, ...existing].slice(0, 200);
    await writeFallbackReports(updated);
    return entry;
  }
}

export async function listRecentReports(limit = 25, reportType = null) {
  try {
    const filter = reportType ? { reportType } : {};
    const reports = await ComplianceReport.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit);
    return {
      reports,
      source: "database",
    };
  } catch {
    const reports = await readFallbackReports();
    const filtered = reportType
      ? reports.filter((entry) => entry?.reportType === reportType)
      : reports;
    return {
      reports: filtered.slice(0, limit),
      source: "file",
    };
  }
}
