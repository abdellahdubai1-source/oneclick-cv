'use client';

import { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';
import { useCVStore } from '@/lib/state/cvStore';
import { TEMPLATE_REGISTRY } from '@/lib/templates/registry';
import {
  getCroppedImageDataUrl,
  readFileAsDataUrl,
  validatePhotoFile,
  type PixelCrop,
} from '@/lib/photo/cropImage';
import { cn } from '@/lib/utils/cn';

const SHAPE_ASPECT: Record<string, number> = {
  circle: 1,
  'rounded-square': 1,
  square: 1,
  rectangle: 3 / 4,
};

export default function PhotoEditor() {
  const cv = useCVStore((s) => s.cv);
  const updatePhoto = useCVStore((s) => s.updatePhoto);
  const updatePersonal = useCVStore((s) => s.updatePersonal);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);

  const [crop, setCrop] = useState<Point>({ x: cv.photo.crop.x, y: cv.photo.crop.y });
  const [zoom, setZoom] = useState(cv.photo.crop.zoom || 1);
  const [rotation, setRotation] = useState(cv.photo.crop.rotationDeg || 0);
  const [pendingAreaPixels, setPendingAreaPixels] = useState<Area | null>(null);

  const templateDef = TEMPLATE_REGISTRY[cv.template.templateId];
  const aspect = SHAPE_ASPECT[templateDef.photo.shape] ?? 1;
  const roundPreview = templateDef.photo.shape === 'circle';
  const hasPhoto = Boolean(cv.photo.originalDataUrl || cv.photo.processedDataUrl);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setPendingAreaPixels(croppedAreaPixels);
  }, []);

  async function handleFileSelected(file: File) {
    setError(null);
    const validationError = validatePhotoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setBusy(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      updatePhoto({
        originalDataUrl: dataUrl,
        processedDataUrl: null,
        mimeType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
        crop: { x: 0, y: 0, zoom: 1, rotationDeg: 0, croppedAreaPixels: null },
      });
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setEditing(true);
    } catch {
      setError('We could not read that image. Please try another file.');
    } finally {
      setBusy(false);
    }
  }

  async function commitCrop() {
    if (!cv.photo.originalDataUrl || !pendingAreaPixels) return;
    setBusy(true);
    setError(null);
    try {
      const pixelCrop: PixelCrop = {
        x: pendingAreaPixels.x,
        y: pendingAreaPixels.y,
        width: pendingAreaPixels.width,
        height: pendingAreaPixels.height,
      };
      const processed = await getCroppedImageDataUrl(
        cv.photo.originalDataUrl,
        pixelCrop,
        rotation,
        (cv.photo.mimeType as 'image/jpeg' | 'image/png' | 'image/webp') ?? 'image/jpeg',
      );
      updatePhoto({
        processedDataUrl: processed,
        crop: { x: crop.x, y: crop.y, zoom, rotationDeg: rotation, croppedAreaPixels: pixelCrop },
      });
      setEditing(false);
    } catch {
      setError('Could not process this photo. Please try a different image.');
    } finally {
      setBusy(false);
    }
  }

  function handleRemove() {
    updatePhoto({
      originalDataUrl: null,
      processedDataUrl: null,
      mimeType: null,
      crop: { x: 0, y: 0, zoom: 1, rotationDeg: 0, croppedAreaPixels: null },
    });
    setEditing(false);
  }

  function handleReset() {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }

  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Professional photo</h3>
          <p className="text-xs text-ink-500">Optional — {templateDef.name} uses a {templateDef.photo.shape.replace('-', ' ')} photo.</p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-ink-600">
          <input
            type="checkbox"
            checked={cv.personal.photoEnabled}
            onChange={(e) => updatePersonal({ photoEnabled: e.target.checked })}
            className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
          />
          Show photo on CV
        </label>
      </div>

      {templateDef.photo.showsAtsWarningWhenEnabled && cv.personal.photoEnabled && (
        <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
          For the best ATS compatibility, we recommend using a CV without a photo unless the employer specifically
          requests one.
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFileSelected(file);
          e.target.value = '';
        }}
      />

      {!editing && (
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden border-2 border-dashed border-ink-200 bg-ink-50',
              roundPreview ? 'rounded-full' : 'rounded-xl',
            )}
          >
            {cv.photo.processedDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cv.photo.processedDataUrl} alt="CV photo preview" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[10px] text-ink-400">No photo</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
              disabled={busy}
            >
              {hasPhoto ? 'Replace photo' : 'Upload photo'}
            </button>
            {hasPhoto && (
              <>
                {cv.photo.originalDataUrl && (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-lg border border-ink-200 px-3.5 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
                  >
                    Edit crop
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-lg border border-red-200 px-3.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {editing && cv.photo.originalDataUrl && (
        <div className="space-y-4">
          <div className="relative h-64 w-full overflow-hidden rounded-xl bg-ink-900">
            <Cropper
              image={cv.photo.originalDataUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              cropShape={roundPreview ? 'round' : 'rect'}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              restrictPosition
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs text-ink-600">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-1 w-full accent-brand-600"
              />
            </label>
            <label className="text-xs text-ink-600">
              Rotate
              <input
                type="range"
                min={-45}
                max={45}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="mt-1 w-full accent-brand-600"
              />
            </label>
          </div>

          {error && <p className="text-xs font-medium text-red-600">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-ink-200 px-3.5 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-ink-200 px-3.5 py-2 text-xs font-semibold text-ink-700 transition hover:bg-ink-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={commitCrop}
              disabled={busy}
              className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Save photo'}
            </button>
          </div>
        </div>
      )}

      {error && !editing && <p className="mt-2 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
