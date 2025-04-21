import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProjects, ProjectStatus } from "@/context/ProjectContext";
import { useAuth } from "@/context/AuthContext";
import { ProjectStatusBadge } from "@/components/ProjectStatusBadge";
import { Navbar } from "@/components/Navbar";
import {
  Calendar,
  Clock,
  Edit,
  Plus,
  User,
  FileText,
  Key,
  RefreshCw,
  Pencil,
} from "lucide-react";
import { toast, useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const {
    getProjectById,
    updateProjectStatus,
    addProjectNote,
    addCredential,
    updateCompletionDate,
    updateRenewalDate,
    deleteProject,
    updateProjectAssignment,
  } = useProjects();
  const { user, getAllDevelopers } = useAuth();
  const { toast: useToastToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ProjectStatus>("requirements");
  const [note, setNote] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [credentialType, setCredentialType] = useState("domain");
  const [credentialName, setCredentialName] = useState("");
  const [credentialValue, setCredentialValue] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [developers, setDevelopers] = useState([]);
  const [showDeveloperSelect, setShowDeveloperSelect] = useState(false);
  const [selectedDeveloper, setSelectedDeveloper] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const fetchedProject = await getProjectById(id || "");
        setProject(fetchedProject);
        if (fetchedProject) {
          setStatus(fetchedProject.status);
          setCompletionDate(fetchedProject.completionDate || "");
          setRenewalDate(fetchedProject.renewalDate || "");
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
        useToastToast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchProject();
  }, [id, getProjectById]);

  useEffect(() => {
    const fetchDevelopers = async () => {
      try {
        const devs = await getAllDevelopers();
        setDevelopers(devs);
      } catch (error) {
        console.error("Failed to fetch developers:", error);
      }
    };
    fetchDevelopers();
  }, [getAllDevelopers]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project Not Found</h1>
          <Button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Check if current user is the assigned developer
  const isDeveloper = user?.role === "developer" && project?.assignedTo?._id === user?._id;
  const isCto = user?.role === "cto";

  const handleStatusChange = () => {
    updateProjectStatus(project._id, status);
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;

    try {
      const notePayload = {
        content: note,
        isPublic,
        author: user?.name || user?.email || "Anonymous",
      };

      const response = await addProjectNote(project._id, notePayload);
      
      // Create a new note object with the current timestamp
      const newNote = {
        ...notePayload,
        _id: Date.now().toString(), // Temporary ID
        createdAt: new Date().toISOString()
      };

      // Update the project's notes in the local state
      setProject(prevProject => ({
        ...prevProject,
        notes: [...(prevProject.notes || []), newNote]
      }));

      setNote("");
      setIsPublic(false);

      useToastToast({
        title: "Success",
        description: "Note added successfully",
      });
    } catch (error) {
      useToastToast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  };

  const handleAddCredential = async () => {
    if (!credentialName.trim() || !credentialValue.trim()) return;

    try {
      await addCredential(project._id, {
        type: credentialType,
        name: credentialName,
        value: credentialValue,
      });

      // Update the local project state with the new credential
      setProject(prevProject => ({
        ...prevProject,
        credentials: [
          ...(prevProject.credentials || []),
          {
            _id: Date.now().toString(), // Temporary ID until backend sync
            type: credentialType,
            name: credentialName,
            value: credentialValue,
            dateAdded: new Date().toISOString()
          }
        ]
      }));

      // Reset form fields
      setCredentialType("domain");
      setCredentialName("");
      setCredentialValue("");
    } catch (error) {
      console.error("Error adding credential:", error);
    }
  };

  const handleUpdateCompletionDate = () => {
    if (!completionDate) return;
    updateCompletionDate(project._id, completionDate);
  };

  const handleUpdateRenewalDate = () => {
    if (!renewalDate) return;
    updateRenewalDate(project._id, renewalDate);
  };

  const handleDelete = async () => {
    try {
      await deleteProject(project._id);
      useToastToast({
        title: "Success",
        description: "Project has been deleted successfully.",
      });
      navigate("/dashboard");
    } catch (error) {
      useToastToast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    }
    setShowDeleteModal(false);
  };

  const handleDeveloperChange = async (developerId: string) => {
    try {
      await updateProjectAssignment(project._id, developerId);
      setShowDeveloperSelect(false);
      // Refresh project data
      const updatedProject = await getProjectById(project._id);
      setProject(updatedProject);
    } catch (error) {
      console.error("Failed to update developer assignment:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {project.clientName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="reference-id">{project.referenceId}</span>
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
            {user?.role === "cto" && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Project
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <User className="h-4 w-4 mr-2" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Name:</span>
                  <p className="font-medium">{project.clientName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Email:</span>
                  <p className="font-medium">{project.clientEmail}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Phone:</span>
                  <p className="font-medium">{project.clientPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Created by:</span>
                  <p className="font-medium">{project.createdBy?.name || "Sales User"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Assigned to:</span>
                  <div className="flex items-center gap-2">
                    {showDeveloperSelect ? (
                      <Select
                        value={selectedDeveloper}
                        onValueChange={handleDeveloperChange}
                        onOpenChange={(open) => !open && setShowDeveloperSelect(false)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select developer" />
                        </SelectTrigger>
                        <SelectContent>
                          {developers.map((dev) => (
                            <SelectItem key={dev._id} value={dev._id}>
                              {dev.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <>
                        <p className="font-medium">{project.assignedTo?.name || "Not Assigned"}</p>
                        {user?.role === "cto" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setShowDeveloperSelect(true)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Created on:</span>
                  <p className="font-medium">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.deadline && (
                  <div>
                    <span className="text-sm text-gray-500">Deadline:</span>
                    <p className="font-medium">
                      {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {project.completionDate && (
                  <div>
                    <span className="text-sm text-gray-500">Completion Date:</span>
                    <p className="font-medium">
                      {new Date(project.completionDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {project.renewalDate && (
                  <div>
                    <span className="text-sm text-gray-500">Renewal Date:</span>
                    <p className="font-medium">
                      {new Date(project.renewalDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{project.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{project.requirements}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="notes" className="mb-6">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            {isDeveloper && (
              <TabsTrigger value="status">Update Status</TabsTrigger>
            )}
            {(isDeveloper || isCto) && (
              <>
                <TabsTrigger value="credentials">Store Credentials</TabsTrigger>
                <TabsTrigger value="dates">Important Dates</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Project Notes</CardTitle>
                <CardDescription>
                  View and add notes for this project
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {project.notes && project.notes.length > 0 ? (
                    project.notes.map((note) => note && (
                      <div
                        key={note._id || Math.random()}
                        className="p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <p className="whitespace-pre-line">{note.content || ''}</p>
                          {note.isPublic && (
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                              Public
                            </span>
                          )}
                        </div>
                        <div className="mt-2 flex justify-between items-center text-sm text-gray-500">
                          <span>By: {note.author || 'Anonymous'}</span>
                          <span>
                            {note.createdAt ? new Date(note.createdAt).toLocaleString() : 'No date'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No notes added yet
                    </p>
                  )}
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-medium">Add New Note</h3>
                  <Textarea
                    placeholder="Enter your note here..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={4}
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="form-checkbox"
                      />
                      <span>Make visible to client</span>
                    </label>
                    <Button
                      onClick={handleAddNote}
                      disabled={!note.trim()}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {(isDeveloper || isCto) && (
            <TabsContent value="status">
              <Card>
                <CardHeader>
                  <CardTitle>Update Project Status</CardTitle>
                  <CardDescription>
                    Change the current status of this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="status" className="text-sm font-medium">
                        Current Status:
                      </label>
                      <div className="mb-4">
                        <ProjectStatusBadge status={project.status} />
                      </div>
                      <Select
                        value={status}
                        onValueChange={(value) =>
                          setStatus(value as ProjectStatus)
                        }
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="requirements">
                            Waiting for Requirements
                          </SelectItem>
                          <SelectItem value="development">
                            Development In Progress
                          </SelectItem>
                          <SelectItem value="payment">
                            Waiting for Payment
                          </SelectItem>
                          <SelectItem value="credentials">
                            Waiting for Credentials
                          </SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleStatusChange}
                      disabled={status === project.status}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {(isDeveloper || isCto) && (
            <>
              <TabsContent value="credentials">
                <Card>
                  <CardHeader>
                    <CardTitle>Store Project Credentials</CardTitle>
                    <CardDescription>
                      Securely store important project credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {project.credentials?.length > 0 ? (
                        <div className="space-y-4">
                          {project.credentials.map((cred) => (
                            <div
                              key={cred._id}
                              className="p-4 border rounded-lg bg-gray-50"
                            >
                              <div className="flex justify-between">
                                <div>
                                  <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full mb-2 inline-block">
                                    {cred.type.charAt(0).toUpperCase() +
                                      cred.type.slice(1)}
                                  </span>
                                  <h4 className="font-medium">{cred.name}</h4>
                                  <p className="font-mono text-sm mt-1 bg-gray-100 p-1 rounded">
                                    {cred.value}
                                  </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(cred.dateAdded).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">
                          No credentials stored yet
                        </p>
                      )}

                      <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-medium">
                          Add New Credential
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor="credType"
                              className="text-sm font-medium block mb-1"
                            >
                              Credential Type
                            </label>
                            <Select
                              value={credentialType}
                              onValueChange={setCredentialType}
                            >
                              <SelectTrigger id="credType">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="domain">Domain</SelectItem>
                                <SelectItem value="hosting">Hosting</SelectItem>
                                <SelectItem value="database">Database</SelectItem>
                                <SelectItem value="api">API Key</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label
                              htmlFor="credName"
                              className="text-sm font-medium block mb-1"
                            >
                              Name/Description
                            </label>
                            <Input
                              id="credName"
                              placeholder="e.g., Domain login, Database password"
                              value={credentialName}
                              onChange={(e) =>
                                setCredentialName(e.target.value)
                              }
                            />
                          </div>
                          <div>
                            <label
                              htmlFor="credValue"
                              className="text-sm font-medium block mb-1"
                            >
                              Value
                            </label>
                            <Input
                              id="credValue"
                              placeholder="Credential value"
                              value={credentialValue}
                              onChange={(e) =>
                                setCredentialValue(e.target.value)
                              }
                            />
                          </div>
                          <Button
                            onClick={handleAddCredential}
                            disabled={
                              !credentialName.trim() || !credentialValue.trim()
                            }
                          >
                            <Key className="h-4 w-4 mr-2" />
                            Store Credential
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dates">
                <Card>
                  <CardHeader>
                    <CardTitle>Important Project Dates</CardTitle>
                    <CardDescription>
                      Set completion and renewal dates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          Project Completion Date
                        </h3>
                        {project.completionDate ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-4">
                              <span className="font-medium">
                                {new Date(project.completionDate).toLocaleDateString()}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setCompletionDate(project.completionDate);
                                  setProject(prev => ({
                                    ...prev,
                                    completionDate: null
                                  }));
                                }}
                              >
                                Change
                              </Button>
                            </div>
                            <Input
                              type="date"
                              value={completionDate}
                              onChange={(e) => setCompletionDate(e.target.value)}
                            />
                            <Button
                              onClick={handleUpdateCompletionDate}
                              disabled={!completionDate}
                              size="sm"
                            >
                              Update Completion Date
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              type="date"
                              value={completionDate}
                              onChange={(e) =>
                                setCompletionDate(e.target.value)
                              }
                            />
                            <Button
                              onClick={handleUpdateCompletionDate}
                              disabled={!completionDate}
                              size="sm"
                            >
                              Set Completion Date
                            </Button>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-sm font-medium flex items-center">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Project Renewal Date
                        </h3>
                        {project.renewalDate ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-4">
                              <span className="font-medium">
                                {new Date(project.renewalDate).toLocaleDateString()}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setRenewalDate(project.renewalDate);
                                  setProject(prev => ({
                                    ...prev,
                                    renewalDate: null
                                  }));
                                }}
                              >
                                Change
                              </Button>
                            </div>
                            <Input
                              type="date"
                              value={renewalDate}
                              onChange={(e) => setRenewalDate(e.target.value)}
                            />
                            <Button
                              onClick={handleUpdateRenewalDate}
                              disabled={!renewalDate}
                              size="sm"
                            >
                              Update Renewal Date
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              type="date"
                              value={renewalDate}
                              onChange={(e) => setRenewalDate(e.target.value)}
                            />
                            <Button
                              onClick={handleUpdateRenewalDate}
                              disabled={!renewalDate}
                              size="sm"
                            >
                              Set Renewal Date
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Project</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this project? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ProjectDetails;
