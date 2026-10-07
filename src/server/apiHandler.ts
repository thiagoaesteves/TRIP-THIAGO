import type { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import fs from 'fs';
import {
  AIRPORTS,
  INITIAL_ALERTS,
  RouteAlert,
  FlightOffer,
  generateFareCalendar,
  normalizeText,
  resolveAirport,
  scanFlightsForRoute,
} from '../data/flightEngine';

// Ensure environment variables are loaded
dotenv.config();
if (!process.env.DUFFEL_API_KEY && fs.existsSync('.env.example')) {
  dotenv.config({ path: '.env.example' });
}

let savedAlerts: RouteAlert[] = [...INITIAL_ALERTS];

function parseIsoDuration(dur: string): { label: string; minutes: number } {
  if (!dur) return { label: '1h 30m', minutes: 90 };
  const hMatch = dur.match(/(\d+)H/);
  const mMatch = dur.match(/(\d+)M/);
  const hours = hMatch ? parseInt(hMatch[1], 10) : 0;
  const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
  const total = hours * 60 + mins;
  return {
    label: `${hours}h ${mins.toString().padStart(2, '0')}m`,
    minutes: total || 90,
  };
}

async function fetchDuffelOffers(
  originCode: string,
  destCode: string,
  dateStr: string,
  passengersCount: number
): Promise<{ flights: FlightOffer[]; rawData: any } | null> {
  const duffelApiKey = process.env.DUFFEL_API_KEY;
  if (!duffelApiKey || duffelApiKey === 'duffel_test_...') {
    return null;
  }

  try {
    const passengers = Array.from({ length: Math.max(1, passengersCount) }, () => ({
      type: 'adult',
    }));

    const response = await fetch('https://api.duffel.com/air/offer_requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${duffelApiKey}`,
        'Duffel-Version': 'v2',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        data: {
          slices: [
            {
              origin: originCode,
              destination: destCode,
              departure_date: dateStr,
            },
          ],
          passengers,
          cabin_class: 'economy',
        },
      }),
    });

    if (!response.ok) {
      console.warn('Duffel API returned status:', response.status);
      return null;
    }

    const json = await response.json();
    const rawOffers = json.data?.offers;
    if (!Array.isArray(rawOffers) || rawOffers.length === 0) {
      return null;
    }

    const origObj = resolveAirport(originCode);
    const destObj = resolveAirport(destCode);

    const flights: FlightOffer[] = rawOffers.slice(0, 15).map((off: any, idx: number) => {
      const firstSlice = off.slices?.[0];
      const segments = firstSlice?.segments || [];
      const firstSeg = segments[0] || {};
      const lastSeg = segments[segments.length - 1] || firstSeg;

      const durParsed = parseIsoDuration(firstSlice?.duration || '');
      const depTime = firstSeg.departing_at
        ? firstSeg.departing_at.split('T')[1]?.slice(0, 5) || '08:00'
        : '08:00';
      const arrTime = lastSeg.arriving_at
        ? lastSeg.arriving_at.split('T')[1]?.slice(0, 5) || '10:30'
        : '10:30';

      const numStops = Math.max(0, segments.length - 1);
      const stopDetails =
        numStops === 0
          ? 'Voo Direto'
          : `${numStops} parada(s) (${segments[0]?.destination?.iata_code || 'HUB'})`;

      const rawAmount = parseFloat(off.total_amount) || 120;
      const currency = off.total_currency || 'BRL';
      // Taxa de câmbio para exibir em Reais quando a Duffel retornar em EUR ou USD
      const exchangeRate = currency === 'EUR' ? 6.15 : currency === 'USD' ? 5.65 : 1.0;
      const priceBrl = Math.round(rawAmount * exchangeRate * 100) / 100;

      const airlineName = off.owner?.name || 'Companhia Aérea';
      const rawAirlineCode = off.owner?.iata_code || firstSeg.operating_carrier?.iata_code || 'LA';
      const validAirlineCodes = ['LA', 'G3', 'AD', 'TP', 'AA'];
      const airlineCode = validAirlineCodes.includes(rawAirlineCode) ? rawAirlineCode : 'LA';

      const flightNum = firstSeg.marketing_carrier_flight_number
        ? `${rawAirlineCode} ${firstSeg.marketing_carrier_flight_number}`
        : `VOO ${1000 + idx * 42}`;

      const boardingTax = 54.65 * Math.max(1, passengersCount);
      const milesReq = Math.max(3800, Math.round((priceBrl - boardingTax) / 0.0175 / 100) * 100);

      const dayLabels = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Ontem', 'Hoje'];
      const priceHistory7d = dayLabels.map((dLabel, dIdx) => ({
        day: dLabel,
        price: Math.round(priceBrl * (1 + (((dIdx * 7) % 15) - 5) / 100)),
      }));

      const aircraftName = firstSeg.aircraft?.name || 'Airbus A320 / Boeing 737';

      return {
        id: off.id || `duffel-${idx}`,
        source: 'Duffel API (Ao Vivo)',
        sourceType: 'cia',
        airline: airlineName,
        airlineCode: airlineCode as any,
        flightNumber: flightNum,
        originCode: origObj.code,
        originCity: origObj.city,
        destinationCode: destObj.code,
        destinationCity: destObj.city,
        date: dateStr,
        departureTime: depTime,
        arrivalTime: arrTime,
        duration: durParsed.label,
        durationMinutes: durParsed.minutes,
        stops: numStops,
        stopDetails,
        price: priceBrl,
        baseFare: Math.max(50, Math.round((priceBrl - boardingTax) * 100) / 100),
        boardingFee: boardingTax,
        milesProgram: 'Programa de Fidelidade',
        milesRequired: milesReq,
        milesValuationPerThousand: 17.5,
        milesTotalCost: Math.round(((milesReq / 1000) * 16.5 + boardingTax) * 100) / 100,
        recommendedStrategy: 'Dinheiro',
        strategySavings: 15.0,
        baggage: '1 item pessoal + mala de mão inclusa',
        aircraft: aircraftName,
        fareClass: 'Econômica',
        refundable: false,
        historicalAvgPrice: Math.round(priceBrl * 1.18),
        discountPercent: 15,
        seatsLeft: 5,
        verifiedAt: `Ao vivo · Duffel GDS (${off.id.slice(0, 14)}...)`,
        link: `https://www.google.com/travel/flights?q=Flights%20to%20${destObj.code}%20from%20${origObj.code}%20on%20${dateStr}%20oneway&curr=BRL&hl=pt-BR`,
        priceHistory7d,
      };
    });

    return { flights, rawData: json.data };
  } catch (err) {
    console.error('Erro ao consultar Duffel API:', err);
    return null;
  }
}

function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function handleApiRequest(
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
): Promise<void> {
  const url = req.url || '';
  if (!url.startsWith('/api')) {
    return next();
  }

  const [pathName, queryString] = url.split('?');
  const query = new URLSearchParams(queryString || '');

  // GET /api/flights/search
  if (pathName === '/api/flights/search' && req.method === 'GET') {
    const rawOrigin = query.get('origin') || 'CWB';
    const rawDestination = query.get('destination') || 'GIG';
    const date = query.get('date') || '2026-11-20';
    const originAirport = resolveAirport(rawOrigin);
    const destinationAirport = resolveAirport(rawDestination);

    const duffelApiKey = process.env.DUFFEL_API_KEY;

    if (!duffelApiKey || duffelApiKey === 'duffel_test_...') {
      return sendJson(res, 400, { error: 'Chave da API da Duffel não configurada no .env.' });
    }

    try {
      const duffelResponse = await fetch('https://api.duffel.com/air/offer_requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${duffelApiKey}`,
          'Duffel-Version': 'v2',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          data: {
            slices: [
              {
                origin: originAirport.code,
                destination: destinationAirport.code,
                departure_date: date,
              },
            ],
            passengers: [{ type: 'adult' }],
            cabin_class: 'economy',
          },
        }),
      });

      const flightData = await duffelResponse.json();
      sendJson(res, duffelResponse.status, flightData);
    } catch {
      sendJson(res, 500, { error: 'Erro ao processar busca de voos reais na Duffel.' });
    }
    return;
  }

  // POST /api/search (Chamada principal feita pelo botão "Varrer")
  if (pathName === '/api/search' && req.method === 'POST') {
    const body = await parseBody(req);
    const { origin = 'CWB', destination = 'GIG', date, passengers = 1 } = body;
    const searchDate =
      date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const pax = Math.max(1, Math.min(9, Number(passengers) || 1));

    // Resolve sempre para o aeroporto correto (trata "Curitiba (CWB)" -> "CWB")
    const originAirport = resolveAirport(String(origin));
    const destinationAirport = resolveAirport(String(destination));

    let flights: FlightOffer[] = [];
    let duffelRawData: any = null;
    let isLiveDuffel = false;

    const duffelResult = await fetchDuffelOffers(
      originAirport.code,
      destinationAirport.code,
      searchDate,
      pax
    );

    const localOffers = scanFlightsForRoute(
      originAirport.code,
      destinationAirport.code,
      searchDate,
      pax
    );

    if (duffelResult && duffelResult.flights.length > 0) {
      isLiveDuffel = true;
      duffelRawData = duffelResult.rawData;
      // Mescla as ofertas reais da Duffel com as cotações de milhas locais
      const milesOffers = localOffers.filter((o) => o.sourceType === 'milhas');
      flights = [...duffelResult.flights, ...milesOffers].sort((a, b) => a.price - b.price);
    } else {
      flights = localOffers;
    }

    const calendar = generateFareCalendar(
      originAirport.code,
      destinationAirport.code,
      searchDate,
      pax
    );

    sendJson(res, 200, {
      originAirport,
      destinationAirport,
      date: searchDate,
      passengers: pax,
      flights,
      calendar,
      isLiveDuffel,
      duffelOffers: duffelRawData || {},
      scannedSources: [
        'Duffel Global GDS (Ao Vivo)',
        'LATAM Direto',
        'GOL / Smiles',
        'Azul / TudoAzul',
        'MaxMilhas',
        'Google Flights',
        'Skyscanner',
      ],
    });
    return;
  }

  // GET /api/airports
  if (pathName === '/api/airports' && req.method === 'GET') {
    const q = normalizeText(query.get('q') || '');
    if (!q) {
      sendJson(res, 200, AIRPORTS);
      return;
    }
    const matches = AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        normalizeText(a.city).includes(q) ||
        normalizeText(a.name).includes(q) ||
        normalizeText(a.state).includes(q)
    );
    sendJson(res, 200, matches);
    return;
  }

  // GET /api/alerts
  if (pathName === '/api/alerts' && req.method === 'GET') {
    sendJson(res, 200, savedAlerts);
    return;
  }

  // POST /api/alerts
  if (pathName === '/api/alerts' && req.method === 'POST') {
    const body = await parseBody(req);
    const { origin, destination, date, targetPrice } = body;
    const orig = resolveAirport(String(origin || 'CWB'));
    const dest = resolveAirport(String(destination || 'GIG'));
    const flightDate =
      date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const offers = scanFlightsForRoute(orig.code, dest.code, flightDate, 1);
    const cheapest = offers[0];

    const newAlert: RouteAlert = {
      id: `alert-${Date.now()}`,
      originCode: orig.code,
      originCity: orig.city,
      destinationCode: dest.code,
      destinationCity: dest.city,
      date: flightDate,
      targetPrice: Number(targetPrice) || Math.round(cheapest.price * 0.92),
      currentLowestPrice: cheapest.price,
      lowestSource: cheapest.source,
      lowestAirline: cheapest.airline,
      lastChecked: 'Agora mesmo',
      active: true,
      priceChange24h: -6.4,
    };

    savedAlerts = [newAlert, ...savedAlerts];
    sendJson(res, 201, newAlert);
    return;
  }

  // DELETE /api/alerts/:id
  if (pathName.startsWith('/api/alerts/') && req.method === 'DELETE') {
    const id = pathName.replace('/api/alerts/', '');
    savedAlerts = savedAlerts.filter((a) => a.id !== id);
    sendJson(res, 200, { ok: true });
    return;
  }

  next();
}
