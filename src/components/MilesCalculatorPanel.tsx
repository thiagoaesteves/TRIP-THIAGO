import React, { useState } from 'react';
import { FlightOffer } from '../data/flightEngine';

interface MilesCalculatorPanelProps {
  offers: FlightOffer[];
  onSelectOffer: (offer: FlightOffer) => void;
}

export const MilesCalculatorPanel: React.FC<MilesCalculatorPanelProps> = ({
  offers,
  onSelectOffer,
}) => {
  const [smilesCpm, setSmilesCpm] = useState<number>(15.9);
  const [latamCpm, setLatamCpm] = useState<number>(23.8);
  const [azulCpm, setAzulCpm] = useState<number>(16.9);

  const getCustomCpmForOffer = (offer: FlightOffer): number => {
    if (offer.airlineCode === 'G3') return smilesCpm;
    if (offer.airlineCode === 'LA') return latamCpm;
    return azulCpm;
  };

  return (
    <section
      id="calculadora-milhas"
      className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Simulador de Arbitragem: Milhas vs. Pagamento em Dinheiro
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Ajuste o seu Custo por Milheiro (CPM) em cada programa para descobrir quando compensa emitir com pontos ou pagar em reais.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setSmilesCpm(15.9);
            setLatamCpm(23.8);
            setAzulCpm(16.9);
          }}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap self-start md:self-auto"
        >
          Restaurar Cotação de Mercado
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="cpm-smiles" className="font-medium text-slate-300">
              Milheiro Smiles (GOL)
            </label>
            <span className="font-mono tabular-nums font-semibold text-amber-400">
              R$ {smilesCpm.toFixed(2)}
            </span>
          </div>
          <input
            id="cpm-smiles"
            type="range"
            min="12"
            max="25"
            step="0.1"
            value={smilesCpm}
            onChange={(e) => setSmilesCpm( parseFloat(e.target.value) )}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
            <span>Promo R$ 14,00</span>
            <span>Média R$ 15,90</span>
            <span>Balcão R$ 22,00</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="cpm-latam" className="font-medium text-slate-300">
              Milheiro LATAM Pass
            </label>
            <span className="font-mono tabular-nums font-semibold text-indigo-400">
              R$ {latamCpm.toFixed(2)}
            </span>
          </div>
          <input
            id="cpm-latam"
            type="range"
            min="17"
            max="32"
            step="0.1"
            value={latamCpm}
            onChange={(e) => setLatamCpm( parseFloat(e.target.value) )}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
            <span>Promo R$ 21,00</span>
            <span>Média R$ 23,80</span>
            <span>Balcão R$ 29,00</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="cpm-azul" className="font-medium text-slate-300">
              Milheiro TudoAzul
            </label>
            <span className="font-mono tabular-nums font-semibold text-sky-400">
              R$ {azulCpm.toFixed(2)}
            </span>
          </div>
          <input
            id="cpm-azul"
            type="range"
            min="12"
            max="25"
            step="0.1"
            value={azulCpm}
            onChange={(e) => setAzulCpm( parseFloat(e.target.value) )}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono tabular-nums">
            <span>Promo R$ 14,50</span>
            <span>Média R$ 16,90</span>
            <span>Balcão R$ 22,00</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-slate-800 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-[#0B0F19] text-xs font-medium text-slate-400">
              <th className="py-3 px-4">Voo / Companhia</th>
              <th className="py-3 px-4">Horário</th>
              <th className="py-3 px-4 text-right">Tarifa Pagante</th>
              <th className="py-3 px-4 text-right">Milhas Exigidas</th>
              <th className="py-3 px-4 text-right">Custo c/ Seu Milheiro + Taxas</th>
              <th className="py-3 px-4 text-right">Veredito & Economia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-sm">
            {offers.map((offer) => {
              const userCpm = getCustomCpmForOffer(offer);
              const customMilesCost =
                (offer.milesRequired / 1000) * userCpm + offer.boardingFee;
              const delta = offer.price - customMilesCost;
              const milesWins = delta > 5;

              return (
                <tr
                  key={offer.id}
                  onClick={() => onSelectOffer(offer)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{offer.airline}</div>
                    <div className="text-xs text-slate-400">
                      <span className="font-mono tabular-nums">{offer.flightNumber}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{offer.source}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-xs text-slate-300 whitespace-nowrap">
                    {offer.departureTime} → {offer.arrivalTime}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-200 whitespace-nowrap">
                    R$ {offer.price.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                    {offer.milesRequired.toLocaleString('pt-BR')} mi
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-medium text-indigo-300 whitespace-nowrap">
                    R$ {customMilesCost.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-xs whitespace-nowrap">
                    {milesWins ? (
                      <span className="text-emerald-400 font-semibold">
                        Milhas (-R$ {Math.abs(delta).toFixed(2)})
                      </span>
                    ) : (
                      <span className="text-slate-300">
                        Dinheiro (-R$ {Math.abs(delta).toFixed(2)})
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
