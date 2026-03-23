/**
 * Compare two image data URLs using pixel similarity.
 * Returns a similarity score from 0 (completely different) to 1 (identical).
 */
export async function compareImages(
  ref: string,
  captured: string,
): Promise<number> {
  const SIZE = 32;

  const getPixels = (dataUrl: string): Promise<Uint8ClampedArray> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("No canvas context"));
          ctx.drawImage(img, 0, 0, SIZE, SIZE);
          resolve(ctx.getImageData(0, 0, SIZE, SIZE).data);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = dataUrl;
    });

  try {
    const [p1, p2] = await Promise.all([getPixels(ref), getPixels(captured)]);
    let diff = 0;
    for (let i = 0; i < p1.length; i += 4) {
      diff +=
        Math.abs(p1[i] - p2[i]) +
        Math.abs(p1[i + 1] - p2[i + 1]) +
        Math.abs(p1[i + 2] - p2[i + 2]);
    }
    const maxDiff = SIZE * SIZE * 3 * 255;
    return 1 - diff / maxDiff;
  } catch {
    return 0;
  }
}

/** Minimum similarity score considered a match (0–1). */
export const MATCH_THRESHOLD = 0.4;
