import { WifiOff } from "lucide-react";
import { useOffline } from "../../hooks/useOffline";

export default function OfflineBanner() {
  const isOffline = useOffline();
  if (!isOffline) return null;
  return (
    <div
      data-ocid="offline.toast"
      className="w-full bg-warning/20 border-b border-warning/40 px-4 py-2 flex items-center gap-2 text-warning text-xs font-medium"
    >
      <WifiOff className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      You are offline. Data will sync when connection is restored.
    </div>
  );
}
