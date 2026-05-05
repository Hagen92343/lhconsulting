import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

// ---------------------------------------------------------------------------
// Supabase mock — a chain stub that supports .select().eq().gte().limit() AND
// .insert(). Tests reach in via getMockChain() to assert calls / swap results.
// ---------------------------------------------------------------------------
type ChainStub = ReturnType<typeof makeChain>;

function makeChain() {
  const chain = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    limit: vi.fn(),
    insert: vi.fn(),
  };
  chain.select.mockImplementation(() => chain);
  chain.eq.mockImplementation(() => chain);
  chain.gte.mockImplementation(() => chain);
  chain.limit.mockResolvedValue({ data: [], error: null });
  chain.insert.mockResolvedValue({ error: null });
  return chain;
}

let currentChain: ChainStub;
const fromMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({ from: fromMock })),
}));

// ---------------------------------------------------------------------------
// Module loader — resets the module graph so the route's lazy supabase
// singleton picks up freshly stubbed env vars on every test.
// ---------------------------------------------------------------------------
async function loadPOST() {
  vi.resetModules();
  const mod = await import("./route");
  return mod.POST;
}

// ---------------------------------------------------------------------------
// Request helpers
// ---------------------------------------------------------------------------
const validBody = {
  name: "Max Mustermann",
  email: "max@example.com",
  message: "Hallo, das ist eine Testnachricht mit ausreichender Länge.",
};

function jsonRequest(
  body: unknown,
  extraHeaders: Record<string, string> = {}
) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  const headers = new Headers({
    "content-type": "application/json",
    "content-length": String(Buffer.byteLength(payload, "utf8")),
    ...extraHeaders,
  });
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers,
    body: payload,
  });
}

// ---------------------------------------------------------------------------
// Per-test setup: clear mocks, restore env to a "Supabase-configured" state
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  currentChain = makeChain();
  fromMock.mockReturnValue(currentChain);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("POST /api/contact — guards", () => {
  it("rejects non-JSON content-type with 415", async () => {
    const POST = await loadPOST();
    const req = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "text/plain" },
      body: "hello",
    });
    const res = await POST(req);
    expect(res.status).toBe(415);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("rejects bodies advertising > 100 KB with 413", async () => {
    const POST = await loadPOST();
    const req = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": "200000",
      },
      body: JSON.stringify(validBody),
    });
    const res = await POST(req);
    expect(res.status).toBe(413);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON with 400", async () => {
    const POST = await loadPOST();
    const req = jsonRequest("{not json");
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/JSON/i);
  });
});

describe("POST /api/contact — schema validation", () => {
  it("returns 400 for empty body", async () => {
    const POST = await loadPOST();
    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(400);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid email", async () => {
    const POST = await loadPOST();
    const res = await POST(jsonRequest({ ...validBody, email: "not-an-email" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when message is shorter than 10 chars", async () => {
    const POST = await loadPOST();
    const res = await POST(jsonRequest({ ...validBody, message: "short" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when name exceeds 200 chars", async () => {
    const POST = await loadPOST();
    const res = await POST(
      jsonRequest({ ...validBody, name: "a".repeat(201) })
    );
    expect(res.status).toBe(400);
  });

  it("never leaks Zod issue details to the client", async () => {
    const POST = await loadPOST();
    const res = await POST(jsonRequest({ email: "garbage" }));
    const body = await res.json();
    expect(JSON.stringify(body)).not.toMatch(/zod|issue|path|validation/i);
  });
});

describe("POST /api/contact — honeypot trap", () => {
  it("returns 200 success without inserting when honeypot field is filled", async () => {
    const POST = await loadPOST();
    const res = await POST(
      jsonRequest({ ...validBody, website: "https://spam.example.com" })
    );
    // Bot must believe it succeeded — same shape as the real success path
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true });
    // Crucially: nothing reached Supabase
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("treats whitespace-only honeypot value as still empty (real submission)", async () => {
    const POST = await loadPOST();
    const res = await POST(jsonRequest({ ...validBody, website: "   " }));
    expect(res.status).toBe(200);
    // A whitespace value is not a bot fill — this should still hit the DB.
    expect(currentChain.insert).toHaveBeenCalledOnce();
  });
});

describe("POST /api/contact — silent-failure prevention", () => {
  it("returns 500 when NEXT_PUBLIC_SUPABASE_URL is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    const POST = await loadPOST();
    const res = await POST(jsonRequest(validBody));
    expect(res.status).toBe(500);
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("returns 500 when SUPABASE_SERVICE_ROLE_KEY is missing", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const POST = await loadPOST();
    const res = await POST(jsonRequest(validBody));
    expect(res.status).toBe(500);
    expect(fromMock).not.toHaveBeenCalled();
  });
});

describe("POST /api/contact — rate limiting", () => {
  it("returns 429 when an existing row matches by email", async () => {
    const POST = await loadPOST();
    currentChain.limit.mockResolvedValueOnce({
      data: [{ id: "existing" }],
      error: null,
    });
    const res = await POST(jsonRequest(validBody));
    expect(res.status).toBe(429);
    expect(currentChain.insert).not.toHaveBeenCalled();
  });

  it("returns 429 when an existing row matches by IP", async () => {
    const POST = await loadPOST();
    // First lookup (by email) returns nothing, second lookup (by IP) hits.
    currentChain.limit
      .mockResolvedValueOnce({ data: [], error: null })
      .mockResolvedValueOnce({
        data: [{ id: "existing-ip" }],
        error: null,
      });
    const req = jsonRequest(validBody, { "x-real-ip": "203.0.113.42" });
    const res = await POST(req);
    expect(res.status).toBe(429);
    expect(currentChain.insert).not.toHaveBeenCalled();
  });

  it("does not perform IP lookup when client IP is unknown", async () => {
    const POST = await loadPOST();
    const res = await POST(jsonRequest(validBody));
    expect(res.status).toBe(200);
    // Only the email lookup ran (1 limit() call), no IP lookup.
    expect(currentChain.limit).toHaveBeenCalledTimes(1);
  });
});

describe("POST /api/contact — happy path & sanitization", () => {
  it("returns 200 and inserts sanitized + lowercased values", async () => {
    const POST = await loadPOST();
    const res = await POST(
      jsonRequest(
        {
          // NUL byte mid-name — sanitizeString must strip control chars
          name: "Max\x00 Mustermann",
          // Mixed case — route lowercases the validated email
          email: "Max@Example.COM",
          message: "Hallo, das ist eine Testnachricht.",
        },
        { "x-real-ip": "198.51.100.7", "accept-language": "de-DE,de;q=0.9" }
      )
    );
    expect(res.status).toBe(200);
    const inserted = currentChain.insert.mock.calls[0][0];
    expect(inserted).toEqual({
      name: "Max Mustermann",
      email: "max@example.com",
      message: "Hallo, das ist eine Testnachricht.",
      locale: "de",
      ip_address: "198.51.100.7",
    });
  });

  it("derives locale=en when accept-language starts with 'en'", async () => {
    const POST = await loadPOST();
    await POST(
      jsonRequest(validBody, { "accept-language": "en-US,en;q=0.9" })
    );
    const inserted = currentChain.insert.mock.calls[0][0];
    expect(inserted.locale).toBe("en");
  });

  it("uses the first hop of x-forwarded-for as client IP", async () => {
    const POST = await loadPOST();
    await POST(
      jsonRequest(validBody, {
        "x-forwarded-for": "203.0.113.5, 70.41.3.18, 150.172.238.178",
      })
    );
    const inserted = currentChain.insert.mock.calls[0][0];
    expect(inserted.ip_address).toBe("203.0.113.5");
  });

  it("returns 500 and logs server-side when insert errors", async () => {
    const POST = await loadPOST();
    currentChain.insert.mockResolvedValueOnce({
      error: { message: "boom" },
    });
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST(jsonRequest(validBody));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).not.toMatch(/boom/);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });
});
