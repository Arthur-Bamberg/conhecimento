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
        
        # -> Fill the 'Título' field with 'Texto de teste', fill the 'Conteúdo' textarea with a short markdown paragraph and list, then click the 'Criar' button.
        # Título do novo texto text field
        elem = page.get_by_label('Título do novo texto', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Texto de teste")
        
        # -> Fill the 'Título' field with 'Texto de teste', fill the 'Conteúdo' textarea with a short markdown paragraph and list, then click the 'Criar' button.
        # Conteúdo do novo texto text area
        elem = page.get_by_label('Conteúdo do novo texto', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Este \u00e9 um texto de teste criado pelo TestSprite.\n\n- item 1\n- item 2\n- item 3")
        
        # -> Fill the 'Título' field with 'Texto de teste', fill the 'Conteúdo' textarea with a short markdown paragraph and list, then click the 'Criar' button.
        # Criar button
        elem = page.get_by_role('button', name='Criar', exact=True)
        await elem.click(timeout=10000)
        
        # -> Find the new texto titled 'Texto de teste' in the textos list and confirm the workspace summary remains visible.
        await page.mouse.wheel(0, 300)
        
        # --> Assertions to verify final state
        
        # --> The new texto titled "Texto de teste" appears in the textos list.
        # Assert-outcome: passed
        # Assert: Created texto titled 'Texto de teste' is visible in the textos list.
        await expect(page.locator("xpath=/html/body/main/div/ul/li[3]/a").nth(0)).to_contain_text("Texto de teste", timeout=15000), "Created texto titled 'Texto de teste' is visible in the textos list."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    