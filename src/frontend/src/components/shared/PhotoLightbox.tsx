import { X } from "lucide-react";
import { useEffect } from "react";

interface Props {
  src: string;
  caption?: string;
  onClose: () => void;
}

export default function PhotoLightbox({ src, caption, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled via window listener
    <div
      data-ocid="photo.modal"
      className="fixed inset-0 z-[60] bg-black/95 flex flex-col cursor-pointer"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        data-ocid="photo.close_button"
        onClick={onClose}
        aria-label="Close photo"
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
      >
        <X className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Image — stop propagation so clicking image doesn't close */}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: decorative stop-prop wrapper */}
      <div
        className="flex-1 flex items-center justify-center p-4 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={caption ?? "Captured photo"}
          className="max-w-full max-h-full object-contain rounded-lg select-none"
          style={{ maxHeight: "calc(100vh - 80px)" }}
        />
      </div>

      {/* Caption */}
      {caption && (
        // biome-ignore lint/a11y/useKeyWithClickEvents: decorative stop-prop wrapper
        <div
          className="pb-6 px-6 text-center cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-white/80 text-sm">{caption}</p>
        </div>
      )}
    </div>
  );
}
