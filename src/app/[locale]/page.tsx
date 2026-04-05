import { setRequestLocale } from "next-intl/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main>
      <section id="hero" className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-display text-cyber-cyan text-glow-cyan">
          L&H Consulting
        </h1>
      </section>
    </main>
  );
}
