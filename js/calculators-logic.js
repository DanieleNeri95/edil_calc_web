/**
 * Edil Calc Web — Motore di Calcolo Puro (21 Calcolatori Edili)
 * Parita' di calcolo con l'app Flutter Edil Calc.
 * Zero dipendenze, zero DOM, zero persistenza (localStorage/cookie).
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.EdilCalcLogic = factory();
    }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';

    function parseSafeDouble(val) {
        if (typeof val === 'number') {
            return Number.isFinite(val) ? val : 0;
        }
        if (val === null || val === undefined) return 0;
        var str = String(val).trim().replace(',', '.');
        if (!str) return 0;
        var n = Number(str);
        return Number.isFinite(n) ? n : 0;
    }

    function formatIT(num, decimals) {
        var dec = typeof decimals === 'number' ? decimals : 2;
        var val = Number.isFinite(num) ? num : 0;
        if (Object.is(val, -0)) val = 0;
        var fixed = val.toFixed(dec);
        var parts = fixed.split('.');
        var intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        if (dec === 0) return intPart;
        return intPart + ',' + parts[1];
    }

    function computeExtrasAndLabor(extraItems, laborInput) {
        var extras = Array.isArray(extraItems) ? extraItems : [];
        var normalizedExtras = [];
        var extraTotal = 0;

        for (var i = 0; i < extras.length; i++) {
            var item = extras[i] || {};
            var name = String(item.name || '').trim() || 'Voce extra';
            var qty = Math.max(0, parseSafeDouble(item.qty));
            var unit = String(item.unit || 'pz').trim() || 'pz';
            var unitPrice = Math.max(0, parseSafeDouble(item.unitPrice));
            var total = unitPrice > 0 ? qty * unitPrice : null;
            if (total !== null) {
                extraTotal += total;
            }
            normalizedExtras.push({
                name: name,
                qty: qty,
                unit: unit,
                unitPrice: unitPrice > 0 ? unitPrice : null,
                total: total
            });
        }

        var labor = laborInput || {};
        var isFlatRate = Boolean(labor.isFlatRate);
        var flatRate = Math.max(0, parseSafeDouble(labor.flatRate));
        var hours = Math.max(0, parseSafeDouble(labor.hours));
        var hourlyRate = Math.max(0, parseSafeDouble(labor.hourlyRate));

        var laborTotal = isFlatRate ? flatRate : (hours * hourlyRate);
        var hasLabor = laborTotal > 0 || (!isFlatRate && hours > 0);

        return {
            extras: normalizedExtras,
            extraTotal: extraTotal,
            labor: {
                isFlatRate: isFlatRate,
                flatRate: flatRate,
                hours: hours,
                hourlyRate: hourlyRate,
                total: laborTotal,
                hasLabor: hasLabor,
                description: isFlatRate
                    ? 'Prezzo a corpo (forfait)'
                    : (formatIT(hours, hours % 1 === 0 ? 0 : 1) + ' h × € ' + formatIT(hourlyRate, 2) + '/h')
            }
        };
    }

    function buildSummary(materialRows, extraItems, laborInput) {
        var rows = Array.isArray(materialRows) ? materialRows : [];
        var el = computeExtrasAndLabor(extraItems, laborInput);
        var totalMaterialsOnly = 0;
        var missingPriceItems = [];

        for (var i = 0; i < rows.length; i++) {
            var r = rows[i];
            if (r.totalCost !== null && r.totalCost !== undefined && Number.isFinite(r.totalCost)) {
                totalMaterialsOnly += r.totalCost;
            } else {
                missingPriceItems.push(r.label);
            }
        }

        for (var j = 0; j < el.extras.length; j++) {
            if (el.extras[j].total === null) {
                missingPriceItems.push(el.extras[j].name);
            }
        }

        var totalMaterials = totalMaterialsOnly + el.extraTotal;
        var grandTotal = totalMaterials + el.labor.total;

        return {
            materials: rows,
            extras: el.extras,
            labor: el.labor,
            totalMaterialsOnly: totalMaterialsOnly,
            extraTotal: el.extraTotal,
            totalMaterials: totalMaterials,
            totalLabor: el.labor.total,
            grandTotal: grandTotal,
            missingPriceItems: missingPriceItems,
            missingLaborWarning: el.labor.total === 0
        };
    }

    function getElectricalCapacity(section, installType) {
        var table = {
            '1.5': [18.0, 14.5, 22.0],
            '2.5': [24.0, 19.5, 29.0],
            '4': [32.0, 26.0, 37.0],
            '6': [41.0, 34.0, 46.0],
            '10': [57.0, 46.0, 61.0],
            '16': [76.0, 61.0, 79.0],
            '25': [101.0, 80.0, 101.0],
            '35': [125.0, 99.0, 122.0],
            '50': [151.0, 119.0, 144.0],
            '70': [192.0, 151.0, 178.0],
            '95': [232.0, 182.0, 211.0],
            '120': [269.0, 210.0, 240.0]
        };
        var idx = installType === 'tube' ? 1 : (installType === 'buried' ? 2 : 0);
        var key = String(section);
        return (table[key] && table[key][idx]) || 10.0;
    }

    var EQUIPMENT_LABELS = {
        crane: 'Gru da cantiere',
        excavator: 'Mini-Escavatore / Escavatore',
        van: 'Furgone / Autocarro ribaltabile',
        scissor: 'Piattaforma Aerea (PLE)',
        generator: 'Gruppo elettrogeno / Generatore',
        other: 'Attrezzatura / Mezzo'
    };

    function calculate(logicKey, inputs, extraItems, laborInput) {
        var inp = inputs || {};
        var res;

        switch (logicKey) {
            case 'paint': {
                var isMqMode = inp.isMqMode !== false && inp.isMqMode !== 'sides';
                var grossMq = isMqMode
                    ? Math.max(0, parseSafeDouble(inp.area))
                    : Math.max(0, parseSafeDouble(inp.width)) * Math.max(0, parseSafeDouble(inp.height));
                var emptyMq = Math.max(0, parseSafeDouble(inp.emptyArea));
                var netMq = Math.max(0, grossMq - emptyMq);
                var coverage = parseSafeDouble(inp.coverage);
                if (coverage <= 0) coverage = 10;
                var coats = Math.max(1, Math.round(parseSafeDouble(inp.coats) || 2));
                var method = inp.method || 'Rullo';
                var defaultWaste = method === 'Spruzzo' ? 15 : 5;
                var wastePct = inp.waste !== undefined && inp.waste !== '' ? Math.max(0, parseSafeDouble(inp.waste)) : defaultWaste;
                var wasteFactor = 1 + (wastePct / 100);
                var neededLiters = (netMq / coverage) * coats;
                var litersWithWaste = neededLiters * wasteFactor;
                var priceLiter = Math.max(0, parseSafeDouble(inp.priceLiter));
                var paintCost = priceLiter > 0 ? priceLiter * litersWithWaste : null;

                res = {
                    logicKey: 'paint',
                    raw: {
                        grossMq: grossMq,
                        netMq: netMq,
                        coats: coats,
                        method: method,
                        wastePct: wastePct,
                        liters: litersWithWaste
                    },
                    heroLabel: 'Quantità stimata di pittura (' + coats + (coats === 1 ? ' mano' : ' mani') + ')',
                    heroValue: formatIT(litersWithWaste, 1) + ' Litri',
                    heroSub: '(+' + formatIT(wastePct, 0) + '% scarto • Metodo: ' + method + ')',
                    details: [
                        { label: 'Superficie netta da verniciare', value: formatIT(netMq, 2) + ' m²' },
                        { label: 'Superficie totale coperta (' + coats + ' mani)', value: formatIT(netMq * coats, 2) + ' m²' }
                    ],
                    materialRows: [
                        {
                            label: 'Vernice / Idropittura (' + formatIT(litersWithWaste, 1) + ' L)',
                            detail: priceLiter > 0 ? ('€ ' + formatIT(priceLiter, 2) + '/L') : null,
                            totalCost: paintCost
                        }
                    ]
                };
                break;
            }

            case 'drywall': {
                var isDoubleSided = Boolean(inp.isDoubleSided) && inp.isDoubleSided !== '1';
                if (inp.wallType === '2' || inp.isDoubleSided === true || inp.isDoubleSided === 'true') {
                    isDoubleSided = true;
                }
                if (inp.wallType === '1' || inp.isDoubleSided === false || inp.isDoubleSided === 'false') {
                    isDoubleSided = false;
                }
                var wallWidth = Math.max(0, parseSafeDouble(inp.wallWidth));
                var wallHeight = Math.max(0, parseSafeDouble(inp.wallHeight));
                var emptyArea = Math.max(0, parseSafeDouble(inp.emptyArea));
                var waste = inp.waste !== undefined && inp.waste !== '' ? Math.max(0, parseSafeDouble(inp.waste)) : 10;
                var wasteFactor = 1 + (waste / 100);
                var panelWidth = parseSafeDouble(inp.panelWidth) || 1.2;
                var panelHeight = parseSafeDouble(inp.panelHeight) || 2.0;
                var studSpacingCm = parseSafeDouble(inp.studSpacing) || 60;

                var grossWallArea = wallWidth * wallHeight;
                var netWallArea = Math.max(0, grossWallArea - emptyArea);
                var panelArea = panelWidth * panelHeight;

                var panels = netWallArea > 0 ? Math.ceil((netWallArea / panelArea) * wasteFactor) : 0;
                if (isDoubleSided) panels *= 2;

                var tracks = (wallWidth * 2) * wasteFactor;
                var studs = wallWidth > 0 ? Math.ceil((Math.ceil(wallWidth / (studSpacingCm / 100)) + 1) * wasteFactor) : 0;
                var screws = panels * 30;
                var screwBoxes = screws > 0 ? Math.ceil(screws / 1000) : 0;
                var plasterKg = (netWallArea * 0.3) * (isDoubleSided ? 2 : 1) * wasteFactor;
                var tapeM = panels * 3.0 * wasteFactor;

                var panelPrice = Math.max(0, parseSafeDouble(inp.panelPrice));
                var trackPrice = Math.max(0, parseSafeDouble(inp.trackPrice));
                var studPrice = Math.max(0, parseSafeDouble(inp.studPrice));
                var screwPrice = Math.max(0, parseSafeDouble(inp.screwPrice));

                var panelTotal = panelPrice > 0 ? panelPrice * panels : null;
                var trackTotal = trackPrice > 0 ? trackPrice * tracks : null;
                var studTotal = studPrice > 0 ? studPrice * studs : null;
                var screwTotal = screwPrice > 0 ? screwPrice * screwBoxes : null;

                res = {
                    logicKey: 'drywall',
                    raw: {
                        isDoubleSided: isDoubleSided,
                        netWallArea: netWallArea,
                        panels: panels,
                        tracks: tracks,
                        studs: studs,
                        screws: screws,
                        screwBoxes: screwBoxes,
                        plasterKg: plasterKg,
                        tapeM: tapeM
                    },
                    heroLabel: 'Lastre cartongesso (' + (isDoubleSided ? 'Parete divisoria 2 lati' : 'Controparete 1 lato') + ')',
                    heroValue: panels + (panels === 1 ? ' Lastra' : ' Lastre'),
                    heroSub: 'Formato ' + formatIT(panelWidth, 2) + ' × ' + formatIT(panelHeight, 2) + ' m (+' + formatIT(waste, 0) + '% scarto)',
                    details: [
                        { label: 'Guide orizzontali a U (pavimento + soffitto)', value: formatIT(tracks, 1) + ' m (' + Math.ceil(tracks / 3) + ' barre da 3 m)' },
                        { label: 'Montanti verticali a C (passo ' + formatIT(studSpacingCm, 0) + ' cm)', value: studs + ' montanti' },
                        { label: 'Viti autoperforanti fosfatate', value: formatIT(screws, 0) + ' pz (' + screwBoxes + (screwBoxes === 1 ? ' scatola da 1.000)' : ' scatole da 1.000)') },
                        { label: 'Stucco e nastro per giunti (stima)', value: formatIT(plasterKg, 1) + ' kg stucco • ' + formatIT(tapeM, 1) + ' m nastro' }
                    ],
                    materialRows: [
                        { label: 'Lastre cartongesso (' + panels + ' pz)', detail: panelPrice > 0 ? '€ ' + formatIT(panelPrice, 2) + '/pz' : null, totalCost: panelTotal },
                        { label: 'Guide a U (' + formatIT(tracks, 1) + ' m)', detail: trackPrice > 0 ? '€ ' + formatIT(trackPrice, 2) + '/m' : null, totalCost: trackTotal },
                        { label: 'Montanti a C (' + studs + ' pz)', detail: studPrice > 0 ? '€ ' + formatIT(studPrice, 2) + '/pz' : null, totalCost: studTotal },
                        { label: 'Viti fosfatate (' + screwBoxes + ' scatole 1000 pz)', detail: screwPrice > 0 ? '€ ' + formatIT(screwPrice, 2) + '/scatola' : null, totalCost: screwTotal }
                    ]
                };
                break;
            }

            case 'wallpaper': {
                var ww = Math.max(0, parseSafeDouble(inp.wallWidth));
                var wh = Math.max(0, parseSafeDouble(inp.wallHeight));
                var emptyA = Math.max(0, parseSafeDouble(inp.emptyArea));
                var rwCm = parseSafeDouble(inp.rollWidth) || 53;
                var rlM = parseSafeDouble(inp.rollLength) || 10;
                var prCm = Math.max(0, parseSafeDouble(inp.patternRepeat));
                var glueYield = parseSafeDouble(inp.glueYield) || 200;
                var wasteRolls = inp.wasteRolls !== undefined && inp.wasteRolls !== '' ? Math.max(0, parseSafeDouble(inp.wasteRolls)) : 10;
                var wasteGlue = inp.wasteGlue !== undefined && inp.wasteGlue !== '' ? Math.max(0, parseSafeDouble(inp.wasteGlue)) : 10;

                var grossA = ww * wh;
                var netA = Math.max(0, grossA - emptyA);
                var netWallW = grossA > 0 ? ww * (netA / grossA) : ww;
                var stripsNeeded = netWallW > 0 ? Math.ceil(netWallW / (rwCm / 100)) : 0;
                var effStripH = wh + (prCm / 100) + 0.05;
                var stripsPerRoll = Math.max(1, Math.floor(rlM / (effStripH || 0.0001)));
                var rolls = stripsNeeded > 0 ? Math.ceil((stripsNeeded / stripsPerRoll) * (1 + wasteRolls / 100)) : 0;
                var glueKg = (netA * glueYield / 1000) * (1 + wasteGlue / 100);

                var rollPrice = Math.max(0, parseSafeDouble(inp.rollPrice));
                var gluePrice = Math.max(0, parseSafeDouble(inp.gluePrice));

                res = {
                    logicKey: 'wallpaper',
                    raw: {
                        netAreaMq: netA,
                        stripsNeeded: stripsNeeded,
                        stripsPerRoll: stripsPerRoll,
                        rolls: rolls,
                        glueKg: glueKg
                    },
                    heroLabel: 'Rotoli di carta da parati da ordinare',
                    heroValue: rolls + (rolls === 1 ? ' Rotolo' : ' Rotoli'),
                    heroSub: 'Formato ' + formatIT(rwCm, 0) + ' cm × ' + formatIT(rlM, 1) + ' m (+' + formatIT(wasteRolls, 0) + '% scarto)',
                    details: [
                        { label: 'Colla per carta da parati', value: formatIT(glueKg, 2) + ' kg (+' + formatIT(wasteGlue, 0) + '% scarto)' },
                        { label: 'Teli necessari / Teli utili per rotolo', value: stripsNeeded + ' teli (' + stripsPerRoll + ' teli interi per rotolo)' },
                        { label: 'Superficie netta rivestita', value: formatIT(netA, 2) + ' m²' }
                    ],
                    materialRows: [
                        { label: 'Rotoli carta da parati (' + rolls + ' rotoli)', detail: rollPrice > 0 ? '€ ' + formatIT(rollPrice, 2) + '/rotolo' : null, totalCost: rollPrice > 0 ? rollPrice * rolls : null },
                        { label: 'Colla specifica (' + formatIT(glueKg, 2) + ' kg)', detail: gluePrice > 0 ? '€ ' + formatIT(gluePrice, 2) + '/kg' : null, totalCost: gluePrice > 0 ? gluePrice * glueKg : null }
                    ]
                };
                break;
            }

            case 'tiles': {
                var areaT = Math.max(0, parseSafeDouble(inp.area));
                var emptyT = Math.max(0, parseSafeDouble(inp.emptyArea));
                var netT = Math.max(0, areaT - emptyT);
                var wasteT = inp.waste !== undefined && inp.waste !== '' ? Math.max(0, parseSafeDouble(inp.waste)) : 10;
                var wfT = 1 + (wasteT / 100);
                var tileL = parseSafeDouble(inp.tileLength) || 60;
                var tileW = parseSafeDouble(inp.tileWidth) || 60;
                var groutMm = Math.max(0, parseSafeDouble(inp.grout !== undefined ? inp.grout : 2));
                var boxMq = parseSafeDouble(inp.boxMq) || 1.5;

                var effTileL = tileL + (groutMm / 10);
                var effTileW = tileW + (groutMm / 10);
                var tileAreaMq = (effTileL / 100) * (effTileW / 100);
                if (tileAreaMq <= 0) tileAreaMq = 0.0001;

                var neededTiles = netT > 0 ? Math.ceil(netT / tileAreaMq) : 0;
                var tilesWithWaste = Math.ceil(neededTiles * wfT);
                var totalAreaWithWaste = netT * wfT;
                var boxes = totalAreaWithWaste > 0 ? Math.ceil(totalAreaWithWaste / boxMq) : 0;
                var glueKgT = totalAreaWithWaste * 4.0;
                var groutKgT = totalAreaWithWaste * 0.5;

                var tilePrice = Math.max(0, parseSafeDouble(inp.tilePrice));
                var boxPrice = Math.max(0, parseSafeDouble(inp.boxPrice));
                var tilesCostRow;
                if (boxPrice > 0) {
                    tilesCostRow = {
                        label: 'Piastrelle (' + boxes + ' scatole • ' + tilesWithWaste + ' pz)',
                        detail: '€ ' + formatIT(boxPrice, 2) + '/scatola',
                        totalCost: boxPrice * boxes
                    };
                } else {
                    tilesCostRow = {
                        label: 'Piastrelle (' + formatIT(totalAreaWithWaste, 2) + ' m² • ' + boxes + ' scatole)',
                        detail: tilePrice > 0 ? '€ ' + formatIT(tilePrice, 2) + '/m²' : null,
                        totalCost: tilePrice > 0 ? tilePrice * totalAreaWithWaste : null
                    };
                }

                res = {
                    logicKey: 'tiles',
                    raw: {
                        netAreaMq: netT,
                        totalAreaWithWaste: totalAreaWithWaste,
                        neededTiles: neededTiles,
                        tilesWithWaste: tilesWithWaste,
                        boxes: boxes,
                        glueKg: glueKgT,
                        groutKg: groutKgT
                    },
                    heroLabel: 'Piastrelle da ordinare (con +' + formatIT(wasteT, 0) + '% sfrido)',
                    heroValue: tilesWithWaste + ' Pezzi (' + boxes + (boxes === 1 ? ' Scatola)' : ' Scatole)'),
                    heroSub: 'Formato ' + formatIT(tileL, 0) + '×' + formatIT(tileW, 0) + ' cm • Fuga ' + formatIT(groutMm, 1) + ' mm • ' + formatIT(totalAreaWithWaste, 2) + ' m² totali',
                    details: [
                        { label: 'Pezzi netti senza sfrido', value: neededTiles + ' piastrelle (' + formatIT(netT, 2) + ' m²)' },
                        { label: 'Colla cementizia C2 stimata (~4 kg/m²)', value: formatIT(glueKgT, 1) + ' kg (' + Math.ceil(glueKgT / 25) + ' sacchi da 25 kg)' },
                        { label: 'Stucco per fughe stimato', value: formatIT(groutKgT, 1) + ' kg' }
                    ],
                    materialRows: [tilesCostRow]
                };
                break;
            }

            case 'skirting': {
                var walls = Array.isArray(inp.walls) ? inp.walls : [];
                var perimeterS = 0;
                for (var wi = 0; wi < walls.length; wi++) {
                    perimeterS += Math.max(0, parseSafeDouble(walls[wi]));
                }
                var doors = Math.max(0, Math.round(parseSafeDouble(inp.doors !== undefined ? inp.doors : 1)));
                var doorWidth = Math.max(0, parseSafeDouble(inp.doorWidth !== undefined ? inp.doorWidth : 0.9));
                var rodLength = parseSafeDouble(inp.rodLength) || 2.4;
                var wasteS = inp.waste !== undefined && inp.waste !== '' ? Math.max(0, parseSafeDouble(inp.waste)) : 10;

                var netMeters = Math.max(0, perimeterS - (doors * doorWidth));
                var metersWithWaste = netMeters * (1 + wasteS / 100);
                var rods = metersWithWaste > 0 ? Math.ceil(metersWithWaste / rodLength) : 0;
                var rodPrice = Math.max(0, parseSafeDouble(inp.rodPrice));

                res = {
                    logicKey: 'skirting',
                    raw: {
                        perimeter: perimeterS,
                        netMeters: netMeters,
                        metersWithWaste: metersWithWaste,
                        rods: rods
                    },
                    heroLabel: 'Aste di battiscopa da acquistare',
                    heroValue: rods + (rods === 1 ? ' Asta' : ' Aste') + ' da ' + formatIT(rodLength, 2) + ' m',
                    heroSub: formatIT(metersWithWaste, 1) + ' m lineari totali (+' + formatIT(wasteS, 0) + '% scarto tagli 45°)',
                    details: [
                        { label: 'Perimetro lordo muri', value: formatIT(perimeterS, 2) + ' m' },
                        { label: 'Sottrazione porte (' + doors + ' × ' + formatIT(doorWidth, 2) + ' m)', value: '− ' + formatIT(doors * doorWidth, 2) + ' m → ' + formatIT(netMeters, 2) + ' m netti' }
                    ],
                    materialRows: [
                        {
                            label: 'Aste battiscopa (' + rods + ' pz da ' + formatIT(rodLength, 2) + ' m)',
                            detail: rodPrice > 0 ? '€ ' + formatIT(rodPrice, 2) + '/asta' : null,
                            totalCost: rodPrice > 0 ? rodPrice * rods : null
                        }
                    ]
                };
                break;
            }

            case 'cement': {
                var isPremix = inp.isPremiscelato !== false && inp.isPremiscelato !== 'traditional';
                var areaC = Math.max(0, parseSafeDouble(inp.area));
                var thickC = Math.max(0, parseSafeDouble(inp.thickness));
                var wasteC = inp.waste !== undefined && inp.waste !== '' ? Math.max(0, parseSafeDouble(inp.waste)) : 10;
                var bagW = parseSafeDouble(inp.bagWeight) || 25;
                var volMc = areaC * (thickC / 100);
                var volMcWaste = volMc * (1 + wasteC / 100);

                var bagsC = 0;
                var sandMc = 0;
                if (isPremix) {
                    bagsC = volMcWaste > 0 ? Math.ceil((volMcWaste * 1850) / bagW) : 0;
                } else {
                    bagsC = volMcWaste > 0 ? Math.ceil((volMcWaste * 300) / bagW) : 0;
                    sandMc = volMcWaste;
                }

                var bagPriceC = Math.max(0, parseSafeDouble(inp.bagPrice));
                var sandPriceC = Math.max(0, parseSafeDouble(inp.sandPrice));
                var rowsC = [
                    {
                        label: (isPremix ? 'Massetto premiscelato' : 'Cemento 32.5 R') + ' (' + bagsC + ' sacchi da ' + formatIT(bagW, 0) + ' kg)',
                        detail: bagPriceC > 0 ? '€ ' + formatIT(bagPriceC, 2) + '/sacco' : null,
                        totalCost: bagPriceC > 0 ? bagPriceC * bagsC : null
                    }
                ];
                if (!isPremix) {
                    rowsC.push({
                        label: 'Sabbia lavata sfusa (' + formatIT(sandMc, 2) + ' m³)',
                        detail: sandPriceC > 0 ? '€ ' + formatIT(sandPriceC, 2) + '/m³' : null,
                        totalCost: sandPriceC > 0 ? sandPriceC * sandMc : null
                    });
                }

                res = {
                    logicKey: 'cement',
                    raw: {
                        isPremiscelato: isPremix,
                        volumeMc: volMc,
                        volumeMcWithWaste: volMcWaste,
                        bags: bagsC,
                        sandMc: sandMc
                    },
                    heroLabel: isPremix ? 'Sacchi di massetto premiscelato' : 'Sacchi di cemento + sabbia sfusa',
                    heroValue: bagsC + (bagsC === 1 ? ' Sacco' : ' Sacchi') + ' da ' + formatIT(bagW, 0) + ' kg',
                    heroSub: !isPremix
                        ? ('+ ' + formatIT(sandMc, 2) + ' m³ di sabbia • Sfrido +' + formatIT(wasteC, 0) + '%')
                        : ('Peso totale ' + formatIT(bagsC * bagW, 0) + ' kg • Sfrido +' + formatIT(wasteC, 0) + '%'),
                    details: [
                        { label: 'Volume netto getto', value: formatIT(volMc, 2) + ' m³ (' + formatIT(volMcWaste, 2) + ' m³ con scarto)' },
                        !isPremix
                            ? { label: 'Sabbia lavata occorrente (~1 m³/m³)', value: formatIT(sandMc, 2) + ' m³' }
                            : { label: 'Bancali indicativi (~60 sacchi/bancale)', value: formatIT(bagsC / 60, 1) + ' bancali' }
                    ],
                    materialRows: rowsC
                };
                break;
            }

            case 'bricks': {
                var wallAreaB = Math.max(0, parseSafeDouble(inp.wallArea));
                var emptyB = Math.max(0, parseSafeDouble(inp.emptyArea));
                var netB = Math.max(0, wallAreaB - emptyB);
                var wb = inp.wasteBricks !== undefined && inp.wasteBricks !== '' ? Math.max(0, parseSafeDouble(inp.wasteBricks)) : 10;
                var wm = inp.wasteMortar !== undefined && inp.wasteMortar !== '' ? Math.max(0, parseSafeDouble(inp.wasteMortar)) : 10;
                var bLen = parseSafeDouble(inp.brickLength) || 25;
                var bHei = parseSafeDouble(inp.brickHeight) || 12;
                var bDep = parseSafeDouble(inp.brickDepth) || 12;
                var gMm = Math.max(0, parseSafeDouble(inp.grout !== undefined ? inp.grout : 10));

                var effLB = (bLen + gMm / 10) / 100;
                var effHB = (bHei + gMm / 10) / 100;
                var effAreaB = effLB * effHB || 0.0001;
                var bricksCount = netB > 0 ? Math.ceil((netB / effAreaB) * (1 + wb / 100)) : 0;

                var bareAreaB = (bLen / 100) * (bHei / 100);
                var mortarRatio = (effAreaB - bareAreaB) / effAreaB;
                var mortarVol = netB * mortarRatio * (bDep / 100);
                var mortarKg = (mortarVol * 1800) * (1 + wm / 100);
                var mortarBags = mortarKg > 0 ? Math.ceil(mortarKg / 25) : 0;

                var brickPrice = Math.max(0, parseSafeDouble(inp.brickPrice));
                var mortarPrice = Math.max(0, parseSafeDouble(inp.mortarPrice));

                res = {
                    logicKey: 'bricks',
                    raw: {
                        netAreaMq: netB,
                        bricks: bricksCount,
                        mortarKg: mortarKg,
                        mortarBags: mortarBags
                    },
                    heroLabel: 'Mattoni / Blocchi necessari (con +' + formatIT(wb, 0) + '% scarto)',
                    heroValue: bricksCount + ' Pezzi',
                    heroSub: 'Formato ' + formatIT(bLen, 0) + '×' + formatIT(bHei, 0) + '×' + formatIT(bDep, 0) + ' cm • Giunto ' + formatIT(gMm, 0) + ' mm',
                    details: [
                        { label: 'Malta secca d\'allettamento (+' + formatIT(wm, 0) + '% scarto)', value: formatIT(mortarKg, 1) + ' kg (' + mortarBags + ' sacchi da 25 kg)' },
                        { label: 'Superficie muratura netta', value: formatIT(netB, 2) + ' m²' }
                    ],
                    materialRows: [
                        { label: 'Mattoni / Blocchi (' + bricksCount + ' pz)', detail: brickPrice > 0 ? '€ ' + formatIT(brickPrice, 2) + '/pz' : null, totalCost: brickPrice > 0 ? brickPrice * bricksCount : null },
                        { label: 'Malta d\'allettamento (' + mortarBags + ' sacchi da 25 kg)', detail: mortarPrice > 0 ? '€ ' + formatIT(mortarPrice, 2) + '/sacco' : null, totalCost: mortarPrice > 0 ? mortarPrice * mortarBags : null }
                    ]
                };
                break;
            }

            case 'plaster': {
                var areaP = Math.max(0, parseSafeDouble(inp.area));
                var emptyP = Math.max(0, parseSafeDouble(inp.emptyArea));
                var netP = Math.max(0, areaP - emptyP);
                var thickMm = Math.max(0, parseSafeDouble(inp.thicknessMm));
                var yieldP = parseSafeDouble(inp.yieldKg) || 15;
                var bagWeightP = parseSafeDouble(inp.bagWeight) || 25;
                var wasteP = inp.waste !== undefined && inp.waste !== '' ? Math.max(0, parseSafeDouble(inp.waste)) : 10;

                var totalKgP = (netP * (thickMm / 10) * yieldP) * (1 + wasteP / 100);
                var bagsP = totalKgP > 0 ? Math.ceil(totalKgP / bagWeightP) : 0;
                var bagPriceP = Math.max(0, parseSafeDouble(inp.bagPrice));

                res = {
                    logicKey: 'plaster',
                    raw: {
                        netAreaMq: netP,
                        totalKg: totalKgP,
                        bags: bagsP
                    },
                    heroLabel: 'Sacchi di intonaco / rasante',
                    heroValue: bagsP + (bagsP === 1 ? ' Sacco' : ' Sacchi') + ' da ' + formatIT(bagWeightP, 0) + ' kg',
                    heroSub: 'Fabbisogno totale ' + formatIT(totalKgP, 1) + ' kg (+' + formatIT(wasteP, 0) + '% scarto)',
                    details: [
                        { label: 'Superficie netta parete', value: formatIT(netP, 2) + ' m²' },
                        { label: 'Spessore applicato / Resa', value: formatIT(thickMm, 1) + ' mm (' + formatIT(yieldP, 1) + ' kg/m² per cm)' }
                    ],
                    materialRows: [
                        { label: 'Intonaco / Rasante (' + bagsP + ' sacchi da ' + formatIT(bagWeightP, 0) + ' kg)', detail: bagPriceP > 0 ? '€ ' + formatIT(bagPriceP, 2) + '/sacco' : null, totalCost: bagPriceP > 0 ? bagPriceP * bagsP : null }
                    ]
                };
                break;
            }

            case 'stairs': {
                var hMeters = Math.max(0, parseSafeDouble(inp.height));
                var hCm = hMeters * 100;
                var lMeters = Math.max(0, parseSafeDouble(inp.length));
                var lCm = lMeters * 100;
                var widthM = Math.max(0, parseSafeDouble(inp.width));
                var slabCm = parseSafeDouble(inp.slabThickness) || 15.0;

                var steps = Math.max(1, Math.round(hCm / 17.0));
                var riser = hCm / steps;
                var treadsCount = steps > 1 ? steps - 1 : 1;
                var tread = lCm > 0 ? (lCm / treadsCount) : (63.0 - 2 * riser);
                var lCmEff = lCm > 0 ? lCm : (treadsCount * tread);

                var blondel = (2 * riser) + tread;
                var angleDeg = Math.atan2(riser, tread) * (180 / Math.PI);

                var comfortLevel = 0;
                var comfortLabel = 'Scala Comoda (Formula di Blondel Ottimale)';
                if (blondel < 59 || blondel > 66 || angleDeg > 42 || angleDeg < 20 || riser > 21) {
                    comfortLevel = 2;
                    comfortLabel = 'Attenzione: Scala Scomoda / Fuori Norma (verifica ingombro)';
                } else if (blondel < 61 || blondel > 64 || angleDeg > 38) {
                    comfortLevel = 1;
                    comfortLabel = 'Scala Ripida ma Accettabile';
                }

                var concreteVol = 0;
                if (widthM > 0) {
                    var stepAreaSqM = ((tread / 100) * (riser / 100)) / 2;
                    var stepsVol = stepAreaSqM * widthM * steps;
                    var inclinedLengthM = Math.sqrt(Math.pow(lCmEff / 100, 2) + Math.pow(hCm / 100, 2));
                    var slabVol = inclinedLengthM * widthM * (slabCm / 100);
                    concreteVol = stepsVol + slabVol;
                }

                var concretePrice = Math.max(0, parseSafeDouble(inp.concretePrice));
                var concreteCost = (concreteVol > 0 && concretePrice > 0) ? concreteVol * concretePrice : null;
                var rowsSt = [];
                if (concreteVol > 0) {
                    rowsSt.push({
                        label: 'Calcestruzzo rampa scala (' + formatIT(concreteVol, 2) + ' m³)',
                        detail: concretePrice > 0 ? '€ ' + formatIT(concretePrice, 2) + '/m³' : null,
                        totalCost: concreteCost
                    });
                }

                res = {
                    logicKey: 'stairs',
                    raw: {
                        steps: steps,
                        treadsCount: treadsCount,
                        riser: riser,
                        tread: tread,
                        totalLengthM: lCmEff / 100,
                        blondel: blondel,
                        angleDeg: angleDeg,
                        comfortLevel: comfortLevel,
                        concreteVol: concreteVol
                    },
                    comfortBadge: { level: comfortLevel, text: comfortLabel },
                    heroLabel: 'Sviluppo Rampa Scala',
                    heroValue: steps + ' Alzate (Gradini)',
                    heroSub: 'Alzata ' + formatIT(riser, 1) + ' cm • Pedata ' + formatIT(tread, 1) + ' cm',
                    details: [
                        { label: 'Verifica Formula di Blondel (2A + P)', value: formatIT(blondel, 1) + ' cm (ideale 62–64 cm)' },
                        { label: 'Inclinazione rampa', value: formatIT(angleDeg, 1) + '°' },
                        { label: 'Ingombro orizzontale in pianta (' + treadsCount + ' pedate)', value: formatIT(lCmEff / 100, 2) + ' m' },
                        { label: 'Volume calcestruzzo stimato', value: concreteVol > 0 ? formatIT(concreteVol, 2) + ' m³' : 'Inserisci larghezza scala per calcolarlo' }
                    ],
                    materialRows: rowsSt
                };
                break;
            }

            case 'roofing': {
                var areaR = Math.max(0, parseSafeDouble(inp.area));
                var overlapR = Math.max(0, parseSafeDouble(inp.overlap !== undefined ? inp.overlap : 10));
                var rollSqmR = parseSafeDouble(inp.rollSqm) || 10;
                var primerYieldR = Math.max(0, parseSafeDouble(inp.primerYield !== undefined ? inp.primerYield : 0.3));
                var primerBucketR = parseSafeDouble(inp.primerBucket) || 20;
                var wasteR = inp.waste !== undefined && inp.waste !== '' ? Math.max(0, parseSafeDouble(inp.waste)) : 10;

                var areaOverlapR = areaR * (1 + overlapR / 100);
                var rollsR = areaR > 0 ? Math.ceil((areaOverlapR * (1 + wasteR / 100)) / rollSqmR) : 0;
                var primerLitersR = areaR * primerYieldR;
                var bucketsR = primerLitersR > 0 ? Math.ceil(primerLitersR / primerBucketR) : 0;

                var rollPriceR = Math.max(0, parseSafeDouble(inp.rollPrice));
                var primerPriceR = Math.max(0, parseSafeDouble(inp.primerPrice));

                res = {
                    logicKey: 'roofing',
                    raw: {
                        rolls: rollsR,
                        primerLiters: primerLitersR,
                        primerBuckets: bucketsR
                    },
                    heroLabel: 'Rotoli di guaina bituminosa',
                    heroValue: rollsR + (rollsR === 1 ? ' Rotolo' : ' Rotoli'),
                    heroSub: 'Sormonto +' + formatIT(overlapR, 0) + '% • Scarto +' + formatIT(wasteR, 0) + '% (rotolo ' + formatIT(rollSqmR, 1) + ' m²)',
                    details: [
                        { label: 'Primer bituminoso necessario', value: bucketsR + (bucketsR === 1 ? ' Secchio' : ' Secchi') + ' da ' + formatIT(primerBucketR, 0) + ' L (' + formatIT(primerLitersR, 1) + ' L)' },
                        { label: 'Superficie lorda con sormonto', value: formatIT(areaOverlapR, 2) + ' m²' }
                    ],
                    materialRows: [
                        { label: 'Guaina impermeabilizzante (' + rollsR + ' rotoli)', detail: rollPriceR > 0 ? '€ ' + formatIT(rollPriceR, 2) + '/rotolo' : null, totalCost: rollPriceR > 0 ? rollPriceR * rollsR : null },
                        { label: 'Primer bituminoso (' + bucketsR + ' secchi)', detail: primerPriceR > 0 ? '€ ' + formatIT(primerPriceR, 2) + '/secchio' : null, totalCost: primerPriceR > 0 ? primerPriceR * bucketsR : null }
                    ]
                };
                break;
            }

            case 'gravel': {
                var isAreaG = inp.isAreaMode !== false && inp.isAreaMode !== 'sides';
                var areaG = isAreaG
                    ? Math.max(0, parseSafeDouble(inp.area))
                    : Math.max(0, parseSafeDouble(inp.length)) * Math.max(0, parseSafeDouble(inp.width));
                var thickG = Math.max(0, parseSafeDouble(inp.thickness));
                var densityG = parseSafeDouble(inp.density) || 1500;
                var wasteG = inp.waste !== undefined && inp.waste !== '' ? Math.max(0, parseSafeDouble(inp.waste)) : 5;

                var volG = areaG * (thickG / 100);
                var tonsG = ((volG * densityG) / 1000) * (1 + wasteG / 100);
                var bagsG = tonsG > 0 ? Math.ceil((tonsG * 1000) / 25) : 0;

                var bagPriceG = Math.max(0, parseSafeDouble(inp.bagPrice));
                var tonPriceG = Math.max(0, parseSafeDouble(inp.tonPrice));
                var gravelRow = tonPriceG > 0
                    ? { label: 'Ghiaia sfusa / Big-Bag (' + formatIT(tonsG, 2) + ' t)', detail: '€ ' + formatIT(tonPriceG, 2) + '/t', totalCost: tonPriceG * tonsG }
                    : { label: 'Ghiaia in sacchi da 25 kg (' + bagsG + ' sacchi)', detail: bagPriceG > 0 ? '€ ' + formatIT(bagPriceG, 2) + '/sacco' : null, totalCost: bagPriceG > 0 ? bagPriceG * bagsG : null };

                res = {
                    logicKey: 'gravel',
                    raw: {
                        areaMq: areaG,
                        volumeMc: volG,
                        tons: tonsG,
                        bags: bagsG
                    },
                    heroLabel: 'Fabbisogno ghiaia / inerti (+' + formatIT(wasteG, 0) + '% assestamento)',
                    heroValue: formatIT(tonsG, 2) + ' Tonnellate',
                    heroSub: 'Equivalenti a ' + bagsG + ' sacchi da 25 kg',
                    details: [
                        { label: 'Volume geometrico netto', value: formatIT(volG, 2) + ' m³ (' + formatIT(areaG, 2) + ' m² × ' + formatIT(thickG, 1) + ' cm)' },
                        { label: 'Densità applicata', value: formatIT(densityG, 0) + ' kg/m³' }
                    ],
                    materialRows: [gravelRow]
                };
                break;
            }

            case 'earthwork': {
                var wE = Math.max(0, parseSafeDouble(inp.width));
                var lE = Math.max(0, parseSafeDouble(inp.length));
                var dE = Math.max(0, parseSafeDouble(inp.depth));
                var truckCap = parseSafeDouble(inp.truckCap) || 10.0;
                var soilType = inp.soilType || 'agri';
                var swell = soilType === 'clay' ? 1.30 : (soilType === 'rock' ? 1.50 : 1.20);

                var bankVol = wE * lE * dE;
                var looseVol = bankVol * swell;
                var trucks = looseVol > 0 ? Math.ceil(looseVol / truckCap) : 0;

                var costExc = Math.max(0, parseSafeDouble(inp.costExcavation));
                var costDisp = Math.max(0, parseSafeDouble(inp.costDisposal));
                var soilLabel = soilType === 'clay' ? 'Argilla (+30%)' : (soilType === 'rock' ? 'Roccia/Macerie (+50%)' : 'Agricolo (+20%)');

                res = {
                    logicKey: 'earthwork',
                    raw: {
                        bankVol: bankVol,
                        looseVol: looseVol,
                        swellFactor: swell,
                        trucks: trucks
                    },
                    heroLabel: 'Volume terra smossa (con rigonfiamento)',
                    heroValue: formatIT(looseVol, 1) + ' m³ smossi',
                    heroSub: trucks + (trucks === 1 ? ' viaggio camion' : ' viaggi camion') + ' da ' + formatIT(truckCap, 1) + ' m³ • Terreno ' + soilLabel,
                    details: [
                        { label: 'Volume compatto di scavo (in banco)', value: formatIT(bankVol, 2) + ' m³' },
                        { label: 'Coefficiente di rigonfiamento', value: '× ' + formatIT(swell, 2) }
                    ],
                    materialRows: [
                        { label: 'Scavo meccanico (' + formatIT(bankVol, 1) + ' m³ in banco)', detail: costExc > 0 ? '€ ' + formatIT(costExc, 2) + '/m³' : null, totalCost: costExc > 0 ? costExc * bankVol : null },
                        { label: 'Trasporto / Smaltimento (' + trucks + ' viaggi)', detail: costDisp > 0 ? '€ ' + formatIT(costDisp, 2) + '/viaggio' : null, totalCost: costDisp > 0 ? costDisp * trucks : null }
                    ]
                };
                break;
            }

            case 'fencing': {
                var perimF = Math.max(0, parseSafeDouble(inp.perimeter));
                var gatesF = Math.max(0, parseSafeDouble(inp.gates));
                var spacingF = parseSafeDouble(inp.spacing) || 2.0;
                var wasteF = inp.waste !== undefined && inp.waste !== '' ? Math.max(0, parseSafeDouble(inp.waste)) : 10;

                var netF = Math.max(0, perimF - gatesF);
                var postsF = netF > 0 ? (Math.ceil(netF / spacingF) + 1) : 0;
                var meshF = netF > 0 ? netF * (1 + wasteF / 100) : 0;
                var concreteBagsF = postsF;

                var pricePost = Math.max(0, parseSafeDouble(inp.pricePost));
                var priceMesh = Math.max(0, parseSafeDouble(inp.priceMesh));
                var priceConcrete = Math.max(0, parseSafeDouble(inp.priceConcrete));

                res = {
                    logicKey: 'fencing',
                    raw: {
                        netPerimeter: netF,
                        posts: postsF,
                        meshM: meshF,
                        concreteBags: concreteBagsF
                    },
                    heroLabel: 'Pali e rete per la recinzione',
                    heroValue: postsF + ' Pali • ' + formatIT(meshF, 1) + ' m Rete',
                    heroSub: concreteBagsF + ' sacchi da 25 kg per plinti • Scarto rete +' + formatIT(wasteF, 0) + '%',
                    details: [
                        { label: 'Perimetro netto (tolti cancelli)', value: formatIT(netF, 2) + ' m (interasse ' + formatIT(spacingF, 2) + ' m)' },
                        { label: 'Cemento pronto per fissaggio pali', value: concreteBagsF + ' sacchi da 25 kg (1 sacco/palo)' }
                    ],
                    materialRows: [
                        { label: 'Pali recinzione (' + postsF + ' pz)', detail: pricePost > 0 ? '€ ' + formatIT(pricePost, 2) + '/palo' : null, totalCost: pricePost > 0 ? pricePost * postsF : null },
                        { label: 'Rete / Pannelli (' + formatIT(meshF, 1) + ' m)', detail: priceMesh > 0 ? '€ ' + formatIT(priceMesh, 2) + '/m' : null, totalCost: priceMesh > 0 ? priceMesh * meshF : null },
                        { label: 'Cemento plinti (' + concreteBagsF + ' sacchi)', detail: priceConcrete > 0 ? '€ ' + formatIT(priceConcrete, 2) + '/sacco' : null, totalCost: priceConcrete > 0 ? priceConcrete * concreteBagsF : null }
                    ]
                };
                break;
            }

            case 'lawn': {
                var isSeeds = inp.isSeeds !== false && inp.isSeeds !== 'sod';
                var isAreaL = inp.isAreaMode !== false && inp.isAreaMode !== 'sides';
                var areaL = isAreaL
                    ? Math.max(0, parseSafeDouble(inp.area))
                    : Math.max(0, parseSafeDouble(inp.length)) * Math.max(0, parseSafeDouble(inp.width));

                var seedDose = parseSafeDouble(inp.seedDose) || 30;
                var wasteSeeds = inp.wasteSeeds !== undefined && inp.wasteSeeds !== '' ? Math.max(0, parseSafeDouble(inp.wasteSeeds)) : 10;
                var wasteSod = inp.wasteSod !== undefined && inp.wasteSod !== '' ? Math.max(0, parseSafeDouble(inp.wasteSod)) : 5;
                var priceSeed = Math.max(0, parseSafeDouble(inp.priceSeed));
                var priceSod = Math.max(0, parseSafeDouble(inp.priceSod));

                var seedKg = 0;
                var sodMq = 0;
                var waterL = 0;
                var lawnCostRow;

                if (isSeeds) {
                    seedKg = ((areaL * seedDose) / 1000) * (1 + wasteSeeds / 100);
                    waterL = areaL * 15;
                    lawnCostRow = { label: 'Sementi da prato (' + formatIT(seedKg, 2) + ' kg)', detail: priceSeed > 0 ? '€ ' + formatIT(priceSeed, 2) + '/kg' : null, totalCost: priceSeed > 0 ? priceSeed * seedKg : null };
                } else {
                    sodMq = areaL * (1 + wasteSod / 100);
                    waterL = areaL * 25;
                    lawnCostRow = { label: 'Prato pronto a rotoli (' + formatIT(sodMq, 1) + ' m²)', detail: priceSod > 0 ? '€ ' + formatIT(priceSod, 2) + '/m²' : null, totalCost: priceSod > 0 ? priceSod * sodMq : null };
                }

                res = {
                    logicKey: 'lawn',
                    raw: {
                        isSeeds: isSeeds,
                        areaMq: areaL,
                        seedKg: seedKg,
                        sodMq: sodMq,
                        waterLiters: waterL
                    },
                    heroLabel: isSeeds ? 'Sementi da prato necessarie (+' + formatIT(wasteSeeds, 0) + '%)' : 'Prato a rotoli da ordinare (+' + formatIT(wasteSod, 0) + '%)',
                    heroValue: isSeeds ? (formatIT(seedKg, 1) + ' kg di semi') : (formatIT(sodMq, 1) + ' m² di zolle'),
                    heroSub: isSeeds ? ('Dose ' + formatIT(seedDose, 0) + ' g/m² su ' + formatIT(areaL, 1) + ' m²') : ('Area netta ' + formatIT(areaL, 1) + ' m² + sfrido bordi'),
                    details: [
                        { label: 'Acqua irrigazione iniziale stimata', value: formatIT(waterL, 0) + ' Litri (' + (isSeeds ? '15' : '25') + ' L/m²)' }
                    ],
                    materialRows: [lawnCostRow]
                };
                break;
            }

            case 'soil': {
                var isAreaSo = inp.isAreaMode !== false && inp.isAreaMode !== 'sides';
                var areaSo = isAreaSo
                    ? Math.max(0, parseSafeDouble(inp.area))
                    : Math.max(0, parseSafeDouble(inp.length)) * Math.max(0, parseSafeDouble(inp.width));
                var thickSo = Math.max(0, parseSafeDouble(inp.thickness));
                var bagVolSo = parseSafeDouble(inp.bagVolume) || 50;
                var wasteSo = inp.waste !== undefined && inp.waste !== '' ? Math.max(0, parseSafeDouble(inp.waste)) : 10;

                var volSoMc = areaSo * (thickSo / 100);
                var litersSo = (volSoMc * 1000) * (1 + wasteSo / 100);
                var bagsSo = litersSo > 0 ? Math.ceil(litersSo / bagVolSo) : 0;
                var bagPriceSo = Math.max(0, parseSafeDouble(inp.bagPrice));

                res = {
                    logicKey: 'soil',
                    raw: {
                        areaMq: areaSo,
                        liters: litersSo,
                        bags: bagsSo
                    },
                    heroLabel: 'Terriccio / Pacciamatura necessari (+' + formatIT(wasteSo, 0) + '% calo)',
                    heroValue: formatIT(litersSo, 0) + ' Litri (' + bagsSo + ' Sacchi)',
                    heroSub: 'Sacchi da ' + formatIT(bagVolSo, 0) + ' Litri • Spessore ' + formatIT(thickSo, 1) + ' cm',
                    details: [
                        { label: 'Superficie giardino / aiuola', value: formatIT(areaSo, 2) + ' m²' },
                        { label: 'Volume geometrico netto', value: formatIT(volSoMc, 2) + ' m³' }
                    ],
                    materialRows: [
                        { label: 'Terriccio / Corteccia (' + bagsSo + ' sacchi da ' + formatIT(bagVolSo, 0) + ' L)', detail: bagPriceSo > 0 ? '€ ' + formatIT(bagPriceSo, 2) + '/sacco' : null, totalCost: bagPriceSo > 0 ? bagPriceSo * bagsSo : null }
                    ]
                };
                break;
            }

            case 'potSoil': {
                var isRound = inp.isRound !== false && inp.isRound !== 'rect';
                var pHeight = Math.max(0, parseSafeDouble(inp.height));
                var potCount = Math.max(1, Math.round(parseSafeDouble(inp.potCount || 1)));
                var bagVolP = parseSafeDouble(inp.bagVolume) || 50;
                var wastePot = inp.waste !== undefined && inp.waste !== '' ? Math.max(0, parseSafeDouble(inp.waste)) : 10;

                var volCm3 = 0;
                if (isRound) {
                    var diam = Math.max(0, parseSafeDouble(inp.diameter));
                    var radius = diam / 2;
                    volCm3 = Math.PI * radius * radius * pHeight;
                } else {
                    var pLen = Math.max(0, parseSafeDouble(inp.length));
                    var pWid = Math.max(0, parseSafeDouble(inp.width));
                    volCm3 = pLen * pWid * pHeight;
                }

                var litersPot = (volCm3 / 1000) * potCount * (1 + wastePot / 100);
                var bagsPot = litersPot > 0 ? Math.ceil(litersPot / bagVolP) : 0;
                var bagPricePot = Math.max(0, parseSafeDouble(inp.bagPrice));

                res = {
                    logicKey: 'potSoil',
                    raw: {
                        isRound: isRound,
                        potCount: potCount,
                        liters: litersPot,
                        bags: bagsPot
                    },
                    heroLabel: 'Substrato per ' + potCount + (potCount === 1 ? ' vaso / fioriera' : ' vasi / fioriere'),
                    heroValue: bagsPot + (bagsPot === 1 ? ' Sacco' : ' Sacchi') + ' da ' + formatIT(bagVolP, 0) + ' L',
                    heroSub: formatIT(litersPot, 1) + ' Litri totali (+' + formatIT(wastePot, 0) + '% assestamento)',
                    details: [
                        { label: 'Volume netto singolo contenitore', value: formatIT(volCm3 / 1000, 1) + ' Litri' }
                    ],
                    materialRows: [
                        { label: 'Terriccio / Substrato (' + bagsPot + ' sacchi da ' + formatIT(bagVolP, 0) + ' L)', detail: bagPricePot > 0 ? '€ ' + formatIT(bagPricePot, 2) + '/sacco' : null, totalCost: bagPricePot > 0 ? bagPricePot * bagsPot : null }
                    ]
                };
                break;
            }

            case 'electrical': {
                var kw = Math.max(0, parseSafeDouble(inp.powerKw));
                var lenEl = Math.max(0, parseSafeDouble(inp.length));
                var voltageType = inp.voltage === '400' ? '400' : '230';
                var installType = inp.installType || 'tube';
                var cosPhi = 0.9;

                var ib = voltageType === '230'
                    ? (kw * 1000) / (230 * cosPhi)
                    : (kw * 1000) / (400 * 1.732 * cosPhi);

                var stdSections = [1.5, 2.5, 4.0, 6.0, 10.0, 16.0, 25.0, 35.0, 50.0, 70.0, 95.0, 120.0];
                var secCap = 120.0;
                for (var si = 0; si < stdSections.length; si++) {
                    if (getElectricalCapacity(stdSections[si], installType) >= ib) {
                        secCap = stdSections[si];
                        break;
                    }
                }

                var vNum = voltageType === '230' ? 230 : 400;
                var kFactor = vNum === 230 ? 2.0 : 1.732;
                var maxDrop = vNum * 0.04;
                var secVoltDrop = (kFactor * lenEl * ib * 0.0175) / maxDrop;
                var requiredSec = Math.max(secCap, secVoltDrop);

                var finalSection = 120.0;
                for (var sj = 0; sj < stdSections.length; sj++) {
                    if (stdSections[sj] >= requiredSec) {
                        finalSection = stdSections[sj];
                        break;
                    }
                }

                var iz = getElectricalCapacity(finalSection, installType);
                var stdBreakers = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160];
                var breaker = null;
                for (var bi = 0; bi < stdBreakers.length; bi++) {
                    if (stdBreakers[bi] >= ib && stdBreakers[bi] <= iz) {
                        breaker = stdBreakers[bi];
                        break;
                    }
                }
                if (breaker === null) {
                    for (var bj = 0; bj < stdBreakers.length; bj++) {
                        if (stdBreakers[bj] >= ib) {
                            breaker = stdBreakers[bj];
                            break;
                        }
                    }
                }
                if (breaker === null) breaker = 160;

                var priceMeterEl = Math.max(0, parseSafeDouble(inp.pricePerMeter));
                var cableCost = priceMeterEl > 0 ? priceMeterEl * lenEl : null;

                res = {
                    logicKey: 'electrical',
                    raw: {
                        currentIb: ib,
                        sectionCapacity: secCap,
                        sectionVoltageDrop: secVoltDrop,
                        finalSection: finalSection,
                        iz: iz,
                        breaker: breaker
                    },
                    heroLabel: 'Sezione minima consigliata (Rame, ΔV ≤ 4%)',
                    heroValue: formatIT(finalSection, finalSection % 1 === 0 ? 0 : 1) + ' mm²',
                    heroSub: 'Magnetotermico suggerito: ' + breaker + ' A • Corrente Ib: ' + formatIT(ib, 1) + ' A',
                    details: [
                        { label: 'Portata ammissibile Iz cavo scelto', value: formatIT(iz, 1) + ' A (' + (installType === 'tube' ? 'in tubo' : (installType === 'buried' ? 'interrato' : 'aria libera')) + ')' },
                        { label: 'Sistema / Lunghezza linea', value: (voltageType === '230' ? 'Monofase 230V' : 'Trifase 400V') + ' • ' + formatIT(lenEl, 1) + ' m' }
                    ],
                    materialRows: [
                        { label: 'Cavo elettrico ' + formatIT(finalSection, 1) + ' mm² (' + formatIT(lenEl, 1) + ' m)', detail: priceMeterEl > 0 ? '€ ' + formatIT(priceMeterEl, 2) + '/m' : null, totalCost: cableCost }
                    ]
                };
                break;
            }

            case 'plumbing': {
                var flowLmin = Math.max(0, parseSafeDouble(inp.flowLmin));
                var lenPl = Math.max(0, parseSafeDouble(inp.length));
                var matPl = inp.material || 'multilayer';
                var flowM3s = (flowLmin / 1000.0) / 60.0;
                var areaM2 = flowM3s / 1.5;
                var diamMm = (Math.sqrt(areaM2 / Math.PI) * 2) * 1000.0;

                var stdDiams = [10, 12, 14, 16, 18, 20, 22, 26, 32, 40, 50, 63, 75, 90, 110];
                var bestDiam = 110;
                for (var di = 0; di < stdDiams.length; di++) {
                    if (stdDiams[di] >= diamMm) {
                        bestDiam = stdDiams[di];
                        break;
                    }
                }

                var actualRadiusM = (bestDiam / 1000.0) / 2.0;
                var actualAreaM2 = Math.PI * actualRadiusM * actualRadiusM;
                var actualVel = flowM3s / actualAreaM2;

                var cFactor = matPl === 'copper' ? 135 : (matPl === 'steel' ? 100 : 140);
                var pressureDropBar = 0;
                if (flowM3s > 0 && lenPl > 0) {
                    var hf = (10.67 * lenPl * Math.pow(flowM3s, 1.852)) / (Math.pow(cFactor, 1.852) * Math.pow(bestDiam / 1000.0, 4.87));
                    pressureDropBar = hf * 0.0980665;
                }

                var priceMeterPl = Math.max(0, parseSafeDouble(inp.pricePerMeter));
                var matName = matPl === 'copper' ? 'Rame' : (matPl === 'steel' ? 'Acciaio' : (matPl === 'pex' ? 'PEX' : 'Multistrato'));

                res = {
                    logicKey: 'plumbing',
                    raw: {
                        diameterMm: bestDiam,
                        velocityMs: actualVel,
                        pressureDropBar: pressureDropBar
                    },
                    heroLabel: 'Diametro interno consigliato (target ~1,5 m/s)',
                    heroValue: 'Ø ' + bestDiam + ' mm (interno)',
                    heroSub: 'Perdita di carico: ' + formatIT(pressureDropBar, 2) + ' Bar • Velocità: ' + formatIT(actualVel, 2) + ' m/s',
                    details: [
                        { label: 'Materiale / Coefficiente Hazen-Williams', value: matName + ' (C = ' + cFactor + ')' },
                        { label: 'Portata / Tratta', value: formatIT(flowLmin, 1) + ' L/min su ' + formatIT(lenPl, 1) + ' m' }
                    ],
                    materialRows: [
                        { label: 'Tubazione ' + matName + ' Ø ' + bestDiam + ' mm (' + formatIT(lenPl, 1) + ' m)', detail: priceMeterPl > 0 ? '€ ' + formatIT(priceMeterPl, 2) + '/m' : null, totalCost: priceMeterPl > 0 ? priceMeterPl * lenPl : null }
                    ]
                };
                break;
            }

            case 'hvac': {
                var wH = Math.max(0, parseSafeDouble(inp.width));
                var lH = Math.max(0, parseSafeDouble(inp.length));
                var hH = Math.max(0, parseSafeDouble(inp.height));
                var ins = inp.insulation || 'avg';
                var exp = inp.exposure || 'north';
                var wins = Math.max(0, Math.round(parseSafeDouble(inp.windows !== undefined ? inp.windows : 1)));

                var volH = wH * lH * hH;
                var kH = ins === 'poor' ? 40 : (ins === 'exc' ? 20 : 30);
                var watts = volH * kH;
                if (exp === 'south') watts *= 1.10;
                watts += (watts * 0.05 * wins);

                var kwH = watts / 1000.0;
                var btuH = watts * 3.412142;
                var priceKw = Math.max(0, parseSafeDouble(inp.priceKw));

                res = {
                    logicKey: 'hvac',
                    raw: {
                        volumeMc: volH,
                        watts: watts,
                        kw: kwH,
                        btu: btuH
                    },
                    heroLabel: 'Fabbisogno termico stimato ambiente',
                    heroValue: formatIT(btuH, 0) + ' BTU/h',
                    heroSub: formatIT(kwH, 2) + ' kW (' + formatIT(watts, 0) + ' Watt)',
                    details: [
                        { label: 'Volume stanza', value: formatIT(volH, 1) + ' m³ (' + formatIT(wH * lH, 1) + ' m²)' },
                        { label: 'Parametri applicati', value: 'K=' + kH + ' • ' + (exp === 'south' ? 'Sud (+10%)' : 'Nord/Ombra') + ' • ' + wins + ' finestre' }
                    ],
                    materialRows: [
                        { label: 'Impianto / Condizionatore (' + formatIT(kwH, 2) + ' kW)', detail: priceKw > 0 ? '€ ' + formatIT(priceKw, 2) + '/kW' : null, totalCost: priceKw > 0 ? priceKw * kwH : null }
                    ]
                };
                break;
            }

            case 'scaffold': {
                var lenSc = Math.max(0, parseSafeDouble(inp.length));
                var heiSc = Math.max(0, parseSafeDouble(inp.height));
                var useMargins = inp.useSafetyMargins !== false && inp.useSafetyMargins !== 'false';
                var monthsSc = Math.max(0, parseSafeDouble(inp.months));

                var setupRate = Math.max(0, parseSafeDouble(inp.setupCost));
                var rentalRate = Math.max(0, parseSafeDouble(inp.rentalCost));
                var pimusCost = Math.max(0, parseSafeDouble(inp.pimusCost));
                var transportSc = Math.max(0, parseSafeDouble(inp.transportCost));
                var landTaxDay = Math.max(0, parseSafeDouble(inp.landTax));

                var scaffL = useMargins ? lenSc + 2.0 : lenSc;
                var scaffH = useMargins ? heiSc + 1.0 : heiSc;
                var areaSc = scaffL * scaffH;

                var setupTotal = areaSc * setupRate;
                var rentalTotal = areaSc * rentalRate * monthsSc;
                var landTaxTotal = landTaxDay * (monthsSc * 30);

                var fixedCost = setupTotal + pimusCost + transportSc;
                var varCost = rentalTotal + landTaxTotal;
                var totalSc = fixedCost + varCost;

                var rowsSc = [];
                if (setupTotal > 0) rowsSc.push({ label: 'Montaggio e Smontaggio (' + formatIT(areaSc, 1) + ' m²)', detail: '€ ' + formatIT(setupRate, 2) + '/m²', totalCost: setupTotal });
                if (rentalTotal > 0) rowsSc.push({ label: 'Noleggio struttura (' + formatIT(monthsSc, 1) + ' mesi)', detail: '€ ' + formatIT(rentalRate, 2) + '/m²/mese', totalCost: rentalTotal });
                if (pimusCost > 0) rowsSc.push({ label: 'Redazione Pi.M.U.S.', detail: 'Fisso', totalCost: pimusCost });
                if (transportSc > 0) rowsSc.push({ label: 'Trasporto A/R', detail: 'Fisso', totalCost: transportSc });
                if (landTaxTotal > 0) rowsSc.push({ label: 'Occupazione Suolo Pubblico (' + formatIT(monthsSc * 30, 0) + ' gg)', detail: '€ ' + formatIT(landTaxDay, 2) + '/gg', totalCost: landTaxTotal });
                if (rowsSc.length === 0) {
                    rowsSc.push({ label: 'Ponteggio facciata (' + formatIT(areaSc, 2) + ' m²)', detail: null, totalCost: null });
                }

                res = {
                    logicKey: 'scaffold',
                    raw: {
                        areaMq: areaSc,
                        fixedCost: fixedCost,
                        varCost: varCost,
                        totalCost: totalSc
                    },
                    heroLabel: 'Superficie ponteggio di facciata',
                    heroValue: formatIT(areaSc, 2) + ' m²',
                    heroSub: useMargins ? 'Include margini sicurezza (+2 m lunghezza, +1 m altezza)' : 'Senza margini di sicurezza aggiuntivi',
                    details: [
                        { label: 'Costi fissi (M/S + Pi.M.U.S. + Trasporto)', value: '€ ' + formatIT(fixedCost, 2) },
                        { label: 'Costi variabili (' + formatIT(monthsSc, 1) + ' mesi + suolo pubblico)', value: '€ ' + formatIT(varCost, 2) }
                    ],
                    materialRows: rowsSc
                };
                break;
            }

            case 'equipment': {
                var eqType = inp.equipmentType || 'excavator';
                var eqName = eqType === 'other'
                    ? (String(inp.customName || '').trim() || 'Attrezzatura personalizzata')
                    : (EQUIPMENT_LABELS[eqType] || 'Attrezzatura cantiere');
                var dailyRate = Math.max(0, parseSafeDouble(inp.dailyRate));
                var days = Math.max(0, parseSafeDouble(inp.days !== undefined ? inp.days : 1));
                var transportEq = Math.max(0, parseSafeDouble(inp.transport));
                var fuelOp = Math.max(0, parseSafeDouble(inp.fuelOp));

                var dailyTotal = dailyRate + fuelOp;
                var rentalOnly = dailyTotal * days;
                var totalEq = rentalOnly + transportEq;

                var rowsEq = [
                    { label: eqName + ' (' + formatIT(days, days % 1 === 0 ? 0 : 1) + ' gg × € ' + formatIT(dailyTotal, 2) + '/g)', detail: 'Tariffa + gasolio/op.', totalCost: rentalOnly }
                ];
                if (transportEq > 0) {
                    rowsEq.push({ label: 'Trasporto consegna e ritiro A/R', detail: 'Fisso', totalCost: transportEq });
                }

                res = {
                    logicKey: 'equipment',
                    raw: {
                        equipmentName: eqName,
                        dailyTotal: dailyTotal,
                        rentalOnly: rentalOnly,
                        totalCost: totalEq
                    },
                    heroLabel: 'Costo totale noleggio mezzo',
                    heroValue: '€ ' + formatIT(totalEq, 2),
                    heroSub: eqName + ' per ' + formatIT(days, days % 1 === 0 ? 0 : 1) + (days === 1 ? ' giorno' : ' giorni'),
                    details: [
                        { label: 'Costo giornaliero effettivo (noleggio + gasolio/op.)', value: '€ ' + formatIT(dailyTotal, 2) + '/giorno' },
                        { label: 'Subtotale soli giorni lavorativi', value: '€ ' + formatIT(rentalOnly, 2) },
                        { label: 'Trasporto andata/ritorno', value: '€ ' + formatIT(transportEq, 2) }
                    ],
                    materialRows: rowsEq
                };
                break;
            }

            default:
                throw new Error('Unknown calculator logicKey: ' + logicKey);
        }

        res.summary = buildSummary(res.materialRows, extraItems, laborInput);
        return res;
    }

    return {
        parseSafeDouble: parseSafeDouble,
        formatIT: formatIT,
        computeExtrasAndLabor: computeExtrasAndLabor,
        buildSummary: buildSummary,
        calculate: calculate
    };
}));
