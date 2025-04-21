import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Clock, AlertTriangle } from "lucide-react";
import { ProjectStatusBadge } from "@/components/ProjectStatusBadge";
import { cn } from "@/lib/utils";
import { Project } from "@/context/ProjectContext"; // make sure this is exported from context

interface ProjectCardProps {
  projects: Project[];
}

export function ProjectCard({ projects }: ProjectCardProps) {
  return (
    <div className="grid gap-4">
      {projects.map((project) => {
        const isDeadlinePassed =
          project.deadline && new Date(project.deadline) < new Date();

        const isRenewalSoon =
          project.renewalDate &&
          new Date(project.renewalDate).getTime() - Date.now() <
            15 * 24 * 60 * 60 * 1000;
            console.log("id primt date print",project.referenceId, "->", project.deadline, project.renewalDate);

        return (
          <Card key={project._id}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">{project.clientName}</h3>
                    <span className="reference-id">ref Id : {project.referenceId}</span>
                    </div>

                  <p className="text-sm text-gray-600">
                    {project.description.substring(0, 100)}
                    {project.description.length > 100 ? "..." : ""}
                  </p>

                  <div className="flex flex-wrap gap-2 items-center mt-2">
                    <ProjectStatusBadge status={project.status} />

                    {project.deadline && (
                      <span
                        className={cn(
                          "flex items-center text-xs",
                          isDeadlinePassed
                            ? "text-orange-700 font-bold"
                            : "text-gray-500"
                        )}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Due: {new Date(project.deadline).toLocaleDateString()}
                        {isDeadlinePassed && (
                          <AlertTriangle className="h-3 w-3 ml-1 text-orange-600" />
                        )}
                      </span>
                    )}

                    {project.renewalDate && (
                      <span
                        className={cn(
                          "flex items-center text-xs",
                          isRenewalSoon
                            ? "text-red-700 font-bold"
                            : "text-gray-500"
                        )}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Renewal: {new Date(project.renewalDate).toLocaleDateString()}
                        {isRenewalSoon && (
                          <AlertTriangle className="h-3 w-3 ml-1 text-red-600" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 ml-0 md:ml-4 flex flex-col justify-between items-end">
                  {project.assignedTo?.name && (
                    <div className="text-sm text-gray-600 text-right">
                      <span className="block">Assigned to:</span>
                      <span className="font-medium">{project.assignedTo.name}</span>
                    </div>
                  )}

                  <Link to={`/projects/${project._id}`} className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center"
                    >
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
  );
}
