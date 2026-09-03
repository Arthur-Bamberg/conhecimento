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
        
        # -> Click the 'Chat' link in the header to open the chat interface.
        # Chat link
        elem = page.get_by_role('link', name='Chat', exact=True)
        await elem.click(timeout=10000)
        
        # -> Open the conversation titled 'Segundo o texto **Projeto Gatinha**: Caminha da gatinha, vasilhas da gatinha, be ...' from the conversation list.
        # Segundo o texto **Projeto Gatinha**: Caminha da... button
        elem = page.get_by_role('button', name='Segundo o texto **Projeto Gatinha**: Caminha da gatinha, vasilhas da gatinha, be', exact=True)
        await elem.click(timeout=10000)
        
        # -> Type a follow-up question into the 'Mensagem' textarea and click the 'Enviar' button.
        # Mensagem text area
        elem = page.get_by_label('Mensagem', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Tem mais alguma recomenda\u00e7\u00e3o sobre brinquedos ou cuidados di\u00e1rios para uma gatinha nova em apartamento?")
        
        # -> Type a follow-up question into the 'Mensagem' textarea and click the 'Enviar' button.
        # Enviar button
        elem = page.get_by_role('button', name='Enviar', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The prior assistant message citing 'Projeto Gatinha' is visible in the conversation.
        await page.locator("xpath=/html/body/main/div/div/div[2]/article[2]/p/a").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: The source link 'Projeto Gatinha' is visible in the conversation.
        await expect(page.locator("xpath=/html/body/main/div/div/div[2]/article[2]/p/a").nth(0)).to_be_visible(timeout=15000), "The source link 'Projeto Gatinha' is visible in the conversation."
        
        # --> A new assistant reply beginning 'Analisando as suas anotações registradas,' was appended after the follow-up message.
        await page.locator("xpath=/html/body/main/div/div/div[2]/article[4]/p/a[1]").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: A source link from the new assistant reply ('Projeto Gatinha - Atualizado') is visible, indicating the reply was appended.
        await expect(page.locator("xpath=/html/body/main/div/div/div[2]/article[4]/p/a[1]").nth(0)).to_be_visible(timeout=15000), "A source link from the new assistant reply ('Projeto Gatinha - Atualizado') is visible, indicating the reply was appended."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    