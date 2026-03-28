import mongoose from "mongoose";

const complianceReportSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      enum: ["compliance", "policy", "chat"],
      required: true,
    },
    input: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

export const ComplianceReport = mongoose.model(
  "ComplianceReport",
  complianceReportSchema
);
