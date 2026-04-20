export async function compressImageToBlob(
  file: File,
  maxInputMb: number = 5,
  targetKb: number = 60,
  maxDimension: number = 1024
): Promise<Blob> {
  // Input size check
  if (file.size > maxInputMb * 1024 * 1024) {
    throw new Error(`File is too large. Maximum size is ${maxInputMb}MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        const targetBytes = targetKb * 1024;

        const draw = (w: number, h: number) => {
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas context not available');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);
          ctx.drawImage(img, 0, 0, w, h);
          return canvas;
        };

        const scaleToMaxDimension = (w: number, h: number, maxDim: number) => {
          if (w <= 0 || h <= 0) return { w: 1, h: 1 };
          if (w <= maxDim && h <= maxDim) return { w, h };
          if (w >= h) {
            return { w: maxDim, h: Math.max(1, Math.round((h * maxDim) / w)) };
          }
          return { w: Math.max(1, Math.round((w * maxDim) / h)), h: maxDim };
        };

        let { w: drawW, h: drawH } = scaleToMaxDimension(width, height, maxDimension);

        // Multi-pass: first try quality reduction; if still too big, reduce dimensions.
        const runPass = (attempt: number) => {
          const canvas = draw(drawW, drawH);
          let quality = 0.85;

          const tryQuality = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) return reject(new Error('Blob creation failed'));
                if (blob.size <= targetBytes) {
                  return resolve(blob);
                }
                if (quality > 0.35) {
                  quality -= 0.07;
                  return tryQuality();
                }

                // Quality floor reached; reduce dimensions and retry a limited number of times.
                if (attempt >= 6) {
                  return resolve(blob);
                }
                drawW = Math.max(320, Math.round(drawW * 0.85));
                drawH = Math.max(320, Math.round(drawH * 0.85));
                return runPass(attempt + 1);
              },
              'image/jpeg',
              quality
            );
          };

          tryQuality();
        };

        try {
          runPass(0);
        } catch (err) {
          reject(err);
        }
      };
      
      img.onerror = () => reject(new Error('Invalid image file'));
      
      if (typeof e.target?.result === 'string') {
        img.src = e.target.result;
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
