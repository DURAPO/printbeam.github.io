import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Zap, ArrowLeft, ArrowRight, Loader2, CheckCircle, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a production environment, this would call a Convex action
      // to send a password reset email via an email service.
      // For now, we simulate the flow.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSent(true);
    } catch {
      setError("Failed to send reset link. Please try again.");
      setIsLoading(false);
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
          {!sent ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-base">
                  <span className="text-success">⟩</span> reset password
                </CardTitle>
                <CardDescription className="text-xs">
                  Enter your email and we'll send you a link to reset your password
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        name="email"
                        placeholder="you@gmail.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 text-xs font-mono"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || !email}
                      className="bg-success hover:bg-success/90 text-white shrink-0"
                    >
                      {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
                </CardContent>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-success/10 border border-success/20">
                  <CheckCircle className="size-6 text-success" />
                </div>
                <CardTitle className="text-base">
                  <span className="text-success">⟩</span> check your email
                </CardTitle>
                <CardDescription className="text-xs">
                  We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>. The link expires in 60 minutes.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{" "}
                  <button onClick={() => { setSent(false); setError(null); }} className="text-success hover:underline">
                    try a different email address
                  </button>.
                </p>
              </CardContent>
            </>
          )}
          <CardFooter className="flex-col gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate("/auth")} className="w-full text-xs text-muted-foreground">
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
