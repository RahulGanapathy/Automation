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
    await page.goto('https://chatgpt.com', { waitUntil: 'networkidle2' });
    console.log("Page loaded, checking for navbar...");
    
    const content = await page.content();
    fs.writeFileSync('page_dump.html', content);
    console.log("Page content dumped for debugging.");


    // Wait for the sidebar (wrapped in divs) and navbar
    await page.waitForSelector('div:has(nav)', { visible: true, timeout: 90000 });
    console.log("Navbar found.");
    
    // Function to wait for XPath
    async function waitForXPath(page, xpath, timeout = 90000) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const elementHandle = await page.evaluateHandle((xpath) => {
                const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
                return result.singleNodeValue;
            }, xpath);

            if (elementHandle) return elementHandle;
            await page.waitForTimeout(500);
        }
        throw new Error(`Timeout waiting for XPath: ${xpath}`);
    }
    
    console.log("Attempting to find chat link using XPath...");
    const chatLink = await waitForXPath(page, "//a[contains(., 'Nanic Wellness Website Flow')]");
    
    // Scroll into view and click
    await page.evaluate(el => el.scrollIntoView(), chatLink);
    await chatLink.click();
    console.log("Chat link found and clicked.");
    
    // Wait for chat input to load
    await page.waitForSelector('textarea', { visible: true, timeout: 90000 });
    
    // Type and send message
    await page.type('textarea', 'Update');
    await page.keyboard.press('Enter');
    console.log("Message sent.");
    
    // Close browser
    await browser.close();
    console.log("Browser closed.");
})();

