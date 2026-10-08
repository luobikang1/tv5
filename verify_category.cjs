const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 1200 });

  await page.goto('http://localhost:3000/#/settings', { waitUntil: 'networkidle' });

  // Auto-login if password field is presented
  const passInput = await page.$('input[type="password"]');
  if (passInput) {
    await passInput.fill('whitefox5');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
  }

  // Expand R2 Cloud Storage section
  const expandButtons = await page.$$('button');
  for (const btn of expandButtons) {
    const text = await btn.innerText();
    if (text.includes('云盘界面')) {
      await btn.click();
      await page.waitForTimeout(500);
      break;
    }
  }

  await page.screenshot({ path: '/home/jules/verification/r2_category_folders.png', fullPage: true });
  await browser.close();
  console.log('Screenshot captured successfully.');
})();
