const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  // Simulate clicking the "Caisse" or navigating
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  
  // We need to trigger the rendering of POSTactile.
  // Wait, the app starts at 'selection'. We need to log in or click?
  // Let's inject JS to set the active tab or appMode.
  await page.evaluate(() => {
    // There is no global state access easily. We might need to mock or click.
  });
  
  const html = await page.content();
  await browser.close();
})();
