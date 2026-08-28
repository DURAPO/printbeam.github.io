import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Loader2, Mail, Zap } from "lucide-react";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

interface AuthProps { redirectAfterAuth?: string; }

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const { isLoading: authLoading, isAuthenticated, signIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), redirectAfterAuth);
  const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate(redirect);
  }, [authLoading, isAuthenticated, navigate, redirect]);

  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      setStep({ email: formData.get("email") as string });
      setIsLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send verification code. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData(event.currentTarget);
      await signIn("email-otp", formData);
      navigate(redirect);
    } catch {
      setError("The verification code you entered is incorrect.");
      setIsLoading(false);
      setOtp("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-mono">
      <nav className="border-b border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-3">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-success/10 text-success border border-success/20"><Zap className="size-3.5" /></div>
            <span className="text-xs font-bold tracking-tight">PrintBeam</span>
          </button>
          <ThemeSwitcher />
        </div>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <Card className="min-w-[340px] max-w-[380px] w-full border-border shadow-sm">
          {step === "signIn" ? (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-base"><span className="text-success">⟩</span> sign in</CardTitle>
                <CardDescription className="text-xs">Enter your email to continue</CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailSubmit}>
                <CardContent>
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <Input name="email" placeholder="you@gmail.com" type="email" className="pl-9 text-xs font-mono" disabled={isLoading} required />
                    </div>
                    <Button type="submit" size="icon" disabled={isLoading} className="bg-success hover:bg-success/90 text-white shrink-0">
                      {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
                  <div className="mt-3 flex justify-end">
                    <Button type="button" variant="link" className="p-0 h-auto text-[10px] text-muted-foreground" onClick={() => navigate("/forgot-password")}>
                      forgot password?
                    </Button>
                  </div>

                </CardContent>
              </form>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-base"><span className="text-success">⟩</span> verify code</CardTitle>
                <CardDescription className="text-xs">code sent to {step.email}</CardDescription>
              </CardHeader>
              <form onSubmit={handleOtpSubmit}>
                <CardContent className="pb-4">
                  <input type="hidden" name="email" value={step.email} />
                  <input type="hidden" name="code" value={otp} />
                  <div className="flex justify-center">
                    <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={isLoading}
                      onKeyDown={(e) => { if (e.key === "Enter" && otp.length === 6 && !isLoading) { (e.target as HTMLElement).closest("form")?.requestSubmit(); } }}>
                      <InputOTPGroup>{Array.from({ length: 6 }).map((_, index) => (<InputOTPSlot key={index} index={index} />))}</InputOTPGroup>
                    </InputOTP>
                  </div>
                  {error && <p className="mt-2 text-xs text-destructive text-center">{error}</p>}
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Didn't receive a code? <Button variant="link" className="p-0 h-auto text-success text-xs" onClick={() => setStep("signIn")}>try again</Button>
                  </p>
                </CardContent>
                <CardFooter className="flex-col gap-2">
                  <Button type="submit" className="w-full text-xs bg-success hover:bg-success/90 text-white" disabled={isLoading || otp.length !== 6}>
                    {isLoading ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> verifying…</> : <>verify code <ArrowRight className="ml-2 h-3.5 w-3.5" /></>}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setStep("signIn")} disabled={isLoading} className="w-full text-xs text-muted-foreground">use different email</Button>
                </CardFooter>
              </form>
            </>
          )}
          <div className="py-3 px-6 text-[10px] text-center text-muted-foreground/60 bg-muted/50 border-t rounded-b-lg tracking-wide">secured by freebuff.com</div>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return <Suspense><Auth {...props} /></Suspense>;
}
