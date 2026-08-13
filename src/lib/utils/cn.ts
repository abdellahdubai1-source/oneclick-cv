import { clsx, type ClassValue } from 'clsx';

/** Thin wrapper around clsx kept separate so we can add tailwind-merge later without touching call sites. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(...inputs);
}
