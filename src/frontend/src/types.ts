export interface ChecklistItem {
  name: string;
  icon: string;
  photoDataUrl?: string;
  timestamp?: string;
  location?: { lat: number; lng: number };
  captured: boolean;
  notes?: string;
  referencePhotoDataUrl?: string;
  verificationStatus?: "pending" | "matched" | "no_match";
}

export interface Dispatch {
  id: string;
  workerId: string;
  workerName: string;
  machineType: string;
  orderId: string;
  clientName: string;
  checklistItems: ChecklistItem[];
  toolboxPhotoDataUrl?: string;
  qrData?: string;
  location?: { lat: number; lng: number };
  status: "pending" | "completed";
  createdAt: string;
  completedAt?: string;
}

export interface AuthUser {
  employeeId: string;
  name: string;
  role: "worker" | "admin";
}

export type AppScreen =
  | "login"
  | "worker-dashboard"
  | "worker-create"
  | "worker-checklist"
  | "worker-verification"
  | "worker-success"
  | "admin";

export const MACHINE_TYPES = [
  "TMR Wagon",
  "Silage Baler",
  "Forage Harvester",
  "Round Baler",
  "Mower Conditioner",
  "Telescopic Handler",
  "Grain Cart",
];

export const CHECKLIST_TEMPLATE: Omit<ChecklistItem, "captured">[] = [
  { name: "Spanner Set", icon: "🔧" },
  { name: "Hydraulic Pipe", icon: "🔩" },
  { name: "PTO Shaft", icon: "⚙️" },
  { name: "Oil Can", icon: "🛢️" },
  { name: "Grease Gun", icon: "💉" },
  { name: "Bolts Kit", icon: "🔩" },
  { name: "Electrical Kit", icon: "⚡" },
];

export type ToolkitReferences = Record<string, string>; // item name -> referencePhotoDataUrl
