export interface Airport {
  code: string;
  city: string;
  name: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
  isInternational?: boolean;
}

export interface FlightOffer {
  id: string;
  source: string;
  sourceType: 'cia' | 'milhas' | 'agencia' | 'metabuscador';
  airline: string;
  airlineCode: 'LA' | 'G3' | 'AD' | 'TP' | 'AA';
  flightNumber: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  stops: number;
  stopDetails: string;
  price: number;
  baseFare: number;
  boardingFee: number;
  milesProgram: string;
  milesRequired: number;
  milesValuationPerThousand: number;
  milesTotalCost: number;
  recommendedStrategy: 'Dinheiro' | 'Milhas';
  strategySavings: number;
  baggage: string;
  aircraft: string;
  fareClass: string;
  refundable: boolean;
  historicalAvgPrice: number;
  discountPercent: number;
  seatsLeft: number;
  verifiedAt: string;
  link: string;
  priceHistory7d: { day: string; price: number }[];
}

export interface CalendarDayFare {
  date: string;
  dayLabel: string;
  weekdayShort: string;
  lowestPrice: number;
  lowestMiles: number;
  airline: string;
  source: string;
  isSelected: boolean;
  isCheapest: boolean;
}

export interface RouteAlert {
  id: string;
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  date: string;
  targetPrice: number;
  currentLowestPrice: number;
  lowestSource: string;
  lowestAirline: string;
  lastChecked: string;
  active: boolean;
  priceChange24h: number;
}

export const AIRPORTS: Airport[] = [
  { code: 'CWB', city: 'Curitiba', name: 'Afonso Pena Internacional', state: 'PR', country: 'Brasil', lat: -25.5285, lon: -49.1758 },
  { code: 'GIG', city: 'Rio de Janeiro', name: 'Galeão - Tom Jobim', state: 'RJ', country: 'Brasil', lat: -22.8099, lon: -43.2505 },
  { code: 'SDU', city: 'Rio de Janeiro (Santos Dumont)', name: 'Santos Dumont', state: 'RJ', country: 'Brasil', lat: -22.9105, lon: -43.1631 },
  { code: 'GRU', city: 'São Paulo', name: 'Guarulhos Internacional', state: 'SP', country: 'Brasil', lat: -23.4356, lon: -46.4731 },
  { code: 'CGH', city: 'São Paulo (Congonhas)', name: 'Congonhas', state: 'SP', country: 'Brasil', lat: -23.6261, lon: -46.6564 },
  { code: 'VCP', city: 'Campinas', name: 'Viracopos Internacional', state: 'SP', country: 'Brasil', lat: -23.0074, lon: -47.1345 },
  { code: 'BSB', city: 'Brasília', name: 'Presidente Juscelino Kubitschek', state: 'DF', country: 'Brasil', lat: -15.8711, lon: -47.9186 },
  { code: 'CNF', city: 'Belo Horizonte', name: 'Confins - Tancredo Neves', state: 'MG', country: 'Brasil', lat: -19.6244, lon: -43.9719 },
  { code: 'SSA', city: 'Salvador', name: 'Deputado Luís Eduardo Magalhães', state: 'BA', country: 'Brasil', lat: -12.9086, lon: -38.3225 },
  { code: 'REC', city: 'Recife', name: 'Guararapes - Gilberto Freyre', state: 'PE', country: 'Brasil', lat: -8.1265, lon: -34.9236 },
  { code: 'FOR', city: 'Fortaleza', name: 'Pinto Martins Internacional', state: 'CE', country: 'Brasil', lat: -3.7763, lon: -38.5326 },
  { code: 'POA', city: 'Porto Alegre', name: 'Salgado Filho Internacional', state: 'RS', country: 'Brasil', lat: -29.9944, lon: -51.1714 },
  { code: 'FLN', city: 'Florianópolis', name: 'Hercílio Luz Internacional', state: 'SC', country: 'Brasil', lat: -27.6703, lon: -48.5525 },
  { code: 'NVT', city: 'Navegantes / Balneário Camboriú', name: 'Ministro Victor Konder', state: 'SC', country: 'Brasil', lat: -26.8799, lon: -48.6514 },
  { code: 'IGU', city: 'Foz do Iguaçu', name: 'Cataratas Internacional', state: 'PR', country: 'Brasil', lat: -25.6003, lon: -54.485 },
  { code: 'NAT', city: 'Natal', name: 'São Gonçalo do Amarante', state: 'RN', country: 'Brasil', lat: -5.7681, lon: -35.3761 },
  { code: 'MCZ', city: 'Maceió', name: 'Zumbi dos Palmares', state: 'AL', country: 'Brasil', lat: -9.5108, lon: -35.7917 },
  { code: 'GYN', city: 'Goiânia', name: 'Santa Genoveva', state: 'GO', country: 'Brasil', lat: -16.632, lon: -49.2207 },
  { code: 'VIX', city: 'Vitória', name: 'Eurico de Aguiar Salles', state: 'ES', country: 'Brasil', lat: -20.2581, lon: -40.2864 },
  { code: 'MAO', city: 'Manaus', name: 'Eduardo Gomes Internacional', state: 'AM', country: 'Brasil', lat: -3.0386, lon: -60.0497 },
  { code: 'BEL', city: 'Belém', name: 'Val-de-Cans Internacional', state: 'PA', country: 'Brasil', lat: -1.3793, lon: -48.4763 },
  { code: 'SLZ', city: 'São Luís', name: 'Marechal Cunha Machado', state: 'MA', country: 'Brasil', lat: -2.5854, lon: -44.2341 },
  { code: 'CGR', city: 'Campo Grande', name: 'Campo Grande Internacional', state: 'MS', country: 'Brasil', lat: -20.4687, lon: -54.6725 },
  { code: 'CGB', city: 'Cuiabá', name: 'Marechal Rondon', state: 'MT', country: 'Brasil', lat: -15.6529, lon: -56.1167 },
  { code: 'LIS', city: 'Lisboa', name: 'Humberto Delgado', state: 'PT', country: 'Portugal', lat: 38.7756, lon: -9.1354, isInternational: true },
  { code: 'MIA', city: 'Miami', name: 'Miami International', state: 'FL', country: 'EUA', lat: 25.7959, lon: -80.287, isInternational: true },
  { code: 'MCO', city: 'Orlando', name: 'Orlando International', state: 'FL', country: 'EUA', lat: 28.4312, lon: -81.3081, isInternational: true },
  { code: 'EZE', city: 'Buenos Aires', name: 'Ezeiza Internacional', state: 'BA', country: 'Argentina', lat: -34.8222, lon: -58.5358, isInternational: true },
  { code: 'SCL', city: 'Santiago', name: 'Arturo Merino Benítez', state: 'RM', country: 'Chile', lat: -33.393, lon: -70.7858, isInternational: true },
];

export function normalizeText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function resolveAirport(input: string): Airport {
  const raw = input.trim();
  if (!raw) {
    return AIRPORTS[0];
  }

  const parenMatch = raw.match(/\(([A-Za-z]{3})\)/);
  if (parenMatch) {
    const code = parenMatch[1].toUpperCase();
    const byParen = AIRPORTS.find((a) => a.code === code);
    if (byParen) return byParen;
  }

  const upper = raw.toUpperCase();
  if (upper.length === 3) {
    const exactCode = AIRPORTS.find((a) => a.code === upper);
    if (exactCode) return exactCode;
  }

  const norm = normalizeText(raw);

  if (norm === 'rio' || norm === 'rj' || norm === 'rio de janeiro') {
    return AIRPORTS.find((a) => a.code === 'GIG')!;
  }
  if (norm === 'sp' || norm === 'sao paulo') {
    return AIRPORTS.find((a) => a.code === 'GRU')!;
  }
  if (norm === 'bh' || norm === 'belo horizonte') {
    return AIRPORTS.find((a) => a.code === 'CNF')!;
  }
  if (norm === 'floripa') {
    return AIRPORTS.find((a) => a.code === 'FLN')!;
  }

  const byCityExact = AIRPORTS.find((a) => normalizeText(a.city) === norm);
  if (byCityExact) return byCityExact;

  const byPartial = AIRPORTS.find(
    (a) =>
      normalizeText(a.city).includes(norm) ||
      normalizeText(a.name).includes(norm) ||
      a.code.toLowerCase().includes(norm)
  );
  if (byPartial) return byPartial;

  const cleanCode = raw
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X');

  return {
    code: cleanCode,
    city: raw.charAt(0).toUpperCase() + raw.slice(1),
    name: `Aeroporto de ${raw}`,
    state: 'BR',
    country: 'Brasil',
    lat: -18.5,
    lon: -46.5,
  };
}

function calculateDistanceKm(a: Airport, b: Airport): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.max(250, Math.round(R * c));
}

function seededHash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
}

function addMinutesToTime(timeStr: string, minutesToAdd: number): string {
  const [hh, mm] = timeStr.split(':').map(Number);
  const total = hh * 60 + mm + minutesToAdd;
  const nextH = Math.floor(total / 60) % 24;
  const nextM = total % 60;
  const dayOverflow = Math.floor(total / (24 * 60));
  const base = `${nextH.toString().padStart(2, '0')}:${nextM.toString().padStart(2, '0')}`;
  return dayOverflow > 0 ? `${base} (+${dayOverflow})` : base;
}

function buildExternalOfferLink(
  source: string,
  originCode: string,
  destCode: string,
  date: string
): string {
  const cleanDate = date || '2026-11-15';
  const s = source.toLowerCase();
  if (s.includes('google')) {
    return `https://www.google.com/travel/flights?q=Flights%20to%20${destCode}%20from%20${originCode}%20on%20${cleanDate}%20oneway&curr=BRL&hl=pt-BR`;
  }
  if (s.includes('skyscanner')) {
    const yymmdd = cleanDate.replace(/-/g, '').slice(2);
    return `https://www.skyscanner.com.br/transporte/passagens-aereas/${originCode.toLowerCase()}/${destCode.toLowerCase()}/${yymmdd}/`;
  }
  if (s.includes('latam')) {
    return `https://www.latamairlines.com/br/pt/oferta-voos?origin=${originCode}&destination=${destCode}&outbound=${cleanDate}T12%3A00%3A00.000Z&adt=1&chd=0&inf=0&trip=OW&cabin=Economy`;
  }
  if (s.includes('gol') || s.includes('smiles')) {
    return `https://www.voegol.com.br/comprar-passagem-aerea?origem=${originCode}&destino=${destCode}&dataIda=${cleanDate}`;
  }
  if (s.includes('azul')) {
    return `https://www.voeazul.com.br/br/pt/home?origin=${originCode}&destination=${destCode}&departure=${cleanDate}`;
  }
  if (s.includes('decolar')) {
    return `https://www.decolar.com/shop/flights/results/oneway/${originCode}/${destCode}/${cleanDate}/1/0/0`;
  }
  if (s.includes('maxmilhas')) {
    return `https://www.maxmilhas.com.br/busca-passagens-aereas/OW/${originCode}/${destCode}/${cleanDate}/1/0/0/EC`;
  }
  return `https://www.google.com/travel/flights?q=Voos+de+${originCode}+para+${destCode}+em+${cleanDate}&curr=BRL&hl=pt-BR`;
}

export function scanFlightsForRoute(
  originInput: string,
  destinationInput: string,
  dateInput: string,
  passengers: number = 1
): FlightOffer[] {
  const origin = resolveAirport(originInput);
  let destination = resolveAirport(destinationInput);

  if (origin.code === destination.code) {
    destination = AIRPORTS.find((a) => a.code !== origin.code) || AIRPORTS[1];
  }

  const date = dateInput || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const distKm = calculateDistanceKm(origin, destination);
  const isIntl = Boolean(origin.isInternational || destination.isInternational);

  const baseFlightMins = Math.round((distKm / 760) * 60 + 38);
  const seed = seededHash(`${origin.code}-${destination.code}-${date}`);
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
  const dowFactor =
    dayOfWeek === 2 || dayOfWeek === 3
      ? 0.86
      : dayOfWeek === 6
      ? 0.92
      : dayOfWeek === 5 || dayOfWeek === 0
      ? 1.14
      : 1.0;

  const rawBasePrice = isIntl
    ? 1480 + distKm * 0.34
    : 215 + distKm * 0.24 + ((seed % 90) - 35);

  const routeBaseline = Math.max(189, Math.round(rawBasePrice * dowFactor));
  const historicalAvgPrice = Math.round(routeBaseline * 1.24);
  const boardingFee = isIntl ? 218.9 : 54.65;

  const connectionHub =
    origin.code !== 'GRU' && destination.code !== 'GRU'
      ? 'GRU'
      : origin.code !== 'VCP' && destination.code !== 'VCP'
      ? 'VCP'
      : 'BSB';

  const templates: Array<{
    source: string;
    sourceType: FlightOffer['sourceType'];
    airline: string;
    airlineCode: FlightOffer['airlineCode'];
    flightNumSuffix: number;
    depTime: string;
    stops: number;
    layoverMins: number;
    priceMultiplier: number;
    milesProgram: string;
    cpm: number;
    aircraft: string;
    fareClass: string;
    baggage: string;
    refundable: boolean;
  }> = [
    {
      source: 'Smiles / Balcão de Milhas',
      sourceType: 'milhas',
      airline: 'GOL Linhas Aéreas',
      airlineCode: 'G3',
      flightNumSuffix: 1142 + (seed % 400),
      depTime: '06:15',
      stops: 0,
      layoverMins: 0,
      priceMultiplier: 0.89,
      milesProgram: 'Smiles Diamante',
      cpm: 15.8,
      aircraft: 'Boeing 737 MAX 8',
      fareClass: 'Promo Light',
      baggage: '1 item pessoal + 1 mala de mão (10kg)',
      refundable: false,
    },
    {
      source: 'LATAM Direto (Site Oficial)',
      sourceType: 'cia',
      airline: 'LATAM Airlines',
      airlineCode: 'LA',
      flightNumSuffix: 3310 + (seed % 500),
      depTime: '08:40',
      stops: 0,
      layoverMins: 0,
      priceMultiplier: 0.94,
      milesProgram: 'LATAM Pass',
      cpm: 23.5,
      aircraft: 'Airbus A320neo',
      fareClass: 'Light',
      baggage: '1 item pessoal + 1 mala de mão (10kg)',
      refundable: false,
    },
    {
      source: 'MaxMilhas',
      sourceType: 'milhas',
      airline: 'Azul Linhas Aéreas',
      airlineCode: 'AD',
      flightNumSuffix: 4208 + (seed % 600),
      depTime: '11:20',
      stops: 0,
      layoverMins: 0,
      priceMultiplier: 0.97,
      milesProgram: 'TudoAzul Interline',
      cpm: 17.2,
      aircraft: 'Embraer E195-E2',
      fareClass: 'Azul Super Promo',
      baggage: '1 item pessoal + 1 mala de mão (10kg)',
      refundable: false,
    },
    {
      source: 'Google Flights / Direto',
      sourceType: 'metabuscador',
      airline: 'LATAM Airlines',
      airlineCode: 'LA',
      flightNumSuffix: 3584 + (seed % 300),
      depTime: '14:55',
      stops: 0,
      layoverMins: 0,
      priceMultiplier: 1.02,
      milesProgram: 'LATAM Pass',
      cpm: 24.0,
      aircraft: 'Airbus A321',
      fareClass: 'Standard',
      baggage: 'Mão (10kg) + Seleção de Assento',
      refundable: false,
    },
    {
      source: 'Skyscanner Brasil',
      sourceType: 'metabuscador',
      airline: 'GOL Linhas Aéreas',
      airlineCode: 'G3',
      flightNumSuffix: 1480 + (seed % 350),
      depTime: '17:10',
      stops: 1,
      layoverMins: 55,
      priceMultiplier: 1.06,
      milesProgram: 'Smiles',
      cpm: 18.4,
      aircraft: 'Boeing 737-800',
      fareClass: 'Light',
      baggage: '1 item pessoal + 1 mala de mão (10kg)',
      refundable: false,
    },
    {
      source: 'Azul Direto (Site Oficial)',
      sourceType: 'cia',
      airline: 'Azul Linhas Aéreas',
      airlineCode: 'AD',
      flightNumSuffix: 2816 + (seed % 450),
      depTime: '19:35',
      stops: 0,
      layoverMins: 0,
      priceMultiplier: 1.11,
      milesProgram: 'TudoAzul',
      cpm: 21.0,
      aircraft: 'Embraer E195-E2',
      fareClass: 'Mais Azul',
      baggage: 'Mão (10kg) + 1 Bagagem Despachada (23kg)',
      refundable: true,
    },
    {
      source: 'Decolar / Agência OTA',
      sourceType: 'agencia',
      airline: 'LATAM Airlines',
      airlineCode: 'LA',
      flightNumSuffix: 3890 + (seed % 250),
      depTime: '21:15',
      stops: 1,
      layoverMins: 70,
      priceMultiplier: 1.17,
      milesProgram: 'LATAM Pass',
      cpm: 25.2,
      aircraft: 'Airbus A320',
      fareClass: 'Plus',
      baggage: 'Mão (10kg) + 1 Bagagem Despachada (23kg)',
      refundable: true,
    },
  ];

  const offers: FlightOffer[] = templates.map((tpl, idx) => {
    const jitter = ((seed + idx * 37) % 28) - 12;
    const totalDurationMins = baseFlightMins + tpl.layoverMins + (idx % 3) * 5;
    const singlePaxPrice = Math.max(
      149.9,
      Math.round((routeBaseline * tpl.priceMultiplier + jitter) * 10) / 10
    );
    const totalPrice = Math.round(singlePaxPrice * Math.max(1, passengers) * 100) / 100;
    const totalBoarding = Math.round(boardingFee * Math.max(1, passengers) * 100) / 100;
    const baseFare = Math.max(80, Math.round((totalPrice - totalBoarding) * 100) / 100);

    const rawMilesSingle = Math.max(
      3500,
      Math.round((singlePaxPrice - boardingFee) / (tpl.cpm / 1000) / 100) * 100
    );
    const milesRequired = rawMilesSingle * Math.max(1, passengers);
    const acquisitionCpm = tpl.airlineCode === 'LA' ? 23.9 : 16.5;
    const milesTotalCost =
      Math.round(((milesRequired / 1000) * acquisitionCpm + totalBoarding) * 100) / 100;

    const diff = totalPrice - milesTotalCost;
    const recommendedStrategy: 'Dinheiro' | 'Milhas' = diff > 18 ? 'Milhas' : 'Dinheiro';
    const strategySavings = Math.round(Math.abs(diff) * 100) / 100;

    const totalHistoricalAvg = historicalAvgPrice * Math.max(1, passengers);
    const discountPercent = Math.round(
      ((totalHistoricalAvg - totalPrice) / totalHistoricalAvg) * 100
    );

    const stopDetails =
      tpl.stops === 0
        ? 'Voo Direto'
        : `1 parada em ${connectionHub} (${tpl.layoverMins}m)`;

    const dayLabels = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Ontem', 'Hoje'];
    const priceHistory7d = dayLabels.map((dLabel, dIdx) => {
      if (dIdx === 6) return { day: dLabel, price: Math.round(totalPrice) };
      const histMultiplier = 1 + (((seed + dIdx * 19 + idx * 7) % 26) - 6) / 100;
      return {
        day: dLabel,
        price: Math.round(totalPrice * histMultiplier),
      };
    });

    return {
      id: `${origin.code}-${destination.code}-${date}-${idx}`,
      source: tpl.source,
      sourceType: tpl.sourceType,
      airline: tpl.airline,
      airlineCode: tpl.airlineCode,
      flightNumber: `${tpl.airlineCode} ${tpl.flightNumSuffix}`,
      originCode: origin.code,
      originCity: origin.city,
      destinationCode: destination.code,
      destinationCity: destination.city,
      date,
      departureTime: tpl.depTime,
      arrivalTime: addMinutesToTime(tpl.depTime, totalDurationMins),
      duration: formatDuration(totalDurationMins),
      durationMinutes: totalDurationMins,
      stops: tpl.stops,
      stopDetails,
      price: totalPrice,
      baseFare,
      boardingFee: totalBoarding,
      milesProgram: tpl.milesProgram,
      milesRequired,
      milesValuationPerThousand: tpl.cpm,
      milesTotalCost,
      recommendedStrategy,
      strategySavings,
      baggage: tpl.baggage,
      aircraft: tpl.aircraft,
      fareClass: tpl.fareClass,
      refundable: tpl.refundable,
      historicalAvgPrice: totalHistoricalAvg,
      discountPercent,
      seatsLeft: ((seed + idx * 3) % 6) + 2,
      verifiedAt: 'Agora mesmo',
      link: buildExternalOfferLink(tpl.source, origin.code, destination.code, date),
      priceHistory7d,
    };
  });

  return offers.sort((a, b) => a.price - b.price);
}

const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function generateFareCalendar(
  originInput: string,
  destinationInput: string,
  selectedDateInput: string,
  passengers: number = 1
): CalendarDayFare[] {
  const baseDateStr =
    selectedDateInput || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const centerDate = new Date(`${baseDateStr}T12:00:00`);

  const days: CalendarDayFare[] = [];

  for (let offset = -5; offset <= 5; offset++) {
    const d = new Date(centerDate.getTime() + offset * 86400000);
    const iso = d.toISOString().split('T')[0];
    const offers = scanFlightsForRoute(originInput, destinationInput, iso, passengers);
    const cheapest = offers[0];

    days.push({
      date: iso,
      dayLabel: `${d.getDate().toString().padStart(2, '0')} ${MONTHS_PT[d.getMonth()]}`,
      weekdayShort: WEEKDAYS_PT[d.getDay()],
      lowestPrice: cheapest.price,
      lowestMiles: cheapest.milesRequired,
      airline: cheapest.airline,
      source: cheapest.source,
      isSelected: iso === baseDateStr,
      isCheapest: false,
    });
  }

  const minPrice = Math.min(...days.map((d) => d.lowestPrice));
  return days.map((d) => ({
    ...d,
    isCheapest: d.lowestPrice === minPrice,
  }));
}

export const INITIAL_ALERTS: RouteAlert[] = [
  {
    id: 'alert-cwb-gig',
    originCode: 'CWB',
    originCity: 'Curitiba',
    destinationCode: 'GIG',
    destinationCity: 'Rio de Janeiro',
    date: '2026-11-18',
    targetPrice: 340,
    currentLowestPrice: 289.9,
    lowestSource: 'Smiles / Balcão de Milhas',
    lowestAirline: 'GOL Linhas Aéreas',
    lastChecked: 'Há 2 min',
    active: true,
    priceChange24h: -14.2,
  },
  {
    id: 'alert-gru-rec',
    originCode: 'GRU',
    originCity: 'São Paulo',
    destinationCode: 'REC',
    destinationCity: 'Recife',
    date: '2026-11-24',
    targetPrice: 620,
    currentLowestPrice: 574.5,
    lowestSource: 'LATAM Direto (Site Oficial)',
    lowestAirline: 'LATAM Airlines',
    lastChecked: 'Há 4 min',
    active: true,
    priceChange24h: -8.6,
  },
  {
    id: 'alert-bsb-fln',
    originCode: 'BSB',
    originCity: 'Brasília',
    destinationCode: 'FLN',
    destinationCity: 'Florianópolis',
    date: '2026-12-03',
    targetPrice: 450,
    currentLowestPrice: 468.0,
    lowestSource: 'MaxMilhas',
    lowestAirline: 'Azul Linhas Aéreas',
    lastChecked: 'Há 5 min',
    active: true,
    priceChange24h: 3.1,
  },
];
