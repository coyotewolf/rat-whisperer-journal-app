import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSettingsProvider } from "@/contexts/AppSettingsContext";
import Index from "./pages/Index";
import RatsPage from "./pages/RatsPage";
import LogsPage from "./pages/LogsPage";
import ReportsPage from "./pages/ReportsPage";
import LibraryPage from "./pages/LibraryPage";
import ToolsPage from "./pages/ToolsPage";
import TasksPage from "./pages/TasksPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Suspense fallback="Loading...">
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/rats" element={<RatsPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  </Suspense>
);

export default App;
