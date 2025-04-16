import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PlusCircle,
  CheckCircle,
  List,
  Clock,
  Activity,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { ProjectCard } from "@/components/ProjectCard";
import { Navbar } from "@/components/Navbar";

const Dashboard = () => {
  const { user } = useAuth();
  const { projects } = useProjects();

  // Filter projects based on user role
  const filteredProjects = projects.filter((project) => {
    switch (user?.role) {
      case "sales":
        return project.createdBy === user._id;
      case "cto":
        return true;
      case "developer":
        return project.assignedTo?._id === user._id;
      default:
        return false;
    }
  });

  // Filter for pending approval
  const pendingApproval = projects.filter((p) => !p.approved);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-20 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
            {user?.role === "sales" && (
              <Link to="/projects/new">
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </Link>
            )}
            {user?.role === "cto" && (
              <>
                {pendingApproval.length > 0 && (
                  <Link to="/projects/approval">
                    <Button>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve Projects ({pendingApproval.length})
                    </Button>
                  </Link>
                )}
                <Link to="/all-projects">
                  <Button variant="outline">
                    <List className="h-4 w-4 mr-2" />
                    View All Projects
                  </Button>
                </Link>
                <Link to="/manage-developers">
                  <Button variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Developers
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total Projects</CardTitle>
              <CardDescription>Your accessible projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center">
                <List className="h-5 w-5 mr-2 text-primary" />
                {filteredProjects.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">In Progress</CardTitle>
              <CardDescription>Projects currently active</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center">
                <Activity className="h-5 w-5 mr-2 text-amber-500" />
                {filteredProjects.filter((p) => p.status !== "completed").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Completed</CardTitle>
              <CardDescription>Successfully delivered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                {filteredProjects.filter((p) => p.status === "completed").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your most recent projects</CardDescription>
            </CardHeader>

            <CardContent>
              {filteredProjects.length > 0 ? (
                <div className="grid gap-4">
                  <ProjectCard projects={filteredProjects} />
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No projects found</p>
                  {user?.role === "sales" && (
                    <Link to="/projects/new">
                      <Button variant="outline" className="mt-4">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create your first project
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
