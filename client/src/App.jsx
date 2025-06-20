import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import React from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CourseCatalog from "./pages/CourseCatalog";
import CoursePlayer from "./pages/CoursePlayer";
import AddCourse from "./pages/AddCourse";
import CourseContent from "./pages/CourseContent";
import StudentDashboard from "./pages/StudentDashboard";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import OAuthSuccess from "./pages/OAuthSuccess";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleBasedRoute from "./components/auth/RoleBasedRoute";
import LoadingSpinner from "./components/ui/LoadingSpinner";
import { Suspense, lazy } from "react";

// Lazy load heavy components for better performance
const LazyAdminPanel = lazy(() => import("./pages/AdminPanel"));
const LazyInstructorPanel = lazy(() => import("./pages/InstructorPanel"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2, // Retry failed queries twice
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" richColors />
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route path="/course/:id" element={<CoursePlayer />} />
            <Route path="/oauth/success" element={<OAuthSuccess />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Student Routes */}
              <Route element={<RoleBasedRoute allowedRoles={["student"]} />}>
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/my-courses" element={<CourseCatalog />} />
                <Route path="/student/course/:id" element={<CoursePlayer />} />
                <Route path="/student/progress" element={<StudentDashboard />} />
                <Route path="/student/assignments" element={<StudentDashboard />} />
                <Route path="/student/notifications" element={<StudentDashboard />} />
              </Route>
              
              {/* Instructor Routes */}
              <Route element={<RoleBasedRoute allowedRoles={["instructor"]} />}>
                <Route path="/instructor" element={<LazyInstructorPanel />} />
                <Route path="/instructor/add-course" element={<AddCourse />} />
                <Route path="/instructor/course/:courseId/content" element={<CourseContent />} />
                <Route path="/instructor/courses" element={<LazyInstructorPanel />} />
                <Route path="/instructor/analytics" element={<LazyInstructorPanel />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<RoleBasedRoute allowedRoles={["admin"]} />}>
                <Route path="/admin" element={<LazyAdminPanel />} />
                <Route path="/admin/users" element={<LazyAdminPanel />} />
                <Route path="/admin/courses" element={<LazyAdminPanel />} />
                <Route path="/admin/reports" element={<LazyAdminPanel />} />
              </Route>
            </Route>

            {/* Error Handling */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;