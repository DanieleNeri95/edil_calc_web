// Input field schemas for all 21 interactive calculators (1:1 parity with js/calculators-logic.js)

export const FORM_SCHEMAS = {
    paint: {
        primary: [
            {
                type: 'segmented', name: 'isMqMode', label: 'Modalità di calcolo superficie', fullWidth: true,
                options: [
                    { value: 'true', label: 'Da Area (mq)', default: true },
                    { value: 'sides', label: 'Da Lati (L × H)' }
                ]
            },
            { type: 'decimal', name: 'area', label: 'Superficie totale pareti / soffitto', unit: 'mq', placeholder: 'es. 65', required: true, showWhen: 'isMqMode=true' },
            { type: 'decimal', name: 'width', label: 'Larghezza totale pareti', unit: 'm', placeholder: 'es. 12', required: true, showWhen: 'isMqMode=sides' },
            { type: 'decimal', name: 'height', label: 'Altezza pareti', unit: 'm', placeholder: 'es. 2,80', required: true, showWhen: 'isMqMode=sides' },
            { type: 'decimal', name: 'emptyArea', label: 'Vuoti da sottrarre (porte/finestre)', unit: 'mq', placeholder: '0' },
            { type: 'decimal', name: 'coats', label: 'Numero di mani', unit: 'mani', value: '2', placeholder: '2', required: true },
            {
                type: 'segmented', name: 'method', label: 'Tecnica di applicazione', fullWidth: true,
                options: [
                    { value: 'Rullo', label: 'Rullo (+5% sfrido)', default: true },
                    { value: 'Pennello', label: 'Pennello (+5%)' },
                    { value: 'Spruzzo', label: 'Airless / Spruzzo (+15%)' }
                ]
            }
        ],
        advanced: [
            { type: 'decimal', name: 'coverage', label: 'Resa della pittura', unit: 'mq/L', value: '10', placeholder: '10' },
            { type: 'decimal', name: 'waste', label: 'Sfrido / Margine sicurezza', unit: '%', value: '5', placeholder: '5' }
        ],
        costs: [
            { type: 'decimal', name: 'priceLiter', label: 'Costo pittura al litro', unit: '€/L', placeholder: 'es. 6,50', fullWidth: true }
        ]
    },

    drywall: {
        primary: [
            {
                type: 'segmented', name: 'wallType', label: 'Tipologia parete cartongesso', fullWidth: true,
                options: [
                    { value: '2', label: 'Parete Doppia Lastra (2 lati)', default: true },
                    { value: '1', label: 'Controparete / Singola Lastra (1 lato)' }
                ]
            },
            { type: 'decimal', name: 'wallWidth', label: 'Lunghezza parete', unit: 'm', placeholder: 'es. 4,50', required: true },
            { type: 'decimal', name: 'wallHeight', label: 'Altezza parete', unit: 'm', placeholder: 'es. 2,80', required: true },
            { type: 'decimal', name: 'emptyArea', label: 'Vuoti da sottrarre (porte/finestre)', unit: 'mq', placeholder: '0', fullWidth: true }
        ],
        advanced: [
            { type: 'decimal', name: 'panelWidth', label: 'Larghezza lastra', unit: 'm', value: '1,2', placeholder: '1,2' },
            { type: 'decimal', name: 'panelHeight', label: 'Altezza lastra', unit: 'm', value: '2,0', placeholder: '2,0' },
            { type: 'decimal', name: 'studSpacing', label: 'Interasse montanti', unit: 'cm', value: '60', placeholder: '60' },
            { type: 'decimal', name: 'waste', label: 'Sfrido tagli lastre', unit: '%', value: '10', placeholder: '10' }
        ],
        costs: [
            { type: 'decimal', name: 'panelPrice', label: 'Prezzo singola lastra', unit: '€/pz', placeholder: 'es. 9,50' },
            { type: 'decimal', name: 'trackPrice', label: 'Prezzo guida a U (barra 3 m)', unit: '€/pz', placeholder: 'es. 5,20' },
            { type: 'decimal', name: 'studPrice', label: 'Prezzo montante a C (barra 3 m)', unit: '€/pz', placeholder: 'es. 6,00' },
            { type: 'decimal', name: 'screwPrice', label: 'Prezzo scatola viti (1.000 pz)', unit: '€/scat.', placeholder: 'es. 14,00' }
        ]
    },

    wallpaper: {
        primary: [
            { type: 'decimal', name: 'wallWidth', label: 'Larghezza totale parete/i', unit: 'm', placeholder: 'es. 4,20', required: true },
            { type: 'decimal', name: 'wallHeight', label: 'Altezza parete', unit: 'm', placeholder: 'es. 2,80', required: true },
            { type: 'decimal', name: 'emptyArea', label: 'Superficie vuoti (porte/finestre)', unit: 'mq', placeholder: '0', fullWidth: true }
        ],
        advanced: [
            { type: 'decimal', name: 'rollWidth', label: 'Larghezza rotolo', unit: 'cm', value: '53', placeholder: '53' },
            { type: 'decimal', name: 'rollLength', label: 'Lunghezza rotolo', unit: 'm', value: '10', placeholder: '10' },
            { type: 'decimal', name: 'patternRepeat', label: 'Rapporto disegno (Pattern Repeat)', unit: 'cm', value: '0', placeholder: '0' },
            { type: 'decimal', name: 'glueYield', label: 'Consumo colla', unit: 'g/mq', value: '200', placeholder: '200' },
            { type: 'decimal', name: 'wasteRolls', label: 'Sfrido teli/rotoli', unit: '%', value: '10', placeholder: '10' },
            { type: 'decimal', name: 'wasteGlue', label: 'Margine sicurezza colla', unit: '%', value: '10', placeholder: '10' }
        ],
        costs: [
            { type: 'decimal', name: 'rollPrice', label: 'Prezzo per singolo rotolo', unit: '€/rot.', placeholder: 'es. 28,00' },
            { type: 'decimal', name: 'gluePrice', label: 'Prezzo confezione colla (200 g)', unit: '€/conf.', placeholder: 'es. 7,50' }
        ]
    },

    tiles: {
        primary: [
            { type: 'decimal', name: 'area', label: 'Superficie lorda da piastrellare', unit: 'mq', placeholder: 'es. 24', required: true },
            { type: 'decimal', name: 'emptyArea', label: 'Zone escluse (doccia/mobili fissi)', unit: 'mq', placeholder: '0' },
            { type: 'decimal', name: 'tileLength', label: 'Lato A piastrella', unit: 'cm', value: '60', placeholder: '60', required: true },
            { type: 'decimal', name: 'tileWidth', label: 'Lato B piastrella', unit: 'cm', value: '60', placeholder: '60', required: true }
        ],
        advanced: [
            { type: 'decimal', name: 'grout', label: 'Larghezza fuga', unit: 'mm', value: '2', placeholder: '2' },
            { type: 'decimal', name: 'boxMq', label: 'Resa per scatola', unit: 'mq/scat.', value: '1,5', placeholder: '1,5' },
            { type: 'decimal', name: 'waste', label: 'Sfrido tagli (10% dritta, 15% diagonale)', unit: '%', value: '10', placeholder: '10' }
        ],
        costs: [
            { type: 'decimal', name: 'tilePrice', label: 'Prezzo piastrelle al mq', unit: '€/mq', placeholder: 'es. 26,00' },
            { type: 'decimal', name: 'boxPrice', label: 'Prezzo a scatola (alternativo)', unit: '€/scat.', placeholder: 'es. 39,00' }
        ]
    },

    skirting: {
        primary: [
            { type: 'walls', name: 'walls', label: 'Lunghezza pareti della stanza', fullWidth: true },
            { type: 'decimal', name: 'doors', label: 'Numero porte da sottrarre', unit: 'pz', value: '1', placeholder: '1' },
            { type: 'decimal', name: 'doorWidth', label: 'Larghezza media porta (luce)', unit: 'm', value: '0,9', placeholder: '0,9' }
        ],
        advanced: [
            { type: 'decimal', name: 'rodLength', label: 'Lunghezza singola asta battiscopa', unit: 'm', value: '2,4', placeholder: '2,4' },
            { type: 'decimal', name: 'waste', label: 'Sfrido tagli a 45° e sfridi', unit: '%', value: '10', placeholder: '10' }
        ],
        costs: [
            { type: 'decimal', name: 'rodPrice', label: 'Prezzo singola asta battiscopa', unit: '€/asta', placeholder: 'es. 8,50', fullWidth: true }
        ]
    },

    cement: {
        primary: [
            {
                type: 'segmented', name: 'isPremiscelato', label: 'Tipo di impasto massetto', fullWidth: true,
                options: [
                    { value: 'true', label: 'Massetto Premiscelato', default: true },
                    { value: 'traditional', label: 'Tradizionale (Sabbia + Cemento)' }
                ]
            },
            { type: 'decimal', name: 'area', label: 'Superficie massetto', unit: 'mq', placeholder: 'es. 45', required: true },
            { type: 'decimal', name: 'thickness', label: 'Spessore medio massetto', unit: 'cm', placeholder: 'es. 6', required: true }
        ],
        advanced: [
            { type: 'decimal', name: 'bagWeight', label: 'Peso singolo sacco', unit: 'kg', value: '25', placeholder: '25' },
            { type: 'decimal', name: 'waste', label: 'Sfrido e irregolarità fondo', unit: '%', value: '10', placeholder: '10' }
        ],
        costs: [
            { type: 'decimal', name: 'bagPrice', label: 'Prezzo sacco (premiscelato o cemento)', unit: '€/sacco', placeholder: 'es. 4,50' },
            { type: 'decimal', name: 'sandPrice', label: 'Prezzo sabbia al metro cubo', unit: '€/mc', placeholder: 'es. 38,00', showWhen: 'isPremiscelato=traditional' }
        ]
    },

    bricks: {
        primary: [
            { type: 'decimal', name: 'wallArea', label: 'Superficie lorda muro', unit: 'mq', placeholder: 'es. 18', required: true },
            { type: 'decimal', name: 'emptyArea', label: 'Vuoti da sottrarre (porte/finestre)', unit: 'mq', placeholder: '0' }
        ],
        advanced: [
            { type: 'decimal', name: 'brickLength', label: 'Lunghezza blocco / mattone', unit: 'cm', value: '25', placeholder: '25' },
            { type: 'decimal', name: 'brickHeight', label: 'Altezza blocco / mattone', unit: 'cm', value: '12', placeholder: '12' },
            { type: 'decimal', name: 'brickDepth', label: 'Spessore muro (profondità)', unit: 'cm', value: '12', placeholder: '12' },
            { type: 'decimal', name: 'grout', label: 'Spessore giunto di malta', unit: 'mm', value: '10', placeholder: '10' },
            { type: 'decimal', name: 'wasteBricks', label: 'Sfrido rotture laterizi', unit: '%', value: '10', placeholder: '10' },
            { type: 'decimal', name: 'wasteMortar', label: 'Sfrido malta', unit: '%', value: '10', placeholder: '10' }
        ],
        costs: [
            { type: 'decimal', name: 'brickPrice', label: 'Prezzo singolo mattone/blocco', unit: '€/pz', placeholder: 'es. 0,65' },
            { type: 'decimal', name: 'mortarPrice', label: 'Prezzo sacco malta (25 kg)', unit: '€/sacco', placeholder: 'es. 4,20' }
        ]
    },

    plaster: {
        primary: [
            { type: 'decimal', name: 'area', label: 'Superficie parete da intonacare', unit: 'mq', placeholder: 'es. 35', required: true },
            { type: 'decimal', name: 'emptyArea', label: 'Vuoti da sottrarre (porte/finestre)', unit: 'mq', placeholder: '0' },
            { type: 'decimal', name: 'thicknessMm', label: 'Spessore medio intonaco', unit: 'mm', value: '15', placeholder: '15', required: true, fullWidth: true }
        ],
        advanced: [
            { type: 'decimal', name: 'yieldKg', label: 'Consumo prodotto (per 10 mm spessore)', unit: 'kg/mq·cm', value: '15', placeholder: '15' },
            { type: 'decimal', name: 'bagWeight', label: 'Peso singolo sacco', unit: 'kg', value: '25', placeholder: '25' },
            { type: 'decimal', name: 'waste', label: 'Sfrido e fuori piombo', unit: '%', value: '10', placeholder: '10' }
        ],
        costs: [
            { type: 'decimal', name: 'bagPrice', label: 'Prezzo sacco intonaco', unit: '€/sacco', placeholder: 'es. 5,20', fullWidth: true }
        ]
    },

    stairs: {
        primary: [
            { type: 'decimal', name: 'height', label: 'Dislivello totale (da pavimento a pavimento)', unit: 'm', placeholder: 'es. 2,88', required: true, fullWidth: true },
            { type: 'decimal', name: 'length', label: 'Lunghezza orizzontale disponibile (opzionale)', unit: 'm', placeholder: 'Vuoto = lunghezza ideale Blondel' },
            { type: 'decimal', name: 'width', label: 'Larghezza rampa (opzionale, per cls)', unit: 'm', placeholder: 'es. 1,00' }
        ],
        advanced: [
            { type: 'decimal', name: 'slabThickness', label: 'Spessore soletta strutturale inclinata', unit: 'cm', value: '15', placeholder: '15', fullWidth: true }
        ],
        costs: [
            { type: 'decimal', name: 'concretePrice', label: 'Prezzo calcestruzzo al mc', unit: '€/mc', placeholder: 'es. 135,00', fullWidth: true }
        ]
    },

    roofing: {
        primary: [
            { type: 'decimal', name: 'area', label: 'Superficie netta copertura / terrazzo', unit: 'mq', placeholder: 'es. 55', required: true },
            { type: 'decimal', name: 'overlap', label: 'Sormonto longitudinale e trasversale', unit: '%', value: '10', placeholder: '10' }
        ],
        advanced: [
            { type: 'decimal', name: 'rollSqm', label: 'Sviluppo per singolo rotolo', unit: 'mq/rot.', value: '10', placeholder: '10' },
            { type: 'decimal', name: 'primerYield', label: 'Resa primer bituminoso', unit: 'kg/mq', value: '0,3', placeholder: '0,3' },
            { type: 'decimal', name: 'primerBucket', label: 'Capacità latta primer', unit: 'kg', value: '20', placeholder: '20' },
            { type: 'decimal', name: 'waste', label: 'Sfrido tagli e risvolti verticali', unit: '%', value: '10', placeholder: '10' }
        ],
        costs: [
            { type: 'decimal', name: 'rollPrice', label: 'Prezzo singolo rotolo guaina', unit: '€/rot.', placeholder: 'es. 48,00' },
            { type: 'decimal', name: 'primerPrice', label: 'Prezzo latta primer', unit: '€/latta', placeholder: 'es. 42,00' }
        ]
    },

    gravel: {
        primary: [
            {
                type: 'segmented', name: 'isAreaMode', label: 'Modalità inserimento superficie', fullWidth: true,
                options: [
                    { value: 'true', label: 'Da Area (mq)', default: true },
                    { value: 'sides', label: 'Da Lati (L × L)' }
                ]
            },
            { type: 'decimal', name: 'area', label: 'Superficie da coprire', unit: 'mq', placeholder: 'es. 40', required: true, showWhen: 'isAreaMode=true' },
            { type: 'decimal', name: 'length', label: 'Lunghezza area', unit: 'm', placeholder: 'es. 10', required: true, showWhen: 'isAreaMode=sides' },
            { type: 'decimal', name: 'width', label: 'Larghezza area', unit: 'm', placeholder: 'es. 4', required: true, showWhen: 'isAreaMode=sides' },
            { type: 'decimal', name: 'thickness', label: 'Spessore strato ghiaia', unit: 'cm', placeholder: 'es. 8', required: true }
        ],
        advanced: [
            { type: 'decimal', name: 'density', label: 'Densità media ghiaia / pietrisco', unit: 'kg/mc', value: '1500', placeholder: '1500' },
            { type: 'decimal', name: 'waste', label: 'Sfrido / Assestamento rullo', unit: '%', value: '5', placeholder: '5' }
        ],
        costs: [
            { type: 'decimal', name: 'tonPrice', label: 'Prezzo sfuso a tonnellata', unit: '€/t', placeholder: 'es. 24,00' },
            { type: 'decimal', name: 'bagPrice', label: 'Prezzo singolo sacco (25 kg)', unit: '€/sacco', placeholder: 'es. 3,80' }
        ]
    },

    earthwork: {
        primary: [
            { type: 'decimal', name: 'length', label: 'Lunghezza scavo', unit: 'm', placeholder: 'es. 12', required: true },
            { type: 'decimal', name: 'width', label: 'Larghezza scavo', unit: 'm', placeholder: 'es. 3,5', required: true },
            { type: 'decimal', name: 'depth', label: 'Profondità media scavo', unit: 'm', placeholder: 'es. 1,2', required: true },
            {
                type: 'select', name: 'soilType', label: 'Tipologia terreno (coefficiente di rigonfiamento)',
                options: [
                    { value: 'agri', label: 'Terreno Agrario / Coltivo (+20%)' },
                    { value: 'clay', label: 'Argilla / Terreno Compatto (+30%)' },
                    { value: 'rock', label: 'Roccia Frantumata / Calcestruzzo (+45%)' }
                ]
            }
        ],
        advanced: [
            { type: 'decimal', name: 'truckCap', label: 'Capacità cassone camion / dumper', unit: 'mc', value: '10', placeholder: '10', fullWidth: true }
        ],
        costs: [
            { type: 'decimal', name: 'costExcavation', label: 'Costo scavo a banco', unit: '€/mc', placeholder: 'es. 18,00' },
            { type: 'decimal', name: 'costDisposal', label: 'Costo trasporto e discarica (su volume gonfiato)', unit: '€/mc', placeholder: 'es. 25,00' }
        ]
    },

    fencing: {
        primary: [
            { type: 'decimal', name: 'perimeter', label: 'Perimetro lordo recinzione', unit: 'm', placeholder: 'es. 60', required: true },
            { type: 'decimal', name: 'gates', label: 'Larghezza totale cancelli da escludere', unit: 'm', value: '0', placeholder: '0' },
            { type: 'decimal', name: 'spacing', label: 'Interasse tra i pali', unit: 'm', value: '2,0', placeholder: '2,0', fullWidth: true }
        ],
        advanced: [
            { type: 'decimal', name: 'waste', label: 'Sfrido rete e tensionamento', unit: '%', value: '10', placeholder: '10', fullWidth: true }
        ],
        costs: [
            { type: 'decimal', name: 'pricePost', label: 'Prezzo singolo palo (inclusi saette)', unit: '€/palo', placeholder: 'es. 16,00' },
            { type: 'decimal', name: 'priceMesh', label: 'Prezzo rete metallica', unit: '€/m', placeholder: 'es. 6,50' },
            { type: 'decimal', name: 'priceConcrete', label: 'Prezzo sacco calcestruzzo rapido (25 kg)', unit: '€/sacco', placeholder: 'es. 5,80' }
        ]
    },

    lawn: {
        primary: [
            {
                type: 'segmented', name: 'isSeeds', label: 'Tecnica di realizzazione prato', fullWidth: true,
                options: [
                    { value: 'true', label: 'Semina (Sementi)', default: true },
                    { value: 'sod', label: 'Prato a Rotoli (Zolle pronte)' }
                ]
            },
            {
                type: 'segmented', name: 'isAreaMode', label: 'Inserimento superficie', fullWidth: true,
                options: [
                    { value: 'true', label: 'Da Area (mq)', default: true },
                    { value: 'sides', label: 'Da Lati (L × L)' }
                ]
            },
            { type: 'decimal', name: 'area', label: 'Superficie prato', unit: 'mq', placeholder: 'es. 120', required: true, fullWidth: true, showWhen: 'isAreaMode=true' },
            { type: 'decimal', name: 'length', label: 'Lunghezza giardino', unit: 'm', placeholder: 'es. 15', required: true, showWhen: 'isAreaMode=sides' },
            { type: 'decimal', name: 'width', label: 'Larghezza giardino', unit: 'm', placeholder: 'es. 8', required: true, showWhen: 'isAreaMode=sides' }
        ],
        advanced: [
            { type: 'decimal', name: 'seedDose', label: 'Dose di semina', unit: 'g/mq', value: '30', placeholder: '30', showWhen: 'isSeeds=true' },
            { type: 'decimal', name: 'wasteSeeds', label: 'Sfrido / Risemina', unit: '%', value: '10', placeholder: '10', showWhen: 'isSeeds=true' },
            { type: 'decimal', name: 'wasteSod', label: 'Sfrido tagli rotoli sui bordi', unit: '%', value: '5', placeholder: '5', showWhen: 'isSeeds=sod', fullWidth: true }
        ],
        costs: [
            { type: 'decimal', name: 'priceSeed', label: 'Prezzo sementi al kg', unit: '€/kg', placeholder: 'es. 14,50', showWhen: 'isSeeds=true', fullWidth: true },
            { type: 'decimal', name: 'priceSod', label: 'Prezzo prato a rotoli al mq', unit: '€/mq', placeholder: 'es. 9,50', showWhen: 'isSeeds=sod', fullWidth: true }
        ]
    },

    soil: {
        primary: [
            {
                type: 'segmented', name: 'isAreaMode', label: 'Modalità inserimento superficie', fullWidth: true,
                options: [
                    { value: 'true', label: 'Da Area (mq)', default: true },
                    { value: 'sides', label: 'Da Lati (L × L)' }
                ]
            },
            { type: 'decimal', name: 'area', label: 'Superficie aiuola / giardino', unit: 'mq', placeholder: 'es. 25', required: true, showWhen: 'isAreaMode=true' },
            { type: 'decimal', name: 'length', label: 'Lunghezza area', unit: 'm', placeholder: 'es. 8', required: true, showWhen: 'isAreaMode=sides' },
            { type: 'decimal', name: 'width', label: 'Larghezza area', unit: 'm', placeholder: 'es. 3', required: true, showWhen: 'isAreaMode=sides' },
            { type: 'decimal', name: 'thickness', label: 'Spessore strato desiderato', unit: 'cm', placeholder: 'es. 10', required: true }
        ],
        advanced: [
            { type: 'decimal', name: 'bagVolume', label: 'Volume singolo sacco', unit: 'L', value: '50', placeholder: '50' },
            { type: 'decimal', name: 'waste', label: 'Compattazione e sfrido', unit: '%', value: '10', placeholder: '10' }
        ],
        costs: [
            { type: 'decimal', name: 'bagPrice', label: 'Prezzo singolo sacco', unit: '€/sacco', placeholder: 'es. 6,90', fullWidth: true }
        ]
    },

    potSoil: {
        primary: [
            {
                type: 'segmented', name: 'isRound', label: 'Forma del contenitore', fullWidth: true,
                options: [
                    { value: 'true', label: 'Vaso Tondo / Cilindrico', default: true },
                    { value: 'rect', label: 'Fioriera Rettangolare / Quadrata' }
                ]
            },
            { type: 'decimal', name: 'diameter', label: 'Diametro vaso', unit: 'cm', placeholder: 'es. 45', required: true, showWhen: 'isRound=true' },
            { type: 'decimal', name: 'length', label: 'Lunghezza fioriera', unit: 'cm', placeholder: 'es. 100', required: true, showWhen: 'isRound=rect' },
            { type: 'decimal', name: 'width', label: 'Profondità fioriera', unit: 'cm', placeholder: 'es. 40', required: true, showWhen: 'isRound=rect' },
            { type: 'decimal', name: 'height', label: 'Altezza utile riempimento', unit: 'cm', placeholder: 'es. 40', required: true },
            { type: 'decimal', name: 'potCount', label: 'Numero vasi/fioriere identiche', unit: 'pz', value: '1', placeholder: '1', required: true }
        ],
        advanced: [
            { type: 'decimal', name: 'bagVolume', label: 'Volume singolo sacco terriccio', unit: 'L', value: '50', placeholder: '50' },
            { type: 'decimal', name: 'waste', label: 'Margine assestamento post-irrigazione', unit: '%', value: '10', placeholder: '10' }
        ],
        costs: [
            { type: 'decimal', name: 'bagPrice', label: 'Prezzo singolo sacco terriccio', unit: '€/sacco', placeholder: 'es. 7,50', fullWidth: true }
        ]
    },

    electrical: {
        primary: [
            { type: 'decimal', name: 'powerKw', label: 'Potenza assorbita carico', unit: 'kW', placeholder: 'es. 4,5', required: true },
            { type: 'decimal', name: 'length', label: 'Lunghezza tratta cavo (solo andata)', unit: 'm', placeholder: 'es. 25', required: true },
            {
                type: 'segmented', name: 'voltage', label: 'Tensione di linea', fullWidth: true,
                options: [
                    { value: '230', label: '230V Monofase', default: true },
                    { value: '400', label: '400V Trifase' }
                ]
            },
            {
                type: 'segmented', name: 'installType', label: 'Tipologia di posa', fullWidth: true,
                options: [
                    { value: 'tube', label: 'In Tubo / Canalina', default: true },
                    { value: 'air', label: 'Aria Libera' },
                    { value: 'buried', label: 'Cavidotto Interrato' }
                ]
            }
        ],
        advanced: [],
        costs: [
            { type: 'decimal', name: 'pricePerMeter', label: 'Costo stimato cavo al metro lineare', unit: '€/m', placeholder: 'es. 2,80', fullWidth: true }
        ]
    },

    plumbing: {
        primary: [
            { type: 'decimal', name: 'flowLmin', label: 'Portata di progetto richiesta', unit: 'L/min', placeholder: 'es. 24', required: true },
            { type: 'decimal', name: 'pressure', label: 'Pressione disponibile a monte', unit: 'Bar', value: '3,0', placeholder: '3,0', required: true },
            { type: 'decimal', name: 'length', label: 'Lunghezza equivalente tubazione', unit: 'm', placeholder: 'es. 20', required: true },
            {
                type: 'select', name: 'material', label: 'Materiale tubazione (coefficiente Hazen-Williams)',
                options: [
                    { value: 'multilayer', label: 'Multistrato (C = 140)' },
                    { value: 'pex', label: 'PEX Reticolato (C = 150)' },
                    { value: 'copper', label: 'Rame (C = 135)' },
                    { value: 'steel', label: 'Acciaio Zincato (C = 120)' }
                ]
            }
        ],
        advanced: [],
        costs: [
            { type: 'decimal', name: 'pricePerMeter', label: 'Prezzo tubo al metro lineare', unit: '€/m', placeholder: 'es. 3,90', fullWidth: true }
        ]
    },

    hvac: {
        primary: [
            { type: 'decimal', name: 'length', label: 'Lunghezza stanza', unit: 'm', placeholder: 'es. 5,0', required: true },
            { type: 'decimal', name: 'width', label: 'Larghezza stanza', unit: 'm', placeholder: 'es. 4,0', required: true },
            { type: 'decimal', name: 'height', label: 'Altezza soffitto', unit: 'm', value: '2,7', placeholder: '2,7', required: true },
            { type: 'decimal', name: 'windows', label: 'Numero finestre esposte', unit: 'pz', value: '1', placeholder: '1' },
            {
                type: 'select', name: 'insulation', label: 'Livello di isolamento dell\'immobile', fullWidth: true,
                options: [
                    { value: 'avg', label: 'Medio (doppi vetri standard)' },
                    { value: 'poor', label: 'Scarso (edificio datato, vetri singoli, ultimo piano)' },
                    { value: 'exc', label: 'Ottimo (cappotto termico, infissi taglio termico)' }
                ]
            },
            {
                type: 'segmented', name: 'exposure', label: 'Esposizione solare prevalente', fullWidth: true,
                options: [
                    { value: 'north', label: 'Nord / Ombreggiato', default: true },
                    { value: 'south', label: 'Sud-Ovest / Soleggiato (+15%)' }
                ]
            }
        ],
        advanced: [],
        costs: [
            { type: 'decimal', name: 'priceKw', label: 'Costo stimato macchina per kW termico', unit: '€/kW', placeholder: 'es. 260,00', fullWidth: true }
        ]
    },

    scaffold: {
        primary: [
            { type: 'decimal', name: 'length', label: 'Lunghezza facciata edificio', unit: 'm', placeholder: 'es. 14', required: true },
            { type: 'decimal', name: 'height', label: 'Altezza gronda / colmo da servire', unit: 'm', placeholder: 'es. 9,5', required: true },
            { type: 'switch', name: 'useSafetyMargins', label: 'Applica margini normativi ponteggio', hint: '+1,5 m larghezza laterale, +1,0 m parapetto sommitale', checked: true, fullWidth: true },
            { type: 'decimal', name: 'months', label: 'Durata noleggio (mesi)', unit: 'mesi', value: '1', placeholder: '1', fullWidth: true }
        ],
        advanced: [],
        costs: [
            { type: 'decimal', name: 'setupCost', label: 'Montaggio e smontaggio', unit: '€/mq', placeholder: 'es. 12,00' },
            { type: 'decimal', name: 'rentalCost', label: 'Noleggio mensile ponteggio', unit: '€/mq·mese', placeholder: 'es. 2,50' },
            { type: 'decimal', name: 'pimusCost', label: 'Redazione Pi.M.U.S. + Disegno (forfait)', unit: '€', placeholder: 'es. 450,00' },
            { type: 'decimal', name: 'transportCost', label: 'Trasporto A/R cantiere (forfait)', unit: '€', placeholder: 'es. 250,00' },
            { type: 'decimal', name: 'landTax', label: 'Tassa occupazione suolo pubblico', unit: '€/giorno', placeholder: 'es. 18,00', fullWidth: true }
        ]
    },

    equipment: {
        primary: [
            {
                type: 'select', name: 'equipmentType', label: 'Tipologia mezzo o attrezzatura', fullWidth: true,
                options: [
                    { value: 'excavator', label: 'Miniescavatore' },
                    { value: 'scissor', label: 'Piattaforma Aerea / Trabattello Elettrico' },
                    { value: 'crane', label: 'Gru / Autogrù' },
                    { value: 'van', label: 'Furgone / Autocarro Ribaltabile' },
                    { value: 'generator', label: 'Gruppo Elettrogeno' },
                    { value: 'other', label: 'Altra attrezzatura (personalizzata)' }
                ]
            },
            { type: 'text', name: 'customName', label: 'Nome attrezzatura personalizzata', placeholder: 'es. Martello demolitore 30kg', fullWidth: true, showWhen: 'equipmentType=other' },
            { type: 'decimal', name: 'days', label: 'Giorni di noleggio', unit: 'gg', value: '1', placeholder: '1', required: true },
            { type: 'decimal', name: 'dailyRate', label: 'Tariffa giornaliera', unit: '€/gg', placeholder: 'es. 140,00', required: true }
        ],
        advanced: [],
        costs: [
            { type: 'decimal', name: 'transport', label: 'Trasporto consegna + ritiro (A/R)', unit: '€', placeholder: 'es. 120,00' },
            { type: 'decimal', name: 'fuelOp', label: 'Carburante e/o Operatore forfait', unit: '€', placeholder: 'es. 85,00' }
        ]
    }
};
