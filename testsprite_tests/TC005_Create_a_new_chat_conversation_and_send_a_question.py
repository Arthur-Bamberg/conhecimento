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
        
        # -> Click the 'Chat' link in the top navigation to open the chat page.
        # Chat link
        elem = page.get_by_role('link', name='Chat', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Nova conversa' button to create a new conversa.
        # Nova conversa button
        elem = page.get_by_role('button', name='Nova conversa', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Nova conversa' button to create a new conversa.
        # Mensagem text area
        elem = page.get_by_label('Mensagem', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Resuma o texto 'Projeto Gatinha'.")
        
        # -> Click the 'Nova conversa' button to create a new conversa.
        # Enviar button
        elem = page.get_by_role('button', name='Enviar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Nova conversa' button to create a new conversa.
        # [internal] extract_content: 
        
        # --> Assertions to verify final state
        
        # --> The sent user message appears in the conversation list as "Resuma o texto 'Projeto Gatinha'."
        # Assert-outcome: passed
        # Assert: Verifies the user message 'Resuma o texto \'Projeto Gatinha\'.' is present in the conversation list.
        await expect(page.locator("xpath=/html/body/main/div/aside/nav/button[1]").nth(0)).to_have_text("Resuma o texto 'Projeto Gatinha'.", timeout=15000), "Verifies the user message 'Resuma o texto \\'Projeto Gatinha\\'.' is present in the conversation list."
        
        # --> An assistant reply is displayed and a source link appears under 'Fonte:'
        await page.locator("xpath=/html/body/main/div/div/div[2]/article[2]/p/a").nth(0).scroll_into_view_if_needed()
        # Assert-outcome: passed
        # Assert: Verifies a source link from the assistant reply is visible under the 'Fonte:' label.
        await expect(page.locator("xpath=/html/body/main/div/div/div[2]/article[2]/p/a").nth(0)).to_be_visible(timeout=15000), "Verifies a source link from the assistant reply is visible under the 'Fonte:' label."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    