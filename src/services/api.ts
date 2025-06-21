interface ResumeAnalysis {
  skills: string[];
  experience: string[];
  education: string[];
  summary: string;
  mlAnalysis?: {
    description: string;
    keyStrengths: string[];
    suggestedImprovements: string[];
    industryFit: string[];
    experienceLevel: "Entry" | "Mid" | "Senior" | "Executive";
    confidenceScore: number;
  };
  contact?: {
    email?: string;
    phone?: string;
    name?: string;
  };
  rawText?: string;
}

interface JobMatch {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  suggestions: {
    title: string;
    description: string;
    example?: string;
  }[];
}

class ApiService {
  private baseUrl = "/api"; // In a real app, this would be your backend URL
  private openaiApiKey = "demo-key"; // In production, this should be from environment variables

  async analyzeResume(file: File): Promise<ResumeAnalysis> {
    try {
      // Import resume parser service
      const { resumeParserService } = await import("./resumeParser");

      // Parse the resume file
      const parsedResume = await resumeParserService.parseResumeFile(file);

      // Generate ML-based description
      const mlAnalysis =
        await resumeParserService.generateMLDescription(parsedResume);

      // Return enhanced analysis
      return {
        skills: parsedResume.skills,
        experience: parsedResume.experience,
        education: parsedResume.education,
        summary: mlAnalysis.description,
        mlAnalysis: mlAnalysis,
        contact: parsedResume.contact,
        rawText: parsedResume.text,
      };
    } catch (error) {
      console.warn("Advanced resume parsing failed, using fallback:", error);
      return this.fallbackResumeAnalysis(file);
    }
  }

  private async fallbackResumeAnalysis(file: File): Promise<ResumeAnalysis> {
    // Simulate file upload and analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Enhanced mock analysis with more diverse and realistic data
    const skillSets = [
      {
        skills: [
          "JavaScript",
          "TypeScript",
          "React",
          "Node.js",
          "Python",
          "SQL",
          "Git",
          "AWS",
          "Docker",
          "REST APIs",
          "GraphQL",
          "MongoDB",
        ],
        experience: [
          "Senior Full Stack Developer at TechCorp (2021-Present) - Led development of microservices architecture serving 1M+ users",
          "Full Stack Developer at StartupXYZ (2019-2021) - Built scalable web applications using React and Node.js",
          "Junior Developer at WebAgency (2018-2019) - Developed responsive websites and REST APIs",
        ],
        education: [
          "Bachelor of Science in Computer Science - State University (2014-2018)",
          "AWS Certified Solutions Architect (2022)",
          "Google Cloud Professional Developer (2023)",
        ],
        summary:
          "This professional is a senior-level developer with extensive expertise in full-stack development. With expertise in JavaScript, TypeScript, React, Node.js, Python, they demonstrate strong capabilities in Frontend Development Expertise, Backend Development Proficiency, Cloud & DevOps Knowledge. Their background shows a progression of increasing responsibility and technical depth, making them well-suited for roles requiring both technical excellence and professional growth.",
      },
      {
        skills: [
          "Python",
          "Machine Learning",
          "TensorFlow",
          "PyTorch",
          "SQL",
          "R",
          "Pandas",
          "NumPy",
          "Scikit-learn",
          "AWS",
          "Docker",
          "Jupyter",
        ],
        experience: [
          "Senior Data Scientist at AI Solutions Inc (2020-Present) - Developed ML models improving customer retention by 25%",
          "Data Analyst at DataCorp (2018-2020) - Built predictive analytics dashboards and automated reporting systems",
          "Research Assistant at University Lab (2017-2018) - Conducted statistical analysis for academic research projects",
        ],
        education: [
          "Master of Science in Data Science - Tech University (2016-2018)",
          "Bachelor of Science in Statistics - State College (2012-2016)",
          "Google Cloud Professional Machine Learning Engineer (2021)",
        ],
        summary:
          "This professional is a senior-level data scientist with extensive expertise in machine learning and analytics. With expertise in Python, Machine Learning, TensorFlow, PyTorch, SQL, they demonstrate strong capabilities in AI & Machine Learning, Data Analysis, Cloud Computing. Their background shows a progression of increasing responsibility and technical depth, making them well-suited for roles requiring both technical excellence and data-driven insights.",
      },
      {
        skills: [
          "Java",
          "Spring Boot",
          "Microservices",
          "Kubernetes",
          "Docker",
          "PostgreSQL",
          "Redis",
          "Apache Kafka",
          "Jenkins",
          "Git",
          "AWS",
          "REST APIs",
        ],
        experience: [
          "Senior Backend Engineer at Enterprise Solutions (2019-Present) - Architected microservices handling 10M+ daily transactions",
          "Software Engineer at FinTech Startup (2017-2019) - Developed high-performance trading systems and payment processing",
          "Junior Java Developer at Corporate Systems (2016-2017) - Built enterprise applications using Spring framework",
        ],
        education: [
          "Bachelor of Engineering in Software Engineering - Engineering College (2012-2016)",
          "Oracle Certified Professional Java Developer (2018)",
          "Certified Kubernetes Administrator (2021)",
        ],
        summary:
          "This professional is a senior-level backend engineer with extensive expertise in enterprise software development. With expertise in Java, Spring Boot, Microservices, Kubernetes, Docker, they demonstrate strong capabilities in Backend Development Proficiency, Cloud & DevOps Knowledge, Enterprise Architecture. Their background shows a progression of increasing responsibility and technical depth, making them well-suited for roles requiring both technical excellence and scalable system design.",
      },
    ];

    // Randomly select a skill set to provide variety
    const selectedSkillSet =
      skillSets[Math.floor(Math.random() * skillSets.length)];

    return selectedSkillSet;
  }

  async analyzeJobMatch(
    resumeData: ResumeAnalysis,
    jobDescription: string,
  ): Promise<JobMatch> {
    // Simulate AI analysis
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Mock job matching logic
    const jobSkills = this.extractSkillsFromJobDescription(jobDescription);
    const resumeSkills = resumeData.skills;

    const matchingSkills = resumeSkills.filter((skill) =>
      jobSkills.some(
        (jobSkill) =>
          skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
          jobSkill.toLowerCase().includes(skill.toLowerCase()),
      ),
    );

    const missingSkills = jobSkills.filter(
      (jobSkill) =>
        !resumeSkills.some(
          (skill) =>
            skill.toLowerCase().includes(jobSkill.toLowerCase()) ||
            jobSkill.toLowerCase().includes(skill.toLowerCase()),
        ),
    );

    const partialSkills = ["GraphQL", "Kubernetes", "MongoDB"];

    const matchScore = Math.round(
      (matchingSkills.length /
        (matchingSkills.length + missingSkills.length + partialSkills.length)) *
        100,
    );

    const suggestions = this.generateSuggestions(missingSkills, partialSkills);

    return {
      matchScore,
      matchingSkills,
      missingSkills,
      partialSkills,
      suggestions,
    };
  }

  private extractSkillsFromJobDescription(jobDescription: string): string[] {
    // Simple skill extraction - in a real app, this would use NLP
    const commonSkills = [
      "JavaScript",
      "TypeScript",
      "React",
      "Vue",
      "Angular",
      "Node.js",
      "Python",
      "Java",
      "C#",
      "PHP",
      "Ruby",
      "Go",
      "Rust",
      "SQL",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Redis",
      "AWS",
      "Azure",
      "GCP",
      "Docker",
      "Kubernetes",
      "Git",
      "CI/CD",
      "Jenkins",
      "GraphQL",
      "REST",
      "HTML",
      "CSS",
      "Sass",
      "Tailwind",
      "Bootstrap",
    ];

    return commonSkills.filter((skill) =>
      jobDescription.toLowerCase().includes(skill.toLowerCase()),
    );
  }

  private generateSuggestions(
    missingSkills: string[],
    partialSkills: string[],
  ) {
    const suggestions = [];

    // Enhanced suggestions with more variety and specificity
    if (missingSkills.length > 0) {
      const skill = missingSkills[0];
      const skillSuggestions = {
        AWS: {
          title: "Gain AWS Cloud Experience",
          description:
            "AWS is a critical skill for this role. Consider getting certified and building cloud projects.",
          example:
            "Migrated legacy applications to AWS, reducing infrastructure costs by 40% and improving scalability using EC2, S3, and Lambda services.",
        },
        Docker: {
          title: "Learn Containerization with Docker",
          description:
            "Docker containerization is essential for modern development workflows.",
          example:
            "Containerized microservices using Docker, reducing deployment time by 60% and ensuring consistent environments across development and production.",
        },
        Kubernetes: {
          title: "Master Container Orchestration",
          description:
            "Kubernetes skills are highly valued for managing containerized applications at scale.",
          example:
            "Orchestrated containerized applications using Kubernetes, managing 50+ microservices with automated scaling and zero-downtime deployments.",
        },
        GraphQL: {
          title: "Add GraphQL API Experience",
          description:
            "GraphQL is becoming the preferred API technology for modern applications.",
          example:
            "Implemented GraphQL APIs reducing data over-fetching by 70% and improving mobile app performance significantly.",
        },
        TypeScript: {
          title: "Strengthen TypeScript Skills",
          description:
            "TypeScript is essential for large-scale JavaScript applications.",
          example:
            "Migrated JavaScript codebase to TypeScript, reducing runtime errors by 80% and improving developer productivity through better IDE support.",
        },
      };

      const suggestion = skillSuggestions[skill] || {
        title: `Add ${skill} experience`,
        description: `The job requires ${skill} which is missing from your resume.`,
        example: `Developed applications using ${skill} to improve system performance by 30%.`,
      };

      suggestions.push(suggestion);
    }

    if (partialSkills.length > 0) {
      const skill = partialSkills[0];
      suggestions.push({
        title: `Expand ${skill} expertise`,
        description: `You have some ${skill} experience, but demonstrating deeper knowledge would strengthen your profile.`,
        example: `Built enterprise-grade solutions using ${skill}, handling 10,000+ concurrent users and processing 1M+ daily transactions.`,
      });
    }

    // Add more diverse suggestions
    const additionalSuggestions = [
      {
        title: "Quantify your achievements with metrics",
        description:
          "Add specific numbers and percentages to demonstrate your impact and results.",
        example:
          "Led a cross-functional team of 8 developers to deliver a critical project 3 weeks ahead of schedule, resulting in $500K cost savings and 25% performance improvement.",
      },
      {
        title: "Highlight leadership and collaboration",
        description:
          "Emphasize your ability to work with teams and lead initiatives.",
        example:
          "Mentored 5 junior developers, established code review processes, and improved team productivity by 40% through knowledge sharing sessions.",
      },
      {
        title: "Showcase problem-solving abilities",
        description:
          "Demonstrate how you've solved complex technical challenges.",
        example:
          "Identified and resolved critical performance bottleneck, reducing API response time from 2.5s to 200ms, improving user satisfaction by 60%.",
      },
      {
        title: "Add relevant certifications",
        description:
          "Professional certifications validate your expertise and commitment to continuous learning.",
        example:
          "Obtained AWS Solutions Architect certification and Google Cloud Professional Developer certification to demonstrate cloud expertise.",
      },
      {
        title: "Include modern development practices",
        description:
          "Show familiarity with current industry standards and methodologies.",
        example:
          "Implemented CI/CD pipelines using Jenkins and GitLab, reducing deployment time by 75% and achieving 99.9% uptime through automated testing and monitoring.",
      },
    ];

    // Add 1-2 additional suggestions randomly
    const randomSuggestions = additionalSuggestions
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(2, 3 - suggestions.length));

    suggestions.push(...randomSuggestions);

    return suggestions.slice(0, 3); // Return max 3 suggestions
  }

  async saveAnalysis(analysis: JobMatch): Promise<void> {
    // Simulate saving to backend
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Save to localStorage for demo
    const savedAnalyses = JSON.parse(
      localStorage.getItem("skillmatch_analyses") || "[]",
    );
    savedAnalyses.push({
      ...analysis,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem("skillmatch_analyses", JSON.stringify(savedAnalyses));
  }

  async getSavedAnalyses(): Promise<(JobMatch & { timestamp: string })[]> {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    return JSON.parse(localStorage.getItem("skillmatch_analyses") || "[]");
  }

  async getSuggestedJobs(resumeData: ResumeAnalysis): Promise<SuggestedJob[]> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Enhanced job suggestions with more variety and better matching logic
    const allJobs: SuggestedJob[] = [
      // Frontend/React Jobs
      {
        id: "1",
        title: "Senior Frontend Developer",
        company: "TechCorp Inc.",
        location: "San Francisco, CA",
        salary: "$130,000 - $170,000",
        matchPercentage: 0,
        description:
          "Lead frontend development for our next-generation SaaS platform. Work with React, TypeScript, and modern web technologies to create exceptional user experiences.",
        requiredSkills: [
          "React",
          "TypeScript",
          "JavaScript",
          "CSS",
          "HTML",
          "Redux",
        ],
        url: "https://example.com/job/1",
        postedDate: "2024-01-15",
      },
      {
        id: "2",
        title: "Full Stack Engineer",
        company: "StartupXYZ",
        location: "Remote",
        salary: "$110,000 - $150,000",
        matchPercentage: 0,
        description:
          "Join our dynamic team building scalable web applications. Work across the full stack with React, Node.js, and cloud technologies.",
        requiredSkills: [
          "React",
          "Node.js",
          "JavaScript",
          "AWS",
          "MongoDB",
          "Docker",
        ],
        url: "https://example.com/job/2",
        postedDate: "2024-01-12",
      },
      {
        id: "3",
        title: "React Developer",
        company: "WebSolutions Ltd",
        location: "New York, NY",
        salary: "$95,000 - $125,000",
        matchPercentage: 0,
        description:
          "Build modern, responsive web applications with a focus on performance and user experience. Work with the latest React ecosystem.",
        requiredSkills: [
          "React",
          "JavaScript",
          "CSS",
          "Redux",
          "Git",
          "Webpack",
        ],
        url: "https://example.com/job/3",
        postedDate: "2024-01-10",
      },
      // Backend/Java Jobs
      {
        id: "4",
        title: "Senior Backend Engineer",
        company: "Enterprise Solutions",
        location: "Austin, TX",
        salary: "$125,000 - $165,000",
        matchPercentage: 0,
        description:
          "Design and implement scalable microservices architecture. Lead backend development using Java, Spring Boot, and cloud technologies.",
        requiredSkills: [
          "Java",
          "Spring Boot",
          "Microservices",
          "Kubernetes",
          "PostgreSQL",
          "AWS",
        ],
        url: "https://example.com/job/4",
        postedDate: "2024-01-08",
      },
      {
        id: "5",
        title: "Java Software Engineer",
        company: "FinTech Solutions",
        location: "Chicago, IL",
        salary: "$105,000 - $140,000",
        matchPercentage: 0,
        description:
          "Develop high-performance financial systems using Java and Spring framework. Work on mission-critical applications handling millions of transactions.",
        requiredSkills: [
          "Java",
          "Spring Boot",
          "REST APIs",
          "PostgreSQL",
          "Redis",
          "Jenkins",
        ],
        url: "https://example.com/job/5",
        postedDate: "2024-01-05",
      },
      // Data Science/ML Jobs
      {
        id: "6",
        title: "Senior Data Scientist",
        company: "AI Innovations",
        location: "Seattle, WA",
        salary: "$140,000 - $180,000",
        matchPercentage: 0,
        description:
          "Lead machine learning initiatives and build predictive models. Work with large datasets and cutting-edge ML technologies.",
        requiredSkills: [
          "Python",
          "Machine Learning",
          "TensorFlow",
          "PyTorch",
          "SQL",
          "AWS",
        ],
        url: "https://example.com/job/6",
        postedDate: "2024-01-14",
      },
      {
        id: "7",
        title: "Machine Learning Engineer",
        company: "DataTech Corp",
        location: "Boston, MA",
        salary: "$120,000 - $160,000",
        matchPercentage: 0,
        description:
          "Deploy and scale ML models in production. Work with MLOps, cloud platforms, and modern data infrastructure.",
        requiredSkills: [
          "Python",
          "TensorFlow",
          "Kubernetes",
          "Docker",
          "AWS",
          "MLOps",
        ],
        url: "https://example.com/job/7",
        postedDate: "2024-01-11",
      },
      {
        id: "8",
        title: "Data Analyst",
        company: "Analytics Plus",
        location: "Denver, CO",
        salary: "$75,000 - $95,000",
        matchPercentage: 0,
        description:
          "Analyze business data and create insights through statistical analysis and visualization. Work with SQL, Python, and BI tools.",
        requiredSkills: ["Python", "SQL", "Pandas", "NumPy", "Tableau", "R"],
        url: "https://example.com/job/8",
        postedDate: "2024-01-09",
      },
      // DevOps/Cloud Jobs
      {
        id: "9",
        title: "DevOps Engineer",
        company: "CloudFirst Inc",
        location: "Remote",
        salary: "$115,000 - $145,000",
        matchPercentage: 0,
        description:
          "Build and maintain CI/CD pipelines, manage cloud infrastructure, and ensure system reliability and scalability.",
        requiredSkills: [
          "Docker",
          "Kubernetes",
          "AWS",
          "Jenkins",
          "Terraform",
          "Git",
        ],
        url: "https://example.com/job/9",
        postedDate: "2024-01-13",
      },
      {
        id: "10",
        title: "Cloud Solutions Architect",
        company: "Enterprise Cloud",
        location: "Dallas, TX",
        salary: "$150,000 - $190,000",
        matchPercentage: 0,
        description:
          "Design cloud architecture solutions for enterprise clients. Lead cloud migration projects and optimize infrastructure costs.",
        requiredSkills: [
          "AWS",
          "Azure",
          "Kubernetes",
          "Terraform",
          "Microservices",
          "Docker",
        ],
        url: "https://example.com/job/10",
        postedDate: "2024-01-07",
      },
    ];

    // Calculate match percentages based on skill overlap
    const userSkills = resumeData.skills.map((skill) => skill.toLowerCase());

    const jobsWithMatches = allJobs.map((job) => {
      const jobSkills = job.requiredSkills.map((skill) => skill.toLowerCase());
      const matchingSkills = jobSkills.filter((jobSkill) =>
        userSkills.some(
          (userSkill) =>
            userSkill.includes(jobSkill) || jobSkill.includes(userSkill),
        ),
      );

      const matchPercentage = Math.min(
        Math.round((matchingSkills.length / jobSkills.length) * 100),
        95,
      );

      return {
        ...job,
        matchPercentage:
          matchPercentage > 0
            ? Math.max(matchPercentage, 45)
            : Math.floor(Math.random() * 30) + 35,
      };
    });

    // Filter and sort jobs by relevance
    const relevantJobs = jobsWithMatches
      .filter((job) => job.matchPercentage >= 40)
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 8); // Return top 8 matches

    return relevantJobs.length > 0 ? relevantJobs : jobsWithMatches.slice(0, 5);
  }
}

interface SuggestedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  matchPercentage: number;
  description: string;
  requiredSkills: string[];
  url: string;
  postedDate: string;
}

export const apiService = new ApiService();
export type { ResumeAnalysis, JobMatch, SuggestedJob };
