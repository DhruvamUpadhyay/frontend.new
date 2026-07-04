import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyAdmin } from '../lib/auth-guard';
import { adminAuth, adminDb } from '../lib/firebase-admin';

// Mock dependencies
vi.mock('../lib/firebase-admin', () => {
  return {
    adminAuth: {
      verifySessionCookie: vi.fn(),
    },
    adminDb: {
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(),
        })),
      })),
    },
  };
});

let mockCookiesStore: Record<string, string> = {};

vi.mock('next/headers', () => {
  return {
    cookies: vi.fn(() => ({
      get: vi.fn((name: string) => {
        return mockCookiesStore[name] ? { value: mockCookiesStore[name] } : undefined;
      }),
      set: vi.fn((name: string, value: string) => {
        mockCookiesStore[name] = value;
      })
    })),
  };
});

vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((body, init) => {
        return new Response(JSON.stringify(body), init);
      }),
    },
  };
});

describe('verifyAdmin auth guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookiesStore = {};
  });

  const mockRequest = () => {
    return {} as unknown as Request;
  };

  it('rejects requests without session cookie', async () => {
    const req = mockRequest();
    const result = await verifyAdmin(req);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });

  it('rejects requests with invalid session cookie', async () => {
    mockCookiesStore['__session'] = 'invalid-token';
    vi.mocked(adminAuth.verifySessionCookie).mockRejectedValueOnce(new Error('Invalid token'));
    const req = mockRequest();
    const result = await verifyAdmin(req);
    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(401);
  });

  it('accepts the primary developer email without checking Firestore', async () => {
    mockCookiesStore['__session'] = 'valid-dev-token';
    vi.mocked(adminAuth.verifySessionCookie).mockResolvedValueOnce({
      uid: 'dev123',
      email: 'developer@forensicbypriyanshi.com',
    } as any);

    const req = mockRequest();
    const result = await verifyAdmin(req);
    
    // Should return VerifiedAdmin object, not Response
    expect(result).not.toBeInstanceOf(Response);
    expect(result).toEqual({
      uid: 'dev123',
      email: 'developer@forensicbypriyanshi.com',
      role: 'Developer',
    });
    
    // Ensure it didn't call the DB
    expect(adminDb.collection).not.toHaveBeenCalled();
  });

  it('checks Firestore for other admin emails and accepts if valid', async () => {
    mockCookiesStore['__session'] = 'valid-admin-token';
    vi.mocked(adminAuth.verifySessionCookie).mockResolvedValueOnce({
      uid: 'admin123',
      email: 'regularadmin@example.com',
    } as any);

    const mockGet = vi.fn().mockResolvedValueOnce({
      exists: true,
      data: () => ({ role: 'Editor' }),
    });

    vi.mocked(adminDb.collection).mockReturnValueOnce({
      doc: vi.fn().mockReturnValueOnce({ get: mockGet }),
    } as any);

    const req = mockRequest();
    const result = await verifyAdmin(req);

    expect(result).not.toBeInstanceOf(Response);
    expect(result).toEqual({
      uid: 'admin123',
      email: 'regularadmin@example.com',
      role: 'Editor',
    });
  });

  it('rejects authenticated users who are not in the admins collection', async () => {
    mockCookiesStore['__session'] = 'valid-user-token';
    vi.mocked(adminAuth.verifySessionCookie).mockResolvedValueOnce({
      uid: 'user123',
      email: 'notanadmin@example.com',
    } as any);

    const mockGet = vi.fn().mockResolvedValueOnce({
      exists: false,
    });

    vi.mocked(adminDb.collection).mockReturnValueOnce({
      doc: vi.fn().mockReturnValueOnce({ get: mockGet }),
    } as any);

    const req = mockRequest();
    const result = await verifyAdmin(req);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(403);
  });
});
