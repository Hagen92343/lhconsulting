import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ScanlineOverlay from "@/components/effects/ScanlineOverlay";

export const metadata: Metadata = {
  title: "Datenschutz — L&H Consulting",
};

export default async function DatenschutzPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isDE = locale === "de";

  return (
    <>
      <ScanlineOverlay />
      <Header />
      <main className="min-h-screen pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white text-glow-cyan mb-12">
            {isDE ? "Datenschutzerklärung" : "Privacy Policy"}
          </h1>

          <div className="space-y-8 font-mono text-sm text-white/70 leading-relaxed">
            {/* Verantwortlicher */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {isDE ? "1. Verantwortlicher" : "1. Controller"}
              </h2>
              <div className="hud-border p-6 space-y-1">
                <p className="text-white font-semibold">Hagen Lennart Marggraf</p>
                <p>L&H Consulting</p>
                <p>Diepenbeekallee 3</p>
                <p>50858 Köln</p>
                <p>
                  E-Mail:{" "}
                  <a
                    href="mailto:info@lhconsulting.services"
                    className="text-cyber-cyan hover:text-white transition-colors"
                  >
                    info@lhconsulting.services
                  </a>
                </p>
              </div>
            </section>

            {/* Erhebung von Daten */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {isDE
                  ? "2. Erhebung und Verarbeitung personenbezogener Daten"
                  : "2. Collection and Processing of Personal Data"}
              </h2>
              <p>
                {isDE
                  ? "Beim Besuch unserer Website werden automatisch technische Daten erhoben (z.B. IP-Adresse, Browsertyp, Zugriffszeit). Diese Daten werden vom Hosting-Anbieter (Vercel Inc.) verarbeitet und dienen der Bereitstellung und Sicherheit der Website."
                  : "When visiting our website, technical data is automatically collected (e.g., IP address, browser type, access time). This data is processed by the hosting provider (Vercel Inc.) and serves to provide and secure the website."}
              </p>
            </section>

            {/* Kontaktformular */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {isDE ? "3. Kontaktformular" : "3. Contact Form"}
              </h2>
              <p>
                {isDE
                  ? "Wenn Sie uns über das Kontaktformular kontaktieren, werden Ihre Angaben (Name, E-Mail-Adresse, Nachricht) zur Bearbeitung Ihrer Anfrage gespeichert. Diese Daten werden in einer Datenbank bei Supabase (Singapur/EU) gespeichert und nicht an Dritte weitergegeben. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) bzw. Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Beantwortung Ihrer Anfrage). Ihre Daten werden gelöscht, sobald Ihre Anfrage abschließend bearbeitet wurde, es sei denn, gesetzliche Aufbewahrungspflichten stehen dem entgegen."
                  : "When you contact us via the contact form, your details (name, email address, message) are stored to process your inquiry. This data is stored in a database at Supabase (Singapore/EU) and is not shared with third parties. Processing is based on Art. 6(1)(b) GDPR (pre-contractual measures) or Art. 6(1)(f) GDPR (legitimate interest in responding to your inquiry). Your data will be deleted once your inquiry has been fully processed, unless statutory retention obligations apply."}
              </p>
            </section>

            {/* Hosting */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {isDE ? "4. Hosting" : "4. Hosting"}
              </h2>
              <p>
                {isDE
                  ? "Diese Website wird bei Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA) gehostet. Vercel verarbeitet dabei technische Zugriffsdaten. Weitere Informationen finden Sie in der Datenschutzerklärung von Vercel: https://vercel.com/legal/privacy-policy. Die Datenübermittlung in die USA erfolgt auf Grundlage des EU-US Data Privacy Framework."
                  : "This website is hosted by Vercel Inc. (340 S Lemon Ave #4133, Walnut, CA 91789, USA). Vercel processes technical access data. For more information, see Vercel's privacy policy: https://vercel.com/legal/privacy-policy. Data transfer to the USA is based on the EU-US Data Privacy Framework."}
              </p>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {isDE ? "5. Cookies" : "5. Cookies"}
              </h2>
              <p>
                {isDE
                  ? "Diese Website verwendet keine Tracking-Cookies und keine Analyse-Tools. Es werden lediglich technisch notwendige Cookies verwendet (z.B. für die Spracheinstellung)."
                  : "This website does not use tracking cookies or analytics tools. Only technically necessary cookies are used (e.g., for language settings)."}
              </p>
            </section>

            {/* Ihre Rechte */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {isDE ? "6. Ihre Rechte" : "6. Your Rights"}
              </h2>
              <p>
                {isDE
                  ? "Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16 DSGVO), Löschung (Art. 17 DSGVO), Einschränkung der Verarbeitung (Art. 18 DSGVO), Datenübertragbarkeit (Art. 20 DSGVO) und Widerspruch (Art. 21 DSGVO). Zur Ausübung Ihrer Rechte wenden Sie sich bitte an die oben genannte Kontaktadresse. Sie haben zudem das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren."
                  : "You have the right to access (Art. 15 GDPR), rectification (Art. 16 GDPR), erasure (Art. 17 GDPR), restriction of processing (Art. 18 GDPR), data portability (Art. 20 GDPR), and objection (Art. 21 GDPR). To exercise your rights, please contact us at the address above. You also have the right to lodge a complaint with a data protection supervisory authority."}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
