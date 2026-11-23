// Zero-dependency static site generator & SEO/integrity validator for Edil Calc Web
// Usage:
//   node edil_calc_web/_generator/build.mjs          -> Generates calcolatori.html, 21 calcolo-*.html, sitemap.xml
//   node edil_calc_web/_generator/build.mjs --check  -> Validates SEO, JSON-LD, links, zero persistence & icons

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import { renderCalculatorPage } from './template-calculator.mjs';
import { renderHubPage } from './template-hub.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WEB_ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(__dirname, 'testi-calcolatori.json');

const SITE_URL = 'https://www.edilcalc.com';

function buildSitemapXml(calculators, updatedAt) {
    const urls = [
        { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
        { loc: `${SITE_URL}/calcolatori.html`, priority: '0.95', changefreq: 'weekly' },
        ...calculators.map((c) => ({
            loc: `${SITE_URL}/${c.slug}`,
            priority: '0.90',
            changefreq: 'monthly'
        })),
        { loc: `${SITE_URL}/faq.html`, priority: '0.70', changefreq: 'monthly' },
        { loc: `${SITE_URL}/privacy.html`, priority: '0.30', changefreq: 'yearly' },
        { loc: `${SITE_URL}/terms.html`, priority: '0.30', changefreq: 'yearly' }
    ];

    const entries = urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

function loadFeatherIconNames() {
    const featherSrc = fs.readFileSync(path.join(WEB_ROOT, 'js', 'feather.min.js'), 'utf8');
    const sandbox = { window: {} };
    sandbox.self = sandbox.window;
    vm.runInNewContext(featherSrc, sandbox);
    const featherObj = sandbox.window.feather || sandbox.feather;
    return new Set(Object.keys(featherObj.icons || {}));
}

function runChecks(data) {
    const errors = [];
    const warnings = [];
    const validIcons = loadFeatherIconNames();

    const expectedFiles = [
        'calcolatori.html',
        ...data.calculators.map((c) => c.slug),
        'index.html',
        'faq.html',
        'privacy.html',
        'terms.html'
    ];

    // 1. Verify existence & validate each HTML file
    for (const filename of expectedFiles) {
        const filePath = path.join(WEB_ROOT, filename);
        if (!fs.existsSync(filePath)) {
            errors.push(`Missing HTML file: ${filename}`);
            continue;
        }
        const html = fs.readFileSync(filePath, 'utf8');

        // H1 check (exactly one <h1>)
        const h1Count = (html.match(/<h1\b/gi) || []).length;
        if (h1Count !== 1) {
            errors.push(`${filename}: expected 1 <h1>, found ${h1Count}`);
        }

        // Canonical check
        if (!/<link\s+rel="canonical"\s+href="https:\/\/www\.edilcalc\.com\//i.test(html)) {
            errors.push(`${filename}: missing valid canonical URL`);
        }

        // Check Feather icon names
        const iconMatches = html.matchAll(/data-feather="([^"]+)"/g);
        for (const m of iconMatches) {
            if (!validIcons.has(m[1])) {
                errors.push(`${filename}: unknown Feather icon "${m[1]}"`);
            }
        }

        // Check internal href targets (.html files & #hash anchors on same page)
        const hrefMatches = html.matchAll(/href="([^"]+)"/g);
        for (const m of hrefMatches) {
            const href = m[1];
            if (
                href.startsWith('http://') ||
                href.startsWith('https://') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:')
            ) {
                continue;
            }
            if (href.startsWith('#')) {
                if (href === '#' || href === '#gestisci-cookie') continue;
                const anchor = href.slice(1);
                if (!html.includes(`id="${anchor}"`)) {
                    errors.push(`${filename}: broken internal anchor href="${href}"`);
                }
                continue;
            }
            const [relFile] = href.split('#');
            if (relFile && !fs.existsSync(path.join(WEB_ROOT, relFile))) {
                errors.push(`${filename}: broken relative link href="${href}"`);
            }
        }

        // Check local asset references (assets/...)
        const assetMatches = html.matchAll(/(?:src|srcset)="([^"]+)"/g);
        for (const m of assetMatches) {
            const val = m[1].trim();
            if (val.startsWith('assets/')) {
                if (!fs.existsSync(path.join(WEB_ROOT, val))) {
                    errors.push(`${filename}: missing asset file "${val}"`);
                }
            }
        }

        // Generated calculator / hub checks (strip comments before scanning)
        if (filename.startsWith('calcolo-') || filename === 'calcolatori.html') {
            const strippedHtml = html.replace(/<!--[\s\S]*?-->/g, '');
            if (/localStorage|sessionStorage|document\.cookie|window\.print|@media\s+print/i.test(strippedHtml)) {
                errors.push(`${filename}: forbidden storage or print reference found`);
            }

            const ldMatches = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
            if (ldMatches.length !== 1) {
                errors.push(`${filename}: expected 1 JSON-LD script block, found ${ldMatches.length}`);
            } else {
                try {
                    const parsed = JSON.parse(ldMatches[0][1]);
                    const graph = parsed['@graph'] || [];
                    const types = new Set(graph.map((n) => n['@type']));
                    if (filename === 'calcolatori.html') {
                        ['CollectionPage', 'ItemList', 'BreadcrumbList'].forEach((t) => {
                            if (!types.has(t)) errors.push(`${filename}: JSON-LD missing ${t}`);
                        });
                    } else {
                        ['WebApplication', 'TechArticle', 'HowTo', 'FAQPage', 'BreadcrumbList'].forEach((t) => {
                            if (!types.has(t)) errors.push(`${filename}: JSON-LD missing ${t}`);
                        });
                    }
                } catch (err) {
                    errors.push(`${filename}: invalid JSON-LD: ${err.message}`);
                }
            }
        }
    }

    // 2. Verify zero persistence & no print in calculator JS & CSS (ignoring comments)
    const calcFiles = [
        path.join(WEB_ROOT, 'js', 'calculators-logic.js'),
        path.join(WEB_ROOT, 'js', 'calculator-ui.js'),
        path.join(WEB_ROOT, 'css', 'calculator.css')
    ];
    for (const f of calcFiles) {
        const raw = fs.readFileSync(f, 'utf8');
        const stripped = raw
            .replace(/\/\*[\s\S]*?\*\//g, '')
            .replace(/^\s*\/\/.*$/gm, '');
        const rel = path.relative(WEB_ROOT, f);
        if (/\blocalStorage\b|\bsessionStorage\b|\bdocument\.cookie\b|\bwindow\.print\b|@media\s+print/i.test(stripped)) {
            errors.push(`${rel}: forbidden persistence/print construct found`);
        }
    }

    // 3. Verify sitemap.xml (26 URLs)
    const sitemapPath = path.join(WEB_ROOT, 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) {
        errors.push('Missing sitemap.xml');
    } else {
        const sm = fs.readFileSync(sitemapPath, 'utf8');
        const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
        if (locs.length !== 26) {
            errors.push(`sitemap.xml: expected 26 <url> entries, found ${locs.length}`);
        }
        for (const c of data.calculators) {
            if (!locs.includes(`${SITE_URL}/${c.slug}`)) {
                errors.push(`sitemap.xml: missing ${c.slug}`);
            }
        }
        if (!locs.includes(`${SITE_URL}/calcolatori.html`)) {
            errors.push('sitemap.xml: missing calcolatori.html');
        }
    }

    // 4. Verify index.html links to calcolatori.html + all 21 calculator slugs, and robots.txt disallows _generator
    const indexHtml = fs.readFileSync(path.join(WEB_ROOT, 'index.html'), 'utf8');
    if (!indexHtml.includes('calcolatori.html')) {
        errors.push('index.html does not link to calcolatori.html');
    }
    for (const c of data.calculators) {
        if (!indexHtml.includes(`href="${c.slug}"`)) {
            errors.push(`index.html does not link to ${c.slug}`);
        }
    }
    const robotsTxt = fs.readFileSync(path.join(WEB_ROOT, 'robots.txt'), 'utf8');
    if (!robotsTxt.includes('Disallow: /_generator/')) {
        errors.push('robots.txt missing Disallow: /_generator/');
    }

    if (warnings.length) {
        console.log('WARNINGS:');
        warnings.forEach((w) => console.log('  - ' + w));
    }

    if (errors.length) {
        console.error('CHECK FAILED WITH ERRORS:');
        errors.forEach((e) => console.error('  x ' + e));
        process.exit(1);
    }

    console.log(`CHECK PASSED: validated ${expectedFiles.length} HTML pages, 26 sitemap URLs, JSON-LD @graph schemas, Feather icons, relative links, assets, and zero persistence.`);
}

function main() {
    const isCheckOnly = process.argv.includes('--check');
    const raw = fs.readFileSync(DATA_PATH, 'utf8');
    const data = JSON.parse(raw);

    if (data.calculators.length !== 21) {
        throw new Error(`Expected 21 calculators in JSON, got ${data.calculators.length}`);
    }

    if (isCheckOnly) {
        runChecks(data);
        return;
    }

    const calcBySlug = Object.fromEntries(data.calculators.map((c) => [c.slug, c]));

    // 1. Write 21 calculator pages
    for (const calc of data.calculators) {
        const html = renderCalculatorPage(calc, data, calcBySlug);
        const outPath = path.join(WEB_ROOT, calc.slug);
        fs.writeFileSync(outPath, html, 'utf8');
    }

    // 2. Write Hub page (calcolatori.html)
    const hubHtml = renderHubPage(data);
    fs.writeFileSync(path.join(WEB_ROOT, data.hub.slug), hubHtml, 'utf8');

    // 3. Write sitemap.xml
    const sitemapXml = buildSitemapXml(data.calculators, data.meta.updatedAt);
    fs.writeFileSync(path.join(WEB_ROOT, 'sitemap.xml'), sitemapXml, 'utf8');

    console.log(`Generated ${data.calculators.length} calculator pages, ${data.hub.slug}, and sitemap.xml (26 URLs).`);
}

main();
