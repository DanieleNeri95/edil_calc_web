// Static HTML generator for the 21-Calculator Hub page (calcolatori.html)

import {
    SITE_URL,
    escapeHtml,
    playStoreUrl,
    renderHead,
    renderNavbar,
    renderFooter,
    renderScripts
} from './shared-partials.mjs';

function buildHubSchema(hub, calculators, meta) {
    const hubUrl = `${SITE_URL}/${hub.slug}`;
    const graph = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'CollectionPage',
                '@id': `${hubUrl}#collection`,
                name: hub.h1,
                description: hub.metaDescription,
                url: hubUrl,
                inLanguage: 'it-IT',
                dateModified: meta.updatedAt,
                mainEntity: {
                    '@id': `${hubUrl}#list`
                }
            },
            {
                '@type': 'ItemList',
                '@id': `${hubUrl}#list`,
                numberOfItems: calculators.length,
                itemListElement: calculators.map((c, idx) => ({
                    '@type': 'ListItem',
                    position: idx + 1,
                    name: c.cardTitle,
                    description: c.cardDesc,
                    url: `${SITE_URL}/${c.slug}`
                }))
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${hubUrl}#breadcrumbs`,
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/index.html` },
                    { '@type': 'ListItem', position: 2, name: 'Calcolatori Online', item: hubUrl }
                ]
            }
        ]
    };
    return JSON.stringify(graph, null, 2);
}

export function renderHubPage(data) {
    const { meta, hub, calculators } = data;
    const schemaJson = buildHubSchema(hub, calculators, meta);

    const headHtml = renderHead({
        title: hub.title,
        metaDescription: hub.metaDescription,
        ogTitle: hub.title,
        ogDescription: hub.metaDescription,
        canonicalPath: hub.slug,
        keywords: [
            'calcolatori edili online',
            'calcolo materiali edilizia',
            'calcolo massetto piastrelle pittura cartongesso',
            'guide lavori edili'
        ],
        schemaGraphJson: schemaJson
    });

    const navbarHtml = renderNavbar('hub_calcolatori', 'calcolatori');
    const playHref = escapeHtml(playStoreUrl('hub_banner_cta', 'hub_calcolatori'));

    const counts = {};
    calculators.forEach((c) => {
        counts[c.category] = (counts[c.category] || 0) + 1;
    });

    const tabButtonsHtml = [
        `<button class="calc-tab-btn active" data-category="all">Tutti <span class="calc-count-pill">${calculators.length}</span></button>`,
        ...hub.categories.map((cat) =>
            `<button class="calc-tab-btn" data-category="${escapeHtml(cat.id)}">${escapeHtml(cat.label)} <span class="calc-count-pill">${counts[cat.id] || 0}</span></button>`
        )
    ].join('');

    const cardsHtml = calculators.map((c) => {
        const searchIndex = [
            c.cardTitle,
            c.cardDesc,
            c.categoryLabel,
            ...(c.seo.primaryKeywords || [])
        ].join(' ').toLowerCase();

        const badgesHtml = (c.cardBadges || [])
            .map((b) => `<span>${escapeHtml(b)}</span>`)
            .join('');

        return `
            <article class="calc-item-card" data-category="${escapeHtml(c.category)}" data-search="${escapeHtml(searchIndex)}">
                <div class="calc-item-header">
                    <div class="calc-item-icon"><i data-feather="${escapeHtml(c.icon)}"></i></div>
                    <span class="calc-item-cat">${escapeHtml(c.categoryLabel)}</span>
                </div>
                <h2 class="calc-item-title">${escapeHtml(c.cardTitle)}</h2>
                <p class="calc-item-desc">${escapeHtml(c.cardDesc)}</p>
                <div class="calc-item-outputs">
                    ${badgesHtml}
                </div>
                <a href="${escapeHtml(c.slug)}" class="hub-card-link">
                    <span>${escapeHtml(c.cardLinkText)}</span>
                    <i data-feather="chevron-right"></i>
                </a>
            </article>`;
    }).join('');

    const catSummariesHtml = hub.categories.map((cat) => `
        <div class="calc-detail-cell" style="padding:1rem;">
            <span style="display:flex;align-items:center;gap:0.45rem;color:#00E5FF;font-size:0.85rem;font-weight:700;margin-bottom:0.35rem;">
                <i data-feather="${escapeHtml(cat.icon)}" style="width:15px;height:15px;"></i>
                <span>${escapeHtml(cat.label)} (${counts[cat.id] || 0})</span>
            </span>
            <p style="margin:0;font-size:0.86rem;line-height:1.5;color:#D4D4D8;">${escapeHtml(cat.description)}</p>
        </div>`).join('');

    const bodyHtml = `
<body>
${navbarHtml}

    <main class="calc-page-main">
        <div class="container">
            <nav class="calc-breadcrumbs" aria-label="Breadcrumb">
                <a href="index.html">Home</a>
                <span class="crumb-sep">&rsaquo;</span>
                <span class="crumb-current">21 Calcolatori Online</span>
            </nav>

            <header class="page-hero" style="padding: 1.5rem 0 1.25rem; text-align:center;">
                <span class="eyebrow"><i data-feather="sliders"></i> ${escapeHtml(hub.eyebrow)}</span>
                <h1 class="page-hero-title">${escapeHtml(hub.h1)}</h1>
                <p class="section-subtitle" style="margin: 0.75rem auto 0; max-width: 72ch;">${escapeHtml(hub.subtitle)}</p>

                <div class="hub-search-wrap">
                    <i data-feather="search" class="hub-search-icon"></i>
                    <input type="text" id="hub-search-input" class="hub-search-input" placeholder="${escapeHtml(hub.searchPlaceholder)}" aria-label="Cerca calcolatore edile">
                </div>
            </header>

            <div class="calc-Category-tabs" id="hub-category-tabs">
                ${tabButtonsHtml}
            </div>

            <div class="calc-showcase-grid" id="hub-calc-grid">
                ${cardsHtml}
            </div>

            <div id="hub-empty-state" class="hub-empty-state">
                <p style="margin:0;">Nessun calcolatore corrisponde alla ricerca inserita. Prova con una parola chiave diversa (es. <em>massetto</em>, <em>pittura</em>, <em>cavi</em>, <em>ghiaia</em>).</p>
            </div>

            <section class="calc-guide-block" style="margin-top:3rem;">
                <h2>Tutte le Aree Tecniche Coperte</h2>
                <p style="color:#D4D4D8;font-size:0.95rem;line-height:1.6;margin:0 0 1.25rem;">${escapeHtml(hub.introParagraph)}</p>
                <div class="calc-details-grid">
                    ${catSummariesHtml}
                </div>
            </section>

            <section class="guide-inline-cta" style="margin-top:2.25rem;">
                <div>
                    <h3>${escapeHtml(hub.appBannerTitle)}</h3>
                    <p>${escapeHtml(hub.appBannerText)}</p>
                </div>
                <a href="${playHref}" target="_blank" rel="noopener" class="btn btn-primary">
                    <i data-feather="download"></i>
                    <span>Scarica Edil Calc Gratis</span>
                </a>
            </section>
        </div>
    </main>

${renderFooter('hub_calcolatori')}
${renderScripts({ includeCalculator: false })}
`;

    return `${headHtml}\n${bodyHtml}`;
}
