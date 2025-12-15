📄 **Legal Document Analyzer (PDF → Key Clause Extraction)**

---

🧠 **Overview**

Legal Document Analyzer is an ML-powered application that analyzes legal PDF documents and automatically extracts answers to 42 critical legal clauses commonly required for contract review and compliance.

### 🔍 **What it Does**

- Users upload a legal document (PDF), which is processed by an NLP/ML model trained for question–answering over legal text.
- The system scans the document and displays:
  - ✅ **Extracted Answer** (if found)
  - ❌ **“Not Found”** (if the clause is missing)

This tool significantly reduces manual effort in reviewing lengthy legal agreements.

---

🎯 **Key Features** 

- 📑 **Upload legal PDF documents**
- 🧠 **ML-based legal question answering**
- ⚖️ **Extracts 42 high-impact legal clauses**
- ⏱️ **Fast and automated analysis**
- 📊 **Clear on-screen results (Found / Not Found)**
- 🧩 **Modular pipeline**:
  - PDF parsing → Chunking → Inference → Display

---

📌 **Extracted Legal Clauses (42)**

The system attempts to identify the following clauses:

1. **Affiliate License – Licensee**
2. **Affiliate License – Licensor**
3. **Agreement Date**
4. **Anti-Assignment**
5. **Audit Rights**
6. **Cap on Liability**
7. **Change of Control**
8. **Competitive Restriction Exception**
9. **Covenant Not to Sue**
10. **Document Name**
11. **Effective Date**
12. **Exclusivity**
13. **Expiration Date**
14. **Governing Law**
15. **Insurance**
16. **IP Ownership Assignment**
17. **Irrevocable or Perpetual License**
18. **Joint IP Ownership**
19. **License Grant**
20. **Liquidated Damages**
21. **Minimum Commitment**
22. **Most Favored Nation**
23. **No-Solicit of Customers**
24. **No-Solicit of Employees**
25. **Non-Compete**
26. **Non-Disparagement**
27. **Non-Transferable License**
28. **Notice Period to Terminate Renewal**
29. **Parties**
30. **Post-Termination Services**
31. **Price Restrictions**
32. **Renewal Term**
33. **Revenue or Profit Sharing**
34. **ROFR / ROFO / ROFN**
35. **Source Code Escrow**
36. **Termination for Convenience**
37. **Third-Party Beneficiary**
38. **Uncapped Liability**
39. **Unlimited or All-You-Can-Eat License**
40. **Volume Restriction**
41. **Warranty Duration**
42. **Any Other Important Terms**

---

📋 **System Pipeline**:

1. **PDF Upload**
   
2. **PDF Text Extraction**
   
3. **Text Chunking**
   
4. **Semantic Filtering (Embeddings)**
   
5. **Legal QA ML Model**
   
6. **Clause-wise Answer Extraction**
   
7. **UI Output** (Answer / Not Found)

---

🚀 **How It Works**

1. **User uploads a legal PDF document**
2. **Text is extracted and split into overlapping chunks**
3. **Each chunk is semantically matched with predefined legal questions**
4. **The ML QA model extracts precise answers**
5. **Results are displayed**:
   - Clause Name
   - **Extracted Answer** OR **“Not Found”**

---

🔮 **Future Enhancements**

- 📌 **Confidence score per clause**
- 🧾 **Clause highlighting in original PDF**
- 🌐 **Multi-language legal documents**
- ☁️ **Cloud deployment & API access**
- 📊 **Export results as CSV / JSON**
