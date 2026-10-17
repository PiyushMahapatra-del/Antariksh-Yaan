import { chromium } from 'playwright';
import { preview } from 'vite';

async function main() {
  const prefix = process.argv[2] || 'screenshot';
  console.log(`Starting preview server on random port...`);
  const server = await preview({
    preview: { port: 0 },
  });
  const address = server.httpServer.address();
  const port = typeof address === 'object' && address ? address.port : 4173;
  const baseUrl = `http://localhost:${port}`;
  console.log(`Preview server running at ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { width: 1280, height: 720, name: '1280x720' },
    { width: 1440, height: 900, name: '1440x900' },
    { width: 1920, height: 1080, name: '1920x1080' },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(baseUrl, { waitUntil: 'load' });
    await page.waitForTimeout(1000);

    if (prefix.includes('ai') || prefix.includes('diagnostics') || prefix.includes('shapley')) {
      try {
        await page.click('.rail-btn[data-tab="AI"]');
        await page.waitForTimeout(300);
        await page.keyboard.press('Space');
        await page.waitForTimeout(300);
        if (prefix.includes('shapley') || prefix.includes('explain')) {
          await page.click('#explain-state-btn');
          await page.waitForTimeout(500);
        }
      } catch (e) {
        console.log('Interaction note:', (e as Error).message);
      }
    } else if (prefix.includes('a4') || prefix.includes('scen') || prefix.includes('clean-labels')) {
      try {
        await page.click('.rail-btn[data-tab="SCENARIOS"]');
        await page.waitForTimeout(500);
      } catch (e) {
        console.log('Interaction note:', (e as Error).message);
      }
    }

    const filename = `docs/screenshots/${prefix}-${vp.name}.png`;
    await page.screenshot({ path: filename });
    console.log(`Captured ${filename}`);
    await page.close();
  }

  await browser.close();
  await new Promise<void>((resolve) => {
    server.httpServer.close(() => resolve());
  });
  console.log('Screenshots completed successfully.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
