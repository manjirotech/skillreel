export const QUESTIONS = [
  "Can you give us a brief introduction about yourself?",
  "What is your current job title and what does your role involve?",
  "What is the average salary for this job role in your country?",
  "What skill sets are required to get into this job?",
  "Which domains or industries can someone work in with this job title?",
  "Where did you study? Which university, program, and state?",
  "How long did it take for you to clear your education loan?",
  "Do you think there are good career opportunities in this field in your country?",
  "Did you have any prior work experience or internships before getting this role?",
  "Is this job suitable for fresh graduates, or do companies prefer candidates with experience?",
]

// Questions that can be skipped (5th and 7th questions - indices 4 and 6)
export const OPTIONAL_QUESTIONS = [4, 6] // Index 4 and 6 correspond to questions 5 and 7

// Question icons mapping
export const QUESTION_ICONS = {
  0: "UserRound", // Introduction
  1: "Briefcase", // Job title
  2: "DollarSign", // Salary
  3: "Lightbulb", // Skills
  4: "Building", // Industries (optional)
  5: "GraduationCap", // Education
  6: "Clock", // Loan (optional)
  7: "TrendingUp", // Opportunities
  8: "History", // Experience
  9: "Users", // Fresh graduates
}

export const ROLES = [
  "Student",
  "Software Engineer",
  "Nurse",
  "Teacher",
  "Designer",
  "Marketing Professional",
  "Sales Representative",
  "Data Analyst",
  "Project Manager",
  "Other",
]

export const COUNTRIES = [
  { name: "United States", code: "+1" },
  { name: "Canada", code: "+1" },
  { name: "United Kingdom", code: "+44" },
  { name: "Australia", code: "+61" },
  { name: "Germany", code: "+49" },
  { name: "France", code: "+33" },
  { name: "India", code: "+91" },
  { name: "Japan", code: "+81" },
  { name: "Brazil", code: "+55" },
  { name: "Mexico", code: "+52" },
  { name: "Netherlands", code: "+31" },
  { name: "Spain", code: "+34" },
  { name: "Italy", code: "+39" },
  { name: "South Korea", code: "+82" },
  { name: "Singapore", code: "+65" },
  { name: "Other", code: "" },
]

export const getCountryCode = (countryName: string): string => {
  const country = COUNTRIES.find((c) => c.name === countryName)
  return country?.code || ""
}
