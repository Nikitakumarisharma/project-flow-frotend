
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useProjects,ProjectStatus } from "@/context/ProjectContext";
import { Navbar } from "@/components/Navbar";


const NewProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createProject } = useProjects();
  
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    description: "",
    requirements: "",
    createdBy:"",
    status: "requirements",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    console.log("🔥 handleSubmit called");

    const payload = {
      clientName: formData.clientName,
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,
      description: formData.description,
      requirements: formData.requirements,
      createdBy: user._id,
      status: formData.status as ProjectStatus, // 👈 Fix here
    };
    
  
    try {
      console.log("🔥 Creating project with payload:", payload);
      await createProject(payload);
      
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Failed to create project:", err);
    }
        
  };
  
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4 md:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
          <p className="text-gray-500 mt-1">
            Enter the details of the new project
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="clientName" className="text-sm font-medium">
                  Client Name
                </label>
                <Input
                  id="clientName"
                  name="clientName"
                  placeholder="e.g. Acme Corporation"
                  value={formData.clientName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="clientEmail" className="text-sm font-medium">
                  Client Email
                </label>
                <Input
                  id="clientEmail"
                  name="clientEmail"
                  type="email"
                  placeholder="contact@example.com"
                  value={formData.clientEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="clientPhone" className="text-sm font-medium">
                  Client Phone
                </label>
                <Input
                  id="clientPhone"
                  name="clientPhone"
                  placeholder="e.g. 555-123-4567"
                  value={formData.clientPhone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Project Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of the project"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="requirements" className="text-sm font-medium">
                  Project Requirements
                </label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Detailed requirements for the project"
                  value={formData.requirements}
                  onChange={handleChange}
                  rows={5}
                  required
                />
              </div>
              
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit">Create Project</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default NewProject;
