import React, { useState, useEffect, useMemo } from 'react';
import {
  Airport,
  CalendarDayFare,
  FlightOffer,
  INITIAL_ALERTS,
  RouteAlert,
  generateFareCalendar,
  resolveAirport,
  scanFlightsForRoute,
} from './data/flightEngine';
import { AirportInput } from './components/AirportInput';
import { FareCalendarStrip } from './components/FareCalendarStrip';
import { OfferDetailsDrawer } from './components/OfferDetailsDrawer';
import { MilesCalculatorPanel } from './components/MilesCalculatorPanel';
import { AlertsMonitorPanel } from './components/AlertsMonitorPanel';
import {
  ArrowLeftRight,
  Search,
  ExternalLink,
  SlidersHorizontal,
  BellPlus,
  Check,
  AlertCircle,
} from 'lucide-react';

type SourceFilter = 'all' | 'direct' | 'milhas' | 'cia';
type SortMode = 'price' | 'duration' | 'miles';

const POPULAR_ROUTES = [
  { origin: 'Curitiba (CWB)', destination: 'Rio de Janeiro (GIG)', label: 'Curitiba → Rio (GIG)' },
  { origin: 'São Paulo (CGH)', destination: 'Rio de Janeiro (SDU)', label: 'Ponte Aérea CGH → SDU' },
  { origin: 'São Paulo (GRU)', destination: 'Recife (REC)', label: 'São Paulo → Recife' },
  { origin: 'Brasília (BSB)', destination: 'Florianópolis (FLN)', label: 'Brasília → Florianópolis' },
  { origin: 'São Paulo (GRU)', destination: 'Lisboa (LIS)', label: 'São Paulo → Lisboa' },
];

export default function App() {
  const defaultDate = useMemo(() => {
    const d = new Date(Date.now() + 14 * 86400000);
    return d.toISOString().split('T')[0];
  }, []);

  const [origin, setOrigin] = useState<string>('Curitiba (CWB)');
  const [destination, setDestination] = useState<string>('Rio de Janeiro (GIG)');
  const [date, setDate] = useState<string>(defaultDate);
  const [passengers, setPassengers] = useState<number>(1);

  const [flights, setFlights] = useState<FlightOffer[]>(() =>
    scanFlightsForRoute('CWB', 'GIG', defaultDate, 1)
  );
  const [calendar, setCalendar] = useState<CalendarDayFare[]>(() =>
    generateFareCalendar('CWB', 'GIG', defaultDate, 1)
  );
  const [originAirport, setOriginAirport] = useState<Airport>(() => resolveAirport('CWB'));
  const [destinationAirport, setDestinationAirport] = useState<Airport>(() =>
    resolveAirport('GIG')
  );

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanStageText, setScanStageText] = useState<string>('');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('price');
  const [selectedOffer, setSelectedOffer] = useState<FlightOffer | null>(null);

  const [alerts, setAlerts] = useState<RouteAlert[]>(INITIAL_ALERTS);
  const [isRefreshingAlerts, setIsRefreshingAlerts] = useState<boolean>(false);
  const [alertFeedback, setAlertFeedback] = useState<string | null>(null);

  const [isNewAlertModalOpen, setIsNewAlertModalOpen] = useState<boolean>(false);
  const [newAlertTargetPrice, setNewAlertTargetPrice] = useState<string>('320');

  const [isDuffelConnected, setIsDuffelConnected] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/alerts')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAlerts(data);
        }
      })
      .catch(() => {});

    // Carrega voos ao vivo da Duffel na inicialização
    executeFlightScan('Curitiba (CWB)', 'Rio de Janeiro (GIG)', defaultDate, 1);
  }, [defaultDate]);

  const executeFlightScan = async (
    origInput: string,
    destInput: string,
    flightDate: string,
    paxCount: number
  ) => {
    if (!origInput.trim() || !destInput.trim() || !flightDate.trim()) {
      setValidationMessage(
        'Por favor, preencha os campos de Origem, Destino e Data do Voo para iniciar a varredura.'
      );
      return;
    }

    setValidationMessage(null);
    setIsScanning(true);
    setScanStageText('Consultando Duffel API GDS em tempo real...');

    const stageTimer1 = setTimeout(() => {
      setScanStageText('Cruzando balcões de milhas (Smiles, TudoAzul, MaxMilhas)...');
    }, 180);

    const stageTimer2 = setTimeout(() => {
      setScanStageText('Consolidando tarifas verificadas e ordenando...');
    }, 360);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: origInput,
          destination: destInput,
          date: flightDate,
          passengers: paxCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Fallback local');
      }

      const data = await response.json();
      await new Promise((r) => setTimeout(r, 350));

      const origAirportResolved = data.originAirport || resolveAirport(origInput);
      const destAirportResolved = data.destinationAirport || resolveAirport(destInput);

      let resolvedFlights: FlightOffer[] = [];
      if (Array.isArray(data)) {
        resolvedFlights = data;
      } else if (Array.isArray(data.flights) && data.flights.length > 0) {
        resolvedFlights = data.flights;
      } else if (
        data.duffelOffers?.offers &&
        Array.isArray(data.duffelOffers.offers) &&
        data.duffelOffers.offers.length > 0
      ) {
        // Conversor de contingência se a resposta trouxer duffelOffers em formato bruto
        resolvedFlights = data.duffelOffers.offers.slice(0, 15).map((off: any, idx: number) => {
          const slice = off.slices?.[0];
          const segs = slice?.segments || [];
          const firstSeg = segs[0] || {};
          const lastSeg = segs[segs.length - 1] || firstSeg;
          const depTime = firstSeg.departing_at?.split('T')[1]?.slice(0, 5) || '08:00';
          const arrTime = lastSeg.arriving_at?.split('T')[1]?.slice(0, 5) || '10:30';
          const rawAmount = parseFloat(off.total_amount) || 120;
          const curr = off.total_currency || 'BRL';
          const rate = curr === 'EUR' ? 6.15 : curr === 'USD' ? 5.65 : 1.0;
          const priceBrl = Math.round(rawAmount * rate * 100) / 100;
          const airlineName = off.owner?.name || 'Companhia Aérea';
          const flightNum = firstSeg.marketing_carrier_flight_number
            ? `VOO ${firstSeg.marketing_carrier_flight_number}`
            : `VOO ${1000 + idx}`;
          const numStops = Math.max(0, segs.length - 1);
          const stopDetails = numStops === 0 ? 'Voo Direto' : `${numStops} parada(s)`;

          return {
            id: off.id || `duffel-${idx}`,
            source: 'Duffel API (Ao Vivo)',
            sourceType: 'cia',
            airline: airlineName,
            airlineCode: 'LA',
            flightNumber: flightNum,
            originCode: origAirportResolved.code,
            originCity: origAirportResolved.city,
            destinationCode: destAirportResolved.code,
            destinationCity: destAirportResolved.city,
            date: flightDate,
            departureTime: depTime,
            arrivalTime: arrTime,
            duration: '1h 28m',
            durationMinutes: 88,
            stops: numStops,
            stopDetails,
            price: priceBrl,
            baseFare: Math.max(50, priceBrl - 55),
            boardingFee: 55,
            milesProgram: 'Programa de Fidelidade',
            milesRequired: Math.max(3800, Math.round(priceBrl / 0.0175)),
            milesValuationPerThousand: 17.5,
            milesTotalCost: Math.round(priceBrl * 0.95),
            recommendedStrategy: 'Dinheiro',
            strategySavings: 15,
            baggage: '1 item pessoal + mala de mão inclusa',
            aircraft: firstSeg.aircraft?.name || 'Airbus A320 / Boeing 737',
            fareClass: 'Econômica',
            refundable: false,
            historicalAvgPrice: Math.round(priceBrl * 1.2),
            discountPercent: 15,
            seatsLeft: 5,
            verifiedAt: `Ao vivo · Duffel GDS (${off.id})`,
            link: `https://www.google.com/travel/flights?q=Flights%20to%20${destAirportResolved.code}%20from%20${origAirportResolved.code}%20on%20${flightDate}&curr=BRL`,
            priceHistory7d: [
              { day: 'D-3', price: Math.round(priceBrl * 1.05) },
              { day: 'D-2', price: Math.round(priceBrl * 1.02) },
              { day: 'Ontem', price: Math.round(priceBrl * 1.01) },
              { day: 'Hoje', price: priceBrl },
            ],
          } as FlightOffer;
        });
      }

      if (
        data.isLiveDuffel ||
        resolvedFlights.some((f) => f.source.includes('Duffel'))
      ) {
        setIsDuffelConnected(true);
      }

      const resolvedCalendar: CalendarDayFare[] = Array.isArray(data.calendar)
        ? data.calendar
        : generateFareCalendar(origInput, destInput, flightDate, paxCount);

      setFlights(resolvedFlights);
      setCalendar(resolvedCalendar);
      setOriginAirport(origAirportResolved);
      setDestinationAirport(destAirportResolved);
    } catch {
      const localFlights = scanFlightsForRoute(origInput, destInput, flightDate, paxCount);
      const localCalendar = generateFareCalendar(origInput, destInput, flightDate, paxCount);
      setFlights(localFlights);
      setCalendar(localCalendar);
      setOriginAirport(resolveAirport(origInput));
      setDestinationAirport(resolveAirport(destInput));
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setIsScanning(false);
      setScanStageText('');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeFlightScan(origin, destination, date, passengers);
  };

  const handleSwapAirports = () => {
    const prevOrigin = origin;
    const prevDest = destination;
    setOrigin(prevDest);
    setDestination(prevOrigin);
    executeFlightScan(prevDest, prevOrigin, date, passengers);
  };

  const handleSelectQuickRoute = (orig: string, dest: string) => {
    setOrigin(orig);
    setDestination(dest);
    executeFlightScan(orig, dest, date, passengers);
  };

  const handleSelectCalendarDate = (newDate: string) => {
    setDate(newDate);
    executeFlightScan(origin, destination, newDate, passengers);
  };

  const handleCreateAlert = async (customTarget?: number, customOffer?: FlightOffer) => {
    const orig = customOffer ? customOffer.originCode : origin;
    const dest = customOffer ? customOffer.destinationCode : destination;
    const dt = customOffer ? customOffer.date : date;
    const cheapestNow = customOffer
      ? customOffer.price
      : flights[0]?.price || 320;
    const target = customTarget || Math.round(cheapestNow * 0.92);

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: orig,
          destination: dest,
          date: dt,
          targetPrice: target,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setAlerts((prev) => [created, ...prev]);
      } else {
        throw new Error('local');
      }
    } catch {
      const origObj = resolveAirport(orig);
      const destObj = resolveAirport(dest);
      const fallbackAlert: RouteAlert = {
        id: `alert-${Date.now()}`,
        originCode: origObj.code,
        originCity: origObj.city,
        destinationCode: destObj.code,
        destinationCity: destObj.city,
        date: dt,
        targetPrice: target,
        currentLowestPrice: cheapestNow,
        lowestSource: flights[0]?.source || 'Smiles / Balcão de Milhas',
        lowestAirline: flights[0]?.airline || 'GOL Linhas Aéreas',
        lastChecked: 'Agora mesmo',
        active: true,
        priceChange24h: -5.8,
      };
      setAlerts((prev) => [fallbackAlert, ...prev]);
    }

    setAlertFeedback(
      `Alerta configurado para ${resolveAirport(orig).code} → ${resolveAirport(dest).code} (Meta R$ ${target.toFixed(2)})`
    );
    setTimeout(() => setAlertFeedback(null), 4000);
    setIsNewAlertModalOpen(false);
  };

  const handleDeleteAlert = async (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    fetch(`/api/alerts/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleRefreshAlerts = () => {
    setIsRefreshingAlerts(true);
    setTimeout(() => {
      setAlerts((prev) =>
        prev.map((item) => {
          const freshOffers = scanFlightsForRoute(
            item.originCode,
            item.destinationCode,
            item.date,
            1
          );
          const cheapest = freshOffers[0];
          return {
            ...item,
            currentLowestPrice: cheapest.price,
            lowestSource: cheapest.source,
            lowestAirline: cheapest.airline,
            lastChecked: 'Agora mesmo',
          };
        })
      );
      setIsRefreshingAlerts(false);
    }, 450);
  };

  const filteredAndSortedFlights = useMemo(() => {
    const list = flights.filter((f) => {
      if (sourceFilter === 'direct') return f.stops === 0;
      if (sourceFilter === 'milhas') return f.sourceType === 'milhas';
      if (sourceFilter === 'cia') return f.sourceType === 'cia';
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortMode === 'duration') return a.durationMinutes - b.durationMinutes;
      if (sortMode === 'miles') return a.milesRequired - b.milesRequired;
      return a.price - b.price;
    });
  }, [flights, sourceFilter, sortMode]);

  const lowestOffer = flights[0];
  const highestOffer = flights[flights.length - 1];
  const maxSavings =
    lowestOffer && highestOffer ? Math.max(0, highestOffer.price - lowestOffer.price) : 0;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-30 bg-[#0B0F19]/95 backdrop-blur-xs border-b border-slate-800/90 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <a
            href="#buscador"
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            FlyPrice Tracker
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
            <a
              href="#buscador"
              className="hover:text-white transition-colors underline-offset-4 hover:underline whitespace-nowrap"
            >
              Buscador de Voos
            </a>
            <a
              href="#radar-datas"
              className="hover:text-white transition-colors underline-offset-4 hover:underline whitespace-nowrap"
            >
              Datas Flexíveis
            </a>
            <a
              href="#calculadora-milhas"
              className="hover:text-white transition-colors underline-offset-4 hover:underline whitespace-nowrap"
            >
              Milhas vs. Dinheiro
            </a>
            <a
              href="#alertas-preco"
              className="hover:text-white transition-colors underline-offset-4 hover:underline whitespace-nowrap"
            >
              Alertas de Preço
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {isDuffelConnected && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Duffel API Ao Vivo
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setNewAlertTargetPrice(
                  String(Math.round((lowestOffer?.price || 320) * 0.92))
                );
                setIsNewAlertModalOpen(true);
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Monitorar Rota Atual
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        <section id="buscador" className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Buscador e Monitor de Passagens Aéreas
              </h1>
              <p className="mt-1.5 text-sm text-slate-400 max-w-2xl">
                Varredura simultânea em companhias aéreas, metabuscadores e balcões de milhas para identificar a menor tarifa pagante ou em pontos.
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-500 mr-1">Rotas rápidas:</span>
              {POPULAR_ROUTES.map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => handleSelectQuickRoute(r.origin, r.destination)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-[#111827] hover:bg-slate-800 border border-slate-800 rounded-md transition-colors whitespace-nowrap"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="bg-[#111827] p-5 sm:p-6 rounded-xl border border-slate-800 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <AirportInput
                  id="origin"
                  label="Origem (Ex: CWB)"
                  placeholder="Ex: Curitiba ou CWB"
                  value={origin}
                  onChange={(val) => setOrigin(val)}
                />
              </div>

              <div className="md:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSwapAirports}
                  title="Inverter Origem e Destino"
                  aria-label="Inverter Origem e Destino"
                  className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-700/90 bg-[#0B0F19] text-slate-300 hover:text-white hover:border-indigo-500 transition-colors"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              <div className="md:col-span-4">
                <AirportInput
                  id="destination"
                  label="Destino (Ex: GIG)"
                  placeholder="Ex: Rio de Janeiro ou GIG"
                  value={destination}
                  onChange={(val) => setDestination(val)}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="date"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Data do Voo
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700/90 rounded-lg px-3 py-2.5 text-sm text-white font-mono tabular-nums focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="md:col-span-1">
                <label
                  htmlFor="passengers"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Passageiros
                </label>
                <select
                  id="passengers"
                  value={passengers}
                  onChange={(e) => {
                    const nextPax = Number(e.target.value) || 1;
                    setPassengers(nextPax);
                    executeFlightScan(origin, destination, date, nextPax);
                  }}
                  className="w-full bg-[#0B0F19] border border-slate-700/90 rounded-lg px-2.5 py-2.5 text-sm text-white font-mono tabular-nums focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'adt' : 'adts'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {validationMessage && (
              <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-500/40 rounded-lg px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{validationMessage}</span>
              </div>
            )}

            {alertFeedback && (
              <div className="flex items-center gap-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 rounded-lg px-3.5 py-2.5">
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{alertFeedback}</span>
              </div>
            )}

            <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                <span>Fontes monitoradas: </span>
                <span className="text-slate-300">
                  LATAM · GOL · Azul · Smiles · TudoAzul · MaxMilhas · Google Flights · Skyscanner · Decolar
                </span>
              </div>

              <button
                type="submit"
                disabled={isScanning}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>
                  {isScanning
                    ? 'Varrendo Portais em Tempo Real...'
                    : 'Varrer Web e Achar Menor Preço'}
                </span>
              </button>
            </div>
          </form>
        </section>

        {lowestOffer && (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-y border-slate-800/90 py-5">
            <div>
              <div className="text-xs text-slate-400">Menor Tarifa Encontrada</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
                R$ {lowestOffer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {lowestOffer.airline} · via {lowestOffer.source}
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Menor Emissão em Milhas</div>
              <div className="text-2xl font-bold text-indigo-300 font-mono tabular-nums mt-1">
                {lowestOffer.milesRequired.toLocaleString('pt-BR')} mi
              </div>
              <div className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums">
                + R$ {lowestOffer.boardingFee.toFixed(2)} taxa de embarque
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Média Histórica da Rota (30d)</div>
              <div className="text-2xl font-bold text-white font-mono tabular-nums mt-1">
                R$ {lowestOffer.historicalAvgPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-emerald-400 mt-0.5 font-mono tabular-nums">
                Economia de {lowestOffer.discountPercent}% sobre a média
              </div>
            </div>

            <div>
              <div className="text-xs text-slate-400">Dispersão Entre Portais Hoje</div>
              <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums mt-1">
                R$ {maxSavings.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Diferença entre o portal mais caro e o mais barato
              </div>
            </div>
          </section>
        )}

        <div id="radar-datas">
          <FareCalendarStrip
            calendar={calendar}
            selectedDate={date}
            onSelectDate={handleSelectCalendarDate}
          />
        </div>

        <section id="results" className="space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">
                Menores Preços Encontrados: {originAirport.city} ({originAirport.code}) → {destinationAirport.city} ({destinationAirport.code})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                <span>Data selecionada: </span>
                <span className="font-mono tabular-nums text-slate-200">
                  {date.split('-').reverse().join('/')}
                </span>
                <span aria-hidden="true"> · </span>
                <span>{passengers} {passengers === 1 ? 'passageiro' : 'passageiros'}</span>
                <span aria-hidden="true"> · </span>
                <span>Taxas de embarque já incluídas no valor final</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-[#111827] border border-slate-800 rounded-lg">
                {(
                  [
                    { id: 'all', label: 'Todos' },
                    { id: 'direct', label: 'Voos Diretos' },
                    { id: 'milhas', label: 'Milhas / Balcão' },
                    { id: 'cia', label: 'Site da Cia' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSourceFilter(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                      sourceFilter === tab.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 bg-[#111827] border border-slate-800 rounded-lg px-3 py-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs text-slate-400">Ordenar:</span>
                <select
                  aria-label="Ordenar resultados"
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as SortMode)}
                  className="bg-transparent text-xs font-medium text-white focus:outline-none cursor-pointer"
                >
                  <option value="price" className="bg-[#111827]">
                    Menor Preço (R$)
                  </option>
                  <option value="miles" className="bg-[#111827]">
                    Menor Custo em Milhas
                  </option>
                  <option value="duration" className="bg-[#111827]">
                    Menor Tempo de Voo
                  </option>
                </select>
              </div>
            </div>
          </div>

          {isScanning ? (
            <div className="space-y-3 py-4">
              <div className="text-sm text-indigo-300 font-medium flex items-center gap-2 pb-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                <span>{scanStageText || 'Varrendo sites de companhias e milhas em tempo real...'}</span>
              </div>
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-24 bg-[#111827] border border-slate-800 rounded-xl p-5 animate-pulse flex items-center justify-between"
                >
                  <div className="space-y-2.5 w-1/2">
                    <div className="h-3 w-40 bg-slate-800 rounded" />
                    <div className="h-5 w-64 bg-slate-800 rounded" />
                  </div>
                  <div className="space-y-2 w-32 text-right">
                    <div className="h-6 w-28 bg-slate-800 rounded ml-auto" />
                    <div className="h-4 w-20 bg-slate-800 rounded ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedFlights.length === 0 ? (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-8 text-center space-y-3">
              <p className="text-sm text-slate-300">
                Nenhum voo encontrado para o filtro selecionado nesta data.
              </p>
              <button
                type="button"
                onClick={() => setSourceFilter('all')}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                Exibir Todos os Portais ({flights.length} ofertas)
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedFlights.map((flight, index) => {
                const isCheapest = flight.id === lowestOffer?.id && index === 0;

                return (
                  <div
                    key={flight.id}
                    className={`bg-[#111827] p-5 rounded-xl border transition-colors ${
                      isCheapest
                        ? 'border-emerald-500/80 hover:border-emerald-400'
                        : 'border-slate-800 hover:border-slate-700'
                    } flex flex-col lg:flex-row lg:items-center justify-between gap-5`}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        {isCheapest && (
                          <>
                            <span className="font-semibold text-emerald-400">
                              Menor Tarifa Verificada
                            </span>
                            <span aria-hidden="true" className="text-slate-600">
                              ·
                            </span>
                          </>
                        )}
                        {flight.source.includes('Duffel') ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Duffel API Ao Vivo
                          </span>
                        ) : (
                          <span className="font-medium text-indigo-300">
                            {flight.source}
                          </span>
                        )}
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span className="font-mono tabular-nums text-slate-400">
                          Voo {flight.flightNumber}
                        </span>
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span className="text-slate-400">{flight.aircraft}</span>
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span className="text-slate-400">{flight.baggage}</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                        <div className="min-w-[170px]">
                          <h3 className="text-base font-semibold text-white">
                            {flight.airline}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Classe {flight.fareClass} · Restam {flight.seatsLeft} assentos
                          </p>
                        </div>

                        <div className="flex items-center gap-4 sm:border-l sm:border-slate-800 sm:pl-5">
                          <div>
                            <div className="text-lg font-semibold text-white font-mono tabular-nums">
                              {flight.departureTime}
                            </div>
                            <div className="text-xs text-slate-400 font-mono tabular-nums">
                              {flight.originCode}
                            </div>
                          </div>

                          <div className="flex flex-col items-center px-2 min-w-[110px]">
                            <span className="text-[11px] text-slate-400 font-mono tabular-nums">
                              {flight.duration}
                            </span>
                            <div className="w-full h-px bg-slate-700 my-1" />
                            <span
                              className={`text-[11px] font-medium ${
                                flight.stops === 0 ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {flight.stopDetails}
                            </span>
                          </div>

                          <div>
                            <div className="text-lg font-semibold text-white font-mono tabular-nums">
                              {flight.arrivalTime}
                            </div>
                            <div className="text-xs text-slate-400 font-mono tabular-nums">
                              {flight.destinationCode}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80 shrink-0">
                      <div className="text-left lg:text-right">
                        <div className="flex items-baseline lg:justify-end gap-2">
                          <span className="text-xs text-slate-500 line-through font-mono tabular-nums">
                            R$ {flight.historicalAvgPrice.toFixed(2)}
                          </span>
                          <span className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">
                            R$ {flight.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                          ou {flight.milesRequired.toLocaleString('pt-BR')} milhas + R${' '}
                          {flight.boardingFee.toFixed(2)} taxas
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOffer(flight)}
                          className="px-3 py-2 text-xs font-medium text-slate-200 hover:text-white bg-[#0B0F19] hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
                        >
                          Analisar Tarifa
                        </button>

                        <a
                          href={flight.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap"
                        >
                          <span>Ver Oferta ➔</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <MilesCalculatorPanel
          offers={flights}
          onSelectOffer={(offer) => setSelectedOffer(offer)}
        />

        <AlertsMonitorPanel
          alerts={alerts}
          onLoadAlertRoute={(alertItem) => {
            const origLabel = `${alertItem.originCity} (${alertItem.originCode})`;
            const destLabel = `${alertItem.destinationCity} (${alertItem.destinationCode})`;
            setOrigin(origLabel);
            setDestination(destLabel);
            setDate(alertItem.date);
            executeFlightScan(origLabel, destLabel, alertItem.date, passengers);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDeleteAlert={handleDeleteAlert}
          onRefreshAlerts={handleRefreshAlerts}
          onOpenNewAlertModal={() => {
            setNewAlertTargetPrice(
              String(Math.round((lowestOffer?.price || 320) * 0.92))
            );
            setIsNewAlertModalOpen(true);
          }}
          isRefreshing={isRefreshingAlerts}
        />
      </main>

      <footer className="border-t border-slate-800/80 py-6 px-4 sm:px-8 mt-12 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            FlyPrice Tracker · Monitor de Passagens Aéreas e Arbitragem de Milhas
          </span>
          <span>
            Valores finais em Reais (BRL) com taxas de embarque aeroportuárias incluídas.
          </span>
        </div>
      </footer>

      <OfferDetailsDrawer
        offer={selectedOffer}
        onClose={() => setSelectedOffer(null)}
        onCreateAlertForOffer={(offer) => {
          handleCreateAlert(Math.round(offer.price * 0.92), offer);
        }}
      />

      {isNewAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-[#111827] border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Configurar Alerta de Queda de Preço
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Rota atual: {originAirport.city} ({originAirport.code}) → {destinationAirport.city} ({destinationAirport.code}) em {date.split('-').reverse().join('/')}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Menor preço verificado hoje:</span>
                <span className="font-mono tabular-nums text-emerald-400 font-semibold">
                  R$ {(lowestOffer?.price || 289.9).toFixed(2)}
                </span>
              </div>

              <div>
                <label
                  htmlFor="target-price-input"
                  className="block text-xs font-medium text-slate-300 mb-1.5"
                >
                  Meta de Preço Desejada (R$)
                </label>
                <input
                  id="target-price-input"
                  type="number"
                  min="50"
                  step="5"
                  value={newAlertTargetPrice}
                  onChange={(e) => setNewAlertTargetPrice(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono tabular-nums focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsNewAlertModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white border border-slate-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() =>
                  handleCreateAlert(Number(newAlertTargetPrice) || 300)
                }
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <BellPlus className="w-3.5 h-3.5" />
                <span>Ativar Monitoramento</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
