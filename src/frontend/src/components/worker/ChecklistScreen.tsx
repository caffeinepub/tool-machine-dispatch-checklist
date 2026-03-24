import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  Expand,
  ImageIcon,
  Loader2,
  ScanLine,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import type { Dispatch } from "../../types";
import { MATCH_THRESHOLD, compareImages } from "../../utils/imageCompare";
import { compressImage } from "../../utils/imageUtils";
import OfflineBanner from "../shared/OfflineBanner";
import PhotoLightbox from "../shared/PhotoLightbox";

interface Props {
  dispatch: Dispatch;
  onComplete: (updated: Dispatch) => void;
  onBack: () => void;
}

type VerifyState = "idle" | "verifying" | "matched" | "no_match";

export default function ChecklistScreen({
  dispatch,
  onComplete,
  onBack,
}: Props) {
  const [items, setItems] = useState(dispatch.checklistItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightbox, setLightbox] = useState<{
    src: string;
    caption: string;
  } | null>(null);
  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);

  const total = items.length;
  const captured = items.filter((i) => i.captured).length;
  const currentItem = items[currentIndex];
  const progress = (captured / total) * 100;
  const hasReference = !!currentItem.referencePhotoDataUrl;

  const runVerification = async (dataUrl: string, refUrl: string) => {
    setVerifyState("verifying");
    await new Promise((r) => setTimeout(r, 1500));
    const score = await compareImages(refUrl, dataUrl);
    setSimilarityScore(score);
    const matched = score >= MATCH_THRESHOLD;
    setVerifyState(matched ? "matched" : "no_match");
    return matched;
  };

  const handleCapture = async (dataUrl: string) => {
    const now = new Date().toISOString();

    const applyCapture = (matched?: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setItems((prev) =>
            prev.map((item, idx) =>
              idx === currentIndex
                ? {
                    ...item,
                    captured: matched !== false,
                    photoDataUrl: dataUrl,
                    timestamp: now,
                    location: {
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude,
                    },
                    verificationStatus:
                      matched === true
                        ? "matched"
                        : matched === false
                          ? "no_match"
                          : "pending",
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
                    captured: matched !== false,
                    photoDataUrl: dataUrl,
                    timestamp: now,
                    verificationStatus:
                      matched === true
                        ? "matched"
                        : matched === false
                          ? "no_match"
                          : "pending",
                  }
                : item,
            ),
          );
        },
      );
    };

    if (hasReference) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === currentIndex
            ? { ...item, photoDataUrl: dataUrl, captured: false }
            : item,
        ),
      );
      const matched = await runVerification(
        dataUrl,
        currentItem.referencePhotoDataUrl!,
      );
      applyCapture(matched);
    } else {
      applyCapture(undefined);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      if (raw) {
        const dataUrl = await compressImage(raw);
        handleCapture(dataUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRetake = () => {
    setVerifyState("idle");
    setSimilarityScore(null);
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === currentIndex
          ? {
              ...item,
              captured: false,
              photoDataUrl: undefined,
              verificationStatus: undefined,
            }
          : item,
      ),
    );
    fileInputRef.current?.click();
  };

  const handleNotesChange = (value: string) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === currentIndex ? { ...item, notes: value } : item,
      ),
    );
  };

  const handleNext = () => {
    setVerifyState("idle");
    setSimilarityScore(null);
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete({ ...dispatch, checklistItems: items });
    }
  };

  const handlePrev = () => {
    setVerifyState("idle");
    setSimilarityScore(null);
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleItemSwitch = (idx: number) => {
    setVerifyState("idle");
    setSimilarityScore(null);
    setCurrentIndex(idx);
  };

  const formatTime = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isNextBlocked =
    !currentItem.captured ||
    verifyState === "verifying" ||
    verifyState === "no_match";

  return (
    <>
      {lightbox && (
        <PhotoLightbox
          src={lightbox.src}
          caption={lightbox.caption}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

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
                onClick={() => handleItemSwitch(idx)}
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
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              <span className="text-6xl" aria-hidden="true">
                {currentItem.icon}
              </span>
              <h2 className="font-display text-2xl font-bold text-foreground text-center">
                {currentItem.name}
              </h2>
            </div>

            {/* Reference photo (admin-set) */}
            {hasReference && (
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                  <ScanLine className="w-3.5 h-3.5" aria-hidden="true" /> Admin
                  Reference Photo
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setLightbox({
                      src: currentItem.referencePhotoDataUrl!,
                      caption: `${currentItem.name} — Admin Reference`,
                    })
                  }
                  aria-label="View admin reference photo"
                  className="w-full rounded-lg overflow-hidden relative group"
                  style={{ aspectRatio: "16/7" }}
                >
                  <img
                    src={currentItem.referencePhotoDataUrl}
                    alt={`${currentItem.name} admin reference`}
                    className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded-full p-1.5">
                      <Expand
                        className="w-4 h-4 text-white"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </button>
                <p className="text-xs text-primary/70 mt-2 text-center">
                  Match your photo to this reference to proceed
                </p>
              </div>
            )}

            {/* Capture prompt or photo result */}
            {!currentItem.photoDataUrl && verifyState === "idle" ? (
              <button
                type="button"
                data-ocid="checklist.primary_button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 py-8 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                  <ImageIcon
                    className="w-7 h-7 text-primary"
                    aria-hidden="true"
                  />
                </div>
                {hasReference ? (
                  <>
                    <span className="text-sm font-semibold text-foreground">
                      Click to select product photo
                    </span>
                    <span className="text-xs text-muted-foreground text-center px-4">
                      Select a clear photo of the{" "}
                      <span className="text-primary font-medium">
                        {currentItem.name}
                      </span>{" "}
                      you are placing in the toolkit
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      It must match the admin reference above
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-medium text-muted-foreground">
                      Click to select photo
                    </span>
                    <span className="text-xs text-muted-foreground/60">
                      Required to proceed
                    </span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Verifying spinner */}
                {verifyState === "verifying" && (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 flex flex-col items-center gap-3 py-6">
                    <Loader2
                      className="w-8 h-8 text-primary animate-spin"
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold text-foreground">
                      Verifying match...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Comparing with admin reference
                    </p>
                  </div>
                )}

                {/* Captured photo */}
                {currentItem.photoDataUrl && (
                  <div className="flex flex-col gap-2">
                    {hasReference && (
                      <p className="text-xs font-semibold text-muted-foreground">
                        Your photo
                      </p>
                    )}
                    <button
                      type="button"
                      data-ocid="checklist.button"
                      onClick={() =>
                        setLightbox({
                          src: currentItem.photoDataUrl!,
                          caption: `${currentItem.name}${
                            currentItem.timestamp
                              ? ` · ${formatTime(currentItem.timestamp)}`
                              : ""
                          }`,
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
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 rounded-full p-2">
                          <Expand
                            className="w-5 h-5 text-white"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* Verification result */}
                {verifyState === "matched" && (
                  <div className="rounded-xl border border-success/40 bg-success/10 flex items-center gap-3 px-4 py-3">
                    <CheckCircle2
                      className="w-5 h-5 text-success flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-success">
                        Photo matched!
                      </p>
                      {similarityScore !== null && (
                        <p className="text-xs text-success/70">
                          Similarity: {Math.round(similarityScore * 100)}% — you
                          can proceed
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {verifyState === "no_match" && (
                  <div className="rounded-xl border border-destructive/40 bg-destructive/10 flex flex-col gap-2 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <XCircle
                        className="w-5 h-5 text-destructive flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="text-sm font-semibold text-destructive">
                          Click again, the product is wrong
                        </p>
                        {similarityScore !== null && (
                          <p className="text-xs text-destructive/70">
                            Similarity: {Math.round(similarityScore * 100)}% —
                            minimum required:{" "}
                            {Math.round(MATCH_THRESHOLD * 100)}%
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Make sure you select the correct item matching the admin
                      reference photo.
                    </p>
                    <Button
                      size="sm"
                      data-ocid="checklist.retake_button"
                      onClick={handleRetake}
                      className="mt-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
                    >
                      <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />{" "}
                      Click Again
                    </Button>
                  </div>
                )}

                {/* No reference: retake + notes */}
                {verifyState === "idle" && currentItem.captured && (
                  <>
                    <button
                      type="button"
                      data-ocid="checklist.secondary_button"
                      onClick={() => fileInputRef.current?.click()}
                      className="self-start bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5 hover:border-primary/50 transition-all"
                    >
                      <ImageIcon className="w-3 h-3" aria-hidden="true" />{" "}
                      Retake
                    </button>
                    <Textarea
                      data-ocid="checklist.textarea"
                      value={currentItem.notes ?? ""}
                      onChange={(e) => handleNotesChange(e.target.value)}
                      placeholder="Add notes for this item..."
                      className="bg-input border-border text-sm resize-none"
                      rows={2}
                    />
                  </>
                )}

                {/* After match success: notes */}
                {verifyState === "matched" && (
                  <Textarea
                    data-ocid="checklist.textarea"
                    value={currentItem.notes ?? ""}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add notes for this item..."
                    className="bg-input border-border text-sm resize-none"
                    rows={2}
                  />
                )}
              </div>
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
              disabled={isNextBlocked}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-40 gap-2"
              style={{ height: "52px" }}
            >
              {verifyState === "verifying" ? (
                <>
                  <Loader2
                    className="w-4 h-4 animate-spin"
                    aria-hidden="true"
                  />{" "}
                  Verifying...
                </>
              ) : currentIndex === total - 1 ? (
                "Finish ✓"
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </>
              )}
            </Button>
          </div>

          {/* Blocked hint */}
          {verifyState === "no_match" && (
            <div className="flex items-center gap-2 text-xs text-destructive pb-2">
              <AlertTriangle
                className="w-3.5 h-3.5 flex-shrink-0"
                aria-hidden="true"
              />
              Click again and select the correct product to continue.
            </div>
          )}
        </main>
      </div>
    </>
  );
}
