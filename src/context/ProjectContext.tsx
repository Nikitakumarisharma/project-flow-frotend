import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

export type ProjectStatus =
  | "requirements"   // Waiting for client requirements
  | "development"    // Development undergoing
  | "payment"        // Waiting for payment gateway
  | "credentials"    // Waiting for domain/hosting credentials
  | "completed";     // Project completed

export interface Credential {
  _id?: string;
  type: string;
  name: string;
  value: string;
  dateAdded: string;
}

export interface ProjectNote {
  content: string;
  author: string;
  isPublic: boolean;
  createdAt: string;
}

export interface Project {
  _id?: string;
  referenceId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  description: string;
  requirements: string;
  status: ProjectStatus;
  approved: boolean;
  assignedTo: {
    _id: string;
    name: string;
    email?: string;
  } | null;
  
  // assignedTo: string | null;
  deadline: string | null;
  createdBy: string;
  createdAt: string;
  completionDate: string | null;
  renewalDate: string | null;
  notes: ProjectNote[];
  credentials: Credential[];
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, "_id" | "referenceId" | "approved" | "assignedTo" | "deadline" | "createdAt" | "completionDate" | "renewalDate" | "notes" | "credentials">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (projectId: string) => void;
  approveProject: (projectId: string, developerId: string, deadline: string) => void;
  rejectProject: (projectId: string) => void;
  updateProjectStatus: (_id: string, status: ProjectStatus) => void;
  getProjectByReferenceId: (referenceId: string) => Project | null;
  getProjectById: (_id: string) => Project | null;
  getProjectsByUserId: (userId: string) => Promise<Project[]>;
  getNotesByProjectId: (projectId: string) => Promise<ProjectNote[]>;
  addProjectNote: (projectId: string, note: Omit<ProjectNote, "_id" | "createdAt">) => Promise<any>;
  addCredential: (projectId: string, credential: Omit<Credential, "_id" | "dateAdded">) => void;
  updateCompletionDate: (projectId: string, date: string) => void;
  updateRenewalDate: (projectId: string, date: string) => void;
}

const ProjectContext = createContext<ProjectContextType>({} as ProjectContextType);

export const useProjects = () => useContext(ProjectContext);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const BASE_URL = "https://project-flow-backend.vercel.app/api";

  // Fetch projects from backend
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/projects`);
      setProjects(res.data.data || []);
    } catch (err: any) {
      toast({
        title: "❌ Failed to fetch projects",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new project backend
  const createProject = async (project: Omit<Project, "_id" | "referenceId" | "approved" | "assignedTo" | "deadline" | "createdAt" | "completionDate" | "renewalDate" | "notes" | "credentials">) => {
    try {
      const res = await axios.post(`${BASE_URL}/projects/newProject`, {
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        clientPhone: project.clientPhone,
        description: project.description,
        requirements: project.requirements,
        status: project.status,
        createdBy: project.createdBy,
      });

      toast({
        title: "✅ Project Created",
        description: `Saved to backend`,
      });

      // Fetch updated list after backend responds successfully
      await fetchProjects();

    } catch (err: any) {
      toast({
        title: "❌ Failed to create project",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Approve project backend
  const approveProject = async (projectId: string, developerId: string, deadline: string) => {
    try {
      console.log('Approving project with data:', { projectId, developerId, deadline });
      
      const response = await axios.put(
        `${BASE_URL}/projects/assignUser/${projectId}`,
        {
          assignedTo: developerId,
          deadline: new Date(deadline).toISOString()
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      console.log('Backend response:', response.data);

      if (response.data.success) {
        const updatedProject = response.data.data;
        console.log('Updated project data:', updatedProject);
        
        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project._id === projectId ? updatedProject : project
          )
        );
        toast({
          title: "Success",
          description: "Project approved successfully!",
        });
      }
    } catch (error) {
      console.error("Error approving project:", error);
      toast({
        title: "Error",
        description: "Failed to approve project",
        variant: "destructive",
      });
    }
  };
  
  

  // Reject project (removes from the system)
  const rejectProject = (_id: string) => {
    setProjects(projects.filter(project => project._id !== _id));

    toast({
      title: "Project Rejected",
      description: "Project has been removed from the system",
      variant: "destructive"
    });
  };

  // Update project status
  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/projects/updateStatus/${projectId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Update the project in the local state with the response data
      setProjects(prevProjects => 
        prevProjects.map(project => 
          project._id === projectId 
            ? { ...project, status: response.data.data.status } 
            : project
        )
      );
      
      toast({
        title: "Success",
        description: "Project status updated successfully",
      });
    } catch (error) {
      console.error("Error updating project status:", error);
      toast({
        title: "Error",
        description: "Failed to update project status",
        variant: "destructive",
      });
    }
  };

  // Add project note backend
  const addProjectNote = async (projectId: string, note: Omit<ProjectNote, "_id" | "createdAt">) => {
    const newNote: ProjectNote = {
      ...note,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await axios.post(`${BASE_URL}/projects/addNote/${projectId}`, newNote);

      if (response.data.success) {
        setProjects((prevProjects) =>
          prevProjects.map((project) =>
            project._id === projectId
              ? { ...project, notes: [...(project.notes || []), response.data.data.notes[response.data.data.notes.length - 1]] }
              : project
          )
        );

        toast({
          title: "✅ Note Added",
          description: "Your note has been added to the project",
        });

        return response.data;
      } else {
        toast({
          title: "❌ Failed to add note",
          description: response.data.message || "Something went wrong",
          variant: "destructive",
        });
        throw new Error(response.data.message || "Failed to add note");
      }
    } catch (error) {
      toast({
        title: "❌ Failed to add note",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Add credential
  const addCredential = async (projectId: string, credential: Omit<Credential, "_id" | "dateAdded">) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/projects/addCredential/${projectId}`,
        credential,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        // Update the project in the local state with the new credential
        setProjects(prevProjects =>
          prevProjects.map(project =>
            project._id === projectId
              ? { ...project, credentials: response.data.data.credentials || [] }
              : project
          )
        );

        toast({
          title: "Success",
          description: "Credential added successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to add credential");
      }
    } catch (error) {
      console.error("Error adding credential:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add credential",
        variant: "destructive",
      });
    }
  };

  // Update completion date
  const updateCompletionDate = async (projectId: string, date: string) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/projects/updateCompletionDate/${projectId}`,
        { completionDate: date },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setProjects(projects.map(project => 
          project._id === projectId ? { ...project, completionDate: date } : project
        ));

        toast({
          title: "Success",
          description: "Completion date updated successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to update completion date");
      }
    } catch (error) {
      console.error("Error updating completion date:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update completion date",
        variant: "destructive",
      });
    }
  };

  // Update renewal date
  const updateRenewalDate = async (projectId: string, date: string) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/projects/updateRenewalDate/${projectId}`,
        { renewalDate: date },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setProjects(projects.map(project => 
          project._id === projectId ? { ...project, renewalDate: date } : project
        ));

        toast({
          title: "Success",
          description: "Renewal date updated successfully",
        });
      } else {
        throw new Error(response.data.message || "Failed to update renewal date");
      }
    } catch (error) {
      console.error("Error updating renewal date:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update renewal date",
        variant: "destructive",
      });
    }
  };

  // Get project by reference ID
  const getProjectByReferenceId = (referenceId: string) => {
    return projects.find(project => project.referenceId === referenceId) || null;
  };

  // Get project by ID
  const getProjectById = (_id: string) => {
    return projects.find(project => project._id === _id) || null;
  };

  // Get all projects created by a specific user
const getProjectsByUserId = async (userId: string): Promise<Project[]> => {
  try {
    const res = await axios.get(`${BASE_URL}/projects/${userId}`);
    return res.data.data || [];
  } catch (err: any) {
    toast({
      title: "❌ Failed to get user projects",
      description: err.message,
      variant: "destructive",
    });
    return [];
  }
};

// Get all notes for a specific project
const getNotesByProjectId = async (projectId: string): Promise<ProjectNote[]> => {
  try {
    const res = await axios.get(`${BASE_URL}/projects/getNotes/${projectId}`);
    return res.data.notes || [];
  } catch (err: any) {
    toast({
      title: "❌ Failed to fetch project notes",
      description: err.message,
      variant: "destructive",
    });
    return [];
  }
};

  const updateProject = async (project: Project) => {
    try {
      const response = await fetch(`${BASE_URL}/projects/${project._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      });

      if (!response.ok) {
        throw new Error("Failed to update project");
      }

      const updatedProject = await response.json();
      setProjects((prevProjects) =>
        prevProjects.map((p) =>
          p._id === updatedProject._id ? updatedProject : p
        )
      );

      toast({
        title: "Success",
        description: "Project updated successfully!",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const response = await axios.delete(`${BASE_URL}/projects/deleteProject/${projectId}`);

      if (response.data.success) {
        setProjects((prevProjects) =>
          prevProjects.filter((p) => p._id !== projectId)
        );

        toast({
          title: "Success",
          description: "Project deleted successfully!",
        });
      } else {
        throw new Error(response.data.message || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        loading,
        error,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        approveProject,
        rejectProject,
        updateProjectStatus,
        getProjectByReferenceId,
        getProjectById,
        getProjectsByUserId,
        getNotesByProjectId,
        addProjectNote,
        addCredential,
        updateCompletionDate,
        updateRenewalDate,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
