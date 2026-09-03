import { expect, test } from "@playwright/test";

test("chat cria um texto e ele aparece na lista", async ({ page }) => {
  const marca = Date.now();
  const titulo = `Caderno ${marca}`;

  await page.goto("/chat");
  await expect(page.getByRole("heading", { name: "Chat" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar" })).toBeEnabled();

  await page
    .getByLabel("Mensagem")
    .fill(`Crie um texto chamado ${titulo} com o corpo Notas da semana.`);
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(
    page.getByRole("link", { name: `Texto criado: ${titulo}` }),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole("link", { name: "Textos", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Textos" })).toBeVisible();
  await expect(page.getByRole("link", { name: titulo, exact: true })).toBeVisible();

  await page.getByRole("link", { name: titulo, exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Conteúdo", exact: true }),
  ).toHaveValue("Notas da semana.");
});

test("chat altera um texto existente", async ({ page }) => {
  const marca = Date.now();
  const titulo = `Receitas ${marca}`;

  await page.goto("/textos");
  await page.getByLabel("Título do novo texto").fill(titulo);
  await page.getByLabel("Conteúdo do novo texto").fill("Bolo de chocolate.");
  await page.getByRole("button", { name: "Criar" }).click();
  await expect(page.getByRole("link", { name: titulo, exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Chat" }).click();
  await expect(page.getByRole("heading", { name: "Chat" })).toBeVisible();
  await page
    .getByLabel("Mensagem")
    .fill(`Altere o texto ${titulo} para o corpo Bolo de cenoura.`);
  await page.getByRole("button", { name: "Enviar" }).click();

  await expect(
    page.getByRole("link", { name: `Texto alterado: ${titulo}` }),
  ).toBeVisible({ timeout: 15_000 });

  await page.getByRole("link", { name: `Texto alterado: ${titulo}` }).click();
  await expect(
    page.getByRole("textbox", { name: "Conteúdo", exact: true }),
  ).toHaveValue("Bolo de cenoura.");
});

test("chat cria um texto a partir de um pedido de tópico", async ({ page }) => {
  const marca = Date.now();
  const assunto = `landing bamberg ${marca}`;

  await page.goto("/chat");
  await expect(page.getByRole("button", { name: "Enviar" })).toBeEnabled();
  await page
    .getByLabel("Mensagem")
    .fill(`Crie um novo tópico sobre ${assunto}`);
  await page.getByRole("button", { name: "Enviar" }).click();

  const titulo = `Landing bamberg ${marca}`;
  await expect(
    page.getByRole("link", { name: `Texto criado: ${titulo}` }),
  ).toBeVisible({ timeout: 15_000 });
});
