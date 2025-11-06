import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SalesDashboard from "./pages/SalesDashboard";
import WarehouseDashboard from "./pages/WarehouseDashboard";
import FinanceDashboard from "./pages/FinanceDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/super-admin/*" element={<SuperAdminDashboard />} />
            <Route path="/super_admin" element={<SuperAdminDashboard />} /> {/* Redirect for underscore variant */}
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/sales/*" element={<SalesDashboard />} />
            <Route path="/warehouse/*" element={<WarehouseDashboard />} />
            <Route path="/finance" element={<FinanceDashboard />} />
            <Route path="/customer" element={<CustomerDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
