/**
 * Compare two image data URLs using multiple strict methods.
 * Returns a similarity score from 0 (different) to 1 (identical).
 */
export async function compareImages(
  ref: string,
  captured: string,
): Promise<number> {
  const loadPixels = (
    dataUrl: string,
    size: number,
  ): Promise<Uint8ClampedArray> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("No canvas context"));
          ctx.drawImage(img, 0, 0, size, size);
          resolve(ctx.getImageData(0, 0, size, size).data);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = dataUrl;
    });

  try {
    const HIST_SIZE = 64;
    const BINS = 16;
    const STRUCT_SIZE = 32;

    const computeHistogram = (data: Uint8ClampedArray): number[] => {
      const hist = new Array(BINS * 3).fill(0);
      const total = HIST_SIZE * HIST_SIZE;
      for (let i = 0; i < data.length; i += 4) {
        hist[Math.floor((data[i] / 256) * BINS)]++;
        hist[BINS + Math.floor((data[i + 1] / 256) * BINS)]++;
        hist[BINS * 2 + Math.floor((data[i + 2] / 256) * BINS)]++;
      }
      for (let i = 0; i < hist.length; i++) hist[i] /= total;
      return hist;
    };

    const toGray = (data: Uint8ClampedArray): number[] => {
      const g: number[] = [];
      for (let i = 0; i < data.length; i += 4) {
        g.push(
          (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255,
        );
      }
      return g;
    };

    // Perceptual hash: compare mean brightness of 8x8 macro cells
    const phash = (gray: number[]): boolean[] => {
      const CELL = 4; // 32 / 8
      const GRID = 8;
      const cells: number[] = [];
      for (let cy = 0; cy < GRID; cy++) {
        for (let cx = 0; cx < GRID; cx++) {
          let sum = 0;
          for (let py = 0; py < CELL; py++) {
            for (let px = 0; px < CELL; px++) {
              sum += gray[(cy * CELL + py) * STRUCT_SIZE + (cx * CELL + px)];
            }
          }
          cells.push(sum / (CELL * CELL));
        }
      }
      const mean = cells.reduce((a, b) => a + b, 0) / cells.length;
      return cells.map((v) => v >= mean);
    };

    const [d64ref, d64cap, d32ref, d32cap] = await Promise.all([
      loadPixels(ref, HIST_SIZE),
      loadPixels(captured, HIST_SIZE),
      loadPixels(ref, STRUCT_SIZE),
      loadPixels(captured, STRUCT_SIZE),
    ]);

    // 1. Color histogram intersection
    const h1 = computeHistogram(d64ref);
    const h2 = computeHistogram(d64cap);
    let histIntersection = 0;
    for (let i = 0; i < h1.length; i++)
      histIntersection += Math.min(h1[i], h2[i]);
    const histScore = histIntersection / 3;

    // 2. Structural MAE on 32x32 grayscale
    const g1 = toGray(d32ref);
    const g2 = toGray(d32cap);
    let structDiff = 0;
    for (let i = 0; i < g1.length; i++) structDiff += Math.abs(g1[i] - g2[i]);
    const structScore = 1 - structDiff / g1.length;

    // 3. pHash Hamming distance
    const hash1 = phash(g1);
    const hash2 = phash(g2);
    let hammingDist = 0;
    for (let i = 0; i < hash1.length; i++)
      if (hash1[i] !== hash2[i]) hammingDist++;
    const hashScore = 1 - hammingDist / hash1.length;

    // Hard gate: clamp score to fail if structural or hash is clearly different
    const combined = histScore * 0.2 + structScore * 0.4 + hashScore * 0.4;
    if (structScore < 0.65 || hashScore < 0.6) return Math.min(combined, 0.7);

    return combined;
  } catch {
    return 0;
  }
}

/** Minimum similarity score considered a match (0-1). */
export const MATCH_THRESHOLD = 0.85;
