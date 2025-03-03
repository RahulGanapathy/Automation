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
    
    // Set viewport and user agent to mimic a real browser
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36');
    
    // Load cookies (ensure these cookies are valid for chatgpt.com)
    const cookies = JSON.parse(fs.readFileSync('cookies.json', 'utf8'));
    await page.setCookie(...cookies);
    
    // Navigate to ChatGPT (chatgpt.com)
    await page.goto('https://chatgpt.com', { waitUntil: 'networkidle0' });
    
    // Extra wait for dynamic content to load
    await sleep(10000);
    console.log("Page loaded, checking for navbar...");

    // Wait for the navbar inside two nested div elements
    try {
        await page.waitForSelector('div > div > nav', { timeout: 45000 });
        console.log("Navbar found.");
    } catch(e) {
        console.log("Navbar not found:", e);
    }
    
    console.log("Attempting to find chat link using XPath...");

    // Use XPath to locate the chat link by its text content
    try {
        await page.waitForXPath("//a[contains(., 'Nanic Wellness Website Flow')]", { timeout: 45000 });
        const [chatLink] = await page.$x("//a[contains(., 'Nanic Wellness Website Flow')]");
        if (chatLink) {
            // Scroll the chat link into view and click it
            await chatLink.evaluate(el => el.scrollIntoView());
            await chatLink.click();
            console.log("Chat link clicked.");
        } else {
            throw new Error("Chat link not found via XPath.");
        }
    } catch (err) {
        console.error("Error finding chat link:", err);
        await browser.close();
        process.exit(1);
    }
    
    console.log("Waiting for chat input...");
    // Wait for the chat input area to load
    try {
        await page.waitForSelector('textarea', { timeout:30000 });
        console.log("Chat input found, sending message...");
    } catch (err) {
        console.error("Chat input not found:", err);
        await browser.close();
        process.exit(1);
    }
    
    // Type and send the "Update" message
    await page.type('textarea', 'Update');
    await page.keyboard.press('Enter');
    
    console.log("Message sent successfully!");
    
    await browser.close();
})();
