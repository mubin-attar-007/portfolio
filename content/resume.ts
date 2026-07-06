/**
 * Résumé content — the markdown mirror of /public/Mubin_Attar_Resume.pdf.
 * Site, PDF, and LinkedIn must carry identical facts (launch checklist).
 */
export const resume = {
  summary:
    "AI/ML Engineer with 3+ years building and shipping production AI products end-to-end — GenAI/LLM applications, agentic and RAG systems, predictive ML, and healthcare-AI automation. Fluent across the stack (FastAPI, Next.js, PostgreSQL, Docker) with auth, CI/CD, and security hardening baked in.",
  skills: [
    { group: "Languages", items: "Python, JavaScript / TypeScript, SQL" },
    { group: "GenAI / LLM", items: "LangChain, LangGraph, RAG, pgvector, prompt engineering, agents, multi-provider routing (Gemini, GPT, Claude, Groq)" },
    { group: "Machine Learning", items: "scikit-learn, XGBoost, neural networks, pandas, NumPy, model training & evaluation" },
    { group: "Backend", items: "FastAPI, Django / DRF, SQLAlchemy, REST APIs, async, Argon2 auth, Playwright & Selenium automation" },
    { group: "Frontend", items: "Next.js, React, TypeScript, Tailwind CSS" },
    { group: "Data / DevOps", items: "PostgreSQL, SQL Server, Redis, Docker, AWS, GitHub Actions (CI/CD), ETL, Vercel, Hugging Face" },
    { group: "Practices", items: "MLOps, testing (pytest), OOP, DSA, secure API design, observability" },
  ],
  experience: [
    {
      role: "AI/ML Engineer",
      org: "Sevina Technologies",
      period: "2024 – present",
      place: "Ahmedabad",
      points: [
        "Build and ship production AI & automation systems for healthcare — end-to-end pipelines (Python, Playwright, Selenium) that extract, validate, and synchronize clinical data into SQL Server, with logging, reconciliation, and error recovery.",
        "Developed an AI clinical decision-support platform that turns CMS MDS assessments into interactive dashboards, compliance findings, and reimbursement insights (HIPPS/PDPM) for skilled-nursing facilities.",
        "Built Generative AI applications — LLM document-analysis assistants with multi-provider routing (OpenAI, Claude, Gemini), RAG, and validated structured output — plus a FastAPI eligibility-verification service with async batch processing and CI/CD.",
      ],
    },
    {
      role: "Junior Python Developer",
      org: "Linescripts Software Pvt Ltd",
      period: "2022 – 2024",
      place: "Pune",
      points: [
        "Delivered end-to-end web applications — a Hospital Management System and e-commerce platforms — with Python, Django & DRF, and responsive frontends.",
        "Built RESTful APIs and backend services, integrated third-party APIs, and collaborated cross-functionally on requirements, design, and testing.",
      ],
    },
  ],
  education: {
    degree: "Master of Computer Applications (MCA)",
    school: "Savitribai Phule University of Pune",
    year: "2021 · CGPA 8.0",
  },
  pdf: "/Mubin_Attar_Resume.pdf",
} as const;
