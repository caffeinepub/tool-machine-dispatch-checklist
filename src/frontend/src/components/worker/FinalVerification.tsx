import { Button } from "@/components/ui/button";
import { useQRScanner } from "@/qr-code/useQRScanner";
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Expand,
  QrCode,
  RefreshCw,
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

function QRScannerPanel({ onScanned }: { onScanned: (data: string) => void }) {
  const {
    qrResults,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 150,
    maxResults: 3,
  });

  const latestResult = qrResults[0];

  const handleUse = () => {
    if (latestResult) {
      stopScanning();
      onScanned(latestResult.data);
    }
  };

  if (isSupported === false) {
    return (
      <div className="card-inner p-6 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-2" />
        <p className="text-sm text-foreground font-medium">
          Camera not supported
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative rounded-xl overflow-hidden bg-black"
        style={{ minHeight: "240px" }}
      >
        <video
          ref={videoRef}
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            minHeight: "240px",
            objectFit: "cover",
          }}
        />
        <canvas ref={canvasRef} style={{ display: "none" }} />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {isActive && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-40 h-40 border-2 border-primary rounded-xl" />
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center p-4">
              <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
              <p className="text-white/80 text-xs">{error.message}</p>
            </div>
          </div>
        )}
      </div>

      {!isActive && !isLoading && (
        <Button
          data-ocid="verification.primary_button"
          onClick={startScanning}
          disabled={!canStartScanning}
          className="w-full bg-primary hover:bg-primary/90"
          style={{ height: "52px" }}
        >
          <QrCode className="w-4 h-4 mr-2" aria-hidden="true" />
          Start QR Scanner
        </Button>
      )}

      {isActive && (
        <button
          type="button"
          data-ocid="verification.secondary_button"
          onClick={stopScanning}
          className="text-sm text-muted-foreground underline text-center"
        >
          Stop scanning
        </button>
      )}

      {latestResult && (
        <div className="card-inner p-3">
          <p className="text-xs text-muted-foreground mb-1">Scanned QR Data:</p>
          <p className="text-sm font-mono text-success break-all">
            {latestResult.data}
          </p>
          <Button
            data-ocid="verification.primary_button"
            onClick={handleUse}
            className="w-full mt-3 bg-success/20 hover:bg-success/30 text-success border border-success/30"
            style={{ height: "48px" }}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" /> Use
            This QR Code
          </Button>
        </div>
      )}
    </div>
  );
}

export default function FinalVerification({
  dispatch,
  onComplete,
  onBack,
}: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [toolboxPhoto, setToolboxPhoto] = useState<string | undefined>(
    undefined,
  );
  const [qrData, setQrData] = useState<string | undefined>(undefined);
  const [showCamera, setShowCamera] = useState(false);
  const [lightbox, setLightbox] = useState<{
    src: string;
    caption: string;
  } | null>(null);

  const handleToolboxCapture = (dataUrl: string) => {
    setToolboxPhoto(dataUrl);
    setShowCamera(false);
  };

  const handleQRScanned = (data: string) => {
    setQrData(data);
  };

  const handleSubmit = () => {
    onComplete({ ...dispatch, toolboxPhotoDataUrl: toolboxPhoto, qrData });
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
          title="Capture Full Toolbox"
          onCapture={handleToolboxCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="min-h-screen bg-background flex flex-col max-w-[430px] mx-auto">
        <OfflineBanner />
        <header className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
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
            <h1 className="font-semibold text-foreground">
              Final Verification
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              {dispatch.id}
            </p>
          </div>
        </header>

        <main className="flex-1 p-4 space-y-4">
          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {([1, 2] as const).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                    step === s
                      ? "bg-primary border-primary text-primary-foreground"
                      : s < step
                        ? "bg-success/20 border-success text-success"
                        : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                <span
                  className={`text-xs font-medium ${
                    step === s
                      ? "text-foreground"
                      : s < step
                        ? "text-success"
                        : "text-muted-foreground"
                  }`}
                >
                  {s === 1 ? "Toolbox Photo" : "QR Scan"}
                </span>
                {s < 2 && (
                  <div
                    className="h-px bg-border mx-2"
                    style={{ width: "40px" }}
                  />
                )}
              </div>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="card-panel p-5">
                <h2 className="font-display text-xl font-bold text-foreground mb-1">
                  📦 Toolbox Photo
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Capture a full photo of the complete toolbox before dispatch.
                </p>

                {toolboxPhoto ? (
                  <div className="relative">
                    <button
                      type="button"
                      data-ocid="verification.button"
                      onClick={() =>
                        setLightbox({
                          src: toolboxPhoto,
                          caption: "Full Toolbox",
                        })
                      }
                      aria-label="View toolbox photo full size"
                      className="relative rounded-xl overflow-hidden bg-black w-full group"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <img
                        src={toolboxPhoto}
                        alt="Full toolbox"
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
                    <button
                      type="button"
                      data-ocid="verification.secondary_button"
                      onClick={() => setShowCamera(true)}
                      className="absolute top-2 right-2 bg-black/50 rounded-lg px-2 py-1 text-xs text-white"
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    data-ocid="verification.primary_button"
                    onClick={() => setShowCamera(true)}
                    className="w-full border-2 border-dashed border-border rounded-xl flex flex-col items-center py-10 gap-3 hover:border-primary/50 transition-all"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                      <Camera
                        className="w-7 h-7 text-primary"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Tap to capture toolbox
                    </span>
                  </button>
                )}
              </div>

              <Button
                data-ocid="verification.primary_button"
                onClick={() => setStep(2)}
                disabled={!toolboxPhoto}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40"
                style={{ height: "52px" }}
              >
                Next: Scan QR Code →
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="card-panel p-5">
                <h2 className="font-display text-xl font-bold text-foreground mb-1">
                  📱 Scan Machine QR
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan the machine or dispatch QR code to verify identity.
                </p>

                {qrData ? (
                  <div className="card-inner p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-sm font-semibold text-success">
                        QR Code Scanned
                      </span>
                    </div>
                    <p className="text-xs font-mono text-foreground/80 break-all">
                      {qrData}
                    </p>
                    <button
                      type="button"
                      data-ocid="verification.secondary_button"
                      onClick={() => setQrData(undefined)}
                      className="text-xs text-muted-foreground underline mt-2"
                    >
                      Scan again
                    </button>
                  </div>
                ) : (
                  <QRScannerPanel onScanned={handleQRScanned} />
                )}
              </div>

              <Button
                data-ocid="verification.submit_button"
                onClick={handleSubmit}
                disabled={!qrData}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 font-semibold text-base"
                style={{ height: "52px" }}
              >
                Submit Dispatch ✓
              </Button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
