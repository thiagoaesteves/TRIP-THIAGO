import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import {
  AIRPORTS,
  INITIAL_ALERTS,
  RouteAlert,
  generateFareCalendar,
  normalizeText,
  resolveAirport,
  scanFlightsForRoute,
} from './src/data/flightEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  let savedAlerts: RouteAlert[] = [...INITIAL_ALERTS];

  app.post('/api/search', (req, res) => {
    const { origin = 'CWB', destination = 'GIG', date, passengers = 1 } = req.body || {};
    const searchDate =
      date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const pax = Math.max(1, Math.min(9, Number(passengers) || 1));

    const originAirport = resolveAirport(String(origin));
    const destinationAirport = resolveAirport(String(destination));
    const flights = scanFlightsForRoute(String(origin), String(destination), searchDate, pax);
    const calendar = generateFareCalendar(String(origin), String(destination), searchDate, pax);

    res.json({
      originAirport,
      destinationAirport,
      date: searchDate,
      passengers: pax,
      flights,
      calendar,
      scannedSources: [
        'LATAM Direto',
        'GOL / Smiles',
        'Azul / TudoAzul',
        'MaxMilhas',
        'Google Flights',
        'Skyscanner',
        'Decolar',
      ],
    });
  });

  app.get('/api/airports', (req, res) => {
    const q = normalizeText(String(req.query.q || ''));
    if (!q) {
      res.json(AIRPORTS);
      return;
    }
    const matches = AIRPORTS.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        normalizeText(a.city).includes(q) ||
        normalizeText(a.name).includes(q) ||
        normalizeText(a.state).includes(q)
    );
    res.json(matches);
  });

  app.get('/api/alerts', (_req, res) => {
    res.json(savedAlerts);
  });

  app.post('/api/alerts', (req, res) => {
    const { origin, destination, date, targetPrice } = req.body || {};
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
    res.status(201).json(newAlert);
  });

  app.delete('/api/alerts/:id', (req, res) => {
    savedAlerts = savedAlerts.filter((a) => a.id !== req.params.id);
    res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
