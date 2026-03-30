import { useState } from "react";
import { BookOpen, Copy, Download, Check } from "lucide-react";

export default function PolicyGeneratorPage() {
  const [formData, setFormData] = useState({
    companyName: "",
    companyUrl: "",
    email: "",
    dataTypes: "",
    purposes: "",
    storage: "",
    thirdParties: "",
    location: "",
    hasMinors: false,
    hasEU: false,
  });

  const [generatedPolicy, setGeneratedPolicy] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleGenerate() {
    if (!formData.companyName || !formData.companyUrl) {
      alert("Please fill in company name and URL");
      return;
    }

    setIsGenerating(true);

    // Mock policy generation for now
    const mockPolicy = `<h1>Privacy Policy of ${formData.companyName}</h1>

<h2>1. Introduction</h2>
<p>This privacy policy ("Policy") governs how ${formData.companyName} ("Company", "we", "us", or "our") collects, uses, 
and protects personal data from users ("you" or "data principal") accessing ${formData.companyUrl}.</p>

<h2>2. Data We Collect</h2>
<p>We collect the following types of personal data:</p>
<ul>
<li>${formData.dataTypes || "Email address, Name, IP address"}</li>
</ul>

<h2>3. Purposes of Data Processing</h2>
<p>We process personal data for the following purposes:</p>
<ul>
<li>${formData.purposes || "Providing services, Improving user experience, Complying with legal obligations"}</li>
</ul>

<h2>4. Legal Basis</h2>
<p>Under GDPR and DPDP Act, we process data based on:</p>
<ul>
<li>Your explicit consent</li>
<li>Fulfillment of a contract with you</li>
<li>Compliance with legal obligations</li>
<li>Protection of vital interests</li>
</ul>

<h2>5. Data Retention</h2>
<p>We retain personal data for:</p>
<ul>
<li>${formData.storage || "2 years or until account deletion"}</li>
</ul>
<p>After retention periods, we securely delete all personal data.</p>

<h2>6. Your Rights</h2>
<p>Under GDPR and DPDP Act 2023, you have the following rights:</p>
<ul>
<li><strong>Right to Access:</strong> Request a copy of your personal data</li>
<li><strong>Right to Rectification:</strong> Correct inaccurate data</li>
<li><strong>Right to Erasure:</strong> Request deletion of your data (Right to be Forgotten)</li>
<li><strong>Right to Data Portability:</strong> Receive your data in machine-readable format</li>
<li><strong>Right to Object:</strong> Object to specific processing activities</li>
<li><strong>Right to Lodge a Complaint:</strong> File complaints with data protection authorities</li>
</ul>

<p>To exercise any of these rights, contact us at ${formData.email || "privacy@" + formData.companyUrl}</p>

<h2>7. Data Sharing</h2>
<p>We share personal data with the following third parties:</p>
<ul>
<li>${formData.thirdParties || "None"}</li>
</ul>
<p>All third parties are contractually obligated to protect your data.</p>

<h2>8. Security Measures</h2>
<p>We implement the following security measures:</p>
<ul>
<li>256-bit SSL/TLS encryption for data in transit</li>
<li>Encrypted storage at rest</li>
<li>Role-based access control</li>
<li>Regular security audits and penetration testing</li>
<li>Incident response procedures</li>
</ul>

<h2>9. International Transfers</h2>
${
  formData.hasEU
    ? `<p>As data is transferred internationally, we rely on Standard Contractual Clauses (SCCs) and Data Transfer Impact Assessments as approved by regulators.</p>`
    : "<p>Data is primarily stored within India.</p>"
}

<h2>10. Minors' Data</h2>
${
  formData.hasMinors
    ? `<p>For users under 18 years, we require verifiable parental consent before processing personal data. 
We do not use minors' data for behavioral profiling or direct marketing.</p>`
    : "<p>Our services are not intended for users under 18 years.</p>"
}

<h2>11. Grievance Redressal</h2>
<p>If you have concerns regarding your privacy, contact our Data Protection Officer:</p>
<ul>
<li>Email: ${formData.email || "privacy@" + formData.companyUrl}</li>
<li>Address: ${formData.location || "To be provided"}</li>
</ul>
<p>We respond to all grievances within 30 days of receipt.</p>

<h2>12. Breach Notification</h2>
<p>In case of a personal data breach, we will notify affected individuals within 72 hours of discovery, 
as per GDPR requirements.</p>

<h2>13. Policy Updates</h2>
<p>We may update this policy from time to time. We will notify you of any material changes via email.</p>

<p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>`;

    setGeneratedPolicy(mockPolicy);
    setIsGenerating(false);
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(generatedPolicy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 p-8 shadow-xl shadow-slate-900/5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
          Automated Legal Drafting
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Privacy Policy Generator</h1>
        <p className="mt-4 max-w-2xl text-slate-700">
          Enter your app details and we'll generate a GDPR & DPDP-compliant privacy policy. Then use our 
          Compliance Analyzer to verify it before publishing.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm space-y-4 h-fit">
          <h2 className="text-xl font-bold text-slate-900">App Information</h2>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">Company Name *</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              placeholder="e.g., Acme Corp"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {/* Website URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">Website URL *</label>
            <input
              type="url"
              name="companyUrl"
              value={formData.companyUrl}
              onChange={handleInputChange}
              placeholder="e.g., example.com"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">Privacy Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="privacy@example.com"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {/* Data Types */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">Types of Data Collected</label>
            <textarea
              name="dataTypes"
              value={formData.dataTypes}
              onChange={handleInputChange}
              placeholder="e.g., Email, Name, IP Address, Usage Analytics"
              rows="2"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {/* Purposes */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">Data Purposes</label>
            <textarea
              name="purposes"
              value={formData.purposes}
              onChange={handleInputChange}
              placeholder="e.g., Authentication, Analytics, Marketing"
              rows="2"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {/* Retention */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">Data Retention Period</label>
            <input
              type="text"
              name="storage"
              value={formData.storage}
              onChange={handleInputChange}
              placeholder="e.g., 2 years after account deletion"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {/* Third Parties */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">Third-party Processors</label>
            <textarea
              name="thirdParties"
              value={formData.thirdParties}
              onChange={handleInputChange}
              placeholder="e.g., Stripe (payments), AWS (hosting), SendGrid (email)"
              rows="2"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-slate-700">Company Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., India, USA"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 placeholder-slate-400 focus:border-slate-900 focus:outline-none"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="hasMinors"
                checked={formData.hasMinors}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">App serves users under 18</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="hasEU"
                checked={formData.hasEU}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">Serves EU residents (GDPR applies)</span>
            </label>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !formData.companyName || !formData.companyUrl}
            className="w-full rounded-lg bg-purple-600 px-4 py-3 font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
          >
            {isGenerating ? "🔄 Generating..." : "✨ Generate Privacy Policy"}
          </button>
        </div>

        {/* Generated Policy */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {generatedPolicy ? (
            <>
              <div className="flex items-center justify-between gap-2 mb-4">
                <h2 className="text-xl font-bold text-slate-900">Generated Policy</h2>
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <button className="rounded-lg bg-slate-100 p-2 hover:bg-slate-200">
                    <Download size={16} />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto rounded-lg bg-slate-50 p-4 text-sm text-slate-800">
                <div dangerouslySetInnerHTML={{ __html: generatedPolicy }} />
              </div>

              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <p className="text-sm text-blue-900">
                  ✨ Use the Compliance Analyzer to verify this policy before publishing!
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen size={48} className="text-slate-300 mb-4" />
              <p className="text-slate-600">Fill in the form and click "Generate Privacy Policy" to create a compliant policy</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
