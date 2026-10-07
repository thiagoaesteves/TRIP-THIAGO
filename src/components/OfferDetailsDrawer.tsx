import React, { useState } from 'react';
import { FlightOffer } from '../data/flightEngine';
import { X, ExternalLink, BellPlus, Check, Copy } from 'lucide-react';

interface OfferDetailsDrawerProps {
  offer: FlightOffer | null;
  onClose: () => void;
  onCreateAlertForOffer: (offer: FlightOffer) => void;
}

export const OfferDetailsDrawer: React.FC<OfferDetailsDrawerProps> = ({
  offer,
  onClose,
  onCreateAlertForOffer,
}) => {
  const [copied, setCopied] = useState(false);
  const [alertAdded, setAlertAdded] = useState(false);

  if (!offer) return null;

  const minHist = Math.min(...offer.priceHistory7d.map((p) => p.price));
  const maxHist = Math.max(...offer.priceHistory7d.map((p) => p.price));
  const histRange = Math.max(1, maxHist - minHist);

  const handleCopySummary = () => {
    const text = `Voo ${offer.originCode} → ${offer.destinationCode} (${offer.date}) | ${offer.airline} ${offer.flightNumber} (${offer.departureTime} - ${offer.arrivalTime}) | R$ ${offer.price.toFixed(2)} via ${offer.source} ou ${offer.milesRequired.toLocaleString('pt-BR')} milhas + R$ ${offer.boardingFee.toFixed(2)} taxas.`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddAlert = () => {
    onCreateAlertForOffer(offer);
    setAlertAdded(true);
    setTimeout(() => setAlertAdded(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-[#0F172A] border-l border-slate-800 h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-offer-title"
      >
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs text-slate-400">
                <span>{offer.source}</span>
                <span aria-hidden="true"> · </span>
                <span className="font-mono tabular-nums">{offer.flightNumber}</span>
                <span aria-hidden="true"> · </span>
                <span>{offer.aircraft}</span>
              </div>
              <h2
                id="drawer-offer-title"
                className="text-xl font-semibold text-white mt-1"
              >
                {offer.originCity} ({offer.originCode}) → {offer.destinationCity} ({offer.destinationCode})
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes da oferta"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="py-4 border-b border-slate-800 grid grid-cols-3 items-center gap-4">
            <div>
              <div className="text-2xl font-semibold text-white font-mono tabular-nums">
                {offer.departureTime}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {offer.originCode} · {offer.originCity}
              </div>
            </div>

            <div className="text-center">
              <div className="text-xs text-slate-400 font-mono tabular-nums">
                {offer.duration}
              </div>
              <div className="w-full h-px bg-slate-700 my-1.5 relative" />
              <div className="text-xs text-indigo-300">{offer.stopDetails}</div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-semibold text-white font-mono tabular-nums">
                {offer.arrivalTime}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {offer.destinationCode} · {offer.destinationCity}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">
              Comparativo de Emissão: Dinheiro vs. Milhas
            </h3>
            <div className="border border-slate-800 rounded-lg divide-y divide-slate-800 text-sm">
              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Tarifa em Dinheiro (PIX / Cartão)</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Tarifa base R$ {offer.baseFare.toFixed(2)} · Taxa de embarque R$ {offer.boardingFee.toFixed(2)}
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums font-semibold text-emerald-400 text-base">
                  R$ {offer.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">
                    Emissão via {offer.milesProgram}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums">
                    {offer.milesRequired.toLocaleString('pt-BR')} milhas + R$ {offer.boardingFee.toFixed(2)} taxas
                  </div>
                </div>
                <div className="text-right font-mono tabular-nums">
                  <div className="font-semibold text-indigo-300 text-base">
                    R$ {offer.milesTotalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Custo equivalente
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/60 flex items-center justify-between text-xs">
                <span className="text-slate-300">Estratégia Recomendada pelo Scanner:</span>
                <span className="font-semibold text-emerald-400 font-mono tabular-nums">
                  Emitir em {offer.recommendedStrategy} (Economia de R$ {offer.strategySavings.toFixed(2)})
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">
                Oscilação da Tarifa nos Últimos 7 Dias
              </h3>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                Média histórica: R$ {offer.historicalAvgPrice.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2 pt-2 items-end h-28 border-b border-slate-800 pb-3">
              {offer.priceHistory7d.map((pt, idx) => {
                const isToday = idx === offer.priceHistory7d.length - 1;
                const barH = Math.round(30 + ((pt.price - minHist) / histRange) * 70);
                return (
                  <div key={pt.day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[11px] font-mono tabular-nums text-slate-300">
                      R${pt.price}
                    </span>
                    <div
                      style={{ height: `${barH}%` }}
                      className={`w-full max-w-[28px] rounded-t ${
                        isToday ? 'bg-emerald-500' : 'bg-slate-700'
                      }`}
                    />
                    <span className="text-[11px] text-slate-400">{pt.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-300 pt-1">
            <div className="flex justify-between py-1.5 border-b border-slate-800/70">
              <span className="text-slate-400">Franquia de Bagagem</span>
              <span className="font-medium text-white">{offer.baggage}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/70">
              <span className="text-slate-400">Classe Tarifária</span>
              <span className="font-medium text-white">
                {offer.fareClass} · {offer.refundable ? 'Reembolsável' : 'Multa p/ remarcação'}
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Disponibilidade no Portal</span>
              <span className="font-mono tabular-nums text-amber-400">
                Restam {offer.seatsLeft} assentos nesta tarifa
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-800 space-y-2.5">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleAddAlert}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              {alertAdded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Rota Monitorada</span>
                </>
              ) : (
                <>
                  <BellPlus className="w-4 h-4 text-indigo-400" />
                  <span>Monitorar Queda</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopySummary}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Cotação Copiada</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400" />
                  <span>Copiar Cotação</span>
                </>
              )}
            </button>
          </div>

          <a
            href={offer.link}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-4 rounded-lg text-sm transition-colors shadow-lg whitespace-nowrap"
          >
            <span>Continuar para {offer.source}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
