import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import LoginScreen from "./components/LoginScreen";
import AdminPanel from "./components/admin/AdminPanel";
import ChecklistScreen from "./components/worker/ChecklistScreen";
import CreateDispatch from "./components/worker/CreateDispatch";
import FinalVerification from "./components/worker/FinalVerification";
import SuccessScreen from "./components/worker/SuccessScreen";
import WorkerDashboard from "./components/worker/WorkerDashboard";
import { SAMPLE_DISPATCHES } from "./data/sampleData";
import type { AppScreen, AuthUser, Dispatch } from "./types";
import { CHECKLIST_TEMPLATE } from "./types";

const STORAGE_KEY = "axon_dispatches";
const AUTH_KEY = "axon_auth";

function loadDispatches(): Dispatch[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DISPATCHES));
  return SAMPLE_DISPATCHES;
}

function saveDispatches(dispatches: Dispatch[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dispatches));
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [screen, setScreen] = useState<AppScreen>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        const u: AuthUser = JSON.parse(stored);
        return u.role === "admin" ? "admin" : "worker-dashboard";
      }
    } catch {
      // ignore
    }
    return "login";
  });
  const [dispatches, setDispatches] = useState<Dispatch[]>(loadDispatches);
  const [currentDispatch, setCurrentDispatch] = useState<Dispatch | null>(null);

  useEffect(() => {
    saveDispatches(dispatches);
  }, [dispatches]);

  const handleLogin = (u: AuthUser) => {
    setUser(u);
    localStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setScreen(u.role === "admin" ? "admin" : "worker-dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    setScreen("login");
    setCurrentDispatch(null);
  };

  const handleCreateDispatch = (data: {
    machineType: string;
    orderId: string;
    clientName: string;
  }) => {
    if (!user) return;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const rand = String(Math.floor(Math.random() * 9000) + 1000);
    const newDispatch: Dispatch = {
      id: `DISP-${dateStr}-${rand}`,
      workerId: user.employeeId,
      workerName: user.name,
      machineType: data.machineType,
      orderId: data.orderId,
      clientName: data.clientName,
      checklistItems: CHECKLIST_TEMPLATE.map((t) => ({
        ...t,
        captured: false,
      })),
      status: "pending",
      createdAt: now.toISOString(),
    };
    setCurrentDispatch(newDispatch);
    setScreen("worker-checklist");
  };

  const handleChecklistComplete = (updatedDispatch: Dispatch) => {
    setCurrentDispatch(updatedDispatch);
    setScreen("worker-verification");
  };

  const handleVerificationComplete = (updatedDispatch: Dispatch) => {
    const completed: Dispatch = {
      ...updatedDispatch,
      status: "completed",
      completedAt: new Date().toISOString(),
    };
    setCurrentDispatch(completed);
    setDispatches((prev) => {
      const exists = prev.find((d) => d.id === completed.id);
      if (exists)
        return prev.map((d) => (d.id === completed.id ? completed : d));
      return [completed, ...prev];
    });
    setScreen("worker-success");
  };

  const handleReturnToDashboard = () => {
    setCurrentDispatch(null);
    setScreen("worker-dashboard");
  };

  if (screen === "login") {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  if (screen === "admin" && user) {
    return (
      <>
        <AdminPanel
          user={user}
          dispatches={dispatches}
          onLogout={handleLogout}
        />
        <Toaster />
      </>
    );
  }

  if (screen === "worker-dashboard" && user) {
    return (
      <>
        <WorkerDashboard
          user={user}
          dispatches={dispatches.filter((d) => d.workerId === user.employeeId)}
          onStartDispatch={() => setScreen("worker-create")}
          onLogout={handleLogout}
        />
        <Toaster />
      </>
    );
  }

  if (screen === "worker-create" && user) {
    return (
      <>
        <CreateDispatch
          user={user}
          onSubmit={handleCreateDispatch}
          onBack={() => setScreen("worker-dashboard")}
        />
        <Toaster />
      </>
    );
  }

  if (screen === "worker-checklist" && currentDispatch) {
    return (
      <>
        <ChecklistScreen
          dispatch={currentDispatch}
          onComplete={handleChecklistComplete}
          onBack={() => setScreen("worker-create")}
        />
        <Toaster />
      </>
    );
  }

  if (screen === "worker-verification" && currentDispatch) {
    return (
      <>
        <FinalVerification
          dispatch={currentDispatch}
          onComplete={handleVerificationComplete}
          onBack={() => setScreen("worker-checklist")}
        />
        <Toaster />
      </>
    );
  }

  if (screen === "worker-success" && currentDispatch) {
    return (
      <>
        <SuccessScreen
          dispatch={currentDispatch}
          onReturn={handleReturnToDashboard}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <LoginScreen onLogin={handleLogin} />
      <Toaster />
    </>
  );
}
