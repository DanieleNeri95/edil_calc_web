// Shared HTML partials for Edil Calc Web static generator

export const SITE_URL = 'https://www.edilcalc.com';
export const PLAY_STORE_BASE = 'https://play.google.com/store/apps/details?id=com.daniele.edilcalc';

export function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export function playStoreUrl(medium, campaign) {
    const ref = `utm_source=edilcalc_web&utm_medium=${medium}&utm_campaign=${campaign}`;
    return `${PLAY_STORE_BASE}&referrer=${encodeURIComponent(ref)}`;
}

export function renderHead({
    title,
    metaDescription,
    ogTitle,
    ogDescription,
    canonicalPath,
    keywords = [],
    schemaGraphJson,
    extraCss = ['css/calculator.css']
}) {
    const canonicalUrl = `${SITE_URL}/${canonicalPath}`;
    const cssLinks = ['css/style.css', ...extraCss]
        .map((href) => `    <link rel="stylesheet" href="${escapeHtml(href)}">`)
        .join('\n');

    const keywordsTag = keywords.length
        ? `\n    <meta name="keywords" content="${escapeHtml(keywords.join(', '))}">`
        : '';

    return `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(metaDescription)}">${keywordsTag}
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}">

    <meta property="og:title" content="${escapeHtml(ogTitle || title)}">
    <meta property="og:description" content="${escapeHtml(ogDescription || metaDescription)}">
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
    <meta property="og:site_name" content="Edil Calc">
    <meta property="og:locale" content="it_IT">
    <meta property="og:image" content="${SITE_URL}/assets/logo.png">
    <meta property="og:type" content="website">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(ogTitle || title)}">
    <meta name="twitter:description" content="${escapeHtml(ogDescription || metaDescription)}">
    <meta name="twitter:image" content="${SITE_URL}/assets/logo.png">

    <link rel="icon" href="assets/logo.png" type="image/png">
    <title>${escapeHtml(title)}</title>
${cssLinks}
    <script src="js/feather.min.js"></script>
    <script src="js/consent.js" defer></script>
    <script type="application/ld+json">
${schemaGraphJson}
    </script>
</head>`;
}

export function renderNavbar(campaign, activeSection = 'calcolatori') {
    const navPlayHref = escapeHtml(playStoreUrl('navbar_cta', campaign));
    return `    <!-- NAVBAR -->
    <nav class="navbar">
        <div class="container nav-container">
            <a href="index.html" class="brand-link">
                <img src="assets/logo.png" alt="Logo Edil Calc" class="nav-logo" width="44" height="44">
                <picture>
                    <source srcset="assets/boomer.webp" type="image/webp">
                    <img src="assets/boomer.jpg" alt="Boomer, il capocantiere mascotte di Edil Calc" class="nav-boomer-avatar" width="38" height="38">
                </picture>
                <div class="brand-text">
                    <span class="brand-name">EDIL CALC</span>
                    <span class="brand-tag">Cantiere &amp; Preventivi</span>
                </div>
            </a>

            <ul class="nav-links">
                <li><a href="index.html#features">Vantaggi</a></li>
                <li><a href="calcolatori.html"${activeSection === 'calcolatori' ? ' class="active"' : ''}>Calcolatori Online</a></li>
                <li><a href="index.html#how-it-works">Come Funziona</a></li>
                <li><a href="index.html#azienda">Preventivi PDF</a></li>
                <li><a href="index.html#boomer">Boomer</a></li>
                <li><a href="faq.html">FAQ</a></li>
            </ul>

            <div class="nav-actions">
                <a href="${navPlayHref}" target="_blank" rel="noopener" class="btn btn-primary">
                    <i data-feather="download"></i>
                    <span>Scarica Gratis</span>
                </a>
                <button class="mobile-menu-toggle" aria-label="Apri menu" aria-expanded="false">
                    <i data-feather="menu"></i>
                </button>
            </div>
        </div>
    </nav>`;
}

export function renderFooter(campaign) {
    const storeUrl = escapeHtml(playStoreUrl('footer_store', campaign));
    const stickyUrl = escapeHtml(playStoreUrl('mobile_sticky', campaign));

    return `    <!-- FOOTER -->
    <footer>
        <div class="container footer-container">
            <div class="footer-brand">
                <a href="index.html" class="brand-link">
                    <img src="assets/logo.png" alt="Logo Edil Calc" class="nav-logo" width="44" height="44" loading="lazy">
                    <picture>
                        <source srcset="assets/boomer.webp" type="image/webp">
                        <img src="assets/boomer.jpg" alt="Boomer, il capocantiere mascotte di Edil Calc" class="nav-boomer-avatar" width="38" height="38" loading="lazy">
                    </picture>
                    <div class="brand-text">
                        <span class="brand-name">EDIL CALC</span>
                        <span class="brand-tag">Cantiere &amp; Preventivi</span>
                    </div>
                </a>
                <p>La suite gratuita con 21 calcolatori edili, gestione cantieri multi-stanza offline e preventivi professionali PDF A4 ed Excel col tuo logo.</p>
                <div class="footer-guides-box">
                    <span class="footer-guides-title">Calcolatori Online e Guide Pratiche:</span>
                    <div class="footer-guides-links">
                        <a href="calcolatori.html">Tutti i 21 Calcolatori</a>
                        <a href="calcolo-massetto-cemento.html">Calcolo Sacchi Massetto</a>
                        <a href="calcolo-cartongesso.html">Calcolo Cartongesso al mq</a>
                        <a href="calcolo-piastrelle.html">Calcolo Piastrelle e Colla</a>
                        <a href="calcolo-pittura.html">Calcolo Litri Pittura</a>
                        <a href="calcolo-scale-blondel.html">Calcolo Scale (Blondel)</a>
                        <a href="calcolo-intonaco.html">Calcolo Intonaco</a>
                        <a href="calcolo-sezione-cavi-elettrici.html">Sezione Cavi Elettrici</a>
                    </div>
                </div>
            </div>

            <div class="footer-links">
                <h4>Navigazione</h4>
                <ul>
                    <li><a href="calcolatori.html">Tutti i 21 Calcolatori Online</a></li>
                    <li><a href="index.html#features">Vantaggi Principali</a></li>
                    <li><a href="index.html#how-it-works">Come Funziona</a></li>
                    <li><a href="index.html#azienda">Preventivi PDF &amp; Brand</a></li>
                    <li><a href="index.html#boomer">Boomer, il Capocantiere</a></li>
                    <li><a href="faq.html">Domande Frequenti (FAQ)</a></li>
                </ul>
            </div>

            <div class="footer-contact">
                <h4>Informazioni Legali &amp; Store</h4>
                <div class="contact-list">
                    <a href="${storeUrl}" target="_blank" rel="noopener" class="contact-link">
                        <i data-feather="shopping-bag"></i>
                        <span>Scheda Ufficiale Google Play</span>
                    </a>
                    <a href="privacy.html" class="contact-link">
                        <i data-feather="shield"></i>
                        <span>Privacy Policy (GDPR)</span>
                    </a>
                    <a href="terms.html" class="contact-link">
                        <i data-feather="file-text"></i>
                        <span>Termini di Servizio</span>
                    </a>
                    <a href="#gestisci-cookie" data-open-cookie-settings class="contact-link">
                        <i data-feather="sliders"></i>
                        <span>Gestisci cookie</span>
                    </a>
                    <a href="mailto:support@edilcalc.com" class="contact-link">
                        <i data-feather="life-buoy"></i>
                        <span>support@edilcalc.com</span>
                    </a>
                    <a href="mailto:info@edilcalc.com" class="contact-link">
                        <i data-feather="mail"></i>
                        <span>info@edilcalc.com</span>
                    </a>
                </div>
            </div>
        </div>

        <div class="container footer-bottom">
            <p>&copy; 2026 Edil Calc. Tutti i diritti riservati.</p>
            <div class="footer-bottom-links">
                <a href="calcolatori.html">Calcolatori</a>
                <a href="privacy.html">Privacy Policy</a>
                <a href="terms.html">Termini di Servizio</a>
                <button type="button" class="footer-cookie-btn" data-open-cookie-settings>Gestisci cookie</button>
            </div>
        </div>
    </footer>

    <!-- MOBILE STICKY CTA BAR -->
    <div id="mobile-sticky-cta" class="mobile-sticky-cta">
        <div class="mobile-sticky-info">
            <img src="assets/logo.png" alt="Edil Calc Logo" class="mobile-sticky-logo" width="36" height="36" loading="lazy">
            <div class="mobile-sticky-text">
                <strong>Edil Calc App</strong>
                <span>Salva cantieri &amp; PDF gratis</span>
            </div>
        </div>
        <a href="${stickyUrl}" target="_blank" rel="noopener" class="mobile-sticky-btn">Scarica App</a>
    </div>`;
}

export function renderResultModal({ calc, shared }) {
    const playHref = escapeHtml(playStoreUrl('modal_result', calc.utmCampaign));
    const lockedButtonsHtml = (shared.lockedActions || []).map((act) => `
        <button type="button" class="calc-locked-btn" data-feature-label="${escapeHtml(act.label)}" data-feature-pitch="${escapeHtml(act.pitch)}">
            <span class="calc-locked-icon"><i data-feather="${escapeHtml(act.icon)}"></i></span>
            <span class="calc-locked-text">
                <strong>${escapeHtml(act.label)}</strong>
                <span>Solo nell'app Android</span>
            </span>
        </button>`).join('');

    const boomerNote = calc.calculatorBox.resultBoomerNote || shared.resultModalBoomerQuote;
    const safetyText = calc.calculatorBox.useSafetyDisclaimer
        ? shared.disclaimerSafetyMep
        : shared.disclaimerDefault;

    return `    <!-- RESULT MODAL (Read-Only + App Conversion) -->
    <div id="calc-result-modal" class="calc-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="result-modal-title" aria-hidden="true">
        <div class="calc-modal-dialog">
            <div class="calc-modal-header">
                <h3 id="result-modal-title">
                    <i data-feather="check"></i>
                    <span>Risultato del Calcolo</span>
                </h3>
                <button type="button" class="calc-modal-close" data-close-modal aria-label="Chiudi risultato e modifica dati">
                    <i data-feather="x"></i>
                </button>
            </div>

            <div id="modal-comfort-badge" class="calc-comfort-badge" style="display:none;"></div>

            <div id="modal-safety-banner" class="calc-safety-banner" style="display:${calc.calculatorBox.useSafetyDisclaimer ? 'flex' : 'none'};">
                <i data-feather="alert-triangle"></i>
                <span>${escapeHtml(safetyText)}</span>
            </div>

            <div class="calc-hero-result-box">
                <div id="modal-hero-label" class="calc-hero-result-label">Fabbisogno stimato</div>
                <div id="modal-hero-value" class="calc-hero-result-value">-</div>
                <div id="modal-hero-sub" class="calc-hero-result-sub"></div>
            </div>

            <div id="modal-details-grid" class="calc-details-grid"></div>

            <div id="modal-cost-summary" class="calc-cost-summary" style="display:none;"></div>

            <div class="calc-conversion-panel">
                <h4 class="calc-conversion-headline">Vuoi salvare questo calcolo o preparare il preventivo?</h4>
                <p class="calc-conversion-sub">Questo risultato è una stima rapida non salvata. Scarica gratis l'app Android Edil Calc per archiviarlo nei tuoi cantieri e sbloccare tutte le funzioni:</p>

                <div class="calc-locked-grid">
                    ${lockedButtonsHtml}
                </div>

                <div id="calc-locked-feedback" class="calc-locked-feedback" role="status" aria-live="polite"></div>

                <div class="calc-boomer-box">
                    <picture>
                        <source srcset="assets/boomer.webp" type="image/webp">
                        <img src="assets/boomer.jpg" alt="Boomer, il capocantiere mascotte di Edil Calc" width="46" height="46" loading="lazy">
                    </picture>
                    <div>
                        <span class="calc-boomer-tag">${escapeHtml(shared.resultModalBoomerTag)}</span>
                        <p>${escapeHtml(boomerNote)}</p>
                    </div>
                </div>

                <div class="calc-modal-cta-row">
                    <a href="${playHref}" target="_blank" rel="noopener" class="calc-modal-play-btn">
                        <i data-feather="download"></i>
                        <span>Scarica Edil Calc Gratis (Google Play)</span>
                    </a>
                    <div class="calc-modal-qr">
                        <img src="assets/qr-playstore.svg" alt="QR Code Download Edil Calc Google Play" width="48" height="48" loading="lazy">
                        <span>Inquadra con Android</span>
                    </div>
                </div>
            </div>

            <div class="calc-modal-footer-actions">
                <button type="button" class="calc-modal-edit-btn" data-close-modal>
                    &larr; Modifica dati e ricalcola
                </button>
            </div>
        </div>
    </div>`;
}

export function renderScripts({ includeCalculator = true } = {}) {
    const calcScripts = includeCalculator
        ? `    <script src="js/calculators-logic.js" defer></script>\n    <script src="js/calculator-ui.js" defer></script>\n`
        : '';

    return `${calcScripts}    <script src="js/main.js" defer></script>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        if (window.feather) { window.feather.replace(); }
      });
    </script>
</body>
</html>`;
}
