/**
 * Resize and compress an image data URL to reduce storage size.
 */
export function compressImage(
  dataUrl: string,
  maxSize = 150,
  quality = 0.5,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

/**
 * Get pixel data from an image URL at a fixed size for comparison.
 */
function getPixels(dataUrl: string, size = 32): Promise<Uint8ClampedArray> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("No canvas context"));
      ctx.drawImage(img, 0, 0, size, size);
      resolve(ctx.getImageData(0, 0, size, size).data);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

/**
 * Compute a simple perceptual hash (average hash) for an image.
 */
async function avgHash(dataUrl: string, size = 16): Promise<boolean[]> {
  const pixels = await getPixels(dataUrl, size);
  // Convert to grayscale
  const gray: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    gray.push(
      0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2],
    );
  }
  const avg = gray.reduce((a, b) => a + b, 0) / gray.length;
  return gray.map((v) => v >= avg);
}

/**
 * Compare two images and return a similarity score from 0 to 1.
 * Uses average perceptual hash + color histogram comparison.
 */
export async function compareImages(
  dataUrl1: string,
  dataUrl2: string,
): Promise<number> {
  try {
    // --- 1. Perceptual hash similarity ---
    const [hash1, hash2] = await Promise.all([
      avgHash(dataUrl1, 16),
      avgHash(dataUrl2, 16),
    ]);
    let hashMatch = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] === hash2[i]) hashMatch++;
    }
    const hashScore = hashMatch / hash1.length;

    // --- 2. Color histogram similarity (8 bins per channel) ---
    const bins = 8;
    const [px1, px2] = await Promise.all([
      getPixels(dataUrl1, 64),
      getPixels(dataUrl2, 64),
    ]);

    const hist1 = new Float32Array(bins * 3).fill(0);
    const hist2 = new Float32Array(bins * 3).fill(0);
    const total = px1.length / 4;

    for (let i = 0; i < px1.length; i += 4) {
      const rb1 = Math.floor((px1[i] / 256) * bins);
      const gb1 = Math.floor((px1[i + 1] / 256) * bins);
      const bb1 = Math.floor((px1[i + 2] / 256) * bins);
      hist1[rb1]++;
      hist1[bins + gb1]++;
      hist1[bins * 2 + bb1]++;

      const rb2 = Math.floor((px2[i] / 256) * bins);
      const gb2 = Math.floor((px2[i + 1] / 256) * bins);
      const bb2 = Math.floor((px2[i + 2] / 256) * bins);
      hist2[rb2]++;
      hist2[bins + gb2]++;
      hist2[bins * 2 + bb2]++;
    }

    // Normalize
    for (let i = 0; i < hist1.length; i++) {
      hist1[i] /= total;
      hist2[i] /= total;
    }

    // Intersection score
    let intersection = 0;
    for (let i = 0; i < hist1.length; i++) {
      intersection += Math.min(hist1[i], hist2[i]);
    }
    const histScore = intersection / 3; // 3 channels, each sums to 1

    // --- 3. Pixel-level structural similarity (8x8 blocks) ---
    const [spx1, spx2] = await Promise.all([
      getPixels(dataUrl1, 8),
      getPixels(dataUrl2, 8),
    ]);
    let structMatch = 0;
    for (let i = 0; i < spx1.length; i += 4) {
      const dr = Math.abs(spx1[i] - spx2[i]);
      const dg = Math.abs(spx1[i + 1] - spx2[i + 1]);
      const db = Math.abs(spx1[i + 2] - spx2[i + 2]);
      const diff = (dr + dg + db) / 3;
      if (diff < 60) structMatch++;
    }
    const structScore = structMatch / (spx1.length / 4);

    // Weighted combination
    return hashScore * 0.4 + histScore * 0.4 + structScore * 0.2;
  } catch {
    return 0;
  }
}
