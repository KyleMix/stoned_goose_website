// Brand acceptance checks, run against a built and served site.
//
//   npm run build && node scripts/serve-out.mjs &
//   node scripts/test/acceptance.mjs
//
// Covers the runtime half of the checklist in docs/design-tokens.md:
// section surfaces, the gold text rules, gradients and shadows, mark
// minimum sizes, clear space, show-info order, and mark mixing. The
// static half (hex sweep, font loading, retired assets, deploy target)
// is checked by the other scripts in this directory and by npm run test.
//
// Not wired into `npm run test` because it needs a built export and a
// running server; it is a pre-release check, not a unit test.
// Resolve playwright from wherever it is available; this script is run
// on demand rather than from devDependencies.
import pw from 'playwright';
const { chromium } = pw;
const ROUTES = ['/','/shows','/book','/watch','/roster','/shop','/open-mics','/open-mics/map','/contact','/404'];
const PAL = { tuxedo:'rgb(15, 15, 15)', ivory:'rgb(244, 238, 226)', gold:'rgb(212, 170, 74)',
              goldInk:'rgb(135, 104, 31)', smoke:'rgb(140, 135, 129)' };
const fail = { 3:[], 4:[], 5:[], 7:[], 8:[], 10:[], 11:[] };
const seen = { showBlocks:0, marks:0, sections:0 };

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const vw of [1280, 390]) {
  const p = await b.newPage({ viewport:{ width:vw, height:900 } });
  for (const r of ROUTES) {
    await p.goto('http://localhost:8788'+r, { waitUntil:'networkidle' });
    // force lazy content so nothing hides from the audit
    await p.evaluate(async () => { for (let y=0; y<document.body.scrollHeight; y+=700){ window.scrollTo(0,y); await new Promise(s=>setTimeout(s,40)); } window.scrollTo(0,0); });
    await p.waitForTimeout(250);
    const res = await p.evaluate(({ PAL, route, vw }) => {
      const out = { 3:[], 4:[], 5:[], 7:[], 8:[], 10:[], 11:[], counts:{sections:0, marks:0, showBlocks:0} };
      const px = v => parseFloat(v) || 0;

      // 3. every section background is ivory, tuxedo, or the sanctioned smoke strip
      for (const s of document.querySelectorAll('main section, main [data-surface], footer')) {
        const bg = getComputedStyle(s).backgroundColor;
        if (bg === 'rgba(0, 0, 0, 0)') continue;
        out.counts.sections++;
        if (![PAL.tuxedo, PAL.ivory, PAL.smoke].includes(bg))
          out[3].push(`${route}@${vw} section bg ${bg}`);
        if (bg === PAL.gold) out[3].push(`${route}@${vw} GOLD BACKGROUND on a section`);
      }

      // 4. gold text rules
      for (const el of document.querySelectorAll('body *')) {
        if (el.children.length || !el.textContent.trim()) continue;
        const s = getComputedStyle(el);
        if (s.visibility==='hidden'||s.display==='none'||+s.opacity===0) continue;
        const rect = el.getBoundingClientRect(); if (!rect.width||!rect.height) continue;
        let e = el, bg = PAL.tuxedo;
        while (e) { const c = getComputedStyle(e).backgroundColor;
          if (c && c !== 'rgba(0, 0, 0, 0)') { bg = c; break; } e = e.parentElement; }
        const size = px(s.fontSize), bold = +s.fontWeight >= 700;
        const txt = el.textContent.trim().slice(0,24);
        if (s.color === PAL.gold && bg === PAL.ivory)
          out[4].push(`${route}@${vw} Marquee Gold on ivory "${txt}"`);
        // The checklist says "no gold text below headline size on black", but
        // the spec's own type table puts the Eyebrow role at Marquee Gold on
        // black at label size, and two of its four reference layouts show a
        // gold eyebrow. Reading the two together: what is forbidden is gold
        // BODY text. Gold is allowed at headline size, or in the Eyebrow role.
        const tracking = parseFloat(s.letterSpacing) || 0;
        const isEyebrow = +s.fontWeight === 400 && s.textTransform === 'uppercase'
                          && (tracking / size) >= 0.2;
        if (s.color === PAL.gold && bg === PAL.tuxedo && size < 24 && !isEyebrow)
          out[4].push(`${route}@${vw} gold neither headline nor eyebrow, ${size}px/${s.fontWeight} "${txt}"`);
      }

      // 5. gradients and shadows anywhere
      for (const el of document.querySelectorAll('body *')) {
        const s = getComputedStyle(el);
        if (/gradient/.test(s.backgroundImage)) out[5].push(`${route}@${vw} gradient on <${el.tagName.toLowerCase()}>`);
        if (s.boxShadow && s.boxShadow !== 'none') out[5].push(`${route}@${vw} box-shadow on <${el.tagName.toLowerCase()}>`);
      }

      // 7 + 8 + 11. marks
      const marks = [...document.querySelectorAll('img')].filter(i => /SGP_/.test(i.currentSrc||i.src));
      for (const m of marks) {
        const s = getComputedStyle(m);
        if (s.display==='none'||s.visibility==='hidden') continue;
        out.counts.marks++;
        const rect = m.getBoundingClientRect();
        const file = (m.currentSrc||m.src).split('/').pop();
        const isLock = /Lockup/.test(file);
        const artMin = isLock ? 240 : 96;
        const artW = rect.width * (isLock ? 2863/3353 : 1466/1750);
        if (artW < artMin - 0.5) out[7].push(`${route}@${vw} ${file} artwork ${artW.toFixed(0)}px < ${artMin}px`);
        const pad = ['paddingTop','paddingRight','paddingBottom','paddingLeft'].map(k=>px(s[k]));
        if (pad.some(v=>v>0)) out[8].push(`${route}@${vw} ${file} has component padding ${pad.join('/')} on top of baked clear space`);
        if (s.filter!=='none') out[5].push(`${route}@${vw} filter on mark ${file}`);
        if (s.mixBlendMode!=='normal') out[5].push(`${route}@${vw} blend mode on mark ${file}`);
        if (s.boxShadow!=='none') out[5].push(`${route}@${vw} shadow on mark ${file}`);
      }
      // 11. no section holds both marks
      for (const sec of document.querySelectorAll('section, [data-surface]')) {
        const inner = [...sec.querySelectorAll('img')].filter(i=>/SGP_/.test(i.currentSrc||i.src));
        const kinds = new Set(inner.map(i => /Lockup/.test(i.src)?'lockup':'badge'));
        if (kinds.size > 1) out[11].push(`${route}@${vw} a section holds both lockup and badge`);
      }

      // 10. show info order
      for (const dl of document.querySelectorAll('dl')) {
        const keys = [...dl.querySelectorAll('dt')].map(d=>d.textContent.trim());
        if (!keys.length || !keys.includes('date')) continue;
        out.counts.showBlocks++;
        const ORDER = ['date','venue','times','price'];
        const idx = keys.map(k=>ORDER.indexOf(k));
        if (idx.some(i=>i<0) || idx.slice().sort((a,b)=>a-b).join()!==idx.join())
          out[10].push(`${route}@${vw} show info out of order: ${keys.join(', ')}`);
      }
      return out;
    }, { PAL, route:r, vw });
    for (const k of Object.keys(fail)) fail[k].push(...res[k]);
    seen.sections += res.counts.sections; seen.marks += res.counts.marks; seen.showBlocks += res.counts.showBlocks;
  }
  await p.close();
}
await b.close();
const LABEL = { 3:'section backgrounds ivory/tuxedo only, no gold', 4:'gold text rules',
  5:'no gradients, no shadows', 7:'mark minimum sizes', 8:'no padding on baked clear space',
  10:'show info order', 11:'no mark mixing in a section' };
console.log(`inspected: ${seen.sections} section backgrounds, ${seen.marks} rendered marks, ${seen.showBlocks} show-info blocks\n`);
for (const k of Object.keys(LABEL)) {
  const u = [...new Set(fail[k])];
  console.log(`ITEM ${k}  ${u.length? 'FAIL':'PASS'}  ${LABEL[k]}`);
  u.slice(0,6).forEach(x=>console.log(`        ${x}`));
  if (u.length>6) console.log(`        ...and ${u.length-6} more`);
}
