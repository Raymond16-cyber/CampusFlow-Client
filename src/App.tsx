import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute, GuestRoute } from "@/components/ProtectedRoute";
import { setAuthTokenGetter } from "@/lib/api-client";
import { useEffect } from "react";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Queues from "@/pages/queues";
import QueueDetail from "@/pages/queue-detail";
import History from "@/pages/history";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login">
        <GuestRoute>
          <Login />
        </GuestRoute>
      </Route>
      <Route path="/register">
        <GuestRoute>
          <Register />
        </GuestRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/queues">
        <ProtectedRoute>
          <Queues />
        </ProtectedRoute>
      </Route>
      <Route path="/queues/:id">
        <ProtectedRoute>
          <QueueDetail />
        </ProtectedRoute>
      </Route>
      <Route path="/history">
        <ProtectedRoute>
          <History />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <AdminRoute>
          <Admin />
        </AdminRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppInit() {
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem('campusflow_token') ?? '');
  }, []);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="campusflow_theme">
        <AuthProvider>
          <AppInit />
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
