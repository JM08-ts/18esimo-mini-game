/**
 * Client-Side Ultra-Fast & High-Quality Image Compression
 * - 2K Quad HD resolution: Max dimension 2560px preserving original aspect ratio
 * - No upscaling if image is smaller than 2560px
 * - Target format: image/jpeg with high quality 0.92 (92%)
 * - Explicit high-quality canvas smoothing for maximum sharpness
 */
export async function compressImage(
  file: File
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const originalWidth = img.naturalWidth || img.width;
      const originalHeight = img.naturalHeight || img.height;

      // 2K Quad HD max dimension (2560px)
      const MAX_DIMENSION = 2560;
      let targetWidth = originalWidth;
      let targetHeight = originalHeight;

      // Only scale down if original exceeds 2560px (no upscaling)
      if (originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION) {
        if (originalWidth >= originalHeight) {
          targetWidth = MAX_DIMENSION;
          targetHeight = Math.round((originalHeight * MAX_DIMENSION) / originalWidth);
        } else {
          targetHeight = MAX_DIMENSION;
          targetWidth = Math.round((originalWidth * MAX_DIMENSION) / originalHeight);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Impossibile inizializzare il contesto Canvas per la compressione.'));
        return;
      }

      // Explicit high-quality canvas smoothing for maximum sharpness
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw onto canvas
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Export to 2K Quad HD quality JPEG (0.92 = 92%)
      const QUALITY = 0.92;
      const dataUrl = canvas.toDataURL('image/jpeg', QUALITY);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Errore durante la compressione dell\'immagine.'));
            return;
          }
          resolve({ blob, dataUrl, width: targetWidth, height: targetHeight });
        },
        'image/jpeg',
        QUALITY
      );
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}
