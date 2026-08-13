import type { Metadata } from 'next';
import BuilderShell from '@/components/builder/BuilderShell';

export const metadata: Metadata = {
  title: 'CV Builder',
  description: 'Build a professional, UAE-ready CV with live preview, AI suggestions and ATS guidance.',
};

export default function BuilderPage() {
  return <BuilderShell />;
}
