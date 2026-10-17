import { chromium } from 'playwright';
import { preview } from 'vite';

async function main() {
  const prefix = process.argv[2] || 'screenshot';
  console.log(`Starting preview server...`);
  const server = await preview({
    preview: { port: 4173 },
  });
  const port = server.httpServer.address()?.['port'] || 4173;
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
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    // Allow simulation to settle for 1s
    await page.waitForTimeout(1000);
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
