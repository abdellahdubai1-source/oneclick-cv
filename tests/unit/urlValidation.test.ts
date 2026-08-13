import { describe, it, expect } from 'vitest';
import { validateJobUrl, UrlSecurityError } from '@/lib/job/urlValidation';

describe('validateJobUrl (SSRF protections)', () => {
  it('rejects non-http(s) schemes', async () => {
    await expect(validateJobUrl('ftp://example.com/file')).rejects.toBeInstanceOf(UrlSecurityError);
    await expect(validateJobUrl('file:///etc/passwd')).rejects.toBeInstanceOf(UrlSecurityError);
  });

  it('rejects localhost and loopback literals', async () => {
    await expect(validateJobUrl('http://localhost/admin')).rejects.toBeInstanceOf(UrlSecurityError);
    await expect(validateJobUrl('http://127.0.0.1/admin')).rejects.toBeInstanceOf(UrlSecurityError);
    await expect(validateJobUrl('http://[::1]/admin')).rejects.toBeInstanceOf(UrlSecurityError);
  });

  it('rejects private network literals', async () => {
    await expect(validateJobUrl('http://10.0.0.5/')).rejects.toBeInstanceOf(UrlSecurityError);
    await expect(validateJobUrl('http://192.168.1.1/')).rejects.toBeInstanceOf(UrlSecurityError);
    await expect(validateJobUrl('http://172.16.0.1/')).rejects.toBeInstanceOf(UrlSecurityError);
  });

  it('rejects the cloud metadata address', async () => {
    await expect(validateJobUrl('http://169.254.169.254/latest/meta-data/')).rejects.toBeInstanceOf(UrlSecurityError);
  });

  it('rejects malformed URLs', async () => {
    await expect(validateJobUrl('not a url')).rejects.toBeInstanceOf(UrlSecurityError);
  });
});
