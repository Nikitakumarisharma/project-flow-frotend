
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/context/ProjectContext";
import { ProjectStatusBadge } from "@/components/ProjectStatusBadge";
import { Search, ExternalLink } from "lucide-react";

const ClientTracker = () => {
  const [referenceId, setReferenceId] = useState("");
  const [searched, setSearched] = useState(false);
  const { getProjectByReferenceId } = useProjects();
  
  const [project, setProject] = useState(null);
  
  const handleSearch = () => {
    if (!referenceId.trim()) return;
    
    const foundProject = getProjectByReferenceId(referenceId.trim());
    setProject(foundProject);
    setSearched(true);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getPublicNotes = () => {
    if (!project) return [];
    return project.notes.filter((note) => note.isPublic);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          CMT AI Project Tracker
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Enter your project's Reference ID to check the current status of your website project.
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto shadow-lg border-2 border-gray-100">
        <CardHeader>
          <CardTitle className="text-center">Track Your Project</CardTitle>
          <CardDescription className="text-center">
            Enter the Reference ID provided by your project manager
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-6">
            <Input
              placeholder="e.g. CMT-123456-001"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
              onKeyPress={handleKeyPress}
              className="font-mono"
            />
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Track
            </Button>
          </div>
          
          {searched && (
            <>
              {project ? (
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{project.clientName}</h3>
                        <p className="text-gray-500 text-sm">{project.referenceId}</p>
                      </div>
                      <ProjectStatusBadge status={project.status} className="text-sm py-1 px-3" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Project Description</h3>
                    <p className="text-gray-600">{project.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Current Status</h3>
                    <div className="space-y-2">
                      {project.status === "requirements" && (
                        <p>We're waiting for additional requirements from you before we can begin development.</p>
                      )}
                      {project.status === "development" && (
                        <p>Our team is actively working on developing your project.</p>
                      )}
                      {project.status === "payment" && (
                        <p>We're waiting for payment Gateway to be processed before we can continue.</p>
                      )}
                      {project.status === "credentials" && (
                        <p>We need domain or hosting credentials from you to proceed.</p>
                      )}
                      {project.status === "completed" && (
                        <p>Your project has been successfully completed!</p>
                      )}
                    </div>
                  </div>
                  
                  {project.deadline && (
                    <div>
                      <h3 className="font-medium mb-2">Expected Completion</h3>
                      <p className="text-gray-600">
                        {new Date(project.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium mb-3">Updates from our team</h3>
                    {getPublicNotes().length > 0 ? (
                      <div className="space-y-3">
                        {getPublicNotes().map((note) => (
                          <div key={note.id} className="p-3 bg-gray-50 rounded border text-sm">
                            <p>{note.content}</p>
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <span>{note.author}</span>
                              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No updates available yet.</p>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Need to get in touch with us about your project?
                    </p>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="text-red-500 mb-2">Project not found</div>
                  <p className="text-gray-600 mb-4">
                    We couldn't find a project with that Reference ID. Please check if you entered it correctly.
                  </p>
                  <p className="text-sm text-gray-500">
                    If you continue having issues, please contact your project manager.
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      
      <div className="text-center mt-8">
        <Link to="/login" className="text-primary hover:underline text-sm">
          Team login
        </Link>
      </div>
    </div>
  );
};

export default ClientTracker;
