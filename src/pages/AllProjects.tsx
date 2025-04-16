import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { ChevronRight, Clock } from "lucide-react";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { ProjectStatusBadge } from "@/components/ProjectStatusBadge";
import { Navbar } from "@/components/Navbar";
import { ProjectCard } from "@/components/ProjectCard";

const AllProjects = () => {
  const { projects } = useProjects();
  const { getDeveloperById } = useAuth();
  const [developerMap, setDeveloperMap] = useState<Record<string, string | null>>({});
  
  // Fetch developer data for all projects
  useEffect(() => {
    const fetchDevelopers = async () => {
      const developerPromises = projects.map(async (project) => {
        if (project.assignedTo) {
          const developer = await getDeveloperById(project.assignedTo._id);
          return {
            projectId: project._id,
            developerName: developer ? developer.name : null,
          };
        }
        return { projectId: project._id, developerName: null };
      });

      const developerDetails = await Promise.all(developerPromises);
      const map: Record<string, string | null> = {};
      developerDetails.forEach(({ projectId, developerName }) => {
        map[projectId] = developerName;
      });
      setDeveloperMap(map);
    };

    fetchDevelopers();
  }, [projects, getDeveloperById]);


  console.log("Sorted Projects:", projects);
  console.log("Developer Map:", developerMap);
  console.log("Projects:", projects);
  console.log("Developer Map:", developerMap);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">All Projects</h1>
          <p className="text-gray-500 mt-1">
            Complete view of all projects in the system
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {projects.length > 0 ? (
            <div className="space-y-4">
              {projects.map((project) => {
                const developerName = developerMap[project._id] || "Unassigned";
                return (
                  <Card key={project._id}>
                    <CardHeader>
                      <CardTitle>{project.clientName}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-lg">{project.clientName}</h3>
                            <span className="reference-id">{project.referenceId}</span>
                          </div>

                          <p className="text-sm text-gray-600">
                            {project.description.substring(0, 100)}
                            {project.description.length > 100 ? "..." : ""}
                          </p>

                          <div className="flex flex-wrap gap-2 items-center mt-2">
                            <ProjectStatusBadge status={project.status} />

                            {project.deadline && (
                              <span
                                className="flex items-center text-xs text-gray-500"
                              >
                                <Clock className="h-3 w-3 mr-1" />
                                Due: {new Date(project.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 md:mt-0 ml-0 md:ml-4 flex flex-col justify-between items-end">
                          <div className="text-sm text-gray-600 text-right">
                            <span className="block">Assigned to:</span>
                            <span className="font-medium">{developerName}</span>
                          </div>

                          <Link to={`/projects/${project._id}`} className="mt-2">
                            <Button size="sm" variant="outline" className="flex items-center">
                              View Details
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-10">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">No projects found</h3>
                  <p className="text-gray-500 mb-4">
                    There are no projects in the system yet.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProjects;
