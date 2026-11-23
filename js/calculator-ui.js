/**
 * Edil Calc Web — Interactive Calculator UI & ResultModal Controller
 * Zero persistence by design: no localStorage, sessionStorage, or cookies.
 */
(function () {
    'use strict';

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function initCalculator() {
        var root = document.getElementById('calc-app');
        if (!root || !window.EdilCalcLogic) return;

        var Logic = window.EdilCalcLogic;
        var form = document.getElementById('calc-form');
        if (!form) return;

        var logicKey = root.getAttribute('data-logic-key') || '';
        var useSafetyDisclaimer = root.getAttribute('data-safety-disclaimer') === 'true';

        var extraItems = [];
        var wasteUserEdited = false;

        var errorBanner = document.getElementById('calc-error-banner');
        var errorText = document.getElementById('calc-error-text');
        var modalBackdrop = document.getElementById('calc-result-modal');
        var lastFocusedElement = null;

        function refreshIcons() {
            if (window.feather && typeof window.feather.replace === 'function') {
                window.feather.replace();
            }
        }

        function getFieldValue(name) {
            var els = form.querySelectorAll('[name="' + name + '"]');
            if (!els.length) return '';
            var el = els[0];
            if (el.type === 'checkbox') {
                return el.checked ? 'true' : 'false';
            }
            return el.value;
        }

        function isElementVisible(el) {
            if (!el) return false;
            var node = el;
            while (node && node !== form) {
                if (node.classList && node.classList.contains('calc-field-hidden')) {
                    return false;
                }
                node = node.parentElement;
            }
            return true;
        }

        function updateVisibility() {
            var targets = form.querySelectorAll('[data-show-when]');
            targets.forEach(function (el) {
                var rule = el.getAttribute('data-show-when');
                if (!rule) return;
                var eqIdx = rule.indexOf('=');
                if (eqIdx === -1) return;
                var field = rule.slice(0, eqIdx).trim();
                var allowed = rule.slice(eqIdx + 1).split(',').map(function (s) {
                    return s.trim();
                });
                var current = getFieldValue(field);
                var match = allowed.indexOf(current) !== -1;
                el.classList.toggle('calc-field-hidden', !match);
            });
        }

        function showError(msg, focusEl) {
            if (errorBanner && errorText) {
                errorText.textContent = msg;
                errorBanner.classList.add('is-visible');
            }
            if (focusEl) {
                focusEl.setAttribute('aria-invalid', 'true');
                try {
                    focusEl.focus({ preventScroll: false });
                } catch (e) {
                    focusEl.focus();
                }
            }
        }

        function clearErrors() {
            if (errorBanner) errorBanner.classList.remove('is-visible');
            form.querySelectorAll('[aria-invalid="true"]').forEach(function (el) {
                el.removeAttribute('aria-invalid');
            });
        }

        // 1. Segmented controls (including laborMode and calculator toggles)
        form.querySelectorAll('.calc-segmented').forEach(function (group) {
            var targetName = group.getAttribute('data-seg-name');
            var hiddenInput = targetName ? form.querySelector('input[type="hidden"][name="' + targetName + '"]') : null;
            var buttons = group.querySelectorAll('.calc-seg-btn');

            buttons.forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var val = btn.getAttribute('data-value');
                    buttons.forEach(function (b) {
                        var active = b === btn;
                        b.classList.toggle('active', active);
                        b.setAttribute('aria-checked', active ? 'true' : 'false');
                    });
                    if (hiddenInput) {
                        hiddenInput.value = val;
                    }
                    if (logicKey === 'paint' && targetName === 'method' && !wasteUserEdited) {
                        var wasteInput = form.querySelector('[name="waste"]');
                        if (wasteInput) {
                            wasteInput.value = val === 'Spruzzo' ? '15' : '5';
                        }
                    }
                    clearErrors();
                    updateVisibility();
                    updateBadges();
                });
            });
        });

        // Paint manual waste override tracking
        if (logicKey === 'paint') {
            var paintWaste = form.querySelector('[name="waste"]');
            if (paintWaste) {
                paintWaste.addEventListener('input', function () {
                    wasteUserEdited = true;
                });
            }
        }

        // Select changes (e.g. equipmentType customName toggle)
        form.querySelectorAll('select').forEach(function (sel) {
            sel.addEventListener('change', function () {
                clearErrors();
                updateVisibility();
            });
        });

        form.addEventListener('input', function (e) {
            if (e.target && e.target.getAttribute('aria-invalid') === 'true') {
                e.target.removeAttribute('aria-invalid');
            }
            if (errorBanner && errorBanner.classList.contains('is-visible')) {
                errorBanner.classList.remove('is-visible');
            }
            updateBadges();
        });

        // 2. Accordions
        form.querySelectorAll('.calc-accordion-trigger').forEach(function (trigger) {
            trigger.addEventListener('click', function () {
                var panelId = trigger.getAttribute('aria-controls');
                var panel = panelId ? document.getElementById(panelId) : null;
                if (!panel) return;
                var expanded = trigger.getAttribute('aria-expanded') === 'true';
                trigger.setAttribute('aria-expanded', expanded ? 'false' : 'true');
                panel.classList.toggle('is-open', !expanded);
            });
        });

        // 3. Dynamic Wall Rows (for Skirting calculator)
        var wallsContainer = document.getElementById('calc-walls-container');
        var addWallBtn = document.getElementById('calc-add-wall-btn');

        function syncWallIndices() {
            if (!wallsContainer) return;
            var rows = wallsContainer.querySelectorAll('.calc-wall-row');
            rows.forEach(function (row, idx) {
                var lbl = row.querySelector('.calc-wall-index');
                var input = row.querySelector('.calc-wall-input');
                var delBtn = row.querySelector('.calc-wall-del-btn');
                if (lbl) lbl.textContent = 'Muro ' + (idx + 1);
                if (input) input.setAttribute('aria-label', 'Lunghezza muro ' + (idx + 1) + ' in metri');
                if (delBtn) delBtn.disabled = rows.length <= 3;
            });
        }

        function createWallRow(initialVal) {
            var row = document.createElement('div');
            row.className = 'calc-wall-row';
            row.innerHTML =
                '<span class="calc-wall-index">Muro</span>' +
                '<div class="calc-input-wrap">' +
                '  <input type="text" inputmode="decimal" class="calc-input has-unit calc-wall-input" placeholder="es. 4,20" value="' + escapeHtml(initialVal || '') + '">' +
                '  <span class="calc-input-unit">m</span>' +
                '</div>' +
                '<button type="button" class="calc-icon-btn calc-wall-del-btn" aria-label="Rimuovi muro" title="Rimuovi muro">' +
                '  <i data-feather="trash-2"></i>' +
                '</button>';

            var delBtn = row.querySelector('.calc-wall-del-btn');
            if (delBtn) {
                delBtn.addEventListener('click', function () {
                    if (!wallsContainer || wallsContainer.querySelectorAll('.calc-wall-row').length <= 3) return;
                    row.remove();
                    syncWallIndices();
                });
            }
            return row;
        }

        if (wallsContainer) {
            wallsContainer.querySelectorAll('.calc-wall-del-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    if (wallsContainer.querySelectorAll('.calc-wall-row').length <= 3) return;
                    btn.closest('.calc-wall-row').remove();
                    syncWallIndices();
                });
            });
            syncWallIndices();
        }

        if (addWallBtn && wallsContainer) {
            addWallBtn.addEventListener('click', function () {
                var newRow = createWallRow('');
                wallsContainer.appendChild(newRow);
                syncWallIndices();
                refreshIcons();
                var input = newRow.querySelector('input');
                if (input) input.focus();
            });
        }

        // 4. Extra Items (in-memory only, zero persistence)
        var extraDesc = document.getElementById('extra-desc');
        var extraQty = document.getElementById('extra-qty');
        var extraUnit = document.getElementById('extra-unit');
        var extraPrice = document.getElementById('extra-price');
        var extraAddBtn = document.getElementById('extra-add-btn');
        var extraListEl = document.getElementById('calc-extra-list');

        function renderExtras() {
            if (!extraListEl) return;
            extraListEl.innerHTML = '';
            extraItems.forEach(function (item, index) {
                var chip = document.createElement('div');
                chip.className = 'calc-extra-chip';
                var tot = item.unitPrice > 0 ? item.qty * item.unitPrice : null;
                chip.innerHTML =
                    '<div class="calc-extra-chip-info">' +
                    '  <strong>' + escapeHtml(item.name) + '</strong>' +
                    '  <span class="calc-extra-chip-meta">' + escapeHtml(Logic.formatIT(item.qty, item.qty % 1 === 0 ? 0 : 2)) + ' ' + escapeHtml(item.unit) +
                    (item.unitPrice > 0 ? ' × € ' + Logic.formatIT(item.unitPrice, 2) : '') + '</span>' +
                    (tot !== null ? '<span class="calc-extra-chip-total">€ ' + Logic.formatIT(tot, 2) + '</span>' : '<span class="calc-extra-chip-meta">(senza prezzo)</span>') +
                    '</div>' +
                    '<button type="button" class="calc-icon-btn" aria-label="Rimuovi voce extra" title="Rimuovi voce">' +
                    '  <i data-feather="trash-2"></i>' +
                    '</button>';

                chip.querySelector('button').addEventListener('click', function () {
                    extraItems.splice(index, 1);
                    renderExtras();
                    updateBadges();
                });
                extraListEl.appendChild(chip);
            });
            refreshIcons();
        }

        if (extraAddBtn) {
            extraAddBtn.addEventListener('click', function () {
                clearErrors();
                var name = extraDesc ? extraDesc.value.trim() : '';
                var qty = Logic.parseSafeDouble(extraQty ? extraQty.value : '');
                var unit = extraUnit ? extraUnit.value : 'pz';
                var unitPrice = Math.max(0, Logic.parseSafeDouble(extraPrice ? extraPrice.value : ''));

                if (!name) {
                    showError('Inserisci una descrizione per la voce extra (es. Prime mano fissativo).', extraDesc);
                    return;
                }
                if (qty <= 0) {
                    showError('Inserisci una quantità valida maggiore di 0 per la voce extra.', extraQty);
                    return;
                }

                extraItems.push({
                    name: name,
                    qty: qty,
                    unit: unit,
                    unitPrice: unitPrice
                });

                if (extraDesc) extraDesc.value = '';
                if (extraQty) extraQty.value = '';
                if (extraPrice) extraPrice.value = '';

                renderExtras();
                updateBadges();
            });
        }

        // 5. Dynamic Option Badges
        function updateBadges() {
            var costBadge = document.getElementById('badge-costs');
            var costPanel = document.getElementById('panel-costs');
            if (costBadge && costPanel) {
                var count = 0;
                costPanel.querySelectorAll('input[type="text"]').forEach(function (inp) {
                    if (isElementVisible(inp) && Logic.parseSafeDouble(inp.value) > 0) count++;
                });
                costBadge.textContent = count > 0 ? count + (count === 1 ? ' prezzo' : ' prezzi') : 'Opzionale';
                costBadge.classList.toggle('has-items', count > 0);
            }

            var extrasBadge = document.getElementById('badge-extras');
            if (extrasBadge) {
                extrasBadge.textContent = extraItems.length > 0 ? '+' + extraItems.length + (extraItems.length === 1 ? ' voce' : ' voci') : 'Opzionale';
                extrasBadge.classList.toggle('has-items', extraItems.length > 0);
            }

            var laborBadge = document.getElementById('badge-labor');
            if (laborBadge) {
                var labor = collectLabor();
                var laborTotal = labor.isFlatRate ? labor.flatRate : labor.hours * labor.hourlyRate;
                if (laborTotal > 0) {
                    laborBadge.textContent = '€ ' + Logic.formatIT(laborTotal, 2);
                    laborBadge.classList.add('has-items');
                } else if (!labor.isFlatRate && labor.hours > 0) {
                    laborBadge.textContent = Logic.formatIT(labor.hours, 1) + ' h';
                    laborBadge.classList.add('has-items');
                } else {
                    laborBadge.textContent = 'Opzionale';
                    laborBadge.classList.remove('has-items');
                }
            }
        }

        function collectInputs() {
            var inp = {};
            form.querySelectorAll('[name]').forEach(function (el) {
                var name = el.name;
                if (name.indexOf('labor') === 0 || name.indexOf('extra_') === 0) return;
                if (el.type === 'checkbox') {
                    inp[name] = el.checked;
                } else if (el.type === 'hidden') {
                    if (el.value === 'true') inp[name] = true;
                    else if (el.value === 'false') inp[name] = false;
                    else inp[name] = el.value;
                } else {
                    inp[name] = el.value;
                }
            });

            if (wallsContainer) {
                var walls = [];
                wallsContainer.querySelectorAll('.calc-wall-input').forEach(function (wEl) {
                    walls.push(wEl.value);
                });
                inp.walls = walls;
            }
            return inp;
        }

        function collectLabor() {
            var mode = getFieldValue('laborMode') || 'hourly';
            var isFlat = mode === 'flat';
            var flatRate = Logic.parseSafeDouble(getFieldValue('laborFlatRate'));
            var hours = Logic.parseSafeDouble(getFieldValue('laborHours'));
            var hourlyRate = Logic.parseSafeDouble(getFieldValue('laborHourlyRate'));
            return {
                isFlatRate: isFlat,
                flatRate: flatRate,
                hours: hours,
                hourlyRate: hourlyRate
            };
        }

        function validateForm(inp) {
            if (logicKey === 'skirting') {
                var wallsSum = 0;
                var wallEls = wallsContainer ? wallsContainer.querySelectorAll('.calc-wall-input') : [];
                for (var w = 0; w < wallEls.length; w++) {
                    var valW = Logic.parseSafeDouble(wallEls[w].value);
                    if (valW < 0) {
                        showError('Le lunghezze dei muri non possono essere negative.', wallEls[w]);
                        return false;
                    }
                    wallsSum += valW;
                }
                if (wallsSum <= 0) {
                    showError('Inserisci la lunghezza di almeno un muro per calcolare il battiscopa.', wallEls[0]);
                    return false;
                }
                var doors = Math.max(0, Math.round(Logic.parseSafeDouble(inp.doors)));
                var doorW = Math.max(0, Logic.parseSafeDouble(inp.doorWidth));
                if (doors * doorW >= wallsSum) {
                    showError('La larghezza delle porte supera il perimetro totale dei muri inseriti.', wallEls[0]);
                    return false;
                }
            }

            var requiredEls = form.querySelectorAll('[data-required="true"]');
            for (var i = 0; i < requiredEls.length; i++) {
                var el = requiredEls[i];
                if (!isElementVisible(el)) continue;
                var raw = String(el.value || '').trim();
                var num = Logic.parseSafeDouble(raw);
                var allowZero = el.getAttribute('data-allow-zero') === 'true';
                if (!raw || (!allowZero && num <= 0) || (allowZero && num < 0)) {
                    var lbl = form.querySelector('label[for="' + el.id + '"]');
                    var fieldLabel = lbl ? lbl.textContent.replace(/\s+/g, ' ').trim() : 'questo campo';
                    showError('Inserisci un valore valido maggiore di zero in "' + fieldLabel + '".', el);
                    return false;
                }
            }

            // Net area check when emptyArea >= gross area
            if (['paint', 'drywall', 'wallpaper', 'tiles', 'bricks', 'plaster'].indexOf(logicKey) !== -1) {
                var resTest = Logic.calculate(logicKey, inp, [], {});
                if (resTest && resTest.raw && typeof resTest.raw.netArea === 'number' && resTest.raw.netArea <= 0) {
                    var emptyEl = form.querySelector('[name="emptyArea"]');
                    showError('La superficie dei vuoti (porte/finestre) non può essere maggiore o uguale alla superficie totale.', emptyEl || form.querySelector('input[type="text"]'));
                    return false;
                }
            }

            return true;
        }

        // 6. ResultModal Rendering & Locked Conversion Funnel
        function renderModal(res) {
            if (!modalBackdrop) return;

            var comfortEl = document.getElementById('modal-comfort-badge');
            if (comfortEl) {
                if (res.comfortBadge) {
                    comfortEl.className = 'calc-comfort-badge level-' + res.comfortBadge.level;
                    comfortEl.innerHTML = '<i data-feather="' + (res.comfortBadge.level === 0 ? 'check' : 'alert-triangle') + '"></i><span>' + escapeHtml(res.comfortBadge.text) + '</span>';
                    comfortEl.style.display = 'flex';
                } else {
                    comfortEl.style.display = 'none';
                    comfortEl.innerHTML = '';
                }
            }

            var safetyEl = document.getElementById('modal-safety-banner');
            if (safetyEl) {
                safetyEl.style.display = useSafetyDisclaimer ? 'flex' : 'none';
            }

            var heroLbl = document.getElementById('modal-hero-label');
            var heroVal = document.getElementById('modal-hero-value');
            var heroSub = document.getElementById('modal-hero-sub');
            if (heroLbl) heroLbl.textContent = res.heroLabel || 'Risultato';
            if (heroVal) heroVal.textContent = res.heroValue || '-';
            if (heroSub) heroSub.textContent = res.heroSub || '';

            var detailsGrid = document.getElementById('modal-details-grid');
            if (detailsGrid) {
                detailsGrid.innerHTML = (res.details || []).map(function (d) {
                    return '<div class="calc-detail-cell"><span>' + escapeHtml(d.label) + '</span><strong>' + escapeHtml(d.value) + '</strong></div>';
                }).join('');
            }

            var summaryBox = document.getElementById('modal-cost-summary');
            if (summaryBox && res.summary) {
                var sum = res.summary;
                var hasAnyPrice = sum.grandTotal > 0 || sum.extras.length > 0 || sum.labor.hasLabor;
                if (!hasAnyPrice) {
                    summaryBox.style.display = 'none';
                } else {
                    summaryBox.style.display = 'block';
                    var linesHtml = '';
                    sum.materials.forEach(function (m) {
                        var amt = m.totalCost !== null && m.totalCost !== undefined ? '€ ' + Logic.formatIT(m.totalCost, 2) : 'Prezzo n/d';
                        linesHtml += '<div class="calc-cost-line"><div><strong>' + escapeHtml(m.label) + '</strong> <small>(' + escapeHtml(m.detail) + ')</small></div><span class="cost-amt">' + escapeHtml(amt) + '</span></div>';
                    });
                    sum.extras.forEach(function (ex) {
                        var exAmt = ex.total !== null ? '€ ' + Logic.formatIT(ex.total, 2) : 'Prezzo n/d';
                        linesHtml += '<div class="calc-cost-line"><div>' + escapeHtml(ex.name) + ' <small>(' + Logic.formatIT(ex.qty, ex.qty % 1 === 0 ? 0 : 2) + ' ' + escapeHtml(ex.unit) + ')</small></div><span class="cost-amt">' + escapeHtml(exAmt) + '</span></div>';
                    });
                    if (sum.labor.hasLabor) {
                        linesHtml += '<div class="calc-cost-line"><div>Manodopera <small>(' + escapeHtml(sum.labor.description) + ')</small></div><span class="cost-amt">€ ' + Logic.formatIT(sum.totalLabor, 2) + '</span></div>';
                    }
                    var warnings = '';
                    if (sum.missingPriceItems && sum.missingPriceItems.length > 0) {
                        warnings += '<div class="calc-cost-warning">Nota: mancano i prezzi di alcuni materiali (' + escapeHtml(sum.missingPriceItems.join(', ')) + ').</div>';
                    }
                    summaryBox.innerHTML =
                        '<p class="calc-cost-summary-title">Riepilogo Stima Economica</p>' +
                        linesHtml +
                        '<div class="calc-cost-grand"><span>Totale Stimato</span><strong>€ ' + Logic.formatIT(sum.grandTotal, 2) + '</strong></div>' +
                        warnings;
                }
            }

            var feedback = document.getElementById('calc-locked-feedback');
            if (feedback) {
                feedback.classList.remove('is-visible');
                feedback.textContent = '';
            }
            modalBackdrop.querySelectorAll('.calc-locked-btn.is-pulsed').forEach(function (b) {
                b.classList.remove('is-pulsed');
            });

            lastFocusedElement = document.activeElement;
            modalBackdrop.classList.add('is-open');
            modalBackdrop.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';

            refreshIcons();

            var closeBtn = modalBackdrop.querySelector('.calc-modal-close');
            if (closeBtn) closeBtn.focus();
        }

        function closeModal() {
            if (!modalBackdrop || !modalBackdrop.classList.contains('is-open')) return;
            modalBackdrop.classList.remove('is-open');
            modalBackdrop.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
                lastFocusedElement.focus();
            }
        }

        if (modalBackdrop) {
            modalBackdrop.addEventListener('click', function (e) {
                if (e.target === modalBackdrop) {
                    closeModal();
                }
            });

            modalBackdrop.querySelectorAll('[data-close-modal]').forEach(function (btn) {
                btn.addEventListener('click', closeModal);
            });

            modalBackdrop.querySelectorAll('.calc-locked-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    modalBackdrop.querySelectorAll('.calc-locked-btn').forEach(function (b) {
                        b.classList.remove('is-pulsed');
                    });
                    btn.classList.add('is-pulsed');
                    var featureName = btn.getAttribute('data-feature-label') || 'Questa funzione';
                    var featurePitch = btn.getAttribute('data-feature-pitch') || '';
                    var feedback = document.getElementById('calc-locked-feedback');
                    if (feedback) {
                        feedback.textContent = featurePitch
                            ? featureName + ' (Solo App Android): ' + featurePitch
                            : featureName + ' è disponibile esclusivamente nell\'app Android gratuita Edil Calc. Scaricala dal pulsante qui sotto!';
                        feedback.classList.add('is-visible');
                    }
                });
            });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('is-open')) {
                closeModal();
            }
        });

        // 7. Submit & Reset
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            clearErrors();
            var inp = collectInputs();
            if (!validateForm(inp)) return;
            var laborInput = collectLabor();
            var result = Logic.calculate(logicKey, inp, extraItems, laborInput);
            renderModal(result);
        });

        var resetBtn = document.getElementById('calc-reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', function () {
                form.reset();
                wasteUserEdited = false;
                extraItems = [];
                renderExtras();

                // Reset segmented controls to their default button (data-default="true")
                form.querySelectorAll('.calc-segmented').forEach(function (group) {
                    var targetName = group.getAttribute('data-seg-name');
                    var hiddenInput = targetName ? form.querySelector('input[type="hidden"][name="' + targetName + '"]') : null;
                    var btns = group.querySelectorAll('.calc-seg-btn');
                    var defBtn = group.querySelector('.calc-seg-btn[data-default="true"]') || btns[0];
                    btns.forEach(function (b) {
                        var active = b === defBtn;
                        b.classList.toggle('active', active);
                        b.setAttribute('aria-checked', active ? 'true' : 'false');
                    });
                    if (hiddenInput && defBtn) {
                        hiddenInput.value = defBtn.getAttribute('data-value');
                    }
                });

                // Restore 4 initial empty walls for skirting
                if (wallsContainer) {
                    wallsContainer.innerHTML = '';
                    for (var k = 0; k < 4; k++) {
                        wallsContainer.appendChild(createWallRow(''));
                    }
                    syncWallIndices();
                    refreshIcons();
                }

                clearErrors();
                updateVisibility();
                updateBadges();
            });
        }

        // Initial setup
        updateVisibility();
        updateBadges();
        refreshIcons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCalculator);
    } else {
        initCalculator();
    }
})();
