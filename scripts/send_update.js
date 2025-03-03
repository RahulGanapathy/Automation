const puppeteer = require('puppeteer-core');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Load cookies
    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    await page.setCookie(...cookies);
    
    // Navigate to ChatGPT
    await page.goto('https://chatgpt.com', { waitUntil: 'domcontentloaded' });
    
    // Wait for the chat sidebar to be visible first
    await page.waitForSelector('nav', { timeout: 60000 });
    
    // Wait for the specific chat and ensure it's visible
    await page.waitForSelector('a[title="Nanic Wellness Website Flow"]', { timeout: 60000 });
    
    // Scroll the element into view
    await page.evaluate(() => {
        document.querySelector('a[title="Nanic Wellness Website Flow"]').scrollIntoView();
    });
    
    // Click on the chat link
    await page.click('a[title="Nanic Wellness Website Flow"]');
    
    // Wait for chat input to load
    await page.waitForSelector('textarea', { timeout: 60000 });
    
    // Type and send message
    await page.type('textarea', 'Update');
    await page.keyboard.press('Enter');
    
    // Close browser
    await browser.close();
})();
