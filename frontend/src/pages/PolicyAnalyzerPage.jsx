import { useState } from "react";
import { Upload } from "lucide-react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import ResultReport from "../components/ResultReport";
import LoadingPulse from "../components/LoadingPulse";
import { analyzePolicy } from "../services/api";

GlobalWorkerOptions.workerSrc = pdfWorker;

const MAX_POLICY_TEXT_CHARS = 120000;

export default function PolicyAnalyzerPage() {
  const [policyText, setPolicyText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileMeta, setFileMeta] = useState(null);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const extractTextFromPdf = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => (typeof item.str === "string" ? item.str : ""))
        .join(" ");
      pages.push(text);
    }

    return pages.join("\n").trim();
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setError("Only PDF files are allowed.");
      setPolicyText("");
      setFileName("");
      setFileMeta(null);
      return;
    }

    setUploading(true);
    setError("");
    setWarning("");

    try {
      const text = await extractTextFromPdf(file);
      if (!text) {
        setError("Could not extract text from this PDF.");
        setPolicyText("");
        setFileName("");
        setFileMeta(null);
        return;
      }

      const normalizedText = text.trim();
      const truncatedText = normalizedText.slice(0, MAX_POLICY_TEXT_CHARS);

      if (normalizedText.length > MAX_POLICY_TEXT_CHARS) {
        setWarning(
          `This PDF is very large, so only the first ${MAX_POLICY_TEXT_CHARS.toLocaleString()} characters will be analyzed.`
        );
      }

      setPolicyText(truncatedText);
      setFileName(file.name);
      setFileMeta({
        fileName: file.name,
        fileType: file.type || "application/pdf",
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
      });
    } catch {
      setError("Failed to read PDF. Please upload a text-based PDF file.");
      setPolicyText("");
      setFileName("");
      setFileMeta(null);
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    if (!policyText.trim()) {
      setError("Upload a PDF with readable text before analyzing.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await analyzePolicy({
        policyText,
        fileName: fileMeta?.fileName || null,
        fileType: fileMeta?.fileType || null,
        fileSize: fileMeta?.fileSize || null,
        uploadedAt: fileMeta?.uploadedAt || null,
      });
      setResult(data);
    } catch (err) {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.error;

      if (status === 413) {
        setError("The uploaded PDF content is too large to analyze. Try a smaller PDF.");
      } else if (status === 408 || err?.code === "ECONNABORTED") {
        setError("Analysis timed out. Try a smaller PDF or try again in a moment.");
      } else if (typeof serverMessage === "string" && serverMessage.trim()) {
        setError(serverMessage);
      } else {
        setError("Analysis failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-300/50 bg-gradient-to-r from-slate-200/95 to-slate-300/90 p-8 shadow-xl shadow-slate-900/5 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">Policy Analyzer</p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Analyze Privacy Policy PDF</h1>
      </div>

      <form onSubmit={handleAnalyze} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
          <Upload size={16} /> Upload Policy PDF
          <input type="file" className="hidden" accept="application/pdf,.pdf" onChange={handleFileUpload} />
        </label>
        {fileName && <p className="text-sm text-slate-600">Selected: {fileName}</p>}
        {warning && <p className="text-sm text-amber-700">{warning}</p>}
        {error && <p className="text-sm text-rose-600">{error}</p>}

        <textarea
          value={policyText}
          rows={12}
          readOnly
          placeholder="Extracted PDF text will appear here..."
          className="w-full rounded-2xl border border-slate-300 p-4 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={loading || uploading || !policyText.trim()}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-100"
        >
          Analyze Policy and Generate Fixes
        </button>
      </form>

      {uploading && <LoadingPulse text="Reading PDF text..." />}
      {loading && <LoadingPulse text="Scanning policy for compliance gaps..." />}
      <ResultReport title="Policy Analysis" report={result} strengthsKey="strengths" />
    </section>
  );
}
