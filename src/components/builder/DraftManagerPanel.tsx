'use client';

import { useEffect, useState } from 'react';
import { useCVStore } from '@/lib/state/cvStore';
import {
  listDrafts,
  loadDraft,
  deleteDraft,
  renameDraft,
  duplicateDraft,
  type DraftIndexEntry,
} from '@/lib/state/draftStorage';
import { createEmptyCV } from '@/lib/cv/defaults';
import { formatDraftTimestamp } from '@/lib/utils/dates';

export default function DraftManagerPanel({ onClose }: { onClose: () => void }) {
  const cv = useCVStore((s) => s.cv);
  const replaceCV = useCVStore((s) => s.replaceCV);
  const [drafts, setDrafts] = useState<DraftIndexEntry[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setDrafts(listDrafts());
  }, [cv.meta.id, cv.meta.updatedAt]);

  function refresh() {
    setDrafts(listDrafts());
  }

  function handleSwitch(id: string) {
    const draft = loadDraft(id);
    if (draft) {
      replaceCV(draft);
      onClose();
    }
  }

  function handleNew() {
    const fresh = createEmptyCV('Untitled CV');
    replaceCV(fresh);
    onClose();
  }

  function handleDuplicate(id: string) {
    duplicateDraft(id);
    refresh();
  }

  function handleDelete(id: string) {
    deleteDraft(id);
    refresh();
    setConfirmDeleteId(null);
    if (id === cv.meta.id) {
      const [next] = listDrafts();
      if (next) {
        const draft = loadDraft(next.id);
        if (draft) replaceCV(draft);
      } else {
        replaceCV(createEmptyCV('My CV'));
      }
    }
  }

  function commitRename(id: string) {
    if (renameValue.trim()) {
      renameDraft(id, renameValue.trim());
      if (id === cv.meta.id) replaceCV({ ...cv, meta: { ...cv.meta, name: renameValue.trim() } });
    }
    setRenamingId(null);
    refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink-900/40 p-4 pt-20">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl animate-scaleIn">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-900">Your drafts</h3>
          <button type="button" onClick={onClose} className="text-ink-400 hover:text-ink-700" aria-label="Close">
            ✕
          </button>
        </div>

        <button type="button" onClick={handleNew} className="btn-secondary mt-3 w-full justify-center">
          + Start a new CV
        </button>

        <div className="mt-4 max-h-96 space-y-2 overflow-y-auto scroll-thin">
          {drafts.length === 0 && <p className="text-sm text-ink-400">No saved drafts yet.</p>}
          {drafts.map((d) => (
            <div
              key={d.id}
              className={`rounded-xl border p-3 ${d.id === cv.meta.id ? 'border-brand-300 bg-brand-50' : 'border-ink-100'}`}
            >
              {renamingId === d.id ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    className="input"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && commitRename(d.id)}
                  />
                  <button type="button" onClick={() => commitRename(d.id)} className="rounded-lg bg-brand-600 px-3 text-xs font-semibold text-white">
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{d.name}</p>
                    <p className="text-[11px] text-ink-400">Updated {formatDraftTimestamp(d.updatedAt)}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {d.id !== cv.meta.id && (
                      <button type="button" onClick={() => handleSwitch(d.id)} className="rounded-md border border-ink-200 px-2 py-1 text-[11px] font-medium text-ink-600 hover:bg-ink-50">
                        Open
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingId(d.id);
                        setRenameValue(d.name);
                      }}
                      className="rounded-md border border-ink-200 px-2 py-1 text-[11px] font-medium text-ink-600 hover:bg-ink-50"
                    >
                      Rename
                    </button>
                    <button type="button" onClick={() => handleDuplicate(d.id)} className="rounded-md border border-ink-200 px-2 py-1 text-[11px] font-medium text-ink-600 hover:bg-ink-50">
                      Duplicate
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(d.id)}
                      className="rounded-md border border-red-200 px-2 py-1 text-[11px] font-medium text-red-500 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

              {confirmDeleteId === d.id && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
                  <p className="text-[11px] text-red-700">Delete "{d.name}" permanently?</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setConfirmDeleteId(null)} className="text-[11px] font-semibold text-ink-600">
                      Cancel
                    </button>
                    <button type="button" onClick={() => handleDelete(d.id)} className="text-[11px] font-semibold text-red-600">
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
