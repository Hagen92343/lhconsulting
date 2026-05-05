import { test, expect } from "@playwright/test";

test.describe("L&H Consulting homepage", () => {
  test("loads /de with brand title and hero headline", async ({ page }) => {
    await page.goto("/de");

    await expect(page).toHaveTitle(/L&H Consulting/);
    await expect(
      page.getByRole("heading", { name: /Wir machen KI nutzbar/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Unsere Services/i })
    ).toBeVisible();
  });

  test("/ redirects into a supported locale", async ({ page }) => {
    await page.goto("/");
    // The middleware picks de or en based on the browser's accept-language;
    // we only assert that some supported locale won the negotiation.
    await expect(page).toHaveURL(/\/(de|en)(\/|$)/);
  });

  test("contact form rejects empty submission with inline errors", async ({
    page,
  }) => {
    await page.goto("/de");

    // The contact form lives in #contact further down the page.
    await page.locator("#contact").scrollIntoViewIfNeeded();

    await page
      .getByRole("button", { name: /Nachricht senden/i })
      .click();

    // react-hook-form renders the localized validation messages inline.
    await expect(
      page.getByText(/Bitte geben Sie Ihren Namen ein/i)
    ).toBeVisible();
    await expect(
      page.getByText(/Bitte geben Sie Ihre E-Mail-Adresse ein/i)
    ).toBeVisible();
    await expect(
      page.getByText(/Bitte geben Sie eine Nachricht ein/i)
    ).toBeVisible();
  });

  test("about section renders heading and three principles", async ({
    page,
  }) => {
    await page.goto("/de");
    await page.locator("#about").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: /^Über uns$/i })
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: /Hands-on/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /DACH-Fokus/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /End-to-End/i })).toBeVisible();
  });

  test("references section lists both projects with safe outbound links", async ({
    page,
  }) => {
    await page.goto("/de");
    await page.locator("#references").scrollIntoViewIfNeeded();

    await expect(
      page.getByRole("heading", { name: /Referenzen/i })
    ).toBeVisible();

    // Each card is a link with target="_blank" + rel="noopener noreferrer"
    const cv = page.getByRole("link", { name: /CV-Schmiede/i });
    const lp = page.getByRole("link", { name: /LiiPoster/i });

    await expect(cv).toHaveAttribute("href", "https://cvschmiede.com");
    await expect(cv).toHaveAttribute("target", "_blank");
    await expect(cv).toHaveAttribute("rel", /noopener/);

    await expect(lp).toHaveAttribute("href", "https://liiposter.de");
    await expect(lp).toHaveAttribute("target", "_blank");
    await expect(lp).toHaveAttribute("rel", /noopener/);
  });

  test("pricing CTA scrolls the contact form into view", async ({ page }) => {
    await page.goto("/de");
    await page.locator("#pricing").scrollIntoViewIfNeeded();

    await page
      .getByRole("button", { name: /Anfrage stellen/i })
      .click();

    // Smooth scroll lands the contact heading inside the viewport.
    await expect(
      page.getByRole("heading", { name: /Kontakt aufnehmen/i })
    ).toBeInViewport();
  });

  test("contact form happy path shows success state (API mocked)", async ({
    page,
  }) => {
    // Intercept POST /api/contact so the test does not need a Supabase env.
    await page.route("**/api/contact", async (route) => {
      expect(route.request().method()).toBe("POST");
      const body = route.request().postDataJSON();
      expect(body).toMatchObject({
        name: "E2E Tester",
        email: "e2e@example.com",
      });
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto("/de");
    await page.locator("#contact").scrollIntoViewIfNeeded();

    await page.getByLabel("Name").fill("E2E Tester");
    await page.getByLabel("E-Mail").fill("e2e@example.com");
    await page
      .getByLabel("Nachricht")
      .fill("Hallo aus dem Playwright-Smoke-Test, alles in Ordnung.");

    await page.getByRole("button", { name: /Nachricht senden/i }).click();

    // Success copy from de.json contact.success
    await expect(
      page.getByText(/Nachricht erfolgreich gesendet/i)
    ).toBeVisible();
  });
});
