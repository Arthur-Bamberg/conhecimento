import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:3000/textos")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Chat' link to open the chat page.
        # Chat link
        elem = page.get_by_role('link', name='Chat', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the conversation titled 'Segundo o texto **Projeto Gatinha**...' from the left conversations list.
        # Segundo o texto **Projeto Gatinha**: Caminha da... button
        elem = page.get_by_role('button', name='Segundo o texto **Projeto Gatinha**: Caminha da gatinha, vasilhas da gatinha, be', exact=True)
        await elem.click(timeout=10000)
        
        # -> Type a follow-up question into the 'Mensagem' field (placeholder 'Pergunte sobre os seus textos') and click the 'Enviar' button.
        # Mensagem text area
        elem = page.get_by_label('Mensagem', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Voc\u00ea pode sugerir alimentos e brinquedos seguros para uma gatinha filhote que mora em apartamento?")
        
        # -> Type a follow-up question into the 'Mensagem' field (placeholder 'Pergunte sobre os seus textos') and click the 'Enviar' button.
        # Enviar button
        elem = page.get_by_role('button', name='Enviar', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> Prior messages in the 'Segundo o texto Projeto Gatinha' conversation are visible (Fonte: Projeto Gatinha).
        await page.locator("xpath=/html/body/main/div/div/div[2]/article[2]/p/a").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The prior assistant message includes the 'Projeto Gatinha' Fonte link and is visible.
        await expect(page.locator("xpath=/html/body/main/div/div/div[2]/article[2]/p/a").nth(0)).to_be_visible(timeout=15000), "The prior assistant message includes the 'Projeto Gatinha' Fonte link and is visible."
        
        # --> A new assistant reply was appended to the same conversation (assistant begins 'Analisando os seus registros gravados...').
        await page.locator("xpath=/html/body/main/div/div/div[2]/article[4]/p/a[1]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The new assistant reply contains a visible Fonte link ('Projeto Gatinha - Atualizado') in the conversation.
        await expect(page.locator("xpath=/html/body/main/div/div/div[2]/article[4]/p/a[1]").nth(0)).to_be_visible(timeout=15000), "The new assistant reply contains a visible Fonte link ('Projeto Gatinha - Atualizado') in the conversation."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    