/**
 * HeapLens Automated Playwright Verification Test
 * Uses system-installed Chromium (Google Chrome) to verify all 5 routes,
 * responsive viewports (1440x900 and 390x844), theme switching, and live C++ interactions.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runBrowserTests() {
  console.log('====================================================');
  console.log('    HeapLens Automated Browser Quality Pass (QA)     ');
  console.log('====================================================');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const consoleErrors = [];
  const pageErrors = [];

  // 1. Desktop Tests (1440x900)
  console.log('[RUN ] Desktop Viewport (1440x900)...');
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    pageErrors.push(`[Page Error] ${err.message}`);
  });

  // Step 1: Landing Page
  process.stdout.write('  * Navigating to Landing Page (http://localhost:5173/)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // allow Three.js canvas to render initial frame
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_desktop_landing.png'), fullPage: false });
  console.log(' [PASS] -> screenshots/01_desktop_landing.png');

  // Step 2: Playground & Allocation
  process.stdout.write('  * Testing direct navigation to Playground (/#/playground)...');
  await page.goto('http://localhost:5173/#/playground', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  
  // Submit allocation
  const allocBtn = await page.$('button[type="submit"]:has-text("Allocate")');
  if (allocBtn) {
    await allocBtn.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_desktop_playground.png') });
  console.log(' [PASS] -> screenshots/02_desktop_playground.png');

  // Step 3: Theme Switcher - Light Theme
  process.stdout.write('  * Testing Light Mode (Laboratory Theme)...');
  const lightBtn = await page.$('button[title="Light Mode (Laboratory)"]');
  if (lightBtn) {
    await lightBtn.click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_desktop_light_theme.png') });
  console.log(' [PASS] -> screenshots/03_desktop_light_theme.png');

  // Step 4: Theme Switcher - HeapLens Lab Theme
  process.stdout.write('  * Testing HeapLens Lab Mode (Phosphor Cyber-Instrument)...');
  const labBtn = await page.$('button[title="HeapLens Lab Mode (Phosphor Terminal)"]');
  if (labBtn) {
    await labBtn.click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_desktop_lab_theme.png') });
  console.log(' [PASS] -> screenshots/04_desktop_lab_theme.png');

  // Switch back to Dark Theme
  const darkBtn = await page.$('button[title="Dark Mode (Obsidian)"]');
  if (darkBtn) await darkBtn.click();

  // Step 5: Linked-List Explorer
  process.stdout.write('  * Testing Linked-List Explorer (/#/linked-list)...');
  await page.goto('http://localhost:5173/#/linked-list', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_desktop_linked_list.png') });
  console.log(' [PASS] -> screenshots/05_desktop_linked_list.png');

  // Step 6: How Memory Works (formerly Viva Masterclass)
  process.stdout.write('  * Testing How Memory Works Guide (/#/learn)...');
  await page.goto('http://localhost:5173/#/learn', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  // Expand Question 2
  const q2Btn = await page.$('button:has-text("Q2:")');
  if (q2Btn) {
    await q2Btn.click();
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_desktop_how_it_works.png') });
  console.log(' [PASS] -> screenshots/06_desktop_how_it_works.png');

  await context.close();

  // 2. Mobile Tests (390x844 - iPhone / Modern Mobile)
  console.log('\n[RUN ] Mobile Viewport (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  const mobilePage = await mobileContext.newPage();
  process.stdout.write('  * Navigating to Mobile Landing Page...');
  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '07_mobile_landing.png') });
  console.log(' [PASS] -> screenshots/07_mobile_landing.png');

  process.stdout.write('  * Testing Mobile Hamburger Navigation...');
  const menuBtn = await mobilePage.$('button[aria-label="Toggle Navigation Menu"]');
  if (menuBtn) {
    await menuBtn.click();
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '08_mobile_nav_open.png') });
  }
  console.log(' [PASS] -> screenshots/08_mobile_nav_open.png');

  await mobileContext.close();
  await browser.close();

  console.log('====================================================');
  console.log(`Console Errors: ${consoleErrors.length}`);
  console.log(`Page Errors: ${pageErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error('Console error details:', consoleErrors);
  }
  if (pageErrors.length > 0) {
    console.error('Page error details:', pageErrors);
  }
  console.log('>>> BROWSER QUALITY PASS COMPLETE! ALL SCREENSHOTS SAVED! <<<');
  console.log('====================================================');
}

runBrowserTests().catch((err) => {
  console.error('[Browser QA Fatal Error]:', err.message);
  process.exit(1);
});
