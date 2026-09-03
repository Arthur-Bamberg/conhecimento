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
        
        # -> Click the 'Chat' link in the top navigation to open the Chat page.
        # Chat link
        elem = page.get_by_role('link', name='Chat', exact=True)
        await elem.click(timeout=10000)
        
        # -> Fill the 'Pergunte sobre os seus textos' message box with a question about the gatinha and click the 'Enviar' button.
        # Mensagem text area
        elem = page.get_by_label('Mensagem', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("O que foi registrado sobre a gatinha?")
        
        # -> Fill the 'Pergunte sobre os seus textos' message box with a question about the gatinha and click the 'Enviar' button.
        # Enviar button
        elem = page.get_by_role('button', name='Enviar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Projeto Gatinha - Atualizado' source link to open the referenced texto and verify it navigates to /textos/:id.
        # Projeto Gatinha - Atualizado link
        elem = page.get_by_role('link', name='Projeto Gatinha - Atualizado', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The chat produced an assistant reply with a source chip 'Projeto Gatinha - Atualizado' that opened the texto titled 'Projeto Gatinha - Atualizado'.
        # Assert-outcome: passed
        # Assert: The texto page's Título field equals 'Projeto Gatinha - Atualizado'.
        await expect(page.locator("xpath=/html/body/main/form/label/input").nth(0)).to_have_text("Projeto Gatinha - Atualizado", timeout=15000), "The texto page's T\u00edtulo field equals 'Projeto Gatinha - Atualizado'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    