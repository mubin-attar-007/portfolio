/** /resume page chrome — section names and link labels; the facts are content/resume.ts. */
export const resumePage = {
  sections: {
    summary: { id: "summary", label: "Summary" },
    experience: { id: "experience", label: "Experience" },
    projects: { id: "projects", label: "Selected projects" },
    skills: { id: "skills", label: "Skills" },
    education: { id: "education", label: "Education" },
  },
  toc: "On this page",
  contact: { email: "Email", github: "GitHub", linkedin: "LinkedIn" },
} as const;
