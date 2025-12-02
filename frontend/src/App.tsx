import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import EarlyAccess from "./pages/EarlyAccess";
import BookDemo from "./pages/BookDemo";
import Login from "./pages/Login";
import Pitch from "./pages/Pitch";
import HarmoniaPitch from "./pages/HarmoniaPitch";
import ContactSales from "./pages/ContactSales";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import DashboardCreate from "./pages/DashboardCreate";
import DashboardInbox from "./pages/DashboardInbox";
import DashboardTicket from "./pages/DashboardTicket";
import DashboardAnalytics from "./pages/DashboardAnalytics";
import DashboardKnowledge from "./pages/DashboardKnowledge";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/early-access" element={<EarlyAccess />} />
          <Route path="/book-demo" element={<BookDemo />} />
          <Route path="/login" element={<Login />} />
          <Route path="/pitch" element={<Pitch />} />
          <Route path="/harmonia-pitch" element={<HarmoniaPitch />} />
          <Route path="/contact-sales" element={<ContactSales />} />
          
          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<Navigate to="/dashboard/create" replace />} />
            <Route path="create" element={<DashboardCreate />} />
            <Route path="inbox" element={<DashboardInbox />} />
            <Route path="ticket/:id" element={<DashboardTicket />} />
            <Route path="analytics" element={<DashboardAnalytics />} />
            <Route path="knowledge" element={<DashboardKnowledge />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
