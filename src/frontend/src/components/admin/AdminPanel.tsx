import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Camera,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Moon,
  PackageCheck,
  Plus,
  QrCode,
  Sun,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import type { AuthUser, Dispatch, ToolkitReferences } from "../../types";
import { CHECKLIST_TEMPLATE, MACHINE_TYPES } from "../../types";
import { formatDuration } from "../../utils/formatDuration";
import OfflineBanner from "../shared/OfflineBanner";
import PhotoLightbox from "../shared/PhotoLightbox";
import StatusBadge from "../shared/StatusBadge";

interface Props {
  user: AuthUser;
  dispatches: Dispatch[];
  toolkitReferences: ToolkitReferences;
  onUpdateToolkitReferences: (refs: ToolkitReferences) => void;
  onLogout: () => void;
}

const STAT_LABELS = [
  "Total Dispatches",
  "Today",
  "Completed",
  "Pending",
  "Workers",
] as const;

const STAT_COLORS: Record<string, string> = {
  "Total Dispatches": "text-foreground",
  Today: "text-primary",
  Completed: "text-success",
  Pending: "text-warning",
  Workers: "text-foreground",
};

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

interface ToolkitSetupProps {
  references: ToolkitReferences;
  onUpdate: (refs: ToolkitReferences) => void;
}

function ToolkitSetupTab({ references, onUpdate }: ToolkitSetupProps) {
  const [cameraItem, setCameraItem] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{
    src: string;
    caption: string;
  } | null>(null);
  // Lazy import CameraCapture inline
  const [CameraCapture, setCameraCapture] = useState<React.ComponentType<{
    title: string;
    onCapture: (dataUrl: string) => void;
    onClose: () => void;
  }> | null>(null);

  const handleOpenCamera = async (itemName: string) => {
    if (!CameraCapture) {
      const mod = await import("../shared/CameraCapture");
      setCameraCapture(() => mod.default);
    }
    setCameraItem(itemName);
  };

  const handleCapture = (dataUrl: string) => {
    if (!cameraItem) return;
    const updated = { ...references, [cameraItem]: dataUrl };
    onUpdate(updated);
    setCameraItem(null);
  };

  const handleRemove = (itemName: string) => {
    const updated = { ...references };
    delete updated[itemName];
    onUpdate(updated);
  };

  const allSet = CHECKLIST_TEMPLATE.every((t) => !!references[t.name]);

  return (
    <>
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === "Escape" && setLightbox(null)}
          aria-modal="true"
          aria-label="Reference photo viewer"
          tabIndex={-1}
        >
          <img
            src={lightbox.src}
            alt={lightbox.caption}
            className="max-w-full max-h-[80vh] rounded-xl object-contain"
          />
          <p className="absolute bottom-8 text-white/70 text-sm">
            {lightbox.caption}
          </p>
        </div>
      )}

      {cameraItem && CameraCapture && (
        <CameraCapture
          title={`Set reference: ${cameraItem}`}
          onCapture={handleCapture}
          onClose={() => setCameraItem(null)}
        />
      )}

      <div className="space-y-4">
        <div className="card-panel p-5">
          <div className="flex items-center gap-3 mb-1">
            <PackageCheck className="w-5 h-5 text-primary" aria-hidden="true" />
            <h2 className="font-semibold text-foreground">
              Toolkit Reference Photos
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Set a reference photo for each toolkit item. Workers will need to
            photograph and match these items before proceeding in the checklist.
          </p>

          {allSet && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-xl px-4 py-3 mb-4">
              <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
              <span className="text-sm text-success font-medium">
                All {CHECKLIST_TEMPLATE.length} items have reference photos set
              </span>
            </div>
          )}

          <div className="space-y-3">
            {CHECKLIST_TEMPLATE.map((item) => {
              const ref = references[item.name];
              return (
                <div
                  key={item.name}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    ref
                      ? "border-success/30 bg-success/5"
                      : "border-border bg-card/50"
                  }`}
                >
                  <span className="text-2xl flex-shrink-0" aria-hidden="true">
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">
                      {item.name}
                    </p>
                    {ref ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-success" />
                        <span className="text-xs text-success">
                          Reference set
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-0.5">
                        <XCircle className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          No reference photo
                        </span>
                      </div>
                    )}
                  </div>
                  {ref && (
                    <button
                      type="button"
                      onClick={() =>
                        setLightbox({
                          src: ref,
                          caption: `${item.name} reference`,
                        })
                      }
                      aria-label={`View ${item.name} reference photo`}
                      className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border"
                    >
                      <img
                        src={ref}
                        alt={`${item.name} reference`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Button
                      size="sm"
                      variant={ref ? "outline" : "default"}
                      data-ocid="toolkit.camera_button"
                      onClick={() => handleOpenCamera(item.name)}
                      className={`gap-1.5 ${!ref ? "bg-primary hover:bg-primary/90" : "border-border"}`}
                    >
                      <Camera className="w-3.5 h-3.5" aria-hidden="true" />
                      {ref ? "Retake" : "Set Photo"}
                    </Button>
                    {ref && (
                      <Button
                        size="sm"
                        variant="ghost"
                        data-ocid="toolkit.remove_button"
                        onClick={() => handleRemove(item.name)}
                        aria-label={`Remove ${item.name} reference photo`}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-panel p-5 bg-primary/5 border-primary/20">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            How it works
          </h3>
          <ol className="space-y-2">
            {(
              [
                "Set a reference photo for each item above using the camera.",
                "When a worker starts a dispatch, they will see your reference photo for each item.",
                "They must photograph the actual product and the system will verify it matches.",
                "If the photo does not match, they cannot proceed to the next item.",
              ] as const
            ).map((step, idx) => (
              <li
                key={step}
                className="flex items-start gap-2 text-xs text-muted-foreground"
              >
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );
}

function QRGeneratorTab() {
  const [machineType, setMachineType] = useState("");
  const [machineId, setMachineId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [generated, setGenerated] = useState("");

  const handleGenerate = () => {
    if (!machineType || !machineId) return;
    const orderPart = orderId ? `|ORDER:${orderId}` : "";
    setGenerated(`MACHINE:${machineId}|TYPE:${machineType}${orderPart}`);
  };

  const renderQRPlaceholder = (text: string) => {
    const size = 200;
    const cellSize = 8;
    const gridCells = Math.floor(size / cellSize);
    const hash = text
      .split("")
      .reduce((acc, c) => acc * 31 + c.charCodeAt(0), 17);
    // Pre-compute filled cell positions to avoid index-as-key in JSX
    const filledCells: { x: number; y: number; id: string }[] = [];
    for (let r = 0; r < gridCells; r++) {
      for (let c = 0; c < gridCells; c++) {
        const inCorner =
          (r < 7 && c < 7) ||
          (r < 7 && c >= gridCells - 7) ||
          (r >= gridCells - 7 && c < 7);
        let filled: boolean;
        if (inCorner) {
          const inInner =
            (r >= 1 && r <= 5 && c >= 1 && c <= 5) ||
            (r >= 1 && r <= 5 && c >= gridCells - 6 && c <= gridCells - 2) ||
            (r >= gridCells - 6 && r <= gridCells - 2 && c >= 1 && c <= 5);
          const inCenter =
            (r >= 2 && r <= 4 && c >= 2 && c <= 4) ||
            (r >= 2 && r <= 4 && c >= gridCells - 5 && c <= gridCells - 3) ||
            (r >= gridCells - 5 && r <= gridCells - 3 && c >= 2 && c <= 4);
          filled = inCenter ? true : !inInner;
        } else {
          filled = (hash * (r + 1) * (c + 1) + r * c) % 3 === 0;
        }
        if (filled)
          filledCells.push({
            x: c * cellSize,
            y: r * cellSize,
            id: `cell-${r}-${c}`,
          });
      }
    }
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rounded-lg"
        aria-label={`QR code for ${text}`}
        role="img"
      >
        <title>QR Code</title>
        <rect width={size} height={size} fill="white" />
        {filledCells.map((cell) => (
          <rect
            key={cell.id}
            x={cell.x}
            y={cell.y}
            width={cellSize}
            height={cellSize}
            fill="#0B1220"
          />
        ))}
      </svg>
    );
  };

  return (
    <div className="space-y-4 max-w-md">
      <div className="card-panel p-5 space-y-4">
        <h2 className="font-semibold text-foreground">
          Generate Machine QR Code
        </h2>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor="qr-machine-type"
              className="text-xs text-muted-foreground font-medium"
            >
              Machine Type
            </label>
            <Select value={machineType} onValueChange={setMachineType}>
              <SelectTrigger
                id="qr-machine-type"
                data-ocid="qr.select"
                className="bg-input border-border h-11"
              >
                <SelectValue placeholder="Select machine type…" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {MACHINE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="qr-machine-id"
              className="text-xs text-muted-foreground font-medium"
            >
              Machine ID
            </label>
            <Input
              id="qr-machine-id"
              data-ocid="qr.input"
              placeholder="e.g. TMR-W-007"
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="bg-input border-border h-11"
            />
          </div>
          <div className="space-y-1.5">
            <label
              htmlFor="qr-order-id"
              className="text-xs text-muted-foreground font-medium"
            >
              Order ID (optional)
            </label>
            <Input
              id="qr-order-id"
              data-ocid="qr.input"
              placeholder="e.g. ORD-9245"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="bg-input border-border h-11"
            />
          </div>
          <Button
            data-ocid="qr.primary_button"
            onClick={handleGenerate}
            disabled={!machineType || !machineId}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <QrCode className="w-4 h-4 mr-2" /> Generate QR Code
          </Button>
        </div>
      </div>

      {generated && (
        <div className="card-panel p-5 flex flex-col items-center gap-4">
          <p className="text-xs text-muted-foreground">
            QR Code for:{" "}
            <span className="font-mono text-foreground">{generated}</span>
          </p>
          {renderQRPlaceholder(generated)}
          <div className="flex gap-2">
            <Button
              data-ocid="qr.secondary_button"
              variant="outline"
              className="border-border text-sm"
              onClick={() => window.print()}
            >
              🖨️ Print
            </Button>
            <Button
              data-ocid="qr.secondary_button"
              variant="outline"
              className="border-border text-sm"
              onClick={() => setGenerated("")}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const NAV_TABS = [
  { value: "overview", icon: LayoutDashboard, label: "Overview" },
  { value: "dispatches", icon: ClipboardList, label: "Dispatches" },
  { value: "workers", icon: Users, label: "Workers" },
  { value: "qr", icon: QrCode, label: "QR Generator" },
  { value: "toolkit-setup", icon: PackageCheck, label: "Toolkit Setup" },
] as const;

export default function AdminPanel({
  user,
  dispatches,
  toolkitReferences,
  onUpdateToolkitReferences,
  onLogout,
}: Props) {
  const [filterDate, setFilterDate] = useState("");
  const [filterWorker, setFilterWorker] = useState("all");
  const [filterMachine, setFilterMachine] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(
    null,
  );
  const { theme, toggleTheme } = useTheme();
  const [lightbox, setLightbox] = useState<{
    src: string;
    caption: string;
  } | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = dispatches.filter((d) =>
    d.createdAt.startsWith(today),
  ).length;
  const completedCount = dispatches.filter(
    (d) => d.status === "completed",
  ).length;
  const pendingCount = dispatches.filter((d) => d.status === "pending").length;

  const workers = Array.from(new Set(dispatches.map((d) => d.workerName)));

  const filteredDispatches = dispatches.filter((d) => {
    if (filterDate && !d.createdAt.startsWith(filterDate)) return false;
    if (filterWorker !== "all" && d.workerName !== filterWorker) return false;
    if (filterMachine !== "all" && d.machineType !== filterMachine)
      return false;
    if (filterStatus !== "all" && d.status !== filterStatus) return false;
    return true;
  });

  const workerStats = workers.map((name) => {
    const wDispatches = dispatches.filter((d) => d.workerName === name);
    const wCompleted = wDispatches.filter(
      (d) => d.status === "completed",
    ).length;
    const rate =
      wDispatches.length > 0
        ? Math.round((wCompleted / wDispatches.length) * 100)
        : 0;
    return {
      name,
      total: wDispatches.length,
      completed: wCompleted,
      pending: wDispatches.length - wCompleted,
      rate,
    };
  });

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const machineCounts = MACHINE_TYPES.map((m) => ({
    name: m,
    count: dispatches.filter((d) => d.machineType === m).length,
  })).filter((m) => m.count > 0);
  const maxCount = Math.max(...machineCounts.map((m) => m.count), 1);

  const statValues = [
    dispatches.length,
    todayCount,
    completedCount,
    pendingCount,
    workers.length,
  ];

  const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") setSelectedDispatch(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <AxonLogo />
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              AXON
            </span>
          </div>
          <span className="hidden md:block text-muted-foreground text-sm">
            Admin Panel
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell
                className="w-5 h-5 text-muted-foreground"
                aria-hidden="true"
              />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-foreground">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {user.role}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
              {user.name[0]}
            </div>
            <button
              type="button"
              data-ocid="nav.toggle"
              onClick={toggleTheme}
              aria-label={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
              className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Moon className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
            <Button
              data-ocid="nav.button"
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="border-border gap-1.5 hidden md:flex"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <OfflineBanner />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome back, {user.name.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {new Date().toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Button
            data-ocid="admin.primary_button"
            className="hidden md:flex bg-primary hover:bg-primary/90 gap-2"
          >
            <Plus className="w-4 h-4" /> New Dispatch
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {STAT_LABELS.map((label, i) => (
            <div key={label} className="card-panel p-4">
              <p className={`text-3xl font-bold ${STAT_COLORS[label]}`}>
                {statValues[i]}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-card border border-border">
            {NAV_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                data-ocid="admin.tab"
                className="gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card-panel p-5">
                <h3 className="font-semibold text-foreground mb-4">
                  Dispatches by Machine
                </h3>
                <div className="space-y-3">
                  {machineCounts.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No data yet</p>
                  ) : (
                    machineCounts.map((m) => (
                      <div key={m.name} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground truncate">
                            {m.name}
                          </span>
                          <span className="text-foreground font-semibold ml-2">
                            {m.count}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-accent rounded-full">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{
                              width: `${(m.count / maxCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="card-panel p-5">
                <h3 className="font-semibold text-foreground mb-4">
                  Completion Status
                </h3>
                <div className="flex items-center gap-6">
                  <svg
                    width="120"
                    height="120"
                    viewBox="0 0 120 120"
                    aria-label="Completion donut chart"
                    role="img"
                  >
                    <title>Completion Status</title>
                    {dispatches.length === 0 ? (
                      <circle
                        cx="60"
                        cy="60"
                        r="40"
                        fill="none"
                        stroke="oklch(0.28 0.05 240)"
                        strokeWidth="20"
                      />
                    ) : (
                      <>
                        <circle
                          cx="60"
                          cy="60"
                          r="40"
                          fill="none"
                          stroke="oklch(0.28 0.05 240)"
                          strokeWidth="20"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="40"
                          fill="none"
                          stroke="oklch(0.72 0.19 150)"
                          strokeWidth="20"
                          strokeDasharray={`${
                            (completedCount / dispatches.length) * 251.2
                          } 251.2`}
                          strokeDashoffset="62.8"
                          transform="rotate(-90 60 60)"
                        />
                      </>
                    )}
                    <text
                      x="60"
                      y="55"
                      textAnchor="middle"
                      fill="oklch(0.93 0.018 240)"
                      fontSize="20"
                      fontWeight="700"
                    >
                      {dispatches.length > 0
                        ? Math.round((completedCount / dispatches.length) * 100)
                        : 0}
                      %
                    </text>
                    <text
                      x="60"
                      y="72"
                      textAnchor="middle"
                      fill="oklch(0.62 0.04 240)"
                      fontSize="9"
                    >
                      completed
                    </text>
                  </svg>
                  <div className="space-y-2">
                    {[
                      {
                        color: "bg-success",
                        label: "Completed",
                        val: completedCount,
                      },
                      {
                        color: "bg-warning",
                        label: "Pending",
                        val: pendingCount,
                      },
                      {
                        color: "bg-primary",
                        label: "Total",
                        val: dispatches.length,
                      },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${s.color}`} />
                        <span className="text-xs text-muted-foreground">
                          {s.label}:{" "}
                          <strong className="text-foreground">{s.val}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card-panel p-5">
              <h3 className="font-semibold text-foreground mb-4">
                Recent Dispatches
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-ocid="admin.table">
                  <thead>
                    <tr className="border-b border-border">
                      {[
                        "Dispatch ID",
                        "Worker",
                        "Machine",
                        "Status",
                        "Date",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left py-2 pr-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dispatches.slice(0, 5).map((d, i) => (
                      <tr
                        key={d.id}
                        data-ocid={`admin.item.${i + 1}`}
                        className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                      >
                        <td className="py-3 pr-4 font-mono text-xs text-primary/80">
                          {d.id}
                        </td>
                        <td className="py-3 pr-4 text-foreground">
                          {d.workerName}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {d.machineType}
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="py-3 text-muted-foreground text-xs">
                          {fmt(d.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Dispatches Tab */}
          <TabsContent value="dispatches" className="space-y-4">
            <div className="card-panel p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="filter-date"
                  className="text-xs text-muted-foreground"
                >
                  Date
                </label>
                <Input
                  id="filter-date"
                  type="date"
                  data-ocid="dispatch.input"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="bg-input border-border h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="filter-worker"
                  className="text-xs text-muted-foreground"
                >
                  Worker
                </label>
                <Select value={filterWorker} onValueChange={setFilterWorker}>
                  <SelectTrigger
                    id="filter-worker"
                    data-ocid="dispatch.select"
                    className="bg-input border-border h-9 text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Workers</SelectItem>
                    {workers.map((w) => (
                      <SelectItem key={w} value={w}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="filter-machine"
                  className="text-xs text-muted-foreground"
                >
                  Machine
                </label>
                <Select value={filterMachine} onValueChange={setFilterMachine}>
                  <SelectTrigger
                    id="filter-machine"
                    data-ocid="dispatch.select"
                    className="bg-input border-border h-9 text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All Machines</SelectItem>
                    {MACHINE_TYPES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="filter-status"
                  className="text-xs text-muted-foreground"
                >
                  Status
                </label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger
                    id="filter-status"
                    data-ocid="dispatch.select"
                    className="bg-input border-border h-9 text-xs"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="card-panel overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-ocid="dispatch.table">
                  <thead className="bg-accent/30">
                    <tr>
                      {[
                        "Dispatch ID",
                        "Worker",
                        "Machine",
                        "Order ID",
                        "Status",
                        "Date",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDispatches.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-muted-foreground text-sm"
                          data-ocid="dispatch.empty_state"
                        >
                          No dispatches match the filters
                        </td>
                      </tr>
                    ) : (
                      filteredDispatches.map((d, i) => (
                        <tr
                          key={d.id}
                          data-ocid={`dispatch.item.${i + 1}`}
                          className="border-t border-border/50 hover:bg-accent/20 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-xs text-primary/80">
                            {d.id}
                          </td>
                          <td className="px-4 py-3 text-foreground">
                            {d.workerName}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {d.machineType}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {d.orderId}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={d.status} />
                          </td>
                          <td className="px-4 py-3 text-muted-foreground text-xs">
                            {fmt(d.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              data-ocid="dispatch.button"
                              onClick={() => setSelectedDispatch(d)}
                              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                            >
                              View →
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {selectedDispatch && (
              <>
                {lightbox && (
                  <PhotoLightbox
                    src={lightbox.src}
                    caption={lightbox.caption}
                    onClose={() => setLightbox(null)}
                  />
                )}
                <div
                  className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setSelectedDispatch(null);
                  }}
                  onKeyDown={handleBackdropKeyDown}
                >
                  <div
                    data-ocid="dispatch.modal"
                    className="card-panel w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          Dispatch Detail
                        </h3>
                        <p className="font-mono text-xs text-primary/80">
                          {selectedDispatch.id}
                        </p>
                      </div>
                      <button
                        type="button"
                        data-ocid="dispatch.close_button"
                        onClick={() => setSelectedDispatch(null)}
                        className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Close"
                      >
                        ×
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Worker", value: selectedDispatch.workerName },
                        {
                          label: "Machine",
                          value: selectedDispatch.machineType,
                        },
                        { label: "Order ID", value: selectedDispatch.orderId },
                        { label: "Client", value: selectedDispatch.clientName },
                        { label: "Status", value: selectedDispatch.status },
                        {
                          label: "Created",
                          value: fmt(selectedDispatch.createdAt),
                        },
                        ...(selectedDispatch.completedAt
                          ? [
                              {
                                label: "Duration",
                                value: formatDuration(
                                  selectedDispatch.createdAt,
                                  selectedDispatch.completedAt,
                                ),
                              },
                            ]
                          : []),
                      ].map((row) => (
                        <div key={row.label} className="card-inner p-3">
                          <p className="text-xs text-muted-foreground">
                            {row.label}
                          </p>
                          <p className="text-sm font-medium text-foreground capitalize">
                            {row.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Photo gallery */}
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">
                        Checklist Photos
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedDispatch.checklistItems.map((item, idx) => (
                          <div
                            key={item.name}
                            data-ocid={`dispatch.item.${idx + 1}`}
                            className="space-y-1"
                          >
                            {item.photoDataUrl ? (
                              <button
                                type="button"
                                data-ocid="dispatch.button"
                                onClick={() =>
                                  setLightbox({
                                    src: item.photoDataUrl!,
                                    caption: `${item.name}${item.timestamp ? ` · ${new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}`,
                                  })
                                }
                                className="relative w-full rounded-xl overflow-hidden bg-black group"
                                style={{ aspectRatio: "4/3" }}
                                aria-label={`View ${item.name} photo`}
                              >
                                <img
                                  src={item.photoDataUrl}
                                  alt={item.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 rounded px-2 py-0.5 transition-opacity">
                                    View
                                  </span>
                                </div>
                              </button>
                            ) : (
                              <div
                                className="w-full rounded-xl bg-accent border border-border flex items-center justify-center"
                                style={{ aspectRatio: "4/3" }}
                              >
                                <Camera
                                  className="w-6 h-6 text-muted-foreground/40"
                                  aria-hidden="true"
                                />
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground text-center leading-tight">
                              {item.icon} {item.name}
                            </p>
                            {item.notes && (
                              <p className="text-xs text-foreground/60 italic px-1 leading-tight">
                                {item.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Toolbox photo */}
                    {selectedDispatch.toolboxPhotoDataUrl && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2">
                          Toolbox Photo
                        </h4>
                        <button
                          type="button"
                          data-ocid="dispatch.button"
                          onClick={() =>
                            setLightbox({
                              src: selectedDispatch.toolboxPhotoDataUrl!,
                              caption: "Full Toolbox",
                            })
                          }
                          className="relative w-full rounded-xl overflow-hidden bg-black group"
                          style={{ aspectRatio: "16/9" }}
                          aria-label="View toolbox photo"
                        >
                          <img
                            src={selectedDispatch.toolboxPhotoDataUrl}
                            alt="Toolbox"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 rounded px-2 py-0.5 transition-opacity">
                              View full size
                            </span>
                          </div>
                        </button>
                      </div>
                    )}

                    {selectedDispatch.qrData && (
                      <div className="card-inner p-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          QR Data
                        </p>
                        <p className="font-mono text-xs text-success">
                          {selectedDispatch.qrData}
                        </p>
                      </div>
                    )}

                    <Button
                      data-ocid="dispatch.button"
                      variant="outline"
                      className="w-full border-border"
                      onClick={() => window.print()}
                    >
                      🖨️ Print Report
                    </Button>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Workers Tab */}
          <TabsContent value="workers" className="space-y-4">
            <div className="card-panel overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground">
                  Worker Performance
                </h3>
              </div>
              <div className="divide-y divide-border/50">
                {workerStats.length === 0 ? (
                  <div
                    data-ocid="workers.empty_state"
                    className="p-8 text-center text-muted-foreground text-sm"
                  >
                    No worker data
                  </div>
                ) : (
                  workerStats.map((w, i) => (
                    <div
                      key={w.name}
                      data-ocid={`workers.item.${i + 1}`}
                      className="p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                            {w.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              {w.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {w.total} total · {w.completed} completed ·{" "}
                              {w.pending} pending
                            </p>
                          </div>
                        </div>
                        <span
                          className={`text-lg font-bold ${
                            w.rate >= 80
                              ? "text-success"
                              : w.rate >= 50
                                ? "text-warning"
                                : "text-destructive"
                          }`}
                        >
                          {w.rate}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-accent rounded-full">
                        <div
                          className={`h-full rounded-full transition-all ${
                            w.rate >= 80
                              ? "bg-success"
                              : w.rate >= 50
                                ? "bg-warning"
                                : "bg-destructive"
                          }`}
                          style={{ width: `${w.rate}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="qr">
            <QRGeneratorTab />
          </TabsContent>

          <TabsContent value="toolkit-setup">
            <ToolkitSetupTab
              references={toolkitReferences}
              onUpdate={onUpdateToolkitReferences}
            />
          </TabsContent>
        </Tabs>
      </div>

      <footer className="border-t border-border mt-12 py-4">
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} AXON Dispatch · Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary/70 hover:text-primary transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
