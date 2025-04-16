
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext"; 
import { ProjectProvider } from "@/context/ProjectContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewProject from "./pages/NewProject";
import ProjectApproval from "./pages/ProjectApproval";
import ProjectDetails from "./pages/ProjectDetails";
import ClientTracker from "./pages/ClientTracker";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";
import AllProjects from "./pages/AllProjects";
import ManageDevelopers from "./pages/ManageDevelopers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProjectProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<ClientTracker />} />
              <Route path="/login" element={<Login />} />
              <Route path="/track" element={<ClientTracker />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected Routes for all authenticated users */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/projects/:id" element={
                <ProtectedRoute>
                  <ProjectDetails />
                </ProtectedRoute>
              } />
              
              {/* Sales Employee Routes */}
              <Route path="/projects/new" element={
                <ProtectedRoute allowedRoles={["sales"]}>
                  <NewProject />
                </ProtectedRoute>
              } />
              
              {/* CTO Routes */}
              <Route path="/projects/approval" element={
                <ProtectedRoute allowedRoles={["cto"]}>
                  <ProjectApproval />
                </ProtectedRoute>
              } />
              <Route path="/all-projects" element={
                <ProtectedRoute allowedRoles={["cto"]}>
                  <AllProjects />
                </ProtectedRoute>
              } />
              <Route path="/manage-developers" element={
                <ProtectedRoute allowedRoles={["cto"]}>
                  <ManageDevelopers />
                </ProtectedRoute>
              } />
              
              {/* Redirect legacy index to tracker */}
              <Route path="/index" element={<Navigate to="/" replace />} />
              
              {/* Catch-all for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProjectProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
