import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../app/api/newsletter/route';
import { adminDb } from '@/lib/firebase-admin';

// Mock Firebase Admin
vi.mock('@/lib/firebase-admin', () => {
  return {
    adminDb: {
      collection: vi.fn(() => ({
        doc: vi.fn(() => ({
          get: vi.fn(),
          set: vi.fn(),
        })),
        add: vi.fn(),
      })),
      runTransaction: vi.fn((callback) => {
        // Mock a successful rate limit transaction
        return callback({
          get: vi.fn().mockResolvedValue({ data: () => null }),
          set: vi.fn(),
          update: vi.fn(),
        });
      }),
    },
  };
});

describe('Newsletter API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createRequest = (body: any, headersInit: Record<string, string> = {}) => {
    const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
    const headers = new Headers({
      'origin': 'https://forensicsbypriyanshi.com',
      'x-real-ip': '1.2.3.4',
      ...headersInit
    });
    
    return {
      headers,
      text: vi.fn().mockResolvedValue(rawBody),
    } as unknown as Request;
  };

  it('rejects cross-origin requests', async () => {
    const req = createRequest({ email: 'test@example.com' }, { origin: 'https://evil.com' });
    const response = await POST(req);
    const data = await (response as any).json();
    
    expect((response as any).status).toBe(403);
    expect(data.error).toMatch(/Forbidden/);
  });

  it('rejects invalid email formats', async () => {
    const req = createRequest({ email: 'not-an-email' });
    const response = await POST(req);
    const data = await (response as any).json();
    
    expect((response as any).status).toBe(400);
    expect(data.error).toMatch(/Invalid email address format/);
  });

  it('rejects excessively large payloads', async () => {
    const hugeString = 'a'.repeat(3000);
    const req = createRequest(hugeString);
    const response = await POST(req);
    const data = await (response as any).json();
    
    expect((response as any).status).toBe(413);
    expect(data.error).toMatch(/Payload too large/);
  });

  it('accepts valid emails and trims/lowercases them', async () => {
    const mockGet = vi.fn().mockResolvedValue({ exists: false });
    const mockSet = vi.fn().mockResolvedValue({});
    
    vi.mocked(adminDb.collection).mockReturnValue({
      doc: vi.fn().mockReturnValue({
        get: mockGet,
        set: mockSet,
      }),
      add: vi.fn(),
    } as any);

    const req = createRequest({ email: '  TestUser@Example.COM  ' });
    const response = await POST(req);
    const data = await (response as any).json();
    
    expect((response as any).status).toBe(200);
    expect(data.success).toBe(true);
    
    // Verify the email was normalized
    expect(adminDb.collection).toHaveBeenCalledWith('newsletter');
    expect(mockSet).toHaveBeenCalledWith(expect.objectContaining({
      email: 'testuser@example.com'
    }));
  });
});
