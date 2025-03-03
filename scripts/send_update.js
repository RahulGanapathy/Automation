const puppeteer = require('puppeteer-core');
const fs = require('fs');

// Custom sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    const browser = await puppeteer.launch({
        executablePath: '/usr/bin/google-chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set a viewport and a user agent to mimic a real browser
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36');
    
    // Load cookies (ensure these are valid for chatgpt.com)
    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    await page.setCookie(...cookies);
    
    // Navigate to ChatGPT (chatgpt.com)
    await page.goto('https://chatgpt.com', { waitUntil: 'networkidle0' });
    
    // Extra wait for dynamic content to load
    await sleep(10000);
    console.log("Page loaded, attempting to find navbar...");

    // Wait for the navbar inside two nested div elements (increased timeout)
    await page.waitForSelector('div > div > nav', { timeout: 90000 });
    console.log("Navbar found, attempting to find chat link...");

    // Wait for the specific chat link using the correct selector
    await page.waitForSelector('a[title="Nanic Wellness Website Flow"]', { timeout: 90000 });
    
    // Scroll the chat link into view
    await page.evaluate(() => {
        const chatLink = document.querySelector('a[title="Nanic Wellness Website Flow"]');
        if (chatLink) {
            chatLink.scrollIntoView();
        }
    });
    
    // Click on the chat link
    await page.click('a[title="Nanic Wellness Website Flow"]');
    console.log("Chat link clicked, waiting for chat input...");

    // Wait for chat input to load
    await page.waitForSelector('textarea', { timeout: 90000 });
    console.log("Chat input found, sending message...");

    // Type and send message
    await page.type('textarea', 'Update');
    await page.keyboard.press('Enter');
    
    console.log("Message sent successfully!");
    
    await browser.close();
})();
