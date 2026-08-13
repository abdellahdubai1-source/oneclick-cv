/**
 * Canvas-based crop/rotate helper for the photo editor. Pure browser APIs
 * only (no extra dependency beyond react-easy-crop for the drag/zoom UI) —
 * produces a lossless-as-possible final image and never stretches or
 * distorts the source (spec §10: `object-fit: cover` semantics are
 * replicated here by cropping to the exact pixel box react-easy-crop
 * reports).
 */

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (err) => reject(err));
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function rotatedSize(width: number, height: number, rotationDeg: number) {
  const rotRad = toRadians(rotationDeg);
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

const MAX_OUTPUT_DIMENSION = 800; // px — plenty for print-quality CV photos while keeping localStorage payload small

export async function getCroppedImageDataUrl(
  imageSrc: string,
  cropPixels: PixelCrop,
  rotationDeg: number,
  outputType: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality = 0.92,
): Promise<string> {
  const image = await createImage(imageSrc);

  const rotatedCanvas = document.createElement('canvas');
  const rotatedCtx = rotatedCanvas.getContext('2d');
  if (!rotatedCtx) throw new Error('Canvas 2D context unavailable');

  const { width: rotW, height: rotH } = rotatedSize(image.width, image.height, rotationDeg);
  rotatedCanvas.width = rotW;
  rotatedCanvas.height = rotH;

  rotatedCtx.translate(rotW / 2, rotH / 2);
  rotatedCtx.rotate(toRadians(rotationDeg));
  rotatedCtx.drawImage(image, -image.width / 2, -image.height / 2);

  const outputCanvas = document.createElement('canvas');
  const outputCtx = outputCanvas.getContext('2d');
  if (!outputCtx) throw new Error('Canvas 2D context unavailable');

  const scale = Math.min(1, MAX_OUTPUT_DIMENSION / Math.max(cropPixels.width, cropPixels.height));
  outputCanvas.width = Math.round(cropPixels.width * scale);
  outputCanvas.height = Math.round(cropPixels.height * scale);

  outputCtx.imageSmoothingEnabled = true;
  outputCtx.imageSmoothingQuality = 'high';
  outputCtx.drawImage(
    rotatedCanvas,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    outputCanvas.width,
    outputCanvas.height,
  );

  return outputCanvas.toDataURL(outputType, quality);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_PHOTO_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type as (typeof ACCEPTED_PHOTO_TYPES)[number])) {
    return 'Please upload a JPG, PNG or WebP image.';
  }
  if (file.size > MAX_PHOTO_UPLOAD_BYTES) {
    return 'Image is too large. Please upload a photo under 8MB.';
  }
  return null;
}
