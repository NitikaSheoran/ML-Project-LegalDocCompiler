📄 Legal Document Analyzer (PDF → Key Clause Extraction)
🧠 Overview

Legal Document Analyzer is an ML-powered application that analyzes legal PDF documents and automatically extracts answers to 42 critical legal clauses commonly required for contract review, compliance, and due diligence.

Users upload a legal document (PDF), which is processed by an NLP/ML model trained for question–answering over legal text. The system scans the document and displays:

✅ Extracted answer (if found)

❌ “Not Found” (if the clause is missing)

This tool significantly reduces manual effort in reviewing lengthy legal agreements.

🎯 Key Features

📑 Upload legal PDF documents

🧠 ML-based legal question answering

⚖️ Extracts 42 high-impact legal clauses

⏱️ Fast and automated analysis

📊 Clear on-screen results (Found / Not Found)

🧩 Modular pipeline (PDF parsing → chunking → inference → display)

📌 Extracted Legal Clauses (42)

The system attempts to identify the following clauses:

Affiliate License – Licensee

Affiliate License – Licensor

Agreement Date

Anti-Assignment

Audit Rights

Cap on Liability

Change of Control

Competitive Restriction Exception

Covenant Not to Sue

Document Name

Effective Date

Exclusivity

Expiration Date

Governing Law

Insurance

IP Ownership Assignment

Irrevocable or Perpetual License

Joint IP Ownership

License Grant

Liquidated Damages

Minimum Commitment

Most Favored Nation

No-Solicit of Customers

No-Solicit of Employees

Non-Compete

Non-Disparagement

Non-Transferable License

Notice Period to Terminate Renewal

Parties

Post-Termination Services

Price Restrictions

Renewal Term

Revenue or Profit Sharing

ROFR / ROFO / ROFN

Source Code Escrow

Termination for Convenience

Third-Party Beneficiary

Uncapped Liability

Unlimited or All-You-Can-Eat License

Volume Restriction

Warranty Duration

Any Other Important Terms 




PDF Upload
   ↓
PDF Text Extraction
   ↓
Text Chunking
   ↓
Semantic Filtering (Embeddings)
   ↓
Legal QA ML Model
   ↓
Clause-wise Answer Extraction
   ↓
UI Output (Answer / Not Found)


🚀 How It Works

User uploads a legal PDF document

Text is extracted and split into overlapping chunks

Each chunk is semantically matched with predefined legal questions

The ML QA model extracts precise answers

Results are displayed:

Clause Name

Extracted Answer OR “Not Found”



🔮 Future Enhancements

📌 Confidence score per clause

🧾 Clause highlighting in original PDF

🌐 Multi-language legal documents

☁️ Cloud deployment & API access

📊 Export results as CSV / JSON
