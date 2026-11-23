// Custom technical CAD Blueprint SVG diagrams for all 21 Edil Calc pages

const BG = '#070B12';
const GRID = 'rgba(0, 229, 255, 0.08)';
const CYAN = '#00E5FF';
const ORANGE = '#FF5A26';
const MUTED = '#94A3B8';
const LIGHT = '#F1F5F9';

function wrapSvg(title, desc, body) {
    return `<svg viewBox="0 0 680 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${title} — ${desc}">
  <title>${title}</title>
  <defs>
    <pattern id="bpGrid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${GRID}" stroke-width="1"/>
    </pattern>
    <marker id="arrCyan" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="${CYAN}"/>
    </marker>
    <marker id="arrOrange" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="${ORANGE}"/>
    </marker>
  </defs>
  <rect width="680" height="260" rx="10" fill="${BG}"/>
  <rect width="680" height="260" rx="10" fill="url(#bpGrid)"/>
  ${body}
</svg>`;
}

const DIAGRAMS = {
    paint: () => wrapSvg('Schema calcolo pittura parete con vuoto porta e finestra', 'Sottrazione vuoti e applicazione a rullo o spruzzo', `
      <rect x="70" y="45" width="320" height="165" fill="rgba(0,229,255,0.06)" stroke="${CYAN}" stroke-width="2"/>
      <rect x="120" y="95" width="60" height="115" fill="rgba(255,90,38,0.14)" stroke="${ORANGE}" stroke-width="1.8" stroke-dasharray="5 3"/>
      <rect x="255" y="75" width="85" height="65" fill="rgba(255,90,38,0.14)" stroke="${ORANGE}" stroke-width="1.8" stroke-dasharray="5 3"/>
      <text x="150" y="155" fill="${ORANGE}" font-size="11" font-family="monospace" text-anchor="middle">PORTA</text>
      <text x="297" y="112" fill="${ORANGE}" font-size="11" font-family="monospace" text-anchor="middle">FINESTRA</text>
      <line x1="70" y1="30" x2="390" y2="30" stroke="${CYAN}" stroke-width="1.4" marker-start="url(#arrCyan)" marker-end="url(#arrCyan)"/>
      <text x="230" y="24" fill="${LIGHT}" font-size="12" font-family="monospace" text-anchor="middle">Larghezza L (m)</text>
      <line x1="48" y1="45" x2="48" y2="210" stroke="${CYAN}" stroke-width="1.4" marker-start="url(#arrCyan)" marker-end="url(#arrCyan)"/>
      <text x="36" y="130" fill="${LIGHT}" font-size="12" font-family="monospace" text-anchor="middle" transform="rotate(-90 36 130)">Altezza H (m)</text>
      <rect x="430" y="50" width="210" height="150" rx="8" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.15)"/>
      <text x="448" y="80" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">RESA &amp; SFRIDO</text>
      <text x="448" y="106" fill="${LIGHT}" font-size="12" font-family="sans-serif">Area Netta = (L×H) - Vuoti</text>
      <text x="448" y="132" fill="${LIGHT}" font-size="12" font-family="sans-serif">Litri = (Netta × Mani) / Resa</text>
      <text x="448" y="158" fill="${ORANGE}" font-size="12" font-family="monospace">Rullo/Pennello: +5% sfrido</text>
      <text x="448" y="180" fill="${ORANGE}" font-size="12" font-family="monospace">Airless Spruzzo: +15%</text>
    `),

    drywall: () => wrapSvg('Sezione orditura parete in cartongesso con montanti a C e guide a U', 'Passo 60 cm tra montanti e sfalsamento giunti', `
      <rect x="65" y="45" width="320" height="16" fill="rgba(255,90,38,0.22)" stroke="${ORANGE}" stroke-width="1.6"/>
      <rect x="65" y="200" width="320" height="16" fill="rgba(255,90,38,0.22)" stroke="${ORANGE}" stroke-width="1.6"/>
      <rect x="75" y="61" width="14" height="139" fill="rgba(0,229,255,0.2)" stroke="${CYAN}" stroke-width="1.5"/>
      <rect x="165" y="61" width="14" height="139" fill="rgba(0,229,255,0.2)" stroke="${CYAN}" stroke-width="1.5"/>
      <rect x="255" y="61" width="14" height="139" fill="rgba(0,229,255,0.2)" stroke="${CYAN}" stroke-width="1.5"/>
      <rect x="345" y="61" width="14" height="139" fill="rgba(0,229,255,0.2)" stroke="${CYAN}" stroke-width="1.5"/>
      <line x1="82" y1="30" x2="172" y2="30" stroke="${CYAN}" stroke-width="1.4" marker-start="url(#arrCyan)" marker-end="url(#arrCyan)"/>
      <text x="127" y="24" fill="${CYAN}" font-size="11" font-family="monospace" text-anchor="middle">Interasse 60 cm</text>
      <text x="420" y="65" fill="${ORANGE}" font-size="12" font-family="monospace" font-weight="bold">GUIDA A U (pav./soffitto)</text>
      <text x="420" y="102" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">MONTANTE A C (h = parete)</text>
      <text x="420" y="140" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Doppia Lastra: 2 facce chiuse</text>
      <text x="420" y="164" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Viti fosfatate: ~15 pz / mq</text>
      <text x="420" y="188" fill="${MUTED}" font-size="12" font-family="sans-serif">• Barre standard da 3,00 m</text>
    `),

    wallpaper: () => wrapSvg('Schema taglio teli carta da parati con rapporto disegno', 'Calcolo teli utili per rotolo', `
      <rect x="65" y="45" width="75" height="165" fill="rgba(0,229,255,0.08)" stroke="${CYAN}" stroke-width="1.6"/>
      <rect x="140" y="45" width="75" height="165" fill="rgba(255,90,38,0.09)" stroke="${CYAN}" stroke-width="1.6"/>
      <rect x="215" y="45" width="75" height="165" fill="rgba(0,229,255,0.08)" stroke="${CYAN}" stroke-width="1.6"/>
      <rect x="290" y="45" width="75" height="165" fill="rgba(255,90,38,0.09)" stroke="${CYAN}" stroke-width="1.6"/>
      <line x1="65" y1="30" x2="140" y2="30" stroke="${ORANGE}" stroke-width="1.4" marker-start="url(#arrOrange)" marker-end="url(#arrOrange)"/>
      <text x="102" y="23" fill="${ORANGE}" font-size="11" font-family="monospace" text-anchor="middle">53 cm</text>
      <line x1="45" y1="45" x2="45" y2="210" stroke="${CYAN}" stroke-width="1.4" marker-start="url(#arrCyan)" marker-end="url(#arrCyan)"/>
      <text x="33" y="128" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle" transform="rotate(-90 33 128)">H + Rapporto</text>
      <text x="405" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">ROTOLO STANDARD: 0,53 × 10 m</text>
      <text x="405" y="108" fill="${LIGHT}" font-size="12" font-family="sans-serif">H effettiva telo = H parete + Rapporto cm</text>
      <text x="405" y="135" fill="${LIGHT}" font-size="12" font-family="sans-serif">Teli per fascia = Larghezza / Larg. rotolo</text>
      <text x="405" y="162" fill="${ORANGE}" font-size="12" font-family="monospace">+10% margine sicurezza rotoli &amp; colla</text>
      <text x="405" y="189" fill="${MUTED}" font-size="12" font-family="sans-serif">Colla media: ~200 g/mq</text>
    `),

    tiles: () => wrapSvg('Schema posa piastrelle con fughe, colla dentata e sfrido', 'Formato L×W, fuga mm e resa scatole', `
      <g stroke="${CYAN}" stroke-width="1.6" fill="rgba(0,229,255,0.08)">
        <rect x="70" y="48" width="90" height="72"/><rect x="168" y="48" width="90" height="72"/><rect x="266" y="48" width="90" height="72"/>
        <rect x="70" y="128" width="90" height="72"/><rect x="168" y="128" width="90" height="72"/><rect x="266" y="128" width="90" height="72"/>
      </g>
      <line x1="160" y1="84" x2="168" y2="84" stroke="${ORANGE}" stroke-width="2.5"/>
      <text x="164" y="40" fill="${ORANGE}" font-size="11" font-family="monospace" text-anchor="middle">Fuga (es. 2 mm)</text>
      <text x="115" y="88" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">L × W cm</text>
      <text x="400" y="72" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">COMPUTO PIASTRELLE &amp; POSA</text>
      <text x="400" y="102" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Superficie unitaria include larghezza fuga</text>
      <text x="400" y="128" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Sfrido posa dritta: +10% | Diagonale: +15%</text>
      <text x="400" y="154" fill="${ORANGE}" font-size="12" font-family="monospace">• Colla cementizia (doppia spalmatura): ~5 kg/mq</text>
      <text x="400" y="180" fill="${MUTED}" font-size="12" font-family="sans-serif">• Stucco fughe calcolato per mm × spessore</text>
    `),

    skirting: () => wrapSvg('Pianta stanza perimetrale per calcolo aste battiscopa con sottrazione porte', 'Somma muri meno porte più sfrido tagli 45 gradi', `
      <rect x="85" y="50" width="230" height="150" fill="rgba(0,229,255,0.05)" stroke="${CYAN}" stroke-width="2.2"/>
      <line x1="175" y1="200" x2="225" y2="200" stroke="${BG}" stroke-width="5"/>
      <path d="M 175 200 A 50 50 0 0 1 225 150 L 225 200" fill="none" stroke="${ORANGE}" stroke-width="1.6" stroke-dasharray="4 3"/>
      <text x="200" y="220" fill="${ORANGE}" font-size="11" font-family="monospace" text-anchor="middle">Porta -0,90 m</text>
      <text x="200" y="40" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">Muro 1</text>
      <text x="335" y="130" fill="${LIGHT}" font-size="11" font-family="monospace">Muro 2</text>
      <text x="385" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">PERIMETRO UTILE BATTISCOPA</text>
      <text x="385" y="105" fill="${LIGHT}" font-size="12" font-family="sans-serif">1. Somma tutte le pareti reali (M1+M2+...)</text>
      <text x="385" y="132" fill="${LIGHT}" font-size="12" font-family="sans-serif">2. Sottrai luce porte (N × Larghezza)</text>
      <text x="385" y="159" fill="${ORANGE}" font-size="12" font-family="monospace">3. +10% sfrido per tagli angoli a 45°</text>
      <text x="385" y="186" fill="${MUTED}" font-size="12" font-family="sans-serif">4. Aste = ceil(m totali / lung. asta)</text>
    `),

    cement: () => wrapSvg('Stratigrafia massetto sabbia cemento su solaio', 'Spessore cm, volume mc e resa sacchi premiscelato', `
      <rect x="65" y="160" width="310" height="45" fill="rgba(255,255,255,0.06)" stroke="${MUTED}" stroke-width="1.4"/>
      <rect x="65" y="95" width="310" height="65" fill="rgba(255,90,38,0.16)" stroke="${ORANGE}" stroke-width="2"/>
      <line x1="65" y1="78" x2="375" y2="78" stroke="${CYAN}" stroke-width="2" stroke-dasharray="6 4"/>
      <line x1="48" y1="95" x2="48" y2="160" stroke="${CYAN}" stroke-width="1.5" marker-start="url(#arrCyan)" marker-end="url(#arrCyan)"/>
      <text x="34" y="130" fill="${CYAN}" font-size="11" font-family="monospace" text-anchor="middle" transform="rotate(-90 34 130)">Spessore cm</text>
      <text x="220" y="132" fill="${LIGHT}" font-size="12" font-family="monospace" text-anchor="middle">MASSETTO (min. 4-5 cm)</text>
      <text x="220" y="187" fill="${MUTED}" font-size="11" font-family="monospace" text-anchor="middle">Solaio / Impianti / Barriera Vapore</text>
      <text x="405" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">DOSAGGIO E RESA MASSETTO</text>
      <text x="405" y="105" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Volume = Area (mq) × Spessore (m)</text>
      <text x="405" y="132" fill="${ORANGE}" font-size="12" font-family="monospace">• Premiscelato: ~18–20 kg/mq per cm</text>
      <text x="405" y="159" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Tradizionale: 300 kg cemento + 1 mc sabbia</text>
      <text x="405" y="186" fill="${MUTED}" font-size="12" font-family="sans-serif">• Sfrido standard consigliato: +10%</text>
    `),

    bricks: () => wrapSvg('Schema apparecchiatura muraria laterizi con giunti di malta', 'Calcolo blocchi per mq inclusa fuga', `
      <g fill="rgba(255,90,38,0.16)" stroke="${ORANGE}" stroke-width="1.6">
        <rect x="65" y="55" width="90" height="42"/><rect x="165" y="55" width="90" height="42"/><rect x="265" y="55" width="90" height="42"/>
        <rect x="110" y="106" width="90" height="42"/><rect x="210" y="106" width="90" height="42"/>
        <rect x="65" y="157" width="90" height="42"/><rect x="165" y="157" width="90" height="42"/><rect x="265" y="157" width="90" height="42"/>
      </g>
      <line x1="155" y1="76" x2="165" y2="76" stroke="${CYAN}" stroke-width="2.5"/>
      <text x="160" y="42" fill="${CYAN}" font-size="11" font-family="monospace" text-anchor="middle">Giunto 10 mm</text>
      <text x="395" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">CALCOLO MATTONI &amp; MALTA</text>
      <text x="395" y="105" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Passo blocco = (L + fuga) × (H + fuga)</text>
      <text x="395" y="132" fill="${LIGHT}" font-size="12" font-family="sans-serif">• N° Mattoni = Area Netta / Passo × 1,10</text>
      <text x="395" y="159" fill="${ORANGE}" font-size="12" font-family="monospace">• Malta = Volume muro - Volume blocchi</text>
      <text x="395" y="186" fill="${MUTED}" font-size="12" font-family="sans-serif">• Sacchi da 25 kg (~1.650 kg/mc resa)</text>
    `),

    plaster: () => wrapSvg('Stratigrafia parete in laterizio con rinzaffo e intonaco di fondo', 'Spessore in millimetri e consumo kg per mq', `
      <rect x="80" y="45" width="95" height="165" fill="rgba(255,255,255,0.06)" stroke="${MUTED}" stroke-width="1.5"/>
      <rect x="175" y="45" width="38" height="165" fill="rgba(255,90,38,0.22)" stroke="${ORANGE}" stroke-width="2"/>
      <rect x="213" y="45" width="12" height="165" fill="rgba(0,229,255,0.2)" stroke="${CYAN}" stroke-width="1.5"/>
      <text x="127" y="132" fill="${MUTED}" font-size="12" font-family="monospace" text-anchor="middle">MURATURA</text>
      <line x1="175" y1="30" x2="225" y2="30" stroke="${ORANGE}" stroke-width="1.5" marker-start="url(#arrOrange)" marker-end="url(#arrOrange)"/>
      <text x="200" y="23" fill="${ORANGE}" font-size="11" font-family="monospace" text-anchor="middle">15–20 mm</text>
      <text x="268" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">STRATI E CONSUMI INTONACO</text>
      <text x="268" y="106" fill="${LIGHT}" font-size="12" font-family="sans-serif">1. Rinzaffo + Fasce guida piombo (staggia)</text>
      <text x="268" y="134" fill="${ORANGE}" font-size="12" font-family="monospace">2. Intonaco fondo: ~15 kg/mq per ogni 10 mm</text>
      <text x="268" y="162" fill="${LIGHT}" font-size="12" font-family="sans-serif">3. Rete portaintonaco su giunzioni diverse</text>
      <text x="268" y="190" fill="${MUTED}" font-size="12" font-family="sans-serif">4. Rasatura finale civile a frattazzo</text>
    `),

    stairs: () => wrapSvg('Prospetto scala secondo la Formula di Blondel 2A + P = 62-64 cm', 'Alzata, pedata e spessore soletta inclinata', `
      <polyline points="65,205 120,205 120,165 180,165 180,125 240,125 240,85 300,85 300,45" fill="none" stroke="${CYAN}" stroke-width="2.4"/>
      <line x1="65" y1="222" x2="320" y2="62" stroke="${ORANGE}" stroke-width="2" stroke-dasharray="5 3"/>
      <text x="150" y="157" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">P (Pedata)</text>
      <text x="255" y="110" fill="${ORANGE}" font-size="11" font-family="monospace">A (Alzata)</text>
      <text x="365" y="72" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">REGOLA DI BLONDEL &amp; VOLUMI</text>
      <text x="365" y="102" fill="${ORANGE}" font-size="13" font-family="monospace" font-weight="bold">2 × Alzata + Pedata = 62 ÷ 64 cm</text>
      <text x="365" y="132" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Alzata ergonomica ideale: 16,5 ÷ 18 cm</text>
      <text x="365" y="158" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Pedata consigliata: 28 ÷ 30 cm</text>
      <text x="365" y="184" fill="${MUTED}" font-size="12" font-family="sans-serif">• Volume cls = Soletta + Triangoli gradini</text>
    `),

    roofing: () => wrapSvg('Schema posa guaina bituminosa con sormonto 10 cm e primer', 'Sovrapposizione teli a regola d arte', `
      <rect x="65" y="85" width="290" height="45" fill="rgba(0,229,255,0.1)" stroke="${CYAN}" stroke-width="1.8"/>
      <rect x="65" y="118" width="290" height="45" fill="rgba(255,90,38,0.14)" stroke="${ORANGE}" stroke-width="1.8"/>
      <line x1="370" y1="118" x2="370" y2="130" stroke="${CYAN}" stroke-width="2"/>
      <text x="210" y="110" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">ROTOLO 1 (1 × 10 m)</text>
      <text x="210" y="148" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">ROTOLO 2</text>
      <text x="380" y="128" fill="${ORANGE}" font-size="11" font-family="monospace">Sormonto +10%</text>
      <text x="380" y="65" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">IMPERMEABILIZZAZIONE TETTI</text>
      <text x="380" y="160" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Primer bituminoso su area netta (~0,3 kg/mq)</text>
      <text x="380" y="186" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Guaina = Area × (1+Sormonto) × (1+Sfrido)</text>
    `),

    gravel: () => wrapSvg('Sezione sottofondo in ghiaia su tessuto geotessile', 'Volume mc, densita kg per mc e conversione tonnellate', `
      <rect x="65" y="170" width="295" height="35" fill="rgba(255,255,255,0.05)" stroke="${MUTED}" stroke-width="1.4"/>
      <line x1="65" y1="168" x2="360" y2="168" stroke="${CYAN}" stroke-width="2.2" stroke-dasharray="6 3"/>
      <rect x="65" y="100" width="295" height="68" fill="rgba(255,90,38,0.15)" stroke="${ORANGE}" stroke-width="2"/>
      <circle cx="110" cy="135" r="7" fill="none" stroke="${LIGHT}"/><circle cx="145" cy="122" r="9" fill="none" stroke="${LIGHT}"/>
      <circle cx="205" cy="140" r="8" fill="none" stroke="${LIGHT}"/><circle cx="265" cy="125" r="10" fill="none" stroke="${LIGHT}"/>
      <text x="212" y="192" fill="${MUTED}" font-size="11" font-family="monospace" text-anchor="middle">Tessuto Non Tessuto + Fondo battuto</text>
      <text x="395" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">CUBATURA &amp; PESO GHIAIA</text>
      <text x="395" y="105" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Volume = Area × Spessore (cm/100)</text>
      <text x="395" y="132" fill="${ORANGE}" font-size="12" font-family="monospace">• Peso = Volume × ~1.500 kg/mc</text>
      <text x="395" y="159" fill="${LIGHT}" font-size="12" font-family="sans-serif">• +5% assestamento compattazione</text>
      <text x="395" y="186" fill="${MUTED}" font-size="12" font-family="sans-serif">• Sacchi da 25 kg (~40 pz per tonn.)</text>
    `),

    earthwork: () => wrapSvg('Volume scavo geometrico versus volume gonfiato con foisonamento', 'Calcolo mc a banco e viaggi camion dumper', `
      <rect x="65" y="95" width="130" height="95" fill="rgba(0,229,255,0.1)" stroke="${CYAN}" stroke-width="2"/>
      <text x="130" y="145" fill="${LIGHT}" font-size="12" font-family="monospace" text-anchor="middle">SCAVO</text>
      <text x="130" y="164" fill="${CYAN}" font-size="11" font-family="monospace" text-anchor="middle">V = L × W × P</text>
      <path d="M 210 142 L 248 142" stroke="${ORANGE}" stroke-width="2.2" marker-end="url(#arrOrange)"/>
      <polygon points="262,190 295,70 365,70 398,190" fill="rgba(255,90,38,0.16)" stroke="${ORANGE}" stroke-width="2"/>
      <text x="330" y="135" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">TERRA SMOSSA</text>
      <text x="330" y="155" fill="${ORANGE}" font-size="11" font-family="monospace" text-anchor="middle">+20% / +45%</text>
      <text x="425" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">FOISONAMENTO TERRENO</text>
      <text x="425" y="106" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Agrario: fattore ×1,20 (+20%)</text>
      <text x="425" y="134" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Argilla / Compatto: ×1,30 (+30%)</text>
      <text x="425" y="162" fill="${ORANGE}" font-size="12" font-family="monospace">• Roccia Frantumata: ×1,45 (+45%)</text>
      <text x="425" y="190" fill="${MUTED}" font-size="12" font-family="sans-serif">• Viaggi = ceil(V gonfiato / Cassone)</text>
    `),

    fencing: () => wrapSvg('Prospetto recinzione metallica con interasse pali e plinti', 'Esclusione cancelli, numero pali e calcestruzzo rapido', `
      <rect x="65" y="175" width="315" height="30" fill="rgba(255,255,255,0.05)"/>
      <line x1="65" y1="175" x2="380" y2="175" stroke="${MUTED}" stroke-width="1.5"/>
      <rect x="80" y="65" width="10" height="145" fill="${CYAN}"/><rect x="175" y="65" width="10" height="145" fill="${CYAN}"/>
      <rect x="270" y="65" width="10" height="145" fill="${CYAN}"/><rect x="360" y="65" width="10" height="145" fill="${CYAN}"/>
      <rect x="85" y="75" width="280" height="95" fill="none" stroke="${ORANGE}" stroke-width="1.4" stroke-dasharray="4 4"/>
      <line x1="85" y1="50" x2="180" y2="50" stroke="${CYAN}" stroke-width="1.4" marker-start="url(#arrCyan)" marker-end="url(#arrCyan)"/>
      <text x="132" y="42" fill="${CYAN}" font-size="11" font-family="monospace" text-anchor="middle">Interasse ~2,0 m</text>
      <text x="410" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">MATERIALI RECINZIONE</text>
      <text x="410" y="105" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Rete netta = Perimetro - Cancelli (+10%)</text>
      <text x="410" y="132" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Pali = ceil(Perim. / Passo) + 1 terminale</text>
      <text x="410" y="159" fill="${ORANGE}" font-size="12" font-family="monospace">• Plinti: ~1,5 sacchi cls rapido 25kg/palo</text>
      <text x="410" y="186" fill="${MUTED}" font-size="12" font-family="sans-serif">• Aggiungi saette su angoli e cancelli</text>
    `),

    lawn: () => wrapSvg('Confronto tra semina prato e posa prato a rotoli sfalsato', 'Dose semi grammi per mq o zolle a giunti sfalsati', `
      <rect x="65" y="55" width="145" height="150" rx="6" fill="rgba(0,229,255,0.08)" stroke="${CYAN}" stroke-width="1.8"/>
      <text x="137" y="125" fill="${LIGHT}" font-size="12" font-family="monospace" text-anchor="middle">SEMINA</text>
      <text x="137" y="148" fill="${CYAN}" font-size="11" font-family="monospace" text-anchor="middle">30–40 g/mq +10%</text>
      <g fill="rgba(255,90,38,0.14)" stroke="${ORANGE}" stroke-width="1.5">
        <rect x="235" y="55" width="145" height="45"/><rect x="235" y="107" width="145" height="45"/><rect x="235" y="159" width="145" height="45"/>
      </g>
      <text x="307" y="134" fill="${LIGHT}" font-size="12" font-family="monospace" text-anchor="middle">PRATO A ROTOLI +5%</text>
      <text x="410" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">SEMINA VS ZOLLE</text>
      <text x="410" y="106" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Semina incrociata: metà nord-sud, metà est-ovest</text>
      <text x="410" y="134" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Rotoli: posa sfalsata a mattoni entro 24h</text>
      <text x="410" y="162" fill="${ORANGE}" font-size="12" font-family="monospace">• Rullatura finale per contatto seme-suolo</text>
    `),

    soil: () => wrapSvg('Calcolo volume litri e sacchi di terriccio per giardino o aiuola', 'Conversione metri cubi in litri e sacchi da 50 litri', `
      <rect x="65" y="95" width="290" height="80" fill="rgba(255,90,38,0.16)" stroke="${ORANGE}" stroke-width="2"/>
      <line x1="65" y1="75" x2="355" y2="75" stroke="${CYAN}" stroke-width="1.4" marker-start="url(#arrCyan)" marker-end="url(#arrCyan)"/>
      <text x="210" y="67" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">Area Aiuola (mq)</text>
      <line x1="45" y1="95" x2="45" y2="175" stroke="${ORANGE}" stroke-width="1.4" marker-start="url(#arrOrange)" marker-end="url(#arrOrange)"/>
      <text x="33" y="135" fill="${ORANGE}" font-size="11" font-family="monospace" text-anchor="middle" transform="rotate(-90 33 135)">Spessore cm</text>
      <text x="210" y="140" fill="${LIGHT}" font-size="13" font-family="monospace" text-anchor="middle">1 mc = 1.000 LITRI</text>
      <text x="395" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">FORMULA TERRICCIO</text>
      <text x="395" y="106" fill="${LIGHT}" font-size="12" font-family="sans-serif">Litri = Area × (Spessore cm / 100) × 1000</text>
      <text x="395" y="134" fill="${ORANGE}" font-size="12" font-family="monospace">+10% margine per assestamento annaffio</text>
      <text x="395" y="162" fill="${LIGHT}" font-size="12" font-family="sans-serif">Sacchi = ceil(Litri totali / Litri per sacco)</text>
    `),

    potSoil: () => wrapSvg('Geometria vaso cilindrico e fioriera rettangolare per calcolo litri terriccio', 'Volume cilindro vs parallelepipedo in litri', `
      <path d="M 85 70 L 175 70 L 160 190 L 100 190 Z" fill="rgba(0,229,255,0.12)" stroke="${CYAN}" stroke-width="2"/>
      <ellipse cx="130" cy="70" rx="45" ry="12" fill="rgba(0,229,255,0.18)" stroke="${CYAN}" stroke-width="1.8"/>
      <text x="130" y="140" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">π × (D/2)² × H</text>
      <rect x="220" y="85" width="140" height="105" fill="rgba(255,90,38,0.14)" stroke="${ORANGE}" stroke-width="2"/>
      <text x="290" y="140" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">L × W × H cm</text>
      <text x="395" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">RIEMPIMENTO VASI &amp; FIORIERE</text>
      <text x="395" y="106" fill="${LIGHT}" font-size="12" font-family="sans-serif">• cm³ ÷ 1.000 = Litri per singolo vaso</text>
      <text x="395" y="134" fill="${ORANGE}" font-size="12" font-family="monospace">• Sottrai 3–5 cm fondo per argilla espansa</text>
      <text x="395" y="162" fill="${LIGHT}" font-size="12" font-family="sans-serif">• +10% assestamento alla prima irrigazione</text>
    `),

    electrical: () => wrapSvg('Schema caduta di tensione linea elettrica 230V monofase o 400V trifase', 'Verifica portata amperometrica Iz e caduta delta V max 4 percento', `
      <rect x="65" y="85" width="75" height="90" rx="6" fill="rgba(0,229,255,0.12)" stroke="${CYAN}" stroke-width="2"/>
      <text x="102" y="134" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">QUADRO</text>
      <line x1="140" y1="130" x2="310" y2="130" stroke="${ORANGE}" stroke-width="3"/>
      <text x="225" y="118" fill="${ORANGE}" font-size="11" font-family="monospace" text-anchor="middle">Tratta L (m) • Sezione mm²</text>
      <rect x="310" y="85" width="80" height="90" rx="6" fill="rgba(255,90,38,0.14)" stroke="${ORANGE}" stroke-width="2"/>
      <text x="350" y="134" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">CARICO kW</text>
      <text x="415" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">CRITERI NORMA CEI 64-8</text>
      <text x="415" y="106" fill="${LIGHT}" font-size="12" font-family="sans-serif">1. Portata termica Iz ≥ Corrente Ib</text>
      <text x="415" y="134" fill="${ORANGE}" font-size="12" font-family="monospace">2. Caduta di tensione ΔV% ≤ 4,0%</text>
      <text x="415" y="162" fill="${LIGHT}" font-size="12" font-family="sans-serif">3. Tipo posa (Tubo / Aria / Interrato)</text>
      <text x="415" y="190" fill="${MUTED}" font-size="11" font-family="sans-serif">Richiede verifica di elettricista abilitato DM 37/08</text>
    `),

    plumbing: () => wrapSvg('Sezione tubazione idraulica con perdita di carico Hazen-Williams', 'Velocità idrica ideale tra 0,8 e 2,0 m al secondo', `
      <rect x="65" y="102" width="295" height="56" rx="4" fill="rgba(0,229,255,0.1)" stroke="${CYAN}" stroke-width="2"/>
      <line x1="85" y1="130" x2="340" y2="130" stroke="${ORANGE}" stroke-width="2.5" stroke-dasharray="10 6" marker-end="url(#arrOrange)"/>
      <text x="212" y="88" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">Pressione Monte P1 &rarr; Perdita ΔP (Bar)</text>
      <text x="212" y="182" fill="${CYAN}" font-size="11" font-family="monospace" text-anchor="middle">Diametro interno DN (mm) • Multistrato / PEX / Rame</text>
      <text x="395" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">EQUAZIONE HAZEN-WILLIAMS</text>
      <text x="395" y="106" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Limite rumore &amp; colpi d'ariete: v ≤ 2,0 m/s</text>
      <text x="395" y="134" fill="${ORANGE}" font-size="12" font-family="monospace">• Caduta di pressione ammissibile ≤ 0,5 Bar</text>
      <text x="395" y="162" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Coefficiente C: PEX 150 | Multistr. 140 | Rame 135</text>
    `),

    hvac: () => wrapSvg('Calcolo carico termico ambiente m cubi per dimensionamento climatizzatore BTU', 'Volume m3 per coefficiente k, esposizione e finestre', `
      <polygon points="75,90 250,90 295,60 120,60" fill="rgba(0,229,255,0.1)" stroke="${CYAN}" stroke-width="1.6"/>
      <rect x="75" y="90" width="175" height="105" fill="rgba(0,229,255,0.06)" stroke="${CYAN}" stroke-width="1.8"/>
      <polygon points="250,90 295,60 295,165 250,195" fill="rgba(255,90,38,0.12)" stroke="${ORANGE}" stroke-width="1.8"/>
      <text x="162" y="148" fill="${LIGHT}" font-size="12" font-family="monospace" text-anchor="middle">Volume = L × W × H</text>
      <text x="335" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">DIMENSIONAMENTO BTU/h &amp; kW</text>
      <text x="335" y="106" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Base termica = Volume (m³) × k isolamento</text>
      <text x="335" y="134" fill="${ORANGE}" font-size="12" font-family="monospace">• Sud / Soleggiato: +15% sul fabbisogno</text>
      <text x="335" y="162" fill="${LIGHT}" font-size="12" font-family="sans-serif">• +1.000 BTU per finestra esposta aggiuntiva</text>
      <text x="335" y="190" fill="${MUTED}" font-size="12" font-family="sans-serif">• Classi standard: 9.000 • 12.000 • 18.000 • 24.000 BTU</text>
    `),

    scaffold: () => wrapSvg('Prospetto ponteggio di facciata con sormonti sicurezza normativi', 'Aggiunta +1,5m larghezza e +1,0m parapetto superiore', `
      <rect x="95" y="65" width="210" height="140" fill="rgba(255,255,255,0.05)" stroke="${MUTED}" stroke-width="1.5"/>
      <rect x="70" y="42" width="260" height="163" fill="rgba(0,229,255,0.08)" stroke="${CYAN}" stroke-width="2" stroke-dasharray="6 3"/>
      <line x1="70" y1="90" x2="330" y2="90" stroke="${ORANGE}" stroke-width="1.4"/>
      <line x1="70" y1="145" x2="330" y2="145" stroke="${ORANGE}" stroke-width="1.4"/>
      <text x="200" y="58" fill="${CYAN}" font-size="11" font-family="monospace" text-anchor="middle">+1,0 m Parapetto sommitale</text>
      <text x="200" y="128" fill="${LIGHT}" font-size="11" font-family="monospace" text-anchor="middle">FACCIATA (L × H)</text>
      <text x="200" y="224" fill="${ORANGE}" font-size="11" font-family="monospace" text-anchor="middle">Sviluppo (+1,5 m sicurezza)</text>
      <text x="365" y="75" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">COMPUTO PONTEGGI &amp; Pi.M.U.S.</text>
      <text x="365" y="106" fill="${LIGHT}" font-size="12" font-family="sans-serif">• mq Ponteggio = (L + 1,5) × (H + 1,0)</text>
      <text x="365" y="134" fill="${ORANGE}" font-size="12" font-family="monospace">• Costi fissi: Montaggio + Pi.M.U.S. + Trasporto</text>
      <text x="365" y="162" fill="${LIGHT}" font-size="12" font-family="sans-serif">• Variabili: Noleggio €/mq·mese + Suolo Pubblico</text>
    `),

    equipment: () => wrapSvg('Schema riepilogo costi noleggio attrezzature e mezzi di cantiere', 'Tariffa giornaliera per giorni piu trasporti e carburante', `
      <rect x="65" y="65" width="160" height="130" rx="10" fill="rgba(255,90,38,0.13)" stroke="${ORANGE}" stroke-width="2"/>
      <text x="145" y="112" fill="${ORANGE}" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">NOLEGGIO BASE</text>
      <text x="145" y="142" fill="${LIGHT}" font-size="13" font-family="monospace" text-anchor="middle">€/gg × Giorni</text>
      <text x="250" y="136" fill="${CYAN}" font-size="22" font-family="monospace" text-anchor="middle">+</text>
      <rect x="275" y="65" width="160" height="130" rx="10" fill="rgba(0,229,255,0.09)" stroke="${CYAN}" stroke-width="2"/>
      <text x="355" y="112" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold" text-anchor="middle">COSTI ACCESSORI</text>
      <text x="355" y="140" fill="${LIGHT}" font-size="12" font-family="sans-serif" text-anchor="middle">Trasporto A/R</text>
      <text x="355" y="162" fill="${LIGHT}" font-size="12" font-family="sans-serif" text-anchor="middle">+ Carburante / Op.</text>
      <text x="465" y="105" fill="${CYAN}" font-size="12" font-family="monospace" font-weight="bold">TOTALE CANTIERE</text>
      <text x="465" y="135" fill="${LIGHT}" font-size="12" font-family="sans-serif">= Mezzo + Accessori</text>
      <text x="465" y="162" fill="${LIGHT}" font-size="12" font-family="sans-serif">+ Voci Extra</text>
      <text x="465" y="189" fill="${ORANGE}" font-size="12" font-family="monospace">+ Manodopera</text>
    `)
};

export function renderDiagram(diagramId) {
    const fn = DIAGRAMS[diagramId] || DIAGRAMS.cement;
    return fn();
}
