import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Schema — strict bounds, no output of internal Zod issues to callers
// ---------------------------------------------------------------------------
const ALLOWED_LOCALES = ["de", "en"] as const;

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email(),
  message: z.string().min(10).max(5000),
});

// ---------------------------------------------------------------------------
// Supabase — lazy singleton, only uses service role on the server
// ---------------------------------------------------------------------------
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabase() {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _supabase = createClient(url, key, {
    auth: { persistSession: false },
  });
  return _supabase;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the real client IP, honouring Vercel/proxy forwarding headers. */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

/** Derive a safe locale value — never trust raw header strings. */
function safeLocale(request: NextRequest): (typeof ALLOWED_LOCALES)[number] {
  const raw = request.headers.get("accept-language") ?? "";
  return raw.startsWith("de") ? "de" : "en";
}

/** Strip control characters and trim whitespace from a string. */
function sanitizeString(value: string): string {
  // Remove ASCII control characters (0x00–0x1F except newlines in messages)
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim();
}

// ---------------------------------------------------------------------------
// Rate limiting — dual key: IP *and* email, whichever triggers first wins
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

async function isRateLimited(
  supabase: ReturnType<typeof createClient>,
  email: string,
  ip: string
): Promise<boolean> {
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  // Check by email
  const { data: byEmail } = await supabase
    .from("contacts")
    .select("id")
    .eq("email", email)
    .gte("created_at", since)
    .limit(1);

  if (byEmail && byEmail.length > 0) return true;

  // Check by IP (only when IP is known)
  if (ip !== "unknown") {
    const { data: byIp } = await supabase
      .from("contacts")
      .select("id")
      .eq("ip_address", ip)
      .gte("created_at", since)
      .limit(1);

    if (byIp && byIp.length > 0) return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  // Guard: enforce JSON content-type before touching the body
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json(
      { error: "Ungültiger Content-Type" },
      { status: 415 }
    );
  }

  // Guard: reject bodies that are clearly oversized (100 KB hard cap)
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 100_000) {
    return NextResponse.json({ error: "Anfrage zu groß" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültiges JSON" },
      { status: 400 }
    );
  }

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    // Return a generic error — never expose Zod issue details to clients
    return NextResponse.json(
      { error: "Ungültige Eingabe. Bitte alle Felder korrekt ausfüllen." },
      { status: 400 }
    );
  }

  // Sanitize validated strings
  const name = sanitizeString(parsed.data.name);
  const email = parsed.data.email.toLowerCase().trim();
  const message = sanitizeString(parsed.data.message);
  const locale = safeLocale(request);
  const ip = getClientIp(request);

  const supabase = getSupabase();

  if (supabase) {
    // Rate limiting check (IP + email)
    const limited = await isRateLimited(supabase, email, ip);
    if (limited) {
      return NextResponse.json(
        { error: "Bitte warten Sie 5 Minuten vor dem nächsten Senden." },
        { status: 429 }
      );
    }

    const { error: dbError } = await supabase.from("contacts").insert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { name, email, message, locale, ip_address: ip } as any
    );

    if (dbError) {
      // Log server-side only — never surface DB errors to the client
      console.error("[contact] Supabase insert error:", dbError.message);
      return NextResponse.json(
        { error: "Interner Serverfehler. Bitte versuchen Sie es später." },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ success: true });
}
