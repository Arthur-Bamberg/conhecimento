import { expect, test } from "@playwright/test";

test("chat cita o texto certo", async ({ page }) => {
  await page.goto("/textos");
  await expect(page.getByRole("heading", { name: "Textos" })).toBeVisible();

  await page.getByLabel("Título do novo texto").fill("Agenda da terça");
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("link", { name: "Agenda da terça" })).toBeVisible();
  await page.getByRole("link", { name: "Agenda da terça" }).click();
  await page.getByLabel("Conteúdo").fill("Reunião às 14h com a Bruna.");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Salvo.")).toBeVisible();

  await page.getByRole("link", { name: "Textos", exact: true }).click();
  await page.getByLabel("Título do novo texto").fill("Receitas");
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("link", { name: "Receitas" })).toBeVisible();
  await page.getByRole("link", { name: "Receitas" }).click();
  await page.getByLabel("Conteúdo").fill("Bolo de chocolate com café.");
  await page.getByRole("button", { name: "Salvar" }).click();
  await expect(page.getByText("Salvo.")).toBeVisible();

  await page.getByRole("link", { name: "Chat" }).click();
  await expect(page.getByRole("heading", { name: "Chat" })).toBeVisible();
  await page.getByLabel("Mensagem").fill("chocolate");
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByTestId("mensagens")).toContainText("Receitas", {
    timeout: 15_000,
  });
  await expect(page.getByTestId("mensagens")).toContainText("chocolate");
  await expect(page.getByTestId("mensagens").locator("strong")).toContainText(
    "Receitas",
  );
  await expect(page.getByRole("link", { name: "Receitas" })).toBeVisible();
});
