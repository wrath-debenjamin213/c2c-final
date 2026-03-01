import puppeteer from 'puppeteer';

(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new' });
        const page = await browser.newPage();
        await page.setViewport({ width: 1440, height: 1080 });

        console.log('Navigating to app...');
        await page.goto('http://localhost:5173');
        await new Promise(r => setTimeout(r, 2000));

        console.log('Clicking login...');
        const buttons = await page.$$('button');
        if (buttons.length > 0) {
            await buttons[buttons.length - 1].click();
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log('Taking screenshot...');
        await page.screenshot({ path: 'c:\\Users\\aunin\\.gemini\\antigravity\\brain\\a9894844-230f-49f0-a4ac-cf36fbf1e9c9\\c2c_dashboard_redesign_final.webp', fullPage: true, type: 'webp' });

        await browser.close();
        console.log('Done!');
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
