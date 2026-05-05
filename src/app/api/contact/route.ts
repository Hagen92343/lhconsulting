import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Schema — strict bounds, no output of internal Zod issues to callers
// ---------------------------------------------------------------------------
type AllowedLocale = "de" | "en";

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email(),
  message: z.string().min(10).max(5000),
  // Honeypot — humans never fill it (it's hidden from view + AT). Bots that
  // auto-complete every input will. Tolerated as optional so legitimate
  // submissions don't 400, but inspected after parsing to silently drop the
  // request before it touches the database.
  website: z.string().max(500).optional(),
});

// Mirrors the public.contacts table — keeps the Supabase client typed so we
// don't need an `any` cast on inserts. Shape matches @supabase/postgrest-js
// GenericSchema (Tables/Views/Functions, with Relationships on each table).
type ContactRow = {
  id: string;
  name: string;
  email: string;
  message: string;
  locale: AllowedLocale;
  ip_address: string | null;
  created_at: string;
};

type ContactInsert = {
  name: string;
  email: string;
  message: string;
  locale: AllowedLocale;
  ip_address?: string | null;
};

type Database = {
  public: {
    Tables: {
      contacts: {
        Row: ContactRow;
        Insert: ContactInsert;
        Update: Partial<ContactInsert>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
  };
};

type ContactsClient = SupabaseClient<Database>;

// ---------------------------------------------------------------------------
// Supabase — lazy singleton, only uses service role on the server
// ---------------------------------------------------------------------------
let _supabase: ContactsClient | null = null;

function getSupabase(): ContactsClient | null {
  if (_supabase) return _supabase;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  _supabase = createClient<Database>(url, key, {
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
function safeLocale(request: NextRequest): AllowedLocale {
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
  supabase: ContactsClient,
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

  // Honeypot trip — pretend success so the bot thinks delivery worked and
  // doesn't retry with a different fingerprint. Never inserted, never logged
  // beyond a single counter so we don't waste log volume on automated traffic.
  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return NextResponse.json({ success: true });
  }

  // Sanitize validated strings
  const name = sanitizeString(parsed.data.name);
  const email = parsed.data.email.toLowerCase().trim();
  const message = sanitizeString(parsed.data.message);
  const locale = safeLocale(request);
  const ip = getClientIp(request);

  const supabase = getSupabase();

  // Hard-fail when env is missing — silently dropping submissions would mislead
  // users into thinking their message was delivered.
  if (!supabase) {
    console.error(
      "[contact] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — refusing to silently drop submission."
    );
    return NextResponse.json(
      { error: "Interner Serverfehler. Bitte versuchen Sie es später." },
      { status: 500 }
    );
  }

  // Rate limiting check (IP + email)
  const limited = await isRateLimited(supabase, email, ip);
  if (limited) {
    return NextResponse.json(
      { error: "Bitte warten Sie 5 Minuten vor dem nächsten Senden." },
      { status: 429 }
    );
  }

  const { error: dbError } = await supabase
    .from("contacts")
    .insert({ name, email, message, locale, ip_address: ip });

  if (dbError) {
    // Log server-side only — never surface DB errors to the client
    console.error("[contact] Supabase insert error:", dbError.message);
    return NextResponse.json(
      { error: "Interner Serverfehler. Bitte versuchen Sie es später." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
