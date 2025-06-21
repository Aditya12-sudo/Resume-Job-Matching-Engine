import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeUploader from "./ResumeUploader";
import JobDescriptionAnalyzer from "./JobDescriptionAnalyzer";
import MatchResultsDashboard from "./MatchResultsDashboard";
import Login from "./Login";
import Signup from "./Signup";
import { motion, AnimatePresence } from "framer-motion";
import { authService, type User } from "@/services/auth";
import { apiService, type ResumeAnalysis, type JobMatch } from "@/services/api";
import {
  LogOut,
  User as UserIcon,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

interface Resume {
  content: string;
  fileName: string;
}

interface JobDescription {
  content: string;
}

interface AnalysisResult {
  matchScore: number;
  missingSkills: string[];
  matchingSkills: string[];
  suggestions: string[];
}

const Home = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [resume, setResume] = useState<Resume | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(
    null,
  );
  const [jobDescription, setJobDescription] = useState<JobDescription | null>(
    null,
  );
  const [analysisResult, setAnalysisResult] = useState<JobMatch | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    const unsubscribe = authService.onAuthStateChange((newUser) => {
      setUser(newUser);
    });

    return unsubscribe;
  }, []);

  const handleResumeUpload = async (file: File) => {
    try {
      const analysis = await apiService.analyzeResume(file);
      setResumeAnalysis(analysis);
      setResume({ content: analysis.summary, fileName: file.name });
      if (jobDescription) {
        setActiveTab("analyze");
      }
    } catch (error) {
      console.error("Resume analysis failed:", error);
    }
  };

  const handleJobDescriptionAnalyze = async (jobDesc: string) => {
    if (!resumeAnalysis) return;

    setIsAnalyzing(true);
    setJobDescription({ content: jobDesc });

    try {
      const result = await apiService.analyzeJobMatch(resumeAnalysis, jobDesc);
      setAnalysisResult(result);
      await apiService.saveAnalysis(result);
      setActiveTab("results");
    } catch (error) {
      console.error("Job analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
    setResumeAnalysis(null);
    setResume(null);
    setJobDescription(null);
    setActiveTab("upload");
  };

  const handleLogout = async () => {
    await authService.logout();
    resetAnalysis();
  };

  const handleAuthSuccess = () => {
    // User state will be updated via the auth state change listener
  };

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        {authMode === "login" ? (
          <Login
            key="login"
            onLogin={handleAuthSuccess}
            onSwitchToSignup={() => setAuthMode("signup")}
          />
        ) : (
          <Signup
            key="signup"
            onSignup={handleAuthSuccess}
            onSwitchToLogin={() => setAuthMode("login")}
          />
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50 relative overflow-hidden">
      {/* Hero Background Pattern */}
      <div className="absolute inset-0 hero-pattern opacity-30"></div>

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-rose-300/40 to-purple-300/40 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -150, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-300/30 to-indigo-300/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -80, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-indigo-300/20 to-rose-300/20 rounded-full blur-2xl"
        />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-20 right-20 w-8 h-8 bg-rose-400/60 rounded-lg floating-animation"
          style={{ animationDelay: "0s" }}
        />
        <motion.div
          className="absolute top-40 left-20 w-6 h-6 bg-purple-400/60 rounded-full floating-animation"
          style={{ animationDelay: "2s" }}
        />
        <motion.div
          className="absolute bottom-40 right-40 w-10 h-10 bg-indigo-400/60 rounded-xl floating-animation"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header with user info */}
          <header className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-rose-500 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl pulse-glow"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-2xl font-display font-bold text-white">
                    R&J
                  </span>
                </motion.div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text">
                    R&J
                  </h1>
                  <p className="text-lg text-gray-600 font-medium">
                    Welcome back, {user.name}!
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <motion.p
                className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Transform your career with AI-powered resume analysis. Upload
                your resume, paste job descriptions, and discover personalized
                insights to land your dream job.
              </motion.p>

              {/* Enhanced feature cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-gray-800 mb-2">
                    AI-Powered Analysis
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Advanced machine learning algorithms analyze your resume
                    against job requirements
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-gray-800 mb-2">
                    Instant Results
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Get comprehensive match scores and detailed feedback in
                    seconds
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <UserIcon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-gray-800 mb-2">
                    Personalized Tips
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Receive tailored suggestions to improve your resume and
                    increase job matches
                  </p>
                </motion.div>
              </div>
            </motion.div>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-2 border border-white/30">
                <TabsTrigger
                  value="upload"
                  disabled={isAnalyzing}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:via-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300"
                >
                  📄 Resume Upload
                </TabsTrigger>
                <TabsTrigger
                  value="analyze"
                  disabled={!resume || isAnalyzing}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:via-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300"
                >
                  🔍 Job Analysis
                </TabsTrigger>
                <TabsTrigger
                  value="results"
                  disabled={!analysisResult || isAnalyzing}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:via-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl font-medium transition-all duration-300"
                >
                  📊 Results
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="upload" className="mt-4">
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
                      <CardContent className="pt-6">
                        <ResumeUploader onResumeUpload={handleResumeUpload} />
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="analyze" className="mt-4">
                  <motion.div
                    key="analyze"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
                      <CardContent className="pt-6">
                        <JobDescriptionAnalyzer
                          onAnalyze={handleJobDescriptionAnalyze}
                          isResumeUploaded={!!resume}
                          isLoading={isAnalyzing}
                          resumeData={resumeAnalysis}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="results" className="mt-4">
                  {analysisResult && (
                    <motion.div
                      key="results"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-0 rounded-3xl overflow-hidden">
                        <CardContent className="pt-6">
                          <MatchResultsDashboard
                            matchScore={analysisResult.matchScore}
                            skills={[
                              ...analysisResult.matchingSkills.map((skill) => ({
                                name: skill,
                                status: "match" as const,
                                relevance: 90,
                              })),
                              ...analysisResult.partialSkills.map((skill) => ({
                                name: skill,
                                status: "partial" as const,
                                relevance: 70,
                              })),
                              ...analysisResult.missingSkills.map((skill) => ({
                                name: skill,
                                status: "missing" as const,
                                relevance: 85,
                              })),
                            ]}
                            suggestions={analysisResult.suggestions}
                            onEditResume={resetAnalysis}
                            onNewJobDescription={() => setActiveTab("analyze")}
                          />
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </motion.div>

          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-16 text-center text-sm text-gray-500"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 inline-block shadow-xl border border-white/30">
              <p className="font-display text-lg gradient-text font-semibold mb-2">
                R&J
              </p>
              <p className="text-gray-600">
                © {new Date().getFullYear()} - Revolutionizing Career Success
                with AI
              </p>
            </div>
          </motion.footer>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
