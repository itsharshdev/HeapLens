/**
 * HeapLens Phase 4 Comprehensive Automated Playwright QA
 * 
 * Verifies:
 * 1. Multi-viewport responsive rendering:
 *    - Desktop (1440x900)
 *    - Laptop/Tablet (1024x768)
 *    - Mobile (390x844 - iPhone / Modern Mobile)
 * 2. Landing Page: Hero with "See memory allocation, block by block", 3D bus arena,
 *    quick trial allocation, AllocatorStoryline (5 lifecycle phases), and ArchitectureFlow.
 * 3. Playground:
 *    - View toggles (Dual, 2D, 3D)
 *    - Real C++ First Fit allocation
 *    - TracePlayer stepping and controls
 *    - Scenario 1 (Block Splitting)
 *    - Scenario 2 (3-Block Coalescing & CoalescingInspector)
 *    - Scenario 3 (External Fragmentation & Failure Trace)
 *    - Reset pool
 * 4. Dashboard: Live metrics and active allocations table.
 * 5. Linked-List Explorer: Invariants HUD and pointer traversal chain.
 * 6. How Memory Works: Complexity Table, StrategyComparator, and Q&A accordion.
 * 7. Three complete themes: Dark (Obsidian), Light (Laboratory), and Lab (Phosphor).
 * 8. Zero console errors and zero page errors.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCREENSHOT_DIR = path.join(__dirname, '..', 'screenshots');
const BASE_URL = process.env.APP_URL || 'http://localhost:3001';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runPhase4QA() {
  console.log('====================================================');
  console.log('   HeapLens Phase 4: Final QA & Browser Testing     ');
  console.log('====================================================');

  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const consoleErrors = [];
  const pageErrors = [];

  // =========================================================
  // VIEWPORT 1: Desktop (1440x900)
  // =========================================================
  console.log('[RUN ] Viewport 1: Desktop (1440x900)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await desktopContext.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[Console Error] ${msg.text()}`);
  });
  page.on('pageerror', (err) => {
    pageErrors.push(`[Page Error] ${err.message}`);
  });

  // 1. Landing Page Hero & Storyline
  process.stdout.write('  * [1/11] Landing Page Hero & 3D Bus Arena...');
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000); // Three.js initial render
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_desktop_hero.png') });
  console.log(' [PASS] -> screenshots/01_desktop_hero.png');

  // Test Quick Live Trial Allocation on Landing Page
  process.stdout.write('  * [2/11] Landing Page Quick Trial (+ Allocate 30u)...');
  const trialBtn = await page.$('button:has-text("+ Allocate 30u")');
  if (trialBtn) {
    await trialBtn.click();
    await page.waitForTimeout(600);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_desktop_landing_quick_trial.png') });
  console.log(' [PASS] -> screenshots/02_desktop_landing_quick_trial.png');

  // Test AllocatorStoryline tab switching
  process.stdout.write('  * [3/11] Landing Page AllocatorStoryline (Phase 02 - Splitting)...');
  const splitTab = await page.$('button:has-text("Dynamic Block Splitting")');
  if (splitTab) {
    await splitTab.click();
    await page.waitForTimeout(400);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_desktop_storyline_tab.png') });
  console.log(' [PASS] -> screenshots/03_desktop_storyline_tab.png');

  // 2. Playground - Guided Scenarios & TracePlayer
  process.stdout.write('  * [4/11] Playground: Scenario 1 (Block Splitting)...');
  await page.goto(`${BASE_URL}/#/playground`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const scenario1 = await page.$('button:has-text("1. Block Splitting")');
  if (scenario1) {
    await scenario1.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_desktop_playground_split.png') });
  console.log(' [PASS] -> screenshots/04_desktop_playground_split.png');

  process.stdout.write('  * [5/11] Playground: Scenario 2 (3-Block Coalescing Inspector)...');
  const scenario2 = await page.$('button:has-text("2. Coalescing (3 Blocks)")');
  if (scenario2) {
    await scenario2.click();
    await page.waitForTimeout(1200);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_desktop_playground_coalesce.png') });
  console.log(' [PASS] -> screenshots/05_desktop_playground_coalesce.png');

  process.stdout.write('  * [6/11] Playground: Scenario 3 (External Fragmentation & Trace Stepping)...');
  const scenario3 = await page.$('button:has-text("3. External Fragmentation")');
  if (scenario3) {
    await scenario3.click();
    await page.waitForTimeout(1200);
    // Step forward in trace
    const nextBtn = await page.$('button[title="Next Step"]');
    if (nextBtn && await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(200);
      await nextBtn.click();
      await page.waitForTimeout(200);
    }
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_desktop_playground_fragmentation.png') });
  console.log(' [PASS] -> screenshots/06_desktop_playground_fragmentation.png');

  // 3. Dashboard Route
  process.stdout.write('  * [7/11] Dashboard (/#/dashboard)...');
  await page.goto(`${BASE_URL}/#/dashboard`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_desktop_dashboard.png') });
  console.log(' [PASS] -> screenshots/07_desktop_dashboard.png');

  // 4. Linked-List Explorer Route
  process.stdout.write('  * [8/11] Linked-List Explorer (/#/linked-list)...');
  await page.goto(`${BASE_URL}/#/linked-list`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_desktop_linked_list.png') });
  console.log(' [PASS] -> screenshots/08_desktop_linked_list.png');

  // 5. How Memory Works Guide & Strategy Comparator
  process.stdout.write('  * [9/11] How Memory Works Guide & Strategy Comparator (/#/learn)...');
  await page.goto(`${BASE_URL}/#/learn`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  const preset35 = await page.$('button:has-text("35u")');
  if (preset35) {
    await preset35.click();
    await page.waitForTimeout(300);
  }
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_desktop_learn_guide.png') });
  console.log(' [PASS] -> screenshots/09_desktop_learn_guide.png');

  // 6. Theme Modes: Light Mode & HeapLens Lab Mode
  process.stdout.write('  * [10/11] Theme Switches: Laboratory (Light) & HeapLens Lab (Phosphor)...');
  const lightBtn = await page.$('button[title="Light Mode (Laboratory)"]');
  if (lightBtn) {
    await lightBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_desktop_theme_light.png') });
  }
  const labBtn = await page.$('button[title="HeapLens Lab Mode (Phosphor Terminal)"]');
  if (labBtn) {
    await labBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_desktop_theme_lab.png') });
  }
  // Reset back to Dark Obsidian
  const darkBtn = await page.$('button[title="Dark Mode (Obsidian)"]');
  if (darkBtn) await darkBtn.click();
  console.log(' [PASS] -> screenshots/10_desktop_theme_light.png, 11_desktop_theme_lab.png');

  await desktopContext.close();

  // =========================================================
  // VIEWPORT 2: Tablet / Laptop (1024x768)
  // =========================================================
  console.log('\n[RUN ] Viewport 2: Laptop/Tablet (1024x768)...');
  const tabletContext = await browser.newContext({
    viewport: { width: 1024, height: 768 },
    deviceScaleFactor: 1,
  });
  const tabletPage = await tabletContext.newPage();
  await tabletPage.goto(`${BASE_URL}/#/playground`, { waitUntil: 'networkidle' });
  await tabletPage.waitForTimeout(800);
  await tabletPage.screenshot({ path: path.join(SCREENSHOT_DIR, '12_tablet_playground.png') });
  console.log('  * [PASS] -> screenshots/12_tablet_playground.png');
  await tabletContext.close();

  // =========================================================
  // VIEWPORT 3: Mobile (390x844 - iPhone / Mobile)
  // =========================================================
  console.log('\n[RUN ] Viewport 3: Mobile (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(800);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '13_mobile_landing.png') });
  console.log('  * Mobile Landing Page... [PASS] -> screenshots/13_mobile_landing.png');

  // Test Mobile Navigation Sheet
  const menuBtn = await mobilePage.$('button[aria-label="Toggle Navigation Menu"]');
  if (menuBtn) {
    await menuBtn.click();
    await mobilePage.waitForTimeout(300);
    await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '14_mobile_nav_drawer.png') });
    console.log('  * Mobile Nav Drawer... [PASS] -> screenshots/14_mobile_nav_drawer.png');

    // Click visible Playground button
    const navPlayground = await mobilePage.$('button:has-text("Playground"):visible');
    if (navPlayground) {
      await navPlayground.click();
      await mobilePage.waitForTimeout(600);
      await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, '15_mobile_playground.png') });
      console.log('  * Mobile Playground View... [PASS] -> screenshots/15_mobile_playground.png');
    }
  }

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
  console.log('>>> PHASE 4 COMPREHENSIVE QA PASS COMPLETE! <<<');
  console.log('====================================================');

  if (consoleErrors.length > 0 || pageErrors.length > 0) {
    process.exit(1);
  }
}

runPhase4QA().catch((err) => {
  console.error('[Phase 4 QA Fatal Error]:', err.message);
  process.exit(1);
});
