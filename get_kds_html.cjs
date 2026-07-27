const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });
  
  await page.goto('http://localhost:3000');
  await new Promise(r => setTimeout(r, 2000));
  
  // click button containing "Appareils & KDS"
  const elements = await page.$$('button');
  for (let el of elements) {
    const text = await page.evaluate(e => e.textContent, el);
    if (text.includes('Appareils & KDS')) {
      await el.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  
  // click button containing "Simulateur d'Écran" or "Lancer"
  const buttons = await page.$$('button');
  for (let el of buttons) {
    const text = await page.evaluate(e => e.textContent, el);
    if (text.includes('Simulateur')) {
      await el.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 2000));
  console.log('Done');
  await browser.close();
})();
