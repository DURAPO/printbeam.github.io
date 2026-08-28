import '@vly-ai/integrations';
import { Toaster } from "@/components/ui/sonner";
import { RequireAuth } from "@/components/RequireAuth";
import { ThemeProvider } from "@/hooks/use-theme";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, useEffect, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";

// Lazy load route components for better code splitting
const Landing = lazy(() => import("./pages/Landing.tsx"));
const AuthPage = lazy(() => import("./pages/Auth.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const NewPrint = lazy(() => import("./pages/NewPrint.tsx"));
const PrintJobDetail = lazy(() => import("./pages/PrintJobDetail.tsx"));
const StoreOnboarding = lazy(() => import("./pages/StoreOnboarding.tsx"));
const StoreDashboard = lazy(() => import("./pages/StoreDashboard.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
// Auth & Account
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const EmailVerification = lazy(() => import("./pages/EmailVerification.tsx"));
const AccountSettings = lazy(() => import("./pages/AccountSettings.tsx"));
// Legal & Compliance
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.tsx"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy.tsx"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy.tsx"));
const AccessibilityStatement = lazy(() => import("./pages/AccessibilityStatement.tsx"));
const AcceptableUsePolicy = lazy(() => import("./pages/AcceptableUsePolicy.tsx"));
const SecurityPolicy = lazy(() => import("./pages/SecurityPolicy.tsx"));
const CommunityGuidelines = lazy(() => import("./pages/CommunityGuidelines.tsx"));
// Support
const Support = lazy(() => import("./pages/Support.tsx"));
// System States
const Forbidden = lazy(() => import("./pages/Forbidden.tsx"));
const ServerError = lazy(() => import("./pages/ServerError.tsx"));
const MaintenancePage = lazy(() => import("./pages/Maintenance.tsx"));
const OfflinePage = lazy(() => import("./pages/OfflinePage.tsx"));
const SessionExpired = lazy(() => import("./pages/SessionExpired.tsx"));

// Simple loading fallback for route transitions
function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  );
}

/** Silent error boundary — if VlyToolbar crashes it renders nothing instead of
 *  crashing the whole app (e.g. hook errors in WebContainer environment). */
class ToolbarErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err: Error) {
    console.warn("[VlyToolbar] Caught error, toolbar disabled:", err.message);
  }
  render() {
    return this.state.hasError ? null : this.props.children;
  }
}

/** Hard guard so runtime errors never leave the preview as a blank page. */
class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string; stack: string }
> {
  state = { hasError: false, message: "", stack: "" };
  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      message: error.message || "Unknown runtime error",
      stack: error.stack || "",
    };
  }
  componentDidCatch(err: Error) {
    console.error("[WebContainer preview] Root crash:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-lg text-center">
            <p className="text-sm font-semibold">Preview runtime error</p>
            <p className="mt-2 text-xs text-muted-foreground break-words">
              {this.state.message}
            </p>
            {this.state.stack && (
              <pre className="mt-3 text-left text-[10px] leading-4 text-muted-foreground/80 max-h-40 overflow-auto rounded border border-border/60 p-2">
                {this.state.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ToolbarErrorBoundary>
        <VlyToolbar />
      </ToolbarErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <ThemeProvider>
        <BrowserRouter>
          <RouteSyncer />
          <Suspense fallback={<RouteLoading />}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route
                path="/auth"
                element={<AuthPage redirectAfterAuth="/dashboard" />}
              />
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              <Route
                path="/new-print"
                element={
                  <RequireAuth>
                    <NewPrint />
                  </RequireAuth>
                }
              />
              <Route
                path="/print/:id"
                element={
                  <RequireAuth>
                    <PrintJobDetail />
                  </RequireAuth>
                }
              />
              <Route
                path="/store-onboarding"
                element={
                  <RequireAuth>
                    <StoreOnboarding />
                  </RequireAuth>
                }
              />
              <Route
                path="/store-dashboard"
                element={
                  <RequireAuth>
                    <StoreDashboard />
                  </RequireAuth>
                }
              />
              {/* Auth & Account */}
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/email-verification" element={<EmailVerification />} />
              <Route path="/account" element={<RequireAuth><AccountSettings /></RequireAuth>} />
              {/* Support */}
              <Route path="/support" element={<Support />} />
              {/* Legal & Compliance */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/accessibility" element={<AccessibilityStatement />} />
              <Route path="/acceptable-use" element={<AcceptableUsePolicy />} />
              <Route path="/security" element={<SecurityPolicy />} />
              <Route path="/community-guidelines" element={<CommunityGuidelines />} />
              {/* System States */}
              <Route path="/403" element={<Forbidden />} />
              <Route path="/500" element={<ServerError />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/offline" element={<OfflinePage />} />
              <Route path="/session-expired" element={<SessionExpired />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
        <Toaster />
        </ThemeProvider>
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
