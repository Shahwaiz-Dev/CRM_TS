import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from './pages/Login';
import Signup from './pages/Signup';
import Index from './pages/Index';
import Settings from './pages/Settings';
import { useEffect, useState } from "react";
import { PageLoader } from "@/components/ui/PageLoader";
import { GoogleMapsLoader } from "./components/GoogleMapsLoader";
import { useAppSelector } from "./store/hooks";

import { ThemeProvider } from "./components/ThemeProvider";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: JSX.Element }) {
  const isAuth = useAppSelector((state) => state.auth.isAuthenticated);
  return isAuth ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, [location]);

  return (
    <>
      {loading && <PageLoader />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/*" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="*" element={<Index />} />
      </Routes>
    </>
  );
}

const App = () => (
  <GoogleMapsLoader>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </GoogleMapsLoader>
);

export default App;
