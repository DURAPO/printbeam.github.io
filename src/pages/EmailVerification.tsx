import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowLeft, Loader2, Mail, CheckCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function EmailVerification() {
  const navigate = useNavigate();
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setIsResending(true);
    setError(null);
    try {
      // In production, this would call a Convex action to resend the verification email.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setResent(true);
      setTimeout(() => setResent(false), 3000);
    } catch {
      setError("Failed to resend. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-mono">
      <nav className="border-b border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-success/10 text-success border border-success/20">
              <Zap className="size-3.5" />
            </div>
            <span className="text-xs font-bold tracking-tight">PrintBeam</span>
          </button>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="min-w-[340px] max-w-[400px] w-full border-border shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-success/10 border border-success/20">
              <Mail className="size-6 text-success" />
            </div>
            <CardTitle className="text-base">
              <span className="text-success">⟩</span> verify your email
            </CardTitle>
            <CardDescription className="text-xs">
              We've sent a verification link to your email address. Click the link to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="size-3.5 text-success" />
                  <span>Check your inbox</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="size-3.5 text-success" />
                  <span>Click the verification link</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="size-3.5 text-success" />
                  <span>You'll be redirected to your dashboard</span>
                </div>
              </div>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            {resent && (
              <p className="text-xs text-success flex items-center justify-center gap-1.5">
                <CheckCircle className="size-3" /> Verification email resent
              </p>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button
              onClick={handleResend}
              disabled={isResending}
              className="w-full text-xs bg-success hover:bg-success/90 text-white"
            >
              {isResending ? (
                <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Resending…</>
              ) : (
                <><RefreshCw className="mr-2 h-3.5 w-3.5" /> Resend verification email</>
              )}
            </Button>
            <Button variant="ghost" onClick={() => navigate("/auth")} className="w-full text-xs text-muted-foreground">
              <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to sign in
            </Button>
          </CardFooter>
          <div className="py-3 px-6 text-[10px] text-center text-muted-foreground/60 bg-muted/50 border-t rounded-b-lg tracking-wide">
            secured by freebuff.com
          </div>
        </Card>
      </div>
    </div>
  );
}
