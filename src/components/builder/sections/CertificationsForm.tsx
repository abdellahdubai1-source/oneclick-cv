'use client';

import { useCVStore } from '@/lib/state/cvStore';

export default function CertificationsForm() {
  const cv = useCVStore((s) => s.cv);
  const addCertification = useCVStore((s) => s.addCertification);
  const updateCertification = useCVStore((s) => s.updateCertification);
  const removeCertification = useCVStore((s) => s.removeCertification);
  const addProject = useCVStore((s) => s.addProject);
  const updateProject = useCVStore((s) => s.updateProject);
  const removeProject = useCVStore((s) => s.removeProject);
  const addReference = useCVStore((s) => s.addReference);
  const updateReference = useCVStore((s) => s.updateReference);
  const removeReference = useCVStore((s) => s.removeReference);

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Certifications</h2>
          <button type="button" onClick={addCertification} className="btn-secondary">+ Add certification</button>
        </div>
        <div className="mt-4 space-y-3">
          {cv.certifications.map((c) => (
            <div key={c.id} className="grid grid-cols-1 gap-3 rounded-xl border border-ink-100 p-4 sm:grid-cols-2">
              <input className="input" placeholder="Certification name" value={c.name} onChange={(e) => updateCertification(c.id, { name: e.target.value })} />
              <input className="input" placeholder="Issuing organisation" value={c.issuingOrganization} onChange={(e) => updateCertification(c.id, { issuingOrganization: e.target.value })} />
              <input type="month" className="input" value={c.issueDate ?? ''} onChange={(e) => updateCertification(c.id, { issueDate: e.target.value })} />
              <div className="flex justify-end sm:col-span-2">
                <button type="button" onClick={() => removeCertification(c.id)} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
              </div>
            </div>
          ))}
          {cv.certifications.length === 0 && <p className="text-sm text-ink-400">No certifications added.</p>}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Projects</h2>
            <p className="mt-1 text-xs text-ink-500">Optional — useful for technical, creative and portfolio-based roles.</p>
          </div>
          <button type="button" onClick={addProject} className="btn-secondary">+ Add project</button>
        </div>
        <div className="mt-4 space-y-3">
          {cv.projects.map((p) => (
            <div key={p.id} className="space-y-2 rounded-xl border border-ink-100 p-4">
              <input className="input" placeholder="Project name" value={p.name} onChange={(e) => updateProject(p.id, { name: e.target.value })} />
              <textarea className="input" rows={2} placeholder="Short description" value={p.description} onChange={(e) => updateProject(p.id, { description: e.target.value })} />
              <input
                className="input"
                placeholder="Technologies used (comma-separated)"
                value={p.technologies.join(', ')}
                onChange={(e) => updateProject(p.id, { technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => removeProject(p.id)} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
              </div>
            </div>
          ))}
          {cv.projects.length === 0 && <p className="text-sm text-ink-400">No projects added.</p>}
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">References</h2>
            <p className="mt-1 text-xs text-ink-500">Optional — many UAE employers ask for these separately.</p>
          </div>
          <button type="button" onClick={addReference} className="btn-secondary">+ Add reference</button>
        </div>
        <div className="mt-4 space-y-3">
          {cv.references.map((r) => (
            <div key={r.id} className="grid grid-cols-1 gap-3 rounded-xl border border-ink-100 p-4 sm:grid-cols-2">
              <input className="input" placeholder="Name" value={r.name} onChange={(e) => updateReference(r.id, { name: e.target.value })} />
              <input className="input" placeholder="Job title" value={r.jobTitle ?? ''} onChange={(e) => updateReference(r.id, { jobTitle: e.target.value })} />
              <input className="input" placeholder="Company" value={r.companyName ?? ''} onChange={(e) => updateReference(r.id, { companyName: e.target.value })} />
              <input className="input" placeholder="Phone or email" value={r.phone ?? r.email ?? ''} onChange={(e) => updateReference(r.id, { phone: e.target.value })} />
              <div className="flex justify-end sm:col-span-2">
                <button type="button" onClick={() => removeReference(r.id)} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
              </div>
            </div>
          ))}
          {cv.references.length === 0 && <p className="text-sm text-ink-400">No references added.</p>}
        </div>
      </div>
    </div>
  );
}
