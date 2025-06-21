import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Skill {
  name: string;
  status: "match" | "missing" | "partial";
  relevance: number; // 0-100
  description?: string;
}

interface SkillsGapVisualizerProps {
  skills?: Skill[];
  sortBy?: "relevance" | "status" | "name";
  sortDirection?: "asc" | "desc";
}

const SkillsGapVisualizer = ({
  skills = [
    {
      name: "React",
      status: "match",
      relevance: 95,
      description: "Strong match with 3+ years experience",
    },
    {
      name: "TypeScript",
      status: "match",
      relevance: 90,
      description: "Good match with demonstrated projects",
    },
    {
      name: "Node.js",
      status: "partial",
      relevance: 70,
      description: "Some experience but not extensive",
    },
    {
      name: "AWS",
      status: "missing",
      relevance: 85,
      description: "Required skill not found in resume",
    },
    {
      name: "Docker",
      status: "missing",
      relevance: 80,
      description: "Important skill missing from resume",
    },
    {
      name: "GraphQL",
      status: "partial",
      relevance: 65,
      description: "Basic knowledge detected but more depth needed",
    },
  ],
  sortBy = "relevance",
  sortDirection = "desc",
}: SkillsGapVisualizerProps) => {
  const [currentSortBy, setCurrentSortBy] = React.useState<
    "relevance" | "status" | "name"
  >(sortBy);
  const [currentSortDirection, setCurrentSortDirection] = React.useState<
    "asc" | "desc"
  >(sortDirection);

  const sortedSkills = [...skills].sort((a, b) => {
    if (currentSortBy === "relevance") {
      return currentSortDirection === "asc"
        ? a.relevance - b.relevance
        : b.relevance - a.relevance;
    } else if (currentSortBy === "status") {
      const statusOrder = { match: 0, partial: 1, missing: 2 };
      return currentSortDirection === "asc"
        ? statusOrder[a.status] - statusOrder[b.status]
        : statusOrder[b.status] - statusOrder[a.status];
    } else {
      return currentSortDirection === "asc"
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
  });

  const handleSort = (sortType: "relevance" | "status" | "name") => {
    if (currentSortBy === sortType) {
      setCurrentSortDirection(currentSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCurrentSortBy(sortType);
      setCurrentSortDirection("desc");
    }
  };

  const getStatusIcon = (status: Skill["status"]) => {
    switch (status) {
      case "match":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "missing":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "partial":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: Skill["status"]) => {
    switch (status) {
      case "match":
        return "Match";
      case "missing":
        return "Missing";
      case "partial":
        return "Partial";
      default:
        return "";
    }
  };

  const getStatusColor = (status: Skill["status"]) => {
    switch (status) {
      case "match":
        return "bg-green-100 text-green-800 border-green-200";
      case "missing":
        return "bg-red-100 text-red-800 border-red-200";
      case "partial":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "";
    }
  };

  // Calculate statistics
  const matchCount = skills.filter((skill) => skill.status === "match").length;
  const partialCount = skills.filter(
    (skill) => skill.status === "partial",
  ).length;
  const missingCount = skills.filter(
    (skill) => skill.status === "missing",
  ).length;
  const totalSkills = skills.length;

  return (
    <Card className="w-full bg-white shadow-md">
      <CardContent className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Skills Gap Analysis</h2>
          <p className="text-gray-600 text-sm mb-4">
            Comparison of your resume skills against job requirements
          </p>

          {/* Skills Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">
                {matchCount}
              </div>
              <div className="text-xs text-green-800">Matching Skills</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {partialCount}
              </div>
              <div className="text-xs text-yellow-800">Partial Matches</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">
                {missingCount}
              </div>
              <div className="text-xs text-red-800">Missing Skills</div>
            </div>
          </div>

          {/* Overall Match Progress */}
          <div className="mb-6">
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Overall Match</span>
              <span className="text-sm font-medium">
                {Math.round(
                  ((matchCount + partialCount * 0.5) / totalSkills) * 100,
                )}
                %
              </span>
            </div>
            <Progress
              value={Math.round(
                ((matchCount + partialCount * 0.5) / totalSkills) * 100,
              )}
              className="h-2"
            />
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex justify-between items-center mb-4 text-sm">
          <div>Sort by:</div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleSort("relevance")}
              className={`px-2 py-1 rounded ${currentSortBy === "relevance" ? "bg-gray-200" : "hover:bg-gray-100"}`}
            >
              Relevance{" "}
              {currentSortBy === "relevance" &&
                (currentSortDirection === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSort("status")}
              className={`px-2 py-1 rounded ${currentSortBy === "status" ? "bg-gray-200" : "hover:bg-gray-100"}`}
            >
              Status{" "}
              {currentSortBy === "status" &&
                (currentSortDirection === "asc" ? "↑" : "↓")}
            </button>
            <button
              onClick={() => handleSort("name")}
              className={`px-2 py-1 rounded ${currentSortBy === "name" ? "bg-gray-200" : "hover:bg-gray-100"}`}
            >
              Name{" "}
              {currentSortBy === "name" &&
                (currentSortDirection === "asc" ? "↑" : "↓")}
            </button>
          </div>
        </div>

        {/* Skills List */}
        <div className="space-y-3">
          {sortedSkills.map((skill, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(skill.status)}
                      <span className="font-medium">{skill.name}</span>
                      <Badge className={`${getStatusColor(skill.status)}`}>
                        {getStatusText(skill.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${skill.relevance}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {skill.relevance}%
                      </span>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {skill.description ||
                      `${skill.name} - ${getStatusText(skill.status)}`}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsGapVisualizer;
