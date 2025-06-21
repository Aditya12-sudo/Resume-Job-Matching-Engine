import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  FileText,
  Search,
  Briefcase,
  ExternalLink,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  apiService,
  type SuggestedJob,
  type ResumeAnalysis,
} from "@/services/api";

interface JobDescriptionAnalyzerProps {
  onAnalyze?: (jobDescription: string) => void;
  isResumeUploaded?: boolean;
  isLoading?: boolean;
  resumeData?: ResumeAnalysis | null;
}

const JobDescriptionAnalyzer = ({
  onAnalyze = () => {},
  isResumeUploaded = true,
  isLoading = false,
  resumeData = null,
}: JobDescriptionAnalyzerProps) => {
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestedJobs, setSuggestedJobs] = useState<SuggestedJob[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAnalyze = () => {
    if (!isResumeUploaded) {
      setError("Please upload your resume first before analyzing.");
      return;
    }

    if (jobDescription.trim().length < 50) {
      setError(
        "Please enter a more detailed job description (at least 50 characters).",
      );
      return;
    }

    setError(null);
    onAnalyze(jobDescription);
  };

  const handleGetSuggestedJobs = async () => {
    if (!resumeData) {
      setError("Resume data is required to get job suggestions.");
      return;
    }

    setIsLoadingSuggestions(true);
    setError(null);

    try {
      const jobs = await apiService.getSuggestedJobs(resumeData);
      setSuggestedJobs(jobs);
      setShowSuggestions(true);
    } catch (error) {
      setError("Failed to fetch job suggestions. Please try again.");
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  return (
    <Card className="w-full bg-white shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-800">
          <FileText className="h-5 w-5 text-blue-600" />
          Job Description Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-600">
              Paste the job description you want to analyze against your resume.
              Our AI will compare your skills and experience to the job
              requirements.
            </p>
            <Textarea
              placeholder="Paste job description here..."
              className="min-h-[200px] resize-none"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!isResumeUploaded && (
            <Alert className="bg-amber-50 text-amber-800 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription>
                Please upload your resume first to enable job description
                analysis.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <div className="flex w-full space-x-2">
          <Button
            onClick={handleAnalyze}
            disabled={
              isLoading ||
              !isResumeUploaded ||
              jobDescription.trim().length === 0
            }
            className="flex-1"
          >
            {isLoading ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Analyze Job Match
              </>
            )}
          </Button>
          <Button
            onClick={handleGetSuggestedJobs}
            disabled={isLoadingSuggestions || !isResumeUploaded}
            variant="outline"
            className="flex-1"
          >
            {isLoadingSuggestions ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></span>
                Loading...
              </>
            ) : (
              <>
                <Briefcase className="mr-2 h-4 w-4" />
                Get Job Suggestions
              </>
            )}
          </Button>
        </div>

        {showSuggestions && suggestedJobs.length > 0 && (
          <div className="w-full">
            <Separator className="mb-4" />
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Briefcase className="mr-2 h-5 w-5" />
              Suggested Jobs for You
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {suggestedJobs.map((job) => (
                <Card
                  key={job.id}
                  className="border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg text-blue-600">
                          {job.title}
                        </h4>
                        <p className="text-gray-600 font-medium">
                          {job.company}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`ml-2 ${
                          job.matchPercentage >= 90
                            ? "bg-green-100 text-green-800"
                            : job.matchPercentage >= 80
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {job.matchPercentage}% Match
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {job.location}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {job.salary}
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.requiredSkills.slice(0, 5).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {job.requiredSkills.length > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.requiredSkills.length - 5} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        Posted: {new Date(job.postedDate).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(job.url, "_blank")}
                        className="text-xs"
                      >
                        View Job <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobDescriptionAnalyzer;
