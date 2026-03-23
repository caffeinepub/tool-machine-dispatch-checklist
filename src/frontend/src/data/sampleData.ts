import type { Dispatch } from "../types";
import { CHECKLIST_TEMPLATE } from "../types";

const makeItems = (allCaptured: boolean) =>
  CHECKLIST_TEMPLATE.map((t) => ({
    ...t,
    captured: allCaptured,
    timestamp: allCaptured
      ? new Date(Date.now() - 3600000).toISOString()
      : undefined,
    location: allCaptured ? { lat: 51.5074, lng: -0.1278 } : undefined,
  }));

export const SAMPLE_DISPATCHES: Dispatch[] = [
  {
    id: "DISP-2026-03-20-0042",
    workerId: "W001",
    workerName: "James Hartley",
    machineType: "TMR Wagon",
    orderId: "ORD-8821",
    clientName: "Green Valley Farms",
    checklistItems: makeItems(true),
    toolboxPhotoDataUrl: undefined,
    qrData: "MACHINE:TMR-W-007|ORDER:ORD-8821",
    location: { lat: 51.5074, lng: -0.1278 },
    status: "completed",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
  },
  {
    id: "DISP-2026-03-21-0078",
    workerId: "W002",
    workerName: "Sarah Mitchell",
    machineType: "Silage Baler",
    orderId: "ORD-9104",
    clientName: "Ridgecroft Agriculture",
    checklistItems: makeItems(true),
    toolboxPhotoDataUrl: undefined,
    qrData: "MACHINE:SB-002|ORDER:ORD-9104",
    location: { lat: 51.5074, lng: -0.1278 },
    status: "completed",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 86400000 + 2700000).toISOString(),
  },
  {
    id: "DISP-2026-03-22-0011",
    workerId: "W003",
    workerName: "Carlos Rivera",
    machineType: "Forage Harvester",
    orderId: "ORD-9230",
    clientName: "Sunfield Cooperative",
    checklistItems: makeItems(false),
    toolboxPhotoDataUrl: undefined,
    qrData: undefined,
    location: undefined,
    status: "pending",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: "DISP-2026-03-22-0019",
    workerId: "W001",
    workerName: "James Hartley",
    machineType: "Round Baler",
    orderId: "ORD-9245",
    clientName: "Thornwood Estate",
    checklistItems: makeItems(false),
    toolboxPhotoDataUrl: undefined,
    qrData: undefined,
    location: undefined,
    status: "pending",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
];
