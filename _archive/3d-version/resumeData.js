/**
 * =========================================================================
 * RESUME & PORTFOLIO DATA CONFIGURATION
 * =========================================================================
 * Update your information in this file to refresh the entire portfolio!
 * Everything is organized into clear sections:
 *  - personal: Your name, titles, bio, and social links
 *  - stats: Impact metrics highlighted in the Bento Grid
 *  - skills: Categorized skills with proficiency levels and icons
 *  - experience: Work history & internships (add or edit items easily)
 *  - education: Degrees and colleges
 *  - projectsNotice: Placeholder message while you curate your projects
 * =========================================================================
 */

const resumeData = {
  personal: {
    name: "Deepanshu Lakde",
    role: "AI Engineer",
    statusBadge: "Available for Opportunities",
    tagline: "Building LLM-powered applications, RAG pipelines, and production-grade AI backends.",
    bio: "AI Engineer who turns models into reliable products. I build LLM applications, retrieval-augmented generation (RAG) pipelines, and the Python backends that serve them. Backed by a strong backend foundation in Django, FastAPI, and PostgreSQL, with hands-on experience shipping AI-driven resume parsing in production.",
    location: "Maharashtra, India",
    email: "deepanshulakde26@gmail.com",
    github: "https://github.com/deepanshu1345",
    linkedin: "https://www.linkedin.com/in/deepanshu-lakde-301b3a175",
    resumePdf: "resume.pdf"
  },

  // Key impact metrics displayed in the top Bento Grid
  stats: [
    {
      value: "30%",
      label: "Efficiency Boost",
      subtext: "Query & data optimization across enterprise HRMS modules"
    },
    {
      value: "2+",
      label: "Enterprise Platforms",
      subtext: "Contributed to Horilla HRMS & AI ResumeRefine systems"
    },
    {
      value: "10+",
      label: "Tech Stack Tools",
      subtext: "Python, LLM APIs, FastAPI, Vector DBs, PostgreSQL & MongoDB"
    },
    {
      value: "100%",
      label: "Code Dedication",
      subtext: "Committed to clean architecture and test-driven reliability"
    }
  ],

  // Skills categorized by domain with proficiency levels and icon classes
  skillsCategories: [
    { id: "all", name: "All Skills" },
    { id: "ai", name: "AI & LLMs" },
    { id: "backend", name: "Backend & APIs" },
    { id: "database", name: "Databases & Storage" },
    { id: "frontend", name: "Frontend & UI" },
    { id: "tools", name: "Tools & Frameworks" }
  ],

  skills: [
    // AI & LLMs
    { name: "LLM Apps & Prompting", category: "ai", level: 85, icon: "fas fa-robot", highlight: "Prompt Engineering" },
    { name: "RAG Pipelines", category: "ai", level: 82, icon: "fas fa-diagram-project", highlight: "Retrieval + Generation" },
    { name: "LangChain", category: "ai", level: 80, icon: "fas fa-link", highlight: "LLM Orchestration" },
    { name: "Vector Databases", category: "ai", level: 78, icon: "fas fa-vector-square", highlight: "Embeddings & Search" },
    { name: "NLP & Resume Parsing", category: "ai", level: 80, icon: "fas fa-file-lines", highlight: "Document Intelligence" },

    // Backend
    { name: "Python", category: "backend", level: 90, icon: "fab fa-python", highlight: "Primary Language" },
    { name: "Django", category: "backend", level: 88, icon: "fas fa-server", highlight: "Web & Enterprise" },
    { name: "FastAPI", category: "backend", level: 85, icon: "fas fa-bolt", highlight: "High Speed APIs" },
    { name: "Flask", category: "backend", level: 82, icon: "fas fa-pepper-hot", highlight: "Microservices" },
    { name: "Node.js", category: "backend", level: 75, icon: "fab fa-node-js", highlight: "Backend Runtime" },
    { name: "RESTful APIs", category: "backend", level: 92, icon: "fas fa-network-wired", highlight: "API Architecture" },

    // Databases
    { name: "PostgreSQL", category: "database", level: 85, icon: "fas fa-database", highlight: "Relational & Complex Queries" },
    { name: "MongoDB", category: "database", level: 82, icon: "fas fa-leaf", highlight: "NoSQL Documents" },
    { name: "MariaDB / MySQL", category: "database", level: 84, icon: "fas fa-database", highlight: "Transactional Storage" },

    // Frontend
    { name: "JavaScript (ES6+)", category: "frontend", level: 86, icon: "fab fa-js", highlight: "Modern Scripts" },
    { name: "React.js", category: "frontend", level: 80, icon: "fab fa-react", highlight: "Component Interfaces" },
    { name: "HTML5 / CSS3", category: "frontend", level: 90, icon: "fab fa-html5", highlight: "Responsive Layouts" },

    // Tools & Frameworks
    { name: "Frappe Framework", category: "tools", level: 85, icon: "fas fa-cubes", highlight: "ERP & HRMS Systems" },
    { name: "Git & GitHub", category: "tools", level: 88, icon: "fab fa-git-alt", highlight: "Version Control" },
    { name: "Postman", category: "tools", level: 86, icon: "fas fa-vial", highlight: "API Testing & Docs" },
    { name: "Linux / Bash", category: "tools", level: 80, icon: "fab fa-linux", highlight: "Environment & CLI" }
  ],

  // Experience timeline (placeholder friendly: easily add/edit your newest role)
  experience: [
    {
      id: "exp-1",
      company: "Assimilate Technologies",
      role: "Backend Developer Intern",
      period: "Jan 2025 - Jun 2025",
      badge: "Recent Experience",
      location: "Pune / Remote",
      description: "Focused on core backend architecture, API integrations, and database performance optimization for enterprise platforms.",
      highlights: [
        "Designed and integrated core modules in Horilla HRMS and the ResumeRefine AI platform using Django and Frappe, boosting data efficiency across enterprise features by 30%.",
        "Engineered scalable backend workflows for critical HRMS operations including employee transfers, structured interview feedback ratings, and automated resume parsing.",
        "Optimized complex relational queries in PostgreSQL and MongoDB, significantly reducing API response latency.",
        "Constructed and documented robust RESTful endpoints facilitating seamless frontend-backend data synchronization."
      ],
      skillsUsed: ["Python", "Django", "Frappe Framework", "PostgreSQL", "MongoDB", "REST APIs"]
    },
    {
      id: "exp-2",
      company: "Signmus Technologies",
      role: "Software Developer Intern",
      period: "Jul 2024 - Dec 2024",
      badge: "Internship",
      location: "Amravati, India",
      description: "Contributed to full-stack web applications with an emphasis on responsive design, performance, and API integration.",
      highlights: [
        "Developed dynamic, accessible user interfaces utilizing React.js and modern JavaScript standards.",
        "Implemented RESTful backend communication endpoints using Node.js for smooth data exchange.",
        "Hardened application security and streamlined page rendering performance through rigorous code optimization.",
        "Participated in Agile sprints, code reviews, and collaborated across cross-functional engineering teams."
      ],
      skillsUsed: ["React.js", "Node.js", "JavaScript", "REST APIs", "UI/UX Optimization"]
    }
    // You can easily duplicate this block to add your latest role!
  ],

  // Education background
  education: [
    {
      degree: "Master of Computer Applications (MCA)",
      institution: "PR Pote Patil Institute of Engineering and Management",
      location: "Amravati, Maharashtra",
      period: "2023 - 2025",
      details: "Advanced software engineering, database management systems, cloud computing, and full-stack development."
    },
    {
      degree: "Bachelor of Computer Applications (BCA)",
      institution: "Sant Gadge Baba Amravati University",
      location: "Amravati, Maharashtra",
      period: "2020 - 2023",
      details: "Core computer science fundamentals, data structures, algorithms, object-oriented programming, and web technologies."
    }
  ],

  // Projects notice placeholder as requested
  projectsPlaceholder: {
    title: "Curating Latest Projects",
    status: "In Active Review",
    message: "Currently curating featured AI projects, including LLM apps and RAG systems. Explore my active repositories on GitHub in the meantime!",
    githubLink: "https://github.com/deepanshu1345",
    tags: ["LLM Applications", "RAG Systems", "AI Backends", "NLP"]
  }
};

// Export for module systems or attach to global window
if (typeof module !== "undefined" && module.exports) {
  module.exports = resumeData;
} else if (typeof window !== "undefined") {
  window.resumeData = resumeData;
}
