// Single source of truth: the site and the chatbot both read from here.
// Keep it in sync with public/Deepanshu_Lakde_Resume.pdf.

export interface Experience {
  company: string;
  role: string;
  period: string;
  location: string;
  summary: string;
  highlights: string[];
  stack: string[];
}

export interface Project {
  name: string;
  tagline: string;
  description: string;
  highlights: string[];
  stack: string[];
  metric?: string; // "−35% query failures": number, then label
  flow: string[]; // architecture steps shown as a diagram
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  period: string;
}

export const profile = {
  name: "Deepanshu Lakde",
  firstName: "Deepanshu",
  role: "AI Engineer",
  tagline: "I take LLM workflows to production: multi-model orchestration, async FastAPI services and data pipelines that hold up under load.",
  bio: "AI backend engineer with ~1.5 years of experience. I build asynchronous FastAPI services, high-volume data ingestion pipelines and multi-LLM orchestration (Claude, OpenAI, Gemini) with LangGraph, and I care about what happens after the demo: cost, fallbacks, enterprise SSO and CI-tested reliability.",
  location: "Maharashtra, India",
  email: "deepanshulakde26@gmail.com",
  github: "https://github.com/deepanshu1345",
  linkedin: "https://www.linkedin.com/in/deepanshu-lakde-301b3a175",
  resumePdf: "Deepanshu_Lakde_Resume.pdf",
  available: true,
};

export const stats = [
  { value: "50K+", label: "Clinical records ingested daily", note: "Async pipeline, zero downtime" },
  { value: "−30%", label: "LLM token spend", note: "LangGraph routing & fallbacks" },
  { value: "−75%", label: "Candidate shortlisting time", note: "ERPNext AI screening plugin" },
  { value: "85%", label: "Test coverage", note: "FastAPI services in Jenkins CI" },
];

export const experience: Experience[] = [
  {
    company: "Anervea-AI",
    role: "Jr. AI Backend Engineer",
    period: "Jan 2026 – Present",
    location: "Pune, MH",
    summary: "Production LLM workflows and data pipelines for clinical data.",
    highlights: [
      "Engineered a highly concurrent asynchronous ingestion pipeline with httpx and Playwright, processing 50,000+ clinical records daily with zero downtime.",
      "Reduced LLM token consumption by 30% without losing extraction quality by orchestrating LangGraph workflows with Redis-backed state, context-aware routing and fallbacks across Claude, OpenAI and Gemini.",
      "Integrated OpenID Connect (OIDC) single sign-on for enterprise clients.",
      "Reached 85% test coverage on asynchronous FastAPI microservices with Pytest in a Jenkins CI/CD pipeline.",
    ],
    stack: ["Python", "FastAPI", "LangGraph", "Claude", "OpenAI", "Gemini", "Redis", "Playwright", "Pytest", "Jenkins"],
  },
  {
    company: "Assimilate Technologies Pvt. Ltd.",
    role: "Backend Python Intern",
    period: "Jan 2025 – Jul 2025",
    location: "Pune, MH",
    summary: "Backend performance and microservices for the Horilla HRMS platform.",
    highlights: [
      "Reduced core API latency by 25% (1100ms → 820ms) by optimizing PostgreSQL queries and adding strategic indexes in the Horilla HRMS backend.",
      "Supported 10,000+ concurrent user requests with no data-integrity incidents by building FastAPI microservices with automated validation and strict idempotency handling.",
    ],
    stack: ["Python", "FastAPI", "PostgreSQL", "Django"],
  },
];

export const projects: Project[] = [
  {
    name: "Agentic SQL Analytics Gateway",
    tagline: "Natural language → safe SQL, via multi-agent LangGraph",
    description: "A multi-agent gateway that turns plain-English questions into optimized, execution-safe PostgreSQL and pgvector query plans for self-serve analytics.",
    highlights: [
      "Multi-agent LangGraph workflow behind async FastAPI endpoints.",
      "Context-aware routing, automated schema retrieval and Claude/OpenAI fallbacks cut complex relational query failures by 35%.",
      "Multi-turn conversational state persisted in Redis; the whole gateway ships with Docker Compose.",
    ],
    stack: ["LangGraph", "FastAPI", "PostgreSQL", "pgvector", "Redis", "Docker"],
    metric: "−35% query failures",
    flow: ["NL query", "Router agent", "Schema RAG", "SQL planner", "Postgres"],
  },
  {
    name: "ERPNext AI Resume Screening Plugin",
    tagline: "Semantic candidate matching inside enterprise HR workflows",
    description: "A custom AI screening plugin deployed into an enterprise ERPNext system, so recruiters get ranked candidates without leaving their HR tools.",
    highlights: [
      "Cut candidate shortlisting time by 75% by integrating semantic matching directly into existing HR workflows.",
      "Secure Frappe REST APIs; MariaDB schemas extended to store dense vector embeddings, with strict role-based access control.",
      "PDF parsing heuristics plus Sentence Transformers and tuned cosine similarity for sub-second recommendations.",
    ],
    stack: ["Python", "Frappe", "MariaDB", "Sentence Transformers"],
    metric: "−75% shortlisting time",
    flow: ["Resume PDF", "Parser", "Embeddings", "Cosine rank", "ERPNext"],
  },
  {
    name: "Alfakinetic Competitive Intelligence Platform",
    tagline: "Scraping + structured LLM extraction at scale",
    description: "A competitive intelligence backend that collects market signals with Playwright and turns them into structured data with LLM extraction.",
    highlights: [
      "Reduced extraction latency by 40% with an asynchronous FastAPI backend orchestrating Playwright scraping and structured LLM extraction.",
      "Sub-50ms retrieval across 15 million records with a hybrid topology: PostgreSQL for relational transactions, MongoDB for high-volume unstructured signals.",
    ],
    stack: ["FastAPI", "Playwright", "PostgreSQL", "MongoDB"],
    metric: "−40% extraction latency",
    flow: ["Playwright", "Async FastAPI", "LLM extract", "PG + Mongo"],
  },
];

export const skillGroups = [
  { name: "AI & LLMs", items: ["OpenAI", "Claude", "Gemini", "LangGraph", "Agentic AI", "RAG", "Embeddings", "Voyage AI", "Prompt Engineering"] },
  { name: "Backend", items: ["Python", "FastAPI", "AsyncIO", "Flask", "Django", "REST APIs", "SQL", "JavaScript"] },
  { name: "ML, NLP & Data", items: ["PyTorch", "TensorFlow", "scikit-learn", "Sentence Transformers", "Hugging Face", "PostgreSQL", "pgvector", "Pinecone", "MongoDB", "Redis", "MySQL"] },
  { name: "Infrastructure", items: ["Docker", "Docker Compose", "Jenkins CI/CD", "AWS", "Pytest", "uv", "Git"] },
];

export const education: Education[] = [
  {
    degree: "Master of Computer Applications (MCA) · 7.99 CGPA",
    institution: "PR Pote Patil Institute of Engineering and Management",
    location: "Amravati, MH",
    period: "2023 – 2025",
  },
  {
    degree: "Bachelor of Computer Applications (BCA) · 78.75%",
    institution: "Sant Gadge Baba Amravati University",
    location: "Amravati, MH",
    period: "2020 – 2023",
  },
];
