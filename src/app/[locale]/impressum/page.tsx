import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ScanlineOverlay from "@/components/effects/ScanlineOverlay";

export const metadata: Metadata = {
  title: "Impressum — L&H Consulting",
};

export default async function ImpressumPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ScanlineOverlay />
      <Header />
      <main className="min-h-screen pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white text-glow-cyan mb-12">
            {locale === "de" ? "Impressum" : "Legal Notice"}
          </h1>

          <div className="space-y-8 font-mono text-sm text-white/70 leading-relaxed">
            {/* Angaben gemäß § 5 TMG */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {locale === "de"
                  ? "Angaben gemäß § 5 TMG"
                  : "Information according to § 5 TMG"}
              </h2>
              <div className="hud-border p-6 space-y-1">
                <p className="text-white font-semibold">Hagen Lennart Marggraf</p>
                <p>L&H Consulting</p>
                <p>Diepenbeekallee 3</p>
                <p>50858 Köln</p>
                <p>{locale === "de" ? "Deutschland" : "Germany"}</p>
              </div>
            </section>

            {/* Kontakt */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {locale === "de" ? "Kontakt" : "Contact"}
              </h2>
              <div className="hud-border p-6 space-y-1">
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

            {/* Berufsbezeichnung */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {locale === "de" ? "Berufsbezeichnung" : "Professional Title"}
              </h2>
              <div className="hud-border p-6">
                <p>
                  {locale === "de"
                    ? "Freiberuflicher IT-Berater / KI-Consultant"
                    : "Freelance IT Consultant / AI Consultant"}
                </p>
              </div>
            </section>

            {/* Haftungsausschluss */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {locale === "de"
                  ? "Haftung für Inhalte"
                  : "Liability for Content"}
              </h2>
              <p>
                {locale === "de"
                  ? "Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt."
                  : "As a service provider, we are responsible for our own content on these pages in accordance with § 7 paragraph 1 of the TMG. According to §§ 8 to 10 TMG, however, we are not obligated to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information under general law remain unaffected."}
              </p>
            </section>

            {/* Haftung für Links */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {locale === "de"
                  ? "Haftung für Links"
                  : "Liability for Links"}
              </h2>
              <p>
                {locale === "de"
                  ? "Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich."
                  : "Our website contains links to external third-party websites over whose content we have no influence. Therefore, we cannot accept any liability for this external content. The respective provider or operator of the linked pages is always responsible for their content."}
              </p>
            </section>

            {/* Urheberrecht */}
            <section>
              <h2 className="text-lg font-display text-cyber-cyan mb-4">
                {locale === "de" ? "Urheberrecht" : "Copyright"}
              </h2>
              <p>
                {locale === "de"
                  ? "Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers."
                  : "The content and works created by the site operators on these pages are subject to German copyright law. The reproduction, editing, distribution, and any kind of exploitation outside the limits of copyright law require the written consent of the respective author or creator."}
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
