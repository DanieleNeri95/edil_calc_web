import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const logic = require('../js/calculators-logic.js');

const approx = (actual, expected, tol = 1e-2, msg = '') => {
    assert.ok(Math.abs(actual - expected) <= tol, `${msg} expected ~${expected}, got ${actual}`);
};

let passed = 0;
function test(name, fn) {
    fn();
    passed++;
    console.log(`PASS: ${name}`);
}

test('parseSafeDouble handles commas, spaces, invalid strings', () => {
    assert.equal(logic.parseSafeDouble('12,5'), 12.5);
    assert.equal(logic.parseSafeDouble('  3.75 '), 3.75);
    assert.equal(logic.parseSafeDouble(''), 0);
    assert.equal(logic.parseSafeDouble('abc'), 0);
    assert.equal(logic.parseSafeDouble(null), 0);
});

test('1. paint — area vs sides, empty area, method waste & cost', () => {
    const r = logic.calculate('paint', {
        isMqMode: true,
        area: '68,6',
        emptyArea: '3,6',
        coverage: '11',
        coats: '2',
        method: 'Rullo',
        waste: '5',
        priceLiter: '9,5'
    });
    approx(r.raw.netMq, 65.0, 1e-4);
    approx(r.raw.liters, 12.409, 0.01);
    approx(r.summary.grandTotal, r.raw.liters * 9.5, 0.02);

    const rSides = logic.calculate('paint', {
        isMqMode: false,
        width: '4',
        height: '3',
        emptyArea: '20',
        coverage: '10',
        coats: '2',
        method: 'Spruzzo',
        waste: '15'
    });
    assert.equal(rSides.raw.netMq, 0);
    assert.equal(rSides.raw.liters, 0);
});

test('2. drywall — double sided vs single sided, studs, tracks, screws, extras + labor', () => {
    const r = logic.calculate('drywall', {
        isDoubleSided: true,
        wallWidth: '5',
        wallHeight: '2,7',
        emptyArea: '1,68',
        waste: '10',
        panelWidth: '1,2',
        panelHeight: '2,0',
        studSpacing: '60',
        panelPrice: '10'
    }, [
        { name: 'Lana di roccia', qty: 12, unit: 'm²', unitPrice: 5.5 }
    ], {
        isFlatRate: false,
        hours: 8,
        hourlyRate: 30
    });
    approx(r.raw.netWallArea, 11.82, 0.01);
    assert.equal(r.raw.panels, 12);
    approx(r.raw.tracks, 11.0, 0.01);
    assert.equal(r.raw.studs, 11);
    assert.equal(r.raw.screws, 360);
    assert.equal(r.raw.screwBoxes, 1);
    approx(r.summary.totalMaterialsOnly, 120, 0.01);
    approx(r.summary.extraTotal, 66, 0.01);
    approx(r.summary.totalLabor, 240, 0.01);
    approx(r.summary.grandTotal, 426, 0.01);
});

test('3. wallpaper — strips, pattern repeat, rolls & glue', () => {
    const r = logic.calculate('wallpaper', {
        wallWidth: '4,2',
        wallHeight: '2,7',
        emptyArea: '0',
        rollWidth: '53',
        rollLength: '10',
        patternRepeat: '32',
        glueYield: '200',
        wasteRolls: '10',
        wasteGlue: '10'
    });
    assert.equal(r.raw.stripsNeeded, 8);
    assert.equal(r.raw.stripsPerRoll, 3);
    assert.equal(r.raw.rolls, 3);
    approx(r.raw.glueKg, 2.4948, 0.01);
});

test('4. tiles — grout included, waste, boxes & bug fix for tilePrice without boxPrice', () => {
    const r = logic.calculate('tiles', {
        area: '32',
        emptyArea: '0',
        tileLength: '60',
        tileWidth: '60',
        grout: '2',
        boxMq: '1,44',
        waste: '10',
        tilePrice: '25',
        boxPrice: ''
    });
    assert.equal(r.raw.neededTiles, 89);
    assert.equal(r.raw.tilesWithWaste, 98);
    assert.equal(r.raw.boxes, 25);
    approx(r.raw.glueKg, 140.8, 0.1);
    approx(r.raw.groutKg, 17.6, 0.1);
    // Tile cost applies cleanly when boxPrice is empty!
    approx(r.summary.totalMaterialsOnly, 35.2 * 25, 0.01);

    const rBox = logic.calculate('tiles', {
        area: '32',
        tileLength: '60',
        tileWidth: '60',
        grout: '2',
        boxMq: '1,44',
        waste: '10',
        tilePrice: '25',
        boxPrice: '40'
    });
    approx(rBox.summary.totalMaterialsOnly, 25 * 40, 0.01);
});

test('5. skirting — dynamic walls, subtract doors, rods ceil', () => {
    const r = logic.calculate('skirting', {
        walls: ['4', '3,5', '4', '3,5'],
        doors: '1',
        doorWidth: '0,9',
        rodLength: '2,4',
        waste: '10',
        rodPrice: '12'
    });
    approx(r.raw.perimeter, 15.0, 0.01);
    approx(r.raw.netMeters, 14.1, 0.01);
    approx(r.raw.metersWithWaste, 15.51, 0.01);
    assert.equal(r.raw.rods, 7);
    approx(r.summary.grandTotal, 84, 0.01);
});

test('6. cement — premixed vs traditional cement + sand', () => {
    const premix = logic.calculate('cement', {
        isPremiscelato: true,
        area: '40',
        thickness: '5',
        waste: '10',
        bagWeight: '25',
        bagPrice: '4'
    });
    approx(premix.raw.volumeMc, 2.0, 0.01);
    approx(premix.raw.volumeMcWithWaste, 2.2, 0.01);
    assert.equal(premix.raw.bags, 163);
    assert.equal(premix.raw.sandMc, 0);
    approx(premix.summary.grandTotal, 163 * 4, 0.01);

    const trad = logic.calculate('cement', {
        isPremiscelato: false,
        area: '40',
        thickness: '5',
        waste: '10',
        bagWeight: '25',
        bagPrice: '5',
        sandPrice: '40'
    });
    assert.equal(trad.raw.bags, 27);
    approx(trad.raw.sandMc, 2.2, 0.01);
    approx(trad.summary.grandTotal, 27 * 5 + 2.2 * 40, 0.01);
});

test('7. bricks — blocks, mortar kg, 25kg mortar bags & pricing', () => {
    const r = logic.calculate('bricks', {
        wallArea: '15',
        emptyArea: '1,6',
        wasteBricks: '10',
        wasteMortar: '10',
        brickLength: '25',
        brickHeight: '12',
        brickDepth: '12',
        grout: '10',
        brickPrice: '0,60',
        mortarPrice: '4,50'
    });
    approx(r.raw.netAreaMq, 13.4, 0.01);
    assert.equal(r.raw.bricks, 437);
    approx(r.raw.mortarKg, 357.8, 0.5);
    assert.equal(r.raw.mortarBags, 15);
    approx(r.summary.totalMaterialsOnly, 437 * 0.6 + 15 * 4.5, 0.01);
});

test('8. plaster — thickness mm, yield, bag weight', () => {
    const r = logic.calculate('plaster', {
        area: '25',
        emptyArea: '0',
        thicknessMm: '15',
        yieldKg: '15',
        bagWeight: '25',
        waste: '10',
        bagPrice: '5'
    });
    approx(r.raw.totalKg, 618.75, 0.01);
    assert.equal(r.raw.bags, 25);
    approx(r.summary.grandTotal, 125, 0.01);
});

test('9. stairs — Blondel ideal free mode + concrete volume + danger check', () => {
    const r = logic.calculate('stairs', {
        height: '3,0',
        length: '',
        width: '1,0',
        slabThickness: '15'
    });
    assert.equal(r.raw.steps, 18);
    approx(r.raw.riser, 16.67, 0.02);
    approx(r.raw.tread, 29.67, 0.02);
    approx(r.raw.blondel, 63.0, 0.01);
    assert.equal(r.raw.comfortLevel, 0);
    approx(r.raw.concreteVol, 1.33, 0.02);

    const steep = logic.calculate('stairs', {
        height: '3,0',
        length: '2,5'
    });
    assert.equal(steep.raw.comfortLevel, 2);
});

test('10. roofing — overlap + waste for rolls, net area for primer', () => {
    const r = logic.calculate('roofing', {
        area: '85',
        overlap: '10',
        rollSqm: '10',
        primerYield: '0,3',
        primerBucket: '20',
        waste: '10'
    });
    assert.equal(r.raw.rolls, 11);
    approx(r.raw.primerLiters, 25.5, 0.01);
    assert.equal(r.raw.primerBuckets, 2);
});

test('11. gravel — sides mode, tons & bags', () => {
    const r = logic.calculate('gravel', {
        isAreaMode: false,
        length: '15',
        width: '2',
        thickness: '5',
        density: '1500',
        waste: '5'
    });
    approx(r.raw.volumeMc, 1.5, 0.01);
    approx(r.raw.tons, 2.3625, 0.01);
    assert.equal(r.raw.bags, 95);
});

test('12. earthwork — swell factor clay 1.3 & trucks', () => {
    const r = logic.calculate('earthwork', {
        width: '8',
        length: '4',
        depth: '1,5',
        soilType: 'clay',
        truckCap: '10',
        costExcavation: '12',
        costDisposal: '180'
    });
    approx(r.raw.bankVol, 48.0, 0.01);
    approx(r.raw.looseVol, 62.4, 0.01);
    assert.equal(r.raw.trucks, 7);
    approx(r.summary.grandTotal, 48 * 12 + 7 * 180, 0.01);
});

test('13. fencing — gates subtraction, posts, mesh & concrete', () => {
    const r = logic.calculate('fencing', {
        perimeter: '64',
        gates: '4',
        spacing: '2,0',
        waste: '10'
    });
    approx(r.raw.netPerimeter, 60, 0.01);
    assert.equal(r.raw.posts, 31);
    approx(r.raw.meshM, 66, 0.01);
    assert.equal(r.raw.concreteBags, 31);
});

test('14. lawn — seeds vs sod', () => {
    const seeds = logic.calculate('lawn', {
        isSeeds: true,
        isAreaMode: true,
        area: '120',
        seedDose: '30',
        wasteSeeds: '10'
    });
    approx(seeds.raw.seedKg, 3.96, 0.01);
    approx(seeds.raw.waterLiters, 1800, 0.1);

    const sod = logic.calculate('lawn', {
        isSeeds: false,
        isAreaMode: true,
        area: '120',
        wasteSod: '5'
    });
    approx(sod.raw.sodMq, 126.0, 0.01);
    approx(sod.raw.waterLiters, 3000, 0.1);
});

test('15. soil — liters & bags', () => {
    const r = logic.calculate('soil', {
        isAreaMode: false,
        length: '6',
        width: '2,5',
        thickness: '6',
        bagVolume: '70',
        waste: '10'
    });
    approx(r.raw.liters, 990, 0.1);
    assert.equal(r.raw.bags, 15);
});

test('16. potSoil — round vs rectangular with multiple pots', () => {
    const rect = logic.calculate('potSoil', {
        isRound: false,
        length: '80',
        width: '35',
        height: '35',
        potCount: '3',
        bagVolume: '50',
        waste: '10'
    });
    approx(rect.raw.liters, 323.4, 0.1);
    assert.equal(rect.raw.bags, 7);

    const round = logic.calculate('potSoil', {
        isRound: true,
        diameter: '40',
        height: '35',
        potCount: '1',
        bagVolume: '50',
        waste: '10'
    });
    approx(round.raw.liters, 48.38, 0.1);
    assert.equal(round.raw.bags, 1);
});

test('17. electrical — 4.5kW 22m tube 230V & cost included in grandTotal', () => {
    const r = logic.calculate('electrical', {
        powerKw: '4,5',
        length: '22',
        voltage: '230',
        installType: 'tube',
        pricePerMeter: '2,5'
    });
    approx(r.raw.currentIb, 21.74, 0.05);
    assert.equal(r.raw.finalSection, 4.0);
    assert.equal(r.raw.breaker, 25);
    approx(r.summary.grandTotal, 55.0, 0.01);
});

test('18. plumbing — Hazen-Williams + high flow fallback to 110mm', () => {
    const r = logic.calculate('plumbing', {
        flowLmin: '22',
        pressure: '3',
        length: '18',
        material: 'multilayer'
    });
    assert.equal(r.raw.diameterMm, 18);
    approx(r.raw.velocityMs, 1.44, 0.02);
    approx(r.raw.pressureDropBar, 0.27, 0.01);

    const highFlow = logic.calculate('plumbing', {
        flowLmin: '2000',
        length: '10',
        material: 'steel'
    });
    assert.equal(highFlow.raw.diameterMm, 110);
});

test('19. hvac — volume, insulation, south exposure & windows', () => {
    const r = logic.calculate('hvac', {
        width: '5',
        length: '6',
        height: '2,8',
        insulation: 'avg',
        exposure: 'south',
        windows: '2'
    });
    approx(r.raw.volumeMc, 84, 0.01);
    approx(r.raw.watts, 3049.2, 0.5);
    approx(r.raw.kw, 3.05, 0.01);
    approx(r.raw.btu, 10404, 5);
});

test('20. scaffold — margins, fixed & variable costs', () => {
    const r = logic.calculate('scaffold', {
        length: '12',
        height: '9',
        useSafetyMargins: true,
        months: '2',
        setupCost: '12',
        rentalCost: '2,5',
        pimusCost: '250',
        transportCost: '180',
        landTax: '15'
    });
    approx(r.raw.areaMq, 140, 0.01);
    approx(r.raw.fixedCost, 2110, 0.01);
    approx(r.raw.varCost, 1600, 0.01);
    approx(r.raw.totalCost, 3710, 0.01);
    approx(r.summary.grandTotal, 3710, 0.01);
});

test('21. equipment — rental + fuel + transport + extras + flat labor in grandTotal', () => {
    const r = logic.calculate('equipment', {
        equipmentType: 'excavator',
        dailyRate: '120',
        days: '4',
        transport: '140',
        fuelOp: '25'
    }, [
        { name: 'Benna stretta', qty: 1, unit: 'pz', unitPrice: 30 }
    ], {
        isFlatRate: true,
        flatRate: 150
    });
    approx(r.raw.dailyTotal, 145, 0.01);
    approx(r.raw.rentalOnly, 580, 0.01);
    approx(r.raw.totalCost, 720, 0.01);
    approx(r.summary.grandTotal, 720 + 30 + 150, 0.01);
    assert.equal(r.summary.missingLaborWarning, false);
});

console.log(`\nALL ${passed} FORMULA TEST SUITES PASSED!`);
