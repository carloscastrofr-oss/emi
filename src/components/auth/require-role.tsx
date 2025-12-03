"use client";

import { useAuth, UserRole } from "@/hooks/use-auth";
import { ReactNode } from "react";
import { Skeleton } from "../ui/skeleton";

interface RequireRoleProps {
  children: ReactNode;
  roles: UserRole[];
  fallback?: ReactNode;
  showIsBlocked?: boolean;
}

export function RequireRole({
  children,
  roles,
  fallback = null,
  showIsBlocked = false,
}: RequireRoleProps) {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <Skeleton className="h-10 w-full" />;
  }

  const hasAccess = userProfile && roles.includes(userProfile.role);

  if (!hasAccess) {
    if (showIsBlocked) {
      return <div className="opacity-50 cursor-not-allowed">{children}</div>;
    }
    return fallback;
  }

  return <>{children}</>;
}
