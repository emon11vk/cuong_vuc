import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR STACK:', error.stack || error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  console.log('Navigating to http://localhost:5173/minigame/level2 ...');
  await page.goto('http://localhost:5173/minigame/level2', { waitUntil: 'domcontentloaded' });
  
  // Wait a bit just in case
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Done.');
  await browser.close();
})();
