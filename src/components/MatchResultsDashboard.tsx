import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Download,
  Edit,
} from "lucide-react";
import SkillsGapVisualizer from "./SkillsGapVisualizer";

interface Skill {
  name: string;
  status: "match" | "missing" | "partial";
  relevance: number;
}

interface Suggestion {
  title: string;
  description: string;
  example?: string;
}

interface MatchResultsDashboardProps {
  matchScore: number;
  skills: Skill[];
  suggestions: Suggestion[];
  onEditResume?: () => void;
  onNewJobDescription?: () => void;
}

const MatchResultsDashboard = ({
  matchScore = 65,
  skills = [
    { name: "React", status: "match", relevance: 95 },
    { name: "TypeScript", status: "match", relevance: 90 },
    { name: "Node.js", status: "partial", relevance: 75 },
    { name: "AWS", status: "missing", relevance: 85 },
    { name: "GraphQL", status: "missing", relevance: 70 },
  ],
  suggestions = [
    {
      title: "Add AWS experience",
      description:
        "The job requires AWS knowledge which is missing from your resume.",
      example:
        "Deployed and managed applications using AWS EC2, S3, and Lambda.",
    },
    {
      title: "Highlight React projects",
      description:
        "Your React experience matches well, but could be more prominent.",
      example:
        "Led development of a React-based dashboard that improved team productivity by 30%.",
    },
    {
      title: "Expand on Node.js experience",
      description:
        "You have some Node.js experience, but the job requires more depth.",
      example:
        "Built RESTful APIs using Node.js and Express, handling 1000+ daily requests.",
    },
  ],
  onEditResume = () => {},
  onNewJobDescription = () => {},
}: MatchResultsDashboardProps) => {
  return (
    <div className="w-full bg-background p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-6">Match Analysis Results</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Match Score Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Match Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="relative h-36 w-36 flex items-center justify-center">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="text-muted-foreground/20"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-primary"
                    strokeWidth="10"
                    strokeDasharray={`${matchScore * 2.51} 251`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <span className="absolute text-3xl font-bold">
                  {matchScore}%
                </span>
              </div>
              <div className="mt-4 text-center">
                {matchScore >= 80 ? (
                  <Badge variant="default" className="bg-green-500">
                    Strong Match
                  </Badge>
                ) : matchScore >= 60 ? (
                  <Badge variant="default" className="bg-yellow-500">
                    Good Match
                  </Badge>
                ) : (
                  <Badge variant="default" className="bg-red-500">
                    Needs Improvement
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Skills Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span>Matching Skills</span>
                </div>
                <Badge variant="outline">
                  {skills.filter((s) => s.status === "match").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                  <span>Partial Matches</span>
                </div>
                <Badge variant="outline">
                  {skills.filter((s) => s.status === "partial").length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                  <span>Missing Skills</span>
                </div>
                <Badge variant="outline">
                  {skills.filter((s) => s.status === "missing").length}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                onClick={onEditResume}
                className="w-full flex items-center justify-center"
              >
                <Edit className="mr-2 h-4 w-4" /> Edit Resume
              </Button>
              <Button
                onClick={onNewJobDescription}
                variant="outline"
                className="w-full flex items-center justify-center"
              >
                <ArrowRight className="mr-2 h-4 w-4" /> Try Another Job
              </Button>
              <Button
                variant="secondary"
                className="w-full flex items-center justify-center"
              >
                <Download className="mr-2 h-4 w-4" /> Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="skills" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="skills">Skills Gap Analysis</TabsTrigger>
          <TabsTrigger value="suggestions">Improvement Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills Gap Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <SkillsGapVisualizer skills={skills} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Improvement Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-lg font-medium">{suggestion.title}</h3>
                    <p className="text-muted-foreground">
                      {suggestion.description}
                    </p>
                    {suggestion.example && (
                      <div className="bg-muted p-3 rounded-md mt-2">
                        <p className="text-sm italic">
                          "
                          <span className="text-primary">
                            {suggestion.example}
                          </span>
                          "
                        </p>
                      </div>
                    )}
                    {index < suggestions.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MatchResultsDashboard;
