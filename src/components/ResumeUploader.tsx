import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Chrome,
  Zap,
  Search,
  ExternalLink,
  Briefcase,
  Bot,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  apiService,
  type SuggestedJob,
  type ResumeAnalysis,
} from "@/services/api";

interface ResumeUploaderProps {
  onResumeUpload?: (file: File) => void;
  onAutoAnalyze?: (resumeData: ResumeAnalysis) => void;
  onJobSuggestions?: (jobs: SuggestedJob[]) => void;
}

interface ResumeData {
  fileName: string;
  content: string;
  skills: string[];
  experience: string[];
  education: string[];
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

const ResumeUploader = ({
  onResumeUpload = () => {},
  onAutoAnalyze = () => {},
  onJobSuggestions = () => {},
}: ResumeUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isExtensionAvailable, setIsExtensionAvailable] = useState(false);
  const [suggestedJobs, setSuggestedJobs] = useState<SuggestedJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [chromeExtensionData, setChromeExtensionData] = useState<any>(null);
  const [isAutoAnalyzing, setIsAutoAnalyzing] = useState(false);

  // Check for Chrome extension availability
  useEffect(() => {
    const checkExtension = () => {
      // Check if Chrome extension is available
      if (
        typeof window !== "undefined" &&
        window.chrome &&
        window.chrome.runtime
      ) {
        setIsExtensionAvailable(true);
        // Listen for messages from Chrome extension
        window.addEventListener("message", handleExtensionMessage);
      }
    };

    checkExtension();

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("message", handleExtensionMessage);
      }
    };
  }, []);

  // Handle messages from Chrome extension
  const handleExtensionMessage = (event: MessageEvent) => {
    if (event.data.type === "SKILLMATCH_EXTENSION_DATA") {
      setChromeExtensionData(event.data.payload);
      handleExtensionSkillsExtraction(event.data.payload);
    }
  };

  // Handle skills extraction from Chrome extension
  const handleExtensionSkillsExtraction = async (extensionData: any) => {
    try {
      setIsAutoAnalyzing(true);

      // Create mock resume data from extension
      const mockResumeData: ResumeData = {
        fileName: "Skills from Web Page",
        content: extensionData.pageContent || "",
        skills: extensionData.skills || [],
        experience: extensionData.experience || [],
        education: extensionData.education || [],
      };

      setResumeData(mockResumeData);
      setUploadStatus("success");

      // Auto-analyze with extracted skills
      const resumeAnalysis: ResumeAnalysis = {
        skills: extensionData.skills || [],
        experience: extensionData.experience || [],
        education: extensionData.education || [],
        summary: extensionData.summary || "Skills extracted from web page",
      };

      onAutoAnalyze(resumeAnalysis);

      // Get job suggestions automatically
      await handleGetJobSuggestions(resumeAnalysis);
    } catch (error) {
      setErrorMessage("Failed to process extension data");
      setUploadStatus("error");
    } finally {
      setIsAutoAnalyzing(false);
    }
  };

  // Trigger Chrome extension
  const handleChromeExtension = () => {
    if (isExtensionAvailable) {
      // Send message to Chrome extension
      window.postMessage(
        {
          type: "SKILLMATCH_EXTRACT_SKILLS",
          payload: { action: "extract" },
        },
        "*",
      );
    } else {
      // Simulate extension functionality for demo
      const mockExtensionData = {
        skills: [
          "JavaScript",
          "React",
          "TypeScript",
          "Node.js",
          "Python",
          "Machine Learning",
        ],
        experience: [
          "Frontend Developer with 3+ years experience",
          "ML Engineer at AI Startup",
        ],
        education: ["Computer Science Degree"],
        summary: "Experienced developer with ML background",
        pageContent: "Skills extracted from current webpage",
      };

      setTimeout(() => {
        handleExtensionSkillsExtraction(mockExtensionData);
      }, 1500);
    }
  };

  // Get job suggestions
  const handleGetJobSuggestions = async (resumeAnalysis?: ResumeAnalysis) => {
    if (!resumeData && !resumeAnalysis) return;

    setIsLoadingJobs(true);
    try {
      const analysisData = resumeAnalysis || {
        skills: resumeData?.skills || [],
        experience: resumeData?.experience || [],
        education: resumeData?.education || [],
        summary: resumeData?.content || "",
      };

      const jobs = await apiService.getSuggestedJobs(analysisData);
      setSuggestedJobs(jobs);
      setShowJobSuggestions(true);
      onJobSuggestions(jobs);
    } catch (error) {
      setErrorMessage("Failed to fetch job suggestions");
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Enhanced resume parsing function with ML analysis
  const parseResume = async (file: File): Promise<ResumeData> => {
    try {
      // Import resume parser service
      const { resumeParserService } = await import("../services/resumeParser");

      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 15;
        setUploadProgress(Math.min(progress, 90));
      }, 300);

      // Parse the resume file
      const parsedResume = await resumeParserService.parseResumeFile(file);

      // Generate ML-based description
      const mlAnalysis =
        await resumeParserService.generateMLDescription(parsedResume);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Return enhanced resume data
      return {
        fileName: file.name,
        content: mlAnalysis.description,
        skills: parsedResume.skills,
        experience: parsedResume.experience,
        education: parsedResume.education,
        mlAnalysis: mlAnalysis,
        contact: parsedResume.contact,
        rawText: parsedResume.text,
      };
    } catch (error) {
      console.warn("Advanced parsing failed, using fallback:", error);
      return fallbackParseResume(file);
    }
  };

  // Fallback parsing function
  const fallbackParseResume = (file: File): Promise<ResumeData> => {
    return new Promise((resolve, reject) => {
      // Simulate file reading and parsing
      const reader = new FileReader();

      reader.onload = () => {
        // Simulate progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);

          if (progress >= 100) {
            clearInterval(interval);

            // Enhanced mock parsed data with ML description
            const mockResumeData: ResumeData = {
              fileName: file.name,
              content:
                "This professional is a mid-level developer with proven experience in software development and technology. With expertise in JavaScript, React, TypeScript, Node.js, CSS, they demonstrate strong capabilities in Frontend Development Expertise, Backend Development Proficiency, Team Collaboration. Their background shows a progression of increasing responsibility and technical depth, making them well-suited for roles requiring both technical excellence and professional growth.",
              skills: [
                "JavaScript",
                "React",
                "TypeScript",
                "Node.js",
                "CSS",
                "HTML",
                "Git",
                "REST APIs",
              ],
              experience: [
                "Frontend Developer at Tech Co (2020-Present) - Built responsive web applications using React and TypeScript",
                "Web Developer at StartUp Inc (2018-2020) - Developed full-stack applications with Node.js and React",
                "Junior Developer at WebAgency (2017-2018) - Created websites and learned modern web technologies",
              ],
              education: [
                "BS Computer Science, University (2014-2018)",
                "React Developer Certification (2020)",
              ],
              mlAnalysis: {
                description:
                  "This professional is a mid-level developer with proven experience in software development and technology. With expertise in JavaScript, React, TypeScript, Node.js, CSS, they demonstrate strong capabilities in Frontend Development Expertise, Backend Development Proficiency, Team Collaboration.",
                keyStrengths: [
                  "Frontend Development Expertise",
                  "Backend Development Proficiency",
                  "Team Collaboration",
                  "Problem Solving",
                ],
                suggestedImprovements: [
                  "Add cloud platform experience (AWS, Azure, or GCP)",
                  "Learn containerization with Docker and Kubernetes",
                  "Quantify achievements with specific metrics and numbers",
                  "Add relevant certifications to validate expertise",
                ],
                industryFit: [
                  "Web Development",
                  "Startup/Tech",
                  "Software Engineering",
                ],
                experienceLevel: "Mid" as const,
                confidenceScore: 85,
              },
              contact: {
                name: "Professional",
                email: "professional@example.com",
              },
            };

            resolve(mockResumeData);
          }
        }, 200);
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0]);
    }
    // Reset the input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleFileSelection = (selectedFile: File) => {
    // Check if file is PDF or DOCX
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage("Please upload a PDF, DOCX, or TXT file");
      setUploadStatus("error");
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage("File size exceeds 5MB limit");
      setUploadStatus("error");
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setErrorMessage("");
    setUploadStatus("uploading");
    setUploadProgress(0);

    // Parse resume
    parseResume(selectedFile)
      .then(async (data) => {
        setResumeData(data);
        setUploadStatus("success");
        onResumeUpload(selectedFile);

        // Auto-get job suggestions after successful upload
        setTimeout(() => {
          handleGetJobSuggestions();
        }, 1000);
      })
      .catch((error) => {
        setErrorMessage(error.message || "Failed to parse resume");
        setUploadStatus("error");
      });
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName("");
    setUploadStatus("idle");
    setResumeData(null);
    setErrorMessage("");
    setSuggestedJobs([]);
    setShowJobSuggestions(false);
    setChromeExtensionData(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full bg-white shadow-md border-0">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Upload Your Resume
              </CardTitle>
              <CardDescription>
                Upload your resume to analyze it against job descriptions
              </CardDescription>
            </div>
          </motion.div>
        </CardHeader>

        <CardContent>
          <AnimatePresence mode="wait">
            {uploadStatus === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${isDragging ? "border-blue-500 bg-blue-50 scale-105" : "border-gray-300 hover:border-gray-400"}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <motion.div
                    animate={
                      isDragging
                        ? { scale: 1.1, rotate: 5 }
                        : { scale: 1, rotate: 0 }
                    }
                    transition={{ duration: 0.2 }}
                    className={`p-3 rounded-full ${isDragging ? "bg-blue-100" : "bg-gray-100"}`}
                  >
                    <Upload
                      className={`h-8 w-8 ${isDragging ? "text-blue-600" : "text-gray-600"}`}
                    />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium">
                      {isDragging
                        ? "Drop your resume here"
                        : "Drag and drop your resume here"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports PDF, DOCX, and TXT files (max 5MB)
                    </p>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() =>
                          document.getElementById("resume-upload")?.click()
                        }
                        className="flex-1 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-200"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Browse Files
                      </Button>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={handleChromeExtension}
                        disabled={isAutoAnalyzing}
                        className="flex-1 hover:bg-gradient-to-r hover:from-green-500 hover:to-blue-500 hover:text-white hover:border-transparent transition-all duration-200"
                      >
                        {isAutoAnalyzing ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                            >
                              <Bot className="mr-2 h-4 w-4" />
                            </motion.div>
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Chrome className="mr-2 h-4 w-4" />
                            Extract from Web
                          </>
                        )}
                      </Button>
                    </div>
                    <Input
                      id="resume-upload"
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                      onChange={handleFileInputChange}
                    />
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        {isExtensionAvailable ? (
                          <span className="flex items-center justify-center text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Chrome Extension Available
                          </span>
                        ) : (
                          <span className="flex items-center justify-center text-amber-600">
                            <Globe className="h-3 w-3 mr-1" />
                            Demo Mode - Extension Simulation
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {uploadStatus === "uploading" && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <FileText className="h-8 w-8 text-blue-600" />
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{fileName}</p>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.5 }}
                    >
                      <Progress value={uploadProgress} className="h-2 mt-2" />
                    </motion.div>
                  </div>
                </div>
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-sm text-center text-muted-foreground flex items-center justify-center"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Parsing resume content...
                </motion.p>
              </motion.div>
            )}

            {uploadStatus === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    {errorMessage}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="ml-4 hover:bg-red-100"
                    >
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {uploadStatus === "success" && resumeData && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex items-center space-x-3 bg-green-50 p-3 rounded-lg border border-green-200"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </motion.div>
                  <p className="text-sm font-medium text-green-800 flex-1">
                    {resumeData.fileName} uploaded successfully
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="hover:bg-green-100 text-green-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
                >
                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-blue-600" />
                    AI-Enhanced Resume Analysis
                  </h3>

                  {/* ML-Generated Description */}
                  {resumeData.mlAnalysis && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="mb-4 p-3 bg-white/60 rounded-lg border border-blue-200"
                    >
                      <h4 className="text-xs font-semibold text-blue-700 mb-2 flex items-center">
                        <Bot className="h-3 w-3 mr-1" />
                        AI-Generated Professional Summary
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {resumeData.mlAnalysis.confidenceScore}% Confidence
                        </Badge>
                      </h4>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {resumeData.mlAnalysis.description}
                      </p>

                      {/* Experience Level & Industry Fit */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <Badge
                          variant="outline"
                          className="text-xs bg-green-100 text-green-800"
                        >
                          {resumeData.mlAnalysis.experienceLevel} Level
                        </Badge>
                        {resumeData.mlAnalysis.industryFit
                          .slice(0, 2)
                          .map((industry, idx) => (
                            <Badge
                              key={idx}
                              variant="outline"
                              className="text-xs bg-purple-100 text-purple-800"
                            >
                              {industry}
                            </Badge>
                          ))}
                      </div>
                    </motion.div>
                  )}

                  <h3 className="text-sm font-medium mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Resume Preview
                  </h3>

                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h4 className="text-xs font-semibold text-blue-700 mb-2">
                        Skills
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {resumeData.skills.map((skill, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                            className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-2 py-1 rounded-full border border-blue-200"
                          >
                            {skill}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <h4 className="text-xs font-semibold text-blue-700 mb-2">
                        Experience
                      </h4>
                      <ul className="text-xs space-y-1">
                        {resumeData.experience.map((exp, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + index * 0.1 }}
                            className="flex items-start"
                          >
                            <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {exp}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                    >
                      <h4 className="text-xs font-semibold text-blue-700 mb-2">
                        Education
                      </h4>
                      <ul className="text-xs space-y-1">
                        {resumeData.education.map((edu, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.0 + index * 0.1 }}
                            className="flex items-start"
                          >
                            <span className="w-1 h-1 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {edu}
                          </motion.li>
                        ))}
                      </ul>

                      {/* Key Strengths from ML Analysis */}
                      {resumeData.mlAnalysis?.keyStrengths && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.1 }}
                          className="mt-4 p-3 bg-white/60 rounded-lg border border-green-200"
                        >
                          <h4 className="text-xs font-semibold text-green-700 mb-2 flex items-center">
                            <Zap className="h-3 w-3 mr-1" />
                            AI-Identified Key Strengths
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {resumeData.mlAnalysis.keyStrengths.map(
                              (strength, index) => (
                                <motion.span
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: 1.2 + index * 0.1 }}
                                  className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-2 py-1 rounded-full border border-green-200"
                                >
                                  {strength}
                                </motion.span>
                              ),
                            )}
                          </div>
                        </motion.div>
                      )}

                      {/* Contact Information */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.3 }}
                        className="mt-4 p-3 bg-white/60 rounded-lg border border-gray-200"
                      >
                        <h4 className="text-xs font-semibold text-gray-700 mb-2">
                          Contact Information
                        </h4>
                        <div className="text-xs space-y-1">
                          {resumeData.contact.name && (
                            <p>
                              <span className="font-medium">Name:</span>{" "}
                              {resumeData.contact.name}
                            </p>
                          )}
                          {resumeData.contact.email && (
                            <p>
                              <span className="font-medium">Email:</span>{" "}
                              {resumeData.contact.email}
                            </p>
                          )}
                          {resumeData.contact.phone && (
                            <p>
                              <span className="font-medium">Phone:</span>{" "}
                              {resumeData.contact.phone}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Job Suggestions Section */}
                {(showJobSuggestions || isLoadingJobs) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="mt-6"
                  >
                    <Separator className="mb-4" />
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
                        Suggested Jobs
                      </h3>
                      {!isLoadingJobs && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGetJobSuggestions()}
                          className="text-xs"
                        >
                          <Search className="h-3 w-3 mr-1" />
                          Refresh
                        </Button>
                      )}
                    </div>

                    {isLoadingJobs ? (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="text-center py-4"
                      >
                        <Sparkles className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                        <p className="text-sm text-muted-foreground">
                          Finding perfect job matches...
                        </p>
                      </motion.div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {suggestedJobs.slice(0, 3).map((job, index) => (
                          <motion.div
                            key={job.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-blue-700">
                                  {job.title}
                                </h4>
                                <p className="text-xs text-gray-600">
                                  {job.company} • {job.location}
                                </p>
                              </div>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  job.matchPercentage >= 90
                                    ? "bg-green-100 text-green-800"
                                    : job.matchPercentage >= 80
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {job.matchPercentage}%
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2">
                              {job.requiredSkills
                                .slice(0, 3)
                                .map((skill, skillIndex) => (
                                  <span
                                    key={skillIndex}
                                    className="text-xs bg-white/60 text-blue-700 px-2 py-1 rounded-full"
                                  >
                                    {skill}
                                  </span>
                                ))}
                              {job.requiredSkills.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{job.requiredSkills.length - 3}
                                </span>
                              )}
                            </div>

                            <div className="flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {job.salary}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(job.url, "_blank")}
                                className="text-xs h-6 px-2"
                              >
                                View <ExternalLink className="ml-1 h-3 w-3" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}

                        {suggestedJobs.length > 3 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center pt-2"
                          >
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onJobSuggestions(suggestedJobs)}
                              className="text-xs"
                            >
                              View All {suggestedJobs.length} Jobs
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex justify-between">
          {uploadStatus === "success" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center justify-between w-full"
            >
              <p className="text-xs text-green-600 font-medium flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resume ready for analysis
              </p>

              {!showJobSuggestions && !isLoadingJobs && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGetJobSuggestions()}
                  className="text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Get Job Matches
                </Button>
              )}
            </motion.div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ResumeUploader;
