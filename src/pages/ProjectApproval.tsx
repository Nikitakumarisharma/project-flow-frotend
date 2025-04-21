import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle } from "lucide-react";
import { useProjects } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/components/ui/use-toast";

interface Developer {
  _id: string;
  name: string;
}

const ProjectApproval = () => {
  const navigate = useNavigate();
  const { projects, approveProject, deleteProject } = useProjects();
  const { getAllDevelopers } = useAuth();
  const { toast } = useToast();

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [developer, setDeveloper] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string>("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [projectToReject, setProjectToReject] = useState<string | null>(null);

  // Fetch developers when the component mounts
  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const data = await getAllDevelopers();
        setDevelopers(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch developers.",
          variant: "destructive",
        });
      }
    };

    fetchDevelopers();
  }, [getAllDevelopers, toast]);

  // Get all unapproved projects
  const pendingProjects = projects.filter(project => !project.approved);
  
  const handleApprove = () => {
    if (selectedProject && developer && deadline) {
      // Format the date to ensure it's in ISO format
      const formattedDeadline = new Date(deadline).toISOString();
      console.log('Formatted deadline:', formattedDeadline);
      
      approveProject(selectedProject, developer, formattedDeadline);
      setSelectedProject(null);
      setDeveloper(null);
      setDeadline("");
    }
  };
  
  const handleReject = (projectId: string) => {
    setProjectToReject(projectId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (projectToReject) {
      try {
        await deleteProject(projectToReject);
        toast({
          title: "Success",
          description: "Project has been rejected and deleted.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reject project.",
          variant: "destructive",
        });
      }
    }
    setShowRejectModal(false);
    setProjectToReject(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4 md:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Project Approval</h1>
          <p className="text-gray-500 mt-1">
            Review and assign new projects to developers
          </p>
        </div>

        {pendingProjects.length === 0 ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">No projects pending approval</h3>
                <p className="text-gray-500 mb-4">
                  All projects have been reviewed and assigned.
                </p>
                <Button onClick={() => navigate("/dashboard")}>
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingProjects.map((project) => (
              <Card key={project._id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{project.clientName}</span>
                    <span className="reference-id">{project.referenceId}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-gray-600">{project.description}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Requirements</h4>
                      <p className="text-gray-600 whitespace-pre-line">{project.requirements}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Client Email</h4>
                        <p className="text-gray-600">{project.clientEmail}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium mb-1">Client Phone</h4>
                        <p className="text-gray-600">{project.clientPhone}</p>
                      </div>
                    </div>
                    <div className="pt-2 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleReject(project._id)}
                        className="flex items-center"
                      >
                        <XCircle className="h-4 w-4 mr-1 text-destructive" />
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setSelectedProject(project._id)}
                        className="flex items-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve & Assign
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Approval Dialog */}
        <Dialog open={!!selectedProject} onOpenChange={(open) => !open && setSelectedProject(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Project</DialogTitle>
              <DialogDescription>
                Select a developer and set a deadline for this project
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="developer" className="text-sm font-medium">
                  Assign to Developer
                </label>
                <Select
                  value={developer || ""}
                  onValueChange={setDeveloper}
                >
                  <SelectTrigger id="developer">
                    <SelectValue placeholder="Select a developer" />
                  </SelectTrigger>
                  <SelectContent>
                    {developers.map((dev) => (
                      <SelectItem key={dev._id} value={dev._id}>
                        {dev.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label htmlFor="deadline" className="text-sm font-medium">
                  Project Deadline
                </label>
                <Input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedProject(null)}>
                Cancel
              </Button>
              <Button onClick={handleApprove} disabled={!developer || !deadline}>
                Assign Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Confirmation Dialog */}
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Rejection</DialogTitle>
              <DialogDescription>
                Are you sure you want to reject and delete this project? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowRejectModal(false)}>
                No, Cancel
              </Button>
              <Button variant="destructive" onClick={confirmReject}>
                Yes, Reject Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectApproval;
