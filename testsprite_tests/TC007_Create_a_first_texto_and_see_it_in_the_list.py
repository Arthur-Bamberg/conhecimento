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
        
        # -> Fill the 'Título' field with 'Introdução', fill the 'Conteúdo' textarea with a markdown note, then click the 'Criar' button to submit the new texto.
        # Título do novo texto text field
        elem = page.get_by_label('Título do novo texto', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Introdu\u00e7\u00e3o")
        
        # -> Fill the 'Título' field with 'Introdução', fill the 'Conteúdo' textarea with a markdown note, then click the 'Criar' button to submit the new texto.
        # Conteúdo do novo texto text area
        elem = page.get_by_label('Conteúdo do novo texto', exact=True)
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("# Introdu\u00e7\u00e3o\n\nEste \u00e9 um texto de teste criado pelo TestSprite.\n\n- item 1\n- item 2")
        
        # -> Fill the 'Título' field with 'Introdução', fill the 'Conteúdo' textarea with a markdown note, then click the 'Criar' button to submit the new texto.
        # Criar button
        elem = page.get_by_role('button', name='Criar', exact=True)
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> A new texto titled 'Introdução' appears in the textos list.
        # Assert-outcome: passed
        # Assert: The textos list contains an entry with the title 'Introdução'.
        await expect(page.locator("xpath=/html/body/main/div/ul/li[2]/a").nth(0)).to_contain_text("Introdu\u00e7\u00e3o", timeout=15000), "The textos list contains an entry with the title 'Introdu\u00e7\u00e3o'."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    