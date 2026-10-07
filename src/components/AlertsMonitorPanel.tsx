import React from 'react';
import { RouteAlert } from '../data/flightEngine';
import { RefreshCw, Trash2, ArrowUpRight } from 'lucide-react';

interface AlertsMonitorPanelProps {
  alerts: RouteAlert[];
  onLoadAlertRoute: (alert: RouteAlert) => void;
  onDeleteAlert: (id: string) => void;
  onRefreshAlerts: () => void;
  onOpenNewAlertModal: () => void;
  isRefreshing: boolean;
}

export const AlertsMonitorPanel: React.FC<AlertsMonitorPanelProps> = ({
  alerts,
  onLoadAlertRoute,
  onDeleteAlert,
  onRefreshAlerts,
  onOpenNewAlertModal,
  isRefreshing,
}) => {
  return (
    <section
      id="alertas-preco"
      className="bg-[#111827] border border-slate-800 rounded-xl p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Monitoramento Ativo de Rotas e Metas de Preço
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe rotas salvas e identifique automaticamente quando o preço atual cai abaixo da sua meta estipulada.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRefreshAlerts}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
            <span>{isRefreshing ? 'Re-varrendo...' : 'Atualizar Tarifas'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewAlertModal}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap"
          >
            + Monitorar Rota Atual
          </button>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <p className="text-sm text-slate-400">
            Nenhuma rota monitorada no momento. Adicione um alerta para acompanhar quedas de tarifa.
          </p>
          <button
            type="button"
            onClick={onOpenNewAlertModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
          >
            Criar Primeiro Alerta de Preço
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#0B0F19] text-xs font-medium text-slate-400">
                <th className="py-3 px-4">Trecho Monitorado</th>
                <th className="py-3 px-4">Data do Voo</th>
                <th className="py-3 px-4">Portal / Cia Mais Barata</th>
                <th className="py-3 px-4 text-right">Sua Meta</th>
                <th className="py-3 px-4 text-right">Menor Preço Atual</th>
                <th className="py-3 px-4 text-right">Status da Meta</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-sm">
              {alerts.map((item) => {
                const targetReached = item.currentLowestPrice <= item.targetPrice;
                const diffFromTarget = item.targetPrice - item.currentLowestPrice;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {item.originCity} ({item.originCode}) → {item.destinationCity} ({item.destinationCode})
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        <span>Verificado: {item.lastChecked}</span>
                        <span aria-hidden="true"> · </span>
                        <span className="font-mono tabular-nums">
                          24h: {item.priceChange24h > 0 ? `+${item.priceChange24h}%` : `${item.priceChange24h}%`}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono tabular-nums text-xs text-slate-300 whitespace-nowrap">
                      {item.date.split('-').reverse().join('/')}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 text-xs font-medium">{item.lowestAirline}</div>
                      <div className="text-xs text-slate-400">{item.lowestSource}</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs text-slate-300 whitespace-nowrap">
                      R$ {item.targetPrice.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-400 whitespace-nowrap">
                      R$ {item.currentLowestPrice.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-xs whitespace-nowrap">
                      {targetReached ? (
                        <span className="text-emerald-400 font-medium">
                          Meta atingida (-R$ {Math.abs(diffFromTarget).toFixed(2)})
                        </span>
                      ) : (
                        <span className="text-amber-400">
                          Acima (+R$ {Math.abs(diffFromTarget).toFixed(2)})
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onLoadAlertRoute(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-300 hover:text-white border border-slate-700 hover:border-indigo-500 rounded-md transition-colors"
                        >
                          <span>Carregar</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAlert(item.id)}
                          aria-label="Remover alerta"
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-md hover:bg-slate-800 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
