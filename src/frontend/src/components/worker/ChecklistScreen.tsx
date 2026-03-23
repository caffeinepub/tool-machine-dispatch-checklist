import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Expand,
} from "lucide-react";
import { useState } from "react";
import type { Dispatch } from "../../types";
import CameraCapture from "../shared/CameraCapture";
import OfflineBanner from "../shared/OfflineBanner";
import PhotoLightbox from "../shared/PhotoLightbox";

interface Props {
  dispatch: Dispatch;
  onComplete: (updated: Dispatch) => void;
  onBack: () => void;
}

export default function ChecklistScreen({
  dispatch,
  onComplete,
  onBack,
}: Props) {
  const [items, setItems] = useState(dispatch.checklistItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [lightbox, setLightbox] = useState<{
    src: string;
    caption: string;
  } | null>(null);

  const total = items.length;
  const captured = items.filter((i) => i.captured).length;
  const currentItem = items[currentIndex];
  const progress = (captured / total) * 100;

  const handleCapture = (dataUrl: string) => {
    const now = new Date().toISOString();
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === currentIndex
              ? {
                  ...item,
                  captured: true,
                  photoDataUrl: dataUrl,
                  timestamp: now,
                  location: {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                  },
                }
              : item,
          ),
        );
      },
      () => {
        setItems((prev) =>
          prev.map((item, idx) =>
            idx === currentIndex
              ? {
                  ...item,
                  captured: true,
                  photoDataUrl: dataUrl,
                  timestamp: now,
                }
              : item,
          ),
        );
      },
    );
    setShowCamera(false);
  };

  const handleNotesChange = (value: string) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === currentIndex ? { ...item, notes: value } : item,
      ),
    );
  };

  const handleNext = () => {
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete({ ...dispatch, checklistItems: items });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {lightbox && (
        <PhotoLightbox
          src={lightbox.src}
          caption={lightbox.caption}
          onClose={() => setLightbox(null)}
        />
      )}

      {showCamera && (
        <CameraCapture
          title={`Capture: ${currentItem.name}`}
          onCapture={handleCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
        <OfflineBanner />
        {/* Header */}
        <header className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              type="button"
              data-ocid="nav.button"
              onClick={onBack}
              aria-label="Go back"
              className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-muted-foreground"
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            </button>
            <div className="flex-1">
              <h1 className="font-semibold text-foreground text-sm">
                Dispatch Checklist
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                {dispatch.id}
              </p>
            </div>
            <span className="text-xs font-semibold text-primary">
              {captured}/{total} done
            </span>
          </div>
          <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <main className="flex-1 p-4 flex flex-col gap-4">
          {/* Item overview strip */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {items.map((item, idx) => (
              <button
                key={item.name}
                type="button"
                data-ocid={`checklist.item.${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`${item.name} - ${item.captured ? "captured" : "not captured"}`}
                className={`flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl border transition-all ${
                  idx === currentIndex
                    ? "border-primary bg-primary/10"
                    : item.captured
                      ? "border-success/40 bg-success/10"
                      : "border-border bg-card"
                }`}
                style={{ minWidth: "60px" }}
              >
                <span className="text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                {item.captured ? (
                  <CheckCircle2 className="w-3 h-3 text-success" />
                ) : (
                  <Circle className="w-3 h-3 text-muted-foreground" />
                )}
                <span
                  className="text-[10px] text-muted-foreground text-center leading-tight"
                  style={{ maxWidth: "52px" }}
                >
                  {item.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>

          {/* Current item card */}
          <div className="card-panel p-5 flex-1 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">
                ITEM {currentIndex + 1} OF {total}
              </span>
              {currentItem.captured && (
                <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="w-3 h-3" /> Captured
                </span>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 py-4">
              <span className="text-6xl" aria-hidden="true">
                {currentItem.icon}
              </span>
              <h2 className="font-display text-2xl font-bold text-foreground text-center">
                {currentItem.name}
              </h2>
            </div>

            {currentItem.captured && currentItem.photoDataUrl ? (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  data-ocid="checklist.button"
                  onClick={() =>
                    setLightbox({
                      src: currentItem.photoDataUrl!,
                      caption: `${currentItem.name}${currentItem.timestamp ? ` · ${formatTime(currentItem.timestamp)}` : ""}`,
                    })
                  }
                  aria-label={`View ${currentItem.name} photo full size`}
                  className="relative rounded-xl overflow-hidden bg-black group"
                  style={{ aspectRatio: "4/3" }}
                >
                  <img
                    src={currentItem.photoDataUrl}
                    alt={currentItem.name}
                    className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 flex items-center justify-between">
                    <span className="text-xs text-white/80">
                      {currentItem.location
                        ? `${currentItem.location.lat.toFixed(4)}, ${currentItem.location.lng.toFixed(4)}`
                        : "Location captured"}
                    </span>
                    <span className="text-xs text-white/80">
                      {formatTime(currentItem.timestamp)}
                    </span>
                  </div>
                  {/* Expand hint overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded-full p-2">
                      <Expand
                        className="w-5 h-5 text-white"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    data-ocid="checklist.secondary_button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCamera(true);
                    }}
                    className="absolute top-2 right-2 bg-black/50 rounded-lg px-2 py-1 text-xs text-white flex items-center gap-1"
                  >
                    <Camera className="w-3 h-3" aria-hidden="true" /> Retake
                  </button>
                </button>

                {/* Notes textarea */}
                <Textarea
                  data-ocid="checklist.textarea"
                  value={currentItem.notes ?? ""}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Add notes for this item..."
                  className="bg-input border-border text-sm resize-none"
                  rows={2}
                />
              </div>
            ) : (
              <button
                type="button"
                data-ocid="checklist.primary_button"
                onClick={() => setShowCamera(true)}
                className="w-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 py-8 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <Camera className="w-7 h-7 text-primary" aria-hidden="true" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Tap to capture photo
                </span>
                <span className="text-xs text-muted-foreground/60">
                  Required to proceed
                </span>
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-3 pb-4">
            <Button
              variant="outline"
              data-ocid="checklist.secondary_button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex-1 border-border gap-2"
              style={{ height: "52px" }}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" /> Previous
            </Button>
            <Button
              data-ocid="checklist.primary_button"
              onClick={handleNext}
              disabled={!currentItem.captured}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-40 gap-2"
              style={{ height: "52px" }}
            >
              {currentIndex === total - 1 ? "Finish ✓" : "Next"}
              {currentIndex < total - 1 && (
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              )}
            </Button>
          </div>
        </main>
      </div>
    </>
  );
}
