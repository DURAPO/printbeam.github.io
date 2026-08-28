import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { Zap, ArrowLeft, User, Shield, Trash2, LogOut, Loader2, Save, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function AccountSettings() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Redirect if not authenticated
  if (!authLoading && !isAuthenticated) {
    navigate("/auth?returnTo=/account");
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // In production, this would call a Convex mutation to update user profile.
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background font-mono">
      <nav className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-success/10 text-success border border-success/20">
              <Zap className="size-3.5" />
            </div>
            <span className="text-xs font-bold tracking-tight">PrintBeam</span>
          </button>
          <button onClick={() => navigate("/dashboard")} className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5">
            <ArrowLeft className="size-3" /> Dashboard
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-2xl font-bold tracking-tight mb-6">Account Settings</h1>

        <div className="space-y-6">
          {/* Profile Section */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="size-4 text-success" />
                <CardTitle className="text-sm">Profile</CardTitle>
              </div>
              <CardDescription className="text-xs">Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Display Name</label>
                    <Input defaultValue="" placeholder="Your name" className="text-xs font-mono" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                    <Input type="email" defaultValue="" placeholder="you@gmail.com" className="text-xs font-mono" disabled />
                    <p className="text-[10px] text-muted-foreground mt-1">Email cannot be changed here</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
                    <Input type="tel" defaultValue="" placeholder="+1 (555) 000-0000" className="text-xs font-mono" />
                  </div>
                </div>
                <Button type="submit" disabled={saving} className="text-xs bg-[var(--ring)] hover:bg-[var(--ring)]/90 text-white">
                  {saving ? <Loader2 className="mr-2 size-3 animate-spin" /> : saved ? <CheckCircle className="mr-2 size-3" /> : <Save className="mr-2 size-3" />}
                  {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="size-4 text-success" />
                <CardTitle className="text-sm">Security</CardTitle>
              </div>
              <CardDescription className="text-xs">Manage your authentication and session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-xs font-medium">Active Session</p>
                  <p className="text-[10px] text-muted-foreground">Signed in via email authentication</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs" onClick={() => navigate("/forgot-password")}>
                  Change password
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="text-xs font-medium">Sign Out</p>
                  <p className="text-[10px] text-muted-foreground">End your current session</p>
                </div>
                <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/5">
                  <LogOut className="mr-1.5 size-3" /> Sign out
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-destructive/30 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm text-destructive">Danger Zone</CardTitle>
              <CardDescription className="text-xs">Permanent and irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              {!showDeleteConfirm ? (
                <div className="flex items-center justify-between rounded-lg border border-destructive/20 p-3">
                  <div>
                    <p className="text-xs font-medium">Delete Account</p>
                    <p className="text-[10px] text-muted-foreground">Permanently delete your account and all associated data</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="mr-1.5 size-3" /> Delete account
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                  <p className="text-xs font-medium text-destructive">Are you sure?</p>
                  <p className="text-[11px] text-muted-foreground">This action cannot be undone. All your data, print orders, and account information will be permanently deleted.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" className="text-xs bg-destructive hover:bg-destructive/90 text-white">
                      <Trash2 className="mr-1.5 size-3" /> Yes, delete my account
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
