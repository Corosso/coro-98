// Verificación headless del escritorio FRF-98.
// Requiere: playwright + Chromium. Instalar con:  npm i -D playwright
// (o usar un chromium del sistema vía executablePath).
// Uso:  node scripts/verify.mjs   (con `npm run dev`/`npm start` corriendo en :3000 o :3111)

import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const CHROME = process.env.CHROME_PATH || '/usr/bin/chromium';

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGE ERROR: ' + e.message));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const check = (name, cond) => console.log(`${cond ? '✓' : '✗'} ${name}`);

check('gate title', await page.locator('.gate-title').first().textContent());
check('gate input', (await page.locator('.gate-input').count()) === 1);
console.log('   progress:', (await page.locator('.gate-progress-label').textContent()).trim());

await page.fill('.gate-input', 'test@example.com');
await page.click('.gate-actions button');
await page.waitForTimeout(1200);
check('gate gone', (await page.locator('.gate').count()) === 0);

check('5 desktop icons', (await page.locator('.desktop-icon').count()) === 5);
check('matrix canvas', (await page.locator('canvas').count()) >= 1);

await page.locator('.desktop-icon').nth(1).dblclick();
await page.waitForTimeout(1000);
check('window open', (await page.locator('.win98-window').count()) === 1);
check('project cards', (await page.locator('.project-card').count()) >= 1);

await page.click('.start-button');
await page.waitForTimeout(400);
check('start menu items', (await page.locator('.start-menu-item').count()) >= 5);

// minimizar
await page.locator('.win98-window.active .title-bar-controls button').first().click();
await page.waitForTimeout(400);
check('window minimized', (await page.locator('.win98-window').count()) === 0);
check('taskbar task', (await page.locator('.task-button').count()) === 1);

console.log('---');
console.log(errors.length ? 'ERRORES:\n' + errors.join('\n') : 'Sin errores de página.');
await browser.close();
process.exit(errors.length ? 1 : 0);
