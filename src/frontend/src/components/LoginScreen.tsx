import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { AuthUser } from "../types";

interface Props {
  onLogin: (user: AuthUser) => void;
}

export default function LoginScreen({ onLogin }: Props) {
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"worker" | "admin">("worker");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim() || !name.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    onLogin({ employeeId: employeeId.trim(), name: name.trim(), role });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/40 mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M16 4L28 28H4L16 4Z" fill="oklch(0.60 0.20 262)" />
              <path d="M16 10L24 26H8L16 10Z" fill="oklch(0.12 0.03 240)" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            AXON Dispatch
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Tool &amp; Machine Dispatch System
          </p>
        </div>

        {/* Card */}
        <div className="card-panel p-6 shadow-card">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="employeeId"
                className="text-sm font-medium text-muted-foreground"
              >
                Employee ID
              </Label>
              <Input
                id="employeeId"
                data-ocid="login.input"
                placeholder="e.g. W001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="bg-input border-border h-12 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="fullName"
                className="text-sm font-medium text-muted-foreground"
              >
                Full Name
              </Label>
              <Input
                id="fullName"
                data-ocid="login.input"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-input border-border h-12 text-base"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-muted-foreground">
                Role
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  data-ocid="login.radio"
                  onClick={() => setRole("worker")}
                  className={`h-12 rounded-lg border font-medium text-sm transition-all ${
                    role === "worker"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-input text-muted-foreground hover:border-accent"
                  }`}
                >
                  👷 Worker
                </button>
                <button
                  type="button"
                  data-ocid="login.radio"
                  onClick={() => setRole("admin")}
                  className={`h-12 rounded-lg border font-medium text-sm transition-all ${
                    role === "admin"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-input text-muted-foreground hover:border-accent"
                  }`}
                >
                  🔑 Admin
                </button>
              </div>
            </div>

            {error && (
              <p
                data-ocid="login.error_state"
                className="text-destructive text-sm"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              data-ocid="login.submit_button"
              className="w-full text-base font-semibold bg-primary hover:bg-primary/90"
              style={{ height: "52px" }}
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Try: Employee ID <span className="text-foreground/60">W001</span> ·
          Name <span className="text-foreground/60">James Hartley</span> · Role
          Worker
        </p>

        <footer className="text-center text-xs text-muted-foreground mt-8">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
