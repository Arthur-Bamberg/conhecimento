import { expect, test } from "@playwright/test";

test("lista mostra sumário do workspace e permite apagar", async ({ page }) => {
  const titulo = `Lixeira ${Date.now()}`;
  await page.goto("/textos");
  await expect(page.getByRole("heading", { name: "Textos" })).toBeVisible();
  await expect(page.getByTestId("lista-chats")).toHaveCount(0);

  await page.getByLabel("Título do novo texto").fill(titulo);
  await page.getByLabel("Conteúdo do novo texto").fill("Só para apagar.");
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("link", { name: titulo })).toBeVisible();
  await expect(page.getByTestId("sumario-workspace")).toContainText(titulo);

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: `Apagar ${titulo}` }).click();
  await expect(page.getByRole("link", { name: titulo })).toHaveCount(0);
});
