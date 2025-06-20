
import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log("RoleBasedRoute", { user, allowedRoles });

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  };
  if (!user) {
    console.log("No user found in context");
    return <Navigate to="/login" state={{ from: location }} replace />;
  };
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoute;