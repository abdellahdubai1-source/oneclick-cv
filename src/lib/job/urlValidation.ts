import dns from 'node:dns/promises';
import net from 'node:net';

/**
 * SSRF defences for the public Job-Link Analyser (spec §19). This module is
 * intentionally the most conservative piece of the codebase: a false
 * negative here (allowing a request that should have been blocked) can let
 * the server be used to probe internal infrastructure, so every check
 * fails closed.
 */

export class UrlSecurityError extends Error {
  constructor(
    message: string,
    public readonly reason: string,
  ) {
    super(message);
    this.name = 'UrlSecurityError';
  }
}

const BLOCKED_HOSTNAMES = new Set(['localhost', 'localhost.localdomain', 'ip6-localhost', 'metadata.google.internal']);

/** Cloud metadata endpoints — MUST always be blocked regardless of any other rule. */
const METADATA_IPS = new Set(['169.254.169.254', 'fd00:ec2::254']);

function isIPv4PrivateOrReserved(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return true; // malformed — fail closed
  const [a, b] = parts as [number, number, number, number];

  if (a === 10) return true; // 10.0.0.0/8
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true; // 192.168.0.0/16
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local (incl. cloud metadata)
  if (a === 0) return true; // "this network"
  if (a >= 224) return true; // multicast/reserved
  if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10 (CGNAT)
  return false;
}

function isIPv6PrivateOrReserved(ip: string): boolean {
  const normalised = ip.toLowerCase();
  if (normalised === '::1') return true; // loopback
  if (normalised.startsWith('fe80:')) return true; // link-local
  if (normalised.startsWith('fc') || normalised.startsWith('fd')) return true; // unique local (fc00::/7)
  if (normalised.startsWith('::ffff:')) {
    // IPv4-mapped IPv6 — validate the embedded IPv4 address too.
    const mapped = normalised.split(':').pop() ?? '';
    if (net.isIPv4(mapped)) return isIPv4PrivateOrReserved(mapped);
  }
  return false;
}

function isPrivateOrReservedIp(ip: string): boolean {
  if (METADATA_IPS.has(ip)) return true;
  if (net.isIPv4(ip)) return isIPv4PrivateOrReserved(ip);
  if (net.isIPv6(ip)) return isIPv6PrivateOrReserved(ip);
  return true; // unrecognised format — fail closed
}

export interface ValidatedUrl {
  url: URL;
  resolvedIps: string[];
}

/**
 * Validates a candidate URL: scheme, hostname blocklist, then resolves DNS
 * and rejects if ANY resolved address is private/reserved/loopback/
 * link-local/metadata. Call this again for every redirect hop — a
 * validated URL is only safe to fetch at the moment it was checked.
 */
export async function validateJobUrl(rawUrl: string): Promise<ValidatedUrl> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UrlSecurityError('That doesn\'t look like a valid URL.', 'invalid_url');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UrlSecurityError('Only http and https links are supported.', 'invalid_scheme');
  }

  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    throw new UrlSecurityError('This host is not allowed.', 'blocked_hostname');
  }

  // If the hostname is already a literal IP, validate it directly.
  if (net.isIP(hostname)) {
    if (isPrivateOrReservedIp(hostname)) {
      throw new UrlSecurityError('This address is not allowed.', 'blocked_ip_literal');
    }
    return { url, resolvedIps: [hostname] };
  }

  let addresses: string[];
  try {
    const records = await dns.lookup(hostname, { all: true, verbatim: true });
    addresses = records.map((r) => r.address);
  } catch {
    throw new UrlSecurityError('We could not resolve this domain.', 'dns_resolution_failed');
  }

  if (addresses.length === 0) {
    throw new UrlSecurityError('We could not resolve this domain.', 'dns_resolution_failed');
  }

  if (addresses.some((ip) => isPrivateOrReservedIp(ip))) {
    throw new UrlSecurityError('This domain resolves to a private or restricted address.', 'blocked_resolved_ip');
  }

  return { url, resolvedIps: addresses };
}
