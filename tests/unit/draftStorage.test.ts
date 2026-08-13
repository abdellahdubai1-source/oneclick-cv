import { describe, expect, it } from 'vitest';
import { createEmptyCV } from '@/lib/cv/defaults';
import { prepareCVForStorage } from '@/lib/state/draftStorage';

describe('draft photo storage', () => {
  it('keeps the processed CV photo but removes the full-resolution source', () => {
    const cv = createEmptyCV('Photo CV');
    cv.photo.originalDataUrl = `data:image/jpeg;base64,${'a'.repeat(2_000_000)}`;
    cv.photo.processedDataUrl = 'data:image/jpeg;base64,small-photo';

    const stored = prepareCVForStorage(cv);

    expect(stored.photo.originalDataUrl).toBeNull();
    expect(stored.photo.processedDataUrl).toBe(cv.photo.processedDataUrl);
    expect(cv.photo.originalDataUrl).not.toBeNull();
  });
});
