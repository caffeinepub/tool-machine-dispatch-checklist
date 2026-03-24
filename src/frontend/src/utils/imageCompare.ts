/**
 * Compare two image data URLs using color histogram similarity.
 * More robust than direct pixel comparison -- different products with similar
 * backgrounds will still score low because their color distributions differ.
 * Returns a similarity score from 0 (completely different) to 1 (identical).
 */
export async function compareImages(
  ref: string,
  captured: string,
): Promise<number> {
  const SIZE = 64;
  const BINS = 16; // 16 bins per channel

  const getHistogram = (dataUrl: string): Promise<number[]> =>
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
          const data = ctx.getImageData(0, 0, SIZE, SIZE).data;

          // Build separate histograms for R, G, B channels
          const hist = new Array(BINS * 3).fill(0);
          const total = SIZE * SIZE;
          for (let i = 0; i < data.length; i += 4) {
            const r = Math.floor((data[i] / 256) * BINS);
            const g = Math.floor((data[i + 1] / 256) * BINS);
            const b = Math.floor((data[i + 2] / 256) * BINS);
            hist[r]++;
            hist[BINS + g]++;
            hist[BINS * 2 + b]++;
          }
          // Normalize
          for (let i = 0; i < hist.length; i++) hist[i] /= total;
          resolve(hist);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = dataUrl;
    });

  // Also compare pixel structure at a coarse grid to catch structural differences
  const getCoarsePixels = (dataUrl: string): Promise<number[]> =>
    new Promise((resolve, reject) => {
      const COARSE = 16;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = COARSE;
          canvas.height = COARSE;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("No canvas context"));
          ctx.drawImage(img, 0, 0, COARSE, COARSE);
          const data = ctx.getImageData(0, 0, COARSE, COARSE).data;
          const pixels: number[] = [];
          for (let i = 0; i < data.length; i += 4) {
            // Grayscale
            pixels.push(
              (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) /
                255,
            );
          }
          resolve(pixels);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = dataUrl;
    });

  try {
    const [[h1, h2], [p1, p2]] = await Promise.all([
      Promise.all([getHistogram(ref), getHistogram(captured)]),
      Promise.all([getCoarsePixels(ref), getCoarsePixels(captured)]),
    ]);

    // Bhattacharyya-inspired histogram similarity (intersection)
    let histIntersection = 0;
    for (let i = 0; i < h1.length; i++) {
      histIntersection += Math.min(h1[i], h2[i]);
    }
    const histScore = histIntersection / 3; // max is 3 (sum of all normalized bins per channel)

    // Structural similarity (coarse pixel)
    let structDiff = 0;
    for (let i = 0; i < p1.length; i++) {
      structDiff += Math.abs(p1[i] - p2[i]);
    }
    const structScore = 1 - structDiff / p1.length;

    // Weighted combination: structure matters more than color histogram
    return histScore * 0.4 + structScore * 0.6;
  } catch {
    return 0;
  }
}

/** Minimum similarity score considered a match (0–1). */
export const MATCH_THRESHOLD = 0.75;
