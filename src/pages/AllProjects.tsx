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
  
  // Sort projects by date (newest first)
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Fetch developer data for all projects
  useEffect(() => {
    const fetchDevelopers = async () => {
      const developerPromises = sortedProjects.map(async (project) => {
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
  }, [sortedProjects, getDeveloperById]);

  console.log("Sorted Projects:", sortedProjects);
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

        <div className="grid gap-4">
          {sortedProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllProjects;
