// 推广页自动检查：node qa.cjs qa.config.json（配置格式见 references/qa.md）
// 依赖 playwright（npm i -g playwright 或项目内安装）；默认用系统 Chrome，可用 QA_CHANNEL= 改成 chromium
'use strict';
const fs = require('fs');
const path = require('path');
let chromium;
for (const p of ['playwright', path.join(process.env.HOME || '', '.npm-global/lib/node_modules/playwright')]) {
  try { ({ chromium } = require(p)); break; } catch {}
}
if (!chromium) { console.error('找不到 playwright：npm i -g playwright'); process.exit(2); }

const cfg = JSON.parse(fs.readFileSync(process.argv[2] || 'qa.config.json', 'utf8'));
const widths = cfg.widths || [320, 390, 768, 1440];
const fails = [];
const fail = (where, msg) => fails.push(`${where}: ${msg}`);

(async () => {
  const opts = { headless: true, args: ['--no-sandbox'] };
  if (process.env.QA_CHANNEL !== 'chromium') opts.channel = 'chrome';
  const browser = await chromium.launch(opts);
  if (cfg.screenshots) fs.mkdirSync(cfg.screenshots, { recursive: true });
  for (const pg of cfg.pages) {
    for (const width of widths) {
      const where = `${pg.name}@${width}`;
      const page = await browser.newPage({ viewport: { width, height: 900 }, ignoreHTTPSErrors: true });
      const errs = [], bad = [], writes = [];
      page.on('pageerror', e => errs.push(e.message));
      page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
      page.on('request', r => { if (!['GET', 'HEAD'].includes(r.method())) writes.push(r.url()); });
      await page.goto(cfg.base + pg.path + (pg.path.includes('?') ? '&' : '?') + 'qa=' + Date.now(), { waitUntil: 'load' });
      await page.evaluate(async () => { for (const im of document.images) { im.loading = 'eager'; try { await im.decode(); } catch {} } });
      const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (await overflow() > 0) fail(where, `横向溢出 ${await overflow()}px（加载时）`);
      if (pg.lang && await page.evaluate(() => document.documentElement.lang) !== pg.lang) fail(where, 'html lang 不对');
      if (await page.locator('h1').count() !== 1) fail(where, 'h1 不是正好一个');
      const broken = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth || !i.hasAttribute('alt')).map(i => i.src));
      if (broken.length) fail(where, '图片没加载或缺 alt：' + broken.join(', '));
      // 图片不变形：非铺底（object-fit:cover）图片的显示宽高比与原图一致（误差 1%）
      const warped = await page.evaluate(() => [...document.images]
        .filter(i => i.naturalWidth && i.offsetWidth && getComputedStyle(i).objectFit !== 'cover')
        .map(i => ({ s: i.src.split('/').slice(-2).join('/'), r: (i.offsetWidth / i.offsetHeight) / (i.naturalWidth / i.naturalHeight) }))
        .filter(x => Math.abs(x.r - 1) > .01));
      if (warped.length) fail(where, '图片变形：' + JSON.stringify(warped));
      if (cfg.banned?.length) {
        const text = await page.evaluate(() => document.body.innerText);
        const hit = cfg.banned.filter(w => text.includes(w));
        if (hit.length) fail(where, '出现禁用词：' + hit.join('、'));
      }
      if (cfg.cta && await page.locator(`a[href="${cfg.cta}"]`).count() < 1) fail(where, '找不到主按钮链接 ' + cfg.cta);
      for (const [sel, n] of Object.entries(cfg.counts || {})) {
        const got = await page.locator(sel).count();
        if (got !== n) fail(where, `${sel} 数量 ${got}，应为 ${n}`);
      }
      // 视频：滚到第一个 video，等它自己播起来
      if (await page.locator('video').count()) {
        await page.locator('video').first().scrollIntoViewIfNeeded();
        try {
          await page.waitForFunction(() => { const v = document.querySelector('video'); return !v.paused && v.currentTime > .3; }, null, { timeout: 25000 });
        } catch { fail(where, '视频没有自动播放'); }
      }
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);
      if (await overflow() > 0) fail(where, `横向溢出 ${await overflow()}px（滚到底）`);
      if (errs.length) fail(where, 'JS 报错：' + errs.join(' | '));
      if (bad.length) fail(where, '请求失败：' + bad.join(' | '));
      if (writes.length) fail(where, '页面发出了写请求：' + writes.join(' | '));
      if (cfg.screenshots) await page.screenshot({ path: `${cfg.screenshots}/${pg.name}-${width}.png`, fullPage: true });
      await page.close();
      console.log((fails.some(f => f.startsWith(where + ':')) ? '✕ ' : '✓ ') + where);
    }
  }
  await browser.close();
  if (fails.length) { console.error('\n' + fails.join('\n')); process.exit(1); }
  console.log('\n全部通过。别忘了人眼看截图：' + (cfg.screenshots || '（未开启截图）'));
})().catch(e => { console.error(e); process.exit(1); });
