import { useCamera } from "@/camera/useCamera";
import { Button } from "@/components/ui/button";
import { AlertCircle, Camera, RefreshCw, X } from "lucide-react";
import { useEffect, useRef } from "react";

interface Props {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
  title?: string;
}

export default function CameraCapture({
  onCapture,
  onClose,
  title = "Capture Photo",
}: Props) {
  const {
    isActive,
    isSupported,
    error,
    isLoading,
    startCamera,
    stopCamera,
    capturePhoto,
    videoRef,
    canvasRef,
  } = useCamera({
    facingMode: "environment",
    quality: 0.85,
    format: "image/jpeg",
  });

  const startedRef = useRef(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: camera starts once on mount
  useEffect(() => {
    if (!startedRef.current) {
      startedRef.current = true;
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, []);

  const handleCapture = async () => {
    const file = await capturePhoto();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      onCapture(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-black/80 backdrop-blur-sm">
        <span className="text-white font-semibold text-lg">{title}</span>
        <button
          type="button"
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Close camera"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Camera preview */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        {isSupported === false ? (
          <div className="text-center p-6">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-white font-medium">Camera not supported</p>
            <p className="text-white/60 text-sm mt-1">
              Please use a device with a camera.
            </p>
          </div>
        ) : error ? (
          <div className="text-center p-6">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <p className="text-white font-medium">Camera Error</p>
            <p className="text-white/60 text-sm mt-1">{error.message}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
              <span className="text-white/80 text-sm">Starting camera...</span>
            </div>
          </div>
        )}

        {/* Viewfinder overlay */}
        {isActive && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-white/30 rounded-2xl" />
            <div className="absolute top-10 left-10 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-sm" />
            <div className="absolute top-10 right-10 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-sm" />
            <div className="absolute bottom-10 left-10 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-sm" />
            <div className="absolute bottom-10 right-10 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-sm" />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* Capture button */}
      <div className="flex items-center justify-center py-8 bg-black/80">
        <Button
          type="button"
          onClick={handleCapture}
          disabled={!isActive || isLoading}
          data-ocid="camera.button"
          className="w-20 h-20 rounded-full border-4 border-white bg-transparent hover:bg-white/10 flex items-center justify-center disabled:opacity-40 transition-transform active:scale-95 p-0"
          aria-label="Take photo"
        >
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
            <Camera className="w-8 h-8 text-black" />
          </div>
        </Button>
      </div>
    </div>
  );
}
