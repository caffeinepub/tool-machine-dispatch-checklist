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
import { compareImages, compressImage } from "../../utils/imageUtils";
import OfflineBanner from "../shared/OfflineBanner";
import PhotoLightbox from "../shared/PhotoLightbox";

interface Props {
  dispatch: Dispatch;
  onComplete: (updated: Dispatch) => void;
  onBack: () => void;
}

type VerifyState = "idle" | "pending" | "verifying" | "matched" | "no_match";

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
  const [pendingPhotoDataUrl, setPendingPhotoDataUrl] = useState<string | null>(
    null,
  );
  const [matchScore, setMatchScore] = useState<number | null>(null);

  const total = items.length;
  const captured = items.filter((i) => i.captured).length;
  const currentItem = items[currentIndex];
  const progress = (captured / total) * 100;
  const hasReference = !!currentItem.referencePhotoDataUrl;

  const applyCapture = (dataUrl: string, matched?: boolean) => {
    const now = new Date().toISOString();
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      if (!raw) return;
      const dataUrl = await compressImage(raw);
      if (hasReference) {
        // Show pending state with "Match Photo" button
        setPendingPhotoDataUrl(dataUrl);
        setMatchScore(null);
        setVerifyState("pending");
      } else {
        // No reference — accept directly
        applyCapture(dataUrl, undefined);
        setVerifyState("matched");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleMatchPhoto = async () => {
    if (!pendingPhotoDataUrl || !currentItem.referencePhotoDataUrl) return;
    setVerifyState("verifying");
    try {
      const score = await compareImages(
        currentItem.referencePhotoDataUrl,
        pendingPhotoDataUrl,
      );
      setMatchScore(score);
      if (score >= 0.45) {
        applyCapture(pendingPhotoDataUrl, true);
        setVerifyState("matched");
      } else {
        applyCapture(pendingPhotoDataUrl, false);
        setVerifyState("no_match");
      }
    } catch {
      setMatchScore(0);
      applyCapture(pendingPhotoDataUrl, false);
      setVerifyState("no_match");
    }
  };

  const handleRetake = () => {
    setVerifyState("idle");
    setPendingPhotoDataUrl(null);
    setMatchScore(null);
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
    setPendingPhotoDataUrl(null);
    setMatchScore(null);
    if (currentIndex < total - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete({ ...dispatch, checklistItems: items });
    }
  };

  const handlePrev = () => {
    setVerifyState("idle");
    setPendingPhotoDataUrl(null);
    setMatchScore(null);
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleItemSwitch = (idx: number) => {
    setVerifyState("idle");
    setPendingPhotoDataUrl(null);
    setMatchScore(null);
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
    (!currentItem.captured && verifyState !== "matched") ||
    verifyState === "pending" ||
    verifyState === "verifying" ||
    verifyState === "no_match";

  // Decide which photo to show in the captured display
  const displayPhotoUrl =
    currentItem.photoDataUrl ||
    (verifyState === "pending" ? pendingPhotoDataUrl : null);

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

            {/* Reference photo — always shown when set */}
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
                  Select your product photo and click "Match Photo" to verify
                </p>
              </div>
            )}

            {/* ── Idle: no photo selected yet ── */}
            {verifyState === "idle" && !currentItem.photoDataUrl && (
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
                      Select Product Photo
                    </span>
                    <span className="text-xs text-muted-foreground text-center px-4">
                      Choose a photo of{" "}
                      <span className="text-primary font-medium">
                        {currentItem.name}
                      </span>{" "}
                      from your gallery to verify against the reference
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
            )}

            {/* ── Pending: photo selected, awaiting Match Photo click ── */}
            {verifyState === "pending" && pendingPhotoDataUrl && (
              <div className="flex flex-col gap-3">
                {/* Worker's selected photo preview */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Your Selected Photo
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setLightbox({
                        src: pendingPhotoDataUrl,
                        caption: `${currentItem.name} — Your Photo`,
                      })
                    }
                    aria-label="View selected photo full size"
                    className="relative rounded-xl overflow-hidden bg-black group"
                    style={{ aspectRatio: "4/3" }}
                  >
                    <img
                      src={pendingPhotoDataUrl}
                      alt="Your selected item"
                      className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                    />
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

                {/* Match Photo button */}
                <Button
                  data-ocid="checklist.match_button"
                  onClick={handleMatchPhoto}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold gap-2"
                  style={{ height: "56px", fontSize: "1rem" }}
                >
                  <ScanLine className="w-5 h-5" aria-hidden="true" />
                  Match Photo
                </Button>

                <button
                  type="button"
                  data-ocid="checklist.secondary_button"
                  onClick={() => {
                    setVerifyState("idle");
                    setPendingPhotoDataUrl(null);
                    fileInputRef.current?.click();
                  }}
                  className="self-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                >
                  Select a different photo
                </button>
              </div>
            )}

            {/* ── Verifying: analyzing spinner ── */}
            {verifyState === "verifying" && (
              <div
                data-ocid="checklist.loading_state"
                className="flex flex-col items-center justify-center gap-4 py-8 rounded-xl border border-border bg-accent/30"
              >
                <Loader2
                  className="w-10 h-10 text-primary animate-spin"
                  aria-hidden="true"
                />
                <div className="text-center">
                  <p className="text-sm font-semibold text-foreground">
                    Verifying photo match...
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Comparing with admin reference
                  </p>
                </div>
              </div>
            )}

            {/* ── Post-verification states ── */}
            {(verifyState === "matched" ||
              verifyState === "no_match" ||
              (verifyState === "idle" && currentItem.captured)) && (
              <div className="flex flex-col gap-3">
                {/* Captured photo display */}
                {displayPhotoUrl && (
                  <div className="flex flex-col gap-2">
                    {hasReference && (
                      <p className="text-xs font-semibold text-muted-foreground">
                        Your Photo
                      </p>
                    )}
                    <button
                      type="button"
                      data-ocid="checklist.button"
                      onClick={() =>
                        setLightbox({
                          src: displayPhotoUrl,
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
                        src={displayPhotoUrl}
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

                {/* Match success banner */}
                {verifyState === "matched" && (
                  <div
                    data-ocid="checklist.success_state"
                    className="rounded-xl border border-success/40 bg-success/10 flex flex-col gap-1 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2
                        className="w-5 h-5 text-success flex-shrink-0"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-semibold text-success">
                        ✓ Photo Verified — Item confirmed, you can proceed!
                      </p>
                    </div>
                    {matchScore !== null && (
                      <p className="text-xs text-success/70 ml-8">
                        Match score: {Math.round(matchScore * 100)}%
                      </p>
                    )}
                  </div>
                )}

                {/* No-match error banner */}
                {verifyState === "no_match" && (
                  <div
                    data-ocid="checklist.error_state"
                    className="rounded-xl border border-destructive/40 bg-destructive/10 flex flex-col gap-2 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <XCircle
                        className="w-5 h-5 text-destructive flex-shrink-0"
                        aria-hidden="true"
                      />
                      <p className="text-sm font-semibold text-destructive">
                        ✗ Wrong item detected — This does not match the
                        reference photo. Please select the correct item.
                      </p>
                    </div>
                    {matchScore !== null && (
                      <p className="text-xs text-destructive/70">
                        Match score: {Math.round(matchScore * 100)}% (minimum
                        45% required)
                      </p>
                    )}
                    <Button
                      size="sm"
                      data-ocid="checklist.retake_button"
                      onClick={handleRetake}
                      className="mt-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground gap-2"
                    >
                      <ImageIcon className="w-3.5 h-3.5" aria-hidden="true" />{" "}
                      Try Again
                    </Button>
                  </div>
                )}

                {/* No reference: retake option */}
                {verifyState === "idle" && currentItem.captured && (
                  <button
                    type="button"
                    data-ocid="checklist.secondary_button"
                    onClick={() => fileInputRef.current?.click()}
                    className="self-start bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground flex items-center gap-1.5 hover:border-primary/50 transition-all"
                  >
                    <ImageIcon className="w-3 h-3" aria-hidden="true" /> Retake
                  </button>
                )}

                {/* Notes textarea */}
                {(verifyState === "matched" ||
                  (verifyState === "idle" && currentItem.captured)) && (
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
              {currentIndex === total - 1 ? (
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
              Click "Try Again" and select the correct product to continue.
            </div>
          )}
        </main>
      </div>
    </>
  );
}
