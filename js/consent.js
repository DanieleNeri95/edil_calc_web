/**
 * Edil Calc Web — Gestione Consenso Cookie e Risorse Terze Parti (GDPR / ePrivacy)
 * Nessuna libreria esterna. Blocco preventivo reale delle risorse non essenziali.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'edilcalc_consent_v1';
    var CONSENT_VERSION = 1;
    var GOOGLE_FONTS_HREF = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&family=Outfit:wght@600;700;800;900&display=swap';

    // Fallback in-memory se localStorage non e' disponibile
    var memoryConsent = null;
    var lastTriggerElement = null;

    function readConsent() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return memoryConsent;
            var parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== 'object') return null;
            if (parsed.version !== CONSENT_VERSION) return null;
            if (!parsed.categories || typeof parsed.categories !== 'object') return null;
            return parsed;
        } catch (e) {
            return memoryConsent;
        }
    }

    function saveConsent(externalFontsAllowed) {
        var payload = {
            version: CONSENT_VERSION,
            timestamp: new Date().toISOString(),
            categories: {
                necessary: true,
                external_fonts: Boolean(externalFontsAllowed)
            }
        };
        memoryConsent = payload;
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            // Se localStorage e' bloccato o pieno, usiamo memoryConsent senza bloccare il sito
        }
        applyConsent(payload);
        return payload;
    }

    function loadExternalFonts() {
        if (!document.head) return;
        if (!document.getElementById('edilcalc-gf-preconnect-1')) {
            var pc1 = document.createElement('link');
            pc1.id = 'edilcalc-gf-preconnect-1';
            pc1.rel = 'preconnect';
            pc1.href = 'https://fonts.googleapis.com';
            pc1.setAttribute('data-consent-managed', 'external_fonts');
            document.head.appendChild(pc1);
        }
        if (!document.getElementById('edilcalc-gf-preconnect-2')) {
            var pc2 = document.createElement('link');
            pc2.id = 'edilcalc-gf-preconnect-2';
            pc2.rel = 'preconnect';
            pc2.href = 'https://fonts.gstatic.com';
            pc2.crossOrigin = 'anonymous';
            pc2.setAttribute('data-consent-managed', 'external_fonts');
            document.head.appendChild(pc2);
        }
        if (!document.getElementById('edilcalc-gf-stylesheet')) {
            var link = document.createElement('link');
            link.id = 'edilcalc-gf-stylesheet';
            link.rel = 'stylesheet';
            link.href = GOOGLE_FONTS_HREF;
            link.setAttribute('data-consent-managed', 'external_fonts');
            document.head.appendChild(link);
        }
        document.documentElement.classList.add('external-fonts-loaded');
    }

    function removeExternalFonts() {
        var nodes = document.querySelectorAll('[data-consent-managed="external_fonts"]');
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i] && nodes[i].parentNode) {
                nodes[i].parentNode.removeChild(nodes[i]);
            }
        }
        document.documentElement.classList.remove('external-fonts-loaded');
    }

    function applyConsent(consentObj) {
        if (consentObj && consentObj.categories && consentObj.categories.external_fonts === true) {
            loadExternalFonts();
        } else {
            removeExternalFonts();
        }
    }

    // Applica subito se il consenso esiste gia' prima del DOMContentLoaded
    var initialConsent = readConsent();
    if (initialConsent) {
        applyConsent(initialConsent);
    }

    function buildBannerDOM() {
        if (document.getElementById('edilcalc-cookie-banner')) {
            return document.getElementById('edilcalc-cookie-banner');
        }

        var wrapper = document.createElement('div');
        wrapper.id = 'edilcalc-cookie-banner';
        wrapper.className = 'cookie-banner';
        wrapper.setAttribute('role', 'dialog');
        wrapper.setAttribute('aria-modal', 'false');
        wrapper.setAttribute('aria-label', 'Preferenze cookie e risorse di terze parti');
        wrapper.setAttribute('aria-describedby', 'cookie-banner-desc');
        wrapper.setAttribute('hidden', 'hidden');

        wrapper.innerHTML = [
            '<div class="cookie-banner-inner container">',
            '  <div class="cookie-banner-main">',
            '    <div class="cookie-banner-text">',
            '      <div class="cookie-banner-title-row">',
            '        <span class="cookie-badge">Privacy &amp; Cookie</span>',
            '        <h2 class="cookie-banner-title" id="cookie-banner-title">Rispettiamo la tua privacy</h2>',
            '      </div>',
            '      <p class="cookie-banner-desc" id="cookie-banner-desc">',
            '        Questo sito non usa cookie di profilazione o tracciamento pubblicitario. Utilizziamo solo archiviazione tecnica locale (<code>localStorage</code>) per ricordare la tua scelta e, solo con il tuo consenso, carichiamo i caratteri tipografici <strong>Google Fonts</strong> dai server di Google. Se rifiuti, il sito funziona comunque al 100% con i font di sistema. Leggi la <a href="privacy.html#cookie-policy">Privacy e Cookie Policy</a>.',
            '      </p>',
            '    </div>',
            '    <div class="cookie-banner-actions" role="group" aria-label="Azioni consenso">',
            '      <button type="button" id="cookie-btn-accept" class="btn-cookie-action">Accetta tutti</button>',
            '      <button type="button" id="cookie-btn-reject" class="btn-cookie-action">Rifiuta tutti</button>',
            '      <button type="button" id="cookie-btn-customize" class="btn-cookie-action" aria-expanded="false" aria-controls="cookie-customize-panel">Personalizza</button>',
            '    </div>',
            '  </div>',
            '  <div id="cookie-customize-panel" class="cookie-customize-panel" hidden>',
            '    <div class="cookie-categories-grid">',
            '      <div class="cookie-category-card">',
            '        <div class="cookie-category-header">',
            '          <div>',
            '            <h3 class="cookie-category-title">Necessari (Tecnici)</h3>',
            '            <span class="cookie-status-pill always-on">Sempre attivi</span>',
            '          </div>',
            '          <label class="cookie-switch" aria-label="Cookie tecnici necessari sempre attivi">',
            '            <input type="checkbox" checked disabled>',
            '            <span class="cookie-slider"></span>',
            '          </label>',
            '        </div>',
            '        <p class="cookie-category-desc">',
            '          Indispensabili per il funzionamento del sito e per salvare in locale sul tuo browser (chiave <code>edilcalc_consent_v1</code> in <code>localStorage</code>) la tua preferenza di consenso. Non inviano alcun dato all\'esterno.',
            '        </p>',
            '      </div>',
            '      <div class="cookie-category-card">',
            '        <div class="cookie-category-header">',
            '          <div>',
            '            <h3 class="cookie-category-title" id="label-ext-fonts">Servizi esterni e Font di terze parti (Google Fonts)</h3>',
            '            <span class="cookie-status-pill" id="ext-fonts-status-pill">Disattivati di default</span>',
            '          </div>',
            '          <label class="cookie-switch" for="cookie-toggle-fonts">',
            '            <input type="checkbox" id="cookie-toggle-fonts" aria-labelledby="label-ext-fonts">',
            '            <span class="cookie-slider"></span>',
            '          </label>',
            '        </div>',
            '        <p class="cookie-category-desc">',
            '          Consente il caricamento dei font <em>Outfit</em>, <em>Inter</em> e <em>JetBrains Mono</em> da <code>fonts.googleapis.com</code> e <code>fonts.gstatic.com</code> (Google LLC), comportando la trasmissione tecnica dell\'indirizzo IP a Google. Se disattivato, vengono usati i font di sistema del dispositivo.',
            '        </p>',
            '      </div>',
            '    </div>',
            '    <div class="cookie-panel-footer">',
            '      <button type="button" id="cookie-btn-save" class="btn-cookie-action">Salva preferenze</button>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('\n');

        document.body.appendChild(wrapper);
        return wrapper;
    }

    function updateStatusPill(checked) {
        var pill = document.getElementById('ext-fonts-status-pill');
        if (!pill) return;
        if (checked) {
            pill.textContent = 'Attivi';
            pill.classList.add('active-pill');
        } else {
            pill.textContent = 'Disattivati';
            pill.classList.remove('active-pill');
        }
    }

    function showBanner(openCustomize, triggerEl) {
        var banner = buildBannerDOM();
        if (triggerEl) {
            lastTriggerElement = triggerEl;
        }
        var current = readConsent();
        var toggle = document.getElementById('cookie-toggle-fonts');
        var panel = document.getElementById('cookie-customize-panel');
        var customizeBtn = document.getElementById('cookie-btn-customize');

        var fontsEnabled = current && current.categories ? Boolean(current.categories.external_fonts) : false;
        if (toggle) {
            toggle.checked = fontsEnabled;
            updateStatusPill(fontsEnabled);
        }

        if (openCustomize && panel && customizeBtn) {
            panel.removeAttribute('hidden');
            customizeBtn.setAttribute('aria-expanded', 'true');
            banner.setAttribute('aria-modal', 'true');
        } else if (panel && customizeBtn) {
            panel.setAttribute('hidden', 'hidden');
            customizeBtn.setAttribute('aria-expanded', 'false');
            banner.setAttribute('aria-modal', 'false');
        }

        banner.removeAttribute('hidden');
        banner.classList.add('is-open');

        setTimeout(function () {
            if (openCustomize && toggle) {
                toggle.focus();
            } else {
                var firstBtn = document.getElementById('cookie-btn-accept');
                if (firstBtn) firstBtn.focus();
            }
        }, 30);
    }

    function hideBanner() {
        var banner = document.getElementById('edilcalc-cookie-banner');
        if (!banner) return;
        banner.classList.remove('is-open');
        banner.setAttribute('hidden', 'hidden');
        banner.setAttribute('aria-modal', 'false');
        if (lastTriggerElement && typeof lastTriggerElement.focus === 'function') {
            lastTriggerElement.focus();
            lastTriggerElement = null;
        }
    }

    function setupCookieConsent() {
        var banner = buildBannerDOM();
        var acceptBtn = document.getElementById('cookie-btn-accept');
        var rejectBtn = document.getElementById('cookie-btn-reject');
        var customizeBtn = document.getElementById('cookie-btn-customize');
        var saveBtn = document.getElementById('cookie-btn-save');
        var toggleFonts = document.getElementById('cookie-toggle-fonts');
        var panel = document.getElementById('cookie-customize-panel');

        if (toggleFonts) {
            toggleFonts.addEventListener('change', function () {
                updateStatusPill(toggleFonts.checked);
            });
        }

        if (acceptBtn) {
            acceptBtn.addEventListener('click', function () {
                saveConsent(true);
                hideBanner();
            });
        }

        if (rejectBtn) {
            rejectBtn.addEventListener('click', function () {
                saveConsent(false);
                hideBanner();
            });
        }

        if (customizeBtn && panel) {
            customizeBtn.addEventListener('click', function () {
                var isHidden = panel.hasAttribute('hidden');
                if (isHidden) {
                    panel.removeAttribute('hidden');
                    customizeBtn.setAttribute('aria-expanded', 'true');
                    banner.setAttribute('aria-modal', 'true');
                    if (toggleFonts) toggleFonts.focus();
                } else {
                    panel.setAttribute('hidden', 'hidden');
                    customizeBtn.setAttribute('aria-expanded', 'false');
                    banner.setAttribute('aria-modal', 'false');
                }
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', function () {
                var allowed = toggleFonts ? Boolean(toggleFonts.checked) : false;
                saveConsent(allowed);
                hideBanner();
            });
        }

        // Gestione tasto Esc e Focus Trap: Esc NON accetta mai i cookie
        document.addEventListener('keydown', function (e) {
            if (!banner || banner.hasAttribute('hidden')) return;

            if (e.key === 'Escape' || e.key === 'Esc') {
                // Se il pannello personalizza e' aperto, lo chiude; se l'utente aveva gia' scelto in precedenza, chiude il banner senza modificare la scelta
                if (panel && !panel.hasAttribute('hidden')) {
                    e.preventDefault();
                    panel.setAttribute('hidden', 'hidden');
                    if (customizeBtn) {
                        customizeBtn.setAttribute('aria-expanded', 'false');
                        customizeBtn.focus();
                    }
                    banner.setAttribute('aria-modal', 'false');
                } else if (readConsent() !== null) {
                    e.preventDefault();
                    hideBanner();
                }
                return;
            }

            if (e.key === 'Tab') {
                var focusables = banner.querySelectorAll('a[href], button:not([disabled]), input:not([disabled])');
                var visibleFocusables = [];
                for (var i = 0; i < focusables.length; i++) {
                    if (focusables[i].offsetParent !== null) {
                        visibleFocusables.push(focusables[i]);
                    }
                }
                if (visibleFocusables.length === 0) return;
                var first = visibleFocusables[0];
                var last = visibleFocusables[visibleFocusables.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });

        // Collega tutti i pulsanti/link "Gestisci cookie" nel footer o nella pagina
        var manageTriggers = document.querySelectorAll('[data-open-cookie-settings]');
        for (var i = 0; i < manageTriggers.length; i++) {
            manageTriggers[i].addEventListener('click', function (e) {
                e.preventDefault();
                showBanner(true, e.currentTarget);
            });
        }

        // Mostra il banner al primo accesso se non esiste una scelta salvata valida
        var existing = readConsent();
        if (!existing) {
            showBanner(false, null);
        } else {
            applyConsent(existing);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupCookieConsent);
    } else {
        setupCookieConsent();
    }

    // Esponi API minimale per apertura programmatica
    window.EdilCalcConsent = {
        openSettings: function (triggerEl) {
            showBanner(true, triggerEl || null);
        },
        getConsent: readConsent
    };
})();
