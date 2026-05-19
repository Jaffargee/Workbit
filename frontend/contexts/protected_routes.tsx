import React, { use } from "react";
import { useAuth } from "./authentication";
import Loading from "@/components/Loading";
import { useLocation, Navigate } from "react-router-dom";

interface ProtectedRoutesProps {
      children: React.ReactNode;
      requiredProfileComplete?: boolean;
      redirectTo?: string;
}


const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({children, requiredProfileComplete = true, redirectTo = '/auth/login'}) => {

      const { isAuthenticated, user, profile, loading } = useAuth();
      const location = useLocation();

      if (loading) {
            return (
                  <div className="flex flex-col w-full h-[100vh] items-center justify-center py-10">
                        <Loading />
                  </div>
            );
      }

      if (!isAuthenticated || !user) {
            return (
                  <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
            )
      }

      if (requiredProfileComplete && !profile && isAuthenticated ) {
            if(location.pathname !== '/auth/profile') {
                  return (
                        <Navigate to='/auth/profile' state={{ from: location.pathname }} replace />
                  )
            }
      }

      return <>{children}</>;

}

export default ProtectedRoutes;