import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  Search,
  Sun,
  User,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import type { AuthUser, Dispatch } from "../../types";
import DispatchDetailSheet from "../shared/DispatchDetailSheet";
import OfflineBanner from "../shared/OfflineBanner";
import StatusBadge from "../shared/StatusBadge";

interface Props {
  user: AuthUser;
  dispatches: Dispatch[];
  onStartDispatch: () => void;
  onLogout: () => void;
}

const STAT_ITEMS = [
  { label: "Today", color: "text-primary" },
  { label: "Completed", color: "text-success" },
  { label: "Pending", color: "text-warning" },
] as const;

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: ClipboardList, label: "Dispatches", active: false },
  { icon: User, label: "Profile", active: false },
] as const;

function AxonLogo() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M16 4L28 28H4L16 4Z" fill="oklch(0.60 0.20 262)" />
      <path d="M16 10L24 26H8L16 10Z" fill="oklch(0.12 0.03 240)" />
    </svg>
  );
}

export default function WorkerDashboard({
  user,
  dispatches,
  onStartDispatch,
  onLogout,
}: Props) {
  const { theme, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(
    null,
  );

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = dispatches.filter((d) =>
    d.createdAt.startsWith(today),
  ).length;
  const completedCount = dispatches.filter(
    (d) => d.status === "completed",
  ).length;
  const pendingCount = dispatches.filter((d) => d.status === "pending").length;
  const statValues = [todayCount, completedCount, pendingCount];

  const recent = [...dispatches]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10);

  const filtered = search.trim()
    ? recent.filter(
        (d) =>
          d.id.toLowerCase().includes(search.toLowerCase()) ||
          d.machineType.toLowerCase().includes(search.toLowerCase()) ||
          d.clientName.toLowerCase().includes(search.toLowerCase()),
      )
    : recent.slice(0, 5);

  const fmt = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · ${d.toLocaleDateString()}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <AxonLogo />
          </div>
          <div>
            <p className="text-xs text-muted-foreground leading-none">
              AXON Dispatch
            </p>
            <p className="text-sm font-semibold text-foreground leading-tight">
              {user.name}
            </p>
          </div>
        </div>
        <button
          type="button"
          data-ocid="nav.toggle"
          onClick={toggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
          className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4" aria-hidden="true" />
          ) : (
            <Moon className="w-4 h-4" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          data-ocid="nav.button"
          onClick={onLogout}
          aria-label="Log out"
          className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
        </button>
      </header>

      <OfflineBanner />

      <main className="flex-1 p-4 space-y-5 pb-24">
        {/* Welcome */}
        <div className="pt-2">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Welcome back,
          </h1>
          <p className="font-display text-2xl font-bold text-primary">
            {user.name.split(" ")[0]}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {STAT_ITEMS.map((s, i) => (
            <div key={s.label} className="card-panel p-3 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{statValues[i]}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          onClick={onStartDispatch}
          data-ocid="dashboard.primary_button"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base gap-2"
          style={{ height: "56px" }}
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
          Start New Dispatch
        </Button>

        {/* Recent Dispatches */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">
            Recent Dispatches
          </h2>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              data-ocid="dispatch.search_input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, machine, or client..."
              className="pl-9 bg-input border-border h-10 text-sm"
            />
          </div>

          {filtered.length === 0 ? (
            <div
              data-ocid="dispatch.empty_state"
              className="card-panel p-8 text-center"
            >
              <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">
                {search
                  ? "No dispatches match your search"
                  : "No dispatches yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  data-ocid={`dispatch.item.${i + 1}`}
                  onClick={() => setSelectedDispatch(d)}
                  className="card-panel p-4 flex items-start gap-3 w-full text-left hover:border-primary/40 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono text-primary/80">
                        {d.id}
                      </span>
                      <StatusBadge status={d.status} />
                    </div>
                    <p className="text-sm font-semibold text-foreground mt-1 truncate">
                      {d.machineType}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.clientName} · {fmt(d.createdAt)}
                    </p>
                  </div>
                  <span className="text-xs text-primary/60 group-hover:text-primary transition-colors flex-shrink-0 pt-1">
                    View →
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Sheet */}
      {selectedDispatch && (
        <DispatchDetailSheet
          dispatch={selectedDispatch}
          onClose={() => setSelectedDispatch(null)}
        />
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-card/95 backdrop-blur border-t border-border flex">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            type="button"
            data-ocid="nav.tab"
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              item.active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" aria-hidden="true" />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
