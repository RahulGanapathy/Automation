const puppeteer = require('puppeteer');
const fs = require('fs');

const COOKIE_FILE = 'cookies.json';

(async () => {
  // Launch Puppeteer in headless mode
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Load and set cookies before navigating
  if (fs.existsSync(COOKIE_FILE)) {
    const cookies = JSON.parse(fs.readFileSync(COOKIE_FILE, 'utf8'));
    await page.setCookie(...cookies);
    console.log("Cookies loaded.");
  }

  // Go to ChatGPT
  await page.goto('https://chatgpt.com', { waitUntil: 'networkidle2' });

  // Save updated cookies for future runs
  const newCookies = await page.cookies();
  fs.writeFileSync(COOKIE_FILE, JSON.stringify(newCookies, null, 2));

  // Navigate to the specific chat (Modify this selector)
  await page.waitForSelector('text=Your Chat Title');
  await page.click('text=Nanic Wellness Website Flow');

  // Wait for the input area and send a message
  await page.waitForSelector('textarea');
  await page.type('textarea', 'Update');
  await page.keyboard.press('Enter');

  console.log('Message sent successfully!');
  await browser.close();
})();
