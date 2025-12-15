import React, { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// 1. FIX: Set workerSrc (keeps pdfjs quiet). If you later use a real worker, update this path.
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [prompt, setPrompt] = useState("");
  const [compiled, setCompiled] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  const MAX_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
  const TEXT_CHAR_LIMIT = 200_000; // Cap on text to extract and send

  const reset = () => {
    setFile(null);
    setFilename("");
    setCompiled("");
    setError("");
    setLoading(false);
  };

  const handleFile = (f) => {
    if (!f) return;
    reset(); // Clear previous state on new file upload/drop
    if (f.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setError(`File too large. Max ${MAX_SIZE_BYTES / (1024 * 1024)} MB allowed.`);
      return;
    }
    setFile(f);
    setFilename(f.name);
  };

  const onInputChange = (e) => {
    const f = e.target.files?.[0];
    handleFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.remove("ring-2", "ring-offset-2");
    const f = e.dataTransfer.files?.[0];
    handleFile(f);
  };

  // Drag handlers for UI feedback
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.add("ring-2", "ring-offset-2");
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropRef.current?.classList.remove("ring-2", "ring-offset-2");
  };

  // Use the env var name you already have in .env.local
  const MODEL_API_URL = import.meta.env.VITE_OPENAI_API_URL || "/api/model-proxy";
  // NOTE: Do NOT put your secret key in client code for production. For temp testing we read it below.
  const MODEL_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  // Use the local path from conversation history (tooling will convert it to a usable URL)
  const FALLBACK_LOCAL_FILE = "/mnt/data/752d74b6-6ab5-4aac-a99a-784e23d958d5.png";

  const sendToModel = async () => {
  if (!file) {
    console.warn("No uploaded file — using fallback local path for testing.");
  }

  setLoading(true);
  setError("");
  setCompiled("");

  try {
    if (!MODEL_API_URL || !MODEL_API_KEY) {
      throw new Error("Missing VITE_OPENAI_API_URL or VITE_OPENAI_API_KEY in .env.local");
    }

    let extractedText = "";

    if (file) {
      // Extract text without worker
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer,
        disableWorker: true,
      }).promise;

      const pageTextPromises = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        pageTextPromises.push(
          pdf.getPage(p).then(async (page) => {
            const content = await page.getTextContent();
            return content.items
              .map((item) => item.str || "")
              .filter((s) => s.trim().length > 0)
              .join(" ");
          })
        );
      }

      const pageTexts = await Promise.all(pageTextPromises);
      extractedText = pageTexts.join("\n\n");

      if (extractedText.length > TEXT_CHAR_LIMIT) {
        extractedText = extractedText.slice(0, TEXT_CHAR_LIMIT) + "\n\n[TEXT TRUNCATED]";
      }
    }

    // Compose prompt + extracted text (combinedInput)
    const userPrompt = (prompt || "You are reviewing a legal contract. Read the full content of the provided PDF and answer ALL of the following 42 contract-review questions. For each item: extract the exact clause(s) or text from the contract related to the topic; if the topic is not present, write 'Not found.' Keep each answer short (3–5 lines) and only highlight relevant text. Do not explain, only quote. Answer in this exact numbered format: 1. Affiliate License – Licensee 2. Affiliate License – Licensor 3. Agreement Date 4. Anti-Assignment 5. Audit Rights 6. Cap on Liability 7. Change of Control 8. Competitive Restriction Exception 9. Covenant Not to Sue 10. Document Name 11. Effective Date 12. Exclusivity 13. Expiration Date 14. Governing Law 15. Insurance 16. IP Ownership Assignment 17. Irrevocable or Perpetual License 18. Joint IP Ownership 19. License Grant 20. Liquidated Damages 21. Minimum Commitment 22. Most Favored Nation 23. No-Solicit of Customers 24. No-Solicit of Employees 25. Non-Compete 26. Non-Disparagement 27. Non-Transferable License 28. Notice Period to Terminate Renewal 29. Parties 30. Post-Termination Services 31. Price Restrictions 32. Renewal Term 33. Revenue or Profit Sharing 34. ROFR / ROFO / ROFN 35. Source Code Escrow 36. Termination for Convenience 37. Third-Party Beneficiary 38. Uncapped Liability 39. Unlimited or All-You-Can-Eat License 40. Volume Restriction 41. Warranty Duration 42. Any Other Important Terms.").trim();


    const combinedInput =
      extractedText
        ? `${userPrompt}\n\n--- PDF DOCUMENT TEXT START ---\n\n${extractedText}\n\n--- PDF DOCUMENT TEXT END ---`
        : `${userPrompt}\n\nPlease compile the file available at the following path: ${FALLBACK_LOCAL_FILE}`;

    // Build Gemini request body (contents/parts). If no extractedText, include the local path as a file_url part
    const parts = [{ text: combinedInput }];

    // Per your tooling instruction: when no uploaded file, include the local path so the tool can transform it.
    if (!extractedText) {
      parts.push({ type: "input_file", file_url: FALLBACK_LOCAL_FILE });
    }

    const body = {
      contents: [
        {
          role: "user",
          parts,
        },
      ],
    };

    // Gemini Pro expects the key as a query param, not an Authorization header
    const url = `${MODEL_API_URL}?key=${MODEL_API_KEY}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Model API error: ${res.status} ${txt}`);
    }

    const data = await res.json();

    // Parse Gemini-like response:
    // Try several common shapes:
    // 1) data.candidates[0].content.parts[0].text
    // 2) data.candidates[0].output[0].content.parts[0].text
    // 3) fallback to data.output_text / data.result / stringify
    let compiledText = "";

    try {
      compiledText =
        data?.candidates?.[0]?.content?.[0]?.parts?.[0]?.text ||
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.candidates?.[0]?.output?.[0]?.content?.parts?.[0]?.text ||
        data?.output_text ||
        data?.compiled_text ||
        data?.text ||
        data?.result ||
        "";
    } catch (e) {
      compiledText = "";
    }

    if (!compiledText) {
      // Last resort: stringify whole response for debugging
      compiledText = JSON.stringify(data, null, 2);
    }

    setCompiled(compiledText.trim());
  } catch (err) {
    console.error(err);
    setError(err?.message || "Something went wrong while sending the PDF.");
  } finally {
    setLoading(false);
  }
};

  const downloadCompiled = () => {
    if (!compiled) return;
    const blob = new Blob([compiled], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (filename ? filename.replace(/\.pdf$/i, "") : "compiled") + "-compiled.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 md:p-10">
        <header className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">PDF → Compiled Version 📄</h1>
            <p className="text-sm text-slate-500 mt-1">Upload or drag & drop a PDF. The extracted text will be sent to the ML model for compilation.</p>
          </div>
          <div className="text-right"></div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Upload the legal pdf to get answer of important information from document.</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Summarize the main arguments and list all key information mentioned in the document in concise and readable manner."
              className="w-full h-28 p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
            />

            <div
              ref={dropRef}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              className="mt-4 flex items-center justify-center h-36 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 transition duration-150 ease-in-out cursor-pointer"
              onClick={() => inputRef.current?.click()}
            >
              <div className="text-center px-4">
                <p className="text-sm text-slate-600">Drag & drop PDF here or</p>
                <button
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ease-in-out"
                >
                  Browse files
                </button>
                <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={onInputChange} />
                <p className="mt-2 text-xs text-slate-400">Max 15 MB • PDF only</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-600">Selected:</p>
                <p className={`font-medium truncate ${file ? 'text-slate-800' : 'text-slate-400'}`}>{filename || "No file chosen"}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={reset}
                  className="px-3 py-1 text-sm rounded-md border border-slate-200 bg-white hover:bg-slate-50 transition duration-150 ease-in-out"
                >
                  Clear
                </button>
                <button
                  onClick={sendToModel}
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-green-600 text-white font-medium shadow hover:bg-green-700 disabled:opacity-50 transition duration-150 ease-in-out"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                      Processing...
                    </span>
                  ) : "Send to Model"}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-sm text-red-700 rounded-lg border border-red-200">{error}</div>
            )}

            <div className="mt-6 text-xs text-slate-400">
              {/* <strong className="text-slate-600">Note:</strong> For production, replace the client-side API call with a secure server-side proxy to protect your API keys. */}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Compiled Output</label>
            <div className="h-72 p-4 rounded-lg border border-slate-200 bg-white overflow-auto shadow-inner">
              {loading && (
                <div className="flex items-center justify-center h-full text-indigo-600">
                  <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span className="ml-3 font-medium">Extracting and Compiling...</span>
                </div>
              )}

              {!loading && !compiled && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <p className="mb-2">Awaiting Compilation ✨</p>
                  <p className="text-xs text-center">After submitting, the compiled text returned by your model will appear here.</p>
                </div>
              )}

              {!loading && compiled && (
                <pre className="whitespace-pre-wrap text-sm text-slate-800 font-sans">{compiled}</pre>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={downloadCompiled}
                disabled={!compiled || loading}
                className="px-3 py-1 rounded-md border border-slate-200 bg-white text-sm hover:bg-slate-50 disabled:opacity-50 transition duration-150 ease-in-out"
              >
                Download TXT
              </button>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(compiled);
                  alert("Compiled text copied to clipboard!");
                }}
                disabled={!compiled || loading}
                className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 transition duration-150 ease-in-out"
              >
                Copy Output
              </button>

              <button
                onClick={() => setCompiled("")}
                disabled={!compiled || loading}
                className="px-3 py-1 rounded-md border border-slate-200 bg-white text-sm hover:bg-slate-50 disabled:opacity-50 transition duration-150 ease-in-out"
              >
                Clear Output
              </button>
            </div>

            <div className="mt-6 text-xs text-slate-400">
              {/* <strong className="text-slate-600">Context:</strong> Text extraction uses `pdfjs-dist` client-side, then sends the text and your prompt to the model endpoint configured in `.env.local`. */}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
