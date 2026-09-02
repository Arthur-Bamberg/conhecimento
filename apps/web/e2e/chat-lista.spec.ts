import { expect, test } from "@playwright/test";

test("sidebar lista conversas e permite voltar a um chat anterior", async ({
  page,
}) => {
  const marca = `Lado ${Date.now()}`;

  await page.goto("/chat");
  const lista = page.getByTestId("lista-chats");
  await expect(lista).toBeVisible();
  await expect(page.getByRole("button", { name: "Enviar" })).toBeEnabled();

  const conversas = lista.getByRole("navigation").getByRole("button");
  const antes = await conversas.count();
  await page.getByRole("button", { name: "Nova conversa" }).click();
  await expect(conversas).toHaveCount(antes + 1);
  await expect(conversas.first()).toHaveAttribute("aria-current", "true");

  await page.getByLabel("Mensagem").fill(marca);
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByTestId("mensagens")).toContainText(marca, {
    timeout: 15_000,
  });
  await expect(page.getByRole("button", { name: "Nova conversa" })).toBeEnabled({
    timeout: 30_000,
  });

  await page.getByRole("button", { name: "Nova conversa" }).click();
  await expect(page.getByText("Ainda não há mensagens")).toBeVisible();
  await expect(conversas.first()).toHaveAttribute("aria-current", "true");
  await expect(page.getByTestId("mensagens")).not.toContainText(marca);

  await conversas.nth(1).click();
  await expect(page.getByTestId("mensagens")).toContainText(marca);

  await page.getByRole("link", { name: "Textos", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Textos" })).toBeVisible();
  await expect(page.getByTestId("lista-chats")).toHaveCount(0);
  await expect(page.getByRole("link", { name: marca })).toHaveCount(0);
});
