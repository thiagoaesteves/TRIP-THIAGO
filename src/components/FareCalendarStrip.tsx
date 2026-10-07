import React from 'react';
import { CalendarDayFare } from '../data/flightEngine';

interface FareCalendarStripProps {
  calendar: CalendarDayFare[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export const FareCalendarStrip: React.FC<FareCalendarStripProps> = ({
  calendar,
  selectedDate,
  onSelectDate,
}) => {
  if (!calendar || calendar.length === 0) return null;

  const prices = calendar.map((c) => c.lowestPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = Math.max(1, maxPrice - minPrice);

  return (
    <section className="bg-[#111827] border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-semibold text-white">
            Radar de Datas Flexíveis (±5 Dias)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Menor tarifa diária consolidada · Clique em outro dia para comparar os voos da data
          </p>
        </div>
        <div className="text-xs text-slate-400 font-mono tabular-nums">
          <span>Piso do período: </span>
          <span className="text-emerald-400 font-semibold">
            R$ {minPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-11 gap-2 pt-4">
        {calendar.map((item) => {
          const isSelected = item.date === selectedDate;
          const heightPct = Math.round(35 + ((item.lowestPrice - minPrice) / range) * 65);

          return (
            <button
              key={item.date}
              type="button"
              onClick={() => onSelectDate(item.date)}
              className={`group flex flex-col justify-between p-2.5 rounded-lg border text-left transition-colors ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500 text-white'
                  : item.isCheapest
                  ? 'bg-emerald-950/25 border-emerald-500/50 hover:border-emerald-400 text-slate-200'
                  : 'bg-[#0B0F19]/70 border-slate-800/90 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="text-xs font-medium text-slate-400">
                  {item.weekdayShort}
                </span>
                {item.isCheapest && (
                  <span className="text-[11px] font-medium text-emerald-400">
                    Menor
                  </span>
                )}
              </div>

              <div className="text-xs font-semibold text-white mt-0.5 font-mono tabular-nums">
                {item.dayLabel}
              </div>

              <div className="hidden md:flex items-end h-10 w-full my-2 bg-slate-900/70 rounded overflow-hidden p-0.5">
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-xs transition-transform duration-150 ${
                    item.isCheapest
                      ? 'bg-emerald-500'
                      : isSelected
                      ? 'bg-indigo-500'
                      : 'bg-slate-700 group-hover:bg-slate-600'
                  }`}
                />
              </div>

              <div className="mt-1 pt-1.5 border-t border-slate-800/70 w-full">
                <div
                  className={`text-xs font-semibold font-mono tabular-nums ${
                    item.isCheapest
                      ? 'text-emerald-400'
                      : isSelected
                      ? 'text-indigo-300'
                      : 'text-slate-200'
                  }`}
                >
                  R$ {Math.round(item.lowestPrice).toLocaleString('pt-BR')}
                </div>
                <div className="text-[11px] text-slate-400 font-mono tabular-nums truncate">
                  {(item.lowestMiles / 1000).toFixed(1)}k mi
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
