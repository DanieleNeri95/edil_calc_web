// Static HTML template generator for individual calculator pages (21 total)

import { FORM_SCHEMAS } from './form-schemas.mjs';
import { renderDiagram } from './svg-diagrams.mjs';
import {
    SITE_URL,
    escapeHtml,
    playStoreUrl,
    renderHead,
    renderNavbar,
    renderFooter,
    renderResultModal,
    renderScripts
} from './shared-partials.mjs';

function renderField(f) {
    const showWhenAttr = f.showWhen ? ` data-show-when="${escapeHtml(f.showWhen)}"` : '';
    const fullCls = f.fullWidth ? ' calc-field-full' : '';

    if (f.type === 'segmented') {
        const defOpt = f.options.find((o) => o.default) || f.options[0];
        const btns = f.options.map((opt) => {
            const active = opt === defOpt;
            return `<button type="button" class="calc-seg-btn${active ? ' active' : ''}" role="radio" aria-checked="${active ? 'true' : 'false'}" data-value="${escapeHtml(opt.value)}"${opt.default ? ' data-default="true"' : ''}>${escapeHtml(opt.label)}</button>`;
        }).join('');
        return `
            <div class="calc-field${fullCls}"${showWhenAttr}>
                <span class="calc-label">${escapeHtml(f.label)}</span>
                <input type="hidden" name="${escapeHtml(f.name)}" value="${escapeHtml(defOpt.value)}">
                <div class="calc-segmented" role="radiogroup" aria-label="${escapeHtml(f.label)}" data-seg-name="${escapeHtml(f.name)}">
                    ${btns}
                </div>
            </div>`;
    }

    if (f.type === 'switch') {
        return `
            <div class="calc-field${fullCls}"${showWhenAttr}>
                <label class="calc-switch-row" for="field-${escapeHtml(f.name)}">
                    <span class="calc-switch-text">
                        <strong>${escapeHtml(f.label)}</strong>
                        ${f.hint ? `<span>${escapeHtml(f.hint)}</span>` : ''}
                    </span>
                    <span class="calc-switch">
                        <input type="checkbox" id="field-${escapeHtml(f.name)}" name="${escapeHtml(f.name)}"${f.checked ? ' checked' : ''}>
                        <span class="calc-switch-slider"></span>
                    </span>
                </label>
            </div>`;
    }

    if (f.type === 'select') {
        const opts = f.options.map((opt) =>
            `<option value="${escapeHtml(opt.value)}">${escapeHtml(opt.label)}</option>`
        ).join('');
        return `
            <div class="calc-field${fullCls}"${showWhenAttr}>
                <label class="calc-label" for="field-${escapeHtml(f.name)}">${escapeHtml(f.label)}</label>
                <select id="field-${escapeHtml(f.name)}" name="${escapeHtml(f.name)}" class="calc-select">
                    ${opts}
                </select>
            </div>`;
    }

    if (f.type === 'walls') {
        const initialRows = [1, 2, 3, 4].map((num) => `
            <div class="calc-wall-row">
                <span class="calc-wall-index">Muro ${num}</span>
                <div class="calc-input-wrap">
                    <input type="text" inputmode="decimal" class="calc-input has-unit calc-wall-input" aria-label="Lunghezza muro ${num} in metri" placeholder="es. 4,20">
                    <span class="calc-input-unit">m</span>
                </div>
                <button type="button" class="calc-icon-btn calc-wall-del-btn" aria-label="Rimuovi muro" title="Rimuovi muro">
                    <i data-feather="trash-2"></i>
                </button>
            </div>`).join('');

        return `
            <div class="calc-field calc-field-full"${showWhenAttr}>
                <span class="calc-label">${escapeHtml(f.label)} <span class="calc-label-hint">min. 3 pareti</span></span>
                <div id="calc-walls-container" class="calc-walls-list">
                    ${initialRows}
                </div>
                <button type="button" id="calc-add-wall-btn" class="calc-add-row-btn">
                    <i data-feather="plus"></i>
                    <span>+ Aggiungi altro muro</span>
                </button>
            </div>`;
    }

    const inputMode = f.type === 'decimal' ? ' inputmode="decimal"' : '';
    const valueAttr = f.value !== undefined ? ` value="${escapeHtml(f.value)}"` : '';
    const reqAttr = f.required ? ' data-required="true"' : '';
    const zeroAttr = f.allowZero ? ' data-allow-zero="true"' : '';

    return `
        <div class="calc-field${fullCls}"${showWhenAttr}>
            <label class="calc-label" for="field-${escapeHtml(f.name)}">
                <span>${escapeHtml(f.label)}</span>
                ${f.hint ? `<span class="calc-label-hint">${escapeHtml(f.hint)}</span>` : ''}
            </label>
            <div class="calc-input-wrap">
                <input type="text" id="field-${escapeHtml(f.name)}" name="${escapeHtml(f.name)}" class="calc-input${f.unit ? ' has-unit' : ''}"${inputMode} placeholder="${escapeHtml(f.placeholder || '')}"${valueAttr}${reqAttr}${zeroAttr}>
                ${f.unit ? `<span class="calc-input-unit">${escapeHtml(f.unit)}</span>` : ''}
            </div>
        </div>`;
}

function renderCalculatorForm(calc) {
    const schema = FORM_SCHEMAS[calc.logicKey];
    if (!schema) {
        throw new Error(`Missing FORM_SCHEMAS entry for logicKey "${calc.logicKey}"`);
    }

    const primaryHtml = schema.primary.map(renderField).join('');

    const advancedHtml = schema.advanced.length > 0 ? `
        <div class="calc-accordion">
            <button type="button" class="calc-accordion-trigger" aria-expanded="false" aria-controls="panel-advanced">
                <span class="calc-accordion-title">
                    <i data-feather="sliders"></i>
                    <span>Parametri Tecnici, Formati &amp; Sfrido</span>
                </span>
                <span class="calc-accordion-right">
                    <span class="calc-opt-badge">Preimpostati</span>
                    <i data-feather="chevron-down" class="calc-chevron"></i>
                </span>
            </button>
            <div id="panel-advanced" class="calc-accordion-panel">
                <div class="calc-form-grid">
                    ${schema.advanced.map(renderField).join('')}
                </div>
            </div>
        </div>` : '';

    const costsHtml = `
        <div class="calc-accordion">
            <button type="button" class="calc-accordion-trigger" aria-expanded="false" aria-controls="panel-costs">
                <span class="calc-accordion-title">
                    <i data-feather="dollar-sign"></i>
                    <span>Costi Materiali / Accessori (€)</span>
                </span>
                <span class="calc-accordion-right">
                    <span id="badge-costs" class="calc-opt-badge">Opzionale</span>
                    <i data-feather="chevron-down" class="calc-chevron"></i>
                </span>
            </button>
            <div id="panel-costs" class="calc-accordion-panel">
                <div class="calc-form-grid">
                    ${schema.costs.map(renderField).join('')}
                </div>
            </div>
        </div>`;

    const extrasHtml = `
        <div class="calc-accordion">
            <button type="button" class="calc-accordion-trigger" aria-expanded="false" aria-controls="panel-extras">
                <span class="calc-accordion-title">
                    <i data-feather="plus"></i>
                    <span>Voci Extra Cantiere (Trasporto, Primer, Teli...)</span>
                </span>
                <span class="calc-accordion-right">
                    <span id="badge-extras" class="calc-opt-badge">Opzionale</span>
                    <i data-feather="chevron-down" class="calc-chevron"></i>
                </span>
            </button>
            <div id="panel-extras" class="calc-accordion-panel">
                <div class="calc-extra-builder">
                    <div class="calc-field calc-field-desc">
                        <label class="calc-label" for="extra-desc">Descrizione voce</label>
                        <input type="text" id="extra-desc" name="extra_desc" class="calc-input" placeholder="es. Telo protettivo / Smaltimento">
                    </div>
                    <div class="calc-field">
                        <label class="calc-label" for="extra-qty">Q.tà</label>
                        <input type="text" id="extra-qty" name="extra_qty" inputmode="decimal" class="calc-input" placeholder="1">
                    </div>
                    <div class="calc-field">
                        <label class="calc-label" for="extra-unit">U.M.</label>
                        <select id="extra-unit" name="extra_unit" class="calc-select">
                            <option value="pz">pz</option>
                            <option value="mq">mq</option>
                            <option value="ml">ml</option>
                            <option value="kg">kg</option>
                            <option value="mc">mc</option>
                            <option value="L">L</option>
                            <option value="corpo">corpo</option>
                        </select>
                    </div>
                    <div class="calc-field">
                        <label class="calc-label" for="extra-price">Prezzo (€)</label>
                        <input type="text" id="extra-price" name="extra_price" inputmode="decimal" class="calc-input" placeholder="18,00">
                    </div>
                    <button type="button" id="extra-add-btn" class="calc-extra-add-btn">
                        <i data-feather="plus"></i>
                        <span>Aggiungi</span>
                    </button>
                </div>
                <div id="calc-extra-list" class="calc-extra-list"></div>
                <p class="calc-extra-note">Le voci extra valgono solo per il calcolo corrente e non vengono salvate. Nell'app Android le selezioni in un tap dal tuo listino personale.</p>
            </div>
        </div>`;

    const laborHtml = `
        <div class="calc-accordion">
            <button type="button" class="calc-accordion-trigger" aria-expanded="false" aria-controls="panel-labor">
                <span class="calc-accordion-title">
                    <i data-feather="tool"></i>
                    <span>Manodopera Stimata (Ore o A Corpo)</span>
                </span>
                <span class="calc-accordion-right">
                    <span id="badge-labor" class="calc-opt-badge">Opzionale</span>
                    <i data-feather="chevron-down" class="calc-chevron"></i>
                </span>
            </button>
            <div id="panel-labor" class="calc-accordion-panel">
                <div class="calc-form-grid">
                    <div class="calc-field calc-field-full">
                        <span class="calc-label">Modalità calcolo manodopera</span>
                        <input type="hidden" name="laborMode" value="hourly">
                        <div class="calc-segmented" role="radiogroup" aria-label="Modalità manodopera" data-seg-name="laborMode">
                            <button type="button" class="calc-seg-btn active" role="radio" aria-checked="true" data-value="hourly" data-default="true">A Ore (€/h)</button>
                            <button type="button" class="calc-seg-btn" role="radio" aria-checked="false" data-value="flat">A Corpo (Forfait €)</button>
                        </div>
                    </div>
                    <div class="calc-field" data-show-when="laborMode=hourly">
                        <label class="calc-label" for="field-laborHours">Ore di lavoro previste</label>
                        <div class="calc-input-wrap">
                            <input type="text" id="field-laborHours" name="laborHours" inputmode="decimal" class="calc-input has-unit" placeholder="es. 8">
                            <span class="calc-input-unit">h</span>
                        </div>
                    </div>
                    <div class="calc-field" data-show-when="laborMode=hourly">
                        <label class="calc-label" for="field-laborHourlyRate">Tariffa oraria</label>
                        <div class="calc-input-wrap">
                            <input type="text" id="field-laborHourlyRate" name="laborHourlyRate" inputmode="decimal" class="calc-input has-unit" placeholder="es. 30,00">
                            <span class="calc-input-unit">€/h</span>
                        </div>
                    </div>
                    <div class="calc-field calc-field-full" data-show-when="laborMode=flat">
                        <label class="calc-label" for="field-laborFlatRate">Importo manodopera a corpo</label>
                        <div class="calc-input-wrap">
                            <input type="text" id="field-laborFlatRate" name="laborFlatRate" inputmode="decimal" class="calc-input has-unit" placeholder="es. 450,00">
                            <span class="calc-input-unit">€</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;

    return `
        <section id="calc-app" class="calc-glass-card" data-logic-key="${escapeHtml(calc.logicKey)}" data-utm-campaign="${escapeHtml(calc.utmCampaign)}" data-safety-disclaimer="${calc.calculatorBox.useSafetyDisclaimer ? 'true' : 'false'}">
            <div class="calc-card-header">
                <div class="calc-card-header-left">
                    <div class="calc-card-icon-badge">
                        <i data-feather="${escapeHtml(calc.icon)}"></i>
                    </div>
                    <div>
                        <h2>${escapeHtml(calc.calculatorBox.h2)}</h2>
                        <p class="calc-card-intro">${escapeHtml(calc.calculatorBox.intro)}</p>
                    </div>
                </div>
                <span class="calc-session-pill" title="Nessun dato salvato su cookie o memoria">
                    <i data-feather="lock"></i>
                    <span>Calcolo rapido • Senza salvataggio</span>
                </span>
            </div>

            <form id="calc-form" novalidate>
                <div class="calc-form-grid">
                    ${primaryHtml}
                </div>

                <div class="calc-accordions">
                    ${advancedHtml}
                    ${costsHtml}
                    ${extrasHtml}
                    ${laborHtml}
                </div>

                <div id="calc-error-banner" class="calc-error-banner" role="alert">
                    <i data-feather="alert-triangle"></i>
                    <span id="calc-error-text"></span>
                </div>

                <div class="calc-submit-row">
                    <button type="submit" class="calc-submit-btn">
                        <i data-feather="zap"></i>
                        <span>Calcola Fabbisogno e Costi</span>
                    </button>
                    <button type="button" id="calc-reset-btn" class="calc-reset-btn">
                        <i data-feather="refresh-cw"></i>
                        <span>Azzera</span>
                    </button>
                </div>

                <p class="calc-zero-persistence-note">
                    <i data-feather="info"></i>
                    <span>Calcolo istantaneo gratuito: nessun dato viene memorizzato o inviato. Ricaricando la pagina i campi tornano vuoti.</span>
                </p>
            </form>
        </section>`;
}

function buildSchemaGraph(calc, meta) {
    const canonicalUrl = `${SITE_URL}/${calc.slug}`;
    const anchorBase = `${canonicalUrl}#${calc.seo.howToAnchorId}`;

    const graph = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebApplication',
                '@id': `${canonicalUrl}#app`,
                name: calc.calculatorBox.h2,
                description: calc.seo.metaDescription,
                url: canonicalUrl,
                applicationCategory: 'UtilitiesApplication',
                operatingSystem: 'Web Browser, Android',
                inLanguage: 'it-IT',
                browserRequirements: 'Requires JavaScript',
                offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'EUR'
                },
                publisher: {
                    '@type': 'Organization',
                    name: 'Edil Calc',
                    url: SITE_URL,
                    logo: `${SITE_URL}/assets/logo.png`
                }
            },
            {
                '@type': 'TechArticle',
                '@id': `${canonicalUrl}#article`,
                headline: calc.hero.h1,
                description: calc.seo.metaDescription,
                inLanguage: 'it-IT',
                dateModified: meta.updatedAt,
                datePublished: meta.updatedAt,
                mainEntityOfPage: {
                    '@type': 'WebPage',
                    '@id': canonicalUrl
                },
                author: {
                    '@type': 'Organization',
                    name: 'Edil Calc'
                },
                publisher: {
                    '@type': 'Organization',
                    name: 'Edil Calc',
                    logo: {
                        '@type': 'ImageObject',
                        url: `${SITE_URL}/assets/logo.png`
                    }
                }
            },
            {
                '@type': 'HowTo',
                '@id': `${canonicalUrl}#howto`,
                name: calc.guide.h2,
                description: calc.guide.directAnswer,
                inLanguage: 'it-IT',
                tool: calc.guide.toolsAndDpi.map((t) => ({
                    '@type': 'HowToTool',
                    name: t
                })),
                step: calc.guide.steps.map((s, idx) => ({
                    '@type': 'HowToStep',
                    position: idx + 1,
                    name: s.title,
                    text: s.text,
                    url: `${anchorBase}-step-${idx + 1}`
                }))
            },
            {
                '@type': 'FAQPage',
                '@id': `${canonicalUrl}#faq`,
                mainEntity: calc.faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: f.answer
                    }
                }))
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${canonicalUrl}#breadcrumbs`,
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Home',
                        item: `${SITE_URL}/index.html`
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Calcolatori Online',
                        item: `${SITE_URL}/calcolatori.html`
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: calc.cardTitle,
                        item: canonicalUrl
                    }
                ]
            }
        ]
    };

    return JSON.stringify(graph, null, 2);
}

export function renderCalculatorPage(calc, data, calcBySlug) {
    const { meta, sharedAppConversion: shared } = data;
    const schemaJson = buildSchemaGraph(calc, meta);

    const headHtml = renderHead({
        title: calc.seo.title,
        metaDescription: calc.seo.metaDescription,
        ogTitle: calc.seo.ogTitle,
        ogDescription: calc.seo.ogDescription,
        canonicalPath: calc.slug,
        keywords: calc.seo.primaryKeywords,
        schemaGraphJson: schemaJson
    });

    const navbarHtml = renderNavbar(calc.utmCampaign, 'calcolatori');
    const formHtml = renderCalculatorForm(calc);

    const sidebarPlayHref = escapeHtml(playStoreUrl('sidebar_qr', calc.utmCampaign));
    const inlinePlayHref = escapeHtml(playStoreUrl('inline_guide_cta', calc.utmCampaign));

    const quickSpecsHtml = calc.guide.quickSpecs.map((q) => `
        <div class="calc-spec-item">
            <span class="calc-spec-label">${escapeHtml(q.label)}</span>
            <span class="calc-spec-val">${escapeHtml(q.value)}</span>
        </div>`).join('');

    const sidebarHtml = `
        <aside class="calc-sidebar">
            <div class="calc-side-card">
                <h3><i data-feather="list"></i><span>Indice Rapido Pagina</span></h3>
                <ul class="calc-toc-list">
                    <li><a href="#calc-app"><i data-feather="sliders"></i><span>Vai al Calcolatore Interattivo</span></a></li>
                    <li><a href="#${escapeHtml(calc.seo.howToAnchorId)}"><i data-feather="book-open"></i><span>${escapeHtml(calc.seo.howToAnchorLabel)}</span></a></li>
                    <li><a href="#specifiche-tecniche"><i data-feather="database"></i><span>Formule, Tabella &amp; Esempio</span></a></li>
                    <li><a href="#domande-frequenti"><i data-feather="info"></i><span>Domande Frequenti (FAQ)</span></a></li>
                </ul>
            </div>

            <div class="calc-side-card">
                <h3><i data-feather="check"></i><span>Parametri di Riferimento</span></h3>
                <div class="calc-specs-list">
                    ${quickSpecsHtml}
                </div>
            </div>

            <div class="calc-side-card calc-sidebar-app-card">
                <h3><i data-feather="download"></i><span>Salva e Stampa in PDF</span></h3>
                <p>I calcoli eseguiti online non vengono salvati. Con l'app Android gratuita organizzi ogni progetto per cantiere e stanza ed esporti preventivi PDF A4 ed Excel col tuo logo.</p>
                <div class="calc-qr-inline">
                    <img src="assets/qr-playstore.svg" alt="QR Code Download Edil Calc Google Play" width="68" height="68">
                    <span>Inquadra con la fotocamera Android per scaricare Edil Calc gratis.</span>
                </div>
                <a href="${sidebarPlayHref}" target="_blank" rel="noopener" class="calc-modal-play-btn" style="width:100%;">
                    <i data-feather="download"></i>
                    <span>App Android Gratuita</span>
                </a>
            </div>
        </aside>`;

    const anchorId = escapeHtml(calc.seo.howToAnchorId);
    const toolsHtml = calc.guide.toolsAndDpi.map((t) => `<li>${escapeHtml(t)}</li>`).join('');
    const prepHtml = calc.guide.preparation.map((p) => `<li>${escapeHtml(p)}</li>`).join('');
    const stepsHtml = calc.guide.steps.map((s, idx) => `
        <div id="${anchorId}-step-${idx + 1}" class="calc-step-card">
            <div class="calc-step-num">${idx + 1}</div>
            <div class="calc-step-body">
                <h4>${escapeHtml(s.title)}</h4>
                <p>${escapeHtml(s.text)}</p>
            </div>
        </div>`).join('');

    const mistakesHtml = calc.guide.commonMistakes.map((m) => `
        <div class="calc-mistake-card">
            <h4>${escapeHtml(m.title)}</h4>
            <p>${escapeHtml(m.text)}</p>
        </div>`).join('');

    const guideHtml = `
        <section id="${anchorId}" class="calc-guide-block">
            <h2>${escapeHtml(calc.guide.h2)}</h2>
            <div class="calc-direct-answer">
                ${escapeHtml(calc.guide.directAnswer)}
            </div>

            <h3>Attrezzi, Materiali e DPI Consigliati</h3>
            <ul class="calc-tools-grid">
                ${toolsHtml}
            </ul>

            <h3>Preparazione Prima di Iniziare</h3>
            <ol class="calc-prep-list">
                ${prepHtml}
            </ol>

            <h3>Procedura Operativa Passo Passo</h3>
            <div class="calc-steps-list">
                ${stepsHtml}
            </div>

            <div class="calc-bridge-box">
                <p>${escapeHtml(calc.guide.calculatorBridgeText)}</p>
                <a href="#calc-app" class="calc-bridge-link">Torna al Calcolatore &uarr;</a>
            </div>

            <h3>Errori Comuni da Evitare</h3>
            <div class="calc-mistakes-grid">
                ${mistakesHtml}
            </div>

            <div class="calc-boomer-box" style="margin-bottom:0;">
                <picture>
                    <source srcset="assets/boomer.webp" type="image/webp">
                    <img src="assets/boomer.jpg" alt="Boomer, il capocantiere mascotte di Edil Calc" width="46" height="46" loading="lazy">
                </picture>
                <div>
                    <span class="calc-boomer-tag">${escapeHtml(calc.guide.boomerTip.tag)}</span>
                    <p>${escapeHtml(calc.guide.boomerTip.quote)}</p>
                </div>
            </div>
        </section>`;

    const formulasHtml = calc.technical.formulas.map((f) => `<code class="guide-formula-code">${escapeHtml(f)}</code>`).join('');
    const headersHtml = calc.technical.tableHeaders.map((h) => `<th>${escapeHtml(h)}</th>`).join('');
    const rowsHtml = calc.technical.tableRows.map((row) =>
        `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`
    ).join('');
    const exampleBulletsHtml = calc.technical.exampleBullets.map((b) => `<li>${escapeHtml(b)}</li>`).join('');
    const svgHtml = renderDiagram(calc.technical.diagramId);

    const technicalHtml = `
        <section id="specifiche-tecniche" class="calc-guide-block">
            <h2>${escapeHtml(calc.technical.h2)}</h2>

            <div class="guide-formula-box">
                <h3>${escapeHtml(calc.technical.formulaBoxTitle)}</h3>
                ${formulasHtml}
                <p style="margin-top:0.75rem;margin-bottom:0;">${escapeHtml(calc.technical.formulaNote)}</p>
            </div>

            <h3>${escapeHtml(calc.technical.tableTitle)}</h3>
            <div class="guide-table-wrap">
                <table class="guide-table">
                    <thead><tr>${headersHtml}</tr></thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>

            <div class="calc-diagram-wrap">
                <div class="calc-diagram-caption">
                    <i data-feather="layers" style="width:15px;height:15px;"></i>
                    <span>Schema Tecnico di Posa &amp; Dimensionamento</span>
                </div>
                ${svgHtml}
            </div>

            <div class="calc-example-box">
                <h3 style="margin-top:0;">${escapeHtml(calc.technical.exampleTitle)}</h3>
                <p>${escapeHtml(calc.technical.exampleIntro)}</p>
                <ul>${exampleBulletsHtml}</ul>
            </div>
        </section>`;

    const faqsHtml = calc.faqs.map((faq, idx) => `
        <div class="faq-item${idx === 0 ? ' active' : ''}">
            <div class="faq-question">
                <h4>${escapeHtml(faq.question)}</h4>
                <i data-feather="chevron-down"></i>
            </div>
            <div class="faq-answer">
                <p>${escapeHtml(faq.answer)}</p>
            </div>
        </div>`).join('');

    const faqSectionHtml = `
        <section id="domande-frequenti" class="calc-guide-block">
            <h2>Domande Frequenti (${escapeHtml(calc.cardTitle)})</h2>
            <div class="faq-list">
                ${faqsHtml}
            </div>
        </section>`;

    const inlineCtaHtml = `
        <section class="guide-inline-cta" style="margin:0;">
            <div>
                <h3>${escapeHtml(calc.inlineAppCta.title)}</h3>
                <p>${escapeHtml(calc.inlineAppCta.text)}</p>
            </div>
            <a href="${inlinePlayHref}" target="_blank" rel="noopener" class="btn btn-primary">
                <i data-feather="download"></i>
                <span>${escapeHtml(calc.inlineAppCta.buttonText)}</span>
            </a>
        </section>`;

    const relatedCardsHtml = calc.relatedSlugs
        .map((relSlug) => calcBySlug[relSlug])
        .filter(Boolean)
        .map((rel) => `
            <a href="${escapeHtml(rel.slug)}" class="calc-related-card">
                <span class="calc-related-cat">${escapeHtml(rel.categoryLabel)}</span>
                <h4>${escapeHtml(rel.cardTitle)}</h4>
                <p>${escapeHtml(rel.cardDesc)}</p>
                <span class="calc-related-link">${escapeHtml(rel.cardLinkText)} &rarr;</span>
            </a>`).join('');

    const relatedSectionHtml = `
        <section class="calc-guide-block">
            <h2>Calcolatori e Guide Correlate</h2>
            <div class="calc-related-grid">
                ${relatedCardsHtml}
            </div>
        </section>`;

    const bodyHtml = `
<body>
${navbarHtml}

    <main class="calc-page-main">
        <div class="container">
            <nav class="calc-breadcrumbs" aria-label="Breadcrumb">
                <a href="index.html">Home</a>
                <span class="crumb-sep">&rsaquo;</span>
                <a href="calcolatori.html">Calcolatori Online</a>
                <span class="crumb-sep">&rsaquo;</span>
                <span class="crumb-current">${escapeHtml(calc.cardTitle)}</span>
            </nav>

            <header class="calc-hero-compact">
                <div class="calc-hero-text">
                    <div class="calc-eyebrow-row">
                        <span class="calc-eyebrow-pill">
                            <i data-feather="${escapeHtml(calc.icon)}"></i>
                            <span>${escapeHtml(calc.hero.eyebrow)}</span>
                        </span>
                        <span class="calc-hero-badge">${escapeHtml(calc.hero.badge)}</span>
                    </div>
                    <h1>${escapeHtml(calc.hero.h1)}</h1>
                    <p class="calc-hero-subtitle">${escapeHtml(calc.hero.subtitle)}</p>
                </div>
                <div class="calc-hero-actions">
                    <a href="#${anchorId}" class="calc-jump-guide-btn">
                        <i data-feather="book-open"></i>
                        <span>${escapeHtml(calc.seo.howToAnchorLabel)}</span>
                    </a>
                </div>
            </header>

            <div class="calc-workspace">
                ${formHtml}
                ${sidebarHtml}
            </div>

            <article class="calc-guide-article">
                ${guideHtml}
                ${technicalHtml}
                ${faqSectionHtml}
                ${inlineCtaHtml}
                ${relatedSectionHtml}
            </article>
        </div>
    </main>

${renderResultModal({ calc, shared })}
${renderFooter(calc.utmCampaign)}
${renderScripts({ includeCalculator: true })}
`;

    return `${headHtml}\n${bodyHtml}`;
}
