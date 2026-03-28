import { listRecentReports } from "../services/reportStore.js";

export async function listReports(req, res) {
  try {
    const { reports, source } = await listRecentReports(25);
    if (source === "file") {
      return res.json({
        reports,
        message: "Using local file storage for reports history.",
      });
    }

    return res.json({ reports });
  } catch {
    return res.json({
      reports: [],
      message: "Reports history is currently unavailable.",
    });
  }
}
