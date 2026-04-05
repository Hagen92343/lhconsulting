import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { createClient } from "@supabase/supabase-js";

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.email(),
  message: z.string().min(10).max(5000),
});

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ungültige Eingabe", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { name, email, message } = parsed.data;

    const supabase = getSupabase();

    if (supabase) {
      // Rate limiting: check last message from this email
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recent } = await supabase
        .from("contacts")
        .select("id")
        .eq("email", email)
        .gte("created_at", fiveMinAgo)
        .limit(1);

      if (recent && recent.length > 0) {
        return NextResponse.json(
          { error: "Bitte warten Sie 5 Minuten vor dem nächsten Senden." },
          { status: 429 }
        );
      }

      // Store in Supabase
      const { error: dbError } = await supabase.from("contacts").insert({
        name,
        email,
        message,
        locale: request.headers.get("accept-language")?.startsWith("de")
          ? "de"
          : "en",
      });

      if (dbError) {
        console.error("Supabase error:", dbError);
      }
    }

    // Send email via Resend (if configured)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from: "L&H Consulting <noreply@lhconsulting.services>",
        to: process.env.CONTACT_EMAIL || "info@lhconsulting.services",
        subject: `Neue Anfrage von ${name}`,
        html: `
          <h2>Neue Kontaktanfrage</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Nachricht:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
