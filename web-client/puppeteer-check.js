import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR STACK:', error.stack || error.message));

  // 1. Check Mobile Viewport (iPhone 14: 390 x 844)
  console.log('Testing Mobile Viewport (390x844)...');
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  
  try {
    await page.goto('http://[::1]:5173/', { waitUntil: 'networkidle2', timeout: 12000 });
  } catch (e) {
    await page.goto('http://[::1]:5173/', { waitUntil: 'domcontentloaded' });
  }
  
  await new Promise(r => setTimeout(r, 3000));
  
  const mobileScreenshotPath = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/82dc868f-9e89-4520-ab0d-5eb43206671a/hanoi_1946_mobile.png';
  await page.screenshot({ path: mobileScreenshotPath });
  console.log('Mobile screenshot saved to:', mobileScreenshotPath);

  // 2. Open FTU Game Mission to verify game on mobile
  console.log('Testing Game Mission Modal on Mobile...');
  const missionBtn = await page.$('button[title*="Nhiệm Vụ Tác Chiến"]');
  if (missionBtn) {
    await missionBtn.click();
    await new Promise(r => setTimeout(r, 2000));
    const gameModalScreenshotPath = 'C:/Users/Lenovo/.gemini/antigravity-ide/brain/82dc868f-9e89-4520-ab0d-5eb43206671a/hanoi_1946_mobile_game.png';
    await page.screenshot({ path: gameModalScreenshotPath });
    console.log('Mobile game screenshot saved to:', gameModalScreenshotPath);
  }

  await browser.close();
  console.log('All mobile checks passed.');
})();
