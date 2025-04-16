import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Check authentication status on mount and when location changes
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token && !loading) {
      console.log("No token found, redirecting to login");
    }
  }, [loading, location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, save the current path and redirect to login
  if (!isAuthenticated || !localStorage.getItem("token")) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If no specific roles are required, allow access
  if (!allowedRoles) {
    return <>{children}</>;
  }

  // If user's role is not in allowed roles, redirect to appropriate dashboard
  if (user && !allowedRoles.includes(user.role)) {
    let redirectPath = "/dashboard";
    
    // Determine the appropriate dashboard based on user role
    switch (user.role) {
      case "sales":
        redirectPath = "/dashboard";
        break;
      case "cto":
        redirectPath = "/all-projects";
        break;
      case "developer":
        redirectPath = "/dashboard";
        break;
      default:
        redirectPath = "/dashboard";
    }

    console.log("Unauthorized access, redirecting to", redirectPath);
    return <Navigate to={redirectPath} state={{ attemptedPath: location.pathname }} replace />;
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
}
