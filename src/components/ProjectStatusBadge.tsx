
import React from "react";
import { ProjectStatus } from "@/context/ProjectContext";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const getStatusInfo = (status: ProjectStatus) => {
    switch (status) {
      case "requirements":
        return { label: "Waiting for Requirements", className: "status-requirements" };
      case "development":
        return { label: "Development In Progress", className: "status-development" };
      case "payment":
        return { label: "Waiting for Payment Gatway", className: "status-payment" };
      case "credentials":
        return { label: "Waiting for Credentials", className: "status-credentials" };
      case "completed":
        return { label: "Completed", className: "status-completed" };
    }
  };

  const statusInfo = getStatusInfo(status);

  return (
    <span className={cn("status-badge", statusInfo.className, className)}>
      {statusInfo.label}
    </span>
  );
}
