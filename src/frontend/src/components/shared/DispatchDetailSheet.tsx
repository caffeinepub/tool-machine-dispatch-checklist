import { Camera, X } from "lucide-react";
import { useState } from "react";
import type { Dispatch } from "../../types";
import { formatDuration } from "../../utils/formatDuration";
import PhotoLightbox from "./PhotoLightbox";
import StatusBadge from "./StatusBadge";

interface Props {
  dispatch: Dispatch;
  onClose: () => void;
}

export default function DispatchDetailSheet({ dispatch, onClose }: Props) {
  const [lightbox, setLightbox] = useState<{
    src: string;
    caption: string;
  } | null>(null);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const duration = dispatch.completedAt
    ? formatDuration(dispatch.createdAt, dispatch.completedAt)
    : null;

  return (
    <>
      {lightbox && (
        <PhotoLightbox
          src={lightbox.src}
          caption={lightbox.caption}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Backdrop */}
      <div
        role="button"
        tabIndex={0}
        className="fixed inset-0 z-40 bg-black/60"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onClose();
        }}
        aria-label="Close"
      />

      {/* Sheet */}
      <div
        data-ocid="dispatch.sheet"
        className="fixed inset-x-0 bottom-0 z-50 bg-card border-t border-border rounded-t-2xl max-h-[85vh] overflow-y-auto"
        style={{ animation: "slideUp 0.25s ease-out" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground text-base">
                {dispatch.id}
              </h2>
              <StatusBadge status={dispatch.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              {dispatch.machineType}
            </p>
          </div>
          <button
            type="button"
            data-ocid="dispatch.close_button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Machine", value: dispatch.machineType },
              { label: "Order ID", value: dispatch.orderId, mono: true },
              { label: "Client", value: dispatch.clientName },
              { label: "Worker", value: dispatch.workerName },
              { label: "Created", value: fmt(dispatch.createdAt) },
              ...(duration ? [{ label: "Duration", value: duration }] : []),
            ].map((row) => (
              <div key={row.label} className="card-inner p-3">
                <p className="text-xs text-muted-foreground">{row.label}</p>
                <p
                  className={`text-sm font-medium text-foreground ${
                    (row as { mono?: boolean }).mono ? "font-mono" : ""
                  }`}
                >
                  {row.value}
                </p>
              </div>
            ))}
          </div>

          {/* Photo gallery */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Checklist Photos
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {dispatch.checklistItems.map((item) => (
                <div key={item.name} className="space-y-1">
                  {item.photoDataUrl ? (
                    <button
                      type="button"
                      data-ocid="dispatch.button"
                      onClick={() =>
                        setLightbox({
                          src: item.photoDataUrl!,
                          caption: `${item.name}${
                            item.timestamp
                              ? ` · ${new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                              : ""
                          }`,
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
                          Tap to view
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
                    <p className="text-xs text-foreground/60 italic leading-tight px-1">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Toolbox photo */}
          {dispatch.toolboxPhotoDataUrl && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Toolbox Photo
              </h3>
              <button
                type="button"
                data-ocid="dispatch.button"
                onClick={() =>
                  setLightbox({
                    src: dispatch.toolboxPhotoDataUrl!,
                    caption: "Full Toolbox",
                  })
                }
                className="relative w-full rounded-xl overflow-hidden bg-black group"
                style={{ aspectRatio: "16/9" }}
                aria-label="View toolbox photo"
              >
                <img
                  src={dispatch.toolboxPhotoDataUrl}
                  alt="Full toolbox"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 rounded px-2 py-0.5 transition-opacity">
                    Tap to view full size
                  </span>
                </div>
              </button>
            </div>
          )}

          {/* QR Data */}
          {dispatch.qrData && (
            <div className="card-inner p-3">
              <p className="text-xs text-muted-foreground mb-1">QR Data</p>
              <p className="font-mono text-sm text-success break-all">
                {dispatch.qrData}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
